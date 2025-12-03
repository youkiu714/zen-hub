<template>
  <div class="split-layout">
    
    <div class="sidebar-panel">
      <div class="panel-header">
        <h3>待分配成员 ({{ unassignedMembers.length }})</h3>
        <div class="filter-bar">
          <label><input type="checkbox" v-model="filters.sameDate" /> 仅看同日期</label>
        </div>
      </div>

      <div class="member-list">
        <div class="list-actions" v-if="unassignedMembers.length > 0">
           <span class="select-info">已选: <strong>{{ selectedMembers.length }}</strong> 人</span>
           <button class="text-btn" @click="clearSelection" v-if="selectedMembers.length > 0">取消</button>
        </div>

        <div 
          v-for="member in unassignedMembers" 
          :key="member.id" 
          class="member-item"
          :class="{ 'is-selected': selectedIds.includes(member.id) }"
          @click="toggleSelection(member.id)"
        >
          <div class="checkbox-area">
             <div class="custom-checkbox" :class="{ checked: selectedIds.includes(member.id) }"></div>
          </div>
          <div class="member-info">
            <div class="name-row">
              <span class="name">{{ member.name }}</span>
              <span v-if="member.age >= 60" class="tag-elder">长者 {{ member.age }}</span>
              <span v-else class="tag-young">{{ member.age }}岁</span>
            </div>
            <div class="detail-row">
              {{ member.gender === 'M' ? '男' : '女' }} | {{ member.start }}~{{ member.end }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="content-header">
        <h2>房间资源</h2>
        <div v-if="selectedMembers.length > 0" class="guide-tip">
          请选择一个房间，系统将按年龄优先分配下铺
        </div>
      </div>

      <div class="room-grid">
        <div 
          v-for="room in rooms" 
          :key="room.id" 
          class="room-card"
          :class="getRoomStateClass(room)"
        >
          <div class="card-header">
            <span class="room-number">{{ room.number }}室</span>
            <div class="room-tags">
              <span class="capacity-tag">空闲: {{ getFreeCount(room) }}</span>
            </div>
          </div>

          <div class="bed-mini-list">
            <div v-for="bed in room.beds" :key="bed.id" class="mini-bed-item">
              <span class="bed-idx" :class="bed.type">{{ bed.id }}号({{ bed.type === 'lower' ? '下' : '上' }})</span>
              <span v-if="bed.assigned" class="bed-user filled">{{ bed.assigned.name }}</span>
              <span v-else class="bed-user empty">空闲</span>
            </div>
          </div>

          <div class="card-action">
            <button 
              v-if="selectedMembers.length > 0"
              class="assign-btn"
              :disabled="!canAssignTo(room)"
              @click="openAssignModal(room)"
            >
              <span v-if="canAssignTo(room)">放入 {{ selectedMembers.length }} 人 (智能分铺)</span>
              <span v-else>容量或条件不符</span>
            </button>
            <button v-else class="view-btn">管理床位</button>
          </div>

        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ targetRoom.number }}室 - 床位排布确认</h3>
          <p class="sub-text">
            系统已按 <strong>“长者优先下铺”</strong> 规则自动预排。
            <br/>如需调整，请点击两个床位进行互换。
          </p>
        </div>

        <div class="preview-grid">
          <div 
            v-for="bed in previewBeds" 
            :key="bed.id" 
            class="preview-bed-card"
            :class="{ 
              'is-lower': bed.type === 'lower', 
              'is-selected-swap': swapSourceId === bed.id,
              'is-locked': bed.isOriginalOccupied 
            }"
            @click="handleBedSwapClick(bed)"
          >
            <div class="bed-mark">{{ bed.type === 'lower' ? '下铺' : '上铺' }} - {{ bed.id }}号</div>
            
            <div class="bed-content">
               <template v-if="bed.assigned">
                 <div class="p-name">{{ bed.assigned.name }}</div>
                 <div class="p-age" :class="{ 'elder': bed.assigned.age >= 60 }">
                   {{ bed.assigned.age }}岁
                 </div>
                 <div v-if="bed.type === 'upper' && bed.assigned.age >= 60" class="warning-tag">
                   ⚠️ 不推荐
                 </div>
               </template>
               <template v-else>
                 <div class="p-empty">空闲</div>
               </template>
            </div>
            
            <div class="selection-overlay" v-if="swapSourceId === bed.id">
              待交换...
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-confirm" @click="confirmAssignment">确认并保存</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- 模拟数据 (增加 Age) ---
const members = ref([
  { id: 1, name: '王居士', age: 72, gender: 'M', start: '12/01', end: '12/05' },
  { id: 2, name: '李居士', age: 68, gender: 'M', start: '12/01', end: '12/05' },
  { id: 3, name: '张师兄', age: 45, gender: 'M', start: '12/01', end: '12/05' },
  { id: 4, name: '刘师姐', age: 65, gender: 'F', start: '12/02', end: '12/06' },
  { id: 5, name: '陈师姐', age: 32, gender: 'F', start: '12/02', end: '12/06' },
  { id: 6, name: '赵师兄', age: 80, gender: 'M', start: '12/01', end: '12/05' },
]);

