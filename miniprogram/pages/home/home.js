const { exams } = require('../../data/exams');
const { materials } = require('../../data/materials');
const { daysUntil } = require('../../utils/date');

Page({
  data: {
    exam: exams[0],
    daysLeft: 0,
    stats: { questionCount: '30', doneCount: '25', accuracy: '83%' },
    shortcuts: [
      { label: '章节练习', url: '/pages/bank/bank', styleText: 'background: #2f7bff;', displayIndex: 1 },
      { label: '历年真题', url: '/pages/bank/bank?tab=real', styleText: 'background: #45c56f;', displayIndex: 2 },
      { label: '模拟试卷', url: '/pages/bank/bank?tab=mock', styleText: 'background: #ff914d;', displayIndex: 3 },
      { label: '考点速记', url: '/pages/bank/bank?tab=notes', styleText: 'background: #8f6cff;', displayIndex: 4 },
      { label: '错题本', url: '/pages/wrong/wrong', styleText: 'background: #ff5a5f;', displayIndex: 5 },
      { label: '收藏题', url: '/pages/favorites/favorites', styleText: 'background: #ffb329;', displayIndex: 6 },
      { label: '笔记', url: '/pages/favorites/favorites?tab=notes', styleText: 'background: #28b7a8;', displayIndex: 7 },
      { label: '学习报告', url: '/pages/report/report', styleText: 'background: #3d7dff;', displayIndex: 8 }
    ],
    materials: materials.slice(0, 2)
  },

  onLoad() {
    this.setData({ daysLeft: daysUntil(this.data.exam.examDate) });
  },

  go(event) {
    wx.navigateTo({ url: event.currentTarget.dataset.url });
  },

  goMaterial(event) {
    wx.navigateTo({ url: `/pages/material-detail/material-detail?id=${event.currentTarget.dataset.id}` });
  }
});
