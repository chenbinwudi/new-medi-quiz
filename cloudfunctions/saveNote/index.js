const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const { questionId, content = '' } = event;
  if (!questionId) throw new Error('questionId is required');

  const existing = await db.collection('notes').where({ openid, questionId }).limit(1).get();
  if (existing.data.length) {
    await db.collection('notes').doc(existing.data[0]._id).update({
      data: { content, updatedAt: db.serverDate() }
    });
    return { note: { ...existing.data[0], content } };
  }

  const note = { openid, questionId, content, updatedAt: db.serverDate() };
  const created = await db.collection('notes').add({ data: note });
  return { note: { _id: created._id, openid, questionId, content } };
};
