import type { Family } from './model'

const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })
const prefix = 'rota1.'
const aad = encoder.encode('casa-em-rota/v1')
const columns = 'id,ciphertext,revision'
const url = import.meta.env?.VITE_FAMILY_SUPABASE_URL
const publicKey = import.meta.env?.VITE_FAMILY_SUPABASE_PUBLISHABLE_KEY

export type VaultKeys = { cipher: CryptoKey; access: string }
type Record = { id: string; ciphertext: string; revision: number }
export type Snapshot = { row: Record; family: Family }
export type Edit = (family: Family) => Family

function encode(bytes: Uint8Array) {
  return btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''))
    .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function decode(value: string) {
  return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), byte => byte.charCodeAt(0))
}

export async function deriveKeys(code: string): Promise<VaultKeys> {
  if (!/^rota1\.[A-Za-z0-9_-]{43}$/.test(code)) throw new Error('Confira a chave privada e tente novamente.')
  const material = await crypto.subtle.importKey('raw', decode(code.slice(prefix.length)), 'HKDF', false, ['deriveKey', 'deriveBits'])
  const params = (info: string) => ({ name: 'HKDF', hash: 'SHA-256', salt: aad, info: encoder.encode(info) })
  const [cipher, bits] = await Promise.all([
    crypto.subtle.deriveKey(params('encryption'), material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']),
    crypto.subtle.deriveBits(params('access'), material, 256),
  ])
  return { cipher, access: encode(new Uint8Array(bits)) }
}

export async function seal(family: Family, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, key, encoder.encode(JSON.stringify(family)))
  return 'v1.' + encode(iv) + '.' + encode(new Uint8Array(data))
}

async function unseal(record: Record, key: CryptoKey): Promise<Snapshot> {
  const [version, iv, data] = record.ciphertext.split('.')
  if (version !== 'v1' || !iv || !data) throw new Error('Formato de cofre indisponível.')
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(iv), additionalData: aad }, key, decode(data))
  const family = JSON.parse(decoder.decode(plain)) as Family
  if (family.version !== 1) throw new Error('Formato de cofre indisponível.')
  return { row: record, family }
}

async function request(access: string, query: string, init: RequestInit = {}): Promise<Record[]> {
  if (!url || !publicKey) throw new Error('O cofre ainda está sendo configurado.')
  const response = await fetch(url + '/rest/v1/casa_em_rota_vaults?select=' + columns + query, {
    ...init, cache: 'no-store', signal: AbortSignal.timeout(10000), referrerPolicy: 'no-referrer',
    headers: { apikey: publicKey, 'x-family-access': access, ...init.headers },
  })
  if (!response.ok) throw new Error('Falha ao acessar o cofre. Tente novamente em instantes.')
  return response.json()
}

export async function readVault(keys: VaultKeys) {
  const [row] = await request(keys.access, '&limit=1')
  if (!row) throw new Error('Chave privada inválida.')
  return unseal(row, keys.cipher)
}

export async function writeVault(keys: VaultKeys, edit: Edit): Promise<Snapshot> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const previous = await readVault(keys)
    const family = edit(previous.family)
    const ciphertext = await seal(family, keys.cipher)
    if (ciphertext.length > 1000000) throw new Error('O cofre atingiu seu limite de armazenamento.')
    const [row] = await request(keys.access, '&id=eq.' + previous.row.id + '&revision=eq.' + previous.row.revision, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ ciphertext, revision: previous.row.revision + 1 }),
    })
    if (row) return { row, family }
  }
  throw new Error('O cofre foi atualizado em outro aparelho. Tente salvar novamente.')
}
