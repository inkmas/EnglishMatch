<template>
  <div class="video-page">
    <div class="video-section">
      <el-card shadow="hover" class="video-card">
        <template #header>
          <div class="video-header">
            <span>{{ title }}</span>
          </div>
        </template>

        <div class="video-wrapper">
          <video
              ref="player"
              controls
              preload="auto"
              class="main-video"
              :poster="poster"
              @timeupdate="handleTimeUpdate"
          >
            <source :src="videoSrc" type="video/mp4">
            您的浏览器不支持 HTML5 视频播放。
          </video>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from 'vue'
import { useVideoStore } from '@/stores/video'

const props = defineProps<{
  videoSrc: string
  title: string
  poster?: string
}>()

const videoStore = useVideoStore()
const player = ref<HTMLVideoElement | null>(null)

const restoreProgress = () => {
  if (player.value) {
    const savedTime = videoStore.getProgress(props.videoSrc)
    if (savedTime > 0) {
      player.value.currentTime = savedTime
    }
  }
}

const handleTimeUpdate = () => {
  if (player.value && player.value.currentTime > 0) {
    // 只有在正常播放时才更新，防止销毁时的 0 值覆盖掉有效值
    videoStore.updateProgress(props.videoSrc, player.value.currentTime)
  }
}

onMounted(() => {
  if (!player.value) return

  // 关键：等待视频元数据加载完成再跳转
  if (player.value.readyState >= 1) {
    restoreProgress()
  } else {
    player.value.addEventListener('loadedmetadata', restoreProgress)
  }
})

onUnmounted(() => {
  // 卸载时做最后一次强行保存
  if (player.value) {
    videoStore.updateProgress(props.videoSrc, player.value.currentTime)
  }
  player.value?.removeEventListener('loadedmetadata', restoreProgress)
})

defineExpose({
  play: () => player.value?.play(),
  pause: () => player.value?.pause()
})
</script>

<style scoped>
.video-page {
  display: flex; /* 确保是 Flex 布局 */
  flex-direction: column; /* 子元素垂直排列 */
  justify-content: center; /* 💡 垂直方向居中 */
  align-items: center; /* 💡 水平方向居中 */

  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0; /* 移除之前的 padding-top */
  box-sizing: border-box;
  background-color: #f5f7fa; /* 可选：增加一个淡色背景，衬托卡片 */
}

.video-section {
  width: 90%; /* 💡 在小屏幕上留有余地 */
  max-width: 900px; /* 💡 保持原有最大宽度 */
  /* 💡 移除 margin-bottom，让它在 Flex 中被动居中 */
}

.video-card {
  border-radius: 12px;
  overflow: hidden;
  /* 💡 增加阴影，让卡片看起来更立体、更有“居中感” */
  box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
}

.video-header {
  font-weight: bold;
  font-size: 1.2rem;
  color: #303133;
}

.video-wrapper {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  line-height: 0; /* 消除底部空隙 */
}

.main-video {
  width: 100%;
  /* 💡 限制最大高度，防止大视频把卡片撑得太高 */
  max-height: 70vh;
  outline: none;
}
</style>