// ===================== 数据模型接口 =====================
export interface TagCreateRequest {
    name: string;
    description?: string;  // 根据实际业务需求决定是否必填
  }
  
  export interface TagResponse {
    id: number;
    name: string;
    description: string;
    createdAt: string;     // 根据实际POJO属性补充
    updatedAt?: string;
  }
  
  // ===================== API 调用函数 =====================
  import axios from 'axios';
  
  const API_BASE_URL = '/api';
  
  export const TagApi = {
    // /​**​
    //  * 创建新标签
    //  * @param request 标签基本信息
    //  */
    createTag: (request: TagCreateRequest) =>
      axios.post<TagResponse>(`${API_BASE_URL}/tags`, request),
  
    // /​**​
    //  * 删除标签
    //  * @param id 标签ID
    //  */
    deleteTag: (id: number) =>
      axios.delete<void>(`${API_BASE_URL}/tags/${id}`),
  
    // /​**​
    //  * 更新标签信息（注意：使用URL查询参数）
    //  * @param id 标签ID
    //  * @param name 新标签名称
    //  * @param description 新描述
    //  */
    updateTag: (id: number, name: string, description: string) =>
      axios.put<TagResponse>(
        `${API_BASE_URL}/tags/${id}`,
        null,  // PUT请求无body
        {
          params: { name, description }  // 对应@RequestParam
        }
      ),
  
    // /​**​
    //  * 获取所有标签列表
    //  */
    getAllTags: () =>
      axios.get<TagResponse[]>(`${API_BASE_URL}/tags`),
  
    // /​**​
    //  * 获取单个标签详情
    //  * @param id 标签ID
    //  */
    getTag: (id: number) =>
      axios.get<TagResponse>(`${API_BASE_URL}/tags/${id}`)
  };
  
  // ===================== 使用示例 =====================
  // 创建标签
  // TagApi.createTag({ name: "武侠", description: "传统武侠小说" })
  //   .then(res => console.log('创建标签ID:', res.data.id));
  
  // 更新标签（ID=123）
  // TagApi.updateTag(123, "仙侠", "修真仙侠类小说")
  //   .then(res => console.log('更新时间:', res.data.updatedAt));
  
  // 获取标签云
  // TagApi.getAllTags()
  //   .then(res => console.log('标签总数:', res.data.length));