const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

async function list(collection, openid) {
  const result = await db.collection(collection).where({ openid }).limit(20).get();
  return result.data;
}

exports.main = async () => {
  const { OPENID: openid } = cloud.getWXContext();
  const safeOpenid = openid || '__preview__';
  const [users, orders, downloads] = await Promise.all([
    db.collection('users').where({ openid: safeOpenid }).limit(1).get(),
    list('orders', safeOpenid),
    list('downloads', safeOpenid)
  ]);
  const user = users.data[0] || null;
  return {
    user,
    orders,
    downloads,
    membership: { level: user ? user.memberLevel || 'free' : 'guest' }
  };
};
