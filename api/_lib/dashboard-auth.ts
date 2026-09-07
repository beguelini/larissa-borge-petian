import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

const cookieName = 'larissa_dashboard_session'
const sessionDurationSeconds = 60 * 60 * 8

function encode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function decode(value: string) {
  try {
    return Buffer.from(value, 'base64url').toString('utf8')
  } catch {
    return ''
  }
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

function signaturesMatch(first: string, second: string) {
  const firstBuffer = Buffer.from(first)
  const secondBuffer = Buffer.from(second)
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer)
}

function getCookie(request: IncomingMessage, name: string) {
  const cookies = request.headers.cookie?.split(';') ?? []
  return cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${name}=`))?.slice(name.length + 1)
}

export function hasDashboardSession(request: IncomingMessage) {
  const secret = process.env.DASHBOARD_SESSION_SECRET
  const token = getCookie(request, cookieName)
  if (!secret || !token) return false

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature || !signaturesMatch(signature, sign(encodedPayload, secret))) return false

  try {
    const payload = JSON.parse(decode(encodedPayload)) as { expiresAt?: number }
    return typeof payload.expiresAt === 'number' && payload.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function areDashboardCredentialsValid(username: string, password: string) {
  const configuredUsername = process.env.DASHBOARD_USERNAME
  const configuredPassword = process.env.DASHBOARD_PASSWORD
  if (!configuredUsername || !configuredPassword) return false
  return signaturesMatch(username, configuredUsername) && signaturesMatch(password, configuredPassword)
}

export function normalizeDashboardUsername(value: string) {
  const username = value.trim().toLowerCase()
  return /^[a-z0-9._-]{3,40}$/.test(username) ? username : null
}

export function validDashboardPassword(value: string) {
  return value.length >= 10 && value.length <= 256
}

export function hashDashboardPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const digest = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${digest}`
}

export function verifyDashboardPassword(password: string, stored: string) {
  const [scheme, salt, digest] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !digest) return false
  const expected = Buffer.from(digest, 'hex')
  const received = scryptSync(password, salt, 64)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

async function databaseRequest(path: string, init?: RequestInit) {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/dashboard_users${path}`, {
      ...init,
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, ...(init?.headers ?? {}) },
    })
    return response
  } catch { return null }
}

export async function areDashboardCredentialsValidOrMigrated(username: string, password: string) {
  const normalizedUsername = normalizeDashboardUsername(username)
  if (!normalizedUsername || password.length === 0 || password.length > 256) return false
  const existingResponse = await databaseRequest(`?username=eq.${encodeURIComponent(normalizedUsername)}&select=username,password_hash,is_active&limit=1`)
  if (existingResponse?.ok) {
    const users = await existingResponse.json() as { password_hash: string; is_active: boolean }[]
    if (users[0]) return users[0].is_active && verifyDashboardPassword(password, users[0].password_hash)
  }
  const configuredUsername = process.env.DASHBOARD_USERNAME
  const configuredPassword = process.env.DASHBOARD_PASSWORD
  if (!configuredUsername || !configuredPassword) return false
  const matchesEnvironment = signaturesMatch(username, configuredUsername) && signaturesMatch(password, configuredPassword)
  if (!matchesEnvironment) return false
  if (!validDashboardPassword(password)) return true
  const migrationResponse = await databaseRequest('', { method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ username: normalizedUsername, password_hash: hashDashboardPassword(password) }) })
  if (migrationResponse && !migrationResponse.ok && migrationResponse.status !== 409) console.error('Dashboard user migration failed', migrationResponse.status)
  return true
}

export function setDashboardSession(response: ServerResponse) {
  const secret = process.env.DASHBOARD_SESSION_SECRET
  if (!secret) throw new Error('Dashboard session secret is not configured')
  const payload = encode(JSON.stringify({ expiresAt: Date.now() + sessionDurationSeconds * 1000 }))
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader('Set-Cookie', `${cookieName}=${payload}.${sign(payload, secret)}; Max-Age=${sessionDurationSeconds}; Path=/; HttpOnly; SameSite=Strict${secure}`)
}

export function clearDashboardSession(response: ServerResponse) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader('Set-Cookie', `${cookieName}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict${secure}`)
}

export function requireDashboardSession(request: IncomingMessage, response: ServerResponse) {
  if (hasDashboardSession(request)) return true
  response.statusCode = 401
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify({ error: 'Autenticação necessária.' }))
  return false
}
