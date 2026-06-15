const { daysUntil } = require('../../utils/date');
const { getHomeData, getStudyData } = require('../../services/study');
const { homeShortcuts, tabPages } = require('../../data/cloud-contracts');
const seed = require('../../data/cloud-seed');
const {
  primaryModules,
  defaultPrimaryId,
  selectedPrimaryStorageKey,
  getPrimaryModule
} = require('../../data/module-tree');
const { decorateSubjectsWithProgress } = require('../../utils/module-progress');

function mapExam(item) {
  return {
    id: item.categoryId,
    name: item.title,
    fullName: `${item.title} · 医学综合`,
    examDate: '2026-08-23'
  };
}

function mapMaterial(item) {
  return {
    ...item,
    id: item.materialId || item.id,
    summary: item.intro || item.summary || '',
    updatedAt: item.updatedAtText || '2026-06-12'
  };
}

function decoratePrimaryModules(selectedPrimaryId, records) {
  return primaryModules.map((module) => {
    const subjects = decorateSubjectsWithProgress(module.subjects, records);
    const done = subjects.reduce((sum, item) => sum + item.done, 0);
    const total = subjects.reduce((sum, item) => sum + item.total, 0);
    const correct = subjects.reduce((sum, item) => sum + item.correct, 0);
    const progress = total ? Math.round((done / total) * 100) : 0;
    const accuracy = done ? Math.round((correct / done) * 100) : 0;
    return {
      ...module,
      activeClass: module.primaryId === selectedPrimaryId ? 'active' : '',
      done,
      total,
      progress,
      accuracyText: `${accuracy}%`,
      progressText: `${done}/${total}`,
      progressStyle: `width: ${progress}%;`
    };
  });
}

Page({
  data: {
    exam: mapExam(seed.categories[0]),
    examIndex: 0,
    examOptions: seed.categories.map((item) => item.title),
    daysLeft: 0,
    selectedPrimaryId: defaultPrimaryId,
    selectedPrimary: getPrimaryModule(defaultPrimaryId),
    primaryModules: decoratePrimaryModules(defaultPrimaryId, []),
    stats: { questionCount: '30', doneCount: '25', accuracy: '83%' },
    shortcuts: homeShortcuts.map((item) => ({
      label: item.title,
      url: item.route,
      icon: `/assets/icons/${item.icon}.svg`,
      tone: item.color
    })),
    materials: seed.materials.slice(0, 2).map(mapMaterial),
    loading: true,
    refreshing: false,
    error: false,
    moreStatus: 'noMore'
  },

  onLoad() {
    const selectedPrimaryId = wx.getStorageSync(selectedPrimaryStorageKey) || defaultPrimaryId;
    this.setData({
      selectedPrimaryId,
      selectedPrimary: getPrimaryModule(selectedPrimaryId),
      primaryModules: decoratePrimaryModules(selectedPrimaryId, [])
    });
    this.loadHomeData();
  },

  loadHomeData() {
    this.setData({ loading: !this.data.refreshing, error: false });
    Promise.all([
      getHomeData(),
      getStudyData('answers').catch(() => ({ answerRecords: [] }))
    ]).then(([data, study]) => {
      const exams = (data.exams && data.exams.length ? data.exams : seed.categories).map(mapExam);
      const exam = exams[this.data.examIndex] || exams[0];
      const today = data.today || {};
      const answerCount = Number(today.answerCount || 0);
      const correctCount = Number(today.correctCount || 0);
      const accuracy = answerCount ? `${Math.round((correctCount / answerCount) * 100)}%` : '0%';
      const records = study.answerRecords || [];
      this.setData({
        exam,
        examOptions: exams.map((item) => item.name),
        daysLeft: daysUntil(exam.examDate),
        primaryModules: decoratePrimaryModules(this.data.selectedPrimaryId, records),
        selectedPrimary: getPrimaryModule(this.data.selectedPrimaryId),
        stats: {
          questionCount: String(answerCount || 30),
          doneCount: String(correctCount || 25),
          accuracy: answerCount ? accuracy : '83%'
        },
        materials: (data.recommendedMaterials || seed.materials.slice(0, 2)).map(mapMaterial),
        loading: false,
        refreshing: false,
        error: false,
        moreStatus: 'noMore'
      });
      wx.stopPullDownRefresh();
    }).catch(() => {
      this.setData({ loading: false, refreshing: false, error: true });
      wx.stopPullDownRefresh();
    });
  },

  reload() {
    this.loadHomeData();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadHomeData();
  },

  onReachBottom() {
    if (this.data.materials.length) this.setData({ moreStatus: 'noMore' });
  },

  onExamChange(event) {
    const examIndex = Number(event.detail.value);
    this.setData({ examIndex }, () => this.loadHomeData());
  },

  selectPrimary(event) {
    const selectedPrimaryId = event.currentTarget.dataset.primaryId;
    wx.setStorageSync(selectedPrimaryStorageKey, selectedPrimaryId);
    this.setData({
      selectedPrimaryId,
      selectedPrimary: getPrimaryModule(selectedPrimaryId),
      primaryModules: decoratePrimaryModules(selectedPrimaryId, [])
    });
    this.loadHomeData();
  },

  goSelectedBank() {
    wx.setStorageSync(selectedPrimaryStorageKey, this.data.selectedPrimaryId);
    wx.switchTab({ url: '/pages/bank/bank' });
  },

  go(event) {
    const url = event.currentTarget.dataset.url;
    const page = url.split('?')[0];
    if (tabPages.includes(page)) wx.switchTab({ url: page });
    else wx.navigateTo({ url });
  },

  goMaterial(event) {
    wx.navigateTo({ url: `/pages/material-detail/material-detail?id=${event.currentTarget.dataset.id}` });
  },

  goPractice() {
    this.goSelectedBank();
  },

  goMaterials() {
    wx.switchTab({ url: '/pages/materials/materials' });
  }
});
