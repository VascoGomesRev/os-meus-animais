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
</g>`,
'peixe-palhaco': `<g class="corpo">
 <circle class="bolha" cx="34" cy="56" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="26" cy="40" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
 <path class="cauda-peixe" d="M160 112 L204 76 Q194 112 204 148 Z" fill="#FF7A1A" stroke="#2B1B12" stroke-width="3"/>
 <path d="M80 70 Q112 36 142 74 Z" fill="#FF7A1A" stroke="#2B1B12" stroke-width="3"/>
 <path d="M90 156 Q110 182 128 154 Z" fill="#FF7A1A" stroke="#2B1B12" stroke-width="3"/>
 <ellipse cx="104" cy="112" rx="66" ry="50" fill="#FF8C1F"/>
 <path d="M88 65 Q78 112 88 159 L106 161 Q96 112 106 63 Z" fill="#fff" stroke="#2B1B12" stroke-width="3"/>
 <path d="M140 70 Q130 112 140 154 L156 144 Q148 112 156 80 Z" fill="#fff" stroke="#2B1B12" stroke-width="3"/>
 <path class="asa" d="M112 124 Q136 126 128 150 Q112 144 112 124 Z" fill="#FF7A1A" stroke="#2B1B12" stroke-width="2"/>
 <g class="olhos"><ellipse cx="64" cy="100" rx="13" ry="15" fill="#2B1B12"/><circle cx="69" cy="94" r="5.5" fill="#fff"/><circle cx="60" cy="106" r="2.6" fill="#fff"/></g>
 <ellipse cx="62" cy="126" rx="9" ry="5.5" fill="#F7849E" opacity=".6"/>
 <path d="M40 118 Q46 125 53 118" stroke="#2B1B12" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>`,
raia: `<g class="corpo">
 <path class="cauda" d="M110 170 Q114 196 104 214" stroke="#5E8FA6" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path class="asa" d="M110 46 Q160 70 210 118 Q160 150 110 172 Z" fill="#7FB0C6"/>
 <path class="asa" d="M110 46 Q60 70 10 118 Q60 150 110 172 Z" fill="#7FB0C6"/>
 <ellipse cx="110" cy="112" rx="50" ry="52" fill="#8CBDD2"/>
 <circle cx="56" cy="112" r="6" fill="#5E8FA6"/><circle cx="164" cy="112" r="6" fill="#5E8FA6"/><circle cx="72" cy="132" r="4" fill="#5E8FA6"/><circle cx="148" cy="132" r="4" fill="#5E8FA6"/>
 ${olhos(90,130,100)}${bochechas(74,146,122)}
 ${sorriso(110,128)}
 <circle class="bolha" cx="178" cy="54" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="190" cy="38" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
enguia: `<g class="corpo">
 <path class="cauda-peixe" d="M190 196 Q206 186 212 200 Q206 214 190 206 Z" fill="#2A5A35"/>
 <path d="M192 200 Q128 214 122 176 Q116 140 156 136 Q198 130 178 98 Q162 74 120 80" stroke="#2E6B3F" stroke-width="36" fill="none" stroke-linecap="round"/>
 <path d="M192 200 Q128 214 122 176 Q116 140 156 136 Q198 130 178 98" stroke="#5E9E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
 <ellipse cx="86" cy="80" rx="58" ry="46" fill="#3A7D4A"/>
 <ellipse cx="80" cy="96" rx="40" ry="24" fill="#7DBB6A"/>
 ${olhos(66,106,72,10,12)}${bochechas(48,124,96)}
 ${sorriso(86,100)}
 <circle class="bolha" cx="30" cy="150" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="22" cy="134" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
lula: `<g class="corpo">
 <path class="cauda" d="M86 140 Q70 180 82 206 M98 142 Q92 178 100 204 M122 142 Q128 178 120 204 M134 140 Q150 180 138 206" stroke="#E07C8E" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path class="cauda" d="M78 136 Q40 160 30 200 M142 136 Q180 160 190 200" stroke="#E07C8E" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle cx="30" cy="200" r="7" fill="#E07C8E"/><circle cx="190" cy="200" r="7" fill="#E07C8E"/>
 <path class="asa" d="M110 16 L46 60 L86 66 Z" fill="#E07C8E"/>
 <path class="asa" d="M110 16 L174 60 L134 66 Z" fill="#E07C8E"/>
 <path d="M110 14 Q160 60 160 128 Q110 150 60 128 Q60 60 110 14 Z" fill="#F29BAA"/>
 <circle cx="96" cy="56" r="4" fill="#E07C8E"/><circle cx="122" cy="70" r="5" fill="#E07C8E"/><circle cx="104" cy="80" r="3" fill="#E07C8E"/>
 ${olhos(90,130,104)}${bochechas(74,146,124)}
 ${sorriso(110,128)}
