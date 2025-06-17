// stores/novelStore.ts
import { defineStore } from 'pinia'
import type { Novel } from '@/types/novel'
import instance from '@/utils/request'
import type { PersistenceOptions } from 'pinia-plugin-persistedstate'

export const useNovelStore = defineStore('novel', {
  state: () => ({
    featuredNovels: [] as Novel[], // 推荐小说列表
    newNovels: [] as Novel[], // 新增新书数据状态
    currentNovel: null as Novel | null, // 新增当前小说状态
    chapters: [] as Chapter[],           // 新增章节列表状态
    loading: false,
    error: null as string | null,
    categoryNovels: [] as Novel[],  // 必须明确初始化为数组
    categoryTotal: 0
  }),
  persist: {
    enabled: true,
    strategies: [{
      storage: localStorage,
      key: 'novel_data',
      paths: ['featuredNovels', 'newNovels']
    }]
  } as PersistenceOptions,

  actions: {
    async fetchFeaturedNovels() {
      try {
        this.loading = true
        // 明确请求参数类型
        const params = new URLSearchParams({
          recommend: '1',
          page: '1',
          size: '10'
        });

        const response = await instance.get<{ data: Novel[] }>('/api/novel/featured', {
          params,
        });
        this.featuredNovels = response.records
        return response.records

      } catch (err: any) {
        const errorMsg = err.response?.data?.message || '获取推荐列表失败'
        console.error('完整错误对象:', err);
        console.log('HTTP状态码:', err.response?.status);
        console.log('响应头:', err.response?.headers);
        console.log('原始响应数据:', err.response?.data);
        
        this.error = errorMsg
        throw new Error(errorMsg)
      } finally {
        this.loading = false;
      }
    },
    async getNewNovels() {
      try {
        this.loading = true;
        const response = await instance.get<{ data: Novel[] }>('/api/novel/new', {
          params: {
            new: 1, // 假设后端通过 new=1 标识新书
            page: 1,
            size: 10
          }
        });
        this.newNovels = response.records
        return response.records
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || '获取新书列表失败'
        this.error = errorMsg
        throw new Error(errorMsg)
      } finally {
        this.loading = false;
      }
    },
    //通过ID获取小说详情
    async getNovelById(novelId: number) {
      try {
        this.loading = true;
        const response = await instance.get<{ data: Novel[] }>(`/api/novel/${novelId}`, {
          params: {
            page: 1,
            size: 10
          }
        });
        this.currentNovel = response.records[0]; // 存储到当前小说状态
        return response.records;
      } catch (err: any) {
        this.error = err.response?.data?.message || '获取小说详情失败';
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },

    //通过ID获取全部章节
    async getChaptersByNovelId(novelId: number) {
      try {
        this.loading = true;
        const response = await instance.get<{ data: Chapter[] }>(`/api/novel/${novelId}/chapters`)

        const chapterTitles: string[] = response.records.map((chapter: Chapter) => {
          return chapter.chapterTitle;
        });

        // 存储到 Vuex 状态管理（示例）
        this.chapters = response.records;
        this.chapterTitles = chapterTitles; //
        // console.log(chapterTitles,111)
        // this.chapters = response.recodes; // 存储到章节列表状态
        return response.recodes;
      } catch (err: any) {
        this.error = err.response?.data?.message || '获取章节列表失败';
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCategoryNovels(categoryId: number) {
      try {
        this.loading = true
        const res = await instance.get('/api/novel/category', { params: {
          categoryId,
            page: 1,
            size: 10
          } })
        this.categoryNovels = res.records
        this.categoryTotal = res.total
      } catch (error) {
        console.error('获取分类小说失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchListData(params: { type: string; page?: number; size?: number; sort?: string }) {
    const { type } = params;

    if (type === 'recommended') {
      // 调用推荐小说方法
      await this.fetchFeaturedNovels();
    } else if (type === 'new') {
      // 调用新书方法
      await this.getNewNovels();
    } else {
      throw new Error('不支持的小说列表类型');
    }
  },
  }
})