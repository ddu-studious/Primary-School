// 声母列表
const initials = [
    { pinyin: 'b', example: '爸爸' },
    { pinyin: 'p', example: '葡萄' },
    { pinyin: 'm', example: '妈妈' },
    { pinyin: 'f', example: '风扇' },
    { pinyin: 'd', example: '大象' },
    { pinyin: 't', example: '太阳' },
    { pinyin: 'n', example: '奶牛' },
    { pinyin: 'l', example: '老虎' },
    { pinyin: 'g', example: '公鸡' },
    { pinyin: 'k', example: '口红' },
    { pinyin: 'h', example: '猴子' },
    { pinyin: 'j', example: '鸡蛋' },
    { pinyin: 'q', example: '气球' },
    { pinyin: 'x', example: '小狗' },
    { pinyin: 'zh', example: '蜘蛛' },
    { pinyin: 'ch', example: '车子' },
    { pinyin: 'sh', example: '狮子' },
    { pinyin: 'r', example: '热水' },
    { pinyin: 'z', example: '桌子' },
    { pinyin: 'c', example: '草地' },
    { pinyin: 's', example: '伞' },
    { pinyin: 'y', example: '鸭子' },
    { pinyin: 'w', example: '蜗牛' }
];

// 韵母列表
const finals = [
    { pinyin: 'a', example: '啊' },
    { pinyin: 'o', example: '哦' },
    { pinyin: 'e', example: '鹅' },
    { pinyin: 'i', example: '衣' },
    { pinyin: 'u', example: '乌' },
    { pinyin: 'ü', example: '鱼' },
    { pinyin: 'ai', example: '爱' },
    { pinyin: 'ei', example: '诶' },
    { pinyin: 'ui', example: '灰' },
    { pinyin: 'ao', example: '奥' },
    { pinyin: 'ou', example: '欧' },
    { pinyin: 'iu', example: '牛' },
    { pinyin: 'ie', example: '爷' },
    { pinyin: 'üe', example: '月' },
    { pinyin: 'er', example: '耳' },
    { pinyin: 'an', example: '安' },
    { pinyin: 'en', example: '恩' },
    { pinyin: 'in', example: '音' },
    { pinyin: 'un', example: '云' },
    { pinyin: 'ün', example: '晕' },
    { pinyin: 'ang', example: '昂' },
    { pinyin: 'eng', example: '灯' },
    { pinyin: 'ing', example: '英' },
    { pinyin: 'ong', example: '熊' }
];

// 整体认读音节
const wholePinyin = [
    { pinyin: 'zhi', example: '知道' },
    { pinyin: 'chi', example: '吃饭' },
    { pinyin: 'shi', example: '石头' },
    { pinyin: 'ri', example: '日记' },
    { pinyin: 'zi', example: '自己' },
    { pinyin: 'ci', example: '词语' },
    { pinyin: 'si', example: '思想' },
    { pinyin: 'yi', example: '衣服' },
    { pinyin: 'wu', example: '乌鸦' },
    { pinyin: 'yu', example: '雨伞' },
    { pinyin: 'ye', example: '爷爷' },
    { pinyin: 'yue', example: '月亮' },
    { pinyin: 'yuan', example: '圆圈' },
    { pinyin: 'yin', example: '音乐' },
    { pinyin: 'yun', example: '云朵' },
    { pinyin: 'ying', example: '英雄' }
];

// 声母与可组合韵母映射表（权威拼音规则）
const initialFinalMap = {
  b: ['a','o','ai','ei','ao','ou','an','en','ang','eng','i','u'],
  p: ['a','o','ai','ei','ao','ou','an','en','ang','eng','i','u'],
  m: ['a','o','e','ai','ei','ao','ou','an','en','ang','eng','i','u'],
  f: ['a','o','e','an','en','ang','eng','u'],
  d: ['a','e','ai','ei','ao','ou','an','en','ang','eng','i','u'],
  t: ['a','e','ai','ao','ou','an','eng','ang','i','u'],
  n: ['a','e','ai','ei','ao','ou','an','en','ang','eng','i','u','ü'],
  l: ['a','e','ai','ei','ao','ou','an','en','ang','eng','i','u','ü'],
  g: ['a','e','ai','ei','ao','ou','an','en','ang','eng','u'],
  k: ['a','e','ai','ei','ao','ou','an','en','ang','eng','u'],
  h: ['a','e','ai','ei','ao','ou','an','en','ang','eng','u'],
  j: ['i','ia','ian','iang','ie','in','ing','iong','ü','üe','üan','ün'],
  q: ['i','ia','ian','iang','ie','in','ing','iong','ü','üe','üan','ün'],
  x: ['i','ia','ian','iang','ie','in','ing','iong','ü','üe','üan','ün'],
  zh: ['a','ai','an','ang','ao','e','en','eng','i','ong','u'],
  ch: ['a','ai','an','ang','ao','e','en','eng','i','ong','u'],
  sh: ['a','ai','an','ang','ao','e','en','eng','i','ou','u'],
  r: ['e','en','eng','i','ong','u','uan','ui','un','a','an','ang'],
  z: ['a','ai','an','ang','ao','e','ei','en','eng','i','ong','u'],
  c: ['a','ai','an','ang','ao','e','ei','en','eng','i','ong','u'],
  s: ['a','ai','an','ang','ao','e','en','eng','i','ong','u'],
  y: ['i','ia','ian','iang','ie','in','ing','iong','iu','u','uan','ue','un','ü','üan','üe','ün','a','an','ang','e','ou'],
  w: ['a','ai','an','ang','ei','en','eng','o','u'],
};

// 重新生成所有合法拼音组合
const validPinyin = [];
Object.keys(initialFinalMap).forEach(initial => {
  initialFinalMap[initial].forEach(final => {
    validPinyin.push(initial + final);
  });
});
// 加入整体认读音节
wholePinyin.forEach(item => validPinyin.push(item.pinyin));

module.exports = {
    initials,
    finals,
    wholePinyin,
    validPinyin
}; 