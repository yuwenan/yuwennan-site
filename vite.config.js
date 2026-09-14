import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 站点托管在 GitHub Pages 的项目路径 https://yuwenan.github.io/yuwennan-site/，
// 所以 base 必须带仓库名；以后若绑到自定义域名（根路径），把 base 改回 '/'。
export default defineConfig({
  plugins: [react()],
  base: '/yuwennan-site/',
})
