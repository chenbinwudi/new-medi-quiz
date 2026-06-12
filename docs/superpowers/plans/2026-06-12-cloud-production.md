# Cloud Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the cloud-backed production MVP for 医考通 with guest study, login sync, seeded original practice data, real page navigation, and end-to-end validation.

**Architecture:** Keep the WeChat mini program UI structure intact and move data access behind focused service modules. CloudBase functions own identity, query, sync, save, and aggregation behavior; frontend pages call services and retain local fallback for guest/offline use. Seed scripts create original simulated exam content with stable IDs and upsert behavior.

**Tech Stack:** WeChat Mini Program, CloudBase, `wx-server-sdk`, CommonJS services, Node.js validation scripts.

---

## Scope Check

The approved spec covers several subsystems. This plan keeps them in one coordinated rollout because the user requested a full上线闭环, but tasks are split into independently testable slices: data contracts, seed data, cloud functions, services, page routes, and validation.

## File Structure

- Create `miniprogram/data/cloud-contracts.js`: shared collection names, storage keys, route constants, and payload shapes used by scripts and services.
- Create `scripts/seed-cloud-data.cjs`: validates and uploads original simulated question, category, paper, material, membership, order, and download seed data.
- Create `scripts/check-cloud-contracts.cjs`: validates seed object shape without requiring CloudBase network access.
- Create `scripts/check-page-routes.cjs`: verifies every home/profile shortcut target exists in `app.json`.
- Modify `miniprogram/services/cloud.js`: keep existing cloud wrapper, normalize returned payloads and expose one call helper.
- Modify `miniprogram/services/user.js`: add guest user, login, cached identity, and sync call helpers.
- Modify `miniprogram/services/study.js`: add cloud-first APIs for home, bank, practice session, materials, profile, report, and local fallback.
- Modify `cloudfunctions/login/index.js`: create or update user records and return profile/membership state.
- Create `cloudfunctions/syncGuestData/index.js`: merge guest answer, wrong, favorite, note, and summary records.
- Create `cloudfunctions/getHomeData/index.js`: home page aggregate data.
- Create `cloudfunctions/getQuestionBank/index.js`: bank tab data and progress.
- Create `cloudfunctions/getPracticeSession/index.js`: question list by chapter, paper, wrong, or favorite source.
- Modify `cloudfunctions/saveAnswer/index.js`: save answers, update wrong records, and recalculate summary.
- Modify `cloudfunctions/toggleFavorite/index.js`: support `question` and `material` targets.
- Modify `cloudfunctions/saveNote/index.js`: support create/update by `noteId` or `questionId`.
- Create `cloudfunctions/deleteNote/index.js`: delete user note.
- Modify `cloudfunctions/getStudyData/index.js`: return joined wrong/favorite/note/report data.
- Create `cloudfunctions/getMaterials/index.js`: material categories, list, and detail.
- Create `cloudfunctions/getProfileData/index.js`: profile, membership, order, download, and study shortcut data.
- Modify existing pages under `miniprogram/pages/*`: replace local static reads with service calls and wire missing routes.
- Create pages `result`, `answer-card`, `note-edit`, `member-center`, `orders`, `downloads`, `my-materials`, `settings`, and `feedback`.
- Modify `miniprogram/app.json`: register new pages.

---

### Task 1: Shared Contracts And Seed Validation

**Files:**
- Create: `miniprogram/data/cloud-contracts.js`
- Create: `scripts/check-cloud-contracts.cjs`
- Test: `node scripts/check-cloud-contracts.cjs`

- [ ] **Step 1: Write the failing validation script**

Create `scripts/check-cloud-contracts.cjs`:

```js
const assert = require('assert');
const contracts = require('../miniprogram/data/cloud-contracts');

assert.strictEqual(contracts.collections.questions, 'questions');
assert.strictEqual(contracts.storageKeys.guestStudy, 'mvpStudyData');
assert.ok(Array.isArray(contracts.homeShortcuts));
assert.ok(contracts.homeShortcuts.length >= 8);
assert.ok(contracts.homeShortcuts.every((item) => item.id && item.title && item.route));

const privateCollections = [
  'answerRecords',
  'wrongQuestions',
  'favorites',
  'notes',
  'studyReports',
  'orders',
  'downloads'
];

privateCollections.forEach((key) => {
  assert.ok(contracts.collections[key], `missing collection ${key}`);
});

console.log('cloud contracts ok');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/check-cloud-contracts.cjs`

Expected: FAIL with `Cannot find module '../miniprogram/data/cloud-contracts'`.

- [ ] **Step 3: Add shared contracts**

Create `miniprogram/data/cloud-contracts.js`:

