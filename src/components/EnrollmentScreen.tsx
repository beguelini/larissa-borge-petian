import { ArrowRight, BookOpen, CheckCircle2, Headphones, LockKeyhole, PlayCircle, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { FooterLogo } from './FooterLogo'

const checkoutUrl = 'https://pay.hotmart.com/L107525821W?checkoutMode=2&off=gwl5eked'

const benefits = [
  ['21 áudios', 'Práticas para acompanhar os diferentes momentos do seu dia.', Headphones],
  ['Caderno Meu Ritmo', 'Um espaço guiado para observar sua rotina e criar escolhas possíveis.', BookOpen],
  ['Vídeos e materiais', 'Conteúdos para aprofundar seu entendimento de forma leve e acessível.', PlayCircle],
  ['Área de membros', 'Tudo reunido em um só lugar, para você acessar no seu tempo.', Sparkles],
] as const

const faqs = [
  ['Preciso já conhecer Ayurveda?', 'Não. Meu Ritmo foi pensado para quem quer começar ou aprofundar o cuidado de uma forma simples e prática.'],
  ['Posso fazer no meu próprio ritmo?', 'Sim. A proposta é que você encontre os conteúdos e práticas no momento que fizer sentido para a sua rotina.'],
  ['Como funciona o pagamento?', 'Ao seguir para a inscrição, o pagamento é concluído no checkout oficial e seguro da Hotmart.'],
]

function CheckoutButton({ className = '' }: { className?: string }) {
  return (
    <a className={`enrollment-checkout hotmart-fb hotmart__button-checkout ${className}`} href={checkoutUrl}>
      <span>Começar minha jornada<small>Inscrição segura pela Hotmart</small></span>
      <ArrowRight aria-hidden="true" size={21} />
    </a>
  )
}

export function EnrollmentScreen() {
  useEffect(() => {
    if (!document.querySelector('script[data-hotmart-widget]')) {
      const script = document.createElement('script')
      script.src = 'https://static.hotmart.com/checkout/widget.min.js'
      script.async = true
      script.dataset.hotmartWidget = 'true'
      document.head.appendChild(script)
    }

    if (!document.querySelector('link[data-hotmart-style]')) {
      const stylesheet = document.createElement('link')
      stylesheet.rel = 'stylesheet'
      stylesheet.href = 'https://static.hotmart.com/css/hotmart-fb.min.css'
      stylesheet.dataset.hotmartStyle = 'true'
      document.head.appendChild(stylesheet)
    }
  }, [])

  return (
    <main className="enrollment-page">
      <header className="enrollment-header shell">
        <a href="/" aria-label="Larissa Petian"><img src="/logo-lp.png" alt="Larissa Petian" /></a>
        <nav>
          <a href="#larissa">Larissa</a>
          <a href="#conteudo">Conteúdo</a>
          <a href="#para-quem">Para quem é</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <a href="/meu-ritmo">Já sou aluna</a>
      </header>

      <section className="enrollment-hero shell">
        <div>
          <p className="enrollment-kicker">Ayurveda para vida real</p>
          <h1>Seu ritmo merece espaço na sua vida.</h1>
          <p className="enrollment-lead">Meu Ritmo é um caminho leve para se reconectar com o seu corpo, sua rotina e escolhas que fazem sentido para você.</p>
          <CheckoutButton />
          <p className="enrollment-security"><LockKeyhole aria-hidden="true" size={17} /> Pagamento processado com segurança pela Hotmart.</p>
        </div>
        <aside className="enrollment-summary">
          <p>Mais presença para uma vida mais sua.</p>
          <span>Rotina, consciência e cuidado possível.</span>
        </aside>
      </section>

      <section className="enrollment-pain">
        <div className="shell">
          <div>
            <p className="enrollment-kicker">Talvez você também sinta</p>
            <h2>A vida real nem sempre vem no ritmo que a gente gostaria.</h2>
            <p>Entre tarefas, expectativas e muitas responsabilidades, é fácil se desconectar do que realmente importa. Meu Ritmo nasce como um convite para voltar a se escutar.</p>
          </div>
          <p className="enrollment-quote">Não se trata de fazer mais. Trata-se de fazer diferente, com mais presença.</p>
        </div>
      </section>

      <section id="larissa" className="enrollment-authority shell" aria-labelledby="larissa-title">
        <div className="enrollment-authority-copy">
          <p className="enrollment-kicker">Prazer, eu sou a Larissa</p>
          <h2 id="larissa-title">Um caminho de cuidado que conversa com a sua vida real.</h2>
          <p>Sou professora de Hatha e Vinyasa Yoga e terapeuta Ayurveda. Em Meu Ritmo, reuni práticas e reflexões para que você se aproxime do seu bem-estar com mais presença, gentileza e autonomia.</p>
          <p className="enrollment-authority-signature">Larissa Petian</p>
        </div>
        <figure className="enrollment-authority-image">
          <img src="/post-biografia.png" alt="Larissa Petian, professora de Hatha e Vinyasa Yoga e terapeuta Ayurveda" />
        </figure>
      </section>

      <section id="conteudo" className="enrollment-content shell">
        <p className="enrollment-kicker">O que está incluído</p>
        <h2>Tudo o que você precisa para viver o seu ritmo na prática.</h2>
        <div className="enrollment-benefits">
          {benefits.map(([title, description, Icon]) => (
            <article key={title}>
              <span><Icon aria-hidden="true" size={25} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="enrollment-steps">
        <div className="shell">
          <p className="enrollment-kicker">Como funciona</p>
          <h2>Um passo a passo leve e consistente.</h2>
          <ol>
            <li><b>1</b><h3>Acesse</h3><p>Entre na sua área de membros.</p></li>
            <li><b>2</b><h3>Explore</h3><p>Ouça, assista e estude com calma.</p></li>
            <li><b>3</b><h3>Pratique</h3><p>Use o Caderno Meu Ritmo no dia a dia.</p></li>
            <li><b>4</b><h3>Integre</h3><p>Perceba aos poucos o que te faz bem.</p></li>
          </ol>
        </div>
      </section>

      <section id="para-quem" className="enrollment-for shell">
        <div>
          <p className="enrollment-kicker">Para quem é</p>
          <h2>Para mulheres que desejam viver com mais sentido, presença e autonomia.</h2>
        </div>
        <ul>
          <li><CheckCircle2 />Querem desacelerar e se escutar melhor.</li>
          <li><CheckCircle2 />Buscam uma relação mais consciente com a rotina.</li>
          <li><CheckCircle2 />Desejam conhecer o Ayurveda de forma prática.</li>
          <li><CheckCircle2 />Querem transformar pequenas escolhas do dia a dia.</li>
        </ul>
      </section>

      <section id="duvidas" className="enrollment-faq">
        <div className="shell">
          <p className="enrollment-kicker">Dúvidas frequentes</p>
          <h2>Antes de começar, talvez isso ajude.</h2>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="inscricao" className="enrollment-final">
        <div className="shell">
          <p className="enrollment-kicker">Meu Ritmo</p>
          <h2>É hora de viver um ritmo que tenha a ver com você.</h2>
          <p>Comece com presença, clareza e um cuidado possível para sua vida real.</p>
          <CheckoutButton className="enrollment-final-button" />
        </div>
      </section>
      <FooterLogo className="enrollment-footer" />
    </main>
  )
}
