import { ArrowRight, Heart, Menu, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import '../storefront.css'

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
      <div className="storefront-notice">Catálogo demonstrativo · produtos e valores para referência visual</div>
      <header className="storefront-header">
        <a className="storefront-brand" href="/" aria-label="Voltar para Larissa Petian"><img src="/logo-lp.png" alt="Larissa Petian" /></a>
        <nav className="storefront-nav" aria-label="Categorias da loja">
          {categories.slice(1).map((item) => <a key={item} href="#colecao">{item}</a>)}
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

      <section className="storefront-cta"><div><p>Uma seleção em construção</p><h2>A loja está ganhando forma aos poucos, com espaço para o que combina com a sua rotina.</h2></div><a href="/consulta">Conhecer o trabalho da Larissa <ArrowRight size={18} aria-hidden="true" /></a></section>

      <footer className="storefront-footer"><img src="/logo-larissa-petian.png" alt="Larissa Petian" /><span>Ayurveda para a vida real.</span><a href="/">Teste dos doshas</a><a href="/consulta">Consultas</a><a href="/sabores-do-meu-ritmo">E-books</a></footer>

      {cartOpen && <aside className="storefront-cart-panel" aria-label="Sua cesta demonstrativa"><div className="storefront-cart-backdrop" onClick={() => setCartOpen(false)} /><section><header><div><p>Sua cesta</p><h2>Seleção demonstrativa</h2></div><button type="button" onClick={() => setCartOpen(false)} aria-label="Fechar cesta"><X size={20} /></button></header>{cartItems.length ? <ul>{cartItems.map((item) => <li key={item.id}><img src={item.image} alt="" /><div><strong>{item.name}</strong><span>{item.price}</span></div><button type="button" aria-label={`Remover ${item.name}`} onClick={() => toggleProduct(item.id)}><Minus size={16} /></button></li>)}</ul> : <p className="storefront-empty-cart">Escolha alguns itens da coleção para testar esta cesta.</p>}<footer><span>O checkout ainda não está ativo.</span><button type="button" disabled>Finalizar pedido</button></footer></section></aside>}
    </main>
  )
}
