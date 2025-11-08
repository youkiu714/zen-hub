<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">403</div>
      <div class="error-title">无权限访问</div>
      <div class="error-description">
        抱歉，您没有权限访问此页面
      </div>
      <el-button type="primary" @click="goHome">
        <el-icon><House /></el-icon>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.error-content {
  text-align: center;
  
  .error-code {
    font-size: 120px;
    font-weight: bold;
    color: #F56C6C;
    margin-bottom: 20px;
  }
  
  .error-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 15px;
  }
  
  .error-description {
    font-size: 16px;
    color: #666;
    margin-bottom: 30px;
  }
}
</style>