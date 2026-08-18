'use strict';

const assert = require('assert');
const path = require('path');
const parser = require('../assets/timetable-campus-parser.js');
const codec = require('../assets/timetable-codec.js');

function cell(name, schedule, teacher = '教师', room = '教室') {
  return `${name}<br>必修<br>${schedule}<br>${teacher}<br>${room}<br>无方向`;
}

function markdown(rows, tail = true) {
  const head = `| 时间 | 星期一 | 星期二 | 星期三 | 星期四 | 星期五 | 星期六 | 星期日 | |\n| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |`;
  const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
  const suffix = tail ? '\n| 实践课(或无上课时间)信息： |\n调、停（补）课信息：' : '';
  return `${head}\n${body}${suffix}`;
}

(function testNormalWeek() {
  const source = markdown([['上午', '第1节', cell('普通课程', '2节/周(1-16)'), '', '', '', '', '', '']]);
  const result = parser.parseCampusTimetable(source);
  assert.strictEqual(result.courses.length, 1);
  assert.deepStrictEqual(result.courses[0], {
    name: '普通课程', teacher: '教师', room: '教室', weekday: 1,
    startSection: 1, endSection: 2, startWeek: 1, endWeek: 16,
    weekType: 'all', colorIndex: 0
  });
})();

(function testOddEvenSameCellAndDynamicDuration() {
  const mixed = `${cell('单周课程', '3节/单周(1-15)', '甲老师', 'A101')}<br><br>${cell('双周课程', '2节/双周(2-16)', '乙老师', 'B202')}`;
  const source = markdown([['下午', '第3节', mixed, '', '', '', '', '', '']]);
  const result = parser.parseCampusTimetable(source);
  assert.strictEqual(result.courses.length, 2, '同一格两门课程必须拆成两条');
  assert.strictEqual(result.courses[0].weekType, 'odd');
  assert.strictEqual(result.courses[0].endSection, 5, '3 节课程应得到 3-5 节');
  assert.strictEqual(result.courses[1].weekType, 'even');
  assert.strictEqual(result.courses[1].endSection, 4);
})();

(function testSameNameDifferentTimesAreKept() {
  const source = markdown([
    ['上午', '第1节', cell('同名课程', '2节/周(1-16)', '老师', 'A101'), '', '', '', '', '', ''],
    ['', '第3节', '', cell('同名课程', '2节/周(1-16)', '老师', 'A101'), '', '', '', '', '']
  ]);
  const result = parser.parseCampusTimetable(source);
  assert.strictEqual(result.courses.length, 2, '同名课程不同时间不能按课程名去重');
  assert.strictEqual(result.meta.uniqueCourseCount, 1);
})();

(function testSundayAndNineTen() {
  const source = markdown([
    ['晚上', '第9节', '', '', '', '', '', '', cell('周日夜课', '2节/周(1-8)', '周老师', 'C303')]
  ]);
  const result = parser.parseCampusTimetable(source);
  assert.strictEqual(result.courses[0].weekday, 7, '星期日必须为 7');
  assert.strictEqual(result.courses[0].startSection, 9);
  assert.strictEqual(result.courses[0].endSection, 10);
})();

(function testPeriodColumnDoesNotShiftWeekday() {
  const friday = cell('星期五课程', '2节/周(1-16)', '老师', '教室');
  const source = markdown([['上午', '第1节', '', '', '', '', friday, '', '']]);
  const result = parser.parseCampusTimetable(source);
  assert.strictEqual(result.courses[0].weekday, 5, '时段列 + 节次列存在时星期五不能错位到星期六');
})();

(function testPracticeCourseIsWarnOnly() {
  const source = `${markdown([['晚上', '第9节', cell('正常课程', '2节/周(1-8)'), '', '', '', '', '', '']], false)}
| 实践课(或无上课时间)信息： |
| 课程名称 | 教师 | 学分 | 起止周 | 上课时间 | 上课地点 |
| 操作系统实践 | 关慧 | 2.0 | 01-16 | | |
调、停（补）课信息：`;
  const result = parser.parseCampusTimetable(source);
  assert.deepStrictEqual(result.meta.practiceNames, ['操作系统实践']);
  assert.ok(!result.courses.some((course) => course.name === '操作系统实践'), '无固定时间实践课不得加入正常周课表');
})();

