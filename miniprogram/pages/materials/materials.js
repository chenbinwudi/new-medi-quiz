const { getMaterials } = require('../../services/study');
const seed = require('../../data/cloud-seed');

function materialView(item) {
  return {
    ...item,
    id: item.materialId || item.id
  };
}

Page({
  data: {
    keyword: '',
    categories: seed.categories.map((item, index) => ({
      id: item.categoryId,
      name: item.title,
      icon: '/assets/icons/outline.svg',
      styleText: `background: ${['#eaf2ff', '#eafaf2', '#fff4e8', '#f3edff'][index % 4]};`
    })),
    materials: seed.materials.map(materialView)
  },

  onShow() {
    getMaterials().then((data) => {
      this.setData({ materials: (data.materials || seed.materials).map(materialView) });
    });
  },

  goDetail(event) {
    wx.navigateTo({ url: `/pages/material-detail/material-detail?id=${event.currentTarget.dataset.id}` });
  }
});
