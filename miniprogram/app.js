App({
  globalData: {
    envId: 'cloudbase-d0g4yo1qac1bbd1db',
    user: null
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.envId,
        traceUser: true
      });
    }
  }
});
