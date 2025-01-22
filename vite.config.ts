import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vite.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_SERVE
  const outDir = env.VITE_OUT_DIR
  return {
    plugins: [
      vue(),
      vueDevTools(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/svgs')],
        symbolId: 'icon-[name]', // 定义 symbolId 格式
        inject: 'body-first',
        customDomId: '__svg__icons__dom__',
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({ importLess: true, resolveIcons: true }),
        ],
      }),

    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    esbuild: {
      // 删除console，debugger
      drop: command === 'build' ? ['console', 'debugger'] : [],
    },
    build: {
      outDir: outDir,
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          // 分包
          manualChunks: {
            vue: ['vue', 'pinia', 'vue-router'],
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          math: 'always',
          javascriptEnabled: true,
          modifyVars: {
            'font-size-base': '16px', // 修改基础字体大小
            hack: `true; @import (reference) "${path.resolve('src/styles/index.less')}";`,
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 9999,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          ws: true,
        },
        '/datas': {
          target: target,
          changeOrigin: true,
          ws: true,
        },
        // rewrite: (path: string) => path.replace(/^\/api/, ''),
        // '/api/': {
        //   target: 'http://192.168.7.226',
        //   changeOrigin: true,
        //   ws: true,
        //   rewrite: (path: string) => path.replace(/^\/api/, '/edgebox'),
        // },
        // '/v1/edgebox': {
        //   target: ':60666/',
        //   changeOrigin: true,
        //   ws: true,
        //   // rewrite: (path: string) => path.replace(/^\/localhost:60666/, 'edgebox'),
        // },
        '/live': {
          target: 'rtmp://192.168.7.251:1935',
          changeOrigin: true,
          ws: true,
          rewrite: (path: string) => path.replace(/^\/live/, ''),
        },
      },
    },
  }
})
