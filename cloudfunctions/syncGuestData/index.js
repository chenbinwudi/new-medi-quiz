const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function upsertBy(collection, query, data) {
  const found = await db.collection(collection).where(query).limit(1).get();
  const payload = { ...data, updatedAt: db.serverDate() };
  if (found.data.length) {
    await db.collection(collection).doc(found.data[0]._id).update({ data: payload });
    return 'updated';
  }
  await db.collection(collection).add({ data: { ...query, ...payload, createdAt: db.serverDate() } });
  return 'created';
}

exports.main = async (event = {}) => {
  const { OPENID: openid } = cloud.getWXContext();
  const payload = event.payload || {};
  const result = { answers: 0, wrong: 0, favorites: 0, notes: 0, summary: 0 };

  for (const item of payload.answerRecords || []) {
    await upsertBy('answer_records', {
      openid,
      questionId: item.questionId,
      source: item.source || 'guest',
      answeredAt: item.answeredAt || item.createdAt || ''
    }, item);
    result.answers += 1;
  }

  for (const item of payload.wrongQuestions || []) {
    await upsertBy('wrong_questions', { openid, questionId: item.questionId }, item);
    result.wrong += 1;
  }

  for (const item of payload.favorites || []) {
    await upsertBy('favorites', {
      openid,
      targetType: item.targetType,
      targetId: item.targetId
    }, item);
    result.favorites += 1;
  }

  for (const item of payload.notes || []) {
    await upsertBy('notes', { openid, questionId: item.questionId }, item);
    result.notes += 1;
  }

  for (const item of payload.summary || []) {
    await upsertBy('study_reports', { openid, date: item.date }, item);
    result.summary += 1;
  }

  return { ok: true, result };
};
