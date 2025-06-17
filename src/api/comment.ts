
import axios from 'axios'
export const CommentAPI = {
  likeComment: (id: string) => axios.post(`/comments/${id}/like`)
}   
// ===================== 数据模型接口 =====================
export interface CommentCreateDTO {
  content: string;
  novelId: number;
}

export interface CommentVO {
  id: number;
  content: string;
  userId: number;
  novelId: number;
  createdAt: string;          // 根据实际时间格式调整（如Date类型）
  userAvatar?: string;        // 根据实际VO字段补充
  username?: string;
}

// 分页响应结构
export interface PageResult<T> {
  total: number;
  currentPage: number;
  pageSize: number;
  data: T[];
}


const API_BASE_URL = '/api';

export const CommentApi = {
  // 
  //   发表评论
  //   @param userId 用户ID（通过请求头传递）
  //   @param dto 评论内容及关联小说ID
  //  
  postComment: (userId: number, dto: CommentCreateDTO) => 
    axios.post<CommentVO>(`${API_BASE_URL}/comments`, dto, {
      headers: {
        UserId: userId.toString()  // 确保header值为字符串
      }
    }),

  ​
  //   获取小说评论（支持分页排序）
  //   @param novelId 小说ID
  //   @param page 当前页码（默认1）
  //   @param size 每页数量（默认10）
  //  @param sort 排序方式（默认"hot"）
   
  getNovelComments: (
    novelId: number,
    params?: {
      page?: number;
      size?: number;
      sort?: 'hot' | 'new';  // 根据实际排序选项限制类型
    }
  ) => {
    // 合并默认参数
    const requestParams = {
      page: 1,
      size: 10,
      sort: 'hot',
      ...params
    };
    
    return axios.get<PageResult<CommentVO>>(
      `${API_BASE_URL}/comments/novel/${novelId}`,
      { params: requestParams }
    );
  }
};

// ===================== 使用示例 =====================
// 发表评论（用户ID=123，小说ID=456）
// CommentApi.postComment(123, {
//   content: "精彩的小说！",
//   novelId: 456
// }).then(res => console.log('评论ID:', res.data.id));

// 获取第二页评论（按最新排序）
// CommentApi.getNovelComments(456, {
//   page: 2,
//   sort: 'new'
// }).then(res => {
//   console.log('总评论数:', res.data.total);
// });