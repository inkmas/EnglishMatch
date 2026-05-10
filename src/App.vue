<template>
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      router
  >
    <el-menu-item index="/english">英语消消乐</el-menu-item>
    <el-sub-menu index="/wheel">
      <template #title>
        <span>幸运大转盘</span>
      </template>

      <el-menu-item index="/wheel/single">
        <template #title>单人转盘 (Single)</template>
      </el-menu-item>

      <el-menu-item index="/wheel/multiple">
        <template #title>多人模式 (Multiple)</template>
      </el-menu-item>
    </el-sub-menu>
    <el-menu-item index="/upload">单词文件上传</el-menu-item>
<!--    <el-menu-item index="/debug">Debug</el-menu-item>-->
    <el-menu-item index="5" disabled>更多功能...</el-menu-item>
  </el-menu>

  <el-scrollbar class="scroll-view">
    <router-view v-slot="{ Component, route }">
      <KeepAlive>
        <component :is="Component" :key="route.path" />
      </KeepAlive>
    </router-view>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeIndex = computed(() => {
  const { path } = route
  return path
})
</script>

<style scoped>
.scroll-view {
  flex: 1;
  background-color: #f5f7fa;
}
</style>
