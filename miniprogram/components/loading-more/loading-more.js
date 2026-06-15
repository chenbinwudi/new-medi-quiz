Component({
  properties: {
    status: {
      type: String,
      value: 'noMore',
      observer(value) {
        this.setStatusFlags(value);
      }
    },
    loadingText: { type: String, value: '正在加载更多' },
    noMoreText: { type: String, value: '没有更多了' },
    errorText: { type: String, value: '加载失败，点此重试' }
  },
  data: {
    isLoading: false,
    isError: false,
    displayText: '没有更多了'
  },
  lifetimes: {
    attached() {
      this.setStatusFlags(this.properties.status);
    }
  },
  methods: {
    setStatusFlags(status) {
      const isLoading = status === 'loading';
      const isError = status === 'error';
      this.setData({
        isLoading,
        isError,
        displayText: isLoading ? this.properties.loadingText : (isError ? this.properties.errorText : this.properties.noMoreText)
      });
    },
    onRetry() {
      if (this.properties.status === 'error') this.triggerEvent('retry');
    }
  }
});
