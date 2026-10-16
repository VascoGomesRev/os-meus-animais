/* Desenhos kawaii dos animais, em SVG (só o interior; a app põe o <svg viewBox="0 0 220 220"> à volta).
   Regras para cada desenho:
   - tudo dentro de <g class="corpo"> (é o que salta quando se toca no animal)
   - olhos com olhos(xEsq, xDir, y) → piscam; bochechas(xEsq, xDir, y); sorriso(x, y)
   - classes de animação: .cauda (abana), .cauda-peixe, .orelha (mexe), .asa (bate), .bolha (sobe)
   - o contorno branco tipo autocolante e a sombra são feitos pelo CSS da app, não aqui */
'use strict';
const olhos=(xl,xr,y,rx=11,ry=13)=>`<g class="olhos">${[xl,xr].map(x=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#2B1B12"/><circle cx="${x+rx*.35}" cy="${y-ry*.38}" r="${rx*.42}" fill="#fff"/><circle cx="${x-rx*.3}" cy="${y+ry*.35}" r="${rx*.2}" fill="#fff"/>`).join('')}</g>`;
const bochechas=(xl,xr,y)=>`<ellipse cx="${xl}" cy="${y}" rx="10" ry="6" fill="#F7849E" opacity=".55"/><ellipse cx="${xr}" cy="${y}" rx="10" ry="6" fill="#F7849E" opacity=".55"/>`;
const sorriso=(x,y,c='#2B1B12')=>`<path d="M${x-10} ${y} Q${x-5} ${y+7} ${x} ${y} Q${x+5} ${y+7} ${x+10} ${y}" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>`;

const DESENHOS={
cao:`<g class="corpo">
 <path class="cauda" d="M150 162 Q186 152 182 118" stroke="#D99A5B" stroke-width="15" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="168" rx="48" ry="32" fill="#E9B57A"/><ellipse cx="110" cy="176" rx="28" ry="19" fill="#FBE3C2"/>
 <ellipse cx="86" cy="197" rx="15" ry="9" fill="#E9B57A"/><ellipse cx="134" cy="197" rx="15" ry="9" fill="#E9B57A"/>
 <path class="orelha" d="M54 58 Q18 76 28 128 Q46 136 60 102 Z" fill="#9C6234"/>
 <path class="orelha" d="M166 58 Q202 76 192 128 Q174 136 160 102 Z" fill="#9C6234"/>
 <ellipse cx="110" cy="92" rx="62" ry="54" fill="#F4CC98"/>
 <ellipse cx="134" cy="84" rx="21" ry="19" fill="#E2A866"/>
 ${olhos(88,132,88)}${bochechas(68,152,110)}
 <ellipse cx="110" cy="114" rx="22" ry="15" fill="#FFF0DC"/>
 <ellipse cx="110" cy="106" rx="9" ry="6.5" fill="#2B1B12"/>
 <path d="M106 121 Q110 134 114 121 Z" fill="#F27E93"/>${sorriso(110,118)}
</g>`,
gato:`<g class="corpo">
 <path class="cauda" d="M152 176 Q198 170 190 128 Q186 108 170 112" stroke="#E8913A" stroke-width="14" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#F2A65A"/><ellipse cx="110" cy="178" rx="24" ry="17" fill="#FFE6C9"/>
 <ellipse cx="88" cy="197" rx="14" ry="9" fill="#F2A65A"/><ellipse cx="132" cy="197" rx="14" ry="9" fill="#F2A65A"/>
 <g class="orelha"><path d="M56 72 L64 20 L100 50 Z" fill="#F2A65A"/><path d="M66 60 L70 34 L88 52 Z" fill="#F7B7C4"/></g>
 <g class="orelha"><path d="M164 72 L156 20 L120 50 Z" fill="#F2A65A"/><path d="M154 60 L150 34 L132 52 Z" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="92" rx="60" ry="50" fill="#F6B26B"/>
 <path d="M102 46 L104 60 M110 44 L110 61 M118 46 L116 60" stroke="#D9782B" stroke-width="4" stroke-linecap="round"/>
 ${olhos(88,132,90)}${bochechas(68,152,110)}
 <path d="M104 106 L116 106 L110 113 Z" fill="#E86F8A"/>${sorriso(110,115)}
 <path d="M70 106 L38 100 M70 113 L38 116 M150 106 L182 100 M150 113 L182 116" stroke="#8A5A33" stroke-width="2.5" stroke-linecap="round"/>
