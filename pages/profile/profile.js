Page({
  data: {
    totalScore: 0,
    practiceCount: 0,
    wrongList: []
  },

  onLoad() {
    // 这里可从本地存储或云端获取数据，演示用静态数据
    this.setData({
      totalScore: wx.getStorageSync('totalScore') || 0,
      practiceCount: wx.getStorageSync('practiceCount') || 0,
      wrongList: wx.getStorageSync('wrongList') || []
    });
  },

  clearWrongList() {
    wx.removeStorageSync('wrongList');
    this.setData({ wrongList: [] });
  }
}); 