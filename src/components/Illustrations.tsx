type IllustrationProps = {
  className?: string
}

export function BotanicalRhythm({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 420 260" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M192 234C191 190 201 151 222 116C241 84 266 56 299 29" />
        <path d="M197 203C170 187 145 166 127 138" />
        <path d="M207 170C231 155 252 137 267 115" />
        <path d="M240 89C260 83 278 72 293 57" />
        <path d="M127 138C99 132 78 111 74 82C102 89 122 110 127 138Z" />
        <path d="M156 174C129 171 106 156 95 132C122 132 146 150 156 174Z" />
        <path d="M187 150C169 132 166 106 176 82C197 100 201 126 187 150Z" />
        <path d="M267 115C294 113 319 97 331 73C304 74 279 91 267 115Z" />
        <path d="M293 57C317 59 340 46 351 24C327 25 303 38 293 57Z" />
        <circle cx="192" cy="234" r="10" />
        <circle cx="192" cy="234" r="2.5" fill="currentColor" stroke="none" />
        <path d="M41 234H126M276 234H379" strokeWidth="1.5" opacity="0.45" />
      </g>
    </svg>
  )
}

export function BotanicalSprig({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 240 230" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M33 211C83 180 121 138 144 92C158 64 166 40 170 17" />
        <path d="M83 179C66 159 48 146 28 140" />
        <path d="M107 148C84 142 64 128 53 107" />
        <path d="M130 116C153 107 174 90 188 66" />
        <path d="M151 70C135 56 130 36 136 16C155 31 159 51 151 70Z" />
        <path d="M53 107C30 104 13 90 7 70C29 74 47 88 53 107Z" />
        <path d="M28 140C11 134 -1 122 -6 105C12 108 25 120 28 140Z" />
        <path d="M188 66C210 66 229 54 239 36C217 37 197 48 188 66Z" />
      </g>
    </svg>
  )
}

export function RitmoEssencialDrawing({ className }: IllustrationProps) {
  return (
    <svg className={className} viewBox="0 0 640 500" fill="none" aria-hidden="true">
      <path d="M70 420C208 399 377 405 572 363" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.28" />
      <path d="M357 92L525 116L496 354L328 330L357 92Z" fill="#29483d" stroke="#f1dfc7" strokeWidth="3" strokeLinejoin="round" />
      <path d="M371 105L512 126L487 339L346 318L371 105Z" fill="#18382d" stroke="#d9b478" strokeWidth="2" strokeLinejoin="round" />
      <text x="430" y="191" fill="#f3dfc0" fontFamily="Georgia, serif" fontSize="22" textAnchor="middle">RITMO</text>
      <text x="430" y="218" fill="#f3dfc0" fontFamily="Georgia, serif" fontSize="22" textAnchor="middle">ESSENCIAL</text>
      <path d="M420 250C430 235 438 219 440 200M428 235C417 230 410 220 409 208M434 223C445 222 453 216 457 205" stroke="#d9b478" strokeWidth="1.8" strokeLinecap="round" />
      <text x="426" y="288" fill="#f3dfc0" fontFamily="Arial, sans-serif" fontSize="10" textAnchor="middle">CADERNO MEU RITMO</text>
      <g stroke="#d9b478" strokeLinecap="round" strokeLinejoin="round">
        <path d="M108 263C108 205 153 166 212 166C271 166 316 205 316 263C316 321 271 360 212 360C153 360 108 321 108 263Z" strokeWidth="3" />
        <path d="M120 244C173 257 252 257 304 244" strokeWidth="2" />
        <path d="M316 235C351 233 370 251 370 278C370 305 350 320 316 310" strokeWidth="3" />
        <path d="M147 204C182 215 241 215 277 204" stroke="#f0c998" strokeWidth="2" opacity="0.72" />
      </g>
      <g stroke="#8fa08f" strokeLinecap="round" strokeLinejoin="round">
        <path d="M123 400C181 374 245 349 311 332" strokeWidth="3" />
        <path d="M197 367C174 362 157 347 149 326C172 330 190 345 197 367Z" strokeWidth="2" />
        <path d="M239 353C225 334 224 313 232 294C249 312 251 333 239 353Z" strokeWidth="2" />
        <path d="M277 341C300 339 319 326 329 305C307 306 287 318 277 341Z" strokeWidth="2" />
      </g>
      <path d="M70 423H570" stroke="#f1dfc7" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}
