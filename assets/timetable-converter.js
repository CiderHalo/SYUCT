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
      const result = parser.parseCampusTimetable(rawInput.value);
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

  recognizeBtn.addEventListener('click', recognize);
  generateBtn.addEventListener('click', generateCode);
  copyBtn.addEventListener('click', copyCode);
  rawInput.addEventListener('input', resetRecognition);
  [semesterInput, firstWeekDateInput, totalWeeksInput].forEach((input) => input.addEventListener('input', resetGeneratedCode));
})();
