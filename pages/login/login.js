Page({
  data: {
    userInfo: null,
    hasUserInfo: false
  },
  onLoad() {
    let userInfo = wx.getStorageSync('userInfo');
    if (typeof userInfo === 'string') {
      try {
        userInfo = JSON.parse(userInfo);
      } catch (e) {
        userInfo = null;
      }
    }
    if (userInfo && userInfo.avatarUrl && userInfo.nickName) {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },
  // 微信授权登录
  onGetUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: res => {
        const userInfo = res.userInfo;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ userInfo, hasUserInfo: true });
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          wx.reLaunch({ url: '/pages/index/index' });
        }, 500);
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    });
  }
}); 