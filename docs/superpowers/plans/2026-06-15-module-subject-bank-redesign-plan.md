# Module Subject Bank Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the mini program so the home page selects one of six primary medical modules and the bank page shows that module's second-level subjects with progress and accuracy.

**Architecture:** Add a focused front-end configuration module for the primary-module tree, plus a small progress aggregation helper that reads existing study records. Home and bank pages consume these helpers while preserving current routes, cloud service calls, skeleton/error/empty/loadingMore states, and practice navigation.

**Tech Stack:** Native WeChat Mini Program WXML/WXSS/JS, CommonJS modules, existing cloud/local study services, existing lightweight check scripts.

---

## File Structure

- Create `miniprogram/data/module-tree.js`: canonical front-end configuration for six primary modules and placeholder second-level subjects.
- Create `miniprogram/utils/module-progress.js`: pure helper functions to select modules, flatten subjects, and calculate subject progress/accuracy from answer records.
- Create `scripts/check-module-tree.cjs`: Node check covering module tree shape, six-module invariant, subject stats, and route parameter mapping.
- Modify `miniprogram/pages/home/home.js`: load module tree, selected primary module, save selection, navigate to bank with `primaryId`.
- Modify `miniprogram/pages/home/home.wxml`: render six module cards, selected summary, and explicit “进入题库” action using existing state components.
- Modify `miniprogram/pages/home/home.wxss`: module-card layout, active state, progress summary, keeping existing icon sizes and `tap-card` feedback.
- Modify `miniprogram/pages/bank/bank.js`: read `primaryId`, show subject list for selected module, calculate `done/progress/accuracy`, navigate to practice with `primaryId/subjectId/categoryId`.
- Modify `miniprogram/pages/bank/bank.wxml`: render module selector and subject cards under chapter tab, preserve real/mock/memory tabs and state components.
- Modify `miniprogram/pages/bank/bank.wxss`: subject-card layout with progress bar and accuracy badge.
- Modify `miniprogram/pages/practice/practice.js`: retain existing behavior while accepting `primaryId` and `subjectId` parameters for compatibility.
- Modify `scripts/check-mvp-flow.cjs` and/or `scripts/check-production-flow.cjs`: add assertions for new route parameters if existing checks cover page navigation.

## Task 1: Module Tree Configuration

**Files:**
- Create: `miniprogram/data/module-tree.js`
- Create: `scripts/check-module-tree.cjs`

- [ ] **Step 1: Write the failing module tree check**

Create `scripts/check-module-tree.cjs`:

```js
const assert = require('assert');

const {
  primaryModules,
  defaultPrimaryId,
  getPrimaryModule,
  getSubjectsForPrimary,
  buildPracticeUrl
} = require('../miniprogram/data/module-tree');

assert.strictEqual(primaryModules.length, 6);
assert.deepStrictEqual(
  primaryModules.map((item) => item.title),
  ['医学人文综合', '基础医学综合', '预防医学综合', '临床医学综合', '中医学基础', '实践综合']
);

const ids = new Set(primaryModules.map((item) => item.primaryId));
assert.strictEqual(ids.size, 6);
assert.strictEqual(defaultPrimaryId, 'clinical');

for (const module of primaryModules) {
  assert(module.primaryId);
  assert(module.title);
  assert(module.subtitle);
  assert(module.categoryId);
  assert(Array.isArray(module.subjects));
  assert(module.subjects.length >= 2);
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
assert(getSubjectsForPrimary('clinical').some((item) => item.subjectId === 'internal-medicine'));
assert.strictEqual(
  buildPracticeUrl('clinical', getSubjectsForPrimary('clinical')[0]),
  '/pages/practice/practice?source=chapter&primaryId=clinical&subjectId=internal-medicine&categoryId=clinical'
);

console.log('module tree checks ok');
```

- [ ] **Step 2: Run the check and verify RED**

Run: `node scripts/check-module-tree.cjs`

