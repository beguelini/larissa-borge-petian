import { useEffect } from 'react'
import { ArrowDown, ArrowRight, BookOpen, Check, Clock3, Leaf, ShieldCheck, Sun } from 'lucide-react'
import { FooterLogo } from './FooterLogo'
import '../ritmo-essencial.css'

const checkoutUrl = 'https://pay.hotmart.com/L107525821W?checkoutMode=2&off=xlu81ll8'

const faqs = [
  ['Preciso conhecer Ayurveda para participar?', 'Não. A jornada foi pensada para aproximar o Ayurveda da vida real, com uma linguagem acessível e práticas possíveis.'],
  ['Quanto tempo preciso reservar por dia?', 'A proposta é dedicar de 10 a 15 minutos por dia às práticas.'],
  ['Preciso seguir uma rotina perfeita?', 'Não. O ponto de partida é observar a rotina que você tem e construir escolhas que façam sentido para a sua vida.'],
  ['O programa substitui acompanhamento de saúde?', 'Não. O Ritmo Essencial é uma jornada educativa de bem-estar e não substitui orientação médica, psicológica ou nutricional.'],
  ['Como funciona a garantia?', 'Você tem 7 dias a partir da compra para solicitar o reembolso. Dentro desse prazo, o estorno é automático e você não precisa justificar.'],
  ['Como faço minha inscrição?', 'A inscrição e o pagamento são concluídos no checkout oficial da Hotmart.'],
]

function JoinButton({ className = '' }: { className?: string }) {
  return (
    <a className={`ritmo-button hotmart-fb hotmart__button-checkout ${className}`} href={checkoutUrl} onClick={(event) => event.preventDefault()}>
      Quero começar meus 21 dias <ArrowRight aria-hidden="true" size={18} />
    </a>
  )
}

