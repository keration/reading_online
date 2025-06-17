<template>
  <div>
    <p class="title">作者列表管理</p>
    
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleCreate">新增作者</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="paginatedData" class="custom-table" style="width: 84%; margin: 50px auto;">
      <el-table-column prop="id" label="ID" width="150" align="center" />
      <el-table-column prop="name" label="作者名" width="120" align="center" />
      <el-table-column label="性别" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.gender === 'MALE' ? 'primary' : 'danger'">
            {{ genderMap[row.gender.toUpperCase() as 'MALE' | 'FEMALE'] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="bio" label="简介" show-overflow-tooltip />
      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination 
      v-model:current-page="page.current"
      v-model:page-size="page.size"
      :total="page.total"
      layout="prev, pager, next" 
      class="pagination"
    />

    <!-- 编辑/新建对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="作者名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formData.gender">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介" prop="bio">
          <el-input v-model="formData.bio" type="textarea" />
        </el-form-item>
        <el-form-item label="头像URL" prop="avatar_url">
          <el-input v-model="formData.avatar_url" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import instance from '@/utils/request' // 根据实际路径调整

interface Author {
  id: number
  name: string
  gender: 'MALE' | 'FEMALE'
  bio: string
  avatar_url: string
}

interface PageParams {
  current: number
  size: number
  total: number
}

// 响应式数据
const tableData = ref<Author[]>([])
const page = reactive<PageParams>({ current: 1, size: 5, total: 0 })
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isEditMode = ref(false)
const currentId = ref<number | null>(null)

// 表单数据
const formData = reactive({
  name: '',
  gender: 'MALE',
  bio: '',
  avatar_url: ''
})

// 验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入作者名称' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,20}$/, message: '1-20位字符（支持中英文/数字）' }
  ],
  gender: [{ required: true, message: '请选择性别' }],
  bio: [
    { required: true, message: '请输入简介' },
    { max: 100, message: '简介最多100个字符' }
  ],
//   avatar_url: [
//     { pattern: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, message: '请输入有效的URL地址' }
//   ]
})

// 计算属性
const paginatedData = computed(() => {
  const start = (page.current - 1) * page.size
  return tableData.value.slice(start, start + page.size)
})

const dialogTitle = computed(() => isEditMode.value ? '编辑作者' : '新建作者')

const genderMap = {
  MALE: '男',
  FEMALE: '女'
}

// 方法
const fetchAuthors = async () => {
  try {
    const res = await instance.get('/api/authors')
    tableData.value = res
    page.total = res.length
  } catch (error) {
    ElMessage.error('数据加载失败')
  }
}

const handleCreate = () => {
  isEditMode.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Author) => {
  isEditMode.value = true
  currentId.value = row.id
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该作者？', '警告', { type: 'warning' })
    await instance.delete(`/api/authors/${id}`)
    ElMessage.success('删除成功')
    fetchAuthors()
  } catch (error) {
    ElMessage.error('删除取消或失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  try {
    if (isEditMode.value && currentId.value) {
      await instance.put(`/api/authors/${currentId.value}`, formData)
      ElMessage.success('更新成功')
    } else {
      await instance.post('/api/authors', formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchAuthors()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  currentId.value = null
}

// 生命周期
onMounted(() => {
  fetchAuthors()
})
</script>

<style scoped>
.operation-bar {
  width: 84%;
  margin: 20px auto;
  text-align: left;
}

.pagination {
  margin-top: 20px;
  justify-content: center;
}
</style>