#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const OUTPUT = path.join(ROOT, "assets", "community.json");
const MEDIA_ROOT = path.join(ROOT, "assets", "community-media");

const OWNER = process.env.COMMUNITY_OWNER || "SYUCT";
const REPO = process.env.COMMUNITY_REPO || "SYUCT-web";
const SOURCE_URL = "https://github.com/orgs/SYUCT/discussions";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const FEATURED_LABELS = new Set(
  (process.env.COMMUNITY_FEATURED_LABELS || "精选,featured")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean)
);
const MAX_RECENT = 10;
const MAX_PINNED_QUERY = 100;
const RECENT_QUERY_COUNT = 50;
const COMMENTS_PAGE_SIZE = 100;
const REPLIES_PER_COMMENT = 100;
const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function graphql(query, variables = {}) {
  assert(TOKEN, "GITHUB_TOKEN or GH_TOKEN is required.");
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "SYUCT-community-mirror"
        },
        body: JSON.stringify({ query, variables })
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`GitHub GraphQL HTTP ${response.status}: ${text.slice(0, 500)}`);
      const payload = JSON.parse(text);
      if (payload.errors?.length) {
        throw new Error(`GitHub GraphQL error: ${payload.errors.map((item) => item.message).join("; ")}`);
      }
      return payload.data;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(700 * attempt);
    }
  }
  throw lastError;
}

const DISCUSSION_FIELDS = `
  id
  number
  title
  url
  bodyHTML
  createdAt
  updatedAt
  closed
  upvoteCount
  author { login }
  category { name emoji emojiHTML }
  labels(first: 20) { nodes { name } }
  comments { totalCount }
  poll {
    question
    totalVoteCount
    options(first: 20) {
      nodes { id option totalVoteCount }
    }
  }
`;

async function fetchDiscussionIndex() {
  const query = `
    query CommunityIndex($owner: String!, $repo: String!, $recentCount: Int!, $pinnedCount: Int!) {
      repository(owner: $owner, name: $repo) {
        nameWithOwner
        pinnedDiscussions(first: $pinnedCount) {
          nodes {
            discussion { ${DISCUSSION_FIELDS} }
          }
        }
        discussions(first: $recentCount, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes { ${DISCUSSION_FIELDS} }
        }
      }
      rateLimit { cost remaining resetAt }
    }
  `;
  const data = await graphql(query, {
    owner: OWNER,
    repo: REPO,
    recentCount: RECENT_QUERY_COUNT,
    pinnedCount: MAX_PINNED_QUERY
  });
  assert(data?.repository, `Repository ${OWNER}/${REPO} was not found or Discussions are unavailable.`);
  return data;
}

const COMMENT_FIELDS = `
  id
  bodyHTML
  createdAt
  updatedAt
  url
  upvoteCount
  isAnswer
  isMinimized
  author { login }
  reactions { totalCount }
`;

async function fetchAllComments(number) {
  const flattened = [];
  let after = null;

  while (true) {
    const query = `
      query DiscussionComments($owner: String!, $repo: String!, $number: Int!, $after: String) {
        repository(owner: $owner, name: $repo) {
          discussion(number: $number) {
            comments(first: ${COMMENTS_PAGE_SIZE}, after: $after) {
              nodes {
                ${COMMENT_FIELDS}
                replies(first: ${REPLIES_PER_COMMENT}) {
                  totalCount
                  nodes {
                    ${COMMENT_FIELDS}
                    replyTo { author { login } }
                  }
                }
              }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      }
    `;
    const data = await graphql(query, { owner: OWNER, repo: REPO, number, after });
    const connection = data?.repository?.discussion?.comments;
    if (!connection) break;

    for (const comment of connection.nodes || []) {
      flattened.push({
        ...comment,
        replyCount: Number(comment.replies?.totalCount || 0),
        replyTo: null
      });
      for (const reply of comment.replies?.nodes || []) {
        flattened.push({
          ...reply,
          replyCount: 0,
          replyTo: reply.replyTo?.author?.login || comment.author?.login || null
        });
      }
      if ((comment.replies?.totalCount || 0) > REPLIES_PER_COMMENT) {
        console.warn(`Discussion #${number}: a comment has more than ${REPLIES_PER_COMMENT} threaded replies; only the first ${REPLIES_PER_COMMENT} are considered.`);
      }
    }

    if (!connection.pageInfo?.hasNextPage) break;
    after = connection.pageInfo.endCursor;
  }

  return flattened.filter((comment) => !comment.isMinimized && String(comment.bodyHTML || "").trim());
}

