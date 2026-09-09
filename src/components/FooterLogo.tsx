type FooterLogoProps = { className?: string }

export function FooterLogo({ className = '' }: FooterLogoProps) {
  return <footer className={`site-footer ${className}`}><img src="/logo-larissa-petian.png" alt="Larissa Petian" /><span>Ayurveda para vida real</span><small className="arete-credit">Aplicação desenvolvida por <strong>Aretê</strong> · Excelência em Marketing</small></footer>
}
