// ===================== 数据模型接口 =====================
export interface ProgressUpdateDTO {
    novelId: number;
    chapterId: number;
    progress: number;  // 阅读进度（百分比 0-100 或具体位置）
  }
  
  export interface ReadingHistoryVO {
    novelId: number;
    chapterId: number;
    novelTitle: string;
    chapterTitle: string;
    readAt: string;       // ISO 格式时间字符串
    progress: number;
    duration?: number;    // 阅读时长（秒）
  }
  
  // 分页响应结构（与之前定义保持一致）
  export interface PageResult<T> {
    total: number;
    currentPage: number;
    pageSize: number;
    data: T[];
  }
  
  // ===================== API 调用函数 =====================
  import axios from 'axios';
  
  const API_BASE_URL = '/api';
  
  export const ReadingHistoryApi = {
    // /​**​
    //  * 更新阅读进度
    //  * @param userId 用户ID（请求头）
    //  * @param dto 包含小说、章节和进度信息
    //  */
    updateProgress: (userId: number, dto: ProgressUpdateDTO) =>
      axios.put<void>(
        `${API_BASE_URL}/reading-history/progress`,
        dto,
        {
          headers: {
            UserId: userId.toString()
          }
        }
      ),
  
    // /​**​
    //  * 获取用户阅读历史
    //  * @param userId 用户ID（请求头）
    //  * @param params 分页参数（默认page=1, size=10）
    //  */
    getHistory: (userId: number, params?: { 
      page?: number; 
      size?: number 
    }) => {
      const requestParams = {
        page: 1,
        size: 10,
        ...params
      };
      
      return axios.get<PageResult<ReadingHistoryVO>>(
        `${API_BASE_URL}/reading-history`,
        {
          params: requestParams,
          headers: {
            UserId: userId.toString()
          }
        }
      );
    }
  };
  
  // ===================== 使用示例 =====================
  // 更新阅读进度（用户ID=123，小说456，章节789）
  /* ReadingHistoryApi.updateProgress(123, {
    novelId: 456,
    chapterId: 789,
    progress: 75
  }).then(() => console.log('进度已保存')); */
  
  // 获取第二页历史记录
  /* ReadingHistoryApi.getHistory(123, { page: 2 })
    .then(res => {
      console.log('最近阅读:', res.data.data[0].novelTitle);
    }); */
  
  // ===================== 增强功能建议 =====================
  // 自动记录阅读时长（前端计时器）
  let readTimer: NodeJS.Timer;
  
  const startReadingSession = (userId: number, novelId: number, chapterId: number) => {
    let seconds = 0;
    readTimer = setInterval(() => {
      seconds++;
      // 每分钟同步一次时长
      if (seconds % 60 === 0) {
        ReadingHistoryApi.updateProgress(userId, {
          novelId,
          chapterId,
          progress: getCurrentProgress() // 需实现获取当前进度
        });
      }
    }, 1000);
  };
  
  const stopReadingSession = () => {
    clearInterval(readTimer);
  };