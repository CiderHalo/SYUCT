(() => {
  const SOURCE_URL = "https://github.com/orgs/SYUCT/discussions";
  const DATA_URL = "assets/community.json";

  const pinnedContainer = document.getElementById("communityPinned");
  const featuredContainer = document.getElementById("communityFeatured");
  const recentContainer = document.getElementById("communityRecent");
  const pinnedSection = document.getElementById("pinnedSection");
  const featuredSection = document.getElementById("featuredSection");
  const emptyState = document.getElementById("communityEmpty");
  const statusNode = document.getElementById("communitySyncStatus");
  const timeNode = document.getElementById("communitySyncTime");

  if (!recentContainer) return;

  const allowedTags = new Set([
    "A","B","BLOCKQUOTE","BR","CODE","DEL","DETAILS","DIV","EM","H1","H2","H3","H4","H5","H6",
    "HR","I","IMG","KBD","LI","OL","P","PRE","S","SPAN","STRONG","SUB","SUMMARY","SUP","TABLE",
    "TBODY","TD","TH","THEAD","TR","U","UL"
  ]);

  function isSafeUrl(raw, kind) {
    const value = String(raw || "").trim();
    if (!value) return false;
    if (value.startsWith("#")) return kind === "href";
    if (kind === "src" && value.startsWith("assets/community-media/")) return true;
    try {
      const url = new URL(value, location.href);
      if (url.protocol === "https:" || url.protocol === "http:") return true;
      return kind === "href" && url.protocol === "mailto:";
    } catch (error) {
      return false;
    }
  }

  function sanitizeGithubHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      if (!allowedTags.has(node.tagName)) {
        node.replaceWith(...node.childNodes);
        return;
      }

      [...node.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const keep =
          (node.tagName === "A" && ["href","title"].includes(name)) ||
          (node.tagName === "IMG" && ["src","alt","title","width","height"].includes(name)) ||
          (node.tagName === "TD" && ["colspan","rowspan"].includes(name)) ||
          (node.tagName === "TH" && ["colspan","rowspan"].includes(name));
        if (!keep) node.removeAttribute(attr.name);
      });

      if (node.tagName === "A") {
        const href = node.getAttribute("href");
        if (!isSafeUrl(href, "href")) node.removeAttribute("href");
        else {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        }
      }

      if (node.tagName === "IMG") {
        const src = node.getAttribute("src");
        // GitHub 把部分 emoji 渲染成 githubassets 上的图片，国内网络常加载失败，
        // 直接换回 alt 里的 Unicode 字符。
        if (/^https?:\/\/[^/]*githubassets\.com\/images\/icons\/emoji\//i.test(src || "")) {
          node.replaceWith(document.createTextNode(node.getAttribute("alt") || ""));
          return;
        }
        if (!isSafeUrl(src, "src")) {
          node.remove();
          return;
        }
        node.setAttribute("loading", "lazy");
        node.setAttribute("decoding", "async");
      }
    });

    return template.innerHTML;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).format(date);
  }

  function formatRelative(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const abs = Math.abs(seconds);
    const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });
    if (abs < 60) return rtf.format(seconds, "second");
    if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
    if (abs < 86400 * 30) return rtf.format(Math.round(seconds / 86400), "day");
    return formatDate(value);
  }

  function renderPoll(poll) {
    if (!poll || !Array.isArray(poll.options) || !poll.options.length) return "";
    const total = Number(poll.totalVoteCount) || 0;
    const options = poll.options.map((option) => {
      const count = Number(option.totalVoteCount) || 0;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return `<div class="community-poll-option">
        <span class="community-poll-bar" style="width:${Math.max(0, Math.min(100, percent))}%"></span>
        <span class="community-poll-option-copy"><strong>${escapeHtml(option.option)}</strong><span>${count} 票 · ${percent}%</span></span>
      </div>`;
    }).join("");
    return `<div class="community-poll">
      <div class="community-poll-title">${escapeHtml(poll.question)}</div>
      <div class="community-poll-meta">只读投票预览 · 共 ${total} 票</div>
      <div class="community-poll-options">${options}</div>
    </div>`;
  }

  function renderComment(comment) {
    const upvotes = Number(comment.upvoteCount) || 0;
    const reactions = Number(comment.reactionCount) || 0;
    const replies = Number(comment.replyCount) || 0;
    const statParts = [];
    if (upvotes) statParts.push(`${upvotes} 赞同`);
    if (reactions) statParts.push(`${reactions} 表情`);
    if (replies) statParts.push(`${replies} 回复`);
    if (!statParts.length) statParts.push("暂无互动");

    const replyTo = comment.replyTo
      ? `<span class="comment-reply-to">回复 @${escapeHtml(comment.replyTo)}</span>`
      : "";
    const answer = comment.isAnswer ? `<span class="comment-tag">已采纳</span>` : "";
    return `<article class="comment-card${comment.isAnswer ? " is-answer" : ""}">
      <div class="comment-head">
        <span class="comment-author">@${escapeHtml(comment.author || "ghost")}</span>
        ${replyTo}
        ${answer}
        <span title="${escapeHtml(formatDate(comment.createdAt))}">${escapeHtml(formatRelative(comment.createdAt))}</span>
        <span class="comment-stats">${escapeHtml(statParts.join(" · "))}</span>
      </div>
      <div class="github-content">${sanitizeGithubHtml(comment.bodyHTML)}</div>
    </article>`;
  }

  function renderCommentGroup(title, note, comments) {
    if (!Array.isArray(comments) || !comments.length) return "";
    return `<section class="comment-group">
      <h4 class="comment-group-title"><span>${escapeHtml(title)}</span><small>${escapeHtml(note)}</small></h4>
      <div class="comment-list">${comments.map(renderComment).join("")}</div>
    </section>`;
  }


  function renderPostBody(post) {
    // GitHub 已经把正文渲染成 HTML（含代码块、details、表格），优先直接用；
    // 只有缺少 bodyHTML 时才回退到本地 Markdown 渲染。
    if (post.bodyHTML) return sanitizeGithubHtml(post.bodyHTML);
    const source = post.bodyMarkdown || post.body || "";
    if (source && window.communityMarkdownRender) {
      return sanitizeGithubHtml(window.communityMarkdownRender(source));
    }
    return "";
  }

  function emojify(value) {
    const text = String(value ?? "");
    return window.communityEmoji ? window.communityEmoji(text) : text;
  }

  function renderDiscussion(post, variant) {
    const isPinned = variant === "pinned";
    const isFeatured = variant === "featured";
    const id = `discussion-${post.number}-${variant}`;
    const category = [emojify(post.category?.emoji), post.category?.name].filter(Boolean).join(" ");
    const commentCount = Number(post.commentCount) || 0;
    const upvoteCount = Number(post.upvoteCount) || 0;
    const comments = post.comments || {};
    const body = renderPostBody(post);
    const meta = [
      `@${post.author || "ghost"}`,
      `更新 ${formatRelative(post.updatedAt)}`,
      `${commentCount} 条评论`,
      `${upvoteCount} 赞同`
    ];

    return `<article class="discussion-card${isPinned ? " is-pinned" : ""}${isFeatured ? " is-featured" : ""}">
      <button class="discussion-summary" type="button" aria-expanded="false" aria-controls="${id}">
        <span class="discussion-heading">
          <span class="discussion-badges">
            ${isPinned ? `<span class="discussion-badge pinned">置顶</span>` : ""}
            ${isFeatured ? `<span class="discussion-badge featured">精选</span>` : ""}
            ${category ? `<span class="discussion-badge">${escapeHtml(category)}</span>` : ""}
          </span>
          <span class="discussion-title">${escapeHtml(emojify(post.title))}</span>
          <span class="discussion-meta">${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</span>
        </span>
        <span class="discussion-toggle">展开内容</span>
      </button>
      <div class="discussion-content" id="${id}" hidden>
        <div class="discussion-body">
          <div class="github-content">${body || "<p>该讨论没有正文。</p>"}</div>
          ${renderPoll(post.poll)}
        </div>
        <div class="discussion-comments">
          ${renderCommentGroup("热门评论", "按赞同、表情互动与回复热度综合排序", comments.hot)}
          ${renderCommentGroup("最新评论", "已自动排除与热门评论重复的内容", comments.latest)}
          ${commentCount === 0 ? `<div class="community-empty"><strong>暂无评论</strong><p>参与讨论请前往 GitHub 原始社区。</p></div>` : ""}
        </div>
        <div class="discussion-footer">
          <span class="discussion-footer-note">本站仅提供静态阅读预览，完整互动以 GitHub 原始讨论为准。</span>
          <a class="btn btn-blue discussion-github-button" href="${escapeHtml(post.url || SOURCE_URL)}" target="_blank" rel="noopener noreferrer">前往 GitHub 查看完整讨论</a>
        </div>
      </div>
    </article>`;
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    // 非 HTTPS 或旧浏览器下 Clipboard API 不可用，退回选中复制。
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    if (!ok) throw new Error("execCommand copy failed");
  }

  function enhanceCodeBlocks(scope) {
    scope.querySelectorAll(".github-content pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("community-code-block")) return;

      const block = document.createElement("div");
      block.className = "community-code-block";
      const toolbar = document.createElement("div");
      toolbar.className = "community-code-toolbar";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "community-code-copy";
      button.textContent = "复制代码";

      toolbar.appendChild(button);
      pre.replaceWith(block);
      block.append(toolbar, pre);

      let resetTimer = 0;
      button.addEventListener("click", async () => {
        window.clearTimeout(resetTimer);
        try {
          // 代码块常放在折叠的 details 里，innerText 对隐藏元素返回空串，必须用 textContent。
          await copyText(pre.textContent.replace(/\n$/, ""));
          button.textContent = "已复制";
          button.classList.add("is-copied");
        } catch (error) {
          console.warn("[SYUCT] 代码复制失败", error);
          button.textContent = "复制失败，请手动选择";
          button.classList.add("is-failed");
        }
        resetTimer = window.setTimeout(() => {
          button.textContent = "复制代码";
          button.classList.remove("is-copied", "is-failed");
        }, 2000);
      });
    });
  }

  function bindToggles(scope) {
    scope.querySelectorAll(".discussion-summary").forEach((button) => {
      button.addEventListener("click", () => {
        const target = document.getElementById(button.getAttribute("aria-controls"));
        if (!target) return;
        const opening = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(opening));
        target.hidden = !opening;
        const label = button.querySelector(".discussion-toggle");
        if (label) label.textContent = opening ? "收起内容" : "展开内容";
      });
    });
  }

  function fillSection(container, section, posts, variant) {
    if (!container) return;
    if (posts.length) {
      container.innerHTML = posts.map((post) => renderDiscussion(post, variant)).join("");
      bindToggles(container);
      enhanceCodeBlocks(container);
      if (section) section.hidden = false;
    } else {
      container.innerHTML = "";
      if (section) section.hidden = true;
    }
  }

  function renderData(data) {
    const pinned = Array.isArray(data?.pinned) ? data.pinned : [];
    const featured = Array.isArray(data?.featured) ? data.featured : [];
    const recent = Array.isArray(data?.recent) ? data.recent : [];

    fillSection(pinnedContainer, pinnedSection, pinned, "pinned");
    fillSection(featuredContainer, featuredSection, featured, "featured");

    if (recent.length) {
      recentContainer.innerHTML = recent.map((post) => renderDiscussion(post, "recent")).join("");
      bindToggles(recentContainer);
      enhanceCodeBlocks(recentContainer);
      emptyState.hidden = true;
    } else {
      recentContainer.innerHTML = "";
      emptyState.hidden = false;
    }

    if (data?.generatedAt) {
      statusNode.textContent = "社区预览已就绪";
      timeNode.textContent = `内容数据更新时间：${formatDate(data.generatedAt)}。无内容变化时不会产生新提交。`;
    } else {
      statusNode.textContent = "等待首次同步";
      timeNode.textContent = "系统每小时自动检查，也支持手动运行同步任务。";
    }
  }

  async function loadCommunity() {
    const quarterHourBucket = Math.floor(Date.now() / (15 * 60 * 1000));
    try {
      const response = await fetch(`${DATA_URL}?v=${quarterHourBucket}`, { cache: "default" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      renderData(data);
    } catch (error) {
      console.warn("[SYUCT] 社区数据加载失败", error);
      statusNode.textContent = "社区数据加载失败";
      timeNode.textContent = "可以稍后刷新，或直接访问 GitHub 原始社区。";
      recentContainer.innerHTML = `<div class="community-error">暂时无法读取静态社区数据。此错误不会影响网站其他页面。</div>`;
      emptyState.hidden = true;
    }
  }

  loadCommunity();
})();
