const { login, getCachedUser } = require('../../services/user');

Page({
  data: {
    user: null,
    syncing: false,
    shortcuts: [
      { label: '错题本', url: '/pages/wrong/wrong' },
      { label: '收藏题', url: '/pages/favorites/favorites' },
      { label: '笔记', url: '/pages/favorites/favorites?tab=notes' },
      { label: '做题记录', url: '/pages/report/report' },
      { label: '学习报告', url: '/pages/report/report' }
    ],
    menus: ['我的订单', '下载管理', '我的资料', '我的笔记', '帮助与反馈', '设置']
  },

  onShow() {
    this.setData({ user: getCachedUser() });
  },

  login() {
    this.setData({ syncing: true });
    login()
      .then((user) => this.setData({ user }))
      .catch(() => wx.showToast({ title: '登录失败', icon: 'none' }))
      .finally(() => this.setData({ syncing: false }));
  },

  go(event) {
    wx.navigateTo({ url: event.currentTarget.dataset.url });
  },

  menuTap(event) {
    wx.showToast({ title: `${event.currentTarget.dataset.name}建设中`, icon: 'none' });
  }
});