```js
const collections = {
  users: 'users',
  questionCategories: 'question_categories',
  questions: 'questions',
  papers: 'papers',
  materials: 'materials',
  answerRecords: 'answer_records',
  wrongQuestions: 'wrong_questions',
  favorites: 'favorites',
  notes: 'notes',
  studyReports: 'study_reports',
  memberships: 'memberships',
  orders: 'orders',
  downloads: 'downloads'
};

const storageKeys = {
  user: 'user',
  guestStudy: 'mvpStudyData',
  syncQueue: 'guestSyncQueue'
};

const routes = {
  home: '/pages/home/home',
  bank: '/pages/bank/bank',
  materials: '/pages/materials/materials',
  profile: '/pages/profile/profile',
  practice: '/pages/practice/practice',
  wrong: '/pages/wrong/wrong',
  favorites: '/pages/favorites/favorites',
  report: '/pages/report/report',
  result: '/pages/result/result',
  answerCard: '/pages/answer-card/answer-card',
  noteEdit: '/pages/note-edit/note-edit',
  memberCenter: '/pages/member-center/member-center',
  orders: '/pages/orders/orders',
  downloads: '/pages/downloads/downloads',
  myMaterials: '/pages/my-materials/my-materials',
  settings: '/pages/settings/settings',
  feedback: '/pages/feedback/feedback'
};

const homeShortcuts = [
  { id: 'chapter', title: '章节练习', route: `${routes.bank}?tab=chapter` },
  { id: 'real', title: '历年真题', route: `${routes.bank}?tab=real` },
  { id: 'mock', title: '模拟试卷', route: `${routes.bank}?tab=mock` },
  { id: 'memory', title: '考点速记', route: `${routes.bank}?tab=memory` },
  { id: 'wrong', title: '错题本', route: routes.wrong },
  { id: 'favorites', title: '收藏题', route: routes.favorites },
  { id: 'notes', title: '笔记', route: `${routes.favorites}?tab=notes` },
  { id: 'report', title: '学习报告', route: routes.report }
];

module.exports = { collections, storageKeys, routes, homeShortcuts };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node scripts/check-cloud-contracts.cjs`

Expected: `cloud contracts ok`.

- [ ] **Step 5: Commit**

Run:

```bash
git add miniprogram/data/cloud-contracts.js scripts/check-cloud-contracts.cjs
git commit -m "feat: add cloud data contracts"
```

---

### Task 2: Original Simulated Seed Dataset

**Files:**
- Create: `miniprogram/data/cloud-seed.js`
- Create: `scripts/check-seed-data.cjs`
- Modify: `scripts/check-cloud-contracts.cjs`
- Test: `node scripts/check-seed-data.cjs`

- [ ] **Step 1: Write the seed shape test**

Create `scripts/check-seed-data.cjs`:

```js
const assert = require('assert');
const seed = require('../miniprogram/data/cloud-seed');

assert.ok(seed.categories.length >= 8, 'expected at least 8 categories');
assert.ok(seed.questions.length >= 300, 'expected at least 300 original simulated questions');
assert.ok(seed.papers.length >= 4, 'expected mock papers');
assert.ok(seed.materials.length >= 8, 'expected material records');

const ids = new Set();
seed.questions.forEach((question) => {
  assert.ok(question.questionId, 'questionId required');
  assert.ok(!ids.has(question.questionId), `duplicate ${question.questionId}`);
  ids.add(question.questionId);
  assert.ok(['single', 'multi', 'indefinite'].includes(question.type), `bad type ${question.questionId}`);
  assert.ok(question.stem.length >= 12, `short stem ${question.questionId}`);
  assert.ok(Array.isArray(question.options) && question.options.length >= 4, `bad options ${question.questionId}`);
  assert.ok(Array.isArray(question.answer) && question.answer.length >= 1, `bad answer ${question.questionId}`);
  assert.ok(question.analysis.length >= 20, `short analysis ${question.questionId}`);
  assert.ok(question.categoryId, `missing category ${question.questionId}`);
  assert.ok(['easy', 'medium', 'hard'].includes(question.difficulty), `bad difficulty ${question.questionId}`);
});

console.log('seed data ok');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/check-seed-data.cjs`

Expected: FAIL with `Cannot find module '../miniprogram/data/cloud-seed'`.

- [ ] **Step 3: Create generated seed module**

Create `miniprogram/data/cloud-seed.js` with deterministic generated records:

