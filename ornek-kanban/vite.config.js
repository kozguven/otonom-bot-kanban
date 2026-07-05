import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { boardApiPlugin } from './server/api.js'

export default defineConfig({
  plugins: [react(), boardApiPlugin()],
  test: {
    include: ['tests/**/*.test.{js,mjs,jsx}'],
  },
})
