'use strict';
Object.assign(HABITATS, {
passaro: { nome: 'ninho', svg: `<g>
 <path d="M30 120 Q110 100 190 116" stroke="#8A5A33" stroke-width="10" fill="none" stroke-linecap="round"/>
 <ellipse class="balanca" cx="170" cy="104" rx="14" ry="7" fill="#6CC04A"/>
 <path d="M36 130 Q110 230 184 130 Z" fill="#B07A45"/>
 <path d="M52 150 Q110 162 168 150 M70 172 Q110 182 150 172" stroke="#8A5A33" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="132" rx="74" ry="14" fill="#8A5A33"/>
 <ellipse cx="94" cy="128" rx="12" ry="9" fill="#BFE3FF"/><ellipse cx="122" cy="128" rx="12" ry="9" fill="#BFE3FF"/>
</g>` },
pomba: { nome: 'telhado', svg: `<g>
 <rect x="40" y="110" width="140" height="95" fill="#F2E3C6"/>
 <path d="M24 116 L110 50 L196 116 Z" fill="#D9603B"/>
 <path d="M50 96 H170 M70 80 H150" stroke="#B84A2A" stroke-width="4"/>
 <rect x="140" y="56" width="20" height="34" fill="#A0522D"/>
 <circle class="balanca" cx="152" cy="44" r="8" fill="#DDDDDD"/>
 <rect x="94" y="150" width="32" height="55" rx="4" fill="#8A5A33"/>
 <rect x="56" y="130" width="26" height="24" rx="3" fill="#9FD3F2"/><rect x="138" y="130" width="26" height="24" rx="3" fill="#9FD3F2"/>
</g>` },
gaivota: { nome: 'cais', svg: `<g>
 <rect x="10" y="150" width="200" height="55" rx="8" fill="#4FA8E0"/>
 <path d="M20 168 q10 -8 20 0 t20 0 M120 180 q10 -8 20 0 t20 0" stroke="#FFFFFF" stroke-width="4" fill="none"/>
 <rect x="30" y="120" width="160" height="16" rx="3" fill="#B07A45"/>
 <rect x="44" y="120" width="12" height="85" fill="#8A5A33"/><rect x="164" y="120" width="12" height="85" fill="#8A5A33"/><rect x="104" y="120" width="12" height="85" fill="#8A5A33"/>
 <rect x="164" y="80" width="12" height="40" fill="#8A5A33"/>
 <path class="balanca" d="M176 80 L200 88 L176 96 Z" fill="#E8463C"/>
</g>` },
coruja: { nome: 'árvore oca', svg: `<g>
 <rect x="62" y="70" width="96" height="135" rx="10" fill="#8A5A33"/>
 <circle cx="110" cy="56" r="70" fill="#4CAF50"/>
 <circle cx="58" cy="76" r="34" fill="#43A047"/><circle cx="162" cy="76" r="34" fill="#43A047"/>
 <ellipse cx="110" cy="140" rx="30" ry="38" fill="#3E2614"/>
 <ellipse cx="110" cy="140" rx="22" ry="30" fill="#2A190C"/>
 <path d="M62 205 Q50 205 40 200 M158 205 Q170 205 180 200" stroke="#8A5A33" stroke-width="8" stroke-linecap="round"/>
 <circle class="balanca" cx="170" cy="30" r="10" fill="#FFF3B0"/>
</g>` },
cisne: { nome: 'lago', svg: `<g>
 <ellipse cx="110" cy="170" rx="100" ry="36" fill="#4FA8E0"/>
 <ellipse cx="110" cy="166" rx="80" ry="24" fill="#7FC8F0"/>
 <path d="M14 160 Q8 120 20 110 M28 158 Q26 116 36 104" stroke="#4E8A3A" stroke-width="5" fill="none"/>
 <ellipse cx="20" cy="108" rx="4" ry="12" fill="#8A5A33"/><ellipse cx="36" cy="102" rx="4" ry="12" fill="#8A5A33"/>
 <ellipse cx="160" cy="176" rx="18" ry="6" fill="#6CC04A"/>
 <circle class="balanca" cx="160" cy="170" r="6" fill="#FFB0C8"/>
 <path d="M70 170 q8 -6 16 0 M120 186 q8 -6 16 0" stroke="#FFFFFF" stroke-width="3" fill="none"/>
</g>` },
pelicano: { nome: 'pontão', svg: `<g>
 <rect x="10" y="140" width="200" height="65" rx="8" fill="#3E8FD0"/>
 <path d="M20 160 q10 -8 20 0 t20 0 t20 0 M110 186 q10 -8 20 0 t20 0" stroke="#FFFFFF" stroke-width="4" fill="none"/>
 <rect x="60" y="80" width="22" height="125" rx="4" fill="#8A5A33"/>
 <rect x="138" y="96" width="22" height="109" rx="4" fill="#8A5A33"/>
 <ellipse cx="71" cy="80" rx="11" ry="4" fill="#B07A45"/><ellipse cx="149" cy="96" rx="11" ry="4" fill="#B07A45"/>
 <path d="M60 120 H82 M138 130 H160" stroke="#6B4226" stroke-width="3"/>
 <circle class="balanca" cx="180" cy="40" r="16" fill="#FFD23F"/>
</g>` },
flamingo: { nome: 'lagoa', svg: `<g>
 <ellipse cx="110" cy="178" rx="100" ry="28" fill="#7FC8F0"/>
 <ellipse cx="110" cy="176" rx="70" ry="16" fill="#A8DCF5"/>
 <path d="M20 176 Q14 130 24 110 M34 176 Q34 126 46 112 M190 176 Q196 134 186 116" stroke="#4E8A3A" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path class="balanca" d="M186 116 Q200 106 196 96 Q182 104 186 116 Z" fill="#6CC04A"/>
 <circle cx="170" cy="50" r="20" fill="#FFB347"/>
 <path d="M80 180 q8 -5 16 0 M124 172 q8 -5 16 0" stroke="#FFFFFF" stroke-width="3" fill="none"/>
</g>` },
avestruz: { nome: 'savana', svg: `<g>
 <rect x="0" y="160" width="220" height="45" rx="8" fill="#E8C070"/>
 <rect x="150" y="96" width="12" height="70" fill="#8A5A33"/>
 <ellipse cx="156" cy="92" rx="46" ry="14" fill="#7BAA3A"/>
 <circle cx="56" cy="50" r="20" fill="#FFB020"/>
 <path d="M30 164 l4 -14 l4 14 M80 166 l4 -12 l4 12 M190 166 l4 -14 l4 14" stroke="#B89040" stroke-width="3" fill="none"/>
 <path class="balanca" d="M110 166 l-6 -16 M114 166 l0 -18 M118 166 l6 -16" stroke="#C8A050" stroke-width="3" stroke-linecap="round"/>
 <ellipse cx="60" cy="180" rx="20" ry="6" fill="#D0A858"/>
</g>` },
tucano: { nome: 'selva', svg: `<g>
 <rect x="94" y="60" width="26" height="145" rx="6" fill="#8A5A33"/>
 <ellipse cx="60" cy="70" rx="50" ry="30" fill="#2E8B3A"/>
 <ellipse cx="160" cy="62" rx="50" ry="30" fill="#2E8B3A"/>
 <ellipse cx="110" cy="44" rx="44" ry="28" fill="#3FA84A"/>
 <path d="M30 100 Q34 140 26 170 M186 90 Q182 130 190 160" stroke="#4E9A3A" stroke-width="4" fill="none"/>
 <path class="balanca" d="M26 170 Q14 160 20 150 Q32 158 26 170 Z" fill="#6CC04A"/>
 <path d="M40 205 Q50 170 70 205 Z M150 205 Q164 168 180 205 Z" fill="#3FA84A"/>
 <circle cx="56" cy="190" r="7" fill="#FF6F91"/><circle cx="166" cy="186" r="7" fill="#FFD23F"/>
</g>` },
papagaio: { nome: 'ramo', svg: `<g>
 <path d="M10 140 Q110 120 210 146" stroke="#8A5A33" stroke-width="14" fill="none" stroke-linecap="round"/>
 <path d="M60 134 Q50 110 30 104 M160 136 Q170 110 190 106" stroke="#8A5A33" stroke-width="6" fill="none" stroke-linecap="round"/>
 <ellipse cx="30" cy="100" rx="16" ry="8" fill="#3FB060"/><ellipse cx="190" cy="102" rx="16" ry="8" fill="#3FB060"/>
 <ellipse class="balanca" cx="110" cy="150" rx="8" ry="16" fill="#3FB060"/>
 <circle cx="140" cy="150" r="7" fill="#FF8C1A"/><circle cx="80" cy="148" r="7" fill="#E8463C"/>
 <rect x="0" y="190" width="220" height="15" rx="6" fill="#6CC04A"/>
</g>` },
aguia: { nome: 'falésia', svg: `<g>
 <path d="M10 205 L40 70 L90 40 L150 60 L200 120 L210 205 Z" fill="#9A8A7A"/>
 <path d="M40 70 L90 40 L100 70 L60 90 Z" fill="#FFFFFF"/>
 <path d="M70 140 L120 130 M130 170 L180 160" stroke="#7A6A5A" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="110" cy="112" rx="40" ry="10" fill="#8A5A33"/>
 <path d="M76 110 Q110 124 144 110" stroke="#6B4226" stroke-width="4" fill="none"/>
 <ellipse class="balanca" cx="180" cy="40" rx="20" ry="8" fill="#FFFFFF"/>
</g>` },
'pica-pau': { nome: 'tronco', svg: `<g>
 <rect x="70" y="10" width="80" height="195" rx="12" fill="#9C6234"/>
 <path d="M86 30 V80 M132 60 V120 M96 140 V190" stroke="#7A4A26" stroke-width="5" stroke-linecap="round"/>
 <circle cx="114" cy="100" r="14" fill="#3E2614"/>
 <path d="M150 70 Q180 60 196 70" stroke="#9C6234" stroke-width="10" stroke-linecap="round" fill="none"/>
 <ellipse class="balanca" cx="196" cy="62" rx="12" ry="7" fill="#6CC04A"/>
 <path d="M70 205 Q50 205 44 196 M150 205 Q170 205 176 196" stroke="#9C6234" stroke-width="10" stroke-linecap="round"/>
 <circle cx="136" cy="96" r="3" fill="#E8C9A0"/><circle cx="140" cy="104" r="2.5" fill="#E8C9A0"/>
</g>` },
pavao: { nome: 'jardim', svg: `<g>
 <rect x="0" y="170" width="220" height="35" rx="8" fill="#6CC04A"/>
 <rect x="20" y="110" width="180" height="10" rx="3" fill="#FFFFFF"/>
 <path d="M30 120 V172 M60 120 V172 M90 120 V172 M130 120 V172 M160 120 V172 M190 120 V172" stroke="#FFFFFF" stroke-width="8"/>
 <ellipse cx="110" cy="190" rx="34" ry="10" fill="#7FC8F0"/>
 <circle cx="40" cy="160" r="9" fill="#FF6F91"/><circle cx="180" cy="160" r="9" fill="#FFD23F"/>
 <circle class="balanca" cx="110" cy="76" r="22" fill="#3FA84A"/><rect x="106" y="96" width="8" height="74" fill="#8A5A33"/>
</g>` },
cegonha: { nome: 'chaminé', svg: `<g>
 <rect x="76" y="80" width="68" height="125" fill="#C8573A"/>
 <path d="M76 110 H144 M76 140 H144 M76 170 H144 M110 80 V110 M96 110 V140 M126 110 V140 M110 140 V170 M96 170 V205 M126 170 V205" stroke="#A04028" stroke-width="3"/>
 <rect x="68" y="72" width="84" height="14" rx="3" fill="#A04028"/>
 <path d="M44 72 Q110 20 176 72 Z" fill="#B07A45"/>
 <path d="M50 64 Q110 40 170 64 M64 52 Q110 34 156 52" stroke="#8A5A33" stroke-width="4" fill="none"/>
 <path class="balanca" d="M176 70 L196 60" stroke="#8A5A33" stroke-width="4" stroke-linecap="round"/>
</g>` }
});
