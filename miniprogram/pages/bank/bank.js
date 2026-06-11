const { exams } = require('../../data/exams');
const { chapters } = require('../../data/chapters');
const { realPapers, mockPapers, quickNotes } = require('../../data/bank-content');
const { buildChapterProgress, percent } = require('../../utils/progress');

function getPanelFlags(activeTab) {
  return {
    showChapter: activeTab === 'chapter',
    showReal: activeTab === 'real',
    showMock: activeTab === 'mock',
    showNotes: activeTab === 'notes'
  };
}

Page({
  data: {
    exam: exams[0],
    activeTab: 'chapter',
    tabs: [
      { value: 'chapter', label: '章节练习' },
      { value: 'real', label: '历年真题' },
      { value: 'mock', label: '模拟试卷' },
      { value: 'notes', label: '考点速记' }
    ],
    progress: [],
    realPapers,
    mockPapers,
    quickNotes,
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
    const summaryByChapter = { basic: 235, humanities: 120 };
    const progress = buildChapterProgress(chapters, summaryByChapter).map((item) => ({
      ...item,
      progressStyle: `width: ${item.progress}%;`,
      statusText: item.progress ? '继续练习' : '开始练习'
    }));
    const totalDone = progress.reduce((sum, item) => sum + item.learned, 0);
    const totalCount = progress.reduce((sum, item) => sum + item.totalCount, 0);
    const totalPercent = percent(totalDone, totalCount);
    const activeTab = options.tab || 'chapter';
    this.setData({
      activeTab,
      progress,
      totalDone,
      totalCount,
      totalPercent,
      totalProgressStyle: `width: ${totalPercent}%;`,
      ...getPanelFlags(activeTab)
    });
  },

  onTabChange(event) {
    const activeTab = event.detail.value;
    this.setData({
      activeTab,
      ...getPanelFlags(activeTab)
    });
  },

  goPractice(event) {
    wx.navigateTo({ url: `/pages/practice/practice?chapterId=${event.currentTarget.dataset.id}` });
  },

  startPaper(event) {
    const chapterId = event.currentTarget.dataset.chapterId || 'humanities';
    wx.navigateTo({ url: `/pages/practice/practice?chapterId=${chapterId}` });
  },

  openNote(event) {
    const chapterId = event.currentTarget.dataset.chapterId || 'humanities';
    wx.navigateTo({ url: `/pages/practice/practice?chapterId=${chapterId}` });
  }
});
