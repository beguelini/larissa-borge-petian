import type { IncomingMessage, ServerResponse } from 'node:http'
import { hasDashboardSession } from '../_lib/dashboard-auth.js'

export default function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.statusCode = 405
    response.end(JSON.stringify({ error: 'Método não permitido.' }))
    return
  }
  response.statusCode = hasDashboardSession(request) ? 200 : 401
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify({ authenticated: response.statusCode === 200 }))
}
