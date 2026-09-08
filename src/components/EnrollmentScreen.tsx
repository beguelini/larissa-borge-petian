import { CheckCircle2, ExternalLink, LockKeyhole, PlayCircle } from 'lucide-react'
import { useEffect } from 'react'
import { FooterLogo } from './FooterLogo'

const checkoutUrl = 'https://pay.hotmart.com/L107525821W?checkoutMode=2&off=gwl5eked'

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

  return <main className="enrollment-page">
    <header className="enrollment-header shell"><a href="/" aria-label="Larissa Petian"><img src="/logo-lp.png" alt="Larissa Petian" /></a><a href="/meu-ritmo">Já sou aluna</a></header>
    <section className="enrollment-hero shell">
      <div><p className="enrollment-kicker">Meu Ritmo</p><h1>Um espaço para você se escutar e cuidar de si no seu tempo.</h1><p className="enrollment-lead">Práticas simples de Ayurveda para acompanhar a sua rotina com mais presença, clareza e gentileza.</p><a className="enrollment-checkout hotmart-fb hotmart__button-checkout" href={checkoutUrl}>Quero entrar no Meu Ritmo <ExternalLink aria-hidden="true" size={19} /></a><p className="enrollment-security"><LockKeyhole aria-hidden="true" size={17} /> Pagamento processado com segurança pela Hotmart.</p></div>
      <aside className="enrollment-summary"><h2>O que você encontra</h2><ul><li><CheckCircle2 aria-hidden="true" />21 áudios para diferentes momentos do seu dia</li><li><CheckCircle2 aria-hidden="true" />Caderno Meu Ritmo para acompanhar sua jornada</li><li><CheckCircle2 aria-hidden="true" />Vídeos e materiais de estudo</li><li><PlayCircle aria-hidden="true" />Uma área exclusiva para alunas</li></ul></aside>
    </section>
    <section className="enrollment-assurance"><div className="shell"><h2>Sua inscrição é simples e protegida.</h2><p>Ao clicar em entrar, você será direcionada para o checkout oficial da Hotmart. Os dados de pagamento são informados diretamente lá, em ambiente seguro.</p></div></section>
    <FooterLogo className="enrollment-footer" />
  </main>
}