Expected: FAIL with `Cannot find module '../miniprogram/data/module-tree'`.

- [ ] **Step 3: Implement `module-tree.js`**

Create `miniprogram/data/module-tree.js`:

```js
const defaultPrimaryId = 'clinical';
const selectedPrimaryStorageKey = 'selectedPrimaryId';

const primaryModules = [
  {
    primaryId: 'humanity',
    title: '医学人文综合',
    subtitle: '法规、伦理、心理与沟通',
    icon: '/assets/icons/book.svg',
    color: 'purple',
    categoryId: 'humanity',
    subjects: [
      { subjectId: 'medical-ethics', title: '医学伦理学', categoryId: 'humanity', total: 40 },
      { subjectId: 'health-law', title: '卫生法规', categoryId: 'humanity', total: 40 },
      { subjectId: 'medical-psychology', title: '医学心理学', categoryId: 'humanity', total: 40 },
      { subjectId: 'doctor-patient-communication', title: '医患沟通', categoryId: 'humanity', total: 40 }
    ]
  },
  {
    primaryId: 'basic',
    title: '基础医学综合',
    subtitle: '生理、病理、药理与免疫',
    icon: '/assets/icons/summary.svg',
    color: 'blue',
    categoryId: 'basic',
    subjects: [
      { subjectId: 'physiology', title: '生理学', categoryId: 'basic', total: 50 },
      { subjectId: 'pathology', title: '病理学', categoryId: 'basic', total: 50 },
      { subjectId: 'pharmacology', title: '药理学', categoryId: 'basic', total: 50 },
      { subjectId: 'immunology', title: '医学免疫学', categoryId: 'basic', total: 40 }
    ]
  },
  {
    primaryId: 'preventive',
    title: '预防医学综合',
    subtitle: '流行病、统计、公卫与预防',
    icon: '/assets/icons/analysis.svg',
    color: 'green',
    categoryId: 'preventive',
    subjects: [
      { subjectId: 'epidemiology', title: '流行病学', categoryId: 'preventive', total: 45 },
      { subjectId: 'statistics', title: '医学统计学', categoryId: 'preventive', total: 45 },
      { subjectId: 'public-health', title: '公共卫生', categoryId: 'preventive', total: 45 },
      { subjectId: 'prevention', title: '疾病预防控制', categoryId: 'preventive', total: 45 }
    ]
  },
  {
    primaryId: 'clinical',
    title: '临床医学综合',
    subtitle: '内外妇儿与临床综合',
    icon: '/assets/icons/chapter.svg',
    color: 'orange',
    categoryId: 'clinical',
    subjects: [
      { subjectId: 'internal-medicine', title: '内科学', categoryId: 'clinical', total: 80 },
      { subjectId: 'surgery', title: '外科学', categoryId: 'clinical', total: 80 },
      { subjectId: 'obstetrics-gynecology', title: '妇产科学', categoryId: 'clinical', total: 60 },
      { subjectId: 'pediatrics', title: '儿科学', categoryId: 'clinical', total: 60 },
      { subjectId: 'neurology', title: '神经精神系统', categoryId: 'clinical', total: 50 }
    ]
  },
  {
    primaryId: 'tcm-basic',
    title: '中医学基础',
    subtitle: '中基、中诊、中药与方剂',
    icon: '/assets/icons/mindmap.svg',
    color: 'teal',
    categoryId: 'tcm-basic',
    subjects: [
      { subjectId: 'tcm-theory', title: '中医基础理论', categoryId: 'tcm-basic', total: 45 },
      { subjectId: 'tcm-diagnostics', title: '中医诊断学', categoryId: 'tcm-basic', total: 45 },
      { subjectId: 'chinese-materia-medica', title: '中药学', categoryId: 'tcm-basic', total: 45 },
      { subjectId: 'prescriptions', title: '方剂学', categoryId: 'tcm-basic', total: 45 }
    ]
  },
  {
    primaryId: 'practice',
    title: '实践综合',
    subtitle: '病例、技能与综合应用',
    icon: '/assets/icons/mock-paper.svg',
    color: 'red',
    categoryId: 'clinical',
    subjects: [
      { subjectId: 'case-analysis', title: '病例分析', categoryId: 'clinical', total: 60 },
      { subjectId: 'clinical-skills', title: '临床技能', categoryId: 'clinical', total: 60 },
      { subjectId: 'diagnosis-treatment', title: '诊疗思维', categoryId: 'clinical', total: 60 },
      { subjectId: 'integrated-practice', title: '综合实践', categoryId: 'clinical', total: 60 }
    ]
  }
];

function getPrimaryModule(primaryId) {
  return primaryModules.find((item) => item.primaryId === primaryId)
    || primaryModules.find((item) => item.primaryId === defaultPrimaryId)
    || primaryModules[0];
}

function getSubjectsForPrimary(primaryId) {
  return getPrimaryModule(primaryId).subjects;
}

function buildPracticeUrl(primaryId, subject) {
  return `/pages/practice/practice?source=chapter&primaryId=${primaryId}&subjectId=${subject.subjectId}&categoryId=${subject.categoryId}`;
}

module.exports = {
  primaryModules,
  defaultPrimaryId,
  selectedPrimaryStorageKey,
  getPrimaryModule,
  getSubjectsForPrimary,
  buildPracticeUrl
};
```

