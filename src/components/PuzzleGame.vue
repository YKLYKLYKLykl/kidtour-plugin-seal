<script setup>
import { ref, onMounted} from 'vue';  // ← 加上 watch
import { sendComplete } from '../useKidtourPlugin.js';

const emit = defineEmits(['onBack']);
const hasReported = ref(false);

const sealImage = ref(''); // 存储生成的印章底图
const cells = ref([]);     // 存储 9 个小格子的状态
const isWin = ref(false);
const showGuide = ref(false); // 控制弹窗显示
const puzzleSize = 390;    // 整体尺寸

// 新增：上报通关结果
const reportCompletion = async () => {
  if (hasReported.value) return;
  try {
    await sendComplete({ passed: true });  // 只上报通关，不传作品文件
    hasReported.value = true;
  } catch (error) {
    console.error('[PuzzleGame] 上报失败:', error);
  }
};

// 新增：监听通关状态变化，确保上报
// watch(isWin, (newVal) => {
//   if (newVal && !hasReported.value) {
//     reportCompletion();
//   }
// });

// 1. 生成随机印章并打乱
const initGame = () => {
  isWin.value = false;
  hasReported.value = false;  // ← 新增：重置上报标记
  const words = ["福", "吉", "乐", "雅", "和", "安"];
  const text = words[Math.floor(Math.random() * words.length)];
  
  const canvas = document.createElement('canvas');
  canvas.width = puzzleSize;
  canvas.height = puzzleSize;
  const ctx = canvas.getContext('2d');

  // 绘制底色 (使用印泥红)
  ctx.fillStyle = '#A62C21';
  ctx.fillRect(0, 0, puzzleSize, puzzleSize);

  // 绘制文字
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `bold 320px "MyXiaoZhuan"`;  //文字大小
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, puzzleSize/2, puzzleSize/2 + 10); //微调文字位置

  sealImage.value = canvas.toDataURL();

  const tempCells = [];
  for (let i = 0; i < 9; i++) {
    const randomRotate = (Math.floor(Math.random() * 3) + 1) * 90;
    tempCells.push({
      id: i,
      rotation: randomRotate,
      bx: (i % 3) * 50, 
      by: Math.floor(i / 3) * 50
    });
  }
  cells.value = tempCells;
};

const rotateCell = (index) => {
  if (isWin.value) return;
  cells.value[index].rotation += 90;
  checkWin();
};

const checkWin = () => {
  const allCorrect = cells.value.every(cell => cell.rotation % 360 === 0);
  if (allCorrect) {
    isWin.value = true;
    reportCompletion();  // ← 新增：通关后自动上报
  }
};

onMounted(async () => {
  try {
    // 检查字体是否已加载，如果没有则等待加载
    await document.fonts.load('bold 10px "MyXiaoZhuan"');
    initGame();
    showGuide.value = true;
  } catch (e) {
    console.error("字体加载失败", e);
    initGame(); // 失败也运行，避免白屏
  }
});
</script>

<template>
  <div class="puzzle-container">
    <div class="gallery-nav">
      <button @click="$emit('onBack')" class="back-btn">
        <span class="arrow">⬅</span> 返回首页
      </button>
      
      <div class="title-section">
        <div class="title-with-help">
          <h2>旋转乾坤</h2>
          <button class="help-trigger" @click="showGuide = true" title="查看游戏说明">?</button>
        </div>
        <p>点击石块旋转方向，拼合出正确的金石印迹</p>
      </div>

      <div class="nav-placeholder">
        <button @click="initGame" class="refresh-btn">换一个</button>
      </div>
    </div>

    <div class="work-area">
        <div class="game-board-wrapper" :class="{ 'is-win-glow': isWin }">
        <div class="game-board" :class="{ 'is-win': isWin }">
          <div 
            v-for="(cell, index) in cells" 
            :key="cell.id"
            class="cell"
            :style="{
              backgroundImage: `url(${sealImage})`,
              backgroundPosition: `${cell.bx}% ${cell.by}%`,
              transform: `rotate(${cell.rotation}deg)`
            }"
            @click="rotateCell(index)"
          ></div>
        </div>
      </div>
    </div>

    <div class="controls-bottom">
        <div v-if="isWin" class="win-msg">
        <h3>✨ 独具慧眼！</h3>
        <p>你精准地还原了这枚印章的章法布局。</p>
        <button @click="initGame" class="btn btn-finish">挑战下一关</button>
      </div>
      <div v-else class="action-buttons">
        <button class="btn btn-reset" @click="initGame">重置布局</button>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showGuide" class="modal-overlay" @click.self="showGuide = false">
        <div class="modal-content">
          <button class="close-x" @click="showGuide = false">×</button>
          <h3>游戏说明</h3>
          <div class="guide-body">
            <div class="guide-item">
              <span class="num">1</span>
              <p>印章被打乱成了九个部分，且方向发生了旋转。</p>
            </div>
            <div class="guide-item">
              <span class="num">2</span>
              <p><strong>点击</strong>任意一个石块，它会顺时针旋转90度。</p>
            </div>
            <div class="guide-item">
              <span class="num">3</span>
              <p>观察残缺的笔画连接，将九个石块全部旋转至正确方向即可通关。</p>
            </div>
          </div>
          <button class="btn btn-finish" @click="showGuide = false">准备好了</button>
        </div>
      </div>
    </Transition>

    <svg style="position: absolute; width: 0; height: 0;">
      <filter id="stone-cut">
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="5" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
      </filter>
    </svg>
  </div>
