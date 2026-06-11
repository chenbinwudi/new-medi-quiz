const { getStudyData } = require('../../services/study');

const demoTrend = [
  { date: '04-14', accuracy: 72 },
  { date: '04-15', accuracy: 76 },
  { date: '04-16', accuracy: 80 },
  { date: '04-17', accuracy: 85 },
  { date: '04-18', accuracy: 88 },
  { date: '04-19', accuracy: 90 },
  { date: '04-20', accuracy: 86 }
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
      { label: '单选题', value: 120, percent: '60%', color: '#35c6c8' },
      { label: '多选题', value: 60, percent: '30%', color: '#ffa629' },
      { label: '不定项', value: 20, percent: '10%', color: '#2f7bff' }
    ]
  },

  onLoad() {
    getStudyData('report')
      .then((res) => {
        const summary = res.summary || [];
        if (!summary.length) return;
        const total = summary.reduce((sum, item) => sum + (item.answerCount || 0), 0);
        const correct = summary.reduce((sum, item) => sum + (item.correctCount || 0), 0);
        const accuracy = total ? `${Math.round((correct / total) * 100)}%` : '0%';
        this.setData({ stats: { total: String(total), correct: String(correct), accuracy } });
      })
      .catch(() => wx.showToast({ title: '学习数据加载失败', icon: 'none' }));
  },

  onTabChange(event) {
    this.setData({ active: event.detail.value });
  }
});
