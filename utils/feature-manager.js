// utils/feature-manager.js - 特征管理程序

const { characterFeatures, FeatureAnalyzer } = require('./character-features.js');

/**
 * 特征管理器
 * 负责动态导入、更新和完善字符特征数据
 */
class FeatureManager {
  constructor() {
    this.features = { ...characterFeatures };
    this.learningData = new Map(); // 存储学习数据
  }

  /**
   * 批量导入字符特征
   * @param {Object} newFeatures 新的特征数据
   */
  importFeatures(newFeatures) {
    Object.assign(this.features, newFeatures);
    console.log(`已导入 ${Object.keys(newFeatures).length} 个字符的特征数据`);
  }

  /**
   * 从题库自动生成基础特征
   * @param {Array} wordBank 题库数据
   */
  generateFeaturesFromWordBank(wordBank) {
    const newFeatures = {};
    
    wordBank.forEach(item => {
      const char = item.word;
      if (!this.features[char]) {
        // 基于字符复杂度估算笔画数
        const estimatedStrokes = this.estimateStrokeCount(char);
        
        newFeatures[char] = {
          strokes: estimatedStrokes,
          pattern: this.generateBasicPattern(estimatedStrokes),
          structure: this.analyzeStructure(char),
          geometry: this.estimateGeometry(char, estimatedStrokes),
          frequency: 'medium',
          difficulty: this.estimateDifficulty(estimatedStrokes),
          source: 'auto-generated'
        };
      }
    });
    
    this.importFeatures(newFeatures);
    return newFeatures;
  }

  /**
   * 估算笔画数
   */
  estimateStrokeCount(char) {
    // 基于Unicode编码和字符复杂度的简单估算
    const code = char.charCodeAt(0);
    const complexity = this.getCharComplexity(char);
    
    // 常见字符的笔画数映射
    const commonStrokes = {
      '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
      '大': 3, '小': 3, '人': 2, '天': 4, '地': 6, '山': 3, '水': 4, '火': 4, '木': 4,
      '金': 8, '土': 3, '日': 4, '月': 4, '年': 6, '时': 7, '分': 4, '秒': 9,
      '春': 9, '夏': 10, '秋': 9, '冬': 5, '东': 5, '南': 9, '西': 6, '北': 5,
      '红': 6, '黄': 11, '蓝': 13, '绿': 11, '白': 5, '黑': 12, '灰': 6,
      '好': 6, '坏': 7, '美': 9, '丑': 4, '高': 10, '低': 7, '长': 4, '短': 12,
      '写': 5, '读': 10, '听': 9, '说': 9, '看': 9, '想': 13, '做': 11, '来': 7,
      '去': 5, '回': 6, '出': 5, '入': 2, '上': 3, '下': 3, '左': 5, '右': 5
    };
    
    if (commonStrokes[char]) {
      return commonStrokes[char];
    }
    
    // 基于复杂度估算
    switch (complexity) {
      case 'simple': return Math.floor(Math.random() * 3) + 1; // 1-3笔
      case 'medium': return Math.floor(Math.random() * 4) + 4; // 4-7笔
      case 'complex': return Math.floor(Math.random() * 6) + 8; // 8-13笔
      default: return 5;
    }
  }

  /**
   * 获取字符复杂度
   */
  getCharComplexity(char) {
    const code = char.charCodeAt(0);
    
    // 基本汉字区间判断
    if (code >= 0x4E00 && code <= 0x4E9F) return 'simple';    // 基本汉字前段
    if (code >= 0x4EA0 && code <= 0x4EFF) return 'medium';    // 基本汉字中段
    if (code >= 0x4F00 && code <= 0x9FFF) return 'complex';   // 基本汉字后段
    
    return 'medium';
  }

  /**
   * 生成基础笔画模式
   */
  generateBasicPattern(strokeCount) {
    const patterns = ['horizontal', 'vertical', 'left-diagonal', 'right-diagonal', 'dot', 'curve'];
    const result = [];
    
    for (let i = 0; i < strokeCount; i++) {
      // 根据位置选择合适的笔画类型
      if (i === 0) {
        // 第一笔通常是横或竖
        result.push(Math.random() > 0.5 ? 'horizontal' : 'vertical');
      } else if (i === strokeCount - 1 && strokeCount > 3) {
        // 最后一笔可能是点或收尾笔画
        result.push(Math.random() > 0.7 ? 'dot' : 'horizontal');
      } else {
        // 中间笔画随机选择
        result.push(patterns[Math.floor(Math.random() * patterns.length)]);
      }
    }
    
    return result;
  }

  /**
   * 分析字符结构
   */
  analyzeStructure(char) {
    // 基于字符特征的简单结构分析
    const structures = ['single', 'left-right', 'top-bottom', 'surround', 'complex'];
    
    // 一些启发式规则
    const code = char.charCodeAt(0);
    const index = code % structures.length;
    
    return structures[index];
  }

