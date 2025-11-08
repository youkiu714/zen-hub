<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>欢迎使用 Vue3 Admin System</h1>
      <p>这是一个基于 Vue3 + Element Plus + Vite 构建的后台管理系统</p>
    </div>
    
    <div class="dashboard-content">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon primary">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">1,234</div>
                <div class="stat-label">用户总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon success">
                <el-icon><ShoppingBag /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">5,678</div>
                <div class="stat-label">订单总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon warning">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥123,456</div>
                <div class="stat-label">销售额</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-icon danger">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">89.5%</div>
                <div class="stat-label">转化率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>销售趋势</span>
            </template>
            <div ref="chartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>快捷操作</span>
            </template>
            <div class="quick-actions">
              <el-button type="primary" @click="handleQuickAction('用户管理')">
                <el-icon><User /></el-icon>
                用户管理
              </el-button>
              <el-button type="success" @click="handleQuickAction('订单管理')">
                <el-icon><ShoppingBag /></el-icon>
                订单管理
              </el-button>
              <el-button type="warning" @click="handleQuickAction('商品管理')">
                <el-icon><Goods /></el-icon>
                商品管理
              </el-button>
              <el-button type="info" @click="handleQuickAction('系统设置')">
                <el-icon><Setting /></el-icon>
                系统设置
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()

const handleQuickAction = (action: string) => {
  ElMessage.success(`点击了${action}`)
}

const initChart = () => {
  if (!chartRef.value) return
  
  const chart = echarts.init(chartRef.value)
  
  const option = {
    title: {
      text: '销售数据',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        data: [120, 200, 150, 80, 70, 110],
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  // 响应式
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

onMounted(() => {
  initChart()
})
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: #333;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 16px;
  }
}

.stat-card {
  .stat-item {
    display: flex;
    align-items: center;
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      
      .el-icon {
        font-size: 24px;
        color: white;
      }
      
      &.primary {
        background: #409EFF;
      }
      
      &.success {
        background: #67C23A;
      }
      
      &.warning {
        background: #E6A23C;
      }
      
      &.danger {
        background: #F56C6C;
      }
    }
    
    .stat-info {
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
      }
      
      .stat-label {
        color: #666;
        font-size: 14px;
      }
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  
  .el-button {
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      margin-bottom: 5px;
      font-size: 20px;
    }
  }
}
</style>