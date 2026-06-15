const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event = {}) => {
  const { OPENID: openid } = cloud.getWXContext();
  const source = event.source || 'chapter';

  if (source === 'paper') {
    const paperResult = await db.collection('papers').where({ paperId: event.paperId }).limit(1).get();
    const paper = paperResult.data[0];
    if (!paper) return { questions: [], title: '练习' };
    const questions = await db.collection('questions').where({
      questionId: _.in(paper.questionIds.slice(0, 100))
    }).limit(100).get();
    return { title: paper.title, questions: questions.data };
  }

  if (source === 'wrong') {
    const wrong = await db.collection('wrong_questions').where({ openid }).limit(100).get();
    const ids = wrong.data.map((item) => item.questionId);
    if (!ids.length) return { title: '错题重练', questions: [] };
    const questions = await db.collection('questions').where({ questionId: _.in(ids) }).limit(100).get();
    return { title: '错题重练', questions: questions.data };
  }

  if (event.subjectId) {
    const result = await db.collection('questions').where({
      subjectId: event.subjectId,
      status: 'published'
    }).limit(100).get();
    return { title: '章节练习', questions: result.data };
  }

  const categoryId = event.categoryId || event.chapterId || 'clinical';
  const result = await db.collection('questions').where({
    categoryId,
    status: 'published'
  }).limit(100).get();
  return { title: '章节练习', questions: result.data };
};
