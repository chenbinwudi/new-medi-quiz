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
