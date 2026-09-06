import { afterEach, describe, expect, it } from 'vitest'
import { areDashboardCredentialsValid, hasDashboardSession, setDashboardSession } from '../api/_lib/dashboard-auth'

const previousPassword = process.env.DASHBOARD_PASSWORD
const previousSecret = process.env.DASHBOARD_SESSION_SECRET
const previousUsername = process.env.DASHBOARD_USERNAME

afterEach(() => {
  if (previousPassword) process.env.DASHBOARD_PASSWORD = previousPassword
  else delete process.env.DASHBOARD_PASSWORD
  if (previousSecret) process.env.DASHBOARD_SESSION_SECRET = previousSecret
  else delete process.env.DASHBOARD_SESSION_SECRET
  if (previousUsername) process.env.DASHBOARD_USERNAME = previousUsername
  else delete process.env.DASHBOARD_USERNAME
})

describe('dashboard session', () => {
  it('accepts only the configured password and signs an http-only session', () => {
    process.env.DASHBOARD_USERNAME = 'admin'
    process.env.DASHBOARD_PASSWORD = 'senha-de-teste-segura'
    process.env.DASHBOARD_SESSION_SECRET = 'segredo-de-teste-com-mais-de-trinta-e-dois-caracteres'
    expect(areDashboardCredentialsValid('admin', 'senha-de-teste-segura')).toBe(true)
    expect(areDashboardCredentialsValid('admin', 'outra-senha')).toBe(false)
    expect(areDashboardCredentialsValid('outra-pessoa', 'senha-de-teste-segura')).toBe(false)

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
