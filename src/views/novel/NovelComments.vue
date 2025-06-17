<template>
    <div class="comments-section">
      <!-- 评论列表 -->
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="flex items-start gap-3 mb-4">
          <el-avatar :src="comment.avatar" />
          <div>
            <div class="font-medium">{{ comment.username }}</div>
            <div class="text-gray-600">{{ comment.content }}</div>
            <div class="text-sm text-gray-400">{{ formatTime(comment.time) }}</div>
          </div>
        </div>
      </div>

      <!-- 发表评论按钮 -->
      <el-button type="primary" class="mt-4" @click="showCommentDialog = true">
        发表书评
      </el-button>
    </div>

    <!-- 评论弹窗 -->
    <el-dialog v-model="showCommentDialog" title="发表评论">
      <el-form :model="newComment" label-width="80px">
        <el-form-item label="评分" required>
          <el-rate v-model="newComment.rating" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="newComment.content" type="textarea" :rows="4" placeholder="请输入评论内容（不少于20字）" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCommentDialog = false">取消</el-button>
        <el-button type="primary" @click="submitComment">提交</el-button>
      </template>
    </el-dialog>

</template>

<script setup lang="ts">
import { dayjs, ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

const showCommentDialog = ref(false)
const newComment = reactive({
  rating: 3,
  content: ''
})

// 模拟评论数据
const comments = ref([
  {
    id: 1,
    username: '读者A',
    avatar: 'https://example.com/avatar1.jpg',
    content: '这本小说世界观设定非常宏大，人物刻画细腻！',
    time: 1714200000,
    rating: 4
  }
])

const submitComment = () => {
  if (!validateComment()) return

  comments.value.unshift({
    id: Date.now(),
    username: '当前用户',
    avatar: 'https://example.com/current-user.jpg',
    content: newComment.content,
    time: Math.floor(Date.now() / 1000),
    rating: newComment.rating
  })

  resetCommentForm()
}

const validateComment = () => {
  if (newComment.content.length < 20) {
    ElMessage.warning('评论内容至少需要20字')
    return false
  }
  return true
}

const resetCommentForm = () => {
  newComment.rating = 3
  newComment.content = ''
  showCommentDialog.value = false
}

// 时间格式化（需自行实现）
const formatTime = (timestamp: number) => dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm')

</script>