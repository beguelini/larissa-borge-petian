import { ArrowRight, Check, Info } from 'lucide-react'
import { useState } from 'react'
import type { Dosha, QuizResult } from '../types'
import {
  ebookEducationNote,
  ebookIncludedContent,
  ebookOffers,
  formatEbookPrice,
  getEbookOfferSelection,
  type EbookOffer,
} from '../lib/ebook-offers'

type EbookOfferSectionProps = {
  result: QuizResult
  hasValidResult: boolean
}

export function EbookOfferSection({ result, hasValidResult }: EbookOfferSectionProps) {
  const selection = getEbookOfferSelection(result, hasValidResult)
  const [selectedDosha, setSelectedDosha] = useState<Dosha | null>(null)
  const selectedOfferDosha = selectedDosha && selection.availableDoshas.includes(selectedDosha) ? selectedDosha : null
  const activeDosha = selection.requiresChoice && selectedOfferDosha
    ? selectedOfferDosha
    : selection.requiresChoice ? null : selection.defaultDosha
  const offer = activeDosha ? ebookOffers[activeDosha] : null

  if (!selection.availableDoshas.length) return null

  return (
    <section className="ebook-offer-section" aria-label="Oferta de e-book Sabores do Meu Ritmo">
      <div className="shell ebook-offer-shell">
        {selection.requiresChoice && (
          <fieldset className="ebook-choice">
            <legend>Seu resultado reúne características de mais de um dosha. Eu preparei edições diferentes para você explorar. Escolha qual deseja conhecer primeiro.</legend>
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
            <p>Sua escolha serve apenas para conhecer o conteúdo, sem alterar o resultado do seu questionário.</p>
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

              <div className="ebook-purchase">
                <div>
                  <strong>{formatEbookPrice(offer.amountInCents, offer.currency)}</strong>
                  <span>E-book digital • {offer.editionName}</span>
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
