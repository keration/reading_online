<!-- 分页组件（对接PageRequest） -->
<template>
    <el-pagination
      v-model:current-page="current"
      :page-size="size"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 50, 100]"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </template>
  
  <script setup lang="ts">
  // 二次封装参考[6,8](@ref)
  defineProps({
    total: { type: Number, required: true },
    current: { type: Number, default: 1 },
    size: { type: Number, default: 10 }
  })
  
  const emit = defineEmits(['change'])
  
  const handleSizeChange = (val: number) => {
    emit('change', { page: 1, size: val })
  }
  
  const handlePageChange = (val: number) => {
    emit('change', { page: val })
  }
  </script>