<!-- SearchResults.vue -->
<template>
  <div class="search-container">
    <!-- 搜索头部 -->
    <el-page-header @back="router.go(-1)" title="返回">
      <template #content>
        <span class="search-keyword">搜索关键词：{{ searchQuery }}</span>
      </template>
    </el-page-header>

    <!-- 卡片布局 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col 
        v-for="novel in novelList" 
        :key="novel.id" 
        :xs="24" :sm="12" :md="8" :lg="6"
      >
        <el-card class="novel-card" shadow="hover">
          <!-- 封面图片 -->
          <el-image 
            :src="novel.coverImage" 
            fit="cover" 
            class="novel-cover"
            :preview-src-list="[novel.cover]"
          >
            <template #error>
              <div class="cover-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>

          <!-- 小说信息 -->
          <div class="novel-info">
            <h3 class="title">{{ novel.title }}</h3>
            <!-- <div class="meta">
              <span class="author">
                <el-icon><User /></el-icon>
                {{ novel.author }}
              </span>
              <el-rate 
                v-model="novel.rating" 
                disabled 
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']" 
              />
            </div> -->
            
            <!-- 简介折叠面板 -->
            <el-collapse>
              <el-collapse-item title="作品简介">
                <p class="description">{{ novel.description }}</p>
              </el-collapse-item>
            </el-collapse>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="startReading(novel)">
              <el-icon><Reading /></el-icon>
              立即阅读
            </el-button>
            <el-button @click="addToShelf(novel)">
              <el-icon><Collection /></el-icon>
              加入书架
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="pagination.page"
      :page-size="pagination.size"
      :total="pagination.total"
      layout="total, prev, pager, next, jumper"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useSearchStore } from '@/stores/search'
import instance from '@/utils/request'
import router from '@/router'
import { storeToRefs } from 'pinia'

const searchStore = useSearchStore()
const { searchResults } = storeToRefs(searchStore)
const route = useRoute()

const searchQuery = computed(() => route.query.q as string)
let novelList = computed(() => searchResults.value)


// 分页配置
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 小说数据
const loading = ref(false)

// 获取数据方法
const fetchResults = async () => {
  try {
    loading.value = true
    const res = await instance.get('/api/novel/search', {
      params: {
        keyword: searchQuery.value,
        page: pagination.page,
        size: pagination.size
      }
    })
    novelList = res.data
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

// 分页切换
const handlePageChange = (newPage: number) => {
  pagination.page = newPage
  fetchResults()
}

onMounted(() => {
  if (!searchQuery.value) {
    ElMessage.warning('请输入搜索关键词')
    return router.push('/')
  }
  fetchResults()
})
</script>
<style scoped lang="scss">
.novel-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  .cover-error {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 250px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  &:hover {
    transform: translateY(-5px);
  }

  .novel-cover {
    height: 250px;
    border-radius: 4px;
  }

  .novel-info {
    padding: 15px;

    .title {
      font-size: 1.2em;
      margin-bottom: 8px;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .author {
        color: #666;
        font-size: 0.9em;
      }
    }

    .description {
      color: #666;
      line-height: 1.6;
  
    }
  }

  .action-buttons {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
  }
}
.search-container {
  padding: 20px;
}

.el-row {
  margin-bottom: 20px;
}
.title {
  color: #333;
}

.description {
  font-size: 0.9em;
  color: #555;
}
</style>