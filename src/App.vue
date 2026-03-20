<template>
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      router
  >
    <el-menu-item index="1" disabled>英语消消乐</el-menu-item>
    <el-menu-item index="/wheel" >幸运大转盘</el-menu-item>
    <el-menu-item index="3" disabled>更多功能...</el-menu-item>
  </el-menu>

  <router-view></router-view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style>
</style>
