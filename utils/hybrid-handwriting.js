// utils/hybrid-handwriting.js - 混合手写识别器

/**
 * 混合手写识别器
 * 结合API识别、改进本地识别和简化识别，提供最佳识别效果
 */
class HybridHandwritingRecognizer {
  constructor() {
    // 加载各种识别器
    this.apiRecognizer = require('./api-handwriting.js');
    this.advancedRecognizer = require('./advanced-handwriting.js');
    this.simpleRecognizer = require('./simple-handwriting.js');
    
    // 识别器配置
    this.config = {
      useAPI: true,           // 是否使用API识别
      useAdvanced: true,      // 是否使用改进本地识别
      useSimple: true,        // 是否使用简化识别
      
      // 权重配置
      apiWeight: 0.5,         // API识别权重
      advancedWeight: 0.3,    // 改进识别权重
      simpleWeight: 0.2,      // 简化识别权重
      
      // 阈值配置
      confidenceThreshold: 0.6,  // 置信度阈值
      consensusThreshold: 2      // 一致性阈值（至少2个识别器同意）
    };
    
    // 统计信息
    this.stats = {
      totalRecognitions: 0,
      apiSuccesses: 0,
      advancedSuccesses: 0,
      simpleSuccesses: 0,
      consensusSuccesses: 0
    };
  }

  /**
   * 初始化混合识别器
   */
  initialize(wordBank) {
    console.log('初始化混合识别器...');
    
    if (this.config.useAPI) {
      this.apiRecognizer.initialize(wordBank);
    }
    
    if (this.config.useAdvanced) {
      this.advancedRecognizer.initialize(wordBank);
    }
    
    if (this.config.useSimple) {
      this.simpleRecognizer.initialize(wordBank);
    }
    
    console.log('混合识别器初始化完成');
  }

  /**
   * 主识别方法
   */
  async recognize(strokes, possibleChars = []) {
    if (!strokes || strokes.length === 0) {
      return '';
    }

    this.stats.totalRecognitions++;
    console.log('混合识别开始，笔画数:', strokes.length);

    // 并行执行多种识别
    const recognitionPromises = [];
    
    // 1. API识别（如果启用）
    if (this.config.useAPI) {
      recognitionPromises.push(
        this.safeRecognize('API', () => this.apiRecognizer.recognize(strokes, possibleChars))
      );
    }
    
    // 2. 改进本地识别（如果启用）
    if (this.config.useAdvanced) {
      recognitionPromises.push(
        this.safeRecognize('Advanced', () => this.advancedRecognizer.recognize(strokes, possibleChars))
      );
    }
    
    // 3. 简化识别（如果启用）
    if (this.config.useSimple) {
      recognitionPromises.push(
        this.safeRecognize('Simple', () => this.simpleRecognizer.recognize(strokes, possibleChars))
      );
    }

    // 等待所有识别完成
    const results = await Promise.all(recognitionPromises);
    console.log('各识别器结果:', results);

    // 融合结果
    const finalResult = this.fuseResults(results, possibleChars);
    console.log('融合结果:', finalResult);

    return finalResult;
  }

  /**
   * 安全识别包装器
   */
  async safeRecognize(recognizerName, recognizeFunc) {
    try {
      const startTime = Date.now();
      const result = await recognizeFunc();
      const duration = Date.now() - startTime;
      
      return {
        recognizer: recognizerName,
        result: result || '',
        confidence: this.calculateConfidence(recognizerName, result),
        duration: duration,
        success: !!result
      };
    } catch (error) {
      console.warn(`${recognizerName}识别失败:`, error.message);
      return {
        recognizer: recognizerName,
        result: '',
        confidence: 0,
        duration: 0,
        success: false
      };
    }
  }

  /**
   * 结果融合
   */
  fuseResults(results, possibleChars) {
    // 过滤有效结果
    const validResults = results.filter(r => r.success && r.result);
    
    if (validResults.length === 0) {
      return this.fallbackRecognition(possibleChars);
    }

    // 1. 一致性检查
    const consensusResult = this.checkConsensus(validResults);
    if (consensusResult) {
      this.stats.consensusSuccesses++;
      console.log('一致性识别成功:', consensusResult);
      return consensusResult;
    }

    // 2. 加权投票
    const weightedResult = this.weightedVoting(validResults, possibleChars);
    if (weightedResult) {
      console.log('加权投票结果:', weightedResult);
      return weightedResult;
    }

    // 3. 优先级选择
    const priorityResult = this.prioritySelection(validResults, possibleChars);
    console.log('优先级选择结果:', priorityResult);
    
    return priorityResult;
  }

  /**
   * 一致性检查
   */
  checkConsensus(results) {
    // 统计每个结果的出现次数
    const resultCounts = {};
    
    results.forEach(r => {
      if (r.result) {
        resultCounts[r.result] = (resultCounts[r.result] || 0) + 1;
      }
    });

    // 查找达到一致性阈值的结果
    for (const [result, count] of Object.entries(resultCounts)) {
      if (count >= this.config.consensusThreshold) {
        return result;
      }
    }

    return null;
  }

