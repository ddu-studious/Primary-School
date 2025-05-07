const audioManager = require('../../utils/audio.js');
const listenData = [
  { word: '妈', pinyin: 'mā' },
  { word: '爸', pinyin: 'bà' },
  { word: '马', pinyin: 'mǎ' },
  { word: '花', pinyin: 'huā' },
  { word: '鱼', pinyin: 'yú' },
  { word: '书', pinyin: 'shū' },
  { word: '鸟', pinyin: 'niǎo' },
  { word: '羊', pinyin: 'yáng' }
];

function getRandomOptions(correct, all, count = 4) {
  const options = [correct.word];
  const pool = all.filter(item => item.word !== correct.word);
  while (options.length < count && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    options.push(pool[idx].word);
    pool.splice(idx, 1);
  }
  return shuffle(options);
}
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

Page({
  data: {
    current: {},
    options: [],
    score: 0,
    showResult: false,
    result: ''
  },

  onLoad() {
    this.generateQuestion();
  },

  onUnload() {
    audioManager.destroy();
  },

  generateQuestion() {
    const correct = listenData[Math.floor(Math.random() * listenData.length)];
    const options = getRandomOptions(correct, listenData);
    this.setData({
      current: correct,
      options,
      showResult: false
    });
    this.playAudio();
  },

  playAudio() {
    audioManager.playPinyin(this.data.current.pinyin);
  },

  choose(e) {
    const answer = e.currentTarget.dataset.word;
    const isRight = answer === this.data.current.word;
    this.setData({
      showResult: true,
      result: isRight ? '回答正确！' : `正确答案：${this.data.current.word}`,
      score: isRight ? this.data.score + 10 : this.data.score
    });
    if (isRight) {
      setTimeout(() => {
        this.generateQuestion();
      }, 1500);
    }
  }
}); 