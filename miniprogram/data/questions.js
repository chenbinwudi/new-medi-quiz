const questions = [
  {
    id: 'q-drug-quality-001',
    examId: 'licensed-doctor-medical',
    chapterId: 'humanities',
    type: 'single',
    stem: '关于药品质量标准的说法，错误的是（ ）。',
    options: [
      { key: 'A', text: '药品质量标准是药品生产、检验、贸易的法定依据' },
      { key: 'B', text: '国家药品标准分为中国药典、国家药品标准和地方药品标准' },
      { key: 'C', text: '药品质量标准是衡量药品质量是否合格的唯一标准' },
      { key: 'D', text: '药品质量标准应当科学合理、先进、可操作性强' },
      { key: 'E', text: '药品质量标准由国务院药品监督管理部门制定' }
    ],
    answer: 'B',
    analysis: '国家药品标准包括《中国药典》和国务院药品监督管理部门颁布的药品标准，不包括地方药品标准。',
    difficulty: 'normal',
    tags: ['药品质量标准', '法规']
  },
  {
    id: 'q-basic-001',
    examId: 'licensed-doctor-medical',
    chapterId: 'basic',
    type: 'single',
    stem: '细胞膜的主要结构基础是（ ）。',
    options: [
      { key: 'A', text: '蛋白质单层' },
      { key: 'B', text: '脂质双分子层' },
      { key: 'C', text: '糖原颗粒' },
      { key: 'D', text: '核酸链' }
    ],
    answer: 'B',
    analysis: '细胞膜以脂质双分子层为基本骨架，蛋白质镶嵌或附着其上。',
    difficulty: 'easy',
    tags: ['细胞生物学']
  },
  {
    id: 'q-clinical-001',
    examId: 'licensed-doctor-medical',
    chapterId: 'clinical',
    type: 'multiple',
    stem: '下列属于发热常见病因的是（ ）。',
    options: [
      { key: 'A', text: '感染' },
      { key: 'B', text: '肿瘤' },
      { key: 'C', text: '免疫性疾病' },
      { key: 'D', text: '脱水' }
    ],
    answer: ['A', 'B', 'C'],
    analysis: '感染、肿瘤和免疫性疾病均可引起发热，脱水不是发热的典型病因分类。',
    difficulty: 'normal',
    tags: ['症状学', '发热']
  }
];

module.exports = { questions };
