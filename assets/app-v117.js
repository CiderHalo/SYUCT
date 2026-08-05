
const SITE = {"desktopName": "沈阳化工大学校园指南（学生共创版）", "mobileName": "沈化大校园指南", "shortName": "SYUCT GUIDE", "repoUrl": "https://github.com/hanchuang0303/SYUCT", "officialUrl": "https://www.syuct.edu.cn/", "nav": [["index.html", "⌂", "首页"], ["freshman.html", "🎓", "新生入学"], ["map.html", "🗺", "校园地图"], ["digital.html", "🔐", "数字校园"], ["academics.html", "📚", "学业资料"], ["services.html", "🏫", "办事大厅"], ["campus.html", "🌿", "校园生活"], ["resources.html", "🗂", "资料下载"], ["about.html", "🤝", "关于共建"]], "search": [{"title": "2026 新生报到与军训", "url": "freshman.html#timeline", "text": "9月3日 新生报到 9月5日至18日 军训 9月21日 开始上课"}, {"title": "新生入学指南", "url": "freshman.html#guide", "text": "报到材料 学费住宿 银行卡 数字迎新 新生群"}, {"title": "统一身份认证", "url": "digital.html#identity", "text": "账号激活 企业微信 验证码 单点登录 sso"}, {"title": "WebVPN", "url": "digital.html#webvpn", "text": "校外访问校内资源 webvpn 浏览器 无需客户端"}, {"title": "CARSI 电子资源", "url": "digital.html#carsi", "text": "知网 SCIE ACS RSC Springer 校外访问"}, {"title": "校园地图", "url": "map.html#campus-map", "text": "教学楼 图书馆 食堂 宿舍 体育馆 网羽中心"}, {"title": "体育课专用地图", "url": "map.html#sports-map", "text": "主田径场 东田径场 羽毛球馆 体育馆 网球场"}, {"title": "计算机科学与技术培养方案", "url": "academics.html#plans", "text": "计算机 专业培养方案 课程 学分 物联网 人工智能 大数据"}, {"title": "化学工程与工艺培养方案", "url": "academics.html#plans", "text": "化工 卓越 培养方案 化工原理 化工设计"}, {"title": "高等数学 2 期末真题", "url": "academics.html#exams", "text": "高数 期末 真题 2025 2026"}, {"title": "大学物理 1 期末真题", "url": "academics.html#exams", "text": "物理 期末 真题 2025 2026"}, {"title": "微专业报名", "url": "academics.html#micro-major", "text": "微专业 数据科学 网络安全 智能制造 智能化工"}, {"title": "重修缴费", "url": "services.html#teaching", "text": "中国银行 手机银行 学号 课程号 重修缴费"}, {"title": "查卷申请", "url": "services.html#teaching", "text": "成绩 查卷 申请表 教务"}, {"title": "奖学金申请", "url": "services.html#scholarship", "text": "奖学金 系统 中国银行卡 A考 不及格"}, {"title": "毕业资格自查", "url": "services.html#graduation", "text": "毕业 学位 资格 审查 明细表"}, {"title": "毕业论文模板与查重", "url": "services.html#graduation", "text": "论文 模板 格式 查重 30% 20%"}, {"title": "校园跑与免跑", "url": "campus.html#sports", "text": "校园跑 男生48公里 女生36公里 免测申请"}, {"title": "体质测试评分表", "url": "campus.html#sports", "text": "体测 BMI 肺活量 50米 立定跳远 800米 1000米"}, {"title": "学习通图书借阅", "url": "campus.html#library", "text": "超星学习通 借阅 续借 超期提醒"}, {"title": "全部资料下载", "url": "resources.html", "text": "PDF DOC DOCX XLS XLSX 下载中心 资料目录"}, {"title": "工程管理专业 2025 培养方案", "url": "academics.html#plans", "text": "工程管理 培养方案 工程项目管理 投资 造价 学分"}, {"title": "2026 通识选修建议", "url": "academics.html#electives", "text": "选修课 通识选修 体育课 学生经验"}, {"title": "创新创业竞赛管理与奖励", "url": "academics.html#innovation", "text": "竞赛 A+ A B C D 奖励 资助 认定目录"}, {"title": "开放实验室申请", "url": "academics.html#innovation", "text": "开放实验室 实验项目 申请表"}, {"title": "学籍信息修改", "url": "services.html#teaching", "text": "学信网 姓名 身份证 民族 学籍修改 申请表"}, {"title": "缓考申请", "url": "services.html#teaching", "text": "考试 缓考 任课教师 辅导员 教务处"}, {"title": "教室监控录像回放申请", "url": "services.html#campus-affairs", "text": "录像回放 监控 保卫处 教务处 7至10天"}, {"title": "体育保健课申请", "url": "campus.html#sports", "text": "体育保健课 校医院 申请表"}, {"title": "2026 暑期本科生留校", "url": "campus.html#vacation", "text": "暑假 留校 宿舍 安全 申请"}, {"title": "加入交流群", "url": "about.html#community", "text": "QQ群 1170264357 投稿 纠错 共建"}]};