</g>`,
vaca:`<g class="corpo">
 <g class="cauda"><path d="M154 160 Q184 166 186 138" stroke="#E6E6E6" stroke-width="7" stroke-linecap="round" fill="none"/><circle cx="186" cy="134" r="7" fill="#3A3A3A"/></g>
 <ellipse cx="110" cy="170" rx="48" ry="30" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
 <path d="M80 152 Q96 146 100 162 Q90 176 76 168 Z M128 160 Q148 152 152 172 Q138 186 126 176 Z" fill="#2E2E2E"/>
 <ellipse cx="88" cy="198" rx="13" ry="8" fill="#4A4A4A"/><ellipse cx="132" cy="198" rx="13" ry="8" fill="#4A4A4A"/>
 <path d="M76 46 Q66 24 80 18 Q80 36 88 44 Z" fill="#F2D7A0"/><path d="M144 46 Q154 24 140 18 Q140 36 132 44 Z" fill="#F2D7A0"/>
 <g class="orelha"><ellipse cx="46" cy="74" rx="22" ry="11" transform="rotate(-22 46 74)" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/><ellipse cx="48" cy="74" rx="12" ry="5" transform="rotate(-22 48 74)" fill="#F7B7C4"/></g>
 <g class="orelha"><ellipse cx="174" cy="74" rx="22" ry="11" transform="rotate(22 174 74)" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/><ellipse cx="172" cy="74" rx="12" ry="5" transform="rotate(22 172 74)" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="88" rx="56" ry="50" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
 <path d="M122 42 Q152 38 160 66 Q148 84 128 70 Q118 58 122 42 Z" fill="#2E2E2E"/>
 ${olhos(90,130,80,10,12)}${bochechas(66,154,98)}
 <ellipse cx="110" cy="118" rx="36" ry="22" fill="#F7B7C4"/>
 <ellipse cx="97" cy="114" rx="5" ry="4" fill="#C9718A"/><ellipse cx="123" cy="114" rx="5" ry="4" fill="#C9718A"/>${sorriso(110,126,'#B05A74')}
</g>`,
pato:`<g class="corpo">
 <path class="cauda" d="M164 150 Q196 128 192 162 Z" fill="#FFD84D"/>
 <ellipse cx="114" cy="160" rx="58" ry="40" fill="#FFD84D"/>
 <path class="asa" d="M102 150 Q132 132 152 160 Q130 180 106 166 Z" fill="#F5C232"/>
 <ellipse cx="94" cy="201" rx="15" ry="6" fill="#F28C28"/><ellipse cx="134" cy="201" rx="15" ry="6" fill="#F28C28"/>
 <circle cx="96" cy="88" r="50" fill="#FFDF5E"/>
 <path d="M90 42 Q94 22 106 32 Q102 40 98 42 Z" fill="#FFDF5E"/>
 ${olhos(78,114,82,9,11)}${bochechas(60,132,102)}
 <ellipse cx="96" cy="108" rx="24" ry="11" fill="#F28C28"/><path d="M74 108 Q96 115 118 108" stroke="#D86F15" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</g>`,
peixe:`<g class="corpo">
 <circle class="bolha" cx="44" cy="70" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="34" cy="56" r="4" stroke="#fff" stroke-width="2.5" fill="none"/>
 <circle class="bolha" cx="50" cy="48" r="3" stroke="#fff" stroke-width="2.5" fill="none"/>
 <path class="cauda-peixe" d="M156 110 L200 74 Q190 110 200 146 Z" fill="#FF8A3D"/>
 <path d="M88 66 Q118 34 144 72 Z" fill="#FF7A2A"/>
 <ellipse cx="104" cy="110" rx="64" ry="48" fill="#FFA552"/>
 <path d="M118 92 q9 9 0 18 M134 92 q9 9 0 18 M126 112 q9 9 0 18 M142 112 q9 9 0 18" stroke="#FF8A3D" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path class="asa" d="M100 124 Q122 128 116 148 Q100 142 100 124 Z" fill="#FF7A2A"/>
 <g class="olhos"><ellipse cx="74" cy="98" rx="13" ry="15" fill="#2B1B12"/><circle cx="79" cy="92" r="5.5" fill="#fff"/><circle cx="70" cy="104" r="2.6" fill="#fff"/></g>
 <ellipse cx="68" cy="124" rx="9" ry="5.5" fill="#F7849E" opacity=".6"/>
 <path d="M44 116 Q50 123 57 116" stroke="#2B1B12" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>`
};
