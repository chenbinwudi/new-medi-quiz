const assert = require('assert');
const path = require('path');

const root = process.cwd();
const storage = new Map();
global.getApp = () => ({ globalData: { user: null } });
global.wx = {
  getStorageSync(key) {
    return storage.get(key);
  },
  setStorageSync(key, value) {
    storage.set(key, value);
  },
  removeStorageSync(key) {
    storage.delete(key);
  }
};

function freshRequire(file) {
  const full = path.join(root, file);
  delete require.cache[require.resolve(full)];
  return require(full);
}

async function main() {
  storage.clear();
  const study = freshRequire('miniprogram/services/study.js');
  const { questions } = freshRequire('miniprogram/data/questions.js');
  const { getQuestionTypeLabel } = freshRequire('miniprogram/utils/question.js');

  assert(questions.some((item) => item.stem.includes('药品质量标准')), 'question bank should contain readable Chinese stems');
  assert.strictEqual(getQuestionTypeLabel('single'), '单选题');
  assert.strictEqual(getQuestionTypeLabel('multiple'), '多选题');

  await study.saveAnswer({
    questionId: 'q-drug-quality-001',
    chapterId: 'humanities',
    type: 'single',
    answer: 'A',
    isCorrect: false,
    source: 'practice'
  });

  await study.toggleFavorite({ targetType: 'question', targetId: 'q-drug-quality-001' });
  await study.saveNote({ questionId: 'q-drug-quality-001', content: '重点复习本题考点' });

  const all = await study.getStudyData('all');
  assert.strictEqual(all.answerRecords.length, 1, 'answer record should be persisted locally');
  assert.strictEqual(all.wrongQuestions.length, 1, 'wrong answer should create wrong question');
  assert.strictEqual(all.favorites.length, 1, 'favorite should be persisted locally');
  assert.strictEqual(all.notes.length, 1, 'note should be persisted locally');
  assert.strictEqual(all.summary.length, 1, 'study summary should be generated locally');
  assert.strictEqual(all.summary[0].answerCount, 1);
  assert.strictEqual(all.summary[0].correctCount, 0);

  await study.toggleFavorite({ targetType: 'question', targetId: 'q-drug-quality-001' });
  const afterUnfavorite = await study.getStudyData('favorites');
  assert.strictEqual(afterUnfavorite.favorites.length, 0, 'favorite toggle should remove existing favorite');

  console.log('mvp flow checks ok');
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
