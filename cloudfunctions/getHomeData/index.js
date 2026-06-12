const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const { OPENID: openid } = cloud.getWXContext();
  const [categories, materials, reports] = await Promise.all([
    db.collection('question_categories').orderBy('order', 'asc').limit(20).get(),
    db.collection('materials').where({ status: 'published' }).limit(5).get(),
    db.collection('study_reports').where({ openid }).orderBy('date', 'desc').limit(7).get()
  ]);

  return {
    exams: categories.data,
    recommendedMaterials: materials.data,
    today: reports.data[0] || { answerCount: 0, correctCount: 0 },
    trend: reports.data
  };
};
