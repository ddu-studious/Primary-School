Page({
  data: {
    title: '学习小达人',
    userInfo: null,
    userDrawerVisible: false
  },
  onLoad() {
    let userInfo = wx.getStorageSync('userInfo');
    console.log('[首页] 读取本地userInfo:', userInfo);
    if (typeof userInfo === 'string') {
      try {
        userInfo = JSON.parse(userInfo);
        console.log('[首页] userInfo字符串已转对象:', userInfo);
      } catch (e) {
        console.warn('[首页] userInfo解析失败:', e);
        userInfo = null;
      }
    }
    if (!userInfo || !userInfo.avatarUrl || !userInfo.nickName) {
      console.warn('[首页] userInfo无效，跳转登录页');
      wx.redirectTo({ url: '/pages/login/login' });
    } else {
      console.log('[首页] userInfo有效，展示用户信息:', userInfo);
      this.setData({ userInfo });
    }
  },
  onReady() {
    // hsl转rgb
    function hslToRgb(h, s, l) {
      s /= 100; l /= 100;
      let c = (1 - Math.abs(2 * l - 1)) * s;
      let x = c * (1 - Math.abs((h / 60) % 2 - 1));
      let m = l - c/2, r=0, g=0, b=0;
      if (h < 60) { r = c; g = x; }
      else if (h < 120) { r = x; g = c; }
      else if (h < 180) { g = c; b = x; }
      else if (h < 240) { g = x; b = c; }
      else if (h < 300) { r = x; b = c; }
      else { r = c; b = x; }
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);
      return `rgb(${r},${g},${b})`;
    }
    // p5.js风格气泡/拼音字母漂浮动画
    const ctx = wx.createCanvasContext('bgCanvas', this);
    let width = 375, height = 667;
    if (wx.getWindowInfo) {
      const info = wx.getWindowInfo();
      width = info.windowWidth;
      height = info.windowHeight;
    } else {
      // 兼容老版本
      const info = wx.getSystemInfoSync();
      width = info.windowWidth;
      height = info.windowHeight;
    }
    // 气泡/字母动画数据
    const bubbles = [];
    const pinyinList = ['a','o','e','i','u', 'ü', 'v','ai','ei','ui','ao','ou','iu','ie', 'ue', 'üe','ve','er','an','en','in','un', 'ün','vn','ang','eng','ing','ong','b','p','m','f','d','t','n','l','g','k','h','j','q','x','zh','ch','sh','r','z','c','s','y','w'];
    for(let i=0;i<18;i++){
      const h = Math.floor(Math.random()*360);
      const s = 80, l = 70;
      bubbles.push({
        x: Math.random()*width,
        y: Math.random()*height*0.7+40,
        r: 28+Math.random()*18,
        vy: -0.3-Math.random()*0.5,
        vx: (Math.random()-0.5)*0.4, // 横向漂浮速度
        txt: pinyinList[Math.floor(Math.random()*pinyinList.length)],
        color: hslToRgb(h, s, l),
        baseColor: h,
        alpha: 0.7+Math.random()*0.3,
        phase: Math.random()*Math.PI*2 // 抖动相位
      });
    }
    function draw() {
      ctx.clearRect(0,0,width,height);
      bubbles.forEach((b,i)=>{
        // 颜色渐变
        let h = (b.baseColor + Date.now()/40 + i*20)%360;
        b.color = hslToRgb(h, 80, 70);
        // 轻微抖动
        let offsetX = Math.sin(Date.now()/400 + b.phase)*2;
        let offsetY = Math.cos(Date.now()/500 + b.phase)*2;
        // 透明度渐变
        let alpha = b.alpha * (0.7 + 0.3*Math.abs(Math.sin(Date.now()/800 + b.phase)));
        ctx.save && ctx.save();
        ctx.globalAlpha && (ctx.globalAlpha = alpha);
        ctx.beginPath();
        ctx.arc(b.x+offsetX, b.y+offsetY, b.r, 0, 2*Math.PI);
        ctx.setFillStyle(b.color);
        ctx.fill();
        ctx.setFontSize(20);
        ctx.setFillStyle('#1890ff');
        ctx.setTextAlign('center');
        ctx.setTextBaseline('middle');
        ctx.fillText(b.txt, b.x+offsetX, b.y+offsetY);
        ctx.restore && ctx.restore();
        // 漂浮运动
        b.y += b.vy;
        b.x += b.vx + Math.sin(Date.now()/1000 + b.phase)*0.1; // 横向交错漂浮
        // 边界重置
        if(b.y < -b.r) {
          b.y = height + b.r;
          b.x = Math.random()*width;
          b.txt = pinyinList[Math.floor(Math.random()*pinyinList.length)];
        }
        if(b.x < -b.r) b.x = width + b.r;
        if(b.x > width + b.r) b.x = -b.r;
      });
      ctx.draw();
      setTimeout(draw, 40);
    }
    draw();
  },
  onAvatarTap() {
    this.setData({ userDrawerVisible: !this.data.userDrawerVisible });
  },
  onLogout() {
    wx.removeStorageSync('userInfo');
    this.setData({ userDrawerVisible: false });
    wx.reLaunch({ url: '/pages/login/login' });
  }
}); 