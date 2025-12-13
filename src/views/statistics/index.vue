<template>
  <div class="statistics-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="title">数据统计分析</h2>
        <p class="subtitle">实时监控挂单申请数据，助力寺院精细化管理</p>
      </div>
      <div class="header-right">
        <el-radio-group v-model="dateFilter" class="custom-radio-group" @change="handleDateChange">
          <el-radio-button label="7">近7天</el-radio-button>
          <el-radio-button label="30">近30天</el-radio-button>
          <el-radio-button label="90">近3个月</el-radio-button>
        </el-radio-group>
        <el-button type="primary" class="export-btn" :loading="exportLoading" @click="handleExport">
          <el-icon class="mr-2"><Download /></el-icon> 导出报表
        </el-button>
      </div>
    </div>

    <div class="cards-grid" v-loading="loading">
      <div v-for="(item, key) in overview" :key="key" class="stat-card">
        <div class="card-icon-wrapper" :class="item.type">
          <el-icon :size="24">
            <component :is="getIconComponent(item.icon)" />
          </el-icon>
        </div>
        <div class="card-content">
          <div class="card-label">{{ item.title }}</div>
          <div class="card-value">{{ item.value.toLocaleString() }}</div>
          <div class="card-trend" :class="item.trend >= 0 ? 'up' : 'down'">
            <el-icon>
              <component :is="item.trend >= 0 ? 'Top' : 'Bottom'" />
            </el-icon>
            <span>{{ Math.abs(item.trend) }}%</span>
            <span class="trend-text">{{ item.trendText }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-container" v-loading="loading">
      <div class="chart-card full-width">
        <div class="chart-header">
          <h3>申请人数趋势</h3>
        </div>
        <div class="chart-body">
          <div ref="trendChartRef" class="echart-instance"></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>性别分布</h3>
        </div>
        <div class="chart-body">
          <div ref="genderChartRef" class="echart-instance"></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>年龄段分布</h3>
        </div>
        <div class="chart-body">
          <div ref="ageChartRef" class="echart-instance"></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>申请来源分析</h3>
        </div>
        <div class="chart-body">
          <div ref="sourceChartRef" class="echart-instance"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, shallowRef } from 'vue';
import * as echarts from 'echarts';
import { 
  User, Timer, Check, Close, Download, Top, Bottom 
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getStatistics } from '@/api/statistics';
import type { StatisticsResponse, StatCardData } from '@/types/statistics';

// --- 状态管理 ---
const loading = ref(true);
const exportLoading = ref(false);
const dateFilter = ref('7');
const overview = ref<Record<string, StatCardData>>({});

// --- Chart Refs (使用 shallowRef 优化性能) ---
const trendChartRef = shallowRef<HTMLElement>();
const genderChartRef = shallowRef<HTMLElement>();
const ageChartRef = shallowRef<HTMLElement>();
const sourceChartRef = shallowRef<HTMLElement>();

let trendChart: echarts.ECharts | null = null;
let genderChart: echarts.ECharts | null = null;
let ageChart: echarts.ECharts | null = null;
let sourceChart: echarts.ECharts | null = null;

// --- ECharts 颜色主题 (提取自原型) ---
const colors = {
  primary: '#8B5A2B',
  secondary: '#D2B48C',
  light: '#FFF8E7',
  success: '#4CAF50',
  danger: '#F44336',
  text: '#3E2723',
  gray: '#9ca3af',
  chartPalette: ['#8B5A2B', '#D2B48C', '#A89F91', '#C4A484', '#6D4C41']
};

// --- 图表初始化方法 ---

const initTrendChart = (data: StatisticsResponse['charts']['applicationTrend']) => {
  if (!trendChartRef.value) return;
  trendChart = echarts.init(trendChartRef.value);
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.dates,
      axisLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: colors.text }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [{
      name: '申请人数',
      type: 'line',
      smooth: true,
      data: data.values,
      itemStyle: { color: colors.primary },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(139, 90, 43, 0.3)' },
          { offset: 1, color: 'rgba(139, 90, 43, 0)' }
        ])
      }
    }]
  });
};

const initGenderChart = (data: StatisticsResponse['charts']['genderDistribution']) => {
  if (!genderChartRef.value) return;
  genderChart = echarts.init(genderChartRef.value);
  genderChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', icon: 'circle' },
    series: [{
      name: '性别分布',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'], // 稍微上移留给Legend
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2
      },
      color: [colors.primary, colors.secondary], // 男-深色，女-浅色
      data: data
    }]
  });
};

