<!-- 章节列表组件 -->
<template>
    <el-card class="chapter-list">
        <el-input v-model="searchKey" placeholder="搜索章节" class="mb-4" clearable />

        <el-scrollbar height="400px" @scroll="handleScroll" :view-class="['virtual-scroll-container']">
            <div v-for="chapter in filteredChapters" :key="chapter.id" class="chapter-item"
                @click="$emit('select', chapter)">
                <span class="chapter-title">{{ chapter.title }}</span>
                <el-tag v-if="chapter.isFree" type="success" size="small">免费</el-tag>
                <span class="update-time">{{ formatTime(chapter.updateTime) }}</span>
            </div>
        </el-scrollbar>
    </el-card>
    <!-- 章节加载动画 -->
    <transition-group name="list">
        <div v-for="chapter in filteredChapters" :key="chapter.id">
            <!-- 内容 -->
        </div>
    </transition-group>
    <!-- 异常状态处理 -->
    <div v-if="!filteredChapters.length" class="empty-state">
        <el-empty description="未找到相关章节" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { debounce } from 'lodash-es'
import dayjs from 'dayjs'
// 添加虚拟滚动计算
const scrollTop = ref(0)
const itemHeight = 48 // 每个章节项高度
const visibleCount = computed(() => Math.ceil(400 / itemHeight))

const visibleChapters = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    return filteredChapters.value.slice(start, start + visibleCount.value + 2)
})


//触底加载更多​
const emit = defineEmits(['select', 'load-more']) // 添加 load-more 事件声明

// 合并滚动处理函数
const handleScroll = debounce(({ scrollTop: top, clientHeight, scrollHeight }) => {
    // 虚拟滚动逻辑
    scrollTop.value = top
    
    // 触底加载逻辑
    if (scrollHeight - (top + clientHeight) < 50) {
        emit('load-more') // 正确触发事件
    }
}, 200)

interface Chapter {
    id: string
    title: string
    isFree: boolean
    updateTime: Date
}
const props = defineProps<{
    chapters: Chapter[]
}>()
const searchKey = ref('')


// 防抖搜索处理（网页6、7、8）
const debouncedSearch = debounce((val: string) => {
    searchKey.value = val.trim()
}, 300)

// 计算属性过滤（网页5）
const filteredChapters = computed<Chapter[]>(() => {
    return props.chapters.filter(chapter =>
        chapter.title.toLowerCase().includes(searchKey.value.toLowerCase())
    )
})

// 时间格式化优化
const formatTime = (date: Date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<style lang="scss">
.chapter-list {

    // 滚动条美化（网页9）
    ::-webkit-scrollbar {
        width: 8px;

        &-thumb {
            background-color: #c1c1c1;
            border-radius: 4px;
        }
    }

    .chapter-item {
        @apply flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors;

        &:not(:last-child) {
            @apply border-b border-dashed border-gray-200;
        }

        .chapter-title {
            @apply flex-1 truncate;
            max-width: 60%;
        }

        .update-time {
            @apply text-sm text-gray-500 ml-auto;
        }
    }
}
</style>