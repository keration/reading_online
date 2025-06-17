// src/stores/UserStore.ts
import instance from '@/utils/request'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const DEFAULT_AVATAR = '/src/assets/default-avatar.png'

interface UserProfile {
  username: string
  id: number
  avatar: string
  roles: string[]
  email?: string
  phone?: string
  createTime?: number
  bookshelfCount?: number
}
interface ApiResponse<T = any> {
  code: number
  message?: string
  data?: T
}

export const useUserStore = defineStore('user', () => {
  // 统一状态管理
  const userInfo = ref<UserProfile>({
    username: '游客',
    id:0,
    avatar: DEFAULT_AVATAR,
    roles: [],
    email: '',
    phone: '',
    createTime: Date.now(),
    bookshelfCount: 0
  })

  const token = ref('')
  const loading = ref(false)

  // 计算属性优化
  const isLogin = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value.roles.includes('admin') ?? false)

  const setToken = (newToken: string) => {
    token.value = newToken
  }


  const setUserData = ( payload: Partial<UserProfile>) => {
    userInfo.value = {
      ...userInfo.value,
      ...payload,
      id: payload.id ?? userInfo.value.id,
      avatar: payload.avatar || DEFAULT_AVATAR,
      roles: Array.isArray(payload.roles) ? payload.roles : ['user'],
      email: payload.email ?? userInfo.value.email,
      phone: payload.phone ?? userInfo.value.phone,
      createTime: payload.createTime ?? userInfo.value.createTime,
      bookshelfCount: payload.bookshelfCount ?? userInfo.value.bookshelfCount
    }
  }

  
  const fetchProfile = async (): Promise<UserProfile> => {
    loading.value = true
    try {
      const response = await fetch('/auth/user/profile', {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const res = await response.json() as ApiResponse<UserProfile>
      
      if (res.code !== 200 || !res.data) {
        throw new Error(res.message || 'Invalid response format')
      }

      // 使用增强的setUserData合并数据
      setUserData({
        username: res.data.username,
        avatar: res.data.avatar,
        email: res.data.email || '', // 保证必有值
        phone: res.data.phone || '',  // 保证必有值
        createTime: res.data.createTime || Date.now(),
        bookshelfCount: res.data.bookshelfCount || 0,
        roles: res.data.roles,
        id: res.data.id
      })
      return userInfo.value
    } catch (err) {
      console.error('获取用户资料失败:', err)
      throw new Error('Failed to load profile')
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (params: { email?: string; phone?: string }) => {
    try {
      const response = await fetch('/auth/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`
        },
        body: JSON.stringify(params)
      })

      const res: ApiResponse = await response.json()
      
      if (res.code !== 200) {
        throw new Error(res.message || '更新资料失败')
      }

      setUserData(params)
      return res
    } catch (err) {
      console.error('更新资料失败:', err)
      throw err
    }
    
    
  }

    const updateAvatar = async (avatarUrl: string) => {
  try {
    const response = await instance.put(
      `/auth/${userInfo.value.id}/avatar`,
      { avatarUrl }, // 更具语义的字段名
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`
        }
      }
    )

    const res = response.data as ApiResponse<{ avatarUrl: string }> // 与参数对应

    if (res.code !== 200 || !res.data) {
      ElMessage.error(res.message || '头像更新失败')
      throw new Error(res.message || '头像更新失败')
    }

    setUserData({ avatar: res.data.avatarUrl }) // 更新状态
    ElMessage.success('头像更新成功')

    return res.data.avatarUrl
  } catch (err: any) {
    console.error('头像更新失败:', err)

    let errorMessage = '头像更新失败'

    if (err.response) {
      errorMessage = `服务器错误HTTP ${err.response.status}`
    } else if (err.request) {
      errorMessage = '无响应，请检查网络连接或服务是否可用'
    } else {
      errorMessage = err.message
    }

    ElMessage.error(errorMessage)
    throw new Error(errorMessage)
  }
}
  const updatePassword = async (params: { oldPassword: string; newPassword: string }) => {
  try {
    const response = await instance.patch(
      `/auth/${userInfo.value.id}/password`,
      {
        oldPassword: params.oldPassword,
        newPassword: params.newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      }
    )
    return {
      code: 200,
      message: '密码修改成功'
    } as ApiResponse

  } catch (err: any) {
    console.error('密码修改失败详情:', err)

    if (err.response) {
      throw new Error(`服务器错误：HTTP ${err.response.status}`)
    } else if (err.request) {
      throw new Error('无响应，请检查网络连接或服务是否可用')
    } else {
      throw new Error(err.message || '未知错误')
    }
  }
}
  

  const logout = () => {
    token.value = ''
    userInfo.value = {
      username: '游客',
      id:0,
      avatar: DEFAULT_AVATAR,
      roles: []
    }
  }

  return {
    token,
    userInfo,
    isLogin,
    isAdmin,
    loading,
    setToken,
    setUserData,
    fetchProfile,
    updateProfile,
    updateAvatar,
    updatePassword,
    logout
  }
}, {
  persist: {
    strategies: [
      {
        key: 'novel_user',
        storage: localStorage,
        paths: ['token', 'userInfo']  // 现在类型校验通过
      }
    ]
  }
})