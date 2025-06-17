<template>
    <div class="book-preview">
      <!-- 封面大图 -->
      <el-image :src="book.coverImage" class="preview-cover" />
      
      <!-- 书籍元信息 -->
      <div class="book-meta">
        <h2>{{ book.title }}</h2>
        <p class="author">{{ book.author }}</p>
        <el-rate v-model="book.rating" disabled />
      </div>
  
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="$emit('read', book)">继续阅读</el-button>
        <el-button type="primary">加入书架</el-button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { getAssetPath } from '@/utils/assetHelper'
  defineProps({
    book: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['read'])
  </script>
  
  <style scoped>
  /* 独立的样式作用域 */
  .book-preview {
    padding: 20px;
  }
  .preview-cover {
    width: 200px;
    height: 300px;
  }
  </style>