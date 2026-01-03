<template>
  <div class="dashboard-container">
    <div class="bg-image" :style="{ backgroundImage: `url(${bgImageUrl})` }"></div>
    <div class="bg-overlay"></div>

    <div class="content-wrapper z-10 relative h-full flex flex-col justify-center items-center text-white px-4">

      <div class="relogin-position animate-fade-in-up">
        <div class="relogin-btn group" @click="handleReLogin">
          <el-icon class="relogin-icon">
            <SwitchButton />
          </el-icon>
          <span class="relogin-text">重新登录</span>
        </div>
      </div>

      <div class="welcome-section text-center mb-16 animate-fade-in-up">
        <h1 class="system-title text-5xl md:text-6xl font-bold mb-4 tracking-wider"
          style="font-family: 'Noto Serif SC', serif;">
          挂单住宿管理系统
        </h1>
        <div
          class="date-info inline-flex items-center space-x-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-sm md:text-base font-medium border border-white/20">
          <span>{{ currentDate }}</span>
          <span class="w-px h-4 bg-white/40"></span>
          <span>{{ currentWeekday }}</span>
        </div>
      </div>

      <div class="quick-actions grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-fade-in-up delay-200">

        <div v-for="item in visibleActions" :key="item.path" class="action-card group relative overflow-hidden"
          @click="handleNavigation(item)">
          <div class="card-icon-wrapper transition-all duration-300"
            :style="{ backgroundColor: `rgba(${item.rgb}, 0.2)`, color: item.hex }">
            <el-icon :size="32">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <h3 class="text-xl font-medium">{{ item.title }}</h3>
          <p class="text-sm opacity-70 mt-2">{{ item.desc }}</p>
        </div>

      </div>

      <div class="absolute bottom-8 text-center opacity-60 text-sm font-light tracking-widest">
        虽然旧阁尘情重，且向吾门借一宵。
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { EditPen, House, List, Check, User, Operation, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 权限处理：确保 roles 是数组
const currentRoles = computed(() => {
  const roles = userStore.roles
  if (Array.isArray(roles)) return roles
  if (typeof roles === 'string' && roles) return [roles]
  return []
})

const bgImageUrl = 'https://images.unsplash.com/photo-1600696714003-228f79c9d935?q=80&w=2070&auto=format&fit=crop'

const handleReLogin = () => {
  ElMessageBox.confirm('确定要退出当前账号并重新登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    if (userStore.logout) await userStore.logout()
    else { localStorage.clear(); sessionStorage.clear() }
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => { })
}

// ================== 菜单配置 (已修正) ==================
const allActionsConfig = [
  // 1. 挂单管理 (LIAISON, VOLUNTEER, MASTER 都能看)
  {
    title: '挂单管理',
    desc: '查看申请列表状态',
    path: '/contact-application/pending-management',
    icon: List,
    roles: ['LIAISON', 'VOLUNTEER', 'MASTER'],
    hex: '#FBF9C9', rgb: '251, 249, 201'
  },

  // --- LIAISON (对接人) 专属 ---
  {
    title: '挂单申请', // 新到人员录入
    desc: '新到人员信息录入',
    path: '/contact-application/pending-application',
    icon: EditPen,
    roles: ['LIAISON'],
    hex: '#E4FBE9', rgb: '228, 251, 233'
  },
  {
    title: '人员管理', // 在住人员维护
    desc: '在住人员信息维护',
    path: '/person-management/list',
    icon: User,
    roles: ['LIAISON'],
    hex: '#DFEAFC', rgb: '223, 234, 252'
  },

  // --- VOLUNTEER / MASTER (客堂) 专属 ---
  {
    title: '挂单审核', // 审批
    desc: '审批挂单申请',
    path: '/hall-management/pending-review',
    icon: Check,
    roles: ['VOLUNTEER', 'MASTER'],
    hex: '#E4FBE9', rgb: '228, 251, 233'
  },
  {
    title: '入住登记', // 办理入住
    desc: '办理人员入住',
    path: '/hall-management/check-in-registration',
    icon: User,
    roles: ['VOLUNTEER', 'MASTER'],
    hex: '#DFEAFC', rgb: '223, 234, 252'
  },

  // --- CHECKIN (住宿部) 专属 ---
  {
    title: '挂单分床',
    desc: '单人床位分配',
    path: '/hall-management/assignment-management',
    icon: House,
    roles: ['CHECKIN_VOLUNTEER', 'CHECKIN_MASTER'],
    hex: '#DFEAFC', rgb: '223, 234, 252'
  },
  {
    title: '批量分床',
    desc: '批量自动分配床位',
    path: '/hall-management/assignment-management',
    icon: Operation,
    roles: ['CHECKIN_VOLUNTEER', 'CHECKIN_MASTER'],
    hex: '#FBF9C9', rgb: '251, 249, 201'
  },
  {
    title: '房间编辑',
    desc: '房间及床位信息维护',
    path: '/accommodation-management/room-bed-edit',
    icon: EditPen,
    roles: ['CHECKIN_VOLUNTEER', 'CHECKIN_MASTER'],
    hex: '#E4FBE9', rgb: '228, 251, 233'
  }
]

// 计算当前用户可见的菜单
const visibleActions = computed(() => {
  const userRoleList = currentRoles.value
  const uniquePaths = new Set()

  return allActionsConfig.filter(item => {
    // 数组精确匹配
    const hasPermission = item.roles.some(allowedRole => userRoleList.includes(allowedRole))

    if (hasPermission && !uniquePaths.has(item.path + item.title)) {
      uniquePaths.add(item.path + item.title)
      return true
    }
    return false
  })
})

const handleNavigation = (item: any) => {
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

/* 容器基础样式 */
.dashboard-container {
  position: relative;
  height: 100vh;
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
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(62, 39, 35, 0.7));
  z-index: 1;
}

/* 重新登录按钮样式 */
.relogin-position {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 20;
}

.relogin-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.relogin-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.relogin-icon {
  transition: transform 0.5s ease;
}

.relogin-btn:hover .relogin-icon {
  transform: rotate(180deg);
}

.relogin-text {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* 卡片样式 */
.action-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
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

.action-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
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

/* 动画 */
.animate-fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
}

.delay-200 {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slow-zoom {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.1);
  }
}

/* Tailwind 原子类模拟 */
.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.justify-center {
  justify-content: center;
}

.items-center {
  align-items: center;
}

.text-white {
  color: white;
}

.h-full {
  height: 100%;
}

.relative {
  position: relative;
}

.z-10 {
  z-index: 10;
}

.mb-16 {
  margin-bottom: 4rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.font-bold {
  font-weight: 700;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75;
}

.opacity-90 {
  opacity: 0.9;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.inline-flex {
  display: inline-flex;
}

.space-x-4>*+* {
  margin-left: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.rounded-full {
  border-radius: 9999px;
}

.font-medium {
  font-weight: 500;
}

.w-px {
  width: 1px;
}

.h-4 {
  height: 1rem;
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.gap-6 {
  gap: 1.5rem;
}

.w-full {
  width: 100%;
}

.max-w-5xl {
  max-width: 64rem;
}

.opacity-70 {
  opacity: 0.7;
}

.mt-2 {
  margin-top: 0.5rem;
}

.absolute {
  position: absolute;
}

.bottom-8 {
  bottom: 2rem;
}

.opacity-60 {
  opacity: 0.6;
}

@media (min-width: 768px) {
  .md\:text-6xl {
    font-size: 3.75rem;
    line-height: 1;
  }

  .md\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>