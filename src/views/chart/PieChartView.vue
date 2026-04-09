<template>
  <div class="container">
    <h2>饼图生成器</h2>

    <div class="table-section">
      <div class="title-input-group">
        <label>图表标题：</label>
        <input v-model="chartTitle" placeholder="输入饼图标题，如：支出占比" class="title-input" />
      </div>

      <table>
        <thead>
        <tr>
          <th>分类名称</th>
          <th>数值</th>
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
        <button @click="addItem" class="btn-add">+ 添加项</button>
        <button @click="generateChart" class="btn-generate">点击生成饼图</button>
      </div>
    </div>

    <div class="chart-section">
      <div v-if="hasData" class="chart-box">
        <v-chart class="chart" :option="pieOption" autoresize />
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
import { PieChart } from 'echarts/charts'; // 引入饼图核心
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent // 饼图通常需要图例
} from 'echarts/components';

// 注册饼图相关组件
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

// --- 响应式数据 ---
const chartTitle = ref('');
const tableData = ref([
  { name: '部分A', value: 40 },
  { name: '部分B', value: 60 }
]);
const hasData = ref(false);

// 饼图配置项
const pieOption = ref({
  title: {
    text: '',
    left: 'center'
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)' // 鼠标悬浮显示：系列名 <br/>名称 : 数值 (百分比)
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: [] as string[]
  },
  series: [
    {
      name: '数据分布',
      type: 'pie',
      radius: '65%', // 饼图大小
      center: ['50%', '50%'], // 饼图位置
      data: [] as any[],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
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
  // 饼图的数据结构本身就是 [{name, value}]，所以处理起来更直接
  const formattedData = tableData.value.map(item => ({
    name: item.name || '未命名',
    value: item.value
  }));

  // 更新配置
  pieOption.value.title.text = chartTitle.value;
  pieOption.value.legend.data = formattedData.map(d => d.name);
  pieOption.value.series[0]!.data = formattedData;

  hasData.value = true;
};
</script>

<style scoped>
/* 样式与 BarChart 保持一致，确保视觉统一 */
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
  transition: opacity 0.2s;
}

.btn-add { background-color: #34495e; color: white; }
.btn-generate { background-color: #e67e22; color: white; font-weight: bold; } /* 换个颜色区分 */
.btn-delete { background-color: #ff4d4f; color: white; padding: 5px 10px; }

button:hover { opacity: 0.8; }

.chart-box {
  height: 450px; /* 饼图建议高度稍微大一点点，给 Legend 留空间 */
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