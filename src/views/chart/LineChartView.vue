<template>
  <div class="container">
    <h2>折线图生成器</h2>

    <div class="table-section">
      <div class="title-input-group">
        <label>图表标题：</label>
        <input v-model="chartTitle" placeholder="输入折线图标题，如：每日访问量趋势" class="title-input" />
      </div>

      <table>
        <thead>
        <tr>
          <th>时间/节点 (X轴)</th>
          <th>数值 (Y轴)</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td><input v-model="item.name" placeholder="如：1月" /></td>
          <td><input v-model.number="item.value" type="number" /></td>
          <td><button @click="removeItem(index)" class="btn-delete">删除</button></td>
        </tr>
        </tbody>
      </table>

      <div class="controls">
        <button @click="addItem" class="btn-add">+ 添加数据点</button>
        <button @click="generateChart" class="btn-generate">点击生成折线图</button>
      </div>
    </div>

    <div class="chart-section">
      <div v-if="hasData" class="chart-box">
        <v-chart class="chart" :option="lineOption" autoresize />
      </div>
      <div v-else class="placeholder">
        暂无数据，请在上方输入并点击生成
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts'; // 引入折线图核心
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';

// 注册折线图相关组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
]);

// --- 响应式数据 ---
const chartTitle = ref('');
const tableData = ref([
  { name: '1月', value: 30 },
  { name: '2月', value: 50 },
  { name: '3月', value: 45 },
  { name: '4月', value: 80 }
]);
const hasData = ref(false);

// 折线图配置项
const lineOption = ref({
  title: {
    text: '',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis' // 折线图通常设置为 axis，鼠标指在轴上就能触发显示
  },
  xAxis: {
    type: 'category',
    data: [] as string[],
    boundaryGap: false // 坐标轴两端不留空隙，让折线连接到边缘
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '趋势值',
      type: 'line',
      data: [] as number[],
      smooth: true, // 设置为平滑曲线
      itemStyle: { color: '#3498db' }, // 设置线条颜色
      areaStyle: {
        color: 'rgba(52, 152, 219, 0.2)' // 线条下方的填充颜色（面积图效果）
      },
      label: {
        show: true,
        position: 'top'
      }
    }
  ]
});

// --- 方法 ---
const addItem = () => {
  tableData.value.push({ name: '', value: 0 });
};

const removeItem = (index: number) => {
  tableData.value.splice(index, 1);
};

const generateChart = () => {
  const names = tableData.value.map(item => item.name || '未命名');
  const values = tableData.value.map(item => item.value);

  // 同步配置
  lineOption.value.title.text = chartTitle.value;
  lineOption.value.xAxis.data = names;
  lineOption.value.series[0]!.data = values;

  hasData.value = true;
};
</script>

<style scoped>
/* 保持一致的 UI 风格 */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title-input-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-weight: bold;
}

.table-section {
  background: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 30px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

th, td {
  border: 1px solid #eee;
  padding: 10px;
  text-align: left;
}

input {
  width: 90%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.controls {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add { background-color: #34495e; color: white; }
.btn-generate { background-color: #3498db; color: white; font-weight: bold; }
.btn-delete { background-color: #ff4d4f; color: white; padding: 5px 10px; }

.chart-box {
  height: 400px;
  background: #fdfdfd;
  border: 1px dashed #ccc;
  padding: 20px;
}

.chart {
  height: 100%;
}

.placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  border-radius: 8px;
}
</style>