const recipient = 'lariiptn@gmail.com'

type EmailMessage = { subject: string; preheader: string; html: string; text: string }
type DailyReportInput = {
  reportDate: string
  doshaTotal: number
  communityTotal: number
  daily: { date: string; dosha: number; community: number }[]
}
type SaleInput = { productName: string; transaction: string; amount: number; currency: string; occurredAt: string }

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character)
}

function displayDate(value: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'long' }) {
  return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'America/Sao_Paulo' }).format(new Date(value))
}

function shell(title: string, preheader: string, content: string) {
  return `<!doctype html><html lang="pt-BR"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body style="margin:0;padding:0;background:#f7f4ed;color:#314334;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ed;padding:28px 12px"><tr><td align="center"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fffdf8;border:1px solid #e6dfd3;border-radius:12px;overflow:hidden"><tr><td style="height:7px;background:#183d31;font-size:0">&nbsp;</td></tr><tr><td style="padding:32px 34px 36px"><p style="margin:0;color:#b86442;font-size:11px;font-weight:700;letter-spacing:1.7px;text-transform:uppercase">Ayurveda para vida real · Larissa Petian</p>${content}<p style="margin:28px 0 0;color:#6a7664;font-size:13px;line-height:20px">Com carinho,<br><strong style="color:#314334">Larissa</strong></p></td></tr></table><p style="margin:14px 0 0;color:#8b938b;font-size:11px">Um lembrete diário de que cada passo no próprio ritmo importa.</p></td></tr></table></body></html>`
}

export function createSaleNotificationEmail(input: SaleInput): EmailMessage {
  const product = escapeHtml(input.productName)
  const transaction = escapeHtml(input.transaction)
  const saleTime = displayDate(input.occurredAt, { dateStyle: 'long', timeStyle: 'short' })
  let amount = `${input.amount.toLocaleString('pt-BR')} ${input.currency}`
  try {
    amount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: input.currency }).format(input.amount)
  } catch { /* Keep the provider amount and currency when it is not an ISO currency code. */ }
  const subjectProduct = input.productName.replace(/[\r\n]+/g, ' ').trim().slice(0, 100)
  const subject = `Uma nova conquista para celebrar: ${subjectProduct}`
  const preheader = `Uma nova venda aprovada de ${input.productName}.`
  const html = shell(subject, preheader, `<h1 style="margin:18px 0 0;color:#183d31;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:400;line-height:38px">Uma conquista para celebrar ✨</h1><p style="margin:16px 0 0;color:#46584a;font-size:15px;line-height:24px">Larissa, mais uma pessoa escolheu receber o seu trabalho. Cada venda representa uma mulher dando espaço a novas possibilidades de cuidado, alimentação e rotina no próprio ritmo.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;background:#eef2e9;border-radius:8px"><tr><td style="padding:18px 20px"><p style="margin:0;color:#71806f;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Venda aprovada</p><p style="margin:9px 0 0;color:#183d31;font-size:18px;font-weight:700">${product}</p><p style="margin:7px 0 0;color:#435648;font-size:14px;line-height:21px">${escapeHtml(amount)} · ${escapeHtml(saleTime)}<br>Transação ${transaction}</p></td></tr></table><p style="margin:20px 0 0;color:#46584a;font-size:15px;line-height:24px">Que essa notícia renove sua energia para seguir guiando mulheres com conhecimento, acolhimento e passos possíveis.</p>`)
  const text = `Uma conquista para celebrar!\n\nMais uma pessoa escolheu receber o seu trabalho. Cada venda representa uma mulher dando espaço a novas possibilidades de cuidado, alimentação e rotina no próprio ritmo.\n\nVenda aprovada: ${input.productName}\nValor: ${amount}\nData: ${saleTime}\nTransação: ${input.transaction}\n\nQue essa notícia renove sua energia para seguir guiando mulheres com conhecimento, acolhimento e passos possíveis.\n\nCom carinho,\nLarissa`
  return { subject, preheader, html, text }
}

