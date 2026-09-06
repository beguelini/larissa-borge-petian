import type { IncomingMessage, ServerResponse } from 'node:http'
import { isDashboardPasswordValid, setDashboardSession } from '../_lib/dashboard-auth.js'

async function readBody(request: IncomingMessage) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 4_096) throw new Error('Payload muito grande')
  }
  return JSON.parse(body) as { password?: unknown }
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.statusCode = 405
    response.end(JSON.stringify({ error: 'Método não permitido.' }))
    return
  }

  try {
    const { password } = await readBody(request)
    if (typeof password !== 'string' || !isDashboardPasswordValid(password)) {
      response.statusCode = 401
      response.end(JSON.stringify({ error: 'Senha inválida.' }))
      return
    }
    setDashboardSession(response)
    response.statusCode = 200
    response.end(JSON.stringify({ ok: true }))
  } catch {
    response.statusCode = 400
    response.end(JSON.stringify({ error: 'Não foi possível processar o acesso.' }))
  }
}