function normalizeComment(comment) {
  return {
    id: comment.id,
    author: comment.author?.login || "ghost",
    bodyHTML: comment.bodyHTML || "",
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    url: comment.url,
    upvoteCount: Number(comment.upvoteCount || 0),
    reactionCount: Number(comment.reactions?.totalCount || 0),
    replyCount: Number(comment.replyCount || 0),
    replyTo: comment.replyTo || null,
    isAnswer: Boolean(comment.isAnswer)
  };
}

function heatScore(comment) {
  return (
    Number(comment.upvoteCount || 0) * 3 +
    Number(comment.reactionCount || 0) * 2 +
    Number(comment.replyCount || 0)
  );
}

function selectComments(rawComments) {
  const comments = rawComments.map(normalizeComment);
  const byHeat = [...comments].sort((a, b) =>
    heatScore(b) - heatScore(a) ||
    b.upvoteCount - a.upvoteCount ||
    b.reactionCount - a.reactionCount ||
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  const hot = byHeat.slice(0, 5);
  const hotIds = new Set(hot.map((item) => item.id));
  const latest = [...comments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((item) => !hotIds.has(item.id))
    .slice(0, 5);
  return { hot, latest };
}

function normalizePoll(poll) {
  if (!poll) return null;
  return {
    question: poll.question,
    totalVoteCount: Number(poll.totalVoteCount || 0),
    options: (poll.options?.nodes || []).map((item) => ({
      id: item.id,
      option: item.option,
      totalVoteCount: Number(item.totalVoteCount || 0)
    }))
  };
}

function categoryEmoji(category) {
  // emoji 只返回 :mega: 这样的短代码，emojiHTML 里才有真正的字符。
  const fromHtml = String(category?.emojiHTML || "").replace(/<[^>]*>/g, "").replace(/["']/g, "").trim();
  return fromHtml || category?.emoji || "";
}

function discussionLabels(discussion) {
  return (discussion.labels?.nodes || []).map((node) => node?.name).filter(Boolean);
}

function isFeatured(discussion) {
  return discussionLabels(discussion).some((name) => FEATURED_LABELS.has(String(name).toLowerCase()));
}

function normalizeDiscussion(discussion, comments) {
  return {
    id: discussion.id,
    number: discussion.number,
    title: discussion.title,
    url: discussion.url,
    author: discussion.author?.login || "ghost",
    category: {
      name: discussion.category?.name || "",
      emoji: categoryEmoji(discussion.category)
    },
    labels: discussionLabels(discussion),
    bodyHTML: discussion.bodyHTML || "",
    createdAt: discussion.createdAt,
    updatedAt: discussion.updatedAt,
    closed: Boolean(discussion.closed),
    upvoteCount: Number(discussion.upvoteCount || 0),
    commentCount: Number(discussion.comments?.totalCount || comments.length || 0),
    poll: normalizePoll(discussion.poll),
    comments: selectComments(comments)
  };
}

function mediaExtension(contentType, urlString) {
  const type = String(contentType || "").toLowerCase().split(";")[0].trim();
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif"
  };
  if (map[type]) return map[type];
  try {
    const ext = path.extname(new URL(urlString).pathname).toLowerCase();
    if ([".jpg",".jpeg",".png",".webp",".gif",".avif"].includes(ext)) return ext === ".jpeg" ? ".jpg" : ext;
  } catch (error) {}
  return ".img";
}

function isGithubHostedImage(urlString) {
  try {
    const host = new URL(urlString).hostname.toLowerCase();
    return (
      host === "github.com" ||
      host.endsWith(".github.com") ||
      host === "githubusercontent.com" ||
      host.endsWith(".githubusercontent.com") ||
      host === "githubassets.com" ||
      host.endsWith(".githubassets.com")
    );
  } catch (error) {
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function downloadImage(urlString, discussionNumber, usedPaths) {
  if (!isGithubHostedImage(urlString)) return urlString;
  const hash = crypto.createHash("sha256").update(urlString).digest("hex").slice(0, 20);
  const discussionDir = path.join(MEDIA_ROOT, String(discussionNumber));
  await fs.mkdir(discussionDir, { recursive: true });

  const existing = (await fs.readdir(discussionDir).catch(() => []))
    .find((name) => name.startsWith(`${hash}.`));
  if (existing) {
    const rel = path.posix.join("assets", "community-media", String(discussionNumber), existing);
    usedPaths.add(rel);
    return rel;
  }

  try {
    const response = await fetch(urlString, {
      redirect: "follow",
      headers: { "User-Agent": "SYUCT-community-mirror" }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) throw new Error(`unexpected content-type ${contentType}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_MEDIA_BYTES) throw new Error(`image is ${(buffer.length / 1024 / 1024).toFixed(1)} MiB`);
    const ext = mediaExtension(contentType, response.url || urlString);
    const fileName = `${hash}${ext}`;
    const out = path.join(discussionDir, fileName);
    await fs.writeFile(out, buffer);
    const rel = path.posix.join("assets", "community-media", String(discussionNumber), fileName);
    usedPaths.add(rel);
    return rel;
  } catch (error) {
    console.warn(`Could not mirror image for discussion #${discussionNumber}: ${urlString} (${error.message})`);
    return urlString;
  }
}

async function mirrorImagesInHtml(html, discussionNumber, usedPaths) {
  let result = String(html || "");
  const matches = [...result.matchAll(/<img\b[^>]*\bsrc=(["'])(.*?)\1/gi)];
  const unique = [...new Set(matches.map((match) => match[2]))];
  for (const source of unique) {
    const local = await downloadImage(source, discussionNumber, usedPaths);
    if (local !== source) result = result.split(source).join(local);
  }
  return result;
}

async function mirrorDiscussionMedia(post, usedPaths) {
  post.bodyHTML = await mirrorImagesInHtml(post.bodyHTML, post.number, usedPaths);
  for (const groupName of ["hot", "latest"]) {
    for (const comment of post.comments[groupName]) {
      comment.bodyHTML = await mirrorImagesInHtml(comment.bodyHTML, post.number, usedPaths);
    }
  }
}

async function removeUnusedMedia(usedPaths) {
  if (!(await fileExists(MEDIA_ROOT))) return;
  const discussionDirs = await fs.readdir(MEDIA_ROOT, { withFileTypes: true });
  for (const dirent of discussionDirs) {
    const dir = path.join(MEDIA_ROOT, dirent.name);
    if (!dirent.isDirectory()) {
      await fs.rm(dir, { force: true });
      continue;
    }
    const files = await fs.readdir(dir);
    for (const name of files) {
      const rel = path.posix.join("assets", "community-media", dirent.name, name);
      if (!usedPaths.has(rel)) await fs.rm(path.join(dir, name), { force: true });
    }
    const remaining = await fs.readdir(dir);
    if (!remaining.length) await fs.rmdir(dir);
  }
}

function comparablePayload(payload) {
  return {
    schemaVersion: payload.schemaVersion,
    source: payload.source,
    repository: payload.repository,
    pinned: payload.pinned,
    featured: payload.featured,
    recent: payload.recent
  };
}

async function readExistingPayload() {
  try {
    return JSON.parse(await fs.readFile(OUTPUT, "utf8"));
  } catch (error) {
    return null;
  }
}

async function writePayloadIfChanged(payload) {
  const existing = await readExistingPayload();
  const current = JSON.stringify(comparablePayload(payload));
  const previous = existing ? JSON.stringify(comparablePayload(existing)) : "";
  if (current === previous) {
    console.log("Community content is unchanged; keeping the existing generatedAt timestamp.");
    return false;
  }
  await fs.writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return true;
}

async function buildCommunityMirror() {
  const index = await fetchDiscussionIndex();
  const pinnedRaw = (index.repository.pinnedDiscussions?.nodes || [])
    .map((node) => node.discussion)
    .filter(Boolean);
  const pinnedIds = new Set(pinnedRaw.map((item) => item.id));
  const allDiscussions = index.repository.discussions?.nodes || [];
  const featuredRaw = allDiscussions.filter((item) => !pinnedIds.has(item.id) && isFeatured(item));
  const featuredIds = new Set(featuredRaw.map((item) => item.id));
  const recentRaw = allDiscussions
    .filter((item) => !pinnedIds.has(item.id) && !featuredIds.has(item.id))
    .slice(0, MAX_RECENT);

  const selected = [...pinnedRaw, ...featuredRaw, ...recentRaw];
  const posts = [];
  for (const discussion of selected) {
    const comments = await fetchAllComments(discussion.number);
    posts.push(normalizeDiscussion(discussion, comments));
  }

  const byId = new Map(posts.map((post) => [post.id, post]));
  const pinned = pinnedRaw.map((item) => byId.get(item.id)).filter(Boolean);
  const featured = featuredRaw.map((item) => byId.get(item.id)).filter(Boolean);
  const recent = recentRaw.map((item) => byId.get(item.id)).filter(Boolean);

  const usedPaths = new Set();
  await fs.mkdir(MEDIA_ROOT, { recursive: true });
  for (const post of [...pinned, ...featured, ...recent]) {
    await mirrorDiscussionMedia(post, usedPaths);
  }
  await removeUnusedMedia(usedPaths);

  const payload = {
    schemaVersion: 2,
    source: SOURCE_URL,
    repository: index.repository.nameWithOwner,
    generatedAt: new Date().toISOString(),
    pinned,
    featured,
    recent
  };

  const changed = await writePayloadIfChanged(payload);
  console.log(`Pinned: ${pinned.length}; featured: ${featured.length}; recent: ${recent.length}; GraphQL cost: ${index.rateLimit?.cost ?? "?"}; remaining: ${index.rateLimit?.remaining ?? "?"}`);
  console.log(changed ? "Community mirror updated." : "No community content changes.");
}

function selfTest() {
  const fixture = Array.from({ length: 10 }, (_, index) => ({
    id: `c${index + 1}`,
    bodyHTML: `<p>${index + 1}</p>`,
    createdAt: new Date(Date.UTC(2026, 7, 20, 0, index)).toISOString(),
    updatedAt: new Date(Date.UTC(2026, 7, 20, 0, index)).toISOString(),
    url: `https://example.com/${index + 1}`,
    upvoteCount: index < 5 ? 20 - index : 0,
    reactions: { totalCount: index < 5 ? 5 - index : 0 },
    replyCount: 0,
    replyTo: null,
    isAnswer: false,
    isMinimized: false,
    author: { login: `u${index + 1}` }
  }));
  const selected = selectComments(fixture);
  assert(selected.hot.length === 5, "self-test: hot comments must contain 5 items");
  assert(selected.latest.length === 5, "self-test: latest comments must contain 5 non-overlapping items");
  const hotIds = new Set(selected.hot.map((item) => item.id));
  assert(selected.latest.every((item) => !hotIds.has(item.id)), "self-test: latest must not duplicate hot");
  assert(isGithubHostedImage("https://user-images.githubusercontent.com/a/b.png"), "self-test: GitHub image host should be accepted");
  assert(!isGithubHostedImage("https://example.com/a.png"), "self-test: arbitrary image host should not be mirrored");

  assert(categoryEmoji({ emoji: ":mega:", emojiHTML: "<div>📣</div>" }) === "📣", "self-test: emojiHTML must win over the shortcode");
  assert(categoryEmoji({ emoji: ":mega:" }) === ":mega:", "self-test: shortcode is the fallback when emojiHTML is missing");

  const featuredFixture = { labels: { nodes: [{ name: "精选" }, { name: "bug" }] } };
  assert(isFeatured(featuredFixture), "self-test: the 精选 label must mark a discussion as featured");
  assert(isFeatured({ labels: { nodes: [{ name: "Featured" }] } }), "self-test: featured label matching must ignore case");
  assert(!isFeatured({ labels: { nodes: [{ name: "question" }] } }), "self-test: unrelated labels must not mark a discussion as featured");
  assert(!isFeatured({}), "self-test: a discussion without labels must not be featured");

  console.log("Community mirror self-test passed.");
}

if (process.argv.includes("--self-test")) {
  selfTest();
} else {
  buildCommunityMirror().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
