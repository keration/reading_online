<!-- 文件上传 -->
<template>
  <div class="upload-container">
    <el-card shadow="never" header="上传新书">
      <el-form :model="form" label-width="100px" ref="formRef">
        <!-- 书名 -->
        <el-form-item label="书名" prop="title">
          <el-input v-model="form.title" placeholder="请输入书名" />
        </el-form-item>

        <!-- 作者ID 和 作者名称 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作者名称" prop="authorName">
              <el-input v-model="form.authorName" placeholder="请输入作者真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 简介 -->
        <el-form-item label="书籍简介" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>

        <!-- 文件上传 -->
        <el-form-item label="正文文件" prop="file">
          <el-upload :auto-upload="false" :on-change="handleFileChange" :show-file-list="true" accept=".txt,.docx" drag>
            <el-icon>
              <Document />
            </el-icon>
            <div>点击上传 txt/docx 文件</div>
            <template #tip>
              <div class="el-upload__tip">仅支持 txt/docx 格式</div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 封面上传 -->
        <el-form-item label="封面图片" prop="coverFile">
          <el-upload :auto-upload="false" :on-change="handleCoverChange" :show-file-list="true" accept=".jpg,.jpeg,.png"
            list-type="picture-card" drag>
            <template #default="{ file }">
              <div v-if="file">
                <img :src="file.url" class="el-upload-list__item-thumbnail" alt="" />
              </div>
              <div v-else>
                <el-icon>
                  <Plus />
                </el-icon>
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip">支持 jpg/png/jpeg 格式</div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <div class="action-buttons">
            <el-button type="primary" @click="submitUpload">提交上传</el-button>
            <el-button @click="goBack">返回</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { Document, Plus } from '@element-plus/icons-vue'

const router = useRouter();

const form = ref({
  title: '',
  authorName: '',
  description: '',
  file: null as File | null,
  coverFile: null as File | null
})
// 返回逻辑（网页6、7、8）
const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/'); // 无历史记录时返回首页
  }
};

// 文件处理
const handleFileChange = (uploadFile: { raw: File }) => {
  const validTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!validTypes.includes(uploadFile.raw.type)) {
    ElMessage.error('文件格式不支持');
    return;
  }
  form.value.file = uploadFile.raw;
};

// 封面图片上传处理
const handleCoverChange = (uploadFile: { raw: File }) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!validTypes.includes(uploadFile.raw.type)) {
    ElMessage.error('图片格式不支持')
    return
  }
  form.value.coverFile = uploadFile.raw
}
// 提交逻辑
const submitUpload = async () => {
  if (!form.value.file) {
    ElMessage.warning('请选择上传文件');
    return;
  }

  const formData = new FormData();
  formData.append('file', form.value.file)
  formData.append('title', form.value.title)
  formData.append('authorName', form.value.authorName)
  formData.append('description', form.value.description)
  if (form.value.coverFile) {
    formData.append('coverFile', form.value.coverFile);
  }

  try {
    await axios.post('/api/api/novel/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    ElMessage.success('上传成功');
    setTimeout(() => goBack(), 1500); // 成功后自动返回
  } catch (error:any) {
    ElMessage.error('上传失败: ' + (error.response?.data?.message || '服务器错误'));
  }
};
</script>

<style scoped>
.upload-container {
  padding: 30px;
  max-width: 800px;
  margin: auto;

  .el-card__header {
    font-size: 18px;
    font-weight: bold;
    background-color: #f9fafb;
  }

  .el-upload__tip {
    color: #999;
    font-size: 12px;
  }

  .action-buttons {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }
}
</style>