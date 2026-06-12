Page({
  data: { total: 0, correctCount: 0 },
  onLoad(options) {
    this.setData({
      total: Number(options.total || 0),
      correctCount: Number(options.correct || 0)
    });
  },
  goReport() {
    wx.navigateTo({ url: '/pages/report/report' });
  }
});
