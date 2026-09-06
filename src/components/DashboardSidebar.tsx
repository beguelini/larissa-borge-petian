import { BarChart3, Home, Leaf, LineChart, Settings, Users } from 'lucide-react'
import { BotanicalSprig } from './Illustrations'

type DashboardSection = 'panel' | 'registrations'

export function DashboardSidebar({ active }: { active: DashboardSection }) {
  const items = [
    { label: 'Painel', icon: Home, href: '/painel', id: 'panel' },
    { label: 'Cadastros', icon: Users, href: '/cadastros', id: 'registrations' },
    { label: 'Doshas', icon: LineChart, href: '#doshas', id: 'doshas' },
    { label: 'Relatórios', icon: BarChart3, href: '#relatorios', id: 'reports' },
    { label: 'Configurações', icon: Settings, href: '#configuracoes', id: 'settings' },
  ]

  return (
    <aside className="reference-sidebar" aria-label="Navegação do painel">
      <a className="reference-mark" href="/" aria-label="Voltar ao quiz"><Leaf size={43} strokeWidth={1.35} /></a>
      <nav>
        {items.map(({ label, icon: Icon, href, id }) => (
          <a className={`reference-nav-item ${active === id ? 'is-active' : ''}`} href={href} key={id}>
            <Icon aria-hidden="true" size={22} strokeWidth={1.5} /> {label}
          </a>
        ))}
      </nav>
      <div className="reference-sidebar-rule" />
      <BotanicalSprig className="reference-sidebar-sprig" />
    </aside>
  )
}
