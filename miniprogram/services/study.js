const { callFunction } = require('./cloud');

function saveAnswer(payload) {
  return callFunction('saveAnswer', payload);
}

function toggleFavorite(payload) {
  return callFunction('toggleFavorite', payload);
}

function saveNote(payload) {
  return callFunction('saveNote', payload);
}

function getStudyData(type) {
  return callFunction('getStudyData', { type });
}

module.exports = { saveAnswer, toggleFavorite, saveNote, getStudyData };
