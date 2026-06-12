const { getProfileData } = require('../../services/study');

Page({
  data: { downloads: [] },
  onShow() {
    getProfileData().then((data) => this.setData({ downloads: data.downloads || [] }));
  }
});
