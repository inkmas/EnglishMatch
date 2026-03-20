// src/stores/students.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStudentStore = defineStore('students', () => {
  // 生成 1-55 号的学号名单
  const allStudents = ref(Array.from({ length: 55 }, (_, i) => `${i + 1}号`))

  // 当前转盘上的名单
  const currentStudents = ref<string[]>(["1号", "2号", "3号", "4号", "5号"])

  const setStudents = (names: string[]) => {
    currentStudents.value = names
  }

  return { allStudents, currentStudents, setStudents }
})