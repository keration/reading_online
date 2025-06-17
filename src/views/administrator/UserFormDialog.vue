<template>
  <el-dialog v-model="visible" width="600px">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" :title="mode === 'edit' ? '编辑用户' : '新建用户'" placeholder="4-20位字母/数字" />
      </el-form-item>

      <el-form-item label="密码" prop="password" v-if="mode === 'add'">
        <el-input v-model="formData.password" type="password" show-password placeholder="6-20位字符" />
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="formData.gender">
          <el-option label="男" value="MALE" />
          <el-option label="女" value="FEMALE" />
        </el-select>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" type="email" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
interface FormData {
  username: string;
  password?: string;
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  email: string;
  phone: string | null;
}

const props = defineProps<{
  modelValue: boolean;
  data: FormData;
  mode: "edit" | "add";
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = ref(false)
watch(() => props.modelValue, (val) => {
  visible.value = val
})
const formRef = ref<FormInstance>()
const formData = ref<FormData>({ ...props.data })

// 当 props.data 或 visible 发生变化时重置表单数据（仅当可见时才更新）
watch(() => [props.data, visible.value], () => {
  if (visible.value) {
    formData.value = { ...props.data }
  }
}, { deep: true })

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { pattern: /^\w{4,20}$/, message: '4-20位字母/数字' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, max: 20, message: '6-20位字符' }
  ],
  nickname: [
    { required: true, message: '请输入昵称' },
    { min: 2, max: 20, message: '2-20位字符' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }
  ]
}

watch(() => props.data, (val) => {
  formData.value = { ...val }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})
const submit = async () => {
  try {
    await formRef.value?.validate()
    emit('submit', formData.value)
    visible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

defineExpose({ visible })
</script>