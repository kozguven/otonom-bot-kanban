const API_URL = '/api/board'

async function errorMessage(response) {
  try {
    const payload = await response.json()
    if (payload && typeof payload.error === 'string') return payload.error
  } catch {
    // gövde JSON değilse genel mesaja düş
  }
  return `İstek başarısız oldu (HTTP ${response.status})`
}

export async function fetchBoard() {
  const response = await fetch(API_URL)
  if (!response.ok) throw new Error(await errorMessage(response))
  return response.json()
}

export async function saveBoard(board) {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(board),
  })
  if (!response.ok) throw new Error(await errorMessage(response))
  return response.json()
}
