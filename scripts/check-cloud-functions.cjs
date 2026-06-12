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
