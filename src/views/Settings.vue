<template>
  <div class="config-container">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>名单人数配置</span>
        </div>
      </template>

      <div class="config-body">
        <div class="status-badge">
          <span class="dot"></span>
          当前转盘：{{ studentStore.currentStudents.length }} 人
        </div>

        <div class="input-section">
          <p class="label">设置快捷学号人数 (1-100)</p>
          <el-input-number
              v-model="tempCount"
              :min="1"
              :max="100"
              size="large"
              class="custom-input"
          />
        </div>

        <el-button
            type="primary"
            class="save-btn"
            @click="handleSave"
            :loading="loading"
        >
          确认并应用
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { useStudentStore } from '@/stores/students'
import { ElMessage } from 'element-plus'

const studentStore = useStudentStore()
const tempCount = ref(studentStore.studentCount)
const loading = ref(false)

const handleSave = () => {
  loading.value = true
  setTimeout(() => {
    // 调用新增的兼容性 API
    studentStore.updateByCount(tempCount.value)
    ElMessage({
      message: `设置成功：当前总人数已改为 ${tempCount.value} 人`,
      type: 'success',
      plain: true
    })
    loading.value = false
  }, 300)
}
</script>

<style scoped>
.config-container {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.config-card {
  width: 100%;
  max-width: 380px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.status-badge {
  background: #f0f7ff;
  color: #409eff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 25px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #409eff;
  border-radius: 50%;
}

.input-section {
  margin-bottom: 30px;
}

.label {
  font-size: 0.85rem;
  color: #909399;
  margin-bottom: 12px;
}

.custom-input {
  width: 100%;
}

.save-btn {
  width: 100%;
  height: 45px;
  font-weight: bold;
}
</style>