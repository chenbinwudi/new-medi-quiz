# 医考通小程序 UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the 医考通 mini program UI into a unified medical blue-white visual system with a complete SVG icon set and page-by-page polish across all 9 pages.

**Architecture:** Keep the existing WeChat native mini program and data/cloud function structure. Add a shared SVG icon asset layer under `miniprogram/assets/icons/`, strengthen global visual tokens in `miniprogram/app.wxss`, then update page WXML/JS/WXSS to consume shared style classes and precomputed display fields. Avoid complex WXML expressions and avoid committing WeChat Developer Tools private config.

**Tech Stack:** WeChat native Mini Program (`WXML/WXSS/JS`), standalone SVG files, no third-party UI framework.

---

## File Structure

The UI pass touches these areas:

```text
miniprogram/app.json                         # tabBar icon paths
miniprogram/app.wxss                         # visual tokens and shared UI classes
miniprogram/assets/icons/*.svg               # generated icon system
miniprogram/components/seg-tabs/*            # refined tabs
miniprogram/components/empty-state/*         # refined empty state
miniprogram/components/stat-card/*           # refined metric item
miniprogram/data/materials.js                # icon path metadata
miniprogram/pages/home/*                     # homepage UI
miniprogram/pages/bank/*                     # question bank UI
miniprogram/pages/practice/*                 # practice UI
miniprogram/pages/wrong/*                    # wrong book UI
miniprogram/pages/favorites/*                # favorites UI
miniprogram/pages/report/*                   # report UI
miniprogram/pages/materials/*                # materials UI
miniprogram/pages/material-detail/*          # material detail UI
miniprogram/pages/profile/*                  # profile UI
scripts/check-miniapp-ui.cjs                 # local syntax and UI invariant checks
```

Do not stage `project.config.json` unless the user explicitly asks to commit WeChat Developer Tools settings.

## Task 1: Add UI Invariant Checker

**Files:**
- Create: `scripts/check-miniapp-ui.cjs`

- [ ] **Step 1: Create the checker**

Create `scripts/check-miniapp-ui.cjs`:

```js
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = process.cwd();
const requiredIcons = [
  'tab-home.svg', 'tab-home-active.svg', 'tab-bank.svg', 'tab-bank-active.svg',
  'tab-materials.svg', 'tab-materials-active.svg', 'tab-profile.svg', 'tab-profile-active.svg',
  'chapter.svg', 'real-paper.svg', 'mock-paper.svg', 'quick-notes.svg',
  'wrong-book.svg', 'favorite.svg', 'note.svg', 'record.svg', 'report.svg',
  'outline.svg', 'book.svg', 'summary.svg', 'mindmap.svg', 'memory.svg',
  'analysis.svg', 'guide.svg', 'more.svg', 'search.svg', 'back.svg',
  'star.svg', 'star-filled.svg', 'edit.svg', 'answer-card.svg', 'share.svg',
  'download.svg', 'settings.svg', 'order.svg', 'folder.svg'
];

function walk(dir, predicate) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file);
    if (stat.isDirectory()) out = out.concat(walk(file, predicate));
    else if (!predicate || predicate(file)) out.push(file);
  }
  return out;
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

for (const file of walk(path.join(root, 'miniprogram'), (p) => /\.(js|json)$/.test(p)).concat(walk(path.join(root, 'cloudfunctions'), (p) => /\.(js|json)$/.test(p))).concat([path.join(root, 'project.config.json')])) {
  try {
    if (file.endsWith('.json')) JSON.parse(fs.readFileSync(file, 'utf8'));
    else cp.execFileSync('node', ['--check', file], { stdio: 'pipe' });
  } catch (error) {
    fail(`Syntax check failed: ${path.relative(root, file)}\n${error.stderr ? error.stderr.toString() : error.message}`);
  }
}

for (const file of walk(path.join(root, 'miniprogram'), (p) => p.endsWith('.wxml'))) {
  const text = fs.readFileSync(file, 'utf8');
  const risky = [/\? .*:/, /===/, /&&/, /index\s*\+\s*1/].find((pattern) => pattern.test(text));
  if (risky) fail(`Risky WXML expression in ${path.relative(root, file)}: ${risky}`);
}

for (const icon of requiredIcons) {
  const file = path.join(root, 'miniprogram', 'assets', 'icons', icon);
  if (!fs.existsSync(file)) fail(`Missing icon: miniprogram/assets/icons/${icon}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log('miniapp ui checks ok');
