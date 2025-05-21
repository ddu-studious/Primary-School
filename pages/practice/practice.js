// pages/practice/practice.js
const pinyinData = require('../../data/pinyin.js');
const audioManager = require('../../utils/audio.js');

// 新增：引入initialFinalMap
const initialFinalMap = {
  b: ['a','o','ai','ei','ao','ou','an','en','ang','eng','i','u'],
  p: ['a','o','ai','ei','ao','ou','an','en','ang','eng','i','u'],
  m: ['a','o','e','ai','ei','ao','ou','an','en','ang','eng','i','u'],
  f: ['a','o','e','an','en','ang','eng','u'],
  d: ['a','e','ai','ei','ao','ou','an','en','ang','eng','i','u'],
  t: ['a','e','ai','ao','ou','an','eng','ang','i','u'],
  n: ['a','e','ai','ei','ao','ou','an','en','ang','eng','i','u','ü'],
  l: ['a','e','ai','ei','ao','ou','an','en','ang','eng','i','u','ü'],
  g: ['a','e','ai','ei','ao','ou','an','en','ang','eng','u'],
  k: ['a','e','ai','ei','ao','ou','an','en','ang','eng','u'],
  h: ['a','e','ai','ei','ao','ou','an','en','ang','eng','u'],
  j: ['i','ia','ian','iang','ie','in','ing','iong','ü','üe','üan','ün'],
  q: ['i','ia','ian','iang','ie','in','ing','iong','ü','üe','üan','ün'],
  x: ['i','ia','ian','iang','ie','in','ing','iong','ü','üe','üan','ün'],
  zh: ['a','ai','an','ang','ao','e','en','eng','i','ong','u'],
  ch: ['a','ai','an','ang','ao','e','en','eng','i','ong','u'],
  sh: ['a','ai','an','ang','ao','e','en','eng','i','ou','u'],
  r: ['e','en','eng','i','ong','u','uan','ui','un','a','an','ang'],
  z: ['a','ai','an','ang','ao','e','ei','en','eng','i','ong','u'],
  c: ['a','ai','an','ang','ao','e','ei','en','eng','i','ong','u'],
  s: ['a','ai','an','ang','ao','e','en','eng','i','ong','u'],
  y: ['i','ia','ian','iang','ie','in','ing','iong','iu','u','uan','ue','un','ü','üan','üe','ün','a','an','ang','e','ou'],
  w: ['a','ai','an','ang','ei','en','eng','o','u'],
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPinyin: '',
    shengmu: '',
    yunmu: '',
    isPlaying: false,
    score: 0,
    showResult: false,
    result: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.generateNewPinyin();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    audioManager.destroy();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 生成新的拼音组合
  generateNewPinyin: function() {
    // 随机选择声母
    const initialsArr = pinyinData.initials;
    const randomInitialObj = initialsArr[Math.floor(Math.random() * initialsArr.length)];
    const initial = randomInitialObj.pinyin;
    // 根据声母获取可用韵母
    const finalsArr = initialFinalMap[initial];
    let final = finalsArr[Math.floor(Math.random() * finalsArr.length)];
    // 校验组合是否合法
    let combined = initial + final;
    // 若组合不在validPinyin中，重新生成
    let tryCount = 0;
    while (!pinyinData.validPinyin.includes(combined) && tryCount < 10) {
      final = finalsArr[Math.floor(Math.random() * finalsArr.length)];
      combined = initial + final;
      tryCount++;
    }
    this.setData({
      shengmu: initial,
      yunmu: final,
      currentPinyin: combined,
      showResult: false
    });
  },

  // 播放拼音
  playPinyin: function() {
    this.setData({ isPlaying: true });
    audioManager.playPinyin(this.data.currentPinyin);
    setTimeout(() => {
      this.setData({ isPlaying: false });
    }, 1000);
  },

  // 检查答案
  checkAnswer: function(e) {
    const answer = e.currentTarget.dataset.answer;
    const isCorrect = answer === this.data.currentPinyin;
    this.setData({
      showResult: true,
      result: isCorrect ? '正确！' : '再试试看',
      score: isCorrect ? this.data.score + 10 : this.data.score
    });
    // 播放音频，播放完再切题
    audioManager.playPinyin(answer, () => {
      if (isCorrect) {
        this.generateNewPinyin();
      }
    });
  }
})