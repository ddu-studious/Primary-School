// pages/game/guess-word.js
const wordBank = require('../../data/guess_word_bank.js');
const audioUtil = require('../../utils/audio.js');

Page({
  data: {
    currentIndex: 0, // 当前题目索引
    usedIndexes: [], // 已抽取题目索引，避免重复
    score: 0, // 当前得分
    total: 10, // 总题数
    userInput: '', // 用户输入
    showMask: true, // 遮罩是否显示
    showResult: false, // 是否显示结果
    isCorrect: false, // 答案是否正确
    currentWord: {}, // 当前题目对象
    round: 1, // 当前轮次
    inputFocus: true // 输入框聚焦状态
  },

  onLoad() {
    this.initQuiz();
  },

  // 初始化题目
  initQuiz() {
    const used = [];
    for (let i = 0; i < this.data.total; i++) {
      let idx;
      do {
        idx = Math.floor(Math.random() * wordBank.length);
      } while (used.includes(idx));
      used.push(idx);
    }
    this.setData({
      usedIndexes: used,
      currentIndex: 0,
      score: 0,
      round: 1,
      showResult: false,
      showMask: true,
      userInput: '',
      currentWord: wordBank[used[0]],
      inputFocus: false
    });
  },

  // 播放拼音和组词音频
  playAudio() {
    const { currentWord } = this.data;
    console.log(currentWord);
    // 先播放拼音音频，播放完后随机播放一个组词音频
    audioUtil.playPinyin(currentWord.word, () => {
      audioUtil.playPinyin(currentWord.words, null, { url: 'http://localhost:5000/stream_chinese_audio', type: 'chinese' });
    }, { url: 'http://localhost:5000/stream_chinese_audio', type: 'chinese' });
  },

  // 输入框输入
  onInput(e) {
    this.setData({ userInput: e.detail.value });
  },

  // 擦除遮罩，显示答案
  onErase() {
    this.setData({ showMask: false, showResult: true, inputFocus: true });
    this.checkAnswer();
  },

  // 判定对错
  checkAnswer() {
    const { userInput, currentWord, score } = this.data;
    const isCorrect = userInput.trim() === currentWord.word;
    this.setData({
      isCorrect,
      score: isCorrect ? score + 1 : score
    });
  },

  // 下一题
  nextQuiz() {
    const { currentIndex, usedIndexes, total } = this.data;
    if (currentIndex + 1 >= total) {
      wx.showToast({ title: `答题结束，总分：${this.data.score}/${total}`, icon: 'none' });
      this.initQuiz();
      return;
    }
    const nextIndex = currentIndex + 1;
    this.setData({
      currentIndex: nextIndex,
      currentWord: wordBank[usedIndexes[nextIndex]],
      userInput: '',
      showMask: true,
      showResult: false,
      isCorrect: false,
      round: nextIndex + 1,
      inputFocus: false
    });
  }
}); 