<template>
  <div class="page-header">
    <h1>{{ title }}</h1>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  title?: string
}>()

</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 0;
}

.page-header h1 {
  font-size: 24px;
  color: #8b4513;
  margin: 0;
}
</style>
