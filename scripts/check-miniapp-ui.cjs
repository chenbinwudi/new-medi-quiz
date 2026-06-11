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

for (const icon of requiredIcons) {
  const file = path.join(root, 'miniprogram', 'assets', 'icons', icon);
  if (!fs.existsSync(file)) fail(`Missing icon: miniprogram/assets/icons/${icon}`);
}

for (const icon of requiredTabIcons) {
  const file = path.join(root, 'miniprogram', 'assets', 'icons', icon);
  if (!fs.existsSync(file)) fail(`Missing tab icon: miniprogram/assets/icons/${icon}`);
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
