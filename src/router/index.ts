// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [

  // 首页
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home.vue'),
    alias: '/home',
    meta: {
      title: '首页',          // 页面标题
      requiresAuth: false,    // 无需认证
      keepAlive: true         // 启用组件缓存
    }
  },
  {
    path: '/category/:typeId',
    name: 'CategoryView',
    component: () => import('@/views/novel/CategoryNovel.vue'),
    props: (route: { params: { typeId: any; }; query: { page: any; }; }) => ({
      typeId: Number(route.params.typeId) || 0,
      page: Number(route.query.page) || 1
    })
  },

  // 认证相关
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/login.vue'),
    meta: {
      title: '登录',
      guestOnly: true,        // 仅允许未登录用户访问
      transition: 'fade'      // 页面过渡动画
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/login.vue'),
    meta: {
      title: '注册',
      guestOnly: true
    }
  },

  // 小说详情
  {
    path: '/novel/:id',
    name: 'NovelDetail',
    component: () => import('@/views/novel/NovelDetail.vue'),
    props: true, // 自动将路由参数作为props传递
    meta: {
      title: '作品详情',
      cacheKey: 'novelDetail' // 自定义缓存标识
    }
  }, {
    path: '/recommended',
    name: 'RecommendedList',
    component: () => import('@/views/novel/ListPage.vue'),
    props: { listType: 'recommended' }
  },
  {
    path: '/new-books',
    name: 'NewBooksList',
    component: () => import('@/views/novel/ListPage.vue'),
    props: { listType: 'new' }
  },

  // 阅读器（动态参数+滚动行为优化）
  {
    path: '/reader/:novelId(\\d+)/:chapterId(\\d+)',
    name: 'novel-reader',
    component: () => import('@/views/novel/Reader.vue'),
    props: (route: { params: { novelId: any; chapterId: any } }) => ({
      novelId: Number(route.params.novelId),
      chapterId: Number(route.params.chapterId)
    }),
    meta: { transition: 'fade' },
    beforeEnter: async (to, from, next) => {  // 改为异步验证
      try {
        const isValid = await (to.params.chapterId)
        isValid ? next() : next({ name: 'not-found' })
      } catch (error) {
        console.error('章节验证失败:', error)
        next({ name: 'service-error' }) // 添加错误处理路由
      }
    }
  },
  // 新增服务错误页面
  {
    path: '/service-error',
    name: 'service-error',
    component: () => import('@/views/errors/ServiceError.vue'),
    meta: {
      title: '服务异常'
    }
  },

  // 用户相关
  {
    path: '/bookshelf',
    name: 'bookshelf',
    component: () => import('@/views/user/Bookshelf.vue'),
    meta: {
      title: '我的书架',
      requiresAuth: true,     // 需要登录
      scrollTop: true         // 进入时滚动到顶部
    }
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: () => import('@/views/SearchResults.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/bookupload',
    name: 'bookupload',
    component: () => import('@/views/user/bookupload.vue'),
    meta: {
      title: '我的书架',
      requiresAuth: true,     // 需要登录
      scrollTop: true         // 进入时滚动到顶部
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/user/Profile.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true
    }
  },
  {
    path: '/indexa',
    name: 'AdminLayout',
    component: () => import('@/views/administrator/Index_admin.vue'),
    meta: { requiresAuth: true },
    children: [
      // 用户管理模块
      {
        path: 'userlist', // 完整路径为 /indexa/userlist
        name: 'UserList',
        component: () => import('@/views/administrator/User_list.vue'),
        meta: { title: '用户管理' }
      },
      // 书籍管理模块
      {
        path: 'novelslist',
        name: 'NovelsList',
        component: () => import('@/views/administrator/Novels_list.vue'),
        meta: { title: '书籍管理' }
      },
      {
        path: 'authorlist',
        name: 'AuthorList',
        component: () => import('@/views/administrator/Author_list.vue'),
        meta: { title: '章节管理' }
      }
    ]
  },

  // 错误页面
  {
    path: '/:pathMatch(.*)*', // 更好的通配符匹配
    name: 'not-found',
    component: () => import('@/views/errors/NotFound.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 带 meta.scrollTop 的路由自动滚动到顶部
    if (to.meta.scrollTop) {
      return { top: 0 }
    }
    // 返回保存的位置（浏览器前进/后退时）
    if (savedPosition) {
      return savedPosition
    }
  }
})

// 全局路由守卫
// router.beforeEach((to, from, next) => {
//   // 设置页面标题
//   document.title = `${to.meta.title} | 在线阅读平台`

//   // 登录状态检查
//   const isAuthenticated = checkAuth()

//   // 需要登录的页面
//   if (to.meta.requiresAuth && !isAuthenticated) {
//     next({ name: 'login', query: { redirect: to.fullPath } })
//   }
//   // 仅允许游客访问的页面
//   else if (to.meta.guestOnly && isAuthenticated) {
//     next({ name: 'home' })
//   }
//   else {
//     next()
//   }
// })

export default router