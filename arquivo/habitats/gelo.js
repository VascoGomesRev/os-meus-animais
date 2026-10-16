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
</g>` },
orca: { nome: 'mar gelado', svg: `<g>
 <rect x="10" y="90" width="200" height="120" rx="14" fill="#2F6FA3"/>
 <path d="M10 96 Q35 84 60 96 Q85 108 110 96 Q135 84 160 96 Q185 108 210 96" stroke="#9FD2F2" stroke-width="4" fill="none"/>
 <path d="M20 96 L40 60 L70 66 L84 96 Z" fill="#FFFFFF" stroke="#BFD8EA" stroke-width="2"/>
 <path d="M150 96 L164 70 L196 76 L204 96 Z" fill="#FFFFFF" stroke="#BFD8EA" stroke-width="2"/>
 <path d="M30 150 Q60 140 90 150 M120 176 Q150 166 180 176" stroke="#5B9BCB" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>` },
narval: { nome: 'icebergue', svg: `<g>
 <rect x="10" y="130" width="200" height="80" rx="14" fill="#2F6FA3"/>
 <path d="M50 130 L80 40 L110 70 L130 30 L170 130 Z" fill="#FFFFFF" stroke="#BFD8EA" stroke-width="3"/>
 <path d="M80 40 L94 90 L110 70 Z M130 30 L140 80 L150 70 Z" fill="#DCEEF9"/>
 <path d="M60 130 L90 190 L150 190 L160 130 Z" fill="#7FB8DE" opacity=".7"/>
 <path d="M14 134 Q40 124 66 134 M160 134 Q186 124 206 134" stroke="#9FD2F2" stroke-width="3" fill="none"/>
</g>` },
beluga: { nome: 'aurora boreal', svg: `<g>
 <rect x="10" y="30" width="200" height="180" rx="16" fill="#1B2A4A"/>
 <path class="balanca" d="M20 90 Q60 40 100 80 Q140 120 200 60" stroke="#5BE3A0" stroke-width="14" fill="none" stroke-linecap="round" opacity=".8"/>
 <path d="M20 110 Q70 70 110 100 Q150 130 200 90" stroke="#B48CF0" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>
 <circle cx="40" cy="50" r="2" fill="#FFFFFF"/><circle cx="170" cy="44" r="2" fill="#FFFFFF"/><circle cx="120" cy="56" r="1.5" fill="#FFFFFF"/>
 <rect x="10" y="150" width="200" height="60" rx="12" fill="#2F6FA3"/>
 <path d="M10 156 L50 140 L90 156 Z M140 156 L180 136 L210 156 Z" fill="#FFFFFF"/>
</g>` },
'raposa-do-artico': { nome: 'toca na neve', svg: `<g>
 <path d="M14 205 Q20 100 110 90 Q200 100 206 205 Z" fill="#FFFFFF" stroke="#C9DCEA" stroke-width="3"/>
 <path d="M70 205 Q70 140 110 138 Q150 140 150 205 Z" fill="#3E5A78"/>
 <path d="M40 150 Q60 140 80 148 M140 120 Q160 112 180 124" stroke="#C9DCEA" stroke-width="3" fill="none" stroke-linecap="round"/>
 <rect x="10" y="198" width="200" height="12" rx="6" fill="#EAF5FC"/>
 <circle cx="40" cy="60" r="4" fill="#DCEEF9"/><circle cx="180" cy="50" r="5" fill="#DCEEF9"/><circle cx="110" cy="40" r="3" fill="#DCEEF9"/>
</g>` },
'leao-marinho': { nome: 'onda', svg: `<g>
 <rect x="10" y="150" width="200" height="60" rx="14" fill="#2F6FA3"/>
 <path d="M10 160 Q10 70 90 60 Q150 56 160 100 Q130 80 110 100 Q140 110 130 140 Q100 160 10 160 Z" fill="#5BA7DB"/>
 <path d="M90 60 Q150 56 160 100 Q130 80 110 100" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round"/>
 <path d="M130 200 Q140 150 180 150 Q210 160 206 200 Z" fill="#8C96A3"/>
 <circle cx="170" cy="70" r="5" fill="#FFFFFF"/><circle cx="186" cy="88" r="3" fill="#FFFFFF"/>
</g>` },
'boi-almiscarado': { nome: 'tundra', svg: `<g>
 <rect x="10" y="140" width="200" height="70" rx="12" fill="#A8B88A"/>
 <path d="M10 140 Q60 120 110 136 Q160 120 210 140 L210 160 L10 160 Z" fill="#FFFFFF"/>
 <path d="M20 140 L60 70 L100 140 Z" fill="#9AA6B2"/><path d="M60 70 L72 92 L48 92 Z" fill="#FFFFFF"/>
 <path d="M110 140 L156 60 L200 140 Z" fill="#8894A0"/><path d="M156 60 L170 86 L142 86 Z" fill="#FFFFFF"/>
 <circle cx="40" cy="186" r="5" fill="#C65A5A"/><circle cx="170" cy="190" r="5" fill="#C65A5A"/><circle cx="110" cy="180" r="4" fill="#E6D25A"/>
</g>` },
'coruja-das-neves': { nome: 'céu nevado', svg: `<g>
 <rect x="10" y="20" width="200" height="190" rx="16" fill="#9CC6E4"/>
 <circle cx="40" cy="50" r="4" fill="#FFFFFF"/><circle cx="90" cy="36" r="3" fill="#FFFFFF"/><circle cx="160" cy="44" r="4" fill="#FFFFFF"/><circle cx="190" cy="90" r="3" fill="#FFFFFF"/><circle cx="30" cy="110" r="3" fill="#FFFFFF"/><circle cx="130" cy="70" r="3" fill="#FFFFFF"/>
 <rect x="20" y="164" width="180" height="12" rx="6" fill="#7A4E2D"/>
 <path class="balanca" d="M40 164 Q44 150 56 152" stroke="#2E7D4F" stroke-width="4" fill="none"/>
 <path d="M20 166 Q110 156 200 166" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path d="M10 196 Q110 180 210 196 L210 210 L10 210 Z" fill="#FFFFFF"/>
</g>` },
albatroz: { nome: 'penhasco', svg: `<g>
 <rect x="10" y="30" width="200" height="180" rx="16" fill="#BFE0F5"/>
 <rect x="10" y="170" width="200" height="40" rx="12" fill="#2F6FA3"/>
 <path d="M90 205 L100 110 Q130 90 170 100 L200 120 L206 205 Z" fill="#7D8794"/>
 <path d="M100 110 Q130 90 170 100 L200 120 Q160 108 100 116 Z" fill="#FFFFFF"/>
 <path d="M150 140 L170 150 M120 160 L140 172" stroke="#5E6772" stroke-width="3" stroke-linecap="round"/>
 <path class="balanca" d="M40 60 Q48 52 56 60 Q64 52 72 60" stroke="#5E6772" stroke-width="3" fill="none"/>
 <circle cx="50" cy="100" r="14" fill="#FFFFFF"/><circle cx="66" cy="96" r="12" fill="#FFFFFF"/>
</g>` }
});
