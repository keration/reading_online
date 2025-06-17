<template>
  <el-container class="common-layout">
    <!-- 顶部导航 -->
    <el-header class="header-container" height="auto">
      <el-menu mode="horizontal" :router="true" class="header-menu">
        <el-menu-item index="/">我的主页</el-menu-item>
        <el-menu-item index="/bookshelf">我的书架</el-menu-item>
        <el-menu-item index="/bookupload">上传小说</el-menu-item>
        <div class="flex-grow" />
        <el-dropdown>
          <span class="user-info">
            <el-avatar :src="userInfo.avatar" />
            <span class="username">{{ userInfo.username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="activeTab = 'profile'">账户设置</el-dropdown-item>
              <el-dropdown-item divided @click="showPasswordDialog">修改密码</el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-menu>
    </el-header>

    <!-- 主内容区域 -->
    <el-main style="overflow: hidden">
      <el-card class="profile-card">
        <el-row :gutter="24">
          <!-- 左侧信息面板 -->
          <el-col :span="8">
            <el-card class="info-card">
              <el-upload
                class="avatar-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                @success="handleAvatarSuccess"
                :name="'avatar'"
                :headers="uploadHeaders">
                <el-image
                  :src="userInfo.avatar"
                  fit="cover"
                  class="avatar-img"
                  :preview-src-list="[user.avatar]">
                  <template #error>
                    <el-icon class="avatar-icon"><User /></el-icon>
                  </template>
                </el-image>
                <div class="avatar-mask">
                  <el-icon><EditPen /></el-icon>
                </div>
              </el-upload>

              <el-descriptions title="基本信息" :column="1">
                <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
                <el-descriptions-item label="注册时间">{{ formatTime(userInfo.createTime) }}</el-descriptions-item>
                <el-descriptions-item label="书架收藏">{{ user.bookshelfCount }}本</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>

          <!-- 右侧设置区域 -->
          <el-col :span="16">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="账户设置" name="profile">
                <el-form :model="form" label-width="100px">
                  <el-form-item label="电子邮箱">
                    <el-input v-model="form.email" placeholder="请输入有效邮箱地址" />
                  </el-form-item>
                  <el-form-item label="手机号码">
                    <el-input v-model="form.phone" placeholder="请输入手机号码" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="submitForm">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-card>

      <!-- 密码修改弹窗 -->
      <el-dialog
        v-model="showPwdDialog"
        title="修改密码"
        width="500px"
        :close-on-click-modal="false">
        <el-form
          :model="passwordForm"
          :rules="passwordRules"
          ref="passwordFormRef"
          label-width="100px">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              show-password
              placeholder="请输入当前密码" />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              placeholder="8-20位，含大小写字母和数字" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showPwdDialog = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordForm">确认修改</el-button>
        </template>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/UserStore'
import { ElMessage, type FormInstance } from 'element-plus'
import { User, EditPen } from '@element-plus/icons-vue'
import { storeToRefs } from 'pinia'
import { getAssetPath } from '@/utils/assetHelper'

// 用户状态管理
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const activeTab = ref('profile')
const showPwdDialog = ref(false)
const passwordFormRef = ref<FormInstance>()

// 用户数据
const user = computed(() => ({
  username: userInfo.value?.username || '未知用户',
  avatar: userInfo.value?.avatar || '/default-avatar.png',
  createTime: userInfo.value?.createTime || Date.now(),
  bookshelfCount: userInfo.value?.bookshelfCount || 0,
  email: userInfo.value?.email || '',
  phone: userInfo.value?.phone || ''
}))
// 表单数据
const form = reactive({
  email: user.value.email,
  phone: user.value.phone
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})


const uploadHeaders = computed(() => {
  const token = userStore.token // 获取 token
  return {
    Authorization: `Bearer ${token}`
  }
})
// 密码验证规则
const validatePassword = (rule: any, value: string, callback: Function) => {
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,20}$/.test(value)) {
    callback(new Error('需包含大小写字母和数字，长度8-20位'))
  } else {
    callback()
  }
}

