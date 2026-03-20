// src/stores/students.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStudentStore = defineStore('students', () => {
  // 生成 1-50 号的学号名单
  const allStudents = ref(Array.from({ length: 50 }, (_, i) => `${i + 1}号`))

  // 当前转盘上的名单
  const currentStudents = ref<string[]>(["1号", "2号", "3号", "4号", "5号"])

  // 3. 新增变量：记录当前设置的人数（默认为 50）
  const studentCount = ref(50)

  // 4. 保留原有 API：手动设置名单（兼容你之前的调用）
  const setStudents = (names: string[]) => {
    currentStudents.value = names
  }

  // 5. 新增 API：仅供配置界面调用，按人数批量生成
  const updateByCount = (count: number) => {
    studentCount.value = count
    // 1. 更新总名单
    const newAllNames = Array.from({ length: count }, (_, i) => `${i + 1}号`)
    allStudents.value = newAllNames

    // 2. 自动从中挑选 5 个显示在转盘上（如果总人数不足 5 则全选）
    const shuffled = [...newAllNames].sort(() => 0.5 - Math.random())
    currentStudents.value = shuffled.slice(0, Math.min(5, count))
  }

  return {
    allStudents,
    currentStudents,
    studentCount, // 新增
    setStudents,
    updateByCount // 新增，专门给配置页面用
  }
})