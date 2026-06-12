const { daysUntil } = require('../../utils/date');
const { getHomeData } = require('../../services/study');
const { homeShortcuts, tabPages } = require('../../data/cloud-contracts');
const seed = require('../../data/cloud-seed');

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

Page({
  data: {
    exam: mapExam(seed.categories[0]),
    examIndex: 0,
    examOptions: seed.categories.map((item) => item.title),
    daysLeft: 0,
    stats: { questionCount: '30', doneCount: '25', accuracy: '83%' },
    shortcuts: homeShortcuts.map((item) => ({
      label: item.title,
      url: item.route,
      icon: `/assets/icons/${item.icon}.svg`,
      tone: item.color
    })),
    materials: seed.materials.slice(0, 2).map(mapMaterial)
  },

  onLoad() {
    this.loadHomeData();
  },

  loadHomeData() {
    getHomeData().then((data) => {
      const exams = (data.exams && data.exams.length ? data.exams : seed.categories).map(mapExam);
      const exam = exams[this.data.examIndex] || exams[0];
      const today = data.today || {};
      const answerCount = Number(today.answerCount || 0);
      const correctCount = Number(today.correctCount || 0);
      const accuracy = answerCount ? `${Math.round((correctCount / answerCount) * 100)}%` : '0%';
      this.setData({
        exam,
        examOptions: exams.map((item) => item.name),
        daysLeft: daysUntil(exam.examDate),
        stats: {
          questionCount: String(answerCount || 30),
          doneCount: String(correctCount || 25),
          accuracy: answerCount ? accuracy : '83%'
        },
        materials: (data.recommendedMaterials || seed.materials.slice(0, 2)).map(mapMaterial)
      });
    });
  },

  onExamChange(event) {
    const examIndex = Number(event.detail.value);
    this.setData({ examIndex }, () => this.loadHomeData());
  },

  go(event) {
    const url = event.currentTarget.dataset.url;
    const page = url.split('?')[0];
    if (tabPages.includes(page)) wx.switchTab({ url: page });
    else wx.navigateTo({ url });
  },

  goMaterial(event) {
    wx.navigateTo({ url: `/pages/material-detail/material-detail?id=${event.currentTarget.dataset.id}` });
  }
});
