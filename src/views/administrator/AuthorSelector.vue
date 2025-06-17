
<template>
  <el-select
    v-model="selectedId"
    filterable
    remote
    :remote-method="remoteMethod"
    :loading="loading"
    placeholder="搜索并选择作者"
  >
    <el-option
      v-for="author in authors"
      :key="author.id"
      :label="author.name"
      :value="author.id"
    />
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Author } from '@/types/novel'

const props = defineProps<{
  modelValue: number | null
  remoteMethod: (query: string) => Promise<void>
}>()

const emit = defineEmits(['update:modelValue'])

const selectedId = ref<number | null>(props.modelValue)
const authors = ref<Author[]>([])
const loading = ref(false)

watch(selectedId, (val) => {
  emit('update:modelValue', val)
})

const remoteMethod = async (query: string) => {
  try {
    loading.value = true
    await props.remoteMethod(query)
  } finally {
    loading.value = false
  }
}
</script>