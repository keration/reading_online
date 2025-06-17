<template>
  <div class="auth-background">
    <div class="auth-container">
      <div class="toggle-buttons">
        <el-button link :class="{ active: isLogin }" @click="switchToLogin">
          登录
        </el-button>
        <el-button link :class="{ active: !isLogin }" @click="switchToRegister">
          注册
        </el-button>
      </div>

      <el-form v-if="isLogin" :model="loginForm" ref="loginFormRef" :rules="loginRules" label-width="100px">
        <div class="form-section">
          <el-form-item label="账号" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入账号" prefix-icon="el-icon-user"></el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="loginForm.password" placeholder="请输入密码"
              prefix-icon="el-icon-lock"></el-input>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="login">登录</el-button>
            <el-button link @click="handleForgotPassword">忘记密码?</el-button>
          </el-form-item>
          <el-divider>其他登录方式</el-divider>
          <div class="social-login">
            <el-button link @click="loginWithWechat">
              微信登录
            </el-button>
            <el-button link @click="loginWithQQ">
              QQ登录
            </el-button>
          </div>
        </div>
      </el-form>

      <el-form v-if="!isLogin" :model="registerForm" ref="registerFormRef" :rules="registerRules" label-width="100px"
        :label-position="labelPosition">
        <div class="form-section">
          <el-form-item label="账号" prop="username">
            <el-input v-model="registerForm.username" placeholder="请输入账号" prefix-icon="el-icon-user"></el-input>
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="el-icon-email"></el-input>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="registerForm.password" placeholder="请输入密码"
              prefix-icon="el-icon-lock"></el-input>
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input type="password" v-model="registerForm.confirmPassword" placeholder="确认密码"
              prefix-icon="el-icon-lock"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="success" @click="Register">注册</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { useRouter } from 'vue-router';
import axios from 'axios';
import type { FormItemRule } from 'element-plus'
import instance from '@/utils/request';
import { useWindowSize } from '@vueuse/core'
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()
const router = useRouter()

interface ServerError {
  message?: string;
  errors?: {
    email?: string;
    phone?: string;
  };
}

const { width } = useWindowSize()
const labelPosition = computed(() =>
  width.value > 768 ? 'right' : 'top'
)

const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();

const isLogin = ref(true);
const rememberMe = ref(false);
//登录表单
const loginForm = reactive({
  username: '',
  password: ''
});
//注册表单
const registerForm = reactive({
  username: '',
  password: '',
  email: '',
  confirmPassword: ''
});

const validateConfirmPassword = (rule: any, value: string, callback: Function) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};
//登录验证
const loginRules = {
  username: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    {
      // pattern: /^(?:\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+)|(1[3-9]\d{9})$/,
      message: '请输入有效邮箱或手机号',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 15, message: '长度6-15位', trigger: 'blur' }
  ]
};
//注册验证
const registerRules: Record<string, FormItemRule[]> = {
  username: [
    { required: true, message: '请输入登录账号', trigger: 'blur' },
    {
      pattern: /^(?:\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+)|(1[3-9]\d{9})$/,
      message: '请输入有效邮箱或手机号',
      trigger: 'blur'
    }
  ] as FormItemRule[],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      // pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/,
      message: '需包含字母和数字',
      trigger: 'blur'
    }
  ] as FormItemRule[],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ] as FormItemRule[]
};
//登录注册切换
const switchToLogin = () => {
  isLogin.value = true;
  loginFormRef.value?.resetFields();
};

const switchToRegister = () => {
  isLogin.value = false;
  registerFormRef.value?.resetFields();
};

const login = async () => {
  try {
    await loginFormRef.value?.validate();

    const userData = await instance.post('/auth/login', {
      username: loginForm.username,
      password: loginForm.password
    });

    const {
      token = '',
      username = '未知用户',
      id = 0,
      avatarUrl = '/src/assets/default-avatar.png',
      roles = ['user']
    } = userData.data.data || {};

    if (!token) throw new Error('登录凭证缺失');

    const user = {
      username,
      id,
      avatar: avatarUrl,
      roles: Array.isArray(roles) ? roles : ['user']
    };

    userStore.setToken(token);
    userStore.setUserData(user);

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    if (rememberMe.value) {
      localStorage.setItem('remembered_user', username);
    }

    ElMessage.success('登录成功');

    if (userData.code === 200) {
  const roles = userData.data.data.roles || [];

  if (Array.isArray(roles)) {
    if (roles.includes('ROLE_USER')) {
      router.push('/');
    } else {
      router.replace('/indexa/userlist');
    }
  } else {
    router.replace('/indexa/userlist');
  }
}
  } catch (error) {
    ElMessage.error(error.message || '登录失败');
  }
};

