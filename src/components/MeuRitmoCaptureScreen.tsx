import { ArrowRight, Check, Heart, Leaf, ShieldCheck, Sparkles, UsersRound, Wind, Sun, Waves } from 'lucide-react'
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
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [communicationsConsent, setCommunicationsConsent] = useState(false)
  const [website, setWebsite] = useState('')
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Meu Ritmo: 21 dias com Ayurveda | Larissa Petian'
    document.querySelector('meta[name="description"]')?.setAttribute('content', '21 dias de Ayurveda para mulheres: roteiros de alimentação e rotina por dosha, aulas de Yoga online e acompanhamento próximo com Larissa Petian.')
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
    if (!privacyConsent) {
      setError('Leia a Política de Privacidade e marque o aceite obrigatório para se inscrever.')
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
          privacyConsent,
          communicationsConsent,
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
      trackMetaLead({ content_name: 'Meu Ritmo: lista de lançamento', content_category: 'meu_ritmo_prelaunch' })
      window.location.assign(prelaunchWhatsAppUrl)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não conseguimos concluir sua inscrição agora. Confira sua conexão e tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <main className="meu-ritmo-capture">
      <header className="meu-ritmo-header shell">
        <a href="/" aria-label="Início: Larissa Petian"><img src="/logo-lp.png" alt="Larissa Petian" /></a>
        <span>Ayurveda para a vida real</span>
      </header>

      <section className="meu-ritmo-hero shell">
        <div className="meu-ritmo-copy">
          <p className="meu-ritmo-kicker"><Sparkles aria-hidden="true" size={16} /> Uma jornada de 21 dias, só para mulheres</p>
          <h1>Em 21 dias, vire a chave da sua rotina e recupere a disposição.</h1>
          <p className="meu-ritmo-intro">Alimentação e rotina por dosha, Yoga online e acompanhamento da Larissa para você voltar a se sentir bem no próprio corpo.</p>
          <ul className="meu-ritmo-highlights">
            <li><Check aria-hidden="true" size={18} /> Roteiros prontos de alimentação e rotina para cada dosha</li>
            <li><Check aria-hidden="true" size={18} /> Aulas de Yoga online no seu ritmo</li>
            <li><UsersRound aria-hidden="true" size={18} /> Suporte exclusivo da Larissa em uma comunidade só para mulheres</li>
          </ul>
          <p className="meu-ritmo-guide"><span>Com Larissa Petian</span><small>Terapeuta Ayurveda</small></p>
        </div>

        <div className="meu-ritmo-card-wrap">
          <div className="meu-ritmo-card">
            <div className="meu-ritmo-portrait"><img src="/images/meu-ritmo-larissa.jpg" alt="Larissa Petian, terapeuta Ayurveda e professora de Yoga" /></div>
            <form id="cadastro" className="meu-ritmo-form" onSubmit={(event) => void submit(event)} noValidate>
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
                <input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} required aria-required="true" />
                <span>Autorizo o uso do meu nome, e-mail e WhatsApp para registrar minha inscrição no Meu Ritmo, conforme a <button type="button" onClick={() => setShowPrivacy(true)}>Política de Privacidade</button>. Este aceite é obrigatório.</span>
              </label>
              <label className="meu-ritmo-consent meu-ritmo-marketing-consent">
                <input type="checkbox" checked={communicationsConsent} onChange={(event) => setCommunicationsConsent(event.target.checked)} />
                <span>Quero receber novidades do lançamento por e-mail e WhatsApp. Opcional, posso retirar este aceite quando quiser.</span>
              </label>

              {error && <p className="meu-ritmo-error" role="alert">{error}</p>}
              <button className="meu-ritmo-submit" type="submit" disabled={submitting}>
                {submitting ? 'Salvando sua inscrição…' : 'Entrar no grupo do WhatsApp'}
                {!submitting && <ArrowRight aria-hidden="true" size={19} />}
              </button>
              <p className="meu-ritmo-privacy"><ShieldCheck aria-hidden="true" size={16} /> Após a inscrição, você será direcionada ao grupo.</p>
            </form>
          </div>
        </div>
      </section>

      <section className="meu-ritmo-empathy">
        <div className="meu-ritmo-section-inner meu-ritmo-empathy-inner">
          <p className="meu-ritmo-kicker"><Heart aria-hidden="true" size={16} /> Um espaço para recomeçar com gentileza</p>
          <h2>Você não precisa esperar ter mais energia para começar a se cuidar.</h2>
          <p>Se a ansiedade, o cansaço ou a insatisfação com o próprio corpo têm pesado, talvez você não precise de mais cobrança. Quando os dias parecem uma sequência de tarefas, é fácil deixar suas próprias necessidades para depois. O Meu Ritmo propõe pequenas escolhas para você observar o que te faz bem e criar uma rotina com mais presença, disposição e espaço para si.</p>
          <a className="meu-ritmo-text-link" href="#cadastro">Quero conhecer a jornada <ArrowRight aria-hidden="true" size={17} /></a>
        </div>
      </section>

      <section className="meu-ritmo-includes">
        <div className="meu-ritmo-section-inner">
          <div className="meu-ritmo-section-heading">
            <p className="meu-ritmo-kicker"><Sparkles aria-hidden="true" size={16} /> O que você encontra no Meu Ritmo</p>
            <h2>Conhecimento que sai da teoria e encontra lugar no seu dia.</h2>
            <p>Uma jornada de 21 dias com recursos práticos para experimentar uma forma mais consciente de se alimentar, se movimentar e organizar seus momentos de cuidado.</p>
          </div>
          <div className="meu-ritmo-feature-grid">
            <article className="meu-ritmo-feature-card">
              <span className="meu-ritmo-feature-icon"><Leaf aria-hidden="true" size={22} /></span>
              <h3>Roteiros para o seu dosha</h3>
              <p>Referências de alimentação e rotina inspiradas no Ayurveda, organizadas por dosha para ajudar você a dar os primeiros passos com mais clareza.</p>
            </article>
            <article className="meu-ritmo-feature-card">
              <span className="meu-ritmo-feature-icon"><Waves aria-hidden="true" size={22} /></span>
              <h3>Yoga online</h3>
              <p>Aulas online para você praticar onde estiver e trazer respiração e movimento para a sua semana, sem precisar sair de casa.</p>
            </article>
            <article className="meu-ritmo-feature-card">
              <span className="meu-ritmo-feature-icon"><UsersRound aria-hidden="true" size={22} /></span>
              <h3>Comunidade só de mulheres</h3>
              <p>Um espaço de troca entre mulheres que também querem olhar para a própria rotina com mais intenção e menos cobrança.</p>
            </article>
            <article className="meu-ritmo-feature-card">
              <span className="meu-ritmo-feature-icon"><Heart aria-hidden="true" size={22} /></span>
              <h3>Larissa por perto</h3>
              <p>Acompanhamento exclusivo da Larissa durante a jornada, com orientação para você percorrer os conteúdos e levar as práticas para a vida real.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="meu-ritmo-doshas">
        <div className="meu-ritmo-section-inner meu-ritmo-doshas-layout">
          <div className="meu-ritmo-section-heading">
            <p className="meu-ritmo-kicker"><Leaf aria-hidden="true" size={16} /> Ayurveda que considera a sua natureza</p>
            <h2>Três doshas. Diferentes caminhos para voltar ao equilíbrio.</h2>
            <p>O Ayurveda observa tendências e ritmos individuais. No Meu Ritmo, os roteiros por dosha são um ponto de partida para experimentar hábitos mais alinhados com você, sem fórmulas rígidas.</p>
          </div>
          <div className="meu-ritmo-dosha-list">
            <article className="meu-ritmo-dosha-card">
              <span className="meu-ritmo-dosha-icon"><Wind aria-hidden="true" size={21} /></span>
              <div><h3>Vata <small>ar e espaço</small></h3><p>Um roteiro com sugestões de refeições acolhedoras, horários mais regulares e pausas para trazer mais ritmo e estabilidade ao dia.</p></div>
            </article>
            <article className="meu-ritmo-dosha-card">
              <span className="meu-ritmo-dosha-icon"><Sun aria-hidden="true" size={21} /></span>
              <div><h3>Pitta <small>fogo e água</small></h3><p>Um roteiro com sugestões de alimentação equilibrada, intervalos e momentos de desacelerar para cultivar mais leveza na rotina.</p></div>
            </article>
            <article className="meu-ritmo-dosha-card">
              <span className="meu-ritmo-dosha-icon"><Waves aria-hidden="true" size={21} /></span>
              <div><h3>Kapha <small>terra e água</small></h3><p>Um roteiro com sugestões de refeições variadas, movimento gradual e hábitos que convidem à ação e à renovação.</p></div>
            </article>
          </div>
        </div>
        <p className="meu-ritmo-note">Os doshas são uma lente tradicional do Ayurveda para autoconhecimento; os roteiros são educativos e não substituem acompanhamento individual de saúde.</p>
      </section>

      <section className="meu-ritmo-support">
        <div className="meu-ritmo-section-inner meu-ritmo-support-inner">
          <div><p className="meu-ritmo-kicker"><Heart aria-hidden="true" size={16} /> Caminho acompanhado</p><h2>Você não precisa descobrir tudo sozinha.</h2></div>
          <div><p>Ao longo dos 21 dias, a Larissa conduz essa experiência pensada para mulheres: uma combinação de conhecimento ayurvédico, práticas possíveis e um espaço de apoio para seguir um passo de cada vez.</p><p>Sem exigir uma rotina perfeita. Sem transformar autocuidado em mais uma cobrança. A proposta é perceber, experimentar e construir um ritmo que faça sentido para a sua vida.</p><a className="meu-ritmo-cta" href="#cadastro">Quero entrar na lista do lançamento <ArrowRight aria-hidden="true" size={18} /></a></div>
        </div>
      </section>

      <section className="meu-ritmo-bio">
        <div className="meu-ritmo-section-inner meu-ritmo-bio-inner">
          <img src="/post-biografia.png" alt="Larissa Petian, professora de Hatha e Vinyasa Yoga e terapeuta Ayurveda" />
          <div>
            <p className="meu-ritmo-kicker"><Heart aria-hidden="true" size={16} /> Prazer, eu sou a Larissa</p>
            <h2>Ayurveda para a vida real, com mais escuta e menos regra.</h2>
            <p>Sou professora de Hatha e Vinyasa Yoga e Terapeuta Ayurveda. Criei o Meu Ritmo para compartilhar uma forma mais gentil, prática e sustentável de olhar para a alimentação e a rotina.</p>
          </div>
        </div>
      </section>

      <section className="meu-ritmo-final-cta">
        <div className="meu-ritmo-section-inner"><p className="meu-ritmo-kicker"><Sparkles aria-hidden="true" size={16} /> Seu próximo passo pode ser simples</p><h2>Conheça o Meu Ritmo por dentro.</h2><p>Cadastre-se para receber as novidades do lançamento e entrar no grupo oficial de WhatsApp.</p><a className="meu-ritmo-cta" href="#cadastro">Quero receber as novidades <ArrowRight aria-hidden="true" size={18} /></a></div>
      </section>

      <FooterLogo className="meu-ritmo-footer" />
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
    </main>
  )
}
