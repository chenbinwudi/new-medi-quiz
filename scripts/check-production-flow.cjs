const assert = require('assert');
const fs = require('fs');
const path = require('path');
const seed = require('../miniprogram/data/cloud-seed');
const contracts = require('../miniprogram/data/cloud-contracts');

assert.ok(seed.questions.length >= 300, 'seed question count must be production-like');
assert.ok(seed.papers.length >= 4, 'papers required');
assert.ok(seed.materials.length >= 6, 'materials required');
assert.ok(contracts.homeShortcuts.length >= 8, 'home shortcuts required');

const requiredQuestionFields = ['questionId', 'primaryId', 'categoryId', 'subjectId', 'subjectTitle', 'type', 'stem', 'options', 'answer', 'analysis'];
seed.questions.slice(0, 20).forEach((question) => {
  requiredQuestionFields.forEach((field) => assert.ok(question[field], `${question.questionId} missing ${field}`));
});

const requiredPages = [
  'result',
  'answer-card',
  'note-edit',
  'member-center',
  'orders',
  'downloads',
  'my-materials',
  'settings',
  'feedback'
];

requiredPages.forEach((page) => {
  const dir = path.join(__dirname, '..', 'miniprogram', 'pages', page);
  ['js', 'json', 'wxml', 'wxss'].forEach((ext) => {
    assert.ok(fs.existsSync(path.join(dir, `${page}.${ext}`)), `${page}.${ext} missing`);
  });
});

console.log('production flow checks ok');
