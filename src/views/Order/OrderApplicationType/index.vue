<template>
  <div class="home-bg-container">
    
    <div class="outer-wrapper-card animate-fade-in">
      
      <header class="header-section">
        <h3>挂单类型</h3>
      </header>

      <div class="menu-grid-section">
        <el-row :gutter="30">
          <el-col 
            v-for="(item, index) in menuItems" 
            :key="item.path"
            :span="12" 
            :xs="24"
          >
            <div class="inner-menu-box" @click="handleNavigation(item.path)">
              
              <div class="box-content">
                <div class="icon-wrapper">
                  <el-icon :size="36" :color="colors.primaryText">
                    <component :is="item.icon" />
                  </el-icon>
                </div>
                
                <div class="text-wrapper">
                  <h3 class="box-title">{{ item.title }}</h3>
                  <p class="box-desc">{{ item.description }}</p>
                </div>
                
                <div class="arrow-wrapper">
                  <el-icon :color="colors.borderColor"><Right /></el-icon>
                </div>
              </div>

            </div>
          </el-col>
        </el-row>
      </div>

      <!-- <footer class="footer-section">
        <p>© 2024 挂单管理系统 | 弘法利生 慈悲为怀</p>
      </footer> -->

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 引入 Element Plus 图标
import { 
  EditPen,    // 挂单申请
  Stamp,      // 挂单审核
  House,      // 入住登记
  List,       // 挂单管理 (使用 List 图标)
  Right       // 右箭头
} from '@element-plus/icons-vue'

const router = useRouter()

// 颜色配置
const colors = {
  primaryText: '#5A4A42', // 深棕色
  secondaryText: '#9E8F83', // 浅灰色
  borderColor: '#D0C0A8', // 边框颜色
}

// 菜单数据
const menuItems = ref([
  {
    title: '短住',
    description: '适用于短期挂单住宿，需填写个人基本信息和推荐',
    path: '/contact-application/pending-application',
    icon: EditPen
  },
  {
    title: '直通车',
    description: '快速挂单通道，需填写个人基本信息和推荐人',
    path: '/contact-application/direct-application',
    icon: Stamp
  },
  {
    title: '团队挂单',
    description: '适用于团队集体挂单，需填写团队信息和人员名单',
    path: '/check-in',
    icon: House
  },
  {
    title: '特殊客人', // 第四个模块：根据 index.vue 推测为挂单管理
    description: '适用于特殊身份客人，无需填写个人信息，系统自动生成编号',
    path: '/management',
    icon: List
  }
])

// 路由跳转处理
const handleNavigation = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
/* 颜色变量 */
$bg-color: #fdf6e3; // 页面背景米色
$white: #FFFFFF;
$border-color: #D0C0A8; // 棕褐色边框
$primary-text: #5A4A42;
$secondary-text: #9E8F83;

// 1. 最外层背景容器
.home-bg-container {
  min-height: 100vh;
  width: 100%;
  background-color: $bg-color;
  // background-image: linear-gradient(to bottom, #FDFBF5, #F2ECE1); // 柔和渐变
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  box-sizing: border-box;
}

// 2. 中间的大白色卡片包裹框 (外框)
.outer-wrapper-card {
  background-color: $white;
  width: 100%;
  max-width: 960px;
  border-radius: 24px; // 大圆角
  padding: 40px;       // 内边距
  box-shadow: 0 10px 40px rgba(90, 74, 66, 0.08); // 整体阴影
  border: 1px solid rgba(255, 255, 255, 0.8);
}

// 头部样式
.header-section {

  margin-bottom: 30px;


    color: #8b5a2b;


    font-weight: 600;
    font-size: 20px;
    line-height: 1.75rem;


}

// 菜单区域
.menu-grid-section {
  margin-bottom: 30px;
}

.el-row {
  margin-bottom: -30px; // 抵消下方 col 的 margin
  > .el-col {
    margin-bottom: 30px;
  }
}

// 3. 内部四个功能框样式 (内框)
.inner-menu-box {
  background-color: $white;       // 白色背景
  border: 1px solid $border-color; // 棕褐色边框
  border-radius: 16px;            // 圆角
  padding: 30px;                  // 内边距
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;

  // 悬停效果
  &:hover {
    border-color: darken($border-color, 15%); // 边框变深
    transform: translateY(-5px);              // 上浮
    box-shadow: 0 8px 25px rgba(90, 74, 66, 0.1); // 投影
  }
}

.box-content {
  display: flex;
  align-items: center;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background-color: #FAF8F5; // 极淡的米色底
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
  border: 1px solid rgba($border-color, 0.2);
}

.text-wrapper {
  flex: 1;
  
  .box-title {
    font-family: 'Noto Serif SC', serif;
    font-size: 20px;
    font-weight: 700;
    color: $primary-text;
    margin-bottom: 6px;
  }
  
  .box-desc {
    font-size: 13px;
    color: $secondary-text;
    line-height: 1.4;
  }
}

.arrow-wrapper {
  margin-left: 10px;
  opacity: 0.6;
  transition: transform 0.3s ease;
}

.inner-menu-box:hover .arrow-wrapper {
  transform: translateX(5px);
  opacity: 1;
}

// 底部页脚
.footer-section {
  text-align: center;
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid rgba($border-color, 0.3);
  
  p {
    font-size: 12px;
    color: rgba($primary-text, 0.5);
  }
}

// 动画
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

// 响应式
@media (max-width: 768px) {
  .outer-wrapper-card {
    padding: 30px 20px;
  }
  .header-section .main-title {
    font-size: 28px;
  }
}
</style>