- [ ] **Step 4: Run the check and verify GREEN**

Run: `node scripts/check-module-tree.cjs`

Expected: `module tree checks ok`.

## Task 2: Progress Aggregation Helper

**Files:**
- Create: `miniprogram/utils/module-progress.js`
- Modify: `scripts/check-module-tree.cjs`

- [ ] **Step 1: Extend the failing check with progress assertions**

Append to `scripts/check-module-tree.cjs`:

```js
const {
  buildSubjectProgress,
  decorateSubjectsWithProgress
} = require('../miniprogram/utils/module-progress');

const clinicalSubject = getSubjectsForPrimary('clinical')[0];
const records = [
  { questionId: 'q1', categoryId: 'clinical', subjectId: clinicalSubject.subjectId, isCorrect: true },
  { questionId: 'q2', categoryId: 'clinical', subjectId: clinicalSubject.subjectId, isCorrect: false },
  { questionId: 'q2', categoryId: 'clinical', subjectId: clinicalSubject.subjectId, isCorrect: true }
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
```

- [ ] **Step 2: Run the check and verify RED**

Run: `node scripts/check-module-tree.cjs`

Expected: FAIL with `Cannot find module '../miniprogram/utils/module-progress'`.

- [ ] **Step 3: Implement `module-progress.js`**

Create `miniprogram/utils/module-progress.js`:

```js
function uniqueAnsweredRecords(records, subject) {
  const seen = {};
  return (records || []).filter((record) => {
    const matchesSubject = record.subjectId
      ? record.subjectId === subject.subjectId
      : record.categoryId === subject.categoryId;
    if (!matchesSubject || !record.questionId || seen[record.questionId]) return false;
    seen[record.questionId] = true;
    return true;
  });
}

function buildSubjectProgress(subject, records) {
  const answered = uniqueAnsweredRecords(records, subject);
  const done = answered.length;
  const correct = answered.filter((record) => !!record.isCorrect).length;
  const total = subject.total || 0;
  const progress = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const accuracy = done ? Math.round((correct / done) * 100) : 0;
  return {
    ...subject,
    done,
    correct,
    progress,
    accuracy,
    progressText: `${done}/${total}`,
    accuracyText: `${accuracy}%`,
    progressStyle: `width: ${progress}%;`,
    statusText: done ? '继续练习' : '开始练习'
  };
}

function decorateSubjectsWithProgress(subjects, records) {
  return (subjects || []).map((subject) => buildSubjectProgress(subject, records));
}

module.exports = {
  buildSubjectProgress,
  decorateSubjectsWithProgress
};
```

