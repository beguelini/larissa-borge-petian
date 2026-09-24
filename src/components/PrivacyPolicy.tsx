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
        <p>Última atualização: 24 de setembro de 2026.</p>

        <h2>Inscrição no Meu Ritmo</h2>
        <p>Larissa Borge Petian é responsável pelo tratamento dos dados informados neste cadastro. Para registrar seu interesse no lançamento e direcionar você ao grupo oficial do WhatsApp, usamos seu nome, e-mail, WhatsApp e dados básicos de origem da visita. O cadastro depende do seu aceite expresso para essa finalidade.</p>

        <h2>Novidades e comunicações</h2>
        <p>O aceite para receber avisos e novidades por e-mail e WhatsApp é opcional e separado do aceite necessário para a inscrição. Você pode se inscrever sem autorizar mensagens promocionais. Se autorizar, poderá retirar esse consentimento a qualquer momento pelo nosso canal de contato.</p>

        <h2>Quais dados usamos</h2>
        <p>Nome, e-mail, WhatsApp, respostas e resultado do questionário, consentimentos e informações básicas de origem da visita, conforme a funcionalidade que você utiliza.</p>

        <h2>Para que usamos</h2>
        <p>Para liberar sua leitura, registrar inscrições, organizar atendimentos e enviar resultados. Também usamos dados para enviar novidades e informações de lançamento somente quando você autorizar separadamente no cadastro.</p>

        <h2>Com quem compartilhamos</h2>
        <p>Os dados são processados pela infraestrutura da Vercel e armazenados no Supabase para operar o site e registrar cadastros. O site usa a Meta para medir eventos de campanha. Não vendemos seus dados. Ao acessar o grupo, o WhatsApp poderá tratar seus dados conforme as próprias políticas do serviço.</p>

        <h2>Armazenamento e segurança</h2>
        <p>Mantemos os dados pelo tempo necessário para as finalidades informadas e para cumprir obrigações aplicáveis. Usamos controles de acesso e medidas técnicas para protegê-los.</p>

        <h2>Seus direitos</h2>
        <p>Nos termos da LGPD, você pode solicitar confirmação do tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados, informações sobre compartilhamento e revogação do consentimento. A revogação não torna irregular o tratamento realizado antes do pedido.</p>

        <h2>Contato</h2>
        <p>Para exercer seus direitos ou retirar consentimento, entre em contato pelo <a href="https://www.instagram.com/larissapetian/">Instagram da Larissa Petian</a> enquanto o e-mail oficial de privacidade é definido. Consulte também a <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank" rel="noreferrer">Lei Geral de Proteção de Dados Pessoais, Lei nº 13.709/2018</a>.</p>

        <p className="privacy-disclaimer">O questionário é educativo e não substitui avaliação ou orientação de profissional de saúde.</p>
        <button className="primary-button" type="button" onClick={onClose}>Entendi</button>
        <FooterLogo className="privacy-footer" />
      </section>
    </div>
  )
}
