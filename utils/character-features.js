// utils/character-features.js - 汉字特征数据库

/**
 * 汉字特征数据库
 * 包含详细的笔画、结构、几何特征等信息
 */
const characterFeatures = {
  // 基础字符（1-4笔）
  '一': {
    strokes: 1,
    pattern: ['horizontal'],
    structure: 'single',
    geometry: { ratio: 'wide', width: 'long', height: 'short' },
    radicals: ['一'],
    frequency: 'high'
  },
  
  '二': {
    strokes: 2,
    pattern: ['horizontal', 'horizontal'],
    structure: 'stacked',
    geometry: { ratio: 'wide', width: 'medium', height: 'short' },
    radicals: ['二'],
    frequency: 'high'
  },
  
  '三': {
    strokes: 3,
    pattern: ['horizontal', 'horizontal', 'horizontal'],
    structure: 'stacked',
    geometry: { ratio: 'wide', width: 'medium', height: 'medium' },
    radicals: ['三'],
    frequency: 'high'
  },
  
  '十': {
    strokes: 2,
    pattern: ['horizontal', 'vertical'],
    structure: 'cross',
    geometry: { ratio: 'square', width: 'medium', height: 'medium' },
    radicals: ['十'],
    frequency: 'high'
  },
  
  '人': {
    strokes: 2,
    pattern: ['left-diagonal', 'right-diagonal'],
    structure: 'spread',
    geometry: { ratio: 'tall', width: 'medium', height: 'medium' },
    radicals: ['人'],
    frequency: 'high'
  },
  
  '大': {
    strokes: 3,
    pattern: ['horizontal', 'left-diagonal', 'right-diagonal'],
    structure: 'spread',
    geometry: { ratio: 'square', width: 'wide', height: 'medium' },
    radicals: ['大'],
    frequency: 'high'
  },
  
  '小': {
    strokes: 3,
    pattern: ['vertical', 'left-dot', 'right-dot'],
    structure: 'centered',
    geometry: { ratio: 'tall', width: 'narrow', height: 'medium' },
    radicals: ['小'],
    frequency: 'high'
  },
  
  '王': {
    strokes: 4,
    pattern: ['horizontal', 'horizontal', 'vertical', 'horizontal'],
    structure: 'grid',
    geometry: { ratio: 'square', width: 'medium', height: 'medium' },
    radicals: ['王'],
    frequency: 'high'
  },
  
  '木': {
    strokes: 4,
    pattern: ['horizontal', 'vertical', 'left-diagonal', 'right-diagonal'],
    structure: 'tree',
    geometry: { ratio: 'square', width: 'medium', height: 'medium' },
    radicals: ['木'],
    frequency: 'high'
  },
  
  // 常用复杂字符（5+笔）
  '写': {
    strokes: 5,
    pattern: ['vertical', 'horizontal', 'vertical', 'horizontal', 'vertical'],
    structure: 'top-bottom',
    geometry: { 
      ratio: 'tall', 
      width: 'medium', 
      height: 'tall',
      topPart: 'narrow',
      bottomPart: 'wide'
    },
    radicals: ['冖', '与'],
    components: ['宀', '与'],
    features: {
      hasVerticalDominant: true,
      hasHorizontalLines: true,
      symmetrical: false,
      enclosed: false
    },
    frequency: 'high',
    difficulty: 'medium'
  },
  
  '冬': {
    strokes: 5,
    pattern: ['left-diagonal', 'horizontal-curve', 'vertical', 'dot', 'dot'],
    structure: 'complex',
    geometry: { 
      ratio: 'square', 
      width: 'medium', 
      height: 'medium',
      centerHeavy: true
    },
    radicals: ['冫', '夂'],
    components: ['冫', '夂'],
    features: {
      hasDots: true,
      hasVertical: true,
      hasCurve: true,
      symmetrical: false,
      enclosed: false
    },
    frequency: 'medium',
    difficulty: 'medium'
  },
  
  '春': {
    strokes: 9,
    pattern: ['horizontal', 'horizontal', 'horizontal', 'vertical', 'horizontal', 'vertical', 'left-diagonal', 'right-diagonal', 'vertical'],
    structure: 'top-bottom',
    geometry: { 
      ratio: 'wide', 
      width: 'wide', 
      height: 'tall',
      topPart: 'complex',
      bottomPart: 'simple'
    },
    radicals: ['三', '人', '日'],
    components: ['三', '人', '日'],
    features: {
      hasHorizontalDominant: true,
      hasVertical: true,
      complex: true,
      symmetrical: false,
      enclosed: true
    },
    frequency: 'high',
    difficulty: 'hard'
  },
  
  '花': {
    strokes: 7,
    pattern: ['horizontal', 'vertical', 'left-diagonal', 'right-diagonal', 'horizontal', 'vertical', 'horizontal'],
    structure: 'left-right',
    geometry: { 
      ratio: 'wide', 
      width: 'wide', 
      height: 'medium',
      leftPart: 'narrow',
      rightPart: 'wide'
    },
    radicals: ['艹', '化'],
    components: ['艹', '化'],
    features: {
      hasHorizontal: true,
      hasVertical: true,
      hasDiagonal: true,
      symmetrical: false,
      enclosed: false
    },
    frequency: 'high',
    difficulty: 'medium'
  },
  
  '古': {
    strokes: 5,
    pattern: ['horizontal', 'vertical', 'horizontal', 'vertical', 'horizontal'],
    structure: 'grid',
    geometry: { 
      ratio: 'square', 
      width: 'medium', 
      height: 'medium',
      balanced: true
    },
    radicals: ['十', '口'],
    components: ['十', '口'],
    features: {
      hasVertical: true,
      hasHorizontal: true,
      regular: true,
      symmetrical: true,
      enclosed: true
    },
    frequency: 'medium',
    difficulty: 'easy'
  },
  
  '青': {
    strokes: 8,
    pattern: ['horizontal', 'horizontal', 'vertical', 'horizontal', 'vertical', 'horizontal', 'vertical', 'horizontal'],
    structure: 'top-bottom',
    geometry: { 
      ratio: 'tall', 
      width: 'medium', 
      height: 'tall',
      topPart: 'simple',
      bottomPart: 'complex'
    },
    radicals: ['青'],
    components: ['青'],
    features: {
      hasHorizontalDominant: true,
      hasVertical: true,
      regular: true,
      symmetrical: true,
      enclosed: true
    },
    frequency: 'medium',
    difficulty: 'hard'
  }
};

