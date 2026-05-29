<template>
  <div class="home-container">
    <div class="header-section">
      <div class="mascot-wrapper">
        <img src="../assets/cat-seal.png" alt="吉祥物" class="mascot-img" />
      </div>
      <div class="title-content">
        <div class="badge">✨ 非遗小课堂</div>
        <h1>篆刻工坊</h1>
      </div>
    </div>
    
    <div class="options">
      <div class="opt-card classic" @click="$emit('onClassic')">
        <div class="hover-mascot">
          <img src="../assets/cat-seal.png" alt="hover-img" />
        </div>
        <div class="card-content">
          <div class="icon">📜</div>
          <div class="text">
            <h3>经典复刻</h3>
            <p>临摹古人印迹</p>
          </div>
        </div>
      </div>

      <div class="opt-card free" @click="$emit('onFree')">
        <div class="hover-mascot">
          <img src="../assets/cat-seal.png" alt="hover-img" />
        </div>
        <div class="card-content">
          <div class="icon">🎨</div>
          <div class="text">
            <h3>自由创作</h3>
            <p>刻下你的作品</p>
          </div>
        </div>
      </div>
      
      <div class="opt-card puzzle" @click="$emit('onPuzzle')">
  <div class="hover-mascot">
    <img src="../assets/cat-seal.png" alt="hover-img" />
  </div>
  <div class="card-content">
    <div class="icon">🧩</div>
    <div class="text">
      <h3>旋转乾坤</h3>
      <p>还原名章布局</p>
    </div>
  </div>
</div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 顶部组合排版：左图右文 */
.header-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 60px;
}

.title-content {
  text-align: left; /* 文字左对齐配合排版 */
}

.mascot-img {
  width: 160px;
  height: auto;
  filter: drop-shadow(0 8px 12px rgba(0,0,0,0.1));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

h1 {
  font-size: 64px;
  color: #323232;
  margin: 5px 0 0;
}

.badge {
  display: inline-block;
  font-size: 18px;
  color: #666;
}

/* 选项区域：分散对齐 */
.options {
  display: flex;
  gap: 60px; /* 增加间距让卡片分散 */
  justify-content: center;
}

/* 长方形卡片样式 */
.opt-card {
  position: relative; /* 为悬停出现的图片做定位 */
  width: 500px; /* 宽度加大，变成长方形 */
  padding: 30px;
/* border: 4px solid rgba(0, 0, 0, 0.05); */
border: 4px solid transparent; /* 保持边框占位，防止 hover 时跳动 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); /* 用非常淡的阴影来勾勒形状 */
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: #FFFFFF;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

.card-content {
  display: flex;
  align-items: center; /* 图标与文字垂直对齐 */
  justify-content: flex-start; /* 确保从左侧开始排列 */
  padding-left: 20px; 
  /* 【核心调节 2】：图标和文字之间的间距 */
  gap: 30px;
  
}

.icon {
  font-size: 40px;
}

.text {
  text-align: center; 
}

.text h3 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.text p {
  margin: 5px 0 0;
  color: #888;
}

/* 悬停时出现的图片逻辑 */
.hover-mascot {
  position: absolute;
  top: -60px; /* 放在卡片边缘上方 */
  right: 10px;
  width: 80px;
  opacity: 0;
  transform: translateY(20px) scale(0.5);
  transition: all 0.4s ease;
  pointer-events: none;
}

.hover-mascot img {
  width: 100%;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1));
}

/* 悬停动效 */
.opt-card:hover {
  transform: translateY(-10px);
  border-color: #FFC03A;
  background: #FFFDF9;
  box-shadow: 0 15px 30px rgba(255, 192, 58, 0.1);
}

.opt-card:hover .hover-mascot {
  opacity: 1;
  transform: translateY(0) scale(1) rotate(-10deg); /* 出现时带一点倾斜更俏皮 */
}

/* 移动端适配 */
@media (max-width: 900px) {
  .header-section {
    flex-direction: column;
    text-align: center;
  }
  .title-content { text-align: center; }
  .options {
    flex-direction: column;
    gap: 30px;
    align-items: center;
  }
  .opt-card { width: 90%; }
}
</style>