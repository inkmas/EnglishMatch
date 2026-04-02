// src/stores/vocab.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 全局词汇类型
export interface VocabItem {
    en: string
    cn: string
}

export const useVocabStore = defineStore('vocab', () => {
    // 词汇列表（默认空，让用户必须上传文件）
    const vocabList = ref<VocabItem[]>([])
    const vocabTitle = ref<string>('单词消消乐')

    // 替换词汇列表（核心方法，上传文件后调用）
    const setVocabList = (newList: VocabItem[], title?: string) => {
        vocabList.value = newList
        if (title) vocabTitle.value = title
    }

    // 清空词汇列表
    const clearVocabList = () => {
        vocabList.value = []
        vocabTitle.value = '单词消消乐'
    }

    return {
        vocabList,
        vocabTitle,
        setVocabList,
        clearVocabList
    }
})