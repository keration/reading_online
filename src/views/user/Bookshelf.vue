<template>
  <div class="bookshelf-container">
    <!-- 新增搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchKey" placeholder="搜索我的书架" clearable @clear="handleSearch" @keyup.enter="handleSearch">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <el-dropdown @command="handleSortChange" trigger="click">
        <el-button type="primary">
          {{ sortMethods[sortMethod].label }}
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="(method, key) in sortMethods" :key="key" :command="key"
              :class="{ 'active-sort': sortMethod === key }">
              {{ method.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 书籍列表 -->
    <el-row :gutter="20" class="book-list">
      <template v-if="loading">
        <el-col v-for="i in 4" :key="`skeleton-${i}`" :xs="24" :sm="12" :md="8" :lg="6">
          <el-skeleton class="book-card" animated>
            <template #template>
              <el-skeleton-item variant="image" style="height: 200px" />
              <div style="padding: 14px">
                <el-skeleton-item variant="h3" style="width: 50%" />
                <el-skeleton-item variant="text" style="width: 30%" />
                <div style="margin-top: 10px">
                  <el-skeleton-item variant="text" style="width: 80%" />
                  <el-skeleton-item variant="text" style="width: 60%" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </el-col>
      </template>

      <template v-else>
        <el-col v-for="book in filteredBooks" :key="book.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="book-card" shadow="hover" @click.native="previewBook(book)">
            <!-- 新增书籍角标 -->
            <div class="book-corner">
              <el-tag v-if="book.isNew" type="danger" size="small" effect="dark">
                新加入
              </el-tag>
              <el-tag v-if="book.lastRead" type="info" size="small">
                {{ formatLastRead(book.lastRead) }}
              </el-tag>
            </div>

            <!-- 书籍封面 -->
            <el-image :src="book.coverImage" fit="cover" class="book-cover" >
              <template #error>
                <div class="cover-error">
                  <el-icon>
                    <Notebook />
                  </el-icon>
                  <span>封面加载失败</span>
                </div>
              </template>
              <template #placeholder>
                <div class="cover-loading">
                  <el-icon class="loading-icon">
                    <Loading />
                  </el-icon>
                </div>
              </template>
            </el-image>

            <!-- 书籍信息 -->
            <div class="book-info">
              <h4 class="title">{{ book.title }}</h4>
              <p class="author">{{ book.author }}</p>

              <!-- 新增进度时间显示 -->
              <div class="progress-wrapper">
                <el-progress :percentage="book.progress" :color="customColors" :show-text="false" :stroke-width="4" />
                <div class="progress-meta">
                  <span class="progress-text">{{ book.progress }}%</span>
                  <span class="read-time">
                    {{ book.readTime ? formatReadTime(book.readTime) : '未开始阅读' }}
                  </span>
                </div>
              </div>

              <!-- 新增书籍标签 -->
              <div class="book-tags">
                <el-tag v-for="tag in book.tags" :key="tag" type="info" size="mini" effect="plain">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <!-- 操作按钮 -->
            <div class="action-buttons">
              <el-button type="primary" @click.stop="openReader(book)" :icon="VideoPlay">
                继续阅读
              </el-button>
              <el-popconfirm title="确认移除此书籍？" confirm-button-text="确认" cancel-button-text="取消"
                @confirm="confirmDelete(Number(book.id))">
                <template #reference>
                  <el-button type="danger" :icon="Delete" @click.stop>
                    移除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </el-card>
        </el-col>
      </template>
    </el-row>

    <!-- 空状态提示 -->
    <el-empty v-if="!filteredBooks.length && !loading" description="书架空空如也，快去添加书籍吧～" :image-size="200">
      <el-button type="primary" @click="gotoBookStore">
        去选书
      </el-button>
    </el-empty>

    <!-- 书籍预览抽屉 -->
    <el-drawer v-model="previewVisible" title="书籍详情" direction="rtl" size="40%">
      <BookPreview v-if="currentBook" :book="currentBook" @read="openReader" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useBookshelfStore } from '@/stores/bookshelf'
import { useRouter } from 'vue-router'
import {
  Notebook, ArrowDown, Search, Delete, VideoPlay, Loading
} from '@element-plus/icons-vue'
import BookPreview from './BookPreview.vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()
const router = useRouter()
const bookshelfStore = useBookshelfStore()
const { fetchBooks, removeBook, updateProgress } = bookshelfStore
const { bookList } = storeToRefs(bookshelfStore)
const { userInfo } = storeToRefs(userStore)
const userId = computed(() => userInfo.value.id)
const loading = ref(true)
const searchKey = ref('')
const previewVisible = ref(false)
const currentBook = ref<BookItem | null>(null)
const sortMethod = ref<'time' | 'progress' | 'title'>('time')

// 排序配置
// 修改 sortMethods 类型定义（添加索引签名）
interface SortMethod {
  label: string;
  fn: (a: any, b: any) => number;
}

const sortMethods: { [key: string]: SortMethod } = {
  time: {
    label: '添加时间',
    fn: (a: { addTime: number }, b: { addTime: number }) => b.addTime - a.addTime
  },
  progress: {
    label: '阅读进度',
    fn: (a: { progress: number }, b: { progress: number }) => b.progress - a.progress
  },
  title: {
    label: '书名排序',
    fn: (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title)
  }
}

// 进度条渐变色
const customColors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7af3', percentage: 100 }
]

