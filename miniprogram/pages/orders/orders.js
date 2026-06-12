const { getProfileData } = require('../../services/study');

Page({
  data: { orders: [] },
  onShow() {
    getProfileData().then((data) => this.setData({ orders: data.orders || [] }));
  }
});
