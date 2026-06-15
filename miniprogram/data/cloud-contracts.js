const collections = {
  users: 'users',
  questionCategories: 'question_categories',
  subjects: 'subjects',
  questions: 'questions',
  papers: 'papers',
  materials: 'materials',
  answerRecords: 'answer_records',
  wrongQuestions: 'wrong_questions',
  favorites: 'favorites',
  notes: 'notes',
  studyReports: 'study_reports',
  memberships: 'memberships',
  orders: 'orders',
  downloads: 'downloads'
};

const storageKeys = {
  user: 'user',
  guestStudy: 'mvpStudyData',
  syncQueue: 'guestSyncQueue'
};

const routes = {
  home: '/pages/home/home',
  bank: '/pages/bank/bank',
  materials: '/pages/materials/materials',
  profile: '/pages/profile/profile',
  practice: '/pages/practice/practice',
  wrong: '/pages/wrong/wrong',
  favorites: '/pages/favorites/favorites',
  report: '/pages/report/report',
  materialDetail: '/pages/material-detail/material-detail',
  result: '/pages/result/result',
  answerCard: '/pages/answer-card/answer-card',
  noteEdit: '/pages/note-edit/note-edit',
  memberCenter: '/pages/member-center/member-center',
  orders: '/pages/orders/orders',
  downloads: '/pages/downloads/downloads',
  myMaterials: '/pages/my-materials/my-materials',
  settings: '/pages/settings/settings',
  feedback: '/pages/feedback/feedback'
};

const homeShortcuts = [
  { id: 'chapter', title: '章节练习', route: `${routes.bank}?tab=chapter`, icon: 'chapter', color: 'blue' },
  { id: 'real', title: '历年真题', route: `${routes.bank}?tab=real`, icon: 'real-paper', color: 'green' },
  { id: 'mock', title: '模拟试卷', route: `${routes.bank}?tab=mock`, icon: 'mock-paper', color: 'orange' },
  { id: 'memory', title: '考点速记', route: `${routes.bank}?tab=memory`, icon: 'memory', color: 'purple' },
  { id: 'wrong', title: '错题本', route: routes.wrong, icon: 'wrong-book', color: 'red' },
  { id: 'favorites', title: '收藏题', route: routes.favorites, icon: 'favorite', color: 'yellow' },
  { id: 'notes', title: '笔记', route: `${routes.favorites}?tab=notes`, icon: 'note', color: 'mint' },
  { id: 'report', title: '学习报告', route: routes.report, icon: 'report', color: 'sky' }
];

const tabPages = [routes.home, routes.bank, routes.materials, routes.profile];

module.exports = { collections, storageKeys, routes, homeShortcuts, tabPages };