- [ ] **Step 4: Run the check and verify GREEN**

Run: `node scripts/check-module-tree.cjs`

Expected: `module tree checks ok`.

## Task 3: Home Page Primary Module Selection

**Files:**
- Modify: `miniprogram/pages/home/home.js`
- Modify: `miniprogram/pages/home/home.wxml`
- Modify: `miniprogram/pages/home/home.wxss`

- [ ] **Step 1: Add home behavior assertions to `scripts/check-module-tree.cjs`**

Append:

```js
const homeJs = require('fs').readFileSync(require('path').join(__dirname, '../miniprogram/pages/home/home.js'), 'utf8');
const homeWxml = require('fs').readFileSync(require('path').join(__dirname, '../miniprogram/pages/home/home.wxml'), 'utf8');

assert(homeJs.includes("require('../../data/module-tree')"));
assert(homeJs.includes('selectedPrimaryId'));
assert(homeJs.includes('selectPrimary'));
assert(homeJs.includes('goSelectedBank'));
assert(homeWxml.includes('选择备考模块'));
assert(homeWxml.includes('primaryModules'));
assert(homeWxml.includes('进入题库'));
```

- [ ] **Step 2: Run check and verify RED**

Run: `node scripts/check-module-tree.cjs`

Expected: FAIL because home page does not yet import or render module tree.

- [ ] **Step 3: Update `home.js`**

Modify `home.js` to:

