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
