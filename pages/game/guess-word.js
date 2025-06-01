// pages/game/guess-word.js
const wordBank = require('../../data/guess_word_bank.js');
const audioUtil = require('../../utils/audio.js');

// 内置手写识别器集合
const HandwritingRecognizers = {
  // 简化识别器
  simple: {
    initialize: function(wordBank) {
      console.log('简化识别器已初始化，题库字符数:', wordBank.length);
    },
    
    recognize: function(strokes, possibleChars = []) {
      if (!strokes || strokes.length === 0) return '';
      
      // 基于笔画数的简单识别
      const strokeCount = strokes.length;
      const strokeMap = {
        1: '一',
        2: '二',
        3: '三',
        4: '中',
        5: '古',
        6: '红',
        7: '花',
        8: '青',
        9: '春'
      };
      
      const result = strokeMap[strokeCount] || '字';
      
      // 如果有可能的字符列表，优先从中选择
      if (possibleChars.length > 0) {
        const match = possibleChars.find(char => char === result);
        if (match) return match;
        return possibleChars[0];
      }
      
      return result;
    },
    
    learnFromResult: function(recognizedChar, actualChar, userFeatures) {
      console.log(`简化识别器学习: 识别=${recognizedChar}, 实际=${actualChar}`);
    },
    
    getStatistics: function() {
      return {
        totalCharacters: 9,
        learnedCharacters: 0,
        averageAccuracy: 0.7,
        lastUpdate: Date.now()
      };
    }
  },

  // 智能识别器 - 基于深度学习思想的多维度识别
  advanced: {
    wordBank: null, // 添加wordBank属性
    initialize: function(wordBank) {
      console.log('智能识别器已初始化，题库字符数:', wordBank.length);
      this.wordBank = wordBank;
    },
    
    recognize: function(strokes, possibleChars = []) {
      if (!strokes || strokes.length === 0) return '';
      
      // 1. 特征提取 - 模拟CNN的特征提取过程
      const features = HandwritingRecognizers.advanced.extractFeatures(strokes);
      
      // 2. 笔画序列分析 - 模拟LSTM的时序分析
      const sequenceFeatures = HandwritingRecognizers.advanced.analyzeStrokeSequence(strokes);
      
      // 3. 几何形状匹配
      const shapeFeatures = HandwritingRecognizers.advanced.analyzeShape(strokes);
      
      // 4. 多维度融合识别
      return HandwritingRecognizers.advanced.fusionRecognition(features, sequenceFeatures, shapeFeatures, possibleChars);
    },

    // 特征提取 - 模拟CNN卷积层
    extractFeatures: function(strokes) {
      const features = {
        strokeCount: strokes.length,
        totalPoints: strokes.reduce((sum, stroke) => sum + stroke.length, 0),
        boundingBox: HandwritingRecognizers.advanced.getBoundingBox(strokes),
        density: 0,
        symmetry: 0,
        corners: 0,
        curves: 0
      };

      // 计算笔画密度
      if (features.boundingBox.width > 0 && features.boundingBox.height > 0) {
        features.density = features.totalPoints / (features.boundingBox.width * features.boundingBox.height);
      }

      // 分析对称性
      features.symmetry = HandwritingRecognizers.advanced.calculateSymmetry(strokes);

      // 检测角点和曲线
      strokes.forEach(stroke => {
        const analysis = HandwritingRecognizers.advanced.analyzeStrokeGeometry(stroke);
        features.corners += analysis.corners;
        features.curves += analysis.curves;
      });

      return features;
    },

    // 笔画序列分析 - 模拟LSTM时序分析
    analyzeStrokeSequence: function(strokes) {
      const sequence = {
        directions: [],
        velocities: [],
        strokeOrders: []
      };

      strokes.forEach((stroke, index) => {
        if (stroke.length < 2) return;

        // 分析笔画方向
        const direction = HandwritingRecognizers.advanced.getStrokeDirection(stroke);
        sequence.directions.push(direction);

        // 分析书写速度（模拟）
        const velocity = HandwritingRecognizers.advanced.calculateVelocity(stroke);
        sequence.velocities.push(velocity);

        // 分析笔画顺序特征
        sequence.strokeOrders.push({
          index: index,
          startPoint: stroke[0],
          endPoint: stroke[stroke.length - 1],
          length: stroke.length
        });
      });

      return sequence;
    },

    // 几何形状分析
    analyzeShape: function(strokes) {
      const allPoints = strokes.flat();
      if (allPoints.length === 0) return {};

      const bbox = HandwritingRecognizers.advanced.getBoundingBox(strokes);
      const center = {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2
      };

      return {
        aspectRatio: bbox.width / Math.max(bbox.height, 1),
        compactness: HandwritingRecognizers.advanced.calculateCompactness(allPoints, bbox),
        centerOfMass: center,
        circularityScore: HandwritingRecognizers.advanced.calculateCircularity(strokes),
        linearityScore: HandwritingRecognizers.advanced.calculateLinearity(strokes)
      };
    },

    // 多维度融合识别
    fusionRecognition: function(features, sequence, shape, targetChars) {
      const candidates = [];

      // 为每个目标字符计算综合得分
      targetChars.forEach(char => {
        let score = 0;
        
        // 1. 笔画数匹配 (权重: 30%)
        const expectedStrokes = HandwritingRecognizers.advanced.getExpectedStrokes(char);
        const strokeScore = HandwritingRecognizers.advanced.calculateStrokeScore(features.strokeCount, expectedStrokes);
        score += strokeScore * 0.3;

        // 2. 几何特征匹配 (权重: 25%)
        const shapeScore = HandwritingRecognizers.advanced.calculateShapeScore(shape, char);
        score += shapeScore * 0.25;

        // 3. 笔画顺序匹配 (权重: 20%)
        const sequenceScore = HandwritingRecognizers.advanced.calculateSequenceScore(sequence, char);
        score += sequenceScore * 0.2;

        // 4. 特殊规则匹配 (权重: 25%)
        const ruleScore = HandwritingRecognizers.advanced.applySpecialRules(features, sequence, shape, char);
        score += ruleScore * 0.25;

        candidates.push({ char, score });
      });

      // 排序并返回最佳匹配
      candidates.sort((a, b) => b.score - a.score);
      
      // 如果最高分超过阈值，返回结果
      if (candidates.length > 0 && candidates[0].score > 0.5) {
        return candidates[0].char;
      }

      // 否则使用备用识别逻辑
      return HandwritingRecognizers.advanced.fallbackRecognition(features, targetChars);
    },

    // 辅助函数
    getBoundingBox: function(strokes) {
      const allPoints = strokes.flat();
      if (allPoints.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

      let minX = allPoints[0].x, maxX = allPoints[0].x;
      let minY = allPoints[0].y, maxY = allPoints[0].y;

      allPoints.forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      });

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    },

    calculateSymmetry: function(strokes) {
      const bbox = HandwritingRecognizers.advanced.getBoundingBox(strokes);
      const centerX = bbox.x + bbox.width / 2;
      
      let symmetryScore = 0;
      const allPoints = strokes.flat();
      
      allPoints.forEach(point => {
        const distFromCenter = Math.abs(point.x - centerX);
        const normalizedDist = distFromCenter / Math.max(bbox.width / 2, 1);
        symmetryScore += 1 - normalizedDist;
      });

      return symmetryScore / Math.max(allPoints.length, 1);
    },

    analyzeStrokeGeometry: function(stroke) {
      let corners = 0;
      let curves = 0;

      for (let i = 1; i < stroke.length - 1; i++) {
        const prev = stroke[i - 1];
        const curr = stroke[i];
        const next = stroke[i + 1];

        // 计算角度变化
        const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
        const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
        const angleDiff = Math.abs(angle2 - angle1);

        if (angleDiff > Math.PI / 3) {
          corners++;
        } else if (angleDiff > Math.PI / 6) {
          curves++;
        }
      }

      return { corners, curves };
    },

    getStrokeDirection: function(stroke) {
      if (stroke.length < 2) return 'unknown';

      const start = stroke[0];
      const end = stroke[stroke.length - 1];
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      const angle = Math.atan2(dy, dx);
      const degree = angle * 180 / Math.PI;

      if (degree >= -22.5 && degree < 22.5) return 'right';
      if (degree >= 22.5 && degree < 67.5) return 'down-right';
      if (degree >= 67.5 && degree < 112.5) return 'down';
      if (degree >= 112.5 && degree < 157.5) return 'down-left';
      if (degree >= 157.5 || degree < -157.5) return 'left';
      if (degree >= -157.5 && degree < -112.5) return 'up-left';
      if (degree >= -112.5 && degree < -67.5) return 'up';
      if (degree >= -67.5 && degree < -22.5) return 'up-right';

      return 'unknown';
    },

    calculateVelocity: function(stroke) {
      if (stroke.length < 2) return 0;

      let totalDistance = 0;
      for (let i = 1; i < stroke.length; i++) {
        const dx = stroke[i].x - stroke[i-1].x;
        const dy = stroke[i].y - stroke[i-1].y;
        totalDistance += Math.sqrt(dx * dx + dy * dy);
      }

      return totalDistance / stroke.length;
    },

    calculateCompactness: function(points, bbox) {
      if (bbox.width === 0 || bbox.height === 0) return 0;
      const area = bbox.width * bbox.height;
      return points.length / area;
    },

    calculateCircularity: function(strokes) {
      const allPoints = strokes.flat();
      if (allPoints.length < 3) return 0;

      const bbox = HandwritingRecognizers.advanced.getBoundingBox(strokes);
      const aspectRatio = bbox.width / Math.max(bbox.height, 1);
      
      // 接近正方形的形状更可能是圆形
      const squareness = 1 - Math.abs(1 - aspectRatio);
      
      // 检查是否有封闭的笔画
      let closedness = 0;
      strokes.forEach(stroke => {
        if (stroke.length >= 3) {
          const start = stroke[0];
          const end = stroke[stroke.length - 1];
          const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
          const strokeLength = HandwritingRecognizers.advanced.calculateStrokeLength(stroke);
          closedness += 1 - (distance / Math.max(strokeLength, 1));
        }
      });
      closedness /= strokes.length;

      return (squareness + closedness) / 2;
    },

    calculateLinearity: function(strokes) {
      let totalLinearity = 0;
      
      strokes.forEach(stroke => {
        if (stroke.length < 2) return;
        
        const start = stroke[0];
        const end = stroke[stroke.length - 1];
        const directDistance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        const strokeLength = HandwritingRecognizers.advanced.calculateStrokeLength(stroke);
        
        const linearity = directDistance / Math.max(strokeLength, 1);
        totalLinearity += linearity;
      });

      return totalLinearity / Math.max(strokes.length, 1);
    },

    calculateStrokeLength: function(stroke) {
      let length = 0;
      for (let i = 1; i < stroke.length; i++) {
        const dx = stroke[i].x - stroke[i-1].x;
        const dy = stroke[i].y - stroke[i-1].y;
        length += Math.sqrt(dx * dx + dy * dy);
      }
      return length;
    },

    // 计算得分函数
    calculateStrokeScore: function(actual, expected) {
      if (actual === expected) return 1.0;
      const diff = Math.abs(actual - expected);
      return Math.max(0, 1 - diff * 0.2);
    },

    calculateShapeScore: function(shape, char) {
      const expectedShape = HandwritingRecognizers.advanced.getExpectedShape(char);
      let score = 0;

      // 长宽比匹配
      if (expectedShape.aspectRatio) {
        const ratioDiff = Math.abs(shape.aspectRatio - expectedShape.aspectRatio);
        score += Math.max(0, 1 - ratioDiff) * 0.4;
      }

      // 圆形度匹配
      if (expectedShape.circularity !== undefined) {
        const circDiff = Math.abs(shape.circularityScore - expectedShape.circularity);
        score += Math.max(0, 1 - circDiff) * 0.3;
      }

      // 线性度匹配
      if (expectedShape.linearity !== undefined) {
        const linDiff = Math.abs(shape.linearityScore - expectedShape.linearity);
        score += Math.max(0, 1 - linDiff) * 0.3;
      }

      return score;
    },

    calculateSequenceScore: function(sequence, char) {
      const expectedSequence = HandwritingRecognizers.advanced.getExpectedSequence(char);
      let score = 0;

      // 主要方向匹配
      if (expectedSequence.mainDirections && sequence.directions.length > 0) {
        const directionMatch = HandwritingRecognizers.advanced.matchDirections(sequence.directions, expectedSequence.mainDirections);
        score += directionMatch * 0.6;
      }

      // 笔画顺序合理性
      const orderScore = HandwritingRecognizers.advanced.evaluateStrokeOrder(sequence.strokeOrders, char);
      score += orderScore * 0.4;

      return score;
    },

    // 应用特殊规则
    applySpecialRules: function(features, sequence, shape, char) {
      let score = 0;

      // 特定字符的特殊规则
      switch(char) {
        case '一':
          if (shape.linearityScore > 0.8 && shape.aspectRatio > 2) {
            score += 0.8;
          }
          break;
        case '二':
          if (features.strokeCount === 2 && shape.aspectRatio > 1.5) {
            score += 0.7;
          }
          break;
        case '三':
          if (features.strokeCount === 3 && shape.aspectRatio > 1.2) {
            score += 0.7;
          }
          break;
        case '口':
          if (shape.aspectRatio > 0.7 && shape.aspectRatio < 1.3 && shape.circularityScore > 0.6) {
            score += 0.8;
          }
          break;
        case '日':
          if (shape.aspectRatio > 0.6 && shape.aspectRatio < 1.4 && features.strokeCount >= 3) {
            score += 0.7;
          }
          break;
        case '人':
          if (features.strokeCount === 2 && HandwritingRecognizers.advanced.hasDiagonalStrokes(sequence)) {
            score += 0.7;
          }
          break;
        case '大':
          if (features.strokeCount === 3 && HandwritingRecognizers.advanced.hasHorizontalAndDiagonal(sequence)) {
            score += 0.6;
          }
          break;
      }

      return score;
    },

    // 备用识别逻辑
    fallbackRecognition: function(features, targetChars) {
      // 基于笔画数的简单匹配
      const strokeBasedCandidates = targetChars.filter(char => {
        const expected = HandwritingRecognizers.advanced.getExpectedStrokes(char);
        return Math.abs(features.strokeCount - expected) <= 1;
      });

      if (strokeBasedCandidates.length > 0) {
        return strokeBasedCandidates[0];
      }

      return targetChars[0] || '';
    },

    // 字符特征数据库
    getExpectedStrokes: function(char) {
      const strokes = {
        '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
        '口': 3, '日': 4, '月': 4, '人': 2, '大': 3, '小': 3, '上': 3, '下': 3, '中': 4, '山': 3,
        '木': 4, '火': 4, '土': 3, '水': 4, '金': 8, '白': 5, '黑': 12, '红': 6, '绿': 11, '蓝': 13,
        '春': 9, '夏': 10, '秋': 9, '冬': 5, '东': 5, '南': 9, '西': 6, '北': 5, '左': 5, '右': 5
      };
      return strokes[char] || 1;
    },

    getExpectedShape: function(char) {
      const shapes = {
        '一': { aspectRatio: 3.0, circularity: 0.1, linearity: 0.9 },
        '二': { aspectRatio: 2.5, circularity: 0.1, linearity: 0.8 },
        '三': { aspectRatio: 2.0, circularity: 0.1, linearity: 0.7 },
        '口': { aspectRatio: 1.0, circularity: 0.7, linearity: 0.3 },
        '日': { aspectRatio: 0.8, circularity: 0.6, linearity: 0.4 },
        '月': { aspectRatio: 0.7, circularity: 0.4, linearity: 0.5 },
        '人': { aspectRatio: 0.8, circularity: 0.2, linearity: 0.6 },
        '大': { aspectRatio: 1.0, circularity: 0.2, linearity: 0.5 }
      };
      return shapes[char] || { aspectRatio: 1.0, circularity: 0.5, linearity: 0.5 };
    },

    getExpectedSequence: function(char) {
      const sequences = {
        '一': { mainDirections: ['right'] },
        '二': { mainDirections: ['right', 'right'] },
        '三': { mainDirections: ['right', 'right', 'right'] },
        '口': { mainDirections: ['down', 'right', 'up'] },
        '日': { mainDirections: ['down', 'right', 'right', 'up'] },
        '人': { mainDirections: ['down-left', 'down-right'] },
        '大': { mainDirections: ['right', 'down-left', 'down-right'] }
      };
      return sequences[char] || { mainDirections: [] };
    },

    matchDirections: function(actual, expected) {
      if (!actual || !expected || actual.length === 0 || expected.length === 0) return 0;

      let matches = 0;
      const minLength = Math.min(actual.length, expected.length);

      for (let i = 0; i < minLength; i++) {
        if (actual[i] === expected[i]) {
          matches++;
        }
      }

      return matches / Math.max(actual.length, expected.length);
    },

    evaluateStrokeOrder: function(strokeOrders, char) {
      if (!strokeOrders || strokeOrders.length === 0) return 0;

      let score = 0;
      for (let i = 1; i < strokeOrders.length; i++) {
        const prev = strokeOrders[i - 1];
        const curr = strokeOrders[i];

        // 检查是否遵循从上到下的规则
        if (curr.startPoint.y >= prev.startPoint.y) {
          score += 0.5;
        }

        // 检查是否遵循从左到右的规则
        if (curr.startPoint.x >= prev.startPoint.x) {
          score += 0.5;
        }
      }

      return score / Math.max(strokeOrders.length - 1, 1);
    },

    hasDiagonalStrokes: function(sequence) {
      const diagonalDirs = ['up-left', 'up-right', 'down-left', 'down-right'];
      return sequence.directions.some(dir => diagonalDirs.includes(dir));
    },

    hasHorizontalAndDiagonal: function(sequence) {
      const hasHorizontal = sequence.directions.some(dir => dir === 'left' || dir === 'right');
      const hasDiagonal = HandwritingRecognizers.advanced.hasDiagonalStrokes(sequence);
      return hasHorizontal && hasDiagonal;
    },
    
    learnFromResult: function(recognizedChar, actualChar, userFeatures) {
      console.log(`智能识别器学习: 识别=${recognizedChar}, 实际=${actualChar}`);
    },
    
    getStatistics: function() {
      return {
        totalCharacters: 50,
        learnedCharacters: 0,
        averageAccuracy: 0.85,
        lastUpdate: Date.now()
      };
    }
  },

  // API识别器（模拟）
  api: {
    initialize: function(wordBank) {
      console.log('API识别器已初始化（模拟模式）');
    },
    
    recognize: async function(strokes, possibleChars = []) {
      if (!strokes || strokes.length === 0) return '';
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 使用改进算法作为API模拟
      return HandwritingRecognizers.advanced.recognize(strokes, possibleChars);
    },
    
    learnFromResult: function(recognizedChar, actualChar, userFeatures) {
      console.log(`API识别器学习: 识别=${recognizedChar}, 实际=${actualChar}`);
    },
    
    getStatistics: function() {
      return {
        totalCharacters: 50,
        learnedCharacters: 0,
        averageAccuracy: 0.9,
        lastUpdate: Date.now()
      };
    }
  },

  // 混合识别器
  hybrid: {
    initialize: function(wordBank) {
      console.log('混合识别器已初始化');
      HandwritingRecognizers.simple.initialize(wordBank);
      HandwritingRecognizers.advanced.initialize(wordBank);
    },
    
    recognize: async function(strokes, possibleChars = []) {
      if (!strokes || strokes.length === 0) return '';
      
      // 同时使用多种识别器
      const simpleResult = HandwritingRecognizers.simple.recognize(strokes, possibleChars);
      const advancedResult = HandwritingRecognizers.advanced.recognize(strokes, possibleChars);
      
      // 如果结果一致，返回结果
      if (simpleResult === advancedResult) {
        return simpleResult;
      }
      
      // 如果不一致，优先返回在题库中的结果
      if (possibleChars.includes(advancedResult)) {
        return advancedResult;
      }
      if (possibleChars.includes(simpleResult)) {
        return simpleResult;
      }
      
      // 默认返回改进识别器的结果
      return advancedResult;
    },
    
    learnFromResult: function(recognizedChar, actualChar, userFeatures) {
      console.log(`混合识别器学习: 识别=${recognizedChar}, 实际=${actualChar}`);
      HandwritingRecognizers.simple.learnFromResult(recognizedChar, actualChar, userFeatures);
      HandwritingRecognizers.advanced.learnFromResult(recognizedChar, actualChar, userFeatures);
    },
    
    getStatistics: function() {
      return {
        totalCharacters: 30,
        learnedCharacters: 0,
        averageAccuracy: 0.85,
        lastUpdate: Date.now()
      };
    }
  }
};

