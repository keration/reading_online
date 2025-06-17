// ===================== 数据模型接口 =====================
export interface ChapterCreateDTO {
    title: string;
    content: string;
    sortOrder?: number;  // 根据实际业务逻辑决定是否必填
  }
  
  export interface ChapterSortDTO {
    chapterOrders: Array<{
      chapterId: number;
      newOrder: number;
    }>;
  }
  
  export interface ChapterListItemVO {
    chapterId: number;
    novelId: number;
    title: string;
    sortOrder: number;
    createdAt: string;
    wordCount?: number;
  }
  
  export interface ChapterDetailVO extends ChapterListItemVO {
    content: string;
    modifiedAt?: string;
    prevChapterId?: number | null;
    nextChapterId?: number | null;
  }
  
  // ===================== API 调用函数 =====================
  import axios from 'axios';
  
  const API_BASE_URL = '/api';
  
  export const NovelChapterApi = {
    // /​**​
    //  * 创建新章节
    //  * @param novelId 小说ID
    //  * @param dto 章节内容
    //  */
    createChapter: (novelId: number, dto: ChapterCreateDTO) =>
      axios.post<ChapterListItemVO>(
        `${API_BASE_URL}/novels/${novelId}/chapters`,
        dto
      ),
  
    // /​**​
    //  * 批量更新章节排序
    //  * @param novelId 小说ID
    //  * @param dto 包含章节ID与新顺序的列表
    //  */
    updateSortOrder: (novelId: number, dto: ChapterSortDTO) =>
      axios.put<void>(
        `${API_BASE_URL}/novels/${novelId}/chapters/sort-order`,
        dto
      ),
  
    // /​**​
    //  * 获取小说所有章节列表（简要信息）
    //  * @param novelId 小说ID
    //  */
    getChapters: (novelId: number) =>
      axios.get<ChapterListItemVO[]>(
        `${API_BASE_URL}/novels/${novelId}/chapters`
      ),
  
    // /​**​
    //  * 获取章节详情（包含完整内容）
    //  * @param novelId 小说ID
    //  * @param chapterId 章节ID
    //  */
    getChapterDetail: (novelId: number, chapterId: number) =>
      axios.get<ChapterDetailVO>(
        `${API_BASE_URL}/novels/${novelId}/chapters/${chapterId}`
      )
  };
  
  // ===================== 使用示例 =====================
  // 创建章节（小说ID=123）
  /* NovelChapterApi.createChapter(123, {
    title: "第一章 新的开始",
    content: "这是一个晴朗的早晨...",
    sortOrder: 1
  }).then(res => console.log('章节ID:', res.data.chapterId)); */
  
  // 批量更新排序
  /* NovelChapterApi.updateSortOrder(123, {
    chapterOrders: [
      { chapterId: 456, newOrder: 2 },
      { chapterId: 789, newOrder: 1 }
    ]
  }); */
  
  // 获取章节导航信息
  /* NovelChapterApi.getChapterDetail(123, 456)
    .then(res => {
      console.log('上一章ID:', res.data.prevChapterId);
      console.log('字数统计:', res.data.wordCount);
    }); */