import { createHmac, timingSafeEqual } from 'node:crypto'
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