const Register = async () => {
  try {
    // 1. 增强前端字段验证
    await registerFormRef.value?.validate();

    // 2. 明确校验邮箱/手机号格式
    const username = registerForm.username;
    const isEmail = username.includes('@');
    const isPhone = /^1[3-9]\d{9}$/.test(username);

    if (!isEmail && !isPhone) {
      throw new Error('用户名必须是有效的邮箱或手机号');
    }

    // 3. 构建请求参数
    const params = {
      username: registerForm.username,
      password: registerForm.password,
      email: registerForm.email
    };

    // 4. 发送请求并处理响应
    const { data } = await instance.post('/auth/register', params);

    ElMessage.success('注册成功');
    switchToLogin();
  } catch (error: unknown) {
    let errorMessage = '注册失败';

    // 处理前端抛出的 Error 对象
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // 处理 Axios 错误
    else if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as ServerError;
      switch (error.response?.status) {
        case 400:
          errorMessage = responseData?.message || '请求参数不合法';
          if (responseData?.errors?.email) errorMessage = '邮箱格式不正确';
          if (responseData?.errors?.phone) errorMessage = '手机号无效';
          break;
        case 409:
          errorMessage = '该邮箱或手机号已被注册';
          break;
        case 500:
          errorMessage = '服务器开小差了，请稍后再试';
          break;
      }
    }
    // 其他类型错误
    else {
      errorMessage = '未知错误类型';
    }
  }
};

const handleForgotPassword = () => {

};


const loginWithWechat = () => {
  const WECHAT_APPID = import.meta.env.VITE_WECHAT_APPID;
  const REDIRECT_URI = encodeURIComponent(`${location.origin}/oauth/callback`);
  window.location.href = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APPID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=snsapi_login#wechat_redirect`;
};

const loginWithQQ = () => {
  const QQ_APPID = import.meta.env.VITE_QQ_APPID;
  const REDIRECT_URI = encodeURIComponent(`${location.origin}/oauth/callback`);
  window.location.href = `https://graph.qq.com/oauth2.0/authorize?client_id=${QQ_APPID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=get_userinfo`;
};


</script>

<style lang="scss" scoped>

@use "sass:color";
@use "sass:list";

// 1. 变量管理系统（建议迁移到独立文件）
$primary-color: #4f46e5;
$glass-bg: rgba(255, 255, 255, 0.9);
$transition-duration: 0.3s;
$shadow-primary: 0 8px 32px rgba(103, 194, 255, 0.3);

// 2. 混合器复用（保持不变）
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin smooth-transition($properties: all) {
  transition: $properties $transition-duration cubic-bezier(0.4, 0, 0.2, 1);
}

// 3. 嵌套结构优化（保持不变）
.auth-background {
  @include flex-center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) fixed;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    // background: url('../assets/1735544929106.jpg') center/cover;
    filter: blur(12px) brightness(0.8);
    z-index: 0;
  }
}

.auth-container {
  position: relative;
  background: $glass-bg;
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: $shadow-primary;

  z-index: 1;

  
  @include smooth-transition(transform box-shadow);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba($primary-color, 0.4);
  }
}

.toggle-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center; // 水平居中关键
  align-items: center; // 垂直居中补充

  .el-button {
    border: none;
    background: transparent;
    padding: 1rem;
    font-size: 1.1rem;
    color: #4a5568;
    position: relative;
    margin: 0 !important; // 清除默认边距[2](@ref)
    padding: 12px 24px !important; // 统一内边距
    @include smooth-transition;

    &.active {
      color: $primary-color;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 3px;
        background: $primary-color;
        border-radius: 2px;
      }
    }
  }
}

.social-login {
  @include flex-center;
  gap: 1rem;
  margin-top: 2rem;

  .el-button {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    padding: 0;
    @include flex-center;
    @include smooth-transition(transform);

    &:hover {
      transform: translateY(-2px);
    }

    // 5. 颜色函数更新
    &--primary {
      background: #4267B2;
    }

    &--danger {
      background: #db4437;
    }

    &--warning {
      background: color.adjust(#333, $lightness: 15%);
    }
  }
}

// 6. 层级阴影系统
@function generate-shadows($base-color, $levels: 3) {
  $shadows: (
  );

@for $i from 1 through $levels {
  $shadows: list.append($shadows,
      0 ($i * 2px) ($i * 4px) rgba($base-color, 0.1 * $i),
      $separator: comma);
}

@return $shadows;
}

// 修复深度选择器嵌套问题
:deep(.el-divider__text) {
  margin: 20px 0;
  border-color: rgba(226, 232, 240, 0.6);
  background-color: rgba(231, 237, 245, 0.6);

  // 避免嵌套组件选择器后缀
  @at-root .el-divider__text {
    // background: $glass-bg;

    color: #64748b;
    font-size: 0.875rem;
    padding: 0 1rem;
    box-shadow: generate-shadows(#000, 2);
  }
}
</style>