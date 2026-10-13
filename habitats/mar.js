'use strict';
Object.assign(HABITATS, {
peixe: { nome: 'aquário', svg: `<g>
 <rect x="30" y="60" width="160" height="146" rx="18" fill="#BFE8FF" opacity=".8"/>
 <rect x="24" y="52" width="172" height="14" rx="7" fill="#7FB8D9"/>
 <rect x="30" y="186" width="160" height="20" rx="8" fill="#F3D9A4"/>
 <rect x="110" y="128" width="50" height="60" fill="#B9A3E0"/>
 <rect x="104" y="116" width="16" height="22" fill="#A88ED6"/><rect x="150" y="116" width="16" height="22" fill="#A88ED6"/>
 <path d="M124 188 L124 168 Q135 156 146 168 L146 188 Z" fill="#6B4E9E"/>
 <path class="balanca" d="M60 188 Q50 160 62 140 Q72 120 62 100" stroke="#5CC157" stroke-width="7" fill="none" stroke-linecap="round"/>
 <circle cx="44" cy="190" r="8" fill="#F28C8C"/><circle cx="90" cy="192" r="6" fill="#FFD84D"/>
</g>` },
baleia: { nome: 'oceano', svg: `<g>
 <rect x="10" y="80" width="200" height="126" rx="20" fill="#3E86C9"/>
 <path d="M10 92 Q35 70 60 92 Q85 70 110 92 Q135 70 160 92 Q185 70 210 92 L210 110 L10 110 Z" fill="#5BA7E6"/>
 <path class="balanca" d="M40 140 Q60 130 80 140 M130 160 Q150 150 170 160 M70 186 Q90 176 110 186" stroke="#8FCBF5" stroke-width="5" fill="none" stroke-linecap="round"/>
 <circle cx="180" cy="40" r="22" fill="#FFD84D"/>
</g>` },
golfinho: { nome: 'onda', svg: `<g>
 <path d="M10 206 L10 130 Q40 60 100 70 Q150 80 140 120 Q120 100 104 116 Q130 130 170 120 Q200 110 210 140 L210 206 Z" fill="#4AA3DF"/>
 <path d="M104 116 Q120 98 140 120" stroke="#E6F6FF" stroke-width="8" fill="none" stroke-linecap="round"/>
 <path d="M30 170 Q60 156 90 170 Q120 184 150 170 Q180 156 200 170" stroke="#8FD3FF" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle class="balanca" cx="150" cy="70" r="6" fill="#E6F6FF"/><circle cx="166" cy="84" r="4" fill="#E6F6FF"/>
</g>` },
tubarao: { nome: 'mar aberto', svg: `<g>
 <rect x="10" y="60" width="200" height="146" rx="22" fill="#24588F"/>
 <rect x="10" y="60" width="200" height="40" rx="20" fill="#3A78B5"/>
 <path d="M40 150 L60 140 L60 160 Z M150 120 L172 110 L172 130 Z" fill="#183E66"/>
 <path class="balanca" d="M30 190 Q60 180 90 190 Q120 200 150 190 Q180 180 200 190" stroke="#3A78B5" stroke-width="6" fill="none" stroke-linecap="round"/>
</g>` },
polvo: { nome: 'gruta', svg: `<g>
 <path d="M14 206 Q10 70 110 56 Q210 70 206 206 Z" fill="#7A6E86"/>
 <path d="M52 206 Q52 110 110 104 Q168 110 168 206 Z" fill="#2E2A40"/>
 <circle cx="40" cy="120" r="10" fill="#968AA2"/><circle cx="180" cy="140" r="8" fill="#968AA2"/><circle cx="100" cy="76" r="7" fill="#968AA2"/>
 <path class="balanca" d="M30 206 Q20 180 34 160" stroke="#4FB04A" stroke-width="7" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="204" rx="96" ry="6" fill="#E8CF94"/>
</g>` },
caranguejo: { nome: 'areia', svg: `<g>
 <path d="M10 206 Q20 140 110 136 Q200 140 210 206 Z" fill="#F3D9A4"/>
 <circle cx="60" cy="170" r="3" fill="#D9B97A"/><circle cx="140" cy="160" r="3" fill="#D9B97A"/><circle cx="170" cy="186" r="3" fill="#D9B97A"/>
 <path d="M40 190 Q50 176 60 190 Z" fill="#F7A6B8"/>
 <path d="M150 180 Q160 164 172 180 Q160 186 150 180 Z" fill="#FFE1A8" stroke="#E0B060" stroke-width="2"/>
 <rect x="104" y="80" width="6" height="70" fill="#A8774E"/>
 <path class="balanca" d="M110 82 L150 92 L110 104 Z" fill="#F0503C"/>
</g>` },
lagosta: { nome: 'rocha', svg: `<g>
 <path d="M20 206 Q14 140 60 110 Q110 76 160 106 Q206 140 200 206 Z" fill="#8C8C9A"/>
 <path d="M60 130 Q90 110 120 124" stroke="#B0B0BE" stroke-width="8" fill="none" stroke-linecap="round"/>
 <ellipse cx="150" cy="170" rx="22" ry="16" fill="#6E6E7C"/>
 <path class="balanca" d="M40 206 Q30 176 44 156" stroke="#3E9E4F" stroke-width="7" fill="none" stroke-linecap="round"/>
 <path d="M180 206 Q190 180 178 162" stroke="#3E9E4F" stroke-width="7" fill="none" stroke-linecap="round"/>
</g>` },
'estrela-do-mar': { nome: 'praia', svg: `<g>
 <rect x="10" y="80" width="200" height="70" rx="16" fill="#5BB8F0"/>
 <path d="M10 150 Q60 130 110 146 Q160 160 210 140 L210 206 L10 206 Z" fill="#F7DDA6"/>
 <path d="M10 146 Q60 126 110 142 Q160 156 210 136" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle cx="170" cy="50" r="20" fill="#FFD84D"/>
 <path d="M50 186 Q60 170 70 186 Z" fill="#F7A6B8"/>
 <rect x="150" y="160" width="8" height="40" rx="3" fill="#A8774E"/>
 <path class="balanca" d="M154 162 Q120 164 126 146 Q154 140 182 146 Q188 164 154 162 Z" fill="#F05A7E"/>
</g>` },
'cavalo-marinho': { nome: 'alga', svg: `<g>
 <ellipse cx="110" cy="200" rx="90" ry="10" fill="#E8CF94"/>
 <path class="balanca" d="M70 200 Q50 160 74 120 Q96 80 72 40" stroke="#3E9E4F" stroke-width="14" fill="none" stroke-linecap="round"/>
 <path d="M110 200 Q130 160 108 124 Q90 90 112 56" stroke="#5CC157" stroke-width="14" fill="none" stroke-linecap="round"/>
 <path d="M150 200 Q170 170 150 140 Q134 110 156 84" stroke="#2C7A3A" stroke-width="14" fill="none" stroke-linecap="round"/>
 <ellipse cx="86" cy="96" rx="12" ry="6" fill="#5CC157" transform="rotate(-30 86 96)"/>
 <ellipse cx="124" cy="140" rx="12" ry="6" fill="#8CCB5E" transform="rotate(30 124 140)"/>
</g>` },
alforreca: { nome: 'mar fundo', svg: `<g>
 <rect x="10" y="40" width="200" height="166" rx="24" fill="#1E3A6B"/>
 <circle cx="50" cy="80" r="3" fill="#BFE3FF"/><circle cx="170" cy="70" r="4" fill="#BFE3FF"/><circle cx="140" cy="130" r="3" fill="#BFE3FF"/><circle cx="70" cy="150" r="2.5" fill="#BFE3FF"/>
 <path d="M10 60 L60 206 M80 40 L110 206 M150 40 L130 206" stroke="#2E5590" stroke-width="10" opacity=".7"/>
 <ellipse cx="110" cy="200" rx="96" ry="8" fill="#3A4A6E"/>
 <circle class="balanca" cx="180" cy="180" r="6" fill="none" stroke="#BFE3FF" stroke-width="2.5"/>
</g>` },
tartaruga: { nome: 'recife', svg: `<g>
 <ellipse cx="110" cy="198" rx="96" ry="10" fill="#E8CF94"/>
 <path d="M30 198 L30 150 Q30 136 42 136 Q54 136 54 150 L54 160 Q54 120 70 120 Q86 120 86 150 L86 198 Z" fill="#F28C8C"/>
 <path d="M120 198 Q100 150 120 110 M120 160 Q140 130 160 130 M120 140 Q100 120 96 100" stroke="#FF9E4A" stroke-width="12" fill="none" stroke-linecap="round"/>
 <circle cx="180" cy="180" r="18" fill="#B98AE0"/><circle cx="174" cy="174" r="4" fill="#D6B8F0"/><circle cx="186" cy="184" r="3" fill="#D6B8F0"/>
 <path class="balanca" d="M196 198 Q206 170 194 150" stroke="#5CC157" stroke-width="7" fill="none" stroke-linecap="round"/>
</g>` },
lontra: { nome: 'rio', svg: `<g>
 <path d="M10 206 L10 120 Q60 110 70 130 L60 206 Z M210 206 L210 120 Q160 110 150 130 L160 206 Z" fill="#7CC36A"/>
 <path d="M60 206 L70 130 Q110 120 150 130 L160 206 Z" fill="#4AA3DF"/>
 <path class="balanca" d="M80 170 Q96 162 112 170 M112 192 Q128 184 144 192" stroke="#BFE8FF" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="40" cy="132" rx="16" ry="10" fill="#9C9C9C"/><ellipse cx="178" cy="150" rx="14" ry="9" fill="#9C9C9C"/>
 <rect x="22" y="70" width="8" height="54" rx="4" fill="#8A6A3A"/><ellipse cx="26" cy="68" rx="6" ry="14" fill="#7A4E2D"/>
 <rect x="190" y="80" width="8" height="44" rx="4" fill="#8A6A3A"/><ellipse cx="194" cy="78" rx="6" ry="14" fill="#7A4E2D"/>
</g>` },
sapo: { nome: 'nenúfar', svg: `<g>
 <ellipse cx="110" cy="180" rx="100" ry="28" fill="#4AA3DF"/>
 <path d="M30 176 Q30 150 110 150 Q190 150 190 176 Q190 200 110 200 Q30 200 30 176 Z M110 176 L150 154 L162 168 Z" fill="#4FB04A"/>
 <path d="M110 176 L150 154 L162 168 Z" fill="#4AA3DF"/>
 <path d="M60 176 Q110 166 160 180" stroke="#3E9E4F" stroke-width="3" fill="none"/>
 <g class="balanca" transform="translate(0 32)"><path d="M170 140 Q160 120 176 112 Q180 124 186 112 Q198 120 188 140 Z" fill="#F7A6C8"/><circle cx="179" cy="132" r="4" fill="#FFD84D"/></g>
 <rect x="20" y="90" width="6" height="80" rx="3" fill="#3E9E4F"/><ellipse cx="23" cy="88" rx="6" ry="16" fill="#8A5A33"/>
</g>` }
});
