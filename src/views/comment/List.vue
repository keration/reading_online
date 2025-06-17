<template>
    <div class="comment-list">
      <!-- 评论发布 -->
      <div class="comment-editor">
        <el-avatar :size="40" :src="user.avatar"/>
        <el-input 
          v-model="commentText"
          placeholder="写下你的评论..."
          :rows="2"
          type="textarea"
          resize="none"
        />
        <div class="actions">
          <el-button 
            type="primary" 
            size="small"
            @click="postComment"
          >发布</el-button>
        </div>
      </div>
  
      <!-- 评论列表 -->
      <el-list class="list-container">
        <div 
          v-for="comment in comments" 
          :key="comment.id"
          class="comment-item"
        >
          <el-avatar :size="36" :src="comment.user.avatar"/>
          <div class="content">
            <div class="meta">
              <span class="username">{{ comment.user.name }}</span>
              <el-rate 
                v-model="comment.rating"
                disabled
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
              <span class="time">{{ formatTime(comment.time) }}</span>
            </div>
            <div class="text">{{ comment.content }}</div>
            <div class="actions">
              <el-button 
                link 
                @click="toggleLike(comment)"
              >{{ comment.liked ? '取消点赞' : '点赞' }}</el-button>
              <span class="count">{{ comment.likeCount }}</span>
            </div>
          </div>
        </div>
      </el-list>
  
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.current"
        :page-size="pagination.size"
        :total="pagination.total"
        layout="prev, pager, next"
        @current-change="loadComments"
      />
    </div>
  </template>
  
  <script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

  interface Comment {
    id: string
    user: {
      id: string
      name: string
      avatar: string
    }
    content: string
    time: Date
    likeCount: number
    liked: boolean
    rating: number
  }
  
  // Props定义
  const props = defineProps<{
    novelId: string
  }>()
  
  // 评论数据
  const comments = ref<Comment[]>([])
  const commentText = ref('')
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })
  
  // 加载评论
  const loadComments = async () => {
    const { data } = await getComments({
      novelId: props.novelId,
      page: pagination.current,
      size: pagination.size
    })
    comments.value = data.list
    pagination.total = data.total
  }
  
  // 发布评论
  const postComment = async () => {
    if (!commentText.value.trim()) return
    await createComment({
      novelId: props.novelId,
      content: commentText.value
    })
    commentText.value = ''
    loadComments()
  }
  
  // 初始化加载
  onMounted(loadComments)
  </script>