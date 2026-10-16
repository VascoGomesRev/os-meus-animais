'use strict';
Object.assign(HABITATS, {
borboleta: { nome: 'flor', svg: `<g>
 <ellipse cx="110" cy="205" rx="90" ry="10" fill="#8CCF5E"/>
 <rect x="104" y="100" width="12" height="105" rx="6" fill="#5DA83E"/>
 <path class="balanca" d="M110 170 Q70 150 60 176 Q86 186 110 176 Z" fill="#6CC04A"/>
 <path d="M110 150 Q150 130 160 156 Q134 166 110 156 Z" fill="#6CC04A"/>
 <circle cx="110" cy="50" r="28" fill="#FF8FB1"/><circle cx="148" cy="78" r="28" fill="#FF8FB1"/>
 <circle cx="134" cy="118" r="28" fill="#FF8FB1"/><circle cx="86" cy="118" r="28" fill="#FF8FB1"/>
 <circle cx="72" cy="78" r="28" fill="#FF8FB1"/><circle cx="110" cy="88" r="24" fill="#FFD84D"/>
</g>` },
abelha: { nome: 'colmeia', svg: `<g>
 <rect x="104" y="20" width="12" height="20" fill="#8C5634"/>
 <rect x="20" y="16" width="180" height="10" rx="5" fill="#8C5634"/>
 <ellipse cx="110" cy="60" rx="40" ry="22" fill="#F5B83D"/>
 <ellipse cx="110" cy="96" rx="60" ry="24" fill="#F7C24D"/>
 <ellipse cx="110" cy="134" rx="72" ry="26" fill="#F5B83D"/>
 <ellipse cx="110" cy="172" rx="66" ry="26" fill="#F7C24D"/>
 <ellipse cx="110" cy="176" rx="18" ry="14" fill="#6E3D24"/>
 <path class="balanca" d="M150 200 Q160 180 172 196" stroke="#F0A830" stroke-width="8" fill="none" stroke-linecap="round"/>
</g>` },
joaninha: { nome: 'folha', svg: `<g>
 <path d="M20 200 Q60 60 200 40 Q190 180 20 200 Z" fill="#7CCB4E"/>
 <path d="M20 200 Q100 130 196 44" stroke="#5DA83E" stroke-width="5" fill="none"/>
 <path d="M80 148 L70 110 M120 112 L116 80 M100 130 L140 140 M140 96 L176 104" stroke="#5DA83E" stroke-width="3"/>
 <circle class="balanca" cx="170" cy="70" r="6" fill="#BFE9FF"/>
</g>` },
caracol: { nome: 'pedra', svg: `<g>
 <ellipse cx="110" cy="205" rx="100" ry="10" fill="#8CCF5E"/>
 <path d="M24 205 Q20 120 90 100 Q170 84 196 150 Q204 190 196 205 Z" fill="#A9A9B8"/>
 <ellipse cx="80" cy="140" rx="20" ry="12" fill="#BEBECB"/>
 <ellipse cx="150" cy="170" rx="14" ry="8" fill="#8F8FA0"/>
 <path class="balanca" d="M40 205 Q30 160 50 150 M180 205 Q190 170 172 160" stroke="#5DA83E" stroke-width="6" fill="none" stroke-linecap="round"/>
</g>` },
formiga: { nome: 'formigueiro', svg: `<g>
 <ellipse cx="110" cy="205" rx="100" ry="10" fill="#8CCF5E"/>
 <path d="M20 205 Q60 60 110 50 Q160 60 200 205 Z" fill="#C98E55"/>
 <ellipse cx="110" cy="70" rx="14" ry="9" fill="#5A3220"/>
 <ellipse cx="90" cy="140" rx="14" ry="10" fill="#5A3220"/>
 <ellipse cx="138" cy="170" rx="14" ry="10" fill="#5A3220"/>
 <circle cx="60" cy="180" r="4" fill="#A86E3A"/><circle cx="150" cy="110" r="4" fill="#A86E3A"/><circle cx="120" cy="190" r="4" fill="#A86E3A"/>
 <path class="balanca" d="M110 52 Q106 36 114 28" stroke="#5DA83E" stroke-width="4" fill="none" stroke-linecap="round"/>
</g>` },
aranha: { nome: 'teia', svg: `<g fill="none" stroke="#9AA3BC" stroke-width="3" stroke-linecap="round">
 <path d="M110 20 V200 M20 110 H200 M46 46 L174 174 M174 46 L46 174"/>
 <circle cx="110" cy="110" r="22"/><circle cx="110" cy="110" r="46"/><circle cx="110" cy="110" r="70"/><circle cx="110" cy="110" r="90"/>
 <path class="balanca" d="M110 0 V20" stroke="#7F89A6"/>
</g>` },
lagarta: { nome: 'maçã', svg: `<g>
 <ellipse cx="110" cy="205" rx="80" ry="8" fill="#8CCF5E"/>
 <path d="M110 60 Q40 30 30 110 Q34 200 110 204 Q186 200 190 110 Q180 30 110 60 Z" fill="#E8453C"/>
 <path d="M190 110 Q160 100 162 130 Q164 160 186 150 Z" fill="#FFF3D6"/>
 <rect x="106" y="30" width="8" height="34" rx="4" fill="#6E3D24"/>
 <path class="balanca" d="M114 44 Q140 20 160 36 Q140 56 114 44 Z" fill="#6CC04A"/>
 <ellipse cx="70" cy="100" rx="12" ry="20" fill="#FF8A80"/>
</g>` },
minhoca: { nome: 'terra', svg: `<g>
 <rect x="10" y="80" width="200" height="125" rx="16" fill="#8C5634"/>
 <rect x="10" y="70" width="200" height="20" rx="10" fill="#7CCB4E"/>
 <ellipse cx="110" cy="150" rx="40" ry="26" fill="#4A2A18"/>
 <circle cx="40" cy="120" r="6" fill="#A86E3A"/><circle cx="180" cy="180" r="8" fill="#A86E3A"/><circle cx="170" cy="112" r="5" fill="#A86E3A"/><circle cx="50" cy="186" r="7" fill="#A86E3A"/>
 <path class="balanca" d="M60 70 Q56 50 64 40 M150 70 Q156 50 148 40" stroke="#5DA83E" stroke-width="5" fill="none" stroke-linecap="round"/>
</g>` },
gafanhoto: { nome: 'erva alta', svg: `<g fill="none" stroke-width="10" stroke-linecap="round">
 <ellipse cx="110" cy="205" rx="100" ry="8" fill="#6CC04A" stroke="none"/>
 <path d="M24 205 Q20 120 40 40" stroke="#5DA83E"/><path d="M50 205 Q60 110 50 30" stroke="#7CCB4E"/>
 <path d="M80 205 Q74 120 92 50" stroke="#5DA83E"/><path d="M140 205 Q150 120 130 40" stroke="#7CCB4E"/>
 <path d="M170 205 Q160 110 176 34" stroke="#5DA83E"/><path class="balanca" d="M196 205 Q200 130 186 60" stroke="#7CCB4E"/>
</g>` },
libelinha: { nome: 'lago', svg: `<g>
 <ellipse cx="110" cy="186" rx="100" ry="26" fill="#6CC7E8"/>
 <ellipse cx="90" cy="184" rx="50" ry="10" fill="#8ED8F0"/>
 <ellipse cx="150" cy="192" rx="22" ry="7" fill="#6CC04A"/>
 <path d="M40 186 Q36 100 46 30 M60 186 Q66 110 60 50" stroke="#5DA83E" stroke-width="6" fill="none" stroke-linecap="round"/>
 <rect x="40" y="44" width="12" height="34" rx="6" fill="#8C5634"/>
 <rect class="balanca" x="56" y="60" width="10" height="28" rx="5" fill="#8C5634"/>
 <path d="M180 186 Q186 120 176 70" stroke="#5DA83E" stroke-width="6" fill="none" stroke-linecap="round"/>
</g>` },
mosca: { nome: 'janela', svg: `<g>
 <rect x="20" y="20" width="180" height="170" rx="10" fill="#C98E55"/>
 <rect x="32" y="32" width="72" height="68" fill="#BDE7F7"/><rect x="116" y="32" width="72" height="68" fill="#BDE7F7"/>
 <rect x="32" y="110" width="72" height="68" fill="#BDE7F7"/><rect x="116" y="110" width="72" height="68" fill="#BDE7F7"/>
 <path d="M40 90 L60 40 M124 168 L144 118" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
 <rect x="10" y="190" width="200" height="14" rx="5" fill="#A86E3A"/>
 <path class="balanca" d="M28 20 Q20 100 30 190" stroke="#FF8FB1" stroke-width="10" fill="none"/>
</g>` },
pirilampo: { nome: 'noite', svg: `<g>
 <rect x="10" y="20" width="200" height="185" rx="20" fill="#2B2F5E"/>
 <circle cx="160" cy="60" r="22" fill="#FFF3B0"/><circle cx="170" cy="54" r="20" fill="#2B2F5E"/>
 <circle cx="50" cy="50" r="3" fill="#fff"/><circle cx="90" cy="80" r="2.5" fill="#fff"/><circle cx="120" cy="40" r="3" fill="#fff"/>
 <circle class="balanca" cx="60" cy="130" r="5" fill="#FFE433"/><circle cx="150" cy="120" r="4" fill="#FFE433"/>
 <path d="M10 205 L10 170 Q30 150 40 175 Q55 140 70 172 Q90 145 100 172 Q120 140 135 172 Q150 148 165 172 Q185 145 210 170 L210 205 Z" fill="#2E6B3A"/>
</g>` },
besouro: { nome: 'tronco', svg: `<g>
 <ellipse cx="110" cy="205" rx="100" ry="8" fill="#8CCF5E"/>
 <rect x="16" y="110" width="180" height="92" rx="46" fill="#9C6234"/>
 <ellipse cx="190" cy="156" rx="22" ry="46" fill="#E9B57A"/>
 <ellipse cx="190" cy="156" rx="12" ry="28" fill="none" stroke="#C98E55" stroke-width="4"/>
 <path d="M40 140 H120 M60 170 H160" stroke="#7E4A2C" stroke-width="5" stroke-linecap="round"/>
 <path class="balanca" d="M70 110 Q66 86 82 76 Q90 98 70 110 Z" fill="#6CC04A"/>
</g>` },
'louva-a-deus': { nome: 'ramo', svg: `<g>
 <path d="M10 160 Q110 110 210 140" stroke="#8C5634" stroke-width="12" fill="none" stroke-linecap="round"/>
 <path d="M60 140 Q50 100 80 84 Q90 120 60 140 Z" fill="#6CC04A"/>
 <path d="M120 128 Q140 90 170 96 Q156 130 120 128 Z" fill="#7CCB4E"/>
 <path d="M90 134 Q80 170 104 190 Q116 160 90 134 Z" fill="#6CC04A"/>
 <path class="balanca" d="M170 140 Q190 170 180 198 Q160 176 170 140 Z" fill="#7CCB4E"/>
 <path d="M40 150 Q20 120 40 100 Q54 126 40 150 Z" fill="#5DA83E"/>
</g>` },
grilo: { nome: 'relva ao luar', svg: `<g>
 <rect x="10" y="30" width="200" height="175" rx="20" fill="#2F3A6E"/>
 <circle cx="160" cy="66" r="24" fill="#FFF3B0"/>
 <circle cx="50" cy="56" r="3" fill="#fff"/><circle cx="96" cy="44" r="2.5" fill="#fff"/><circle cx="120" cy="80" r="2" fill="#fff"/>
 <path d="M10 205 L10 160 L22 186 L30 140 L42 184 L54 150 L66 186 L80 136 L92 184 L106 150 L118 186 L132 140 L144 184 L158 150 L170 186 L184 140 L196 184 L210 156 L210 205 Z" fill="#3E7F3A"/>
 <path class="balanca" d="M40 205 Q36 150 50 120" stroke="#5DA83E" stroke-width="5" fill="none" stroke-linecap="round"/>
</g>` },
vespa: { nome: 'vespeiro', svg: `<g>
 <rect x="20" y="20" width="180" height="16" rx="8" fill="#8C5634"/>
 <ellipse cx="110" cy="116" rx="70" ry="84" fill="#D9CBB0"/>
 <path d="M48 80 Q110 64 172 80 M42 112 Q110 96 178 112 M46 146 Q110 130 174 146 M60 176 Q110 162 160 176" stroke="#BFAE8C" stroke-width="5" fill="none"/>
 <ellipse cx="110" cy="190" rx="16" ry="10" fill="#5A4630"/>
 <rect x="104" y="30" width="12" height="20" fill="#8C5634"/>
 <ellipse cx="110" cy="205" rx="90" ry="5" fill="#8CCF5E"/>
 <path class="balanca" d="M160 28 Q180 10 196 26 Q178 40 160 28 Z" fill="#6CC04A"/>
</g>` },
mosquito: { nome: 'charco', svg: `<g>
 <ellipse cx="110" cy="180" rx="100" ry="26" fill="#6FB8D9"/>
 <ellipse cx="80" cy="176" rx="30" ry="6" fill="#9CD3EA"/>
 <ellipse cx="150" cy="186" rx="20" ry="4" fill="#9CD3EA"/>
 <path d="M30 170 Q26 110 36 80 M44 172 Q46 120 54 96" stroke="#5DA83E" stroke-width="6" fill="none" stroke-linecap="round"/>
 <ellipse cx="36" cy="80" rx="6" ry="16" fill="#8C5634"/><ellipse cx="54" cy="96" rx="6" ry="14" fill="#8C5634"/>
 <path class="balanca" d="M180 172 Q176 120 190 96" stroke="#5DA83E" stroke-width="6" fill="none" stroke-linecap="round"/>
 <ellipse cx="140" cy="168" rx="18" ry="6" fill="#6CC04A"/>
</g>` },
traca: { nome: 'armário', svg: `<g>
 <rect x="30" y="20" width="160" height="182" rx="10" fill="#B07A4A"/>
 <rect x="42" y="32" width="136" height="160" rx="6" fill="#F3E6CF"/>
 <rect x="42" y="60" width="136" height="6" fill="#8C5634"/>
 <path d="M70 66 v20 l-10 10 h20 Z M150 66 v20 l-10 10 h20 Z" stroke="#7A5A44" stroke-width="2" fill="#7A5A44"/>
 <rect x="56" y="96" width="32" height="70" rx="6" fill="#8FB3E0"/>
 <rect class="balanca" x="132" y="96" width="34" height="80" rx="6" fill="#E88FA8"/>
 <ellipse cx="110" cy="184" rx="22" ry="8" fill="#E86A5A"/><circle cx="110" cy="180" r="10" fill="#F08A7A"/>
</g>` },
'bicho-da-seda': { nome: 'amoreira', svg: `<g>
 <rect x="98" y="120" width="24" height="85" rx="8" fill="#8C5634"/>
 <circle cx="110" cy="80" r="66" fill="#5DA83E"/>
 <circle cx="60" cy="100" r="34" fill="#6CC04A"/><circle cx="160" cy="100" r="34" fill="#6CC04A"/>
 <circle cx="80" cy="60" r="6" fill="#5A2A5E"/><circle cx="140" cy="70" r="6" fill="#5A2A5E"/><circle cx="110" cy="110" r="6" fill="#5A2A5E"/><circle cx="60" cy="110" r="5" fill="#E04A6A"/>
 <path class="balanca" d="M170 60 Q190 40 204 56 Q186 70 170 60 Z" fill="#7CCB4E"/>
 <ellipse cx="110" cy="205" rx="90" ry="6" fill="#8CCF5E"/>
</g>` },
centopeia: { nome: 'casca de árvore', svg: `<g>
 <rect x="20" y="40" width="180" height="162" rx="14" fill="#8C5634"/>
 <path d="M40 50 Q50 120 38 196 M80 46 Q92 110 78 196 M124 46 Q134 120 122 196 M168 50 Q176 120 164 196" stroke="#6B4028" stroke-width="6" fill="none"/>
 <ellipse cx="100" cy="110" rx="14" ry="20" fill="#5A3420"/>
 <path class="balanca" d="M150 60 Q170 40 186 56 Q168 72 150 60 Z" fill="#8FB34A"/>
 <circle cx="60" cy="160" r="8" fill="#A9C46A"/><circle cx="68" cy="166" r="6" fill="#A9C46A"/>
</g>` },
escorpiao: { nome: 'deserto', svg: `<g>
 <path d="M10 205 Q60 160 110 180 Q160 150 210 175 L210 205 Z" fill="#F1CF8A"/>
 <path d="M120 180 Q140 100 180 110 Q200 140 196 182 Z" fill="#C99A5E"/>
 <rect x="40" y="90" width="18" height="96" rx="9" fill="#5DA83E"/>
 <path d="M40 140 h-14 v-24" stroke="#5DA83E" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <path class="balanca" d="M58 124 h12 v-20" stroke="#5DA83E" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <circle cx="170" cy="50" r="22" fill="#FFD84A"/>
</g>` },
lesma: { nome: 'alface', svg: `<g>
 <ellipse cx="110" cy="200" rx="96" ry="8" fill="#8B5A3C"/>
 <path d="M30 196 Q10 120 70 100 Q110 40 150 100 Q210 120 190 196 Z" fill="#8FD45A"/>
 <path d="M50 196 Q40 140 80 124 Q110 80 140 124 Q180 140 170 196 Z" fill="#B5E87E"/>
 <path d="M110 196 V100 M110 160 L80 130 M110 150 L140 120" stroke="#E3F7C9" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path class="balanca" d="M150 100 Q180 60 200 80 Q190 110 150 100 Z" fill="#7CCB4E"/>
</g>` },
cigarra: { nome: 'árvore ao sol', svg: `<g>
 <circle cx="180" cy="40" r="24" fill="#FFD84A"/>
 <path d="M180 6 v8 M146 40 h8 M206 40 h8 M156 16 l6 6" stroke="#FFD84A" stroke-width="4" stroke-linecap="round"/>
 <rect x="64" y="100" width="32" height="105" rx="10" fill="#9C6234"/>
 <circle cx="80" cy="74" r="56" fill="#4E9A3A"/><circle cx="40" cy="96" r="30" fill="#5DA83E"/><circle cx="120" cy="96" r="30" fill="#5DA83E"/>
 <path class="balanca" d="M120 60 Q140 40 156 56 Q138 72 120 60 Z" fill="#7CCB4E"/>
 <ellipse cx="110" cy="205" rx="96" ry="6" fill="#E9C46A"/>
</g>` },
zangao: { nome: 'campo de flores', svg: `<g>
 <path d="M10 205 Q110 150 210 205 Z" fill="#8CCF5E"/>
 <path d="M40 200 V130 M90 196 V110 M150 196 V120 M190 200 V140" stroke="#4FA33A" stroke-width="5"/>
 <circle cx="40" cy="126" r="16" fill="#FF8FB1"/><circle cx="40" cy="126" r="6" fill="#FFD84A"/>
 <circle cx="90" cy="104" r="18" fill="#B98AE8"/><circle cx="90" cy="104" r="7" fill="#FFD84A"/>
 <circle class="balanca" cx="150" cy="114" r="18" fill="#FF6B6B"/><circle cx="150" cy="114" r="7" fill="#FFD84A"/>
 <circle cx="190" cy="136" r="14" fill="#7FC8F8"/><circle cx="190" cy="136" r="5" fill="#FFD84A"/>
</g>` },
'bicho-de-conta': { nome: 'vaso de flores', svg: `<g>
 <ellipse cx="110" cy="205" rx="96" ry="6" fill="#8B5A3C"/>
 <path d="M50 110 H170 L154 204 H66 Z" fill="#D9774A"/>
 <rect x="42" y="100" width="136" height="22" rx="6" fill="#E88A5C"/>
 <path d="M110 100 V40 M110 70 Q80 60 76 40 M110 80 Q140 70 146 50" stroke="#4FA33A" stroke-width="5" fill="none"/>
 <circle cx="110" cy="34" r="16" fill="#FFD84A"/><circle cx="110" cy="34" r="6" fill="#E8693C"/>
 <path class="balanca" d="M76 40 Q60 30 70 18 Q84 28 76 40 Z" fill="#7CCB4E"/>
</g>` },
lagartixa: { nome: 'muro', svg: `<g>
 <rect x="16" y="30" width="188" height="175" rx="8" fill="#E2D6C0"/>
 <path d="M16 74 H204 M16 118 H204 M16 162 H204 M70 30 V74 M140 30 V74 M40 74 V118 M110 74 V118 M180 74 V118 M70 118 V162 M140 118 V162 M40 162 V205 M110 162 V205 M180 162 V205" stroke="#C4B496" stroke-width="4"/>
 <path class="balanca" d="M180 30 Q170 60 186 80 Q196 56 180 30 Z" fill="#6CC04A"/>
 <path d="M30 30 Q36 50 26 66" stroke="#5DA83E" stroke-width="4" fill="none"/>
</g>` },
'besouro-veado': { nome: 'carvalho', svg: `<g>
 <rect x="90" y="110" width="40" height="95" rx="10" fill="#7E4A2C"/>
 <path d="M100 130 v50 M118 140 v40" stroke="#5A3420" stroke-width="4"/>
 <circle cx="110" cy="70" r="58" fill="#3E7F3A"/><circle cx="56" cy="92" r="32" fill="#4E9A3A"/><circle cx="164" cy="92" r="32" fill="#4E9A3A"/>
 <ellipse cx="70" cy="74" rx="7" ry="9" fill="#B07A4A"/><path d="M63 70 h14" stroke="#7E4A2C" stroke-width="5" stroke-linecap="round"/>
 <ellipse class="balanca" cx="150" cy="110" rx="7" ry="9" fill="#B07A4A"/>
 <ellipse cx="110" cy="205" rx="96" ry="6" fill="#8CCF5E"/>
</g>` },
tesourinha: { nome: 'jardim de pedras', svg: `<g>
 <ellipse cx="110" cy="200" rx="100" ry="10" fill="#C9B98F"/>
 <ellipse cx="60" cy="176" rx="44" ry="28" fill="#A8A29A"/>
 <ellipse cx="150" cy="182" rx="40" ry="22" fill="#BDB7AE"/>
 <ellipse cx="110" cy="150" rx="30" ry="22" fill="#948E86"/>
 <path class="balanca" d="M190 190 Q186 150 200 130" stroke="#5DA83E" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path d="M24 196 Q20 166 30 150" stroke="#5DA83E" stroke-width="5" fill="none" stroke-linecap="round"/>
</g>` }
});
