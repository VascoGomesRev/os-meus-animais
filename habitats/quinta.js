'use strict';
Object.assign(HABITATS, {
vaca: { nome: 'estábulo', svg: `<g>
 <rect x="30" y="196" width="160" height="10" rx="5" fill="#8BC34A"/>
 <rect x="44" y="96" width="132" height="104" rx="6" fill="#D2463C"/>
 <path d="M34 102 L110 40 L186 102 Z" fill="#A8322A"/>
 <path d="M50 98 L110 50 L170 98" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle cx="110" cy="76" r="12" fill="#FFF4D6"/>
 <rect x="80" y="130" width="60" height="70" rx="4" fill="#7A2620"/>
 <path d="M80 130 L140 200 M140 130 L80 200" stroke="#FFFFFF" stroke-width="5"/>
 <rect x="80" y="130" width="60" height="70" rx="4" fill="none" stroke="#FFFFFF" stroke-width="5"/>
 <path d="M150 196 Q156 176 166 196 Z" fill="#F2D06B"/>
 <path class="balanca" d="M110 40 L110 22 L126 28 L110 34" fill="#F2C14E" stroke="#6E4A2A" stroke-width="2"/>
</g>` },
porco: { nome: 'lama', svg: `<g>
 <ellipse cx="110" cy="190" rx="92" ry="22" fill="#8A5A34"/>
 <ellipse cx="110" cy="186" rx="76" ry="15" fill="#A8703F"/>
 <circle cx="70" cy="182" r="6" fill="#6E4426"/><circle cx="150" cy="186" r="5" fill="#6E4426"/><circle cx="118" cy="178" r="4" fill="#6E4426"/>
 <rect x="24" y="120" width="10" height="72" rx="3" fill="#B98A5A"/><rect x="186" y="120" width="10" height="72" rx="3" fill="#B98A5A"/>
 <rect x="20" y="132" width="180" height="9" rx="4" fill="#C99A68"/><rect x="20" y="154" width="180" height="9" rx="4" fill="#C99A68"/>
 <rect x="106" y="120" width="10" height="56" rx="3" fill="#B98A5A"/>
 <circle class="balanca" cx="40" cy="190" r="5" fill="none" stroke="#6E4426" stroke-width="2"/>
</g>` },
ovelha: { nome: 'curral', svg: `<g>
 <rect x="20" y="196" width="180" height="10" rx="5" fill="#8BC34A"/>
 <path d="M60 106 L110 64 L160 106 Z" fill="#6E8B3D"/>
 <rect x="68" y="104" width="84" height="56" rx="4" fill="#E8D3A8"/>
 <rect x="96" y="124" width="28" height="36" rx="3" fill="#8A6A44"/>
 <rect x="22" y="140" width="10" height="62" rx="3" fill="#B98A5A"/><rect x="72" y="140" width="10" height="62" rx="3" fill="#B98A5A"/><rect x="138" y="140" width="10" height="62" rx="3" fill="#B98A5A"/><rect x="188" y="140" width="10" height="62" rx="3" fill="#B98A5A"/>
 <rect x="18" y="156" width="184" height="9" rx="4" fill="#D6A872"/><rect x="18" y="178" width="184" height="9" rx="4" fill="#D6A872"/>
 <path class="balanca" d="M170 196 Q174 182 178 196 M178 196 Q184 180 188 196" stroke="#5E9E2E" stroke-width="3" fill="none"/>
</g>` },
cabra: { nome: 'rocha', svg: `<g>
 <rect x="20" y="198" width="180" height="8" rx="4" fill="#8BC34A"/>
 <path d="M24 202 L58 120 L92 140 L126 60 L158 110 L196 202 Z" fill="#9E9A94"/>
 <path d="M126 60 L104 202 L196 202 L158 110 Z" fill="#87837D"/>
 <path d="M126 60 L142 84 L132 80 L124 90 L114 80 Z" fill="#FFFFFF"/>
 <path d="M58 120 L72 130 L60 140 Z" fill="#BDB8B0"/>
 <ellipse cx="80" cy="176" rx="14" ry="8" fill="#BDB8B0"/><ellipse cx="150" cy="160" rx="10" ry="6" fill="#A6A29B"/>
 <path class="balanca" d="M40 198 Q44 182 48 198 Z" fill="#5E9E2E"/>
 <circle cx="44" cy="180" r="4" fill="#F7D046"/>
</g>` },
cavalo: { nome: 'cavalariça', svg: `<g>
 <rect x="24" y="196" width="172" height="10" rx="5" fill="#D9B45A"/>
 <path d="M28 96 L110 54 L192 96 Z" fill="#5A3A22"/>
 <rect x="38" y="94" width="144" height="106" rx="4" fill="#B5793F"/>
 <path d="M38 118 H182 M38 142 H182 M38 166 H182" stroke="#9A6432" stroke-width="3"/>
 <rect x="76" y="110" width="68" height="44" rx="4" fill="#3A2214"/>
 <rect x="76" y="154" width="68" height="46" rx="3" fill="#8A5A2E"/>
 <path d="M76 154 L144 200 M144 154 L76 200" stroke="#F2E2C2" stroke-width="4"/>
 <path d="M96 76 Q110 66 124 76 L120 84 Q110 78 100 84 Z" fill="#C9C9C9"/>
 <path d="M40 196 Q50 180 60 196 Z M160 196 Q170 182 180 196 Z" fill="#F2D06B"/>
 <path class="balanca" d="M110 54 L110 36 L124 42 L110 48" fill="#E8453C" stroke="#5A3A22" stroke-width="2"/>
</g>` },
burro: { nome: 'carroça', svg: `<g>
 <rect x="20" y="198" width="180" height="8" rx="4" fill="#8BC34A"/>
 <rect x="40" y="110" width="130" height="54" rx="6" fill="#C98A4A"/>
 <path d="M40 128 H170 M40 146 H170" stroke="#A86E36" stroke-width="3"/>
 <path d="M58 110 Q70 84 86 110 Z M90 110 Q104 80 120 110 Z M124 110 Q138 86 152 110 Z" fill="#F2D06B"/>
 <rect x="170" y="140" width="40" height="7" rx="3" fill="#8A5A2E"/>
 <circle cx="76" cy="174" r="28" fill="#6E4426"/><circle cx="76" cy="174" r="18" fill="#E8C29A"/><circle cx="76" cy="174" r="6" fill="#6E4426"/>
 <circle cx="144" cy="174" r="28" fill="#6E4426"/><circle cx="144" cy="174" r="18" fill="#E8C29A"/><circle cx="144" cy="174" r="6" fill="#6E4426"/>
 <path class="balanca" d="M100 84 Q104 74 110 84" stroke="#5E9E2E" stroke-width="3" fill="none"/>
</g>` },
galinha: { nome: 'galinheiro', svg: `<g>
 <rect x="24" y="196" width="172" height="10" rx="5" fill="#8BC34A"/>
 <path d="M40 104 L110 54 L180 104 Z" fill="#D2463C"/>
 <rect x="52" y="102" width="116" height="80" rx="6" fill="#F2D9A6"/>
 <path d="M52 124 H168 M52 146 H168" stroke="#DCC08A" stroke-width="3"/>
 <path d="M92 182 V148 Q110 126 128 148 V182 Z" fill="#6E4426"/>
 <rect x="60" y="182" width="8" height="18" rx="3" fill="#8A5A2E"/><rect x="152" y="182" width="8" height="18" rx="3" fill="#8A5A2E"/>
 <path d="M128 200 L150 176 L170 200" stroke="#8A5A2E" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="74" cy="194" rx="6" ry="8" fill="#FFF8E8"/><ellipse cx="88" cy="196" rx="6" ry="7" fill="#FFF8E8"/>
 <path class="balanca" d="M110 54 L110 38 L124 44 L110 50" fill="#F2C14E" stroke="#6E4A2A" stroke-width="2"/>
</g>` },
galo: { nome: 'poleiro', svg: `<g>
 <rect x="30" y="198" width="160" height="8" rx="4" fill="#8BC34A"/>
 <rect x="54" y="80" width="12" height="122" rx="4" fill="#8A5A2E"/><rect x="154" y="80" width="12" height="122" rx="4" fill="#8A5A2E"/>
 <rect x="40" y="76" width="140" height="12" rx="6" fill="#A86E36"/>
 <rect x="48" y="126" width="124" height="10" rx="5" fill="#A86E36"/>
 <rect x="54" y="166" width="112" height="9" rx="4" fill="#A86E36"/>
 <circle cx="166" cy="46" r="18" fill="#FFC93C"/>
 <path class="balanca" d="M166 20 V14 M192 46 H198 M184 28 L189 23 M140 46 H134" stroke="#FFC93C" stroke-width="4" stroke-linecap="round"/>
 <path d="M80 198 Q86 186 92 198 Z" fill="#5E9E2E"/>
</g>` },
pinto: { nome: 'ninho', svg: `<g>
 <ellipse cx="110" cy="196" rx="90" ry="12" fill="#8BC34A"/>
 <ellipse cx="110" cy="160" rx="80" ry="40" fill="#C99A5A"/>
 <ellipse cx="110" cy="150" rx="64" ry="22" fill="#7A5230"/>
 <ellipse cx="90" cy="146" rx="14" ry="18" fill="#FFF8E8"/><ellipse cx="124" cy="144" rx="14" ry="18" fill="#FFF0D0"/>
 <path d="M34 160 Q70 150 110 166 Q150 150 186 160" stroke="#A8783F" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path d="M38 178 Q74 168 110 184 Q146 168 182 178" stroke="#A8783F" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path class="balanca" d="M180 140 Q200 126 196 110" stroke="#E0B060" stroke-width="4" fill="none" stroke-linecap="round"/>
</g>` },
pato: { nome: 'lago', svg: `<g>
 <ellipse cx="110" cy="190" rx="96" ry="18" fill="#8BC34A"/>
 <ellipse cx="110" cy="176" rx="86" ry="26" fill="#4FB3E8"/>
 <path d="M60 172 Q70 166 80 172 M120 182 Q130 176 140 182 M150 166 Q158 160 166 166" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
 <ellipse cx="54" cy="184" rx="18" ry="6" fill="#4CAF50"/><path d="M50 184 L54 176 L58 184 Z" fill="#2E7D32"/>
 <rect x="168" y="110" width="5" height="62" rx="2" fill="#5E9E2E"/><rect x="180" y="120" width="5" height="52" rx="2" fill="#5E9E2E"/>
 <ellipse class="balanca" cx="170" cy="110" rx="5" ry="14" fill="#8A5A2E"/><ellipse cx="182" cy="120" rx="5" ry="12" fill="#8A5A2E"/>
</g>` },
peru: { nome: 'cerca', svg: `<g>
 <rect x="16" y="196" width="188" height="10" rx="5" fill="#8BC34A"/>
 <path d="M24 200 V112 L32 102 L40 112 V200 Z M66 200 V112 L74 102 L82 112 V200 Z M108 200 V112 L116 102 L124 112 V200 Z M150 200 V112 L158 102 L166 112 V200 Z" fill="#F2E2C2"/>
 <path d="M180 200 V112 L188 102 L196 112 V200 Z" fill="#F2E2C2"/>
 <rect x="18" y="128" width="184" height="10" rx="4" fill="#E2CDA2"/><rect x="18" y="168" width="184" height="10" rx="4" fill="#E2CDA2"/>
 <circle cx="56" cy="190" r="8" fill="#F7D046"/><circle cx="140" cy="192" r="7" fill="#F28C28"/>
 <path class="balanca" d="M96 196 Q100 182 104 196 Z" fill="#5E9E2E"/>
</g>` },
ganso: { nome: 'charco', svg: `<g>
 <ellipse cx="110" cy="192" rx="94" ry="16" fill="#7DB84A"/>
 <path d="M30 184 Q40 150 90 156 Q120 140 170 156 Q200 168 188 186 Q110 204 30 184 Z" fill="#6FA9C9"/>
 <path d="M70 172 Q80 166 90 172 M120 168 Q130 162 140 168" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
 <ellipse cx="40" cy="166" rx="16" ry="10" fill="#9E9A94"/><ellipse cx="182" cy="170" rx="14" ry="9" fill="#9E9A94"/>
 <rect x="32" y="110" width="5" height="50" rx="2" fill="#5E9E2E"/><rect x="44" y="120" width="5" height="40" rx="2" fill="#5E9E2E"/>
 <path class="balanca" d="M34 110 Q26 96 30 84" stroke="#5E9E2E" stroke-width="4" fill="none" stroke-linecap="round"/>
 <ellipse cx="150" cy="176" rx="12" ry="4" fill="#4CAF50"/>
</g>` }
});
