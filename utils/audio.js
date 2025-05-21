// 音频管理工具类
const pinyinData = require('../data/pinyin.js');
let audio = null;

function playPinyin(pinyin, onEnded) {
  // 使用公共方法转换拼音
  const audioPinyin = pinyinData.getAudioPinyin(pinyin);
  if (!audio) {
    audio = wx.createInnerAudioContext();
  }
  // 解绑旧的onEnded，防止多次触发
  if (audio.offEnded) audio.offEnded();
  if (typeof onEnded === 'function') {
    audio.onEnded(onEnded);
  }
  // 先请求接口获取音频流
  wx.request({
    url: 'http://127.0.0.1:5000/stream_audio',
    method: 'POST',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      pinyin: audioPinyin,
      tts: 'edgetts'
    },
    responseType: 'arraybuffer',
    success: function(res) {
      if (res.statusCode === 200 && res.data) {
        // arraybuffer转临时文件
        const fs = wx.getFileSystemManager();
        const filePath = `${wx.env.USER_DATA_PATH}/${audioPinyin}_${Date.now()}.mp3`;
        fs.writeFile({
          filePath,
          data: res.data,
          encoding: 'binary',
          success: () => {
            audio.src = filePath;
            audio.play();
          },
          fail: () => {
            audio.src = `/assets/audio/pinyin/${audioPinyin}.mp3`;
            audio.play();
          }
        });
      } else {
        audio.src = `/assets/audio/pinyin/${audioPinyin}.mp3`;
        audio.play();
      }
    },
    fail: function() {
      audio.src = `/assets/audio/pinyin/${audioPinyin}.mp3`;
      audio.play();
    }
  });
}

function destroy() {
  if (audio) {
    if (typeof audio.destroy === 'function') {
      audio.destroy();
    } else if (typeof audio.stop === 'function') {
      audio.stop();
    }
    audio = null;
  }
}

module.exports = {
  playPinyin,
  destroy
}; 