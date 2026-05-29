<script setup>
const templates = [
  { id: 1, name: '福', text: '福' },
  { id: 2, name: '吉', text: '吉' },
  { id: 3, name: '乐', text: '乐' },
  { id: 4, name: '雅', text: '雅' }, 
  { id: 5, name: '金石为开', text: '金石\n为开' },
  { id: 6, name: '春和景明', text: '春和\n景明' },  
  { id: 7, name: '一帆风顺', text: '一帆\n风顺' },
  { id: 8, name: '厚德载物', text: '厚德\n载物' },
];
</script>

<template>
  <div class="gallery-fixed-container">
    <div class="gallery-content">
      <div class="gallery-nav">
        <button @click="$emit('onBack')" class="back-btn">
          <span class="arrow">⬅</span> 返回首页
        </button>
        <div class="title-section">
          <h2>请选择篆刻模版</h2>
          <p>挑选一个中意的样式，开启你的非遗创作之旅</p>
        </div>
        <div class="nav-placeholder"></div>
      </div>

      <div class="templates-grid">
  <div v-for="t in templates" :key="t.id" class="template-item">
    <div class="preview-box">
      <div class="seal-container">
        <div :class="['seal-text', t.text.length <= 1 ? 'seal-single' : 'seal-multi']">
          {{ t.text }}
        </div>
      </div>
    </div>
    <div class="info-box">
      <h3>{{ t.name }}</h3>
    </div>
    <button class="create-btn" @click="$emit('onSelect', t)">
      进行创作
    </button>
  </div>
</div>

<svg style="position: absolute; width: 0; height: 0;">
  <filter id="stone-cut">
    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="5" result="noise" />
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
  </filter>
</svg>
        
      
    </div>
  </div>
</template>

<style scoped>
/* 1. 引入字体 */
@font-face {
  font-family: 'MyXiaoZhuan'; 
  src: url('../assets/XiaoZhuan.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

/* 核心修复：锁定在屏幕顶部，不受 App.vue 居中影响 */
.gallery-fixed-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #F9F8F5; /* 确保背景色统一 */
  overflow-y: auto; /* 允许内部滚动 */
  z-index: 100;
}

.gallery-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px 80px; /* 顶部预留足够间距 */
  display: flex;
  flex-direction: column;
}

/* 导航条布局 */
.gallery-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 60px;
}

.title-section {
  text-align: center;
  flex: 1;
}

.title-section h2 {
  font-size: 42px;
  color: #323232;
  margin: 0;
  letter-spacing: 1px;
}

.title-section p {
  color: #999;
  margin: 10px 0 0;
  font-size: 17px;
}

/* 返回按钮 */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background: white;
  width: 150px;
  height: 50px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateX(-5px);
  color: #FFC03A;
}

.nav-placeholder { width: 150px; }

/* 响应式网格 */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 35px;
  width: 100%;
}

/* 独立卡片：去掉外圈硬边框，使用微阴影 */
.template-item {
  background: white;
  padding: 24px;
  border-radius: 30px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.02);
}

.template-item:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(255, 192, 58, 0.15);
  border-color: rgba(255, 192, 58, 0.3);
}

/* 1. 印章红色底块：应用 SVG 滤镜产生颤抖感 */
.preview-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: #A62C21;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-sizing: border-box;
  /* 关键：应用下方定义的颤抖滤镜 */
  filter: url(#stone-cut); 
}

/* 2. 内圈边框容器：控制它的大小就能控制边框距离外圈的远近 */
.seal-container {
  width: 85%;  /* 数值越大，边框越靠近红印章边缘 */
  height: 85%;
  border: 2px solid rgba(255, 255, 255, 0.5); /* 这就是您要的那圈线 */
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

/* 3. 文字基础样式 */
.seal-text {
  color: white;
  font-family: 'MyXiaoZhuan', "STKaiti", "KaiTi", serif; 
  line-height: 1.1;
  white-space: pre-wrap;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  /* 模拟金石味：轻微模糊和阴影 */
  filter: blur(0.3px);
  text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
}

/* 4. 分别调节字号 */

/* 单字模版的字号：非常大 */
.seal-single {
  font-size: 140px; 
  transform: translateY(-8px);/* 关键修改：向上补偿 8-10 像素的视觉差 */
}

/* 多字（四个字）模版的字号：适中 */
.seal-multi {
  font-size: 70px;
  transform: translateY(-2px);/* 四字模版通常对齐较好，如果觉得也偏下，可以微调 */
}

.info-box h3 {
  font-size: 22px;
  color: #333;
  margin: 0 0 20px 0;
}

/* 按钮交互 */
.create-btn {
  width: 100%;
  padding: 12px 0;
  border: none;
  background: #FFF8ED;
  color: #FFC03A;
  font-weight: bold;
  font-size: 16px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover .create-btn {
  background: #FFC03A;
  color: white;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .gallery-nav { flex-direction: column; gap: 20px; }
  .nav-placeholder { display: none; }
}

</style>