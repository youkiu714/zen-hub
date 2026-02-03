<template>
  <div class="application-entry">
    <ApplicationBreadcrumb :items="breadcrumbItems" :back-to="backTo" />
    <div class="entry-shell">
      <div class="type-panel">
        <EntryMethodPanel @select="handleEntrySelect" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import EntryMethodPanel from './components/EntryMethodPanel.vue'
import ApplicationBreadcrumb from './components/ApplicationBreadcrumb.vue'

type ApplicationTypeKey = 'short_stay' | 'express'
type EntryMethodKey = 'manual' | 'batch' | 'existing'

const route = useRoute()
const router = useRouter()

const backTo = '/contact-application/pending-application'
const breadcrumbItems = [
  { label: '挂单申请', to: backTo },
  { label: '挂单方式' }
]

const selectedType = computed(() => {
  const type = route.query.type
  if (type === 'short_stay' || type === 'express') {
    return type
  }
  return null
})

const ensureType = () => {
  if (!selectedType.value) {
    ElMessage.warning('请先选择挂单类型')
    router.push('/contact-application/pending-application')
  }
}

const handleEntrySelect = (method: EntryMethodKey) => {
  if (!selectedType.value) {
    ensureType()
    return
  }
  if (method === 'batch') {
    router.push({
      path: '/contact-application/pending-application/batch-import',
      query: { type: selectedType.value }
    })
    return
  }
  router.push({
    path: '/contact-application/pending-application/form',
    query: { type: selectedType.value, method }
  })
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
