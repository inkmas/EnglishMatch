<template>
  <div class="main-container">
    <div class="aside-panel">
      <el-card shadow="hover">
        <template #header>
          <span>🎓 学生储备库 ({{ studentStore.allStudents.length }}人)</span>
        </template>

        <div class="student-library">
          <div class="library-scroll-node">
            <el-tag
                v-for="name in studentStore.allStudents"
                :key="name"
                class="student-tag"
                effect="light"
                round
            >
              {{ name }}
            </el-tag>
          </div>
        </div>

        <el-divider>筛选方式</el-divider>
        <div class="button-group rule-grid">
          <el-button @click="switchMode('multiple')" :disabled="isSpinning" type="primary">
            按倍数模式
          </el-button>
          <el-button @click="switchMode('content')" :disabled="isSpinning" type="success">
            包含数字模式
          </el-button>
          <el-button
              type="info"
              @click="lotteryRules = []"
              :disabled="isSpinning"
          >
            清空规则池
          </el-button>
        </div>

        <div class="list-title">🎯 当前待抽规则 ({{ lotteryRules.length }}个)</div>
        <div class="selected-list">
          <el-tag
              v-for="(rule, index) in lotteryRules"
              :key="index"
              closable
              @close="lotteryRules.splice(index, 1)"
              type="warning"
              effect="plain"
              class="rule-tag"
          >
            {{ rule.name }}
          </el-tag>
        </div>
      </el-card>
    </div>

    <div class="wheel-section">
      <h1 class="title">🎡 幸运大转盘</h1>
      <div class="wheel-container">
        <div class="pointer"></div>
        <div class="wheel" :style="wheelStyle">
          <div
              v-for="(rule, index) in lotteryRules"
              :key="index"
              class="name-wrapper"
              :style="getNameWrapperStyle(index)"
          >
            <span class="name-text">{{ rule.name }}</span>
          </div>
        </div>
      </div>

      <el-button
          type="danger"
          size="large"
          @click="startSpin"
          :loading="isSpinning"
          class="spin-btn"
      >
        {{ isSpinning ? '正在旋转...' : '立即开奖' }}
      </el-button>

      <div v-if="winner" class="winner-result-area animate-fade-in">
        <el-card shadow="never" class="winner-card">
          <div class="winner-hint">
            🎉 恭喜中奖规则：<span class="highlight">{{ winner }}</span> 🎉
          </div>

          <div class="winner-list">
            <el-tag
                v-for="name in winningGroup"
                :key="name"
                type="danger"
                effect="dark"
                class="winner-tag"
            >
              {{ name }}
            </el-tag>
          </div>

          <p class="winner-count">共 {{ winningGroup.length }} 人中奖</p>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudentStore } from '@/stores/students.ts'
import { ElMessage } from 'element-plus'

// 1. 定义可选的规则池
const MULTIPLE_RULES = [
  { name: '4的倍数', value: 4, type: 'multiple' },
  { name: '5的倍数', value: 5, type: 'multiple' },
  { name: '6的倍数', value: 6, type: 'multiple' },
  { name: '7的倍数', value: 7, type: 'multiple' },
  { name: '8的倍数', value: 8, type: 'multiple' },
  { name: '9的倍数', value: 9, type: 'multiple' },
  { name: '素数学号', value: 'prime', type: 'prime' }
]

const CONTENT_RULES = [
  { name: '包含数字1', value: '1', type: 'contains' },
  { name: '包含数字2', value: '2', type: 'contains' },
  { name: '包含数字3', value: '3', type: 'contains' },
  { name: '包含数字4', value: '4', type: 'contains' },
  { name: '包含数字5', value: '5', type: 'contains' },
  { name: '包含数字6', value: '6', type: 'contains' },
  { name: '包含数字7', value: '7', type: 'contains' },
  { name: '包含数字8', value: '8', type: 'contains' },
  { name: '包含数字9', value: '9', type: 'contains' },
]

// 2. 将 lotteryRules 改为 ref，默认显示倍数
const lotteryRules = ref([...MULTIPLE_RULES])

const winningGroup = ref<string[]>([]) // 存储中奖的那一组人

const studentStore = useStudentStore()
const isSpinning = ref(false)
const rotation = ref(0)
const winner = ref("")

// 判断是否为素数
const isPrime = (num: number) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const switchMode = (mode: 'multiple' | 'content') => {
  if (isSpinning.value) return

  // 切换规则
  lotteryRules.value = mode === 'multiple' ? [...MULTIPLE_RULES] : [...CONTENT_RULES]

  // 重置状态
  winner.value = ""
  winningGroup.value = []
  rotation.value = 0

  ElMessage.success(`已切换至${mode === 'multiple' ? '倍数' : '数字包含'}模式`)
}

// 根据数学规则筛选
const pickByRule = (rule: number | 'prime') => {
  let selected: string[] = [];

  if (rule === 'prime') {
    // 筛选素数（假设学号是字符串，需转为数字判断）
    selected = studentStore.allStudents.filter(name => isPrime(parseInt(name)));
  } else {
    // 筛选倍数 (4, 5, 6...)
    selected = studentStore.allStudents.filter(name => parseInt(name) % rule === 0);
  }

  if (selected.length === 0) {
    ElMessage.info('未找到符合条件的学号');
    return;
  }

  // 更新到转盘
  studentStore.setStudents(selected);
  winner.value = "";
  rotation.value = 0;
  ElMessage.success(`已加载 ${selected.length} 个符合条件的学号`);
};

