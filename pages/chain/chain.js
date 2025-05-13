const { validPinyin } = require('../../data/pinyin');

Page({
  data: {
    chainList: [], // 已接龙拼音
    current: '',   // 当前拼音
    inputValue: '',
    score: 0,
    showResult: false,
    result: '',
    gameOver: false
  },

  onLoad() {
    this.startGame();
  },

  startGame() {
    // 随机选一个合法拼音作为起点
    const start = validPinyin[Math.floor(Math.random() * validPinyin.length)];
    this.setData({
      chainList: [start],
      current: start,
      inputValue: '',
      score: 0,
      showResult: false,
      result: '',
      gameOver: false
    });
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  submit() {
    const { inputValue, current, chainList, score } = this.data;
    if (!inputValue) return;
    // 校验拼音合法性和接龙规则：首字母等于上一个拼音最后一个字母
    if (
      validPinyin.includes(inputValue) &&
      inputValue[0] === current[current.length - 1] &&
      !chainList.includes(inputValue)
    ) {
      this.setData({
        chainList: chainList.concat(inputValue),
        current: inputValue,
        inputValue: '',
        score: score + 10,
        showResult: true,
        result: '接龙成功！'
      });
    } else {
      this.setData({
        showResult: true,
        result: '接龙失败，游戏结束！',
        gameOver: true
      });
    }
  },

  nextGame() {
    this.startGame();
  }
}); 