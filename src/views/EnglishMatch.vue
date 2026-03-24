<template>
  <div class="english-match-container" :class="{ 'is-empty': !vocabStore.vocabList.length }">
    <div class="game-main" v-if="vocabStore.vocabList.length">
      <h1 class="game-title">🎮 英语消消乐</h1>

      <div class="timer-box">
        游戏用时：<span class="timer-text">{{ formattedTime }}</span>
        <span class="divider"> | </span>
        错误次数：<span class="wrong-text">{{ wrongCount }}</span>
      </div>

      <div class="bubble-container" ref="containerRef">
        <svg class="connection-layer" v-if="lineCoords">
          <line
              :x1="lineCoords.x1" :y1="lineCoords.y1"
              :x2="lineCoords.x2" :y2="lineCoords.y2"
              stroke="#409eff"
              stroke-width="8"
              stroke-linecap="round"
              class="connection-line"
          />
        </svg>

        <div
            v-for="(item, index) in bubbleList"
            :key="index"
            :ref="(el) => (bubbleRefs[index] = el)"
            class="bubble"
            :class="{
              selected: selectedIndexes.includes(index),
              'match-success': isMatchSuccess && selectedIndexes.includes(index),
              'match-error': isMatchError && selectedIndexes.includes(index),
              'is-hidden': hiddenIndexes.includes(index)
            }"
            :style="{ backgroundColor: item.color }"
            @click="handleBubbleClick(index)"
        >
          <span class="bubble-text">{{ item.text }}</span>
        </div>
      </div>

      <div class="game-actions">
        <el-button type="primary" size="large" @click="restartGame">重新开始</el-button>
        <el-button type="warning" size="large" @click="resetGame">重置游戏</el-button>
      </div>
    </div>

    <div class="empty-tip" v-else>
      <el-empty description="暂无词汇数据，请先上传词汇文件 📄" />
      <el-button
          type="primary"
          size="large"
          class="goto-upload-btn"
          @click="handleGotoUpload"
      >
        前往上传词汇
      </el-button>
    </div>

    <el-dialog
        v-model="gameOverVisible"
        title="🎉 挑战成功！"
        width="350px"
        center
        :close-on-click-modal="false"
        :show-close="false"
    >
      <div class="game-over-content">
        <p class="over-time">总用时：{{ formattedTime }}</p>
        <p class="over-wrong">错误次数：{{ wrongCount }} 次</p>
        <p class="over-count">共匹配 {{ vocabStore.vocabList.length }} 组词汇</p>
        <el-button type="primary" size="large" @click="restartGame">再来一局</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { ElDialog, ElButton, ElEmpty, ElMessage, ElMessageBox } from 'element-plus';
import { useVocabStore } from '@/stores/vocab';
import { useRouter } from 'vue-router';

const router = useRouter();
const vocabStore = useVocabStore();

interface BubbleItem {
  text: string;
  pair: string;
  color: string;
}

const PRESET_COLORS = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9b59b6', '#34495e', '#16a085', '#e74c3c',
  '#2ecc71', '#d35400', '#c0392b', '#1dd1a1', '#ff9f43', '#5f27cd', '#22a6b3', '#3ae374'
];

const bubbleList = ref<BubbleItem[]>([]);
const selectedIndexes = ref<number[]>([]);
const hiddenIndexes = ref<number[]>([]);
const gameStarted = ref(false);
const elapsedSeconds = ref(0);
const timerInterval = ref<number | undefined>(undefined);
const gameOverVisible = ref(false);

const containerRef = ref<HTMLElement | null>(null);
const bubbleRefs = ref<any[]>([]); // 存储气泡的 DOM 引用
const lineCoords = ref<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
const isMatchSuccess = ref(false);

const wrongCount = ref(0);
const isMatchError = ref(false);

const formattedTime = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0');
  const s = (elapsedSeconds.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
};

const stopTimer = () => {
  if (timerInterval.value !== undefined) {
    window.clearInterval(timerInterval.value);
    timerInterval.value = undefined;
  }
};

