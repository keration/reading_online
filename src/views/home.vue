<template>
  <NavBar />
  <div class="main-container">
    <!-- 搜索与筛选 -->
    <el-row :gutter="0">
      <!-- 左侧分类侧边栏 -->
      <el-col :span="4">
        <div style="width: 100%;box-sizing: border-box;">
          <div class="category-sidebar">
            <div class="sidebar-header">
              作品分类
            </div>
            <el-menu class="category-menu">
              <el-menu-item v-for="category in categories" :key="category.id" class="category-item":index="`/category/${category.id}`"
                @click="handleCategoryClick(category.id)">
                <span class="category-name">{{ category.name }}</span>
              </el-menu-item>
            </el-menu>
          </div>
        </div>
      </el-col>

      <!-- 右侧主内容 -->
      <el-col :span="20">
        <!-- <div class="banner-card">
          <img src="@/assets/app.png" alt="新用户下载APP广告" class="banner-image"  style="height: 100px;">
        </div> -->

        <div class="block text-center" m="t-4">
          <el-carousel trigger="click" height="150px" :autoplay="true" :interval="3000">
            <el-carousel-item v-for="item in photoArray" :key="item.id">
              <img :src="item.url" class="full-image" loading="lazy">
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 小说推荐区块 -->
        <el-card class="section-card">
          <div class="section-header">
            <div class="title-wrapper">
              <span class="decor-line"></span>
              <h3 class="section-title">强力推荐</h3>
            </div>
            <!-- 方法 -->
            <el-link 
            type="primary" 
            underline="never"
            @click="router.push({ name: 'RecommendedList' })">更多 ></el-link>
          </div>
          <el-row :gutter="20" v-loading="novelStore.loading">
            <el-col v-for="novel in novelStore.featuredNovels" :key="novel.id" :span="6" class="card-col">
              <el-card class="novel-card" :body-style="{ padding: '0px' }">
                <div class="image-wrapper">
                  <img loading="lazy" @load="handleImageLoad" :src="novel.coverImage" class="cover-image"
                    @click="goDetail(novel.id)" :alt="novel.title">
                </div>
                <div class="card-content">
                  <!-- 书名 -->
                  <h4 class="title" @click="goDetail(novel.id)">{{ novel.title }}</h4>
                  <!-- 作者 -->
                  <p class="author">{{ novel.author.name }}</p>
                  <!-- 标签 -->
                  <el-tag v-for="tag in novel.tags" :key="tag" @click="searchByTag(tag)">{{ tag }}</el-tag>
                  <!-- 介绍 -->
                  <p class="description"> {{ novel.description.length > 33 ? novel.description.substring(0, 33) + '...'
                    : novel.description }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>

        <!-- 新书推荐 -->
        <el-card class="section-card">
          <div class="section-header">
            <div class="title-wrapper">
              <span class="decor-line"></span>
              <h3 class="section-title">新书抢鲜</h3>
            </div>
            <el-link type="primary" underline="never" @click="router.push({ name: 'NewBooksList' })">更多 ></el-link>
          </div>
          <el-row :gutter="20">
            <el-col v-for="novel in novelStore.newNovels" :key="novel.id" :span="6">
              <div class="new-novel">
                <div class="cover-wrapper">
                  <img :src="novel.coverImage" @click="goDetail(novel.id)" class="small-cover">
                  <div class="new-tag">NEW</div>
                </div>
                <div class="info-wrapper">
                  <h4 class="title">{{ novel.title }}</h4>
                  <div class="meta-info">
                    <span class="author">{{ novel.author.name }}</span>
                  </div>
                  <p class="desc">{{ novel.description.length > 30 ? novel.description.substring(0, 30) + '...' :
                    novel.description }}</p>
                  <div class="tag-group">
                    <el-tag v-for="tag in novel.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 资讯板块 -->
        <!-- <el-card class="section-card">
          <div class="section-header">
            <div class="title-wrapper">
              <span class="decor-line"></span>
              <h3 class="section-title">最新资讯</h3>
            </div>
            <el-link type="primary" underline="never">更多 ></el-link>
          </div>
          <div class="news-list">
            <div v-for="news in newsList" :key="news.id" class="news-item">
              <el-tag size="small" effect="dark" :type="news.tagType" class="news-tag">{{ news.tag }}</el-tag>
              <span class="news-title">{{ news.title }}</span>
              <span class="news-time">{{ news.time }}</span>
            </div>
          </div>
        </el-card> -->
      </el-col>
    </el-row>

    <!-- 分页 -->
    <!-- <div class="pagination-wrapper">
      <el-pagination background v-model:current-page="pagination.current" :page-size="pagination.size"
        :total="pagination.total" layout="total, prev, pager, next, jumper" @current-change="handlePageChange" />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '@/components/common/NavBar.vue'
import { useNovelStore } from '@/stores/novelStore'
import router from '@/router'
import { navigateToCategory } from '@/utils/navigation'
//热门书籍方法
const novelStore = useNovelStore()

const images = import.meta.glob('/src/assets/carousel/**/*.{jpg,png}', {
  eager: true,
  as: 'url'
}) 

const photoArray = ref(
  Object.entries(images).map(([absPath, url], index) => {
    const relPath = absPath.replace('/src/assets/carousel/', '')
    return {
      id: index + 1,
      folder: relPath?.split('/')[0] ?? 'root',
      filename: relPath?.split('/').pop()?.replace(/\.[^/.]+$/, ""),
      url: url
    }
  })
)

// 路由跳转示例
const goDetail = (id: any) => {
  router.push({
    name: 'NovelDetail', // 使用命名路由而非路径
    params: { id: id }   // 参数名需与路由占位符一致
  });
};


const handleImageLoad = (e: Event) => {
  const target = e.target as HTMLImageElement; // 关键：断言为 HTMLImageElement
  target.classList.add('loaded');
}
const handleCategoryClick = (id: number) => {
  navigateToCategory(id, { page: 1 })
}

const categories = ref([
  { id: 1, name: '玄幻' },
  { id: 2, name: '武侠' },
  { id: 3, name: '仙侠' },
  { id: 4, name: '都市' },
  { id: 5, name: '奇幻' },
  { id: 6, name: '历史' },
  { id: 7, name: '游戏' },
])




onMounted(() => {
  novelStore.fetchFeaturedNovels();
  novelStore.getNewNovels();
})



const searchByTag = (tag: any) => {
  tag
}


//
const newsList = ref([
  { id: 1, tag: '资讯', title: '酷聊精灵：神秘风暴来袭', time: '3小时前' },
  { id: 2, tag: '新书', title: '青子新书《魔幻纪元》震撼发布', time: '5小时前' },
  { id: 3, tag: '资讯', title: '酷聊精灵：神秘风暴来袭', time: '3小时前' },
  { id: 4, tag: '新书', title: '青子新书《魔幻纪元》震撼发布', time: '5小时前' },
  { id: 5, tag: '资讯', title: '酷聊精灵：神秘风暴来袭', time: '3小时前' },
  { id: 6, tag: '新书', title: '青子新书《魔幻纪元》震撼发布', time: '5小时前' },
])



// 响应式变量
const pagination = ref({
  current: 1,
  size: 12,
  total: 0
})

const handlePageChange = (page: number) => {
  pagination.value.current = page
  loadNovels()
}
</script>

<style lang="scss" scoped>
:deep(.el-carousel__container) {
  height: 150px !important;
}

.full-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  /* 添加缩放动画 */
}

