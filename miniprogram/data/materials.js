const materialCategories = [
  { id: 'outline', name: '考试大纲', color: '#2f7bff' },
  { id: 'textbook', name: '官方教材', color: '#46c06f' },
  { id: 'summary', name: '考点汇总', color: '#ff8b4a' },
  { id: 'mindmap', name: '思维导图', color: '#5f8dff' },
  { id: 'mnemonic', name: '记忆口诀', color: '#ffa629' },
  { id: 'analysis', name: '真题解析', color: '#8b6cff' },
  { id: 'guide', name: '临床指南', color: '#35c6a4' },
  { id: 'more', name: '更多资料', color: '#f06aaa' }
];

const materials = [
  {
    id: 'mat-outline-2024',
    categoryId: 'outline',
    title: '2024年执业医师考试大纲（医学综合）',
    type: 'PDF',
    size: '2.4M',
    learnerCount: 1234,
    summary: '根据最新考试大纲整理，包含考试范围、考试要求和重点内容。',
    catalog: ['考试说明', '基础医学综合', '医学人文综合', '临床医学综合'],
    updatedAt: '2024-03-20'
  },
  {
    id: 'mat-internal-summary',
    categoryId: 'summary',
    title: '执业医师高频考点汇总（内部资料）',
    type: 'PDF',
    size: '1.8M',
    learnerCount: 987,
    summary: '覆盖高频考点和易错点，适合考前快速复习。',
    catalog: ['高频考点', '易错总结', '考前冲刺'],
    updatedAt: '2024-04-02'
  },
  {
    id: 'mat-real-analysis',
    categoryId: 'analysis',
    title: '历年真题及解析（2019-2023）',
    type: 'PDF',
    size: '5.6M',
    learnerCount: 2468,
    summary: '精选近年真题并配套解析，帮助把握命题方向。',
    catalog: ['2019 真题', '2020 真题', '2021 真题', '2022 真题', '2023 真题'],
    updatedAt: '2024-04-10'
  },
  {
    id: 'mat-mindmap',
    categoryId: 'mindmap',
    title: '思维导图：医学综合知识框架',
    type: 'XMind',
    size: '3.2M',
    learnerCount: 765,
    summary: '用结构化导图串联医学综合核心知识点。',
    catalog: ['基础医学', '临床医学', '预防医学', '医学人文'],
    updatedAt: '2024-04-12'
  }
];

module.exports = { materialCategories, materials };
