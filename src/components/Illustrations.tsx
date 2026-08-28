type IllustrationProps = {
  className?: string
}

export function BotanicalRhythm({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 420 260" fill="none" aria-hidden="true">
      <path d="M214 251C204 183 220 117 273 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M233 151C264 151 292 135 307 104C276 104 247 120 233 151Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M249 105C227 92 216 69 218 43C241 57 254 80 249 105Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M274 66C299 67 320 54 333 31C308 28 287 40 274 66Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M210 221C171 203 142 171 130 126" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M157 169C130 169 107 155 94 130C121 128 144 142 157 169Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M139 139C156 119 161 94 152 70C132 90 127 115 139 139Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="210" cy="224" r="12" stroke="currentColor" strokeWidth="2" />
      <circle cx="210" cy="224" r="2.5" fill="currentColor" />
      <path d="M41 224H129M291 224H379" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  )
}

export function BotanicalSprig({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 240 230" fill="none" aria-hidden="true">
      <path d="M35 210C99 171 137 104 150 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M114 127C78 127 53 113 39 87C73 86 99 99 114 127Z" stroke="currentColor" strokeWidth="2" />
      <path d="M137 75C107 69 89 50 84 24C113 32 132 49 137 75Z" stroke="currentColor" strokeWidth="2" />
      <path d="M126 101C161 102 188 87 204 57C169 55 142 70 126 101Z" stroke="currentColor" strokeWidth="2" />
      <path d="M89 157C62 152 42 136 32 113C59 117 80 132 89 157Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function RitmoEssencialDrawing({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 640 500" fill="none" aria-hidden="true">
      <path d="M74 421C201 391 339 403 563 367" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <path d="M381 109L538 79L568 321L411 352L381 109Z" fill="#29483d" stroke="#f1dfc7" strokeWidth="3" />
      <path d="M397 101L538 79L548 302L408 329L397 101Z" fill="#18382d" stroke="#d9b478" strokeWidth="2" />
      <text x="473" y="171" fill="#f3dfc0" fontFamily="Georgia, serif" fontSize="22" textAnchor="middle">RITMO</text>
      <text x="473" y="198" fill="#f3dfc0" fontFamily="Georgia, serif" fontSize="22" textAnchor="middle">ESSENCIAL</text>
      <path d="M460 229C472 218 482 203 486 185M470 215C460 211 453 202 452 192M478 205C489 205 497 199 502 189" stroke="#d9b478" strokeWidth="1.8" strokeLinecap="round" />
      <text x="477" y="270" fill="#f3dfc0" fontFamily="Arial, sans-serif" fontSize="10" textAnchor="middle">CADERNO MEU RITMO</text>
      <path d="M110 252C112 195 164 157 227 166C289 175 323 222 312 277C302 333 251 365 189 356C127 347 107 307 110 252Z" stroke="#d9b478" strokeWidth="3" />
      <path d="M121 242C177 256 247 253 304 235" stroke="#d9b478" strokeWidth="2" />
      <path d="M312 232C357 229 372 249 367 277C362 305 340 316 311 303" stroke="#d9b478" strokeWidth="3" strokeLinecap="round" />
      <path d="M149 188C181 201 243 200 280 181" stroke="#f0c998" strokeWidth="2" opacity="0.7" />
      <path d="M125 400C179 371 243 345 309 332" stroke="#8fa08f" strokeWidth="3" strokeLinecap="round" />
      <path d="M206 369C180 365 161 351 151 331C177 333 197 347 206 369Z" stroke="#8fa08f" strokeWidth="2" />
      <path d="M245 352C230 332 227 311 235 291C252 310 255 331 245 352Z" stroke="#8fa08f" strokeWidth="2" />
      <path d="M279 340C303 339 322 327 333 305C309 304 289 316 279 340Z" stroke="#8fa08f" strokeWidth="2" />
      <path d="M74 424L570 370" stroke="#f1dfc7" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}