</template>

<style scoped>
.puzzle-container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gallery-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px; 
}

.title-section { text-align: center; flex: 1; }
.title-section h2 {
  font-size: 34px;
  color: #323232;
  margin: 0;
  letter-spacing: 2px;
}
.title-section p { color: #999; margin: 8px 0 0; font-size: 15px; }

/* 按钮基础样式 */
.back-btn, .refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background: white;
  width: 140px;
  height: 45px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}
.back-btn:hover { transform: translateX(-5px); color: #FFC03A; }
.refresh-btn:hover { transform: translateY(-2px); color: #FFC03A; box-shadow: 0 6px 15px rgba(0,0,0,0.1); }
.nav-placeholder { width: 120px; display: flex; justify-content: flex-end; }

.work-area { margin: 10px 0; }

/* --- 自动适配的外框 --- */
.game-board-wrapper {
  padding: 15px;
  background: #555; 
  border-radius: 20px;
  filter: url(#stone-cut);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  transition: all 0.6s ease;
}

.is-win-glow {
  box-shadow: 0 0 40px rgba(255, 192, 58, 0.4);
}

/* --- 调整游戏板容器 --- */
.game-board {
  display: grid;
  grid-template-columns: repeat(3, 130px);
  grid-template-rows: repeat(3, 130px);
  gap: 2px;
  background: #444; /* 缝隙颜色 */
  overflow: hidden;
  transition: gap 0.5s ease;
}
.game-board.is-win { gap: 0; }

/* --- 调整单个格子 --- */
.cell {
  width: 130px; 
  height: 130px;
  background-size: 390px 390px;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255,255,255,0.05);
}

/* --- 底部控制区：固定最小高度防止抖动 --- */
.controls-bottom {
  width: 100%;
  margin-top: 15px; /* 适当缩小间距 */
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 120px; /* 给底部按钮和文字预留固定空间 */
  justify-content: flex-start;
}

/* --- 胜利消息：重置内部 margin --- */
.win-msg { 
  text-align: center; 
  animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.win-msg h3 { 
  color: #A62C21; 
  font-size: 24px; 
  margin: 0 0 5px 0; /* 严格控制上下间距 */
}

.win-msg p { 
  color: #666; 
  margin: 0 0 15px 0; /* 控制与下方按钮的距离 */
  font-size: 15px;
}

/* --- 按钮容器保持高度一致 --- */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px; /* 与按钮高度匹配 */
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
}

.btn-reset {
  background: white;
  color: #FFC03A;
  border: 1px solid #FFC03A;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.btn-finish { 
  background: #FFC03A; 
  color: white; 
  padding: 14px 50px;
  border: 2px solid #FFC03A;
  box-shadow: 0 5px 20px rgba(255, 192, 58, 0.4);
}

.btn:hover {
  transform: translateY(-2px);
}
.btn:active { transform: translateY(1px); }

.title-with-help {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  /* 确保帮助图标不影响标题居中 */
  margin-left: 30px; 
}

.help-trigger {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid #ccc;
  background: transparent;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-weight: bold;
}

.help-trigger:hover {
  border-color: #FFC03A;
  color: #FFC03A;
  background: #FFFBF2;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fdfaf5; /* 宣纸色 */
  width: 90%;
  max-width: 500px;
  padding: 40px 30px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  text-align: center;
}

.close-x {
  position: absolute;
  top: 15px; right: 20px;
  background: none; border: none;
  font-size: 28px; color: #999;
  cursor: pointer;
}
.close-x:hover { color: #333; }

.modal-content h3 {
  color: #323232;
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 24px;
  letter-spacing: 2px;
}

.guide-body {
  text-align: left;
  margin-bottom: 30px;
}

.guide-item {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: flex-start;
}

.guide-item .num {
  background: #FFC03A;
  color: white;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-top: 2px;
}

.guide-item p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-size: 16px;
}

/* 动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes pop { 
  from { transform: scale(0.9); opacity: 0; } 
  to { transform: scale(1); opacity: 1; } 
}

@media (max-width: 768px) {
  .gallery-nav { flex-direction: column; gap: 15px; }
  .nav-placeholder { width: auto; }
}
</style>