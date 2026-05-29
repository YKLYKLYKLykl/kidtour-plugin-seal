<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { sendComplete } from '../useKidtourPlugin.js'; 
import html2canvas from 'html2canvas';

const props = defineProps(['result']);
const emit = defineEmits(['onRestart']);

// 状态控制
const isExporting = ref(false); // 截图瞬间的开关
const isFinished = ref(false);  // 标记是否已完成盖印上报
const currentInkColor = ref('#A62C21');
const sealWork = ref(null);
const paperBox = ref(null);

const inkColors = [
  { name: '朱砂', hex: '#A62C21' },
  { name: '大红', hex: '#FF0000' },
  { name: '朱标', hex: '#E65A35' },
  { name: '古雅', hex: '#5C1D19' },
  { name: '泥金', hex: '#C5A359' }, 
  { name: '黛蓝', hex: '#1A2F4B' },
];

// 核心处理函数：确认盖印
const handleComplete = async () => {
  if (isFinished.value) return;

  try {
    isExporting.value = true;
    await nextTick();

    // --- 蒙版/裁剪方法 ---
    sealWork.value.style.clipPath = 'inset(0 round 24px)';
    sealWork.value.style.webkitClipPath = 'inset(0 round 24px)';

    const canvas = await html2canvas(sealWork.value, {
      backgroundColor: null, // 必须为 null
      useCORS: true,
      scale: 2,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    // 截图完成后清除临时裁剪样式
    sealWork.value.style.clipPath = '';
    sealWork.value.style.webkitClipPath = '';

    // ✨ 核心修复：舍弃 fetch，直接用 canvas 官方自带的 toBlob 获取二进制文件对象
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("生成图片作品失败");
        isExporting.value = false;
        return;
      }

      // ✨ 调用新协议：传入真实的图片 Blob
      await sendComplete({ 
        passed: true, 
        workFile: blob,                 // 传入捕获到的真实图片文件
        workFileType: 'image/png',      // 必填：标明文件类型
        workFileName: '我的篆刻作品'     // 可选：作品名字
      });

      console.log("作品已成功通过新版协议上报至平台主站");

      isExporting.value = false;
      isFinished.value = true;
    }, 'image/png');

  } catch (error) {
    console.error('上报失败:', error);
    isExporting.value = false;
  }
};

const shareWork = () => {
  alert('作品已保存，快去分享给小伙伴吧！');
};

onMounted(() => {
  console.log("作品预览就绪");
});
</script>

