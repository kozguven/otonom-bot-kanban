import { join } from 'node:path'
import { isValidBoard, loadBoard, saveBoard } from './store.js'

const API_PATH = '/api/board'

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

export function createBoardApiMiddleware(filePath) {
  return async function boardApiMiddleware(req, res, next) {
    const pathname = new URL(req.url, 'http://localhost').pathname
    if (pathname !== API_PATH) return next()

    try {
      if (req.method === 'GET') {
        const board = await loadBoard(filePath)
        return sendJson(res, 200, board)
      }

      if (req.method === 'PUT') {
        const raw = await readBody(req)
        let board
        try {
          board = JSON.parse(raw)
        } catch {
          return sendJson(res, 400, { error: 'Gövde geçerli JSON değil' })
        }
        if (!isValidBoard(board)) {
          return sendJson(res, 400, { error: 'Board verisi beklenen biçimde değil' })
        }
        await saveBoard(filePath, board)
        return sendJson(res, 200, board)
      }

      res.setHeader('allow', 'GET, PUT')
      return sendJson(res, 405, { error: 'Desteklenmeyen metod' })
    } catch (error) {
      return sendJson(res, 500, { error: error.message })
    }
  }
}

export function boardApiPlugin(options = {}) {
  return {
    name: 'kanban-board-api',
    configureServer(server) {
      const filePath =
        options.filePath ||
        process.env.BOARD_FILE ||
        join(server.config.root, 'data', 'board.json')
      server.middlewares.use(createBoardApiMiddleware(filePath))
    },
  }
}
