// ===================== API 调用函数 =====================
import axios from 'axios';

const API_BASE_URL = '/api';

export const CommentLikeApi = {
//   /​**​
//    * 点赞评论
//    * @param userId 用户ID（请求头）
//    * @param commentId 评论ID（路径参数）
//    */
  likeComment: (userId: number, commentId: number) =>
    axios.post<void>(
      `${API_BASE_URL}/comments/${commentId}/likes`,
      null,  // 无请求体
      {
        headers: {
          UserId: userId.toString()
        }
      }
    ),

//   /​**​
//    * 取消点赞
//    * @param userId 用户ID（请求头）
//    * @param commentId 评论ID（路径参数）
//    */
  cancelLike: (userId: number, commentId: number) =>
    axios.delete<void>(
      `${API_BASE_URL}/comments/${commentId}/likes`,
      {
        headers: {
          UserId: userId.toString()
        }
      }
    )
};

// ===================== 使用示例 =====================
// 点赞评论（用户ID=123，评论ID=456）
// CommentLikeApi.likeComment(123, 456)
//   .then(() => console.log('点赞成功'))
//   .catch(error => console.error('点赞失败', error.response?.data));

// 取消点赞
// CommentLikeApi.cancelLike(123, 456)
//   .then(() => console.log('取消成功'));