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

        <el-divider>快速操作</el-divider>
        <div class="button-group rule-grid">
          <el-button type="primary" @click="pickRandom(5)" :disabled="isSpinning">随机选 5 人</el-button>
          <el-button type="success" @click="pickRandom(10)" :disabled="isSpinning">随机选 10 人</el-button>
          <el-button @click="studentStore.currentStudents = []" :disabled="isSpinning" class="full-btn">清空转盘</el-button>
        </div>

        <el-divider>按规则筛选</el-divider>
        <div class="button-group rule-grid">
          <el-button @click="pickByRule(4)" :disabled="isSpinning">4的倍数</el-button>
          <el-button @click="pickByRule(5)" :disabled="isSpinning">5的倍数</el-button>
          <el-button @click="pickByRule(6)" :disabled="isSpinning">6的倍数</el-button>
          <el-button @click="pickByRule(7)" :disabled="isSpinning">7的倍数</el-button>
          <el-button @click="pickByRule(8)" :disabled="isSpinning">8的倍数</el-button>
          <el-button @click="pickByRule(9)" :disabled="isSpinning">9的倍数</el-button>
          <el-button type="warning" @click="pickByRule('prime')" :disabled="isSpinning">素数学号</el-button>
          <el-button type="info" @click="studentStore.currentStudents = []" :disabled="isSpinning">清空转盘</el-button>
        </div>

        <div class="list-title">🎯 待抽奖学号 ({{ studentStore.currentStudents.length }})</div>
        <div class="selected-list">
          <el-tag
              v-for="(name, index) in studentStore.currentStudents"
              :key="index"
              closable
              @close="studentStore.currentStudents.splice(index, 1)"
              type="warning"
          >
            {{ name }}
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
              v-for="(name, index) in studentStore.currentStudents"
              :key="index"
              class="name-wrapper"
              :style="getNameWrapperStyle(index)"
          >
            <span class="name-text">{{ name }}</span>
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

      <div v-if="winner" class="winner-box">
        <div class="winner-hint">🎉 恭喜中奖者 🎉</div>
        <div class="winner-name">{{ winner }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudentStore } from '@/stores/students.ts'
import { ElMessage } from 'element-plus'

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

// 随机选择逻辑
const pickRandom = (count: number) => {
  // 使用 studentStore 对应的属性名
  const shuffled = [...studentStore.allStudents].sort(() => 0.5 - Math.random())
  // 假设你在 store 里定义的 setter 叫 setStudents
  studentStore.setStudents(shuffled.slice(0, count))
  winner.value = ""
  rotation.value = 0
}

// 转盘扇区颜色计算
const wheelStyle = computed(() => {
  const count = studentStore.currentStudents.length
  if (count === 0) return { background: '#eee' }
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#9b59b6', '#34495e', '#16a085', '#27ae60']
  const gradient = studentStore.currentStudents.map((_, i) => {
    return `${colors[i % colors.length]} ${(i * 360) / count}deg ${((i + 1) * 360) / count}deg`
  }).join(',')
  return {
    transform: `rotate(${rotation.value}deg)`,
    background: `conic-gradient(${gradient})`
  }
})

// 文字角度旋转
const getNameWrapperStyle = (index: number) => {
  const angle = 360 / studentStore.currentStudents.length
  return { transform: `rotate(${index * angle + angle / 2}deg)` }
}

// 核心抽奖算法
const startSpin = () => {
  if (studentStore.currentStudents.length < 2) {
    ElMessage.warning('转盘至少需要2人')
    return
  }
  isSpinning.value = true
  winner.value = ""

  const count = studentStore.currentStudents.length
  const randomIndex = Math.floor(Math.random() * count)
  const anglePerItem = 360 / count

  const targetAngle = 360 - (randomIndex * anglePerItem + anglePerItem / 2)
  const extraRounds = (Math.floor(Math.random() * 5) + 7) * 360

  const baseRotation = rotation.value - (rotation.value % 360)
  rotation.value = baseRotation + extraRounds + targetAngle

  setTimeout(() => {
    isSpinning.value = false
    const selectedStudent = studentStore.currentStudents[randomIndex]

    if (selectedStudent) {
      winner.value = selectedStudent
    } else {
      // 可选：处理未找到学生的情况
      console.warn('未能找到选中的学生')
    }
  }, 4000)
}
</script>

<style scoped>
/* 样式部分也同步更新了类名，保持语义统一 */
.main-container { display: flex; justify-content: center; gap: 40px; padding: 20px; }
.aside-panel { width: 350px; }
.student-library { height: 200px; overflow-y: auto; border: 1px solid #ebeef5; padding: 10px; border-radius: 8px; background: #fafafa; }
.library-scroll-node { display: flex; flex-wrap: wrap; gap: 8px; }
.button-group { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
.full-btn { grid-column: span 2; }
.selected-list { min-height: 80px; padding: 12px; border: 1px dashed #dcdfe6; border-radius: 8px; display: flex; flex-wrap: wrap; gap: 8px; }

.wheel-section { text-align: center; }
.wheel-container { position: relative; width: 340px; height: 340px; border: 12px solid #333; border-radius: 50%; margin: 0 auto 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
.wheel { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; position: relative; transition: transform 4s cubic-bezier(0.15, 0, 0.15, 1); }
.pointer { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 18px solid transparent; border-right: 18px solid transparent; border-top: 45px solid #f56c6c; z-index: 10; }

.name-wrapper { position: absolute; width: 100%; height: 100%; top: 0; left: 0; display: flex; justify-content: center; align-items: flex-start; }
.name-text { margin-top: 35px; font-size: 16px; font-weight: bold; color: #fff; writing-mode: vertical-rl; text-orientation: upright; text-shadow: 1px 1px 2px rgba(0,0,0,0.6); }

.winner-box { margin-top: 20px; padding: 15px; background: #fef0f0; border-radius: 8px; border: 1px solid #fde2e2; }
.winner-name { color: #f56c6c; font-size: 32px; font-weight: bold; }

.rule-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  margin-top: 10px;
}

.rule-grid .el-button {
  width: 100%;
  margin: 0 !important;
  box-sizing: border-box;
}

.full-btn {
  grid-column: span 2;
}
</style>
