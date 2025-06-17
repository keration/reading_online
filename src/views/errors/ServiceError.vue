<template>
    <div class="error-page">
      <h1>500 - 服务异常</h1>
      <p>当前服务暂时不可用，请稍后再试</p>
      <button @click="retry">重试</button>
      <router-link to="/">返回首页</router-link>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const retry = () => {
    router.go(0) // 刷新页面
  }
  </script>
  
  <style scoped>
  .error-page {
    text-align: center;
    padding: 2rem;
  }
  </style>