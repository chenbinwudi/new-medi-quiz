const { callFunction } = require('./cloud');
const { storageKeys } = require('../data/cloud-contracts');

function getGuestUser() {
  return { openid: '', nickName: '游客', avatarUrl: '', memberLevel: 'guest', isGuest: true };
}

function setCachedUser(user) {
  wx.setStorageSync(storageKeys.user, user);
  getApp().globalData.user = user;
  return user;
}

function login(profile = {}) {
  return callFunction('login', profile).then((result) => {
    const user = result && result.user ? result.user : getGuestUser();
    return setCachedUser(user);
  }).catch(() => getCachedUser());
}

function getCachedUser() {
  return getApp().globalData.user || wx.getStorageSync(storageKeys.user) || getGuestUser();
}

function syncGuestData(payload) {
  return callFunction('syncGuestData', { payload });
}

module.exports = { login, getCachedUser, getGuestUser, syncGuestData, setCachedUser };
