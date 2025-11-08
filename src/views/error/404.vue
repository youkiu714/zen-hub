<template>
  <div class="error-page">
    <div class="error-container">
      <!-- 左侧404图形区域 -->
      <div class="error-visual">
        <div class="error-number">4</div>
        <div class="error-icon">
          <el-icon>
            <LocationInformation />
          </el-icon>
        </div>
        <div class="error-number">0</div>
        <div class="error-number">4</div>
      </div>

      <!-- 右侧信息区域 -->
      <div class="error-content">
        <div class="error-title">页面走丢了</div>
        <div class="error-subtitle">Page Not Found</div>
        <div class="error-description">
          很抱歉，您访问的页面可能已经移除、更名或暂时不可用<br>
          让我们回到开始的地方，重新寻找您需要的内容
        </div>

        <!-- 操作按钮 -->
        <div class="error-actions">
          <el-button type="primary" size="large" @click="goHome" class="action-btn">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button size="large" @click="goBack" class="action-btn">
            <el-icon><ArrowLeft /></el-icon>
            返回上页
          </el-button>
        </div>

        <!-- 快速链接 -->
        <div class="quick-links">
          <div class="links-title">快速导航</div>
          <div class="links-grid">
            <div class="link-item" @click="navigateTo('/dashboard')">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </div>
            <div class="link-item" @click="navigateTo('/contact-application/pending-application')">
              <el-icon><DocumentAdd /></el-icon>
              <span>挂单申请</span>
            </div>
            <div class="link-item" @click="navigateTo('/hall-management/pending-review')">
              <el-icon><Document /></el-icon>
              <span>挂单审核</span>
            </div>
            <div class="link-item" @click="navigateTo('/accommodation-management/room-bed-edit')">
              <el-icon><List /></el-icon>
              <span>房间管理</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="decoration">
      <div class="decoration-item decoration-1"></div>
      <div class="decoration-item decoration-2"></div>
      <div class="decoration-item decoration-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  House,
  ArrowLeft,
  LocationInformation,
  DocumentAdd,
  Document,
  List
} from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
.error-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8E7 0%, #F5E6D3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.error-container {
  display: flex;
  align-items: center;
  gap: 80px;
  max-width: 1200px;
  width: 90%;
  z-index: 2;
  position: relative;
}

// 左侧404视觉区域
.error-visual {
  display: flex;
  align-items: center;
  gap: -10px;
  margin-right: 40px;
}

.error-number {
  font-size: 120px;
  font-weight: 800;
  color: #8D6E63;
  text-shadow: 3px 3px 6px rgba(141, 110, 99, 0.3);
  line-height: 1;
  animation: float 3s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.5s;
  }

  &:nth-child(3) {
    animation-delay: 1s;
  }

  &:nth-child(4) {
    animation-delay: 1.5s;
  }
}

.error-icon {
  font-size: 80px;
  color: #FF9800;
  margin: 0 -15px;
  animation: rotate 4s linear infinite;
}

// 右侧内容区域
.error-content {
  flex: 1;
  text-align: left;
}

.error-title {
  font-size: 48px;
  font-weight: 700;
  color: #5D4037;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #8D6E63 0%, #5D4037 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-subtitle {
  font-size: 20px;
  color: #8D6E63;
  margin-bottom: 24px;
  font-weight: 500;
}

.error-description {
  font-size: 16px;
  color: #7D6E63;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 500px;
}

// 操作按钮区域
.error-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.action-btn {
  min-width: 120px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(141, 110, 99, 0.3);
  }
}

// 快速导航
.quick-links {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(141, 110, 99, 0.1);
}

.links-title {
  font-size: 18px;
  font-weight: 600;
  color: #5D4037;
  margin-bottom: 20px;
  text-align: center;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  background: #FFFFFF;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(141, 110, 99, 0.2);
    border-color: #8D6E63;
  }

  .el-icon {
    font-size: 32px;
    color: #8D6E63;
  }

  span {
    font-size: 14px;
    color: #5D4037;
    font-weight: 500;
  }
}

// 装饰元素
.decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.decoration-item {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(141, 110, 99, 0.1) 0%, rgba(93, 64, 55, 0.05) 100%);
}

.decoration-1 {
  top: 10%;
  left: 5%;
  width: 200px;
  height: 200px;
  animation: float 6s ease-in-out infinite;
}

.decoration-2 {
  top: 60%;
  right: 10%;
  width: 150px;
  height: 150px;
  animation: float 8s ease-in-out infinite reverse;
}

.decoration-3 {
  bottom: 20%;
  left: 15%;
  width: 100px;
  height: 100px;
  animation: float 4s ease-in-out infinite;
}

// 动画
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .error-container {
    flex-direction: column;
    text-align: center;
    gap: 40px;
  }

  .error-content {
    text-align: center;
  }

  .error-actions {
    justify-content: center;
  }

  .links-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .error-number {
    font-size: 80px;
  }

  .error-icon {
    font-size: 60px;
  }

  .error-title {
    font-size: 36px;
  }

  .error-subtitle {
    font-size: 18px;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 200px;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>