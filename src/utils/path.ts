export function getAssetPath(path: string): string {
    const cleanPath = path.replace(/^\//, '')

    // 开发环境（调试）：前面加 /
    if (import.meta.env.DEV) {
        return `/${cleanPath}`
    }

    // 生产环境（打包 viteSingleFile）：前面不加 /
    return cleanPath
}
