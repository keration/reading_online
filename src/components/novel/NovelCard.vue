<!-- 小说卡片（用于列表展示） -->
<template>
    <el-card class="novel-card" @mouseenter="hover = true">
        <el-image 
  :src="novel.cover"
  :preview-src-list="[novel.cover]"
  :initial-index="0"
  loading="lazy"
  class="cover-image"
>
  <template #error>
    <div class="image-error">
      <el-icon><Picture /></el-icon>
    </div>
  </template>
</el-image>
      
      <div class="p-4">
        <h3 class="title">{{ novel.title }}</h3>
        <div class="meta">
          <el-tag type="info">{{ novel.category }}</el-tag>
          <span class="author">{{ novel.author }}</span>
        </div>
        <el-progress 
          :percentage="novel.progress" 
          :stroke-width="8"
          class="mt-2"
        />
      </div>
    </el-card>
  </template>

<script setup lang="ts">
import { ref } from 'vue'

interface Novel {
  id: string
  title: string
  cover: string
  category: string
  author: string
  progress: number
}

const hover = ref(false)
defineProps<{ novel: Novel }>()
</script>
  
  <style lang="scss">
  .novel-card {
    @apply transition-transform duration-300 hover:-translate-y-2;
    
    .cover-image {
      @apply h-48 w-full object-cover transition-transform duration-300;
      will-change: transform; // 启用硬件加速[7](@ref)
  backface-visibility: hidden;
    }
    
    &:hover .cover-image {
      transform: scale(1.05);
    }


    @apply transition-all duration-300 hover:-translate-y-2;
  transform-style: preserve-3d;
  perspective: 1000px;

  &:hover {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2); // 增强立体阴影[3](@ref)
    z-index: 10; // 提升层级防止遮挡[2](@ref)
  }

  .skeleton-cover {
  @apply h-48 w-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100;
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
  }
  </style>