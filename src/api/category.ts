// ===================== 数据模型接口 =====================
export interface Category {
    id: number;
    name: string;
    description?: string;  // 可选属性对应Java的nullable
    createdAt?: string;    // 根据实际POJO属性补充
    deletedAt?: string | null;
  }
  
  // ===================== API 调用函数 =====================
  import axios from 'axios';
  
  const API_BASE_URL = '/api';
  
  export const CategoryApi = {
    
    //  创建分类
    //  @param params 查询参数（注意POST请求使用params而非body）
     
    createCategory: (params: {
      name: string;
      description?: string;
    }) => axios.post<Category>(`${API_BASE_URL}/categories`, null, {
      params  // 对应Spring的@RequestParam
    }),
  
    
    //   删除分类（软删除）
    //   @param id 分类ID
     
    deleteCategory: (id: number) => 
      axios.delete<void>(`${API_BASE_URL}/categories/${id}`),
  
    
    //   为分类添加标签
    //   @param categoryId 分类ID
    //   @param tagId 标签ID
     
    addTagToCategory: (categoryId: number, tagId: number) =>
      axios.post<void>(
        `${API_BASE_URL}/categories/${categoryId}/tags/${tagId}`
      ),
  
    
    //   获取所有有效分类（已自动过滤删除的）
     
    getAllCategories: () => 
      axios.get<Category[]>(`${API_BASE_URL}/categories`)
  };
  
  // ===================== 使用示例 =====================
  // 创建分类（带描述）
  // CategoryApi.createCategory({ name: "科幻", description: "科幻小说分类" })
  //   .then(res => console.log('创建成功:', res.data.id));
  
  // 添加标签到分类
  // CategoryApi.addTagToCategory(123, 456)
  //   .then(() => console.log('标签添加成功'));
  
  // 获取所有分类
  // CategoryApi.getAllCategories()
  //   .then(res => console.log('分类列表:', res.data));