<template>
  <VideoPlayerCard
      title="🎥 经典放映：《沙家浜》（1971）"
      :video-src="getAssetPath('assets/videos/沙家浜/《沙家浜》（长影1971）DVDRip.x264.mp4')"
      :poster="getAssetPath('assets/videos/沙家浜/page.png')"
  />
</template>

<script setup lang="ts">
import VideoPlayerCard from "@/components/VideoPlayerCard.vue";
import { getAssetPath } from "@/utils/path.ts";
</script>

<style scoped>

</style>