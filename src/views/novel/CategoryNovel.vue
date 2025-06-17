<!-- CategoryNovel.vue 父组件 -->
<template>
    <div class="category-container">
      <!-- 导航栏 -->
      <el-menu 
        mode="horizontal" 
        :default-active="currentCategoryId?.toString()"
        @select="handleCategoryChange"
        class="category-nav"
      >
        <el-menu-item 
          v-for="category in categories" 
          :key="category.id" 
          :index="category.id.toString()"
          class="nav-item"
        >
          {{ category.name }}
        </el-menu-item>
      </el-menu>
  
      <!-- 卡片展示区 -->
      <el-row :gutter="20" v-loading="novelStore.loading">
        <el-col 
          v-for="novel in categoryNovels" 
          :key="novel.id" 
          :xs="24" :sm="12" :md="8" :lg="6"
        >
          <el-card class="novel-card">
            <router-link :to="{ name: 'NovelDetail', params: { id: novel.id }}">
              <el-image 
                :src="novel.coverImage"
                fit="cover" 
                class="card-image"
                @error="handleImageError"
              >
                <template #error>
                  <div class="image-error">封面加载失败</div>
                </template>
              </el-image>
            </router-link>
            
            <div class="card-content">
              <h3 class="title">
                <router-link :to="{ name: 'NovelDetail', params: { id: novel.id }}">
                  {{ novel.title }}
                </router-link>
              </h3>
              
              <div class="meta-info">
                <span class="author">
                  <i class="el-icon-user"></i>
                  {{ categoryNovels.authorname }}
                </span>
                <el-tag 
                  v-for="tag in novel.tags" 
                  :key="tag" 
                  size="mini"
                  class="tag-item"
                >
                  {{ tag }}
                </el-tag>
              </div>
  
              <p class="description">
                {{ truncateDescription(novel.description) }}
              </p>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          background
          :current-page="pagination.current"
          :page-size="pagination.size"
          :total="pagination.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useNovelStore } from '@/stores/novelStore'
  import { getAssetPath } from '@/utils/assetHelper'
import { storeToRefs } from 'pinia'
  
  const route = useRoute()
  const router = useRouter()
  const novelStore = useNovelStore()
  const { categoryNovels, categoryTotal } = storeToRefs(novelStore)
  const loadNovels = async () => {
  await novelStore.fetchCategoryNovels(
    currentCategoryId.value,
  )
}
  
  // 分类数据
  const categories = ref([
    { id: 1, name: '玄幻' },
    { id: 2, name: '武侠' },
    { id: 3, name: '仙侠' },
    { id: 4, name: '都市' },
    { id: 5, name: '奇幻' },
    { id: 6, name: '历史' },
    { id: 7, name: '游戏' }
  ])
  
  // 当前分类计算属性
  const currentCategoryId = computed(() => 
    Number(route.params.typeId) || categories.value[0]?.id
  )
  
  // 分页控制
  const pagination = computed(() => ({
    current: Number(route.query.page) || 1,
    size: 12,
    total: novelStore.categoryTotal
  }))
  
  // 方法实现
  const handleCategoryChange = (categoryId: string) => {
    router.push({
      name: 'CategoryView',
      params: { typeId: categoryId },
      query: { page: 1 }
    })
  }
  
  const handlePageChange = (page: number) => {
    router.push({
      params: route.params,
      query: { ...route.query, page }
    })
  }
  
  const truncateDescription = (text: string) => {
    return text.length > 60 ? text.substring(0, 60) + '...' : text
  }
  
  const handleImageError = (e: Event) => {
    const img = e.target as HTMLImageElement
    img.src = getAssetPath('default-cover.jpg')
  }

  watch(
  () => [route.params.typeId, route.query.page],
  ([newTypeId, newPage]) => {
    router.replace({ 
      query: { 
        page: newPage || 1 
      } 
    })
    loadNovels()
  },
  { immediate: true }
)

// 初始化加载
onMounted(() => {
  if (!route.params.typeId) {
    router.replace({ 
      params: { 
        typeId: currentCategoryId.value.toString() 
      },
      query: { 
        page: pagination.value.current.toString() 
      }
    })
  }
})
  </script>
  
  <style scoped>
  .category-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .category-nav {
    margin-bottom: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }
  
  .nav-item {
    transition: all 0.3s;
    font-size: 16px;
  }
  
  .novel-card {
    margin-bottom: 20px;
    transition: transform 0.3s;
  }
  
  .novel-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
  
  .card-image {
    height: 200px;
    width: 100%;
    border-radius: 4px;
  }
  
  .image-error {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #909399;
  }
  
  .title {
    margin: 12px 0;
    font-size: 18px;
  }
  
  .meta-info {
    display: flex;
    align-items: center;
    margin: 10px 0;
  }
  
  .author {
    margin-right: 15px;
    color: #666;
  }
  
  .tag-item {
    margin: 0 5px;
  }
  
  .description {
    color: #666;
    line-height: 1.6;
    font-size: 14px;
  }
  
  .pagination-wrapper {
    margin-top: 30px;
    display: flex;
    justify-content: center;
  }
  </style>