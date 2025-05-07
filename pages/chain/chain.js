const chainData = [
  { word: '妈', pinyin: 'mā' },
  { word: '马', pinyin: 'mǎ' },
  { word: '花', pinyin: 'huā' },
  { word: '鱼', pinyin: 'yú' },
  { word: '书', pinyin: 'shū' },
  { word: '鸟', pinyin: 'niǎo' },
  { word: '羊', pinyin: 'yáng' },
  { word: '鹅', pinyin: 'é' },
  { word: '鹅', pinyin: 'é' },
  { word: '鹅', pinyin: 'é' }
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

Page({
  data: {
    current: {},
    userInput: '',
    score: 0,
    showResult: false,
    result: '',
    chainList: []
  },

  onLoad() {
    this.startChain();
  },

  startChain() {
    const first = getRandomItem(chainData);
    this.setData({
      current: first,
      userInput: '',
      showResult: false,
      chainList: [first]
    });
  },

  onInput(e) {
    this.setData({ userInput: e.detail.value });
  },

  submit() {
    const last = this.data.chainList[this.data.chainList.length - 1];
    const user = this.data.userInput.trim();
    // 判断用户输入的拼音首字母是否等于上一个拼音的末字母
    if (user && user[0] === last.pinyin[last.pinyin.length - 1]) {
      const next = chainData.find(item => item.pinyin === user);
      if (next) {
        this.setData({
          chainList: this.data.chainList.concat(next),
          current: next,
          userInput: '',
          score: this.data.score + 10,
          showResult: true,
          result: '接龙正确！'
        });
        return;
      }
    }
    this.setData({
      showResult: true,
      result: '接龙错误，请重新输入！'
    });
  }
}); 