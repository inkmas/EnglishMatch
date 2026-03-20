<template>
  <div class="english-match-container">
    <div class="game-main" v-if="vocabStore.vocabList.length">
      <h1 class="game-title">🎮 英语消消乐</h1>

      <div class="timer-box">
        游戏用时：<span class="timer-text">{{ formattedTime }}</span>
      </div>

      <div class="bubble-container">
        <div
            v-for="(item, index) in bubbleList"
            :key="index"
            class="bubble"
            :class="{ selected: selectedIndexes.includes(index) }"
            :style="{ backgroundColor: item.color }"
            @click="handleBubbleClick(index)"
            v-show="!hiddenIndexes.includes(index)"
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

// 初始化
const router = useRouter();
const vocabStore = useVocabStore();

interface BubbleItem {
  text: string;
  pair: string;
  color: string;
}

// 响应式状态
const bubbleList = ref<BubbleItem[]>([]);
const selectedIndexes = ref<number[]>([]);
const hiddenIndexes = ref<number[]>([]);
const gameStarted = ref(false);
const elapsedSeconds = ref(0);
// 💡 修复：将类型改为 number | undefined 解决 NodeJS 报错
const timerInterval = ref<number | undefined>(undefined);
const gameOverVisible = ref(false);

// 时间格式化
const formattedTime = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0');
  const s = (elapsedSeconds.value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
});

const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 60%)`;
};

// 停止计时器封装
const stopTimer = () => {
  if (timerInterval.value !== undefined) {
    window.clearInterval(timerInterval.value);
    timerInterval.value = undefined;
  }
};

// 初始化游戏
const initGame = () => {
  selectedIndexes.value = [];
  hiddenIndexes.value = [];
  gameStarted.value = false;
  elapsedSeconds.value = 0;
  gameOverVisible.value = false;
  stopTimer();

  if (vocabStore.vocabList.length === 0) return;

  const bubbleItems: BubbleItem[] = [];
  vocabStore.vocabList.forEach((item) => {
    const color = getRandomColor();
    bubbleItems.push({ text: item.en, pair: item.cn, color });
    bubbleItems.push({ text: item.cn, pair: item.en, color });
  });

  bubbleList.value = bubbleItems.sort(() => Math.random() - 0.5);
};

const startTimer = () => {
  if (gameStarted.value) return;
  gameStarted.value = true;
  timerInterval.value = window.setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
};

const handleBubbleClick = (index: number) => {
  if (selectedIndexes.value.includes(index) || hiddenIndexes.value.includes(index)) return;

  if (!gameStarted.value) startTimer();

  selectedIndexes.value.push(index);

  if (selectedIndexes.value.length === 2) {
    const [i1, i2] = selectedIndexes.value;

    if (i1 === undefined || i2 === undefined || isNaN(i1) || isNaN(i2)) {
      selectedIndexes.value = []; // 重置选中状态
      ElMessage.warning('选中状态异常，请重新选择');
      return;
    }


    const b1 = bubbleList.value[i1];
    const b2 = bubbleList.value[i2];

    // 💡 修复：增加非空校验 b1 && b2
    if (b1 && b2 && b1.pair === b2.text) {
      setTimeout(() => {
        hiddenIndexes.value.push(i1, i2);
        selectedIndexes.value = [];

        if (hiddenIndexes.value.length === bubbleList.value.length) {
          stopTimer();
          gameOverVisible.value = true;
        }
      }, 300);
    } else {
      setTimeout(() => {
        selectedIndexes.value = [];
      }, 500);
    }
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
  router.push('/vocab-upload');
};

watch(() => vocabStore.vocabList, (list) => {
  if (list.length) initGame();
}, { deep: true });

onMounted(initGame);
onUnmounted(stopTimer);
</script>

<style scoped>
.english-match-container {
  padding: 40px 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.game-title {
  text-align: center;
  color: #1a1a1a;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.timer-box {
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.2rem;
}

.timer-text {
  color: #409eff;
  font-family: monospace;
  font-weight: bold;
}

.bubble-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 120px));
  gap: 20px;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto 40px;
}

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

.bubble:hover {
  transform: translateY(-5px);
}

.bubble.selected {
  transform: scale(1.1);
  box-shadow: 0 0 0 4px #fff, 0 0 20px #409eff;
}

.bubble-text {
  font-size: 0.9rem;
  word-break: break-word;
}

.game-actions {
  text-align: center;
}

.game-over-content {
  text-align: center;
}

.over-time {
  font-size: 2rem;
  color: #f56c6c;
  margin: 20px 0;
}
</style>