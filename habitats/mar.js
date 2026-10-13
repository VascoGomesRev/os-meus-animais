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
</g>` },
'peixe-palhaco': { nome: 'anémona', svg: `<g>
 <rect x="10" y="186" width="200" height="20" rx="8" fill="#F3D9A4"/>
 <ellipse cx="110" cy="186" rx="70" ry="18" fill="#C94F8A"/>
 <path d="M50 184 Q36 130 54 100 M70 182 Q62 120 80 86 M92 180 Q90 110 104 76 M116 180 Q122 110 112 74 M138 182 Q150 120 140 84 M160 184 Q182 130 168 98" stroke="#F58BC2" stroke-width="12" fill="none" stroke-linecap="round"/>
 <circle cx="54" cy="100" r="8" fill="#FFB8DD"/><circle cx="80" cy="86" r="8" fill="#FFB8DD"/><circle cx="104" cy="76" r="8" fill="#FFB8DD"/><circle cx="112" cy="74" r="8" fill="#FFB8DD"/><circle cx="140" cy="84" r="8" fill="#FFB8DD"/><circle cx="168" cy="98" r="8" fill="#FFB8DD"/>
 <path class="balanca" d="M196 186 Q186 160 198 140" stroke="#5CC157" stroke-width="6" fill="none" stroke-linecap="round"/>
</g>` },
raia: { nome: 'fundo do mar', svg: `<g>
 <rect x="10" y="70" width="200" height="136" rx="20" fill="#4A90C9"/>
 <path d="M10 170 Q60 150 110 168 Q160 186 210 164 L210 206 L10 206 Z" fill="#F0D59A"/>
 <ellipse cx="60" cy="182" rx="14" ry="6" fill="#E0BE7A"/><ellipse cx="160" cy="190" rx="10" ry="4" fill="#E0BE7A"/>
 <path d="M100 190 l6 -12 l6 12 l-6 -4 Z" fill="#F28C8C"/>
 <path class="balanca" d="M30 168 Q20 140 34 116" stroke="#3E9E4F" stroke-width="6" fill="none" stroke-linecap="round"/>
 <path d="M186 166 Q196 140 184 120" stroke="#3E9E4F" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle cx="130" cy="186" r="5" fill="#fff"/>
</g>` },
enguia: { nome: 'ribeiro', svg: `<g>
 <path d="M10 120 Q60 100 110 120 Q160 140 210 120 L210 206 L10 206 Z" fill="#6DB8E0"/>
 <path d="M10 106 Q60 86 110 106 Q160 126 210 106 L210 122 Q160 140 110 120 Q60 100 10 120 Z" fill="#7CC36A"/>
 <ellipse cx="50" cy="196" rx="26" ry="12" fill="#9AA3AD"/><ellipse cx="120" cy="200" rx="20" ry="9" fill="#8A939C"/><ellipse cx="180" cy="194" rx="24" ry="12" fill="#9AA3AD"/>
 <path d="M40 150 Q60 146 80 150 M120 160 Q140 156 160 160" stroke="#BFE8FF" stroke-width="4" fill="none" stroke-linecap="round"/>
 <path class="balanca" d="M196 108 L196 70" stroke="#5C8A3A" stroke-width="5" stroke-linecap="round"/><ellipse cx="196" cy="66" rx="5" ry="14" fill="#8A5A33"/>
</g>` },
lula: { nome: 'mar profundo', svg: `<g>
 <rect x="10" y="60" width="200" height="146" rx="20" fill="#1F3E6E"/>
 <circle cx="40" cy="90" r="3" fill="#BFE8FF"/><circle cx="170" cy="80" r="2.5" fill="#BFE8FF"/><circle cx="120" cy="110" r="2" fill="#BFE8FF"/><circle cx="70" cy="140" r="2.5" fill="#BFE8FF"/><circle cx="186" cy="140" r="3" fill="#BFE8FF"/>
 <path d="M10 190 Q60 176 110 190 Q160 204 210 186 L210 206 L10 206 Z" fill="#3A4F6E"/>
 <path class="balanca" d="M150 186 Q140 160 156 140" stroke="#5E7FA8" stroke-width="5" fill="none" stroke-linecap="round"/>
 <circle cx="156" cy="138" r="6" fill="#FFE27A"/>
