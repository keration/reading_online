<!-- 搜索框 -->
<template>
  <el-input 
  v-model="keywordModel" 
  placeholder="搜索书名/作者" 
  clearable 
  :loading="loading"
  @keyup.enter="handleSearch"
  @clear="handleClear" 
  aria-label="搜索">
    <template #prefix>
      <el-icon :aria-hidden="true">
        <Search />
      </el-icon>
    </template>

    <template #append>
      <el-button @click="handleSearch"
        :loading="loading">
        <el-icon><Search /></el-icon>
      </el-button>
    </template>
  </el-input>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'
import { computed } from 'vue'
import { ElIcon } from 'element-plus';

const props = defineProps({
  modelValue: String,
  loading: Boolean,
  placeholder: {
    type: String,
    default: '搜索书名/作者'
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const keywordModel = computed({
  get: () => props.modelValue || '',
  set: (val) => emit('update:modelValue', val)
})

const handleSearch = debounce(() => {
  emit('search', keywordModel.value.trim())
}, 300)

const handleClear = () => {
  keywordModel.value = ''
  emit('search', '')
}
</script>