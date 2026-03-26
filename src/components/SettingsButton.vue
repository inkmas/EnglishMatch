<template>
  <div class="settings-container">
    <div class="settings-wrapper" @click="$emit('click')">
      <el-icon class="settings-icon">
        <Setting/>
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Setting } from "@element-plus/icons-vue";

defineEmits(['click'])
</script>

<style scoped>
.settings-container {
  display: inline-block;
  padding: 5px;
}

.settings-wrapper {
  position: relative;
  z-index: 10;

  width: 45px;
  height: 45px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.settings-wrapper:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  background-color: #f5f7fa;
}

.settings-icon {
  font-size: 24px;
  color: #606266;
  transition: transform 0.5s ease;
}

.settings-wrapper:hover .settings-icon {
  transform: rotate(90deg);
  color: #409eff;
}
</style>