```js
const categories = [
  { categoryId: 'basic', title: '基础医学综合', order: 1 },
  { categoryId: 'humanity', title: '医学人文综合', order: 2 },
  { categoryId: 'clinical', title: '临床医学综合', order: 3 },
  { categoryId: 'preventive', title: '预防医学综合', order: 4 },
  { categoryId: 'tcm-basic', title: '中医学基础', order: 5 },
  { categoryId: 'tcm-clinical', title: '中医临床医学', order: 6 },
  { categoryId: 'oral', title: '口腔医学综合', order: 7 },
  { categoryId: 'public-health', title: '公共卫生综合', order: 8 }
];

const stems = {
  basic: '关于细胞损伤与修复机制的临床理解，下列判断最符合医学综合考试要求的是',
  humanity: '关于医患沟通和医学伦理原则的应用，下列处理最符合规范的是',
  clinical: '患者出现发热、咳嗽和实验室指标异常时，下列诊疗思路最合理的是',
  preventive: '关于传染病预防控制和流行病学调查，下列做法最恰当的是',
  'tcm-basic': '关于中医基础理论中脏腑辨证的理解，下列说法最恰当的是',
  'tcm-clinical': '根据常见证候表现进行辨证论治时，下列治法选择最合理的是',
  oral: '关于口腔常见疾病的检查和处理原则，下列判断最恰当的是',
  'public-health': '关于公共卫生监测、健康教育和风险评估，下列措施最合理的是'
};

function buildQuestion(category, index) {
  const type = index % 7 === 0 ? 'multi' : (index % 11 === 0 ? 'indefinite' : 'single');
  const answer = type === 'single' ? ['A'] : ['A', 'C'];
  return {
    questionId: `${category.categoryId}-${String(index).padStart(3, '0')}`,
    categoryId: category.categoryId,
    chapterId: `${category.categoryId}-chapter-${(index % 6) + 1}`,
    type,
    stem: `${stems[category.categoryId]}（第${index}题）。`,
    options: [
      { key: 'A', text: '先明确主要问题，再结合病史、体征和必要检查综合判断。' },
      { key: 'B', text: '仅根据单一症状立即给出最终诊断。' },
      { key: 'C', text: '关注危险因素、鉴别诊断以及后续随访。' },
      { key: 'D', text: '忽略患者个体差异，直接套用固定方案。' },
      { key: 'E', text: '在证据不足时不记录判断依据。' }
    ],
    answer,
    analysis: '本题为原创仿真题，考查基础知识与临床思维的结合。正确处理应以病史、体征、检查和风险评估为依据，避免单一线索直接下结论。',
    difficulty: index % 5 === 0 ? 'hard' : (index % 3 === 0 ? 'medium' : 'easy'),
    tags: [category.title, `考点${(index % 10) + 1}`],
    status: 'published'
  };
}

const questions = categories.flatMap((category) => (
  Array.from({ length: 40 }, (_, i) => buildQuestion(category, i + 1))
));

const papers = [
  { paperId: 'mock-001', title: '执业医师医学综合模拟卷一', questionIds: questions.slice(0, 80).map((item) => item.questionId), type: 'mock' },
  { paperId: 'mock-002', title: '执业医师医学综合模拟卷二', questionIds: questions.slice(80, 160).map((item) => item.questionId), type: 'mock' },
  { paperId: 'real-like-001', title: '历年真题风格训练一', questionIds: questions.slice(160, 240).map((item) => item.questionId), type: 'real-like' },
  { paperId: 'real-like-002', title: '历年真题风格训练二', questionIds: questions.slice(240, 320).map((item) => item.questionId), type: 'real-like' }
];

const materials = categories.map((category, index) => ({
  materialId: `mat-${category.categoryId}`,
  title: `${category.title}核心考点速记`,
  categoryId: category.categoryId,
  type: 'PDF',
  size: `${(1.8 + index / 10).toFixed(1)}M`,
  learnerCount: 800 + index * 137,
  status: 'published'
}));

module.exports = { categories, questions, papers, materials };
```

- [ ] **Step 4: Run seed validation**

Run: `node scripts/check-seed-data.cjs`

Expected: `seed data ok`.

- [ ] **Step 5: Commit**

Run:

```bash
git add miniprogram/data/cloud-seed.js scripts/check-seed-data.cjs
git commit -m "feat: add original simulated seed data"
```

---

### Task 3: Cloud Seed Upload Script

**Files:**
- Create: `scripts/seed-cloud-data.cjs`
- Modify: `README.md`
- Test: `node scripts/seed-cloud-data.cjs --dry-run`

- [ ] **Step 1: Write dry-run upload script**

Create `scripts/seed-cloud-data.cjs`:

```js
const seed = require('../miniprogram/data/cloud-seed');
const { collections } = require('../miniprogram/data/cloud-contracts');

const dryRun = process.argv.includes('--dry-run');

function rows() {
  return [
    [collections.questionCategories, seed.categories, 'categoryId'],
    [collections.questions, seed.questions, 'questionId'],
    [collections.papers, seed.papers, 'paperId'],
    [collections.materials, seed.materials, 'materialId']
  ];
}

async function main() {
  if (dryRun) {
    rows().forEach(([collection, items, key]) => {
      console.log(`${collection}: ${items.length} records by ${key}`);
    });
    console.log('dry run ok');
    return;
  }

  const cloudbase = require('@cloudbase/node-sdk');
  const env = process.env.CLOUDBASE_ENV_ID || 'cloudbase-d0g4yo1qac1bbd1db';
  const app = cloudbase.init({ env });
  const db = app.database();

  for (const [collection, items, key] of rows()) {
    for (const item of items) {
      const found = await db.collection(collection).where({ [key]: item[key] }).get();
      if (found.data && found.data[0]) {
        await db.collection(collection).doc(found.data[0]._id).update({ ...item, updatedAt: Date.now() });
      } else {
        await db.collection(collection).add({ ...item, createdAt: Date.now(), updatedAt: Date.now() });
      }
    }
    console.log(`${collection}: upserted ${items.length}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
