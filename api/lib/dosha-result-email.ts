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
  return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="border-collapse:separate"><tr><td align="center" bgcolor="#c96e4a" style="border-radius:8px;background-color:#c96e4a"><a href="${url}" style="display:inline-block;padding:15px 22px;border:1px solid #c96e4a;border-radius:8px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:20px;text-decoration:none">${label}</a></td></tr></table>`
}

export function createDoshaResultEmail({ firstName, primary, secondary, isBalanced, percentages }: ResultEmailInput) {
  const reading = getDoshaResultReading({ primary, secondary, isBalanced })
  const safeName = escapeHtml(firstName)
  const scoreColumns = (['vata', 'pitta', 'kapha'] as Dosha[])
    .map((dosha, index) => `<td width="33.33%" align="center" style="padding:0 ${index === 1 ? '12px' : '0'};${index < 2 ? 'border-right:1px solid #e6dfd3;' : ''}"><p style="margin:0;color:#6a7664;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.8px;line-height:16px;text-transform:uppercase">${doshaName[dosha]}</p><p style="margin:7px 0 0;color:#183d31;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:34px">${percentages[dosha]}%</p></td>`)
    .join('')
  const insights = reading.content.insights
    .map((insight, index) => `<tr><td valign="top" width="28" style="padding:0 0 16px"><span style="display:inline-block;width:22px;height:22px;border-radius:11px;background-color:#e9f0e5;color:#183d31;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;line-height:22px;text-align:center">${index + 1}</span></td><td valign="top" style="padding:1px 0 16px;color:#314334;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px">${insight}</td></tr>`)
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
    html: `<!doctype html><html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml"><head><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Seu resultado dosha</title></head><body style="margin:0;padding:0;background-color:#f7f4ed"><div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;color:#f7f4ed;font-size:1px;line-height:1px">Sua leitura de dosha chegou: um primeiro passo para respeitar o seu ritmo.</div><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#f7f4ed;mso-table-lspace:0pt;mso-table-rspace:0pt"><tr><td align="center" style="padding:32px 16px 40px"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#fffdf8;border:1px solid #e6dfd3;mso-table-lspace:0pt;mso-table-rspace:0pt"><tr><td bgcolor="#183d31" style="height:6px;line-height:6px;font-size:0;background-color:#183d31">&nbsp;</td></tr><tr><td style="padding:34px 36px 0"><p style="margin:0;color:#b86442;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.8px;line-height:16px;text-transform:uppercase">Ayurveda para vida real</p><h1 style="margin:18px 0 0;color:#183d31;font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:400;letter-spacing:-0.4px;line-height:42px">${safeName}, esta é a sua leitura.</h1><p style="margin:18px 0 0;color:#314334;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px">${reading.summary}</p></td></tr><tr><td style="padding:28px 36px 0"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#f4f0e7"><tr><td style="padding:24px 22px 22px"><p style="margin:0;color:#6a7664;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;line-height:16px;text-transform:uppercase">Sua distribuição</p><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;margin-top:18px;border-collapse:collapse"><tr>${scoreColumns}</tr></table></td></tr></table></td></tr><tr><td style="padding:34px 36px 0"><h2 style="margin:0;color:#183d31;font-family:Georgia,'Times New Roman',serif;font-size:27px;font-weight:400;line-height:33px">${reading.headline}${reading.secondaryText}</h2><p style="margin:24px 0 16px;color:#6a7664;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;line-height:16px;text-transform:uppercase">O que isso pode revelar</p><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;border-collapse:collapse">${insights}</table></td></tr><tr><td style="padding:8px 36px 0"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#e9f0e5"><tr><td style="padding:24px"><p style="margin:0;color:#b86442;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;line-height:16px;text-transform:uppercase">Seu primeiro ritual</p><p style="margin:10px 0 0;color:#314334;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px">${reading.content.ritual}</p></td></tr></table><p style="margin:20px 0 0;color:#6a7664;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px">Esta é uma leitura educativa de autoconhecimento, não um diagnóstico.</p></td></tr><tr><td style="padding:34px 36px 0"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#183d31" style="width:100%;border-collapse:collapse;background-color:#183d31"><tr><td style="padding:28px"><p style="margin:0;color:#dfb49b;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;line-height:16px;text-transform:uppercase">Pré-lançamento Meu Ritmo</p><h2 style="margin:12px 0 0;color:#fffdf8;font-family:Georgia,'Times New Roman',serif;font-size:27px;font-weight:400;line-height:33px">Continue essa jornada com a Larissa.</h2><p style="margin:14px 0 22px;color:#dce5d9;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px">Entre no grupo do WhatsApp para receber os primeiros detalhes, condições especiais e ser avisada antes da abertura.</p>${emailButton(prelaunchWhatsAppUrl, 'Entrar no grupo de pré-lançamento')}</td></tr></table></td></tr><tr><td style="padding:36px"><p style="margin:0;color:#6a7664;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px">Com carinho,<br><strong style="color:#314334">Larissa Petian</strong></p></td></tr></table></td></tr></table></body></html>`,
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
