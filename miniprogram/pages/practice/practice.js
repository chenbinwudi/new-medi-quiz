const { isCorrectAnswer, getQuestionTypeLabel, normalizeAnswer, isMultipleType } = require('../../utils/question');
const { saveAnswer, toggleFavorite, getPracticeSession } = require('../../services/study');

Page({
  data: {
    chapter: null,
    questions: [],
    currentIndex: 0,
    current: null,
    selected: [],
    submitted: false,
    showSubmit: true,
    isCorrect: false,
    correctCount: 0,
    favorited: false,
    typeLabel: '',
    correctAnswerText: '',
    selectedAnswerText: '',
    currentNo: 1,
    answerTitle: '',
    answerClass: '',
    favoriteText: '收藏',
    favoriteIcon: '/assets/icons/star.svg',
    sourceOptions: {}
  },

  onLoad(options) {
    this.setData({ sourceOptions: options });
    getPracticeSession(options).then((session) => {
      const list = (session.questions || []).map((item) => ({
        ...item,
        id: item.questionId || item.id,
        type: item.type || 'single'
      }));
      if (!list.length) {
        wx.showToast({ title: '暂无题目', icon: 'none' });
        return;
      }
      this.setQuestionState(list, 0);
    });
  },

  setQuestionState(list, index) {
    const current = this.decorateQuestion(list[index], [], false);
    this.setData({
      chapter: { name: current.chapterTitle || current.categoryTitle || '章节练习' },
      questions: list,
      currentIndex: index,
      currentNo: index + 1,
      current,
      selected: [],
      submitted: false,
      showSubmit: true,
      isCorrect: false,
      favorited: false,
      typeLabel: getQuestionTypeLabel(current.type),
      correctAnswerText: normalizeAnswer(current.answer),
      selectedAnswerText: '',
      answerTitle: '',
      answerClass: '',
      favoriteText: '收藏',
      favoriteIcon: '/assets/icons/star.svg'
    });
  },

  decorateQuestion(question, selected, submitted) {
    const answers = normalizeAnswer(question.answer).split(',');
    return {
      ...question,
      options: question.options.map((option) => {
        const selectedOption = selected.includes(option.key);
        const isAnswer = answers.includes(option.key);
        return {
          ...option,
          selected: selectedOption,
          isAnswer,
          optionClass: [
            selectedOption ? 'selected' : '',
            submitted && isAnswer ? 'correct' : '',
            submitted && selectedOption && !isAnswer ? 'wrong' : ''
          ].join(' ')
        };
      })
    };
  },

  selectOption(event) {
    if (this.data.submitted) return;
    const key = event.currentTarget.dataset.key;
    const current = this.data.current;
    if (isMultipleType(current.type)) {
      const selected = this.data.selected.includes(key)
        ? this.data.selected.filter((item) => item !== key)
        : this.data.selected.concat(key);
      this.setData({ selected, current: this.decorateQuestion(current, selected, false) });
      return;
    }
    this.setData({ selected: [key], current: this.decorateQuestion(current, [key], false) });
  },

  submit() {
    if (!this.data.selected.length) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }
    const current = this.data.current;
    const answer = isMultipleType(current.type) ? this.data.selected : this.data.selected[0];
    const isCorrect = isCorrectAnswer(current, answer);
    this.setData({
      submitted: true,
      showSubmit: false,
      isCorrect,
      correctCount: this.data.correctCount + (isCorrect ? 1 : 0),
      selectedAnswerText: normalizeAnswer(answer),
      answerTitle: isCorrect ? '回答正确' : '回答错误',
      answerClass: isCorrect ? 'ok' : 'bad',
      current: this.decorateQuestion(current, this.data.selected, true)
    });
    saveAnswer({
      questionId: current.id,
      chapterId: current.chapterId,
      type: current.type,
      selected: this.data.selected,
      answer,
      isCorrect,
      useSeconds: 0,
      source: this.data.sourceOptions.source || 'practice'
    }).catch(() => wx.showToast({ title: '答题记录同步失败', icon: 'none' }));
  },

  next() {
    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      wx.navigateTo({
        url: `/pages/result/result?total=${this.data.questions.length}&correct=${this.data.correctCount}`
      });
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
    toggleFavorite({ targetType: 'question', targetId: current.id, title: current.stem, chapterId: current.chapterId })
      .then((res) => this.setData({
        favorited: res.favorited,
        favoriteText: res.favorited ? '已收藏' : '收藏',
        favoriteIcon: res.favorited ? '/assets/icons/star-filled.svg' : '/assets/icons/star.svg'
      }))
      .catch(() => wx.showToast({ title: '收藏同步失败', icon: 'none' }));
  },

  saveNote() {
    const current = this.data.current;
    wx.navigateTo({ url: `/pages/note-edit/note-edit?questionId=${current.id}&chapterId=${current.chapterId || ''}` });
  },

  showCard() {
    wx.navigateTo({ url: '/pages/answer-card/answer-card' });
  },

  normalize(answer) {
    return normalizeAnswer(answer);
  }
});
