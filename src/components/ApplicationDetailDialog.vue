<template>
  <el-drawer
    v-model="visible"
    title="挂单详情"
    width="800px"
    :close-on-click-modal="false"
    class="application-detail-dialog"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">挂单详情</span>
      </div>
    </template>
    <el-descriptions>
      <el-descriptions-item :rowspan="2" width="110px" align="center">
        <el-image
          style="width: 100px; height: 100px; border-radius: 12px; margin-right: 10px"
          :src="detail?.basic.photoUrl"
        />
      </el-descriptions-item>
      <el-descriptions-item label="姓名">{{ detail?.basic.name }}</el-descriptions-item>
      <el-descriptions-item label="手机号">{{ detail?.basic.mobile }}</el-descriptions-item>
      <el-descriptions-item label="挂单开始时间">{{
        detail?.lodging.checkinDate
      }}</el-descriptions-item>
      <el-descriptions-item label="挂单结束时间">
        {{ detail?.lodging.checkoutDate }}
      </el-descriptions-item>
    </el-descriptions>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="first">
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">民族：</div>
            <div class="base-info-value">{{ detail?.basic.ethnic }}</div>
          </div>
          <div class="info-right">
            <div class="base-info-label">身份证号：</div>
            <div class="base-info-value">{{ detail?.basic.idCard }}</div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">微信号：</div>
            <div class="base-info-value">
              {{ detail?.basic?.weChat ? detail?.basic?.weChat : '暂无信息' }}
            </div>
          </div>
          <div class="info-right">
            <div class="base-info-label">婚姻状况：</div>
            <div class="base-info-value">
              {{ detail?.basic?.marital ? detail?.basic?.marital : '暂无信息' }}
            </div>
          </div>
        </div>
        <div
          class="flex-space-between line-margin"
          v-for="(item, index) in detail?.basic?.emergencyContacts || []"
          :key="item.id"
        >
          <div class="info-left" v-if="item.contactName">
            <div class="base-info-label">{{ `紧急联系人${index + 1}:` }}</div>
            <div class="base-info-value">{{ item.contactName }}</div>
          </div>
          <div class="info-right" v-if="item.contactName">
            <div class="base-info-label">电话：</div>
            <div class="base-info-value">12333</div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">常住地省市：</div>
            <div class="base-info-value">{{ detail?.basic?.city }}</div>
          </div>
          <div class="info-right">
            <div class="base-info-label">详细地址：</div>
            <div class="base-info-value">{{ detail?.basic?.province }}</div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">疾病史：</div>
            <div class="base-info-value">
              {{ detail?.basic?.diseaseHistory ? detail?.basic?.diseaseHistory : '无' }}
            </div>
          </div>
          <div class="info-right">
            <div class="base-info-label">服药史：</div>
            <div class="base-info-value">
              {{ detail?.basic?.medicationHistory ? detail?.basic?.medicationHistory : '无' }}
            </div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">传染病史：</div>
            <div class="base-info-value">
              {{ detail?.basic?.infectiousHistory ? detail?.basic?.infectiousHistory : '无' }}
            </div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">最高学历：</div>
            <div class="base-info-value">
              {{ detail?.basic?.major ? detail?.basic?.major : '暂无信息' }}
            </div>
          </div>
          <div class="info-right">
            <div class="base-info-label">毕业院校：</div>
            <div class="base-info-value">
              {{ detail?.basic?.school ? detail?.basic?.school : '暂无信息' }}
            </div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">专业：</div>
            <div class="base-info-value">
              {{ detail?.basic?.occupation ? detail?.basic?.occupation : '暂无信息' }}
            </div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">技能特长：</div>
            <div class="base-info-value">
              {{ detail?.basic?.skills ? detail?.basic?.skills : '暂无信息' }}
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="学修信息" name="second">
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">皈依时间：</div>
            <div class="base-info-value">
              {{
                detail?.baspracticeic?.ordinationDate ? detail?.basic?.ordinationDate : '暂无信息'
              }}
            </div>
          </div>
          <div class="info-right">
            <div class="base-info-label">受戒情况</div>
            <div class="base-info-value">ceshi2</div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-fill">
            <div class="base-info-label">寺院过往学修/承担经历</div>
            <el-input v-model="textarea" :rows="4" type="textarea" resize="none" />
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-fill">
            <div class="base-info-label">现参加承担/学修</div>
            <el-input v-model="textarea" :rows="4" type="textarea" resize="none" />
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-fill">
            <div class="base-info-label">来崇恩寺的次数及时间</div>
            <el-input v-model="textarea" :rows="4" type="textarea" resize="none" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="挂单信息" name="third">
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">申请短住开始时间：</div>
            <div class="base-info-value">{{ detail?.lodging.checkinDate }}</div>
          </div>
          <div class="info-right">
            <div class="base-info-label">申请短住结束时间：</div>
            <div class="base-info-value">{{ detail?.lodging.checkoutDate }}</div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-fill">
            <div class="base-info-label">短住的原因及期许</div>
            <div class="base-info-value">
              {{
                detail?.lodging.recommenderRelation
                  ? detail?.lodging.recommenderRelation
                  : '暂无推荐人评价'
              }}
            </div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-fill">
            <div class="base-info-label">自我评价</div>
            <div class="base-info-value">
              {{
                detail?.lodging.recommenderRelation
                  ? detail?.lodging.recommenderRelation
                  : '暂无推荐人评价'
              }}
            </div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-left">
            <div class="base-info-label">推荐人：</div>
            <div class="base-info-value">
              {{ detail?.lodging.recommenderName ? detail?.lodging.recommenderName : '暂无信息' }}
            </div>
          </div>
          <div class="info-right">
            <div class="base-info-label">推荐人联系方式</div>
            <div class="base-info-value">
              {{ detail?.lodging.recommenderPhone ? detail?.lodging.recommenderPhone : '暂无信息' }}
            </div>
          </div>
        </div>
        <div class="flex-space-between line-margin">
          <div class="info-fill">
            <div class="base-info-label">推荐人评价:</div>
            <div class="base-info-value">
              {{
                detail?.lodging.recommenderRelation
                  ? detail?.lodging.recommenderRelation
                  : '暂无推荐人评价'
              }}
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ApplicationDetailVO } from './types' // 假设接口定义在同级 types.ts
import { getApplicationById } from '@/api/application'

