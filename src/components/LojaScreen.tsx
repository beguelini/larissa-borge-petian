import { ArrowRight, BookOpen, CalendarDays, Headphones, Heart, Menu, Minus, PlayCircle, Plus, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import '../storefront.css'
import '../storefront-digital.css'
import { ebookOffers, formatEbookPrice } from '../lib/ebook-offers'
import { trackMetaEbookCheckout } from '../lib/meta-pixel'

type Category = 'Todos' | 'Chás' | 'Ervas & especiarias' | 'Kits'

type Product = {
  id: string
  category: Exclude<Category, 'Todos'>
  name: string
  description: string
  size: string
  price: string
  image: string
  imageAlt: string
}

const categories: Category[] = ['Todos', 'Chás', 'Ervas & especiarias', 'Kits']

const products: Product[] = [
  { id: 'cha-pausa', category: 'Chás', name: 'Chá Pausa', description: 'Camomila, melissa e capim-limão para uma pausa quente e perfumada.', size: '40 g · folhas soltas', price: 'R$ 38,00', image: '/loja-cha-botanico.png', imageAlt: 'Pote âmbar com chá de ervas e flores secas' },
  { id: 'cha-manha', category: 'Chás', name: 'Chá Manhã Serena', description: 'Erva-doce, casca de laranja e gengibre em uma mistura aromática.', size: '40 g · folhas soltas', price: 'R$ 38,00', image: '/loja-cha-botanico.png', imageAlt: 'Mistura de chá de ervas em pote de vidro' },
  { id: 'cha-ritual', category: 'Chás', name: 'Chá Ritual da Tarde', description: 'Hibisco, canela e pétalas de calêndula para desacelerar o fim do dia.', size: '40 g · folhas soltas', price: 'R$ 42,00', image: '/loja-cha-botanico.png', imageAlt: 'Chá botânico em pote com xícara de cerâmica' },
  { id: 'tempero-dourado', category: 'Ervas & especiarias', name: 'Tempero Dourado', description: 'Cúrcuma, cominho e coentro para trazer cor e presença à cozinha.', size: '55 g · mistura em pó', price: 'R$ 32,00', image: '/loja-especiarias.png', imageAlt: 'Latas de especiarias com cúrcuma e cardamomo' },
  { id: 'masala-cotidiana', category: 'Ervas & especiarias', name: 'Masala Cotidiana', description: 'Funcho, cardamomo e canela para chás, frutas e preparos do dia a dia.', size: '55 g · mistura em pó', price: 'R$ 34,00', image: '/loja-especiarias.png', imageAlt: 'Especiarias naturais em latas minimalistas' },
  { id: 'kit-cozinha', category: 'Kits', name: 'Kit Cozinha com Calma', description: 'Uma seleção inicial de chás e ervas para criar um ritual mais seu.', size: '3 itens · caixa presenteável', price: 'R$ 96,00', image: '/loja-kit-ritual.png', imageAlt: 'Caixa de presente com chás de ervas, frascos e colher de madeira' },
]

export function LojaScreen() {
  const [category, setCategory] = useState<Category>('Todos')
  const [cart, setCart] = useState<string[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    document.title = 'Loja | Larissa Petian'
  }, [])

  const visibleProducts = useMemo(() => category === 'Todos' ? products : products.filter((product) => product.category === category), [category])
  const cartItems = useMemo(() => products.filter((product) => cart.includes(product.id)), [cart])

  function toggleProduct(productId: string) {
    setCart((items) => items.includes(productId) ? items.filter((item) => item !== productId) : [...items, productId])
  }

  return (
    <main className="storefront-page">
      <div className="storefront-notice">Produtos físicos demonstrativos · e-books e caminhos digitais já disponíveis</div>
      <header className="storefront-header">
        <a className="storefront-brand" href="/" aria-label="Voltar para Larissa Petian"><img src="/logo-lp.png" alt="Larissa Petian" /></a>
        <nav className="storefront-nav" aria-label="Categorias da loja">
          {categories.slice(1).map((item) => <a key={item} href="#colecao">{item}</a>)}<a href="#produtos-digitais">E-books</a>
        </nav>
        <div className="storefront-tools">
          <button className="storefront-icon-button" type="button" aria-label="Buscar produtos"><Search size={19} /></button>
          <button className="storefront-icon-button" type="button" aria-label="Itens salvos"><Heart size={19} /></button>
          <button className="storefront-cart-button" type="button" onClick={() => setCartOpen(true)} aria-label={`Abrir cesta com ${cart.length} ${cart.length === 1 ? 'item' : 'itens'}`}><ShoppingBag size={19} /><span>{cart.length}</span></button>
          <button className="storefront-icon-button storefront-menu-button" type="button" aria-label="Abrir menu"><Menu size={21} /></button>
        </div>
      </header>

      <section className="storefront-hero">
        <div className="storefront-hero-copy">
          <p>Para a sua cozinha, no seu ritmo.</p>
          <h1>Pequenos rituais que começam na despensa.</h1>
          <span>Chás, ervas e especiarias para trazer mais intenção aos seus preparos cotidianos.</span>
          <a href="#colecao">Conhecer a coleção <ArrowRight size={18} aria-hidden="true" /></a>
        </div>
        <div className="storefront-hero-image"><img src="/loja-kit-ritual.png" alt="Seleção de chás e ervas em uma caixa presenteável" /></div>
      </section>

      <section className="storefront-digital" id="produtos-digitais" aria-labelledby="storefront-digital-title">
        <div className="storefront-section-heading">
          <div><p>Para continuar em casa</p><h2 id="storefront-digital-title">Sabores do Meu Ritmo.</h2></div>
          <span>Produto digital · acesso pela Hotmart</span>
        </div>
        <p className="storefront-digital-intro">Três e-books com receitas, sugestões de refeições e apoio para organizar a sua rotina com mais presença e menos cobrança.</p>
        <div className="storefront-ebook-grid">
          {Object.values(ebookOffers).map((offer) => <article className="storefront-ebook-card" key={offer.id}>
            <img src={offer.imageSrc} alt={offer.imageAlt} loading="lazy" />
            <div><p>{offer.editionName}</p><h3>{offer.productName}</h3><span>{offer.identification}</span><strong>{formatEbookPrice(offer.amountInCents, offer.currency)}</strong><a href={offer.checkoutUrl} onClick={() => trackMetaEbookCheckout(offer.id)} rel="noreferrer" referrerPolicy="no-referrer">Quero esta edição <ArrowRight size={17} aria-hidden="true" /></a></div>
          </article>)}
        </div>
        <a className="storefront-text-link" href="/sabores-do-meu-ritmo">Conhecer as três edições <ArrowRight size={18} aria-hidden="true" /></a>
      </section>

      <div className="storefront-marquee" aria-label="Mensagem da loja"><span>MAIS PRESENÇA À MESA · MAIS TEMPO PARA O QUE IMPORTA · INGREDIENTES PARA A VIDA REAL · </span><span>MAIS PRESENÇA À MESA · MAIS TEMPO PARA O QUE IMPORTA · INGREDIENTES PARA A VIDA REAL · </span></div>

      <section className="storefront-collection" id="colecao" aria-labelledby="storefront-collection-title">
        <div className="storefront-section-heading">
          <div><p>Coleção inicial</p><h2 id="storefront-collection-title">Escolha por onde começar.</h2></div>
          <span>Itens físicos · preparação artesanal</span>
        </div>
        <div className="storefront-filters" aria-label="Filtrar produtos">
          {categories.map((item) => <button key={item} className={category === item ? 'is-active' : ''} type="button" onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="storefront-product-grid">
          {visibleProducts.map((product) => {
            const inCart = cart.includes(product.id)
            return <article className="storefront-product" key={product.id}>
              <div className="storefront-product-image"><img src={product.image} alt={product.imageAlt} loading="lazy" /><button type="button" aria-label={`Salvar ${product.name}`}><Heart size={18} /></button></div>
              <div className="storefront-product-copy"><p>{product.category}</p><h3>{product.name}</h3><span>{product.description}</span><small>{product.size}</small><div><strong>{product.price}</strong><button type="button" onClick={() => toggleProduct(product.id)}>{inCart ? <Minus size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}{inCart ? 'Remover' : 'Adicionar'}</button></div></div>
            </article>
          })}
        </div>
      </section>

      <section className="storefront-editorial">
        <img src="/loja-especiarias.png" alt="Especiarias naturais para a cozinha" />
        <div><p>Uma despensa possível</p><h2>O cuidado também mora nas coisas simples que você prepara todos os dias.</h2><span>Sem promessas prontas: apenas ingredientes escolhidos para inspirar pausas, aromas e presença na sua cozinha.</span><a href="#colecao">Ver ervas e especiarias <ArrowRight size={18} aria-hidden="true" /></a></div>
      </section>

      <section className="storefront-pathways" aria-label="Caminhos de cuidado com Larissa Petian">
        <article className="storefront-consultation"><CalendarDays aria-hidden="true" size={27} /><p>Consulta online</p><h2>Um espaço individual para olhar sua rotina com a Larissa.</h2><span>Uma hora de consulta, um retorno e acompanhamento por WhatsApp entre os encontros.</span><a href="/consulta">Quero minha consulta <ArrowRight size={18} aria-hidden="true" /></a></article>
        <article className="storefront-community"><div className="storefront-community-icons"><Headphones aria-hidden="true" size={22} /><BookOpen aria-hidden="true" size={22} /><PlayCircle aria-hidden="true" size={22} /></div><p>Comunidade Meu Ritmo</p><h2>Um caminho para voltar a se escutar, no seu tempo.</h2><span>Áudios, caderno, vídeos e área de membros para acompanhar sua jornada com mais presença.</span><a href="/inscricao">Conhecer Meu Ritmo <ArrowRight size={18} aria-hidden="true" /></a></article>
      </section>

      <footer className="storefront-footer"><img src="/logo-larissa-petian.png" alt="Larissa Petian" /><span>Ayurveda para a vida real.</span><a href="/">Teste dos doshas</a><a href="/consulta">Consultas</a><a href="/sabores-do-meu-ritmo">E-books</a><a href="/inscricao">Meu Ritmo</a></footer>

      {cartOpen && <aside className="storefront-cart-panel" aria-label="Sua cesta demonstrativa"><div className="storefront-cart-backdrop" onClick={() => setCartOpen(false)} /><section><header><div><p>Sua cesta</p><h2>Seleção demonstrativa</h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label="Fechar cesta"><X size={20} /></button></header>{cartItems.length ? <ul>{cartItems.map((item) => <li key={item.id}><img src={item.image} alt="" /><div><strong>{item.name}</strong><span>{item.price}</span></div><button type="button" aria-label={`Remover ${item.name}`} onClick={() => toggleProduct(item.id)}><Minus size={16} /></button></li>)}</ul> : <p className="storefront-empty-cart">Escolha alguns itens da coleção para testar esta cesta.</p>}<footer><span>O checkout ainda não está ativo.</span><button type="button" disabled>Finalizar pedido</button></footer></section></aside>}
    </main>
  )
}