(function testIncompleteClipboardGuard() {
  const source = markdown([['下午', '第5节', cell('截断课程', '2节/周(1-16)'), '', '', '', '', '', '']], false);
  const result = parser.parseCampusTimetable(source);
  assert.strictEqual(result.meta.sourceLikelyComplete, false, '明显没有复制到晚间课表末尾时应标记不完整');
})();

const REAL_SAMPLE = `| 时间 | 星期一 | 星期二 | 星期三 | 星期四 | 星期五 | 星期六 | 星期日 | |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 上午 | 第1节 |   |   |   |   | 数据库系统原理<br>必修<br>2节/双周(1-14)<br>张洋<br>瑞师楼(原3#教学楼)402<br>无方向<br> |   |   |
| 第3节 | 软件工程<br>必修<br>2节/周(1-16)<br>朱立军<br>瑞师楼(原3#教学楼)405<br>无方向<br> | 数据库系统原理<br>必修<br>2节/周(1-14)<br>张洋<br>景唐楼(原1#教学楼)503<br>无方向<br> | Web软件开发与设计<br>学选<br>2节/周(1-12)<br>赵振江<br>通明楼(原5#教学楼)201<br>无方向<br> | 算法设计与分析<br>专选<br>2节/周(1-16)<br>张雪<br>通明楼(原5#教学楼)203<br>无方向<br> | 计算机组成原理<br>必修<br>2节/单周(1-14)<br>徐森<br>瑞师楼(原3#教学楼)415<br>无方向<br><br><br>软件工程<br>必修<br>2节/双周(1-16)<br>朱立军<br>瑞师楼(原3#教学楼)107<br>无方向<br> |   |   |   |
| 下午 | 第5节 | 操作系统基础<br>必修<br>2节/周(1-16)<br>关慧<br>致本楼E座(原8#实验楼)514<br>无方向<br> | 计算机学科专业外语Ⅰ<br>必修<br>2节/周(1-16)<br>李艳荣<br>瑞师楼(原3#教学楼)313<br>无方向<br> |   | Oracle数据库<br>专选<br>2节/周(1-16)<br>曹克让<br>瑞师楼(原3#教学楼)406<br>无方向<br> | 毛泽东思想和中国特色社会主义理论体系概论Ⅱ<br>必修<br>2节/周(3-13)<br>郭苗苗<br>应星楼(原6#教学楼)204<br>无方向<br> |   | 习近平新时代中国特色社会主义思想概论<br>必修<br>2节/周(4-13)<br>郭苗苗<br>瑞师楼(原3#教学楼)124<br>无方向<br> |
| 第7节 | 计算机组成原理<br>必修<br>2节/周(1-14)<br>徐森<br>瑞师楼(原3#教学楼)202<br>无方向<br> | 毛泽东思想和中国特色社会主义理论体系概论Ⅱ<br>必修<br>2节/周(3-13)<br>郭苗苗<br>应星楼(原6#教学楼)204<br>无方向<br> |   |   |   |   | 习近平新时代中国特色社会主义思想概论<br>必修<br>2节/周(4-13)<br>郭苗苗<br>瑞师楼(原3#教学楼)124<br>无方向<br> |   |
| 晚上 | 第9节 |   | 形势与政策<br>必修<br>2节/周(9-12)<br>王贻楠<br>应星楼(原6#教学楼)403<br>无方向<br> |   |   |   |   |   |   |
| 实践课(或无上课时间)信息： |
| 课程名称 | 教师 | 学分 | 起止周 | 上课时间 | 上课地点 |
| 操作系统实践 | 关慧 | 2.0 | 01-16 | | |
调、停（补）课信息：`;