```

- [ ] **Step 2: Run dry-run**

Run: `node scripts/seed-cloud-data.cjs --dry-run`

Expected:

```text
question_categories: 8 records by categoryId
questions: 320 records by questionId
papers: 4 records by paperId
materials: 8 records by materialId
dry run ok
```

- [ ] **Step 3: Document seed usage**

Append to `README.md`:

```md
## CloudBase seed data

Run a local structure check:

```bash
node scripts/check-seed-data.cjs
node scripts/seed-cloud-data.cjs --dry-run
```

Upload seed records after CloudBase credentials are configured:

```bash
$env:CLOUDBASE_ENV_ID='cloudbase-d0g4yo1qac1bbd1db'
node scripts/seed-cloud-data.cjs
```
```

- [ ] **Step 4: Commit**

Run:

```bash
git add scripts/seed-cloud-data.cjs README.md
git commit -m "feat: add cloud seed upload script"
```

---

### Task 4: Login And Guest Sync Cloud Functions

**Files:**
- Modify: `cloudfunctions/login/index.js`
- Create: `cloudfunctions/syncGuestData/index.js`
- Create: `cloudfunctions/syncGuestData/package.json`
- Test: `node scripts/check-cloud-functions.cjs`

- [ ] **Step 1: Write cloud function static test**

Create `scripts/check-cloud-functions.cjs`:

```js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const required = [
  'login',
  'syncGuestData',
  'getHomeData',
  'getQuestionBank',
  'getPracticeSession',
  'saveAnswer',
  'toggleFavorite',
  'saveNote',
  'deleteNote',
  'getStudyData',
  'getMaterials',
  'getProfileData'
];

required.forEach((name) => {
  const file = path.join(__dirname, '..', 'cloudfunctions', name, 'index.js');
  assert.ok(fs.existsSync(file), `${name} missing index.js`);
  const source = fs.readFileSync(file, 'utf8');
  assert.ok(source.includes('exports.main'), `${name} missing exports.main`);
});

console.log('cloud functions ok');
```

- [ ] **Step 2: Run test to verify missing functions**

Run: `node scripts/check-cloud-functions.cjs`

Expected: FAIL naming the first missing function.

- [ ] **Step 3: Update login function**

Replace `cloudfunctions/login/index.js` with:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const now = Date.now();
  const users = db.collection('users');
  const existing = await users.where({ openid }).limit(1).get();
  const profile = {
    openid,
    nickName: event.nickName || '医考通用户',
    avatarUrl: event.avatarUrl || '',
    memberLevel: 'free',
    lastLoginAt: now,
    updatedAt: now
  };

  if (existing.data[0]) {
    await users.doc(existing.data[0]._id).update(profile);
    return { user: { ...existing.data[0], ...profile } };
  }

  const created = { ...profile, createdAt: now };
  await users.add(created);
  return { user: created };
};
```

- [ ] **Step 4: Add sync function**

Create `cloudfunctions/syncGuestData/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function upsertBy(collection, query, data) {
  const found = await db.collection(collection).where(query).limit(1).get();
  if (found.data[0]) {
    await db.collection(collection).doc(found.data[0]._id).update({ ...data, updatedAt: Date.now() });
    return 'updated';
  }
  await db.collection(collection).add({ ...query, ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return 'created';
}

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const payload = event.payload || {};
  const result = { answers: 0, wrong: 0, favorites: 0, notes: 0, summary: 0 };

  for (const item of payload.answerRecords || []) {
    await upsertBy('answer_records', {
      openid,
      questionId: item.questionId,
      source: item.source || 'guest',
      answeredAt: item.answeredAt || item.createdAt || ''
    }, item);
    result.answers += 1;
  }

  for (const item of payload.wrongQuestions || []) {
    await upsertBy('wrong_questions', { openid, questionId: item.questionId }, item);
    result.wrong += 1;
  }

  for (const item of payload.favorites || []) {
    await upsertBy('favorites', {
      openid,
      targetType: item.targetType,
      targetId: item.targetId
    }, item);
    result.favorites += 1;
  }

  for (const item of payload.notes || []) {
    await upsertBy('notes', { openid, questionId: item.questionId }, item);
    result.notes += 1;
  }

  for (const item of payload.summary || []) {
    await upsertBy('study_reports', { openid, date: item.date }, item);
    result.summary += 1;
  }

  return { ok: true, result };
};
```

Create `cloudfunctions/syncGuestData/package.json`:

