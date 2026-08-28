import { ArrowLeft, Check, ShieldCheck } from 'lucide-react'
import { FormEvent, useState } from 'react'
import type { LeadFormData } from '../types'
import { Brand } from './Brand'

type CaptureScreenProps = {
  onSubmit: (form: LeadFormData) => Promise<void>
  onBack: () => void
  onOpenPrivacy: () => void
}

const initialForm: LeadFormData = {
  firstName: '',
  email: '',
  privacyConsent: false,
  marketingConsent: false,
  website: '',
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
    if (!form.privacyConsent) {
      setError('Você precisa concordar com a Política de Privacidade para continuar.')
      return
    }

    setSubmitting(true)
    await onSubmit({ ...form, firstName: form.firstName.trim(), email: form.email.trim().toLowerCase() })
    setSubmitting(false)
  }

  return (
    <div className="app-screen capture-screen">
      <header className="app-header shell"><Brand /></header>
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
              checked={form.privacyConsent}
              onChange={(event) => setForm({ ...form, privacyConsent: event.target.checked })}
            />
            <span>
              Concordo com o uso dos meus dados para receber este resultado, conforme a{' '}
              <button type="button" className="inline-link" onClick={onOpenPrivacy}>Política de Privacidade</button>.
            </span>
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.marketingConsent}
              onChange={(event) => setForm({ ...form, marketingConsent: event.target.checked })}
            />
            <span>Quero receber conteúdos e novidades da Larissa por e-mail.</span>
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Abrindo seu resultado…' : 'Ver meu resultado'}
          </button>
        </form>

        <p className="secure-note"><ShieldCheck aria-hidden="true" size={22} /> Seus dados ficam protegidos. Você pode sair da lista quando quiser.</p>
        <button className="back-button capture-back" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={21} /> Voltar à última pergunta
        </button>
      </section>
    </div>
  )
}
