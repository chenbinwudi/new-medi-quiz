function getQuestionKey(question = {}) {
  return question.id || question.questionId || '';
}

function defaultAnswerState() {
  return {
    selected: [],
    submitted: false,
    showSubmit: true,
    isCorrect: false,
    selectedAnswerText: '',
    answerTitle: '',
    answerClass: '',
    favorited: false,
    favoriteText: '收藏',
    favoriteDisplayText: '收藏',
    favoriteIcon: '/assets/icons/star.svg'
  };
}

function getPracticeAnswerState(history = {}, question = {}) {
  const key = getQuestionKey(question);
  const saved = key ? history[key] : null;
  return {
    ...defaultAnswerState(),
    ...(saved || {})
  };
}

function savePracticeAnswerState(history = {}, question = {}, patch = {}) {
  const key = getQuestionKey(question);
  if (!key) return history;
  const nextState = {
    ...getPracticeAnswerState(history, question),
    ...patch
  };
  nextState.selected = Array.isArray(nextState.selected) ? nextState.selected : [];
  nextState.showSubmit = !nextState.submitted;
  return {
    ...history,
    [key]: nextState
  };
}

function calculateCorrectCount(history = {}) {
  return Object.keys(history).reduce((count, key) => {
    const item = history[key];
    return count + (item && item.submitted && item.isCorrect ? 1 : 0);
  }, 0);
}

module.exports = {
  getQuestionKey,
  getPracticeAnswerState,
  savePracticeAnswerState,
  calculateCorrectCount
};
