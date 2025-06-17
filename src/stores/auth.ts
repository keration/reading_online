// src/stores/auth.ts
import { defineStore } from 'pinia'

type AuthState = {
  token: string | null
  userInfo: {
    id: number
    username: string
  } | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('authToken'),
    userInfo: null
  }),

  getters: {
    // 正确命名 getter
    isAuthenticated(): boolean {
      return !!this.token
    },
    
    // 兼容旧名称（可选）
    isLoggedIn(): boolean {
      return this.isAuthenticated
    }
  },

  actions: {
    async login(credentials: { username: string; password: string }) {
      // 实际登录逻辑
      const response = await fetch('/api/login', { /* ... */ })
      const data = await response.json()
      
      this.token = data.token
      localStorage.setItem('authToken', data.token)
    },

    logout() {
      this.token = null
      localStorage.removeItem('authToken')
    }
  }
})