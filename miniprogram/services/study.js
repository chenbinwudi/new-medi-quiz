const { callFunction } = require('./cloud');

const STORAGE_KEY = 'mvpStudyData';

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
  const index = store.favorites.findIndex((item) => (
    item.targetType === payload.targetType && item.targetId === payload.targetId
  ));
  if (index >= 0) {
    store.favorites.splice(index, 1);
    writeStore(store);
    return Promise.resolve({ favorited: false, local: true });
  }
  store.favorites.unshift({
    ...payload,
    createdAt: nowText()
  });
  writeStore(store);
  return Promise.resolve({ favorited: true, local: true });
}

function saveNoteLocal(payload) {
  const store = readStore();
  const index = store.notes.findIndex((item) => item.questionId === payload.questionId);
  const note = {
    questionId: payload.questionId,
    content: payload.content || '',
    updatedAt: nowText()
  };
  if (index >= 0) store.notes[index] = { ...store.notes[index], ...note };
  else store.notes.unshift(note);
  writeStore(store);
  return Promise.resolve({ note, local: true });
}

function getStudyDataLocal(type) {
  const store = readStore();
  const payload = {};
  if (type === 'all' || type === 'report') payload.summary = store.summary;
  if (type === 'all' || type === 'wrong') payload.wrongQuestions = store.wrongQuestions;
  if (type === 'all' || type === 'favorites') payload.favorites = store.favorites;
  if (type === 'all' || type === 'notes') payload.notes = store.notes;
  if (type === 'all') payload.answerRecords = store.answerRecords;
  return Promise.resolve(payload);
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

function getStudyData(type) {
  return cloudOrLocal('getStudyData', { type }, () => getStudyDataLocal(type));
}

module.exports = { saveAnswer, toggleFavorite, saveNote, getStudyData };
