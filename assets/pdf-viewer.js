window.__pdfViewerStarted = true;
const PDFJS_VERSION = "6.2.108";
const READER_BUILD = "1.8.0";
const params = new URLSearchParams(location.search);
const requestedFile = params.get("file") || "";
const requestedTitle = params.get("title") || "PDF 在线预览";

const elements = {
  title: document.getElementById("documentTitle"),
  meta: document.getElementById("documentMeta"),
  statusPanel: document.getElementById("statusPanel"),
  statusTitle: document.getElementById("statusTitle"),
  statusText: document.getElementById("statusText"),
  progress: document.getElementById("progressBar"),
  stage: document.getElementById("viewerStage"),
  errorPanel: document.getElementById("errorPanel"),
  errorMessage: document.getElementById("errorMessage"),
  pageShell: document.getElementById("pageShell"),
  canvas: document.getElementById("pdfCanvas"),
  pageInput: document.getElementById("pageInput"),
  pageCount: document.getElementById("pageCount"),
  previous: document.getElementById("previousButton"),
  next: document.getElementById("nextButton"),
  download: document.getElementById("downloadButton"),
  fallbackDownload: document.getElementById("fallbackDownload"),
  retry: document.getElementById("retryButton"),
  back: document.getElementById("backButton"),
  zoomOut: document.getElementById("zoomOutButton"),
  zoomIn: document.getElementById("zoomInButton"),
  fit: document.getElementById("fitButton"),
  main: document.querySelector(".viewer-main"),
};

let pdfjsLib = null;
let pdfDocument = null;
let currentPage = 1;
let zoomFactor = 1;
let renderTask = null;
let loadTask = null;
let filePath = "";
let fileUrl = null;
let resizeTimer = null;
let renderSequence = 0;

function localAsset(relativePath) {
  return new URL(relativePath, import.meta.url).href;
}

function normalizeLocalPdf(value) {
  if (!value) throw new Error("缺少 PDF 文件地址。");
  const siteBase = new URL("./", location.href);
  const url = new URL(value, siteBase);
  if (url.origin !== location.origin || !url.pathname.startsWith(siteBase.pathname)) {
    throw new Error("只允许预览本站文件。");
  }
  let relative;
  try {
    relative = decodeURIComponent(url.pathname.slice(siteBase.pathname.length)).replace(/^\/+/, "");
  } catch {
    throw new Error("PDF 文件地址编码无效。");
  }
  if (!relative.startsWith("docs/") || relative.includes("..") || !relative.toLowerCase().endsWith(".pdf")) {
    throw new Error("文件地址无效或不是 PDF 格式。");
  }
  url.hash = "";
  return { relative, url };
}

function showLoading(title, text = "") {
  elements.statusPanel.hidden = false;
  elements.stage.hidden = true;
  elements.errorPanel.hidden = true;
  elements.statusTitle.textContent = title;
  if (text) elements.statusText.textContent = text;
}

function humanizeError(error) {
  const message = String(error?.message || error || "");
  if (/Failed to fetch dynamically imported module|Importing a module script failed|pdf\.min\.(mjs|js)|加载超时|404/i.test(message)) {
    return "本地 PDF.js 文件尚未进入当前部署。请确认仓库中存在 assets/pdfjs/pdf.min.js 和 pdf.worker.min.js，然后在 EdgeOne 重新部署 main 分支的最新提交。";
  }
  if (/Missing PDF|Unexpected server response|InvalidPDFException|PDF header not found/i.test(message)) {
    return "PDF 文件无法读取，可能是文件未完整上传、访问地址错误或文档本身损坏。";
  }
  if (/PasswordException/i.test(message)) {
    return "这份 PDF 需要密码，或输入的密码不正确。";
  }
  return message || "文档暂时无法预览，请直接打开或下载原文件。";
}

function showError(error) {
  console.error(error);
  elements.statusPanel.hidden = true;
  elements.stage.hidden = true;
  elements.errorPanel.hidden = false;
  elements.errorMessage.textContent = humanizeError(error);
  elements.meta.textContent = "本地预览不可用";
}

function availableWidth() {
  const viewport = elements.main.clientWidth;
  return Math.max(280, Math.min(viewport - (viewport < 720 ? 20 : 52), 1180));
}

