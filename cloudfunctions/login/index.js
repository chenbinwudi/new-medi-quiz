const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event = {}) => {
  const { OPENID: openid } = cloud.getWXContext();
  const now = db.serverDate();
  const users = db.collection('users');
  const existing = await users.where({ openid }).limit(1).get();
  const profile = {
    openid,
    nickName: event.nickName || event.nickname || '医考通用户',
    avatarUrl: event.avatarUrl || '',
    memberLevel: 'free',
    lastLoginAt: now,
    updatedAt: now
  };

  if (existing.data.length) {
    const user = existing.data[0];
    await users.doc(user._id).update({ data: profile });
    return { user: { ...user, ...profile, lastLoginAt: Date.now(), updatedAt: Date.now() } };
  }

  const user = { ...profile, createdAt: now };
  const created = await users.add({ data: user });

  return {
    user: {
      _id: created._id,
      openid,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      memberLevel: user.memberLevel,
      lastLoginAt: Date.now()
    }
  };
};
