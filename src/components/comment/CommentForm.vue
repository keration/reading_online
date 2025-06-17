<!-- 评论发布表单 -->
<template>
  <el-form :model="form" :rules="rules" ref="formRef">
    <el-form-item prop="content">
      <el-input v-model="form.content" @input="(v: string) => saveDraft(v)" type="textarea" :rows="3"
        placeholder="写下你的评论..." :disabled="commentStore.submitting" show-word-limit :maxlength="500" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" :loading="commentStore.submitting" :disabled="!form.content.trim()" @click="submit">
        {{ commentStore.submitting ? '提交中...' : '发表评论' }}
      </el-button>

      <el-tooltip content="自动保存草稿">
        <el-icon v-if="commentStore.draftContent" class="ml-2">
          <DocumentAdd />
        </el-icon>
      </el-tooltip>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { debounce } from 'lodash-es'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import api from '@/api'
import { useCommentStore } from '@/stores/comment'
import type { FormItemRule } from 'element-plus'

interface ValidateResponse {
  valid: boolean;
}

const formRef = ref<FormInstance>()
const commentStore = useCommentStore()


const form = reactive({
  content: commentStore.draftContent
})

const rules = {
  content: [
    {
      validator: (
        _rule: unknown,
        value: string,
        callback: (error?: string | Error) => void
      ) => {
        // 同步验证
        if (!value.trim()) return callback('评论内容不能为空')
        if (value.length > 500) return callback('超过500字限制')
        if (/[<>]/.test(value)) return callback('包含非法字符')

        // 异步验证
        api.post<ValidateResponse>('/validate', { text: value })
          .then(({ data }) => {
            data.valid ? callback() : callback('包含敏感词')
          })
          .catch(() => callback('验证失败'))
      },
      trigger: ['input', 'blur']
    } as FormItemRule // 类型断言
  ]
} satisfies Record<string, FormItemRule[]> // 类型约束


const saveDraft = debounce((value: string) => {
  localStorage.setItem('commentDraft', value)
  commentStore.draftContent = value
}, 1000)

const submit = async () => {
  try {
    await formRef.value?.validate()
    await commentStore.submitComment(form.content)
    ElMessage.success('提交成功')
    form.content = ''
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
  }
}
</script>

<style lang="scss">
::v-deep(.el-form-item__error) {
  transition: opacity 0.3s;
  padding-top: 4px;
  font-size: 12px;

  &:before {
    content: '⚠️ ';
  }
}
</style>