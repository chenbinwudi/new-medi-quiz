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

exports.main = async (event) => {
  const { OPENID: openid } = cloud.getWXContext();
  const {
    questionId,
    chapterId,
    type = 'single',
    answer,
    isCorrect,
    duration = 0,
    source = 'practice'
  } = event;

  if (!questionId || !chapterId) {
    throw new Error('questionId and chapterId are required');
  }

  await db.collection('answer_records').add({
    data: {
      openid,
      questionId,
      chapterId,
      type,
      answer,
      isCorrect: !!isCorrect,
      duration,
      source,
      createdAt: db.serverDate()
    }
  });

  if (!isCorrect) {
    const wrong = await db.collection('wrong_questions').where({ openid, questionId }).limit(1).get();
    if (wrong.data.length) {
      await db.collection('wrong_questions').doc(wrong.data[0]._id).update({
        data: {
          wrongCount: _.inc(1),
          lastWrongAt: db.serverDate(),
          redoneCorrect: false
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
          redoneCorrect: false
        }
      });
    }
  } else {
    const wrong = await db.collection('wrong_questions').where({ openid, questionId }).limit(1).get();
    if (wrong.data.length) {
      await db.collection('wrong_questions').doc(wrong.data[0]._id).update({
        data: { redoneCorrect: true }
      });
    }
  }

  const date = todayText();
  const summary = await db.collection('study_summary').where({ openid, date }).limit(1).get();
  if (summary.data.length) {
    await db.collection('study_summary').doc(summary.data[0]._id).update({
      data: {
        answerCount: _.inc(1),
        correctCount: _.inc(isCorrect ? 1 : 0),
        updatedAt: db.serverDate()
      }
    });
  } else {
    await db.collection('study_summary').add({
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
