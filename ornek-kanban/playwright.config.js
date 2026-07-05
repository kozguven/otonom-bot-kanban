import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // PUT /api/board tüm board'u yazdığı için paralel worker'lar birbirinin kartını ezer
  workers: 1,
  use: {
    baseURL: 'http://localhost:5199',
    headless: true,
  },
  webServer: {
    command:
      'rm -f data/e2e-board.json && BOARD_FILE=data/e2e-board.json npm run dev -- --port 5199 --strictPort',
    url: 'http://localhost:5199',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
