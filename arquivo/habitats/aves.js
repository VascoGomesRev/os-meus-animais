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
</g>` },
andorinha: { nome: 'beiral', svg: `<g>
 <rect x="20" y="70" width="180" height="135" fill="#F2E3C6"/>
 <path d="M6 76 L214 76 L200 50 L20 50 Z" fill="#D9603B"/>
 <path d="M30 64 H190" stroke="#B84A2A" stroke-width="4"/>
 <path d="M120 78 Q150 120 180 78 Z" fill="#B07A45"/>
 <path d="M130 90 Q150 100 170 90" stroke="#8A5A33" stroke-width="3" fill="none"/>
 <rect x="44" y="110" width="40" height="40" rx="4" fill="#9FD3F2"/>
 <path d="M64 110 V150 M44 130 H84" stroke="#FFFFFF" stroke-width="4"/>
 <rect x="110" y="150" width="34" height="55" rx="4" fill="#8A5A33"/>
 <circle class="balanca" cx="150" cy="96" r="5" fill="#FFD23F"/>
</g>` },
melro: { nome: 'sebe', svg: `<g>
 <rect x="10" y="190" width="200" height="15" rx="6" fill="#6CC04A"/>
 <rect x="20" y="100" width="180" height="95" rx="30" fill="#3F8F3A"/>
 <circle cx="50" cy="104" r="26" fill="#4CAF50"/><circle cx="96" cy="96" r="30" fill="#4CAF50"/><circle cx="146" cy="98" r="28" fill="#4CAF50"/><circle cx="182" cy="108" r="22" fill="#4CAF50"/>
 <circle cx="60" cy="140" r="6" fill="#2A2A6A"/><circle cx="70" cy="146" r="6" fill="#2A2A6A"/><circle cx="150" cy="150" r="6" fill="#2A2A6A"/><circle cx="160" cy="142" r="6" fill="#2A2A6A"/>
 <circle cx="110" cy="160" r="8" fill="#FFFFFF"/><circle cx="110" cy="160" r="3" fill="#FFD23F"/>
 <ellipse class="balanca" cx="190" cy="80" rx="12" ry="6" fill="#6CC04A"/>
</g>` },
pardal: { nome: 'arbusto', svg: `<g>
 <rect x="10" y="190" width="200" height="15" rx="6" fill="#C8A26A"/>
 <circle cx="110" cy="130" r="64" fill="#5AA845"/>
 <circle cx="62" cy="152" r="40" fill="#4C9A3A"/><circle cx="158" cy="152" r="40" fill="#4C9A3A"/>
 <circle cx="90" cy="110" r="5" fill="#E8463C"/><circle cx="140" cy="120" r="5" fill="#E8463C"/><circle cx="70" cy="150" r="5" fill="#E8463C"/><circle cx="150" cy="160" r="5" fill="#E8463C"/>
 <circle cx="40" cy="198" r="4" fill="#E8C9A0"/><circle cx="52" cy="200" r="4" fill="#E8C9A0"/><circle cx="176" cy="198" r="4" fill="#E8C9A0"/>
 <ellipse class="balanca" cx="110" cy="64" rx="12" ry="7" fill="#7FCC5A"/>
</g>` },
rouxinol: { nome: 'bosque', svg: `<g>
 <rect x="0" y="186" width="220" height="19" rx="6" fill="#6CC04A"/>
 <rect x="40" y="110" width="16" height="80" fill="#8A5A33"/><rect x="164" y="100" width="16" height="90" fill="#8A5A33"/><rect x="102" y="120" width="14" height="70" fill="#8A5A33"/>
 <circle cx="48" cy="90" r="38" fill="#3F8F3A"/><circle cx="172" cy="80" r="40" fill="#3F8F3A"/><circle cx="109" cy="104" r="30" fill="#4CAF50"/>
 <path d="M56 140 Q110 126 164 136" stroke="#8A5A33" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle cx="80" cy="196" r="5" fill="#FFFFFF"/><circle cx="140" cy="196" r="5" fill="#FFD23F"/>
 <circle class="balanca" cx="110" cy="30" r="12" fill="#FFF3B0"/>
</g>` },
mocho: { nome: 'muro velho', svg: `<g>
 <rect x="30" y="80" width="160" height="125" fill="#B0A590"/>
 <path d="M30 110 H190 M30 140 H190 M30 170 H190 M70 80 V110 M130 80 V110 M100 110 V140 M160 110 V140 M70 140 V170 M130 140 V170 M100 170 V205 M160 170 V205" stroke="#8A8070" stroke-width="3"/>
 <path d="M86 140 Q110 100 134 140 Z" fill="#3A3226"/>
 <path d="M30 80 Q40 60 60 80 Q70 64 90 80" fill="#5AA845"/>
 <path d="M150 80 Q164 62 190 80" fill="#5AA845"/>
 <circle class="balanca" cx="180" cy="40" r="14" fill="#FFF3B0"/>