  /**
   * 加权投票
   */
  weightedVoting(results, possibleChars) {
    const scores = {};

    results.forEach(r => {
      if (!r.result) return;

      const weight = this.getRecognizerWeight(r.recognizer);
      const confidence = r.confidence;
      const score = weight * confidence;

      scores[r.result] = (scores[r.result] || 0) + score;
    });

    // 如果有可能字符限制，优先考虑
    if (possibleChars.length > 0) {
      const filteredScores = {};
      for (const [result, score] of Object.entries(scores)) {
        if (possibleChars.includes(result)) {
          filteredScores[result] = score * 1.2; // 给予额外权重
        }
      }
      
      if (Object.keys(filteredScores).length > 0) {
        const bestResult = Object.keys(filteredScores).reduce((a, b) => 
          filteredScores[a] > filteredScores[b] ? a : b
        );
        
        if (filteredScores[bestResult] > this.config.confidenceThreshold) {
          return bestResult;
        }
      }
    }

    // 选择得分最高的结果
    if (Object.keys(scores).length > 0) {
      const bestResult = Object.keys(scores).reduce((a, b) => 
        scores[a] > scores[b] ? a : b
      );
      
      if (scores[bestResult] > this.config.confidenceThreshold) {
        return bestResult;
      }
    }

    return null;
  }

  /**
   * 优先级选择
   */
  prioritySelection(results, possibleChars) {
    // 按优先级排序：API > Advanced > Simple
    const priorities = ['API', 'Advanced', 'Simple'];
    
    for (const priority of priorities) {
      const result = results.find(r => r.recognizer === priority && r.result);
      if (result) {
        // 如果有可能字符限制，检查是否匹配
        if (possibleChars.length > 0 && !possibleChars.includes(result.result)) {
          continue;
        }
        
        // 更新统计
        this.updateStats(result.recognizer);
        return result.result;
      }
    }

    // 如果都不匹配，返回第一个有效结果
    const firstValid = results.find(r => r.result);
    if (firstValid) {
      this.updateStats(firstValid.recognizer);
      return firstValid.result;
    }

    return this.fallbackRecognition(possibleChars);
  }

  /**
   * 计算置信度
   */
  calculateConfidence(recognizerName, result) {
    if (!result) return 0;

    // 基础置信度
    const baseConfidence = {
      'API': 0.9,      // API识别置信度最高
      'Advanced': 0.7, // 改进识别中等
      'Simple': 0.5    // 简化识别较低
    };

    return baseConfidence[recognizerName] || 0.5;
  }

  /**
   * 获取识别器权重
   */
  getRecognizerWeight(recognizerName) {
    const weights = {
      'API': this.config.apiWeight,
      'Advanced': this.config.advancedWeight,
      'Simple': this.config.simpleWeight
    };

    return weights[recognizerName] || 0.1;
  }

  /**
   * 更新统计信息
   */
  updateStats(recognizerName) {
    switch (recognizerName) {
      case 'API':
        this.stats.apiSuccesses++;
        break;
      case 'Advanced':
        this.stats.advancedSuccesses++;
        break;
      case 'Simple':
        this.stats.simpleSuccesses++;
        break;
    }
  }

  /**
   * 兜底识别
   */
  fallbackRecognition(possibleChars) {
    if (possibleChars.length > 0) {
      return possibleChars[0];
    }
    
    return '字'; // 默认返回
  }

  /**
   * 学习用户输入
   */
  learnFromResult(recognizedChar, actualChar, userFeatures) {
    // 让所有启用的识别器都学习
    if (this.config.useAPI) {
      this.apiRecognizer.learnFromResult(recognizedChar, actualChar, userFeatures);
    }
    
    if (this.config.useAdvanced) {
      this.advancedRecognizer.learnFromResult(recognizedChar, actualChar, userFeatures);
    }
    
    if (this.config.useSimple) {
      this.simpleRecognizer.learnFromResult(recognizedChar, actualChar, userFeatures);
    }

    console.log(`混合识别器学习: 识别=${recognizedChar}, 实际=${actualChar}`);
  }

  /**
   * 动态调整配置
   */
  adjustConfig(recognizerPerformance) {
    // 根据各识别器的表现动态调整权重
    const total = this.stats.totalRecognitions;
    if (total < 10) return; // 样本太少，不调整

    const apiRate = this.stats.apiSuccesses / total;
    const advancedRate = this.stats.advancedSuccesses / total;
    const simpleRate = this.stats.simpleSuccesses / total;

    // 重新分配权重
    const totalRate = apiRate + advancedRate + simpleRate;
    if (totalRate > 0) {
      this.config.apiWeight = apiRate / totalRate * 0.8; // 保留一定基础权重
      this.config.advancedWeight = advancedRate / totalRate * 0.8;
      this.config.simpleWeight = simpleRate / totalRate * 0.8;
    }

    console.log('动态调整权重:', {
      api: this.config.apiWeight.toFixed(2),
      advanced: this.config.advancedWeight.toFixed(2),
      simple: this.config.simpleWeight.toFixed(2)
    });
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const total = this.stats.totalRecognitions;
    
    return {
      totalRecognitions: total,
      successRates: {
        api: total > 0 ? (this.stats.apiSuccesses / total * 100).toFixed(1) + '%' : '0%',
        advanced: total > 0 ? (this.stats.advancedSuccesses / total * 100).toFixed(1) + '%' : '0%',
        simple: total > 0 ? (this.stats.simpleSuccesses / total * 100).toFixed(1) + '%' : '0%',
        consensus: total > 0 ? (this.stats.consensusSuccesses / total * 100).toFixed(1) + '%' : '0%'
      },
      currentWeights: {
        api: this.config.apiWeight.toFixed(2),
        advanced: this.config.advancedWeight.toFixed(2),
        simple: this.config.simpleWeight.toFixed(2)
      },
      recognizerStats: {
        api: this.apiRecognizer.getStatistics(),
        advanced: this.advancedRecognizer.getStatistics(),
        simple: this.simpleRecognizer.getStatistics()
      }
    };
  }

  /**
   * 设置配置
   */
  setConfig(newConfig) {
    Object.assign(this.config, newConfig);
    console.log('混合识别器配置已更新:', this.config);
  }
}

module.exports = new HybridHandwritingRecognizer(); 