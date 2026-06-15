const defaultPrimaryId = 'clinical';
const selectedPrimaryStorageKey = 'selectedPrimaryId';

const primaryModules = [
  {
    primaryId: 'clinical',
    title: '临床医学综合',
    subtitle: '按系统分类强化临床综合能力',
    icon: '/assets/icons/chapter.svg',
    color: 'orange',
    categoryId: 'clinical',
    subjects: [
      { subjectId: 'respiratory-system', title: '呼吸系统', categoryId: 'clinical', total: 40 },
      { subjectId: 'cardiovascular-system', title: '心血管系统', categoryId: 'clinical', total: 40 },
      { subjectId: 'digestive-system', title: '消化系统', categoryId: 'clinical', total: 40 },
      { subjectId: 'urinary-male-reproductive', title: '泌尿系统，含男性生殖系统', categoryId: 'clinical', total: 40 },
      { subjectId: 'female-reproductive-system', title: '女性生殖系统', categoryId: 'clinical', total: 40 },
      { subjectId: 'hematologic-system', title: '血液系统', categoryId: 'clinical', total: 40 },
      { subjectId: 'metabolic-endocrine-system', title: '代谢、内分泌系统', categoryId: 'clinical', total: 40 },
      { subjectId: 'psychiatric-neurologic-system', title: '精神、神经系统', categoryId: 'clinical', total: 40 },
      { subjectId: 'motor-system', title: '运动系统', categoryId: 'clinical', total: 40 },
      { subjectId: 'rheumatic-immune-diseases', title: '风湿免疫性疾病', categoryId: 'clinical', total: 40 },
      { subjectId: 'pediatric-diseases', title: '儿科疾病', categoryId: 'clinical', total: 40 },
      { subjectId: 'infectious-std-diseases', title: '传染病、性传播疾病', categoryId: 'clinical', total: 40 },
      { subjectId: 'other-integrated-diseases', title: '其他相关疾病 / 综合疾病', categoryId: 'clinical', total: 40 }
    ]
  },
  {
    primaryId: 'basic',
    title: '基础医学综合',
    subtitle: '解剖、生化、生理与基础病理药理',
    icon: '/assets/icons/summary.svg',
    color: 'blue',
    categoryId: 'basic',
    subjects: [
      { subjectId: 'anatomy', title: '解剖学', categoryId: 'basic', total: 40 },
      { subjectId: 'biochemistry', title: '生物化学', categoryId: 'basic', total: 40 },
      { subjectId: 'physiology', title: '生理学', categoryId: 'basic', total: 40 },
      { subjectId: 'medical-microbiology', title: '医学微生物学', categoryId: 'basic', total: 40 },
      { subjectId: 'medical-immunology', title: '医学免疫学', categoryId: 'basic', total: 40 },
      { subjectId: 'pathology', title: '病理学', categoryId: 'basic', total: 40 },
      { subjectId: 'pathophysiology', title: '病理生理学', categoryId: 'basic', total: 40 },
      { subjectId: 'pharmacology', title: '药理学', categoryId: 'basic', total: 40 }
    ]
  },
  {
    primaryId: 'preventive',
    title: '预防医学综合',
    subtitle: '预防总论、流统与健康管理',
    icon: '/assets/icons/analysis.svg',
    color: 'green',
    categoryId: 'preventive',
    subjects: [
      { subjectId: 'preventive-medicine-overview', title: '预防医学总论', categoryId: 'preventive', total: 40 },
      { subjectId: 'epidemiology', title: '流行病学', categoryId: 'preventive', total: 40 },
      { subjectId: 'health-statistics', title: '卫生统计学', categoryId: 'preventive', total: 40 },
      { subjectId: 'public-health-related', title: '公共卫生相关内容', categoryId: 'preventive', total: 40 },
      { subjectId: 'clinical-preventive-services', title: '临床预防服务', categoryId: 'preventive', total: 40 },
      { subjectId: 'population-health-management', title: '人群健康管理', categoryId: 'preventive', total: 40 }
    ]
  },
  {
    primaryId: 'humanity',
    title: '医学人文综合',
    subtitle: '法规、伦理、心理与沟通',
    icon: '/assets/icons/book.svg',
    color: 'purple',
    categoryId: 'humanity',
    subjects: [
      { subjectId: 'medical-ethics', title: '医学伦理学', categoryId: 'humanity', total: 40 },
      { subjectId: 'health-law', title: '卫生法规', categoryId: 'humanity', total: 40 },
      { subjectId: 'medical-psychology', title: '医学心理学', categoryId: 'humanity', total: 40 },
      { subjectId: 'doctor-patient-communication', title: '医患沟通', categoryId: 'humanity', total: 40 }
    ]
  },
  {
    primaryId: 'tcm-basic',
    title: '中医学基础',
    subtitle: '中医理论、诊断、治法和常识',
    icon: '/assets/icons/mindmap.svg',
    color: 'teal',
    categoryId: 'tcm-basic',
    subjects: [
      { subjectId: 'tcm-basic-theory', title: '中医学基本理论', categoryId: 'tcm-basic', total: 40 },
      { subjectId: 'tcm-diagnostic-basics', title: '中医诊断基础', categoryId: 'tcm-basic', total: 40 },
      { subjectId: 'tcm-treatment-principles', title: '中医治则治法', categoryId: 'tcm-basic', total: 40 },
      { subjectId: 'common-tcm-basics', title: '常见中医基础知识', categoryId: 'tcm-basic', total: 40 }
    ]
  },
  {
    primaryId: 'practice',
    title: '实践综合',
    subtitle: '临床思维、技能操作与病例分析',
    icon: '/assets/icons/mock-paper.svg',
    color: 'red',
    categoryId: 'practice',
    subjects: [
      { subjectId: 'clinical-thinking', title: '临床思维', categoryId: 'practice', total: 40 },
      { subjectId: 'physical-examination', title: '体格检查', categoryId: 'practice', total: 40 },
      { subjectId: 'basic-procedures', title: '基本操作', categoryId: 'practice', total: 40 },
      { subjectId: 'history-taking', title: '病史采集', categoryId: 'practice', total: 40 },
      { subjectId: 'case-analysis', title: '病例分析', categoryId: 'practice', total: 40 },
      { subjectId: 'auxiliary-exam-interpretation', title: '辅助检查结果判读', categoryId: 'practice', total: 40 }
    ]
  }
];

function getPrimaryModule(primaryId) {
  return primaryModules.find((item) => item.primaryId === primaryId)
    || primaryModules.find((item) => item.primaryId === defaultPrimaryId)
    || primaryModules[0];
}

function getSubjectsForPrimary(primaryId) {
  return getPrimaryModule(primaryId).subjects;
}

function getAllSubjects() {
  return primaryModules.flatMap((module) => (
    module.subjects.map((subject, index) => ({
      ...subject,
      primaryId: module.primaryId,
      primaryTitle: module.title,
      order: index + 1
    }))
  ));
}

function getSubject(subjectId) {
  return getAllSubjects().find((item) => item.subjectId === subjectId) || null;
}

function buildPracticeUrl(primaryId, subject) {
  return `/pages/practice/practice?source=chapter&primaryId=${primaryId}&subjectId=${subject.subjectId}&categoryId=${subject.categoryId}`;
}

module.exports = {
  primaryModules,
  defaultPrimaryId,
  selectedPrimaryStorageKey,
  getPrimaryModule,
  getSubjectsForPrimary,
  getAllSubjects,
  getSubject,
  buildPracticeUrl
};
