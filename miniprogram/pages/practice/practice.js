const { isCorrectAnswer, getQuestionTypeLabel, normalizeAnswer, isMultipleType } = require('../../utils/question');
const { saveAnswer, toggleFavorite, getPracticeSession } = require('../../services/study');

function getQuestionKey(question = {}) {
  return question.id || question.questionId || '';
}

function defaultAnswerState() {
  return {
    selected: [],
    submitted: false,
    showSubmit: true,
    isCorrect: false,
    selectedAnswerText: '',
    answerTitle: '',
    answerClass: '',
    favorited: false,
    favoriteText: '收藏',
    favoriteDisplayText: '收藏',
    favoriteIcon: '/assets/icons/star.svg'
  };
}

function getPracticeAnswerState(history = {}, question = {}) {
  const key = getQuestionKey(question);
  const saved = key ? history[key] : null;
  return {
    ...defaultAnswerState(),
    ...(saved || {})
  };
}

function savePracticeAnswerState(history = {}, question = {}, patch = {}) {
  const key = getQuestionKey(question);
  if (!key) return history;
  const nextState = {
    ...getPracticeAnswerState(history, question),
    ...patch
  };
  nextState.selected = Array.isArray(nextState.selected) ? nextState.selected : [];
  nextState.showSubmit = !nextState.submitted;
  return {
    ...history,
    [key]: nextState
  };
}

function calculateCorrectCount(history = {}) {
  return Object.keys(history).reduce((count, key) => {
    const item = history[key];
    return count + (item && item.submitted && item.isCorrect ? 1 : 0);
  }, 0);
}

