import { Eye, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { FooterLogo } from './FooterLogo'

export function LoginScreen() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      if (!response.ok) throw new Error('Senha inválida')
      window.location.assign('/painel')
    } catch {
      setError('Não foi possível acessar o painel. Confira a senha.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="login-page"><section className="login-card" aria-labelledby="login-title"><div className="login-mark" aria-hidden="true"><Eye size={27} /></div><h1 id="login-title">Acesso ao painel</h1><p>Entre com as credenciais administrativas para visualizar os cadastros e seus resultados.</p><form onSubmit={submit}><label htmlFor="dashboard-username">Usuário</label><div className="login-input"><Eye size={18} aria-hidden="true" /><input id="dashboard-username" type="text" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></div><label htmlFor="dashboard-password">Senha do painel</label><div className="login-input"><LockKeyhole size={18} aria-hidden="true" /><input id="dashboard-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>{error && <span className="login-error" role="alert">{error}</span>}<button type="submit" disabled={loading}>{loading ? 'Entrando…' : 'Entrar no painel'}</button></form><FooterLogo className="login-footer" /></section></main>
}