const passwordRules = reactive({
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (_, v, cb) => 
      v === passwordForm.newPassword ? cb() : cb(new Error('两次输入不一致')),
      trigger: 'blur'
    }
  ]
})

// 初始化数据
onMounted(async () => {
  try {
    if (!userInfo.value) {
      await userStore.fetchProfile()
    }
    // 确保数据填充在profile加载之后
    form.email = user.value.email
    form.phone = user.value.phone
  } catch (error) {
    ElMessage.error('数据加载失败: ' + (error as Error).message)
    // 可以在此处添加重试逻辑
  }
})


// 提交基本信息
const submitForm = async () => {
  try {
    await userStore.updateProfile(form)
    ElMessage.success('资料更新成功')
  } catch (error) {
    ElMessage.error('更新失败：' + error.message)
  }
}

// 密码修改提交
const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async valid => {
    if (valid) {
      try {
        await userStore.updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功')
        showPwdDialog.value = false
        setTimeout(logout, 1500)
      } catch (error) {
        ElMessage.error('密码修改失败：' + error.message)
      }
    }
  })
}

// 头像上传处理
const uploadUrl = computed(() => {
  return `/api/auth/${userInfo.value.id}/avatar`
})
const beforeAvatarUpload = (file: File) => {
  // 统一文件类型验证
  const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
  if (!isImage) {
    ElMessage.error('仅支持JPG/PNG/GIF格式')
    return false
  }
  
  // 文件大小限制
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  
  return true
}

const handleAvatarSuccess = async (response: any) => {
  try {
    if (response.code === 200) {
      await userStore.updateAvatar(response.data.url)
      await userStore.fetchProfile()
      ElMessage.success('头像更新成功')
    } else {
      throw new Error(`服务器返回错误码：${response.code}`)
    }
  } catch (error) {
    ElMessage.error('头像更新失败: ' + (error as Error).message)
    console.error('头像上传错误详情:', error)
  }
}

// 退出登录
const logout = () => {
  userStore.logout()
  location.reload()
}

// 辅助函数
const formatTime = (timestamp: number | string) => {
  const date = new Date(typeof timestamp === 'string' ? 
    parseInt(timestamp) : timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showPasswordDialog = () => {
  passwordFormRef.value?.resetFields()
  showPwdDialog.value = true
}
</script>

<style lang="scss" scoped>
/* 全局样式文件添加 */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden; /* 禁止全局滚动条 */
}

.common-layout {
  height: 100vh;
  width: 100vw;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;

  .el-main {
    flex: 1;
    padding: 0 !important; /* 消除默认内边距 */
    overflow-y: auto; /* 允许内容区域单独滚动 */
  }

  .header-container {
    padding: 0;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);

    .header-menu {
      height: 60px;
      padding: 0 24px;
      border-bottom: none;

      .user-info {
        display: flex;
        align-items: center;
        padding: 0 16px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background: rgba(0,0,0,0.04);
          border-radius: 4px;
        }

        .username {
          margin-left: 8px;
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .profile-card {
    margin: 24px auto;
    max-width: 1200px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);

    .info-card {
      border: none;

      .avatar-uploader {
        position: relative;
        margin: 24px auto;
        width: 128px;
        height: 128px;

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .avatar-icon {
          font-size: 48px;
          color: #dcdfe6;
        }

        .avatar-mask {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.5);
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 50%;

          .el-icon {
            color: white;
            font-size: 24px;
          }
        }

        &:hover .avatar-mask {
          opacity: 1;
        }
      }

      :deep(.el-descriptions__title) {
        font-size: 16px;
        color: #303133;
        margin-bottom: 16px;
      }
    }

    .el-tabs {
      :deep(.el-tabs__item) {
        font-size: 16px;
        padding: 0 32px;
      }
    }

    .el-form {
      padding: 24px 32px;

      .el-form-item {
        margin-bottom: 24px;
      }

      .el-input {
        max-width: 360px;
      }
    }
  }

  .el-dialog {
    border-radius: 8px;

    .el-form {
      padding: 24px 32px;
    }
  }
}
</style>