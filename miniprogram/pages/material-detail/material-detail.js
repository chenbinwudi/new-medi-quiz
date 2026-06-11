const { materials } = require('../../data/materials');
const { toggleFavorite } = require('../../services/study');

Page({
  data: {
    material: null,
    activeTab: 'intro',
    favorited: false
  },

  onLoad(options) {
    const material = materials.find((item) => item.id === options.id) || materials[0];
    this.setData({ material });
  },

  switchTab(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab });
  },

  toggleFavorite() {
    toggleFavorite({ targetType: 'material', targetId: this.data.material.id })
      .then((res) => this.setData({ favorited: res.favorited }))
      .catch(() => wx.showToast({ title: '收藏同步失败', icon: 'none' }));
  },

  startLearning() {
    wx.showToast({ title: '资料阅读功能建设中', icon: 'none' });
  },

  onShareAppMessage() {
    const material = this.data.material;
    return {
      title: material ? material.title : '医考通资料',
      path: `/pages/material-detail/material-detail?id=${material ? material.id : ''}`
    };
  }
});
