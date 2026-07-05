import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { createEmptyBoard } from '../src/lib/board.js'

export function isValidBoard(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    Array.isArray(value.columns) &&
    value.columns.every(
      (column) =>
        column !== null &&
        typeof column === 'object' &&
        typeof column.id === 'string' &&
        typeof column.title === 'string' &&
        Array.isArray(column.cards),
    )
  )
}

export async function loadBoard(filePath) {
  let raw
  try {
    raw = await readFile(filePath, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return createEmptyBoard()
    throw error
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`Board dosyası geçerli JSON değil: ${filePath}`)
  }

  if (!isValidBoard(parsed)) {
    throw new Error(`Board dosyası beklenen biçimde değil: ${filePath}`)
  }

  return parsed
}

export async function saveBoard(filePath, board) {
  if (!isValidBoard(board)) {
    throw new Error('Geçersiz board verisi kaydedilemez')
  }

  await mkdir(dirname(filePath), { recursive: true })
  const tempPath = join(dirname(filePath), `.${process.pid}.board.tmp`)
  await writeFile(tempPath, JSON.stringify(board, null, 2) + '\n', 'utf8')
  await rename(tempPath, filePath)
}
