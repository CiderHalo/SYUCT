import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.min.mjs";

const PDFJS_BASE = "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/";
pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}build/pdf.worker.min.mjs`;

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

let pdfDocument = null;
let currentPage = 1;
let zoomFactor = 1;
let renderTask = null;
let loadTask = null;
let fileUrl = null;
let resizeTimer = null;

function resolveSafePdfUrl(value) {
  if (!value) throw new Error("缺少 PDF 文件地址。");
  const url = new URL(value, location.href);
  if (url.origin !== location.origin) throw new Error("只允许预览本站文件。");
  if (!url.pathname.toLowerCase().endsWith(".pdf")) throw new Error("文件不是 PDF 格式。");
  return url;
}

function updateButtons() {
  const count = pdfDocument?.numPages || 1;
  elements.pageInput.value = String(currentPage);
  elements.pageInput.max = String(count);
  elements.pageCount.textContent = `/ ${count}`;
  elements.previous.disabled = currentPage <= 1;
  elements.next.disabled = currentPage >= count;
  elements.meta.textContent = pdfDocument ? `第 ${currentPage} / ${count} 页 · ${Math.round(zoomFactor * 100)}%` : "正在加载文档";
}

function showLoading(title, text = "") {
  elements.statusPanel.hidden = false;
  elements.stage.hidden = true;
  elements.errorPanel.hidden = true;
  elements.statusTitle.textContent = title;
  if (text) elements.statusText.textContent = text;
}

function showError(error) {
  console.error(error);
  elements.statusPanel.hidden = true;
  elements.stage.hidden = true;
  elements.errorPanel.hidden = false;
  elements.errorMessage.textContent = error?.message || "文档暂时无法预览，请下载原文件查看。";
}

function availableWidth() {
  const viewport = elements.main.clientWidth;
  return Math.max(280, Math.min(viewport - (viewport < 720 ? 20 : 52), 1180));
}

async function renderPage(pageNumber, { keepPosition = false } = {}) {
  if (!pdfDocument) return;
  const safePage = Math.min(Math.max(Number(pageNumber) || 1, 1), pdfDocument.numPages);
  currentPage = safePage;
  updateButtons();
  if (renderTask) {
    try { renderTask.cancel(); } catch {}
  }
  elements.stage.hidden = false;
  elements.statusPanel.hidden = true;
  elements.errorPanel.hidden = true;
  elements.canvas.style.opacity = "0.45";

  const page = await pdfDocument.getPage(currentPage);
  const baseViewport = page.getViewport({ scale: 1 });
  const fitScale = availableWidth() / baseViewport.width;
  const cssScale = Math.min(Math.max(fitScale * zoomFactor, 0.35), 3.2);
  const viewport = page.getViewport({ scale: cssScale });
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = elements.canvas;
  const context = canvas.getContext("2d", { alpha: false });

  canvas.width = Math.floor(viewport.width * pixelRatio);
  canvas.height = Math.floor(viewport.height * pixelRatio);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  renderTask = page.render({
    canvasContext: context,
    viewport,
    transform: pixelRatio === 1 ? null : [pixelRatio, 0, 0, pixelRatio, 0, 0],
    intent: "display",
  });

  try {
    await renderTask.promise;
    elements.canvas.style.opacity = "1";
    if (!keepPosition) elements.main.scrollTo({ top: 0, behavior: "instant" });
    history.replaceState(null, "", `${location.pathname}?file=${encodeURIComponent(requestedFile)}&title=${encodeURIComponent(requestedTitle)}&page=${currentPage}`);
    if (currentPage < pdfDocument.numPages) pdfDocument.getPage(currentPage + 1).catch(() => {});
  } catch (error) {
    if (error?.name !== "RenderingCancelledException") showError(error);
  }
}

async function loadDocument() {
  try {
    fileUrl = resolveSafePdfUrl(requestedFile);
    elements.title.textContent = requestedTitle;
    document.title = `${requestedTitle} · 在线预览`;
    elements.download.href = fileUrl.href;
    elements.fallbackDownload.href = fileUrl.href;
    showLoading("正在加载 PDF", "较大的文档会按需读取；翻页时只渲染当前页面，避免占用过多内存。");
    elements.progress.style.width = "7%";

    loadTask = pdfjsLib.getDocument({
      url: fileUrl.href,
      cMapUrl: `${PDFJS_BASE}cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${PDFJS_BASE}standard_fonts/`,
      wasmUrl: `${PDFJS_BASE}wasm/`,
      enableXfa: true,
      isEvalSupported: false,
    });
    loadTask.onProgress = ({ loaded, total }) => {
      const percent = total ? Math.max(7, Math.min(94, loaded / total * 100)) : 35;
      elements.progress.style.width = `${percent}%`;
      if (total) elements.statusText.textContent = `正在读取文档：${Math.round(loaded / 1024 / 1024 * 10) / 10} / ${Math.round(total / 1024 / 1024 * 10) / 10} MB`;
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
  zoomFactor = Math.min(Math.max(zoomFactor * multiplier, 0.55), 2.5);
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

loadDocument();