// 模拟房间结构 (增加 Beds 数组)
const rooms = ref([
  { 
    id: 101, number: '101', gender: 'M', 
    // 模拟：1,2号下铺，3,4号上铺
    beds: [
      { id: 1, type: 'lower', assigned: null },
      { id: 2, type: 'lower', assigned: null },
      { id: 3, type: 'upper', assigned: null },
      { id: 4, type: 'upper', assigned: null },
    ]
  },
  { 
    id: 102, number: '102', gender: 'F', 
    beds: [
      { id: 1, type: 'lower', assigned: null },
      { id: 2, type: 'lower', assigned: null },
      { id: 3, type: 'upper', assigned: null },
      { id: 4, type: 'upper', assigned: null },
    ]
  },
]);

// --- 状态管理 ---
const selectedIds = ref([]);
const filters = ref({ sameDate: false });

// 模态框状态
const showModal = ref(false);
const targetRoom = ref(null); // 当前操作的房间
const previewBeds = ref([]);  // 预览状态的床位数据
const swapSourceId = ref(null); // 交换操作中，选中的第一个床位的ID

// --- 计算属性 ---

// 获取未分配人员 (简单的排除法，实际项目需根据状态字段)
// 这里简化：为了演示，假设全都没分配
const unassignedMembers = computed(() => {
  // 实际逻辑应该是：return members.value.filter(m => !m.assignedRoomId)
  return members.value; 
});

const selectedMembers = computed(() => {
  return members.value.filter(m => selectedIds.value.includes(m.id));
});

const selectedGender = computed(() => {
  if (selectedMembers.value.length === 0) return null;
  return selectedMembers.value[0].gender;
});

// --- 核心逻辑 ---

const toggleSelection = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) selectedIds.value.splice(index, 1);
  else selectedIds.value.push(id);
};

const clearSelection = () => selectedIds.value = [];

const getFreeCount = (room) => room.beds.filter(b => !b.assigned).length;

const canAssignTo = (room) => {
  const count = selectedMembers.value.length;
  if (count === 0) return false;
  if (getFreeCount(room) < count) return false;
  if (selectedGender.value && room.gender !== selectedGender.value) return false;
  return true;
};

const getRoomStateClass = (room) => {
  if (selectedMembers.value.length === 0) return '';
  return canAssignTo(room) ? 'is-match' : 'is-disabled';
};

// --- [核心功能]：打开分配模态框 & 智能预排 ---
const openAssignModal = (room) => {
  targetRoom.value = room;
  swapSourceId.value = null;

  // 1. 深拷贝房间当前的床位数据，作为预览数据
  const bedsClone = JSON.parse(JSON.stringify(room.beds));
  
  // 2. 标记哪些床本来就有人（锁定，不参与自动分配逻辑，但可以手动换）
  bedsClone.forEach(b => {
    if (b.assigned) b.isOriginalOccupied = true;
  });

  // 3. 获取选中的人，并【按年龄降序排序】 (关键：长者在前)
  const peopleToAssign = [...selectedMembers.value].sort((a, b) => b.age - a.age);

  // 4. 寻找空闲床位，排序优先级：空闲下铺 > 空闲上铺
  const freeBeds = bedsClone
    .filter(b => !b.assigned)
    .sort((a, b) => {
      // 这是一个简单的排序逻辑：如果是下铺(lower)，权重高
      if (a.type === 'lower' && b.type !== 'lower') return -1;
      if (a.type !== 'lower' && b.type === 'lower') return 1;
      return a.id - b.id;
    });

  // 5. 自动填入
  peopleToAssign.forEach((person, idx) => {
    if (idx < freeBeds.length) {
      freeBeds[idx].assigned = person; // 在预览数据中填入
      freeBeds[idx].isNew = true; // 标记为本次新分配
    }
  });

  previewBeds.value = bedsClone;
  showModal.value = true;
};

// --- [核心功能]：点击交换床位 ---
const handleBedSwapClick = (bed) => {
  // 如果没有选中源，则选中当前作为源
  if (swapSourceId.value === null) {
    swapSourceId.value = bed.id;
  } else {
    // 如果再次点击自己，取消选中
    if (swapSourceId.value === bed.id) {
      swapSourceId.value = null;
      return;
    }
    
    // 执行交换
    const sourceBed = previewBeds.value.find(b => b.id === swapSourceId.value);
    const targetBed = bed;

    // 交换 assigned 对象
    const temp = sourceBed.assigned;
    sourceBed.assigned = targetBed.assigned;
    targetBed.assigned = temp;

    // 重置
    swapSourceId.value = null;
  }
};

const closeModal = () => {
  showModal.value = false;
};

