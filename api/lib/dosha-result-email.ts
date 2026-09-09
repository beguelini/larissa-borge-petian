import { doshaName, getDoshaResultReading, prelaunchWhatsAppUrl } from '../../src/lib/result-content.js'
import type { Dosha, DoshaScores } from '../../src/types.js'

type ResultEmailInput = {
  firstName: string
  email: string
  primary: Dosha
  secondary: Dosha | null
  isBalanced: boolean
  percentages: DoshaScores
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

function emailButton(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:30px;padding:15px 22px;border-radius:10px;background:#183d31;color:#fffdf8;font-size:16px;font-weight:700;text-decoration:none">${label}</a>`
}

export function createDoshaResultEmail({ firstName, primary, secondary, isBalanced, percentages }: ResultEmailInput) {
  const reading = getDoshaResultReading({ primary, secondary, isBalanced })
  const safeName = escapeHtml(firstName)
  const scoreRows = (['vata', 'pitta', 'kapha'] as Dosha[])
    .map((dosha) => `<tr><td style="padding:8px 0;color:#667565">${doshaName[dosha]}</td><td style="padding:8px 0;text-align:right;color:#183d31;font-weight:700">${percentages[dosha]}%</td></tr>`)
    .join('')
  const insights = reading.content.insights
    .map((insight, index) => `<li style="margin:0 0 12px;padding-left:4px">${index + 1}. ${insight}</li>`)
    .join('')
  const text = [
    `${firstName}, esta é a sua leitura.`,
    `${reading.headline}${reading.secondaryText}`,
    reading.summary,
    `Sua distribuição: ${(['vata', 'pitta', 'kapha'] as Dosha[]).map((dosha) => `${doshaName[dosha]}: ${percentages[dosha]}%`).join(' · ')}`,
    'O que isso pode revelar:',
    ...reading.content.insights.map((insight, index) => `${index + 1}. ${insight}`),
    `Seu primeiro ritual: ${reading.content.ritual}`,
    'Esta é uma leitura educativa de autoconhecimento, não um diagnóstico.',
    `Entre no grupo de pré-lançamento Meu Ritmo: ${prelaunchWhatsAppUrl}`,
  ].join('\n\n')

  return {
    subject: `Seu resultado dosha está pronto, ${firstName}`,
    text,
    html: `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f7f4ed;color:#183d31;font-family:Arial,sans-serif"><main style="max-width:600px;margin:0 auto;padding:42px 24px"><p style="margin:0 0 24px;color:#b86442;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase">Ayurveda para vida real</p><h1 style="margin:0;font-family:Georgia,serif;font-size:42px;font-weight:400;line-height:1.06">${safeName}, esta é a sua leitura.</h1><h2 style="margin:28px 0 0;font-family:Georgia,serif;font-size:30px;font-weight:400;line-height:1.18">${reading.headline}${reading.secondaryText}</h2><p style="margin:18px 0 0;font-size:17px;line-height:1.6">${reading.summary}</p><section style="margin-top:30px;padding:22px 24px;background:#fffdf8;border-radius:12px"><h2 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:400">Sua distribuição</h2><table style="width:100%;margin-top:12px;border-collapse:collapse;font-size:16px">${scoreRows}</table></section><section style="margin-top:32px"><h2 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:400">O que isso pode revelar</h2><ol style="margin:18px 0 0;padding-left:22px;font-size:16px;line-height:1.55">${insights}</ol></section><section style="margin-top:30px;padding:24px;background:#e9f0e5;border-radius:12px"><p style="margin:0 0 10px;color:#b86442;font-size:12px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase">Seu primeiro ritual</p><p style="margin:0;font-size:16px;line-height:1.6">${reading.content.ritual}</p></section><p style="margin:28px 0 0;color:#667565;font-size:13px;line-height:1.6">Esta é uma leitura educativa de autoconhecimento, não um diagnóstico.</p><section style="margin-top:32px;padding:28px;background:#183d31;border-radius:14px;color:#fffdf8"><p style="margin:0;color:#d9ad91;font-size:12px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase">Pré-lançamento Meu Ritmo</p><h2 style="margin:12px 0 0;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.15">Continue essa jornada com a Larissa.</h2><p style="margin:14px 0 0;color:#dce5d9;font-size:16px;line-height:1.55">Entre no grupo do WhatsApp para receber os primeiros detalhes, condições especiais e ser avisada antes da abertura.</p>${emailButton(prelaunchWhatsAppUrl, 'Entrar no grupo de pré-lançamento')}</section><p style="margin:42px 0 0;color:#667565;font-size:13px;line-height:1.6">Com carinho,<br>Larissa Petian</p></main></body></html>`,
  }
}

export async function sendDoshaResultEmail(input: ResultEmailInput) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) return { sent: false, reason: 'not_configured' as const }

  const message = createDoshaResultEmail(input)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [input.email], subject: message.subject, html: message.html, text: message.text }),
  })

  return { sent: response.ok, reason: response.ok ? null : `resend_${response.status}` }
}
