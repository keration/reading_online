// stores/userListStore.ts
import { defineStore } from 'pinia'
import instance from '@/utils/request'

interface UserListState {
  users: User[]
  loading: boolean
  pagination: {
    page: number
    size: number
    total: number
  }
}

export const useUserListStore = defineStore('userList', {
  state: (): UserListState => ({
    users: [],
    loading: false,
    pagination: {
      page: 1,
      size: 10,
      total: 0
    }
  }),

  actions: {
    async fetchUsers() {
      try {
        this.loading = true
        const data = await instance.get('/auth', {
          params: {
            page: this.pagination.page,
            size: this.pagination.size
          }
        })
        this.users = data.list
        this.pagination.total = data.total

      } catch (error) {
        console.error('Failed to fetch users:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser(userData: User) {
      try {
        this.loading = true
        const response = await instance.post('/auth', userData)
        const newUser = response.data
        this.users = [newUser, ...this.users]
        this.pagination.total += 1
      } catch (error) {
        console.error('Failed to create user:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUser(userData: User) {
      try {
        this.loading = true
        const response = await instance.put(`/auth/${userData.id}`, userData)
        const index = this.users.findIndex(u => u.id === response.id)
        if (index > -1) {
          this.users.splice(index, 1, response)
        }
      } catch (error) {
        console.error('Failed to update user:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUser(userId: number) {
      try {
        this.loading = true
        await instance.delete(`/auth/${userId}`)
        this.users = this.users.filter(u => u.id !== userId)
        this.pagination.total -= 1
      } catch (error) {
        console.error('Failed to delete user:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUserEnabled(userId: number, enabled: 0 | 1) {
      try {
        await instance.patch(`/auth/${userId}/enabled`, { enabled })
        const user = this.users.find(u => u.id === userId)
        if (user) {
          user.enabled = enabled
        }
      } catch (error) {
        console.error('Failed to update user enabled:', error)
        throw error
      }
    },

    setPage(page: number) {
      this.pagination.page = page
    },

    setPageSize(size: number) {
      this.pagination.size = size
    }
  },

  getters: {
    genderLabels: () => ({
      MALE: '男',
      FEMALE: '女'
    })
  }
})