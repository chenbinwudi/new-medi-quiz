const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event = {}) => {
  if (event.materialId) {
    const detail = await db.collection('materials').where({ materialId: event.materialId }).limit(1).get();
    return { detail: detail.data[0] || null };
  }
  const result = await db.collection('materials').where({ status: 'published' }).limit(100).get();
  return { materials: result.data };
};
