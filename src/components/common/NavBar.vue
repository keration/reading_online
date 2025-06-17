<!-- 顶部导航栏 -->
<template>
  <el-header class="nav-bar">
    <!-- :class="{ 'fixed-nav': isFixed }"
  > -->
    <div class="nav-container">
      <!-- 合并左侧区域 -->
      <div class="left-group">
        <!-- Logo区域 -->
        <div class="logo">
          <router-link to="/">
            <img src="@/assets/logo.png" alt="logo" class="logo-img">
            <span>在线小说</span>
          </router-link>
        </div>
      </div>

      <!-- 右侧功能区 -->
      <div class="right-group">
        <!-- 搜索框组件 -->
        <div class="search-wrapper">
          <search-box v-model="searchKeyword" @search="handleSearch" class="custom-search" />
        </div>
        <!-- 用户面板 -->
        <div class="user-panel">
          <el-dropdown v-if="userStore.token" trigger="hover">
            <div class="user-avatar">
              <el-avatar :src="userInfo.avatar" :key="avatarPath" size=small @error="handleAvatarError" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="navigateTo">
                  <el-icon>
                    <User />
                  </el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="userStore.logout">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-else type="primary" @click="login" class="login-btn">
            登录
          </el-button>
        </div>
      </div>
    </div>

    <el-row class="b">
     
      <el-col :span="6">
        <div class="left-group">
          <el-menu mode="horizontal" router trigger="hover">
            <el-sub-menu index="1">
              <template #title>
                <i class="el-icon-menu"></i>
                <span>小说分类</span>
              </template>
              <el-menu-item index="/fantasy">奇幻</el-menu-item>
              <el-menu-item index="/romance">言情</el-menu-item>
              <el-menu-item index="/suspense">悬疑</el-menu-item>
              <el-menu-item index="/fantasy">玄幻</el-menu-item>
              <el-menu-item index="/romance">武侠</el-menu-item>
              <el-menu-item index="/suspense">仙侠</el-menu-item>
              <el-menu-item index="/fantasy">都市</el-menu-item>
              <el-menu-item index="/romance">历史</el-menu-item>
              <el-menu-item index="/suspense">体育</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
      </el-col>

      <el-col :span="8">
    
        <div class="center-group">
          <el-menu mode="horizontal" :default-active="$route.path" router>
            <el-menu-item index="/home">首页</el-menu-item>
            <el-menu-item index="/library">书库</el-menu-item>
            <el-menu-item index="/rank">排行榜</el-menu-item>
            <el-menu-item index="/author">作家专区</el-menu-item>
            <el-menu-item index="/activity">活动中心</el-menu-item>
          </el-menu>
        </div>
      </el-col>

      <el-col :span="10">
    
        <div class="right-group">
          <el-menu mode="horizontal" router trigger="hover">
            <el-sub-menu index="1">
              <template #title>
                <i class="el-icon-menu"></i>
                <span>小说分类</span>
              </template>
              <el-menu-item index="/fantasy">奇幻小说</el-menu-item>
              <el-menu-item index="/romance">言情小说</el-menu-item>
              <el-menu-item index="/suspense">悬疑小说</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
      </el-col>
    </el-row>
  </el-header>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import SearchBox from '@/components/common/SearchBox.vue'
import { useUserStore } from '@/stores/UserStore'
import { useSearchStore } from '@/stores/search'
import { storeToRefs } from 'pinia'
import instance from '@/utils/request'
import { Novel } from '@/types/novel'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash';

const userStore = useUserStore()
const router = useRouter()
const { userInfo } = storeToRefs(userStore)
const avatar = computed(() => userInfo.value.avatar)
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})
const novels = ref<Novel[]>([])
const searchKeyword = ref('')
const loading = ref(false)

