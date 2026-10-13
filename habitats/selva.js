'use strict';
Object.assign(HABITATS, {
leao: { nome: 'savana', svg: `<g>
 <ellipse cx="110" cy="200" rx="104" ry="16" fill="#E8C66A"/>
 <circle cx="170" cy="52" r="20" fill="#FFD84D"/>
 <path d="M104 200 L108 120 L116 120 L120 200 Z" fill="#8A5A33"/>
 <path d="M112 128 L84 104 M112 128 L144 102" stroke="#8A5A33" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="112" cy="96" rx="70" ry="18" fill="#7BAE3E"/><ellipse cx="112" cy="86" rx="50" ry="14" fill="#8CC24A"/>
 <path class="balanca" d="M30 200 L34 176 L38 200 M44 200 L48 180 L52 200 M170 200 L174 178 L178 200 M184 200 L188 182 L192 200" fill="#C9A23E"/>
</g>` },
tigre: { nome: 'selva', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="14" fill="#4F8F3A"/>
 <rect x="30" y="60" width="16" height="142" rx="6" fill="#7A5230"/><rect x="170" y="60" width="16" height="142" rx="6" fill="#7A5230"/>
 <circle cx="38" cy="60" r="34" fill="#3E8E3E"/><circle cx="178" cy="60" r="34" fill="#3E8E3E"/><circle cx="110" cy="48" r="40" fill="#4CA64C"/>
 <path d="M70 202 Q60 150 90 140 Q90 170 84 202 Z" fill="#5CBF5C"/><path d="M150 202 Q160 150 130 140 Q130 170 136 202 Z" fill="#5CBF5C"/>
 <path class="balanca" d="M110 202 Q100 160 116 130 Q124 170 118 202 Z" fill="#6ED36E"/>
 <circle cx="70" cy="100" r="7" fill="#F26B8A"/><circle cx="150" cy="96" r="7" fill="#F2C744"/>
</g>` },
elefante: { nome: 'charco', svg: `<g>
 <ellipse cx="110" cy="198" rx="104" ry="18" fill="#E2C27A"/>
 <ellipse cx="110" cy="190" rx="80" ry="16" fill="#6EC1E8"/><ellipse cx="96" cy="186" rx="34" ry="5" fill="#A8DDF5"/>
 <path d="M24 192 L28 160 L34 192 M190 192 L194 158 L200 192" fill="#7BAE3E"/>
 <circle cx="44" cy="186" r="10" fill="#A89A8A"/><circle cx="180" cy="188" r="8" fill="#A89A8A"/>
 <circle class="balanca" cx="170" cy="60" r="18" fill="#FFD84D"/>
</g>` },
girafa: { nome: 'acácia alta', svg: `<g>
 <ellipse cx="110" cy="202" rx="100" ry="14" fill="#E8C66A"/>
 <rect x="102" y="70" width="16" height="132" rx="6" fill="#8A5A33"/>
 <path d="M110 90 L70 60 M110 90 L152 58" stroke="#8A5A33" stroke-width="8" stroke-linecap="round"/>
 <ellipse cx="110" cy="54" rx="90" ry="20" fill="#7BAE3E"/><ellipse cx="110" cy="40" rx="60" ry="16" fill="#8CC24A"/>
 <ellipse class="balanca" cx="160" cy="46" rx="10" ry="6" fill="#A6D65C"/>
</g>` },
zebra: { nome: 'pradaria', svg: `<g>
 <ellipse cx="110" cy="200" rx="104" ry="18" fill="#B8D65A"/>
 <path d="M20 200 Q60 150 110 160 Q160 150 200 200 Z" fill="#A3C84A"/>
 <path class="balanca" d="M40 196 L44 170 L48 196 M60 196 L64 174 L68 196 M150 196 L154 172 L158 196 M172 196 L176 168 L180 196 M106 190 L110 166 L114 190" fill="#7FA83A"/>
 <circle cx="80" cy="182" r="5" fill="#F2C744"/><circle cx="140" cy="184" r="5" fill="#F7F7F7"/>
 <circle cx="170" cy="60" r="18" fill="#FFD84D"/>
</g>` },
macaco: { nome: 'lianas', svg: `<g>
 <ellipse cx="110" cy="204" rx="90" ry="10" fill="#4F8F3A"/>
 <rect x="36" y="40" width="24" height="164" rx="8" fill="#7A5230"/>
 <ellipse cx="80" cy="40" rx="76" ry="28" fill="#3E8E3E"/><ellipse cx="140" cy="30" rx="64" ry="22" fill="#4CA64C"/>
 <path class="balanca" d="M110 50 Q120 110 104 170" stroke="#5CA03A" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path d="M160 46 Q170 90 158 130" stroke="#5CA03A" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="108" cy="110" rx="8" ry="4" fill="#6ED36E"/><ellipse cx="166" cy="90" rx="8" ry="4" fill="#6ED36E"/>
 <path d="M150 170 Q170 150 186 162 Q180 186 158 182 Z" fill="#F2D23C"/>
</g>` },
gorila: { nome: 'floresta', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="14" fill="#3E7A30"/>
 <rect x="40" y="80" width="14" height="122" rx="5" fill="#6B4528"/><rect x="104" y="60" width="14" height="142" rx="5" fill="#6B4528"/><rect x="166" y="84" width="14" height="118" rx="5" fill="#6B4528"/>
 <circle cx="47" cy="78" r="32" fill="#2F7A3A"/><circle cx="111" cy="56" r="40" fill="#3E8E3E"/><circle cx="173" cy="80" r="30" fill="#2F7A3A"/>
 <ellipse class="balanca" cx="80" cy="190" rx="22" ry="12" fill="#4CA64C"/><ellipse cx="146" cy="192" rx="20" ry="10" fill="#4CA64C"/>
</g>` },
hipopotamo: { nome: 'rio', svg: `<g>
 <ellipse cx="110" cy="198" rx="104" ry="18" fill="#7BAE3E"/>
 <ellipse cx="110" cy="188" rx="92" ry="22" fill="#4FA8DE"/>
 <path d="M50 184 Q60 178 70 184 M120 194 Q130 188 140 194 M150 178 Q160 172 170 178" stroke="#A8DDF5" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M16 190 L20 150 L26 190 M196 190 L200 154 L206 190" fill="#5C9A30"/>
 <ellipse class="balanca" cx="90" cy="176" rx="12" ry="5" fill="#6ED36E"/><circle cx="90" cy="172" r="4" fill="#F7B7C4"/>
</g>` },
rinoceronte: { nome: 'lama', svg: `<g>
 <ellipse cx="110" cy="200" rx="104" ry="16" fill="#C9A86A"/>
 <ellipse cx="110" cy="192" rx="84" ry="18" fill="#8A6038"/>
 <circle cx="70" cy="186" r="6" fill="#A27448"/><circle cx="140" cy="190" r="8" fill="#A27448"/><circle cx="110" cy="196" r="4" fill="#A27448"/>
 <path d="M20 196 L24 168 L30 196 M190 196 L194 166 L200 196" fill="#7BAE3E"/>
 <circle class="balanca" cx="160" cy="56" r="18" fill="#FFD84D"/>
</g>` },
crocodilo: { nome: 'pântano', svg: `<g>
 <ellipse cx="110" cy="198" rx="104" ry="18" fill="#5C7A3A"/>
 <ellipse cx="110" cy="190" rx="86" ry="18" fill="#6F9A6A"/>
 <path d="M24 192 L28 130 L32 192 M40 192 L44 140 L48 192 M178 192 L182 128 L186 192" fill="#6B8A2E"/>
 <ellipse cx="28" cy="128" rx="4" ry="12" fill="#8A5A33"/><ellipse cx="182" cy="126" rx="4" ry="12" fill="#8A5A33"/>
 <ellipse class="balanca" cx="100" cy="186" rx="14" ry="5" fill="#8CC24A"/><ellipse cx="140" cy="192" rx="10" ry="4" fill="#8CC24A"/>
</g>` },
cobra: { nome: 'rocha', svg: `<g>
 <ellipse cx="110" cy="202" rx="100" ry="14" fill="#D8B878"/>
 <path d="M30 202 Q30 120 100 110 Q180 110 190 202 Z" fill="#A89A8A"/>
 <path d="M60 150 Q90 130 120 140" stroke="#8C7E70" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="80" cy="190" rx="20" ry="10" fill="#8C7E70"/>
 <path class="balanca" d="M170 202 L176 176 L182 202" fill="#7BAE3E"/>
</g>` },
leopardo: { nome: 'árvore', svg: `<g>
 <ellipse cx="110" cy="202" rx="100" ry="14" fill="#E8C66A"/>
 <path d="M96 202 L102 90 L118 90 L124 202 Z" fill="#8A5A33"/>
 <path d="M110 120 Q150 110 196 116" stroke="#8A5A33" stroke-width="12" fill="none" stroke-linecap="round"/>
 <path d="M110 100 L60 80" stroke="#8A5A33" stroke-width="8" stroke-linecap="round"/>
 <ellipse cx="110" cy="70" rx="84" ry="30" fill="#7BAE3E"/><ellipse cx="96" cy="52" rx="54" ry="20" fill="#8CC24A"/>
 <ellipse class="balanca" cx="180" cy="106" rx="12" ry="6" fill="#8CC24A"/>
</g>` },
camelo: { nome: 'duna', svg: `<g>
 <path d="M6 206 Q60 120 120 160 Q170 110 214 206 Z" fill="#F2CC7A"/>
 <path d="M6 206 Q90 160 214 206 Z" fill="#E8B85E"/>
 <circle cx="166" cy="50" r="22" fill="#FFB84D"/>
 <path d="M40 200 L40 176 M40 186 L32 180 M40 182 L48 176" stroke="#5CA03A" stroke-width="7" stroke-linecap="round"/>
 <path class="balanca" d="M150 200 L150 172 M150 184 L142 178 M150 180 L158 174" stroke="#5CA03A" stroke-width="6" stroke-linecap="round"/>
</g>` },
lama: { nome: 'montanha', svg: `<g>
 <path d="M4 206 L80 60 L156 206 Z" fill="#9AA6B8"/><path d="M80 60 L62 96 L80 90 L98 96 Z" fill="#FFFFFF"/>
 <path d="M80 206 L150 90 L216 206 Z" fill="#7F8CA0"/><path d="M150 90 L134 116 L150 110 L166 116 Z" fill="#FFFFFF"/>
 <ellipse cx="110" cy="204" rx="106" ry="10" fill="#8CC24A"/>
 <g class="balanca"><circle cx="170" cy="40" r="10" fill="#FFFFFF"/><circle cx="184" cy="36" r="13" fill="#FFFFFF"/><circle cx="198" cy="42" r="9" fill="#FFFFFF"/></g>
</g>` },
canguru: { nome: 'planície', svg: `<g>
 <ellipse cx="110" cy="202" rx="106" ry="16" fill="#D9824A"/>
 <path d="M10 196 Q110 170 210 196 Z" fill="#E89A5E"/>
 <path d="M150 196 Q150 160 166 150 Q182 160 182 196 Z" fill="#B8603A"/>
 <circle cx="160" cy="54" r="22" fill="#FFD84D"/>
 <path class="balanca" d="M40 196 L46 176 L52 196 M70 196 L74 180 L78 196" fill="#C9A23E"/>
</g>` },
preguica: { nome: 'ramo', svg: `<g>
 <rect x="10" y="40" width="200" height="16" rx="8" fill="#7A5230"/>
 <ellipse cx="30" cy="40" rx="24" ry="12" fill="#3E8E3E"/><ellipse cx="190" cy="40" rx="24" ry="12" fill="#3E8E3E"/>
 <rect x="170" y="56" width="14" height="150" rx="6" fill="#7A5230"/>
 <ellipse class="balanca" cx="70" cy="64" rx="10" ry="5" fill="#5CBF5C"/><ellipse cx="140" cy="64" rx="10" ry="5" fill="#5CBF5C"/>
 <ellipse cx="110" cy="204" rx="100" ry="10" fill="#4F8F3A"/>
</g>` },
suricata: { nome: 'toca', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="12" fill="#E8C66A"/>
 <path d="M30 204 Q110 90 190 204 Z" fill="#D9A866"/>
 <ellipse cx="110" cy="190" rx="34" ry="18" fill="#5A3A1E"/>
 <circle cx="60" cy="190" r="6" fill="#C99A5B"/><circle cx="160" cy="186" r="5" fill="#C99A5B"/>
 <path class="balanca" d="M180 204 L184 182 L188 204" fill="#9AB83A"/>
</g>` },
camaleao: { nome: 'ramo com folhas', svg: `<g>
 <path d="M10 140 Q110 120 210 150" stroke="#7A5230" stroke-width="14" fill="none" stroke-linecap="round"/>
 <path d="M150 140 Q170 110 200 100" stroke="#7A5230" stroke-width="7" fill="none" stroke-linecap="round"/>
 <ellipse cx="200" cy="96" rx="16" ry="8" transform="rotate(-30 200 96)" fill="#4CA64C"/>
 <ellipse cx="40" cy="120" rx="18" ry="9" transform="rotate(-20 40 120)" fill="#4CA64C"/><ellipse cx="70" cy="154" rx="18" ry="9" transform="rotate(20 70 154)" fill="#5CBF5C"/>
 <ellipse class="balanca" cx="180" cy="164" rx="18" ry="9" transform="rotate(25 180 164)" fill="#5CBF5C"/>
 <circle cx="120" cy="160" r="8" fill="#F26B8A"/>
 <ellipse cx="110" cy="204" rx="100" ry="10" fill="#4F8F3A"/>
</g>` },
lagarto: { nome: 'pedra ao sol', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="12" fill="#E8C66A"/>
 <ellipse cx="110" cy="186" rx="70" ry="28" fill="#B0A090"/><ellipse cx="96" cy="176" rx="34" ry="10" fill="#C8BAA8"/>
 <circle cx="166" cy="56" r="26" fill="#FFD84D"/>
 <path class="balanca" d="M166 18 L166 8 M196 56 L206 56 M188 34 L196 26 M136 34 L128 26" stroke="#FFD84D" stroke-width="5" stroke-linecap="round"/>
</g>` },
dinossauro: { nome: 'vulcão', svg: `<g>
 <ellipse cx="110" cy="204" rx="106" ry="12" fill="#6B8A3A"/>
 <path d="M30 204 L90 70 L130 70 L190 204 Z" fill="#8A6A5A"/>
 <path d="M90 70 L130 70 L122 90 L112 82 L104 94 L96 84 Z" fill="#F26B2E"/>
 <ellipse class="balanca" cx="110" cy="40" rx="24" ry="14" fill="#B8B8B8"/><ellipse cx="128" cy="22" rx="16" ry="10" fill="#CCCCCC"/>
 <path d="M24 204 Q30 170 50 160 Q44 190 44 204 Z" fill="#4CA64C"/><path d="M196 204 Q190 170 170 160 Q176 190 176 204 Z" fill="#4CA64C"/>
</g>` }
});
