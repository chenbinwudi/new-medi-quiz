const { getProfileData } = require('../../services/study');

Page({
  data: { level: 'guest' },
  onShow() {
    getProfileData().then((data) => {
      this.setData({ level: data.membership ? data.membership.level : 'guest' });
    });
  }
});
