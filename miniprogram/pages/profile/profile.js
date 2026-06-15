const { login, getCachedUser, syncGuestData } = require('../../services/user');
const { getProfileData, readStore } = require('../../services/study');

Page({
  data: {
    user: null,
    displayUser: {
      avatarText: '医',
      nickname: '游客模式',
      openid: '未同步',
      buttonText: '登录同步'
    },
    syncing: false,
    loading: true,
    refreshing: false,
    error: false,
    memberLevel: 'guest',
    memberButtonText: '立即开通',
    shortcuts: [
      { label: '错题本', url: '/pages/wrong/wrong', icon: '/assets/icons/wrong-book.svg', tone: 'red' },
      { label: '收藏题', url: '/pages/favorites/favorites', icon: '/assets/icons/favorite.svg', tone: 'amber' },
      { label: '笔记', url: '/pages/favorites/favorites?tab=notes', icon: '/assets/icons/note.svg', tone: 'teal' },
      { label: '做题记录', url: '/pages/report/report', icon: '/assets/icons/record.svg', tone: 'blue' },
      { label: '学习报告', url: '/pages/report/report', icon: '/assets/icons/report.svg', tone: 'green' }
    ],
    menus: [
      { label: '我的订单', url: '/pages/orders/orders', icon: '/assets/icons/order.svg' },
      { label: '下载管理', url: '/pages/downloads/downloads', icon: '/assets/icons/download.svg' },
      { label: '我的资料', url: '/pages/my-materials/my-materials', icon: '/assets/icons/folder.svg' },
      { label: '我的笔记', url: '/pages/favorites/favorites?tab=notes', icon: '/assets/icons/note.svg' },
      { label: '帮助与反馈', url: '/pages/feedback/feedback', icon: '/assets/icons/guide.svg' },
      { label: '设置', url: '/pages/settings/settings', icon: '/assets/icons/settings.svg' }
    ]
  },

  onShow() {
    this.setUser(getCachedUser());
    this.loadProfile();
  },

  loadProfile() {
    this.setData({ loading: !this.data.refreshing, error: false });
    getProfileData().then((data) => {
      this.setData({
        memberLevel: data.membership ? data.membership.level : 'guest',
        memberButtonText: data.membership && data.membership.level !== 'guest' ? '查看权益' : '立即开通',
        loading: false,
        refreshing: false,
        error: false
      });
      wx.stopPullDownRefresh();
    }).catch(() => {
      this.setData({ loading: false, refreshing: false, error: true });
      wx.stopPullDownRefresh();
    });
  },

  reload() {
    this.loadProfile();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadProfile();
  },

  login() {
    if (this.data.syncing) return;
    this.setData({ syncing: true });
    login()
      .then((user) => syncGuestData(readStore()).then(() => user).catch(() => user))
      .then((user) => {
        this.setUser(user);
        wx.showToast({ title: '已同步', icon: 'success' });
      })
      .catch(() => wx.showToast({ title: '登录失败', icon: 'none' }))
      .then(() => this.setData({ syncing: false }));
  },

  setUser(user) {
    const isGuest = !user || user.isGuest;
    this.setData({
      user,
      displayUser: {
        avatarText: isGuest ? '医' : (user.nickName || '医').slice(0, 1),
        nickname: isGuest ? '游客模式' : user.nickName,
        openid: isGuest ? '未同步' : user.openid,
        buttonText: isGuest ? '登录同步' : '刷新同步'
      }
    });
  },

  go(event) {
    wx.navigateTo({ url: event.currentTarget.dataset.url });
  },

  goMember() {
    wx.navigateTo({ url: '/pages/member-center/member-center' });
  },

  menuTap(event) {
    const name = event.currentTarget.dataset.name;
    const item = this.data.menus.find((menu) => menu.label === name);
    if (item && item.url) wx.navigateTo({ url: item.url });
  }
});
