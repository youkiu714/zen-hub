<template>
  <div
    class="member-card"
    :class="{ 'is-selected': isSelected }"
    @click="$emit('toggle-selection', member.applicationId)"
  >
    <div class="checkbox-wrapper">
      <div class="custom-checkbox">
        <svg
          v-if="isSelected"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>

    <div class="info-wrapper">
      <div class="row-primary">
        <span class="member-name">{{ member.name }}</span>
        <span class="tag-group" :class="getGroupClass(member.departmentCode)">{{ DepartmentMap[member.departmentCode] }}</span>

        <span v-if="showRoomInfo && member.roomNo" class="tag-room">
          🏠 {{ member.roomNo }}室
        </span>

        <span class="tag-age" :class="{ 'is-elder': member.age >= 60 }">{{ member.age }}岁</span>
      </div>
      <div class="row-secondary">
        <div class="gender-box" :class="member.gender">
          <span class="symbol">{{ member.gender === 'M' ? '♂' : '♀' }}</span>
          <span>{{ member.gender === 'M' ? '男众' : '女众' }}</span>
        </div>
        <div class="divider">|</div>
        <div class="date-text">{{ member.checkinDate }} - {{ member.checkoutDate }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {  DepartmentMap, DepartmentMapColor } from '@/utils/constants'

defineProps({
  member: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  showRoomInfo: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-selection'])

const getGroupClass = (group) => {
  const department = DepartmentMapColor[group]
  return department ? department.className : 'g-gray'
}
</script>

<style scoped>
.member-card {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.member-card:hover {
  border-color: #d9d9d9;
  background: #fafafa;
}

.member-card.is-selected {
  border-color: #1890ff;
  background: #f0f9ff;
}

.checkbox-wrapper {
  margin-right: 10px;
  display: flex;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid #d9d9d9;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
}

.member-card.is-selected .custom-checkbox {
  background: #1890ff;
  border-color: #1890ff;
}

.custom-checkbox svg {
  width: 12px;
  height: 12px;
}

.info-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.row-primary {
  display: flex;
  align-items: center;
  gap: 6px;
}

.member-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.tag-group {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
}
/* 房号标签 */
.tag-room {
  font-size: 11px;
  background: #fffbe6;
  color: #fa8c16;
  border: 1px solid #ffe58f;
  padding: 0 4px;
  border-radius: 4px;
}

.tag-age {
  font-size: 11px;
  color: #999;
  margin-left: auto;
}

.tag-age.is-elder {
  color: #fa8c16;
  font-weight: 500;
}

.row-secondary {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #999;
}

.gender-box.M {
  color: #597ef7;
}

.gender-box.F {
  color: #f759ab;
}

.divider {
  margin: 0 6px;
  color: #eee;
}
</style>
