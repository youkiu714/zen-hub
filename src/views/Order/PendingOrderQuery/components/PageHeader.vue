<template>
  <div class="page-header">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.page-header {
  margin-bottom: 24px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
  }

  p {
    color: #6b7280;
    font-size: 14px;
  }
}
</style>