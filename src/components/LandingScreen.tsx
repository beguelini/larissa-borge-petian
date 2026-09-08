import { ArrowRight, ArrowUpRight, ClipboardCheck } from 'lucide-react'
import { BotanicalRhythm, BotanicalSprig } from './Illustrations'
import { FooterLogo } from './FooterLogo'

type LandingScreenProps = {
  onStart: () => void
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="landing-screen">
      <section className="hero shell">
        <div className="hero-copy">
          <h1>Entenda o que o seu corpo está pedindo para você se sentir mais leve</h1>
          <p>
            Seu corpo dá sinais todos os dias. Faça o teste de doshas gratuito e descubra um primeiro
            caminho para cuidar de você com mais presença, gentileza e sentido.
          </p>
          <button className="primary-button" type="button" onClick={onStart}>
            Fazer meu teste gratuito
            <ArrowRight aria-hidden="true" size={20} strokeWidth={1.8} />
          </button>
          <p className="trust-line">É gratuito e leva cerca de 3 minutos.</p>
          <a className="hero-whatsapp-cta" href="https://chat.whatsapp.com/HvofSYG7Ysg5w3uvLuup7W?mode=gi_t" target="_blank" rel="noreferrer">Entrar no grupo de pré-lançamento no WhatsApp <ArrowUpRight aria-hidden="true" size={18} /></a>
        </div>
        <BotanicalRhythm className="hero-drawing" />
      </section>

      <section className="quiz-preview shell" aria-label="O que você vai encontrar">
        <div className="preview-icon" aria-hidden="true">
          <ClipboardCheck size={28} strokeWidth={1.6} />
        </div>
        <div>
          <h2>O que você vai encontrar</h2>
          <p>
            Em 15 perguntas simples, você entende melhor sua energia em <strong>corpo, mente e rotina.</strong>
          </p>
        </div>
      </section>

      <section className="home-editorial" aria-label="Conheça o Ayurveda">
        <button className="home-editorial-frame" type="button" onClick={onStart}>
          <img src="/ads-teste-dosha-gratuito-v2.png" alt="Material introdutório: você já cuida do seu bem-estar, agora conheça o Ayurveda." />
          <span>Iniciar questionário <ArrowUpRight aria-hidden="true" size={19} /></span>
        </button>
      </section>

      <section className="gentle-path">
        <div className="shell gentle-path-inner">
          <div>
            <h2>Um caminho prático e gentil para o seu dia a dia</h2>
            <p>Sem regras rígidas e sem fórmulas prontas. Apenas um cuidado que faz sentido para você.</p>
          </div>
          <BotanicalSprig className="gentle-drawing" />
        </div>
      </section>

      <FooterLogo className="landing-footer" />
    </div>
  )
}
