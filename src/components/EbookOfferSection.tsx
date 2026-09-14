import { ArrowRight, Check, Info } from 'lucide-react'
import { useState } from 'react'
import type { Dosha } from '../types'
import {
  ebookEducationNote,
  ebookIncludedContent,
  ebookOffers,
  formatEbookPrice,
  getEbookOfferSelection,
  type EbookOffer,
} from '../lib/ebook-offers'

export function EbookOfferSection() {
  const selection = getEbookOfferSelection()
  const [selectedDosha, setSelectedDosha] = useState<Dosha | null>(null)
  const selectedOfferDosha = selectedDosha && selection.availableDoshas.includes(selectedDosha) ? selectedDosha : null
  const activeDosha = selectedOfferDosha ?? selection.defaultDosha
  const offer = activeDosha ? ebookOffers[activeDosha] : null

  if (!selection.availableDoshas.length) return null

  return (
    <section className="ebook-offer-section" aria-label="Oferta de e-book Sabores do Meu Ritmo">
      <div className="shell ebook-offer-shell">
        <header className="ebook-result-intro">
          <p>Seu resultado é um ponto de partida</p>
          <h2>Transforme essa leitura em refeições que acolhem a sua mente.</h2>
          <span>O Sabores do Meu Ritmo foi criado para quem quer sair do improviso, ter mais regularidade e construir uma relação mais gentil com a comida — especialmente nos dias em que a ansiedade acelera tudo.</span>
        </header>
        {selection.requiresChoice && (
          <fieldset className="ebook-choice">
            <legend>Escolha a edição que deseja receber. Todas foram pensadas para uma rotina alimentar mais acolhedora e estável, independentemente do resultado do seu questionário.</legend>
            <div className="ebook-choice-options">
              {selection.availableDoshas.map((dosha) => {
                const option = ebookOffers[dosha]
                const inputId = `ebook-offer-${dosha}`

                return (
                  <label className="ebook-choice-option" htmlFor={inputId} key={dosha}>
                    <input
                      id={inputId}
                      type="radio"
                      name="ebook-offer"
                      value={dosha}
                      checked={selectedDosha === dosha}
                      onChange={() => setSelectedDosha(dosha)}
                    />
                    <span>{option.editionName}</span>
                  </label>
                )
              })}
            </div>
            <p>Sua escolha define apenas a edição que você quer receber, sem alterar o resultado do seu questionário.</p>
          </fieldset>
        )}

        {offer && (
          <article className="ebook-offer-card">
            <EbookCover key={offer.id} offer={offer} />

            <div className="ebook-offer-copy">
              <p className="ebook-identification">{offer.identification}</p>
              <p className="ebook-name">{offer.productName}</p>
              <p className="ebook-edition">{offer.editionName}</p>
              <h2>{offer.title}</h2>

              <div className="ebook-purchase">
                <div>
                  <strong>{formatEbookPrice(offer.amountInCents, offer.currency)}</strong>
                  <span>E-book digital • {offer.editionName}</span>
                  <span className="ebook-installment">12 x de R$ 4,86* no cartão de crédito</span>
                </div>
                <a
                  className="product-button ebook-checkout"
                  href={offer.checkoutUrl}
                  rel="noreferrer"
                  referrerPolicy="no-referrer"
                >
                  {offer.buttonLabel}<ArrowRight aria-hidden="true" size={20} strokeWidth={1.8} />
                </a>
              </div>

              <div className="ebook-presentation">
                {offer.presentation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>

              <ul className="ebook-highlights" aria-label={`Destaques da ${offer.editionName}`}>
                {offer.highlights.map((highlight) => (
                  <li key={highlight}><Check aria-hidden="true" size={18} strokeWidth={2} />{highlight}</li>
                ))}
              </ul>

              <section className="ebook-included-content" aria-labelledby="ebook-included-title">
                <h3 id="ebook-included-title">O que eu preparei para você</h3>
                <ul>
                  {ebookIncludedContent.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>

              <p className="ebook-education-note"><Info aria-hidden="true" size={17} />{ebookEducationNote}</p>
            </div>
          </article>
        )}
      </div>
    </section>
  )
}

function EbookCover({ offer }: { offer: EbookOffer }) {
  const [isCoverAvailable, setIsCoverAvailable] = useState(true)
  if (!isCoverAvailable) return <span className="ebook-cover-unavailable" aria-hidden="true" />

  return (
    <figure className="ebook-cover">
      <img
        src={offer.imageSrc}
        alt={offer.imageAlt}
        width={1254}
        height={1254}
        onError={() => setIsCoverAvailable(false)}
      />
    </figure>
  )
}
