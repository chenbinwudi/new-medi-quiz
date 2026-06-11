const { questions } = require('../../data/questions');
const { chapters } = require('../../data/chapters');
const { getQuestionTypeLabel } = require('../../utils/question');
const { getStudyData } = require('../../services/study');

function hydrateWrong(records) {
  const source = records && records.length ? records : [
    { questionId: 'q-drug-quality-001', wrongCount: 2, lastWrongAt: '2024-04-20' },
    { questionId: 'q-clinical-001', wrongCount: 1, lastWrongAt: '2024-04-18' }
  ];
  return source.map((record) => {
    const question = questions.find((item) => item.id === record.questionId) || questions[0];
    const chapter = chapters.find((item) => item.id === question.chapterId) || {};
    return {
      ...record,
      question,
      chapterName: chapter.name,
      typeLabel: getQuestionTypeLabel(question.type),
      dateText: typeof record.lastWrongAt === 'string' ? record.lastWrongAt : '最近',
      countText: `${record.wrongCount || 1}次`
    };
  });
}

Page({
  data: {
    tabs: [
      { value: 'all', label: '全部错题' },
      { value: 'chapter', label: '按章节' },
      { value: 'type', label: '按题型' }
    ],
    active: 'all',
    loading: true,
    list: [],
    listCountText: '共0题',
    emptyVisible: false
  },

  onLoad() {
    this.load();
  },

  load() {
    getStudyData('wrong')
      .then((res) => {
        const list = hydrateWrong(res.wrongQuestions);
        this.setData({ list, listCountText: `共${list.length}题`, loading: false, emptyVisible: !list.length });
      })
      .catch(() => {
        wx.showToast({ title: '学习数据加载失败', icon: 'none' });
        const list = hydrateWrong([]);
        this.setData({ list, listCountText: `共${list.length}题`, loading: false, emptyVisible: !list.length });
      });
  },

  onTabChange(event) {
    this.setData({ active: event.detail.value });
  },

  goPractice() {
    wx.navigateTo({ url: '/pages/practice/practice?mode=wrong' });
  }
});
