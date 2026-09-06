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
          <h1>Descubra o que o seu corpo vem tentando dizer</h1>
          <p>
            Em poucos minutos, reconheça a energia que mais influencia o seu ritmo — e receba um
            primeiro caminho para cuidar de você com mais leveza.
          </p>
          <button className="primary-button" type="button" onClick={onStart}>
            Descobrir meu dosha
            <ArrowRight aria-hidden="true" size={20} strokeWidth={1.8} />
          </button>
          <p className="trust-line">Leitura educativa • 3 minutos • Gratuito</p>
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
            15 perguntas para entender sua energia em <strong>corpo, mente e rotina.</strong>
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
            <p>Sem regras rígidas. Sem fórmulas prontas. Apenas o que faz sentido para você.</p>
          </div>
          <BotanicalSprig className="gentle-drawing" />
        </div>
      </section>

      <FooterLogo className="landing-footer" />
    </div>
  )
}