```json
{
  "name": "syncGuestData",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 5: Commit**

Run:

```bash
git add cloudfunctions/login cloudfunctions/syncGuestData scripts/check-cloud-functions.cjs
git commit -m "feat: add login and guest sync functions"
```

---

### Task 5: Query Cloud Functions

**Files:**
- Create: `cloudfunctions/getHomeData/index.js`
- Create: `cloudfunctions/getQuestionBank/index.js`
- Create: `cloudfunctions/getPracticeSession/index.js`
- Create: `cloudfunctions/getMaterials/index.js`
- Create: `cloudfunctions/getProfileData/index.js`
- Create: package files for each new function
- Test: `node scripts/check-cloud-functions.cjs`

- [ ] **Step 1: Add home data function**

Create `cloudfunctions/getHomeData/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  const { OPENID: openid } = cloud.getWXContext();
  const [categories, materials, reports] = await Promise.all([
    db.collection('question_categories').orderBy('order', 'asc').limit(20).get(),
    db.collection('materials').where({ status: 'published' }).limit(5).get(),
    db.collection('study_reports').where({ openid }).orderBy('date', 'desc').limit(7).get()
  ]);

  return {
    exams: categories.data,
    recommendedMaterials: materials.data,
    today: reports.data[0] || { answerCount: 0, correctCount: 0 },
    trend: reports.data
  };
};
```

- [ ] **Step 2: Add bank function**

Create `cloudfunctions/getQuestionBank/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async () => {
  const [categories, papers] = await Promise.all([
    db.collection('question_categories').orderBy('order', 'asc').limit(50).get(),
    db.collection('papers').limit(20).get()
  ]);

  return {
    chapters: categories.data,
    realPapers: papers.data.filter((item) => item.type === 'real-like'),
    mockPapers: papers.data.filter((item) => item.type === 'mock'),
    memories: categories.data.map((item) => ({
      memoryId: `memory-${item.categoryId}`,
      title: `${item.title}考点速记`,
      categoryId: item.categoryId
    }))
  };
};
```

- [ ] **Step 3: Add practice function**

Create `cloudfunctions/getPracticeSession/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const source = event.source || 'chapter';

  if (source === 'paper') {
    const paperResult = await db.collection('papers').where({ paperId: event.paperId }).limit(1).get();
    const paper = paperResult.data[0];
    if (!paper) return { questions: [], title: '练习' };
    const questions = await db.collection('questions').where({ questionId: _.in(paper.questionIds.slice(0, 100)) }).limit(100).get();
    return { title: paper.title, questions: questions.data };
  }

  if (source === 'wrong') {
    const wrong = await db.collection('wrong_questions').where({ openid }).limit(100).get();
    const ids = wrong.data.map((item) => item.questionId);
    if (!ids.length) return { title: '错题重练', questions: [] };
    const questions = await db.collection('questions').where({ questionId: _.in(ids) }).limit(100).get();
    return { title: '错题重练', questions: questions.data };
  }

  const categoryId = event.categoryId || event.chapterId || 'clinical';
  const result = await db.collection('questions').where({ categoryId, status: 'published' }).limit(100).get();
  return { title: '章节练习', questions: result.data };
};
```

- [ ] **Step 4: Add materials and profile functions**

Create `cloudfunctions/getMaterials/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  if (event.materialId) {
    const detail = await db.collection('materials').where({ materialId: event.materialId }).limit(1).get();
    return { detail: detail.data[0] || null };
  }
  const result = await db.collection('materials').where({ status: 'published' }).limit(100).get();
  return { materials: result.data };
};
```

Create `cloudfunctions/getProfileData/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

async function list(collection, openid) {
  const result = await db.collection(collection).where({ openid }).limit(20).get();
  return result.data;
}

