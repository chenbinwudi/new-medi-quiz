const { callFunction } = require('./cloud');
const { storageKeys } = require('../data/cloud-contracts');
const seed = require('../data/cloud-seed');

const STORAGE_KEY = storageKeys.guestStudy;

function todayText() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function nowText() {
  return todayText();
}

function emptyStore() {
  return {
    answerRecords: [],
    wrongQuestions: [],
    favorites: [],
    notes: [],
    summary: []
  };
}

function readStore() {
  return wx.getStorageSync(STORAGE_KEY) || emptyStore();
}

function writeStore(store) {
  wx.setStorageSync(STORAGE_KEY, store);
  return store;
}

function cloudOrLocal(name, payload, fallback) {
  return callFunction(name, payload).catch(() => fallback());
}

function saveAnswerLocal(payload) {
  const store = readStore();
  const date = todayText();
  const record = {
    ...payload,
    selected: payload.selected || payload.answer || [],
    answeredAt: payload.answeredAt || nowText(),
    createdAt: nowText()
  };
  store.answerRecords.unshift(record);

  const wrongIndex = store.wrongQuestions.findIndex((item) => item.questionId === payload.questionId);
  if (!payload.isCorrect) {
    if (wrongIndex >= 0) {
      const wrong = store.wrongQuestions[wrongIndex];
      store.wrongQuestions[wrongIndex] = {
        ...wrong,
        wrongCount: (wrong.wrongCount || 0) + 1,
        lastWrongAt: nowText(),
        redoneCorrect: false
      };
    } else {
      store.wrongQuestions.unshift({
        questionId: payload.questionId,
        chapterId: payload.chapterId,
        wrongCount: 1,
        lastWrongAt: nowText(),
        redoneCorrect: false
      });
    }
  } else if (wrongIndex >= 0) {
    store.wrongQuestions[wrongIndex] = {
      ...store.wrongQuestions[wrongIndex],
      redoneCorrect: true
    };
  }

  const summaryIndex = store.summary.findIndex((item) => item.date === date);
  if (summaryIndex >= 0) {
    const summary = store.summary[summaryIndex];
    store.summary[summaryIndex] = {
      ...summary,
      answerCount: (summary.answerCount || 0) + 1,
      correctCount: (summary.correctCount || 0) + (payload.isCorrect ? 1 : 0),
      updatedAt: nowText()
    };
  } else {
    store.summary.unshift({
      date,
      answerCount: 1,
      correctCount: payload.isCorrect ? 1 : 0,
      createdAt: nowText(),
      updatedAt: nowText()
    });
  }

  writeStore(store);
  return Promise.resolve({ ok: true, local: true });
}

function toggleFavoriteLocal(payload) {
  const store = readStore();
  const targetType = payload.targetType || 'question';
  const index = store.favorites.findIndex((item) => (
    item.targetType === targetType && item.targetId === payload.targetId
  ));
  if (index >= 0) {
    store.favorites.splice(index, 1);
    writeStore(store);
    return Promise.resolve({ favorited: false, local: true });
  }
  store.favorites.unshift({
    ...payload,
    targetType,
    createdAt: nowText()
  });
  writeStore(store);
  return Promise.resolve({ favorited: true, local: true });
}

function saveNoteLocal(payload) {
  const store = readStore();
  const index = store.notes.findIndex((item) => item.questionId === payload.questionId);
  const note = {
    noteId: payload.noteId || `${payload.questionId}-${Date.now()}`,
    questionId: payload.questionId,
    chapterId: payload.chapterId || '',
    content: payload.content || '',
    updatedAt: nowText()
  };
  if (index >= 0) store.notes[index] = { ...store.notes[index], ...note };
  else store.notes.unshift(note);
  writeStore(store);
  return Promise.resolve({ note, local: true });
}

function deleteNoteLocal(payload) {
  const store = readStore();
  store.notes = store.notes.filter((item) => (
    item.noteId !== payload.noteId && item.questionId !== payload.questionId
  ));
  writeStore(store);
  return Promise.resolve({ ok: true, local: true });
}