const confirmAssignment = () => {
  // 将预览数据应用到真实数据
  targetRoom.value.beds = JSON.parse(JSON.stringify(previewBeds.value));
  
  // 清空选中状态
  clearSelection();
  closeModal();
  alert("分配成功！");
};

</script>

<style scoped>
/* 基础布局复用 */
.split-layout { display: flex; height: 100vh; background-color: #f5f7fa; overflow: hidden; }
.sidebar-panel { width: 300px; background: white; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; padding: 20px; }
.main-content { flex: 1; padding: 24px; overflow-y: auto; }

/* 成员列表样式 */
.member-item { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.2s; }
.member-item:hover { background-color: #fafafa; }
.member-item.is-selected { background-color: #e6f7ff; }

.name-row { display: flex; justify-content: space-between; width: 100%; align-items: center; }
.name { font-weight: 600; font-size: 15px; }
.detail-row { font-size: 12px; color: #888; margin-top: 4px; }
.custom-checkbox { width: 16px; height: 16px; border: 1px solid #ccc; margin-right: 10px; border-radius: 4px; }
.custom-checkbox.checked { background-color: #1890ff; border-color: #1890ff; }

/* 年龄标签 */
.tag-elder { background: #fff7e6; color: #fa8c16; border: 1px solid #ffd591; font-size: 11px; padding: 1px 5px; border-radius: 4px; }
.tag-young { color: #999; font-size: 11px; background: #f5f5f5; padding: 1px 4px; border-radius: 4px; }

/* 房间卡片样式 */
.room-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
.room-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 2px solid transparent; transition: all 0.2s; }
.room-card.is-match { border-color: #52c41a; box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15); }
.room-card.is-disabled { opacity: 0.6; filter: grayscale(1); cursor: not-allowed; }

.card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.room-number { font-size: 18px; font-weight: 700; color: #333; }
.capacity-tag { font-size: 12px; background: #f0f0f0; padding: 2px 8px; border-radius: 10px; }

/* 右侧：床位迷你列表展示 */
.bed-mini-list { margin-bottom: 15px; background: #fafafa; padding: 8px; border-radius: 8px; }
.mini-bed-item { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; align-items: center; }
.mini-bed-item:last-child { margin-bottom: 0; }
.bed-idx { font-size: 12px; color: #888; width: 60px; }
.bed-idx.lower { color: #006d75; font-weight: 500; } /* 下铺标识色 */
.bed-idx.upper { color: #c41d7f; } /* 上铺标识色 */

.bed-user.filled { color: #333; font-weight: 500; }
.bed-user.empty { color: #ccc; }

.assign-btn { width: 100%; background: #52c41a; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.assign-btn:disabled { background: #ccc; cursor: not-allowed; }
.view-btn { width: 100%; background: #f0f0f0; border: none; padding: 10px; border-radius: 6px; }

/* --- 模态框样式 --- */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 100; }
.modal-content { background: white; width: 600px; padding: 24px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
.modal-header h3 { margin: 0 0 5px 0; }
.sub-text { font-size: 13px; color: #666; margin-bottom: 20px; line-height: 1.5; }

/* 预览网格 */
.preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 24px; }
.preview-bed-card { 
  border: 1px solid #e8e8e8; border-radius: 8px; padding: 12px; cursor: pointer; position: relative;
  display: flex; flex-direction: column; gap: 5px; background: #fff; transition: all 0.2s;
}

/* 交换选中态 */
.preview-bed-card.is-selected-swap { border-color: #1890ff; background: #e6f7ff; transform: scale(1.02); z-index: 2; box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2); }
.preview-bed-card:hover { border-color: #bbb; }

/* 上下铺视觉区分 */
.preview-bed-card.is-lower { border-left: 4px solid #52c41a; } /* 下铺绿边 */
.preview-bed-card:not(.is-lower) { border-left: 4px solid #eb2f96; } /* 上铺粉边 */

.bed-mark { font-size: 12px; color: #999; margin-bottom: 4px; }
.p-name { font-size: 16px; font-weight: 700; color: #333; }
.p-age { font-size: 12px; color: #666; margin-top: 2px; }
.p-age.elder { color: #fa8c16; font-weight: bold; }
.p-empty { color: #ccc; font-style: italic; }

.warning-tag { position: absolute; right: 10px; top: 10px; font-size: 11px; background: #fff1f0; color: #f5222d; padding: 2px 6px; border-radius: 4px; border: 1px solid #ffa39e; }
.selection-overlay { position: absolute; inset: 0; background: rgba(24, 144, 255, 0.1); display: flex; align-items: center; justify-content: center; color: #1890ff; font-weight: bold; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-confirm { background: #1890ff; color: white; border: none; padding: 8px 24px; border-radius: 6px; cursor: pointer; }
.btn-cancel { background: #f5f5f5; border: 1px solid #ddd; padding: 8px 24px; border-radius: 6px; cursor: pointer; }
</style>