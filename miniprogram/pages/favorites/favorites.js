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

function hydrateNotes(records) {
  const source = records && records.length
    ? records
    : [{ questionId: 'q-drug-quality-001', content: '重点复习本题考点', updatedAt: '2024-04-20' }];
  return source.map((record) => {
    const question = questions.find((item) => item.id === record.questionId) || questions[0];
    const chapter = chapters.find((item) => item.id === question.chapterId) || {};
    return {
      ...record,
      question,
      chapterName: chapter.name,
      dateText: typeof record.updatedAt === 'string' ? record.updatedAt : '最近'
    };
  });
}

function panelFlags(active) {
  return {
    showFavorites: active === 'favorites',
    showNotes: active === 'notes'
  };
}

Page({
  data: {
    tabs: [
      { value: 'favorites', label: '收藏题' },
      { value: 'notes', label: '我的笔记' }
    ],
    active: 'favorites',
    loading: true,
    list: [],
    notes: [],
    listCountText: '共0题',
    notesCountText: '共0条',
    emptyVisible: false,
    notesEmptyVisible: false,
    showFavorites: true,
    showNotes: false
  },

  onLoad(options) {
    const active = options.tab === 'notes' ? 'notes' : 'favorites';
    this.setData({
      active,
      ...panelFlags(active)
    });
    this.load();
  },

  load() {
    getStudyData('all')
      .then((res) => {
        const list = hydrateFavorites(res.favorites);
        const notes = hydrateNotes(res.notes);
        this.setData({
          list,
          notes,
          listCountText: `共${list.length}题`,
          notesCountText: `共${notes.length}条`,
          loading: false,
          emptyVisible: !list.length,
          notesEmptyVisible: !notes.length
        });
      })
      .catch(() => {
        wx.showToast({ title: '学习数据加载失败', icon: 'none' });
        const list = hydrateFavorites([]);
        const notes = hydrateNotes([]);
        this.setData({
          list,
          notes,
          listCountText: `共${list.length}题`,
          notesCountText: `共${notes.length}条`,
          loading: false,
          emptyVisible: !list.length,
          notesEmptyVisible: !notes.length
        });
      });
  },

  onTabChange(event) {
    const active = event.detail.value;
    this.setData({
      active,
      ...panelFlags(active)
    });
  },

  goPractice() {
    const first = this.data.list[0];
    wx.navigateTo({ url: `/pages/practice/practice?chapterId=${first ? first.question.chapterId : 'humanities'}` });
  },

  goNotePractice(event) {
    const chapterId = event.currentTarget.dataset.chapterId || 'humanities';
    wx.navigateTo({ url: `/pages/practice/practice?chapterId=${chapterId}` });
  }
});
