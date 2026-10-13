'use strict';
Object.assign(HABITATS, {
'urso-polar': { nome: 'caverna de gelo', svg: `<g>
 <path d="M24 205 Q20 70 110 54 Q200 70 196 205 Z" fill="#CFE8F7"/>
 <path d="M40 205 Q40 90 110 78 Q180 90 180 205 Z" fill="#A9D3EE"/>
 <path d="M70 205 Q70 120 110 112 Q150 120 150 205 Z" fill="#3E6F96"/>
 <path d="M60 62 L66 82 L72 62 Z M100 56 L106 78 L112 56 Z M146 62 L152 84 L158 62 Z" fill="#E8F5FD"/>
 <rect x="14" y="198" width="192" height="12" rx="6" fill="#FFFFFF"/>
 <circle cx="48" cy="120" r="6" fill="#FFFFFF" opacity=".7"/><circle cx="170" cy="140" r="5" fill="#FFFFFF" opacity=".7"/>
</g>` },
pinguim: { nome: 'iglu', svg: `<g>
 <path d="M26 205 Q26 70 110 70 Q194 70 194 205 Z" fill="#FFFFFF" stroke="#BFD8EA" stroke-width="3"/>
 <path d="M40 120 L180 120 M30 160 L190 160 M80 72 L80 120 M140 72 L140 120 M60 120 L60 160 M110 120 L110 160 M160 120 L160 160" stroke="#BFD8EA" stroke-width="3"/>
 <path d="M80 205 Q80 156 110 156 Q140 156 140 205 Z" fill="#E3F1FA" stroke="#BFD8EA" stroke-width="3"/>
 <path d="M90 205 Q90 168 110 168 Q130 168 130 205 Z" fill="#2F4A66"/>
 <rect x="16" y="198" width="188" height="12" rx="6" fill="#EAF5FC"/>
 <path class="balanca" d="M110 70 L110 44 L130 50 L110 56" stroke="#7A5A40" stroke-width="2.5" fill="#E53935"/>
</g>` },
foca: { nome: 'rocha', svg: `<g>
 <rect x="10" y="176" width="200" height="34" rx="12" fill="#5BA7DB"/>
 <path d="M30 188 Q50 182 70 188 M120 194 Q140 188 160 194" stroke="#9FD2F2" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M34 190 Q30 120 80 100 Q130 84 170 110 Q196 140 188 190 Z" fill="#8C96A3"/>
 <path d="M60 120 Q90 100 130 104 Q110 112 80 130 Z" fill="#A9B2BD"/>
 <path d="M70 104 Q110 76 160 100 Q130 94 70 104 Z" fill="#FFFFFF"/>
 <circle cx="150" cy="150" r="6" fill="#77818D"/><circle cx="70" cy="160" r="5" fill="#77818D"/>
</g>` },
morsa: { nome: 'praia de gelo', svg: `<g>
 <rect x="10" y="150" width="200" height="60" rx="14" fill="#5BA7DB"/>
 <path d="M14 205 L24 150 Q70 136 120 146 Q170 138 206 150 L206 205 Z" fill="#F4FAFE" stroke="#BFD8EA" stroke-width="3"/>
 <path d="M60 205 L70 160 L120 160 L110 205 Z" fill="#DCEEF9"/>
 <path d="M140 140 L156 80 L178 140 Z" fill="#E3F1FA" stroke="#BFD8EA" stroke-width="3"/>
 <path d="M36 146 L48 106 L64 144 Z" fill="#E3F1FA" stroke="#BFD8EA" stroke-width="3"/>
 <circle cx="180" cy="60" r="16" fill="#FFE27A"/>
</g>` },
rena: { nome: 'floresta nevada', svg: `<g>
 <rect x="14" y="192" width="192" height="18" rx="8" fill="#FFFFFF" stroke="#D5E6F2" stroke-width="2"/>
 <rect x="54" y="168" width="12" height="26" fill="#7A4E2D"/><rect x="104" y="160" width="14" height="34" fill="#7A4E2D"/><rect x="156" y="168" width="12" height="26" fill="#7A4E2D"/>
 <path d="M60 80 L94 170 L26 170 Z" fill="#2E7D4F"/><path d="M60 80 L76 120 L44 120 Z" fill="#FFFFFF"/>
 <path d="M111 50 L152 164 L70 164 Z" fill="#388E5A"/><path d="M111 50 L130 100 L92 100 Z" fill="#FFFFFF"/>
 <path d="M162 80 L196 170 L128 170 Z" fill="#2E7D4F"/><path d="M162 80 L178 120 L146 120 Z" fill="#FFFFFF"/>
 <circle class="balanca" cx="111" cy="46" r="7" fill="#FFD54F"/>
</g>` }
});
