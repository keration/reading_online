<!-- 阅读器 -->
<template>
  <div class="reader-container" :style="readerStyles">

    <el-drawer v-model="showToc" title="章节目录" direction="ltr" size="300px">
      <div class="toc-list">
        <div v-for="chapter in novelStore.chapters" :key="chapter.chapterOrder" class="toc-item"
          :class="{ active: chapter.chapterOrder === chapterId }" @click="handleChapterChange(chapter.chapterOrder)">
          {{ chapter.chapterTitle }}
        </div>
      </div>
    </el-drawer>
    <!-- 设置面板 -->
    <el-drawer v-model="showSettings" title="阅读设置" direction="rtl">
      <div class="settings-panel">
        <div class="setting-item">
          <label>字体大小</label>
          <el-slider v-model="settings.fontSize" :min="12" :max="36" />
        </div>

        <div class="setting-item">
          <label>字体类型</label>
          <el-select v-model="settings.fontFamily">
            <el-option v-for="font in fontOptions" :key="font" :value="font" :label="font"
              :style="{ fontFamily: font }" />
          </el-select>
        </div>

        <div class="setting-item">
          <label>行间距</label>
          <el-slider v-model="settings.lineHeight" :min="1.2" :max="2.5" :step="0.1"
            :format-tooltip="(val: number) => val.toFixed(1)" />
        </div>


        <div class="setting-item">
          <label>背景颜色</label>
          <el-color-picker v-model="settings.backgroundColor" />
        </div>

        <div class="setting-item">
          <label>文字颜色</label>
          <el-color-picker v-model="settings.textColor" />
        </div>
      </div>
    </el-drawer>

    <!-- 工具栏 -->
    <div class="toolbar" style="flex-shrink: 0; padding: 12px 20px;">
      <el-button type="info" @click="handleBack">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回
      </el-button>

      <el-button type="primary" @click="showToc = true">
        <el-icon>
          <Menu />
        </el-icon>
        目录
      </el-button>

      <el-button type="primary" @click="showSettings = true">
        <el-icon>
          <Setting />
        </el-icon>
        设置
      </el-button>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <div class="content" :style="contentStyles">
        <h1>{{ chapterData.title }}</h1>
        <div v-html="formatContent(chapterData.content)" class="formatted-content"></div>

        <!-- 评论区 -->
        <comment-section :novel-id="novelId" :chapter-id="chapterId" />

        <div class="navigation-buttons">
          <el-button @click="prevChapter">上一章</el-button>
          <el-button @click="nextChapterClick">下一章</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, toRef, toRefs } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useReadStore } from '@/stores/readerStore'
import { useNovelStore } from '@/stores/novelStore'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useCommentsStore } from '@/stores/commentStore'
import CommentSection from '@/views/novel/CommentSection.vue'


const route = useRoute()
const router = useRouter()
const novelStore = useNovelStore()
const readStore = useReadStore()
const showSettings = ref(false) 
const commentsStore = useCommentsStore()

const handleBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/') // 无历史记录时返回首页
  }
}
const chapters = computed(() => {
  if (!Array.isArray(novelStore.chapters)) {
    console.error('章节数据非数组:', novelStore.chapters);
    return [];
  }

  // ✅ 过滤掉 chapterOrder <= 0 的章节（如前言）
  return novelStore.chapters.filter(ch => ch.chapterOrder > 0);
});
const {
  readerSettings: settings,
} = storeToRefs(readStore)


const { prevChapter, nextChapter, loadChapter } = readStore;

const nextChapterClick = async () => {
  await nextChapter();
};

const props = defineProps({
  novelId: { type: Number, required: true },
  chapterId: { type: Number, required: true }
});

const readerStyles = computed(() => ({
  backgroundColor: settings.value.backgroundColor,
  color: settings.value.textColor
}))

const contentStyles = computed(() => ({
  fontSize: `${settings.value.fontSize}px`,
  fontFamily: settings.value.fontFamily,
  lineHeight: settings.value.lineHeight,
  color: settings.value.textColor,
  backgroundColor: settings.value.backgroundColor
}))

