const categories = [
  { categoryId: 'basic', title: '基础医学综合', order: 1, total: 40 },
  { categoryId: 'humanity', title: '医学人文综合', order: 2, total: 40 },
  { categoryId: 'clinical', title: '临床医学综合', order: 3, total: 40 },
  { categoryId: 'preventive', title: '预防医学综合', order: 4, total: 40 },
  { categoryId: 'tcm-basic', title: '中医学基础', order: 5, total: 40 },
  { categoryId: 'tcm-clinical', title: '中医临床医学', order: 6, total: 40 },
  { categoryId: 'oral', title: '口腔医学综合', order: 7, total: 40 },
  { categoryId: 'public-health', title: '公共卫生综合', order: 8, total: 40 }
];

const stems = {
  basic: '关于细胞损伤与修复机制的临床理解，下列判断最符合医学综合考试要求的是',
  humanity: '关于医患沟通和医学伦理原则的应用，下列处理最符合规范的是',
  clinical: '患者出现发热、咳嗽和实验室指标异常时，下列诊疗思路最合理的是',
  preventive: '关于传染病预防控制和流行病学调查，下列做法最恰当的是',
  'tcm-basic': '关于中医基础理论中脏腑辨证的理解，下列说法最恰当的是',
  'tcm-clinical': '根据常见证候表现进行辨证论治时，下列治法选择最合理的是',
  oral: '关于口腔常见疾病的检查和处理原则，下列判断最恰当的是',
  'public-health': '关于公共卫生监测、健康教育和风险评估，下列措施最合理的是'
};

const chapterTitles = [
  '绪论与基本概念',
  '常见病因与发病机制',
  '诊断思路与辅助检查',
  '治疗原则与随访管理',
  '预防控制与健康教育',
  '综合病例分析'
];

function buildOptions(type) {
  const base = [
    { key: 'A', text: '先明确主要问题，再结合病史、体征和必要检查综合判断。' },
    { key: 'B', text: '仅根据单一症状立即给出最终诊断。' },
    { key: 'C', text: '关注危险因素、鉴别诊断以及后续随访。' },
    { key: 'D', text: '忽略患者个体差异，直接套用固定方案。' },
    { key: 'E', text: '在证据不足时不记录判断依据。' }
  ];
  return type === 'single' ? base.slice(0, 4) : base;
}

function buildQuestion(category, index) {
  const type = index % 7 === 0 ? 'multi' : (index % 11 === 0 ? 'indefinite' : 'single');
  const chapterNumber = (index % chapterTitles.length) + 1;
  return {
    questionId: `${category.categoryId}-${String(index).padStart(3, '0')}`,
    categoryId: category.categoryId,
    categoryTitle: category.title,
    chapterId: `${category.categoryId}-chapter-${chapterNumber}`,
    chapterTitle: chapterTitles[chapterNumber - 1],
    type,
    stem: `${stems[category.categoryId]}（原创仿真第${index}题）。`,
    options: buildOptions(type),
    answer: type === 'single' ? ['A'] : ['A', 'C'],
    analysis: '本题为原创仿真题，考查基础知识与临床思维的结合。正确处理应以病史、体征、检查和风险评估为依据，避免单一线索直接下结论。',
    difficulty: index % 5 === 0 ? 'hard' : (index % 3 === 0 ? 'medium' : 'easy'),
    tags: [category.title, chapterTitles[chapterNumber - 1], `考点${(index % 10) + 1}`],
    status: 'published',
    updatedAtText: '2026-06-12'
  };
}

const questions = categories.flatMap((category) => (
  Array.from({ length: category.total }, (_, i) => buildQuestion(category, i + 1))
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
  type: 'PDF',
  size: `${(1.8 + index / 10).toFixed(1)}M`,
  learnerCount: 800 + index * 137,
  favoriteCount: 120 + index * 23,
  status: 'published',
  intro: '围绕高频考点、常见题型和解题思路整理，适合章节复习和考前查漏补缺。'
}));

module.exports = { categories, questions, papers, materials };
