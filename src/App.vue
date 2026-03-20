<template>
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      router
  >
    <el-menu-item index="/english">英语消消乐</el-menu-item>
    <el-menu-item index="/wheel" >幸运大转盘</el-menu-item>
    <el-menu-item index="/upload" >单词文件上传</el-menu-item>
    <el-menu-item index="/settings">设置</el-menu-item>
    <el-menu-item index="5" disabled>更多功能...</el-menu-item>
  </el-menu>

  <router-view></router-view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeIndex = computed(() => {
  const { path } = route
  return path
})

const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
</style>
