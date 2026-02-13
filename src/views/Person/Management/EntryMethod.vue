<template>
  <div class="application-entry">
    <PersonBreadcrumb :items="breadcrumbItems" :back-to="backTo" />
    <div class="entry-shell">
      <div class="type-panel">
        <EntryMethodPanel :allow-batch="selectedType !== 'express'" @select="handleEntrySelect" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import EntryMethodPanel from './components/EntryMethodPanel.vue'
import PersonBreadcrumb from './components/PersonBreadcrumb.vue'

type ApplicationTypeKey = 'short_stay' | 'express'
type EntryMethodKey = 'manual' | 'batch' | 'existing'

const route = useRoute()
const router = useRouter()

const backTo = '/person-management/management/method'
const breadcrumbItems = [
  { label: '人员录入', to: backTo },
  { label: '录入方式' }
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
    // router.push('/contact-application/pending-application')
  }
}

const handleEntrySelect = (method: EntryMethodKey) => {
  // if (!selectedType.value) {
  //   ensureType()
  //   return
  // }
  // if (selectedType.value === 'express' && method === 'batch') {
  //   ElMessage.warning('直通车暂不支持批量导入')
  //   return
  // }
  // if (selectedType.value === 'express' && method === 'existing') {
  //   router.push({
  //     path: '/contact-application/direct-application',
  //     query: { method }
  //   })
  //   return
  // }
  if (method === 'batch') {
    router.push({
      path: '/contact-application/pending-application/batch-import',
      query: { type: selectedType.value }
    })
    return
  }
  // if (method === 'manual' && selectedType.value === 'express') {
  //   router.push('/contact-application/direct-application')
  //   return
  // }
  router.push({
    path: '/person/enter/form'
  })
}

onMounted(() => {
  // ensureType()
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
