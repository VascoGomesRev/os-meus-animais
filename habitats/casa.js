'use strict';
Object.assign(HABITATS, {
cao: { nome: 'casota', svg: `<g>
 <ellipse cx="110" cy="205" rx="90" ry="10" fill="#8BCF6A"/>
 <rect x="44" y="96" width="132" height="108" rx="6" fill="#E57A4E"/>
 <path d="M30 104 L110 36 L190 104 Z" fill="#B6463A"/>
 <path d="M110 36 L190 104 L176 112 L110 54 L44 112 L30 104 Z" fill="#8F2F28"/>
 <path d="M80 204 L80 150 Q110 112 140 150 L140 204 Z" fill="#5A3020"/>
 <rect x="88" y="104" width="44" height="14" rx="4" fill="#FFE9B0"/>
 <circle cx="98" cy="111" r="3" fill="#B6463A"/><circle cx="122" cy="111" r="3" fill="#B6463A"/>
 <ellipse cx="164" cy="198" rx="16" ry="7" fill="#4A90D9"/>
 <path class="balanca" d="M60 196 l6 -12 l6 12" stroke="#5DAA45" stroke-width="3" fill="none"/>
</g>` },
gato: { nome: 'cesto', svg: `<g>
 <ellipse cx="110" cy="205" rx="90" ry="9" fill="#E6D3C0"/>
 <path d="M28 130 Q30 204 110 204 Q190 204 192 130 Z" fill="#C98B4E"/>
 <path d="M34 150 L186 150 M38 170 L182 170 M50 188 L170 188" stroke="#A86B34" stroke-width="4"/>
 <ellipse cx="110" cy="130" rx="82" ry="22" fill="#B87A3E"/>
 <ellipse cx="110" cy="130" rx="70" ry="16" fill="#F7A6B8"/>
 <ellipse cx="96" cy="126" rx="26" ry="8" fill="#FBC7D3"/>
 <circle class="balanca" cx="172" cy="104" r="12" fill="#E0565B"/>
 <path d="M164 100 Q172 108 180 100 M166 110 Q172 102 178 110" stroke="#FFFFFF" stroke-width="2" fill="none"/>
</g>` },
hamster: { nome: 'roda', svg: `<g>
 <ellipse cx="110" cy="205" rx="90" ry="9" fill="#F3D9A0"/>
 <path d="M110 110 L70 204 M110 110 L150 204" stroke="#8A8A9A" stroke-width="8" stroke-linecap="round"/>
 <circle cx="110" cy="110" r="76" fill="none" stroke="#4FB3E8" stroke-width="12"/>
 <circle cx="110" cy="110" r="62" fill="none" stroke="#9FD8F5" stroke-width="4" stroke-dasharray="6 8"/>
 <path d="M110 34 L110 186 M34 110 L186 110 M56 56 L164 164 M164 56 L56 164" stroke="#9FD8F5" stroke-width="3"/>
 <circle cx="110" cy="110" r="12" fill="#2F7FD8"/>
 <ellipse cx="40" cy="198" rx="12" ry="6" fill="#E8A75E"/><ellipse class="balanca" cx="180" cy="198" rx="10" ry="6" fill="#F2C200"/>
</g>` },
coelho: { nome: 'toca', svg: `<g>
 <path d="M14 205 Q20 70 110 60 Q200 70 206 205 Z" fill="#7CC35A"/>
 <path d="M60 205 Q60 120 110 116 Q160 120 160 205 Z" fill="#5A3A22"/>
 <path d="M76 205 Q78 140 110 136 Q142 140 144 205 Z" fill="#3A2416"/>
 <ellipse cx="110" cy="206" rx="98" ry="8" fill="#6AA84A"/>
 <path class="balanca" d="M170 100 Q176 80 168 66" stroke="#4E9A36" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path d="M168 180 L176 154 L184 180 Z" fill="#F28C28"/>
 <path d="M176 154 L170 142 M176 154 L182 142" stroke="#4E9A36" stroke-width="4" stroke-linecap="round"/>
 <circle cx="44" cy="150" r="6" fill="#FFFFFF"/><circle cx="44" cy="150" r="2.5" fill="#FFD600"/>
</g>` },
rato: { nome: 'buraco', svg: `<g>
 <rect x="20" y="30" width="180" height="176" rx="8" fill="#F2E3C6"/>
 <rect x="20" y="180" width="180" height="26" fill="#B98552"/>
 <path d="M60 182 L60 130 Q90 92 120 130 L120 182 Z" fill="#3A2416"/>
 <path d="M130 186 L196 186 L196 150 Z" fill="#FFD23F"/>
 <path d="M130 186 L196 150 L196 186" fill="none" stroke="#E8B020" stroke-width="2"/>
 <circle cx="160" cy="176" r="5" fill="#E8B020"/><circle cx="182" cy="168" r="4" fill="#E8B020"/><circle cx="178" cy="180" r="3" fill="#E8B020"/>
 <circle class="balanca" cx="150" cy="60" r="6" fill="#D9C39A"/>
</g>` },
'porquinho-da-india': { nome: 'casinha', svg: `<g>
 <ellipse cx="110" cy="205" rx="92" ry="9" fill="#F3D9A0"/>
 <rect x="46" y="110" width="128" height="94" rx="10" fill="#E8C089"/>
 <path d="M34 118 L110 58 L186 118 Z" fill="#C98B4E"/>
 <path d="M84 204 L84 168 Q110 136 136 168 L136 204 Z" fill="#6A4126"/>
 <circle cx="70" cy="142" r="10" fill="#6A4126"/>
 <path d="M40 204 Q46 180 56 204 M164 204 Q172 176 182 204" stroke="#A6C94A" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path class="balanca" d="M150 150 L174 150 L162 186 Z" fill="#F28C28"/>
 <path d="M162 150 L156 136 M162 150 L168 136" stroke="#4E9A36" stroke-width="4" stroke-linecap="round"/>
</g>` },
periquito: { nome: 'gaiola', svg: `<g>
 <ellipse cx="110" cy="205" rx="80" ry="8" fill="#D9D9E3"/>
 <path d="M40 196 L40 90 Q40 30 110 30 Q180 30 180 90 L180 196" fill="#FFF7E0"/>
 <path d="M40 196 L40 90 Q40 30 110 30 Q180 30 180 90 L180 196 M66 196 L66 50 M92 196 L92 34 M128 196 L128 34 M154 196 L154 50" stroke="#D4A017" stroke-width="5" fill="none"/>
 <rect x="32" y="186" width="156" height="16" rx="5" fill="#D4A017"/>
 <circle cx="110" cy="22" r="10" fill="none" stroke="#D4A017" stroke-width="5"/>
 <rect x="56" y="126" width="108" height="8" rx="4" fill="#9C6234"/>
 <path class="balanca" d="M84 70 Q110 96 136 70" stroke="#E0565B" stroke-width="5" fill="none" stroke-linecap="round"/>
 <rect x="140" y="168" width="20" height="14" rx="3" fill="#4A90D9"/>
</g>` },
canario: { nome: 'poleiro', svg: `<g>
 <ellipse cx="110" cy="205" rx="80" ry="8" fill="#B8E0F5"/>
 <rect x="104" y="80" width="12" height="122" rx="4" fill="#9C6234"/>
 <rect x="36" y="94" width="148" height="12" rx="6" fill="#B87A3E"/>
 <rect x="70" y="190" width="80" height="14" rx="6" fill="#7A4A26"/>
 <circle cx="110" cy="64" r="22" fill="#7CC35A"/>
 <path class="balanca" d="M46 106 L46 140 M174 106 L174 140" stroke="#D4A017" stroke-width="3"/>
 <path d="M34 140 L58 140 L54 154 L38 154 Z M162 140 L186 140 L182 154 L166 154 Z" fill="#4A90D9"/>
 <circle cx="96" cy="58" r="5" fill="#F7849E"/><circle cx="122" cy="66" r="5" fill="#FFD600"/><circle cx="112" cy="50" r="4" fill="#FFFFFF"/>
</g>` },
ponei: { nome: 'padoque', svg: `<g>
 <ellipse cx="110" cy="200" rx="100" ry="14" fill="#9ED36A"/>
 <rect x="22" y="110" width="12" height="92" rx="4" fill="#B87A3E"/><rect x="104" y="110" width="12" height="92" rx="4" fill="#B87A3E"/><rect x="186" y="110" width="12" height="92" rx="4" fill="#B87A3E"/>
 <rect x="16" y="126" width="188" height="12" rx="5" fill="#D9A066"/><rect x="16" y="160" width="188" height="12" rx="5" fill="#D9A066"/>
 <ellipse cx="150" cy="196" rx="26" ry="10" fill="#F2D06B"/><ellipse cx="150" cy="188" rx="20" ry="9" fill="#F7DC85"/>
 <circle cx="60" cy="194" r="5" fill="#F7849E"/><circle cx="78" cy="198" r="4" fill="#FFFFFF"/>
 <path class="balanca" d="M110 110 L110 84 L132 92 L110 100" fill="#F7A8C8" stroke="#B87A3E" stroke-width="3"/>
</g>` },
furao: { nome: 'túnel', svg: `<g>
 <ellipse cx="110" cy="204" rx="96" ry="10" fill="#CFE8B0"/>
 <path d="M20 200 L20 130 Q20 90 60 90 L160 90 Q200 90 200 130 L200 200 Z" fill="#4A90D9"/>
 <path d="M60 90 L60 200 M100 90 L100 200 M140 90 L140 200" stroke="#3672B5" stroke-width="5"/>
 <ellipse cx="170" cy="164" rx="28" ry="36" fill="#2A4F7A"/>
 <ellipse cx="50" cy="164" rx="22" ry="30" fill="#2A4F7A"/>
 <path class="balanca" d="M110 90 Q120 70 136 76" stroke="#F7849E" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle cx="138" cy="76" r="8" fill="#FFD600"/>
</g>` },
chinchila: { nome: 'caixa de areia', svg: `<g>
 <ellipse cx="110" cy="205" rx="92" ry="9" fill="#E6E9EE"/>
 <rect x="24" y="130" width="172" height="72" rx="12" fill="#8E6BBF"/>
 <rect x="34" y="120" width="152" height="24" rx="10" fill="#F2D9A0"/>
 <circle cx="70" cy="126" r="10" fill="#F7E3B5"/><circle cx="140" cy="124" r="12" fill="#F7E3B5"/>
 <rect x="24" y="168" width="172" height="8" fill="#A585D1"/>
 <path class="balanca" d="M172 120 L180 80 L196 92" stroke="#B87A3E" stroke-width="5" fill="none" stroke-linecap="round"/>
 <circle cx="58" cy="190" r="5" fill="#FFD600"/><circle cx="162" cy="190" r="5" fill="#F7849E"/>
</g>` },
cagado: { nome: 'tanque', svg: `<g>
 <ellipse cx="110" cy="200" rx="100" ry="14" fill="#9C8A78"/>
 <ellipse cx="110" cy="182" rx="94" ry="26" fill="#7FC8E8"/>
 <ellipse cx="110" cy="176" rx="80" ry="18" fill="#A6DCF2"/>
 <ellipse cx="130" cy="170" rx="34" ry="18" fill="#9AA3AE"/><ellipse cx="124" cy="164" rx="20" ry="8" fill="#B8C0CA"/>
 <ellipse cx="60" cy="182" rx="18" ry="6" fill="#5CB85C"/>
 <path d="M30 170 L26 110 M40 172 L46 120 M184 170 L190 116" stroke="#3E9E32" stroke-width="5" stroke-linecap="round"/>
 <ellipse class="balanca" cx="26" cy="108" rx="5" ry="14" fill="#8A5A33"/><ellipse cx="190" cy="114" rx="5" ry="14" fill="#8A5A33"/>
</g>` }
});
