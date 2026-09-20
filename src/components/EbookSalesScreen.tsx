import { ArrowRight, Check, ChevronDown, HeartHandshake, LockKeyhole, ShoppingBag } from 'lucide-react'
import { useEffect } from 'react'
import '../ebook-promo.css'
import { FooterLogo } from './FooterLogo'
import { ebookEducationNote, ebookIncludedContent, ebookOffers, formatEbookPrice } from '../lib/ebook-offers'
import { trackMetaEbookCheckout, trackMetaEbookSalesView } from '../lib/meta-pixel'
import type { Dosha } from '../types'

const editions: Dosha[] = ['vata', 'pitta', 'kapha']

const faqs = [
  ['Preciso fazer o teste dos doshas antes?', 'Não. Você pode escolher qualquer edição para começar. Cada uma oferece a mesma proposta de cuidado possível, com receitas e sugestões de rotina para o seu momento.'],
  ['O e-book é uma dieta para emagrecer?', 'Não. Sabores do Meu Ritmo não propõe dieta restritiva, metas de peso ou padrões de corpo. É um material educativo para apoiar uma relação mais presente e organizada com a alimentação.'],
  ['Este conteúdo trata ansiedade ou compulsão alimentar?', 'Não. O material pode inspirar pausas e uma rotina alimentar mais regular, mas não substitui acompanhamento psicológico, médico ou nutricional. Se ansiedade, compulsão ou sofrimento com o corpo estiverem pesando, procure apoio profissional qualificado.'],
  ['Como recebo o meu e-book?', 'Depois da compra aprovada no checkout seguro da Hotmart, você recebe as instruções de acesso no e-mail informado na compra.'],
]

function CheckoutButton({ dosha, compact = false }: { dosha: Dosha; compact?: boolean }) {
  const offer = ebookOffers[dosha]

  return (
    <a
      className={`ebook-sales-checkout${compact ? ' ebook-sales-checkout-compact' : ''}`}
      href={offer.checkoutUrl}
      onClick={() => trackMetaEbookCheckout(dosha)}
      rel="noreferrer"
      referrerPolicy="no-referrer"
    >
      <span>{compact ? `Quero a edição ${dosha.charAt(0).toUpperCase()}${dosha.slice(1)}` : offer.buttonLabel}</span>
      <ArrowRight aria-hidden="true" size={compact ? 18 : 21} />
    </a>
  )
}

