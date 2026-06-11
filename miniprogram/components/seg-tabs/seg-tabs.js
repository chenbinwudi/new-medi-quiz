Component({
  properties: {
    tabs: { type: Array, value: [] },
    active: { type: String, value: '' }
  },
  observers: {
    'tabs, active': function tabsChanged(tabs, active) {
      this.setData({
        renderTabs: (tabs || []).map((tab) => ({
          ...tab,
          active: tab.value === active,
          activeClass: tab.value === active ? 'active' : ''
        }))
      });
    }
  },
  data: {
    renderTabs: []
  },
  methods: {
    onTap(event) {
      const value = event.currentTarget.dataset.value;
      this.triggerEvent('change', { value });
    }
  }
});
