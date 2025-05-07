const llkData = [
  { word: '妈', pinyin: 'mā' },
  { word: '爸', pinyin: 'bà' },
  { word: '马', pinyin: 'mǎ' },
  { word: '花', pinyin: 'huā' },
  { word: '鱼', pinyin: 'yú' },
  { word: '书', pinyin: 'shū' },
  { word: '鸟', pinyin: 'niǎo' },
  { word: '羊', pinyin: 'yáng' }
];

const { validPinyin } = require('../../data/pinyin');

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

Page({
  data: {
    wordList: [],
    pinyinList: [],
    selectedWord: null,
    selectedPinyin: null,
    matched: [],
    score: 0,
    showResult: false,
    result: ''
  },

  onLoad() {
    this.initGame();
  },

  initGame() {
    // 只保留合法拼音题目
    const validData = llkData.filter(item => validPinyin.includes(item.pinyin.replace(/\d/g, '')));
    const words = shuffle(validData.slice());
    const pinyins = shuffle(validData.map(item => item.pinyin));
    this.setData({
      wordList: words,
      pinyinList: pinyins,
      matched: [],
      selectedWord: null,
      selectedPinyin: null,
      showResult: false
    });
  },

  selectWord(e) {
    this.setData({ selectedWord: e.currentTarget.dataset.word });
    this.checkMatch();
  },

  selectPinyin(e) {
    this.setData({ selectedPinyin: e.currentTarget.dataset.pinyin });
    this.checkMatch();
  },

  checkMatch() {
    const { selectedWord, selectedPinyin, matched, wordList } = this.data;
    if (selectedWord && selectedPinyin) {
      const correct = wordList.find(item => item.word === selectedWord && item.pinyin === selectedPinyin);
      if (correct && !matched.includes(selectedWord)) {
        this.setData({
          matched: matched.concat(selectedWord),
          score: this.data.score + 10,
          result: '匹配正确！',
          showResult: true
        });
      } else if (!matched.includes(selectedWord)) {
        this.setData({
          result: '匹配错误',
          showResult: true
        });
      }
      setTimeout(() => {
        this.setData({
          selectedWord: null,
          selectedPinyin: null,
          showResult: false
        });
        // 游戏结束自动重开
        if (this.data.matched.length === this.data.wordList.length) {
          setTimeout(() => this.initGame(), 1000);
        }
      }, 1000);
    }
  }
}); 