type Dosha = 'vata' | 'pitta' | 'kapha'

type ResultEmailInput = {
  firstName: string
  email: string
  primary: Dosha
  secondary: Dosha | null
}

const doshaNames: Record<Dosha, string> = {
  vata: 'Vata',
  pitta: 'Pitta',
  kapha: 'Kapha',
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character)
}

export function createDoshaResultEmail({ firstName, primary, secondary }: ResultEmailInput) {
  const primaryName = doshaNames[primary]
  const profile = secondary ? `${primaryName} com traços de ${doshaNames[secondary]}` : primaryName
  const safeName = escapeHtml(firstName)

  return {
    subject: `Seu resultado dosha está pronto, ${firstName}`,
    html: `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f7f4ed;color:#183d31;font-family:Arial,sans-serif"><main style="max-width:600px;margin:0 auto;padding:42px 24px"><p style="margin:0 0 24px;color:#b86442;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase">Ayurveda para vida real</p><h1 style="margin:0;font-family:Georgia,serif;font-size:42px;font-weight:400;line-height:1.06">${safeName}, seu resultado está pronto.</h1><p style="margin:28px 0 0;font-size:18px;line-height:1.6">O seu dosha predominante é <strong>${profile}</strong>. Este é um convite para observar seu ritmo com mais curiosidade e gentileza.</p><p style="margin:20px 0 0;font-size:16px;line-height:1.6">Você já pode abrir a sua leitura e dar o próximo passo no seu tempo.</p><a href="https://larissaborgepetian.com.br/" style="display:inline-block;margin-top:30px;padding:15px 22px;border-radius:10px;background:#183d31;color:#fffdf8;font-size:16px;font-weight:700;text-decoration:none">Ver meu resultado</a><p style="margin:42px 0 0;color:#667565;font-size:13px;line-height:1.6">Com carinho,<br>Larissa Petian</p></main></body></html>`,
  }
}

export async function sendDoshaResultEmail(input: ResultEmailInput) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) return { sent: false, reason: 'not_configured' as const }

  const message = createDoshaResultEmail(input)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: message.subject,
      html: message.html,
    }),
  })

  return { sent: response.ok, reason: response.ok ? null : `resend_${response.status}` }
}