function updateButtons() {
  const count = pdfDocument?.numPages || 1;
  elements.pageInput.value = String(currentPage);
  elements.pageInput.max = String(count);
  elements.pageCount.textContent = `/ ${count}`;
  elements.previous.disabled = !pdfDocument || currentPage <= 1;
  elements.next.disabled = !pdfDocument || currentPage >= count;
  elements.meta.textContent = pdfDocument
    ? `第 ${currentPage} / ${count} 页 · ${Math.round(zoomFactor * 100)}% · 本地 PDF.js`
    : "正在加载文档";
}

function updateAddressBar() {
  const nextUrl = new URL(location.href);
  nextUrl.searchParams.set("file", filePath);
  nextUrl.searchParams.set("title", requestedTitle);
  nextUrl.searchParams.set("page", String(currentPage));
  history.replaceState(null, "", nextUrl);
}

function withTimeout(promise, milliseconds, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function loadPdfJs() {
  showLoading(
    "正在准备本地 PDF 阅读器",
    "正在加载本站内的 PDF 阅读组件。首次打开稍慢，之后浏览器会缓存。",
  );
  elements.progress.style.width = "10%";

  // EdgeOne 对常规 .js 的静态资源兼容性更稳定，因此发布时将
  // PDF.js 的 ES Module 内容同时保存为 .js，并以模块方式导入。
  const moduleUrl = localAsset(`./pdfjs/pdf.min.js?v=${PDFJS_VERSION}-${READER_BUILD}`);
  try {
    pdfjsLib = await withTimeout(
      import(moduleUrl),
      20000,
      "本地 PDF.js 加载超时。当前 EdgeOne 部署可能还没有包含 assets/pdfjs/pdf.min.js。",
    );
  } catch (error) {
    throw new Error(`本地 PDF.js 加载失败：${error?.message || error}`);
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = localAsset(
    `./pdfjs/pdf.worker.min.js?v=${PDFJS_VERSION}-${READER_BUILD}`,
  );
  elements.progress.style.width = "20%";
}

async function renderPage(pageNumber, { keepPosition = false } = {}) {
  if (!pdfDocument) return;
  const sequence = ++renderSequence;
  const safePage = Math.min(Math.max(Number(pageNumber) || 1, 1), pdfDocument.numPages);
  currentPage = safePage;
  updateButtons();

  if (renderTask) {
    try { renderTask.cancel(); } catch {}
  }
  elements.stage.hidden = false;
  elements.statusPanel.hidden = true;
  elements.errorPanel.hidden = true;
  elements.pageShell.classList.add("is-rendering");

  try {
    const page = await pdfDocument.getPage(currentPage);
    if (sequence !== renderSequence) return;

    const baseViewport = page.getViewport({ scale: 1 });
    const fitScale = availableWidth() / baseViewport.width;
    const cssScale = Math.min(Math.max(fitScale * zoomFactor, 0.25), 4);
    const viewport = page.getViewport({ scale: cssScale });

    const maxCanvasPixels = 16_000_000;
    const requestedPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const safePixelRatio = Math.max(
      1,
      Math.min(requestedPixelRatio, Math.sqrt(maxCanvasPixels / Math.max(1, viewport.width * viewport.height))),
    );

    const canvas = elements.canvas;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("当前浏览器无法创建 PDF 画布。");

    canvas.width = Math.max(1, Math.floor(viewport.width * safePixelRatio));
    canvas.height = Math.max(1, Math.floor(viewport.height * safePixelRatio));
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    renderTask = page.render({
      canvasContext: context,
      viewport,
      transform: safePixelRatio === 1 ? null : [safePixelRatio, 0, 0, safePixelRatio, 0, 0],
      intent: "display",
    });
    await renderTask.promise;
    if (sequence !== renderSequence) return;

    elements.pageShell.classList.remove("is-rendering");
    if (!keepPosition) elements.main.scrollTo({ top: 0, left: 0, behavior: "instant" });
    updateAddressBar();

    if (currentPage < pdfDocument.numPages) {
      pdfDocument.getPage(currentPage + 1).catch(() => {});
    }
  } catch (error) {
    if (error?.name !== "RenderingCancelledException" && sequence === renderSequence) showError(error);
  }
}

async function loadDocument() {
  try {
    const resolved = normalizeLocalPdf(requestedFile);
    filePath = resolved.relative;
    fileUrl = resolved.url;
    elements.title.textContent = requestedTitle;
    document.title = `${requestedTitle} · 在线预览`;
    for (const link of [elements.download, elements.fallbackDownload].filter(Boolean)) {
      link.href = fileUrl.href;
    }

    await loadPdfJs();
    showLoading("正在读取 PDF", "较大的文档会按需读取；阅读器只渲染当前页，降低手机内存占用。");

    loadTask = pdfjsLib.getDocument({
      url: fileUrl.href,
      cMapUrl: localAsset("./pdfjs/cmaps/"),
      cMapPacked: true,
      iccUrl: localAsset("./pdfjs/iccs/"),
      standardFontDataUrl: localAsset("./pdfjs/standard_fonts/"),
      wasmUrl: localAsset("./pdfjs/wasm/"),
      enableXfa: true,
      isEvalSupported: false,
    });

    loadTask.onProgress = ({ loaded, total }) => {
      const fraction = total ? loaded / total : 0.35;
      const percent = Math.max(20, Math.min(96, 20 + fraction * 76));
      elements.progress.style.width = `${percent}%`;
      if (total) {
        const loadedMb = Math.round((loaded / 1024 / 1024) * 10) / 10;
        const totalMb = Math.round((total / 1024 / 1024) * 10) / 10;
        elements.statusText.textContent = `正在读取文档：${loadedMb} / ${totalMb} MB`;
      }
    };

    loadTask.onPassword = (updatePassword, reason) => {
      const isRetry = reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD;
      const password = window.prompt(isRetry ? "密码不正确，请重新输入 PDF 密码：" : "这份 PDF 受密码保护，请输入密码：");
      if (password === null) {
        showError(new Error("已取消输入 PDF 密码。"));
        return;
      }
      updatePassword(password);
    };

    pdfDocument = await loadTask.promise;
    elements.progress.style.width = "100%";
    const initialPage = Math.min(Math.max(Number(params.get("page")) || 1, 1), pdfDocument.numPages);
    await renderPage(initialPage);
  } catch (error) {
    showError(error);
  }
}

function changePage(delta) {
  if (!pdfDocument) return;
  renderPage(currentPage + delta);
}

function changeZoom(multiplier) {
  zoomFactor = Math.min(Math.max(zoomFactor * multiplier, 0.5), 3);
  renderPage(currentPage, { keepPosition: true });
}

function fitWidth() {
  zoomFactor = 1;
  renderPage(currentPage, { keepPosition: true });
}

elements.previous.addEventListener("click", () => changePage(-1));
elements.next.addEventListener("click", () => changePage(1));
elements.zoomOut.addEventListener("click", () => changeZoom(0.82));
elements.zoomIn.addEventListener("click", () => changeZoom(1.22));
elements.fit.addEventListener("click", fitWidth);
elements.retry.addEventListener("click", () => location.reload());
elements.back.addEventListener("click", () => {
  if (history.length > 1) history.back();
  else location.href = "resources.html";
});
elements.pageInput.addEventListener("change", () => renderPage(elements.pageInput.value));
elements.pageInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    renderPage(elements.pageInput.value);
    elements.pageInput.blur();
  }
});

document.addEventListener("keydown", event => {
  if (event.target === elements.pageInput) return;
  if (event.key === "ArrowLeft" || event.key === "PageUp") changePage(-1);
  if (event.key === "ArrowRight" || event.key === "PageDown") changePage(1);
  if (event.key === "+" || event.key === "=") changeZoom(1.22);
  if (event.key === "-") changeZoom(0.82);
  if (event.key === "0") fitWidth();
});

let touchStartX = 0;
let touchStartY = 0;
elements.stage.addEventListener("touchstart", event => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });
elements.stage.addEventListener("touchend", event => {
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.4) changePage(dx < 0 ? 1 : -1);
}, { passive: true });

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (pdfDocument) renderPage(currentPage, { keepPosition: true });
  }, 180);
});

window.addEventListener("pagehide", () => {
  try { renderTask?.cancel(); } catch {}
  try { loadTask?.destroy(); } catch {}
});

updateButtons();
loadDocument();
