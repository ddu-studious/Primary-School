// utils/simple-handwriting.js - 简化手写识别

/**
 * 简化手写识别器
 * 基于实际可行的特征进行识别，提高准确率
 */
class SimpleHandwritingRecognizer {
  constructor() {
    // 简化的字符数据库，只包含最基本和最可靠的特征
    this.charDatabase = {
      // 1-2笔简单字符
      '一': { strokes: 1, type: 'horizontal-line' },
      '二': { strokes: 2, type: 'double-horizontal' },
      '三': { strokes: 3, type: 'triple-horizontal' },
      '十': { strokes: 2, type: 'cross' },
      '人': { strokes: 2, type: 'v-shape' },
      '入': { strokes: 2, type: 'v-shape' },
      '八': { strokes: 2, type: 'spread' },
      
      // 3-4笔中等字符
      '大': { strokes: 3, type: 'spread-with-top' },
      '小': { strokes: 3, type: 'vertical-with-dots' },
      '上': { strokes: 3, type: 'vertical-horizontal' },
      '下': { strokes: 3, type: 'horizontal-vertical' },
      '中': { strokes: 4, type: 'vertical-box' },
      '王': { strokes: 4, type: 'horizontal-grid' },
      '木': { strokes: 4, type: 'tree-shape' },
      '日': { strokes: 4, type: 'rectangle' },
      '月': { strokes: 4, type: 'curved-rectangle' },
      
      // 5笔字符
      '古': { strokes: 5, type: 'box-with-horizontal' },
      '写': { strokes: 5, type: 'top-bottom-structure' },
      '冬': { strokes: 5, type: 'complex-with-dots' },
      '什': { strokes: 4, type: 'left-right-structure' },
      
      // 常用字符
      '春': { strokes: 9, type: 'complex-horizontal' },
      '花': { strokes: 7, type: 'complex-mixed' },
      '青': { strokes: 8, type: 'complex-vertical' },
      '红': { strokes: 6, type: 'complex-mixed' }
    };
  }

