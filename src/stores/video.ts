import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVideoStore = defineStore('video', () => {
    const videoProgressMap = ref<Record<string, number>>({})

    const updateProgress = (path: string, time: number) => {
        videoProgressMap.value[path] = time
    }

    const getProgress = (path: string) => {
        return videoProgressMap.value[path] || 0
    }

    return { videoProgressMap, updateProgress, getProgress }
})