'use strict';
Object.assign(HABITATS, {
urso: { nome: 'gruta', svg: `<g>
 <path d="M20 205 Q24 80 110 50 Q196 80 200 205 Z" fill="#9A9A9F"/>
 <path d="M40 120 Q60 90 90 80 M150 90 Q176 110 182 140" stroke="#7E7E84" stroke-width="6" fill="none" stroke-linecap="round"/>
 <path d="M60 205 Q62 120 110 110 Q158 120 160 205 Z" fill="#3C3036"/>
 <ellipse cx="110" cy="205" rx="100" ry="8" fill="#6DAA4A"/>
 <circle cx="40" cy="190" r="10" fill="#5C9A3A"/><circle cx="182" cy="192" r="9" fill="#5C9A3A"/>
 <path class="balanca" d="M168 74 Q178 64 186 74 Q178 82 168 74 Z" fill="#7DBF5A"/>
</g>` },
raposa: { nome: 'toca', svg: `<g>
 <path d="M14 205 Q30 110 110 100 Q190 110 206 205 Z" fill="#8E6A45"/>
 <ellipse cx="110" cy="176" rx="46" ry="34" fill="#3C2A1E"/>
 <path d="M14 205 Q30 110 110 100 Q190 110 206 205" stroke="#6DAA4A" stroke-width="10" fill="none"/>
 <circle cx="50" cy="150" r="6" fill="#A5835C"/><circle cx="170" cy="160" r="7" fill="#A5835C"/>
 <rect x="150" y="60" width="12" height="50" rx="4" fill="#7A4E2C"/>
 <circle cx="156" cy="56" r="24" fill="#5CA83A"/>
 <path class="balanca" d="M172 52 Q186 40 194 50 Q184 60 172 52 Z" fill="#7DBF5A"/>
 <ellipse cx="110" cy="205" rx="100" ry="6" fill="#5C9A3A"/>
</g>` },
lobo: { nome: 'floresta', svg: `<g>
 <ellipse cx="110" cy="205" rx="104" ry="8" fill="#5C9A3A"/>
 <rect x="38" y="140" width="12" height="64" rx="4" fill="#7A4E2C"/><path d="M44 50 L10 150 L78 150 Z" fill="#2F7A4A"/><path d="M44 30 L18 100 L70 100 Z" fill="#3A8C56"/>
 <rect x="104" y="130" width="12" height="74" rx="4" fill="#7A4E2C"/><path d="M110 30 L66 140 L154 140 Z" fill="#2F7A4A"/><path d="M110 14 L80 86 L140 86 Z" fill="#3A8C56"/>
 <rect x="170" y="140" width="12" height="64" rx="4" fill="#7A4E2C"/><path d="M176 50 L142 150 L210 150 Z" fill="#2F7A4A"/><path d="M176 30 L150 100 L202 100 Z" fill="#3A8C56"/>
 <circle class="balanca" cx="190" cy="22" r="12" fill="#F5E6A8"/>
</g>` },
veado: { nome: 'clareira', svg: `<g>
 <ellipse cx="110" cy="190" rx="104" ry="22" fill="#8CCB5E"/>
 <rect x="20" y="90" width="14" height="104" rx="5" fill="#7A4E2C"/><circle cx="27" cy="80" r="26" fill="#3A8C56"/>
 <rect x="186" y="90" width="14" height="104" rx="5" fill="#7A4E2C"/><circle cx="193" cy="80" r="26" fill="#3A8C56"/>
 <circle cx="70" cy="186" r="6" fill="#FFFFFF"/><circle cx="70" cy="186" r="2.5" fill="#FFD84D"/>
 <circle cx="140" cy="194" r="6" fill="#F7849E"/><circle cx="140" cy="194" r="2.5" fill="#FFD84D"/>
 <circle cx="104" cy="178" r="5" fill="#B48BE0"/>
 <path class="balanca" d="M110 30 L116 44 L130 46 L118 54 L122 68 L110 60 L98 68 L102 54 L90 46 L104 44 Z" fill="#FFE27A"/>
</g>` },
esquilo: { nome: 'árvore oca', svg: `<g>
 <rect x="70" y="80" width="80" height="125" rx="14" fill="#8B5A2B"/>
 <path d="M70 205 Q50 205 44 198 L70 186 Z M150 205 Q170 205 176 198 L150 186 Z" fill="#7A4E2C"/>
 <circle cx="110" cy="54" r="54" fill="#5CA83A"/><circle cx="62" cy="70" r="30" fill="#4E9A30"/><circle cx="158" cy="70" r="30" fill="#4E9A30"/>
 <ellipse cx="110" cy="134" rx="22" ry="28" fill="#3C2A1E"/>
 <path d="M84 170 q8 6 0 14 M136 110 q-8 6 0 14" stroke="#6A421E" stroke-width="3" fill="none"/>
 <path class="balanca" d="M170 100 L176 116 L164 116 Z" fill="#C8642A"/>
 <ellipse cx="110" cy="205" rx="80" ry="5" fill="#5C9A3A"/>
</g>` },
ourico: { nome: 'folhas', svg: `<g>
 <g transform="translate(110 205) scale(1.15 1.9) translate(-110 -205)"><ellipse cx="110" cy="190" rx="90" ry="22" fill="#C8642A"/>
 <path d="M30 186 Q50 150 80 170 Q60 196 30 186 Z" fill="#E8A13A"/>
 <path d="M70 170 Q100 130 130 160 Q100 190 70 170 Z" fill="#D9773A"/>
 <path d="M120 176 Q150 140 186 170 Q150 196 120 176 Z" fill="#F2B84A"/>
 <path d="M60 150 Q80 120 108 140 Q84 166 60 150 Z" fill="#B5571F"/>
 <path d="M110 140 Q136 108 160 134 Q136 158 110 140 Z" fill="#E8A13A"/>
 <path d="M80 170 L60 186 M100 160 L80 176 M150 162 L130 178" stroke="#8B4A1E" stroke-width="2.5"/></g>
 <path class="balanca" d="M150 50 Q172 36 182 60 Q160 70 150 50 Z" fill="#D9773A"/>
</g>` },
javali: { nome: 'lama', svg: `<g>
 <rect x="150" y="120" width="34" height="60" rx="6" fill="#8B5A2B"/><ellipse cx="167" cy="120" rx="17" ry="7" fill="#D9B58C"/><ellipse cx="110" cy="182" rx="100" ry="34" fill="#7A5236"/>
 <ellipse cx="104" cy="182" rx="76" ry="24" fill="#5E3C26"/>
 <circle cx="70" cy="182" r="7" fill="#8E6448"/><circle cx="148" cy="188" r="6" fill="#8E6448"/><circle cx="110" cy="180" r="4" fill="#8E6448"/>
 <path d="M18 186 Q16 150 26 140 M30 188 Q34 156 44 150 M196 186 Q200 154 192 144" stroke="#5C9A3A" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path class="balanca" d="M40 120 Q50 104 60 120 Q50 128 40 120 Z" fill="#7DBF5A"/>
</g>` },
texugo: { nome: 'buraco', svg: `<g>
 <ellipse cx="110" cy="200" rx="104" ry="10" fill="#5C9A3A"/>
 <path d="M24 204 Q40 140 110 134 Q180 140 196 204 Z" fill="#A47A50"/>
 <ellipse cx="110" cy="190" rx="54" ry="24" fill="#2E2018"/>
 <path d="M150 150 Q170 120 196 132" stroke="#7A4E2C" stroke-width="7" fill="none" stroke-linecap="round"/>
 <ellipse cx="54" cy="160" rx="8" ry="6" fill="#8B6640"/><ellipse cx="170" cy="176" rx="7" ry="5" fill="#8B6640"/>
 <path class="balanca" d="M196 132 Q206 120 212 132 Q204 140 196 132 Z" fill="#7DBF5A"/>
</g>` },
castor: { nome: 'barragem', svg: `<g>
 <rect x="10" y="168" width="200" height="38" rx="10" fill="#6FB9E6"/>
 <path d="M30 168 Q110 70 190 168 Z" fill="#8B5A2B"/>
 <path d="M40 160 L180 140 M50 140 L170 130 M70 116 L160 110 M60 150 L120 100" stroke="#6A421E" stroke-width="8" stroke-linecap="round"/>
 <path d="M90 104 L150 120" stroke="#A8733F" stroke-width="8" stroke-linecap="round"/>
 <path d="M30 186 q10 -6 20 0 M150 192 q10 -6 20 0" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path class="balanca" d="M100 84 Q110 70 120 84 Q110 92 100 84 Z" fill="#7DBF5A"/>
</g>` },
toupeira: { nome: 'montinho', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="8" fill="#6DAA4A"/>
 <path d="M30 204 Q60 96 110 92 Q160 96 190 204 Z" fill="#7A5236"/>
 <path d="M60 204 Q70 140 110 136 Q150 140 160 204 Z" fill="#8E6448"/>
 <circle cx="80" cy="150" r="6" fill="#5E3C26"/><circle cx="136" cy="128" r="5" fill="#5E3C26"/><circle cx="104" cy="114" r="4" fill="#5E3C26"/>
 <ellipse cx="110" cy="96" rx="20" ry="8" fill="#3C2A1E"/>
 <path class="balanca" d="M170 186 Q172 166 182 160 Q182 176 174 188 Z" fill="#5C9A3A"/>
</g>` },
morcego: { nome: 'caverna', svg: `<g>
 <path d="M10 205 L10 60 Q110 10 210 60 L210 205 Z" fill="#5A4E66"/>
 <path d="M36 205 L36 92 Q110 52 184 92 L184 205 Z" fill="#2A2232"/>
 <path d="M60 80 L68 112 L76 76 Z M100 66 L108 104 L116 64 Z M140 70 L148 100 L156 76 Z" fill="#5A4E66"/>
 <path d="M60 205 L68 176 L76 205 Z M140 205 L150 170 L160 205 Z" fill="#5A4E66"/>
 <circle cx="90" cy="140" r="3" fill="#FFE27A"/><circle cx="130" cy="150" r="3" fill="#FFE27A"/>
 <path class="balanca" d="M100 120 Q110 112 120 120 Q110 116 100 120 Z" fill="#7A64A0"/>
</g>` },
lince: { nome: 'rocha', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="8" fill="#6DAA4A"/>
 <path d="M24 204 L36 120 Q60 70 120 76 Q182 84 194 140 L198 204 Z" fill="#A0A4AB"/>
 <path d="M36 120 Q60 70 120 76 Q182 84 194 140 Q150 110 110 116 Q70 110 36 120 Z" fill="#BEC2C8"/>
 <path d="M80 150 L100 170 M140 140 L150 168" stroke="#868A92" stroke-width="5" stroke-linecap="round"/>
 <circle cx="180" cy="190" r="12" fill="#8E9299"/>
 <path class="balanca" d="M60 84 Q50 64 64 58 Q70 72 60 84 Z" fill="#5C9A3A"/>
</g>` },
panda: { nome: 'bambu', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="8" fill="#6DAA4A"/>
 <rect x="30" y="30" width="16" height="174" rx="6" fill="#8CC85A"/><rect x="80" y="14" width="16" height="190" rx="6" fill="#7DBF4A"/>
 <rect x="130" y="40" width="16" height="164" rx="6" fill="#8CC85A"/><rect x="176" y="24" width="16" height="180" rx="6" fill="#7DBF4A"/>
 <path d="M30 80 H46 M30 140 H46 M80 60 H96 M80 120 H96 M80 170 H96 M130 100 H146 M130 160 H146 M176 70 H192 M176 130 H192" stroke="#5A9A30" stroke-width="4"/>
 <path d="M46 80 Q64 66 76 72 Q62 84 46 80 Z" fill="#4E9A30"/><path d="M130 100 Q112 86 100 92 Q114 104 130 100 Z" fill="#4E9A30"/>
 <path class="balanca" d="M192 70 Q206 56 214 64 Q204 76 192 70 Z" fill="#4E9A30"/>
</g>` },
coala: { nome: 'eucalipto', svg: `<g>
 <ellipse cx="110" cy="202" rx="90" ry="8" fill="#6DAA4A"/>
 <path d="M96 204 L100 90 Q104 70 92 50 M100 110 Q130 90 150 70" stroke="#C9B49A" stroke-width="22" fill="none" stroke-linecap="round"/>
 <path d="M96 204 L100 90" stroke="#B09A80" stroke-width="6" fill="none"/>
 <ellipse cx="70" cy="44" rx="34" ry="22" fill="#8FB8A0"/><ellipse cx="154" cy="56" rx="38" ry="24" fill="#7EA890"/>
 <ellipse cx="110" cy="30" rx="30" ry="18" fill="#9CC4AC"/>
 <ellipse cx="40" cy="74" rx="8" ry="14" transform="rotate(30 40 74)" fill="#7EA890"/>
 <ellipse class="balanca" cx="186" cy="92" rx="7" ry="14" transform="rotate(-20 186 92)" fill="#8FB8A0"/>
</g>` },
alce: { nome: 'lago da floresta', svg: `<g>
 <ellipse cx="110" cy="200" rx="104" ry="10" fill="#5C9A3A"/>
 <path d="M20 180 L44 60 L68 180 Z M150 180 L176 50 L202 180 Z" fill="#2F7A4A"/>
 <ellipse cx="110" cy="186" rx="80" ry="22" fill="#5BA8D8"/>
 <path d="M70 184 H100 M120 190 H150" stroke="#BFE3F5" stroke-width="4" stroke-linecap="round"/>
 <rect x="168" y="150" width="4" height="40" fill="#6B8A3A"/><ellipse cx="170" cy="146" rx="5" ry="12" fill="#7A4E2C"/>
 <circle class="balanca" cx="40" cy="30" r="12" fill="#FFE27A"/>
</g>` },
doninha: { nome: 'muro de pedras', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="6" fill="#5C9A3A"/>
 <ellipse cx="50" cy="186" rx="34" ry="18" fill="#A8A8AE"/><ellipse cx="114" cy="188" rx="32" ry="16" fill="#B8B8BE"/><ellipse cx="174" cy="186" rx="32" ry="18" fill="#A0A0A8"/>
 <ellipse cx="80" cy="158" rx="30" ry="16" fill="#B8B8BE"/><ellipse cx="144" cy="158" rx="30" ry="16" fill="#A8A8AE"/>
 <ellipse cx="112" cy="132" rx="28" ry="14" fill="#A0A0A8"/>
 <ellipse cx="112" cy="160" rx="10" ry="8" fill="#3C3036"/>
 <path class="balanca" d="M40 166 Q34 150 44 144 Q48 156 40 166 Z" fill="#7DBF5A"/>
</g>` },
gamo: { nome: 'prado', svg: `<g>
 <ellipse cx="110" cy="190" rx="106" ry="24" fill="#9AD46A"/>
 <path d="M30 196 L34 180 M38 196 L40 182 M180 194 L184 178 M188 194 L190 180" stroke="#5C9A3A" stroke-width="3" stroke-linecap="round"/>
 <circle cx="60" cy="182" r="6" fill="#FFE27A"/><circle cx="160" cy="186" r="6" fill="#F7849E"/><circle cx="110" cy="198" r="5" fill="#FFFFFF"/>
 <rect x="184" y="110" width="12" height="84" rx="4" fill="#7A4E2C"/><circle cx="190" cy="100" r="24" fill="#4E9A30"/>
 <path class="balanca" d="M30 60 Q40 50 50 60 Q60 50 70 60" stroke="#6B6B70" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>` },
corco: { nome: 'bosque', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="8" fill="#6DAA4A"/>
 <rect x="24" y="90" width="14" height="114" rx="5" fill="#7A4E2C"/><circle cx="31" cy="76" r="30" fill="#5CA83A"/>
 <rect x="102" y="70" width="14" height="134" rx="5" fill="#7A4E2C"/><circle cx="109" cy="54" r="36" fill="#4E9A30"/>
 <rect x="180" y="96" width="14" height="108" rx="5" fill="#7A4E2C"/><circle cx="187" cy="82" r="28" fill="#5CA83A"/>
 <circle cx="70" cy="190" r="14" fill="#4E9A30"/><circle cx="150" cy="192" r="12" fill="#4E9A30"/>
 <path class="balanca" d="M140 60 Q154 50 160 60 Q150 68 140 60 Z" fill="#E8A040"/>
</g>` },
lebre: { nome: 'campo de trigo', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="8" fill="#C9A24A"/>
 <path d="M20 204 V110 M40 204 V100 M60 204 V116 M160 204 V104 M180 204 V112 M200 204 V100" stroke="#D9B85A" stroke-width="4"/>
 <ellipse cx="20" cy="104" rx="5" ry="12" fill="#E8C860"/><ellipse cx="40" cy="94" rx="5" ry="12" fill="#E8C860"/><ellipse cx="60" cy="110" rx="5" ry="12" fill="#E8C860"/>
 <ellipse cx="160" cy="98" rx="5" ry="12" fill="#E8C860"/><ellipse cx="180" cy="106" rx="5" ry="12" fill="#E8C860"/><ellipse cx="200" cy="94" rx="5" ry="12" fill="#E8C860"/>
 <circle cx="90" cy="196" r="6" fill="#E04848"/>
 <circle class="balanca" cx="110" cy="40" r="16" fill="#FFD84D"/>
</g>` },
salamandra: { nome: 'tronco caído', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="6" fill="#5C9A3A"/>
 <rect x="14" y="150" width="192" height="50" rx="25" fill="#8B5A2B"/>
 <ellipse cx="190" cy="175" rx="16" ry="25" fill="#C99A62"/><ellipse cx="190" cy="175" rx="8" ry="13" fill="#A87A44"/>
 <path d="M40 162 H90 M110 186 H160" stroke="#6E4422" stroke-width="4" stroke-linecap="round"/>
 <path d="M50 150 Q50 136 62 136 Q74 136 74 150 Z" fill="#E04848"/><rect x="58" y="150" width="8" height="10" fill="#FFF3E0"/>
 <path class="balanca" d="M120 150 Q120 130 136 132 Q130 146 120 150 Z" fill="#7DBF5A"/>
</g>` },
ra: { nome: 'charco', svg: `<g>
 <ellipse cx="110" cy="200" rx="104" ry="10" fill="#5C9A3A"/>
 <ellipse cx="110" cy="188" rx="92" ry="22" fill="#4E9AC8"/>
 <ellipse cx="70" cy="184" rx="26" ry="8" fill="#5CB04A"/><path d="M70 184 L94 180 L92 188 Z" fill="#4E9AC8"/>
 <ellipse cx="156" cy="192" rx="20" ry="6" fill="#5CB04A"/>
 <path d="M190 190 V110 M200 192 V120 M24 190 V120" stroke="#6B8A3A" stroke-width="4"/>
 <ellipse cx="190" cy="106" rx="5" ry="14" fill="#7A4E2C"/><ellipse cx="24" cy="116" rx="5" ry="14" fill="#7A4E2C"/>
 <circle cx="70" cy="178" r="6" fill="#F7B7C4"/>
 <g class="balanca"><ellipse cx="124" cy="60" rx="8" ry="5" fill="#CFE8F7"/><ellipse cx="136" cy="60" rx="8" ry="5" fill="#CFE8F7"/><ellipse cx="130" cy="64" rx="4" ry="7" fill="#3A3A40"/></g>
</g>` },
guaxinim: { nome: 'caixote do lixo', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="6" fill="#5C9A3A"/>
 <path d="M50 100 L60 204 L160 204 L170 100 Z" fill="#8E9AA6"/>
 <path d="M80 110 L84 196 M110 110 V196 M140 110 L136 196" stroke="#6E7A86" stroke-width="5"/>
 <rect x="40" y="86" width="140" height="18" rx="6" fill="#6E7A86" transform="rotate(-8 110 95)"/>
 <rect x="98" y="72" width="24" height="10" rx="4" fill="#6E7A86" transform="rotate(-8 110 95)"/>
 <path class="balanca" d="M168 80 Q180 70 186 80 Q178 88 168 80 Z" fill="#F2C94A"/>
</g>` },
gamba: { nome: 'galho', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="6" fill="#5C9A3A"/>
 <rect x="160" y="40" width="22" height="166" rx="8" fill="#7A4E2C"/>
 <path d="M170 110 Q100 100 20 120" stroke="#8B5A2B" stroke-width="16" fill="none" stroke-linecap="round"/>
 <circle cx="170" cy="40" r="34" fill="#4E9A30"/><circle cx="40" cy="108" r="16" fill="#5CA83A"/>
 <path class="balanca" d="M90 106 Q96 92 106 100 Q100 110 90 106 Z" fill="#7DBF5A"/>
</g>` },
'porco-espinho': { nome: 'pinheiro', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="6" fill="#5C9A3A"/>
 <rect x="102" y="150" width="16" height="54" rx="4" fill="#7A4E2C"/>
 <path d="M110 20 L40 160 L180 160 Z" fill="#2F7A4A"/><path d="M110 10 L60 100 L160 100 Z" fill="#3A8C56"/>
 <ellipse cx="60" cy="196" rx="8" ry="11" fill="#A0703A"/><ellipse cx="160" cy="198" rx="7" ry="10" fill="#A0703A"/>
 <path class="balanca" d="M150 120 L156 132 L144 132 Z" fill="#8B5A2B"/>
</g>` },
bisonte: { nome: 'pradaria', svg: `<g>
 <ellipse cx="110" cy="196" rx="106" ry="18" fill="#B8C86A"/>
 <path d="M10 180 Q60 150 110 170 Q160 150 210 176" stroke="#9AB050" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M30 196 L34 176 M180 198 L176 178 M120 200 L122 182" stroke="#7A9A3A" stroke-width="3" stroke-linecap="round"/>
 <path d="M20 176 Q60 110 110 150 Q150 100 200 176 Z" fill="#8FA8C8"/>
 <circle class="balanca" cx="170" cy="50" r="16" fill="#FFD84D"/>
</g>` },
arminho: { nome: 'neve', svg: `<g>
 <ellipse cx="110" cy="196" rx="106" ry="18" fill="#EAF4FB"/>
 <path d="M14 190 Q60 150 110 176 Q160 146 206 186 Z" fill="#FFFFFF"/>
 <rect x="170" y="130" width="10" height="60" fill="#7A4E2C"/><path d="M175 60 L145 140 L205 140 Z" fill="#2F7A4A"/><path d="M175 60 L160 100 L190 100 Z" fill="#FFFFFF"/>
 <circle cx="40" cy="50" r="4" fill="#CFE3F2"/><circle cx="90" cy="30" r="4" fill="#CFE3F2"/><circle cx="130" cy="70" r="4" fill="#CFE3F2"/>
 <circle class="balanca" cx="60" cy="100" r="5" fill="#CFE3F2"/>
</g>` },
marta: { nome: 'carvalho', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="6" fill="#5C9A3A"/>
 <path d="M84 204 Q96 150 92 110 L128 110 Q124 150 136 204 Z" fill="#7A4E2C"/>
 <circle cx="110" cy="60" r="50" fill="#4E8A30"/><circle cx="60" cy="80" r="34" fill="#5C9A3A"/><circle cx="160" cy="80" r="34" fill="#5C9A3A"/>
 <ellipse cx="80" cy="96" rx="5" ry="7" fill="#B07A3A"/><ellipse cx="146" cy="70" rx="5" ry="7" fill="#B07A3A"/>
 <path class="balanca" d="M40 120 Q48 108 56 118 Q48 128 40 120 Z" fill="#E8A040"/>
</g>` },
cuco: { nome: 'relógio de cuco', svg: `<g>
 <rect x="60" y="70" width="100" height="100" rx="6" fill="#8B5A2B"/>
 <path d="M48 76 L110 24 L172 76 Z" fill="#6E4024"/>
 <rect x="94" y="40" width="32" height="26" rx="4" fill="#3C2A1E"/>
 <circle cx="110" cy="118" r="30" fill="#FFF3E0"/>
 <path d="M110 118 V98 M110 118 L124 126" stroke="#2B1B12" stroke-width="4" stroke-linecap="round"/>
 <path d="M90 170 V196 M130 170 V186" stroke="#B08850" stroke-width="2"/>
 <ellipse cx="90" cy="200" rx="6" ry="9" fill="#B08850"/><ellipse cx="130" cy="190" rx="6" ry="9" fill="#B08850"/>
 <g class="balanca"><path d="M110 170 V196" stroke="#B08850" stroke-width="2"/><circle cx="110" cy="200" r="8" fill="#F2B21F"/></g>
</g>` }
});
