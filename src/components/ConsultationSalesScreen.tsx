import { ArrowRight, CheckCircle2, Clock3, MessageCircleHeart, RotateCcw, ShieldCheck } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { quizQuestions } from '../data/questions'
import { consultationConcernLabels, consultationWhatsAppUrl } from '../lib/consultation'
import { scoreQuiz } from '../lib/results'
import type { LeadFormData, QuizAnswers } from '../types'
import { FooterLogo } from './FooterLogo'
import { QuizScreen } from './QuizScreen'

type Phase = 'landing' | 'intake' | 'quiz' | 'ready'
type Intake = LeadFormData & { mainConcern: keyof typeof consultationConcernLabels }

const initialIntake: Intake = { firstName: '', email: '', whatsapp: '', mainConcern: 'ansiedade', privacyConsent: false, marketingConsent: false, website: '' }
const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
const validWhatsApp = (value: string) => /^[1-9]\d(?:9?\d{8})$/.test(value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, ''))

export function ConsultationSalesScreen() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [form, setForm] = useState<Intake>(initialIntake)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const result = useMemo(() => scoreQuiz(answers), [answers])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [phase])

  function begin() { setPhase('intake'); setError('') }
  function submitIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (form.firstName.trim().length < 2) return setError('Conte como podemos chamar você.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Digite um e-mail válido.')
    if (!validWhatsApp(form.whatsapp)) return setError('Digite um WhatsApp válido.')
    if (!form.privacyConsent) return setError('Precisamos do seu consentimento para usar os dados desta avaliação.')
    setPhase('quiz')
  }
  function answer(questionId: string, optionId: string) { setAnswers((current) => ({ ...current, [questionId]: optionId })) }
  function advance() { if (questionIndex === quizQuestions.length - 1) void savePatient(); else setQuestionIndex((current) => current + 1) }
  async function savePatient() {
    setSaving(true); setError('')
    try {
      const response = await fetch('/api/consultation-patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, firstName: form.firstName.trim(), email: form.email.trim().toLowerCase(), whatsapp: form.whatsapp.replace(/\D/g, ''), answers, source: { path: window.location.pathname, referrer: document.referrer || null } }) })
      if (!response.ok) throw new Error('save')
      setPhase('ready')
    } catch { setError('Não foi possível registrar sua avaliação agora. Tente novamente em alguns instantes.') } finally { setSaving(false) }
  }
  if (phase === 'quiz') return <>{saving && <div className="consultation-saving" role="status">Preparando seu pedido de consulta…</div>}<QuizScreen question={quizQuestions[questionIndex]} questionIndex={questionIndex} totalQuestions={quizQuestions.length} selectedOptionId={answers[quizQuestions[questionIndex].id]} onAnswer={answer} onAdvance={advance} onBack={() => questionIndex ? setQuestionIndex((current) => current - 1) : setPhase('intake')} onExit={() => setPhase('landing')} variant="consultation" /></>
  if (phase === 'ready') return <main className="consultation-ready"><section><CheckCircle2 size={42} /><h1>{form.firstName}, sua avaliação chegou até a Larissa.</h1><p>Agora abra o WhatsApp com sua mensagem pronta. Assim ela já saberá que você concluiu a avaliação e poderá orientar o próximo passo para a sua consulta.</p><a className="consultation-cta" href={consultationWhatsAppUrl(form.firstName, form.mainConcern, result)}><MessageCircleHeart size={20} /> Abrir WhatsApp com minha mensagem</a><button type="button" onClick={() => { setPhase('landing'); setForm(initialIntake); setAnswers({}); setQuestionIndex(0) }}><RotateCcw size={17} /> Refazer avaliação</button></section><FooterLogo /></main>
  return <main className="consultation-page">{phase === 'landing' ? <><section className="consultation-hero"><div className="consultation-shell consultation-hero-inner"><div><h1>Um espaço para você se escutar e voltar ao seu ritmo.</h1><p>Uma consulta individual de Ayurveda para olhar com carinho para sua rotina, alimentação, ansiedade e relação com o corpo, com escolhas possíveis para a vida real.</p><button className="consultation-cta" type="button" onClick={begin}>Quero conversar com a Larissa <ArrowRight size={19} /></button></div><button className="consultation-hero-art" type="button" onClick={begin} aria-label="Iniciar avaliação para consulta"><img src="/consulta-ayurvedica-online.png" alt="Consulta ayurvédica online com Larissa Petian" /></button></div></section><section className="consultation-journey consultation-shell"><h2>O que acontece na consulta</h2><p>Você será acolhida como uma pessoa inteira, não como um problema a ser resolvido.</p><div>{[['01', 'Escuta da sua história', 'Conversamos sobre o momento que você vive, suas dificuldades, expectativas e o que tem pesado na sua rotina.'], ['02', 'Leitura da sua rotina', 'O questionário e a conversa orientam uma leitura individual de alimentação, descanso, energia e hábitos.'], ['03', 'Próximos passos possíveis', 'Você sai com direcionamentos realistas para começar e espaço para ajustar o caminho com apoio.']].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section><section className="consultation-offer"><div className="consultation-shell consultation-offer-inner"><img src="/ads-teste-dosha-gratuito-v2.png" alt="Ayurveda para vida real" /><div><p>Investimento</p><strong>R$ 200</strong><ul><li><Clock3 size={20} /> 1 hora de consulta online</li><li><CheckCircle2 size={20} /> 1 retorno para acompanhar os ajustes</li><li><MessageCircleHeart size={20} /> acompanhamento por WhatsApp entre os encontros</li></ul><button className="consultation-cta" type="button" onClick={begin}>Começar minha avaliação <ArrowRight size={19} /></button></div></div></section><section className="consultation-intro consultation-shell"><div><h2>Antes da consulta, uma breve avaliação.</h2><p>Você responde 15 perguntas sobre corpo, mente e rotina. Ela ajuda a Larissa a preparar uma conversa mais atenta e um encontro que faça sentido para você.</p></div><div><ShieldCheck size={28} /><h3>Seus dados são confidenciais</h3><p>As respostas serão usadas somente para organizar seu atendimento e ficam protegidas no painel da Larissa.</p></div></section><section className="consultation-final"><h2>Vamos conversar?</h2><p>Cuidar de você também pode ser um caminho possível.</p><button className="consultation-cta" type="button" onClick={begin}>Quero minha consulta online <ArrowRight size={19} /></button></section></> : <section className="consultation-intake"><div className="consultation-intake-copy"><h1>Vamos começar pela sua história.</h1><p>Antes das 15 perguntas, conte o essencial para a Larissa preparar um olhar mais cuidadoso para o seu momento.</p><small>Consulta online de 1 hora, R$ 200, 1 retorno, acompanhamento por WhatsApp</small></div><form onSubmit={submitIntake} noValidate><label>Como podemos chamar você?<input autoComplete="given-name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label><label>Seu melhor e-mail<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Seu WhatsApp<input type="tel" inputMode="tel" autoComplete="tel" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: formatWhatsApp(event.target.value) })} placeholder="(17) 99999-9999" /></label><label>O que você gostaria de cuidar primeiro?<select value={form.mainConcern} onChange={(event) => setForm({ ...form, mainConcern: event.target.value as Intake['mainConcern'] })}>{Object.entries(consultationConcernLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="consultation-check"><input type="checkbox" checked={form.privacyConsent} onChange={(event) => setForm({ ...form, privacyConsent: event.target.checked })} /> Autorizo o uso destes dados para a avaliação e organização da minha consulta.</label><label className="consultation-check"><input type="checkbox" checked={form.marketingConsent} onChange={(event) => setForm({ ...form, marketingConsent: event.target.checked })} /> Quero também receber conteúdos e convites da Larissa por e-mail.</label>{error && <p role="alert" className="form-error">{error}</p>}<button className="consultation-cta" type="submit">Começar as 15 perguntas <ArrowRight size={19} /></button></form></section>}<FooterLogo /></main>
}
