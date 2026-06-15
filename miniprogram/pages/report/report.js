const { getStudyData } = require('../../services/study');

const demoTrend = [
  { date: '04-14', accuracy: 72, dotStyle: 'bottom: 26%;', lineStyle: 'height: 72%;' },
  { date: '04-15', accuracy: 76, dotStyle: 'bottom: 34%;', lineStyle: 'height: 76%;' },
  { date: '04-16', accuracy: 80, dotStyle: 'bottom: 42%;', lineStyle: 'height: 80%;' },
  { date: '04-17', accuracy: 85, dotStyle: 'bottom: 52%;', lineStyle: 'height: 85%;' },
  { date: '04-18', accuracy: 88, dotStyle: 'bottom: 58%;', lineStyle: 'height: 88%;' },
  { date: '04-19', accuracy: 90, dotStyle: 'bottom: 62%;', lineStyle: 'height: 90%;' },
  { date: '04-20', accuracy: 86, dotStyle: 'bottom: 54%;', lineStyle: 'height: 86%;' }
];

Page({
  data: {
    tabs: [
      { value: 'data', label: '学习数据' },
      { value: 'ability', label: '能力分析' }
    ],
    active: 'data',
    trend: demoTrend,
    stats: { total: '325', correct: '280', accuracy: '85%' },
    distribution: [
      { label: '单选题', value: 120, percent: '60%', styleText: 'background: #35c6c8;' },
      { label: '多选题', value: 60, percent: '30%', styleText: 'background: #ffa629;' },
      { label: '不定项', value: 20, percent: '10%', styleText: 'background: #2f7bff;' }
    ],
    loading: true,
    refreshing: false,
    error: false,
    emptyVisible: false,
    moreStatus: 'noMore'
  },

  onLoad() {
    this.load();
  },

  load() {
    this.setData({ loading: !this.data.refreshing, error: false });
    getStudyData('report')
      .then((res) => {
        const summary = res.summary || [];
        if (!summary.length) {
          this.setData({
            loading: false,
            refreshing: false,
            emptyVisible: false,
            moreStatus: 'noMore'
          });
          wx.stopPullDownRefresh();
          return;
        }
        const total = summary.reduce((sum, item) => sum + (item.answerCount || 0), 0);
        const correct = summary.reduce((sum, item) => sum + (item.correctCount || 0), 0);
        const accuracy = total ? `${Math.round((correct / total) * 100)}%` : '0%';
        this.setData({
          stats: { total: String(total), correct: String(correct), accuracy },
          loading: false,
          refreshing: false,
          emptyVisible: false,
          moreStatus: 'noMore'
        });
        wx.stopPullDownRefresh();
      })
      .catch(() => {
        this.setData({ loading: false, refreshing: false, error: true });
        wx.stopPullDownRefresh();
      });
  },

  reload() {
    this.load();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.load();
  },

  onReachBottom() {
    this.setData({ moreStatus: 'noMore' });
  },

  onTabChange(event) {
    this.setData({ active: event.detail.value });
  },

  goPractice() {
    wx.navigateTo({ url: '/pages/practice/practice?source=chapter&categoryId=basic' });
  }
});