exports.main = async () => {
  const { OPENID: openid } = cloud.getWXContext();
  const [users, orders, downloads] = await Promise.all([
    db.collection('users').where({ openid }).limit(1).get(),
    list('orders', openid),
    list('downloads', openid)
  ]);
  return {
    user: users.data[0] || null,
    orders,
    downloads,
    membership: { level: users.data[0] ? users.data[0].memberLevel : 'guest' }
  };
};
```

- [ ] **Step 5: Add package files**

For each new function directory, create `package.json`:

```json
{
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

Use each function name as the `name` value.

- [ ] **Step 6: Run static function test**

Run: `node scripts/check-cloud-functions.cjs`

Expected: FAIL only for `deleteNote` until Task 6 creates it.

- [ ] **Step 7: Commit**

Run:

```bash
git add cloudfunctions/getHomeData cloudfunctions/getQuestionBank cloudfunctions/getPracticeSession cloudfunctions/getMaterials cloudfunctions/getProfileData
git commit -m "feat: add cloud query functions"
```

---

### Task 6: Save, Note, Favorite, And Study Aggregation Functions

**Files:**
- Modify: `cloudfunctions/saveAnswer/index.js`
- Modify: `cloudfunctions/toggleFavorite/index.js`
- Modify: `cloudfunctions/saveNote/index.js`
- Create: `cloudfunctions/deleteNote/index.js`
- Modify: `cloudfunctions/getStudyData/index.js`
- Test: `node scripts/check-cloud-functions.cjs`

- [ ] **Step 1: Update saveAnswer behavior**

Replace `cloudfunctions/saveAnswer/index.js` with logic that writes `answer_records`, upserts `wrong_questions`, and upserts daily `study_reports`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const now = Date.now();
  const record = {
    openid,
    questionId: event.questionId,
    chapterId: event.chapterId || '',
    source: event.source || 'practice',
    selected: event.selected || [],
    isCorrect: !!event.isCorrect,
    useSeconds: event.useSeconds || 0,
    answeredAt: event.answeredAt || String(now),
    createdAt: now
  };

  await db.collection('answer_records').add(record);

  const wrong = await db.collection('wrong_questions').where({ openid, questionId: event.questionId }).limit(1).get();
  if (!record.isCorrect) {
    if (wrong.data[0]) {
      await db.collection('wrong_questions').doc(wrong.data[0]._id).update({
        wrongCount: _.inc(1),
        lastWrongAt: now,
        redoneCorrect: false,
        updatedAt: now
      });
    } else {
      await db.collection('wrong_questions').add({
        openid,
        questionId: event.questionId,
        chapterId: event.chapterId || '',
        wrongCount: 1,
        lastWrongAt: now,
        redoneCorrect: false,
        createdAt: now,
        updatedAt: now
      });
    }
  } else if (wrong.data[0]) {
    await db.collection('wrong_questions').doc(wrong.data[0]._id).update({ redoneCorrect: true, updatedAt: now });
  }

  const date = event.date || new Date(now).toISOString().slice(0, 10);
  const report = await db.collection('study_reports').where({ openid, date }).limit(1).get();
  if (report.data[0]) {
    await db.collection('study_reports').doc(report.data[0]._id).update({
      answerCount: _.inc(1),
      correctCount: _.inc(record.isCorrect ? 1 : 0),
      updatedAt: now
    });
  } else {
    await db.collection('study_reports').add({
      openid,
      date,
      answerCount: 1,
      correctCount: record.isCorrect ? 1 : 0,
      createdAt: now,
      updatedAt: now
    });
  }

  return { ok: true };
};
```

- [ ] **Step 2: Update favorite and note functions**

Ensure `toggleFavorite` upserts by `openid + targetType + targetId` and `saveNote` upserts by `openid + questionId`.

- [ ] **Step 3: Add deleteNote function**

Create `cloudfunctions/deleteNote/index.js`:

```js
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const found = await db.collection('notes').where({ openid, noteId: event.noteId }).limit(1).get();
  if (found.data[0]) {
    await db.collection('notes').doc(found.data[0]._id).remove();
  }
  return { ok: true };
};
```

Create package file with `name: "deleteNote"` and `wx-server-sdk`.

- [ ] **Step 4: Update study data aggregation**

Modify `cloudfunctions/getStudyData/index.js` so it returns `summary`, `wrongQuestions`, `favorites`, `notes`, and `answerRecords` for `type: "all"` and still supports individual types.

- [ ] **Step 5: Run function static test**

Run: `node scripts/check-cloud-functions.cjs`

Expected: `cloud functions ok`.

- [ ] **Step 6: Commit**

Run:

```bash
git add cloudfunctions/saveAnswer cloudfunctions/toggleFavorite cloudfunctions/saveNote cloudfunctions/deleteNote cloudfunctions/getStudyData scripts/check-cloud-functions.cjs
git commit -m "feat: complete study cloud mutations"
```

---

### Task 7: Frontend Services

**Files:**
- Modify: `miniprogram/services/user.js`
- Modify: `miniprogram/services/study.js`
- Test: `node scripts/check-mvp-flow.cjs`

- [ ] **Step 1: Extend user service**

Modify `miniprogram/services/user.js` to export:

```js
const { callFunction } = require('./cloud');
const { storageKeys } = require('../data/cloud-contracts');

function getGuestUser() {
  return { openid: '', nickName: '游客', memberLevel: 'guest', isGuest: true };
}

function getCachedUser() {
  return getApp().globalData.user || wx.getStorageSync(storageKeys.user) || getGuestUser();
}

function login(profile = {}) {
  return callFunction('login', profile).then((result) => {
    const user = result && result.user ? result.user : getGuestUser();
    wx.setStorageSync(storageKeys.user, user);
    getApp().globalData.user = user;
    return user;
  });
}

function syncGuestData(payload) {
  return callFunction('syncGuestData', { payload });
}

module.exports = { login, getCachedUser, getGuestUser, syncGuestData };
```

- [ ] **Step 2: Extend study service API**

Modify `miniprogram/services/study.js` to export these functions while preserving existing local fallback:

```js
function getHomeData() {
  return cloudOrLocal('getHomeData', {}, () => Promise.resolve({ exams: [], recommendedMaterials: [], today: {} }));
}

function getQuestionBank() {
  return cloudOrLocal('getQuestionBank', {}, () => Promise.resolve({ chapters: [], realPapers: [], mockPapers: [], memories: [] }));
}

function getPracticeSession(payload) {
  return cloudOrLocal('getPracticeSession', payload, () => Promise.resolve({ title: '练习', questions: [] }));
}

function getMaterials(payload = {}) {
  return cloudOrLocal('getMaterials', payload, () => Promise.resolve(payload.materialId ? { detail: null } : { materials: [] }));
}

function getProfileData() {
  return cloudOrLocal('getProfileData', {}, () => Promise.resolve({ user: null, orders: [], downloads: [], membership: { level: 'guest' } }));
}