const initGame = () => {
  selectedIndexes.value = [];
  hiddenIndexes.value = [];
  gameStarted.value = false;
  elapsedSeconds.value = 0;
  gameOverVisible.value = false;
  wrongCount.value = 0;
  stopTimer();

  if (vocabStore.vocabList.length === 0) return;

  const count = vocabStore.vocabList.length;
  const bubbleItems: BubbleItem[] = [];

  let enColors = shuffleArray(PRESET_COLORS);
  let cnColors = shuffleArray(PRESET_COLORS);

  if (count > PRESET_COLORS.length) {
    enColors = Array(Math.ceil(count / PRESET_COLORS.length)).fill(enColors).flat();
    cnColors = Array(Math.ceil(count / PRESET_COLORS.length)).fill(cnColors).flat();
  }

  vocabStore.vocabList.forEach((item, index) => {
    const enColor = enColors[index % enColors.length]!;
    const cnColor = cnColors[index % cnColors.length]!;

    bubbleItems.push({ text: item.en, pair: item.cn, color: enColor });
    bubbleItems.push({ text: item.cn, pair: item.en, color: cnColor });
  });

  bubbleList.value = shuffleArray(bubbleItems);
};

const startTimer = () => {
  if (gameStarted.value) return;
  gameStarted.value = true;
  timerInterval.value = window.setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
};

const handleBubbleClick = (index: number) => {
  // 1. 基础拦截：已选中或已隐藏的不触发
  if (selectedIndexes.value.includes(index) || hiddenIndexes.value.includes(index)) return;

  // 如果正在播放错误抖动动画，不允许点击，防止连续操作导致状态混乱
  if (isMatchError.value) return;

  // 2. 第一次点击启动计时
  if (!gameStarted.value) startTimer();

  // 3. 记录点击索引
  selectedIndexes.value.push(index);

  // 4. 当选中两个气泡时进行逻辑判断
  if (selectedIndexes.value.length === 2) {
    const [i1, i2] = selectedIndexes.value;
    if (i1 === undefined || i2 === undefined) {
      selectedIndexes.value = [];
      return;
    }

    const b1 = bubbleList.value[i1];
    const b2 = bubbleList.value[i2];

    if (b1 && b2 && b1.pair === b2.text) {
      // ✅ 匹配成功
      isMatchSuccess.value = true;

      // 💡 核心修改：延迟 50ms 计算连线
      // 理由：点击后 bubble 会立即触发 .selected 的 scale(1.1) 动画。
      // 稍微延迟可以避开浏览器布局抖动的最高峰，使 getBoundingClientRect 抓取更稳。
      setTimeout(() => {
        calculateLine(i1, i2);
      }, 50);

      // 500ms 后移除气泡和连线
      setTimeout(() => {
        hiddenIndexes.value.push(i1, i2);
        selectedIndexes.value = [];
        lineCoords.value = null; // 清除连线
        isMatchSuccess.value = false;

        if (hiddenIndexes.value.length === bubbleList.value.length) {
          stopTimer();
          gameOverVisible.value = true;
        }
      }, 550);
    } else {
      // ❌ 匹配失败：500ms 后清空选中状态
      wrongCount.value++;
      isMatchError.value = true;
      setTimeout(() => {
        selectedIndexes.value = [];
        isMatchError.value = false;
      }, 500);
    }
  }
};

const calculateLine = (idx1: number, idx2: number) => {
  const el1 = bubbleRefs.value[idx1];
  const el2 = bubbleRefs.value[idx2];
  const container = containerRef.value;

  if (el1 && el2 && container) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // 💡 核心修正：
    // 使用 scrollLeft/Top 补偿或者确保计算的是元素的中心点
    // 考虑到 scale(1.1) 会让 rect 的 left/top 发生偏移
    // 我们手动计算不受缩放影响的中心点：

    const centerX = (rect: DOMRect) => rect.left + rect.width / 2 - containerRect.left;
    const centerY = (rect: DOMRect) => rect.top + rect.height / 2 - containerRect.top;

    lineCoords.value = {
      x1: centerX(rect1),
      y1: centerY(rect1),
      x2: centerX(rect2),
      y2: centerY(rect2)
    };
  }
};

