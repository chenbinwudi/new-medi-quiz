const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const [categories, subjects, papers] = await Promise.all([
    db.collection('question_categories').orderBy('order', 'asc').limit(50).get(),
    db.collection('subjects').orderBy('order', 'asc').limit(100).get(),
    db.collection('papers').limit(20).get()
  ]);

  const subjectsByPrimary = subjects.data.reduce((map, item) => {
    const key = item.primaryId || item.categoryId;
    map[key] = map[key] || [];
    map[key].push(item);
    return map;
  }, {});

  const chapters = categories.data.map((item) => ({
    ...item,
    subjects: item.subjects && item.subjects.length
      ? item.subjects
      : (subjectsByPrimary[item.primaryId] || subjectsByPrimary[item.categoryId] || [])
  }));

  return {
    chapters,
    realPapers: papers.data.filter((item) => item.type === 'real-like'),
    mockPapers: papers.data.filter((item) => item.type === 'mock'),
    memories: chapters.map((item) => ({
      memoryId: `memory-${item.categoryId}`,
      title: `${item.title}考点速记`,
      categoryId: item.categoryId,
      total: item.total || 0
    }))
  };
};
