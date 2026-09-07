import { BarChart3, Home, LineChart, LogOut, Settings, Users } from 'lucide-react'
import { BotanicalSprig } from './Illustrations'

type DashboardSection = 'panel' | 'registrations' | 'doshas'

export function DashboardSidebar({ active }: { active: DashboardSection }) {
  const items = [
    { label: 'Painel', icon: Home, href: '/painel', id: 'panel' },
    { label: 'Cadastros', icon: Users, href: '/cadastros', id: 'registrations' },
    { label: 'Doshas', icon: LineChart, href: '/doshas', id: 'doshas' },
    { label: 'Relatórios', icon: BarChart3, href: '#relatorios', id: 'reports' },
    { label: 'Configurações', icon: Settings, href: '#configuracoes', id: 'settings' },
  ]

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.assign('/login')
  }

  return (
    <aside className="reference-sidebar" aria-label="Navegação do painel">
      <a className="reference-mark" href="/" aria-label="Voltar ao quiz"><img src="/logo-lp.png" alt="LP" /></a>
      <nav>
        {items.map(({ label, icon: Icon, href, id }) => (
          <a className={`reference-nav-item ${active === id ? 'is-active' : ''}`} href={href} key={id}>
            <Icon aria-hidden="true" size={22} strokeWidth={1.5} /> {label}
          </a>
        ))}
      </nav>
      <div className="reference-sidebar-rule" />
      <button className="reference-logout" type="button" onClick={() => void logout()}><LogOut aria-hidden="true" size={19} strokeWidth={1.5} /> Sair</button>
      <BotanicalSprig className="reference-sidebar-sprig" />
    </aside>
  )
}
