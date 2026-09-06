import type { IncomingMessage, ServerResponse } from 'node:http'
import { clearDashboardSession } from '../_lib/dashboard-auth.js'

export default function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.statusCode = 405
    response.end(JSON.stringify({ error: 'Método não permitido.' }))
    return
  }
  clearDashboardSession(response)
  response.statusCode = 200
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify({ ok: true }))
}