```js
const { daysUntil } = require('../../utils/date');
const { getHomeData, getStudyData } = require('../../services/study');
const { homeShortcuts, tabPages } = require('../../data/cloud-contracts');
const seed = require('../../data/cloud-seed');
const {
  primaryModules,
  defaultPrimaryId,
  selectedPrimaryStorageKey,
  getPrimaryModule
} = require('../../data/module-tree');
const { decorateSubjectsWithProgress } = require('../../utils/module-progress');

function mapExam(item) {
  return {
    id: item.categoryId,
    name: item.title,
    fullName: `${item.title} · 医学综合`,
    examDate: '2026-08-23'
  };
}

function mapMaterial(item) {
  return {
    ...item,
    id: item.materialId || item.id,
    summary: item.intro || item.summary || '',
    updatedAt: item.updatedAtText || '2026-06-12'
  };
}

function decoratePrimaryModules(selectedPrimaryId, records) {
  return primaryModules.map((module) => {
    const subjects = decorateSubjectsWithProgress(module.subjects, records);
    const done = subjects.reduce((sum, item) => sum + item.done, 0);
    const total = subjects.reduce((sum, item) => sum + item.total, 0);
    const correct = subjects.reduce((sum, item) => sum + item.correct, 0);
    const progress = total ? Math.round((done / total) * 100) : 0;
    const accuracy = done ? Math.round((correct / done) * 100) : 0;
    return {
      ...module,
      activeClass: module.primaryId === selectedPrimaryId ? 'active' : '',
      done,
      total,
      progress,
      accuracyText: `${accuracy}%`,
      progressText: `${done}/${total}`,
      progressStyle: `width: ${progress}%;`
    };
  });
}

Page({
  data: {
    exam: mapExam(seed.categories[0]),
    examIndex: 0,
    examOptions: seed.categories.map((item) => item.title),
    daysLeft: 0,
    selectedPrimaryId: defaultPrimaryId,
    selectedPrimary: getPrimaryModule(defaultPrimaryId),
    primaryModules: decoratePrimaryModules(defaultPrimaryId, []),
    stats: { questionCount: '30', doneCount: '25', accuracy: '83%' },
    shortcuts: homeShortcuts.map((item) => ({
      label: item.title,
      url: item.route,
      icon: `/assets/icons/${item.icon}.svg`,
      tone: item.color
    })),
    materials: seed.materials.slice(0, 2).map(mapMaterial),
    loading: true,
    refreshing: false,
    error: false,
    moreStatus: 'noMore'
  },

  onLoad() {
    const selectedPrimaryId = wx.getStorageSync(selectedPrimaryStorageKey) || defaultPrimaryId;
    this.setData({
      selectedPrimaryId,
      selectedPrimary: getPrimaryModule(selectedPrimaryId)
    });
    this.loadHomeData();
  },

  loadHomeData() {
    this.setData({ loading: !this.data.refreshing, error: false });
    Promise.all([getHomeData(), getStudyData('answers').catch(() => ({ answerRecords: [] }))]).then(([data, study]) => {
      const exams = (data.exams && data.exams.length ? data.exams : seed.categories).map(mapExam);
      const exam = exams[this.data.examIndex] || exams[0];
      const today = data.today || {};
      const answerCount = Number(today.answerCount || 0);
      const correctCount = Number(today.correctCount || 0);
      const accuracy = answerCount ? `${Math.round((correctCount / answerCount) * 100)}%` : '0%';
      const records = study.answerRecords || [];
      this.setData({
        exam,
        examOptions: exams.map((item) => item.name),
        daysLeft: daysUntil(exam.examDate),
        primaryModules: decoratePrimaryModules(this.data.selectedPrimaryId, records),
        selectedPrimary: getPrimaryModule(this.data.selectedPrimaryId),
        stats: {
          questionCount: String(answerCount || 30),
          doneCount: String(correctCount || 25),
          accuracy: answerCount ? accuracy : '83%'
        },
        materials: (data.recommendedMaterials || seed.materials.slice(0, 2)).map(mapMaterial),
        loading: false,
        refreshing: false,
        error: false,
        moreStatus: 'noMore'
      });
      wx.stopPullDownRefresh();
    }).catch(() => {
      this.setData({ loading: false, refreshing: false, error: true });
      wx.stopPullDownRefresh();
    });
  },

  reload() {
    this.loadHomeData();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadHomeData();
  },

  onReachBottom() {
    if (this.data.materials.length) this.setData({ moreStatus: 'noMore' });
  },

  onExamChange(event) {
    const examIndex = Number(event.detail.value);
    this.setData({ examIndex }, () => this.loadHomeData());
  },

  selectPrimary(event) {
    const selectedPrimaryId = event.currentTarget.dataset.primaryId;
    wx.setStorageSync(selectedPrimaryStorageKey, selectedPrimaryId);
    this.setData({
      selectedPrimaryId,
      selectedPrimary: getPrimaryModule(selectedPrimaryId),
      primaryModules: decoratePrimaryModules(selectedPrimaryId, [])
    });
    this.loadHomeData();
  },

  goSelectedBank() {
    wx.switchTab({ url: '/pages/bank/bank' });
    wx.setStorageSync(selectedPrimaryStorageKey, this.data.selectedPrimaryId);
  },

  go(event) {
    const url = event.currentTarget.dataset.url;
    const page = url.split('?')[0];
    if (tabPages.includes(page)) wx.switchTab({ url: page });
    else wx.navigateTo({ url });
  },

  goMaterial(event) {
    wx.navigateTo({ url: `/pages/material-detail/material-detail?id=${event.currentTarget.dataset.id}` });
  },

  goPractice() {
    this.goSelectedBank();
  },

  goMaterials() {
    wx.switchTab({ url: '/pages/materials/materials' });
  }
});
```

- [ ] **Step 4: Update `home.wxml`**

Replace the content section after the picker and before today practice with a module selector:

