const { getProfileData } = require('../../services/study');

const basePackages = [
  { id: 'month', name: '月度会员', desc: '适合短期冲刺复习', price: '¥19' },
  { id: 'season', name: '季度会员', desc: '覆盖一轮系统复习', price: '¥49' },
  { id: 'year', name: '年度会员', desc: '长期备考更划算', price: '¥128' }
];

Page({
  data: {
    level: 'guest',
    levelText: '游客',
    selectedPackage: 'season',
    packages: [],
    submitText: '立即开通',
    benefits: [
      { title: '专项题库', desc: '按章节和考点强化', icon: '/assets/icons/chapter.svg', tone: 'blue' },
      { title: '资料下载', desc: '大纲与速记资料', icon: '/assets/icons/download.svg', tone: 'green' },
      { title: '能力分析', desc: '定位薄弱知识点', icon: '/assets/icons/analysis.svg', tone: 'orange' },
      { title: '错题重练', desc: '高频错题反复练', icon: '/assets/icons/wrong-book.svg', tone: 'red' }
    ],
    loading: true,
    refreshing: false,
    error: false,
    submitting: false
  },

  onLoad() {
    this.renderPackages();
  },

  onShow() {
    this.load();
  },

  load() {
    this.setData({ loading: !this.data.refreshing, error: false });
    getProfileData().then((data) => {
      const level = data.membership ? data.membership.level : 'guest';
      this.setData({
        level,
        levelText: level === 'guest' ? '游客' : '会员',
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
    this.load();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.load();
  },

  renderPackages() {
    const packages = basePackages.map((item) => ({
      ...item,
      activeClass: item.id === this.data.selectedPackage ? 'active' : ''
    }));
    this.setData({ packages });
  },

  selectPackage(event) {
    this.setData({ selectedPackage: event.currentTarget.dataset.id }, () => this.renderPackages());
  },

  submitMember() {
    if (this.data.submitting) return;
    this.setData({ submitting: true, submitText: '处理中' });
    wx.showToast({ title: '演示版暂不支付', icon: 'none' });
    setTimeout(() => this.setData({ submitting: false, submitText: '立即开通' }), 500);
  }
});
