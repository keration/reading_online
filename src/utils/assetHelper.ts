// src/utils/assetHelper.ts
export const getAssetPath = (filename: string) => {
    return new URL(`../assets/${filename}`, import.meta.url).href
}