/* 悬停时微调效果 */
.el-carousel-item:hover .full-image {
  transform: scale(1.02);
}

.main-container {
  width: 100vw;
  overflow-x: hidden;
  min-height: 100vh;
  box-sizing: border-box;



  :deep(.el-row) {
    margin-left: 0 !important;
    margin-right: 0 !important;
    --el-row-gutter: 0; // 消除gutter影响

    >.el-col {

      // 左侧列
      &:first-child {
        padding-left: 0 !important;
        margin-left: 0 !important;

        .category-sidebar {
          margin-left: 0;
          width: 100%;

          :deep(.el-menu) {
            border-right: 0;
            margin: 0;
            padding: 0;
          }
        }
      }

      // 右侧列
      &:last-child {
        padding-right: 0 !important;
      }
    }
  }
}

.category-menu {
  :deep(.el-menu-item) {
    padding: 0 12px !important;
    margin: 0;
    min-width: auto;

    .category-name {
      margin-right: 4px;
    }
  }
}

// 统一侧边栏样式
.category-sidebar {
  background: #fff;
  border-radius: 4px;

  .sidebar-header {
    padding: 16px;
    font-size: 16px;
    color: #303133;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: center;

    .el-icon-menu {
      margin-right: 8px;
      color: #409EFF;
    }
  }
}

