import { useEffect, useState, type ReactNode } from 'react'

export function DashboardGuard({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    void fetch('/api/auth/session')
      .then((response) => response.ok)
      .then((allowed) => {
        if (!allowed) window.location.replace('/login')
        else setAuthenticated(true)
      })
      .catch(() => window.location.replace('/login'))
  }, [])

  if (!authenticated) return <main className="dashboard-loading" aria-label="Verificando acesso" />
  return <>{children}</>
}
