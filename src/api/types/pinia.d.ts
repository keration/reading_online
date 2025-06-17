// src/types/pinia.d.ts
import 'pinia'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | Array<{
      key?: string
      storage?: Storage
      paths?: string[]
      serializer?: {
        serialize: (value: unknown) => string
        deserialize: (value: string) => unknown
      }
    }>
  }
}