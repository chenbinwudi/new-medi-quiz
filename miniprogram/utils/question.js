function normalizeAnswer(answer) {
  if (Array.isArray(answer)) return answer.slice().sort().join(',');
  return String(answer || '');
}

function isCorrectAnswer(question, selected) {
  return normalizeAnswer(question.answer) === normalizeAnswer(selected);
}

function getQuestionTypeLabel(type) {
  return type === 'multiple' ? '多选题' : '单选题';
}

module.exports = { normalizeAnswer, isCorrectAnswer, getQuestionTypeLabel };
