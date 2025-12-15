<template>
  <div class="dashboard-container">
    <div class="bg-image" :style="{ backgroundImage: `url(${bgImageUrl})` }"></div>
    <div class="bg-overlay"></div>

    <div class="content-wrapper z-10 relative h-full flex flex-col justify-center items-center text-white px-4">
      
      <div class="welcome-section text-center mb-16 animate-fade-in-up">
        <h1 class="system-title text-5xl md:text-6xl font-bold mb-4 tracking-wider" style="font-family: 'Noto Serif SC', serif;">
          云来集
        </h1>
        <p class="system-subtitle text-xl md:text-2xl opacity-90 font-light tracking-widest mb-8">
          挂单住宿管理系统
        </p>
        <div class="date-info inline-flex items-center space-x-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-sm md:text-base font-medium border border-white/20">
          <span>{{ currentDate }}</span>
          <span class="w-px h-4 bg-white/40"></span>
          <span>{{ currentWeekday }}</span>
        </div>
      </div>

      <div class="quick-actions grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl animate-fade-in-up delay-200">
        
        <div 
          v-for="item in allActions" 
          :key="item.path"
          class="action-card group relative overflow-hidden" 
          :class="{ 'is-locked': !hasPermission(item) }"
          @click="handleNavigation(item)"
        >
          <div 
            class="card-icon-wrapper transition-all duration-300"
            :style="{
              backgroundColor: `rgba(${item.rgb}, 0.2)`,
              color: item.hex
            }"
          >
            <el-icon :size="32">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <h3 class="text-xl font-medium">{{ item.title }}</h3>
          <p class="text-sm opacity-70 mt-2">{{ item.desc }}</p>

          <div v-if="!hasPermission(item)" class="lock-overlay">
            <el-icon :size="24" class="lock-icon"><Lock /></el-icon>
            <span class="lock-text">暂无权限</span>
          </div>
        </div>

      </div>
      
      <div class="absolute bottom-8 text-center opacity-60 text-sm font-light tracking-widest">
        虽然旧阁尘情重，且向吾门借一宵。
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
// 引入 Lock 图标
import { EditPen, House, DataLine, List, Check, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()
const currentRole = computed(() => userStore.roles)
console.log(currentRole);

// ================== 权限模拟 ==================
// 您可以在这里切换角色测试效果：'LIAISON' (对接人) 或 'HALL_MANAGER' (客堂)
// const currentRole = ref('LIAISON') 

// ================== 配置区域 ==================
const bgImageUrl = 'https://images.unsplash.com/photo-1600696714003-228f79c9d935?q=80&w=2070&auto=format&fit=crop'

const allActions = [
  {
    title: '挂单登记',
    desc: '新到人员信息录入',
    path: '/contact-application/pending-application', // 对应路由
    icon: EditPen,
    roles: ['LIAISON', 'VOLUNTEER', 'MASTER'], // 允许访问的角色：对接人、管理员
    hex: '#FBF9C9', // 图标颜色 (米黄)
    rgb: '251, 249, 201' // 用于背景透明度计算
  },
  {
    title: '挂单管理',
    desc: '查看与管理申请列表',
    path: '/contact-application/pending-management',
    icon: List,
    roles: ['LIAISON', 'VOLUNTEER', 'MASTER'], // 对接人专属
    hex: '#E4FBE9', // 浅绿
    rgb: '228, 251, 233'
  },
  {
    title: '挂单分床',
    desc: '已通过审核人员分床',
    path: '/hall-management/assignment-management', // 对应路由
    icon: House,
    roles: ['CHECKIN_VOLUNTEER', 'CHECKIN_MASTER'], // 客堂管理专属
    hex: '#DFEAFC', // 浅蓝
    rgb: '223, 234, 252'
  },
  // {
  //   title: '挂单审核',
  //   desc: '审批挂单申请',
  //   path: '/hall-management/pending-review',
  //   icon: Check,
  //   roles: ['VOLUNTEER', 'MASTER'], // 客堂管理专属
  //   hex: '#E4FBE9', 
  //   rgb: '228, 251, 233'
  // },
  // {
  //   title: '今日概览',
  //   desc: '查看数据统计报表',
  //   path: '/statistics',
  //   icon: DataLine,
  //   roles: ['VOLUNTEER', 'MASTER'], // 只有客堂管理看数据
  //   hex: '#FFFFFF', // 白色
  //   rgb: '255, 255, 255'
  // }
]

// 1. 权限判断辅助函数
const hasPermission = (item: any) => {
  if (!item.roles || item.roles.length === 0) return true
  return item.roles.includes(currentRole.value)
}

// 2. 修改后的跳转逻辑
const handleNavigation = (item: any) => {
  // 先判断权限
  if (!hasPermission(item)) {
    ElMessage.warning({
      message: '您暂无权限访问该模块，请联系管理员。',
      duration: 3000,
      showClose: true
    })
    return
  }
  // 有权限则跳转
  router.push(item.path)
}

// ================== 日期逻辑 ==================
const currentDate = ref('')
const currentWeekday = ref('')
let timer: number | null = null

dayjs.locale('zh-cn')

const updateTime = () => {
  const now = dayjs()
  currentDate.value = now.format('YYYY年MM月DD日')
  currentWeekday.value = now.format('dddd')
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.dashboard-container {
  position: relative;
  height: calc(100vh - 60px); 
  width: 100%;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  animation: slow-zoom 30s infinite alternate; 
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(62, 39, 35, 0.7));
  z-index: 1;
}

/* 卡片样式 */
.action-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 有权限时的悬停效果 */
.action-card:not(.is-locked):hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 无权限时的样式 */
.is-locked {
  cursor: not-allowed;
  opacity: 0.8; /* 稍微变暗 */
}

/* 锁遮罩层 */
.lock-overlay {
  position: absolute;
  inset: 0; /* top:0; right:0; bottom:0; left:0; */
  background: rgba(0, 0, 0, 0.2); /* 深色蒙层 */
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.3s ease;
}

/* 只有当卡片被锁定时，悬停才显示锁 */
.is-locked:hover .lock-overlay {
  opacity: 1;
  backdrop-filter: blur(4px); /* 悬停时内部变模糊 */
}

.lock-icon {
  margin-bottom: 8px;
}

.lock-text {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
}

.card-icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

/* 简单的入场动画 */
.animate-fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
}