const loadNovels = async () => {
  try {
    const res = await instance.get('/api/novel/search', {
      params: {
        keyword: searchKeyword.value,
        page: pagination.page,
        size: pagination.size
      }
    })
    novels.value = res.data.list
    pagination.total = res.data.total
    return res
  } catch (error) {
    ElMessage.error('数据加载失败')
  }
}

const handleSearch = debounce(async (keyword: string) => {
  try {
    loading.value = true;
    const trimmedKeyword = keyword.trim();
    searchKeyword.value = trimmedKeyword;
    if (!trimmedKeyword) {
      // 清空搜索逻辑
      useSearchStore().clearCache();
      return router.replace({ query: null });
    }
    // 调用API获取数据
    const response = await loadNovels()
    // 存入Pinia缓存
    const searchStore = useSearchStore();
    searchStore.cacheResults(response);
    console.log('缓存结果:', JSON.parse(JSON.stringify(searchStore.searchResults)))
    // 路由跳转
    router.push({
      name: 'SearchResults',
      query: {
        q: trimmedKeyword,
        page: '1'
      }
    });
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试');
    console.error('搜索错误:', error);
  } finally {
    loading.value = false;
  }
}, 500);


// 初始化时读取路由参数
onMounted(() => {
  const currentRoute = router.currentRoute.value;
  if (currentRoute.query.q) {
    searchKeyword.value = currentRoute.query.q as string
    loadNovels()
  }
})

// 清空搜索时重置路由
watch(searchKeyword, (newVal) => {
  const currentRoute = router.currentRoute.value;
  if (!newVal && currentRoute.query.q) {
    router.replace({ query: { ...currentRoute.query, q: undefined } })
  }
})
const avatarPath = computed(() => {
  return new URL(`/src/assets/${avatar.value}`, import.meta.url).href;
});
//用户中心
const navigateTo = () => {
  router.push('/profile')
}
const handleAvatarError = () => {
  console.error('头像加载失败')
}
// 登录
const login = () => {
  router.push('/login')
}

const logout = () => {
  userStore.logout()
  router.replace('/')
}
</script>

<style lang="scss" scoped>
.nav-bar {
  width: 100vw;
  height: var(--nav-height);
  backdrop-filter: blur(10px);
  margin-top: 10px;



  .nav-container {
    // 启用弹性布局
    display: flex;
    align-items: center; // 垂直居中
    justify-content: space-between; // 左右分布
    height: 100%;

    .left-group,
    .right-group {
      flex: 0 1 auto;
      display: flex;
      align-items: center;
      gap: 20px; // 元素间距
    }

    // 子元素布局调整
    .logo {
      flex: 0 0 auto; // 禁止缩放
      margin-right: 20px;
      flex-shrink: 0;

      img {
        height: 32px;
        width: 32px;
        margin-right: 8px;
      }

      span {
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
      }

      a {
        display: flex;
        align-items: center;
      }
    }

    //搜索框
    .search-wrapper {
      flex: 1; // 占据剩余空间
      max-width: 600px; // 限制最大宽度
      margin: 0 20px;
    }

    .user-panel {
      position: relative;
      z-index: 1000; // 确保悬浮层不被遮挡

      .user-avatar {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        &:hover {
          opacity: 0.8;
        }
      }
    }


    .login-btn {
      background: none !important;
      border: none !important;
      padding: 0 !important;
      color: var(--el-color-primary) !important;

      // 移除按钮交互效果
      &:hover,
      &:active {
        background: none !important;
        box-shadow: none !important;
        transform: none !important;
      }
    }
  }

  .el-menu {
    // 菜单项间距优化
    --el-menu-item-height: 50px;
    gap: 12px;
  }



  .nav-menu {
    flex: 1;
    margin-left: 40px;
    border-bottom: none;

    .el-menu-item {
      height: 56px;
      font-size: 16px;
      transition: all 0.3s;

      &:hover {
        background: rgba(37, 99, 235, 0.1);

      }
    }
  }

  .el-dropdown {
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>