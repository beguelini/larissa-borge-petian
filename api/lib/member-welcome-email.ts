function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] ?? character)
}

export function createMemberWelcomeEmail(input: { firstName: string; activationToken: string }) {
  const firstName = escapeHtml(input.firstName)
  const activationUrl = `https://larissaborgepetian.com.br/meu-ritmo?activation=${encodeURIComponent(input.activationToken)}`
  const text = [
    `Seja bem-vinda ao Meu Ritmo, ${input.firstName}.`,
    'Sua inscrição foi confirmada e sua área de aluna está pronta.',
    `Crie sua senha e acesse: ${activationUrl}`,
    'Com carinho,\nLarissa Petian',
  ].join('\n\n')

  return {
    subject: `Seja bem-vinda ao Meu Ritmo, ${input.firstName}`,
    text,
    html: `<!doctype html><html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml"><head><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><title>Bem-vinda ao Meu Ritmo</title></head><body style="margin:0;padding:0;background-color:#f7f4ed"><div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;color:#f7f4ed;font-size:1px;line-height:1px">Sua área de aluna no Meu Ritmo está pronta.</div><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;border-collapse:collapse;background-color:#f7f4ed"><tr><td align="center" style="padding:32px 16px 40px"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#fffdf8;border:1px solid #e6dfd3"><tr><td bgcolor="#183d31" style="height:6px;line-height:6px;font-size:0;background-color:#183d31">&nbsp;</td></tr><tr><td style="padding:40px 36px"><p style="margin:0;color:#b86442;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.8px;line-height:16px;text-transform:uppercase">Meu Ritmo · Larissa Petian</p><h1 style="margin:18px 0 0;color:#183d31;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:400;letter-spacing:-0.4px;line-height:44px">Seja bem-vinda, ${firstName}.</h1><p style="margin:20px 0 0;color:#314334;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px">Que bonito ter você aqui. Sua inscrição foi confirmada e a sua área de aluna já está pronta para receber o seu ritmo.</p><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;margin-top:28px;border-collapse:collapse;background-color:#e9f0e5"><tr><td style="padding:24px"><p style="margin:0;color:#b86442;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1.5px;line-height:16px;text-transform:uppercase">Seu próximo passo</p><p style="margin:10px 0 0;color:#314334;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px">Crie uma senha pessoal para acessar os 21 áudios, o Caderno Meu Ritmo, materiais e vídeos.</p></td></tr></table><table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-top:28px;border-collapse:separate"><tr><td align="center" bgcolor="#c96e4a" style="border-radius:8px;background-color:#c96e4a"><a href="${activationUrl}" style="display:inline-block;padding:15px 22px;border:1px solid #c96e4a;border-radius:8px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:20px;text-decoration:none">Criar minha senha e acessar</a></td></tr></table><p style="margin:28px 0 0;color:#6a7664;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px">Por segurança, este link é pessoal e válido por 7 dias.</p><p style="margin:32px 0 0;color:#6a7664;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px">Com carinho,<br><strong style="color:#314334">Larissa Petian</strong></p></td></tr></table></td></tr></table></body></html>`,
  }
}

export async function sendMemberWelcomeEmail(input: { firstName: string; email: string; activationToken: string }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) return { sent: false, reason: 'not_configured' as const }

  const message = createMemberWelcomeEmail(input)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [input.email], subject: message.subject, html: message.html, text: message.text }),
  })
  return { sent: response.ok, reason: response.ok ? null : `resend_${response.status}` }
}
