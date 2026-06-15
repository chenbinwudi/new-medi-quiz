const assert = require('assert');
const contracts = require('../miniprogram/data/cloud-contracts');

assert.strictEqual(contracts.collections.questions, 'questions');
assert.strictEqual(contracts.collections.subjects, 'subjects');
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