</g>`,
camarao: `<g class="corpo">
 <path d="M70 52 Q40 14 8 20 M98 46 Q120 8 160 8" stroke="#E0607A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
 <path class="cauda-peixe" d="M118 188 L88 176 L92 206 Z" fill="#FF8095"/>
 <ellipse cx="128" cy="184" rx="20" ry="16" fill="#FF9AAA"/>
 <ellipse cx="152" cy="160" rx="25" ry="22" fill="#FFA8B6"/>
 <ellipse cx="152" cy="124" rx="30" ry="26" fill="#FF9AAA"/>
 <path d="M112 136 L104 152 M124 146 L118 162 M138 172 L130 186 M146 182 L138 196" stroke="#E0607A" stroke-width="4" stroke-linecap="round"/>
 <path d="M140 106 Q158 118 150 140 M168 140 Q170 156 160 174 M140 172 Q144 186 134 196" stroke="#FF8095" stroke-width="3" fill="none" stroke-linecap="round"/>
 <circle cx="88" cy="94" r="50" fill="#FFB0BC"/>
 <path d="M56 54 Q88 36 124 58" stroke="#FF8095" stroke-width="5" fill="none" stroke-linecap="round"/>
 ${olhos(70,106,90,10,12)}${bochechas(54,122,112)}
 ${sorriso(88,114)}
 <circle class="bolha" cx="196" cy="70" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="206" cy="52" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
'ourico-do-mar': `<g class="corpo">
 <g class="cauda">${Array.from({length:18},(_,i)=>{const a=(150+i*240/17)*Math.PI/180;const c=Math.cos(a),s=Math.sin(a);return `<path d="M${(110+56*c).toFixed(1)} ${(122+56*s).toFixed(1)} L${(110+96*c).toFixed(1)} ${(122+96*s).toFixed(1)}" stroke="#5B2F86" stroke-width="7" stroke-linecap="round"/>`;}).join('')}</g>
 <circle cx="110" cy="128" r="66" fill="#9A63CC"/>
 <circle cx="76" cy="90" r="6" fill="#B888E0"/><circle cx="146" cy="84" r="5" fill="#B888E0"/><circle cx="110" cy="74" r="4" fill="#B888E0"/>
 <ellipse cx="84" cy="196" rx="10" ry="7" fill="#C9A0EA"/><ellipse cx="110" cy="198" rx="10" ry="7" fill="#C9A0EA"/><ellipse cx="136" cy="196" rx="10" ry="7" fill="#C9A0EA"/>
 ${olhos(90,130,124)}${bochechas(72,148,146)}
 ${sorriso(110,150)}
</g>`,
sardinha: `<g class="corpo">
 <circle class="bolha" cx="34" cy="60" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="44" cy="42" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
 <path class="cauda-peixe" d="M168 118 L206 90 L194 118 L206 146 Z" fill="#3E6FA8"/>
 <path d="M104 82 L120 64 L130 84 Z" fill="#3E6FA8"/>
 <ellipse cx="104" cy="118" rx="76" ry="38" fill="#DDE5EC"/>
 <path d="M28 114 Q40 80 104 80 Q170 80 180 114 Q140 102 104 104 Q60 104 28 114 Z" fill="#3E6FA8"/>
 <path d="M60 112 L170 116" stroke="#B9C6D2" stroke-width="3" stroke-linecap="round"/>
 <circle cx="96" cy="124" r="3" fill="#2B4E78"/><circle cx="112" cy="124" r="3" fill="#2B4E78"/><circle cx="128" cy="124" r="3" fill="#2B4E78"/>
 <path class="asa" d="M88 132 Q108 136 102 152 Q88 146 88 132 Z" fill="#B9C6D2"/>
 <g class="olhos"><ellipse cx="54" cy="114" rx="11" ry="13" fill="#2B1B12"/><circle cx="58" cy="109" r="4.5" fill="#fff"/><circle cx="51" cy="119" r="2.2" fill="#fff"/></g>
 <ellipse cx="56" cy="136" rx="8" ry="5" fill="#F7849E" opacity=".6"/>
 <path d="M30 126 Q35 132 41 126" stroke="#2B1B12" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>`,
