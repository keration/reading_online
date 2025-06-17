// src/types/pinia.d.ts
import 'pinia'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: import('pinia-plugin-persistedstate/dist/types').PersistedStateOptions
  }
}