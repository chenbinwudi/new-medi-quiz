const { login, getCachedUser } = require('../../services/user');

Page({
  data: {
    user: null,
    displayUser: {
      avatarText: '医',
      nickname: '点击登录',
      openid: '未同步',
      buttonText: '登录'
    },
    syncing: false,
    shortcuts: [
      { label: '错题本', url: '/pages/wrong/wrong', icon: '/assets/icons/wrong-book.svg', tone: 'red' },
      { label: '收藏题', url: '/pages/favorites/favorites', icon: '/assets/icons/favorite.svg', tone: 'amber' },
      { label: '笔记', url: '/pages/favorites/favorites?tab=notes', icon: '/assets/icons/note.svg', tone: 'teal' },
      { label: '做题记录', url: '/pages/report/report', icon: '/assets/icons/record.svg', tone: 'blue' },
      { label: '学习报告', url: '/pages/report/report', icon: '/assets/icons/report.svg', tone: 'green' }
    ],
    menus: [
      { label: '我的订单', icon: '/assets/icons/order.svg' },
      { label: '下载管理', icon: '/assets/icons/download.svg' },
      { label: '我的资料', icon: '/assets/icons/folder.svg' },
      { label: '我的笔记', icon: '/assets/icons/note.svg' },
      { label: '帮助与反馈', icon: '/assets/icons/guide.svg' },
      { label: '设置', icon: '/assets/icons/settings.svg' }
    ]
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
        avatarText: '医',
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