function formatContent(content: string): string {
  if (!content) return '';
  // 将 \r\n\r\n 拆分为段落，并包裹 <p> 标签
  const paragraphs = content.split(/\r?\n\r?\n/);
  return paragraphs.map(p => `<p>${p.replace(/\r?\n/g, '<br>')}</p>`).join('');
}

// 从路由中获取 novelId
const novelId = computed(() => Number.parseInt(route.params.novelId as string, 10) || 0)
const chapterId = computed(() => Number.parseInt(route.params.chapterId as string, 10) || 0)
const emit = defineEmits(['chapter-change'])

// 字体选项
const fontOptions = [
  'Microsoft YaHei',
  'SimSun',
  'SimHei',
  'KaiTi',
  'Arial',
  'Times New Roman'
]

const loadData = async () => {
  try {
    if (!novelStore.chapters?.length) {
      await novelStore.getChaptersByNovelId(novelId.value)
    }
    // 1. 加载章节内容
    const res = await readStore.loadChapter(novelId.value, chapterId.value)
    Object.assign(chapterData, res) // 响应式更新数据

    // 3. 加载评论
    await commentsStore.fetchComments(novelId.value, chapterId.value)
  } catch (err) {
    ElMessage.error('数据加载失败: ' + (err instanceof Error ? err.message : String(err)))
  }
}

// --- 监听路由变化 ---
watch(
  [() => route.params.novelId, () => route.params.chapterId],
  ([newNovelId, newChapterId], [oldNovelId, oldChapterId]) => {
    // 仅在有效变化时触发
    if (
      Number(newNovelId) !== Number(oldNovelId) ||
      Number(newChapterId) !== Number(oldChapterId)
    ) {
      loadData()
    }
  },
  { immediate: true }
)


const chapterData = reactive({
  chapterTitle: '',
  content: ''
})


const showToc = ref(false)

// 修改章节切换样式
const activeChapterId = ref(chapterId.value)
watch(chapterId, (newVal) => {
  activeChapterId.value = newVal
})

// 修改章节点击处理
const handleChapterChange = (newChapterId: number) => {
  showToc.value = false // 关闭目录抽屉
  router.push({
    name: 'novel-reader',
    params: {
      novelId: novelId.value,
      chapterId: newChapterId
    },
    query: { t: Date.now() }
  })
}


// 计算阅读进度（基于滚动位置）
const calculateProgress = () => {
  const contentEl = document.querySelector('.content') as HTMLElement
  if (!contentEl) return 0

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = contentEl.scrollHeight - window.innerHeight
  if (scrollHeight <= 0) return 0

  const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100))
  return Math.round(progress)
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleScroll = () => {
  const progress = calculateProgress()
  updateReadingStatus(progress)
}


onMounted(() => {
})
onBeforeUnmount(() => {
  readStore.abortController?.abort() // 取消未完成的请求
})
</script>

<style scoped>
.reader-container {
  width: 96vw;
  padding: 20px;
  transition: all 0.3s ease;

}

.formatted-content {
  white-space: normal;
  /* 不再使用 pre-wrap */
  word-break: break-word;
}

.formatted-content p {
  text-indent: 2em;
  /* 首行缩进两个字符 */
  margin-bottom: 1em;
  /* 段落之间留出间距 */
  line-height: 1.8;
  /* 可与设置面板同步 */
}

.toolbar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.content-wrapper {
  overflow-y: auto;
  scroll-behavior: smooth;
  /* 平滑滚动 */

}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  line-height: 1.8;
  text-align: justify;
  hyphens: auto;
  /* 自动断字 */
}

.settings-panel {
  padding: 20px;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;

  .toc-list {
    padding: 10px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .toc-item {
    padding: 12px 15px;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 4px;
    margin-bottom: 4px;
  }

  .toc-item:hover {
    background-color: var(--el-color-primary-light-9);
  }

  .toc-item.active {
    background-color: var(--el-color-primary-light-8);
    font-weight: 500;
    color: var(--el-color-primary);
  }

  .navigation-buttons {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }
}
</style>