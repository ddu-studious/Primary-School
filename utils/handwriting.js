// utils/handwriting.js - 手写识别工具类

const featureManager = require('./feature-manager.js');
const { FeatureAnalyzer } = require('./character-features.js');

/**
 * 手写识别工具类
 * 提供本地汉字识别能力，集成特征管理和学习功能
 */
class HandwritingRecognizer {
  constructor() {
    this.featureManager = featureManager;
    this.initialized = false;
  }

  /**
   * 初始化识别器
   * @param {Array} wordBank 题库数据
   */
  initialize(wordBank) {
    if (!this.initialized && wordBank) {
      // 从题库自动生成缺失的特征
      this.featureManager.generateFeaturesFromWordBank(wordBank);
      this.initialized = true;
      console.log('手写识别器初始化完成');
    }
  }

  /**
   * 识别手写汉字
   * @param {Array} strokes 笔画数据
   * @param {Array} possibleChars 可能的字符列表
   * @returns {String} 识别结果
   */
  recognize(strokes, possibleChars = []) {
    if (!strokes || strokes.length === 0) {
      return '';
    }

    console.log('开始识别，笔画数：', strokes.length);

    // 提取特征
    const features = this.extractFeatures(strokes);
    console.log('提取的特征：', features);

    // 基于笔画数匹配
    const candidates = this.getCandidatesByStrokeCount(features.strokeCount, possibleChars);
    console.log('候选字符：', candidates);

    // 使用新的特征匹配算法
    const result = this.advancedMatchByFeatures(features, candidates);
    console.log('匹配结果：', result);

    return result || this.fallbackRecognition(features, possibleChars);
  }

