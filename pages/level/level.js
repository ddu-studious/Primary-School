const { validPinyin } = require('../../data/pinyin');

function getRandomPinyin() {
  return validPinyin[Math.floor(Math.random() * validPinyin.length)];
}

Page({
  data: {
    level: 1,
    totalLevels: 5,
    questions: [],
    currentIndex: 0,
    currentQuestion: '',
    options: [],
    score: 0,
    showResult: false,
    result: '',
    passed: false,
    failed: false
  },

  onLoad() {
    this.startLevel(1);
  },

  startLevel(level) {
    const questions = [];
    for (let i = 0; i < 5 + level; i++) {
      questions.push(getRandomPinyin());
    }
    this.setData({
      level,
      questions,
      currentIndex: 0,
      currentQuestion: questions[0],
      options: this.generateOptions(questions[0]),
      score: 0,
      showResult: false,
      result: '',
      passed: false,
      failed: false
    });
  },

  generateOptions(answer) {
    const options = [answer];
    while (options.length < 4) {
      const opt = getRandomPinyin();
      if (!options.includes(opt)) options.push(opt);
    }
    return options.sort(() => Math.random() - 0.5);
  },

  choose(e) {
    if (this.data.showResult) return;
    const selected = e.currentTarget.dataset.pinyin;
    const isCorrect = selected === this.data.currentQuestion;
    let { score, currentIndex, questions } = this.data;
    this.setData({
      showResult: true,
      result: isCorrect ? '回答正确！' : '回答错误，正确答案：' + this.data.currentQuestion,
      score: isCorrect ? score + 10 : score
    });
    setTimeout(() => {
      if (!isCorrect) {
        this.setData({ failed: true });
        return;
      }
      if (currentIndex + 1 >= questions.length) {
        this.setData({ passed: true });
        return;
      }
      this.setData({
        currentIndex: currentIndex + 1,
        currentQuestion: questions[currentIndex + 1],
        options: this.generateOptions(questions[currentIndex + 1]),
        showResult: false,
        result: ''
      });
    }, 1000);
  },

  nextLevel() {
    if (this.data.level < this.data.totalLevels) {
      this.startLevel(this.data.level + 1);
    }
  },

  retry() {
    this.startLevel(this.data.level);
  }
}); 