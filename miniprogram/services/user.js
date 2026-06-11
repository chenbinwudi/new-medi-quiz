const { callFunction } = require('./cloud');

function login() {
  return callFunction('login').then((result) => {
    const user = result && result.user;
    if (user) {
      wx.setStorageSync('user', user);
      getApp().globalData.user = user;
    }
    return user;
  });
}

function getCachedUser() {
  return getApp().globalData.user || wx.getStorageSync('user') || null;
}

module.exports = { login, getCachedUser };
