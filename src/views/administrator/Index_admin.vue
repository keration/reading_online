<template>
  <div>
    <el-container>
      <el-aside width="200px">
        <el-row class="tac">
          <el-col>
            <el-menu
              default-active="1"
              class="el-menu-vertical-demo"
              background-color="#545c64"
              text-color="#fff"
              active-text-color="#ffd04b"
            >
              <el-menu-item index="1" @click="goUserList">
                <el-icon><Menu /></el-icon>
                <template #title>用户管理</template>
              </el-menu-item>
              <el-menu-item index="2" @click="goNovelsList">
                <el-icon><Document /></el-icon>
                <template #title>书籍管理</template>
              </el-menu-item>
              <el-menu-item index="3" @click="goAuthorList">
                <el-icon><Setting /></el-icon>
                <template #title>作者管理</template>
              </el-menu-item>
              <el-menu-item index="4" @click="logOut">
                <el-icon><SwitchButton /></el-icon>
                <template #title>退出系统</template>
              </el-menu-item>
            </el-menu>
          </el-col>
        </el-row>
      </el-aside>
      <el-container>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Menu,
  Document,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()

interface MenuActions {
  goUserList: () => void
  goNovelsList: () => void
  goAuthorList: () => void
  logOut: () => void
}

const menuActions: MenuActions = {
  goUserList: () => {
  
    router.push('/indexa/userlist')
  },
  goNovelsList: () => {
    
    router.push('/indexa/novelslist')
  },
  goAuthorList: () => {
    
    router.push('/indexa/authorlist')
  },
  logOut: () => {
    console.log("logOut")
    router.push('/')
    localStorage.clear()
  }
}

const { 
  goUserList,
  goNovelsList,
  goAuthorList,
  logOut
} = menuActions
</script>

<style scoped>
.el-aside {
  overflow: visible;
}
.el-aside .el-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100vh;
}
.el-header {
  padding: 0;
}
</style>