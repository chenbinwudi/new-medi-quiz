const { getQuestionBank, getStudyData } = require('../../services/study');
const seed = require('../../data/cloud-seed');
const {
  primaryModules,
  defaultPrimaryId,
  selectedPrimaryStorageKey,
  getPrimaryModule,
  getSubjectsForPrimary,
  buildPracticeUrl
} = require('../../data/module-tree');
const { decorateSubjectsWithProgress } = require('../../utils/module-progress');

function getPanelFlags(activeTab) {
  return {
    showChapter: activeTab === 'chapter',
    showReal: activeTab === 'real',
    showMock: activeTab === 'mock',
    showNotes: activeTab === 'memory' || activeTab === 'notes'
  };
}

function decoratePrimaryModules(selectedPrimaryId) {
  return primaryModules.map((item) => ({
    ...item,
    activeClass: item.primaryId === selectedPrimaryId ? 'active' : ''
  }));
}

function buildTotalProgress(subjects) {
  const totalDone = subjects.reduce((sum, item) => sum + item.done, 0);
  const totalCount = subjects.reduce((sum, item) => sum + item.total, 0);
  const totalCorrect = subjects.reduce((sum, item) => sum + item.correct, 0);
  const totalPercent = totalCount ? Math.round((totalDone / totalCount) * 100) : 0;
  const totalAccuracy = totalDone ? Math.round((totalCorrect / totalDone) * 100) : 0;
  return {
    totalDone,
    totalCount,
    totalPercent,
    totalAccuracy,
    totalProgressStyle: `width: ${totalPercent}%;`
  };
}

function paperView(item) {
  return {
    id: item.paperId || item.id,
    paperId: item.paperId || item.id,
    chapterId: item.categoryId || 'clinical',
    title: item.title,
    desc: item.type === 'mock' ? '原创仿真模拟训练' : '真题风格原创训练',
    questionCount: item.total || (item.questionIds ? item.questionIds.length : 0),
    duration: '120分钟'
  };
}

Page({
  data: {
    exam: { fullName: '执业医师（医学综合）' },
    activeTab: 'chapter',
    tabs: [
      { value: 'chapter', label: '章节练习' },
      { value: 'real', label: '历年真题' },
      { value: 'mock', label: '模拟试卷' },
      { value: 'memory', label: '考点速记' }
    ],
    selectedPrimaryId: defaultPrimaryId,
    selectedPrimary: getPrimaryModule(defaultPrimaryId),
    primaryModules: decoratePrimaryModules(defaultPrimaryId),
    subjects: decorateSubjectsWithProgress(getSubjectsForPrimary(defaultPrimaryId), []),
    progress: [],
    realPapers: [],
    mockPapers: [],
    quickNotes: [],
    totalDone: 0,
    totalCount: 0,
    totalPercent: 0,
    totalAccuracy: 0,
    totalProgressStyle: 'width: 0%;',
    showChapter: true,
    showReal: false,
    showMock: false,
    showNotes: false,
    loading: true,
    refreshing: false,
    error: false,
    moreStatus: 'noMore',
    currentListLength: 0
  },

  onLoad(options) {
    const activeTab = options.tab || 'chapter';
    const selectedPrimaryId = options.primaryId || wx.getStorageSync(selectedPrimaryStorageKey) || defaultPrimaryId;
    this.setData({
      activeTab,
      selectedPrimaryId,
      selectedPrimary: getPrimaryModule(selectedPrimaryId),
      primaryModules: decoratePrimaryModules(selectedPrimaryId),
      ...getPanelFlags(activeTab)
    });
    this.loadBank();
  },

  onShow() {
    const selectedPrimaryId = wx.getStorageSync(selectedPrimaryStorageKey) || this.data.selectedPrimaryId || defaultPrimaryId;
    if (selectedPrimaryId === this.data.selectedPrimaryId) return;
    this.setData({
      selectedPrimaryId,
      selectedPrimary: getPrimaryModule(selectedPrimaryId),
      primaryModules: decoratePrimaryModules(selectedPrimaryId)
    });
    this.loadBank();
  },

  loadBank() {
    this.setData({ loading: !this.data.refreshing, error: false });
    Promise.all([
      getQuestionBank(),
      getStudyData('answers').catch(() => ({ answerRecords: [] }))
    ]).then(([data, study]) => {
      const subjects = decorateSubjectsWithProgress(
        getSubjectsForPrimary(this.data.selectedPrimaryId),
        study.answerRecords || []
      );
      const total = buildTotalProgress(subjects);
      const realPapers = (data.realPapers || []).map(paperView);
      const mockPapers = (data.mockPapers || []).map(paperView);
      const quickNotes = (data.memories || []).map((item) => ({
        id: item.memoryId,
        tag: '速记',
        title: item.title,
        desc: '按高频考点整理，练完对应章节更容易形成知识框架。',
        chapterId: item.categoryId
      }));
      this.setData({
        subjects,
        progress: subjects,
        realPapers,
        mockPapers,
        quickNotes,
        ...total,
        loading: false,
        refreshing: false,
        error: false
      });
      this.updateCurrentListLength();
      wx.stopPullDownRefresh();
    }).catch(() => {
      this.setData({ loading: false, refreshing: false, error: true });
      wx.stopPullDownRefresh();
    });
  },

  reload() {
    this.loadBank();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadBank();
  },

  onReachBottom() {
    if (this.data.currentListLength) this.setData({ moreStatus: 'noMore' });
  },

  onTabChange(event) {
    const activeTab = event.detail.value;
    this.setData({ activeTab, ...getPanelFlags(activeTab) });
    this.updateCurrentListLength();
  },

  selectPrimary(event) {
    const selectedPrimaryId = event.currentTarget.dataset.primaryId;
    wx.setStorageSync(selectedPrimaryStorageKey, selectedPrimaryId);
    this.setData({
      selectedPrimaryId,
      selectedPrimary: getPrimaryModule(selectedPrimaryId),
      primaryModules: decoratePrimaryModules(selectedPrimaryId)
    });
    this.loadBank();
  },

  updateCurrentListLength() {
    const { activeTab, subjects, realPapers, mockPapers, quickNotes } = this.data;
    const map = {
      chapter: subjects.length,
      real: realPapers.length,
      mock: mockPapers.length,
      memory: quickNotes.length,
      notes: quickNotes.length
    };
    this.setData({ currentListLength: map[activeTab] || 0, moreStatus: 'noMore' });
  },

  goPractice(event) {
    wx.navigateTo({ url: `/pages/practice/practice?source=chapter&categoryId=${event.currentTarget.dataset.id}` });
  },

  goSubjectPractice(event) {
    const subjectId = event.currentTarget.dataset.subjectId;
    const subject = this.data.subjects.find((item) => item.subjectId === subjectId);
    if (!subject) return;
    wx.navigateTo({ url: buildPracticeUrl(this.data.selectedPrimaryId, subject) });
  },

  startPaper(event) {
    wx.navigateTo({ url: `/pages/practice/practice?source=paper&paperId=${event.currentTarget.dataset.paperId || event.currentTarget.dataset.chapterId}` });
  },

  openNote(event) {
    const chapterId = event.currentTarget.dataset.chapterId || 'clinical';
    wx.navigateTo({ url: `/pages/practice/practice?source=chapter&categoryId=${chapterId}` });
  }
});
