import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';
import compression from 'vite-plugin-compression';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    // 💡 这个插件会自动帮你处理单文件逻辑，不需要再手动写 manualChunks
    viteSingleFile(),
    compression({
      algorithm: 'gzip',
      threshold: 10240
    })
  ],
  build: {
    // 1. 将资源内联限制设大，确保图片、字体等都打入 HTML
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,

    // 2. 必须禁用 CSS 拆分，否则 CSS 会变成独立文件
    cssCodeSplit: false,

    rollupOptions: {
      output: {
        // 💡 关键修复：删除 manualChunks 配置。
        // viteSingleFile 插件会自动处理 inlineDynamicImports。

        // 保持输出文件名简洁
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});