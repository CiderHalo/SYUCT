(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SYUCTTimetableParser = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_COURSES = 200;

  function cleanText(value) {
    return String(value == null ? '' : value)
      .replace(/&nbsp;|&#160;/gi, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\r/g, '')
      .replace(/[ \f\v]+/g, ' ')
      .trim();
  }

  function cleanInline(value) {
    return cleanText(value).replace(/\s*\n\s*/g, ' ').trim();
  }

  function parseScheduleLine(value) {
    const text = cleanInline(value);
    const match = /^(\d{1,2})\s*节\s*[\/／]\s*(单周|双周|周)\s*[（(]\s*(\d{1,2})\s*[-~～—–至到]\s*(\d{1,2})\s*[）)]/.exec(text);
    if (!match) return null;
    const duration = Number(match[1]);
    const startWeek = Number(match[3]);
    const endWeek = Number(match[4]);
    if (!Number.isInteger(duration) || duration < 1 || duration > 12) return null;
    if (!Number.isInteger(startWeek) || !Number.isInteger(endWeek) || startWeek < 1 || endWeek < startWeek || endWeek > 30) return null;
    return {
      duration,
      startWeek,
      endWeek,
      weekType: match[2] === '单周' ? 'odd' : (match[2] === '双周' ? 'even' : 'all')
    };
  }

  function isCourseNature(value) {
    const text = cleanInline(value);
    return /^(必修|选修|学选|专选|公选|任选|限选|校选|通选|专业选修|学科选修|公共选修|实践|实践必修|实践选修)$/.test(text);
  }

  function isDirectionLabel(value) {
    return /^无方向$/.test(cleanInline(value));
  }

  function parseCourseCell(cellText, weekday, startSection, colorSeed) {
    const text = cleanText(cellText);
    if (!text) return [];
    const lines = text.split(/\n+/).map((line) => cleanInline(line)).filter(Boolean);
    const courses = [];

    for (let index = 0; index < lines.length; index += 1) {
      const schedule = parseScheduleLine(lines[index]);
      if (!schedule) continue;

      let nameIndex = index - 1;
      if (nameIndex >= 0 && isCourseNature(lines[nameIndex])) nameIndex -= 1;
      while (nameIndex >= 0 && (isCourseNature(lines[nameIndex]) || isDirectionLabel(lines[nameIndex]))) nameIndex -= 1;
      if (nameIndex < 0) continue;

      const name = cleanInline(lines[nameIndex]);
      if (!name || parseScheduleLine(name)) continue;

      const teacher = cleanInline(lines[index + 1] || '');
      const room = cleanInline(lines[index + 2] || '');
      const endSection = startSection + schedule.duration - 1;
      if (weekday < 1 || weekday > 7 || startSection < 1 || startSection > 12 || endSection < startSection || endSection > 12) continue;

      courses.push({
        name,
        teacher: isDirectionLabel(teacher) ? '' : teacher,
        room: isDirectionLabel(room) ? '' : room,
        weekday,
        startSection,
        endSection,
        startWeek: schedule.startWeek,
        endWeek: schedule.endWeek,
        weekType: schedule.weekType,
        colorIndex: (colorSeed + courses.length) % 6
      });
    }

    return courses;
  }

  function splitMarkdownRow(line) {
    let text = String(line || '').trim();
    if (!text.startsWith('|')) return [];
    if (text.endsWith('|')) text = text.slice(0, -1);
    return text.slice(1).split('|').map((cell) => cell.trim());
  }

  function isMarkdownSeparatorRow(cells) {
    return cells.length && cells.every((cell) => !cell || /^:?-{2,}:?$/.test(cell.replace(/\s+/g, '')));
  }

  function parseMarkdownCourses(source) {
    const rows = String(source || '').replace(/\r/g, '').split('\n');
    const courses = [];
    rows.forEach((line) => {
      const cells = splitMarkdownRow(line);
      if (!cells.length || isMarkdownSeparatorRow(cells)) return;
      const sectionIndex = cells.findIndex((cell) => /^第\s*\d{1,2}\s*节$/.test(cleanInline(cell)));
      if (sectionIndex < 0) return;
      const sectionMatch = /第\s*(\d{1,2})\s*节/.exec(cleanInline(cells[sectionIndex]));
      if (!sectionMatch) return;
      const startSection = Number(sectionMatch[1]);
      for (let weekday = 1; weekday <= 7; weekday += 1) {
        const cell = cells[sectionIndex + weekday] || '';
        const parsed = parseCourseCell(cell, weekday, startSection, courses.length);
        parsed.forEach((course) => courses.push(course));
        if (courses.length > MAX_COURSES) throw new Error('识别到的课程过多，请检查复制内容');
      }
    });
    return courses;
  }

  function findTsvSectionChunks(source) {
    const text = String(source || '').replace(/\r/g, '');
    const pattern = /(?:^|\n)(?:(?:早晨|上午|下午|晚上)\t)?第\s*(\d{1,2})\s*节\t/g;
    const matches = [];
    let match;
    while ((match = pattern.exec(text))) {
      matches.push({
        start: match.index + (match[0].charAt(0) === '\n' ? 1 : 0),
        contentStart: pattern.lastIndex,
        startSection: Number(match[1])
      });
    }
    return matches.map((item, index) => ({
      startSection: item.startSection,
      content: text.slice(item.contentStart, index + 1 < matches.length ? matches[index + 1].start : text.length)
    }));
  }

  function parseTsvCourses(source) {
    const courses = [];
    const chunks = findTsvSectionChunks(source);
    chunks.forEach((chunk) => {
      const cells = chunk.content.replace(/\n+$/, '').split('\t');
      for (let weekday = 1; weekday <= 7; weekday += 1) {
        const cell = cells[weekday - 1] || '';
        const parsed = parseCourseCell(cell, weekday, chunk.startSection, courses.length);
        parsed.forEach((course) => courses.push(course));
        if (courses.length > MAX_COURSES) throw new Error('识别到的课程过多，请检查复制内容');
      }
    });
    return courses;
  }

  function courseSignature(course) {
    return [
      course.name,
      course.teacher,
      course.room,
      course.weekday,
      course.startSection,
      course.endSection,
      course.startWeek,
      course.endWeek,
      course.weekType
    ].join('|').toLowerCase();
  }

  function dedupeCourses(courses) {
    const seen = new Set();
    const result = [];
    (courses || []).forEach((course) => {
      const signature = courseSignature(course);
      if (seen.has(signature)) return;
      seen.add(signature);
      result.push(Object.assign({}, course, { colorIndex: result.length % 6 }));
    });
    return result;
  }


  function parseCampusTimetableGrid(grid, sourceText) {
    const rows = Array.isArray(grid) ? grid : [];
    const weekdayByLabel = {
      '星期一': 1,
      '星期二': 2,
      '星期三': 3,
      '星期四': 4,
      '星期五': 5,
      '星期六': 6,
      '星期日': 7
    };
    let headerIndex = -1;
    let weekdayColumns = {};

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];
      const found = {};
      row.forEach((cell, columnIndex) => {
        const weekday = weekdayByLabel[cleanInline(cell)];
        if (weekday) found[weekday] = columnIndex;
      });
      if (Object.keys(found).length >= 5 && found[1] != null && found[5] != null) {
        headerIndex = rowIndex;
        weekdayColumns = found;
        break;
      }
    }

    if (headerIndex < 0) throw new Error('没有识别到课表的星期表头，请重新复制完整课表');

    const courses = [];
    for (let rowIndex = headerIndex + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];
      const sectionIndex = row.findIndex((cell) => /^第\s*\d{1,2}\s*节$/.test(cleanInline(cell)));
      if (sectionIndex < 0) continue;
      const sectionMatch = /第\s*(\d{1,2})\s*节/.exec(cleanInline(row[sectionIndex]));
      if (!sectionMatch) continue;
      const startSection = Number(sectionMatch[1]);

      for (let weekday = 1; weekday <= 7; weekday += 1) {
        const columnIndex = weekdayColumns[weekday];
        if (columnIndex == null) continue;
        const cell = row[columnIndex] || '';
        const parsed = parseCourseCell(cell, weekday, startSection, courses.length);
        parsed.forEach((course) => courses.push(course));
        if (courses.length > MAX_COURSES) throw new Error('识别到的课程过多，请检查复制内容');
      }
    }

    const normalizedCourses = dedupeCourses(courses);
    if (!normalizedCourses.length) throw new Error('没有识别到上课安排，请重新选择课表表格后复制');
    const source = String(sourceText == null ? '' : sourceText).replace(/^\uFEFF/, '').trim();
    const sourceInfo = inspectCampusTimetableSource(source);
    const uniqueCourseNames = Array.from(new Set(normalizedCourses.map((course) => course.name)));
    const practiceNames = extractPracticeNames(source);
    return {
      courses: normalizedCourses,
      meta: {
        arrangementCount: normalizedCourses.length,
        uniqueCourseCount: uniqueCourseNames.length,
        oddCount: normalizedCourses.filter((course) => course.weekType === 'odd').length,
        evenCount: normalizedCourses.filter((course) => course.weekType === 'even').length,
        practiceNames,
        maxEndWeek: normalizedCourses.reduce((max, course) => Math.max(max, course.endWeek), 0),
        sourceFormat: 'clipboard-html',
        sourceLength: sourceInfo.sourceLength,
        sourceLikelyComplete: sourceInfo.likelyComplete,
        scheduleMarkerCount: sourceInfo.scheduleMarkerCount
      }
    };
  }

  function extractPracticeNames(source) {
    const text = String(source || '').replace(/\r/g, '');
    const markerMatch = /实践课\s*[（(]或无上课时间[）)]信息/.exec(text);
    if (!markerMatch) return [];
    const markerIndex = markerMatch.index;
    const endCandidates = ['调、停（补）课信息', '调、停(补)课信息', '调停（补）课信息'];
    let endIndex = text.length;
    endCandidates.forEach((marker) => {
      const found = text.indexOf(marker, markerIndex + 1);
      if (found >= 0 && found < endIndex) endIndex = found;
    });
    const section = text.slice(markerIndex, endIndex);
    const names = [];

    section.split('\n').forEach((line) => {
      const cells = line.trim().startsWith('|') ? splitMarkdownRow(line) : line.split('\t').map((cell) => cell.trim());
      if (!cells.length) return;
      const first = cleanInline(cells[0]);
      if (!first || first === '课程名称' || /实践课\s*[（(]或无上课时间[）)]信息/.test(first) || /^:?-+/.test(first)) return;
      const hasWeekRange = cells.some((cell) => /^0?\d{1,2}\s*[-~～—–至到]\s*0?\d{1,2}$/.test(cleanInline(cell)));
      if (hasWeekRange && !names.includes(first)) names.push(first);
    });
    return names;
  }

  function inspectCampusTimetableSource(text) {
    const source = String(text == null ? '' : text).replace(/^\uFEFF/, '').trim();
    const hasSection9 = /第\s*9\s*节/.test(source);
    const hasSection10 = /第\s*10\s*节/.test(source);
    const hasTailMarker = /实践课\s*[（(]或无上课时间[）)]信息|调、停[（(]补[）)]课信息/.test(source);
    const scheduleMarkerCount = (source.match(/\d{1,2}\s*节\s*[\/／]\s*(?:单周|双周|周)\s*[（(]\s*\d{1,2}\s*[-~～—–至到]\s*\d{1,2}\s*[）)]/g) || []).length;
    return {
      sourceLength: source.length,
      hasSection9,
      hasSection10,
      hasTailMarker,
      scheduleMarkerCount,
      // 校园网页可能把 9-10 节合并为“第9节”一行；出现尾部实践/调停课标记也可证明复制到了表尾。
      likelyComplete: hasSection9 && (hasSection10 || hasTailMarker)
    };
  }

  function parseCampusTimetable(text) {
    const source = String(text == null ? '' : text).replace(/^\uFEFF/, '').trim();
    const sourceInfo = inspectCampusTimetableSource(source);
    if (!source) throw new Error('没有可识别的课表内容');
    if (!/星期一/.test(source) || !/星期[五六日]/.test(source) || !/第\s*\d{1,2}\s*节/.test(source)) {
      throw new Error('未识别到校园网页完整课表，请在电脑校园网页中选择整个课表后重新复制');
    }

    const markdownCourses = source.includes('|') ? parseMarkdownCourses(source) : [];
    const tsvCourses = source.includes('\t') ? parseTsvCourses(source) : [];
    let courses = markdownCourses.length >= tsvCourses.length ? markdownCourses : tsvCourses;
    courses = dedupeCourses(courses);
    if (!courses.length) throw new Error('没有识别到上课安排，请重新选择课表表格后复制');
    if (courses.length > MAX_COURSES) throw new Error('识别到的课程过多，请检查复制内容');

    const uniqueCourseNames = Array.from(new Set(courses.map((course) => course.name)));
    const practiceNames = extractPracticeNames(source);
    return {
      courses,
      meta: {
        arrangementCount: courses.length,
        uniqueCourseCount: uniqueCourseNames.length,
        oddCount: courses.filter((course) => course.weekType === 'odd').length,
        evenCount: courses.filter((course) => course.weekType === 'even').length,
        practiceNames,
        maxEndWeek: courses.reduce((max, course) => Math.max(max, course.endWeek), 0),
        sourceFormat: markdownCourses.length >= tsvCourses.length ? 'table' : 'clipboard',
        sourceLength: sourceInfo.sourceLength,
        sourceLikelyComplete: sourceInfo.likelyComplete,
        scheduleMarkerCount: sourceInfo.scheduleMarkerCount
      }
    };
  }

  return {
    parseCampusTimetable,
    parseCampusTimetableGrid,
    inspectCampusTimetableSource
  };
});
