// readerstore.ts
import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { debounce, } from 'lodash-es'
import { ElMessage } from 'element-plus'
import instance from '@/utils/request'
import axios, { AxiosError } from 'axios'
import { useNovelStore } from '@/stores/novelStore'

import router from '@/router'

interface Chapter {
    id: number
    title: string
    content: string
}


export const useReadStore = defineStore('reader', () => {

    const novelData = reactive<{ chapters: Chapter[] }>({ chapters: [] })
    const currentChapterId = ref<number>(0)
    const chaptersLoading = ref(false)
    const abortController = ref<AbortController | null>(null)

    // 阅读设置
    const readerSettings = ref({
        fontSize: 16,
        fontFamily: 'Microsoft YaHei',
        backgroundColor: '#f5f5f5',
        textColor: '#333333',
        lineHeight: 1.6
    })

    // 修改 updateChapter 方法
    // 更新章节方法（增强路由同步）
    const updateChapter = async (chapterId: number) => {
        try {
            // 获取当前路由参数
            const { novelId: routeNovelId } = getRouteParams()
             currentChapterId.value = chapterId ;

            console.log(routeNovelId,router.currentRoute.value.params);
            //  currentChapterId.value = chapterId Number(router.currentRoute.value.params.chapterId);
            // 取消前序请求
            if (abortController.value) {
                abortController.value.abort()
            }

            // 发起新请求
            // await loadChapter(routeNovelId, chapterId)

            // 确保路由跳转完成后再更新状态
            await router.push({
                 name: 'novel-reader', // 必须使用命名路由[6](@ref)
                params: {
                    novelId: routeNovelId,
                    chapterId
                },

            })

        } catch (err) {
            if (err.name !== 'NavigationDuplicated') {
                handleError(err)
            }
        }
    }

    // 章节导航
    const prevChapter = async () => {
        console.log("prev");
        const novelStore = useNovelStore()

        currentChapterId.value =  Number(router.currentRoute.value.params.chapterId);

        try {
            // 确保章节数据已加载
            if (!Array.isArray(novelStore.chapters) || novelStore.chapters.length === 0) {
                await loadChapter(novelId.value,chapterId.value)
            }

            // 获取有效章节列表（过滤无效数据）
            const validChapters = novelStore.chapters.filter(
                ch => ch?.id && typeof ch.id === 'number'
            )

            const currentIndex = validChapters.findIndex(
                ch => ch.id === currentChapterId.value
            )

            if (currentIndex > 0) {
                const prevId = validChapters[currentIndex - 1].id
                await updateChapter(prevId)
                scrollToTop() 
            } else {
                ElMessage.info('已经是第一章')
            }
        } catch (err) {
            handleError(err)
        }
    }

    const nextChapter = async () => {
        const novelStore = useNovelStore()


        currentChapterId.value =  Number(router.currentRoute.value.params.chapterId);


        try {
            // 确保章节数据已加载
            if (!Array.isArray(novelStore.chapters) || novelStore.chapters.length === 0) {
                await loadChapter(novelId.value,chapterId.value)
            }

            // 获取有效章节列表（过滤无效数据）
            const validChapters = novelStore.chapters.filter(
                ch => ch?.id*1
            )

            const currentIndex = validChapters.findIndex(
                ch => ch.id*1 === currentChapterId.value*1
            )

            console.log(validChapters,  novelStore.chapters)

            if (currentIndex < validChapters.length - 1) {
                const nextId = validChapters[currentIndex + 1].id

                await updateChapter(nextId)
                scrollToTop()
            } else {
                ElMessage.info('已经是最后一章')
            }
        } catch (err) {
            handleError(err)
        }
    }

    const getRouteParams = () => ({
        novelId: Number(router.currentRoute.value.params.novelId),
        chapterId: Number(router.currentRoute.value.params.chapterId)
    })

    const currentChapter = computed(() => {
        // 四级校验防护
        const chapters = Array.isArray(novelData?.chapters) ? novelData.chapters : [];
        const validChapters = chapters.filter(ch =>
            ch?.id && typeof ch.id === 'number'
        );

        return validChapters.find(ch => ch.id === currentChapterId.value) ?? {
            id: 0,
            title: '加载中...',
            content: '<p>内容暂不可用</p>'
        };
    });


    let cleanData = reactive<Chapter>({
        id: 0,
        title: '',
        content: ''
    });
    // 章节加载（增强版）
    const loadChapter = async (novelId: number, chapterId: number) => {
        try {
            if (abortController.value) {
                abortController.value.abort()
            }
            abortController.value = new AbortController()

            const { novelId: routeNovelId, chapterId: routeChapterId } = getRouteParams()

            if (routeNovelId !== novelId || routeChapterId !== chapterId) {
                console.warn('路由参数与请求参数不一致，强制同步');
                await router.replace({
                    params: { novelId, chapterId },
                    query: { t: Date.now() }
                }).catch(err => {
                    if (err.name !== 'NavigationDuplicated') throw err
                });
                return;
            }

            chaptersLoading.value = true;
            const response = await instance.get<Chapter>(
                `/api/chapter/${novelId}/${chapterId}/content`, {
                signal: abortController.value!.signal,
                timeout: 10000
            });

            const rawData = JSON.parse(JSON.stringify(response));
            cleanData = Object.assign(Object.create(null), rawData);
            const chapterData = {
                id: rawData.id,
                title: rawData.chapterTitle,
                content: rawData.content
            }
            updateChapterContent(cleanData);
            scrollToTop();
            return chapterData
        } catch (err) {
            handleError(err)
            throw err
        } finally {
            chaptersLoading.value = false;
            abortController.value = null
        }
    }

    // 私有方法
    const updateChapterContent = (data: Chapter) => {
        const index = novelData.chapters.findIndex(ch => ch.id === data.id)
        if (index === -1) {
            novelData.chapters.push(reactive(data))
        } else {
            Object.assign(novelData.chapters[index], data)
        }
    }

    const scrollToTop = debounce(() => {
        const wrapper = document.querySelector('.content-wrapper')
        if (wrapper) wrapper.scrollTo({ top: 0, behavior: 'smooth' })
    }, 300)

    const handleError = (err: unknown) => {
        if (axios.isCancel(err)) {
            console.log('请求已取消')
        } else if (err instanceof Error) {
            const message = (err as AxiosError).response?.data?.message || err.message
            ElMessage.error(message)

            // 认证失败处理
            if ((err as AxiosError).response?.status === 401) {
                localStorage.removeItem('authToken')
                router.push('/login')
            }
        } else {
            ElMessage.error('未知错误类型')
            console.error(err)
        }
    }

    return {
        novelData,
        currentChapterId,
        chaptersLoading,
        readerSettings,
        currentChapter,
        loadChapter,
        prevChapter,
        nextChapter,
        updateChapter
    }
}, {
    persist: {
        storage: localStorage,
        paths: ['readerSettings'],
        beforeRestore: (ctx: { store: { $state: { currentChapterId: number } } }) => {
            const { chapterId } = router.currentRoute.value.params
            ctx.store.$state.currentChapterId = Number(chapterId) || 0
        }
    }
}
);