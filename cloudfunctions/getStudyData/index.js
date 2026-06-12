const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function list(collection, openid, orderField = 'createdAt') {
  const result = await db.collection(collection).where({ openid }).orderBy(orderField, 'desc').limit(100).get();
  return result.data;
}

exports.main = async (event = {}) => {
  const { OPENID: openid } = cloud.getWXContext();
  const safeOpenid = openid || '__preview__';
  const type = event.type || 'all';

  const payload = {};
  if (type === 'all' || type === 'report') {
    payload.summary = await list('study_reports', safeOpenid, 'date');
  }
  if (type === 'all' || type === 'wrong') {
    payload.wrongQuestions = await list('wrong_questions', safeOpenid, 'lastWrongAt');
  }
  if (type === 'all' || type === 'favorites') {
    payload.favorites = await list('favorites', safeOpenid, 'createdAt');
  }
  if (type === 'all' || type === 'notes') {
    payload.notes = await list('notes', safeOpenid, 'updatedAt');
  }
  if (type === 'all' || type === 'answers') {
    payload.answerRecords = await list('answer_records', safeOpenid, 'createdAt');
  }

  return payload;
};
