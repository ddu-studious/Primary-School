// pages/practice/practice.js
const pinyinData = require('../../data/pinyin.js');
const audioManager = require('../../utils/audio.js');

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
    const randomInitial = pinyinData.initials[Math.floor(Math.random() * pinyinData.initials.length)];
    const randomFinal = pinyinData.finals[Math.floor(Math.random() * pinyinData.finals.length)];
    
    this.setData({
      shengmu: randomInitial.pinyin,
      yunmu: randomFinal.pinyin,
      currentPinyin: randomInitial.pinyin + randomFinal.pinyin,
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

    if (isCorrect) {
      setTimeout(() => {
        this.generateNewPinyin();
      }, 1500);
    }
  }
})