// 转盘扇区颜色计算
const wheelStyle = computed(() => {
  const count = lotteryRules.value.length;
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9b59b6', '#34495e', '#16a085']
  const gradient = lotteryRules.value.map((_, i) => {
    return `${colors[i % colors.length]} ${(i * 360) / count}deg ${((i + 1) * 360) / count}deg`
  }).join(',')
  return {
    transform: `rotate(${rotation.value}deg)`,
    background: `conic-gradient(${gradient})`
  }
})

// 文字角度旋转
const getNameWrapperStyle = (index: number) => {
  const angle = 360 / lotteryRules.value.length
  return { transform: `rotate(${index * angle + angle / 2}deg)` }
}

// 核心抽奖算法
const startSpin = () => {
  if (isSpinning.value) return

  isSpinning.value = true
  winner.value = ""
  winningGroup.value = []

  const count = lotteryRules.value.length
  const randomIndex = Math.floor(Math.random() * count)
  const anglePerItem = 360 / count

  // 计算旋转角度
  const targetAngle = 360 - (randomIndex * anglePerItem + anglePerItem / 2)
  const extraRounds = (Math.floor(Math.random() * 5) + 7) * 360
  const baseRotation = rotation.value - (rotation.value % 360)
  rotation.value = baseRotation + extraRounds + targetAngle

  setTimeout(() => {
    isSpinning.value = false
    const selectedRule = lotteryRules.value[randomIndex] // 注意这里加了 .value

    if (selectedRule) {
      winner.value = selectedRule.name;

      // 💡 这里的逻辑需要根据新的 type 进行扩展
      if (selectedRule.type === 'prime') {
        winningGroup.value = studentStore.allStudents.filter(name => isPrime(parseInt(name)))
      }
      else if (selectedRule.type === 'multiple') {
        const num = selectedRule.value as number
        winningGroup.value = studentStore.allStudents.filter(name => parseInt(name) % num === 0)
      }
      else if (selectedRule.type === 'contains') {
        const char = selectedRule.value as string;

        winningGroup.value = studentStore.allStudents.filter(name => {
          // 1. 先把学号转为字符串
          const nameStr = String(name);
          // 2. 去掉可能存在的“号”字，只取数字部分进行末尾匹配
          // 或者直接判断：如果包含该数字且该数字在最后（考虑“号”字的情况）
          const pureNumber = nameStr.replace('号', '');
          return pureNumber.endsWith(char);
        });
      }
    }
  }, 4000)
}
</script>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 顶部对齐，防止下方撑大时带动整体移动 */
  gap: 40px;
  padding: 20px;
  width: 100%;
}

.aside-panel {
  width: 350px;
  flex-shrink: 0; /* 核心：防止左侧被压缩 */
}

.student-library { height: 200px; overflow-y: auto; border: 1px solid #ebeef5; padding: 10px; border-radius: 8px; background: #fafafa; }
.library-scroll-node { display: flex; flex-wrap: wrap; gap: 8px; }
.button-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.full-btn { grid-column: span 2; }
.selected-list { min-height: 80px; padding: 12px; border: 1px dashed #dcdfe6; border-radius: 8px; display: flex; flex-wrap: wrap; gap: 8px; }

.wheel-section {
  flex: 1; /* 占据剩余空间 */
  max-width: 500px; /* 核心：限制右侧最大宽度，不让它往外扩 */
  display: flex;
  flex-direction: column;
  align-items: center;
}
.wheel-container { position: relative; width: 340px; height: 340px; border: 12px solid #333; border-radius: 50%; margin: 0 auto 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.wheel { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; position: relative; transition: transform 4s cubic-bezier(0.15, 0, 0.15, 1); }
.pointer { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 18px solid transparent; border-right: 18px solid transparent; border-top: 45px solid #f56c6c; z-index: 10; }

.name-wrapper { position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; justify-content: center; align-items: flex-start; }
.name-text { margin-top: 35px; font-size: 16px; font-weight: bold; color: #fff; writing-mode: vertical-rl; text-orientation: upright; text-shadow: 1px 1px 2px rgba(0,0,0,0.6); }

.rule-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  margin-top: 10px;
}

.rule-grid .el-button {
  width: 100%;
  margin-left: 0 !important;
  margin-right: 0;
  box-sizing: border-box;
}

.full-btn {
  grid-column: span 2;
}

/* 1. 核心结果容器：限制宽度 */
.winner-result-area {
  margin-top: 20px;
  /* 💡 关键：限制最大宽度，防止撑大页面。根据你的转盘区域宽度调整 */
  max-width: 400px;
  /* 居中对齐，如果需要靠左可以改为 margin-left: 0 */
  margin-left: auto;
  margin-right: auto;
  /* 提高层级 */
  position: relative;
  z-index: 5;
}

/* 2. el-card 内部样式：增加一点虚线边框效果 */
.winner-card {
  background: #fef0f0;
  border: 1px dashed #fde2e2 !important; /* 虚线更高级 */
  border-radius: 8px;
  padding: 10px;
}

/* 3. 中奖学号列表：强制换行 */
.winner-list {
  display: flex;
  flex-wrap: wrap;      /* 核心：允许标签自动折行 */
  justify-content: center; /* 标签在行内居中 */
  gap: 8px;             /* 标签间距 */
  margin: 15px 0;
  width: 100%;          /* 填满 card 宽度 */
}

/* 4. 标签样式微调 */
.winner-tag {
  font-size: 14px;
  font-weight: bold;
  padding: 4px 8px;
}

/* 5. 其他辅助样式 */
.winner-hint {
  text-align: center;
  font-size: 16px;
  margin-bottom: 5px;
}
.highlight {
  color: #f56c6c;
  font-weight: bold;
}
.winner-count {
  text-align: center;
  color: #909399;
  font-size: 13px;
  margin: 0;
}
</style>
