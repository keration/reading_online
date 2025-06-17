// src/types/global.d.ts

// 声明模块路径
declare module '@/stores/user' {
    import { DefineStore } from 'pinia';
    export const useUserStore: DefineStore<'user', {
      token: string | null,
      user: User | null
    }, {}, {
      login: (credentials: { username: string, password: string }) => Promise<void>,
      logout: () => void
    }>;
  }
  
  declare module '@/router' {
    import { Router } from 'vue-router';
    const router: Router;
    export default router;
  }
  
  // 自定义类型
  interface User {
    id: number;
    username: string;
    email: string;
    // role: 'USER' | 'ADMIN';
  }

