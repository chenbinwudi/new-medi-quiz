function uniqueAnsweredRecords(records, subject) {
  const seen = {};
  return (records || []).filter((record) => {
    const matchesSubject = record.subjectId === subject.subjectId;
    if (!matchesSubject || !record.questionId || seen[record.questionId]) return false;
    seen[record.questionId] = true;
    return true;
  });
}

function buildSubjectProgress(subject, records) {
  const answered = uniqueAnsweredRecords(records, subject);
  const done = answered.length;
  const correct = answered.filter((record) => !!record.isCorrect).length;
  const total = subject.total || 0;
  const progress = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  const accuracy = done ? Math.round((correct / done) * 100) : 0;
  return {
    ...subject,
    done,
    correct,
    progress,
    accuracy,
    progressText: `${done}/${total}`,
    accuracyText: `${accuracy}%`,
    progressStyle: `width: ${progress}%;`,
    statusText: done ? '继续练习' : '开始练习'
  };
}

function decorateSubjectsWithProgress(subjects, records) {
  return (subjects || []).map((subject) => buildSubjectProgress(subject, records));
}

module.exports = {
  buildSubjectProgress,
  decorateSubjectsWithProgress
};