```xml
<view class="module-section">
  <view class="section-head">
    <text class="section-title">选择备考模块</text>
    <text class="section-more">先选模块，再进题库</text>
  </view>
  <view class="primary-grid">
    <view
      wx:for="{{primaryModules}}"
      wx:key="primaryId"
      class="primary-card tap-card {{item.activeClass}}"
      hover-class="tap-card-active"
      hover-stay-time="80"
      data-primary-id="{{item.primaryId}}"
      bindtap="selectPrimary"
    >
      <view class="primary-icon {{item.color}}">
        <image class="primary-img" src="{{item.icon}}" mode="aspectFit" />
      </view>
      <view class="primary-name">{{item.title}}</view>
      <view class="primary-sub">{{item.subtitle}}</view>
      <view class="primary-progress">
        <view class="primary-bar" style="{{item.progressStyle}}"></view>
      </view>
      <view class="primary-meta">{{item.progressText}} · 正确率 {{item.accuracyText}}</view>
    </view>
  </view>
</view>

<view class="selected-module card">
  <view>
    <view class="selected-title">{{selectedPrimary.title}}</view>
    <view class="selected-sub">{{selectedPrimary.subtitle}}</view>
  </view>
  <button class="enter-bank-btn" bindtap="goSelectedBank">进入题库</button>
</view>
```

Keep existing skeleton/error wrappers, today stats, materials list, `hover-class`, `empty-state`, and `loading-more`.

- [ ] **Step 5: Update `home.wxss`**

Add:

```css
.module-section {
  margin-top: 28rpx;
}

.primary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.primary-card {
  min-height: 214rpx;
  padding: 22rpx;
  border: 2rpx solid transparent;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 12rpx 32rpx rgba(31, 82, 158, 0.06);
}

.primary-card.active {
  border-color: #2f7bff;
  background: #f3f7ff;
}

.primary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74rpx;
  height: 74rpx;
  border-radius: 22rpx;
  background: #eef5ff;
}

.primary-icon.green { background: #eaf9f0; }
.primary-icon.orange { background: #fff1e8; }
.primary-icon.purple { background: #f1edff; }
.primary-icon.red { background: #fff0f0; }
.primary-icon.teal { background: #e8fbf7; }

.primary-img {
  width: 48rpx;
  height: 48rpx;
}

.primary-name {
  margin-top: 16rpx;
  color: #172033;
  font-size: 28rpx;
  font-weight: 800;
}

.primary-sub,
.primary-meta {
  margin-top: 6rpx;
  color: #8a94a6;
  font-size: 22rpx;
}

.primary-progress {
  height: 8rpx;
  margin-top: 16rpx;
  border-radius: 999rpx;
  background: #edf1f7;
  overflow: hidden;
}

.primary-bar {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #2f7bff, #23c682);
}

.selected-module {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22rpx;
  padding: 28rpx;
}

.selected-title {
  color: #172033;
  font-size: 30rpx;
  font-weight: 900;
}

.selected-sub {
  margin-top: 6rpx;
  color: #8a94a6;
  font-size: 23rpx;
}

.enter-bank-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 160rpx;
  height: 70rpx;
  border: 0;
  border-radius: 999rpx;
  background: #2f7bff;
  color: #fff;
  font-size: 25rpx;
  font-weight: 800;
  line-height: normal;
}

.enter-bank-btn::after {
  border: 0;
}
```

- [ ] **Step 6: Run checks**

Run:

```text
node scripts/check-module-tree.cjs
node scripts/check-miniapp-ui.cjs
```

Expected: both pass.

## Task 4: Bank Page Subject List

**Files:**
- Modify: `miniprogram/pages/bank/bank.js`
- Modify: `miniprogram/pages/bank/bank.wxml`
- Modify: `miniprogram/pages/bank/bank.wxss`

- [ ] **Step 1: Add bank assertions to `scripts/check-module-tree.cjs`**

Append:

