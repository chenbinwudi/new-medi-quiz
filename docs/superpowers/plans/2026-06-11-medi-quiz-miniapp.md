# 医考通小程序 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable native WeChat Mini Program MVP for 医考通 with 9 screenshot-inspired pages, local JSON question/material data, WeChat CloudBase login, and cloud-backed study records.

**Architecture:** The mini program keeps exam, chapter, question, and material content in local JSON-like JS modules under `miniprogram/data/`. User-specific data is accessed through small service wrappers in `miniprogram/services/`, backed by CloudBase cloud functions in `cloudfunctions/`. Pages stay thin by using shared utilities and reusable visual components for cards, tabs, empty states, and bottom-safe action bars.

**Tech Stack:** WeChat native Mini Program (`WXML/WXSS/JS`), WeChat CloudBase cloud functions, no third-party UI framework, no heavy chart library.

---

## File Structure

Create the project from an empty repository:

```text
project.config.json                 # WeChat Developer Tools project config with AppID
miniprogram/app.js                   # CloudBase initialization and global state
miniprogram/app.json                 # Page registry, tabBar, window config
miniprogram/app.wxss                 # Global design tokens and common layout classes
miniprogram/sitemap.json             # WeChat sitemap config
miniprogram/assets/icons/*.svg       # Lightweight tab/action icons
miniprogram/components/empty-state/  # Reusable empty state
miniprogram/components/stat-card/    # Reusable metric card
miniprogram/components/seg-tabs/     # Reusable segmented tabs
miniprogram/data/exams.js            # Exam metadata
miniprogram/data/chapters.js         # Chapter list
miniprogram/data/questions.js        # Mock question bank
miniprogram/data/materials.js        # Material categories and list
miniprogram/utils/date.js            # Date and exam countdown helpers
miniprogram/utils/question.js        # Answer normalization and correctness helpers
miniprogram/utils/progress.js        # Derived progress/report helpers
miniprogram/services/cloud.js        # wx.cloud.callFunction wrapper
miniprogram/services/user.js         # login and user cache
miniprogram/services/study.js        # save answer/report/favorites/notes service
miniprogram/pages/home/              # 首页
miniprogram/pages/bank/              # 题库
miniprogram/pages/practice/          # 章节练习
miniprogram/pages/wrong/             # 错题本
miniprogram/pages/favorites/         # 我的收藏
miniprogram/pages/report/            # 学习报告
miniprogram/pages/materials/         # 资料
miniprogram/pages/material-detail/   # 资料详情
miniprogram/pages/profile/           # 我的
cloudfunctions/login/                # CloudBase login function
cloudfunctions/saveAnswer/           # Save answer and update wrong/summary
cloudfunctions/toggleFavorite/       # Toggle question/material favorite
cloudfunctions/saveNote/             # Save question note
cloudfunctions/getStudyData/         # Read report, wrong, favorites, notes
```

## Task 1: Scaffold Native Mini Program

