const { questions } = require('../../data/questions');
const { chapters } = require('../../data/chapters');
const { getQuestionTypeLabel } = require('../../utils/question');
const { getStudyData } = require('../../services/study');

function hydrateFavorites(records) {
  const source = records && records.length
    ? records.filter((item) => item.targetType === 'question')
    : [{ targetId: 'q-drug-quality-001', createdAt: '2024-04-20' }, { targetId: 'q-basic-001', createdAt: '2024-04-18' }];
  return source.map((record) => {
    const question = questions.find((item) => item.id === record.targetId) || questions[0];
    const chapter = chapters.find((item) => item.id === question.chapterId) || {};
    return {
      ...record,
      question,
      chapterName: chapter.name,
      typeLabel: getQuestionTypeLabel(question.type),
      dateText: typeof record.createdAt === 'string' ? record.createdAt : '最近'
    };
  });
}

Page({
  data: {
    tabs: [
      { value: 'all', label: '全部收藏' },
      { value: 'chapter', label: '按章节' },
      { value: 'type', label: '按题型' }
    ],
    active: 'all',
    loading: true,
    list: []
  },

  onLoad() {
    getStudyData('favorites')
      .then((res) => this.setData({ list: hydrateFavorites(res.favorites), loading: false }))
      .catch(() => {
        wx.showToast({ title: '学习数据加载失败', icon: 'none' });
        this.setData({ list: hydrateFavorites([]), loading: false });
      });
  },

  onTabChange(event) {
    this.setData({ active: event.detail.value });
  },

  goPractice() {
    const first = this.data.list[0];
    wx.navigateTo({ url: `/pages/practice/practice?chapterId=${first ? first.question.chapterId : 'humanities'}` });
  }
});
