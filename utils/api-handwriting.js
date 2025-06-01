// utils/api-handwriting.js - 第三方API手写识别器

/**
 * 第三方API手写识别器
 * 集成多个识别服务，提供高准确率识别
 */
class APIHandwritingRecognizer {
  constructor() {
    this.apiConfigs = {
      // 百度OCR API
      baidu: {
        enabled: true,
        url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting',
        priority: 1
      },
      // 腾讯OCR API
      tencent: {
        enabled: true,
        url: 'https://ocr.tencentcloudapi.com/',
        priority: 2
      },
      // 阿里云OCR API
      aliyun: {
        enabled: true,
        url: 'https://ocr-api.cn-hangzhou.aliyuncs.com',
        priority: 3
      }
    };
    
    this.fallbackRecognizer = require('./simple-handwriting.js');
  }

  /**
   * 主识别入口
   */
  async recognize(strokes, possibleChars = []) {
    if (!strokes || strokes.length === 0) {
      return '';
    }

    try {
      // 1. 转换笔画为图像
      const imageData = await this.strokesToImage(strokes);
      
      // 2. 尝试API识别
      const apiResult = await this.tryAPIRecognition(imageData, possibleChars);
      
      if (apiResult) {
        console.log('API识别成功:', apiResult);
        return apiResult;
      }
      
      // 3. API失败时使用本地识别
      console.log('API识别失败，使用本地识别');
      return this.fallbackRecognizer.recognize(strokes, possibleChars);
      
    } catch (error) {
      console.error('识别过程出错:', error);
      return this.fallbackRecognizer.recognize(strokes, possibleChars);
    }
  }

  /**
   * 将笔画转换为图像数据
   */
  async strokesToImage(strokes) {
    return new Promise((resolve) => {
      // 创建临时canvas
      const canvas = wx.createOffscreenCanvas({ type: '2d', width: 300, height: 200 });
      const ctx = canvas.getContext('2d');
      
      // 设置背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 300, 200);
      
      // 设置画笔
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 绘制笔画
      strokes.forEach(stroke => {
        if (stroke.length > 0) {
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          
          stroke.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          
          ctx.stroke();
        }
      });
      
      // 转换为base64
      canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: () => {
          resolve(null);
        }
      });
    });
  }

  /**
   * 尝试API识别
   */
  async tryAPIRecognition(imageData, possibleChars) {
    if (!imageData) return null;

    // 按优先级尝试各个API
    const sortedAPIs = Object.entries(this.apiConfigs)
      .filter(([_, config]) => config.enabled)
      .sort((a, b) => a[1].priority - b[1].priority);

    for (const [apiName, config] of sortedAPIs) {
      try {
        console.log(`尝试${apiName}识别...`);
        const result = await this.callAPI(apiName, imageData, possibleChars);
        
        if (result) {
          console.log(`${apiName}识别成功:`, result);
          return result;
        }
      } catch (error) {
        console.warn(`${apiName}识别失败:`, error.message);
        continue;
      }
    }

    return null;
  }

  /**
   * 调用具体API
   */
  async callAPI(apiName, imageData, possibleChars) {
    switch (apiName) {
      case 'baidu':
        return await this.callBaiduAPI(imageData, possibleChars);
      case 'tencent':
        return await this.callTencentAPI(imageData, possibleChars);
      case 'aliyun':
        return await this.callAliyunAPI(imageData, possibleChars);
      default:
        return null;
    }
  }

  /**
   * 百度API调用
   */
  async callBaiduAPI(imageData, possibleChars) {
    // 注意：需要在小程序后台配置域名白名单
    const accessToken = await this.getBaiduAccessToken();
    
    if (!accessToken) {
      throw new Error('获取百度访问令牌失败');
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.apiConfigs.baidu.url}?access_token=${accessToken}`,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          image: imageData.replace(/^data:image\/\w+;base64,/, ''),
          recognize_granularity: 'small'
        },
        success: (res) => {
          if (res.data && res.data.words_result && res.data.words_result.length > 0) {
            const recognizedText = res.data.words_result[0].words;
            const filteredResult = this.filterResult(recognizedText, possibleChars);
            resolve(filteredResult);
          } else {
            resolve(null);
          }
        },
        fail: (error) => {
          reject(new Error(`百度API调用失败: ${error.errMsg}`));
        }
      });
    });
  }

  /**
   * 腾讯API调用
   */
  async callTencentAPI(imageData, possibleChars) {
    // 腾讯云API需要签名，这里简化处理
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.apiConfigs.tencent.url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          Action: 'GeneralHandwritingOCR',
          Version: '2018-11-19',
          Region: 'ap-beijing',
          ImageBase64: imageData.replace(/^data:image\/\w+;base64,/, '')
        },
        success: (res) => {
          if (res.data && res.data.Response && res.data.Response.TextDetections) {
            const detections = res.data.Response.TextDetections;
            if (detections.length > 0) {
              const recognizedText = detections[0].DetectedText;
              const filteredResult = this.filterResult(recognizedText, possibleChars);
              resolve(filteredResult);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        },
        fail: (error) => {
          reject(new Error(`腾讯API调用失败: ${error.errMsg}`));
        }
      });
    });
  }

  /**
   * 阿里云API调用
   */
  async callAliyunAPI(imageData, possibleChars) {
    // 阿里云API实现
    return new Promise((resolve, reject) => {
      // 这里需要实现阿里云的具体调用逻辑
      resolve(null);
    });
  }

  /**
   * 获取百度访问令牌
   */
  async getBaiduAccessToken() {
    // 这里需要配置您的百度API密钥
    const API_KEY = 'YOUR_BAIDU_API_KEY';
    const SECRET_KEY = 'YOUR_BAIDU_SECRET_KEY';
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://aip.baidubce.com/oauth/2.0/token',
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          grant_type: 'client_credentials',
          client_id: API_KEY,
          client_secret: SECRET_KEY
        },
        success: (res) => {
          if (res.data && res.data.access_token) {
            resolve(res.data.access_token);
          } else {
            resolve(null);
          }
        },
        fail: () => {
          resolve(null);
        }
      });
    });
  }

  /**
   * 过滤识别结果
   */
  filterResult(recognizedText, possibleChars) {
    if (!recognizedText) return null;
    
    // 提取单个汉字
    const chars = recognizedText.match(/[\u4e00-\u9fa5]/g) || [];
    
    if (chars.length === 0) return null;
    
    // 如果有可能字符列表，优先匹配
    if (possibleChars.length > 0) {
      for (const char of chars) {
        if (possibleChars.includes(char)) {
          return char;
        }
      }
    }
    
    // 返回第一个汉字
    return chars[0];
  }

  /**
   * 初始化方法（兼容性）
   */
  initialize(wordBank) {
    console.log('API手写识别器已初始化');
    this.fallbackRecognizer.initialize(wordBank);
  }

  /**
   * 学习方法（兼容性）
   */
  learnFromResult(recognizedChar, actualChar, userFeatures) {
    // API识别器不需要学习，但可以记录统计信息
    console.log(`API识别记录: 识别=${recognizedChar}, 实际=${actualChar}`);
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    return {
      apiEnabled: Object.values(this.apiConfigs).filter(c => c.enabled).length,
      fallbackStats: this.fallbackRecognizer.getStatistics()
    };
  }
}

module.exports = new APIHandwritingRecognizer(); 