**Files:**
- Create: `project.config.json`
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/sitemap.json`
- Create: page folders for all 9 pages with `.js`, `.json`, `.wxml`, `.wxss`

- [ ] **Step 1: Create project config**

Create `project.config.json`:

```json
{
  "appid": "wxe7fec94bbc002874",
  "projectname": "new-medi-quiz",
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/",
  "setting": {
    "urlCheck": false,
    "es6": true,
    "postcss": true,
    "minified": true,
    "enhance": true
  },
  "compileType": "miniprogram",
  "libVersion": "latest"
}
```

- [ ] **Step 2: Create app config**

Create `miniprogram/app.json`:

```json
{
  "pages": [
    "pages/home/home",
    "pages/bank/bank",
    "pages/materials/materials",
    "pages/profile/profile",
    "pages/practice/practice",
    "pages/wrong/wrong",
    "pages/favorites/favorites",
    "pages/report/report",
    "pages/material-detail/material-detail"
  ],
  "window": {
    "navigationBarTitleText": "医考通",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black",
    "backgroundColor": "#f7f9fc"
  },
  "tabBar": {
    "color": "#8a94a6",
    "selectedColor": "#2f7bff",
    "backgroundColor": "#ffffff",
    "borderStyle": "white",
    "list": [
      { "pagePath": "pages/home/home", "text": "首页" },
      { "pagePath": "pages/bank/bank", "text": "题库" },
      { "pagePath": "pages/materials/materials", "text": "资料" },
      { "pagePath": "pages/profile/profile", "text": "我的" }
    ]
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

- [ ] **Step 3: Initialize CloudBase**

Create `miniprogram/app.js`:

```js
App({
  globalData: {
    envId: 'cloudbase-d0g4yo1qac1bbd1db',
    user: null
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.envId,
        traceUser: true
      });
    }
  }
});
```

- [ ] **Step 4: Add global styles**

Create `miniprogram/app.wxss`:

```css
page {
  background: #f7f9fc;
  color: #172033;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  font-size: 28rpx;
}

.page {
  min-height: 100vh;
  padding: 28rpx 28rpx 48rpx;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 12rpx 32rpx rgba(22, 44, 88, 0.06);
}

.muted {
  color: #8a94a6;
}

.primary {
  color: #2f7bff;
}

.btn-primary {
  height: 88rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #2f7bff, #1f65f2);
  color: #fff;
  font-weight: 600;
  line-height: 88rpx;
}

.btn-ghost {
  height: 76rpx;
  border: 1rpx solid #d9e1ef;
  border-radius: 22rpx;
  color: #5c667a;
  line-height: 76rpx;
  background: #fff;
}
```

- [ ] **Step 5: Create sitemap**

Create `miniprogram/sitemap.json`:

```json
{
  "rules": [
    {
      "action": "allow",
      "page": "*"
    }
  ]
}
```

- [ ] **Step 6: Create placeholder page files**

For each page folder, create a `.json` file with:

```json
{
  "navigationBarTitleText": "医考通"
}
```

Create each `.js` with:

```js
Page({
  data: {}
});
```

Create each `.wxml` with:

```xml
<view class="page"></view>
```

Create each `.wxss` as an empty file.

- [ ] **Step 7: Verify project can be opened**

Run:

```powershell
git status --short
```

Expected: all scaffold files appear as untracked or modified. Then open the repository in WeChat Developer Tools and confirm it does not report missing app config or page files.

- [ ] **Step 8: Commit**

```powershell
git add project.config.json miniprogram
git commit -m "feat: scaffold mini program"
```

## Task 2: Add Local Data and Pure Utilities

**Files:**
- Create: `miniprogram/data/exams.js`
- Create: `miniprogram/data/chapters.js`
- Create: `miniprogram/data/questions.js`
- Create: `miniprogram/data/materials.js`
- Create: `miniprogram/utils/date.js`
- Create: `miniprogram/utils/question.js`
- Create: `miniprogram/utils/progress.js`

- [ ] **Step 1: Create exam data**

Create `miniprogram/data/exams.js`:

```js
const exams = [
  {
    id: 'licensed-doctor-medical',
    name: '执业医师',
    subtitle: '医学综合',
    fullName: '执业医师（医学综合）',
    examDate: '2026-10-14',
    subjects: ['基础医学综合', '医学人文综合', '临床医学综合', '预防医学综合']
  }
];

module.exports = { exams };
```

- [ ] **Step 2: Create chapter data**

Create `miniprogram/data/chapters.js` with at least these records:

```js
const chapters = [
  { id: 'basic', examId: 'licensed-doctor-medical', name: '基础医学综合', parentId: '', order: 1, totalCount: 664 },
  { id: 'humanities', examId: 'licensed-doctor-medical', name: '医学人文综合', parentId: '', order: 2, totalCount: 600 },
  { id: 'clinical', examId: 'licensed-doctor-medical', name: '临床医学综合', parentId: '', order: 3, totalCount: 586 },
  { id: 'preventive', examId: 'licensed-doctor-medical', name: '预防医学综合', parentId: '', order: 4, totalCount: 512 },
  { id: 'tcm-basic', examId: 'licensed-doctor-medical', name: '中医学基础', parentId: '', order: 5, totalCount: 423 },
  { id: 'tcm-clinical', examId: 'licensed-doctor-medical', name: '中医临床医学', parentId: '', order: 6, totalCount: 557 },
  { id: 'stomatology', examId: 'licensed-doctor-medical', name: '口腔医学综合', parentId: '', order: 7, totalCount: 389 },
  { id: 'public-health', examId: 'licensed-doctor-medical', name: '公共卫生综合', parentId: '', order: 8, totalCount: 312 }
];

module.exports = { chapters };
```

- [ ] **Step 3: Create question data**

Create `miniprogram/data/questions.js` with representative single and multiple choice questions:

```js
const questions = [
  {
    id: 'q-drug-quality-001',
    examId: 'licensed-doctor-medical',
    chapterId: 'humanities',
    type: 'single',
    stem: '关于药品质量标准的说法，错误的是（ ）。',
    options: [
      { key: 'A', text: '药品质量标准是药品生产、检验、贸易的法定依据' },
      { key: 'B', text: '国家药品标准分为中国药典、国家药品标准和地方药品标准' },
      { key: 'C', text: '药品质量标准是衡量药品质量是否合格的唯一标准' },
      { key: 'D', text: '药品质量标准应当科学合理、先进、可操作性强' },
      { key: 'E', text: '药品质量标准由国务院药品监督管理部门制定' }
    ],
    answer: 'B',
    analysis: '国家药品标准包括《中国药典》和国务院药品监督管理部门颁布的药品标准，不包括地方药品标准。',
    difficulty: 'normal',
    tags: ['药品质量标准', '法规']
  },
  {
    id: 'q-basic-001',
    examId: 'licensed-doctor-medical',
    chapterId: 'basic',
    type: 'single',
    stem: '细胞膜的主要结构基础是（ ）。',
    options: [
      { key: 'A', text: '蛋白质单层' },
      { key: 'B', text: '脂质双分子层' },
      { key: 'C', text: '糖原颗粒' },
      { key: 'D', text: '核酸链' }
    ],
    answer: 'B',
    analysis: '细胞膜以脂质双分子层为基本骨架，蛋白质镶嵌或附着其上。',
    difficulty: 'easy',
    tags: ['细胞生物学']
  },
  {
    id: 'q-clinical-001',
    examId: 'licensed-doctor-medical',
    chapterId: 'clinical',
    type: 'multiple',
    stem: '下列属于发热常见病因的是（ ）。',
    options: [
      { key: 'A', text: '感染' },
      { key: 'B', text: '肿瘤' },
      { key: 'C', text: '免疫性疾病' },
      { key: 'D', text: '脱水' }
    ],
    answer: ['A', 'B', 'C'],
    analysis: '感染、肿瘤和免疫性疾病均可引起发热，脱水不是发热的典型病因分类。',
    difficulty: 'normal',
    tags: ['症状学', '发热']
  }
];

module.exports = { questions };
```

- [ ] **Step 4: Create material data**

Create `miniprogram/data/materials.js` with categories and list:

```js
const materialCategories = [
  { id: 'outline', name: '考试大纲', color: '#2f7bff' },
  { id: 'textbook', name: '官方教材', color: '#46c06f' },
  { id: 'summary', name: '考点汇总', color: '#ff8b4a' },
  { id: 'mindmap', name: '思维导图', color: '#5f8dff' },
  { id: 'mnemonic', name: '记忆口诀', color: '#ffa629' },
  { id: 'analysis', name: '真题解析', color: '#8b6cff' },
  { id: 'guide', name: '临床指南', color: '#35c6a4' },
  { id: 'more', name: '更多资料', color: '#f06aaa' }
];

const materials = [
  {
    id: 'mat-outline-2024',
    categoryId: 'outline',
    title: '2024年执业医师考试大纲（医学综合）',
    type: 'PDF',
    size: '2.4M',
    learnerCount: 1234,
    summary: '根据最新考试大纲整理，包含考试范围、考试要求和重点内容。',
    catalog: ['考试说明', '基础医学综合', '医学人文综合', '临床医学综合'],
    updatedAt: '2024-03-20'
  },
  {
    id: 'mat-internal-summary',
    categoryId: 'summary',
    title: '执业医师高频考点汇总（内部资料）',
    type: 'PDF',
    size: '1.8M',
    learnerCount: 987,
    summary: '覆盖高频考点和易错点，适合考前快速复习。',
    catalog: ['高频考点', '易错总结', '考前冲刺'],
    updatedAt: '2024-04-02'
  }
];

module.exports = { materialCategories, materials };
```

- [ ] **Step 5: Add pure utilities**

Create `miniprogram/utils/question.js`:

```js
function normalizeAnswer(answer) {
  if (Array.isArray(answer)) return answer.slice().sort().join(',');
  return String(answer || '');
}

function isCorrectAnswer(question, selected) {
  return normalizeAnswer(question.answer) === normalizeAnswer(selected);
}

function getQuestionTypeLabel(type) {
  return type === 'multiple' ? '多选题' : '单选题';
}

module.exports = { normalizeAnswer, isCorrectAnswer, getQuestionTypeLabel };
```

Create `miniprogram/utils/date.js`:

```js
function daysUntil(dateText) {
  const target = new Date(`${dateText}T00:00:00`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function formatDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

module.exports = { daysUntil, formatDate };
```

Create `miniprogram/utils/progress.js`:

```js
function percent(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function buildChapterProgress(chapters, summaryByChapter) {
  return chapters.map((chapter) => {
    const learned = summaryByChapter[chapter.id] || 0;
    return {
      ...chapter,
      learned,
      progress: percent(learned, chapter.totalCount)
    };
  });
}

module.exports = { percent, buildChapterProgress };
```

- [ ] **Step 6: Verify utility syntax**

Run:

```powershell
node -e "const q=require('./miniprogram/utils/question'); console.log(q.isCorrectAnswer({answer:['B','A']}, ['A','B']))"
```

Expected output:

```text
true
```

- [ ] **Step 7: Commit**

```powershell
git add miniprogram/data miniprogram/utils
git commit -m "feat: add quiz data and utilities"
```

## Task 3: Build Cloud Function Service Layer

**Files:**
- Create: `miniprogram/services/cloud.js`
- Create: `miniprogram/services/user.js`
- Create: `miniprogram/services/study.js`
- Create: `cloudfunctions/login/index.js`
- Create: `cloudfunctions/login/package.json`
- Create: `cloudfunctions/saveAnswer/index.js`
- Create: `cloudfunctions/saveAnswer/package.json`
- Create: `cloudfunctions/toggleFavorite/index.js`
- Create: `cloudfunctions/toggleFavorite/package.json`
- Create: `cloudfunctions/saveNote/index.js`
- Create: `cloudfunctions/saveNote/package.json`
- Create: `cloudfunctions/getStudyData/index.js`
- Create: `cloudfunctions/getStudyData/package.json`

- [ ] **Step 1: Add mini program cloud wrapper**

Create `miniprogram/services/cloud.js`:

```js
function callFunction(name, data = {}) {
  if (!wx.cloud) {
    return Promise.reject(new Error('当前基础库不支持云开发'));
  }

  return wx.cloud.callFunction({ name, data })
    .then((res) => res.result)
    .catch((err) => {
      console.error(`[cloud] ${name} failed`, err);
      throw err;
    });
}

module.exports = { callFunction };
```

- [ ] **Step 2: Add user service**

Create `miniprogram/services/user.js`:

```js
const { callFunction } = require('./cloud');

function login() {
  return callFunction('login').then((result) => {
    const user = result && result.user;
    if (user) {
      wx.setStorageSync('user', user);
      getApp().globalData.user = user;
    }
    return user;
  });
}

function getCachedUser() {
  return getApp().globalData.user || wx.getStorageSync('user') || null;
}

module.exports = { login, getCachedUser };
```

- [ ] **Step 3: Add study service**

Create `miniprogram/services/study.js`:

```js
const { callFunction } = require('./cloud');

function saveAnswer(payload) {
  return callFunction('saveAnswer', payload);
}

function toggleFavorite(payload) {
  return callFunction('toggleFavorite', payload);
}

function saveNote(payload) {
  return callFunction('saveNote', payload);
}

function getStudyData(type) {
  return callFunction('getStudyData', { type });
}

module.exports = { saveAnswer, toggleFavorite, saveNote, getStudyData };
```

- [ ] **Step 4: Add package manifest for each function**

Each `cloudfunctions/<name>/package.json`:

```json
{
  "name": "medi-quiz-cloud-function",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "latest"
  }
}
```

- [ ] **Step 5: Implement login cloud function**

Create `cloudfunctions/login/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const now = db.serverDate();
  const users = db.collection('users');
  const existing = await users.where({ openid }).limit(1).get();

  if (existing.data.length) {
    const user = existing.data[0];
    await users.doc(user._id).update({ data: { lastLoginAt: now } });
    return { user: { ...user, lastLoginAt: Date.now() } };
  }

  const user = {
    openid,
    nickname: '医考小助手',
    avatarUrl: '',
    memberStatus: 'free',
    createdAt: now,
    lastLoginAt: now
  };
  const created = await users.add({ data: user });

  return {
    user: {
      _id: created._id,
      openid,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      memberStatus: user.memberStatus
    }
  };
};
```

- [ ] **Step 6: Implement saveAnswer cloud function**

Create `cloudfunctions/saveAnswer/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

function todayText() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const {
    questionId,
    chapterId,
    type = 'single',
    answer,
    isCorrect,
    duration = 0,
    source = 'practice'
  } = event;

  if (!questionId || !chapterId) {
    throw new Error('questionId and chapterId are required');
  }

  await db.collection('answer_records').add({
    data: {
      openid,
      questionId,
      chapterId,
      type,
      answer,
      isCorrect: !!isCorrect,
      duration,
      source,
      createdAt: db.serverDate()
    }
  });

  if (!isCorrect) {
    const wrong = await db.collection('wrong_questions').where({ openid, questionId }).limit(1).get();
    if (wrong.data.length) {
      await db.collection('wrong_questions').doc(wrong.data[0]._id).update({
        data: {
          wrongCount: _.inc(1),
          lastWrongAt: db.serverDate(),
          redoneCorrect: false
        }
      });
    } else {
      await db.collection('wrong_questions').add({
        data: {
          openid,
          questionId,
          chapterId,
          wrongCount: 1,
          lastWrongAt: db.serverDate(),
          redoneCorrect: false
        }
      });
    }
  } else {
    const wrong = await db.collection('wrong_questions').where({ openid, questionId }).limit(1).get();
    if (wrong.data.length) {
      await db.collection('wrong_questions').doc(wrong.data[0]._id).update({
        data: { redoneCorrect: true }
      });
    }
  }

  const date = todayText();
  const summary = await db.collection('study_summary').where({ openid, date }).limit(1).get();
  if (summary.data.length) {
    await db.collection('study_summary').doc(summary.data[0]._id).update({
      data: {
        answerCount: _.inc(1),
        correctCount: _.inc(isCorrect ? 1 : 0),
        updatedAt: db.serverDate()
      }
    });
  } else {
    await db.collection('study_summary').add({
      data: {
        openid,
        date,
        answerCount: 1,
        correctCount: isCorrect ? 1 : 0,
        typeCount: { [type]: 1 },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });
  }

  return { ok: true };
};
```

- [ ] **Step 7: Implement favorite, note, and read functions**

Create `cloudfunctions/toggleFavorite/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const { targetType, targetId } = event;
  if (!targetType || !targetId) throw new Error('targetType and targetId are required');

  const query = { openid, targetType, targetId };
  const existing = await db.collection('favorites').where(query).limit(1).get();
  if (existing.data.length) {
    await db.collection('favorites').doc(existing.data[0]._id).remove();
    return { favorited: false };
  }

  await db.collection('favorites').add({
    data: { ...query, createdAt: db.serverDate() }
  });
  return { favorited: true };
};
```

Create `cloudfunctions/saveNote/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const { questionId, content = '' } = event;
  if (!questionId) throw new Error('questionId is required');

  const existing = await db.collection('notes').where({ openid, questionId }).limit(1).get();
  if (existing.data.length) {
    await db.collection('notes').doc(existing.data[0]._id).update({
      data: { content, updatedAt: db.serverDate() }
    });
    return { note: { ...existing.data[0], content } };
  }

  const note = { openid, questionId, content, updatedAt: db.serverDate() };
  const created = await db.collection('notes').add({ data: note });
  return { note: { _id: created._id, openid, questionId, content } };
};
```

Create `cloudfunctions/getStudyData/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function list(collection, openid) {
  const result = await db.collection(collection).where({ openid }).orderBy('createdAt', 'desc').limit(100).get();
  return result.data;
}

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const type = event.type || 'all';

  const payload = {};
  if (type === 'all' || type === 'report') {
    payload.summary = await list('study_summary', openid);
  }
  if (type === 'all' || type === 'wrong') {
    payload.wrongQuestions = await list('wrong_questions', openid);
  }
  if (type === 'all' || type === 'favorites') {
    payload.favorites = await list('favorites', openid);
  }
  if (type === 'all' || type === 'notes') {
    payload.notes = await list('notes', openid);
  }

  return payload;
};
```

- [ ] **Step 8: Verify service module syntax**

Run:

```powershell
node -e "const s=require('./miniprogram/services/study'); console.log(Object.keys(s).join(','))"
```

Expected output includes:

```text
saveAnswer,toggleFavorite,saveNote,getStudyData
```

- [ ] **Step 9: Commit**

```powershell
git add miniprogram/services cloudfunctions
git commit -m "feat: add cloud study services"
```

## Task 4: Build Shared Components and Base Visual Language

**Files:**
- Create: `miniprogram/components/empty-state/*`
- Create: `miniprogram/components/stat-card/*`
- Create: `miniprogram/components/seg-tabs/*`
- Modify: `miniprogram/app.wxss`

- [ ] **Step 1: Create empty state component**

Create `miniprogram/components/empty-state/empty-state.json`:

```json
{
  "component": true
}
```

Create `miniprogram/components/empty-state/empty-state.js`:

```js
Component({
  properties: {
    title: { type: String, value: '暂无数据' },
    desc: { type: String, value: '' },
    actionText: { type: String, value: '' }
  },
  methods: {
    onAction() {
      this.triggerEvent('action');
    }
  }
});
```

Create `miniprogram/components/empty-state/empty-state.wxml`:

```xml
<view class="empty">
  <view class="empty-icon">□</view>
  <view class="empty-title">{{title}}</view>
  <view wx:if="{{desc}}" class="empty-desc">{{desc}}</view>
  <button wx:if="{{actionText}}" class="empty-action" bindtap="onAction">{{actionText}}</button>
</view>
```

Create `miniprogram/components/empty-state/empty-state.wxss`:

```css
.empty {
  padding: 80rpx 32rpx;
  text-align: center;
  color: #8a94a6;
}
.empty-icon {
  width: 96rpx;
  height: 96rpx;
  margin: 0 auto 20rpx;
  border-radius: 50%;
  background: #eef4ff;
  color: #2f7bff;
  line-height: 96rpx;
}
.empty-title {
  color: #172033;
  font-weight: 600;
}
.empty-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
}
.empty-action {
  width: 220rpx;
  margin-top: 28rpx;
  border-radius: 999rpx;
  background: #2f7bff;
  color: #fff;
}
```

- [ ] **Step 2: Create stat card component**

Create `miniprogram/components/stat-card/stat-card.json`:

```json
{
  "component": true
}
```

Create `miniprogram/components/stat-card/stat-card.js`:

```js
Component({
  properties: {
    value: { type: String, value: '0' },
    label: { type: String, value: '' }
  }
});
```

Create `miniprogram/components/stat-card/stat-card.wxml`:

```xml
<view class="stat-card">
  <view class="value">{{value}}</view>
  <view class="label">{{label}}</view>
</view>
```

Create `miniprogram/components/stat-card/stat-card.wxss`:

```css
.stat-card {
  flex: 1;
  text-align: center;
}
.value {
  color: #172033;
  font-size: 36rpx;
  font-weight: 700;
}
.label {
  margin-top: 8rpx;
  color: #8a94a6;
  font-size: 22rpx;
}
```

- [ ] **Step 3: Create segmented tabs component**

Create `miniprogram/components/seg-tabs/seg-tabs.json`:

```json
{
  "component": true
}
```

Create `miniprogram/components/seg-tabs/seg-tabs.js`:

```js
Component({
  properties: {
    tabs: { type: Array, value: [] },
    active: { type: String, value: '' }
  },
  methods: {
    onTap(event) {
      const value = event.currentTarget.dataset.value;
      this.triggerEvent('change', { value });
    }
  }
});
```

Create `miniprogram/components/seg-tabs/seg-tabs.wxml`:

```xml
<view class="tabs">
  <view
    wx:for="{{tabs}}"
    wx:key="value"
    data-value="{{item.value}}"
    class="tab {{active === item.value ? 'active' : ''}}"
    bindtap="onTap"
  >
    {{item.label}}
  </view>
</view>
```

Create `miniprogram/components/seg-tabs/seg-tabs.wxss`:

```css
.tabs {
  display: flex;
  gap: 40rpx;
  align-items: center;
  height: 72rpx;
}
.tab {
  position: relative;
  color: #4b5568;
  font-size: 28rpx;
}
.tab.active {
  color: #2f7bff;
  font-weight: 700;
}
.tab.active::after {
  position: absolute;
  left: 50%;
  bottom: -16rpx;
  width: 36rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: #2f7bff;
  content: "";
  transform: translateX(-50%);
}
```

- [ ] **Step 4: Verify components compile structurally**

Run:

```powershell
Get-ChildItem miniprogram/components -Recurse -File | Select-Object -ExpandProperty FullName
```

Expected: each component has `.json`, `.js`, `.wxml`, and `.wxss`.

- [ ] **Step 5: Commit**

```powershell
git add miniprogram/components miniprogram/app.wxss
git commit -m "feat: add shared mini program components"
```

## Task 5: Implement Tab Pages

**Files:**
- Modify: `miniprogram/pages/home/*`
- Modify: `miniprogram/pages/bank/*`
- Modify: `miniprogram/pages/materials/*`
- Modify: `miniprogram/pages/profile/*`

- [ ] **Step 1: Implement home page data**

Update `miniprogram/pages/home/home.js`:

```js
const { exams } = require('../../data/exams');
const { materials } = require('../../data/materials');
const { daysUntil } = require('../../utils/date');

Page({
  data: {
    exam: exams[0],
    daysLeft: 0,
    stats: { questionCount: 30, doneCount: 25, accuracy: '83%' },
    shortcuts: [
      { label: '章节练习', url: '/pages/bank/bank', color: '#2f7bff' },
      { label: '历年真题', url: '/pages/bank/bank?tab=real', color: '#45c56f' },
      { label: '模拟试卷', url: '/pages/bank/bank?tab=mock', color: '#ff914d' },
      { label: '考点速记', url: '/pages/bank/bank?tab=notes', color: '#8f6cff' },
      { label: '错题本', url: '/pages/wrong/wrong', color: '#ff5a5f' },
      { label: '收藏题', url: '/pages/favorites/favorites', color: '#ffb329' },
      { label: '笔记', url: '/pages/favorites/favorites?tab=notes', color: '#28b7a8' },
      { label: '学习报告', url: '/pages/report/report', color: '#3d7dff' }
    ],
    materials: materials.slice(0, 2)
  },
  onLoad() {
    this.setData({ daysLeft: daysUntil(this.data.exam.examDate) });
  },
  go(event) {
    const url = event.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },
  goMaterial(event) {
    wx.navigateTo({ url: `/pages/material-detail/material-detail?id=${event.currentTarget.dataset.id}` });
  }
});
```

- [ ] **Step 2: Implement home page layout**

Update `miniprogram/pages/home/home.wxml` with header, search row, blue banner, shortcut grid, stat card, and material list. Use `bindtap="go"` on shortcut items and `bindtap="goMaterial"` on material rows.

- [ ] **Step 3: Implement bank page**

Use `chapters`, `questions`, and `buildChapterProgress()` to show the tabs and chapter rows. `onChapterTap` navigates to `/pages/practice/practice?chapterId=<id>`.

Core `bank.js` shape:

```js
const { exams } = require('../../data/exams');
const { chapters } = require('../../data/chapters');
const { buildChapterProgress } = require('../../utils/progress');

Page({
  data: {
    exam: exams[0],
    activeTab: 'chapter',
    tabs: [
      { value: 'chapter', label: '章节练习' },
      { value: 'real', label: '历年真题' },
      { value: 'mock', label: '模拟试卷' },
      { value: 'notes', label: '考点速记' }
    ],
    progress: []
  },
  onLoad(options) {
    const summaryByChapter = { basic: 235, humanities: 120 };
    this.setData({
      activeTab: options.tab || 'chapter',
      progress: buildChapterProgress(chapters, summaryByChapter)
    });
  },
  onTabChange(event) {
    this.setData({ activeTab: event.detail.value });
  },
  goPractice(event) {
    wx.navigateTo({ url: `/pages/practice/practice?chapterId=${event.currentTarget.dataset.id}` });
  }
});
```

- [ ] **Step 4: Implement materials page**

Use `materialCategories` and `materials` to render category grid and recommendation list. Material rows navigate to `material-detail`.

- [ ] **Step 5: Implement profile page**

Use `login()` from `services/user.js`. Show cached or default user. Provide quick links to wrong, favorites, report, and placeholder menu toasts for order/download/settings.

Core login behavior:

```js
const { login, getCachedUser } = require('../../services/user');

Page({
  data: { user: null, syncing: false },
  onShow() {
    this.setData({ user: getCachedUser() });
  },
  login() {
    this.setData({ syncing: true });
    login()
      .then((user) => this.setData({ user }))
      .catch(() => wx.showToast({ title: '登录失败', icon: 'none' }))
      .finally(() => this.setData({ syncing: false }));
  },
  go(event) {
    wx.navigateTo({ url: event.currentTarget.dataset.url });
  }
});
```

- [ ] **Step 6: Verify tab page navigation**

Open WeChat Developer Tools. Verify:

- bottom tabs switch between 首页、题库、资料、我的
- 首页 shortcuts open the intended secondary pages
- 题库 chapter row opens practice page
- 资料 row opens material detail
- 我的 login button calls cloud function or shows a failure toast without crashing

- [ ] **Step 7: Commit**

```powershell
git add miniprogram/pages/home miniprogram/pages/bank miniprogram/pages/materials miniprogram/pages/profile
git commit -m "feat: build tab pages"
```

## Task 6: Implement Practice Flow

**Files:**
- Modify: `miniprogram/pages/practice/*`
- Modify: `miniprogram/pages/practice/practice.json`

- [ ] **Step 1: Configure practice page title**

Set `miniprogram/pages/practice/practice.json`:

```json
{
  "navigationBarTitleText": "章节练习"
}
```

- [ ] **Step 2: Implement practice state and answer logic**

Update `miniprogram/pages/practice/practice.js`:

```js
const { questions } = require('../../data/questions');
const { chapters } = require('../../data/chapters');
const { isCorrectAnswer, getQuestionTypeLabel } = require('../../utils/question');
const { saveAnswer, toggleFavorite, saveNote } = require('../../services/study');

Page({
  data: {
    chapter: null,
    questions: [],
    currentIndex: 0,
    current: null,
    selected: [],
    submitted: false,
    isCorrect: false,
    favorited: false
  },

  onLoad(options) {
    const chapterId = options.chapterId || 'humanities';
    const list = questions.filter((item) => item.chapterId === chapterId);
    const safeList = list.length ? list : questions;
    this.setData({
      chapter: chapters.find((item) => item.id === chapterId) || chapters[0],
      questions: safeList,
      current: safeList[0],
      currentIndex: 0
    });
  },

  selectOption(event) {
    if (this.data.submitted) return;
    const key = event.currentTarget.dataset.key;
    const current = this.data.current;
    if (current.type === 'multiple') {
      const selected = this.data.selected.includes(key)
        ? this.data.selected.filter((item) => item !== key)
        : this.data.selected.concat(key);
      this.setData({ selected });
      return;
    }
    this.setData({ selected: [key] });
  },

  submit() {
    if (!this.data.selected.length) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }
    const current = this.data.current;
    const answer = current.type === 'multiple' ? this.data.selected : this.data.selected[0];
    const isCorrect = isCorrectAnswer(current, answer);
    this.setData({ submitted: true, isCorrect });
    saveAnswer({
      questionId: current.id,
      chapterId: current.chapterId,
      type: current.type,
      answer,
      isCorrect,
      duration: 0,
      source: 'practice'
    }).catch(() => wx.showToast({ title: '答题记录同步失败', icon: 'none' }));
  },

  next() {
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      wx.showToast({ title: '已完成本组练习', icon: 'none' });
      return;
    }
    this.setData({
      currentIndex: nextIndex,
      current: this.data.questions[nextIndex],
      selected: [],
      submitted: false,
      isCorrect: false,
      favorited: false
    });
  },

  prev() {
    const prevIndex = Math.max(0, this.data.currentIndex - 1);
    this.setData({
      currentIndex: prevIndex,
      current: this.data.questions[prevIndex],
      selected: [],
      submitted: false,
      isCorrect: false,
      favorited: false
    });
  },

  toggleFavorite() {
    const current = this.data.current;
    toggleFavorite({ targetType: 'question', targetId: current.id })
      .then((res) => this.setData({ favorited: res.favorited }))
      .catch(() => wx.showToast({ title: '收藏同步失败', icon: 'none' }));
  },

  saveNote() {
    const current = this.data.current;
    saveNote({ questionId: current.id, content: '重点复习本题考点' })
      .then(() => wx.showToast({ title: '笔记已保存' }))
      .catch(() => wx.showToast({ title: '笔记同步失败', icon: 'none' }));
  },

  typeLabel() {
    return getQuestionTypeLabel(this.data.current.type);
  }
});
```

- [ ] **Step 3: Implement practice layout**

Create WXML with:

- question count `{{currentIndex + 1}}/{{questions.length}}`
- type badge based on `current.type`
- stem text
- option list with selected and correct classes
- answer/analysis card shown only when `submitted`
- bottom action row for 收藏、笔记、答题卡、上一题、下一题

- [ ] **Step 4: Implement practice styles**

Use screenshot-like white background, rounded option pills, blue selected border, green/red answer state, and fixed bottom action bar with safe-area padding.

- [ ] **Step 5: Verify practice interaction**

In WeChat Developer Tools:

1. Open `pages/practice/practice?chapterId=humanities`.
2. Tap no option and submit.
3. Expected: toast `请先选择答案`.
4. Select option B for `q-drug-quality-001` and submit.
5. Expected: answer area displays correct answer B and explanation.
6. Tap next.
7. Expected: next question loads with clean selection state.

- [ ] **Step 6: Commit**

```powershell
git add miniprogram/pages/practice
git commit -m "feat: implement practice flow"
```

## Task 7: Implement User Study Pages

**Files:**
- Modify: `miniprogram/pages/wrong/*`
- Modify: `miniprogram/pages/favorites/*`
- Modify: `miniprogram/pages/report/*`

- [ ] **Step 1: Implement wrong page**

Use `getStudyData('wrong')`, merge returned `questionId` values with local `questions`, and fall back to a mock list when cloud data is empty. Provide filters `all`, `chapter`, and `type`. The “错题重做” button navigates to `/pages/practice/practice?mode=wrong`.

- [ ] **Step 2: Implement favorites page**

Use `getStudyData('favorites')`, merge question favorites with local `questions`, and render cards like the screenshot. Provide filters `all`, `chapter`, and `type`. The bottom button opens the first favorited question in practice mode when available.

- [ ] **Step 3: Implement report page**

Use `getStudyData('report')`. If summary is empty, show example trend data:

```js
const demoTrend = [
  { date: '04-14', accuracy: 72 },
  { date: '04-15', accuracy: 76 },
  { date: '04-16', accuracy: 80 },
  { date: '04-17', accuracy: 85 },
  { date: '04-18', accuracy: 88 },
  { date: '04-19', accuracy: 90 },
  { date: '04-20', accuracy: 86 }
];
```

Render:

- trend line using simple positioned views or canvas
- 做题战绩: 325, 280, 85%
- 题型分布: single 120, multiple 60, uncertain 20

- [ ] **Step 4: Add empty and error states**

For all three pages:

```js
catch(() => {
  wx.showToast({ title: '学习数据加载失败', icon: 'none' });
  this.setData({ loading: false });
});
```

When the final list is empty, render `empty-state` with action text `去练习`.

- [ ] **Step 5: Verify user study pages**

In WeChat Developer Tools:

- Open wrong page. Expected: list or empty state appears, no crash if cloud function fails.
- Open favorites page. Expected: list or empty state appears, no crash if cloud function fails.
- Open report page. Expected: trend, stats, and distribution sections render even with no cloud data.

- [ ] **Step 6: Commit**

```powershell
git add miniprogram/pages/wrong miniprogram/pages/favorites miniprogram/pages/report
git commit -m "feat: build study pages"
```

## Task 8: Implement Material Detail and Sharing

**Files:**
- Modify: `miniprogram/pages/material-detail/*`
- Modify: `miniprogram/pages/materials/materials.js`

- [ ] **Step 1: Implement material detail data loading**

Use `options.id` to find the material from `materials`. If not found, show an empty state with `资料不存在`.

Core page data:

```js
const { materials } = require('../../data/materials');
const { toggleFavorite } = require('../../services/study');

Page({
  data: {
    material: null,
    activeTab: 'intro',
    favorited: false
  },
  onLoad(options) {
    const material = materials.find((item) => item.id === options.id) || materials[0];
    this.setData({ material });
  },
  switchTab(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab });
  },
  toggleFavorite() {
    toggleFavorite({ targetType: 'material', targetId: this.data.material.id })
      .then((res) => this.setData({ favorited: res.favorited }))
      .catch(() => wx.showToast({ title: '收藏同步失败', icon: 'none' }));
  },
  startLearning() {
    wx.showToast({ title: '资料阅读功能建设中', icon: 'none' });
  },
  onShareAppMessage() {
    return {
      title: this.data.material ? this.data.material.title : '医考通资料',
      path: `/pages/material-detail/material-detail?id=${this.data.material.id}`
    };
  }
});
```

- [ ] **Step 2: Implement detail layout**

Create a PDF icon card, title, size, learner count, favorite star, intro/catalog tabs, metadata rows, and bottom `分享` / `立即学习` action buttons.

- [ ] **Step 3: Verify material flow**

In WeChat Developer Tools:

1. Open materials tab.
2. Tap the first material.
3. Expected: detail page displays title, size, learner count, intro, and catalog.
4. Tap favorite.
5. Expected: favorite state changes or sync failure toast appears.
6. Tap 立即学习.
7. Expected: toast `资料阅读功能建设中`.

- [ ] **Step 4: Commit**

```powershell
git add miniprogram/pages/material-detail miniprogram/pages/materials
git commit -m "feat: add material detail page"
```

## Task 9: Final Verification and Polish

**Files:**
- Modify as needed: `miniprogram/pages/**/*.wxss`
- Modify as needed: `miniprogram/app.wxss`
- Modify: `README.md`

- [ ] **Step 1: Add README**

Create `README.md`:

```markdown
# 医考通小程序 MVP

微信原生小程序 MVP，包含首页、题库、章节练习、错题本、收藏、学习报告、资料、资料详情和我的页面。

## 配置

- AppID: `wxe7fec94bbc002874`
- CloudBase envId: `cloudbase-d0g4yo1qac1bbd1db`

## 运行

1. 使用微信开发者工具打开本仓库。
2. 确认小程序目录为 `miniprogram/`。
3. 确认云函数目录为 `cloudfunctions/`。
4. 在云开发控制台创建集合：`users`、`answer_records`、`wrong_questions`、`favorites`、`notes`、`study_summary`。
5. 上传并部署 `cloudfunctions/` 下的云函数。

## 首版限制

- 题库和资料使用本地数据模块。
- 会员中心仅展示，不接支付。
- 资料阅读功能显示建设中提示。
```

- [ ] **Step 2: Run syntax checks**

Run:

```powershell
node -e "require('./miniprogram/data/exams'); require('./miniprogram/data/chapters'); require('./miniprogram/data/questions'); require('./miniprogram/data/materials'); require('./miniprogram/utils/question'); require('./miniprogram/utils/date'); require('./miniprogram/utils/progress'); console.log('ok')"
```

Expected output:

```text
ok
```

- [ ] **Step 3: Inspect file inventory**

Run:

```powershell
rg --files miniprogram cloudfunctions | sort
```

Expected: files exist for all 9 pages, 5 cloud functions, data modules, utilities, services, and components.

- [ ] **Step 4: Manual visual verification**

In WeChat Developer Tools, verify:

- 首页 matches the screenshot structure: search row, blue banner, shortcut grid, stats, materials.
- 题库 shows subject selector, tabs, total progress, chapter rows.
- 章节练习 shows question options and answer card after submit.
- 错题本 and 收藏 pages show card lists or empty states.
- 学习报告 shows trend, stats, and distribution.
- 资料 and 资料详情 show category/list/detail structures.
- 我的 shows login/user area, member card, shortcuts, and menu rows.

- [ ] **Step 5: Commit final polish**

```powershell
git add README.md miniprogram cloudfunctions
git commit -m "chore: verify mini program mvp"
```

## Self-Review Notes

- Spec coverage: the plan covers scaffold, local data, CloudBase service layer, all 9 pages, login, answer records, wrong questions, favorites, notes, reports, material detail, sharing, empty/error states, and final verification.
- Scope: payment, PDF reader, cloud-hosted question bank, and admin tooling remain intentionally out of scope, matching the approved design.
- Type consistency: question IDs, chapter IDs, target favorite fields, and cloud function names match across data modules, services, pages, and cloud functions.