</g>` },
camarao: { nome: 'algas', svg: `<g>
 <rect x="10" y="186" width="200" height="20" rx="8" fill="#E8CF94"/>
 <path class="balanca" d="M40 188 Q24 150 44 120 Q60 92 42 60" stroke="#3E9E4F" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M80 188 Q96 150 78 116 Q64 90 82 70" stroke="#5CC157" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M140 188 Q124 150 144 112 Q158 86 140 60" stroke="#3E9E4F" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M180 188 Q196 156 178 130 Q166 110 184 90" stroke="#7FCF5A" stroke-width="10" fill="none" stroke-linecap="round"/>
 <circle cx="110" cy="192" r="6" fill="#F28C8C"/><circle cx="60" cy="194" r="4" fill="#fff"/>
</g>` },
'ourico-do-mar': { nome: 'pedras', svg: `<g>
 <rect x="10" y="190" width="200" height="16" rx="8" fill="#E8CF94"/>
 <ellipse cx="60" cy="176" rx="50" ry="30" fill="#8A939C"/>
 <ellipse cx="156" cy="180" rx="44" ry="26" fill="#9AA3AD"/>
 <ellipse cx="110" cy="150" rx="36" ry="26" fill="#A9B2BB"/>
 <ellipse cx="46" cy="166" rx="12" ry="6" fill="#B5BDC5"/><ellipse cx="100" cy="140" rx="10" ry="5" fill="#C3CAD1"/>
 <path class="balanca" d="M186 162 Q196 136 184 116" stroke="#3E9E4F" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle cx="140" cy="196" r="5" fill="#F28C8C"/>
</g>` },
sardinha: { nome: 'cardume', svg: `<g>
 <rect x="10" y="60" width="200" height="146" rx="20" fill="#5BA7E6"/>
 <g fill="#C9D4DE"><ellipse cx="50" cy="90" rx="16" ry="7"/><ellipse cx="90" cy="80" rx="16" ry="7"/><ellipse cx="140" cy="96" rx="16" ry="7"/><ellipse cx="70" cy="126" rx="16" ry="7"/><ellipse cx="170" cy="130" rx="16" ry="7"/><ellipse cx="120" cy="150" rx="16" ry="7"/><ellipse cx="50" cy="168" rx="16" ry="7"/></g>
 <g fill="#3E6FA8"><path d="M66 90 l10 -6 l0 12 Z M106 80 l10 -6 l0 12 Z M156 96 l10 -6 l0 12 Z M86 126 l10 -6 l0 12 Z M186 130 l10 -6 l0 12 Z M136 150 l10 -6 l0 12 Z M66 168 l10 -6 l0 12 Z"/></g>
 <path class="balanca" d="M196 200 Q186 176 198 156" stroke="#3E9E4F" stroke-width="6" fill="none" stroke-linecap="round"/>
</g>` },
atum: { nome: 'barco', svg: `<g>
 <rect x="10" y="110" width="200" height="96" rx="16" fill="#2F78B8"/>
 <path d="M10 116 Q35 100 60 116 Q85 100 110 116 Q135 100 160 116 Q185 100 210 116 L210 126 L10 126 Z" fill="#5BA7E6"/>
 <path d="M50 96 L170 96 L156 122 L64 122 Z" fill="#E0533C"/>
 <rect x="50" y="90" width="120" height="8" rx="3" fill="#fff"/>
 <rect x="106" y="34" width="6" height="58" fill="#8A5A33"/>
 <path d="M114 38 L156 84 L114 84 Z" fill="#FFF6E0"/>
 <path class="balanca" d="M106 34 L86 40 L106 46 Z" fill="#FFD23A"/>
 <circle cx="70" cy="110" r="4" fill="#fff"/><circle cx="90" cy="110" r="4" fill="#fff"/>
