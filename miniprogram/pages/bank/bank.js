const { getQuestionBank } = require('../../services/study');
const seed = require('../../data/cloud-seed');

function getPanelFlags(activeTab) {
  return {
    showChapter: activeTab === 'chapter',
    showReal: activeTab === 'real',
    showMock: activeTab === 'mock',
    showNotes: activeTab === 'memory' || activeTab === 'notes'
  };
}

function chapterProgress(item) {
  const totalCount = item.total || 40;
  const learned = item.learned || 0;
  const progress = totalCount ? Math.round((learned / totalCount) * 100) : 0;
  return {
    id: item.categoryId || item.id,
    name: item.title || item.name,
    learned,
    totalCount,
    progress,
    progressStyle: `width: ${progress}%;`,
    statusText: progress ? '继续练习' : '开始练习'
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
    progress: [],
    realPapers: [],
    mockPapers: [],
    quickNotes: [],
    totalDone: 0,
    totalCount: 0,
    totalPercent: 0,
    totalProgressStyle: 'width: 0%;',
    showChapter: true,
    showReal: false,
    showMock: false,
    showNotes: false
  },

  onLoad(options) {
    const activeTab = options.tab || 'chapter';
    this.setData({ activeTab, ...getPanelFlags(activeTab) });
    this.loadBank();
  },

  loadBank() {
    getQuestionBank().then((data) => {
      const progress = (data.chapters && data.chapters.length ? data.chapters : seed.categories).map(chapterProgress);
      const totalDone = progress.reduce((sum, item) => sum + item.learned, 0);
      const totalCount = progress.reduce((sum, item) => sum + item.totalCount, 0);
      const totalPercent = totalCount ? Math.round((totalDone / totalCount) * 100) : 0;
      this.setData({
        progress,
        realPapers: (data.realPapers || []).map(paperView),
        mockPapers: (data.mockPapers || []).map(paperView),
        quickNotes: (data.memories || []).map((item) => ({
          id: item.memoryId,
          tag: '速记',
          title: item.title,
          desc: '按高频考点整理，练完对应章节更容易形成知识框架。',
          chapterId: item.categoryId
        })),
        totalDone,
        totalCount,
        totalPercent,
        totalProgressStyle: `width: ${totalPercent}%;`
      });
    });
  },

  onTabChange(event) {
    const activeTab = event.detail.value;
    this.setData({ activeTab, ...getPanelFlags(activeTab) });
  },

  goPractice(event) {
    wx.navigateTo({ url: `/pages/practice/practice?source=chapter&categoryId=${event.currentTarget.dataset.id}` });
  },

  startPaper(event) {
    wx.navigateTo({ url: `/pages/practice/practice?source=paper&paperId=${event.currentTarget.dataset.paperId || event.currentTarget.dataset.chapterId}` });
  },

  openNote(event) {
    const chapterId = event.currentTarget.dataset.chapterId || 'clinical';
    wx.navigateTo({ url: `/pages/practice/practice?source=chapter&categoryId=${chapterId}` });
  }
});
