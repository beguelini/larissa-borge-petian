import { ArrowRight, ClipboardCheck } from 'lucide-react'
import { BotanicalRhythm, BotanicalSprig } from './Illustrations'

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

      <section className="gentle-path">
        <div className="shell gentle-path-inner">
          <div>
            <h2>Um caminho prático e gentil para o seu dia a dia</h2>
            <p>Sem regras rígidas. Sem fórmulas prontas. Apenas o que faz sentido para você.</p>
          </div>
          <BotanicalSprig className="gentle-drawing" />
        </div>
      </section>

      <footer className="landing-footer">Ayurveda para a vida real</footer>
    </div>
  )
}
