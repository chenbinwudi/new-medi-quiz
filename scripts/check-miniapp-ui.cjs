const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = process.cwd();
const requiredIcons = [
  'chapter.svg', 'real-paper.svg', 'mock-paper.svg', 'quick-notes.svg',
  'wrong-book.svg', 'favorite.svg', 'note.svg', 'record.svg', 'report.svg',
  'outline.svg', 'book.svg', 'summary.svg', 'mindmap.svg', 'memory.svg',
  'analysis.svg', 'guide.svg', 'more.svg', 'search.svg', 'back.svg',
  'star.svg', 'star-filled.svg', 'edit.svg', 'answer-card.svg', 'share.svg',
  'download.svg', 'settings.svg', 'order.svg', 'folder.svg'
];
const requiredTabIcons = [
  'tab-home.png', 'tab-home-active.png', 'tab-bank.png', 'tab-bank-active.png',
  'tab-materials.png', 'tab-materials-active.png', 'tab-profile.png', 'tab-profile-active.png'
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

function pngSize(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.length < 24 || bytes.toString('ascii', 1, 4) !== 'PNG') return null;
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20)
  };
}

const syntaxFiles = walk(path.join(root, 'miniprogram'), (p) => /\.(js|json)$/.test(p))
  .concat(walk(path.join(root, 'cloudfunctions'), (p) => /\.(js|json)$/.test(p)))
  .concat([path.join(root, 'project.config.json')]);