Page({
  data: {
    chapter: null,
    questions: [],
    answerHistory: {},
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
    sourceOptions: {},
    loading: true,
    error: false,
    emptyVisible: false,
    submitting: false,
    favoriteLoading: false,
    nextText: '下一题',
    submitText: '提交答案',
    favoriteDisplayText: '收藏',
    prevDisabled: true
  },

  onLoad(options) {
    this.setData({ sourceOptions: options });
    this.loadSession();
  },

  loadSession() {
    this.setData({ loading: true, error: false, emptyVisible: false, answerHistory: {}, correctCount: 0 });
    getPracticeSession(this.data.sourceOptions).then((session) => {
      const list = (session.questions || []).map((item) => ({
        ...item,
        id: item.questionId || item.id,
        type: item.type || 'single'
      }));
      if (!list.length) {
        this.setData({ loading: false, emptyVisible: true, questions: [], current: null });
        return;
      }
      this.setData({ loading: false, error: false, emptyVisible: false });
      this.setQuestionState(list, 0);
    }).catch(() => {
      this.setData({ loading: false, error: true, emptyVisible: false });
    });
  },

  reload() {
    this.loadSession();
  },

  setQuestionState(list, index) {
    const rawQuestion = list[index];
    const saved = getPracticeAnswerState(this.data.answerHistory, rawQuestion);
    const current = this.decorateQuestion(rawQuestion, saved.selected, saved.submitted);
    this.setData({
      chapter: { name: current.chapterTitle || current.categoryTitle || '章节练习' },
      questions: list,
      currentIndex: index,
      currentNo: index + 1,
      current,
      selected: saved.selected,
      submitted: saved.submitted,
      showSubmit: saved.showSubmit,
      isCorrect: saved.isCorrect,
      favorited: saved.favorited,
      typeLabel: getQuestionTypeLabel(current.type),
      correctAnswerText: normalizeAnswer(current.answer),
      selectedAnswerText: saved.selectedAnswerText,
      answerTitle: saved.answerTitle,
      answerClass: saved.answerClass,
      favoriteText: saved.favoriteText,
      favoriteDisplayText: saved.favoriteDisplayText,
      favoriteIcon: saved.favoriteIcon,
      submitting: false,
      favoriteLoading: false,
      nextText: index >= list.length - 1 ? '完成' : '下一题',
      submitText: '提交答案',
      prevDisabled: index === 0
    });
  },

  saveCurrentHistory(patch) {
    const current = this.data.current;
    if (!current) return;
    const answerHistory = savePracticeAnswerState(this.data.answerHistory, current, patch);
    this.setData({
      answerHistory,
      correctCount: calculateCorrectCount(answerHistory)
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
    if (this.data.submitted || this.data.submitting) return;
    const key = event.currentTarget.dataset.key;
    const current = this.data.current;
    const selected = isMultipleType(current.type)
      ? (this.data.selected.includes(key)
        ? this.data.selected.filter((item) => item !== key)
        : this.data.selected.concat(key))
      : [key];
    const decorated = this.decorateQuestion(current, selected, false);
    this.setData({ selected, current: decorated });
    this.saveCurrentHistory({ selected, submitted: false });
  },

  submit() {
    if (this.data.submitting) return;
    if (!this.data.selected.length) {
      wx.showToast({ title: '请先选择答案', icon: 'none' });
      return;
    }
    const current = this.data.current;
    const answer = isMultipleType(current.type) ? this.data.selected : this.data.selected[0];
    const isCorrect = isCorrectAnswer(current, answer);
    const selectedAnswerText = normalizeAnswer(answer);
    const answerTitle = isCorrect ? '回答正确' : '回答错误';
    const answerClass = isCorrect ? 'ok' : 'bad';
    const decorated = this.decorateQuestion(current, this.data.selected, true);
    this.saveCurrentHistory({
      selected: this.data.selected,
      submitted: true,
      isCorrect,
      selectedAnswerText,
      answerTitle,
      answerClass
    });
    this.setData({
      submitting: true,
      submitText: '提交中',
      submitted: true,
      showSubmit: false,
      isCorrect,
      selectedAnswerText,
      answerTitle,
      answerClass,
      current: decorated
    });
    saveAnswer({
      questionId: current.id,
      chapterId: current.chapterId,
      categoryId: current.categoryId,
      primaryId: current.primaryId,
      subjectId: current.subjectId,
      type: current.type,
      selected: this.data.selected,
      answer,
      isCorrect,
      useSeconds: 0,
      source: this.data.sourceOptions.source || 'practice'
    })
      .catch(() => wx.showToast({ title: '答题记录同步失败', icon: 'none' }))
      .then(() => this.setData({ submitting: false, submitText: '提交答案' }));
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
    if (this.data.currentIndex === 0) return;
    const prevIndex = Math.max(0, this.data.currentIndex - 1);
    this.setQuestionState(this.data.questions, prevIndex);
  },

  toggleFavorite() {
    if (this.data.favoriteLoading || !this.data.current) return;
    const current = this.data.current;
    this.setData({ favoriteLoading: true, favoriteDisplayText: '同步中' });
    toggleFavorite({ targetType: 'question', targetId: current.id, title: current.stem, chapterId: current.chapterId })
      .then((res) => {
        const favoriteText = res.favorited ? '已收藏' : '收藏';
        const favoriteIcon = res.favorited ? '/assets/icons/star-filled.svg' : '/assets/icons/star.svg';
        this.saveCurrentHistory({
          favorited: res.favorited,
          favoriteText,
          favoriteDisplayText: favoriteText,
          favoriteIcon
        });
        this.setData({
          favorited: res.favorited,
          favoriteText,
          favoriteDisplayText: favoriteText,
          favoriteIcon
        });
      })
      .catch(() => wx.showToast({ title: '收藏同步失败', icon: 'none' }))
      .then(() => this.setData({ favoriteLoading: false, favoriteDisplayText: this.data.favoriteText }));
  },

  saveNote() {
    const current = this.data.current;
    if (!current) return;
    wx.navigateTo({ url: `/pages/note-edit/note-edit?questionId=${current.id}&chapterId=${current.chapterId || ''}` });
  },

  showCard() {
    wx.navigateTo({ url: '/pages/answer-card/answer-card' });
  },

  goBank() {
    wx.switchTab({ url: '/pages/bank/bank' });
  },

  normalize(answer) {
    return normalizeAnswer(answer);
  }
});
