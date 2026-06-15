Component({
  properties: {
    type: {
      type: String,
      value: 'list',
      observer(value) {
        this.setTypeFlags(value);
      }
    },
    rows: { type: Number, value: 3 }
  },
  data: {
    showHome: false,
    showBank: false,
    showPractice: false,
    showProfile: false,
    showMember: false,
    showReport: false,
    showList: true,
    listRows: [1, 2, 3, 4],
    shortListRows: [1, 2],
    optionRows: [1, 2, 3, 4],
    gridRows: [1, 2, 3, 4, 5, 6, 7, 8],
    compactGridRows: [1, 2, 3, 4, 5],
    benefitRows: [1, 2, 3, 4],
    packageRows: [1, 2, 3],
    menuRows: [1, 2, 3, 4, 5, 6]
  },
  lifetimes: {
    attached() {
      this.setTypeFlags(this.properties.type);
    }
  },
  methods: {
    setTypeFlags(type) {
      this.setData({
        showHome: type === 'home',
        showBank: type === 'bank',
        showPractice: type === 'practice',
        showProfile: type === 'profile',
        showMember: type === 'member',
        showReport: type === 'report',
        showList: ['home', 'bank', 'practice', 'profile', 'member', 'report'].indexOf(type) === -1
      });
    }
  }
});
