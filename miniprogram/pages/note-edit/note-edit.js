const { saveNote } = require('../../services/study');

Page({
  data: { questionId: '', chapterId: '', content: '' },
  onLoad(options) {
    this.setData({
      questionId: options.questionId || '',
      chapterId: options.chapterId || '',
      content: options.content || ''
    });
  },
  onInput(event) {
    this.setData({ content: event.detail.value });
  },
  save() {
    saveNote(this.data).then(() => {
      wx.showToast({ title: '已保存', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 500);
    });
  }
});