export function createDailyReportEmail(input: DailyReportInput): EmailMessage {
  const reportDate = displayDate(`${input.reportDate}T12:00:00Z`)
  const subject = `Seu panorama diário · ${reportDate}`
  const preheader = `Novos cadastros do teste dos doshas e da comunidade Meu Ritmo.`
  const rows = input.daily.map((day) => `<tr><td style="padding:11px 8px;border-top:1px solid #e6e8df;color:#435648;font-size:13px">${escapeHtml(displayDate(`${day.date}T12:00:00Z`, { day: '2-digit', month: 'short' }))}</td><td align="center" style="padding:11px 8px;border-top:1px solid #e6e8df;color:#183d31;font-size:14px;font-weight:700">${day.dosha}</td><td align="center" style="padding:11px 8px;border-top:1px solid #e6e8df;color:#183d31;font-size:14px;font-weight:700">${day.community}</td></tr>`).join('')
  const html = shell(subject, preheader, `<h1 style="margin:18px 0 0;color:#183d31;font-family:Georgia,'Times New Roman',serif;font-size:31px;font-weight:400;line-height:38px">O cuidado está chegando a mais mulheres</h1><p style="margin:13px 0 0;color:#667368;font-size:14px;line-height:22px">Panorama de cadastros do projeto até ${escapeHtml(reportDate)}.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:23px"><tr><td width="50%" style="padding:17px;background:#eef2e9;border-radius:8px"><p style="margin:0;color:#71806f;font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase">Teste dos doshas</p><p style="margin:8px 0 0;color:#183d31;font-family:Georgia,'Times New Roman',serif;font-size:34px">${input.doshaTotal.toLocaleString('pt-BR')}</p><p style="margin:3px 0 0;color:#6a7664;font-size:12px">cadastros no total</p></td><td width="12"></td><td width="50%" style="padding:17px;background:#f7eee6;border-radius:8px"><p style="margin:0;color:#a45739;font-size:11px;font-weight:700;letter-spacing:.6px;text-transform:uppercase">Comunidade Meu Ritmo</p><p style="margin:8px 0 0;color:#183d31;font-family:Georgia,'Times New Roman',serif;font-size:34px">${input.communityTotal.toLocaleString('pt-BR')}</p><p style="margin:3px 0 0;color:#6a7664;font-size:12px">interessadas no total</p></td></tr></table><h2 style="margin:29px 0 8px;color:#183d31;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400">Novos cadastros por dia</h2><p style="margin:0 0 12px;color:#758076;font-size:12px;line-height:18px">Inscrições dos últimos sete dias, incluindo hoje.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse"><thead><tr><th align="left" style="padding:9px 8px;background:#f5f2ea;color:#738073;font-size:10px;letter-spacing:.4px;text-transform:uppercase">Dia</th><th align="center" style="padding:9px 8px;background:#f5f2ea;color:#738073;font-size:10px;letter-spacing:.4px;text-transform:uppercase">Teste dos doshas</th><th align="center" style="padding:9px 8px;background:#f5f2ea;color:#738073;font-size:10px;letter-spacing:.4px;text-transform:uppercase">Meu Ritmo</th></tr></thead><tbody>${rows}</tbody></table><p style="margin:22px 0 0;padding:16px 18px;background:#eef2e9;border-left:3px solid #849875;color:#46584a;font-size:14px;line-height:22px">Cada cadastro começa com uma mulher buscando se compreender e encontrar um ritmo mais possível. Seu conhecimento está abrindo esse caminho, um passo de cada vez.</p>`)
  const dailyText = input.daily.map((day) => `${displayDate(`${day.date}T12:00:00Z`, { day: '2-digit', month: 'short' })}: teste dos doshas ${day.dosha} · Meu Ritmo ${day.community}`).join('\n')
  const text = `O cuidado está chegando a mais mulheres\nPanorama de cadastros do projeto até ${reportDate}.\n\nTESTE DOS DOSHAS\n${input.doshaTotal.toLocaleString('pt-BR')} cadastros no total\n\nCOMUNIDADE MEU RITMO\n${input.communityTotal.toLocaleString('pt-BR')} interessadas no total\n\nNOVOS CADASTROS POR DIA · ÚLTIMOS SETE DIAS\n${dailyText}\n\nCada cadastro começa com uma mulher buscando se compreender e encontrar um ritmo mais possível. Seu conhecimento está abrindo esse caminho, um passo de cada vez.\n\nCom carinho,\nLarissa`
  return { subject, preheader, html, text }
}

export async function sendLarissaNotificationEmail(message: EmailMessage, idempotencyKey: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) return { sent: false, reason: 'not_configured' as const }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ from, to: [recipient], subject: message.subject, html: message.html, text: message.text }),
      signal: AbortSignal.timeout(8000),
    })
    return { sent: response.ok, reason: response.ok ? null : `resend_${response.status}` }
  } catch {
    return { sent: false, reason: 'resend_unreachable' as const }
  }
}