  /**
   * 提取笔画特征（增强版）
   */
  extractFeatures(strokes) {
    const features = {
      strokeCount: strokes.length,
      directions: [],
      patterns: [],
      boundingBox: null,
      aspectRatio: 1,
      complexity: 'simple'
    };

    let allPoints = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // 分析每个笔画
    strokes.forEach(stroke => {
      if (stroke.length < 2) return;

      // 计算方向和模式
      const direction = this.getStrokeDirection(stroke);
      const pattern = this.getStrokePattern(stroke);
      
      features.directions.push(direction);
      features.patterns.push(pattern);

      // 收集所有点
      stroke.forEach(point => {
        allPoints.push(point);
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    // 计算边界和比例
    if (allPoints.length > 0) {
      features.boundingBox = { minX, minY, maxX, maxY };
      const width = maxX - minX;
      const height = maxY - minY;
      features.aspectRatio = height > 0 ? width / height : 1;
    }

    // 使用特征分析器增强特征
    const strokeFeatures = FeatureAnalyzer.analyzeStrokeFeatures(features.patterns);
    Object.assign(features, strokeFeatures);

    // 判断复杂度
    features.complexity = this.judgeComplexity(features);

    return features;
  }

  /**
   * 高级特征匹配算法
   */
  advancedMatchByFeatures(features, candidates) {
    if (candidates.length === 0) return '';

    const matches = [];

    // 对每个候选字符计算匹配分数
    candidates.forEach(char => {
      const charFeature = this.featureManager.getCharacterFeature(char);
      if (!charFeature) return;

      const score = this.calculateMatchScore(features, charFeature);
      if (score > 0) {
        matches.push({ char, score, feature: charFeature });
      }
    });

    // 按分数排序
    matches.sort((a, b) => b.score - a.score);

    console.log('匹配分数:', matches.map(m => `${m.char}:${m.score.toFixed(2)}`));

    // 返回最佳匹配
    return matches.length > 0 ? matches[0].char : '';
  }

  /**
   * 计算匹配分数
   */
  calculateMatchScore(userFeatures, charFeature) {
    let totalScore = 0;
    let weights = 0;

    // 1. 笔画数匹配 (权重: 30%)
    const strokeWeight = 0.3;
    if (charFeature.strokes) {
      const strokeDiff = Math.abs(userFeatures.strokeCount - charFeature.strokes);
      const strokeScore = Math.max(0, 1 - strokeDiff / 3); // 允许±3笔的误差
      totalScore += strokeScore * strokeWeight;
      weights += strokeWeight;
    }

    // 2. 几何特征匹配 (权重: 25%)
    const geometryWeight = 0.25;
    if (charFeature.geometry) {
      const geometryScore = this.calculateGeometryScore(userFeatures, charFeature.geometry);
      totalScore += geometryScore * geometryWeight;
      weights += geometryWeight;
    }

    // 3. 笔画模式匹配 (权重: 25%)
    const patternWeight = 0.25;
    if (charFeature.pattern) {
      const patternScore = this.calculatePatternScore(userFeatures.patterns, charFeature.pattern);
      totalScore += patternScore * patternWeight;
      weights += patternWeight;
    }

    // 4. 特征匹配 (权重: 20%)
    const featureWeight = 0.2;
    if (charFeature.features) {
      const featureScore = FeatureAnalyzer.calculateFeatureMatch(userFeatures, charFeature.features);
      totalScore += featureScore * featureWeight;
      weights += featureWeight;
    }

    return weights > 0 ? totalScore / weights : 0;
  }

  /**
   * 计算几何特征分数
   */
  calculateGeometryScore(userFeatures, charGeometry) {
    let score = 0;
    let checks = 0;

    // 长宽比匹配
    if (charGeometry.ratio) {
      const userRatio = this.classifyAspectRatio(userFeatures.aspectRatio);
      score += userRatio === charGeometry.ratio ? 1 : 0;
      checks++;
    }

    return checks > 0 ? score / checks : 0;
  }

  /**
   * 分类长宽比
   */
  classifyAspectRatio(ratio) {
    if (ratio > 1.3) return 'wide';
    if (ratio < 0.7) return 'tall';
    return 'square';
  }

  /**
   * 学习识别结果
   * @param {String} recognizedChar 识别结果
   * @param {String} actualChar 实际字符
   * @param {Object} userFeatures 用户手写特征
   */
  learnFromResult(recognizedChar, actualChar, userFeatures) {
    const isCorrect = recognizedChar === actualChar;
    
    // 学习实际字符的特征
    if (actualChar) {
      this.featureManager.learnFromUser(actualChar, userFeatures, isCorrect);
    }
    
    // 如果识别错误，也学习错误识别的字符
    if (!isCorrect && recognizedChar) {
      this.featureManager.learnFromUser(recognizedChar, userFeatures, false);
    }
  }

  /**
   * 获取笔画方向
   */
  getStrokeDirection(stroke) {
    if (stroke.length < 2) return 'dot';

    const start = stroke[0];
    const end = stroke[stroke.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const threshold = 10;

    // 判断是否为点
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      return 'dot';
    }

    // 主要方向判断
    if (Math.abs(dx) < threshold) {
      return dy > 0 ? 'down' : 'up';
    }
    if (Math.abs(dy) < threshold) {
      return dx > 0 ? 'right' : 'left';
    }

    // 斜向判断
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }

  /**
   * 获取笔画模式
   */
  getStrokePattern(stroke) {
    if (stroke.length < 2) return 'dot';

    const start = stroke[0];
    const end = stroke[stroke.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // 分析笔画特征
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      return 'dot';
    }

    if (Math.abs(dx) < 15) {
      return 'vertical';
    }

    if (Math.abs(dy) < 15) {
      return 'horizontal';
    }

    // 检查是否为曲线
    if (this.isStrokeCurved(stroke)) {
      return 'curve';
    }

    // 斜线判断
    if (dx > 0 && dy > 0) {
      return 'right-diagonal';
    } else if (dx < 0 && dy > 0) {
      return 'left-diagonal';
    } else if (dx > 0 && dy < 0) {
      return 'right-up-diagonal';
    } else {
      return 'left-up-diagonal';
    }
  }

  /**
   * 判断笔画是否为曲线
   */
  isStrokeCurved(stroke) {
    if (stroke.length < 5) return false;

    let directionChanges = 0;
    let lastDirection = null;

    for (let i = 1; i < stroke.length - 1; i++) {
      const dx = stroke[i + 1].x - stroke[i].x;
      const dy = stroke[i + 1].y - stroke[i].y;
      const currentDirection = Math.atan2(dy, dx);

      if (lastDirection !== null) {
        const angleDiff = Math.abs(currentDirection - lastDirection);
        if (angleDiff > 0.5) {
          directionChanges++;
        }
      }
      lastDirection = currentDirection;
    }

    return directionChanges > 2;
  }

  /**
   * 判断复杂度
   */
  judgeComplexity(features) {
    if (features.strokeCount <= 3) return 'simple';
    if (features.strokeCount <= 6) return 'medium';
    return 'complex';
  }

  /**
   * 根据笔画数获取候选字符
   */
  getCandidatesByStrokeCount(strokeCount, possibleChars) {
    const candidates = [];
    const allFeatures = this.featureManager.getAllFeatures();

    // 从特征数据库中筛选
    for (const [char, data] of Object.entries(allFeatures)) {
      if (data.strokes === strokeCount || Math.abs(data.strokes - strokeCount) <= 1) {
        if (possibleChars.length === 0 || possibleChars.includes(char)) {
          candidates.push(char);
        }
      }
    }

    return candidates;
  }

  /**
   * 计算模式匹配分数
   */
  calculatePatternScore(userPatterns, templatePattern) {
    if (!userPatterns || !templatePattern) return 0;

    let matchCount = 0;
    const maxLength = Math.max(userPatterns.length, templatePattern.length);

    for (let i = 0; i < maxLength; i++) {
      const userPattern = userPatterns[i] || '';
      const templatePat = templatePattern[i] || '';

      if (this.patternsMatch(userPattern, templatePat)) {
        matchCount++;
      }
    }

    return matchCount / maxLength;
  }

  /**
   * 判断模式是否匹配
   */
  patternsMatch(pattern1, pattern2) {
    if (pattern1 === pattern2) return true;

    // 相似模式匹配
    const similarPatterns = {
      'horizontal': ['right', 'left'],
      'vertical': ['up', 'down'],
      'left-diagonal': ['left-up-diagonal'],
      'right-diagonal': ['right-up-diagonal']
    };

    for (const [key, values] of Object.entries(similarPatterns)) {
      if ((pattern1 === key && values.includes(pattern2)) ||
          (pattern2 === key && values.includes(pattern1))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 兜底识别
   */
  fallbackRecognition(features, possibleChars) {
    const { strokeCount } = features;

    // 根据笔画数的兜底规则
    const fallbackMap = {
      1: '一',
      2: '二', 
      3: '三',
      4: '王',
      5: '古'
    };

    const fallback = fallbackMap[strokeCount] || '字';
    
    // 如果兜底字符在可能列表中，使用它
    if (possibleChars.length === 0 || possibleChars.includes(fallback)) {
      return fallback;
    }

    // 否则从可能列表中随机选择
    if (possibleChars.length > 0) {
      return possibleChars[Math.floor(Math.random() * possibleChars.length)];
    }

    return fallback;
  }

  /**
   * 获取识别统计信息
   */
  getStatistics() {
    return this.featureManager.getStatistics();
  }
}

// 导出单例
const handwritingRecognizer = new HandwritingRecognizer();

module.exports = handwritingRecognizer; 