const initAgeChart = (data: StatisticsResponse['charts']['ageDistribution']) => {
  if (!ageChartRef.value) return;
  ageChart = echarts.init(ageChartRef.value);
  ageChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: data.map(i => i.name),
      axisTick: { alignWithLabel: true }
    },
    yAxis: { type: 'value' },
    series: [{
      name: '人数',
      type: 'bar',
      barWidth: '40%',
      data: data.map(i => i.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors.secondary },
          { offset: 1, color: colors.primary }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  });
};

const initSourceChart = (data: StatisticsResponse['charts']['sourceDistribution']) => {
  if (!sourceChartRef.value) return;
  sourceChart = echarts.init(sourceChartRef.value);
  sourceChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', icon: 'circle' },
    series: [{
      name: '来源',
      type: 'pie',
      radius: '65%',
      center: ['50%', '45%'],
      data: data,
      color: colors.chartPalette,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  });
};

// --- 业务逻辑 ---

const fetchData = async () => {
  loading.value = true;
  try {
    // 模拟根据 dateFilter 计算日期范围
    const res = await getStatistics(['2023-01-01', '2023-01-07']);
    
    overview.value = res.overview;
    
    // 初始化图表 (DOM更新后)
    nextTick(() => {
      initTrendChart(res.charts.applicationTrend);
      initGenderChart(res.charts.genderDistribution);
      initAgeChart(res.charts.ageDistribution);
      initSourceChart(res.charts.sourceDistribution);
    });
  } catch (error) {
    ElMessage.error('数据加载失败');
  } finally {
    loading.value = false;
  }
};

const handleDateChange = () => {
  // 实际项目中这里会计算新的日期范围
  fetchData();
};

const handleExport = () => {
  exportLoading.value = true;
  setTimeout(() => {
    exportLoading.value = false;
    ElMessage.success('报表导出成功');
  }, 1500);
};

// 辅助函数：动态获取图标组件
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = { User, Timer, Check, Close };
  return icons[iconName] || User;
};

// --- 生命周期 & 响应式适配 ---
const handleResize = () => {
  trendChart?.resize();
  genderChart?.resize();
  ageChart?.resize();
  sourceChart?.resize();
};

onMounted(() => {
  fetchData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  genderChart?.dispose();
  ageChart?.dispose();
  sourceChart?.dispose();
});
</script>

<style scoped>
/* 为了确保样式与原型一致，这里定义了 CSS 变量和特定类。
  颜色代码严格参考了原型图片。
*/
.statistics-page {
  --primary-color: #8B5A2B;
  --bg-light: #FFF8E7;
  --bg-neutral: #F5F5DC;
  --text-dark: #3E2723;
  --text-gray: #6B7280;
  --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  --card-shadow-hover: 0 8px 30px rgba(0, 0, 0, 0.1);
  
  padding: 24px;
  background-color: var(--bg-light);
  min-height: 100vh;
  font-family: 'Noto Sans SC', sans-serif;
  color: var(--text-dark);
}

/* 头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.title {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 8px 0;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.subtitle {
  color: var(--text-gray);
  font-size: 14px;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 覆盖 Element Plus 样式以匹配原型 */
:deep(.custom-radio-group .el-radio-button__inner) {
  background: transparent;
  border-color: #D2B48C;
  color: var(--primary-color);
}
:deep(.custom-radio-group .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: none;
}
.export-btn {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}
.export-btn:hover {
  background-color: #704822; /* darker shade */
  border-color: #704822;
}

/* 卡片网格 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

/* 不同的卡片图标背景色 */
.card-icon-wrapper.total { background-color: #E3F2FD; color: #2196F3; }
.card-icon-wrapper.pending { background-color: #FFF8E1; color: #FFC107; }
.card-icon-wrapper.approved { background-color: #E8F5E9; color: #4CAF50; }
.card-icon-wrapper.rejected { background-color: #FFEBEE; color: #F44336; }

.card-content {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: var(--text-gray);
  margin-bottom: 4px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
}

.card-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

.card-trend.up { color: #4CAF50; }
.card-trend.down { color: #F44336; }
.trend-text { color: var(--text-gray); margin-left: 4px; font-weight: normal; }

/* 图表布局 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  min-height: 360px; /* 保证图表有足够高度 */
}

/* 趋势图占满一行 */
.full-width {
  grid-column: span 3;
}

.chart-header {
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
  font-family: 'Noto Serif SC', serif;
}

.chart-body {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 280px;
}

.echart-instance {
  width: 100%;
  height: 100%;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .charts-container {
    grid-template-columns: repeat(2, 1fr);
  }
  .full-width {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>