const { materialCategories, materials } = require('../../data/materials');

Page({
  data: {
    keyword: '',
    categories: materialCategories,
    materials
  },

  goDetail(event) {
    wx.navigateTo({ url: `/pages/material-detail/material-detail?id=${event.currentTarget.dataset.id}` });
  }
});
