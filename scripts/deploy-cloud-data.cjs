const { execFileSync } = require('child_process');
const seed = require('../miniprogram/data/cloud-seed');
const { collections } = require('../miniprogram/data/cloud-contracts');

const envId = process.env.CLOUDBASE_ENV_ID || 'cloudbase-d0g4yo1qac1bbd1db';
const contentOnly = process.argv.includes('--content-only');

function runNosql(commands) {
  const json = JSON.stringify(commands);
  const bin = process.platform === 'win32' ? 'C:\\Program Files\\nodejs\\node.exe' : 'npx';
  const prefix = process.platform === 'win32'
    ? ['C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npx-cli.js']
    : [];
  execFileSync(bin, prefix.concat([
    '--package',
    '@cloudbase/cli',
    'cloudbase',
    'db',
    'nosql',
    'execute',
    '-e',
    envId,
    '--command',
    json
  ]), { stdio: 'inherit' });
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function ensureCollection(name) {
  runNosql([
    {
      TableName: name,
      CommandType: 'INSERT',
      Command: JSON.stringify({ insert: name, documents: [{ _id: '__init__', createdBy: 'deploy-script' }] })
    },
    {
      TableName: name,
      CommandType: 'DELETE',
      Command: JSON.stringify({ delete: name, deletes: [{ q: { _id: '__init__' }, limit: 1 }] })
    }
  ]);
}

function replaceByIds(name, idField, docs) {
  const batchSize = name === collections.questions || name === collections.papers ? 1 : 5;
  for (const part of chunk(docs, batchSize)) {
    runNosql([
      {
        TableName: name,
        CommandType: 'DELETE',
        Command: JSON.stringify({
          delete: name,
          deletes: part.map((item) => ({ q: { [idField]: item[idField] }, limit: 0 }))
        })
      },
      {
        TableName: name,
        CommandType: 'INSERT',
        Command: JSON.stringify({
          insert: name,
          documents: part.map((item) => ({
            ...item,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }))
        })
      }
    ]);
  }
}

const allCollections = [
  collections.users,
  collections.questionCategories,
  collections.subjects,
  collections.questions,
  collections.papers,
  collections.materials,
  collections.answerRecords,
  collections.wrongQuestions,
  collections.favorites,
  collections.notes,
  collections.studyReports,
  collections.memberships,
  collections.orders,
  collections.downloads
];

console.log(`Preparing CloudBase data in ${envId}`);
if (!contentOnly) {
  allCollections.forEach((name) => {
    console.log(`Ensuring collection ${name}`);
    ensureCollection(name);
  });
}

console.log('Uploading categories');
replaceByIds(collections.questionCategories, 'categoryId', seed.categories);

console.log('Uploading subjects');
replaceByIds(collections.subjects, 'subjectId', seed.subjects);

console.log('Uploading questions');
replaceByIds(collections.questions, 'questionId', seed.questions);

console.log('Uploading papers');
replaceByIds(collections.papers, 'paperId', seed.papers);

console.log('Uploading materials');
replaceByIds(collections.materials, 'materialId', seed.materials);

console.log('cloud data deploy ok');
