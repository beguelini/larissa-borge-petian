import { afterEach, describe, expect, it, vi } from 'vitest'
import { trackMetaLead } from './meta-pixel'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('trackMetaLead', () => {
  it('envia Lead sem dados pessoais quando o Pixel está disponível', () => {
    const fbq = vi.fn()
    vi.stubGlobal('window', { fbq })

    trackMetaLead()

    expect(fbq).toHaveBeenCalledWith('track', 'Lead')
  })

  it('não falha quando o Pixel está bloqueado ou indisponível', () => {
    vi.stubGlobal('window', {})

    expect(() => trackMetaLead()).not.toThrow()
  })
})
