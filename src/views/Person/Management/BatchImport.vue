<template>
  <div class="application-entry">
    <PersonBreadcrumb :items="breadcrumbItems" :back-to="methodRoute" />
    <div class="entry-shell">
      <div class="type-panel">
        <BatchImportPanel :application-type="applicationType" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BatchImportPanel from './components/BatchImportPanel.vue'
import PersonBreadcrumb from './components/PersonBreadcrumb.vue'
import { APPLICATION_TYPE } from '@/utils/constants'

const route = useRoute()
const router = useRouter()

const selectedType = computed(() => {
  const type = route.query.type
  if (type === 'short_stay' || type === 'express') {
    return type
  }
  return null
})

const methodRoute = computed(() => ({
  path: '/contact-application/pending-application/method',
  query: selectedType.value ? { type: selectedType.value } : undefined
}))

const breadcrumbItems = computed(() => [
  { label: '挂单申请', to: '/contact-application/pending-application' },
  { label: '挂单方式', to: methodRoute.value },
  { label: '批量导入' }
])

const applicationType = computed(() => {
  if (selectedType.value === 'short_stay') {
    return APPLICATION_TYPE.SHORT_STAY
  }
  if (selectedType.value === 'express') {
    return APPLICATION_TYPE.MONK_RELATIVE
  }
  return null
})

const ensureType = () => {
  if (!selectedType.value) {
    ElMessage.warning('请先选择挂单类型')
    router.push('/contact-application/pending-application')
  }
}

onMounted(() => {
  ensureType()
})
</script>

<style scoped>
.application-entry {
  padding: 24px;
}

.entry-shell {
  width: 100%;
}

.type-panel {
  background: #fff;
  border-radius: 20px;
  padding: 32px 36px;
  box-shadow: 0 12px 30px rgba(160, 115, 63, 0.12);
}
</style>
