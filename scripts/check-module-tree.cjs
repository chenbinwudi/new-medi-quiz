const assert = require('assert');
const fs = require('fs');
const path = require('path');

const {
  primaryModules,
  defaultPrimaryId,
  getPrimaryModule,
  getSubjectsForPrimary,
  getAllSubjects,
  buildPracticeUrl
} = require('../miniprogram/data/module-tree');
const {
  buildSubjectProgress,
  decorateSubjectsWithProgress
} = require('../miniprogram/utils/module-progress');

const expectedModules = ['临床医学综合', '基础医学综合', '预防医学综合', '医学人文综合', '中医学基础', '实践综合'];
const expectedSubjects = {
  clinical: [
    '呼吸系统',
    '心血管系统',
    '消化系统',
    '泌尿系统，含男性生殖系统',
    '女性生殖系统',
    '血液系统',
    '代谢、内分泌系统',
    '精神、神经系统',
    '运动系统',
    '风湿免疫性疾病',
    '儿科疾病',
    '传染病、性传播疾病',
    '其他相关疾病 / 综合疾病'
  ],
  basic: ['解剖学', '生物化学', '生理学', '医学微生物学', '医学免疫学', '病理学', '病理生理学', '药理学'],
  preventive: ['预防医学总论', '流行病学', '卫生统计学', '公共卫生相关内容', '临床预防服务', '人群健康管理'],
  humanity: ['医学伦理学', '卫生法规', '医学心理学', '医患沟通'],
  'tcm-basic': ['中医学基本理论', '中医诊断基础', '中医治则治法', '常见中医基础知识'],
  practice: ['临床思维', '体格检查', '基本操作', '病史采集', '病例分析', '辅助检查结果判读']
};

assert.strictEqual(primaryModules.length, 6);
assert.deepStrictEqual(primaryModules.map((item) => item.title), expectedModules);
assert.strictEqual(primaryModules[0].primaryId, 'clinical');
assert.strictEqual(defaultPrimaryId, 'clinical');

const ids = new Set(primaryModules.map((item) => item.primaryId));
assert.strictEqual(ids.size, 6);

for (const module of primaryModules) {
  assert(module.primaryId);
  assert(module.title);
  assert(module.subtitle);
  assert(module.categoryId);
  assert(Array.isArray(module.subjects));
  assert.deepStrictEqual(module.subjects.map((item) => item.title), expectedSubjects[module.primaryId]);
  for (const subject of module.subjects) {
    assert(subject.subjectId);
    assert(subject.title);
    assert(subject.categoryId);
    assert(Number.isFinite(subject.total));
    assert(subject.total > 0);
  }
}

assert.strictEqual(getPrimaryModule('basic').title, '基础医学综合');
assert.strictEqual(getPrimaryModule('missing').primaryId, defaultPrimaryId);
assert.strictEqual(getAllSubjects().length, 41);
assert(getSubjectsForPrimary('clinical').some((item) => item.subjectId === 'respiratory-system'));
assert.strictEqual(
  buildPracticeUrl('clinical', getSubjectsForPrimary('clinical')[0]),
  '/pages/practice/practice?source=chapter&primaryId=clinical&subjectId=respiratory-system&categoryId=clinical'
);

const clinicalSubject = getSubjectsForPrimary('clinical')[0];
const records = [
  { questionId: 'q1', categoryId: 'clinical', subjectId: clinicalSubject.subjectId, isCorrect: true },
  { questionId: 'q2', categoryId: 'clinical', subjectId: clinicalSubject.subjectId, isCorrect: false },
  { questionId: 'q2', categoryId: 'clinical', subjectId: clinicalSubject.subjectId, isCorrect: true },
  { questionId: 'legacy', categoryId: 'clinical', isCorrect: true }
];

const progress = buildSubjectProgress(clinicalSubject, records);
assert.strictEqual(progress.done, 2);
assert.strictEqual(progress.correct, 1);
assert.strictEqual(progress.progress, Math.round((2 / clinicalSubject.total) * 100));
assert.strictEqual(progress.accuracy, 50);
assert.strictEqual(progress.progressText, `2/${clinicalSubject.total}`);
assert.strictEqual(progress.accuracyText, '50%');
assert.strictEqual(progress.statusText, '继续练习');

const decorated = decorateSubjectsWithProgress(getSubjectsForPrimary('clinical'), records);
assert.strictEqual(decorated[0].done, 2);
assert.strictEqual(decorated[1].accuracyText, '0%');

const homeJs = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/home/home.js'), 'utf8');
const homeWxml = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/home/home.wxml'), 'utf8');
assert(homeJs.includes("require('../../data/module-tree')"));
assert(homeJs.includes('selectedPrimaryId'));
assert(homeJs.includes('selectPrimary'));
assert(homeJs.includes('goSelectedBank'));
assert(homeWxml.includes('选择备考模块'));
assert(homeWxml.includes('primaryModules'));
assert(homeWxml.includes('进入题库'));
assert(homeWxml.includes('{{selectedPrimary.title}} · {{selectedPrimary.subtitle}}'));
assert(!homeWxml.includes('search-row'));
assert(!homeWxml.includes('shortcut-grid'));

const bankJs = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/bank/bank.js'), 'utf8');
const bankWxml = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/bank/bank.wxml'), 'utf8');
assert(bankJs.includes("require('../../data/module-tree')"));
assert(bankJs.includes('selectedPrimaryId'));
assert(bankJs.includes('subjects'));
assert(bankJs.includes('selectPrimary'));
assert(bankJs.includes('goSubjectPractice'));
assert(bankJs.includes('onShow()'));
assert(bankWxml.includes('二级学科'));
assert(bankWxml.includes('accuracyText'));
assert(bankWxml.includes('progressText'));
assert(bankWxml.includes('{{selectedPrimary.title}} · {{selectedPrimary.subtitle}}'));
assert(!bankWxml.includes('bank-search'));

const practiceJs = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/practice/practice.js'), 'utf8');
assert(practiceJs.includes('sourceOptions'));
assert(practiceJs.includes('getPracticeSession(this.data.sourceOptions)'));
assert(practiceJs.includes('subjectId: current.subjectId'));

console.log('module tree checks ok');
