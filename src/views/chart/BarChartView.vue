<template>
  <div class="container">
    <h2>柱状图生成器</h2>

    <div class="table-section">
      <div class="title-input-group">
        <label>图表标题：</label>
        <input v-model="chartTitle" placeholder="输入柱状图标题，如：学生时间分配" class="title-input" />
      </div>

      <table>
        <thead>
        <tr>
          <th>项目名称 (X轴)</th>
          <th>数值 (Y轴)</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <td><input v-model="item.name" placeholder="名称" /></td>
          <td><input v-model.number="item.value" type="number" /></td>
          <td><button @click="removeItem(index)" class="btn-delete">删除</button></td>
        </tr>
        </tbody>
      </table>

      <div class="controls">
        <button @click="addItem" class="btn-add">+ 添加行</button>
        <button @click="generateChart" class="btn-generate">点击生成柱状图</button>
      </div>
    </div>

    <div class="chart-section">
      <div v-if="hasData" class="chart-box">
        <v-chart class="chart" :option="barOption" autoresize />
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
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, GridComponent]);

// --- 响应式数据 ---
const chartTitle = ref(''); // 图表标题变量
const tableData = ref([
  { name: '类别A', value: 100 },
  { name: '类别B', value: 200 }
]);
const hasData = ref(false);

const barOption = ref({
  title: { text: '', left: 'center' }, // 初始为空
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: [] as string[] },
  yAxis: { type: 'value' },
  series: [
    {
      data: [] as number[],
      type: 'bar',
      itemStyle: { color: '#42b883' },
      label: { show: true, position: 'top' }
    }
  ]
});

// --- 方法 ---
const addItem = () => tableData.value.push({ name: '', value: 0 });
const removeItem = (index: number) => tableData.value.splice(index, 1);

const generateChart = () => {
  const names = tableData.value.map(item => item.name || '未命名');
  const values = tableData.value.map(item => item.value);

  // 1. 同步标题
  barOption.value.title.text = chartTitle.value;
  // 2. 同步数据
  barOption.value.xAxis.data = names;
  barOption.value.series[0]!.data = values;

  hasData.value = true;
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 标题输入框样式 */
.title-input-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-input {
  flex: 1;
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
.btn-generate { background-color: #42b883; color: white; }
.btn-delete { background-color: #ff4d4f; color: white; padding: 5px 10px; }

.chart-box {
  height: 400px;
  background: #fdfdfd;
  border: 1px dashed #ccc;
  padding: 20px;
}

.chart { height: 100%; }

.placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
}
</style>