```js
const bankJs = require('fs').readFileSync(require('path').join(__dirname, '../miniprogram/pages/bank/bank.js'), 'utf8');
const bankWxml = require('fs').readFileSync(require('path').join(__dirname, '../miniprogram/pages/bank/bank.wxml'), 'utf8');

assert(bankJs.includes("require('../../data/module-tree')"));
assert(bankJs.includes('selectedPrimaryId'));
assert(bankJs.includes('subjects'));
assert(bankJs.includes('selectPrimary'));
assert(bankJs.includes('goSubjectPractice'));
assert(bankWxml.includes('二级学科'));
assert(bankWxml.includes('accuracyText'));
assert(bankWxml.includes('progressText'));
```

- [ ] **Step 2: Run check and verify RED**

Run: `node scripts/check-module-tree.cjs`

Expected: FAIL because bank page is not yet using module tree.

- [ ] **Step 3: Update `bank.js`**

Modify bank page to:

- Import `primaryModules`, `defaultPrimaryId`, `selectedPrimaryStorageKey`, `getPrimaryModule`, `getSubjectsForPrimary`, `buildPracticeUrl`.
- Import `decorateSubjectsWithProgress`.
- Read `options.primaryId || wx.getStorageSync(selectedPrimaryStorageKey) || defaultPrimaryId` in `onLoad`.
- Persist `selectedPrimaryId` on module change.
- Fetch `getQuestionBank()` and `getStudyData('answers')`.
- Set `subjects: decorateSubjectsWithProgress(getSubjectsForPrimary(selectedPrimaryId), records)`.
- Set `currentListLength` to `subjects.length` when `activeTab === 'chapter'`.
- Navigate subject click with `wx.navigateTo({ url: buildPracticeUrl(this.data.selectedPrimaryId, subject) })`.

Use exact handler names:

```js
selectPrimary(event) {
  const selectedPrimaryId = event.currentTarget.dataset.primaryId;
  wx.setStorageSync(selectedPrimaryStorageKey, selectedPrimaryId);
  this.setData({
    selectedPrimaryId,
    selectedPrimary: getPrimaryModule(selectedPrimaryId)
  });
  this.loadBank();
}

goSubjectPractice(event) {
  const subjectId = event.currentTarget.dataset.subjectId;
  const subject = this.data.subjects.find((item) => item.subjectId === subjectId);
  if (!subject) return;
  wx.navigateTo({ url: buildPracticeUrl(this.data.selectedPrimaryId, subject) });
}
```

- [ ] **Step 4: Update `bank.wxml`**

Under the top bar and search row, add a primary module horizontal selector:

```xml
<scroll-view class="primary-scroll" scroll-x>
  <view class="primary-tabs">
    <view
      wx:for="{{primaryModules}}"
      wx:key="primaryId"
      class="primary-chip {{item.activeClass}}"
      data-primary-id="{{item.primaryId}}"
      bindtap="selectPrimary"
    >
      {{item.title}}
    </view>
  </view>
</scroll-view>
```

Replace chapter-list content with subject cards:

```xml
<view wx:if="{{showChapter}}">
  <view class="progress-card card">
    <view class="progress-head">
      <view>
        <text class="muted">当前模块</text>
        <text class="progress-num">{{selectedPrimary.title}}</text>
      </view>
      <text class="muted">二级学科 {{subjects.length}} 个</text>
    </view>
  </view>

  <empty-state wx:if="{{!subjects.length}}" title="暂无学科配置" desc="该模块的二级学科正在准备中" icon="/assets/icons/chapter.svg" />
  <view wx:else class="subject-list">
    <view
      wx:for="{{subjects}}"
      wx:key="subjectId"
      class="subject-card card tap-card"
      hover-class="tap-card-active"
      hover-stay-time="80"
      data-subject-id="{{item.subjectId}}"
      bindtap="goSubjectPractice"
    >
      <view class="subject-icon">+</view>
      <view class="subject-main">
        <view class="subject-title">{{item.title}}</view>
        <view class="subject-meta">{{item.progressText}} · 正确率 {{item.accuracyText}}</view>
        <view class="subject-track">
          <view class="subject-bar" style="{{item.progressStyle}}"></view>
        </view>
      </view>
      <view class="subject-side">
        <view class="subject-percent">{{item.progress}}%</view>
        <view class="subject-status">{{item.statusText}}</view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 5: Update `bank.wxss`**

Add:

```css
.primary-scroll {
  width: 100%;
  margin: 18rpx 0 20rpx;
  white-space: nowrap;
}

