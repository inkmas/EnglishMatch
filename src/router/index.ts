import { createRouter, createWebHashHistory } from 'vue-router'
import EnglishMatch from "@/views/EnglishMatch.vue";
import VocabUpload from "@/views/VocabUpload.vue";
import SingleWheel from "@/views/wheel/SingleWheel.vue";
import MultipleWheel from "@/views/wheel/MultipleWheel.vue";
import Debug from "@/views/Debug.vue";
import FilmWatch from "@/views/FilmWatch.vue";
import LineChartView from "@/views/chart/LineChartView.vue";
import PieChartView from "@/views/chart/PieChartView.vue";
import BarChartView from "@/views/chart/BarChartView.vue";

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
      children: [
        {
          path: 'single',
          name: 'WheelSingle',
          component: SingleWheel
        },
        {
          path: 'multiple',
          name: 'WheelMultiple',
          component: MultipleWheel
        }
      ]
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
      path: '/films',
      name: 'films',
      component: FilmWatch
    },
    {
      path: '/chart',
      name: 'chart',
      children: [
        {
          path: 'bar',
          name: 'bar-chart',
          component: BarChartView
        },
        {
          path: 'pie',
          name: 'pie-chart',
          component: PieChartView
        },
        {
          path: 'line',
          name: 'line-chart',
          component: LineChartView
        },
      ]
    },
    {
      path: '/debug',
      name: 'debug',
      component: Debug
    },
  ]
})

export default router