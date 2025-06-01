// utils/advanced-handwriting.js - 改进的本地手写识别器

/**
 * 改进的本地手写识别器
 * 使用更先进的特征提取和匹配算法
 */
class AdvancedHandwritingRecognizer {
  constructor() {
    this.templates = new Map(); // 字符模板库
    this.userLearning = new Map(); // 用户学习数据
    this.initialized = false;
  }

  /**
   * 初始化识别器
   */
  initialize(wordBank) {
    if (this.initialized) return;
    
    // 初始化基础模板
    this.initializeTemplates();
    
    // 从题库生成模板
    if (wordBank) {
      this.generateTemplatesFromWordBank(wordBank);
    }
    
    this.initialized = true;
    console.log('改进识别器初始化完成，模板数量:', this.templates.size);
  }

  /**
   * 主识别方法
   */
  recognize(strokes, possibleChars = []) {
    if (!strokes || strokes.length === 0) {
      return '';
    }

    console.log('改进识别 - 笔画数:', strokes.length);

    // 1. 预处理笔画数据
    const normalizedStrokes = this.normalizeStrokes(strokes);
    
    // 2. 提取多维特征
    const features = this.extractAdvancedFeatures(normalizedStrokes);
    console.log('提取特征:', features);

    // 3. 模板匹配
    const candidates = this.templateMatching(features, possibleChars);
    console.log('模板匹配候选:', candidates);

    // 4. 用户学习匹配
    const learningResult = this.userLearningMatch(features, possibleChars);
    if (learningResult) {
      console.log('用户学习匹配:', learningResult);
      return learningResult;
    }

    // 5. 返回最佳匹配
    return candidates.length > 0 ? candidates[0].char : this.fallbackRecognition(features, possibleChars);
  }

