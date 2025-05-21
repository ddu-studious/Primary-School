// pages/game/game.js
// 拼音数据（简化版，可扩展）
const pinyinData = require('../../data/pinyin.js');
const pinyinList = [
  'a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er',
  'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong',
  'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'
];

// 合法拼音池（声母、韵母、整体认读音节）
const validPinyin = [
  // 声母
  'b','p','m','f','d','t','n','l','g','k','h','j','q','x','zh','ch','sh','r','z','c','s','y','w',
  // 单韵母
  'a','o','e','i','u','ü',
  // 复韵母
  'ai','ei','ui','ao','ou','iu','ie','üe','er',
  // 鼻韵母
  'an','en','in','un','ün','ang','eng','ing','ong',
  // 整体认读音节
  'zhi','chi','shi','ri','zi','ci','si','yi','wu','yu','ye','yue','yuan','yin','yun','ying'
];

// 拼音池分组
const simplePinyin = ['a', 'o', 'e', 'i', 'u', 'ü', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l'];
const normalPinyin = ['ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'zh', 'ch', 'sh', 'z', 'c', 's', 'y', 'w', 'g', 'k', 'h', 'j', 'q', 'x', 'r'];
const hardPinyin = ['ang', 'eng', 'ing', 'ong', 'ian', 'uan', 'uang', 'iang', 'iong', 'uai', 'uei', 'uen', 'iao', 'ia', 'ua', 'uo', 'üe', 'iong'];
const similarPairs = [
  ['ang', 'eng'], ['an', 'en'], ['zh', 'z'], ['ch', 'c'], ['sh', 's'], ['ian', 'uan'], ['ing', 'eng'], ['uai', 'uei'], ['ie', 'üe'], ['in', 'un'], ['iong', 'uang'], ['ua', 'uo'], ['ai', 'ei'], ['ou', 'ao']
];

// 难度-矩阵映射
const levelMatrix = [
  {rows:2, cols:2}, // 1级
  {rows:3, cols:2}, // 2级
  {rows:3, cols:3}, // 3级
  {rows:4, cols:3}, // 4级
  {rows:4, cols:4}, // 5级
  {rows:5, cols:4}, // 6级
  {rows:5, cols:5}, // 7级
  {rows:6, cols:5}, // 8级
  {rows:6, cols:6}  // 9级
];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    score: 0,
    gameType: '消消乐', // 当前小游戏类型
    gameTypes: ['消消乐', '找不同'],
    // 消消乐数据
    grid: [],
    // 找不同数据
    options: [],
    diffIndex: 0,
    diffPinyin: '',
    showResult: false,
    result: '',
    // 通用
    playing: false,
    difficulty: '普通',
    difficulties: ['简单', '普通', '困难'],
    level: 3, // 默认3级
    maxLevel: 9,
    screenWidth: 375,
    screenHeight: 667,
    cellWidth: 80,
    cellHeight: 60,
    cellFontSize: 24,
    difficultyLabel: '普通',
    showHelpModal: false,
    difficultyList: [
      { label: '简单', min: 1, max: 3 },
      { label: '普通', min: 4, max: 6 },
      { label: '困难', min: 7, max: 9 }
    ],
    gridActiveIndex: -1,
    gridShakeIndex: -1,
    optionActiveIndex: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          screenWidth: res.windowWidth,
          screenHeight: res.windowHeight
        }, () => {
          that.updateMatrixStyle();
          that.initGame();
        });
      }
    });
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

  // 切换小游戏
  switchGame(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({
      gameType: this.data.gameTypes[idx],
      showResult: false,
      result: '',
      score: 0
    }, this.initGame);
  },

  // 初始化当前小游戏
  initGame() {
    if (this.data.gameType === '消消乐') {
      this.initXiaoXiaoLe();
    } else if (this.data.gameType === '找不同') {
      this.initFindDiff();
    }
  },

  // 拼音消消乐：生成4x4拼音格子，随机2~3种合法拼音
  initXiaoXiaoLe() {
    const kinds = Math.floor(Math.random() * 2) + 2;
    const selected = [];
    while (selected.length < kinds) {
      const p = validPinyin[Math.floor(Math.random() * validPinyin.length)];
      if (!selected.includes(p)) selected.push(p);
    }
    const grid = Array.from({ length: 16 }, () => selected[Math.floor(Math.random() * selected.length)]);
    // 统一格子宽高和字号为普通3/3标准
    // 以普通3/3级别（level=5）为基准
    const baseLv = 4; // levelMatrix索引，普通3/3
    const {rows: baseRows, cols: baseCols} = levelMatrix[baseLv];
    const usableHeight = this.data.screenHeight - 160;
    const usableWidth = this.data.screenWidth - 20;
    let maxLen = Math.max(...grid.map(p => (p ? p.length : 2)));
    let minCellW = Math.ceil(maxLen * 0.6 * 32);
    if (minCellW < 48) minCellW = 48;
    let maxCellW = Math.floor(usableWidth / baseCols) - 8;
    let cellW = Math.max(minCellW, Math.min(maxCellW, 180));
    let totalGridW = cellW * baseCols + (baseCols - 1) * 10;
    if (totalGridW < usableWidth) {
      cellW = Math.floor((usableWidth - (baseCols - 1) * 10) / baseCols);
    }
    let cellH = Math.floor(usableHeight / baseRows) - 8;
    if (cellH < 40) cellH = 40;
    if (cellH > 160) cellH = 160;
    let fontSize = Math.floor(Math.min(cellW / maxLen, cellH) * 0.85);
    if (fontSize < 16) fontSize = 16;
    if (fontSize > 56) fontSize = 56;
    this.setData({ grid, cellWidth: cellW, cellHeight: cellH, cellFontSize: fontSize });
  },

  // 点击消除（拼音消消乐）
  tapGrid(e) {
    if (this.data.showResult) return;
    const idx = e.currentTarget.dataset.index;
    const val = this.data.grid[idx];
    // 通过setData控制动画class
    this.setData({ gridActiveIndex: idx });
    setTimeout(() => {
      this.setData({ gridActiveIndex: -1 });
    }, 250);
    // 播放拼音音频
    this.playPinyinAudio(val);
    // 找出所有相同拼音
    const indices = this.data.grid.map((v, i) => v === val ? i : -1).filter(i => i !== -1);
    if (indices.length < 2) {
      // 抖动动画
      this.setData({ gridShakeIndex: idx });
      setTimeout(() => {
        this.setData({ gridShakeIndex: -1 });
      }, 350);
      this.setData({ showResult: true, result: '至少点两个相同拼音才能消除！' });
      return;
    }
    // 消除并加分
    const newGrid = this.data.grid.slice();
    indices.forEach(i => newGrid[i] = '');
    this.setData({
      grid: newGrid,
      score: this.data.score + indices.length * 5,
      showResult: true,
      result: `消除${indices.length}个"${val}"，得分+${indices.length * 5}`
    });
  },

  // 下一题/重置消消乐
  nextXiaoXiaoLe() {
    this.setData({ showResult: false, result: '' });
    this.initXiaoXiaoLe();
  },

  // 难度选择按钮切换（循环区间等级）
  switchDifficultyBtn(e) {
    const idx = e.currentTarget.dataset.index;
    const { min, max } = this.data.difficultyList[idx];
    let cur = this.data.level;
    if (cur < min || cur > max) {
      cur = min;
    } else {
      cur = cur + 1;
      if (cur > max) cur = min;
    }
    this.setData({
      level: cur,
      showResult: false,
      result: '',
      score: 0
    }, () => {
      this.updateMatrixStyle();
      this.initGame();
    });
  },

  // 难度切换
  switchDifficulty(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({
      difficulty: this.data.difficulties[idx],
      showResult: false,
      result: '',
      score: 0
    }, this.initGame);
  },

  // 等级切换
  switchLevel(e) {
    const lv = e.currentTarget.dataset.level;
    this.setData({
      level: lv,
      showResult: false,
      result: '',
      score: 0
    }, () => {
      this.updateMatrixStyle();
      this.initGame();
    });
  },

  // 拼音找不同：根据等级生成题目和矩阵（仅用合法拼音池）
  initFindDiff() {
    const lv = this.data.level - 1;
    const {rows, cols} = levelMatrix[lv];
    let base = '', diff = '', arr = [], diffIndex = 0, total = rows * cols;
    // 选用合法拼音池
    let pool = validPinyin;
    // 选用相似对
    if (lv >= 2) {
      const pair = similarPairs[Math.floor(Math.random() * similarPairs.length)];
      // 只用合法拼音对
      if (validPinyin.includes(pair[0]) && validPinyin.includes(pair[1])) {
        base = pair[0];
        diff = pair[1];
      } else {
        base = pool[Math.floor(Math.random() * pool.length)];
        do {
          diff = pool[Math.floor(Math.random() * pool.length)];
        } while (diff === base);
      }
    } else {
      base = pool[Math.floor(Math.random() * pool.length)];
      do {
        diff = pool[Math.floor(Math.random() * pool.length)];
      } while (diff === base);
    }
    arr = Array(total-1).fill(base);
    diffIndex = Math.floor(Math.random() * total);
    arr.splice(diffIndex, 0, diff);
    // 难度标签
    let label = '普通';
    if (this.data.level <= 3) label = '简单';
    else if (this.data.level <= 6) label = '普通';
    else label = '困难';
    this.setData({ options: arr, diffIndex, diffPinyin: diff, matrixRows: rows, matrixCols: cols, difficultyLabel: label });
  },

  // 找不同点击
  chooseDiff(e) {
    if (this.data.showResult) return;
    const idx = e.currentTarget.dataset.index;
    // 点击动画
    this.setData({ optionActiveIndex: idx });
    setTimeout(() => {
      this.setData({ optionActiveIndex: -1 });
    }, 200);
    const val = this.data.options[idx];
    // 播放拼音音频
    this.playPinyinAudio(val);
    if (idx === this.data.diffIndex) {
      this.setData({
        showResult: true,
        result: '答对了！得分+10',
        score: this.data.score + 10
      });
    } else {
      this.setData({
        showResult: true,
        result: `答错了，正确答案是第${this.data.diffIndex + 1}个"${this.data.diffPinyin}"`
      });
    }
  },

  // 下一题/重置找不同
  nextFindDiff() {
    this.setData({ showResult: false, result: '' });
    this.initFindDiff();
  },

  choose(e) {
    if (this.data.showResult) return;
    const selected = e.currentTarget.dataset.pinyin;
    const isCorrect = selected === this.data.currentPinyin;
    this.setData({
      selectedOption: selected,
      showResult: true,
      result: isCorrect ? '回答正确！' : '回答错误，正确答案：' + this.data.currentPinyin,
      score: isCorrect ? this.data.score + 10 : this.data.score
    });
    // 播放音效
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = isCorrect ? '/assets/audio/correct.mp3' : '/assets/audio/wrong.mp3';
    audioContext.play();
  },

  playPinyin() {
    if (!this.data.currentPinyin) return;
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = `/assets/audio/pinyin/${this.data.currentPinyin}.mp3`;
    audioContext.play();
  },

  // 播放拼音音频
  playPinyinAudio(pinyin) {
    if (!pinyin) return;
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = `/assets/audio/pinyin/${pinyinData.getAudioPinyin(pinyin)}.mp3`;
    audioContext.play();
  },

  // 动态计算格子宽高（字号固定为28px，字体全局统一）
  updateMatrixStyle() {
    // 以普通3/3级别（level=5）为基准
    const baseLv = 4; // levelMatrix索引，普通3/3
    const {rows: baseRows, cols: baseCols} = levelMatrix[baseLv];
    const usableHeight = this.data.screenHeight - 160;
    const usableWidth = this.data.screenWidth - 20;
    // 固定字号
    const fontSize = 28;
    // 获取当前题目拼音最大长度
    let maxLen = 2;
    let allPinyin = [];
    if (this.data.options && this.data.options.length > 0) {
      allPinyin = this.data.options;
    } else if (this.data.grid && this.data.grid.length > 0) {
      allPinyin = this.data.grid;
    }
    if (allPinyin.length > 0) {
      maxLen = Math.max(...allPinyin.map(p => (p ? p.length : 2)));
    }
    // 以普通3/3的格子数计算基准格子宽高
    let minCellW = Math.ceil(maxLen * fontSize * 0.7);
    if (minCellW < 48) minCellW = 48;
    let maxCellW = Math.floor(usableWidth / baseCols) - 8;
    let cellW = Math.max(minCellW, Math.min(maxCellW, 180));
    let totalGridW = cellW * baseCols + (baseCols - 1) * 10;
    if (totalGridW < usableWidth) {
      cellW = Math.floor((usableWidth - (baseCols - 1) * 10) / baseCols);
    }
    let cellH = Math.floor(usableHeight / baseRows) - 8;
    if (cellH < 40) cellH = 40;
    if (cellH > 160) cellH = 160;
    this.setData({ cellWidth: cellW, cellHeight: cellH, cellFontSize: fontSize });
  },

  showHelp() {
    this.setData({ showHelpModal: true });
  },

  closeHelp() {
    this.setData({ showHelpModal: false });
  },
})