// 计算属性
const filteredBooks = computed(() => {
  return bookList.value
    .filter(book =>
      book.title.includes(searchKey.value) ||
      book.author.includes(searchKey.value) ||
      book.tags?.some(tag => tag.includes(searchKey.value))
    )
    .sort(sortMethods[sortMethod.value].fn)
})

// 生命周期
onMounted(async () => {
  try {
    await fetchBooks(userId.value)
    ElMessage.success('书架数据加载成功')
  } catch (error: any) {
    console.error('加载书架失败:', error) // 打印详细错误
    ElMessage.error(error.message || '数据加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
})

// 方法实现
const handleSortChange = (method: string) => {
  const validMethods = ['time', 'progress', 'title']
  if (validMethods.includes(method)) {
    sortMethod.value = method as 'time' | 'progress' | 'title'
  } else {
    console.warn(`Invalid sort method: ${method}`)
  }
}

// 定义书籍类型接口（可添加更多字段）
interface BookItem {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  isNew?: boolean;
  lastRead?: string | number | Date;
  progress: number;
  readTime?: number;
  tags?: string[];
  addTime: number;
  lastChapter?: string;
}

// 修改 previewBook 方法定义
const previewBook = (book: BookItem) => {
  currentBook.value = book;
  previewVisible.value = true;
}

const confirmDelete = async (bookId: number) => {
  try {
    await removeBook({ userId: userId.value, novelId:bookId }) // 修正参数为对象
    ElMessage.success('书籍移除成功')
  } catch (error) {
    ElMessage.error('移除失败，请稍后重试')
  }
}

// 修改 openReader 参数类型为 BookItem
const openReader = (book: BookItem) => {
  router.push({
    name: 'novel-reader', // 使用路由名称
    params: {
      novelId: book.id, // 动态路由参数
      chapterId: book.lastChapter ?? '1' // 默认值可选
    }
  })
}

const formatLastRead = (timestamp: string | number | Date) => {
  const date = new Date(timestamp)
  const now = new Date()

  // 确保 date 是有效日期
  if (isNaN(date.getTime())) {
    return '未知时间'
  }

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今日阅读'
  if (diffDays === 1) return '昨日阅读'
  return `${diffDays}天前`
}

const formatReadTime = (minutes: number) => {
  if (!minutes) return '未开始阅读'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}时${mins}分`
}

const gotoBookStore = () => {
  router.push('/bookstore')
}

const handleSearch = () => {
  // 可添加防抖处理
  console.log('执行搜索:', searchKey.value)
}
</script>

<style scoped lang="scss">
.bookshelf-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;

  .search-bar {
    margin-bottom: 30px;

    :deep(.el-input__inner) {
      height: 48px;
      border-radius: 24px;
      padding-left: 40px;
      font-size: 16px;
    }
  }

  .toolbar {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .book-list {
    min-height: 60vh;

    .book-card {
      margin-bottom: 20px;
      transition: transform 0.3s;
      position: relative;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .book-corner {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .book-cover {
        height: 200px;
        width: 100%;
        border-radius: 4px;
        overflow: hidden;

        .cover-error,
        .cover-loading {
          /* 替换 @include flex-center */
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          background: #f5f7fa;
          color: #909399;

          .loading-icon {
            font-size: 32px;
            /* 移除 @keyframes 动画 */
            transition: transform 0.3s;
          }
        }
      }

      .book-info {
        padding: 15px 0;

        .title {
          margin: 0;
          font-size: 16px;
          /* 替换 @include text-ellipsis */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .author {
          color: #666;
          font-size: 12px;
          margin: 5px 0;
        }

        .progress-wrapper {
          margin: 12px 0;

          .progress-meta {
            /* 替换 @include flex-between */
            display: flex;
            justify-content: space-between;
            margin-top: 6px;
            font-size: 12px;
            color: #999;
          }
        }

        .book-tags {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
      }

      .action-buttons {
        /* 替换 @include flex-between */
        display: flex;
        justify-content: space-between;
        margin-top: 15px;

        .el-button {
          flex: 1;

          +.el-button {
            margin-left: 10px;
          }
        }
      }
    }
  }
}
</style>