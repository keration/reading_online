<template>
  <NavBar />
  <div class="main-container">
    <el-card class="section-card">
      <div class="section-header">
        <div class="title-wrapper">
          <span class="decor-line"></span>
          <h3 class="section-title">{{ pageTitle }}</h3>
        </div>
        <!-- <el-select v-model="sortField" placeholder="排序方式" @change="loadData" class="sort-select">
          <el-option label="最新" value="createTime" />
          <el-option label="热门" value="views" />
          <el-option label="评分" value="rating" />
        </el-select> -->
      </div>

      <!-- 列表展示 -->
      <div class="list-container">
        <div v-for="(novel, index) in novelList" :key="novel.id" class="list-item">
          <div class="rank-tag">TOP{{ index + 1 }}</div>
          <img :src="novel.coverImage" class="list-cover" @click="goDetail(novel.id)">
          <div class="list-info">
            <h4 class="title" @click="goDetail(novel.id)">{{ novel.title }}</h4>
            <div class="meta-group">
              <!-- <el-tag type="info" size="small">{{ novel.category }}</el-tag> -->
              <span class="author">{{ novel.author.name }}</span>
              <!-- <el-rate v-model="novel.rating" disabled :colors="['#99A9BF', '#F7BA2A', '#FF9900']" /> -->
            </div>
            <p class="description">{{ novel.description }}</p>
            <!-- <div class="stats-group">
              <span class="stat-item">
                <el-icon>
                  <View />
                </el-icon>
                {{ novel.views| formatNumber }}
              </span>
              <span class="stat-item">
                <el-icon>
                  <ChatDotRound />
                </el-icon>
                {{ novel.comments | formatNumber }}
              </span>
              <span class="stat-item">
                <el-icon>
                  <Star />
                </el-icon>
                {{ novel.collections | formatNumber }}
              </span>
            </div> -->
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
  background
  layout="total, prev, pager, next"
  :total="pagination.total"
  :page-size="pagination.size"
  v-model:current-page="pagination.current"
  @update:current-page="handleCurrentChange"
  @update:page-size="handleSizeChange"
/>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { View, Star, ChatDotRound } from '@element-plus/icons-vue'
import { useNovelStore } from '@/stores/novelStore'
import { getAssetPath } from '@/utils/assetHelper'
import NavBar from '@/components/common/NavBar.vue'
import router from '@/router'


const novelList = computed(() => {
  return props.listType === 'recommended'
    ? novelStore.featuredNovels
    : novelStore.newNovels
})

const route = useRoute()
const novelStore = useNovelStore()

// 根据路由类型加载数据
const props = defineProps({
  listType: {
    type: String,
    default: 'recommended'
  }
})
const goDetail = (id: any) => {
  router.push({
    name: 'NovelDetail', // 使用命名路由而非路径
    params: { id: id }   // 参数名需与路由占位符一致
  });
};

const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
const pageTitle = computed(() =>
  props.listType === 'recommended' ? '全部推荐书籍' : '最新上架书籍'
)

// 分页参数
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

// 排序字段
const sortField = ref('createTime')
const handleSizeChange = (size: number) => {
  pagination.value.size = size
  loadData()
}
const handleCurrentChange = (page: number) => {
  pagination.value.current = page
  loadData()
}
// 加载数据方法
const loadData = async () => {
  const params = {
    type: props.listType,
    page: pagination.value.current,
    size: pagination.value.size,
    sort: sortField.value
  }

  await novelStore.fetchListData(params)
  pagination.value.total = novelStore.listTotal
}

// 监听路由变化
watchEffect(() => {
  if (route.name) loadData()
})

// 分页处理
const handlePageChange = (page: number) => {
  pagination.value.current = page
  loadData()
}
</script>

<style lang="scss" scoped>
.list-container {
  margin-top: 20px;

  .list-item {
    display: flex;
    align-items: center;
    padding: 20px;
    margin-bottom: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s;

    &:hover {
      transition: all 0.3s ease-in-out;
    }

    .rank-tag {
      width: 60px;
      text-align: center;
      font-weight: bold;
      color: #f56c6c;
      font-size: 18px;
    }

    .list-cover {
      width: 100px;
      height: 133px;
      border-radius: 4px;
      margin-right: 20px;
      cursor: pointer;
      object-fit: cover;
    }

    .list-info {
      flex: 1;

      .title {
        font-size: 18px;
        margin: 0 0 8px;
        color: #303133;
        cursor: pointer;

        &:hover {
          color: #409EFF;
        }
      }

      .meta-group {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .author {
          color: #909399;
          font-size: 14px;
        }
      }

      .description {
        color: #606266;
        line-height: 1.6;
        margin: 0 0 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .stats-group {
        display: flex;
        gap: 20px;

        .stat-item {
          display: flex;
          align-items: center;
          color: #909399;
          font-size: 14px;

          .el-icon {
            margin-right: 6px;
            font-size: 16px;
          }
        }
      }
    }
  }
}

.sort-select {
  width: 120px;
  margin-left: 20px;
}
</style>