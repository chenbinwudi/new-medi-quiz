const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const [categories, papers] = await Promise.all([
    db.collection('question_categories').orderBy('order', 'asc').limit(50).get(),
    db.collection('papers').limit(20).get()
  ]);

  return {
    chapters: categories.data,
    realPapers: papers.data.filter((item) => item.type === 'real-like'),
    mockPapers: papers.data.filter((item) => item.type === 'mock'),
    memories: categories.data.map((item) => ({
      memoryId: `memory-${item.categoryId}`,
      title: `${item.title}考点速记`,
      categoryId: item.categoryId,
      total: item.total || 0
    }))
  };
};
