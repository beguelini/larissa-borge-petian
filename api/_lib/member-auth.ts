import { createHmac, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { hashDashboardPassword, verifyDashboardPassword } from './dashboard-auth.js'

const cookie = 'larissa_member_session'; const duration = 60 * 60 * 24 * 14
const sign = (value: string, secret: string) => createHmac('sha256', secret).update(value).digest('base64url')
const getCookie = (request: IncomingMessage) => request.headers.cookie?.split(';').map((value) => value.trim()).find((value) => value.startsWith(`${cookie}=`))?.slice(cookie.length + 1)
const match = (a: string, b: string) => { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y) }
export { hashDashboardPassword as hashMemberPassword, verifyDashboardPassword as verifyMemberPassword }
export function email(value: string) { const normalized = value.trim().toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && normalized.length <= 254 ? normalized : null }
export function setMemberSession(response: ServerResponse, account: { id: string; email: string }) { const secret = process.env.DASHBOARD_SESSION_SECRET; if (!secret) throw new Error('Sessão não configurada'); const payload = Buffer.from(JSON.stringify({ ...account, expiresAt: Date.now() + duration * 1000 })).toString('base64url'); const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''; response.setHeader('Set-Cookie', `${cookie}=${payload}.${sign(payload, secret)}; Max-Age=${duration}; Path=/; HttpOnly; SameSite=Strict${secure}`) }
export function memberSession(request: IncomingMessage) { const secret = process.env.DASHBOARD_SESSION_SECRET; const token = getCookie(request); if (!secret || !token) return null; const [payload, signature] = token.split('.'); if (!payload || !signature || !match(signature, sign(payload, secret))) return null; try { const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { id: string; email: string; expiresAt: number }; return parsed.expiresAt > Date.now() ? parsed : null } catch { return null } }
export function clearMemberSession(response: ServerResponse) { response.setHeader('Set-Cookie', `${cookie}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`) }
