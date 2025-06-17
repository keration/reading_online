// stores/commentsStore.ts
import { defineStore, storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/UserStore'
import dayjs from 'dayjs'
import instance from '@/utils/request'
import { computed, nextTick, reactive, ref, toRefs } from 'vue'
import { ElMessage } from 'element-plus'

interface User {
  id: number
  username: string
  avatar: string
}

interface Comment {
  id: number
  content: string
  createdAt: string
  user: User
  avatarUrl: string
  nickname: string
  createTime: string
}

const DEFAULT_AVATAR = '/src/assets/default-avatar.png'

export const useCommentsStore = defineStore('comments', () => {

  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)

  const fetchComments = async (novelId: number, chapterId: number) => {
  try {
    loading.value = true;
    const res = await instance.get(`/api/comments/get/comment/${novelId}/${chapterId}`);

    // console.log('真实响应:', JSON.stringify(res, null, 2));

    let data = null;

    if (res && typeof res === 'object') {
      data = 'data' in res ? res.data : res;
    }

    if (data && typeof data === 'object' && 'records' in data && Array.isArray(data.records)) {
      comments.value = [...data.records];
    } else {
      comments.value = [];
    }

  } catch (error) {
    comments.value = [];
    console.error('获取评论失败', error);
  } finally {
    loading.value = false;
  }
};

  const submitComment = async (payload: {
    novelId: number
    chapterId: number
    content: string
  }) => {
    try {
    const userStore = useUserStore();
    const userId = userStore.userInfo.id;
    if (!userStore.isLogin) throw new Error('用户未登录');
      const { data } = await instance.post<Comment>(
        // `/api/comments/newcomment/${payload.novelId}/${payload.chapterId}/${userId}`,
        `/api/comments/newcomment/${payload.novelId}/${payload.chapterId}`,
        // { ...payload, 
        //   // userId,
        //   createdAt: dayjs().toISOString() }
        { content: payload.content }
      );
      const { userInfo } = userStore;
      comments.value.unshift({
        ...data,
        user: {
          id:userId,
          username: userInfo.username || '匿名用户',
          avatar: userInfo.avatar || DEFAULT_AVATAR
      }
    });
    
    return data;
    } catch (err) {
      error.value = '评论提交失败：' + (err instanceof Error ? err.message : '未知错误')
      throw err
    }
  }

  const deleteComment = async (commentId: number) => {
  try {
    loading.value = true;
    await instance.delete(`/api/comments/delete/${commentId}`);
    
    // 类型保护：确保是数组
    if (Array.isArray(comments.value)) {
      comments.value = comments.value.filter(comment => comment.id !== commentId);
    } else {
      comments.value = []; // 如果不是数组，重置为空数组防止后续出错
    }

  } catch (error) {
    ElMessage.error('删除失败：' + (error as Error).message);
    console.error('Error deleting comment:', error);
    throw error;
  } finally {
    loading.value = false;
  }
};

   const likeComment = async (commentId: number) => {
    try {
      const res = await instance.post(`/api/comments/like/${commentId}`);
      const index = comments.value.findIndex(comment => comment.id === commentId);
      if (index !== -1) {
        comments.value[index].likes += 1; // 假设你的 Comment 接口中包含 likes 字段
      }
      return res;
    } catch (err) {
      error.value = '点赞评论失败：' + (err instanceof Error ? err.message : '未知错误');
      throw err;
    }
  }

  const reportComment = async (commentId: number) => {
    try {
      await instance.post(`/api/comments/report/${commentId}`);
    } catch (err) {
      error.value = '举报评论失败：' + (err instanceof Error ? err.message : '未知错误');
      throw err;
    }
  }

  const formattedComments = computed(() =>
    comments.value.map((comment: { createdAt: string | number | Date | dayjs.Dayjs | null | undefined }) => ({
      ...comment,
      createdAt: dayjs(comment.createdAt).format('MM-DD HH:mm')
    }))
  )

  return {
    comments,
    loading,
    error,
    fetchComments,
    submitComment,
    deleteComment,   
    likeComment,     
    reportComment,   
    formattedComments
  }
})