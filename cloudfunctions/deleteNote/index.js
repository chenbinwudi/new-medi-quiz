const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event = {}) => {
  const { OPENID: openid } = cloud.getWXContext();
  const query = event.noteId ? { openid, noteId: event.noteId } : { openid, questionId: event.questionId };
  const found = await db.collection('notes').where(query).limit(1).get();
  if (found.data.length) {
    await db.collection('notes').doc(found.data[0]._id).remove();
  }
  return { ok: true };
};
