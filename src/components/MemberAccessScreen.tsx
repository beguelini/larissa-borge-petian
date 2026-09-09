import { LogOut, PlayCircle } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { FooterLogo } from './FooterLogo'

export function MemberAccessScreen() {
  const activationToken = new URLSearchParams(window.location.search).get('activation')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [member, setMember] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { void fetch('/api/member-auth').then(response => response.ok).then(setMember).finally(() => setLoading(false)) }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    const action = activationToken ? 'activate' : mode
    const response = await fetch('/api/member-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, name, email, password, activationToken }) })
    const data = await response.json() as { error?: string }
    if (response.ok) {
      if (activationToken) {
        window.history.replaceState({}, '', '/meu-ritmo')
        setMember(true)
      } else if (mode === 'register') {
        setMode('login')
        setMessage('Cadastro recebido. Você receberá acesso após a aprovação.')
      } else setMember(true)
    } else setMessage(data.error ?? 'Não foi possível continuar.')
  }

  async function logout() {
    await fetch('/api/member-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
    setMember(false)
  }

  if (loading) return <main className="member-page" />
  if (member) return <main className="member-page"><header className="member-header"><img src="/logo-lp.png" alt="Larissa Petian" /><button onClick={() => void logout()}><LogOut size={17} /> Sair</button></header><section className="member-home"><h1>Meu Ritmo</h1><p>Um espaço para voltar ao seu corpo, no seu tempo.</p><div className="member-sections"><article><PlayCircle /><h2>21 áudios</h2><p>As práticas serão liberadas aqui.</p></article><article><h2>Caderno Meu Ritmo</h2><p>Seu material de acompanhamento aparecerá nesta área.</p></article><article><h2>Vídeos e estudos</h2><p>Os vídeos e materiais de estudo serão organizados aqui.</p></article></div></section><FooterLogo className="member-footer" /></main>

  const isActivation = Boolean(activationToken)
  return <main className="member-page"><section className="member-card"><img src="/logo-lp.png" alt="Larissa Petian" /><h1>{isActivation ? 'Seu acesso está pronto.' : mode === 'login' ? 'Entre no Meu Ritmo' : 'Seu cadastro no Meu Ritmo'}</h1><p>{isActivation ? 'Crie uma senha pessoal para entrar na sua área de aluna agora.' : mode === 'login' ? 'Use o e-mail aprovado para acessar a área de alunas.' : 'Após a aprovação, você poderá acessar todos os conteúdos.'}</p><form onSubmit={submit}>{mode === 'register' && !isActivation && <><label>Nome completo</label><input value={name} onChange={event => setName(event.target.value)} required /></>} {!isActivation && <><label>E-mail</label><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></>}<label>{isActivation ? 'Crie sua senha' : 'Senha'}</label><input type="password" minLength={10} autoComplete={mode === 'login' && !isActivation ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} required /><button>{isActivation ? 'Criar senha e entrar' : mode === 'login' ? 'Entrar' : 'Enviar cadastro'}</button></form>{message && <p className="member-message" role="alert">{message}</p>}{!isActivation && <button className="member-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage('') }}>{mode === 'login' ? 'Ainda não tenho cadastro' : 'Já tenho cadastro'}</button>}<FooterLogo className="member-footer" /></section></main>
}
