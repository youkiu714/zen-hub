<template>
  <div class="application-entry">
    <ApplicationBreadcrumb :items="breadcrumbItems" />
    <div class="entry-shell">
      <div class="type-panel">
        <div class="panel-title">挂单类型</div>
        <div class="type-cards">
          <div class="type-card" @click="handleSelect('short_stay')">
            <div class="card-icon">
              <el-icon><House /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">短住</div>
              <div class="card-desc">适用于短期挂单住宿，需填写个人基本信息和推荐人</div>
            </div>
          </div>
          <div class="type-card" @click="handleSelect('express')">
            <div class="card-icon">
              <el-icon><Lightning /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">直通车</div>
              <div class="card-desc">快速挂单通道，需填写个人基本信息和推荐人</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { House, Lightning } from '@element-plus/icons-vue'
import ApplicationBreadcrumb from './components/ApplicationBreadcrumb.vue'

type ApplicationTypeKey = 'short_stay' | 'express'

const router = useRouter()

const breadcrumbItems = [{ label: '挂单申请' }, { label: '挂单类型' }]

const goToMethodSelect = (type: ApplicationTypeKey) => {
  router.push({
    path: '/contact-application/pending-application/method',
    query: { type }
  })
}

const handleSelect = (type: ApplicationTypeKey) => {
  goToMethodSelect(type)
}
</script>

<style scoped>
.application-entry {
  padding: 24px;
}

.entry-shell {
  width: 100%;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24px 0 36px;
  gap: 24px;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  color: #9d8a74;
}

.step::after {
  content: '';
  position: absolute;
  top: 18px;
  right: -50%;
  width: 100%;
  height: 2px;
  background: #e7dac7;
  z-index: 0;
}

.step:last-child::after {
  display: none;
}

.step-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f2e6d4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a98a63;
  font-size: 22px;
  position: relative;
  z-index: 1;
}

.step.active .step-icon {
  background: #a0733f;
  color: #fff;
}

.step-label {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #a0733f;
}

.type-panel {
  background: #fff;
  border-radius: 20px;
  padding: 32px 36px;
  box-shadow: 0 12px 30px rgba(160, 115, 63, 0.12);
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
  color: #8a5d2e;
  margin-bottom: 20px;
}

.type-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.type-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-radius: 16px;
  border: 2px solid #e6d8c5;
  background: #fffdf8;
  transition: all 0.2s ease;
  cursor: pointer;
}

.type-card:hover {
  border-color: #a0733f;
  box-shadow: 0 10px 24px rgba(160, 115, 63, 0.15);
  transform: translateY(-2px);
}

.card-icon {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #f3e7d8;
  color: #a0733f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #6f4a1f;
}

.card-desc {
  margin-top: 6px;
  font-size: 14px;
  line-height: 1.6;
  color: #7b6a56;
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
