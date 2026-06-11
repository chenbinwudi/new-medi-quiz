const { login, getCachedUser } = require('../../services/user');

Page({
  data: {
    user: null,
    displayUser: {
      avatarText: '未',
      nickname: '点击登录',
      openid: '未同步',
      buttonText: '登录'
    },
    syncing: false,
    shortcuts: [
      { label: '错题本', url: '/pages/wrong/wrong', displayIndex: 1 },
      { label: '收藏题', url: '/pages/favorites/favorites', displayIndex: 2 },
      { label: '笔记', url: '/pages/favorites/favorites?tab=notes', displayIndex: 3 },
      { label: '做题记录', url: '/pages/report/report', displayIndex: 4 },
      { label: '学习报告', url: '/pages/report/report', displayIndex: 5 }
    ],
    menus: ['我的订单', '下载管理', '我的资料', '我的笔记', '帮助与反馈', '设置']
  },

  onShow() {
    this.setUser(getCachedUser());
  },

  login() {
    this.setData({ syncing: true });
    login()
      .then((user) => this.setUser(user))
      .catch(() => wx.showToast({ title: '登录失败', icon: 'none' }))
      .finally(() => this.setData({ syncing: false }));
  },

  setUser(user) {
    this.setData({
      user,
      displayUser: {
        avatarText: user ? '医' : '未',
        nickname: user ? user.nickname : '点击登录',
        openid: user ? user.openid : '未同步',
        buttonText: user ? '刷新' : '登录'
      }
    });
  },

  go(event) {
    wx.navigateTo({ url: event.currentTarget.dataset.url });
  },

  menuTap(event) {
    wx.showToast({ title: `${event.currentTarget.dataset.name}建设中`, icon: 'none' });
  }
});