<template>
  <div class="result-container">
    <div class="header-section">
      <div class="brand-tag">方寸之间 · 金石永恒</div>
      <h1 class="title">篆刻作品大赏</h1>
      <div class="title-line"></div>
    </div>
    
    <div class="showcase">
  <div class="item side-item-left">
    <div class="tag-wrapper"><div class="tag">篆刻石材</div></div>
    <div class="display-box stone-box">
      <div class="stone-texture"></div>
      <div class="color-layer" :style="{ 
        backgroundColor: '#c0c0c0', 
        maskImage: `url(${result.stoneImg})`,
        webkitMaskImage: `url(${result.stoneImg})`
      }"></div>
    </div>
  </div>

      <div class="process-arrow">
    <div class="arrow-container">
      <div class="line"></div>
      <div class="head"></div>
    </div>
    <div class="arrow-text">印记生成</div>
  </div>

      <div class="item side-item-right">
    <div class="tag-wrapper"><div class="tag">纸面印记</div></div>
    <div class="side-by-side-content">
      <div 
        ref="sealWork"
        class="frame-container" 
        :style="{ background: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), ${currentInkColor}` }"
      >
        <div class="display-box paper-box">
          <div ref="paperBox" class="display-box paper-box">
          <div class="paper-texture"></div>
          <div class="color-layer mirror" :style="{ 
            backgroundColor: currentInkColor,
            maskImage: `url(${result.stoneImg})`,
            webkitMaskImage: `url(${result.stoneImg})`
          }"></div>
          <div v-if="isExporting" class="screenshot-layer" :style="{ backgroundColor: currentInkColor }">
            <img :src="result.sealOnly" class="seal-white-trace" />
          </div>
        </div>
        </div>
      </div>
          
          <div class="ink-selector-vertical" :style="{ 
            pointerEvents: isFinished ? 'none' : 'auto',
            opacity: isFinished ? 0.5 : 1,
            filter: isFinished ? 'grayscale(1)' : 'none'
          }">
            <div 
              v-for="color in inkColors" 
              :key="color.hex"
              class="color-item"
              @click="currentInkColor = color.hex"
            >
              <div 
                class="color-dot"
                :style="{ backgroundColor: color.hex }"
                :class="{ active: currentInkColor === color.hex }"
              ></div>
              <span class="ink-name-small">{{ color.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="final-actions">
      <template v-if="!isFinished">
        <button @click="handleComplete" class="btn btn-share">确认盖印</button>
      </template>

      <template v-else>
        <button @click="$emit('onRestart')" class="btn btn-back">返回主页</button>
        <button @click="shareWork" class="btn btn-share">分享印记</button>
      </template>
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
/* 保持原有布局样式 */
.result-container {
  width: 100%; max-width: 1300px; margin: 0 auto; padding: 40px 20px;
  display: flex; flex-direction: column; align-items: center; min-height: 100vh; box-sizing: border-box;
}

.header-section { text-align: center; margin-bottom: 40px; }
.brand-tag { font-size: 14px; color: #FFC03A; letter-spacing: 4px; font-weight: 600; margin-bottom: 4px; }
.title { font-size: 42px; color: #2a2a2a; margin: 0; font-family: "STKaiti", "KaiTi", serif; font-weight: 900; }
.title-line { width: 40px; height: 3px; background: #FFC03A; margin: 12px auto 0; border-radius: 2px; }

.showcase { 
  display: flex; 
  align-items: flex-start; /* 改为对齐顶部，方便通过 margin 微调垂直位置 */
  justify-content: center; 
  width: 100%; 
  max-width: 1200px; /* 限制最大宽度，防止大屏拉得太开 */
}

/* 左右两边平分空间 */
.side-item-left, .side-item-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center; /* 保证内部石材和印记在自己的区域内居中 */
}

/* 修正右侧因为有选色器导致的视觉偏移 */
.side-item-right {
  /* 这里的 margin-right 抵消掉选色器的宽度(42px)和间距(30px)，大约 72px */
  /* 这样印记盒子的中心点就能和左边石材的中心点对称 */
  padding-right: 0; 
}

.tag-wrapper {
  width: 360px;
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

/* 这里的选择器表示：只针对右侧容器内的标签包装器进行位移 */
.side-item-right .tag-wrapper {
  position: relative;
  /* 向左微调的数值 = (选色器宽度 42px + 间距 30px) / 2 
     大约在 -36px 左右，你可以根据视觉效果加减这个值
  */
  left: -36px; 
}

.tag { background: #323232; color: white; padding: 4px 16px; border-radius: 50px; font-size: 12px; font-weight: bold; }

.side-by-side-content { display: flex; align-items: center; gap: 30px; }

.stone-box { 
  width: 360px; height: 360px; background: #444; border: 8px solid #555; border-radius: 20px;
  position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); filter: url(#stone-cut);
}

.frame-container {
  width: 360px;
  height: 360px;
  padding: 10px;
  border-radius: 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 确保超出圆角的部分被物理隐藏，这样蒙版效果更佳 */
  overflow: hidden; 
  /* 移除可能存在的 outline 或边框产生的杂色 */
  border: none;
  background-clip: padding-box;
}

.paper-box { 
  width: 100%; height: 100%; background: #fdfdfb; border-radius: 12px;
  position: relative; overflow: hidden; box-shadow: inset 0 0 15px rgba(0,0,0,0.05); filter: url(#stone-cut);
}

/* 中间箭头：给固定宽度，确保它不动如山 */
.process-arrow {
  width: 100px; /* 增加空间，让两侧拉开距离 */
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 200px; /* 对应 360px 盒子中心的高度 (180px) + tag 高度微调 */
  gap: 12px;
}
.arrow-container { position: relative; width: 60px; height: 20px; display: flex; align-items: center; animation: smoothBreath 3s infinite ease-in-out; }
.arrow-container .line { width: 100%; height: 3px; background: #FFC03A; border-radius: 2px; }
.arrow-container .head { position: absolute; right: 0; width: 10px; height: 10px; border-top: 2px solid #FFC03A; border-right: 2px solid #FFC03A; transform: rotate(45deg); }
.arrow-text { font-size: 13px; color: #FFC03A; font-weight: bold; letter-spacing: 2px; white-space: nowrap; }

.ink-selector-vertical {
  display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.7);
  padding: 18px 8px; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); width: 42px; align-items: center;
  transition: all 0.5s ease; /* 禁用时的平滑过渡 */
}
.color-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; }
.color-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.1); transition: all 0.2s ease; }
.color-dot.active { transform: scale(1.2); border-color: #FFC03A; }
.ink-name-small { font-size: 10px; color: #999; transform: scale(0.85); white-space: nowrap; }


.final-actions { display: flex; justify-content: center; gap: 150px; margin-top: 60px; width: 100%; }
.btn { padding: 13px 40px; border-radius: 50px; border: none; font-weight: bold; font-size: 16px; cursor: pointer; transition: all 0.2s ease; letter-spacing: 1px; min-width: 160px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); }
.btn-back { background: white; color: #FFC03A; border: 1px solid #FFC03A; }
.btn-back:hover { background: #FFF8ED; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(255, 192, 58, 0.2); }
.btn-share { background: #FFC03A; color: white; border: 2px solid #FFC03A; }
.btn-share:hover { background: #FFB300; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255, 192, 58, 0.4); }

.paper-texture { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url("../assets/handmade-paper.png"); opacity: 0.4; z-index: 1; }
.color-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; mask-size: cover; -webkit-mask-size: cover; }
.mirror { transform: scaleX(-1); }

.screenshot-layer {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 99;
  display: flex; align-items: center; justify-content: center;
}
.seal-white-trace { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }

@keyframes smoothBreath {
  0%, 100% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1;}
}

@media (max-width: 1000px) {
  .showcase { flex-direction: column; gap: 40px; }
  .process-arrow { transform: rotate(90deg); margin: 0; }
  .tag-wrapper, .stone-box, .frame-container { width: 300px; height: 300px; }
  .tag-wrapper { height: auto; }
}
</style>