export function RitmoEssencialScreen() {
  useEffect(() => {
    if (!document.querySelector('script[data-ritmo-hotmart-widget]')) {
      const script = document.createElement('script')
      script.src = 'https://static.hotmart.com/checkout/widget.min.js'
      script.async = true
      script.dataset.ritmoHotmartWidget = 'true'
      document.head.appendChild(script)
    }

    if (!document.querySelector('link[data-ritmo-hotmart-style]')) {
      const stylesheet = document.createElement('link')
      stylesheet.rel = 'stylesheet'
      stylesheet.type = 'text/css'
      stylesheet.href = 'https://static.hotmart.com/css/hotmart-fb.min.css'
      stylesheet.dataset.ritmoHotmartStyle = 'true'
      document.head.appendChild(stylesheet)
    }

    const previousTitle = document.title
    const description = document.querySelector('meta[name="description"]')
    const previousDescription = description?.getAttribute('content')
    document.title = 'Ritmo Essencial | 21 dias para encontrar um ritmo possível'
    description?.setAttribute('content', 'Uma jornada de 21 dias com práticas de 10 a 15 minutos para aproximar o Ayurveda da vida real e construir um ritmo possível para você.')

    return () => {
      document.title = previousTitle
      if (description && previousDescription) description.setAttribute('content', previousDescription)
    }
  }, [])

  return (
    <div className="ritmo-page">
      <div className="ritmo-announcement"><Leaf aria-hidden="true" size={14} /> Ayurveda para a vida real <span>·</span> inscrições abertas</div>
      <header className="ritmo-header ritmo-shell">
        <a className="ritmo-brand" href="/" aria-label="Larissa Petian, início"><img src="/logo-lp.png" alt="Larissa Petian" /></a>
        <a className="ritmo-header-link" href="#programa">Conheça a jornada <ArrowDown aria-hidden="true" size={15} /></a>
      </header>

      <section className="ritmo-hero ritmo-shell">
        <div className="ritmo-hero-copy">
          <p className="ritmo-eyebrow"><span /> Uma jornada de 21 dias para mulheres</p>
          <h1>Você não precisa de mais uma rotina perfeita. <em>Precisa de um ritmo que caiba em você.</em></h1>
          <p className="ritmo-hero-lead">Um caminho gentil para se aproximar do seu corpo, observar seus hábitos e levar o Ayurveda para a vida que você tem. Um dia de cada vez.</p>
          <div className="ritmo-hero-actions"><JoinButton /><span>Práticas de 10 a 15 minutos por dia</span></div>
          <div className="ritmo-proofline"><span><Check aria-hidden="true" size={15} /> Sem extremismos</span><span><Check aria-hidden="true" size={15} /> Sem exigir uma rotina perfeita</span></div>
        </div>
        <figure className="ritmo-hero-portrait">
          <img src="/images/meu-ritmo-larissa.jpg" alt="Larissa Petian, professora de yoga e terapeuta Ayurveda" fetchPriority="high" />
          <figcaption><span>Ritmo Essencial</span><span>21 dias de Ayurveda para a vida real</span></figcaption>
        </figure>
      </section>

      <section className="ritmo-ribbon" aria-label="Resumo do programa"><div className="ritmo-shell"><span><Sun aria-hidden="true" /> 21 dias</span><i /><span><Clock3 aria-hidden="true" /> De 10 a 15 minutos por dia</span><i /><span><Leaf aria-hidden="true" /> Ayurveda possível</span></div></section>

      <section id="programa" className="ritmo-story ritmo-shell">
        <div className="ritmo-story-heading"><p className="ritmo-eyebrow">Talvez você se reconheça</p><h2>Você tenta se cuidar. Mas a vida real não segue o plano.</h2></div>
        <div className="ritmo-story-copy"><p>Tem dias em que você começa com intenção e termina fazendo tudo no improviso. A rotina aperta, os planos ficam para depois e parece que, para cuidar de si, seria preciso dar conta de ainda mais uma coisa.</p><p>O Ritmo Essencial parte de outro lugar: <strong>você não precisa caber em uma rotina pronta.</strong> Durante 21 dias, vai observar o que funciona na sua vida e experimentar práticas curtas para construir um cuidado mais possível e sustentável.</p></div>
      </section>

      <section className="ritmo-method">
        <div className="ritmo-shell">
          <p className="ritmo-eyebrow">Uma jornada com espaço para a sua vida</p>
          <h2>Observar. Ajustar. Sustentar.</h2>
          <p className="ritmo-method-intro">Sem fórmulas rígidas. Com práticas pequenas e um convite para escutar o próprio ritmo.</p>
          <div className="ritmo-steps">
            <article><span>01</span><h3>Observe</h3><p>Perceba seus hábitos, seus dias e os sinais que costumam passar despercebidos.</p></article>
            <article><span>02</span><h3>Ajuste</h3><p>Conheça princípios do Ayurveda e experimente escolhas que façam sentido para você.</p></article>
            <article><span>03</span><h3>Sustente</h3><p>Leve adiante o que couber na sua vida, sem depender de uma semana perfeita.</p></article>
          </div>
          <div className="ritmo-method-note"><Leaf aria-hidden="true" size={20} /><p>De <strong>10 a 15 minutos por dia</strong> para criar espaço para um cuidado que possa continuar depois dos 21 dias.</p></div>
        </div>
      </section>

      <section className="ritmo-included ritmo-shell">
        <p className="ritmo-eyebrow">O que faz parte da jornada</p>
        <h2>Um programa completo para experimentar o seu ritmo.</h2>
        <div className="ritmo-included-grid">
          <article><span><Sun aria-hidden="true" /></span><p>01 · A jornada</p><h3>21 dias de Ayurveda para a vida real</h3><div>Práticas possíveis, de 10 a 15 minutos por dia, para observar e ajustar a rotina com gentileza.</div></article>
          <article><span><BookOpen aria-hidden="true" /></span><p>02 · A coleção</p><h3>E-books Sabores do Meu Ritmo</h3><div>Os e-books da coleção para levar o Ayurveda também para a sua relação com a alimentação.</div></article>
          <article><span><Leaf aria-hidden="true" /></span><p>03 · A prática</p><h3>Yoga para cada dosha</h3><div>Práticas de yoga específicas para cada dosha, para explorar movimento e presença de um jeito conectado à sua natureza.</div></article>
        </div>
      </section>

      <section className="ritmo-fit ritmo-shell">
        <div><p className="ritmo-eyebrow">Esse caminho pode ser para você</p><h2>Se o seu desejo é se cuidar com mais presença e menos cobrança.</h2><p>O Ritmo Essencial foi pensado para mulheres que querem conhecer o Ayurveda sem transformar bem-estar em mais uma lista de exigências.</p></div>
        <ul><li><Check aria-hidden="true" />Quer cuidar da alimentação sem extremismos.</li><li><Check aria-hidden="true" />Sente que perdeu o próprio ritmo em meio à rotina.</li><li><Check aria-hidden="true" />Deseja compreender melhor o corpo e os próprios hábitos.</li><li><Check aria-hidden="true" />Procura práticas curtas, gentis e possíveis de sustentar.</li></ul>
      </section>

      <section className="ritmo-guide">
        <div className="ritmo-shell ritmo-guide-inner">
          <figure className="ritmo-guide-portrait"><img src="/images/meu-ritmo-larissa.jpg" alt="Larissa Petian, professora de Hatha e Vinyasa Yoga e terapeuta Ayurveda" loading="lazy" /></figure>
          <div className="ritmo-guide-copy"><p className="ritmo-eyebrow">Quem conduz a jornada</p><h2>Prazer, eu sou a Larissa.</h2><p>Sou professora de Hatha e Vinyasa Yoga e terapeuta Ayurveda. Meu trabalho é aproximar essas práticas do cotidiano, com escuta e escolhas realistas para a vida que cada mulher tem.</p><p>Foi desse olhar que nasceu o Ritmo Essencial. Uma jornada para experimentar o Ayurveda no dia a dia, perceber o que faz sentido para o seu corpo e construir hábitos com presença, gentileza e autonomia.</p><div className="ritmo-guide-credentials"><span>Professora de Hatha e Vinyasa Yoga</span><span>Terapeuta Ayurveda</span></div></div>
        </div>
      </section>

      <section className="ritmo-faq ritmo-shell">
        <div><p className="ritmo-eyebrow">Antes de começar</p><h2>Perguntas que talvez você tenha.</h2></div>
        <div className="ritmo-faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </section>

      <section id="inscricao" className="ritmo-offer">
        <div className="ritmo-shell ritmo-offer-card">
          <div><p className="ritmo-eyebrow">Um convite para voltar ao que é essencial</p><h2>21 dias para encontrar um ritmo possível para o seu corpo e para a sua vida.</h2><p>Comece com um passo pequeno. O próximo pode nascer do que você descobrir pelo caminho.</p></div>
          <div className="ritmo-price"><span>Investimento</span><strong>R$ 397</strong><p>ou 12 vezes de R$ 33,09</p><ul className="ritmo-price-includes"><li><Check aria-hidden="true" />Jornada de 21 dias</li><li><Check aria-hidden="true" />E-books Sabores do Meu Ritmo</li><li><Check aria-hidden="true" />Yoga específico para cada dosha</li></ul><JoinButton className="ritmo-offer-button" /><small>Pagamento processado com segurança pela Hotmart.</small><small>Alunas de yoga da Larissa e integrantes do grupo de pré-lançamento recebem um desconto especial.</small></div>
        </div>
      </section>

      <section className="ritmo-guarantee ritmo-shell" aria-labelledby="ritmo-guarantee-title">
        <div className="ritmo-guarantee-seal"><strong>7</strong><span>dias</span></div>
        <div className="ritmo-guarantee-copy"><p className="ritmo-eyebrow"><ShieldCheck aria-hidden="true" size={16} /> Garantia incondicional</p><h2 id="ritmo-guarantee-title">Experimente com tranquilidade.</h2><p>Você tem 7 dias a partir da compra para solicitar o reembolso. Se pedir dentro desse prazo, o estorno é automático e você não precisa justificar.</p></div>
        <JoinButton className="ritmo-guarantee-cta" />
      </section>

      <section className="ritmo-last-word ritmo-shell"><p>Você não precisa caber em uma rotina.</p><h2>A rotina precisa caber em você.</h2><a href="#inscricao">Quero encontrar meu ritmo <ArrowRight aria-hidden="true" size={17} /></a></section>
      <FooterLogo className="ritmo-footer" />
    </div>
  )
}
