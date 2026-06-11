Component({
  properties: {
    title: { type: String, value: '暂无数据' },
    desc: { type: String, value: '' },
    actionText: { type: String, value: '' },
    icon: { type: String, value: '/assets/icons/book.svg' }
  },
  methods: {
    onAction() {
      this.triggerEvent('action');
    }
  }
});
