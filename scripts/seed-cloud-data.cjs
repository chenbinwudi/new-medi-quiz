const seed = require('../miniprogram/data/cloud-seed');
const { collections } = require('../miniprogram/data/cloud-contracts');

const dryRun = process.argv.includes('--dry-run');

function rows() {
  return [
    [collections.questionCategories, seed.categories, 'categoryId'],
    [collections.questions, seed.questions, 'questionId'],
    [collections.papers, seed.papers, 'paperId'],
    [collections.materials, seed.materials, 'materialId']
  ];
}

async function main() {
  if (dryRun) {
    rows().forEach(([collection, items, key]) => {
      console.log(`${collection}: ${items.length} records by ${key}`);
    });
    console.log('dry run ok');
    return;
  }

  const cloudbase = require('@cloudbase/node-sdk');
  const env = process.env.CLOUDBASE_ENV_ID || 'cloudbase-d0g4yo1qac1bbd1db';
  const app = cloudbase.init({ env });
  const db = app.database();

  for (const [collection, items, key] of rows()) {
    for (const item of items) {
      const found = await db.collection(collection).where({ [key]: item[key] }).get();
      if (found.data && found.data[0]) {
        await db.collection(collection).doc(found.data[0]._id).update({ ...item, updatedAt: Date.now() });
      } else {
        await db.collection(collection).add({ ...item, createdAt: Date.now(), updatedAt: Date.now() });
      }
    }
    console.log(`${collection}: upserted ${items.length}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
