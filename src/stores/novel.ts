// src/stores/novel.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import instance from '@/utils/request'
import type { Novel, NovelCreate, Pagination, Author } from '@/types/novel'
import { ElMessage } from 'element-plus'

export const useNovelStore = defineStore('novel', () => {
  const novels = ref<Novel[]>([])
  const loading = ref(false)
  const pagination = ref<Pagination>({
    current: 1,
    pageSize: 10,
    total: 0
  })
  interface ApiResponse<T> {
  records: T[];
  current: number;
  size: number;
  total: number;
}


  const fetchNovels = async (params?: { 
  page?: number
  pageSize?: number
  search?: string 
}) => {
  try {
    loading.value = true
    const requestParams = {
      page: params?.page || pagination.value.current,
      size: params?.pageSize || pagination.value.pageSize,
      search: params?.search?.trim()
    };

    const res = await instance.get<ApiResponse<Novel>>('/api/novel/all', {
      params: requestParams 
    });

// 关键修复：自动识别是否为 Axios 响应结构
const apiData = ('data' in res ? res.data : res) as ApiResponse<Novel>;
const records = Array.isArray(apiData.records) ? apiData.records : [];

novels.value = records.map(item => ({
  ...item,
  isNew: Boolean(item.isNew),
  recommend: Boolean(item.recommend)
}));

pagination.value = {
  current: apiData.current ?? 1,
  pageSize: apiData.size ?? 10,
  total: apiData.total ?? 0
};
  } catch (error) {
    ElMessage.error('数据加载失败')
    throw error
  } finally {
    loading.value = false
  }
}

  const deleteNovel = async (id: number) => {
    try {
      await instance.delete(`api/novel/${id}`)
      await fetchNovels()
    } catch (error) {
      ElMessage.error('删除失败：' + (error as Error).message)
      throw error
    }
  }

  const updateNovel = async (id: number, data: NovelCreate) => {
    try {
      await instance.put(`/api/novel/${id}`, data)
      await fetchNovels()
    } catch (error) {
      ElMessage.error('更新失败：' + (error as Error).message)
      throw error
    }
  }

  const createNovel = async (data: NovelCreate) => {
    try {
      await instance.post('/api/novel', sanitizeData(data))
      await fetchNovels()
    } catch (error) {
      ElMessage.error('创建失败：' + (error as Error).message)
      throw error
    }
  }

  const uploadCover = async (file: File, bookName: string) => {
    const MAX_SIZE = 2 * 1024 * 1024;
    if (!file.type.startsWith('image/')) {
        throw new Error('仅支持图片文件');
    }
    if (file.size > MAX_SIZE) {
        throw new Error('文件大小超过限制');
    }

    // 生成规范化文件名（基于书名）
    const sanitizeFileName = (name: string) => 
        name.replace(/\s+/g, '_')        
            .replace(/[^\w\-.]/g, '')     
            .substring(0, 50);             
    
    const baseName = sanitizeFileName(bookName);
    const fileExtension = file.name.split('.').pop() || file.type.split('/')[1] || 'jpg';           
    
    const fileName = `${baseName}.${fileExtension}`;

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                const assetPath = `/src/assets/${fileName}`;
                resolve(assetPath);
            } else {
                reject(new Error('文件读取失败'));
            }
        };
        reader.readAsDataURL(file);
    });
};

  const sanitizeData = (data: NovelCreate): NovelCreate => ({
  ...data,
  title: data.title.trim(),
  authorName: data.authorName.trim(),
  isNew: Boolean(data.isNew),           // 添加布尔值转换
  isRecommend: Boolean(data.isRecommend)
})

  return {
    novels,
    loading,
    pagination,
    fetchNovels,
    deleteNovel,
    updateNovel,
    createNovel,
    uploadCover
  }
})