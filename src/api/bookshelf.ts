// ===================== API 调用函数 =====================
import axios from 'axios';

const API_BASE_URL = '/api';

export const BookshelfApi = {

  addToBookshelf: (userId: number, novelId: number) => {
    return axios.post<void>(
      `${API_BASE_URL}/bookshelf/${novelId}`,
      null,  // POST请求无body时需显式传null
      {
        headers: {
          UserId: userId.toString()  // 确保header值为字符串类型
        }
      }
    );
  },

  getCategoryStats: (userId: number) => {
    return axios.get<Record<string, number>>(
      `${API_BASE_URL}/bookshelf/categories`,
      {
        headers: {
          UserId: userId.toString()
        }
      }
    );
  }
};