atum: `<g class="corpo">
 <path class="cauda-peixe" d="M176 112 Q196 92 214 58 Q204 112 214 166 Q196 132 176 112 Z" fill="#24427A"/>
 <path d="M96 66 L120 30 L132 66 Z" fill="#FFD23A"/>
 <path d="M104 156 L118 186 L130 156 Z" fill="#FFD23A"/>
 <path d="M16 112 Q30 58 110 58 Q170 60 184 112 Q170 164 110 166 Q30 166 16 112 Z" fill="#CBD6E0"/>
 <path d="M16 112 Q30 58 110 58 Q170 60 184 112 Q120 96 16 112 Z" fill="#2D4E8A"/>
 <path d="M146 72 l6 -8 l4 9 Z M160 80 l6 -8 l4 9 Z M146 152 l6 8 l4 -9 Z M160 144 l6 8 l4 -9 Z" fill="#FFD23A"/>
 <path class="asa" d="M88 120 Q118 120 116 146 Q96 140 88 120 Z" fill="#9FB0C2"/>
 <g class="olhos"><ellipse cx="54" cy="104" rx="13" ry="15" fill="#2B1B12"/><circle cx="59" cy="98" r="5.5" fill="#fff"/><circle cx="50" cy="110" r="2.6" fill="#fff"/></g>
 <ellipse cx="58" cy="130" rx="9" ry="5.5" fill="#F7849E" opacity=".6"/>
 <path d="M24 124 Q30 131 37 124" stroke="#2B1B12" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>`,
salmao: `<g class="corpo">
 <path d="M20 200 Q50 180 80 200 Q110 180 140 200 Q170 180 200 200" stroke="#5BA7E6" stroke-width="8" fill="none" stroke-linecap="round"/>
 <circle cx="40" cy="176" r="6" fill="#8FD3FF"/><circle cx="178" cy="172" r="5" fill="#8FD3FF"/><circle cx="60" cy="160" r="4" fill="#8FD3FF"/>
 <g transform="rotate(-28 110 110)">
 <path class="cauda-peixe" d="M172 112 L208 82 Q198 112 208 142 Z" fill="#E77A6A"/>
 <path d="M96 72 Q114 50 132 74 Z" fill="#E77A6A"/>
 <ellipse cx="104" cy="112" rx="74" ry="42" fill="#F79A8A"/>
 <path d="M30 120 Q104 150 176 118 Q160 152 104 154 Q48 152 30 120 Z" fill="#FFD3C8"/>
 <circle cx="110" cy="90" r="3" fill="#A85A50"/><circle cx="130" cy="96" r="3" fill="#A85A50"/><circle cx="150" cy="92" r="3" fill="#A85A50"/><circle cx="120" cy="80" r="2.5" fill="#A85A50"/>
 <path class="asa" d="M96 124 Q120 126 114 148 Q98 142 96 124 Z" fill="#E77A6A"/>
 <g class="olhos"><ellipse cx="62" cy="102" rx="12" ry="14" fill="#2B1B12"/><circle cx="67" cy="96" r="5" fill="#fff"/><circle cx="58" cy="108" r="2.4" fill="#fff"/></g>
 <ellipse cx="62" cy="126" rx="9" ry="5.5" fill="#F7849E" opacity=".7"/>
 <path d="M34 116 Q40 123 47 116" stroke="#2B1B12" stroke-width="3" fill="none" stroke-linecap="round"/>
 </g>
</g>`,
cachalote: `<g class="corpo">
 <path class="cauda-peixe" d="M170 150 Q196 140 200 112 Q210 132 216 116 Q212 156 184 176 Z" fill="#5F6B76"/>
 <path d="M44 50 Q36 30 46 16" stroke="#C9E6F7" stroke-width="7" fill="none" stroke-linecap="round"/>
 <path d="M150 90 Q190 110 190 150 Q186 190 140 196 L60 196 Z" fill="#6F7C88"/>
 <rect x="14" y="52" width="160" height="144" rx="34" fill="#7D8A96"/>
 <path d="M24 170 Q90 186 166 170 L166 186 Q90 198 24 186 Z" fill="#C7CED5"/>
 <path d="M30 168 L156 168" stroke="#4E5964" stroke-width="3" stroke-linecap="round"/>
 <path d="M60 64 Q70 60 80 64 M110 62 Q120 58 130 62" stroke="#97A3AE" stroke-width="4" fill="none" stroke-linecap="round"/>
 <path class="asa" d="M120 176 Q150 178 148 200 Q128 196 120 176 Z" fill="#5F6B76"/>
 ${olhos(68,128,120)}${bochechas(48,148,144)}
 ${sorriso(98,146)}
 <circle class="bolha" cx="192" cy="60" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="204" cy="44" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
'tubarao-martelo': `<g class="corpo">
 <path class="cauda-peixe" d="M110 180 L84 214 L110 204 L136 214 Z" fill="#6E7F8F"/>
 <path d="M110 96 L134 60 L140 104 Z" fill="#6E7F8F"/>
 <path class="asa" d="M70 140 Q30 150 22 176 Q56 170 78 158 Z" fill="#6E7F8F"/>
 <path class="asa" d="M150 140 Q190 150 198 176 Q164 170 142 158 Z" fill="#6E7F8F"/>
 <ellipse cx="110" cy="138" rx="50" ry="56" fill="#8C9CAB"/>
 <ellipse cx="110" cy="152" rx="32" ry="38" fill="#E8EEF3"/>
 <rect x="6" y="52" width="208" height="50" rx="25" fill="#8C9CAB"/>
 <circle cx="30" cy="77" r="20" fill="#fff"/><circle cx="190" cy="77" r="20" fill="#fff"/>
 ${olhos(30,190,77)}${bochechas(80,140,114)}
 <path d="M90 118 Q110 132 130 118" stroke="#3E4A55" stroke-width="3.5" fill="none" stroke-linecap="round"/>
 <circle class="bolha" cx="34" cy="30" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="24" cy="14" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