import type { TabsPaneContext } from 'element-plus'

const activeName = ref('first')
const detail = ref<ApplicationDetailVO | null>(null)

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const props = defineProps<{
  modelValue: boolean
  applicationId: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const visible = ref(false)

const getApplicationItem = async (applicationId: number) => {
  console.log('applicationId:', applicationId)
  const data = await getApplicationById(applicationId)
  console.log('挂单详情')
  console.log(data)
  detail.value = data
}

watch(
  () => [props.modelValue, props.applicationId] as const,
  async ([modelValue, newId]) => {
    visible.value = modelValue
    console.log(modelValue)
    console.log('newId:', newId)
    await getApplicationItem(newId)
  },
  { immediate: true }
)
const handleClose = () => {
  visible.value = false
  emit('update:modelValue', false)
  emit('close')
}

// 工具函数
const getGenderText = (gender?: number): string => {
  if (gender === 1) return '男'
  if (gender === 2) return '女'
  return '未知'
}

const getApplicationTypeText = (type?: number): string => {
  const map: Record<number, string> = {
    1: '短住',
    2: '团体',
    3: '直通车',
    4: '特殊'
  }
  return map[type ?? 0] || '未知类型'
}

const getTimelineType = (
  type?: string
): '' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  if (type === 'approved') return 'success'
  if (type === 'rejected') return 'danger'
  if (type === 'submit' || type === 'recommend_done') return 'primary'
  return 'info'
}

const getTimelineColor = (type?: string): string => {
  if (type === 'approved') return '#67C23A'
  if (type === 'rejected') return '#F56C6C'
  if (type === 'submit' || type === 'recommend_done') return '#409EFF'
  return '#909399'
}
</script>

<style scoped lang="scss">
.info-left,
.info-right {
  width: 50%;
}
.info-fill {
  width: 100%;
}

.line-margin {
  margin-bottom: 6px;
}
.base-info-label {
  font-size: 14px;
  line-height: 20px;
  color: rgba(107, 114, 128);
  font-weight: 500;
  margin-bottom: 2px;
}
.base-info-value {
  font-size: 18px;
  line-height: 32px;
  color: #222;
  font-weight: 600;
}
.application-detail-dialog {
  --el-dialog-title-font-size: 18px;
  --el-dialog-title-color: #8b6546;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
  color: #8b6546;
}

.close-icon {
  font-size: 18px;
  color: #909399;
}

.dialog-body {
  max-height: calc(80vh - 120px);
  overflow-y: auto;
  padding: 0 20px 20px;
}

.info-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.info-card {
  flex: 1;
  background-color: #fafafa;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #8b6546;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  line-height: 1.5;
}
</style>
<style lang="scss">
.el-drawer__header {
  margin: 0 !important;
  border-bottom: 1px solid #e4e7ed !important;
  padding-bottom: 12px !important;
}
.el-descriptions__label:not(.is-bordered-label) {
  margin-right: 10px;
}
.el-descriptions__content {
  color: #222 !important;
  font-weight: 600;
}
</style>
