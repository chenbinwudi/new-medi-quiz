const assert = require('assert');
const fs = require('fs');
const path = require('path');

const {
  getQuestionKey,
  savePracticeAnswerState,
  getPracticeAnswerState,
  calculateCorrectCount
} = require('../miniprogram/utils/practice-state');

const practicePage = fs.readFileSync(path.join(__dirname, '../miniprogram/pages/practice/practice.js'), 'utf8');
assert(!practicePage.includes("require('../../utils/practice-state')"));

const q1 = { id: 'q1', questionId: 'legacy-q1' };
const q2 = { questionId: 'q2' };

assert.strictEqual(getQuestionKey(q1), 'q1');
assert.strictEqual(getQuestionKey(q2), 'q2');

let history = {};
history = savePracticeAnswerState(history, q1, {
  selected: ['A'],
  submitted: false
});

assert.deepStrictEqual(getPracticeAnswerState(history, q1).selected, ['A']);
assert.strictEqual(getPracticeAnswerState(history, q1).submitted, false);

history = savePracticeAnswerState(history, q1, {
  selected: ['A'],
  submitted: true,
  isCorrect: true,
  selectedAnswerText: 'A',
  answerTitle: '回答正确',
  answerClass: 'ok'
});
history = savePracticeAnswerState(history, q2, {
  selected: ['B'],
  submitted: true,
  isCorrect: false,
  selectedAnswerText: 'B',
  answerTitle: '回答错误',
  answerClass: 'bad'
});

const restored = getPracticeAnswerState(history, q1);
assert.deepStrictEqual(restored.selected, ['A']);
assert.strictEqual(restored.submitted, true);
assert.strictEqual(restored.showSubmit, false);
assert.strictEqual(restored.isCorrect, true);
assert.strictEqual(restored.selectedAnswerText, 'A');
assert.strictEqual(calculateCorrectCount(history), 1);

history = savePracticeAnswerState(history, q1, {
  selected: ['C'],
  submitted: true,
  isCorrect: false
});

assert.strictEqual(calculateCorrectCount(history), 0);

console.log('practice history checks ok');