const real = parser.parseCampusTimetable(REAL_SAMPLE);
assert.strictEqual(real.courses.length, 16, '真实样例必须识别 16 个上课安排');
assert.strictEqual(real.meta.uniqueCourseCount, 11, '真实样例必须识别 11 门不同课程');
assert.strictEqual(real.meta.sourceLikelyComplete, true, '合并节次且已复制到实践/调停标记的完整课表应通过完整性检查');
assert.deepStrictEqual(real.meta.practiceNames, ['操作系统实践']);
assert.ok(real.courses.some((course) => course.name.includes('毛泽东思想和中国特色社会主义理论体系概论')),
  '毛概不得丢失');
assert.ok(real.courses.some((course) => course.name === '习近平新时代中国特色社会主义思想概论'),
  '习近平新时代中国特色社会主义思想概论不得丢失');
assert.ok(real.courses.some((course) => course.name === '形势与政策' && course.startSection === 9 && course.endSection === 10),
  '形势与政策 9-10 节不得丢失');
assert.ok(real.courses.some((course) => course.name === '计算机组成原理' && course.weekday === 1 && course.startSection === 7 && course.endSection === 8),
  '周一 7-8 节计算机组成原理不得丢失');
assert.ok(real.courses.some((course) => course.name === '数据库系统原理' && course.weekday === 5 && course.startSection === 1),
  '星期五 1-2 节数据库系统原理不能因时段列发生错位');
assert.strictEqual(real.courses.filter((course) => course.name === '习近平新时代中国特色社会主义思想概论' && course.weekday === 7).length, 2,
  '同名课程不同时间必须保留多条');


