<template>
  <el-card class="room-card">
    <div class="room-header">
      <h3>{{ room.roomNo }} {{ room.roomTypeName }}</h3>
      <span class="room-capacity">({{ room.capacity }}人房)</span>
    </div>
    <div class="bed-grid">
      <BedStatusTag
        v-for="bed in room.beds"
        :key="bed.bedId"
        :bedNo="bed.bedNo"
        :occupied="bed.occupied"
        :isLocked="false"
        :isCleaning="false"
      />
    </div>
    <div class="room-footer">
      <span>已占用: {{ room.occupiedCount }}/{{ room.capacity }}</span>
      <el-link type="primary" @click="handleViewDetails">查看详情</el-link>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import BedStatusTag from './BedStatusTag.vue';

const props = defineProps<{
  room: any; // 可以替换为更具体的类型
}>();

const emit = defineEmits(['view-details']);

const handleViewDetails = () => {
  emit('view-details', props.room);
};
</script>

<style scoped>
.room-card {
  width: 32%;
  margin-right: 2%;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.room-header h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.room-capacity {
  font-size: 12px;
  color: #999;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
}

.bed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: 10px;
  flex: 1;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-top: 1px solid #eee;
  background-color: #fafafa;
}

.room-footer span {
  font-size: 12px;
  color: #666;
}
</style>