const restartGame = () => {
  initGame();
  ElMessage.success('新游戏已开始');
};

const resetGame = () => {
  ElMessageBox.confirm('确定重置吗？', '提示', { type: 'warning' }).then(() => {
    initGame();
  });
};

const handleGotoUpload = () => {
  router.push('/upload'); // 确保这里的路径和你 router 配置的一致
};

watch(() => vocabStore.vocabList, (list) => {
  if (list.length) initGame();
}, { deep: true });

watch(() => bubbleList.value, () => {
  bubbleRefs.value = [];
});

onMounted(initGame);
onUnmounted(stopTimer);
</script>

<style scoped>
/* 1. 基础容器布局 */
.english-match-container {
  padding: 40px 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.english-match-container.is-empty {
  justify-content: center;
  align-items: center;
}

.game-main { width: 100%; max-width: 1200px; margin: 0 auto; }
.game-title { text-align: center; color: #1a1a1a; font-size: 2.5rem; margin: 0 0 10px 0; }
.timer-box { text-align: center; margin-bottom: 30px; font-size: 1.2rem; }
.timer-text { color: #409eff; font-family: monospace; font-weight: bold; }

/* 2. 气泡容器 - 间距已调大 */
.bubble-container {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 120px));
  gap: 40px; /* 间距变大 */
  justify-content: center;
  margin-bottom: 40px;
  padding: 20px;
}

/* 3. 气泡基础样式 */
.bubble {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  font-weight: bold;
  padding: 15px;
  box-sizing: border-box;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  user-select: none;
}

.bubble.is-hidden {
  /* 关键：隐藏内容但保留物理占位，防止位置移动 */
  visibility: hidden;
  opacity: 0;
  pointer-events: none; /* 确保隐藏后无法再点击 */
  transform: scale(0); /* 增加缩小的视觉效果 */
  transition: all 0.3s ease;
}

.bubble:hover { transform: translateY(-5px); }

/* 4. 💡 核心统一：气泡选中状态 */
.bubble.selected {
  transform: scale(1.1);
  /* 白色描边 + 蓝色光晕 */
  box-shadow: 0 0 0 4px #fff, 0 0 20px #409eff;
}

/* 5. 💡 核心统一：匹配成功状态 */
.bubble.match-success {
  transform: scale(1.15);
  box-shadow: 0 0 0 4px #fff, 0 0 25px #409eff; /* 稍微增强一点光晕 */
  z-index: 11;
}

.bubble-text { font-size: 1rem; line-height: 1.2; word-break: break-word; }

/* 6. 💡 核心统一：SVG 连线层 */
.connection-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 10;
}

.connection-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 0.4s ease forwards;
  /* 💡 连线光晕颜色与气泡 box-shadow 一致 */
  stroke-width: 6px; /* 稍微细一点显得更精准 */
  filter: drop-shadow(0 0 5px rgba(64, 158, 255, 0.8));
}

@keyframes drawLine { to { stroke-dashoffset: 0; } }

/* 7. 其他 UI 样式 */
.game-actions { text-align: center; margin-bottom: 20px; }
.empty-tip { display: flex; flex-direction: column; align-items: center; }
.goto-upload-btn { margin-top: -10px; }
.game-over-content { text-align: center; }
.over-time { font-size: 2rem; color: #f56c6c; margin: 20px 0; }

.divider {
  margin: 0 15px;
  color: #dcdfe6;
}

.wrong-text {
  color: #f56c6c; /* 使用红色提醒错误 */
  font-weight: bold;
}

.over-wrong {
  font-size: 1.2rem;
  color: #606266;
  margin-bottom: 10px;
}

.bubble.match-error {
  box-shadow: 0 0 0 4px #fff, 0 0 25px #f56c6c !important;
  transform: scale(1.1) !important;
  z-index: 11;
  transition: box-shadow 0.2s ease, transform 0.2s ease !important;
}
</style>