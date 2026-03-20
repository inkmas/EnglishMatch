import { createRouter, createWebHashHistory } from 'vue-router'
import WheelView from '@/views/WheelView.vue'
import EnglishMatch from "@/views/EnglishMatch.vue";
import VocabUpload from "@/views/VocabUpload.vue";
import Settings from "@/views/Settings.vue";

const router = createRouter({
  // 使用 Hash 模式，方便单文件打包后双击运行
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/english'
    },
    {
      path: '/wheel',
      name: 'wheel',
      component: WheelView
    },
    {
      path: '/english',
      name: 'english',
      component: EnglishMatch
    },
    {
      path: '/upload',
      name: 'upload',
      component: VocabUpload
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
  ]
})

export default router