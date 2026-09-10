export function trackMetaLead() {
  if (typeof window === 'undefined') return
  window.fbq?.('track', 'Lead')
}