function getStudyDataLocal(type) {
  const store = readStore();
  const payload = {};
  if (type === 'all' || type === 'report') payload.summary = store.summary;
  if (type === 'all' || type === 'wrong') payload.wrongQuestions = store.wrongQuestions;
  if (type === 'all' || type === 'favorites') payload.favorites = store.favorites;
  if (type === 'all' || type === 'notes') payload.notes = store.notes;
  if (type === 'all' || type === 'answers') payload.answerRecords = store.answerRecords;
  return Promise.resolve(payload);
}

function getHomeDataLocal() {
  const store = readStore();
  const today = store.summary[0] || { answerCount: 0, correctCount: 0 };
  return Promise.resolve({
    exams: seed.categories,
    recommendedMaterials: seed.materials.slice(0, 3),
    today,
    trend: store.summary
  });
}

function getQuestionBankLocal() {
  return Promise.resolve({
    chapters: seed.categories,
    realPapers: seed.papers.filter((item) => item.type === 'real-like'),
    mockPapers: seed.papers.filter((item) => item.type === 'mock'),
    memories: seed.categories.map((item) => ({
      memoryId: `memory-${item.categoryId}`,
      title: `${item.title}考点速记`,
      categoryId: item.categoryId,
      total: item.total || 0
    }))
  });
}

function getPracticeSessionLocal(payload = {}) {
  if (payload.source === 'paper') {
    const paper = seed.papers.find((item) => item.paperId === payload.paperId) || seed.papers[0];
    const ids = paper ? paper.questionIds : [];
    return Promise.resolve({
      title: paper ? paper.title : '练习',
      questions: seed.questions.filter((item) => ids.includes(item.questionId))
    });
  }

  if (payload.source === 'wrong') {
    const store = readStore();
    const ids = store.wrongQuestions.map((item) => item.questionId);
    return Promise.resolve({
      title: '错题重练',
      questions: seed.questions.filter((item) => ids.includes(item.questionId))
    });
  }

  const categoryId = payload.categoryId || payload.chapterId || seed.categories[0].categoryId;
  return Promise.resolve({
    title: '章节练习',
    questions: seed.questions.filter((item) => item.categoryId === categoryId)
  });
}

function getMaterialsLocal(payload = {}) {
  if (payload.materialId) {
    return Promise.resolve({ detail: seed.materials.find((item) => item.materialId === payload.materialId) || null });
  }
  return Promise.resolve({ materials: seed.materials });
}

function getProfileDataLocal() {
  return Promise.resolve({
    user: null,
    orders: [],
    downloads: [],
    membership: { level: 'guest' }
  });
}

function saveAnswer(payload) {
  return cloudOrLocal('saveAnswer', payload, () => saveAnswerLocal(payload));
}

function toggleFavorite(payload) {
  return cloudOrLocal('toggleFavorite', payload, () => toggleFavoriteLocal(payload));
}

function saveNote(payload) {
  return cloudOrLocal('saveNote', payload, () => saveNoteLocal(payload));
}

function deleteNote(payload) {
  return cloudOrLocal('deleteNote', payload, () => deleteNoteLocal(payload));
}

function getStudyData(type) {
  return cloudOrLocal('getStudyData', { type }, () => getStudyDataLocal(type));
}

function getHomeData() {
  return cloudOrLocal('getHomeData', {}, getHomeDataLocal);
}

function getQuestionBank() {
  return cloudOrLocal('getQuestionBank', {}, getQuestionBankLocal);
}

function getPracticeSession(payload) {
  return cloudOrLocal('getPracticeSession', payload, () => getPracticeSessionLocal(payload));
}

function getMaterials(payload = {}) {
  return cloudOrLocal('getMaterials', payload, () => getMaterialsLocal(payload));
}

function getProfileData() {
  return cloudOrLocal('getProfileData', {}, getProfileDataLocal);
}

module.exports = {
  saveAnswer,
  toggleFavorite,
  saveNote,
  deleteNote,
  getStudyData,
  getHomeData,
  getQuestionBank,
  getPracticeSession,
  getMaterials,
  getProfileData,
  readStore
};