.primary-tabs {
  display: flex;
  gap: 14rpx;
}

.primary-chip {
  flex-shrink: 0;
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: #edf4ff;
  color: #637083;
  font-size: 24rpx;
  font-weight: 700;
}

.primary-chip.active {
  background: #2f7bff;
  color: #fff;
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 22rpx;
}

.subject-card {
  display: flex;
  align-items: center;
  min-height: 140rpx;
  padding: 24rpx;
}

.subject-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  margin-right: 18rpx;
  border-radius: 50%;
  background: #2f7bff;
  color: #fff;
  font-size: 28rpx;
  font-weight: 900;
}

.subject-main {
  flex: 1;
  min-width: 0;
}

.subject-title {
  color: #172033;
  font-size: 29rpx;
  font-weight: 900;
}

.subject-meta,
.subject-status {
  margin-top: 8rpx;
  color: #8a94a6;
  font-size: 23rpx;
}

.subject-track {
  height: 8rpx;
  margin-top: 14rpx;
  border-radius: 999rpx;
  background: #edf1f7;
  overflow: hidden;
}

.subject-bar {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #2f7bff, #23c682);
}

.subject-side {
  width: 120rpx;
  margin-left: 18rpx;
  text-align: right;
}

.subject-percent {
  color: #23c682;
  font-size: 30rpx;
  font-weight: 900;
}
```

- [ ] **Step 6: Run checks**

Run:

```text
node scripts/check-module-tree.cjs
node scripts/check-miniapp-ui.cjs
node scripts/check-page-routes.cjs
```

Expected: all pass.

## Task 5: Practice Compatibility and Full Verification

**Files:**
- Modify: `miniprogram/pages/practice/practice.js` only if needed.
- Modify: `scripts/check-practice-history.cjs` if route expectations need coverage.

- [ ] **Step 1: Add practice parameter assertion**

Append to `scripts/check-module-tree.cjs`:

```js
const practiceJs = require('fs').readFileSync(require('path').join(__dirname, '../miniprogram/pages/practice/practice.js'), 'utf8');
assert(practiceJs.includes('sourceOptions'));
assert(practiceJs.includes('categoryId'));
```

- [ ] **Step 2: Run check**

Run: `node scripts/check-module-tree.cjs`

Expected: PASS if current practice page already forwards `sourceOptions` to `getPracticeSession`.

- [ ] **Step 3: If check fails, update `practice.js` minimally**

Ensure `onLoad(options)` stores full options and `loadSession()` calls:

```js
getPracticeSession(this.data.sourceOptions)
```

Do not change option selected/correct/wrong logic.

- [ ] **Step 4: Run full verification**

Run:

```text
node scripts/check-module-tree.cjs
node scripts/check-practice-history.cjs
node scripts/check-miniapp-ui.cjs
node scripts/check-page-routes.cjs
node scripts/check-mvp-flow.cjs
node scripts/check-production-flow.cjs
node scripts/check-cloud-contracts.cjs
node scripts/check-seed-data.cjs
node scripts/check-cloud-functions.cjs
```

Expected: every command exits 0.

## Self-Review Notes

- Spec coverage: The plan covers six primary modules, homepage selection without auto-jump, explicit bank entry, bank second-level subjects, progress and accuracy, practice route compatibility, UI states, and verification.
- Placeholder scan: No TBD/TODO placeholders are intended in implementation steps.
- Type consistency: `primaryId`, `subjectId`, `categoryId`, `selectedPrimaryId`, `progressText`, and `accuracyText` are used consistently across config, helpers, home, bank, and tests.