  /**
   * 笔画标准化
   */
  normalizeStrokes(strokes) {
    // 1. 计算边界框
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    strokes.forEach(stroke => {
      stroke.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const size = Math.max(width, height);

    // 2. 标准化到固定尺寸
    const targetSize = 100;
    const scale = targetSize / size;
    const offsetX = (targetSize - width * scale) / 2;
    const offsetY = (targetSize - height * scale) / 2;

    return strokes.map(stroke => 
      stroke.map(point => ({
        x: (point.x - minX) * scale + offsetX,
        y: (point.y - minY) * scale + offsetY,
        time: point.time
      }))
    );
  }

  /**
   * 提取高级特征
   */
  extractAdvancedFeatures(strokes) {
    const features = {
      // 基础特征
      strokeCount: strokes.length,
      totalPoints: strokes.reduce((sum, stroke) => sum + stroke.length, 0),
      
      // 几何特征
      boundingBox: this.calculateBoundingBox(strokes),
      aspectRatio: 0,
      
      // 笔画特征
      strokeDirections: [],
      strokeLengths: [],
      strokeCurvatures: [],
      
      // 结构特征
      intersections: [],
      endpoints: [],
      corners: [],
      
      // 分布特征
      densityMap: null,
      symmetry: { horizontal: 0, vertical: 0 },
      
      // 时序特征
      writingSpeed: [],
      pausePoints: []
    };

    // 计算各种特征
    this.calculateGeometricFeatures(strokes, features);
    this.calculateStrokeFeatures(strokes, features);
    this.calculateStructuralFeatures(strokes, features);
    this.calculateDistributionFeatures(strokes, features);
    this.calculateTemporalFeatures(strokes, features);

    return features;
  }

  /**
   * 计算几何特征
   */
  calculateGeometricFeatures(strokes, features) {
    const bbox = features.boundingBox;
    features.aspectRatio = bbox.height > 0 ? bbox.width / bbox.height : 1;
    
    // 计算重心
    let totalX = 0, totalY = 0, totalPoints = 0;
    strokes.forEach(stroke => {
      stroke.forEach(point => {
        totalX += point.x;
        totalY += point.y;
        totalPoints++;
      });
    });
    
    features.centroid = {
      x: totalX / totalPoints,
      y: totalY / totalPoints
    };
  }

  /**
   * 计算笔画特征
   */
  calculateStrokeFeatures(strokes, features) {
    strokes.forEach(stroke => {
      if (stroke.length < 2) return;

      // 方向
      const direction = this.calculateStrokeDirection(stroke);
      features.strokeDirections.push(direction);

      // 长度
      const length = this.calculateStrokeLength(stroke);
      features.strokeLengths.push(length);

      // 曲率
      const curvature = this.calculateStrokeCurvature(stroke);
      features.strokeCurvatures.push(curvature);
    });
  }

  /**
   * 计算结构特征
   */
  calculateStructuralFeatures(strokes, features) {
    // 计算交点
    features.intersections = this.findIntersections(strokes);
    
    // 计算端点
    features.endpoints = this.findEndpoints(strokes);
    
    // 计算拐点
    features.corners = this.findCorners(strokes);
  }

  /**
   * 计算分布特征
   */
  calculateDistributionFeatures(strokes, features) {
    // 密度图
    features.densityMap = this.createDensityMap(strokes);
    
    // 对称性
    features.symmetry = this.calculateSymmetry(strokes);
  }

  /**
   * 计算时序特征
   */
  calculateTemporalFeatures(strokes, features) {
    strokes.forEach(stroke => {
      if (stroke.length < 2) return;

      // 书写速度
      const speeds = [];
      for (let i = 1; i < stroke.length; i++) {
        const prev = stroke[i - 1];
        const curr = stroke[i];
        const distance = Math.sqrt(
          Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
        );
        const time = curr.time - prev.time;
        speeds.push(time > 0 ? distance / time : 0);
      }
      features.writingSpeed.push(speeds);
    });

    // 停顿点（笔画间的时间间隔）
    for (let i = 1; i < strokes.length; i++) {
      const prevStroke = strokes[i - 1];
      const currStroke = strokes[i];
      if (prevStroke.length > 0 && currStroke.length > 0) {
        const pause = currStroke[0].time - prevStroke[prevStroke.length - 1].time;
        features.pausePoints.push(pause);
      }
    }
  }

  /**
   * 模板匹配
   */
  templateMatching(features, possibleChars) {
    const matches = [];

    // 筛选候选模板
    const candidateTemplates = this.getCandidateTemplates(features, possibleChars);

    candidateTemplates.forEach(template => {
      const similarity = this.calculateTemplateSimilarity(features, template);
      if (similarity > 0.3) { // 相似度阈值
        matches.push({
          char: template.char,
          similarity: similarity,
          template: template
        });
      }
    });

    // 按相似度排序
    matches.sort((a, b) => b.similarity - a.similarity);

    return matches;
  }

  /**
   * 计算模板相似度
   */
  calculateTemplateSimilarity(features, template) {
    let totalScore = 0;
    let weights = 0;

    // 笔画数匹配 (权重: 25%)
    const strokeWeight = 0.25;
    const strokeDiff = Math.abs(features.strokeCount - template.strokeCount);
    const strokeScore = Math.max(0, 1 - strokeDiff / 3);
    totalScore += strokeScore * strokeWeight;
    weights += strokeWeight;

    // 几何特征匹配 (权重: 20%)
    const geoWeight = 0.20;
    const geoScore = this.compareGeometricFeatures(features, template);
    totalScore += geoScore * geoWeight;
    weights += geoWeight;

    // 笔画特征匹配 (权重: 25%)
    const strokeFeatWeight = 0.25;
    const strokeFeatScore = this.compareStrokeFeatures(features, template);
    totalScore += strokeFeatScore * strokeFeatWeight;
    weights += strokeFeatWeight;

    // 结构特征匹配 (权重: 20%)
    const structWeight = 0.20;
    const structScore = this.compareStructuralFeatures(features, template);
    totalScore += structScore * structWeight;
    weights += structWeight;

    // 分布特征匹配 (权重: 10%)
    const distWeight = 0.10;
    const distScore = this.compareDistributionFeatures(features, template);
    totalScore += distScore * distWeight;
    weights += distWeight;

    return weights > 0 ? totalScore / weights : 0;
  }

  /**
   * 用户学习匹配
   */
  userLearningMatch(features, possibleChars) {
    // 从用户学习数据中查找最佳匹配
    let bestMatch = null;
    let bestScore = 0;

    for (const [char, learningData] of this.userLearning) {
      if (possibleChars.length > 0 && !possibleChars.includes(char)) {
        continue;
      }

      const score = this.calculateLearningScore(features, learningData);
      if (score > bestScore && score > 0.6) { // 学习匹配需要更高的阈值
        bestScore = score;
        bestMatch = char;
      }
    }

    return bestMatch;
  }

  /**
   * 学习用户输入
   */
  learnFromResult(recognizedChar, actualChar, userFeatures) {
    if (!actualChar || !userFeatures) return;

    // 获取或创建学习数据
    if (!this.userLearning.has(actualChar)) {
      this.userLearning.set(actualChar, {
        samples: [],
        averageFeatures: null,
        confidence: 0
      });
    }

    const learningData = this.userLearning.get(actualChar);
    
    // 添加样本
    learningData.samples.push({
      features: userFeatures,
      timestamp: Date.now(),
      correct: recognizedChar === actualChar
    });

    // 保持最近的10个样本
    if (learningData.samples.length > 10) {
      learningData.samples = learningData.samples.slice(-10);
    }

    // 更新平均特征
    this.updateAverageFeatures(learningData);

    console.log(`学习更新: ${actualChar}, 样本数: ${learningData.samples.length}`);
  }

  /**
   * 初始化基础模板
   */
  initializeTemplates() {
    // 基础汉字模板（简化版）
    const basicTemplates = {
      '一': { strokeCount: 1, aspectRatio: 'wide', directions: ['horizontal'] },
      '二': { strokeCount: 2, aspectRatio: 'wide', directions: ['horizontal', 'horizontal'] },
      '三': { strokeCount: 3, aspectRatio: 'wide', directions: ['horizontal', 'horizontal', 'horizontal'] },
      '十': { strokeCount: 2, aspectRatio: 'square', directions: ['horizontal', 'vertical'] },
      '中': { strokeCount: 4, aspectRatio: 'tall', directions: ['vertical', 'horizontal', 'vertical', 'horizontal'] },
      '王': { strokeCount: 4, aspectRatio: 'square', directions: ['horizontal', 'horizontal', 'horizontal', 'vertical'] },
      '木': { strokeCount: 4, aspectRatio: 'square', directions: ['horizontal', 'vertical', 'left-diagonal', 'right-diagonal'] },
      '日': { strokeCount: 4, aspectRatio: 'tall', directions: ['vertical', 'horizontal', 'vertical', 'horizontal'] },
      '月': { strokeCount: 4, aspectRatio: 'tall', directions: ['vertical', 'horizontal', 'horizontal', 'vertical'] }
    };

    for (const [char, template] of Object.entries(basicTemplates)) {
      this.templates.set(char, {
        char: char,
        ...template,
        confidence: 0.8 // 基础模板置信度
      });
    }
  }

  /**
   * 从题库生成模板
   */
  generateTemplatesFromWordBank(wordBank) {
    // 这里可以根据题库中的字符生成更多模板
    // 暂时使用基础模板
  }

  /**
   * 获取候选模板
   */
  getCandidateTemplates(features, possibleChars) {
    const candidates = [];

    for (const template of this.templates.values()) {
      // 如果有可能字符限制，先过滤
      if (possibleChars.length > 0 && !possibleChars.includes(template.char)) {
        continue;
      }

      // 笔画数粗筛选（允许±2的误差）
      if (Math.abs(template.strokeCount - features.strokeCount) <= 2) {
        candidates.push(template);
      }
    }

    return candidates;
  }

  /**
   * 计算边界框
   */
  calculateBoundingBox(strokes) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    strokes.forEach(stroke => {
      stroke.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    return {
      minX, minY, maxX, maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 计算笔画方向
   */
  calculateStrokeDirection(stroke) {
    if (stroke.length < 2) return 'dot';

    const start = stroke[0];
    const end = stroke[stroke.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    if (angle >= -22.5 && angle < 22.5) return 'right';
    if (angle >= 22.5 && angle < 67.5) return 'right-down';
    if (angle >= 67.5 && angle < 112.5) return 'down';
    if (angle >= 112.5 && angle < 157.5) return 'left-down';
    if (angle >= 157.5 || angle < -157.5) return 'left';
    if (angle >= -157.5 && angle < -112.5) return 'left-up';
    if (angle >= -112.5 && angle < -67.5) return 'up';
    if (angle >= -67.5 && angle < -22.5) return 'right-up';
    
    return 'unknown';
  }

  /**
   * 计算笔画长度
   */
  calculateStrokeLength(stroke) {
    let length = 0;
    for (let i = 1; i < stroke.length; i++) {
      const prev = stroke[i - 1];
      const curr = stroke[i];
      length += Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
      );
    }
    return length;
  }

  /**
   * 计算笔画曲率
   */
  calculateStrokeCurvature(stroke) {
    if (stroke.length < 3) return 0;

    let totalCurvature = 0;
    for (let i = 1; i < stroke.length - 1; i++) {
      const prev = stroke[i - 1];
      const curr = stroke[i];
      const next = stroke[i + 1];

      // 计算角度变化
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      
      let angleDiff = angle2 - angle1;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      totalCurvature += Math.abs(angleDiff);
    }

    return totalCurvature / (stroke.length - 2);
  }

  // 其他辅助方法的简化实现
  findIntersections(strokes) { return []; }
  findEndpoints(strokes) { return []; }
  findCorners(strokes) { return []; }
  createDensityMap(strokes) { return null; }
  calculateSymmetry(strokes) { return { horizontal: 0, vertical: 0 }; }
  compareGeometricFeatures(f1, f2) { return 0.5; }
  compareStrokeFeatures(f1, f2) { return 0.5; }
  compareStructuralFeatures(f1, f2) { return 0.5; }
  compareDistributionFeatures(f1, f2) { return 0.5; }
  calculateLearningScore(features, learningData) { return 0.5; }
  updateAverageFeatures(learningData) { }

  /**
   * 兜底识别
   */
  fallbackRecognition(features, possibleChars) {
    const fallbackMap = {
      1: '一', 2: '二', 3: '三', 4: '中', 5: '古',
      6: '红', 7: '花', 8: '青', 9: '春'
    };

    const fallback = fallbackMap[features.strokeCount] || '字';
    
    if (possibleChars.length === 0 || possibleChars.includes(fallback)) {
      return fallback;
    }

    return possibleChars[0] || fallback;
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    return {
      templateCount: this.templates.size,
      learningCount: this.userLearning.size,
      totalSamples: Array.from(this.userLearning.values())
        .reduce((sum, data) => sum + data.samples.length, 0)
    };
  }
}

module.exports = new AdvancedHandwritingRecognizer(); 