function updateResponsiveTitle(){
  const mobile=window.matchMedia&&window.matchMedia("(max-width: 650px)").matches;
  const siteName=mobile?SITE.mobileName:SITE.desktopName;
  const current=document.title.split(" · ")[0]||"首页";
  document.title=`${current} · ${siteName}`;
}
function pageName(){
  const path = location.pathname.split("/").pop();
  return path || "index.html";
}
function renderChrome(){
  const current = pageName();
  const topbar = document.getElementById("topbar");
  const sidebar = document.getElementById("sidebar");
  if(!topbar || !sidebar) return;
  topbar.innerHTML = `
    <button class="icon-btn menu-btn" id="menuBtn" aria-label="打开菜单">☰</button>
    <a class="brand" href="index.html" aria-label="返回首页">
      <span class="brand-mark brand-mark-logo"><img src="assets/syuct-community-icon.png" alt="沈化校园指南学生共创图标"></span>
      <span class="brand-name brand-name-desktop">${SITE.desktopName}</span>
      <span class="brand-name brand-name-mobile">${SITE.mobileName}</span>
    </a>
    <span class="topbar-spacer"></span>
    <div class="topbar-actions">
      <button class="icon-btn" id="themeBtn" aria-label="切换深浅色">◐</button>
      <button class="topbar-search" id="searchBtn" aria-label="打开站内搜索"><span>⌕</span><span class="topbar-search-label">搜索校园资料</span><kbd>Ctrl K</kbd></button>
      <div class="quick-links" id="quickLinks">
        <button class="icon-btn quick-links-button" id="quickLinksButton" type="button" aria-label="打开快捷链接" aria-haspopup="menu" aria-expanded="false"><span aria-hidden="true">↗</span></button>
        <div class="quick-links-menu" id="quickLinksMenu" role="menu" aria-label="快捷链接">
          <a href="${SITE.officialUrl}" target="_blank" rel="noreferrer" role="menuitem"><span><strong>学校官网</strong><small>沈阳化工大学官方网站</small></span><b aria-hidden="true">↗</b></a>
          <a href="${SITE.repoUrl}" target="_blank" rel="noreferrer" role="menuitem"><span><strong>GitHub 仓库</strong><small>查看源码与更新记录</small></span><b aria-hidden="true">↗</b></a>
        </div>
      </div>
    </div>`;
  sidebar.innerHTML = `
    <div class="sidebar-label">SYUCT CAMPUS GUIDE</div>
    <ul class="nav-list">${SITE.nav.map(([url,icon,label])=>`<li><a href="${url}" class="${current===url?'active':''}"><span class="nav-icon">${icon}</span>${label}</a></li>`).join("")}</ul>
    <div class="sidebar-card"><strong>非官方学生共建站</strong>资料整理至 2026 年 8 月。政策、收费、考试与毕业要求请以学校当年正式通知为准。</div>`;
  document.getElementById("menuBtn")?.addEventListener("click",()=>{
    sidebar.classList.toggle("open");
    document.getElementById("backdrop")?.classList.toggle("open");
  });
  document.getElementById("backdrop")?.addEventListener("click",closeSidebar);
  sidebar.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeSidebar));
  document.getElementById("themeBtn")?.addEventListener("click",toggleTheme);
  document.getElementById("searchBtn")?.addEventListener("click",openSearch);
  document.getElementById("quickLinksButton")?.addEventListener("click",event=>{
    event.stopPropagation();
    const menu=document.getElementById("quickLinks");
    const willOpen=!menu?.classList.contains("open");
    closeQuickLinks();
    menu?.classList.toggle("open",willOpen);
    document.getElementById("quickLinksButton")?.setAttribute("aria-expanded",String(willOpen));
  });
  document.getElementById("quickLinksMenu")?.addEventListener("click",event=>event.stopPropagation());
  document.addEventListener("click",closeQuickLinks);
}
function closeSidebar(){
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("backdrop")?.classList.remove("open");
}
function closeQuickLinks(){
  document.getElementById("quickLinks")?.classList.remove("open");
  document.getElementById("quickLinksButton")?.setAttribute("aria-expanded","false");
}
function readSavedTheme(){
  try{return localStorage.getItem("syuct-guide-theme");}catch(error){return null;}
}
function saveTheme(theme){
  try{localStorage.setItem("syuct-guide-theme",theme);}catch(error){}
}
function initTheme(){
  const saved=readSavedTheme();
  const preferred=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  setTheme(saved||preferred);
}
function setTheme(theme){
  document.documentElement.dataset.theme=theme;
  saveTheme(theme);
}
function toggleTheme(){
  setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark");
}
function renderSearch(){
  const overlay=document.getElementById("searchOverlay");
  if(!overlay)return;
  overlay.innerHTML=`<div class="search-box" role="dialog" aria-modal="true">
    <div class="search-input-wrap"><span>⌕</span><input id="searchInput" class="search-input" placeholder="搜索报到、地图、课程、办事流程……" autocomplete="off"><button class="icon-btn" id="searchClose" aria-label="关闭">✕</button></div>
    <div id="searchResults" class="search-results"></div></div>`;
  overlay.addEventListener("click",e=>{if(e.target===overlay)closeSearch()});
  document.getElementById("searchClose")?.addEventListener("click",closeSearch);
  document.getElementById("searchInput")?.addEventListener("input",e=>updateSearch(e.target.value));
  updateSearch("");
}
function updateSearch(raw){
  const q=raw.trim().toLowerCase();
  const items=SITE.search.filter(x=>!q||(`${x.title} ${x.text}`).toLowerCase().includes(q));
  const box=document.getElementById("searchResults");
  if(!box)return;
  box.innerHTML=items.length?items.map(x=>`<a class="search-result" href="${x.url}"><strong>${x.title}</strong><span>${x.text}</span></a>`).join(""):`<div class="search-empty">没有找到相关内容</div>`;
}
function openSearch(){
  document.getElementById("searchOverlay")?.classList.add("open");
  setTimeout(()=>document.getElementById("searchInput")?.focus(),30);
}
function closeSearch(){document.getElementById("searchOverlay")?.classList.remove("open")}
function renderGroupModal(){
  if(document.getElementById("groupModal"))return;
  document.body.insertAdjacentHTML("beforeend",`<div class="group-modal" id="groupModal" aria-hidden="true">
    <div class="group-modal-card" role="dialog" aria-modal="true">
      <button class="group-modal-close" id="groupModalClose" aria-label="关闭">✕</button>
      <div class="group-modal-kicker">QQ 群 · 校园交流</div>
      <h2>加入沈阳化工大学交流群</h2>
      <p>扫码加入群聊，获取资料更新并交流校园问题。</p>
      <img src="assets/qq-group.png" alt="沈阳化工大学交流群二维码，群号 1170264357">
      <div class="group-number-row"><span class="group-number">群号：1170264357</span><button class="group-copy-button" id="groupCopyButton">复制群号</button></div>
    </div></div>`);
}
function openGroupModal(){
  const modal=document.getElementById("groupModal");
  modal?.classList.add("open");document.body.classList.add("modal-open");
}
function closeGroupModal(){
  document.getElementById("groupModal")?.classList.remove("open");document.body.classList.remove("modal-open");
}
async function copyGroupNumber(){
  const button=document.getElementById("groupCopyButton");
  try{await navigator.clipboard.writeText("1170264357");button.textContent="已复制";}
  catch{button.textContent="群号 1170264357";}
  setTimeout(()=>button.textContent="复制群号",1500);
}
function initGroupModal(){
  document.querySelectorAll("[data-open-group-modal]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();openGroupModal();}));
  document.getElementById("groupModalClose")?.addEventListener("click",closeGroupModal);
  document.getElementById("groupCopyButton")?.addEventListener("click",copyGroupNumber);
  document.getElementById("groupModal")?.addEventListener("click",e=>{if(e.target.id==="groupModal")closeGroupModal()});
}
function initLightbox(){
  const lightbox=document.getElementById("lightbox");
  if(!lightbox)return;
  document.querySelectorAll("[data-lightbox]").forEach(el=>el.addEventListener("click",()=>{
    lightbox.innerHTML=`<img src="${el.dataset.lightbox}" alt="查看大图">`;
    lightbox.classList.add("open");document.body.classList.add("modal-open");
  }));
  lightbox.addEventListener("click",()=>{lightbox.classList.remove("open");lightbox.innerHTML="";document.body.classList.remove("modal-open");});
}
function initResourceFilter(){
  const input=document.getElementById("resourceSearch");
  if(!input)return;
  let category="all";
  const items=[...document.querySelectorAll("[data-resource-item]")];
  const empty=document.getElementById("resourceEmpty");
  function apply(){
    const q=input.value.trim().toLowerCase();
    let shown=0;
    items.forEach(item=>{
      const okCat=category==="all"||item.dataset.category===category;
      const okSearch=!q||item.dataset.search.includes(q);
      item.classList.toggle("hidden",!(okCat&&okSearch));
      if(okCat&&okSearch)shown++;
    });
    empty?.classList.toggle("hidden",shown!==0);
  }
  input.addEventListener("input",apply);
  document.querySelectorAll("[data-resource-filter]").forEach(btn=>btn.addEventListener("click",()=>{
    category=btn.dataset.resourceFilter;
    document.querySelectorAll("[data-resource-filter]").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");apply();
  }));
}
document.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch();}
  if(e.key==="Escape"){closeQuickLinks();closeSearch();closeGroupModal();document.getElementById("lightbox")?.classList.remove("open");document.body.classList.remove("modal-open");}
});
function runSafely(name,fn){
  try{fn();}catch(error){console.error("[SYUCT] "+name+" 初始化失败",error);}
}
document.addEventListener("DOMContentLoaded",()=>{
  runSafely("响应式标题",updateResponsiveTitle);
  runSafely("导航栏",renderChrome);
  runSafely("主题",initTheme);
  runSafely("搜索",renderSearch);
  runSafely("群聊弹窗结构",renderGroupModal);
  runSafely("群聊弹窗",initGroupModal);
  runSafely("图片预览",initLightbox);
  runSafely("资料筛选",initResourceFilter);
  const notFoundSearch=document.getElementById("notFoundSearch");
  if(notFoundSearch)notFoundSearch.addEventListener("click",openSearch);
});

