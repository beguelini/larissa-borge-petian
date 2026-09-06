import { afterEach, describe, expect, it } from 'vitest'
import { hasDashboardSession, isDashboardPasswordValid, setDashboardSession } from '../api/_lib/dashboard-auth'

const previousPassword = process.env.DASHBOARD_PASSWORD
const previousSecret = process.env.DASHBOARD_SESSION_SECRET

afterEach(() => {
  if (previousPassword) process.env.DASHBOARD_PASSWORD = previousPassword
  else delete process.env.DASHBOARD_PASSWORD
  if (previousSecret) process.env.DASHBOARD_SESSION_SECRET = previousSecret
  else delete process.env.DASHBOARD_SESSION_SECRET
})

describe('dashboard session', () => {
  it('accepts only the configured password and signs an http-only session', () => {
    process.env.DASHBOARD_PASSWORD = 'senha-de-teste-segura'
    process.env.DASHBOARD_SESSION_SECRET = 'segredo-de-teste-com-mais-de-trinta-e-dois-caracteres'
    expect(isDashboardPasswordValid('senha-de-teste-segura')).toBe(true)
    expect(isDashboardPasswordValid('outra-senha')).toBe(false)

    const headers = new Map<string, string>()
    const response = { setHeader: (name: string, value: string) => headers.set(name, value) }
    setDashboardSession(response as never)
    const cookie = headers.get('Set-Cookie')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Strict')
    const sessionCookie = cookie?.split(';')[0]
    expect(hasDashboardSession({ headers: { cookie: sessionCookie } } as never)).toBe(true)
    expect(hasDashboardSession({ headers: { cookie: sessionCookie?.replace(/.$/, 'x') } } as never)).toBe(false)
  })
})