```

- [ ] **Step 2: Run the checker to verify it fails before icons exist**

Run:

```powershell
node scripts/check-miniapp-ui.cjs
```

Expected: FAIL with at least `Missing icon: miniprogram/assets/icons/tab-home.svg`.

- [ ] **Step 3: Commit the checker**

```powershell
git add scripts/check-miniapp-ui.cjs
git commit -m "test: add miniapp ui invariant checker"
```

## Task 2: Generate SVG Icon System

**Files:**
- Create: `miniprogram/assets/icons/*.svg`
- Modify: `miniprogram/app.json`

- [ ] **Step 1: Create the icon directory**

Run:

```powershell
New-Item -ItemType Directory -Force -Path miniprogram/assets/icons
```

- [ ] **Step 2: Generate tab icons**

Create the following tab SVG files. Use `#8A94A6` for default icons and `#2F7BFF` for active icons:

```text
tab-home.svg
tab-home-active.svg
tab-bank.svg
tab-bank-active.svg
tab-materials.svg
tab-materials-active.svg
tab-profile.svg
tab-profile-active.svg
```

Each file must be a standalone SVG with this shape style:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="14" fill="none"/>
  <path d="M10 23L24 11l14 12v14a3 3 0 0 1-3 3h-7V29h-8v11h-7a3 3 0 0 1-3-3V23z" fill="none" stroke="#8A94A6" stroke-width="3" stroke-linejoin="round"/>
</svg>
```

For active home, change the stroke to `#2F7BFF` and add a light fill such as `fill="#EAF2FF"` on the `rect`.

- [ ] **Step 3: Generate study, material, and action icons**

Create all icons listed in the spec:

```text
chapter.svg real-paper.svg mock-paper.svg quick-notes.svg wrong-book.svg favorite.svg note.svg record.svg report.svg
outline.svg book.svg summary.svg mindmap.svg memory.svg analysis.svg guide.svg more.svg
search.svg back.svg star.svg star-filled.svg edit.svg answer-card.svg share.svg download.svg settings.svg order.svg folder.svg
```

Each icon must use `viewBox="0 0 48 48"`, `stroke-width="3"`, rounded line caps/joins, and a simple recognizable shape. Entry icons may include a pale filled rounded square:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect x="4" y="4" width="40" height="40" rx="14" fill="#EAF2FF"/>
  <path d="M17 14h12l5 5v15H17V14z" fill="#fff" stroke="#2F7BFF" stroke-width="3" stroke-linejoin="round"/>
  <path d="M29 14v6h6" fill="none" stroke="#2F7BFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 4: Wire tabBar icons**

Update `miniprogram/app.json` tabBar list entries:

```json
{
  "pagePath": "pages/home/home",
  "text": "首页",
  "iconPath": "assets/icons/tab-home.svg",
  "selectedIconPath": "assets/icons/tab-home-active.svg"
}
```

Repeat for bank, materials, and profile.

- [ ] **Step 5: Verify icon coverage**

Run:

```powershell
node scripts/check-miniapp-ui.cjs
```

Expected: FAIL only if later page WXML still has risky expressions; no `Missing icon` messages.

- [ ] **Step 6: Commit icons**

```powershell
git add miniprogram/assets/icons miniprogram/app.json
git commit -m "feat: add svg icon system"
```

## Task 3: Establish Global Visual System

**Files:**
- Modify: `miniprogram/app.wxss`
- Modify: `miniprogram/components/seg-tabs/*`
- Modify: `miniprogram/components/empty-state/*`
- Modify: `miniprogram/components/stat-card/*`

- [ ] **Step 1: Replace global style tokens**

Update `miniprogram/app.wxss` to include:

```css
page {
  background: #f6f8fc;
  color: #172033;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  font-size: 28rpx;
}

.page {
  min-height: 100vh;
  padding: 28rpx 32rpx 48rpx;
  box-sizing: border-box;
}

.ui-page-title {
  margin: 12rpx 0 28rpx;
  color: #172033;
  font-size: 40rpx;
  font-weight: 800;
  letter-spacing: 0;
}

.ui-card {
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 14rpx 36rpx rgba(28, 55, 100, 0.08);
}

.ui-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 34rpx 0 18rpx;
  font-size: 30rpx;
  font-weight: 800;
}

.ui-muted {
  color: #8a94a6;
}

.ui-search {
  display: flex;
  align-items: center;
  height: 76rpx;
  padding: 0 24rpx;
  border-radius: 22rpx;
  background: #fff;
  color: #8a94a6;
  box-shadow: 0 10rpx 28rpx rgba(28, 55, 100, 0.05);
}

.ui-icon {
  width: 44rpx;
  height: 44rpx;
}

.ui-primary-btn {
  height: 88rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #2f7bff, #1f65f2);
  color: #fff;
  font-weight: 700;
  line-height: 88rpx;
}

.ui-ghost-btn {
  height: 76rpx;
  border: 1rpx solid #d9e1ef;
  border-radius: 22rpx;
  background: #fff;
  color: #4b5568;
  line-height: 76rpx;
}

.ui-bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #edf1f7;
  background: #fff;
  box-sizing: border-box;
}
```

- [ ] **Step 2: Refine `seg-tabs`**

Update `miniprogram/components/seg-tabs/seg-tabs.wxss` so tabs align with the new system:

```css
.tabs {
  display: flex;
  gap: 44rpx;
  align-items: center;
  height: 76rpx;
  white-space: nowrap;
}

.tab {
  position: relative;
  color: #4b5568;
  font-size: 28rpx;
  line-height: 76rpx;
}

.tab.active {
  color: #2f7bff;
  font-weight: 800;
}

.tab.active::after {
  position: absolute;
  left: 50%;
  bottom: 4rpx;
  width: 36rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: #2f7bff;
  content: "";
  transform: translateX(-50%);
}
```

- [ ] **Step 3: Refine empty and stat components**

Update `empty-state.wxss` and `stat-card.wxss` to use `#EAF2FF`, `#2F7BFF`, `#172033`, and `#8A94A6`; keep dimensions consistent with the spec.

- [ ] **Step 4: Verify global UI invariants**

Run:

```powershell
node scripts/check-miniapp-ui.cjs
```

Expected: `miniapp ui checks ok`.

- [ ] **Step 5: Commit visual system**

```powershell
git add miniprogram/app.wxss miniprogram/components scripts/check-miniapp-ui.cjs
git commit -m "feat: establish miniapp visual system"
```

## Task 4: Polish Home, Materials, and Profile Pages

**Files:**
- Modify: `miniprogram/pages/home/*`
- Modify: `miniprogram/pages/materials/*`
- Modify: `miniprogram/pages/profile/*`
- Modify: `miniprogram/data/materials.js`

- [ ] **Step 1: Add icon metadata**

Update `miniprogram/pages/home/home.js` shortcuts so each item includes `icon` and `toneClass`:

```js
{ label: '章节练习', url: '/pages/bank/bank', icon: '/assets/icons/chapter.svg', toneClass: 'blue' }
```

Use icons for all 8 shortcuts.

Update `miniprogram/data/materials.js` categories with icon paths:

```js
{ id: 'outline', name: '考试大纲', icon: '/assets/icons/outline.svg', toneClass: 'blue' }
```

- [ ] **Step 2: Rebuild homepage WXML**

The homepage WXML must contain:

```xml
<view class="page home-page">
  <view class="home-top">
    <view>
      <view class="brand">医考通</view>
      <view class="exam-picker">执业医师 · 医学综合</view>
    </view>
    <view class="days">距考试 <text>{{daysLeft}}</text> 天</view>
  </view>
  <view class="ui-search"><image class="ui-icon" src="/assets/icons/search.svg" /> <text>搜索题库、资料、考点</text></view>
  <view class="hero ui-card">...</view>
  <view class="shortcut-grid">...</view>
  <view class="today ui-card">...</view>
  <view class="material-list">...</view>
</view>
```

Use `image` for all shortcut icons, not numbers.

- [ ] **Step 3: Rebuild materials page**

Use `image` icons for material categories and file rows. The search row uses `/assets/icons/search.svg`. Material list rows use `/assets/icons/outline.svg` or `/assets/icons/book.svg` based on type/category.

- [ ] **Step 4: Rebuild profile page**

Use a polished user row, dark member card, SVG learning shortcuts, and menu rows with operation icons (`order.svg`, `download.svg`, `folder.svg`, `note.svg`, `settings.svg`).

- [ ] **Step 5: Verify the three pages**

Run:

```powershell
node scripts/check-miniapp-ui.cjs
```

Expected: `miniapp ui checks ok`.

Manual WeChat Developer Tools check:

- Home first screen shows brand, search, hero, shortcut icons, stats, material list.
- Materials tab shows SVG category icons and aligned material rows.
- Profile tab shows dark membership card and SVG menu icons.

- [ ] **Step 6: Commit**

```powershell
git add miniprogram/pages/home miniprogram/pages/materials miniprogram/pages/profile miniprogram/data/materials.js
git commit -m "feat: polish main tab pages ui"
```

## Task 5: Polish Bank and Practice Pages

**Files:**
- Modify: `miniprogram/pages/bank/*`
- Modify: `miniprogram/pages/practice/*`

- [ ] **Step 1: Rework bank page**

Bank page must include:

- `ui-page-title`
- subject row with search icon
- `seg-tabs`
- `ui-card` progress panel
- chapter rows using a small blue plus badge
- stable empty panel for non-chapter tabs

Precompute any tab content visibility in JS. Do not use `activeTab ===` in WXML.

- [ ] **Step 2: Rework practice page**

Practice page must include:

- white reading canvas
- question meta row with `typeLabel` and `currentNo`
- option rows with precomputed `optionClass`
- answer card with correct answer, user answer, and analysis
- fixed bottom action bar with SVG operation icons

Update `practice.js` to maintain `selectedAnswerText`:

```js
this.setData({
  selectedAnswerText: normalizeAnswer(answer)
});
```

- [ ] **Step 3: Verify bank and practice**

Run:

```powershell
node scripts/check-miniapp-ui.cjs
```

Expected: `miniapp ui checks ok`.

Manual WeChat Developer Tools check:

- Bank tab chapter rows align and navigate to practice.
- Practice page allows select, submit, previous, next, favorite, note.

- [ ] **Step 4: Commit**

```powershell
git add miniprogram/pages/bank miniprogram/pages/practice
git commit -m "feat: polish bank and practice ui"
```

## Task 6: Polish Study Data Pages

**Files:**
- Modify: `miniprogram/pages/wrong/*`
- Modify: `miniprogram/pages/favorites/*`
- Modify: `miniprogram/pages/report/*`

- [ ] **Step 1: Unify wrong and favorites pages**

Both pages must use:

- centered page title
- `seg-tabs`
- summary line
- `ui-card` question cards
- type tag, stem, chapter, date
- fixed `ui-bottom-bar` with primary button
- `empty-state` when empty

- [ ] **Step 2: Rebuild report page**

Report page must use:

- `seg-tabs`
- trend card with dot/line visual
- three metric cards
- distribution card with SVG-like donut or segmented bars
- ability example panel when active tab is ability

All chart positions and colors must be precomputed in JS fields such as `dotStyle`, `barStyle`, and `legendStyle`.

- [ ] **Step 3: Verify study pages**

Run:

```powershell
node scripts/check-miniapp-ui.cjs
```

Expected: `miniapp ui checks ok`.

Manual WeChat Developer Tools check:

- Wrong, favorites, and report pages open from homepage/profile.
- Empty/error states are visually consistent.
- Fixed bottom buttons do not cover content.

- [ ] **Step 4: Commit**

```powershell
git add miniprogram/pages/wrong miniprogram/pages/favorites miniprogram/pages/report
git commit -m "feat: polish study data pages ui"
```

## Task 7: Polish Material Detail Page

**Files:**
- Modify: `miniprogram/pages/material-detail/*`

- [ ] **Step 1: Rebuild detail header card**

Use a file SVG image, title, type/size/learner count, and star icon. `starText` may remain as fallback text, but primary visual should be `star.svg` or `star-filled.svg` through a computed `starIcon`.

- [ ] **Step 2: Rebuild intro and catalog panels**

Use `seg-tabs` style or equivalent classes. Catalog rows should use precomputed display numbers in JS:

```js
catalogRows: material.catalog.map((title, index) => ({ title, no: index + 1 }))
```

WXML should render `{{item.no}}. {{item.title}}`.

- [ ] **Step 3: Rebuild bottom actions**

Use `ui-bottom-bar`, a ghost share button with `share.svg`, and a primary learn button.

- [ ] **Step 4: Verify material detail**

Run:

```powershell
node scripts/check-miniapp-ui.cjs
```

Expected: `miniapp ui checks ok`.

Manual WeChat Developer Tools check:

- Materials page opens detail page.
- Detail page shows file card, tabs, intro/catalog, favorite, share, and learn buttons.

- [ ] **Step 5: Commit**

```powershell
git add miniprogram/pages/material-detail
git commit -m "feat: polish material detail ui"
```

## Task 8: Final UI Verification

**Files:**
- Modify: `README.md`
- Modify only if needed: `miniprogram/**/*.wxml`, `miniprogram/**/*.wxss`, `miniprogram/**/*.js`

- [ ] **Step 1: Update README UI verification section**

Add:

```markdown
## UI 验收

