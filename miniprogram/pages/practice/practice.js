const { questions } = require('../../data/questions');
const { chapters } = require('../../data/chapters');
const { isCorrectAnswer, getQuestionTypeLabel, normalizeAnswer } = require('../../utils/question');
const { saveAnswer, toggleFavorite, saveNote } = require('../../services/study');

Page({
  data: {
    chapter: null,
    questions: [],
    currentIndex: 0,
    current: null,
    selected: [],
    submitted: false,
    isCorrect: false,
    favorited: false,
    typeLabel: '',
    correctAnswerText: '',
    currentNo: 1,
    answerTitle: '',
    answerClass: '',
    favoriteText: '收藏'
  },

  onLoad(options) {
    const chapterId = options.chapterId || 'humanities';
    const list = options.mode === 'wrong'
      ? questions
      : questions.filter((item) => item.chapterId === chapterId);
    const safeList = list.length ? list : questions;
    this.setQuestionState(safeList, 0, chapterId);
  },

  setQuestionState(list, index, chapterId) {
    const current = this.decorateQuestion(list[index], []);
    this.setData({
      chapter: chapters.find((item) => item.id === (chapterId || current.chapterId)) || chapters[0],
      questions: list,
      currentIndex: index,
      currentNo: index + 1,
      current,
      selected: [],
      submitted: false,
      isCorrect: false,
      favorited: false,
      typeLabel: getQuestionTypeLabel(current.type),
      correctAnswerText: normalizeAnswer(current.answer),
      answerTitle: '',
      answerClass: '',
      favoriteText: '收藏'
    });
  },

  decorateQuestion(question, selected) {
    return {
      ...question,
      options: question.options.map((option) => ({
        ...option,
        selected: selected.includes(option.key),
        isAnswer: normalizeAnswer(question.answer).split(',').includes(option.key),
        optionClass: [
          selected.includes(option.key) ? 'selected' : '',
          this.data && this.data.submitted && normalizeAnswer(question.answer).split(',').includes(option.key) ? 'correct' : ''
        ].join(' ')
      }))
    };
  },

  selectOption(event) {
    if (this.data.submitted) return;
    const key = event.currentTarget.dataset.key;
    const current = this.data.current;
    if (current.type === 'multiple') {
      const selected = this.data.selected.includes(key)
        ? this.data.selected.filter((item) => item !== key)
        : this.data.selected.concat(key);
      this.setData({ selected, current: this.decorateQuestion(current, selected) });
      return;
    }
    this.setData({ selected: [key], current: this.decorateQuestion(current, [key]) });
  },

  submit() {
    if (!this.data.selected.length) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }
    const current = this.data.current;
    const answer = current.type === 'multiple' ? this.data.selected : this.data.selected[0];
    const isCorrect = isCorrectAnswer(current, answer);
    this.setData({
      submitted: true,
      isCorrect,
      answerTitle: isCorrect ? '回答正确' : '回答错误',
      answerClass: isCorrect ? 'ok' : 'bad',
      current: {
        ...current,
        options: current.options.map((option) => ({
          ...option,
          optionClass: [
            option.selected ? 'selected' : '',
            option.isAnswer ? 'correct' : ''
          ].join(' ')
        }))
      }
    });
    saveAnswer({
      questionId: current.id,
      chapterId: current.chapterId,
      type: current.type,
      answer,
      isCorrect,
      duration: 0,
      source: 'practice'
    }).catch(() => wx.showToast({ title: '答题记录同步失败', icon: 'none' }));
  },

  next() {
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      wx.showToast({ title: '已完成本组练习', icon: 'none' });
      return;
    }
    this.setQuestionState(this.data.questions, nextIndex);
  },

  prev() {
    const prevIndex = Math.max(0, this.data.currentIndex - 1);
    this.setQuestionState(this.data.questions, prevIndex);
  },

  toggleFavorite() {
    const current = this.data.current;
    toggleFavorite({ targetType: 'question', targetId: current.id })
      .then((res) => this.setData({ favorited: res.favorited, favoriteText: res.favorited ? '已收藏' : '收藏' }))
      .catch(() => wx.showToast({ title: '收藏同步失败', icon: 'none' }));
  },

  saveNote() {
    const current = this.data.current;
    saveNote({ questionId: current.id, content: '重点复习本题考点' })
      .then(() => wx.showToast({ title: '笔记已保存' }))
      .catch(() => wx.showToast({ title: '笔记同步失败', icon: 'none' }));
  },

  showCard() {
    wx.showToast({ title: '答题卡建设中', icon: 'none' });
  },

  normalize(answer) {
    return normalizeAnswer(answer);
  }
});
