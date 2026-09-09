import { ArrowLeft, Check, ShieldCheck } from 'lucide-react'
import { FormEvent, useState } from 'react'
import type { LeadFormData } from '../types'
import { FooterLogo } from './FooterLogo'

type CaptureScreenProps = {
  onSubmit: (form: LeadFormData) => Promise<void>
  onBack: () => void
  onOpenPrivacy: () => void
}

const initialForm: LeadFormData = {
  firstName: '',
  email: '',
  whatsapp: '',
  privacyConsent: false,
  marketingConsent: false,
  website: '',
}

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function validWhatsApp(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  return /^[1-9]\d(?:9?\d{8})$/.test(digits)
}

export function CaptureScreen({ onSubmit, onBack, onOpenPrivacy }: CaptureScreenProps) {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (form.firstName.trim().length < 2) {
      setError('Conte para a gente como podemos chamar você.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError('Digite um e-mail válido para abrir o seu resultado.')
      return
    }
    if (!validWhatsApp(form.whatsapp)) {
      setError('Digite um WhatsApp válido para abrir o seu resultado.')
      return
    }
    if (!form.privacyConsent) {
      setError('Você precisa concordar com a Política de Privacidade para continuar.')
      return
    }
    if (!form.marketingConsent) {
      setError('Autorize o envio de e-mails da Larissa para receber o seu resultado.')
      return
    }

    setSubmitting(true)
    await onSubmit({ ...form, firstName: form.firstName.trim(), email: form.email.trim().toLowerCase(), whatsapp: form.whatsapp.replace(/\D/g, '') })
    setSubmitting(false)
  }

  return (
    <div className="app-screen capture-screen">
      <div className="quiz-progress shell capture-progress">
        <span>15 de 15</span>
        <div className="progress-track" aria-hidden="true"><div className="progress-value" style={{ width: '100%' }} /></div>
      </div>

      <section className="capture-shell shell">
        <div className="success-mark" aria-hidden="true"><Check size={34} strokeWidth={1.6} /></div>
        <h1>Seu resultado está pronto</h1>
        <p className="capture-intro">
          Conte para a Larissa onde enviar sua leitura e abra agora o seu caminho de volta ao ritmo.
        </p>

        <form className="lead-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>Seu primeiro nome</span>
            <input
              name="firstName"
              autoComplete="given-name"
              placeholder="Como podemos chamar você?"
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
            />
          </label>
          <label>
            <span>Seu melhor e-mail</span>
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="voce@email.com"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            <span>Seu WhatsApp</span>
            <input
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              value={form.whatsapp}
              onChange={(event) => setForm({ ...form, whatsapp: formatWhatsApp(event.target.value) })}
              required
            />
          </label>
          <label className="honeypot" aria-hidden="true">
            Website
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) => setForm({ ...form, website: event.target.value })}
            />
          </label>

          <label className="check-row">
            <input
              type="checkbox"
              required
              checked={form.privacyConsent}
              onChange={(event) => setForm({ ...form, privacyConsent: event.target.checked })}
            />
            <span>
              <strong>Obrigatório:</strong> concordo com o uso dos meus dados para receber este resultado, conforme a{' '}
              <button type="button" className="inline-link" onClick={onOpenPrivacy}>Política de Privacidade</button>.
            </span>
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              required
              checked={form.marketingConsent}
              onChange={(event) => setForm({ ...form, marketingConsent: event.target.checked })}
            />
            <span><strong>Obrigatório:</strong> autorizo receber por e-mail meu resultado e conteúdos, novidades e convites da Larissa.</span>
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Abrindo seu resultado…' : 'Ver meu resultado'}
          </button>
        </form>

        <p className="secure-note"><ShieldCheck aria-hidden="true" size={22} /> Seus dados ficam protegidos e serão usados conforme a Política de Privacidade.</p>
        <button className="back-button capture-back" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={21} /> Voltar à última pergunta
        </button>
      </section>
      <FooterLogo />
    </div>
  )
}