</g>` },
garca: { nome: 'caniçal', svg: `<g>
 <ellipse cx="110" cy="186" rx="104" ry="22" fill="#4FA8E0"/>
 <path d="M24 196 V90 M40 196 V70 M180 196 V80 M196 196 V100 M58 196 V110" stroke="#5E9A3A" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="40" cy="74" rx="5" ry="16" fill="#8A5A33"/><ellipse cx="180" cy="84" rx="5" ry="16" fill="#8A5A33"/><ellipse cx="24" cy="94" rx="5" ry="14" fill="#8A5A33"/>
 <path d="M80 186 q10 -6 20 0 M130 194 q10 -6 20 0" stroke="#FFFFFF" stroke-width="3" fill="none"/>
 <ellipse class="balanca" cx="196" cy="100" rx="5" ry="14" fill="#8A5A33"/>
</g>` },
colibri: { nome: 'flor grande', svg: `<g>
 <path d="M110 205 V120" stroke="#4E8A3A" stroke-width="8"/>
 <ellipse cx="80" cy="170" rx="26" ry="10" fill="#5AA845" transform="rotate(-30 80 170)"/>
 <ellipse class="balanca" cx="140" cy="160" rx="26" ry="10" fill="#5AA845" transform="rotate(30 140 160)"/>
 <ellipse cx="110" cy="70" rx="26" ry="44" fill="#FF6F91"/>
 <ellipse cx="66" cy="96" rx="26" ry="44" fill="#FF6F91" transform="rotate(-60 66 96)"/>
 <ellipse cx="154" cy="96" rx="26" ry="44" fill="#FF6F91" transform="rotate(60 154 96)"/>
 <ellipse cx="80" cy="130" rx="22" ry="34" fill="#FF8FAB" transform="rotate(-130 80 130)"/>
 <ellipse cx="140" cy="130" rx="22" ry="34" fill="#FF8FAB" transform="rotate(130 140 130)"/>
 <circle cx="110" cy="108" r="22" fill="#FFD23F"/>
</g>` },
corvo: { nome: 'torre', svg: `<g>
 <rect x="70" y="70" width="80" height="135" fill="#9A9AA6"/>
 <path d="M64 70 V50 H80 V60 H96 V50 H124 V60 H140 V50 H156 V70 Z" fill="#7E7E8C"/>
 <path d="M70 100 H150 M70 130 H150 M70 160 H150" stroke="#7E7E8C" stroke-width="3"/>
 <path d="M98 205 V176 Q110 160 122 176 V205 Z" fill="#5A3A22"/>
 <path d="M102 120 V104 Q110 94 118 104 V120 Z" fill="#2E2E3A"/>
 <path d="M110 50 V20" stroke="#5A5A5A" stroke-width="3"/>
 <path class="balanca" d="M110 20 L136 28 L110 36 Z" fill="#E8463C"/>
 <circle cx="180" cy="40" r="14" fill="#FFF3B0"/>
</g>` },
pega: { nome: 'cerca', svg: `<g>
 <rect x="0" y="188" width="220" height="17" rx="6" fill="#6CC04A"/>
 <rect x="10" y="120" width="200" height="12" rx="3" fill="#B07A45"/><rect x="10" y="156" width="200" height="12" rx="3" fill="#B07A45"/>
 <path d="M24 196 V110 L32 100 L40 110 V196 Z M74 196 V110 L82 100 L90 110 V196 Z M130 196 V110 L138 100 L146 110 V196 Z M180 196 V110 L188 100 L196 110 V196 Z" fill="#C8925A"/>
 <circle cx="110" cy="182" r="7" fill="#FFD23F"/><circle cx="160" cy="184" r="6" fill="#FFFFFF"/>
 <ellipse class="balanca" cx="60" cy="184" rx="10" ry="5" fill="#4CAF50"/>