  /**
   * 识别手写汉字
   */
  recognize(strokes, possibleChars = []) {
    if (!strokes || strokes.length === 0) {
      return '';
    }

    console.log('简化识别 - 笔画数:', strokes.length);

    // 1. 基于笔画数的粗筛选
    const strokeCount = strokes.length;
    let candidates = this.getCandidatesByStrokeCount(strokeCount, possibleChars);
    
    console.log('笔画数候选:', candidates);

    if (candidates.length === 0) {
      return this.fallbackByStrokeCount(strokeCount, possibleChars);
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    // 2. 基于几何特征的细筛选
    const geometry = this.analyzeGeometry(strokes);
    console.log('几何特征:', geometry);

    const result = this.matchByGeometry(candidates, geometry);
    console.log('几何匹配结果:', result);

    return result || candidates[0];
  }

  /**
   * 根据笔画数获取候选字符
   */
  getCandidatesByStrokeCount(strokeCount, possibleChars) {
    const candidates = [];

    // 精确匹配
    for (const [char, data] of Object.entries(this.charDatabase)) {
      if (data.strokes === strokeCount) {
        if (possibleChars.length === 0 || possibleChars.includes(char)) {
          candidates.push(char);
        }
      }
    }

    // 如果精确匹配没有结果，允许±1笔画的误差
    if (candidates.length === 0) {
      for (const [char, data] of Object.entries(this.charDatabase)) {
        if (Math.abs(data.strokes - strokeCount) === 1) {
          if (possibleChars.length === 0 || possibleChars.includes(char)) {
            candidates.push(char);
          }
        }
      }
    }

    return candidates;
  }

  /**
   * 分析几何特征
   */
  analyzeGeometry(strokes) {
    let allPoints = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    // 收集所有点
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

    // 分析笔画分布
    const distribution = this.analyzeStrokeDistribution(strokes, { minX, minY, maxX, maxY });

    return {
      width,
      height,
      aspectRatio,
      shape: this.classifyShape(aspectRatio),
      distribution
    };
  }

  /**
   * 分析笔画分布
   */
  analyzeStrokeDistribution(strokes, bounds) {
    const { minX, minY, maxX, maxY } = bounds;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    let topStrokes = 0, bottomStrokes = 0, leftStrokes = 0, rightStrokes = 0;
    let verticalStrokes = 0, horizontalStrokes = 0;

    strokes.forEach(stroke => {
      if (stroke.length < 2) return;

      const start = stroke[0];
      const end = stroke[stroke.length - 1];
      const strokeCenterX = (start.x + end.x) / 2;
      const strokeCenterY = (start.y + end.y) / 2;

      // 位置分布
      if (strokeCenterY < centerY) topStrokes++;
      else bottomStrokes++;
      
      if (strokeCenterX < centerX) leftStrokes++;
      else rightStrokes++;

      // 方向分析
      const dx = Math.abs(end.x - start.x);
      const dy = Math.abs(end.y - start.y);
      
      if (dy > dx * 1.5) verticalStrokes++;
      else if (dx > dy * 1.5) horizontalStrokes++;
    });

    return {
      topHeavy: topStrokes > bottomStrokes,
      leftHeavy: leftStrokes > rightStrokes,
      hasVertical: verticalStrokes > 0,
      hasHorizontal: horizontalStrokes > 0,
      verticalDominant: verticalStrokes > horizontalStrokes
    };
  }

  /**
   * 分类形状
   */
  classifyShape(aspectRatio) {
    if (aspectRatio > 1.4) return 'wide';
    if (aspectRatio < 0.7) return 'tall';
    return 'square';
  }

  /**
   * 基于几何特征匹配
   */
  matchByGeometry(candidates, geometry) {
    // 特殊规则匹配
    const rules = {
      // 4笔字符的区分规则
      4: {
        '中': (geo) => geo.shape === 'tall' && geo.distribution.hasVertical && geo.distribution.hasHorizontal,
        '什': (geo) => geo.shape === 'square' && geo.distribution.leftHeavy,
        '王': (geo) => geo.shape === 'square' && geo.distribution.hasHorizontal && !geo.distribution.verticalDominant,
        '木': (geo) => geo.shape === 'square' && geo.distribution.hasVertical && geo.distribution.hasHorizontal,
        '日': (geo) => geo.shape === 'square' && geo.aspectRatio > 0.8 && geo.aspectRatio < 1.2,
        '月': (geo) => geo.shape === 'tall' && geo.aspectRatio < 0.8
      },
      
      // 5笔字符的区分规则
      5: {
        '写': (geo) => geo.shape === 'tall' && geo.distribution.topHeavy,
        '冬': (geo) => geo.shape === 'square' && !geo.distribution.topHeavy,
        '古': (geo) => geo.shape === 'square' && geo.distribution.hasHorizontal
      }
    };

    const strokeCount = geometry.distribution.hasVertical + geometry.distribution.hasHorizontal; // 简化计算
    const applicableRules = rules[candidates[0] ? this.charDatabase[candidates[0]].strokes : 0];

    if (applicableRules) {
      for (const candidate of candidates) {
        const rule = applicableRules[candidate];
        if (rule && rule(geometry)) {
          console.log(`规则匹配成功: ${candidate}`);
          return candidate;
        }
      }
    }

    // 如果没有规则匹配，使用简单的形状匹配
    return this.simpleShapeMatch(candidates, geometry);
  }

  /**
   * 简单形状匹配
   */
  simpleShapeMatch(candidates, geometry) {
    // 基于形状的简单匹配
    const shapePreferences = {
      'tall': ['中', '写', '青', '月'],
      'wide': ['一', '二', '三', '春', '花'],
      'square': ['十', '王', '木', '日', '古', '冬', '什']
    };

    const preferred = shapePreferences[geometry.shape] || [];
    
    for (const char of preferred) {
      if (candidates.includes(char)) {
        return char;
      }
    }

    return candidates[0];
  }

  /**
   * 笔画数兜底
   */
  fallbackByStrokeCount(strokeCount, possibleChars) {
    const fallbackMap = {
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

    const fallback = fallbackMap[strokeCount] || '字';
    
    if (possibleChars.length === 0 || possibleChars.includes(fallback)) {
      return fallback;
    }

    return possibleChars[0] || fallback;
  }

  /**
   * 初始化方法（兼容性）
   */
  initialize(wordBank) {
    console.log('简化识别器已初始化，支持字符数:', Object.keys(this.charDatabase).length);
  }

  /**
   * 学习方法（兼容性）
   */
  learnFromResult(recognizedChar, actualChar, userFeatures) {
    console.log(`学习记录: 识别=${recognizedChar}, 实际=${actualChar}, 正确=${recognizedChar === actualChar}`);
  }

  /**
   * 获取统计信息（兼容性）
   */
  getStatistics() {
    return {
      totalCharacters: Object.keys(this.charDatabase).length,
      learnedCharacters: 0,
      averageAccuracy: 0,
      lastUpdate: Date.now()
    };
  }
}

// 导出单例
const simpleHandwritingRecognizer = new SimpleHandwritingRecognizer();

module.exports = simpleHandwritingRecognizer; 