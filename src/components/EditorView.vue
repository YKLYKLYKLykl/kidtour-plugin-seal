<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['template']);
const emit = defineEmits(['onFinish', 'onBack']);

const canvasRef = ref(null);
const isDrawing = ref(false);

// 状态控制
const brushSize = ref(6);
const history = ref([]);
const lastX = ref(0);
const lastY = ref(0);

onMounted(() => {
  initCanvas();
});

const initCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // 1. 初始化石材背景
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#8e8e8e'; 
  ctx.fillRect(0, 0, 400, 400);

  // 2. 绘制底稿
  if (props.template) {
    drawTemplate(ctx);
  }
  
  saveHistory();
};

const drawTemplate = (ctx) => {
  ctx.save();
  ctx.translate(400, 0);
  ctx.scale(-1, 1);
  
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = props.template.text;
  const cleanText = text.replace('\n', ''); // 去掉换行符算纯字数

  if (cleanText.length === 1) {
    // 单字：300px
    ctx.font = 'bold 300px "MyXiaoZhuan"';
    ctx.strokeText(text.replace('\n', ''), 200, 205); // 微调 5px 适配视觉中心
  } else if (cleanText.length === 2) {
    // 2个字： 150px，间距拉开
    ctx.font = 'bold 150px "MyXiaoZhuan"';
    const lines = text.split('\n');
    ctx.strokeText(lines[0] || '', 200, 120);
    ctx.strokeText(lines[1] || '', 200, 280);
  }else {
    // 四字：130px
    ctx.font = 'bold 130px "MyXiaoZhuan"';
    const lines = text.split('\n');
    // 调整行高间距，让它们更紧凑居中
    ctx.strokeText(lines[0] || '', 200, 135);
    ctx.strokeText(lines[1] || '', 200, 265);
  }

  // 内部细边框（保持 85% 左右的比例）
  ctx.lineWidth = 4;
  ctx.strokeRect(35, 35, 330, 330); 
  
  ctx.restore();
};

const saveHistory = () => {
  const canvas = canvasRef.value;
  if (history.value.length > 20) history.value.shift();
  history.value.push(canvas.toDataURL());
};

const undo = () => {
  if (history.value.length <= 1) return;
  history.value.pop();
  const prevState = history.value[history.value.length - 1];
  
  const img = new Image();
  img.src = prevState;
  img.onload = () => {
    const ctx = canvasRef.value.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, 400, 400);
    ctx.drawImage(img, 0, 0);
  };
};

const reset = () => {
  history.value = [];
  initCanvas();
};

const start = (e) => {
  isDrawing.value = true;
  const rect = canvasRef.value.getBoundingClientRect();
  lastX.value = e.clientX - rect.left;
  lastY.value = e.clientY - rect.top;
};

const end = () => {
  if (isDrawing.value) saveHistory();
  isDrawing.value = false;
};

