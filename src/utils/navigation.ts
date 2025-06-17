// utils/navigation.ts
import router from '@/router'

export const navigateToCategory = (
  typeId: number,
  extraParams: Record<string, any> = {}
) => {
  router.push({
    name: 'CategoryView',
    params: { typeId },
    query: {
      ...extraParams,
      _t: Date.now() // 防止相同路由缓存
    }
  })
}