for (const file of syntaxFiles) {
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

const homeWxml = fs.readFileSync(path.join(root, 'miniprogram', 'pages', 'home', 'home.wxml'), 'utf8');
if (!/<picker\b[^>]*bindchange="onExamChange"/.test(homeWxml)) {
  fail('Home exam selector must use native picker with bindchange="onExamChange"');
}

const appWxss = fs.readFileSync(path.join(root, 'miniprogram', 'app.wxss'), 'utf8');
for (const selector of ['button.fixed-btn', 'button.submit-btn', 'button.nav-btn', 'button.login-btn', 'button.btn-primary', 'button.btn-ghost']) {
  if (!appWxss.includes(selector)) {
    fail(`Global button centering rule missing selector: ${selector}`);
  }
}
if (!/align-items:\s*center;[\s\S]*justify-content:\s*center;[\s\S]*line-height:\s*normal;/.test(appWxss)) {
  fail('Global button centering rule must use flex centering and normal line-height');
}

const homeWxss = fs.readFileSync(path.join(root, 'miniprogram', 'pages', 'home', 'home.wxss'), 'utf8');
if (!/\.shortcut-icon\s*{[\s\S]*?width:\s*(7[6-9]|[89]\d)rpx;[\s\S]*?height:\s*(7[6-9]|[89]\d)rpx;/.test(homeWxss)) {
  fail('Home shortcut icon tile must be at least 76rpx square');
}
if (!/\.shortcut-img\s*{[\s\S]*?width:\s*(4[4-9]|[5-9]\d)rpx;[\s\S]*?height:\s*(4[4-9]|[5-9]\d)rpx;/.test(homeWxss)) {
  fail('Home shortcut SVG image must be at least 44rpx square');
}

const materialsWxss = fs.readFileSync(path.join(root, 'miniprogram', 'pages', 'materials', 'materials.wxss'), 'utf8');
if (!/\.category-icon\s*{[\s\S]*?width:\s*(7[6-9]|[89]\d)rpx;[\s\S]*?height:\s*(7[6-9]|[89]\d)rpx;/.test(materialsWxss)) {
  fail('Materials category icon tile must be at least 76rpx square');
}
if (!/\.category-img\s*{[\s\S]*?width:\s*(4[4-9]|[5-9]\d)rpx;[\s\S]*?height:\s*(4[4-9]|[5-9]\d)rpx;/.test(materialsWxss)) {
  fail('Materials category SVG image must be at least 44rpx square');
}

const profileWxss = fs.readFileSync(path.join(root, 'miniprogram', 'pages', 'profile', 'profile.wxss'), 'utf8');
if (!/\.shortcut-icon\s*{[\s\S]*?width:\s*(6[8-9]|[789]\d)rpx;[\s\S]*?height:\s*(6[8-9]|[789]\d)rpx;/.test(profileWxss)) {
  fail('Profile shortcut icon tile must be at least 68rpx square');
}
if (!/\.shortcut-img\s*{[\s\S]*?width:\s*(4[0-9]|[5-9]\d)rpx;[\s\S]*?height:\s*(4[0-9]|[5-9]\d)rpx;/.test(profileWxss)) {
  fail('Profile shortcut SVG image must be at least 40rpx square');
}
if (!/\.menu-icon\s*{[\s\S]*?width:\s*(3[8-9]|[4-9]\d)rpx;[\s\S]*?height:\s*(3[8-9]|[4-9]\d)rpx;/.test(profileWxss)) {
  fail('Profile menu SVG icon must be at least 38rpx square');
}

const homeJs = fs.readFileSync(path.join(root, 'miniprogram', 'pages', 'home', 'home.js'), 'utf8');
for (const tab of ['real', 'mock', 'notes']) {
  if (!homeJs.includes(`/pages/bank/bank?tab=${tab}`)) {
    fail(`Home shortcut missing bank tab entry: ${tab}`);
  }
}

const bankJs = fs.readFileSync(path.join(root, 'miniprogram', 'pages', 'bank', 'bank.js'), 'utf8');
const bankWxml = fs.readFileSync(path.join(root, 'miniprogram', 'pages', 'bank', 'bank.wxml'), 'utf8');
for (const key of ['showChapter', 'showReal', 'showMock', 'showNotes']) {
  if (!bankWxml.includes(`wx:if="{{${key}}}"`)) {
    fail(`Bank page missing content panel flag: ${key}`);
  }
}
for (const key of ['realPapers', 'mockPapers', 'quickNotes']) {
  if (!bankJs.includes(key)) {
    fail(`Bank page missing dataset: ${key}`);
  }
}

const favoritesJs = fs.readFileSync(path.join(root, 'miniprogram', 'pages', 'favorites', 'favorites.js'), 'utf8');
const favoritesWxml = fs.readFileSync(path.join(root, 'miniprogram', 'pages', 'favorites', 'favorites.wxml'), 'utf8');
if (!favoritesJs.includes("options.tab === 'notes'")) {
  fail('Favorites page must support tab=notes from home shortcut');
}
if (!favoritesWxml.includes('wx:if="{{showNotes}}"')) {
  fail('Favorites page missing notes content panel');
}

const questionText = fs.readFileSync(path.join(root, 'miniprogram', 'data', 'questions.js'), 'utf8');
for (const expected of ['药品质量标准', '细胞膜', '发热常见病因']) {
  if (!questionText.includes(expected)) {
    fail(`Question data missing readable text: ${expected}`);
  }
}

const questionUtilText = fs.readFileSync(path.join(root, 'miniprogram', 'utils', 'question.js'), 'utf8');
for (const expected of ['单选题', '多选题']) {
  if (!questionUtilText.includes(expected)) {
    fail(`Question label missing readable text: ${expected}`);
  }
}

for (const icon of requiredIcons) {
  const file = path.join(root, 'miniprogram', 'assets', 'icons', icon);
  if (!fs.existsSync(file)) fail(`Missing icon: miniprogram/assets/icons/${icon}`);
}

for (const icon of requiredTabIcons) {
  const file = path.join(root, 'miniprogram', 'assets', 'icons', icon);
  if (!fs.existsSync(file)) fail(`Missing tab icon: miniprogram/assets/icons/${icon}`);
  else {
    const size = pngSize(file);
    if (!size || size.width < 81 || size.height < 81) {
      fail(`Tab icon must be at least 81x81 PNG: miniprogram/assets/icons/${icon}`);
    }
  }
}

try {
  const appJson = JSON.parse(fs.readFileSync(path.join(root, 'miniprogram', 'app.json'), 'utf8'));
  const tabItems = appJson.tabBar && Array.isArray(appJson.tabBar.list) ? appJson.tabBar.list : [];
  tabItems.forEach((item, index) => {
    ['iconPath', 'selectedIconPath'].forEach((key) => {
      const value = item[key] || '';
      if (!/\.(png|jpg|jpeg)$/i.test(value)) {
        fail(`tabBar.list[${index}].${key} must be .png/.jpg/.jpeg: ${value}`);
      }
    });
  });
} catch (error) {
  fail(`Unable to validate miniprogram/app.json tabBar icons: ${error.message}`);
}

if (process.exitCode) process.exit(process.exitCode);
console.log('miniapp ui checks ok');
