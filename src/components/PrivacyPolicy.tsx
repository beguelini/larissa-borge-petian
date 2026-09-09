import { X } from 'lucide-react'
import { FooterLogo } from './FooterLogo'

type PrivacyPolicyProps = {
  onClose: () => void
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <div className="privacy-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="privacy-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="privacy-close" type="button" aria-label="Fechar política de privacidade" onClick={onClose}>
          <X aria-hidden="true" size={22} />
        </button>
        <h1 id="privacy-title">Política de Privacidade</h1>
        <p>Última atualização: 27 de agosto de 2026.</p>

        <h2>Quais dados usamos</h2>
        <p>Nome, e-mail, respostas e resultado do questionário, consentimentos e informações básicas de origem da visita.</p>

        <h2>Para que usamos</h2>
        <p>Para liberar sua leitura, entender o interesse no conteúdo da Larissa e enviar o resultado, conteúdos e novidades por e-mail conforme o aceite informado no cadastro.</p>

        <h2>Com quem compartilhamos</h2>
        <p>Os dados são processados pela infraestrutura da Vercel e armazenados no Supabase. Não vendemos seus dados.</p>

        <h2>Seus direitos</h2>
        <p>Você pode pedir confirmação, acesso, correção ou exclusão dos seus dados, além de retirar o consentimento de comunicações a qualquer momento.</p>

        <h2>Contato</h2>
        <p>Para exercer seus direitos, entre em contato pelo <a href="https://www.instagram.com/larissaborgepetian/">Instagram da Larissa Petian</a> enquanto o e-mail oficial de privacidade é definido.</p>

        <p className="privacy-disclaimer">O questionário é educativo e não substitui avaliação ou orientação de profissional de saúde.</p>
        <button className="primary-button" type="button" onClick={onClose}>Entendi</button>
        <FooterLogo className="privacy-footer" />
      </section>
    </div>
  )
}
