(function () {
  'use strict';

  const parser = window.SYUCTTimetableParser;
  const codec = window.SYUCTTimetableCodec;
  if (!parser || !codec) return;

  const weekdayNames = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  const weekTypeNames = { all: '', odd: ' · 单周', even: ' · 双周' };
  const rawInput = document.getElementById('rawTimetable');
  const recognizeBtn = document.getElementById('recognizeBtn');
  const statusBox = document.getElementById('recognizeStatus');
  const statusTitle = document.getElementById('recognizeStatusTitle');
  const statusMessage = document.getElementById('recognizeStatusMessage');
  const resultPanel = document.getElementById('recognizeResult');
  const arrangementCount = document.getElementById('arrangementCount');
  const uniqueCourseCount = document.getElementById('uniqueCourseCount');
  const oddCount = document.getElementById('oddCount');
  const evenCount = document.getElementById('evenCount');
  const practiceNotice = document.getElementById('practiceNotice');
  const previewList = document.getElementById('coursePreview');
  const semesterInput = document.getElementById('semester');
  const firstWeekDateInput = document.getElementById('firstWeekDate');
  const totalWeeksInput = document.getElementById('totalWeeks');
  const generateBtn = document.getElementById('generateBtn');
  const shareCodeOutput = document.getElementById('shareCode');
  const copyBtn = document.getElementById('copyCodeBtn');
  const codeMeta = document.getElementById('codeMeta');

  let parsedResult = null;
  let clipboardGrid = null;

  function setStatus(kind, title, message) {
    statusBox.hidden = false;
    statusBox.dataset.kind = kind;
    statusTitle.textContent = title;
    statusMessage.textContent = message || '';
  }

  function clearStatus() {
    statusBox.hidden = true;
    statusBox.dataset.kind = '';
    statusTitle.textContent = '';
    statusMessage.textContent = '';
  }

  function resetGeneratedCode() {
    shareCodeOutput.value = '';
    shareCodeOutput.hidden = true;
    copyBtn.disabled = true;
    codeMeta.textContent = '';
  }

  function resetRecognition() {
    parsedResult = null;
    resultPanel.hidden = true;
    previewList.replaceChildren();
    practiceNotice.hidden = true;
    practiceNotice.textContent = '';
    generateBtn.disabled = true;
    resetGeneratedCode();
    clearStatus();
  }

  function clipboardNodeText(node) {
    if (!node) return '';
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName ? node.tagName.toLowerCase() : '';
    if (tag === 'br') return '\n';
    let value = '';
    node.childNodes.forEach((child) => { value += clipboardNodeText(child); });
    if (/^(div|p|li|section|article)$/.test(tag) && value && !value.endsWith('\n')) value += '\n';
    return value;
  }

  function clipboardCellText(cell) {
    return clipboardNodeText(cell)
      .replace(/\u00a0/g, ' ')
      .replace(/\r/g, '')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function tableToGrid(table) {
    const grid = [];
    const occupied = [];
    Array.from(table.rows || []).forEach((row, rowIndex) => {
      if (!grid[rowIndex]) grid[rowIndex] = [];
      if (!occupied[rowIndex]) occupied[rowIndex] = [];
      let columnIndex = 0;
      Array.from(row.cells || []).forEach((cell) => {
        while (occupied[rowIndex][columnIndex]) columnIndex += 1;
        const rowSpan = Math.max(1, Number(cell.rowSpan) || 1);
        const colSpan = Math.max(1, Number(cell.colSpan) || 1);
        const value = clipboardCellText(cell);
        for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
          const targetRow = rowIndex + rowOffset;
          if (!grid[targetRow]) grid[targetRow] = [];
          if (!occupied[targetRow]) occupied[targetRow] = [];
          for (let colOffset = 0; colOffset < colSpan; colOffset += 1) {
            const targetColumn = columnIndex + colOffset;
            occupied[targetRow][targetColumn] = true;
            if (grid[targetRow][targetColumn] == null) {
              grid[targetRow][targetColumn] = rowOffset === 0 && colOffset === 0 ? value : '';
            }
          }
        }
        columnIndex += colSpan;
      });
    });
    return grid;
  }

  function extractClipboardTimetableGrid(html) {
    if (!html || typeof DOMParser === 'undefined') return null;
    try {
      const documentFragment = new DOMParser().parseFromString(html, 'text/html');
      const tables = Array.from(documentFragment.querySelectorAll('table'));
      for (const table of tables) {
        const grid = tableToGrid(table);
        const flat = grid.flat().map((cell) => String(cell || '')).join('\n');
        if (/星期一/.test(flat) && /星期五/.test(flat) && /第\s*\d{1,2}\s*节/.test(flat)) return grid;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function renderPreview(courses) {
    previewList.replaceChildren();
    courses.forEach((course) => {
      const item = document.createElement('article');
      item.className = 'tt-course-card';

      const name = document.createElement('h3');
      name.textContent = course.name;
      item.appendChild(name);

      const when = document.createElement('p');
      when.className = 'tt-course-when';
      when.textContent = `${weekdayNames[course.weekday]} · ${course.startSection}-${course.endSection}节 · ${course.startWeek}-${course.endWeek}周${weekTypeNames[course.weekType] || ''}`;
      item.appendChild(when);

      const detailParts = [course.teacher, course.room].filter(Boolean);
      if (detailParts.length) {
        const detail = document.createElement('p');
        detail.className = 'tt-course-detail';
        detail.textContent = detailParts.join(' · ');
        item.appendChild(detail);
      }
      previewList.appendChild(item);
    });
  }

  function recognize() {
    resetGeneratedCode();
    try {
      const result = clipboardGrid && typeof parser.parseCampusTimetableGrid === 'function'
        ? parser.parseCampusTimetableGrid(clipboardGrid, rawInput.value)
        : parser.parseCampusTimetable(rawInput.value);
      parsedResult = result;
      arrangementCount.textContent = String(result.meta.arrangementCount);
      uniqueCourseCount.textContent = String(result.meta.uniqueCourseCount);
      oddCount.textContent = String(result.meta.oddCount);
      evenCount.textContent = String(result.meta.evenCount);
      renderPreview(result.courses);
      resultPanel.hidden = false;

      if (result.meta.practiceNames.length) {
        practiceNotice.hidden = false;
        practiceNotice.textContent = `检测到无固定星期、节次的实践课：${result.meta.practiceNames.join('、')}。本版只提示，不加入正常周课表。`;
      } else {
        practiceNotice.hidden = true;
      }

      if (!result.meta.sourceLikelyComplete) {
        generateBtn.disabled = true;
        setStatus('warning', '识别结果可能不完整', '没有确认复制到晚间课表末尾。请回到校园网页，选择完整课表后重新复制；为避免漏课，当前不允许生成课表码。');
        return;
      }

      generateBtn.disabled = false;
      setStatus('success', '识别完成', `${result.meta.arrangementCount} 个上课安排，${result.meta.uniqueCourseCount} 门不同课程。请核对下方预览后再生成课表码。`);
    } catch (error) {
      parsedResult = null;
      resultPanel.hidden = true;
      generateBtn.disabled = true;
      setStatus('error', '没有完成识别', error && error.message ? error.message : '课表格式无法识别，请重新复制完整课表。');
    }
  }

  function parseDateOnly(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date;
  }

  function validateSettings() {
    const totalWeeks = Number(totalWeeksInput.value);
    if (!Number.isInteger(totalWeeks) || totalWeeks < 1 || totalWeeks > 30) throw new Error('学期总周数必须填写 1-30 的整数');
    const firstWeekDate = String(firstWeekDateInput.value || '').trim();
    if (firstWeekDate) {
      const date = parseDateOnly(firstWeekDate);
      if (!date) throw new Error('第一周周一日期无效');
      if (date.getUTCDay() !== 1) throw new Error('“第一周的周一”请选择星期一；不确定时可以留空');
    }
    return {
      semester: String(semesterInput.value || '').trim(),
      firstWeekDate,
      totalWeeks
    };
  }

  function generateCode() {
    if (!parsedResult || !parsedResult.meta.sourceLikelyComplete) {
      setStatus('error', '暂不能生成课表码', '请先识别一份完整课表。');
      return;
    }
    try {
      const settings = validateSettings();
      const code = codec.encodeShareCode({ settings, courses: parsedResult.courses });
      shareCodeOutput.value = code;
      shareCodeOutput.hidden = false;
      copyBtn.disabled = false;
      codeMeta.textContent = `已生成 SYUCT-TT2 · ${parsedResult.courses.length} 个上课安排 · ${code.length} 个字符`;
      setStatus('success', '课表码已生成', '核对无误后复制完整课表码，通过微信发送，并在 SYUCT-mini 的课表导入功能中粘贴导入。');
      shareCodeOutput.focus({ preventScroll: true });
      shareCodeOutput.select();
    } catch (error) {
      resetGeneratedCode();
      setStatus('error', '生成失败', error && error.message ? error.message : '请检查学期设置和识别结果。');
    }
  }

  async function copyCode() {
    const code = shareCodeOutput.value;
    if (!code) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        shareCodeOutput.hidden = false;
        shareCodeOutput.focus();
        shareCodeOutput.select();
        const ok = document.execCommand('copy');
        if (!ok) throw new Error('浏览器未允许复制');
      }
      copyBtn.textContent = '已复制';
      setTimeout(() => { copyBtn.textContent = '复制课表码'; }, 1600);
    } catch (error) {
      shareCodeOutput.focus();
      shareCodeOutput.select();
      setStatus('warning', '自动复制失败', '课表码已全选，请使用浏览器复制命令复制。');
    }
  }

  function initMiniProgramQrDialog() {
    const footer = document.querySelector('.tt-footer');
    if (!footer) return;

    const oldLink = Array.from(footer.querySelectorAll('a')).find((item) => {
      const href = item.getAttribute('href') || '';
      const text = item.textContent || '';
      return /github\.com\/SYUCT\/SYUCT-mini/i.test(href) || /SYUCT-mini/i.test(text);
    });
    if (!oldLink) return;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'tt-mini-qr-trigger';
    trigger.textContent = '查看小程序二维码';
    oldLink.replaceWith(trigger);

    const style = document.createElement('style');
    style.textContent = `
      .tt-mini-qr-trigger{appearance:none;padding:0;border:0;background:none;color:var(--primary);font:inherit;font-weight:700;cursor:pointer}
      .tt-mini-qr-trigger:hover{text-decoration:underline}
      .tt-mini-qr-modal{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:24px;background:rgba(5,21,37,.58);backdrop-filter:blur(5px)}
      .tt-mini-qr-dialog{position:relative;width:min(960px,calc(100vw - 32px));max-height:calc(100vh - 48px);overflow:auto;border:1px solid color-mix(in srgb,var(--primary) 18%,var(--border));border-radius:20px;background:var(--surface);box-shadow:0 24px 70px rgba(0,0,0,.28)}
      .tt-mini-qr-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--border)}
      .tt-mini-qr-head strong{font-size:17px}
      .tt-mini-qr-close{display:grid;place-items:center;width:36px;height:36px;flex:0 0 36px;border:1px solid var(--border);border-radius:11px;background:var(--surface-2);color:var(--text);font:inherit;font-size:20px;line-height:1;cursor:pointer}
      .tt-mini-qr-body{padding:16px}
      .tt-mini-qr-image{display:block;width:100%;height:auto;border-radius:14px;background:#eef6ff}
      .tt-mini-qr-note{margin:12px 2px 0;color:var(--muted);font-size:13px;text-align:center}
      @media(max-width:650px){.tt-mini-qr-modal{padding:12px}.tt-mini-qr-dialog{width:100%;max-height:calc(100vh - 24px);border-radius:16px}.tt-mini-qr-head{padding:13px 14px}.tt-mini-qr-body{padding:10px}.tt-mini-qr-image{border-radius:10px}}
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.className = 'tt-mini-qr-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'ttMiniQrTitle');
    modal.innerHTML = `
      <div class="tt-mini-qr-dialog">
        <div class="tt-mini-qr-head">
          <strong id="ttMiniQrTitle">SYUCT-mini 小程序二维码</strong>
          <button class="tt-mini-qr-close" type="button" aria-label="关闭二维码弹窗">×</button>
        </div>
        <div class="tt-mini-qr-body">
          <img class="tt-mini-qr-image" alt="沈阳化工大学校园指南 SYUCT-mini 小程序二维码宣传图">
          <p class="tt-mini-qr-note">请使用微信扫码进入小程序。</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.tt-mini-qr-close');
    const image = modal.querySelector('.tt-mini-qr-image');
    let previousFocus = null;

    function openModal() {
      previousFocus = document.activeElement;
      if (!image.getAttribute('src')) image.src = 'assets/syuct-mini-qr-poster.png';
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    }

    trigger.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  initMiniProgramQrDialog();

  rawInput.addEventListener('paste', (event) => {
    const data = event.clipboardData;
    if (!data) return;
    const plainText = data.getData('text/plain');
    if (!plainText) return;
    const structuredGrid = extractClipboardTimetableGrid(data.getData('text/html'));
    event.preventDefault();
    const start = rawInput.selectionStart == null ? rawInput.value.length : rawInput.selectionStart;
    const end = rawInput.selectionEnd == null ? start : rawInput.selectionEnd;
    rawInput.setRangeText(plainText, start, end, 'end');
    clipboardGrid = structuredGrid;
    resetRecognition();
  });

  recognizeBtn.addEventListener('click', recognize);
  generateBtn.addEventListener('click', generateCode);
  copyBtn.addEventListener('click', copyCode);
  rawInput.addEventListener('input', () => {
    clipboardGrid = null;
    resetRecognition();
  });
  [semesterInput, firstWeekDateInput, totalWeeksInput].forEach((input) => input.addEventListener('input', resetGeneratedCode));
})();
