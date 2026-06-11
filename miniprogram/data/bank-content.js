const realPapers = [
  {
    id: 'real-2023',
    title: '2023 年执业医师医学综合真题',
    desc: '按正式考试题型整理，适合查漏补缺。',
    questionCount: 120,
    duration: '120 分钟',
    chapterId: 'humanities'
  },
  {
    id: 'real-2022',
    title: '2022 年执业医师医学综合真题',
    desc: '覆盖基础医学、临床医学与医学人文。',
    questionCount: 120,
    duration: '120 分钟',
    chapterId: 'basic'
  }
];

const mockPapers = [
  {
    id: 'mock-sprint-01',
    title: '考前冲刺模拟卷（一）',
    desc: '高频考点组合训练，建议限时完成。',
    questionCount: 100,
    duration: '100 分钟',
    chapterId: 'clinical'
  },
  {
    id: 'mock-basic-01',
    title: '基础医学专项模拟卷',
    desc: '聚焦基础医学易错知识点。',
    questionCount: 80,
    duration: '80 分钟',
    chapterId: 'basic'
  }
];

const quickNotes = [
  {
    id: 'note-quality-standard',
    title: '药品质量标准速记',
    desc: '国家药品标准不包括地方药品标准。',
    tag: '法规',
    chapterId: 'humanities'
  },
  {
    id: 'note-cell-membrane',
    title: '细胞膜结构速记',
    desc: '细胞膜以脂质双分子层为基本骨架。',
    tag: '基础医学',
    chapterId: 'basic'
  },
  {
    id: 'note-fever',
    title: '发热病因速记',
    desc: '感染、肿瘤、免疫性疾病是常见病因方向。',
    tag: '临床医学',
    chapterId: 'clinical'
  }
];

module.exports = { realPapers, mockPapers, quickNotes };
