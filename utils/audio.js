// 音频管理工具类
let audio = null;

function playPinyin(pinyin) {
  if (!audio) {
    audio = wx.createInnerAudioContext();
  }
  audio.src = `/assets/audio/pinyin/${pinyin}.mp3`;
  audio.play();
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