const { getMaterials, toggleFavorite } = require('../../services/study');
const seed = require('../../data/cloud-seed');

function materialView(item) {
  return {
    ...item,
    id: item.materialId || item.id,
    summary: item.intro || item.summary || '围绕高频考点、常见题型和解题思路整理，适合章节复习和考前查漏补缺。',
    updatedAt: item.updatedAt || '2026-06-12',
    catalog: item.catalog || ['核心考点梳理', '典型题型分析', '易错点提示', '复习建议']
  };
}

Page({
  data: {
    material: null,
    activeTab: 'intro',
    favorited: false,
    introActive: true,
    catalogActive: false,
    introClass: 'active',
    catalogClass: '',
    starIcon: '/assets/icons/star.svg'
  },

  onLoad(options) {
    const materialId = options.id || options.materialId;
    getMaterials({ materialId }).then((data) => {
      const material = data.detail || seed.materials.find((item) => item.materialId === materialId) || seed.materials[0];
      this.setData({ material: materialView(material) });
    });
  },

  switchTab(event) {
    const activeTab = event.currentTarget.dataset.tab;
    this.setData({
      activeTab,
      introActive: activeTab === 'intro',
      catalogActive: activeTab === 'catalog',
      introClass: activeTab === 'intro' ? 'active' : '',
      catalogClass: activeTab === 'catalog' ? 'active' : ''
    });
  },

  toggleFavorite() {
    const material = this.data.material;
    toggleFavorite({ targetType: 'material', targetId: material.id, title: material.title })
      .then((res) => this.setData({
        favorited: res.favorited,
        starIcon: res.favorited ? '/assets/icons/star-filled.svg' : '/assets/icons/star.svg'
      }))
      .catch(() => wx.showToast({ title: '收藏同步失败', icon: 'none' }));
  },

  startLearning() {
    wx.navigateTo({ url: '/pages/downloads/downloads' });
  },

  onShareAppMessage() {
    const material = this.data.material;
    return {
      title: material ? material.title : '医考通资料',
      path: `/pages/material-detail/material-detail?id=${material ? material.id : ''}`
    };
  }
});