'peixe-balao': `<g class="corpo">
 <path class="cauda-peixe" d="M168 116 L206 92 Q198 116 206 140 Z" fill="#E8B84A"/>
 <g>${Array.from({length:20},(_,i)=>{const a=i*18*Math.PI/180;const c=Math.cos(a),s=Math.sin(a);return `<path d="M${(104+62*c-5*s).toFixed(1)} ${(116+62*s+5*c).toFixed(1)} L${(104+80*c).toFixed(1)} ${(116+80*s).toFixed(1)} L${(104+62*c+5*s).toFixed(1)} ${(116+62*s-5*c).toFixed(1)} Z" fill="#C9962E"/>`;}).join('')}</g>
 <circle cx="104" cy="116" r="66" fill="#F6D36B"/>
 <path d="M48 140 Q104 190 160 140 Q150 178 104 182 Q58 178 48 140 Z" fill="#FFF1C2"/>
 <circle cx="82" cy="70" r="5" fill="#C9962E"/><circle cx="126" cy="66" r="6" fill="#C9962E"/><circle cx="148" cy="96" r="4" fill="#C9962E"/><circle cx="60" cy="96" r="4" fill="#C9962E"/>
 <path class="asa" d="M150 128 Q176 120 174 146 Q158 146 150 128 Z" fill="#E8B84A"/>
 ${olhos(82,126,108)}${bochechas(64,144,132)}
 <ellipse cx="104" cy="138" rx="7" ry="6" fill="#D9576B"/>
 <circle class="bolha" cx="26" cy="40" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="16" cy="24" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
moreia: `<g class="corpo">
 <path d="M14 206 Q20 150 70 150 L150 150 Q200 150 206 206 Z" fill="#9C8B78"/>
 <ellipse cx="110" cy="166" rx="44" ry="16" fill="#3A2E28"/>
 <path class="cauda" d="M110 170 Q96 130 112 96" stroke="#C9B43A" stroke-width="50" fill="none" stroke-linecap="round"/>
 <circle cx="102" cy="140" r="5" fill="#5E7A2A"/><circle cx="118" cy="124" r="4" fill="#5E7A2A"/><circle cx="96" cy="118" r="4" fill="#5E7A2A"/>
 <ellipse cx="112" cy="70" rx="56" ry="48" fill="#D8C44A"/>
 <circle cx="70" cy="50" r="5" fill="#5E7A2A"/><circle cx="150" cy="54" r="5" fill="#5E7A2A"/><circle cx="112" cy="30" r="4" fill="#5E7A2A"/>
 ${olhos(90,134,60,10,12)}${bochechas(70,154,86)}
 <ellipse cx="112" cy="94" rx="18" ry="13" fill="#8A2F3A"/>
 <ellipse cx="112" cy="100" rx="10" ry="6" fill="#F27E93"/>
 <path d="M100 84 l4 6 l4 -6 M116 84 l4 6 l4 -6" fill="#fff"/>
 <circle class="bolha" cx="176" cy="104" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="186" cy="86" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
