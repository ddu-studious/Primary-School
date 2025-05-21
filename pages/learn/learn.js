const pinyinData = require('../../data/pinyin.js');
const audioManager = require('../../utils/audio.js');

Page({
  data: {
    currentTab: 0,
    initials: pinyinData.initials,
    finals: pinyinData.finals,
    wholePinyin: pinyinData.wholePinyin,
    playing: { tab: -1, index: -1 }
  },

  onUnload: function() {
    // 页面卸载时停止播放并销毁音频实例
    audioManager.destroy();
  },

  switchTab: function(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({
      currentTab: index,
      playing: { tab: -1, index: -1 }
    });
  },

  playSound: function(e) {
    const pinyin = e.currentTarget.dataset.pinyin;
    const idx = Number(e.currentTarget.dataset.index);
    const tab = this.data.currentTab;
    this.setData({
      playing: { tab, index: idx }
    });
    audioManager.playPinyin(pinyinData.getAudioPinyin(pinyin));
    setTimeout(() => {
      this.setData({
        playing: { tab: -1, index: -1 }
      });
    }, 1000);
  }
}); 