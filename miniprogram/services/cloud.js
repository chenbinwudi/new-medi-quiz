function callFunction(name, data = {}) {
  if (!wx.cloud) {
    return Promise.reject(new Error('当前基础库不支持云开发'));
  }

  return wx.cloud.callFunction({ name, data })
    .then((res) => res.result)
    .catch((err) => {
      console.error(`[cloud] ${name} failed`, err);
      throw err;
    });
}

module.exports = { callFunction };
