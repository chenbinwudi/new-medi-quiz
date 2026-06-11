const { exams } = require('../../data/exams');
const { materials } = require('../../data/materials');
const { daysUntil } = require('../../utils/date');

Page({
  data: {
    exam: exams[0],
    daysLeft: 0,
    stats: { questionCount: '30', doneCount: '25', accuracy: '83%' },
    shortcuts: [
      { label: '章节练习', url: '/pages/bank/bank', color: '#2f7bff' },
      { label: '历年真题', url: '/pages/bank/bank?tab=real', color: '#45c56f' },
      { label: '模拟试卷', url: '/pages/bank/bank?tab=mock', color: '#ff914d' },
      { label: '考点速记', url: '/pages/bank/bank?tab=notes', color: '#8f6cff' },
      { label: '错题本', url: '/pages/wrong/wrong', color: '#ff5a5f' },
      { label: '收藏题', url: '/pages/favorites/favorites', color: '#ffb329' },
      { label: '笔记', url: '/pages/favorites/favorites?tab=notes', color: '#28b7a8' },
      { label: '学习报告', url: '/pages/report/report', color: '#3d7dff' }
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
