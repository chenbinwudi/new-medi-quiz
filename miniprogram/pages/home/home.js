const { exams } = require('../../data/exams');
const { materials } = require('../../data/materials');
const { daysUntil } = require('../../utils/date');

Page({
  data: {
    exam: exams[0],
    daysLeft: 0,
    stats: { questionCount: '30', doneCount: '25', accuracy: '83%' },
    shortcuts: [
      { label: '章节练习', url: '/pages/bank/bank', icon: '/assets/icons/chapter.svg', tone: 'blue' },
      { label: '历年真题', url: '/pages/bank/bank?tab=real', icon: '/assets/icons/real-paper.svg', tone: 'green' },
      { label: '模拟试卷', url: '/pages/bank/bank?tab=mock', icon: '/assets/icons/mock-paper.svg', tone: 'orange' },
      { label: '考点速记', url: '/pages/bank/bank?tab=notes', icon: '/assets/icons/quick-notes.svg', tone: 'purple' },
      { label: '错题本', url: '/pages/wrong/wrong', icon: '/assets/icons/wrong-book.svg', tone: 'red' },
      { label: '收藏题', url: '/pages/favorites/favorites', icon: '/assets/icons/favorite.svg', tone: 'amber' },
      { label: '笔记', url: '/pages/favorites/favorites?tab=notes', icon: '/assets/icons/note.svg', tone: 'teal' },
      { label: '学习报告', url: '/pages/report/report', icon: '/assets/icons/report.svg', tone: 'blue' }
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
