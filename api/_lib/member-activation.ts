import { createHash, randomBytes } from 'node:crypto'

export function createActivationToken() {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashActivationToken(token) }
}

export function hashActivationToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}
