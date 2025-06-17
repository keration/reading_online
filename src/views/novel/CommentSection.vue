<template>
    <el-card class="comment-section">
        <template #header>
            <div class="flex items-center justify-between">
                <span class="font-bold">本章讨论（{{ comments.length }}条）</span>
            </div>
        </template>

        <!-- 评论列表 -->
        <div v-loading="loading">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <el-avatar :src="getAssetPath(comment.avatarUrl)" class="comment-avatar" />
                <div class="comment-body">
                    <div class="comment-header">
                        <span class="nickname">{{ comment.nickname }}</span>
                        <span class="create-time">{{ $formatDate(comment.createTime) }}</span>
                    </div>
                    <p class="comment-content">{{ comment.content }}</p>

                    <!-- 操作按钮 -->
                    <div class="comment-actions flex gap-2 mt-1">
                        <!-- <el-button link @click="likeComment(comment)">
                            <el-icon>
                                <Star />
                            </el-icon> {{ comment.likes }}
                        </el-button>
                        <el-button link @click="reportComment(comment)">举报</el-button> -->
                        <el-button v-if="isMyComment(comment)" link type="danger" @click="deleteComment(comment.id)">
                            删除
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 发表评论 -->
        <el-form class="mt-4" @submit.prevent="submitComment">
            <el-form-item prop="content">
                <el-input v-model="newComment.content" type="textarea" :rows="3" placeholder="发表你的观点" resize="none" />
            </el-form-item>
            <div class="flex justify-end gap-3">
                <el-button @click="resetComment">重置</el-button>
                <el-button type="primary" native-type="submit">发送评论</el-button>
            </div>
        </el-form>
    </el-card>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { useCommentsStore } from '@/stores/commentStore'
import { getAssetPath } from '@/utils/assetHelper'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()
const route = useRoute()
const commentsStore = useCommentsStore()
// Props 接收外部传入的 novelId 和 chapterId
const props = defineProps({
    novelId: { type: Number, required: true },
    chapterId: { type: Number, required: true }
})

// 数据绑定
const { comments, loading } = storeToRefs(commentsStore)

// 新评论数据
const newComment = ref({
    novelId: props.novelId,
    chapterId: props.chapterId,
    content: ''
})

// 判断是否是当前用户自己的评论
const isMyComment = (comment: any): boolean => {
    return comment.userId === userStore.userInfo.id
}

// 提交评论
const submitComment = async () => {
  try {
    await commentsStore.submitComment({
      novelId: Number(route.params.novelId),
      chapterId: props.chapterId,
      content: newComment.value.content
    });
    ElMessage.success('评论提交成功');
    newComment.value.content = '';

    // ✅ 提交完成后刷新评论列表
    await commentsStore.fetchComments(props.novelId, props.chapterId);

  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message);
    } else {
      ElMessage.error('未知错误类型');
    }
  }
}

// 重置评论内容：
const resetComment = () => {
    newComment.value.content = ''
    newComment.value.chapterId = props.chapterId // 使用 props 中的 chapterId
}

// 点赞评论
const likeComment = async (comment: any) => {
    try {
        await commentsStore.likeComment(comment.id)
        ElMessage.success('点赞成功')
    } catch (e) {
        ElMessage.error('点赞失败')
    }
}

// 举报评论
const reportComment = async (comment: any) => {
    try {
        await commentsStore.reportComment(comment.id)
        ElMessage.success('已举报该评论')
    } catch (e) {
        ElMessage.error('举报失败')
    }
}

// 删除评论
const deleteComment = async (commentId: number) => {
    await nextTick();
    try {
        await commentsStore.deleteComment(commentId)
        ElMessage.success('评论删除成功')
    } catch (e) {
        ElMessage.error('删除失败')
    }
}
</script>

<style scoped>
.comment-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background-color: #f9fafb;
    transition: all 0.3s ease;
}

.comment-avatar {
    flex: none;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    flex-grow: 0;
}

.comment-body {
    flex: 1 1 0%;
    min-width: 0;
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
}

.nickname {
    font-weight: 500;
    color: #1f2937;
    margin-top: 5px;
}

.create-time {
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #9ca3af;
    margin-top: 5px;
}

.comment-content {
    color: #374151;
    line-height: 1.625;
}
</style>