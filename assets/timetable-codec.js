(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SYUCTTimetableCodec = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PREFIX = 'SYUCT-TT2:';
  const MAX_CODE_LENGTH = 200000;
  const MAX_COURSES = 200;
  const WEEK_TYPE_TO_CODE = { all: '0', odd: '1', even: '2' };
  const CODE_TO_WEEK_TYPE = { '0': 'all', '1': 'odd', '2': 'even' };

  function compactText(value) {
    return String(value == null ? '' : value).replace(/[\r\n\t]+/g, ' ').trim();
  }

  function base36Digit(value) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0 || number > 35) throw new Error('课表码数值超出范围');
    return number.toString(36);
  }

  function packText(value) {
    const text = compactText(value);
    return `${text.length.toString(36)}:${text}`;
  }

  function checksum(text) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  function requireInteger(value, min, max, label) {
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) throw new Error(`${label}超出范围`);
    return number;
  }

  function normalizeCourse(course, index) {
    const value = course || {};
    const name = compactText(value.name);
    if (!name) throw new Error(`第 ${index + 1} 条上课安排缺少课程名称`);
    const weekday = requireInteger(value.weekday, 1, 7, `第 ${index + 1} 条上课安排星期`);
    const startSection = requireInteger(value.startSection, 1, 12, `第 ${index + 1} 条上课安排开始节次`);
    const endSection = requireInteger(value.endSection, 1, 12, `第 ${index + 1} 条上课安排结束节次`);
    if (endSection < startSection) throw new Error(`第 ${index + 1} 条上课安排节次无效`);
    const startWeek = requireInteger(value.startWeek, 1, 30, `第 ${index + 1} 条上课安排开始周`);
    const endWeek = requireInteger(value.endWeek, 1, 30, `第 ${index + 1} 条上课安排结束周`);
    if (endWeek < startWeek) throw new Error(`第 ${index + 1} 条上课安排周次无效`);
    if (!Object.prototype.hasOwnProperty.call(WEEK_TYPE_TO_CODE, value.weekType)) throw new Error(`第 ${index + 1} 条上课安排单双周规则无效`);
    const colorIndex = requireInteger(value.colorIndex, 0, 5, `第 ${index + 1} 条上课安排颜色`);
    return {
      name,
      teacher: compactText(value.teacher),
      room: compactText(value.room),
      weekday,
      startSection,
      endSection,
      startWeek,
      endWeek,
      weekType: value.weekType,
      colorIndex
    };
  }

  function encodeShareCode(payload) {
    const input = payload || {};
    const settings = input.settings || input;
    const semester = compactText(settings.semester);
    const firstWeekDate = compactText(settings.firstWeekDate);
    const totalWeeks = requireInteger(settings.totalWeeks, 1, 30, '学期总周数');
    const courses = Array.isArray(input.courses) ? input.courses : [];
    if (courses.length > MAX_COURSES) throw new Error('课程数量超过 200 条上限');

    let body = packText(semester);
    body += packText(firstWeekDate);
    body += base36Digit(totalWeeks);
    body += `${courses.length.toString(36)}:`;
    courses.forEach((rawCourse, index) => {
      const course = normalizeCourse(rawCourse, index);
      body += packText(course.name);
      body += packText(course.teacher);
      body += packText(course.room);
      body += base36Digit(course.weekday);
      body += base36Digit(course.startSection);
      body += base36Digit(course.endSection);
      body += base36Digit(course.startWeek);
      body += base36Digit(course.endWeek);
      body += WEEK_TYPE_TO_CODE[course.weekType];
      body += base36Digit(course.colorIndex);
    });

    const code = `${PREFIX}${checksum(body)}:${body}`;
    if (code.length > MAX_CODE_LENGTH) throw new Error('课表码过长');
    return code;
  }

  function readPackedText(source, cursor) {
    const colon = source.indexOf(':', cursor);
    if (colon < 0) throw new Error('课表码文本字段损坏');
    const lengthText = source.slice(cursor, colon);
    if (!/^[0-9a-z]+$/.test(lengthText)) throw new Error('课表码文本长度损坏');
    const length = parseInt(lengthText, 36);
    const start = colon + 1;
    const end = start + length;
    if (!Number.isFinite(length) || length < 0 || end > source.length) throw new Error('课表码文本字段不完整');
    return { value: source.slice(start, end), cursor: end };
  }

  function decodeShareCode(text) {
    const source = String(text == null ? '' : text).replace(/^\uFEFF/, '').trim();
    if (!source.startsWith(PREFIX)) throw new Error('不是 SYUCT-TT2 课表码');
    if (source.length > MAX_CODE_LENGTH) throw new Error('课表码过长');
    const rest = source.slice(PREFIX.length);
    const checksumEnd = rest.indexOf(':');
    if (checksumEnd !== 8) throw new Error('课表码校验值损坏');
    const expected = rest.slice(0, checksumEnd).toLowerCase();
    if (!/^[0-9a-f]{8}$/.test(expected)) throw new Error('课表码校验值损坏');
    const body = rest.slice(checksumEnd + 1);
    if (checksum(body) !== expected) throw new Error('课表码内容不完整或已被修改');

    let cursor = 0;
    const semesterPart = readPackedText(body, cursor);
    cursor = semesterPart.cursor;
    const firstWeekPart = readPackedText(body, cursor);
    cursor = firstWeekPart.cursor;
    if (cursor >= body.length) throw new Error('课表码学期字段不完整');
    const totalWeeks = parseInt(body.charAt(cursor), 36);
    cursor += 1;
    if (!Number.isFinite(totalWeeks) || totalWeeks < 1 || totalWeeks > 30) throw new Error('课表码学期周数无效');

    const countEnd = body.indexOf(':', cursor);
    if (countEnd < 0) throw new Error('课表码课程数量损坏');
    const countText = body.slice(cursor, countEnd);
    if (!/^[0-9a-z]+$/.test(countText)) throw new Error('课表码课程数量损坏');
    const count = parseInt(countText, 36);
    if (!Number.isFinite(count) || count < 0 || count > MAX_COURSES) throw new Error('课表码课程数量无效');
    cursor = countEnd + 1;

    const courses = [];
    for (let index = 0; index < count; index += 1) {
      const namePart = readPackedText(body, cursor); cursor = namePart.cursor;
      const teacherPart = readPackedText(body, cursor); cursor = teacherPart.cursor;
      const roomPart = readPackedText(body, cursor); cursor = roomPart.cursor;
      if (cursor + 7 > body.length) throw new Error('课表码课程字段不完整');
      const numeric = body.slice(cursor, cursor + 7);
      cursor += 7;
      const values = numeric.split('').map((char) => parseInt(char, 36));
      if (values.some((value) => !Number.isFinite(value))) throw new Error('课表码课程数值损坏');
      const weekTypeCode = numeric.charAt(5);
      if (!Object.prototype.hasOwnProperty.call(CODE_TO_WEEK_TYPE, weekTypeCode)) throw new Error('课表码周次规则无效');
      courses.push(normalizeCourse({
        name: namePart.value,
        teacher: teacherPart.value,
        room: roomPart.value,
        weekday: values[0],
        startSection: values[1],
        endSection: values[2],
        startWeek: values[3],
        endWeek: values[4],
        weekType: CODE_TO_WEEK_TYPE[weekTypeCode],
        colorIndex: values[6]
      }, index));
    }
    if (cursor !== body.length) throw new Error('课表码末尾存在异常内容');
    return {
      format: 'syuct-timetable',
      version: 1,
      semester: semesterPart.value,
      settings: {
        semester: semesterPart.value,
        firstWeekDate: firstWeekPart.value,
        totalWeeks
      },
      courses
    };
  }

  function isShareCode(text) {
    return String(text == null ? '' : text).replace(/^\uFEFF/, '').trim().startsWith(PREFIX);
  }

  return {
    PREFIX,
    checksum,
    packText,
    encodeShareCode,
    decodeShareCode,
    isShareCode
  };
});
