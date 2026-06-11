const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const now = db.serverDate();
  const users = db.collection('users');
  const existing = await users.where({ openid }).limit(1).get();

  if (existing.data.length) {
    const user = existing.data[0];
    await users.doc(user._id).update({ data: { lastLoginAt: now } });
    return { user: { ...user, lastLoginAt: Date.now() } };
  }

  const user = {
    openid,
    nickname: '医考小助手',
    avatarUrl: '',
    memberStatus: 'free',
    createdAt: now,
    lastLoginAt: now
  };
  const created = await users.add({ data: user });

  return {
    user: {
      _id: created._id,
      openid,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      memberStatus: user.memberStatus
    }
  };
};