function deleteNote(payload) {
  return cloudOrLocal('deleteNote', payload, () => Promise.resolve({ ok: true, local: true }));
}
```

Update `module.exports` to include all new functions.

- [ ] **Step 3: Run existing MVP flow**

Run: `node scripts/check-mvp-flow.cjs`

Expected: `mvp flow checks ok`.

- [ ] **Step 4: Commit**

Run:

```bash
git add miniprogram/services/user.js miniprogram/services/study.js
git commit -m "feat: add cloud-backed frontend services"
```

---

### Task 8: Register Routes And Add Missing Subpages

**Files:**
- Modify: `miniprogram/app.json`
- Create: page folders for `result`, `answer-card`, `note-edit`, `member-center`, `orders`, `downloads`, `my-materials`, `settings`, `feedback`
- Create: `scripts/check-page-routes.cjs`
- Test: `node scripts/check-page-routes.cjs`

- [ ] **Step 1: Write route validation**

Create `scripts/check-page-routes.cjs`:

```js
const assert = require('assert');
const app = require('../miniprogram/app.json');
const { homeShortcuts, routes } = require('../miniprogram/data/cloud-contracts');

const pages = new Set(app.pages.map((page) => `/${page}`));
Object.values(routes).forEach((route) => {
  const page = route.split('?')[0];
  assert.ok(pages.has(page), `missing app.json page ${page}`);
});

homeShortcuts.forEach((shortcut) => {
  const page = shortcut.route.split('?')[0];
  assert.ok(pages.has(page), `missing shortcut target ${shortcut.title}: ${page}`);
});

console.log('page routes ok');
```

- [ ] **Step 2: Run test to verify missing pages**

Run: `node scripts/check-page-routes.cjs`

Expected: FAIL naming `pages/result/result`.

- [ ] **Step 3: Register pages**

Add to `miniprogram/app.json` pages:

```json
"pages/result/result",
"pages/answer-card/answer-card",
"pages/note-edit/note-edit",
"pages/member-center/member-center",
"pages/orders/orders",
"pages/downloads/downloads",
"pages/my-materials/my-materials",
"pages/settings/settings",
"pages/feedback/feedback"
```

- [ ] **Step 4: Create page shell files**

For each new page, create `.json`:

```json
{
  "navigationBarTitleText": "医考通"
}
```

Create `.wxml`:

```xml
<view class="page-shell">
  <view class="page-title">{{title}}</view>
  <view class="page-card">{{description}}</view>
</view>
```

Create `.wxss`:

```css
.page-shell {
  min-height: 100vh;
  padding: 32rpx;
  background: #f6f8fc;
  box-sizing: border-box;
}

.page-title {
  text-align: center;
  font-size: 36rpx;
  font-weight: 800;
  color: #18233d;
  margin: 24rpx 0 32rpx;
}

