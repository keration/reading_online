import { defineStore } from "pinia"
import { reactive } from "vue"

interface SearchResult {
  id: number
  title: string
  author: string
}
// stores/search.ts
export const useSearchStore = defineStore('search', {
  state: () => ({
    history: [] as string[],
    searchResults: [] as SearchResult[],
    searchMeta: { total: 0 },
    preferences: {
      defaultSort: 'updateTime',
      pageSize: 20
    }
  }),
  actions: {
    addHistory(keyword: string) {
      if (!this.history.includes(keyword)) {
        this.history.unshift(keyword)
        if (this.history.length > 10) this.history.pop()
      }
    },
    cacheResults(response : SearchResult[]) {
      this.searchResults = reactive(response)
    }
  }
})