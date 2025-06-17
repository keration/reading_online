// src/types/novel.d.ts
export interface Novel {
  id: number
  title: string
  author_id: number | null
  cover_image: string
  created_at?: string
  new: number
  isNew?: boolean
  recommend?: boolean
}

export interface Author {
  id: number
  name: string
  pen_name?: string
}

export interface Pagination {
  current: number
  pageSize: number
  total: number
}


export interface NovelCreate {
  title: string
  authorName: string 
  coverImage: string
  isNew?: boolean
  isRecommend?: boolean
}