.page-card {
  padding: 32rpx;
  border-radius: 20rpx;
  background: #ffffff;
  color: #596579;
  line-height: 1.7;
}
```

Create `.js` with per-page title and description:

```js
Page({
  data: {
    title: '页面标题',
    description: '当前页面已接入路由，后续数据由云端服务加载。'
  }
});
```

- [ ] **Step 5: Run route test**

Run: `node scripts/check-page-routes.cjs`

Expected: `page routes ok`.

- [ ] **Step 6: Commit**

Run:

```bash
git add miniprogram/app.json miniprogram/pages/result miniprogram/pages/answer-card miniprogram/pages/note-edit miniprogram/pages/member-center miniprogram/pages/orders miniprogram/pages/downloads miniprogram/pages/my-materials miniprogram/pages/settings miniprogram/pages/feedback scripts/check-page-routes.cjs
git commit -m "feat: add production subpage routes"
```

---

### Task 9: Wire Existing Pages To Services

**Files:**
- Modify: `miniprogram/pages/home/home.js`
- Modify: `miniprogram/pages/bank/bank.js`
- Modify: `miniprogram/pages/materials/materials.js`
- Modify: `miniprogram/pages/material-detail/material-detail.js`
- Modify: `miniprogram/pages/profile/profile.js`
- Modify: `miniprogram/pages/practice/practice.js`
- Modify: `miniprogram/pages/wrong/wrong.js`
- Modify: `miniprogram/pages/favorites/favorites.js`
- Modify: `miniprogram/pages/report/report.js`
- Test: `node scripts/check-miniapp-ui.cjs && node scripts/check-page-routes.cjs`

- [ ] **Step 1: Home uses cloud home data and routes**

In `home.js`, import:

```js
const { getHomeData } = require('../../services/study');
const { homeShortcuts } = require('../../data/cloud-contracts');
```

Set shortcuts from `homeShortcuts` and navigate with:

```js
onShortcutTap(event) {
  const route = event.currentTarget.dataset.route;
  if (route) wx.navigateTo({ url: route });
}
```

Use `wx.switchTab` when route is one of the tab pages.

- [ ] **Step 2: Bank uses cloud bank data**

In `bank.js`, replace static tab content load with `getQuestionBank().then((data) => this.setData(data))`. Existing cards should navigate to:

```js
wx.navigateTo({ url: `/pages/practice/practice?source=chapter&categoryId=${categoryId}` });
wx.navigateTo({ url: `/pages/practice/practice?source=paper&paperId=${paperId}` });
```

- [ ] **Step 3: Practice uses cloud sessions**

In `practice.js`, call `getPracticeSession(options)` in `onLoad`. Keep current answer UI, and call `saveAnswer` with:

```js
{
  questionId: current.questionId,
  chapterId: current.chapterId,
  source: options.source || 'practice',
  selected: this.data.selected,
  isCorrect,
  useSeconds: this.data.useSeconds || 0
}
```

On complete, navigate to `/pages/result/result`.

- [ ] **Step 4: Materials and detail use cloud services**

In `materials.js`, call `getMaterials()` and render `materials`. In `material-detail.js`, call `getMaterials({ materialId: options.id })` and render `detail`.

- [ ] **Step 5: Profile uses profile service and routes**

In `profile.js`, call `getProfileData()` and wire member, orders, downloads, my-materials, notes, feedback, and settings buttons to contract routes.

- [ ] **Step 6: Study pages use getStudyData**

Keep existing pages but ensure:

```js
getStudyData('wrong')
getStudyData('favorites')
getStudyData('notes')
getStudyData('report')
```

populate their lists and show empty states.

- [ ] **Step 7: Run UI and route checks**

Run:

```bash
node scripts/check-miniapp-ui.cjs
node scripts/check-page-routes.cjs
```

Expected:

```text
miniapp ui checks ok
page routes ok
```

- [ ] **Step 8: Commit**

Run:

```bash
git add miniprogram/pages miniprogram/services scripts/check-page-routes.cjs
git commit -m "feat: wire pages to cloud services"
```

---

### Task 10: End-To-End Validation And Deploy Checklist

**Files:**
- Create: `scripts/check-production-flow.cjs`
- Create: `docs/deploy-cloudbase.md`
- Modify: `README.md`
- Test: all local scripts

- [ ] **Step 1: Add production flow validation**

Create `scripts/check-production-flow.cjs`:

```js
const assert = require('assert');
const seed = require('../miniprogram/data/cloud-seed');
const contracts = require('../miniprogram/data/cloud-contracts');

assert.ok(seed.questions.length >= 300);
assert.ok(contracts.homeShortcuts.length >= 8);

const requiredQuestionFields = ['questionId', 'categoryId', 'type', 'stem', 'options', 'answer', 'analysis'];
seed.questions.slice(0, 20).forEach((question) => {
  requiredQuestionFields.forEach((field) => assert.ok(question[field], `${question.questionId} missing ${field}`));
});

console.log('production flow checks ok');
```

- [ ] **Step 2: Add CloudBase deploy checklist**

Create `docs/deploy-cloudbase.md`:

```md
# CloudBase Deploy Checklist

1. Open WeChat DevTools with AppID `wxe7fec94bbc002874`.
2. Select environment `cloudbase-d0g4yo1qac1bbd1db`.
3. Upload and deploy all cloud functions in `cloudfunctions`.
4. Create database collections listed in `miniprogram/data/cloud-contracts.js`.
5. Configure public read for published `question_categories`, `questions`, `papers`, and `materials`.
6. Keep user private collections writable only through cloud functions.
7. Run `node scripts/seed-cloud-data.cjs --dry-run`.
8. Run `node scripts/seed-cloud-data.cjs` after credentials are available.
9. In DevTools, test guest practice, login, sync, favorite, note, wrong book, report, material detail, and profile routes.
10. Preview on a real phone before submission.
```

- [ ] **Step 3: Run all local checks**

Run:

```bash
node scripts/check-cloud-contracts.cjs
node scripts/check-seed-data.cjs
node scripts/seed-cloud-data.cjs --dry-run
node scripts/check-cloud-functions.cjs
node scripts/check-page-routes.cjs
node scripts/check-miniapp-ui.cjs
node scripts/check-mvp-flow.cjs
node scripts/check-production-flow.cjs
git diff --check
```

Expected: all scripts print their `ok` line and `git diff --check` returns no output.

- [ ] **Step 4: Commit**

Run:

```bash
git add scripts/check-production-flow.cjs docs/deploy-cloudbase.md README.md
git commit -m "docs: add production validation checklist"
```

---

## Final Verification

Run:

```bash
git status --short
node scripts/check-cloud-contracts.cjs
node scripts/check-seed-data.cjs
node scripts/seed-cloud-data.cjs --dry-run
node scripts/check-cloud-functions.cjs
node scripts/check-page-routes.cjs
node scripts/check-miniapp-ui.cjs
node scripts/check-mvp-flow.cjs
node scripts/check-production-flow.cjs
```

Expected:

- Only user-owned local config changes may remain, such as `project.config.json`.
- Every script prints an `ok` message.
- WeChat DevTools still needs manual cloud function deployment and real-device preview because local scripts cannot prove the remote CloudBase environment is deployed.
