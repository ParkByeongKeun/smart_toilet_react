// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1DA57A', // 메인 색상 변경
          'border-radius-base': '8px', // 둥근 모서리
          'font-size-base': '16px', // 기본 폰트 크기
        },
        javascriptEnabled: true,
      },
    },
  },

  server: {
    host: true, // 0.0.0.0 으로 바인딩
    port: 5173,
    proxy: {
      '/mqtt': {
        target: 'wss://ijoon.iptime.org:25813',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});