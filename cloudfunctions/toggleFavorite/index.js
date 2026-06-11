const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const { targetType, targetId } = event;
  if (!targetType || !targetId) throw new Error('targetType and targetId are required');

  const query = { openid, targetType, targetId };
  const existing = await db.collection('favorites').where(query).limit(1).get();
  if (existing.data.length) {
    await db.collection('favorites').doc(existing.data[0]._id).remove();
    return { favorited: false };
  }

  await db.collection('favorites').add({
    data: { ...query, createdAt: db.serverDate() }
  });
  return { favorited: true };
};
