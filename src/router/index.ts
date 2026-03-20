import { createRouter, createWebHashHistory } from 'vue-router'
import WheelView from '@/views/WheelView.vue'

const router = createRouter({
  // 使用 Hash 模式，方便单文件打包后双击运行
  history: createWebHashHistory(),
  routes: [
    {
      path: '/wheel',
      name: 'wheel',
      component: WheelView
    }
  ]
})

export default router