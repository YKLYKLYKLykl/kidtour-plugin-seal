<script setup>
import { ref } from 'vue';
import HomeView from './components/HomeView.vue';
import TemplateGallery from './components/TemplateGallery.vue';
import EditorView from './components/EditorView.vue';
import ResultView from './components/ResultView.vue';
import PuzzleGame from './components/PuzzleGame.vue'; // 引入新组件

// 状态管理：home | gallery | editor | result
const currentStep = ref('home');
const gameMode = ref(''); // 'classic' | 'free'
const selectedTemplate = ref(null);
const finalResult = ref({ stoneUrl: '', stampUrl: '' });

// 逻辑跳转
const startClassic = () => { gameMode.value = 'classic'; currentStep.value = 'gallery'; };
const startFree = () => { gameMode.value = 'free'; selectedTemplate.value = null; currentStep.value = 'editor'; };
const onSelectTemplate = (temp) => { selectedTemplate.value = temp; currentStep.value = 'editor'; };
const startPuzzle = () => { currentStep.value = 'puzzle'; };
const onComplete = (data) => { finalResult.value = data; currentStep.value = 'result'; };
const restart = () => { 
  currentStep.value = 'home'; 
  selectedTemplate.value = null; 
  gameMode.value = '';
};
const handleEditorBack = () => {
  if (gameMode.value === 'classic') {
    // 如果是经典模式，回到模板页
    currentStep.value = 'gallery';
  } else {
    // 如果是自由模式，回到首页
    currentStep.value = 'home';
    selectedTemplate.value = null;
  }
};
</script>

<template>
  <div class="app-container">
    <HomeView v-if="currentStep === 'home'" @onClassic="startClassic" @onFree="startFree" @onPuzzle="startPuzzle" />
    <PuzzleGame v-if="currentStep === 'puzzle'" @onBack="currentStep = 'home'" />
    
    <TemplateGallery v-if="currentStep === 'gallery'" @onSelect="onSelectTemplate" @onBack="currentStep = 'home'" />
    
    <EditorView 
      v-if="currentStep === 'editor'" 
      :template="selectedTemplate" 
      @onFinish="onComplete" 
      @onBack="handleEditorBack" 
    />
    
    <ResultView v-if="currentStep === 'result'" :result="finalResult" @onRestart="restart" />
  </div>
</template>

<style>
/* 1. 基础设置 */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  /* 修改：去掉 overflow: hidden，改用 min-height 允许内容撑开页面 */
  min-height: 100%;
  background-color: #F9F8F5;
  /* 允许纵向滚动，但隐藏横向滚动条 */
  overflow-x: hidden; 
  overflow-y: auto; 
}

#app {
  width: 100%;
  /* height: 100%; */
}

/* 2. 外层容器布局平衡 */
.app-container {
  width: 100vw;
  /* 修改：由固定的 100vh 改为最小高度 100vh */
  min-height: 100vh; 
  display: flex;
  justify-content: center;
  /* 修改：去掉 align-items: center，防止内容过多时顶部被挤出屏幕 */
  align-items: flex-start; 
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* 3. 针对首页 HomeView 的特殊处理 */
/* 当你在首页时，我们依然希望它垂直居中 */
.app-container:has(.home-container),
.app-container:has(.editor-container) {
  align-items: center;
}
</style>