function percent(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function buildChapterProgress(chapters, summaryByChapter) {
  return chapters.map((chapter) => {
    const learned = summaryByChapter[chapter.id] || 0;
    return {
      ...chapter,
      learned,
      progress: percent(learned, chapter.totalCount)
    };
  });
}

module.exports = { percent, buildChapterProgress };