(function testClipboardHtmlGridKeepsWeekdayColumns() {
  const grid = [
    ['时间', '', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
    ['早晨', '', '', '', '', '', '', '', ''],
    ['上午', '第1节',
      cell('线性代数', '2节/周(1-18)', '苏牧羊', '通明楼(原5#教学楼)136'),
      `${cell('大学外语Ⅲ', '2节/单周(1-18)', '李辉', '碧帆楼108')}<br><br>${cell('大学外语Ⅲ', '2节/双周(1-18)', '李辉', '景唐楼(原1#教学楼)503')}`,
      cell('基础综合俄语Ⅲ', '2节/周(1-18)', '李晓丹', '景唐楼(原1#教学楼)321'),
      cell('俄语口语Ⅰ', '2节/周(1-18)', '外教2', '思远楼多功能教室1'),
      `${cell('创造性思维与创新方法', '2节/双周(1-5)', '张展', '瑞师楼(原3#教学楼)107')}<br><br>${cell('创造性思维与创新方法', '2节/单周(9-9)', '张展', '应星楼(原6#教学楼)502')}<br><br>${cell('创造性思维与创新方法', '2节/双周(7-8)', '张展', '瑞师楼(原3#教学楼)107')}`,
      '', ''],
    ['', '第2节', '', '', '', '', '', '', ''],
    ['', '第3节',
      cell('俄语听说Ⅲ', '2节/周(1-18)', '外教2', '思远楼多功能教室2'),
      cell('宏观经济学', '2节/周(1-16)', '石沂哲', '敬仲楼(原4#教学楼)120'),
      cell('大学外语Ⅲ', '2节/周(1-18)', '李辉', '景唐楼(原1#教学楼)503'),
      cell('基础综合俄语Ⅲ', '2节/周(1-18)', '李晓丹', '景唐楼(原1#教学楼)321'),
      '', '', ''],
    ['', '第4节', '', '', '', '', '', '', ''],
    ['下午', '第5节',
      cell('财经应用文写作', '2节/周(3-8)', '殷秀丽', '通明楼(原5#教学楼)338'),
      cell('形势与政策', '2节/周(9-12)', '薛孚', '应星楼(原6#教学楼)501'),
      cell('线性代数', '2节/周(6-9)', '苏牧羊', '通明楼(原5#教学楼)234'),
      cell('金融学', '2节/周(1-16)', '郭文超', '瑞师楼(原3#教学楼)109'),
      `${cell('金融学', '2节/单周(1-16)', '郭文超', '瑞师楼(原3#教学楼)207')}<br><br>${cell('宏观经济学', '2节/双周(1-16)', '石沂哲', '瑞师楼(原3#教学楼)405')}`,
      '', ''],
    ['', '第6节', '', '', '', '', '', '', ''],
    ['', '第7节', '', '', '', '', '', '', ''],
    ['', '第8节', '', '', '', '', '', '', ''],
    ['晚上', '第9节', '', '', '', '', '', '', ''],
    ['', '第10节', '', '', '', '', '', '', '']
  ];
  const source = '星期一 星期二 星期三 星期四 星期五 星期六 星期日 第1节 第3节 第5节 第7节 第9节 实践课(或无上课时间)信息：';
  const result = parser.parseCampusTimetableGrid(grid, source);
  assert.strictEqual(result.courses.length, 18, '该样例应识别 18 个上课安排');
  assert.strictEqual(result.meta.uniqueCourseCount, 10, '该样例应识别 10 门不同课程');
  assert.strictEqual(result.meta.oddCount, 3);
  assert.strictEqual(result.meta.evenCount, 4);
  assert.ok(result.courses.some((course) => course.name === '大学外语Ⅲ' && course.weekday === 2 && course.weekType === 'odd'), '星期二大学外语不能落到周一');
  assert.ok(result.courses.some((course) => course.name === '基础综合俄语Ⅲ' && course.weekday === 3 && course.startSection === 1), '星期三课程必须保留星期三');
  assert.ok(result.courses.some((course) => course.name === '俄语口语Ⅰ' && course.weekday === 4), '星期四课程必须保留星期四');
  assert.strictEqual(result.courses.filter((course) => course.name === '创造性思维与创新方法').every((course) => course.weekday === 5), true, '星期五同格多门安排必须全部保持星期五');
  assert.ok(result.courses.some((course) => course.name === '金融学' && course.weekday === 4 && course.weekType === 'all'), '星期四金融学不能落到周一');
  assert.ok(result.courses.some((course) => course.name === '金融学' && course.weekday === 5 && course.weekType === 'odd'), '星期五金融学不能落到周一');
})();

(function testTT2RoundTripAndMiniCompatibility() {
  const payload = {
    settings: {
      semester: '2026-2027 学年第1学期',
      firstWeekDate: '2026-09-07',
      totalWeeks: 20
    },
    courses: real.courses
  };
  const code = codec.encodeShareCode(payload);
  assert.ok(code.startsWith('SYUCT-TT2:'), '必须生成 SYUCT-TT2');
  assert.ok(/^SYUCT-TT2:[0-9a-f]{8}:/.test(code), 'checksum 必须为 8 位十六进制');
  const decoded = codec.decodeShareCode(code);
  assert.strictEqual(decoded.courses.length, 16);
  assert.strictEqual(decoded.settings.totalWeeks, 20);
  assert.strictEqual(decoded.settings.firstWeekDate, '2026-09-07');
  assert.strictEqual(decoded.courses[0].name, real.courses[0].name);

  let miniCompatibility = 'not-run';
  const miniCodecPath = process.env.SYUCT_MINI_CODEC;
  if (miniCodecPath) {
    const miniCodec = require(path.resolve(miniCodecPath));
    const miniDecoded = miniCodec.decodeShareCode(code);
    assert.strictEqual(miniDecoded.courses.length, 16, '当前 SYUCT-mini 解码器必须能解码 Web 生成的 TT2');
    assert.strictEqual(miniDecoded.settings.semester, payload.settings.semester);
    assert.strictEqual(miniDecoded.settings.firstWeekDate, payload.settings.firstWeekDate);
    assert.strictEqual(miniDecoded.settings.totalWeeks, 20);
    miniCompatibility = 'passed';
  }

  console.log(JSON.stringify({
    arrangements: real.courses.length,
    uniqueCourses: real.meta.uniqueCourseCount,
    odd: real.meta.oddCount,
    even: real.meta.evenCount,
    practice: real.meta.practiceNames,
    tt2Length: code.length,
    checksum: code.slice('SYUCT-TT2:'.length, 'SYUCT-TT2:'.length + 8),
    miniCompatibility
  }, null, 2));
})();

console.log('All timetable converter tests passed.');
