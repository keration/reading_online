import { defineStore } from 'pinia'
import type { AxiosResponse } from 'axios'
import instance from '@/utils/request'
import { ElMessage } from 'element-plus'

interface BookItem {
  id: string
  title: string
  author: string
  coverImage: string
  progress: number
  addTime: number
  lastRead?: Date
  isNew?: boolean      // 新增字段
  tags?: string[]      // 新增标签字段
  readTime?: number    // 新增阅读时长
  lastChapter?: string  // 新增最后阅读章节
}
interface ApiResponse<T> {
  data: T
  code: number
  message?: string
}

export const useBookshelfStore = defineStore('bookshelf', {
  state: () => ({
    bookList: [] as BookItem[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchBooks(userId: number) {
      this.loading = true
      try {
        const response: AxiosResponse<any> = await instance.get('/api/bookshelf', {
          headers: { 'UserId': userId },
          params: { _sort: 'addTime', _order: 'desc' }
        })

        console.log('完整响应:', response)
        console.log('响应数据:', response.data)

        let bookData = []

        if (Array.isArray(response)) {
          bookData = response
        } else if (response.data && Array.isArray(response.data)) {
          bookData = response.data
        } else {
          bookData = []
        }

        if (bookData.length > 0) {
          this.bookList = bookData.map(item => ({
            ...item,
            addTime: item.startTime ? new Date(item.startTime).getTime() : Date.now(),
            isNew: false
          }))
        } else {
          this.bookList = []
          ElMessage.info('您的书架暂无书籍')
        }

      } catch (err: any) {
        console.error('获取书架数据失败:', err)
        ElMessage.error('获取书架数据失败，请稍后再试')
      } finally {
        this.loading = false
      }
    },

    async removeBook(payload: { userId: number; novelId: number }) {
      this.loading = true
      console.log(payload.userId,payload.novelId)
      try {
        await instance.delete(`/api/bookshelf/${payload.novelId}`, {
          headers: { 'UserId': payload.userId }
        })
        this.bookList = this.bookList.filter(book => book.id !== payload.novelId)
        ElMessage.success('删除成功')
      } catch (err: any) {
        err(err, '删除书籍失败')
      } finally {
        this.loading = false
      }
    },

    async updateProgress(payload: { userId: string; bookId: string; progress: number }) {
      try {
        const { status } = await instance.patch(`/${payload.bookId}/progress`,
          { progress: payload.progress },
          {
            headers: { 'User-Id': payload.userId },
            validateStatus: (s) => s < 500
          }
        )

        if (status === 200) {
          this.bookList = this.bookList.map(book =>
            book.id === payload.bookId
              ? { ...book, progress: payload.progress, lastRead: new Date() } // 更新最后阅读时间
              : book
          )
        }
      } catch (err: any) {
        err(err, '更新进度失败')
      }
    },
    async addBookToShelf(userId: number, novelId: any) {
      this.loading = true
      try {
        // 假设后端支持 POST 请求添加书籍
        const response = await instance.post(
          `/api/bookshelf/${novelId}`,
          {},
          {
            headers: { 'UserId': userId }
          }
        )
        ElMessage.success('书籍已添加到书架')
      } catch (err: any) {
        ElMessage.error('添加书籍失败，请重试')
        console.error('添加书籍失败:', err)
      } finally {
        this.loading = false
      }
    }

  },
})