// src/api/novel.ts
import instance from '@/utils/request.js' // 导入现有 Axios 实例
import type { AxiosResponse } from 'axios'

// 分页响应类型（根据后端 IPage 结构定义）
export interface IPage<T> {
  current: number    // 当前页码
  size: number       // 每页数量
  total: number      // 总记录数
  records: T[]       // 当前页数据列表
}

// 小说详情 DTO 类型（根据实际字段调整）
export interface NovelDetailDTO {
  id: number
  title: string
  author: string
  category: string
  wordCount: number  // 注意后端返回字段是否需要转换（如 word_count）
  createdAt: string  // 注意日期格式处理
  // 其他字段...
}

// 查询参数类型（对应 Controller 参数）
export interface NovelQueryParams {
  title?: string
  author?: string
  category?: string
  minWords?: number
  maxWords?: number
  page?: number
  size?: number
}

/**
 * 分页查询小说列表
 * @param params 查询参数
 */
export const fetchNovels = (
  params: NovelQueryParams
): Promise<IPage<NovelDetailDTO>> => {
  // 处理默认值（如果后端未处理）
  const processedParams: NovelQueryParams = {
    page: params.page ?? 1,
    size: Math.min(params.size ?? 10, 100),
    ...params
  }

  // 过滤 undefined/null 参数
  const filteredParams = Object.entries(processedParams).reduce(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value
      }
      return acc
    },
    {} as Record<string, any>
  )

  return instance
    .get<IPage<NovelDetailDTO>>('/novels', {
      params: filteredParams,
      paramsSerializer: {
        indexes: null // 保留数组格式参数
      }
    })
    .then((res: AxiosResponse<IPage<NovelDetailDTO>>) => {
      // 如果需要字段转换（如 snake_case -> camelCase）
      return {
        ...res.data,
        records: res.data.records.map(novel => ({
          ...novel,
          wordCount: novel.wordCount || (novel as any).word_count // 兼容不同命名格式
        }))
      }
    })
    .catch(error => {
      // 统一错误处理（如果实例已配置拦截器可省略）
      throw new Error(`小说列表请求失败: ${error.response?.data?.message || error.message}`)
    })
}