</g>` },
salmao: { nome: 'cascata', svg: `<g>
 <path d="M10 70 L80 70 L80 206 L10 206 Z" fill="#8A939C"/><path d="M140 70 L210 70 L210 206 L140 206 Z" fill="#8A939C"/>
 <rect x="76" y="60" width="68" height="146" fill="#7CC4EE"/>
 <path d="M86 70 L86 180 M110 70 L110 186 M134 70 L134 180" stroke="#D5F0FF" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="110" cy="196" rx="96" ry="14" fill="#5BA7E6"/>
 <circle cx="80" cy="186" r="8" fill="#fff"/><circle cx="140" cy="186" r="8" fill="#fff"/><circle cx="110" cy="190" r="10" fill="#fff"/>
 <path class="balanca" d="M30 70 Q24 46 40 30" stroke="#3E9E4F" stroke-width="6" fill="none" stroke-linecap="round"/>
 <ellipse cx="40" cy="62" rx="26" ry="10" fill="#5CC157"/><ellipse cx="180" cy="62" rx="26" ry="10" fill="#5CC157"/>
</g>` },
cachalote: { nome: 'abismo', svg: `<g>
 <rect x="10" y="50" width="200" height="156" rx="20" fill="#24508A"/>
 <path d="M10 110 L10 206 L70 206 Q60 160 40 110 Z" fill="#3A4F6E"/>
 <path d="M210 100 L210 206 L150 206 Q164 150 180 100 Z" fill="#3A4F6E"/>
 <rect x="70" y="190" width="80" height="16" fill="#122A4A"/>
 <path d="M10 64 Q60 54 110 64 Q160 74 210 62" stroke="#5BA7E6" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle cx="100" cy="100" r="3" fill="#BFE8FF"/><circle cx="130" cy="140" r="2.5" fill="#BFE8FF"/>
 <path class="balanca" d="M40 110 Q34 90 46 76" stroke="#3E9E4F" stroke-width="5" fill="none" stroke-linecap="round"/>
</g>` },
'tubarao-martelo': { nome: 'naufrágio', svg: `<g>
 <rect x="10" y="70" width="200" height="136" rx="20" fill="#3E86C9"/>
 <rect x="10" y="190" width="200" height="16" rx="8" fill="#E8CF94"/>
 <path d="M30 190 L50 140 L180 150 L190 190 Z" fill="#8A5A33" transform="rotate(-6 110 170)"/>
 <path d="M54 160 L176 166" stroke="#6B4423" stroke-width="4" transform="rotate(-6 110 170)"/>
 <rect x="100" y="80" width="8" height="70" fill="#6B4423" transform="rotate(12 104 150)"/>
 <circle cx="80" cy="170" r="7" fill="#3A2E28"/><circle cx="120" cy="168" r="7" fill="#3A2E28"/><circle cx="156" cy="168" r="7" fill="#3A2E28"/>
 <path class="balanca" d="M118 90 L150 96 L120 108 Z" fill="#E8E0CC"/>
</g>` },
'peixe-balao': { nome: 'coral', svg: `<g>
 <rect x="10" y="190" width="200" height="16" rx="8" fill="#E8CF94"/>
 <path d="M50 192 L50 140 M50 160 L30 130 M50 150 L70 116" stroke="#F2846A" stroke-width="12" fill="none" stroke-linecap="round"/>
 <path d="M160 192 L160 120 M160 150 L184 120 M160 136 L140 100" stroke="#B98AE0" stroke-width="12" fill="none" stroke-linecap="round"/>
 <ellipse cx="108" cy="184" rx="30" ry="16" fill="#F6C24A"/>
 <circle cx="96" cy="180" r="3" fill="#D99A2B"/><circle cx="114" cy="178" r="3" fill="#D99A2B"/><circle cx="124" cy="188" r="3" fill="#D99A2B"/>
 <path class="balanca" d="M196 190 Q186 166 198 146" stroke="#3E9E4F" stroke-width="6" fill="none" stroke-linecap="round"/>