  /**
   * 估算几何特征
   */
  estimateGeometry(char, strokeCount) {
    const ratios = ['wide', 'tall', 'square'];
    const widths = ['narrow', 'medium', 'wide'];
    const heights = ['short', 'medium', 'tall'];
    
    // 基于笔画数的几何特征估算
    let ratio, width, height;
    
    if (strokeCount <= 3) {
      ratio = 'wide';
      width = 'medium';
      height = 'short';
    } else if (strokeCount <= 6) {
      ratio = 'square';
      width = 'medium';
      height = 'medium';
    } else {
      ratio = Math.random() > 0.5 ? 'tall' : 'wide';
      width = 'wide';
      height = 'tall';
    }
    
    return { ratio, width, height };
  }

  /**
   * 估算难度
   */
  estimateDifficulty(strokeCount) {
    if (strokeCount <= 3) return 'easy';
    if (strokeCount <= 7) return 'medium';
    return 'hard';
  }

  /**
   * 学习用户手写数据
   * @param {String} char 字符
   * @param {Object} userFeatures 用户手写特征
   * @param {Boolean} isCorrect 识别是否正确
   */
  learnFromUser(char, userFeatures, isCorrect) {
    if (!this.learningData.has(char)) {
      this.learningData.set(char, {
        samples: [],
        correctCount: 0,
        totalCount: 0
      });
    }
    
    const data = this.learningData.get(char);
    data.samples.push({
      features: userFeatures,
      isCorrect,
      timestamp: Date.now()
    });
    data.totalCount++;
    if (isCorrect) data.correctCount++;
    
    // 如果样本足够多，更新特征定义
    if (data.samples.length >= 5) {
      this.updateFeatureFromLearning(char);
    }
  }

  /**
   * 从学习数据更新特征
   */
  updateFeatureFromLearning(char) {
    const data = this.learningData.get(char);
    if (!data || data.samples.length < 3) return;
    
    // 分析正确识别的样本
    const correctSamples = data.samples.filter(s => s.isCorrect);
    if (correctSamples.length === 0) return;
    
    // 统计特征
    const featureStats = this.analyzeFeatureStatistics(correctSamples);
    
    // 更新字符特征
    if (this.features[char]) {
      this.features[char] = {
        ...this.features[char],
        learnedFeatures: featureStats,
        accuracy: data.correctCount / data.totalCount,
        lastUpdated: Date.now()
      };
      
      console.log(`已更新字符 "${char}" 的特征，准确率: ${(data.correctCount / data.totalCount * 100).toFixed(1)}%`);
    }
  }

  /**
   * 分析特征统计
   */
  analyzeFeatureStatistics(samples) {
    const stats = {
      avgStrokeCount: 0,
      commonPatterns: [],
      avgAspectRatio: 0,
      dominantDirection: 'none'
    };
    
    // 计算平均值
    let totalStrokes = 0;
    let totalRatio = 0;
    const patternCounts = {};
    const directionCounts = {};
    
    samples.forEach(sample => {
      const features = sample.features;
      totalStrokes += features.strokeCount || 0;
      totalRatio += features.aspectRatio || 1;
      
      // 统计模式
      if (features.patterns) {
        features.patterns.forEach(pattern => {
          patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
        });
      }
      
      // 统计方向
      if (features.directions) {
        features.directions.forEach(direction => {
          directionCounts[direction] = (directionCounts[direction] || 0) + 1;
        });
      }
    });
    
    stats.avgStrokeCount = Math.round(totalStrokes / samples.length);
    stats.avgAspectRatio = totalRatio / samples.length;
    
    // 找出最常见的模式
    stats.commonPatterns = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pattern]) => pattern);
    
    // 找出主导方向
    const maxDirection = Object.entries(directionCounts)
      .sort((a, b) => b[1] - a[1])[0];
    if (maxDirection) {
      stats.dominantDirection = maxDirection[0];
    }
    
    return stats;
  }

  /**
   * 导出特征数据
   */
  exportFeatures() {
    return {
      features: this.features,
      learningData: Object.fromEntries(this.learningData),
      exportTime: Date.now()
    };
  }

  /**
   * 导入学习数据
   */
  importLearningData(data) {
    if (data.features) {
      this.features = { ...this.features, ...data.features };
    }
    if (data.learningData) {
      Object.entries(data.learningData).forEach(([char, charData]) => {
        this.learningData.set(char, charData);
      });
    }
    console.log('学习数据导入完成');
  }

  /**
   * 获取字符特征
   */
  getCharacterFeature(char) {
    return this.features[char] || null;
  }

  /**
   * 获取所有特征
   */
  getAllFeatures() {
    return this.features;
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const totalChars = Object.keys(this.features).length;
    const learnedChars = this.learningData.size;
    const avgAccuracy = Array.from(this.learningData.values())
      .reduce((sum, data) => sum + (data.correctCount / data.totalCount), 0) / learnedChars || 0;
    
    return {
      totalCharacters: totalChars,
      learnedCharacters: learnedChars,
      averageAccuracy: avgAccuracy,
      lastUpdate: Date.now()
    };
  }
}

// 导出单例
const featureManager = new FeatureManager();

module.exports = featureManager; 