</g>` },
falcao: { nome: 'castelo', svg: `<g>
 <rect x="30" y="100" width="160" height="105" fill="#C8BCA8"/>
 <rect x="20" y="70" width="46" height="135" fill="#B0A490"/><rect x="154" y="70" width="46" height="135" fill="#B0A490"/>
 <path d="M20 70 V58 H32 V66 H44 V58 H56 V66 H66 V70 Z M154 70 V58 H166 V66 H178 V58 H190 V66 H200 V70 Z" fill="#9A8E7A"/>
 <path d="M84 205 V160 Q110 130 136 160 V205 Z" fill="#6B4226"/>
 <rect x="36" y="100" width="14" height="22" rx="7" fill="#3A3226"/><rect x="170" y="100" width="14" height="22" rx="7" fill="#3A3226"/>
 <path d="M43 58 V30" stroke="#5A5A5A" stroke-width="3"/>
 <path class="balanca" d="M43 30 L68 38 L43 46 Z" fill="#3E7FD6"/>
</g>` },
abutre: { nome: 'penhasco', svg: `<g>
 <path d="M10 205 L30 110 L70 80 L120 96 L170 70 L210 120 L210 205 Z" fill="#C88A5A"/>
 <path d="M30 140 L80 130 M120 120 L180 112 M50 170 L140 160" stroke="#A86A3E" stroke-width="5" stroke-linecap="round"/>
 <path d="M120 96 L170 70 L150 100 Z" fill="#E0A878"/>
 <ellipse cx="160" cy="196" rx="20" ry="6" fill="#8AA04A"/>
 <circle cx="40" cy="40" r="16" fill="#FFD23F"/>
 <path class="balanca" d="M170 70 L176 50" stroke="#6B8A3A" stroke-width="4" stroke-linecap="round"/>
</g>` },
arara: { nome: 'palmeira', svg: `<g>
 <ellipse cx="110" cy="200" rx="80" ry="8" fill="#E8C98A"/>
 <path d="M104 200 Q96 140 110 70 L120 70 Q108 140 118 200 Z" fill="#B07A45"/>
 <path d="M100 120 H116 M102 150 H118 M100 176 H118" stroke="#8A5A33" stroke-width="3"/>
 <path d="M114 70 Q70 40 24 70 Q70 56 114 74 Z" fill="#3FA84A"/>
 <path d="M114 70 Q160 40 204 72 Q160 58 114 74 Z" fill="#3FA84A"/>
 <path d="M114 70 Q90 20 50 20 Q90 36 112 72 Z" fill="#4CAF50"/>
 <path class="balanca" d="M114 70 Q140 20 180 22 Q140 38 116 72 Z" fill="#4CAF50"/>
 <circle cx="108" cy="78" r="7" fill="#8A5A33"/><circle cx="120" cy="80" r="7" fill="#8A5A33"/>
</g>` },
cacatua: { nome: 'poleiro', svg: `<g>
 <rect x="104" y="60" width="12" height="140" fill="#B07A45"/>
 <ellipse cx="110" cy="202" rx="50" ry="8" fill="#8A5A33"/>
 <rect x="40" y="70" width="140" height="12" rx="6" fill="#C8925A"/>
 <path d="M50 82 Q50 102 64 102 Q78 102 78 82 Z" fill="#3E7FD6"/><path d="M142 82 Q142 102 156 102 Q170 102 170 82 Z" fill="#E8463C"/>
 <circle cx="58" cy="86" r="4" fill="#FFD23F"/><circle cx="66" cy="88" r="4" fill="#FFD23F"/>
 <path d="M160 70 V40" stroke="#8A8A8A" stroke-width="3"/>
 <circle class="balanca" cx="160" cy="44" r="9" fill="#FFD23F"/>
</g>` },
perdiz: { nome: 'campo de trigo', svg: `<g>
 <rect x="0" y="176" width="220" height="29" rx="6" fill="#C8A26A"/>
 <path d="M20 190 V100 M40 190 V90 M60 190 V110 M160 190 V104 M180 190 V88 M200 190 V100" stroke="#D9A83A" stroke-width="4"/>
 <ellipse cx="20" cy="96" rx="6" ry="14" fill="#F2C24A"/><ellipse cx="40" cy="86" rx="6" ry="14" fill="#F2C24A"/><ellipse cx="60" cy="106" rx="6" ry="14" fill="#F2C24A"/>
 <ellipse cx="160" cy="100" rx="6" ry="14" fill="#F2C24A"/><ellipse class="balanca" cx="180" cy="84" rx="6" ry="14" fill="#F2C24A"/><ellipse cx="200" cy="96" rx="6" ry="14" fill="#F2C24A"/>
 <circle cx="100" cy="40" r="18" fill="#FFD23F"/>
 <circle cx="88" cy="184" r="6" fill="#E8463C"/>
</g>` }
});