</g>` },
moreia: { nome: 'fenda', svg: `<g>
 <rect x="10" y="190" width="200" height="16" rx="8" fill="#E8CF94"/>
 <path d="M20 196 Q16 90 70 60 Q110 40 150 60 Q204 90 200 196 Z" fill="#8F7E6C"/>
 <path d="M90 196 Q82 140 106 110 Q128 140 122 196 Z" fill="#3A2E28"/>
 <ellipse cx="60" cy="120" rx="14" ry="10" fill="#A8977F"/><ellipse cx="160" cy="140" rx="16" ry="10" fill="#A8977F"/>
 <circle cx="150" cy="80" r="8" fill="#F28C8C"/><circle cx="56" cy="170" r="6" fill="#FFD84D"/>
 <path class="balanca" d="M180 120 Q196 100 188 80" stroke="#3E9E4F" stroke-width="6" fill="none" stroke-linecap="round"/>
</g>` },
jacare: { nome: 'pântano', svg: `<g>
 <ellipse cx="110" cy="176" rx="100" ry="30" fill="#5E7F4A"/>
 <ellipse cx="110" cy="180" rx="80" ry="20" fill="#6E8E3A"/>
 <rect x="20" y="60" width="16" height="130" rx="6" fill="#7A5A3A"/><ellipse cx="28" cy="60" rx="30" ry="18" fill="#3E7A3A"/>
 <rect x="180" y="80" width="14" height="110" rx="6" fill="#7A5A3A"/><ellipse cx="187" cy="80" rx="26" ry="16" fill="#3E7A3A"/>
 <path class="balanca" d="M70 170 L70 120 M150 172 L150 128" stroke="#4E6B2A" stroke-width="4" stroke-linecap="round"/>
 <ellipse cx="70" cy="116" rx="4" ry="10" fill="#7A4A2A"/><ellipse cx="150" cy="124" rx="4" ry="10" fill="#7A4A2A"/>
 <ellipse cx="120" cy="186" rx="16" ry="5" fill="#8DB86A"/>
</g>` },
piranha: { nome: 'rio da selva', svg: `<g>
 <rect x="10" y="120" width="200" height="86" rx="16" fill="#6B9E6A"/>
 <path d="M10 126 Q60 112 110 126 Q160 140 210 124" stroke="#8FC48A" stroke-width="6" fill="none"/>
 <path d="M10 40 Q30 30 50 40 L50 126 L10 126 Z" fill="#2F7A3A"/><path d="M210 50 Q190 36 170 50 L170 126 L210 126 Z" fill="#2F7A3A"/>
 <path d="M50 60 Q80 70 110 60 Q140 50 170 64" stroke="#5C8A3A" stroke-width="4" fill="none"/>
 <ellipse class="balanca" cx="110" cy="62" rx="10" ry="6" fill="#4CAF50"/>
 <circle cx="70" cy="160" r="4" fill="#BFE8D0"/><circle cx="150" cy="180" r="5" fill="#BFE8D0"/>
 <ellipse cx="60" cy="40" rx="20" ry="10" fill="#3E9E4F"/><ellipse cx="160" cy="44" rx="20" ry="10" fill="#3E9E4F"/>
</g>` },
'caranguejo-eremita': { nome: 'poça', svg: `<g>
 <rect x="10" y="186" width="200" height="20" rx="8" fill="#E8CF94"/>
 <ellipse cx="40" cy="170" rx="34" ry="26" fill="#8A939C"/><ellipse cx="180" cy="166" rx="34" ry="30" fill="#9AA3AD"/>
 <ellipse cx="110" cy="186" rx="70" ry="14" fill="#7CC4EE"/>
 <path d="M70 184 Q90 178 110 184 M120 190 Q140 184 160 190" stroke="#D5F0FF" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M150 196 l8 -12 l8 12 Z" fill="#F7B7C4"/>
 <circle cx="60" cy="196" r="5" fill="#FFF6E0"/>
 <path class="balanca" d="M180 136 Q170 116 184 100" stroke="#3E9E4F" stroke-width="6" fill="none" stroke-linecap="round"/>
</g>` }
});
