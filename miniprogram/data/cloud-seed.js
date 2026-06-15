const { primaryModules, getAllSubjects } = require('./module-tree');

const categoryQuestionTotals = {
  clinical: 80,
  basic: 60,
  preventive: 50,
  humanity: 40,
  'tcm-basic': 40,
  practice: 50
};

const categories = primaryModules.map((module, index) => ({
  categoryId: module.categoryId,
  primaryId: module.primaryId,
  title: module.title,
  subtitle: module.subtitle,
  order: index + 1,
  total: categoryQuestionTotals[module.primaryId] || 40
}));

const subjects = getAllSubjects();

const stems = {
  clinical: '关于患者临床表现、诊断思路和处理原则的综合判断，下列说法最符合执业医师考试要求的是',
  basic: '关于基础医学机制与临床理解的结合，下列判断最符合医学综合考试要求的是',
  preventive: '关于疾病预防、流行病学调查和人群健康管理，下列做法最恰当的是',
  humanity: '关于医患沟通、医学伦理和卫生法规原则的应用，下列处理最符合规范的是',
  'tcm-basic': '关于中医学基础理论、诊断和治则治法的理解，下列说法最恰当的是',
  practice: '关于实践技能、病史采集和病例分析的处理，下列步骤最合理的是'
};

const chapterTitles = [
  '核心概念与考试要求',
  '常见考点与易错点',
  '诊断思路与处理原则',
  '临床应用与综合分析',
  '预防管理与随访评估',
  '病例题解题训练'
];

function buildOptions(type) {
  const base = [
    { key: 'A', text: '先明确主要问题，再结合病史、体征和必要检查进行综合判断。' },
    { key: 'B', text: '仅根据单一症状立即给出最终诊断。' },
    { key: 'C', text: '关注危险因素、鉴别诊断以及后续随访管理。' },
    { key: 'D', text: '忽略患者个体差异，直接套用固定方案。' },
    { key: 'E', text: '在证据不足时不记录判断依据。' }
  ];
  return type === 'single' ? base.slice(0, 4) : base;
}

function buildQuestion(subject, index) {
  const category = categories.find((item) => item.categoryId === subject.categoryId) || categories[0];
  const type = index % 7 === 0 ? 'multi' : (index % 11 === 0 ? 'indefinite' : 'single');
  const chapterNumber = (index % chapterTitles.length) + 1;
  const primaryStem = stems[subject.primaryId] || stems[category.categoryId] || stems.clinical;
  return {
    questionId: `${subject.subjectId}-${String(index).padStart(3, '0')}`,
    primaryId: subject.primaryId,
    primaryTitle: subject.primaryTitle,
    categoryId: subject.categoryId,
    categoryTitle: category.title,
    subjectId: subject.subjectId,
    subjectTitle: subject.title,
    chapterId: `${subject.subjectId}-chapter-${chapterNumber}`,
    chapterTitle: chapterTitles[chapterNumber - 1],
    type,
    stem: `${primaryStem}（${subject.title}原创仿真第${index}题）。`,
    options: buildOptions(type),
    answer: type === 'single' ? ['A'] : ['A', 'C'],
    analysis: `本题围绕${subject.title}的高频考点设置，考查基础知识、临床思维和规范处理的结合。正确处理应以题干证据为依据，综合判断并避免单一线索下结论。`,
    difficulty: index % 5 === 0 ? 'hard' : (index % 3 === 0 ? 'medium' : 'easy'),
    tags: [category.title, subject.title, chapterTitles[chapterNumber - 1], `考点${(index % 10) + 1}`],
    status: 'published',
    updatedAtText: '2026-06-12'
  };
}

const questions = subjects.flatMap((subject) => (
  Array.from({ length: 10 }, (_, i) => buildQuestion(subject, i + 1))
));

const papers = [
  { paperId: 'mock-001', title: '执业医师医学综合模拟卷一', questionIds: questions.slice(0, 80).map((item) => item.questionId), type: 'mock', total: 80 },
  { paperId: 'mock-002', title: '执业医师医学综合模拟卷二', questionIds: questions.slice(80, 160).map((item) => item.questionId), type: 'mock', total: 80 },
  { paperId: 'real-like-001', title: '历年真题风格训练一', questionIds: questions.slice(160, 240).map((item) => item.questionId), type: 'real-like', total: 80 },
  { paperId: 'real-like-002', title: '历年真题风格训练二', questionIds: questions.slice(240, 320).map((item) => item.questionId), type: 'real-like', total: 80 }
];

const materials = categories.map((category, index) => ({
  materialId: `mat-${category.categoryId}`,
  title: `${category.title}核心考点速记`,
  categoryId: category.categoryId,
  primaryId: category.primaryId,
  type: 'PDF',
  size: `${(1.8 + index / 10).toFixed(1)}M`,
  learnerCount: 800 + index * 137,
  favoriteCount: 120 + index * 23,
  status: 'published',
  intro: '围绕高频考点、常见题型和解题思路整理，适合章节复习和考前查漏补缺。'
}));

module.exports = { categories, subjects, questions, papers, materials };
