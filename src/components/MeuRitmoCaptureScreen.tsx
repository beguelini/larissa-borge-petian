import { ArrowRight, Check, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import { prelaunchWhatsAppUrl } from '../lib/result-content'
import { trackMetaLead } from '../lib/meta-pixel'
import { FooterLogo } from './FooterLogo'
import { PrivacyPolicy } from './PrivacyPolicy'

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function MeuRitmoCaptureScreen() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('')
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Meu Ritmo — 21 dias com Ayurveda | Larissa Petian'
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Uma jornada de 21 dias para transformar sua alimentação e rotina com Ayurveda, guiada por Larissa Petian. Entre para a lista do lançamento.')
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (fullName.trim().length < 2) {
      setError('Informe seu nome para continuar.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Digite um e-mail válido.')
      return
    }
    const localPhone = whatsapp.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
    if (!/^[1-9]\d(?:9?\d{8})$/.test(localPhone)) {
      setError('Digite um WhatsApp brasileiro válido.')
      return
    }
    if (!consent) {
      setError('Marque o consentimento para receber as informações do lançamento.')
      return
    }

    setSubmitting(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const response = await fetch('/api/meu-ritmo-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          whatsapp: whatsapp.replace(/\D/g, ''),
          privacyConsent: true,
          communicationsConsent: true,
          website,
          source: {
            path: window.location.pathname,
            referrer: document.referrer || null,
            utmSource: params.get('utm_source'),
            utmMedium: params.get('utm_medium'),
            utmCampaign: params.get('utm_campaign'),
          },
        }),
      })
      if (!response.ok) {
        const result = await response.json() as { error?: string }
        throw new Error(result.error || 'Não foi possível concluir sua inscrição agora.')
      }
      trackMetaLead({ content_name: 'Meu Ritmo — lista de lançamento', content_category: 'meu_ritmo_prelaunch' })
      window.location.assign(prelaunchWhatsAppUrl)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não conseguimos concluir sua inscrição agora. Confira sua conexão e tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <main className="meu-ritmo-capture">
      <header className="meu-ritmo-header shell">
        <a href="/" aria-label="Larissa Petian — início"><img src="/logo-lp.png" alt="Larissa Petian" /></a>
        <span>Ayurveda para a vida real</span>
      </header>

      <section className="meu-ritmo-hero shell">
        <div className="meu-ritmo-copy">
          <p className="meu-ritmo-kicker"><Sparkles aria-hidden="true" size={16} /> Uma jornada para mulheres</p>
          <h1>21 dias para encontrar um jeito mais leve de cuidar de você.</h1>
          <p className="meu-ritmo-intro">Alinhe alimentação e rotina com os conhecimentos do Ayurveda, em uma jornada guiada pela Larissa — com passos possíveis para a vida real.</p>
          <ul className="meu-ritmo-highlights">
            <li><Check aria-hidden="true" size={18} /> Práticas simples para experimentar no seu dia a dia</li>
            <li><Check aria-hidden="true" size={18} /> Orientação da Larissa durante os 21 dias</li>
            <li><UsersRound aria-hidden="true" size={18} /> Uma comunidade exclusiva para mulheres</li>
          </ul>
          <p className="meu-ritmo-guide"><span>Com Larissa Petian</span><small>Terapeuta Ayurveda</small></p>
        </div>

        <div className="meu-ritmo-card-wrap">
          <form className="meu-ritmo-form" onSubmit={(event) => void submit(event)} noValidate>
            <p className="meu-ritmo-form-step">PRÉ-LANÇAMENTO · MEU RITMO</p>
            <h2>Quero saber primeiro</h2>
            <p className="meu-ritmo-form-intro">Deixe seus dados e entre no grupo oficial para acompanhar o lançamento.</p>

            <label htmlFor="meu-ritmo-name">Seu nome</label>
            <input id="meu-ritmo-name" name="fullName" autoComplete="name" placeholder="Como podemos chamar você?" value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} maxLength={80} required />

            <label htmlFor="meu-ritmo-email">Seu melhor e-mail</label>
            <input id="meu-ritmo-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required />

            <label htmlFor="meu-ritmo-whatsapp">Seu WhatsApp</label>
            <input id="meu-ritmo-whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 99999-9999" value={whatsapp} onChange={(event) => setWhatsapp(formatWhatsApp(event.target.value))} required />

            <label className="meu-ritmo-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>

            <label className="meu-ritmo-consent">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>Quero receber informações sobre o lançamento por e-mail e WhatsApp. Concordo com o uso dos meus dados conforme a <button type="button" onClick={() => setShowPrivacy(true)}>Política de Privacidade</button>.</span>
            </label>

            {error && <p className="meu-ritmo-error" role="alert">{error}</p>}
            <button className="meu-ritmo-submit" type="submit" disabled={submitting}>
              {submitting ? 'Salvando sua inscrição…' : 'Entrar no grupo do WhatsApp'}
              {!submitting && <ArrowRight aria-hidden="true" size={19} />}
            </button>
            <p className="meu-ritmo-privacy"><ShieldCheck aria-hidden="true" size={16} /> Após a inscrição, você será direcionada ao grupo.</p>
          </form>
        </div>
      </section>

      <FooterLogo className="meu-ritmo-footer" />
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
    </main>
  )
}