// 分类菜单项
.category-menu {
  border-right: 0;

  .category-item {
    height: 40px;
    line-height: 40px;
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    transition: all 0.3s;

    &:hover {
      background: #f5f7fa;

      .category-name {
        color: #409EFF;
      }
    }

    .book-count {
      color: #909399;
      font-size: 12px;
    }
  }
}

// 统一区块卡片样式
.section-card {
  margin-top: 20px;
  border-radius: 8px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .title-wrapper {
      display: flex;
      align-items: center;

      .decor-line {
        width: 4px;
        height: 16px;
        background: #409EFF;
        margin-right: 8px;
        border-radius: 2px;
      }

      .section-title {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }
    }
  }
}

// 推荐卡片样式
.novel-card {
  transition: transform 0.3s;
  border-radius: 6px;
  height: 100%;
  /* 关键属性：让卡片继承父级高度 */
  display: flex;
  flex-direction: column;
  width: 300px;
  /* 根据图片宽度设置 */
  margin: 0 auto;
  /* 水平居中 */


  .el-card__body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    height: 400px;
    /* 直接匹配图片尺寸 300×400 */
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8f9fa;
    /* 加载时的背景色 */
    border-radius: 4px;
    overflow: hidden;
    aspect-ratio: 3/4;
    /* 强制保持 300×400 的比例 */


    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: scale-down;
      /* 关键属性：智能缩放 */
      object-position: center;
      transition: transform 0.3s ease;

      /* 可选缩放动画 */
      transition: transform 0.3s ease;
    }

    .hot-badge {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
  }

  .card-content {
    padding: 12px;

    .title {
      margin: 0 0 8px;
      font-size: 18px;
      color: #303133;
      text-align: center;
    }

    .author {
      margin: 0 0 8px;
      color: #909399;
      font-size: 12px;
      text-align: center;
    }

    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .read-btn {
        padding: 6px 12px;
      }
    }
  }
}

// 新书区块样式
.new-novel {
  display: flex;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    background: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }

  .cover-wrapper {
    position: relative;
    flex-shrink: 0;
    width: 80px;
    height: 100px;
    margin-right: 12px;

    .small-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
    }

    .new-tag {
      position: absolute;
      top: 0;
      left: 0;
      background: #f56c6c;
      color: #fff;
      padding: 2px 6px;
      font-size: 12px;
      border-radius: 4px 0 4px 0;
    }
  }

  .info-wrapper {
    flex: 1;

    .title {
      margin: 0 0 6px;
      font-size: 14px;
      color: #303133;
    }

    .meta-info {
      display: flex;
      align-items: center;
      margin-bottom: 6px;

      .author {
        color: #909399;
        font-size: 12px;
        margin-right: 8px;
      }
    }

    .desc {
      margin: 0;
      color: #606266;
      font-size: 12px;
    }

    .tag-group {
      margin-top: 8px;

      .el-tag {
        margin-right: 4px;
      }
    }
  }
}

// 资讯列表样式
.news-list {
  .news-item {
    padding: 12px 0;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: 0;
    }

    .news-tag {
      flex-shrink: 0;
      margin-right: 8px;
    }

    .news-title {
      flex: 1;
      color: #606266;
      cursor: pointer;

      &:hover {
        color: #409EFF;
      }
    }

    .news-time {
      flex-shrink: 0;
      color: #909399;
      font-size: 12px;
      margin-left: 16px;
    }
  }
}

// 分页样式
.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.banner {
  margin-bottom: 20px;

  img {
    width: 100%;
    height: 120px;
    border-radius: 4px;
  }
}

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>