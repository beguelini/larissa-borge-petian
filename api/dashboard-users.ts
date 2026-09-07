import type { IncomingMessage, ServerResponse } from 'node:http'
import { hashDashboardPassword, normalizeDashboardUsername, requireDashboardSession, validDashboardPassword } from './_lib/dashboard-auth.js'

type DashboardUser = { username: string; is_active: boolean; created_at: string; updated_at: string }
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' }

function send(response: ServerResponse, status: number, body: Record<string, unknown>) { response.statusCode = status; Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value)); response.end(JSON.stringify(body)) }
async function readBody(request: IncomingMessage) { let body = ''; for await (const chunk of request) { body += chunk; if (body.length > 4_096) throw new Error('Payload muito grande') }; return JSON.parse(body) as { username?: unknown; password?: unknown } }
function database() { const url = process.env.SUPABASE_URL?.replace(/\/$/, ''); const key = process.env.SUPABASE_SERVICE_ROLE_KEY; return url && key ? { url, key } : null }

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (!requireDashboardSession(request, response)) return
  const connection = database()
  if (!connection) { send(response, 503, { error: 'Serviço temporariamente indisponível.' }); return }
  if (!['GET', 'POST', 'PATCH'].includes(request.method ?? '')) { response.setHeader('Allow', 'GET, POST, PATCH'); send(response, 405, { error: 'Método não permitido.' }); return }
  try {
    if (request.method === 'GET') {
      const result = await fetch(`${connection.url}/rest/v1/dashboard_users?select=username,is_active,created_at,updated_at&order=created_at.asc`, { headers: { apikey: connection.key, Authorization: `Bearer ${connection.key}` } })
      if (!result.ok) throw new Error('list')
      send(response, 200, { users: await result.json() as DashboardUser[] })
      return
    }
    const body = await readBody(request)
    const username = typeof body.username === 'string' ? normalizeDashboardUsername(body.username) : null
    const password = typeof body.password === 'string' ? body.password : ''
    if (!username || !validDashboardPassword(password)) { send(response, 422, { error: 'Use um usuário com 3 a 40 caracteres e senha de pelo menos 10 caracteres.' }); return }
    const requestPath = request.method === 'POST' ? '' : `?username=eq.${encodeURIComponent(username)}`
    const result = await fetch(`${connection.url}/rest/v1/dashboard_users${requestPath}`, { method: request.method === 'POST' ? 'POST' : 'PATCH', headers: { apikey: connection.key, Authorization: `Bearer ${connection.key}`, 'Content-Type': 'application/json', Prefer: request.method === 'POST' ? 'return=representation' : 'return=representation' }, body: JSON.stringify(request.method === 'POST' ? { username, password_hash: hashDashboardPassword(password) } : { password_hash: hashDashboardPassword(password), updated_at: new Date().toISOString() }) })
    if (result.status === 409) { send(response, 409, { error: 'Este usuário já existe.' }); return }
    if (!result.ok) throw new Error('write')
    const users = await result.json() as DashboardUser[]
    if (request.method === 'PATCH' && !users.length) { send(response, 404, { error: 'Usuário não encontrado.' }); return }
    send(response, request.method === 'POST' ? 201 : 200, { user: users[0] })
  } catch { send(response, 502, { error: 'Não foi possível atualizar os acessos.' }) }
}