jacare: `<g class="corpo">
 <path class="cauda" d="M150 176 Q196 176 206 136 Q190 150 160 156 Z" fill="#3F6B3A"/>
 <path d="M150 168 l8 -10 l6 10 M168 166 l8 -10 l6 10" fill="#2F5530"/>
 <ellipse cx="110" cy="166" rx="68" ry="38" fill="#3F6B3A"/>
 <ellipse cx="110" cy="176" rx="40" ry="24" fill="#C9D99A"/>
 <ellipse cx="66" cy="198" rx="20" ry="10" fill="#355E31"/><ellipse cx="154" cy="198" rx="20" ry="10" fill="#355E31"/>
 <ellipse cx="110" cy="84" rx="66" ry="44" fill="#4C7C43"/>
 <circle cx="76" cy="54" r="24" fill="#4C7C43"/><circle cx="144" cy="54" r="24" fill="#4C7C43"/>
 <ellipse cx="110" cy="122" rx="62" ry="28" fill="#5E8F50"/>
 ${olhos(76,144,54,11,13)}
 <circle cx="98" cy="110" r="4" fill="#2F5530"/><circle cx="122" cy="110" r="4" fill="#2F5530"/>
 <path d="M54 130 Q110 146 166 130" stroke="#2F5530" stroke-width="3.5" fill="none" stroke-linecap="round"/>
 <path d="M66 133 l5 7 l4 -5 M88 138 l4 7 l4 -6 M124 138 l4 7 l4 -7 M146 135 l4 6 l5 -7" fill="#fff"/>
 ${bochechas(50,170,104)}
</g>`,
piranha: `<g class="corpo">
 <path class="cauda-peixe" d="M166 112 L206 80 Q196 112 206 144 Z" fill="#8E99A4"/>
 <path d="M90 62 Q118 40 140 72 Z" fill="#8E99A4"/>
 <ellipse cx="108" cy="112" rx="66" ry="56" fill="#B7C2CC"/>
 <path d="M44 124 Q108 140 170 120 Q160 166 108 168 Q54 166 44 124 Z" fill="#E0453A"/>
 <path d="M30 116 Q24 150 60 150 Q76 148 78 134 Z" fill="#B7C2CC"/>
 <path d="M30 116 Q40 128 78 130" stroke="#2B1B12" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M38 119 l4 -7 l4 8 M50 123 l4 -7 l4 8 M62 126 l4 -7 l4 8" fill="#fff"/>
 <path class="asa" d="M108 120 Q132 124 126 146 Q108 140 108 120 Z" fill="#8E99A4"/>
 <g class="olhos"><ellipse cx="74" cy="92" rx="13" ry="15" fill="#2B1B12"/><circle cx="79" cy="86" r="5.5" fill="#fff"/><circle cx="70" cy="98" r="2.6" fill="#fff"/></g>
 <ellipse cx="96" cy="110" rx="9" ry="5.5" fill="#F7849E" opacity=".6"/>
 <circle class="bolha" cx="34" cy="60" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="24" cy="44" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
</g>`,
'caranguejo-eremita': `<g class="corpo">
 <path d="M60 180 L40 202 M76 184 L66 204 M140 182 L156 204" stroke="#E0533C" stroke-width="7" stroke-linecap="round"/>
 <circle cx="132" cy="104" r="68" fill="#F2C27A"/>
 <path d="M132 104 m0 -8 a8 8 0 1 1 -8 8 a16 16 0 0 1 16 -16 a24 24 0 0 1 24 24 a32 32 0 0 1 -32 32 a40 40 0 0 1 -40 -40 a48 48 0 0 1 48 -48 a56 56 0 0 1 56 56" stroke="#C98A3E" stroke-width="6" fill="none" stroke-linecap="round"/>
 <path d="M80 140 Q70 120 82 110 M104 136 Q104 116 118 108" stroke="#E0533C" stroke-width="6" stroke-linecap="round" fill="none"/>
 <ellipse cx="86" cy="156" rx="48" ry="36" fill="#F2684E"/>
 <path d="M76 130 L68 92 M100 130 L104 92" stroke="#E0533C" stroke-width="6" stroke-linecap="round"/>
 ${olhos(68,104,88,10,12)}
 <g class="asa"><path d="M46 158 Q18 150 14 176 Q26 200 50 182 Z" fill="#E0533C"/><path d="M14 176 L30 172" stroke="#F2C27A" stroke-width="3"/></g>
 <path d="M110 184 Q134 196 140 178 Q128 168 112 172 Z" fill="#E0533C"/>
 ${bochechas(62,112,166)}
 ${sorriso(86,166)}
</g>`
});
