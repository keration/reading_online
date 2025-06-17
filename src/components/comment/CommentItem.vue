<!-- 单条评论展示 -->
<template>
    <div class="comment-item">
        <el-avatar :src="comment.user.avatar" />
        <div class="content">
            <div class="meta">
                <span class="author">{{ comment.user.name }}</span>
                <el-rate v-model="comment.rating" disabled :colors="['#99A9BF', '#F7BA2A', '#FF9900]" />
            </div>

            // 时间展示优化
            <el-tooltip :content="dayjs(comment.createTime).format('YYYY-MM-DD HH:mm')">
                <span class="time">
                    {{ timeAgo(comment.createTime) }}
                </span>
            </el-tooltip>
            <div class="text">{{ comment.content }}</div>
            <div class="actions">
                <el-button link @click.stop="toggleLike" :class="{ 'liked-btn': comment.liked }" :loading="likeLoading">
                    <el-icon :size="14">
                        <Loading v-if="likeLoading" />
                        <Like v-else />
                    </el-icon>
                    {{ comment.liked ? '已点赞' : '点赞' }}
                </el-button>
                <span class="count">{{ comment.likeCount }}</span>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime) // 扩展插件

import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useCommentStore } from '@/stores/comment' // 导入commentStore
import { CommentAPI } from '@/api/comment'
import { storeToRefs } from 'pinia'
import type { Comment } from '@/api/types/comment'

interface Props {
  comment: Comment // 确保从正确位置导入Comment类型
}

const props = defineProps<Props>()
const authStore = useAuthStore()
const commentStore = useCommentStore() // 初始化store
const { isLoggedIn } = storeToRefs(authStore)
const likeLoading = ref(false)

// 时间格式化（已修复）
const timeAgo = (time: string) => dayjs(time).fromNow()

const toggleLike = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    likeLoading.value = true
    // 确保props.comment.id是string类型，如需要转换：
    await CommentAPI.likeComment(props.comment.id.toString())
    commentStore.toggleLike(props.comment.id)
  } finally {
    likeLoading.value = false
  }
}
</script>

<style lang="scss">
.comment-item {
    @apply flex gap-4 p-4 transition-all duration-300 hover:bg-gray-50;

    .content {
        @apply flex-1 min-w-0;

        .meta {
            @apply flex items-center gap-2 mb-2;

            .author {
                @apply font-medium text-gray-700;
            }
        }

        .text {
            @apply text-gray-800 leading-relaxed break-words;
        }

        .actions {
            @apply flex items-center gap-2 mt-3;

            .count {
                @apply text-gray-500 text-sm;
            }
        }
    }
}

// 自定义评分样式[6](@ref)
::v-deep(.el-rate) {
    --el-rate-icon-size: 16px;

    .el-rate__item:hover .el-rate__icon {
        transform: scale(1.2);
    }
}

.liked-btn {
    @apply text-red-500 hover:text-red-600;
}
</style>