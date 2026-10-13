'use strict';
Object.assign(DESENHOS, {
baleia: `<g class="corpo">
 <path class="cauda-peixe" d="M170 140 Q196 128 200 96 Q210 118 214 100 Q212 136 180 160 Z" fill="#3D7FD9"/>
 <path d="M104 62 Q100 40 104 26 M104 46 Q88 30 76 32 M104 46 Q120 30 132 32" stroke="#8FD3FF" stroke-width="7" fill="none" stroke-linecap="round"/>
 <circle cx="72" cy="30" r="6" fill="#8FD3FF"/><circle cx="136" cy="30" r="6" fill="#8FD3FF"/><circle cx="104" cy="22" r="6" fill="#8FD3FF"/>
 <path d="M18 140 Q18 64 104 62 Q186 62 186 140 Q186 196 104 196 Q18 196 18 140 Z" fill="#4A90E2"/>
 <path d="M28 150 Q60 196 104 196 Q150 196 178 160 Q104 176 28 150 Z" fill="#BFE3FF"/>
 <path d="M44 172 L56 178 M64 180 L72 184 M86 184 L92 188" stroke="#8FBCE6" stroke-width="3" stroke-linecap="round"/>
 <path class="asa" d="M120 160 Q150 160 150 184 Q130 182 120 160 Z" fill="#3D7FD9"/>
 ${olhos(72,124,120)}${bochechas(54,142,140)}
 ${sorriso(98,142)}
 <circle class="bolha" cx="190" cy="60" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="200" cy="44" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
golfinho: `<g class="corpo">
 <path class="cauda-peixe" d="M150 172 Q176 176 186 196 Q196 176 210 172 Q190 166 168 150 Z" fill="#7F93A8"/>
 <path d="M104 72 Q120 36 140 50 Q126 62 128 80 Z" fill="#7F93A8"/>
 <path d="M60 110 Q60 64 110 64 Q160 64 166 120 Q170 170 150 180 Q110 196 76 176 Q60 150 60 110 Z" fill="#9AAFC4"/>
 <path d="M76 132 Q110 150 150 132 Q156 168 130 182 Q100 190 80 172 Z" fill="#E4EEF6"/>
 <path d="M60 112 Q30 112 24 124 Q34 138 66 134 Z" fill="#9AAFC4"/>
 <path d="M26 124 Q44 132 64 128" stroke="#5E7186" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path class="asa" d="M138 150 Q166 150 168 176 Q146 172 138 150 Z" fill="#7F93A8"/>
 ${olhos(86,128,104)}${bochechas(70,146,124)}
 ${sorriso(107,128)}
 <circle class="bolha" cx="36" cy="80" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="28" cy="62" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
tubarao: `<g class="corpo">
 <path class="cauda-peixe" d="M160 140 L208 96 Q196 140 208 184 Z" fill="#6E7F8F"/>
 <path d="M90 74 Q108 16 140 70 Z" fill="#6E7F8F"/>
 <ellipse cx="104" cy="138" rx="80" ry="62" fill="#8A9BAB"/>
 <path d="M30 150 Q104 210 178 150 Q170 196 104 198 Q38 196 30 150 Z" fill="#E8EEF2"/>
 <path d="M140 116 L140 136 M150 114 L150 134 M160 116 L160 134" stroke="#6E7F8F" stroke-width="3" stroke-linecap="round"/>
 <path class="asa" d="M120 170 Q146 172 150 196 Q126 190 120 170 Z" fill="#6E7F8F"/>
 ${olhos(70,118,116)}${bochechas(52,136,140)}
 <path d="M66 150 Q94 168 122 150 Q94 162 66 150 Z" fill="#5A2B2B" stroke="#5A2B2B" stroke-width="4" stroke-linejoin="round"/>
 <path d="M72 152 L77 160 L82 155 L88 162 L94 157 L100 162 L106 155 L111 160 L116 152 Z" fill="#fff"/>
 <circle class="bolha" cx="30" cy="70" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="22" cy="52" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
polvo: `<g class="corpo">
 <path class="cauda" d="M60 140 Q30 160 40 190 Q48 202 56 190" stroke="#B25FC9" stroke-width="16" fill="none" stroke-linecap="round"/>
 <path class="cauda" d="M160 140 Q190 160 180 190 Q172 202 164 190" stroke="#B25FC9" stroke-width="16" fill="none" stroke-linecap="round"/>
 <path d="M84 150 Q70 180 82 200" stroke="#C277D6" stroke-width="16" fill="none" stroke-linecap="round"/>
 <path d="M136 150 Q150 180 138 200" stroke="#C277D6" stroke-width="16" fill="none" stroke-linecap="round"/>
 <path d="M104 156 Q96 182 106 202 M118 156 Q124 182 116 202" stroke="#C277D6" stroke-width="16" fill="none" stroke-linecap="round"/>
 <path d="M44 100 Q44 22 110 22 Q176 22 176 100 Q176 160 110 160 Q44 160 44 100 Z" fill="#CF8AE0"/>
 <circle cx="80" cy="50" r="7" fill="#E6B8F0"/><circle cx="140" cy="44" r="5" fill="#E6B8F0"/><circle cx="150" cy="64" r="4" fill="#E6B8F0"/>
 ${olhos(88,132,100)}${bochechas(68,152,122)}
 ${sorriso(110,124)}
 <circle class="bolha" cx="190" cy="50" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="198" cy="32" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
caranguejo: `<g class="corpo">
 <path d="M40 150 L14 170 L20 196 M42 168 L22 190 M178 150 L206 170 L200 196 M178 168 L198 190" stroke="#D93A2B" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M50 110 Q30 90 30 64 M170 110 Q190 90 190 64" stroke="#D93A2B" stroke-width="10" fill="none" stroke-linecap="round"/>
 <g class="asa"><path d="M30 70 Q4 54 16 26 Q30 14 42 30 L30 40 L46 46 Q50 66 30 70 Z" fill="#F0503C"/></g>
 <g class="asa"><path d="M190 70 Q216 54 204 26 Q190 14 178 30 L190 40 L174 46 Q170 66 190 70 Z" fill="#F0503C"/></g>
 <path d="M84 96 L80 66 M136 96 L140 66" stroke="#D93A2B" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="110" cy="146" rx="80" ry="52" fill="#F0503C"/>
 <ellipse cx="110" cy="164" rx="50" ry="26" fill="#FF8A75"/>
 <circle cx="80" cy="62" r="14" fill="#fff"/><circle cx="140" cy="62" r="14" fill="#fff"/>
 ${olhos(80,140,62,8,10)}${bochechas(66,154,150)}
 ${sorriso(110,150)}
</g>`,
lagosta: `<g class="corpo">
 <path class="cauda" d="M92 40 Q60 6 20 14 M128 40 Q160 6 200 14" stroke="#B83A1E" stroke-width="4" fill="none" stroke-linecap="round"/>
 <path d="M96 178 L80 204 L110 196 L140 204 L124 178 Z" fill="#C8432A"/>
 <rect x="86" y="140" width="48" height="16" rx="8" fill="#D9542E"/>
 <rect x="88" y="156" width="44" height="14" rx="7" fill="#C8432A"/>
 <rect x="92" y="168" width="36" height="14" rx="7" fill="#D9542E"/>
 <path d="M76 110 Q46 110 40 80 M144 110 Q174 110 180 80" stroke="#B83A1E" stroke-width="8" fill="none" stroke-linecap="round"/>
 <g class="asa"><path d="M40 86 Q20 74 24 46 Q36 36 46 50 L40 58 L54 62 Q56 82 40 86 Z" fill="#E0603A"/></g>
 <g class="asa"><path d="M180 86 Q200 74 196 46 Q184 36 174 50 L180 58 L166 62 Q164 82 180 86 Z" fill="#E0603A"/></g>
 <ellipse cx="110" cy="92" rx="44" ry="56" fill="#E0603A"/>
 ${olhos(92,128,84,10,12)}${bochechas(78,142,104)}
 ${sorriso(110,110)}
 <circle class="bolha" cx="190" cy="140" r="5" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
'estrela-do-mar': `<g class="corpo">
 <path d="M110 14 Q122 14 130 70 Q190 66 200 80 Q202 92 152 124 Q176 184 166 196 Q154 202 110 160 Q66 202 54 196 Q44 184 68 124 Q18 92 20 80 Q30 66 90 70 Q98 14 110 14 Z" fill="#FF9E4A" stroke="#F07E2A" stroke-width="4" stroke-linejoin="round" class="cauda"/>
 <circle cx="110" cy="44" r="4" fill="#FFD27A"/><circle cx="44" cy="84" r="4" fill="#FFD27A"/><circle cx="176" cy="84" r="4" fill="#FFD27A"/><circle cx="72" cy="174" r="4" fill="#FFD27A"/><circle cx="148" cy="174" r="4" fill="#FFD27A"/>
 ${olhos(92,128,104)}${bochechas(76,144,126)}
 ${sorriso(110,128)}
 <circle class="bolha" cx="192" cy="40" r="5" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
'cavalo-marinho': `<g class="corpo">
 <path class="cauda" d="M110 150 Q100 190 130 198 Q156 198 150 176 Q144 164 132 172" stroke="#F5B829" stroke-width="16" fill="none" stroke-linecap="round"/>
 <path d="M72 70 Q60 80 68 92 Q60 104 70 114 Q62 126 74 136" stroke="#F08A24" stroke-width="10" fill="none" stroke-linecap="round" class="asa"/>
 <path d="M80 80 Q66 120 96 156 Q120 170 132 148 Q140 120 120 96 Z" fill="#FFC93C"/>
 <path d="M104 110 L122 112 M100 124 L126 126 M102 138 L126 140" stroke="#F5B829" stroke-width="4" stroke-linecap="round"/>
 <path d="M138 66 L180 64 Q186 72 180 80 L140 84 Z" fill="#FFC93C"/>
 <circle cx="112" cy="68" r="44" fill="#FFD45E"/>
 <path d="M96 26 L100 12 L108 26 L114 10 L120 26 L128 14 L130 30 Z" fill="#F08A24"/>
 ${olhos(98,128,64,9,11)}${bochechas(86,146,86)}
 <circle cx="182" cy="72" r="4" fill="#2B1B12"/>
 <circle class="bolha" cx="190" cy="40" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="198" cy="22" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
alforreca: `<g class="corpo">
 <path class="cauda" d="M64 120 Q54 150 66 170 Q76 190 66 206" stroke="#C59BF0" stroke-width="7" fill="none" stroke-linecap="round"/>
 <path class="cauda" d="M156 120 Q166 150 154 170 Q144 190 154 206" stroke="#C59BF0" stroke-width="7" fill="none" stroke-linecap="round"/>
 <path d="M90 124 Q80 150 92 172 Q100 188 92 200 M110 124 Q120 154 108 176 Q102 190 110 204 M130 124 Q140 150 128 172 Q122 188 130 200" stroke="#E0B6F5" stroke-width="7" fill="none" stroke-linecap="round"/>
 <path d="M30 116 Q30 24 110 24 Q190 24 190 116 Q176 130 160 118 Q146 132 132 118 Q118 132 110 120 Q100 132 88 118 Q74 132 60 118 Q44 130 30 116 Z" fill="#F4A6D8"/>
 <path d="M58 56 Q76 38 98 36" stroke="#FFD6EF" stroke-width="8" fill="none" stroke-linecap="round"/>
 ${olhos(88,132,82)}${bochechas(66,154,102)}
 ${sorriso(110,102)}
 <circle class="bolha" cx="22" cy="40" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="198" cy="60" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
tartaruga: `<g class="corpo">
 <path class="cauda" d="M170 170 L196 178 L172 184 Z" fill="#8CCB5E"/>
 <ellipse cx="60" cy="190" rx="18" ry="11" fill="#8CCB5E"/><ellipse cx="160" cy="190" rx="18" ry="11" fill="#8CCB5E"/>
 <path d="M30 170 Q30 100 110 100 Q190 100 190 170 Z" fill="#3E9E4F"/>
 <path d="M90 108 L80 140 L110 156 L140 140 L130 108 M80 140 L44 158 M140 140 L176 158 M110 156 L110 170" stroke="#2C7A3A" stroke-width="4" fill="none" stroke-linejoin="round"/>
 <rect x="26" y="164" width="168" height="14" rx="7" fill="#C9E08A"/>
 <circle cx="110" cy="72" r="52" fill="#9ED86E"/>
 ${olhos(90,130,68)}${bochechas(72,148,90)}
 ${sorriso(110,92)}
 <circle class="bolha" cx="36" cy="40" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="26" cy="22" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
lontra: `<g class="corpo">
 <path class="cauda" d="M146 180 Q190 186 196 150" stroke="#7A4E2D" stroke-width="16" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="164" rx="44" ry="36" fill="#9B6A43"/>
 <ellipse cx="110" cy="170" rx="28" ry="24" fill="#E8CFAE"/>
 <ellipse cx="88" cy="198" rx="15" ry="8" fill="#7A4E2D"/><ellipse cx="132" cy="198" rx="15" ry="8" fill="#7A4E2D"/>
 <ellipse cx="94" cy="150" rx="11" ry="8" fill="#7A4E2D"/><ellipse cx="126" cy="150" rx="11" ry="8" fill="#7A4E2D"/>
 <circle cx="110" cy="144" r="10" fill="#D6C9B8"/>
 <circle class="orelha" cx="60" cy="52" r="12" fill="#7A4E2D"/><circle class="orelha" cx="160" cy="52" r="12" fill="#7A4E2D"/>
 <ellipse cx="110" cy="86" rx="58" ry="50" fill="#A8774E"/>
 <ellipse cx="110" cy="108" rx="34" ry="24" fill="#F2DEC4"/>
 ${olhos(86,134,82)}${bochechas(66,154,106)}
 <ellipse cx="110" cy="100" rx="9" ry="6" fill="#2B1B12"/>
 ${sorriso(110,110)}
 <path d="M84 108 L56 102 M84 114 L58 118 M136 108 L164 102 M136 114 L162 118" stroke="#6B4426" stroke-width="2" stroke-linecap="round"/>
</g>`,
sapo: `<g class="corpo">
 <path class="cauda" d="M40 196 Q30 160 60 150 L76 196 Z M180 196 Q190 160 160 150 L144 196 Z" fill="#4FB04A"/>
 <ellipse cx="110" cy="160" rx="56" ry="40" fill="#5CC157"/>
 <ellipse cx="110" cy="168" rx="36" ry="26" fill="#D8F0A8"/>
 <ellipse cx="36" cy="200" rx="20" ry="7" fill="#4FB04A"/><ellipse cx="184" cy="200" rx="20" ry="7" fill="#4FB04A"/>
 <ellipse cx="86" cy="196" rx="12" ry="7" fill="#4FB04A"/><ellipse cx="134" cy="196" rx="12" ry="7" fill="#4FB04A"/>
 <ellipse cx="110" cy="96" rx="76" ry="48" fill="#6CCF63"/>
 <circle cx="70" cy="56" r="26" fill="#6CCF63"/><circle cx="150" cy="56" r="26" fill="#6CCF63"/>
 <circle cx="70" cy="56" r="18" fill="#fff"/><circle cx="150" cy="56" r="18" fill="#fff"/>
 ${olhos(70,150,56)}${bochechas(56,164,104)}
 <path d="M62 108 Q110 140 158 108" stroke="#2B6B2A" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="100" cy="86" r="3" fill="#2B6B2A"/><circle cx="120" cy="86" r="3" fill="#2B6B2A"/>
</g>`
});
