import { useEffect } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Camera, HeartHandshake, Sprout, Store } from 'lucide-react'
import './institutional-site.css'

const paths = [
  {
    number: '01',
    title: 'Descubra seu dosha',
    description: 'Um primeiro contato com o Ayurveda para observar corpo, mente e rotina.',
    href: '/',
    action: 'Fazer a aplicação',
    icon: Sprout,
  },
  {
    number: '02',
    title: 'Consulta online',
    description: 'Um espaço individual de escuta para olhar para o seu momento e seus hábitos.',
    href: '/consulta',
    action: 'Conhecer a consulta',
    icon: HeartHandshake,
  },
  {
    number: '03',
    title: 'E-books',
    description: 'Leituras e práticas para levar o Ayurveda para a sua rotina, no seu tempo.',
    href: '/sabores-do-meu-ritmo',
    action: 'Ver os e-books',
    icon: BookOpen,
  },
  {
    number: '04',
    title: 'Loja',
    description: 'Um espaço em construção, pensado para reunir produtos ligados ao bem-estar.',
    href: '/loja',
    action: 'Visitar a loja',
    icon: Store,
    note: 'Em construção',
  },
]

export function InstitutionalSiteScreen() {
  useEffect(() => {
    document.title = 'Larissa Petian | Ayurveda para a vida real'
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      'Conheça o trabalho de Larissa Petian e encontre caminhos para aproximar o Ayurveda da sua vida real.',
    )
  }, [])

  return (
    <div className="institutional-site">
      <header className="institutional-header">
        <a className="institutional-wordmark" href="/site" aria-label="Larissa Petian, início">
          <img src="/logo-lp.png" alt="" />
          <span>Larissa Petian</span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#inicio">Início</a>
          <a href="#ayurveda">Ayurveda</a>
          <a href="#caminhos">Caminhos</a>
          <a href="#sobre">Sobre</a>
        </nav>
        <a className="institutional-header-cta" href="/consulta">Consulta online <ArrowUpRight aria-hidden="true" size={16} /></a>
      </header>

      <div>
        <section className="institutional-hero" id="inicio">
          <div className="institutional-hero-copy">
            <h1>Ayurveda para a vida real.</h1>
            <p>
              Um olhar atento para o que o seu corpo e a sua rotina estão pedindo — com escolhas
              possíveis, sem fórmulas prontas e sem exigir uma vida perfeita.
            </p>
            <div className="institutional-hero-actions">
              <a className="institutional-primary-link" href="/">Descubra seu dosha <ArrowRight aria-hidden="true" size={18} /></a>
              <a className="institutional-text-link" href="#sobre">Conheça a Larissa</a>
            </div>
            <a className="institutional-scroll-link" href="#caminhos"><ArrowDown aria-hidden="true" size={15} /> Encontre o seu caminho</a>
          </div>
          <figure className="institutional-hero-image">
            <img src="/images/meu-ritmo-larissa.jpg" alt="Larissa Petian, terapeuta Ayurveda" />
            <figcaption>Escuta, presença e cuidado possível.</figcaption>
          </figure>
        </section>

        <section className="institutional-intro" id="ayurveda">
          <Sprout aria-hidden="true" size={25} strokeWidth={1.4} />
          <h2>Tradição que encontra espaço no seu dia a dia.</h2>
          <p>
            O Ayurveda oferece uma forma de observar a relação entre corpo, mente e hábitos. Aqui,
            esse conhecimento se aproxima da sua realidade com curiosidade, gentileza e respeito ao
            que é possível hoje.
          </p>
        </section>

        <section className="institutional-paths" id="caminhos">
          <div className="institutional-section-heading">
            <div>
              <h2>Encontre seu caminho</h2>
              <p>Conheça as formas de se aproximar do Ayurveda e do trabalho da Larissa.</p>
            </div>
            <span>Quatro maneiras de começar</span>
          </div>
          <div className="institutional-path-list">
            {paths.map(({ number, title, description, href, action, icon: Icon, note }) => (
              <a className="institutional-path-row" href={href} key={number}>
                <span className="institutional-path-number">{number}</span>
                <span className="institutional-path-icon"><Icon aria-hidden="true" size={23} strokeWidth={1.5} /></span>
                <span className="institutional-path-copy">
                  <span className="institutional-path-title">{title}{note && <small>{note}</small>}</span>
                  <span className="institutional-path-description">{description}</span>
                </span>
                <span className="institutional-path-action">{action}<ArrowUpRight aria-hidden="true" size={17} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="institutional-about" id="sobre">
          <figure>
            <img src="/images/meu-ritmo-larissa.jpg" alt="Larissa Petian" loading="lazy" />
          </figure>
          <div className="institutional-about-copy">
            <p className="institutional-about-name">Prazer, eu sou a Larissa</p>
            <h2>Um cuidado que respeita a sua vida como ela é.</h2>
            <p>
              Sou professora de Hatha e Vinyasa Yoga e terapeuta Ayurveda. Acredito em um cuidado
              que possa ser vivido no cotidiano: com escuta, escolhas realistas e mais espaço para
              perceber o que faz sentido para você.
            </p>
            <a href="https://www.instagram.com/larissapetian/" target="_blank" rel="noreferrer">
              <Camera aria-hidden="true" size={18} /> Acompanhe a Larissa <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </div>
        </section>

        <section className="institutional-final-cta">
          <div>
            <p>Um primeiro passo, no seu tempo.</p>
            <h2>Comece pelo que faz sentido para você.</h2>
          </div>
          <a href="/">Descubra seu dosha <ArrowRight aria-hidden="true" size={18} /></a>
        </section>
      </div>

      <footer className="institutional-footer">
        <a className="institutional-wordmark" href="/site"><img src="/logo-lp.png" alt="" /><span>Larissa Petian</span></a>
        <span>Ayurveda para a vida real</span>
        <nav aria-label="Links do rodapé">
          <a href="/">Descubra seu dosha</a>
          <a href="/consulta">Consulta</a>
          <a href="/sabores-do-meu-ritmo">E-books</a>
          <a href="/loja">Loja <small>Em construção</small></a>
        </nav>
        <a className="institutional-instagram" href="https://www.instagram.com/larissapetian/" target="_blank" rel="noreferrer"><Camera aria-hidden="true" size={18} /> Instagram <ArrowUpRight aria-hidden="true" size={15} /></a>
        <small>© {new Date().getFullYear()} Larissa Petian</small>
      </footer>
    </div>
  )
}