const draw = (e) => {
  if (!isDrawing.value) return;
  const ctx = canvasRef.value.getContext('2d');
  const rect = canvasRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 计算两次移动之间的距离
  const dist = Math.sqrt(Math.pow(x - lastX.value, 2) + Math.pow(y - lastY.value, 2));
  
  // --- 新增：计算需要补多少刀 ---
  // 步长设定为 brushSize 的一半，意味着每移动半个刀头距离就强制刻一刀
  const steps = Math.max(Math.ceil(dist / brushSize.value ), 1); 

  for (let i = 0; i < steps; i++) {
    // 计算补刀的具体坐标
    const t = i / steps;
    const currX = lastX.value + (x - lastX.value) * t;
    const currY = lastY.value + (y - lastY.value) * t;

    // 刻刀大小逻辑保持不变
    const finalSize = brushSize.value + (dist * 0.1); // 降低速度补偿系数，防止太粗

    ctx.globalCompositeOperation = 'destination-out';
    ctx.save();
    ctx.translate(currX, currY);
    ctx.rotate(Math.random() * Math.PI);
    ctx.beginPath();
    ctx.moveTo(-finalSize/2, -finalSize/2);
    ctx.lineTo(finalSize/2, 0);
    ctx.lineTo(0, finalSize/2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  lastX.value = x;
  lastY.value = y;
};

const handleFinish = () => {
  const mainCanvas = canvasRef.value;
  
  // 1. 创建临时画布
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 400;
  tempCanvas.height = 400;
  const tCtx = tempCanvas.getContext('2d');

  // 核心逻辑：提取刻痕并染白
  // A. 先在临时画布画一层纯白
  tCtx.fillStyle = '#FFFFFF';
  tCtx.fillRect(0, 0, 400, 400);

  // B. 使用 destination-out：把主画布上“还存在”的灰色石质部分挖掉
  // 这样剩下的就是你刻出来的那些线条路径了
  tCtx.globalCompositeOperation = 'destination-out';
  tCtx.drawImage(mainCanvas, 0, 0);

  // 此时生成的 sealOnly 是：透明背景，只有刻痕是纯白色的
  const pureSeal = tempCanvas.toDataURL('image/png');
  const fullImg = mainCanvas.toDataURL(); // 给左边石材用的原图

  emit('onFinish', { 
    stoneImg: fullImg, 
    sealOnly: pureSeal 
  });
};
</script>

<template>
  <div class="editor-container">
    <div class="gallery-nav">
      <button @click="$emit('onBack')" class="back-btn">
        <span class="arrow">⬅</span> 返回
      </button>
      <div class="title-section">
        <h2>{{ template ? '经典复刻: ' + template.name : '自由创作' }}</h2>
        <p>刀走石崩，在朱迹间留下你的金石印记</p>
      </div>
      <div class="nav-placeholder"></div>
    </div>

    <div class="work-area">
      <div class="stone-display-box">
        <div class="red-ink-base"></div>
        <canvas 
          ref="canvasRef" 
          width="400" 
          height="400" 
          @mousedown="start" 
          @mouseup="end" 
          @mousemove="draw" 
          @mouseleave="end"
        ></canvas>
      </div>
    </div>

    <div class="controls-bottom">
      <div class="size-slider-box">
        <span class="label">刻刀粗细</span>
        <input 
  type="range" 
  v-model.number="brushSize" 
  min="2" 
  max="20" 
  step="1"
  :style="{ '--percent': ((brushSize - 2) / (20 - 2)) * 100 + '%' }"
>
        <span class="val-display">{{ brushSize }}</span>
      </div>

      <div class="action-buttons">
        <button class="btn btn-undo" @click="undo" :disabled="history.length <= 1">撤销一刀</button>
        <button class="btn btn-reset" @click="reset">重来</button>
        <button class="btn btn-finish" @click="handleFinish">篆刻完成</button>
      </div>
    </div>

    <svg style="position: absolute; width: 0; height: 0;">
      <filter id="stone-cut">
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="5" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
    </svg>
  </div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  /* 1. 缩小顶部留白，靠 flex 居中对齐 */
  padding: 20px 20px; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gallery-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  /* 2. 这里的 margin 从 60px 缩减到 20px，缩短标题与印章的距离 */
  margin-bottom: 20px; 
}

.title-section { text-align: center; flex: 1; }
.title-section h2 {
  font-size: 34px; /* 稍微加大一点标题 */
  color: #323232;
  margin: 0;
  letter-spacing: 2px;
}
.title-section p { color: #999; margin: 8px 0 0; font-size: 15px; }

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
.back-btn:hover { transform: translateX(-5px); color: #FFC03A; }
.nav-placeholder { width: 150px; }

.work-area {
  /* 3. 这里的 margin 从 30px 缩减到 10px */
  margin: 10px 0;
}

.stone-display-box {
  position: relative;
  width: 420px;
  height: 420px;
  background: #555; /* 改为深灰色外圈 */
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: url(#stone-cut); 
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2); /* 阴影也改为黑色系 */
  padding: 10px;
  box-sizing: border-box;
}

.red-ink-base {
  position: absolute;
  top: 15px; left: 15px; right: 15px; bottom: 15px;
  background: #444;
  z-index: 1;
}

canvas { 
  position: relative; 
  z-index: 2; 
  cursor: crosshair;
  background: transparent;
}

.controls-bottom {
  width: 100%;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: center;
}

.size-slider-box {
  display: flex;
  align-items: center;
  gap: 15px;
  background: #FFFFFF;
  padding: 12px 30px;
  border-radius: 50px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.size-slider-box input[type=range] {
  width: 200px;
  cursor: pointer;
  height: 8px;
  border-radius: 10px;
  appearance: none;
  outline: none;
  /* 核心修改：使用渐变背景点亮左侧 */
  background-image: linear-gradient(
    to right, 
    #FFC03A 0%, 
    #FFC03A var(--percent), 
    #eeeeee var(--percent), 
    #eeeeee 100%
  );
}

/* 滑块圆点样式保持不变，但建议加上 margin-top 微调位置 */
.size-slider-box input[type=range]::-webkit-slider-thumb {
  appearance: none;
  width: 22px;
  height: 22px;
  background: #FFC03A;
  border: 4px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}

.size-slider-box input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.label { font-weight: bold; color: #666; font-size: 14px; }
.val-display { color: #FFC03A; font-weight: bold; width: 25px; text-align: center; }

.action-buttons {
  display: flex;
  gap: 30px;
}

.btn {
  padding: 14px 35px;
  border-radius: 50px;
  border: none;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 1px;
  box-shadow: 0 0px 10px rgba(0, 0, 0, 0.1);
}

/* 针对撤销和重来按钮*/
.btn-undo, .btn-reset {
  background: white;
  color: #FFC03A;
  border: 1px solid #FFC03A;
}

.btn-undo:hover, .btn-reset:hover {
  background: #FFF8ED; 
  box-shadow: 0 6px 15px rgba(255, 192, 58, 0.2);
  transform: translateY(-2px);
}

.btn-undo:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}


.btn-finish { 
  background: #FFC03A; 
  color: white; 
  padding: 14px 50px;
  border: 2px solid #FFC03A;
}

.btn-finish:hover {
  background: #FFB300; /* 悬浮时颜色稍深 */
  box-shadow: 0 5px 20px rgba(255, 192, 58, 0.4);
  transform: translateY(-2px);
}
.btn:active { 
  transform: translateY(2px); 
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 点击时阴影变小，模拟按压感 */
}

@media (max-width: 768px) {
  .gallery-nav { flex-direction: column; gap: 20px; }
  .nav-placeholder { display: none; }
  .stone-display-box { width: 340px; height: 340px; }
  canvas { width: 300px; height: 300px; }
}
</style>