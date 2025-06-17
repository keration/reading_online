// src/utils/auth.ts
import { useAuthStore } from '@/stores/auth'

export const checkAuth = (): boolean => {
  try {
    const authStore = useAuthStore()
    return authStore.isAuthenticated // 现在可以正确识别类型
  } catch (error) {
    console.error('认证检查失败:', error)
    return false
  }
}