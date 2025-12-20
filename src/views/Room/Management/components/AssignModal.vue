<template>
  <transition name="fade">
    <div v-if="modelValue" class="modal-overlay">
      <div class="modal-content-minimal">
        <div class="modal-header">
          <h3>
            {{ roomTitle }} - 确认排布
            <span class="sub-text">(如需调整，请直接点击两个床位进行互换)</span>
          </h3>
          <div class="summary-row">
            <span class="summary-item">已分配: {{ originalAssignedCount }}床</span>
            <span class="summary-item">本次分配: {{ newAssignedCount }}人</span>
            <span class="summary-item">可调整: {{ adjustableCount }}床</span>
          </div>
          <div class="sub-hint">
            已分配/不可用的床位无法点击；本次分配的床位可点击互换。
          </div>
        </div>

        <div class="preview-grid-minimal">
          <div
            v-for="bed in previewBeds"
            :key="bed.bedId"
            class="preview-tile"
            :class="{
              'is-lower': bed.type === 'lower',
              'is-selected-swap': swapSourceId === bed.bedId,
              'is-locked': bed.isOriginalOccupied,
              'is-blocked': bed.isBlocked,
              'is-new': bed.isNew
            }"
            @click="handleTileClick(bed)"
          >
            <div class="tile-header">
              <span class="bed-idx">{{ bed.bedNo }}</span>
              <span
                class="status-pill"
                :class="{
                  locked: bed.isOriginalOccupied,
                  blocked: bed.isBlocked,
                  new: bed.isNew
                }"
              >
                <template v-if="bed.isBlocked">不可用</template>
                <template v-else-if="bed.isOriginalOccupied">已分配</template>
                <template v-else-if="bed.isNew">本次</template>
                <template v-else>空闲</template>
              </span>
            </div>

            <div class="tile-body">
              <template v-if="bed.assigned">
                <div class="p-name">{{ bed.assigned.name }}</div>
                <div class="p-meta">
                  <span>{{ bed.assigned.age }}岁</span>
                  <span v-if="bed.assigned.age >= 60" class="elder-indicator">长者</span>
                </div>
                <div
                  v-if="bed.type === 'upper' && bed.assigned.age >= 60"
                  class="warning-indicator"
                >
                  建议调至下铺
                </div>
              </template>
              <template v-else>
                <div class="p-empty">空闲</div>
              </template>
            </div>
          </div>
        </div>

        <div class="modal-actions-minimal">
          <button class="btn-minimal cancel" type="button" @click="emit('update:modelValue', false)">
            取消
          </button>
          <button class="btn-minimal confirm" type="button" @click="emit('confirm')">
            确认分配
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  targetRoom: any
  previewBeds: any[]
  swapSourceId: number | null
  currentInfo: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'bed-swap', bed: any): void
  (e: 'confirm'): void
}>()

watch(() => props.modelValue, (value) => {
    console.log("value:", value)
})

const roomTitle = computed(() => {
  const roomNo = props.targetRoom?.roomNo ?? props.targetRoom?.number
  return roomNo ? `${roomNo}室` : '确认排布'
})

const originalAssignedCount = computed(() =>
  (props.previewBeds ?? []).filter((b: any) => b?.isOriginalOccupied && b?.assigned).length
)

const newAssignedCount = computed(() =>
  (props.previewBeds ?? []).filter((b: any) => b?.isNew && b?.assigned).length
)

const adjustableCount = computed(() =>
  (props.previewBeds ?? []).filter((b: any) => !b?.isOriginalOccupied && !b?.isBlocked).length
)

const handleTileClick = (bed: any) => {
  if (bed?.isOriginalOccupied || bed?.isBlocked) return
  if (!bed?.isNew) return
  emit('bed-swap', bed)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(5px);
}
.modal-content-minimal {
  background: white;
  width: 600px;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.1);
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  margin-bottom: 24px;
  text-align: center;
  flex: 0 0 auto;
}
.modal-header h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  color: #1d1d1f;
}
.modal-header .sub-text {
  color: #86868b;
  font-size: 14px;
  line-height: 1.5;
  margin-left: 8px;
}

.summary-row {
  margin-top: 8px;
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  color: #1d1d1f;
  font-size: 13px;
}
.summary-item {
  background: #f2f2f7;
  padding: 4px 8px;
  border-radius: 8px;
}
.sub-hint {
  margin-top: 10px;
  color: #86868b;
  font-size: 12px;
}

.preview-grid-minimal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1 1 auto;
  overflow: auto;
  padding-right: 6px;
}

.preview-tile {
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}
.preview-tile:hover {
  border-color: #adadad;
}
.preview-tile.is-selected-swap {
  border: 2px solid #007aff;
  background: #f5fafe;
  box-shadow: none;
}
.preview-tile.is-locked {
  background: #f9f9f9;
  opacity: 0.7;
  cursor: not-allowed;
}
.preview-tile.is-blocked {
  background: #f6f6f6;
  opacity: 0.75;
  cursor: not-allowed;
}
.preview-tile.is-new {
  border-color: #34c759;
}

.tile-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  color: #86868b;
}

.status-pill {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #f2f2f7;
  color: #1d1d1f;
}
.status-pill.locked {
  background: #fff5e6;
  color: #c76a00;
}
.status-pill.blocked {
  background: #f2f2f7;
  color: #86868b;
}
.status-pill.new {
  background: #eaffef;
  color: #1f7a33;
}
.bed-pos.lower {
  color: #34c759;
}
.bed-pos.upper {
  color: #ff9f0a;
}

.tile-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.p-name {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}
.p-meta {
  font-size: 13px;
  color: #86868b;
  display: flex;
  align-items: center;
  gap: 6px;
}
.elder-indicator {
  font-size: 11px;
  color: #ff9f0a;
  background: #fff5e6;
  padding: 1px 5px;
  border-radius: 4px;
}
.p-empty {
  color: #adadad;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
}
.warning-indicator {
  margin-top: 8px;
  font-size: 12px;
  color: #ff3b30;
  background: #fff2f2;
  padding: 4px 8px;
  border-radius: 6px;
  text-align: center;
}

.modal-actions-minimal {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex: 0 0 auto;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.btn-minimal {
  width: 120px;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-minimal.confirm {
  background: #1d1d1f;
  color: white;
}
.btn-minimal.confirm:hover {
  background: #333;
}
.btn-minimal.cancel {
  background: #f2f2f7;
  color: #1d1d1f;
}
.btn-minimal.cancel:hover {
  background: #e5e5e5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