.delay-200 {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slow-zoom {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

/* 原子类模拟 */
.text-center { text-align: center; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.text-white { color: white; }
.h-full { height: 100%; }
.relative { position: relative; }
.z-10 { z-index: 10; }
.mb-16 { margin-bottom: 4rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.font-bold { font-weight: 700; }
.text-xl { font-size: 1.25rem; line-height: 1.75; }
.opacity-90 { opacity: 0.9; }
.tracking-wider { letter-spacing: 0.05em; }
.tracking-widest { letter-spacing: 0.1em; }
.inline-flex { display: inline-flex; }
.space-x-4 > * + * { margin-left: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.rounded-full { border-radius: 9999px; }
.font-medium { font-weight: 500; }
.w-px { width: 1px; }
.h-4 { height: 1rem; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.gap-6 { gap: 1.5rem; }
.w-full { width: 100%; }
.max-w-4xl { max-width: 56rem; }
.opacity-70 { opacity: 0.7; }
.mt-2 { margin-top: 0.5rem; }
.absolute { position: absolute; }
.bottom-8 { bottom: 2rem; }
.opacity-60 { opacity: 0.6; }
@media (min-width: 768px) {
  .md\:text-6xl { font-size: 3.75rem; line-height: 1; }
  .md\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .md\:text-base { font-size: 1rem; line-height: 1.5rem; }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>