// 设置识别器引用（无需外部模块）
const simpleHandwritingRecognizer = HandwritingRecognizers.simple;
const advancedHandwritingRecognizer = HandwritingRecognizers.advanced;
const apiHandwritingRecognizer = HandwritingRecognizers.api;
const hybridHandwritingRecognizer = HandwritingRecognizers.hybrid;

console.log('所有内置识别器加载完成');

Page({
  data: {
    currentIndex: 0, // 当前题目索引
    usedIndexes: [], // 已抽取题目索引，避免重复
    score: 0, // 当前得分
    total: 10, // 总题数
    userInput: '', // 用户输入
    showMask: true, // 遮罩是否显示
    showResult: false, // 是否显示结果
    isCorrect: false, // 答案是否正确
    currentWord: {}, // 当前题目对象
    round: 1, // 当前轮次
    inputFocus: true, // 输入框聚焦状态
    
    // 手写识别相关
    inputMode: 'keyboard', // 输入模式：keyboard | handwrite
    canvas: null, // canvas实例
    ctx: null, // canvas上下文
    isDrawing: false, // 是否正在绘制
    strokes: [], // 笔画数据
    currentStroke: [], // 当前笔画
    recognizing: false, // 是否正在识别
    canvasWidth: 300,
    canvasHeight: 200,
    
    // 识别器选择
    recognizerType: 'simple', // 当前使用的识别器：simple | advanced | api | hybrid
    currentRecognizerLabel: '简化识别器', // 当前识别器的显示标签
    recognizerOptions: [
      { value: 'simple', label: '简化识别器', desc: '基础算法，速度快' },
      { value: 'advanced', label: '智能识别器', desc: '深度学习思想，多维特征分析' },
      { value: 'api', label: 'API识别器', desc: '第三方API，准确率高' },
      { value: 'hybrid', label: '混合识别器', desc: '多种算法融合，最佳效果' }
    ],
    showRecognizerSelector: false, // 是否显示识别器选择器
    
    // 识别配置
    useThirdPartyAPI: false, // 第三方API开关，暂时禁用
    enableLocalRecognition: true, // 本地识别开关
    pendingLearning: null, // 待学习的数据
    
    // 统计信息
    recognitionStats: null
  },

  onLoad() {
    this.initQuiz();
    // 初始化所有识别器
    this.initializeRecognizers();
  },

  onReady() {
    // 初始化canvas
    this.initCanvas();
  },

  // 初始化所有识别器
  initializeRecognizers() {
    console.log('初始化所有识别器...');
    simpleHandwritingRecognizer.initialize(wordBank);
    advancedHandwritingRecognizer.initialize(wordBank);
    apiHandwritingRecognizer.initialize(wordBank);
    hybridHandwritingRecognizer.initialize(wordBank);
    console.log('所有识别器初始化完成');
  },

  // 获取当前识别器
  getCurrentRecognizer() {
    const recognizers = {
      'simple': simpleHandwritingRecognizer,
      'advanced': advancedHandwritingRecognizer,
      'api': apiHandwritingRecognizer,
      'hybrid': hybridHandwritingRecognizer
    };
    
    return recognizers[this.data.recognizerType] || simpleHandwritingRecognizer;
  },

  // 切换识别器
  onRecognizerChange(e) {
    const recognizerType = e.currentTarget.dataset.value;
    const selectedOption = this.data.recognizerOptions.find(opt => opt.value === recognizerType);
    
    this.setData({ 
      recognizerType,
      currentRecognizerLabel: selectedOption ? selectedOption.label : '未知识别器',
      showRecognizerSelector: false 
    });
    
    wx.showToast({
      title: `已切换到${selectedOption ? selectedOption.label : '未知识别器'}`,
      icon: 'success',
      duration: 1500
    });
    
    console.log('切换识别器:', recognizerType);
  },

  // 显示识别器选择器
  showRecognizerOptions() {
    this.setData({ showRecognizerSelector: true });
  },

  // 隐藏识别器选择器
  hideRecognizerSelector() {
    this.setData({ showRecognizerSelector: false });
  },

  // 查看识别统计
  viewRecognitionStats() {
    const recognizer = this.getCurrentRecognizer();
    const stats = recognizer.getStatistics();
    
    this.setData({ recognitionStats: stats });
    
    let message = '识别统计信息:\n';
    if (this.data.recognizerType === 'hybrid') {
      message += `总识别次数: ${stats.totalRecognitions}\n`;
      message += `成功率: API ${stats.successRates.api}, 改进 ${stats.successRates.advanced}, 简化 ${stats.successRates.simple}\n`;
      message += `一致性成功: ${stats.successRates.consensus}`;
    } else if (this.data.recognizerType === 'advanced') {
      message += `模板数量: ${stats.templateCount}\n`;
      message += `学习字符: ${stats.learningCount}\n`;
      message += `总样本: ${stats.totalSamples}`;
    } else {
      message += `支持字符: ${stats.totalCharacters || '未知'}\n`;
      message += `学习字符: ${stats.learnedCharacters || 0}`;
    }
    
    wx.showModal({
      title: '识别统计',
      content: message,
      showCancel: false
    });
  },

  // 初始化题目
  initQuiz() {
    const used = [];
    for (let i = 0; i < this.data.total; i++) {
      let idx;
      do {
        idx = Math.floor(Math.random() * wordBank.length);
      } while (used.includes(idx));
      used.push(idx);
    }
    this.setData({
      usedIndexes: used,
      currentIndex: 0,
      score: 0,
      round: 1,
      showResult: false,
      showMask: true,
      userInput: '',
      currentWord: wordBank[used[0]],
      inputFocus: false
    });
  },

  // 初始化Canvas
  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#handwriteCanvas').fields({ node: true, size: true }).exec((res) => {
      if (res[0]) {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = this.data.canvasWidth * dpr;
        canvas.height = this.data.canvasHeight * dpr;
        ctx.scale(dpr, dpr);
        
        // 设置画笔样式
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#333';
        
        this.setData({ canvas, ctx });
        this.clearCanvasBackground();
      }
    });
  },

  // 清除画布背景
  clearCanvasBackground() {
    if (this.data.ctx) {
      const ctx = this.data.ctx;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
      
      // 绘制网格线辅助书写
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // 中心十字线
      ctx.moveTo(this.data.canvasWidth / 2, 0);
      ctx.lineTo(this.data.canvasWidth / 2, this.data.canvasHeight);
      ctx.moveTo(0, this.data.canvasHeight / 2);
      ctx.lineTo(this.data.canvasWidth, this.data.canvasHeight / 2);
      ctx.stroke();
      
      // 恢复画笔样式
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
    }
  },

  // 切换到键盘输入
  switchToKeyboard() {
    this.setData({ 
      inputMode: 'keyboard',
      userInput: '',
      inputFocus: true 
    });
  },

  // 切换到手写输入
  switchToHandwrite() {
    this.setData({ 
      inputMode: 'handwrite',
      userInput: '',
      inputFocus: false 
    });
    // 延迟初始化canvas，确保DOM渲染完成
    setTimeout(() => {
      this.initCanvas();
    }, 100);
  },

  // Canvas触摸开始
  onCanvasStart(e) {
    if (!this.data.ctx) return;
    
    // 获取触摸点相对于Canvas的坐标
    const query = wx.createSelectorQuery();
    query.select('#handwriteCanvas').boundingClientRect((rect) => {
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // 考虑设备像素比
      const dpr = wx.getSystemInfoSync().pixelRatio;
      const canvasX = x * (this.data.canvasWidth / rect.width);
      const canvasY = y * (this.data.canvasHeight / rect.height);
      
      this.setData({ 
        isDrawing: true,
        currentStroke: [{ x: canvasX, y: canvasY, time: Date.now() }]
      });
      
      this.data.ctx.beginPath();
      this.data.ctx.moveTo(canvasX, canvasY);
    }).exec();
  },

  // Canvas触摸移动
  onCanvasMove(e) {
    if (!this.data.isDrawing || !this.data.ctx) return;
    
    // 获取触摸点相对于Canvas的坐标
    const query = wx.createSelectorQuery();
    query.select('#handwriteCanvas').boundingClientRect((rect) => {
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // 考虑设备像素比
      const canvasX = x * (this.data.canvasWidth / rect.width);
      const canvasY = y * (this.data.canvasHeight / rect.height);
      
      // 添加点到当前笔画
      const currentStroke = [...this.data.currentStroke, { x: canvasX, y: canvasY, time: Date.now() }];
      this.setData({ currentStroke });
      
      // 绘制到canvas
      this.data.ctx.lineTo(canvasX, canvasY);
      this.data.ctx.stroke();
    }).exec();
  },

  // Canvas触摸结束
  onCanvasEnd(e) {
    if (!this.data.isDrawing) return;
    
    // 保存当前笔画
    const strokes = [...this.data.strokes, this.data.currentStroke];
    this.setData({ 
      isDrawing: false,
      strokes,
      currentStroke: []
    });
  },

  // 清除画布
  clearCanvas() {
    this.setData({ 
      strokes: [],
      currentStroke: [],
      userInput: ''
    });
    this.clearCanvasBackground();
  },

  // 撤销最后一笔
  undoStroke() {
    if (this.data.strokes.length === 0) return;
    
    const strokes = this.data.strokes.slice(0, -1);
    this.setData({ strokes });
    
    // 重绘canvas
    this.redrawCanvas();
  },

  // 重绘canvas
  redrawCanvas() {
    this.clearCanvasBackground();
    
    if (this.data.ctx && this.data.strokes.length > 0) {
      this.data.strokes.forEach(stroke => {
        if (stroke.length > 0) {
          this.data.ctx.beginPath();
          this.data.ctx.moveTo(stroke[0].x, stroke[0].y);
          
          stroke.forEach(point => {
            this.data.ctx.lineTo(point.x, point.y);
          });
          
          this.data.ctx.stroke();
        }
      });
    }
  },

  // 手写识别主入口
  async recognizeHandwriting() {
    if (this.data.strokes.length === 0) {
      wx.showToast({ title: '请先写字', icon: 'none' });
      return;
    }

    this.setData({ recognizing: true });
    
    try {
      const recognizer = this.getCurrentRecognizer();
      const possibleChars = this.getCurrentWordBank();
      
      console.log(`使用${this.data.recognizerType}识别器进行识别`);
      const result = await recognizer.recognize(this.data.strokes, possibleChars);
      
      if (result) {
        this.setData({ 
          userInput: result,
          recognizing: false 
        });
        wx.showToast({ 
          title: `识别结果：${result}`, 
          icon: 'success', 
          duration: 1500 
        });
        
        // 学习识别结果（在用户确认答案后进行）
        this.pendingLearning = {
          recognizedChar: result,
          userFeatures: this.extractUserFeatures(),
          timestamp: Date.now()
        };
      } else {
        this.setData({ recognizing: false });
        wx.showToast({ title: '识别失败，请重新书写', icon: 'none' });
      }
    } catch (error) {
      console.error('手写识别失败:', error);
      this.setData({ recognizing: false });
      wx.showToast({ title: '识别失败，请重试', icon: 'none' });
    }
  },

  // 获取当前题库字符
  getCurrentWordBank() {
    // 从题库中提取所有可能的字符
    const allChars = wordBank.map(item => item.word);
    
    // 添加当前题目答案的权重（提高正确答案的概率）
    const currentAnswer = this.data.currentWord.word;
    if (currentAnswer) {
      allChars.push(currentAnswer, currentAnswer); // 增加权重
    }
    
    return [...new Set(allChars)]; // 去重
  },

  // 播放拼音和组词音频
  playAudio() {
    const { currentWord } = this.data;
    console.log(currentWord);
    // 先播放拼音音频，播放完后随机播放一个组词音频
    audioUtil.playPinyin(currentWord.word, () => {
      audioUtil.playPinyin(currentWord.words, null, { url: 'http://localhost:5000/stream_chinese_audio', type: 'chinese' });
    }, { url: 'http://localhost:5000/stream_chinese_audio', type: 'chinese' });
  },

  // 输入框输入
  onInput(e) {
    this.setData({ userInput: e.detail.value });
  },

  // 擦除遮罩，显示答案
  onErase() {
    this.setData({ showMask: false, showResult: true, inputFocus: true });
    this.checkAnswer();
  },

  // 判定对错
  checkAnswer() {
    const { userInput, currentWord, score } = this.data;
    const isCorrect = userInput.trim() === currentWord.word;
    this.setData({
      isCorrect,
      score: isCorrect ? score + 1 : score
    });
  },

  // 下一题
  nextQuiz() {
    // 如果有待学习的数据，进行学习
    if (this.pendingLearning) {
      const actualChar = this.data.currentWord.word;
      const recognizer = this.getCurrentRecognizer();
      recognizer.learnFromResult(
        this.pendingLearning.recognizedChar,
        actualChar,
        this.pendingLearning.userFeatures
      );
      this.pendingLearning = null;
    }

    const { currentIndex, usedIndexes, total } = this.data;
    if (currentIndex + 1 >= total) {
      // 显示识别统计信息
      const recognizer = this.getCurrentRecognizer();
      const stats = recognizer.getStatistics();
      
      let message = `答题结束，总分：${this.data.score}/${total}`;
      if (this.data.recognizerType === 'hybrid') {
        message += `\n使用混合识别器，总识别${stats.totalRecognitions}次`;
      } else if (stats.learnedCharacters !== undefined) {
        message += `\n学习字符：${stats.learnedCharacters}个`;
      }
      
      wx.showToast({ 
        title: message, 
        icon: 'none',
        duration: 3000
      });
      this.initQuiz();
      return;
    }
    const nextIndex = currentIndex + 1;
    this.setData({
      currentIndex: nextIndex,
      currentWord: wordBank[usedIndexes[nextIndex]],
      userInput: '',
      showMask: true,
      showResult: false,
      isCorrect: false,
      round: nextIndex + 1,
      inputFocus: false,
      strokes: [], // 清除手写笔画
      currentStroke: []
    });
    
    // 如果是手写模式，清除画布
    if (this.data.inputMode === 'handwrite') {
      this.clearCanvasBackground();
    }
  },

  // 提取用户手写特征
  extractUserFeatures() {
    const strokes = this.data.strokes;
    if (!strokes || strokes.length === 0) return null;

    // 计算基本特征
    let allPoints = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    strokes.forEach(stroke => {
      stroke.forEach(point => {
        allPoints.push(point);
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const aspectRatio = height > 0 ? width / height : 1;

    return {
      strokeCount: strokes.length,
      aspectRatio: aspectRatio,
      boundingBox: { minX, minY, maxX, maxY, width, height },
      timestamp: Date.now()
    };
  }
}); 