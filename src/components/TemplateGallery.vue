<script setup>

import { ref, computed } from 'vue';

const emit = defineEmits(['onSelect', 'onBack']);

// 初始的预设模板
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

// 自定义输入框的状态
const customText = ref('');

// 处理自定义文字提交
const handleCustomSubmit = () => {
  let rawText = customText.value.trim();
  
  if (!rawText) {
    alert('请输入文字后再生成哦！');
    return;
  }
  
  if (rawText.length > 4) {
    alert('为了保证印章美观，请输入 1 到 4 个汉字。');
    return;
  }

  let formattedText = rawText;

  if (rawText.length === 2) {
    // 2个字：换行变成上下排列
    formattedText = rawText.substring(0, 1) + '\n' + rawText.substring(1, 2);
  } else if (rawText.length === 3) {
    // 3个字：自动补一个“印”字，变成4字传统排版！
    rawText = rawText + '印';
    formattedText = rawText.substring(0, 2) + '\n' + rawText.substring(2, 4);
  } else if (rawText.length === 4) {
    // 4个字：正常的两行两列
    formattedText = rawText.substring(0, 2) + '\n' + rawText.substring(2, 4);
  }

  const customTemplate = {
    id: Date.now(),
    name: `自定义: ${rawText}`,
    text: formattedText
  };

  emit('onSelect', customTemplate);
};

const previewText = computed(() => {
  let text = customText.value.trim();

  if (!text) return '篆\n刻';

  if (text.length === 1) {
    return text;
  }

  if (text.length === 2) {
    return text[0] + '\n' + text[1];
  }

  if (text.length === 3) {
    text += '印';
  }

  if (text.length === 4) {
    return text.slice(0, 2) + '\n' + text.slice(2, 4);
  }

  return text;
});
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
          <p>挑选一个中意的样式，或输入文字自行创作，开启你的非遗之旅</p>
        </div>
        <div class="nav-placeholder"></div>
      </div>

      <div class="content-layout">

  <!-- 左边模板区 -->
  <div class="templates-panel">

    <div class="template-section-title">
      <h3>经典模板</h3>
      <p>选择一个喜欢的印章开始创作</p>
    </div>

    <div class="templates-grid">
      <div
        v-for="t in templates"
        :key="t.id"
        class="template-item"
      >
        <div class="preview-box">
          <div class="seal-container">
            <div
  :class="[
    'seal-text',
    t.text.replace('\n', '').length <= 1
      ? 'template-single'
      : 'template-multi'
  ]"
>
  {{ t.text }}
</div>
          </div>
        </div>

        <div class="info-box">
          <h3>{{ t.name }}</h3>
        </div>

        <button
          class="create-btn"
          @click="$emit('onSelect', t)"
        >
          进行创作
        </button>

      </div>
    </div>

  </div>

  <!-- 右边固定创作区 -->
  <div class="custom-panel">

    <div class="custom-workshop">

      <div class="workshop-header">
        <h3>自定义模版</h3>
        <p>输入文字实时生成专属印章</p>
      </div>

      <div class="workshop-right">

        <div class="preview-box preview-large">

          <div class="seal-container">

            <div
  :class="[
    'seal-text',
    previewText.replace('\n','').length <= 1
      ? 'preview-single'
      : 'preview-multi'
  ]"
>
  {{ previewText }}
</div>

          </div>

        </div>

        <input
          v-model="customText"
          type="text"
          maxlength="4"
          placeholder="请输入1-4个汉字"
        />

        <button
          class="custom-submit-btn"
          @click="handleCustomSubmit"
        >
          开始创作
        </button>

      </div>

    </div>

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

/* 锁定在屏幕顶部 */
.gallery-fixed-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #F9F8F5;
  overflow-y: auto;
  z-index: 100;
}

.gallery-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px 80px;
  display: flex;
  flex-direction: column;
}

/* 导航条布局 */
.gallery-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 24px;
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

/* === 新增：自定义输入区域样式 === */

.custom-submit-btn {
  background: #FFC03A;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 192, 58, 0.3);
}

.custom-submit-btn:hover {
  background: #FFB300;
  transform: scale(1.02);
}

.custom-submit-btn:active {
  transform: scale(0.98);
}

/* 响应式网格 */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* 独立卡片 */
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

/* 印章红色底块 */
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
  filter: url(#stone-cut); 
}

/* 内圈边框容器 */
.seal-container {
  width: 85%;  
  height: 85%;
  border: 2px solid rgba(255, 255, 255, 0.5); 
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

/* 文字基础样式 */
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
  filter: blur(0.3px);
  text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
}

/* =========================
   模板区字体
========================= */

.template-single {
  font-size: 90px;
  transform: translateY(-4px);
}

.template-multi {
  font-size: 48px;
  line-height: 1;
}

/* =========================
   右侧预览字体
========================= */

.preview-single {
  font-size: 120px;
  transform: translateY(-6px);
}

.preview-multi {
  font-size: 64px;
  line-height: 1;
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

.custom-workshop {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.workshop-header {
  text-align: center;
  margin-bottom: 30px;
}

.workshop-header h3 {
  font-size: 32px;
  margin-bottom: 8px;
}

.workshop-header p {
  color: #999;
}

.workshop-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.preview-large {
  width: 220px;
  height: 220px;
}

.template-section-title {
  text-align: center;
  margin-bottom: 16px;
}

.template-section-title h3 {
  font-size: 28px;
  margin-bottom: 4px;
}

.template-section-title p {
  color: #999;
}

.content-layout {
  display: flex;
  gap: 40px;
  background: white;
  border-radius: 36px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,.04);
}

.templates-panel {
  flex: 3;
  min-width: 0;
}

.custom-panel {
  flex: 1;
  position: sticky;
  top: 30px;
}

.custom-panel input {
  width: 100%;
  height: 56px;
  padding: 0 16px;
  border-radius: 14px;
  border: 2px solid #eee;
  font-size: 16px;
}

.custom-panel input:focus {
  outline: none;
  border-color: #FFC03A;
}

.preview-large {
  width: 180px;
  height: 180px;
}

.custom-panel {
  flex: 1;
  position: sticky;
  top: 30px;
  padding-left: 40px;
  border-left: 1px solid #eee;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .gallery-nav { flex-direction: column; gap: 20px; }
  .nav-placeholder { display: none; }
  .custom-submit-btn { width: 100%; }
  .custom-workshop {padding: 24px;}
  .preview-large {width: 180px;height: 180px;}
  .content-layout {flex-direction: column;}
  .custom-panel {position: static;width: 100%;order: -1;}
  .templates-panel {width: 100%;}
  .templates-grid {grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));}
}
</style>