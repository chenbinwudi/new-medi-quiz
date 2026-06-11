Component({
  properties: {
    tabs: { type: Array, value: [] },
    active: { type: String, value: '' }
  },
  methods: {
    onTap(event) {
      const value = event.currentTarget.dataset.value;
      this.triggerEvent('change', { value });
    }
  }
});
