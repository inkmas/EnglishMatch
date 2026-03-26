<template>
  <el-dialog
      v-model="visible"
      title="系统设置"
      width="420px"
      align-center
      destroy-on-close
      class="custom-dialog"
  >
    <template #header>
      <div class="dialog-header">
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

        <div class="quick-presets">
          <el-button @click="tempCount = 40" size="small" plain round>快捷设置 40人</el-button>
          <el-button @click="tempCount = 50" size="small" plain round>快捷设置 50人</el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button
            type="primary"
            @click="handleSave"
            :loading="loading"
        >
          确认并应用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { useStudentStore } from '@/stores/students'
import { ElMessage } from 'element-plus'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const studentStore = useStudentStore()
const tempCount = ref(studentStore.studentCount)
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleSave = () => {
  loading.value = true
  setTimeout(() => {
    studentStore.updateByCount(tempCount.value)
    ElMessage({
      message: `设置成功：当前总人数已改为 ${tempCount.value} 人`,
      type: 'success',
      plain: true
    })
    loading.value = false
    visible.value = false // 保存后自动关闭
  }, 300)
}
</script>

<style scoped>
.dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
}

.config-body {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-badge {
  background: #f0f7ff;
  color: #409eff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 20px;
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
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 0.85rem;
  color: #909399;
  margin-bottom: 12px;
}

.custom-input {
  width: 100%;
}

.quick-presets {
  margin-top: 15px;
  display: flex;
  gap: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>