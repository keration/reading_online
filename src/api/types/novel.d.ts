// src/api/types/novel.d.ts
export interface NovelItem {
    id: number
    title: string
    author: string
    cover: string
    rating: number
    // 其他需要的字段...
  }
  
  export interface NovelListResponse {
    records: NovelItem[]
    total: number
  }