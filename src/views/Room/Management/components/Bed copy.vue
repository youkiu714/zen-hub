<template>
  <div class="dashboard-container">
    <div v-for="(floor, index) in floorData" :key="index" class="floor-section">
      
      <div class="floor-header">
        <div class="header-decoration"></div>
        <h2 class="floor-title">{{ floor.name }}</h2>
        
        <a 
          href="#" 
          class="floor-toggle-link" 
          @click.prevent="toggleFloorExpand(floor)"
        >
          {{ floor.isExpanded ? '全部收起' : '全部展开' }}
          <span class="arrow" :class="{ 'arrow-up': floor.isExpanded }">
            {{ floor.isExpanded ? '↑' : '↓' }}
          </span>
        </a>
      </div>

      <div class="room-grid">
        <div v-for="room in floor.rooms" :key="room.id" class="room-card" :class="{ 'is-expanded': room.isExpanded }">
          
          <div class="card-header">
            <span class="room-number">{{ room.number }}室</span>
            <span :class="['status-tag', getTagClass(room.type)]">
              {{ room.typeText }}
            </span>
          </div>

          <div class="card-body">
            <div class="stats-row">
              <div class="occupancy">
                <span class="current-num">{{ room.occupied }}</span>
                <span class="divider">/</span>
                <span class="total-num">{{ room.total }}</span>
                <span class="label">已用</span>
              </div>
            </div>

            <div class="progress-bg">
              <div 
                class="progress-fill" 
                :style="{ width: calculatePercentage(room.occupied, room.total) + '%' }"
                :class="{ 'full-load': room.occupied === room.total && room.total > 0 }"
              ></div>
            </div>
          </div>

          <div v-if="room.isExpanded" class="bed-details-area">
            <template v-if="room.beds && room.beds.length > 0">
              <div class="bed-grid">
                <div v-for="bed in room.beds" 
                   :key="bed.id" 
                   class="bed-item"
                   :class="{ 'is-occupied': bed.status === 'occupied', 'is-free': bed.status === 'free' }" 
                >
                  <div class="bed-info">
                    <span class="bed-idx">{{ bed.index }}</span>
                    <span class="bed-label">({{ bed.position }})</span>
                  </div>
                  <div class="bed-status">
                    <span v-if="bed.status === 'free'" class="status-icon">🏠</span> 
                    <span v-else class="status-icon">👤</span>
                    <span class="status-text">{{ bed.status === 'free' ? '空闲' : '已占' }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="no-bed-data-message">
                该房间暂无可用床位信息。
              </div>
            </template>
          </div>

          <div class="card-footer">
            <span class="remaining-text">剩余: {{ room.total - room.occupied }} 床</span>
            
            <a href="#" class="view-link" @click.prevent="toggleRoomExpand(room)">
              {{ room.isExpanded ? '收起床位' : '查看床位' }} 
              <span class="arrow" :class="{ 'arrow-up': room.isExpanded }">
                {{ room.isExpanded ? '↑' : '→' }}
              </span>
            </a>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 辅助函数：生成床位数据
const generateBeds = (total, occupiedCount) => {
  const beds = [];
  for (let i = 1; i <= total; i++) {
    beds.push({
      id: i,
      index: i,
      position: i % 2 !== 0 ? '上铺' : '下铺', // 简单逻辑：奇数上铺，偶数下铺
      status: i <= occupiedCount ? 'occupied' : 'free' // 前几个设为占用
    });
  }
  return beds;
};

// 模拟数据 (新增 isExpanded 状态到楼层对象)
const floorData = ref([
  {
    name: '第1层',
    isExpanded: false, // <-- 新增：楼层状态
    rooms: [
      { 
        id: 101, 
        number: '1002', 
        type: 'guest', 
        typeText: '客房', 
        occupied: 0, 
        total: 4, 
        isExpanded: false, 
        beds: generateBeds(4, 0)
      },
      { 
        id: 102, 
        number: '106', 
        type: 'short', 
        typeText: '短住', 
        occupied: 2, 
        total: 7, 
        isExpanded: false,
        beds: generateBeds(7, 2) 
      },
      { 
        id: 104, 
        number: '111', 
        type: 'short', 
        typeText: '短住', 
        occupied: 4, 
        total: 4, 
        isExpanded: false,
        beds: generateBeds(4, 4) 
      }, 
    ]
  },
  {
    name: '第3层',
    isExpanded: false, // <-- 新增：楼层状态
    rooms: [
      { id: 301, number: '407', type: 'disabled', typeText: '停用', occupied: 0, total: 0, isExpanded: false, beds: [] },
    ]
  },
  {
    name: '第6层',
    isExpanded: false, // <-- 新增：楼层状态
    rooms: [
      { id: 601, number: '412', type: 'guest', typeText: '客房', occupied: 0, total: 0, isExpanded: false, beds: [] },
    ]
  }
]);

// 核心功能：切换楼层内所有房间的展开/收起状态
const toggleFloorExpand = (floor) => {
  // 1. 切换楼层自身的展开状态
  floor.isExpanded = !floor.isExpanded;
  
  // 2. 遍历该楼层下所有房间，将它们的 isExpanded 状态同步到楼层状态
  floor.rooms.forEach(room => {
    room.isExpanded = floor.isExpanded;
  });
};

// 单个房间切换（修复了之前可能存在的误调用问题）
const toggleRoomExpand = (room) => {
    room.isExpanded = !room.isExpanded;
};


const calculatePercentage = (current, total) => {
  if (!total || total === 0) return 0;
  return Math.min((current / total) * 100, 100);
};

const getTagClass = (type) => {
  const map = {
    short: 'tag-green',
    guest: 'tag-blue',
    maintenance: 'tag-red',
    disabled: 'tag-gray'
  };
  return map[type] || 'tag-gray';
};
</script>

<style scoped>
/* --- 基础布局 (保持原样) --- */
.dashboard-container {
  min-height: 100vh;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.floor-section { margin-bottom: 32px; }

/* --- 楼层头部 (布局调整) --- */
.floor-header { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; /* 标题和按钮分居两侧 */
    margin-bottom: 16px; 
}
.header-decoration { width: 4px; height: 20px; background-color: #3b82f6; border-radius: 2px; margin-right: 12px; }
.floor-title { 
    font-size: 18px; 
    font-weight: 700; 
    color: #1f2937; 
    margin: 0 0 0 0; /* 清除默认margin */
    margin-right: auto; /* 占据空间，将按钮推到右侧 */
}
.room-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }

/* --- 新增：楼层总开关样式 --- */
.floor-toggle-link {
    font-size: 14px;
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}
.floor-toggle-link:hover {
    color: #1d4ed8;
}
.floor-toggle-link .arrow {
    margin-left: 4px; 
    font-size: 16px; 
    transition: transform 0.2s;
}


/* --- 卡片样式 (保持原样) --- */
.room-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #e5e7eb;
}

/* 头部 & 标签 */
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.room-number { font-size: 18px; font-weight: 700; color: #111827; }
.status-tag { padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 500; }
.tag-green { background-color: #ecfdf5; color: #059669; }
.tag-blue { background-color: #eff6ff; color: #2563eb; }
.tag-red { background-color: #fef2f2; color: #dc2626; }
.tag-gray { background-color: #f3f4f6; color: #6b7280; }

/* 数据统计区 */
.card-body { margin-bottom: 16px; }
.stats-row { display: flex; align-items: baseline; margin-bottom: 8px; }
.current-num { font-size: 24px; font-weight: 700; color: #3b82f6; }
.divider { margin: 0 4px; color: #9ca3af; font-size: 14px; }
.total-num { font-size: 16px; color: #6b7280; font-weight: 600; }
.label { font-size: 12px; color: #9ca3af; margin-left: 6px; }
.progress-bg { height: 6px; background-color: #f3f4f6; border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background-color: #3b82f6; border-radius: 99px; transition: width 0.5s ease-out; }
.progress-fill.full-load { background-color: #f59e0b; }

/* --- 床位详情列表区域 (包含空数据提示样式) --- */
.bed-details-area {
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.bed-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* --- 新增：无数据提示样式 --- */
.no-bed-data-message {
  padding: 12px;
  background-color: #f7f7f7;
  border-radius: 8px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 状态 - 明确的色彩区分 */

.bed-item {
  border-radius: 99px; 
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
/* 1. 空闲 (绿色：可使用/可预订) */
.bed-item.is-free {
  background-color: #eafbea; 
  color: #10b981; 
  border-color: #a7f3d0;
}
/* 2. 已占 (品牌蓝：已分配/占用中) */
.bed-item.is-occupied {
  background-color: #eef2ff; 
  color: #3b82f6; 
  border-color: #a8baff;
}
/* 床位信息 */
.bed-info { display: flex; align-items: center; }
.bed-idx { font-weight: 600; margin-right: 4px; }
.bed-label { font-size: 12px; font-weight: 400; opacity: 0.8; }
/* 状态图标和文字 */
.bed-status { display: flex; align-items: center; gap: 4px; }
.bed-item.is-occupied .status-icon { color: #3b82f6; font-size: 14px; opacity: 0.8; }
.bed-item.is-free .status-icon { color: #10b981; font-size: 14px; opacity: 0.8; }
.status-text { font-weight: 600; font-size: 12px; }


/* --- 底部操作 (保持原样) --- */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  margin-top: auto; 
}
.remaining-text { font-size: 12px; color: #6b7280; }
.view-link {
  font-size: 13px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.view-link:hover { color: #1d4ed8; }
.arrow { margin-left: 4px; font-size: 14px; transition: transform 0.2s; }
.arrow-up { transform: rotate(0deg); }
</style>