运行本地检查：

```powershell
node scripts/check-miniapp-ui.cjs
```

微信开发者工具中执行“清缓存并编译”，逐页确认：

- 首页首屏完整且无数字块图标。
- 4 个底部 tab 可切换。
- 章节练习可选题、提交、查看解析。
- 错题本、收藏、学习报告、资料详情可进入。
- SVG 图标显示清晰。
- 卡片、按钮、标签、间距风格统一。
```
```

- [ ] **Step 2: Run automated checks**

Run:

```powershell
node scripts/check-miniapp-ui.cjs
git diff --check
git status --short
```

Expected:

```text
miniapp ui checks ok
```

`git diff --check` exits 0. `git status --short` should only show intended files and may show uncommitted `project.config.json` from WeChat Developer Tools; do not stage that file.

- [ ] **Step 3: Manual WeChat DevTools verification**

Open `C:\Users\CHENBIN\Documents\new-medi-quiz` in WeChat Developer Tools. Run “清缓存并编译”. Verify:

1. Home page renders full first screen.
2. Tab switching works for 首页、题库、资料、我的.
3. Page navigation works for practice, wrong, favorites, report, and material detail.
4. SVG icons are visible in tabBar, shortcuts, materials, profile menus, and action areas.
5. No white screen appears.

- [ ] **Step 4: Commit final documentation and polish**

```powershell
git add README.md miniprogram scripts
git commit -m "chore: verify ui redesign"
```

## Self-Review Notes

- Spec coverage: the plan covers global visual tokens, SVG icon generation, tabBar icons, shared components, all 9 pages, automated checks, and WeChat Developer Tools manual acceptance.
- Scope: the plan does not change business data models, cloud functions, payment, PDF reading, or backend management.
- Risk controls: WXML expression checks prevent the prior white-screen class of issue from returning, and local WeChat Developer Tools private config remains unstaged.
