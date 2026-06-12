function normalizeAnswer(answer) {
  if (Array.isArray(answer)) return answer.slice().sort().join(',');
  return String(answer || '');
}

function isMultipleType(type) {
  return type === 'multiple' || type === 'multi' || type === 'indefinite';
}

function isCorrectAnswer(question, selected) {
  return normalizeAnswer(question.answer) === normalizeAnswer(selected);
}

function getQuestionTypeLabel(type) {
  if (type === 'multi' || type === 'multiple') return '多选题';
  if (type === 'indefinite') return '不定项';
  return '单选题';
}

module.exports = { normalizeAnswer, isCorrectAnswer, getQuestionTypeLabel, isMultipleType };
