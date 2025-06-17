<!-- 小说详情页面 -->
<template>
  <div class="novel-detail-container">
    <!-- 加载状态 -->
    <el-skeleton :loading="loading" animated>
      <template #template>
        <!-- 卡片标题 -->
        <el-skeleton-item />
        <!-- 卡片内容 -->
        <el-skeleton-item />
        <!-- 卡片底部 -->

        <el-skeleton-item />
      </template>

      <!-- 内容展示 -->
      <template #default>
        <div v-if="!error">
          <!-- 小说详情卡片 -->
          <el-card class="novel-card">
            <div class="card-content">
              <img loading="lazy" :src="currentNovel?.coverImage" class="cover-image">
              <h1 class="text-2xl font-bold mb-2">{{ currentNovel?.title }}</h1>
              <div class="text-gray-600 mb-2">
                <div v-if="currentNovel?.author">
                  <span class="mr-4">作者：{{ currentNovel?.author.name }}</span>
                </div>
                <span>分类：{{ currentNovel?.category }}</span>
              </div>
              <div class="text-gray-500">
                总字数：
                <!-- {{ formattedWordCount }} -->
              </div>
            </div>
          </el-card>
        </div>
        <!-- 简介卡片 -->
        <el-card>
          <template #header>
            <div class="font-bold">作品简介</div>
          </template>
          <div>
            {{ currentNovel?.description }}
          </div>
        </el-card>

        <!-- 章节列表 -->
        <el-card>
          <template #header>
            <div>
              <span>目录</span>
              <el-button v-if="!isInBookshelf" type="primary" @click="addToBookshelf">加入书架</el-button>
              <el-button v-else disabled>已在书架中</el-button>
            </div>
          </template>


          <el-row :gutter="16" justify="center">
            <el-col v-for="(chapter, index) in paginatedChapters" :key="chapter.id" :xs="24" :sm="12" :md="12"
              class="chapter-col">
              <div class="chapter-card">
                <div class="chapter-header">
                  <span class="chapter-title" @click="handleRead(chapter.id)">
                    {{ chapter.chapterTitle }}
                  </span>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 分页组件 -->
          <div class="pagination-container mt-4 flex justify-center">
            <el-pagination layout="prev, pager, next" :total="chapters.length" :page-size="pageSize"
              v-model:current-page="currentPage" hide-on-single-page />
          </div>

        </el-card>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { isNavigationFailure, NavigationFailureType, useRoute, useRouter } from 'vue-router'
import { useNovelStore } from '@/stores/novelStore'
import { getAssetPath } from '@/utils/assetHelper'
import { ElMessage } from 'element-plus';
import { useBookshelfStore } from '@/stores/bookshelf'
import { useUserStore } from '@/stores/UserStore'
import { storeToRefs } from 'pinia';

const userStore = useUserStore()
const route = useRoute()
const novelStore = useNovelStore()
const bookshelfStore = useBookshelfStore()
const { userInfo } = storeToRefs(userStore)
const userId = computed(() => userInfo.value.id)
const activeTab = ref('chapters')
const router = useRouter();
const loadingChapterId = ref<number | null>(null);
const loading = computed(() => novelStore.loading)
const novel = computed<Novel>(() => novelStore.currentNovel || {});
const currentNovel = computed(() => novelStore.currentNovel || {});
const currentPage = ref(1)
const pageSize = 20 // 每页显示的章节数量

// 分页计算当前页的章节
const paginatedChapters = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return chapters.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => Math.ceil(chapters.value.length / pageSize))
const addToBookshelf = () => {
  const novelId = Number(route.params.id)

  // 调用添加到书架的 API
  bookshelfStore.addBookToShelf(userId.value, novelId).then(() => {
    // 添加成功后刷新书架数据，确保 isInBookshelf 更新
    return bookshelfStore.fetchBooks(userId.value)
  }).catch(err => {
    console.error('添加或刷新书架失败:', err)
  })
}


interface Novel {
  title?: string;
  author?: { name: string };
  category?: string;
  wordCount?: number;
  description?: string;
}
const isInBookshelf = computed(() => {
  const novelId = route.params.id as string
  return bookshelfStore.bookList.some(book => book.id === novelId)
})

const chapters = computed(() => {
  if (!Array.isArray(novelStore.chapters)) {
    console.error('章节数据非数组:', novelStore.chapters)
    return [] // 返回安全值
  }
  return novelStore.chapters
})

const error = ref<string | null>(null);
onMounted(async () => {
  try {
    const novelId = Number(route.params.id);
    if (!novelId) {
      error.value = '无效的小说ID';
      return;
    }
    await Promise.all([
      novelStore.getNovelById(novelId),
      novelStore.getChaptersByNovelId(novelId)
    ]);
  } catch (err) {
    error.value = '数据加载失败，请稍后重试';
    console.error('加载失败:', err);
  }
});

const handleRead = async (chapterId: number) => {
  try {
    loadingChapterId.value = chapterId;
    const novelId = Number(route.params.id);

    await router.push({
      name: 'novel-reader',
      params: {
        novelId,
        chapterId
      }
    });
  } catch (error) {
    if (!isNavigationFailure(error, NavigationFailureType.duplicated)) {
      console.error('导航失败:', error);
      ElMessage.error('章节加载失败');
    }
  } finally {
    loadingChapterId.value = null;
  }
}
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.novel-detail-container {
  max-width: 1200px;
  margin: 20px auto;
  /* 增加垂直间距 */
  padding: 0 px;
  /* 响应式边距 */
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 水平居中 */
}

/* 卡片容器 */
.novel-card {
  width: 90%;
  max-width: 800px;
  margin: 20px auto !important;
  /* 覆盖Element默认样式 */
}

/* 内容居中 */
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cover-image {
  max-width: 300px;
}

:deep(.el-card) {
  --el-card-border-radius: 12px; /* 增大圆角 */
  --el-card-padding: 24px; /* 增加内边距 */
  box-shadow: 0 8px 24px -6px rgba(0,0,0,0.1); /* 增强阴影层次 */
}
:deep(.el-pagination) {
  --el-pagination-button-width: 36px;
  --el-pagination-button-height: 36px;
  margin: 24px 0;
}
:deep(.el-pager li) {
  transition: transform 0.2s;
}
:deep(.el-pager li:hover) {
  transform: scale(1.1);
}
.text-2xl {
  font-size: 2rem;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.text-gray-600 {
  color: #4a5568;
  letter-spacing: 0.025em;
}

.chapter-col {
  margin-bottom: 16px;
}

.chapter-card {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--el-color-primary);
    opacity: 0;
    transition: opacity 0.3s;
  }
  &:hover::before {
    opacity: 1;
  }
}

.chapter-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 章节卡片 */
.chapter-card {
  width: 100%;
  text-align: center;
  /* 文字居中 */
  padding: 15px;
}

/* 章节标题 */
.chapter-title {
  display: inline-block;
  max-width: 90%;
  margin: 0 auto;
  /* 水平居中 */
}

.chapter-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.chapter-index {
  color: #909399;
  font-size: 12px;
  margin-right: 8px;
}


.chapter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.update-time {
  font-size: 12px;
  color: #909399;
}
</style>