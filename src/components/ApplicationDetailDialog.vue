<template>
  <el-drawer
    v-model="visible"
    title="挂单详情"
    width="800px"
    class="application-detail-dialog"
    @close="handleClose"
    close-on-click-modal
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">挂单详情</span>
      </div>
    </template>
    <div v-loading="loading">
      <!-- 头部信息布局 -->
      <div class="header-info">
        <div class="avatar-container">
          <el-image class="header-info-avatar" :src="detail?.basic.photoUrl" fit="cover" />
        </div>
        <div class="basic-info">
          <div class="info-row">
            <div class="info-item info-item-less">
              <span class="label">姓名：</span>
              <span class="value">{{ detail?.basic.name }}</span>
            </div>
            <div class="info-item">
              <span class="label info-item-more">手机号：</span>
              <span class="value">{{ detail?.basic.mobile }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item info-item-less">
              <span class="label">年龄：</span>
              <span class="value">{{ detail?.basic.age }}</span>
            </div>
            <div class="info-item">
              <span class="label info-item-more">短住开始时间：</span>
              <span class="value">{{ detail?.lodging.checkinDate }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item info-item-less">
              <span class="label">性别：</span>
              <span class="value">{{ getGenderText(detail?.basic.gender) }}</span>
            </div>

            <div class="info-item">
              <span class="label info-item-more">短住结束时间：</span>
              <span class="value">{{ detail?.lodging.checkoutDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="基本信息" name="baseInfo">
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
          <div class="flex-space-between line-margin">
            <div class="info-left">
              <div class="base-info-label">出生日期：</div>
              <div class="base-info-value">
                {{ detail?.basic?.birthDate ? detail?.basic?.birthDate : '无' }}
              </div>
            </div>
            <div class="info-right">
              <div class="base-info-label">传染病史：</div>
              <div class="base-info-value">
                {{ detail?.basic?.infectiousHistory ? detail?.basic?.infectiousHistory : '无' }}
              </div>
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
              <div class="base-info-value">{{ provinceCity }}</div>
            </div>
            <div class="info-right">
              <div class="base-info-label">详细地址：</div>
              <div class="base-info-value">{{ detail?.basic?.address }}</div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-left">
              <div class="base-info-label">最高学历：</div>
              <div class="base-info-value">
                {{ detail?.basic?.education ? detail?.basic?.education : '暂无信息' }}
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
                {{ detail?.basic?.major ? detail?.basic?.major : '暂无信息' }}
              </div>
            </div>
            <div class="info-right">
              <div class="base-info-label">职业：</div>
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
        <el-tab-pane label="学修信息" name="practiceInfo">
          <div class="flex-space-between line-margin">
            <div class="info-left">
              <div class="base-info-label">皈依时间：</div>
              <div class="base-info-value">
                {{
                  detail?.practice?.refugeTakenDate ? detail?.practice?.refugeTakenDate : '暂无信息'
                }}
              </div>
            </div>
            <div class="info-right">
              <div class="base-info-label">受戒情况</div>
              <div class="base-info-value">
                {{
                  detail?.practice?.hasTakenPrecepts
                    ? preceptsOptions.find(
                        (item) => item.label == detail?.practice?.hasTakenPrecepts
                      )?.text
                    : '无'
                }}
              </div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-left">
              <div class="base-info-label">皈依寺庙：</div>
              <div class="base-info-value">
                {{ detail?.practice?.refugeTemple ? detail?.practice?.refugeTemple : '暂无信息' }}
              </div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-fill">
              <div class="base-info-label">过往学修/承担经历</div>
              <div class="base-info-value">
                {{
                  detail?.practice?.pastPracticeExperience
                    ? detail?.practice?.pastPracticeExperience
                    : '暂无信息'
                }}
              </div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-fill">
              <div class="base-info-label">现参加承担/学修</div>
              <div class="base-info-value">
                {{
                  detail?.practice?.currentPracticeExperience
                    ? detail?.practice?.currentPracticeExperience
                    : '暂无信息'
                }}
              </div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-fill">
              <div class="base-info-label">来崇恩寺的次数及时间</div>
              <div class="base-info-value">
                {{ detail?.practice?.visitRecords ? detail?.practice?.visitRecords : '暂无信息' }}
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="挂单信息" name="lodgingINfo">
          <div class="flex-space-between line-margin">
            <div class="info-left">
              <div class="base-info-label">挂单类型：</div>
              <div class="base-info-value">
                {{
                  detail?.lodging?.applicationType
                    ? applicationTypeOptions.find(
                        (item) => item.value === detail?.lodging.applicationType
                      )?.label
                    : '暂无信息'
                }}
              </div>
            </div>
            <div class="info-right">
              <div class="base-info-label">所属部族：</div>
              <div class="base-info-value">
                {{
                  detail?.lodging?.departmentCode
                    ? departmentOptions.find(
                        (item) => item.value == detail?.lodging?.departmentCode
                      )?.label
                    : '其他'
                }}
              </div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-left">
              <div class="base-info-label">短住开始时间：</div>
              <div class="base-info-value">{{ detail?.lodging.checkinDate ?? '暂无信息' }}</div>
            </div>
            <div class="info-right">
              <div class="base-info-label">短住结束时间：</div>
              <div class="base-info-value">{{ detail?.lodging.checkoutDate ?? '暂无信息' }}</div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-left">
              <div class="base-info-label">出发时间：</div>
              <div class="base-info-value">{{ detail?.lodging.departureDate ?? '暂无信息' }}</div>
            </div>
            <div class="info-right">
              <div class="base-info-label">离开时间:</div>
              <div class="base-info-value">{{ detail?.lodging.returnDate ?? '暂无信息' }}</div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-fill">
              <div class="base-info-label">短住的原因及期许</div>
              <div class="base-info-value">
                {{
                  detail?.lodging.shortStayReason
                    ? detail?.lodging.shortStayReason
                    : '暂无评价'
                }}
              </div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-fill">
              <div class="base-info-label">自我评价</div>
              <div class="base-info-value">
                {{
                  detail?.lodging.selfEvaluation ? detail?.lodging.selfEvaluation : '暂无推荐人评价'
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
                {{
                  detail?.lodging.recommenderPhone ? detail?.lodging.recommenderPhone : '暂无信息'
                }}
              </div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-fill">
              <div class="base-info-label">推荐人评价:</div>
              <div class="base-info-value">
                {{
                  detail?.lodging.recommenderComment
                    ? detail?.lodging.recommenderComment
                    : '暂无推荐人评价'
                }}
              </div>
            </div>
          </div>
          <div class="flex-space-between line-margin">
            <div class="info-fill">
              <div class="base-info-label">特殊请求:</div>
              <div class="base-info-value">
                {{ detail?.lodging.specialRequest ? detail?.lodging.specialRequest : '暂无信息' }}
              </div>
            </div>
          </div>

          <div class="info-fill">
            <div class="base-info-label">来寺因缘:</div>
            <div class="base-info-value">
              {{ detail?.lodging.causeOfVisit ? detail?.lodging.causeOfVisit : '暂无信息' }}
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ApplicationDetailVO } from './types' // 假设接口定义在同级 types.ts
import { getApplicationById } from '@/api/application'
import { regionData } from 'element-china-area-data'

import type { TabsPaneContext } from 'element-plus'
import { getGenderText } from '@/utils/index'
import { preceptsOptions, applicationTypeOptions, departmentOptions } from '@/utils/constants'

const activeName = ref('baseInfo')
const detail = ref<ApplicationDetailVO | null>(null)
const loading = ref(false)
const visible = ref(false)

const props = defineProps<{
  modelValue: boolean
  applicationId: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const getApplicationItem = async (applicationId: number) => {
  loading.value = true
  try {
    const data = await getApplicationById(applicationId)
    detail.value = data
    loading.value = false
  } catch (error) {
    console.log(error)
    loading.value = false
  }
}

watch(
  () => [props.modelValue, props.applicationId] as const,
  async ([modelValue, newId]) => {
    visible.value = modelValue
    if (modelValue) {
      await getApplicationItem(newId)
    }
  },
  { immediate: true }
)
const handleClose = () => {
  visible.value = false
  activeName.value = 'baseInfo'
  emit('update:modelValue', false)
  emit('close')
}

const provinceCity = computed(() => {
  const codes = detail.value?.basic?.provinceCity
  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return '暂无信息'
  }

  // 递归查找地区名称
  const findAreaName = (data: any[], code: string): string => {
    for (const item of data) {
      if (item.value === code) {
        return item.label
      }
      if (item.children) {
        const found = findAreaName(item.children, code)
        if (found) return found
      }
    }
    return ''
  }

  const names: string[] = []
  let currentData = regionData

  for (const code of codes) {
    const name = findAreaName(currentData, code)
    if (name) {
      names.push(name)
      const currentItem = currentData.find((item) => item.value === code)
      if (currentItem?.children) {
        currentData = currentItem.children
      }
    }
  }

  const cityName = names.length > 0 ? names.join(' ') : '暂无信息'

  return cityName
})
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
  max-height: 70px;
  overflow: auto;
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

// 新增头部信息样式
.header-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  &-avatar {
    margin-right: 20px;
    width: 100px;
    height: 100px;
    border-radius: 12px;
  }
}

.avatar-container {
  flex-shrink: 0;
}

.basic-info {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100px;
  width: 100%;
}

.info-row {
  display: flex;
}

.info-item {
  display: flex;
  align-items: center;
  min-width: 0;

  .label {
    font-size: 14px;
    color: #666;
    margin-right: 8px;
    white-space: nowrap;
  }
  &-more {
    width: 90px;
  }

  &-less {
    width: 110px;
  }

  .value {
    font-size: 16px;
    font-weight: 600;
    color: #222;
  }
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