window.addEventListener("resize",updateResponsiveTitle);

/* v1.17 — local Office preview links generated from a manifest */
const OFFICE_PREVIEW_MANIFEST_URL = "assets/office-preview-manifest.json?v=117";

function normalizeSiteRelativePath(rawHref){
  if(!rawHref || rawHref.startsWith("#")) return "";
  try{
    const siteBase=new URL("./",location.href);
    const url=new URL(rawHref,siteBase);
    if(url.origin!==location.origin || !url.pathname.startsWith(siteBase.pathname)) return "";
    return decodeURIComponent(url.pathname.slice(siteBase.pathname.length)).replace(/^\/+/,"");
  }catch(error){return "";}
}
function officeDocumentTitle(anchor){
  const scope=anchor.closest(".download-item,.resource-card,.feature-card,.step-card,article,section");
  const heading=scope?.querySelector("h1,h2,h3,h4");
  return (heading?.textContent||anchor.textContent||"Office 文档").trim().replace(/\s+/g," ");
}
function officePreviewUrl(sourcePath,previewPath,title){
  const query=new URLSearchParams({file:previewPath,source:sourcePath,title});
  return `pdf-viewer.html?${query.toString()}`;
}
function buildOfficePreviewButton(sourcePath,entry,title,buttonStyle){
  const preview=document.createElement("a");
  preview.href=officePreviewUrl(sourcePath,entry.preview,title);
  preview.target="_blank";
  preview.rel="noreferrer";
  preview.dataset.officePreviewFor=sourcePath;
  preview.textContent=buttonStyle?"预览":"在线预览 →";
  preview.className=buttonStyle?"download-button preview-button office-preview-button":"text-link office-preview-link";
  preview.setAttribute("aria-label",`在线预览：${title}`);
  return preview;
}
function enhanceOfficeLink(anchor,sourcePath,entry){
  if(anchor.dataset.officeEnhanced==="true") return;
  anchor.dataset.officeEnhanced="true";
  anchor.setAttribute("download","");
  const title=officeDocumentTitle(anchor);
  const isButton=anchor.classList.contains("download-button");
  const preview=buildOfficePreviewButton(sourcePath,entry,title,isButton);

  if(isButton){
    let actions=anchor.closest(".download-actions");
    if(!actions){
      actions=document.createElement("div");
      actions.className="download-actions office-download-actions";
      anchor.replaceWith(actions);
      actions.append(preview,anchor);
    }else{
      actions.insertBefore(preview,anchor);
    }
    anchor.classList.add("download-secondary");
    anchor.textContent="下载";
    return;
  }

  let actions=anchor.closest(".resource-actions");
  if(!actions){
    actions=document.createElement("div");
    actions.className="resource-actions office-resource-actions";
    anchor.replaceWith(actions);
    actions.append(preview,anchor);
  }else{
    actions.insertBefore(preview,anchor);
  }
  anchor.classList.remove("text-link");
  anchor.classList.add("secondary-link","office-source-link");
  anchor.textContent="下载原文件";
}
async function initOfficePreviews(){
  const response=await fetch(OFFICE_PREVIEW_MANIFEST_URL,{cache:"no-cache"});
  if(!response.ok) throw new Error(`Office 预览清单加载失败：${response.status}`);
  const manifest=await response.json();
  const entries=manifest?.entries||{};
  document.querySelectorAll('a[href]').forEach(anchor=>{
    const sourcePath=normalizeSiteRelativePath(anchor.getAttribute("href"));
    const entry=entries[sourcePath];
    if(!entry?.preview) return;
    enhanceOfficeLink(anchor,sourcePath,entry);
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  initOfficePreviews().catch(error=>console.warn("[SYUCT] Office 本地预览未启用",error));
});