export function EbookSalesScreen() {
  useEffect(() => {
    trackMetaEbookSalesView()
    document.title = 'Sabores do Meu Ritmo | Larissa Petian'
  }, [])

  return (
    <main className="ebook-sales-page">
      <header className="ebook-sales-header shell">
        <a href="/" className="ebook-sales-brand" aria-label="Voltar para Larissa Petian">
          <img src="/logo-lp.png" alt="Larissa Petian" />
          <span>Sabores do Meu Ritmo</span>
        </a>
        <a className="ebook-sales-member-link" href="/meu-ritmo">Já tenho meu e-book</a>
      </header>

      <section className="ebook-sales-hero">
        <div className="shell ebook-sales-hero-grid">
          <div className="ebook-sales-hero-copy">
            <h1>Sua rotina alimentar pode ser um lugar de paz.</h1>
            <p>Três e-books com receitas práticas e inspiração do Ayurveda para você deixar o improviso, a culpa e a rigidez de lado — e voltar a comer de um jeito mais possível para a sua vida.</p>
            <div className="ebook-sales-promo" aria-label="Oferta promocional"><span>Preço promocional por tempo limitado</span><strong>5 x de R$ 3,58</strong><small>ou R$ 17,90 à vista · parcelamento sem juros*</small><p>Por menos de R$ 1 por dia, você pode transformar sua rotina através da alimentação nos próximos 7 dias.</p></div>
            <a className="ebook-sales-primary-action" href="#edicoes">Conhecer as 3 edições <ArrowRight aria-hidden="true" size={21} /></a>
            <small>Conteúdo digital • acesso após a confirmação da compra</small>
          </div>
          <div className="ebook-sales-cover-rail" aria-label="As três edições de Sabores do Meu Ritmo">
            {editions.map((dosha) => <img key={dosha} src={ebookOffers[dosha].imageSrc} alt={ebookOffers[dosha].imageAlt} />)}
          </div>
        </div>
      </section>

      <section className="ebook-sales-recognition">
        <div className="shell ebook-sales-recognition-grid">
          <div>
            <h2>Você não precisa se punir para cuidar de si.</h2>
            <p>Talvez você já tenha tentado controlar tudo: cortar alimentos, recomeçar na segunda-feira, ignorar a fome, se comparar. E, quando o dia aperta, a comida parece virar a única pausa possível.</p>
          </div>
          <div className="ebook-sales-recognition-note">
            <p>Não é falta de força de vontade. Muitas vezes, é o sinal de uma rotina que está pedindo mais previsibilidade, acolhimento e menos cobrança.</p>
            <span>Comida pode ser cuidado. Nunca castigo.</span>
          </div>
        </div>
      </section>

      <section className="ebook-sales-reframe shell" aria-labelledby="reframe-title">
        <div className="ebook-sales-reframe-image"><img src="/ads-teste-dosha-gratuito-v2.png" alt="Larissa Petian em ambiente acolhedor" /></div>
        <div>
          <h2 id="reframe-title">Um caminho para quem quer se alimentar sem viver em guerra com o próprio corpo.</h2>
          <p>Sabores do Meu Ritmo não é uma dieta da moda e não exige perfeição. É uma coleção de guias práticos para ajudar você a montar refeições, planejar a semana e criar pequenas pausas de presença — mesmo quando a mente está acelerada.</p>
          <p>Você não precisa caber em um padrão para merecer cuidado. Precisa de escolhas que façam sentido na sua cozinha, na sua agenda e no seu corpo real.</p>
        </div>
      </section>

      <section id="edicoes" className="ebook-sales-editions" aria-labelledby="editions-title">
        <div className="shell">
          <div className="ebook-sales-section-heading">
            <h2 id="editions-title">Três caminhos. Um mesmo cuidado.</h2>
            <p>Escolha a edição que mais conversa com o seu momento. O resultado do teste não limita sua escolha.</p>
          </div>
          <div className="ebook-sales-edition-grid">
            {editions.map((dosha) => {
              const offer = ebookOffers[dosha]
              return (
                <article className={`ebook-sales-edition edition-${dosha}`} key={dosha}>
                  <img src={offer.imageSrc} alt={offer.imageAlt} />
                  <div>
                    <p>{offer.editionName}</p>
                    <h3>{dosha === 'vata' ? 'Para trazer mais aterramento aos dias corridos.' : dosha === 'pitta' ? 'Para criar leveza quando tudo parece urgente.' : 'Para retomar o movimento com gentileza.'}</h3>
                    <span>5 x de R$ 3,58</span>
                    <small className="ebook-edition-promo">ou {formatEbookPrice(offer.amountInCents, offer.currency)} à vista · promoção por tempo limitado</small>
                    <CheckoutButton dosha={dosha} compact />
                  </div>
                </article>
              )
            })}
          </div>
          <p className="ebook-sales-edition-note">Cada edição é um e-book digital individual. A compra é processada no checkout seguro da Hotmart.</p>
        </div>
      </section>

      <section className="ebook-sales-inside shell" aria-labelledby="inside-title">
        <div>
          <h2 id="inside-title">O que você encontra dentro.</h2>
          <p>Estrutura suficiente para ajudar você a sair do “o que eu vou comer hoje?” sem colocar mais uma obrigação impossível na sua lista.</p>
        </div>
        <ul>
          {ebookIncludedContent.slice(0, 6).map((item) => <li key={item}><Check aria-hidden="true" size={18} />{item}</li>)}
        </ul>
      </section>

      <section className="ebook-sales-authority" aria-labelledby="author-title">
        <div className="shell ebook-sales-authority-grid">
          <figure><img src="/post-biografia.png" alt="Larissa Petian, professora de yoga e terapeuta Ayurveda" /></figure>
          <div>
            <p>Prazer, eu sou a Larissa</p>
            <h2 id="author-title">Ayurveda para a vida real, com mais escuta e menos regra.</h2>
            <span>Sou professora de Hatha e Vinyasa Yoga e Terapeuta Ayurveda. Criei estes e-books para compartilhar uma forma mais gentil, prática e sustentável de olhar para a alimentação e a rotina.</span>
            <a href="https://www.instagram.com/larissapetian/" target="_blank" rel="noreferrer">Acompanhe meu trabalho no Instagram <ArrowRight aria-hidden="true" size={18} /></a>
          </div>
        </div>
      </section>

      <section className="ebook-sales-faq" aria-labelledby="faq-title">
        <div className="shell">
          <h2 id="faq-title">Antes de escolher, talvez isso ajude.</h2>
          <div className="ebook-sales-faq-list">
            {faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown aria-hidden="true" size={19} /></summary><p>{answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="ebook-sales-final" aria-labelledby="final-title">
        <div className="shell">
          <HeartHandshake aria-hidden="true" size={27} />
          <h2 id="final-title">Comece com uma refeição possível hoje.</h2>
          <p>Escolha a sua edição e dê o primeiro passo para uma rotina com mais presença, prazer e menos culpa.</p>
          <div className="ebook-sales-final-actions">
            {editions.map((dosha) => <CheckoutButton key={dosha} dosha={dosha} compact />)}
          </div>
          <p className="ebook-sales-security"><LockKeyhole aria-hidden="true" size={16} /> Compra protegida pelo checkout da Hotmart <ShoppingBag aria-hidden="true" size={16} /></p>
          <p className="ebook-sales-disclaimer">{ebookEducationNote}</p>
        </div>
      </section>
      <FooterLogo className="ebook-sales-footer" />
    </main>
  )
}
