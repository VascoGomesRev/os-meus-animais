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
</g>` }
});
