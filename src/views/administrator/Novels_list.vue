<template>
  <div class="container">
    <!-- <div class="search-bar">
      <el-input v-model="searchKeyword" placeholder="搜索书名" clearable @input="handleSearch">
        <template #append>
          <el-button @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
          </el-button>
        </template>
      </el-input>
      <el-button type="primary" @click="openCreateDialog">新增小说</el-button>
    </div> -->

    <el-table :data="novelStore.novels" stripe v-loading="novelStore.loading" style="width: 100%">
      <el-table-column prop="title" label="书名" width="250" />
      <el-table-column label="作者">
        <template #default="{ row }">
          {{ row.author.name }}
        </template>
      </el-table-column>
      <el-table-column label="封面" width="120">
        <template #default="{ row }">
          <el-image :src="row.coverImage" fit="cover" style="width: 80px; height: 100px"
            :preview-src-list="[row.cover_image]" />
        </template>
      </el-table-column>
      <el-table-column label="是否新书" width="100">
  <template #default="{ row }">
    <el-switch v-model="row.isNew" @change="handleIsNewChange(row)" />
  </template>
</el-table-column>

<el-table-column label="是否推荐" width="100">
  <template #default="{ row }">
    <el-switch v-model="row.recommend" @change="handleRecommendChange(row)" />
  </template>
</el-table-column>
      <!-- <el-table-column prop="created_at" label="创建时间" width="180" /> -->
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>

      <template #empty>
        <div class="empty-content">
          <img alt="暂无数据">
          <p>当前没有小说数据，点击右上角按钮添加</p>
        </div>
      </template>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="novelStore.pagination.current"
        v-model:page-size="novelStore.pagination.pageSize" :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper" :total="novelStore.pagination.total"
        @size-change="handlePageChange" @current-change="handlePageChange" />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑小说' : '新增小说'" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="书名" prop="title">
          <el-input v-model="formData.title" placeholder="请输入书名" />
        </el-form-item>

        <el-form-item label="作者" prop="authorName">
          <el-input v-model="formData.authorName" placeholder="请输入作者姓名" clearable />
        </el-form-item>

        <el-form-item label="封面" prop="coverImage">
          <el-upload :show-file-list="false" :http-request="handleUpload" :before-upload="beforeUpload"
            accept="image/*">
            <el-button type="primary" :loading="uploadLoading">
              {{ formData.coverImage ? '更换封面' : '点击上传' }}
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                建议尺寸:300*400px,大小不超过2MB
              </div>
            </template>
          </el-upload>
          <!-- <el-image v-if="formData.coverImage" :src="formData.coverImage" style="width: 120px; margin-top: 10px"
            fit="cover" :preview-src-list="[formData.coverImage]" /> -->
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, isRef, isReactive } from 'vue'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { useNovelStore } from '@/stores/novel'
import type { Novel, NovelCreate } from '@/types/novel'
import type { FormInstance, FormRules } from 'element-plus'
import instance from '@/utils/request'
import { getAssetPath } from '@/utils/assetHelper'

const novelStore = useNovelStore()
const searchKeyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const uploadLoading = ref(false)
const submitLoading = ref(false)
const authorList = ref<{ id: number, name: string }[]>([])

const formData = reactive<NovelCreate & { isNew?: boolean; isRecommend?: boolean }>({
  title: '',
  authorName: '',
  coverImage: '',
  isNew: false,
  isRecommend: false,
})

const formRules: FormRules<NovelCreate> = {
  title: [
    { required: true, message: '请输入小说标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度2-50字符', trigger: 'blur' }
  ],
  authorName: [
    { required: true, message: '请输入作者姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度2-20字符', trigger: 'blur' }
  ],
  coverImage: [
    { required: true, message: '请上传封面图', trigger: 'change' }
  ]
}


onMounted(() => {
  if (typeof novelStore.fetchNovels === 'function') {
    novelStore.fetchNovels().then(() => {
    }).catch(err => {
      console.error('❌ fetchNovels 执行失败:', err)
    })
  } else {
    console.error('❌ novelStore 中未找到 fetchNovels 方法')
  }
})

const handlePageChange = () => {
  novelStore.fetchNovels({
    page: novelStore.pagination.current,
    pageSize: novelStore.pagination.pageSize,
    search: searchKeyword.value.trim()
  })
}
const handleIsNewChange = async (row: Novel) => {
  try {
    await novelStore.updateNovel(row.id, { isNew: row.isNew });
    ElMessage.success('是否新书更新成功');
  } catch (error) {
    ElMessage.error('更新失败：' + (error as Error).message);
    // 回滚 UI 状态
    row.isNew = !row.isNew;
  }
};

const handleRecommendChange = async (row: Novel) => {
  try {
    await novelStore.updateNovel(row.id, { recommend: row.recommend });
    ElMessage.success('是否推荐更新成功');
  } catch (error) {
    ElMessage.error('更新失败：' + (error as Error).message);
    // 回滚 UI 状态
    row.recommend = !row.recommend;
  }
};
// 防抖函数
const debounce = (fn: Function, delay: number) => {
  let timer: number
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const handleSearch = debounce(() => {
  novelStore.pagination.current = 1
  handlePageChange()
}, 500)

const openCreateDialog = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  isEdit.value = false
  dialogVisible.value = true
}

const openEditDialog = (row: Novel) => {
  Object.assign(formData, {
    ...row,
    authorName: row.author?.name || ''
  })
  isEdit.value = true
  dialogVisible.value = true
}

const beforeUpload = (file: File) => {
  const isValid = file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024
  if (!isValid) {
    ElMessage.error('请上传2MB以内的图片文件')
  }
  return isValid
}

const handleUpload = async ({ file }: { file: File }) => {
  uploadLoading.value = true
  try {
    const url = await novelStore.uploadCover(file, formData.title)
    formData.coverImage = url
  } catch (error) {
    ElMessage.error('上传失败：' + (error as Error).message)
  } finally {
    uploadLoading.value = false
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  submitLoading.value = true
  try {
    await formRef.value.validate()
    const loading = ElLoading.service({ lock: true })
    if (isEdit.value && formData.id) {
      await novelStore.updateNovel(formData.id, formData)
    } else {
      await novelStore.createNovel(formData)
    }
    loading.close()
    dialogVisible.value = false
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
  } catch (error) {
    console.error('表单提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该小说？此操作不可逆！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await novelStore.deleteNovel(id)
    ElMessage.success('删除成功')
  } catch (error) {
    if ((error as Error).message !== 'cancel') {
      ElMessage.error('删除失败：' + (error as Error).message)
    }
  }
}

const searchAuthors = async (query: string) => {
  try {
    const { data } = await instance.get('/authors/search', {
      params: { name: query }
    })
    authorList.value = data
  } catch (error) {
    ElMessage.error('作者搜索失败')
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-image {
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.el-image:hover {
  transform: scale(1.05);
}
</style>