/**
 * 特征分析工具
 */
class FeatureAnalyzer {
  /**
   * 分析笔画特征
   */
  static analyzeStrokeFeatures(patterns) {
    const features = {
      verticalCount: 0,
      horizontalCount: 0,
      diagonalCount: 0,
      dotCount: 0,
      curveCount: 0,
      dominantDirection: 'none',
      complexity: 'simple'
    };
    
    patterns.forEach(pattern => {
      switch (pattern) {
        case 'vertical':
        case 'up':
        case 'down':
          features.verticalCount++;
          break;
        case 'horizontal':
        case 'left':
        case 'right':
          features.horizontalCount++;
          break;
        case 'left-diagonal':
        case 'right-diagonal':
        case 'left-up-diagonal':
        case 'right-up-diagonal':
          features.diagonalCount++;
          break;
        case 'dot':
          features.dotCount++;
          break;
        case 'curve':
        case 'horizontal-curve':
          features.curveCount++;
          break;
      }
    });
    
    // 判断主导方向
    if (features.verticalCount > features.horizontalCount && features.verticalCount > features.diagonalCount) {
      features.dominantDirection = 'vertical';
    } else if (features.horizontalCount > features.verticalCount && features.horizontalCount > features.diagonalCount) {
      features.dominantDirection = 'horizontal';
    } else if (features.diagonalCount > 0) {
      features.dominantDirection = 'diagonal';
    }
    
    // 判断复杂度
    const totalStrokes = patterns.length;
    if (totalStrokes <= 3) {
      features.complexity = 'simple';
    } else if (totalStrokes <= 6) {
      features.complexity = 'medium';
    } else {
      features.complexity = 'complex';
    }
    
    return features;
  }
  
  /**
   * 计算几何特征匹配度
   */
  static calculateGeometryMatch(userGeometry, templateGeometry) {
    let score = 0;
    let totalChecks = 0;
    
    // 比较长宽比
    if (userGeometry.ratio && templateGeometry.ratio) {
      score += userGeometry.ratio === templateGeometry.ratio ? 1 : 0;
      totalChecks++;
    }
    
    // 比较宽度
    if (userGeometry.width && templateGeometry.width) {
      score += userGeometry.width === templateGeometry.width ? 1 : 0;
      totalChecks++;
    }
    
    // 比较高度
    if (userGeometry.height && templateGeometry.height) {
      score += userGeometry.height === templateGeometry.height ? 1 : 0;
      totalChecks++;
    }
    
    return totalChecks > 0 ? score / totalChecks : 0;
  }
  
  /**
   * 计算特征匹配度
   */
  static calculateFeatureMatch(userFeatures, templateFeatures) {
    let score = 0;
    let totalChecks = 0;
    
    const featureKeys = ['hasVerticalDominant', 'hasHorizontalDominant', 'hasDots', 'hasVertical', 'hasHorizontal', 'hasCurve', 'hasDiagonal'];
    
    featureKeys.forEach(key => {
      if (templateFeatures[key] !== undefined) {
        const userHas = userFeatures[key] || false;
        const templateHas = templateFeatures[key] || false;
        score += userHas === templateHas ? 1 : 0;
        totalChecks++;
      }
    });
    
    return totalChecks > 0 ? score / totalChecks : 0;
  }
}

module.exports = {
  characterFeatures,
  FeatureAnalyzer
}; 