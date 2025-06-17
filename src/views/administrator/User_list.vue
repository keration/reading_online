<template>
  <div class="user-management">
    <!-- 顶部操作栏 -->
    <div class="header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="openDialog">新增用户</el-button>
    </div>

    <!-- 用户表格 -->
    <el-table :data="users" v-loading="loading" stripe style="width: 96%">
      <el-table-column prop="id" label="ID" width="100" align="center" />
      <el-table-column prop="username" label="用户名" min-width="150" />
      <el-table-column prop="nickname" label="昵称" min-width="150" />

      <el-table-column label="性别" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.gender === 'MALE' ? 'primary' : 'danger'">
            {{ genderLabels[row.gender as 'MALE' | 'FEMALE'] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="email" label="邮箱" min-width="200" />
      <el-table-column prop="phone" label="手机号" min-width="150" />

      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="updateStatus(row)" />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="confirmDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.size" :total="pagination.total"
      :page-sizes="[5, 10, 20]" layout="total, sizes, prev, pager, next" @change="fetchUsers" />

    <!-- 用户表单对话框 -->
    <user-form-dialog v-model="showDialog" :data="formData" :mode="formData.mode" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserFormDialog from './UserFormDialog.vue'
import { storeToRefs } from 'pinia'
import { useUserListStore } from '@/stores/userListStore'

// 类型定义
interface User {
  id: number
  username: string
  nickname: string
  gender: 'MALE' | 'FEMALE'
  email: string
  phone: string | null // 允许 null
  enabled: 0 | 1       // 保持和后端接口一致
  createTime: string   // 添加缺失字段
  mode: 'add' | 'edit'
}


const showDialog = ref(false)
const formData = reactive<User>({
  id: 0,
  username: '',
  nickname: '',
  gender: 'MALE',
  email: '',
  phone: '',
  enabled: 1,
  createTime: '',
  mode: 'add'
})
const userStore = useUserListStore()
const { users, loading, pagination, genderLabels } = storeToRefs(userStore)

import { cloneDeep } from 'lodash-es'

const defaultFormData: User = {
  id: 0,
  username: '',
  nickname: '',
  gender: 'MALE',
  email: '',
  phone: '',
  enabled: 1,
  createTime: '',
  mode: 'add'
}


const openDialog = (user?: User | null) => {
  if (user && 'id' in user) {
    formData.mode = 'edit'
    const userData = cloneDeep(user)
    Object.assign(formData, userData)
  } else {
    // 使用默认对象进行全量赋值，避免残留数据
    Object.assign(formData, defaultFormData)
    console.log('Form data reset to add mode:', { ...formData })
  }
  showDialog.value = true
}

// 业务逻辑简化为调用 store 方法
const fetchUsers = () => userStore.fetchUsers()

const confirmDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该用户？此操作不可逆！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await userStore.deleteUser(id)
    ElMessage.success('删除成功')
  } catch { }
}

const updateStatus = async (user: User) => {
  try {
    await userStore.updateUserEnabled(user.id, user.enabled)
    ElMessage.success('状态已更新')
  } catch {
    user.enabled = user.enabled ? 0 : 1
  }
}

const handleSubmit = async (formData: User) => {
  try {
    if (formData.mode === 'add') {
      await userStore.createUser(formData);
    } else {
      await userStore.updateUser(formData);
    }
    ElMessage.success('操作成功')
    showDialog.value = false
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 初始化时直接调用
userStore.fetchUsers()
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 2%;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
  padding-right: 2%;
}
</style>