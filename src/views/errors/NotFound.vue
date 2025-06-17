<template>
    <div class="error-page">
      <h1>404 - 页面不存在</h1>
      <p>您访问的页面可能已被移除或暂时不可用</p>
      <router-link to="/">返回首页</router-link>
    </div>
  </template>
  
  <style scoped>
  .error-page {
    text-align: center;
    padding: 2rem;
  }
  </style>