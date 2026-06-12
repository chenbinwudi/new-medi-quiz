const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

function todayText() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

exports.main = async (event = {}) => {
  const { OPENID: openid } = cloud.getWXContext();
  const questionId = event.questionId;
  if (!questionId) throw new Error('questionId is required');

  const isCorrect = !!event.isCorrect;
  const type = event.type || 'single';
  const chapterId = event.chapterId || '';
  const record = {
    openid,
    questionId,
    chapterId,
    type,
    selected: event.selected || event.answer || [],
    isCorrect,
    useSeconds: event.useSeconds || event.duration || 0,
    source: event.source || 'practice',
    answeredAt: event.answeredAt || String(Date.now()),
    createdAt: db.serverDate()
  };

  await db.collection('answer_records').add({ data: record });

  const wrong = await db.collection('wrong_questions').where({ openid, questionId }).limit(1).get();
  if (!isCorrect) {
    if (wrong.data.length) {
      await db.collection('wrong_questions').doc(wrong.data[0]._id).update({
        data: {
          wrongCount: _.inc(1),
          lastWrongAt: db.serverDate(),
          redoneCorrect: false,
          updatedAt: db.serverDate()
        }
      });
    } else {
      await db.collection('wrong_questions').add({
        data: {
          openid,
          questionId,
          chapterId,
          wrongCount: 1,
          lastWrongAt: db.serverDate(),
          redoneCorrect: false,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });
    }
  } else if (wrong.data.length) {
    await db.collection('wrong_questions').doc(wrong.data[0]._id).update({
      data: { redoneCorrect: true, updatedAt: db.serverDate() }
    });
  }

  const date = event.date || todayText();
  const report = await db.collection('study_reports').where({ openid, date }).limit(1).get();
  if (report.data.length) {
    await db.collection('study_reports').doc(report.data[0]._id).update({
      data: {
        answerCount: _.inc(1),
        correctCount: _.inc(isCorrect ? 1 : 0),
        updatedAt: db.serverDate()
      }
    });
  } else {
    await db.collection('study_reports').add({
      data: {
        openid,
        date,
        answerCount: 1,
        correctCount: isCorrect ? 1 : 0,
        typeCount: { [type]: 1 },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });
  }

  return { ok: true };
};
