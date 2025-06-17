
/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
  }
  
  // 支持别名类型提示
  declare module '@/*' {
    const path: string
    export default path
  }
  declare module '~assets/*' {
    const path: string
    export default path
  }