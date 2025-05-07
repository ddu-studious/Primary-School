const fs = require('fs');
const path = require('path');
const https = require('https');

// 音频文件保存目录
const audioDir = path.join(__dirname, '../assets/audio/pinyin');

// 确保目录存在
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

// 特殊拼音映射
const specialPinyinMap = {
    'ü': 'v',
    'üe': 've',
    'ün': 'vn'
};

// 新的音频源URL模板（zdic）
const audioSourceUrl = 'https://www.zdic.net/ts/fulu/rtpy/pysd/{pinyin}.mp3';

// 下载单个音频文件
async function downloadAudio(pinyin) {
    return new Promise((resolve, reject) => {
        // 转换特殊拼音
        const downloadPinyin = specialPinyinMap[pinyin] || pinyin;
        const url = audioSourceUrl.replace('{pinyin}', downloadPinyin);
        const filePath = path.join(audioDir, `${pinyin}.mp3`);

        // 如果文件已存在，跳过下载
        if (fs.existsSync(filePath)) {
            console.log(`音频已存在: ${pinyin}`);
            resolve();
            return;
        }

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(filePath);
                response.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`下载成功: ${pinyin}`);
                    resolve();
                });
            } else {
                console.log(`下载失败: ${pinyin}, 状态码: ${response.statusCode}`);
                resolve(); // 继续下载其他文件
            }
        }).on('error', (err) => {
            console.log(`下载失败: ${pinyin}, ${err.message}`);
            resolve(); // 继续下载其他文件
        });
    });
}

// 下载所有拼音音频
async function downloadAllAudio() {
    console.log('开始下载拼音音频...');
    
    // 从pinyin.js中获取所有拼音
    const pinyinData = require('../data/pinyin.js');
    const allPinyin = [
        ...pinyinData.initials.map(item => item.pinyin),
        ...pinyinData.finals.map(item => item.pinyin),
        ...pinyinData.wholePinyin.map(item => item.pinyin)
    ];

    // 逐个下载音频文件
    for (const pinyin of allPinyin) {
        await downloadAudio(pinyin);
        // 添加延迟，避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('音频下载完成！');
}

// 执行下载
downloadAllAudio().catch(console.error); 