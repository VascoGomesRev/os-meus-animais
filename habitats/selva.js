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
</g>` },
chita: { nome: 'erva alta', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="14" fill="#D9B85A"/>
 <circle cx="40" cy="50" r="18" fill="#FFD84D"/>
 <path d="M14 204 L24 110 L34 204 M34 204 L48 90 L58 204 M58 204 L70 120 L80 204 M140 204 L152 116 L162 204 M162 204 L176 92 L186 204 M186 204 L198 120 L208 204" fill="#E8C75E"/>
 <path class="balanca" d="M80 204 L94 100 L104 204 M110 204 L124 108 L134 204" fill="#F0D470"/>
</g>` },
hiena: { nome: 'relva seca', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="16" fill="#C9A86A"/>
 <circle cx="168" cy="54" r="20" fill="#FFB84D"/>
 <path d="M20 202 Q24 170 30 160 Q34 180 36 202 Z M44 202 Q50 176 58 168 Q58 186 58 202 Z M160 202 Q166 172 174 164 Q174 184 176 202 Z M184 202 Q192 178 200 172 Q198 190 198 202 Z" fill="#B89050"/>
 <path d="M150 200 L154 150 L160 150 L164 200 Z" fill="#8A5A33"/><ellipse cx="157" cy="144" rx="44" ry="12" fill="#9AAE4A"/>
 <ellipse cx="110" cy="196" rx="40" ry="8" fill="#A88A50"/>
 <path class="balanca" d="M96 196 Q100 176 108 172 Q106 186 108 196 Z" fill="#D8B870"/>
</g>` },
antilope: { nome: 'colina', svg: `<g>
 <path d="M6 206 Q60 110 130 140 Q180 120 214 206 Z" fill="#9CC25A"/>
 <path d="M6 206 Q70 160 120 176 Q170 160 214 206 Z" fill="#B4D46A"/>
 <circle cx="60" cy="50" r="18" fill="#FFD84D"/>
 <path d="M146 136 L148 112 L152 112 L154 136 Z" fill="#8A5A33"/>
 <ellipse class="balanca" cx="150" cy="106" rx="24" ry="10" fill="#6E9E3A"/>
</g>` },
gnu: { nome: 'pasto', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="16" fill="#A8C860"/>
 <path d="M10 204 Q40 150 80 170 Q120 140 160 166 Q190 150 210 204 Z" fill="#94B850"/>
 <ellipse cx="60" cy="50" rx="24" ry="12" fill="#FFFFFF"/><ellipse cx="78" cy="44" rx="16" ry="10" fill="#FFFFFF"/>
 <ellipse cx="160" cy="70" rx="20" ry="10" fill="#FFFFFF"/>
 <path class="balanca" d="M30 204 L34 184 L38 204 M180 204 L184 182 L188 204 M100 204 L104 186 L108 204" fill="#7AA040"/>
</g>` },
bufalo: { nome: 'lagoa', svg: `<g>
 <ellipse cx="110" cy="200" rx="104" ry="18" fill="#7FAE4E"/>
 <ellipse cx="110" cy="194" rx="80" ry="14" fill="#5AB0D8"/>
 <ellipse cx="96" cy="192" rx="30" ry="4" fill="#8ACBE8"/>
 <path d="M20 200 L22 140 L26 200 M30 200 L34 150 L36 200 M190 200 L194 136 L198 200" stroke="#5A8A30" stroke-width="3" fill="none"/>
 <ellipse class="balanca" cx="23" cy="140" rx="4" ry="10" fill="#8A5A33"/><ellipse cx="195" cy="136" rx="4" ry="10" fill="#8A5A33"/>
 <ellipse cx="150" cy="190" rx="10" ry="4" fill="#4CA64C"/>
</g>` },
orangotango: { nome: 'ninho de folhas', svg: `<g>
 <ellipse cx="110" cy="204" rx="100" ry="10" fill="#4F8F3A"/>
 <rect x="100" y="80" width="20" height="124" rx="8" fill="#7A5230"/>
 <path d="M110 120 L50 90 M110 120 L170 90" stroke="#7A5230" stroke-width="8" stroke-linecap="round"/>
 <ellipse cx="110" cy="90" rx="74" ry="24" fill="#3E8E3E"/>
 <ellipse cx="110" cy="80" rx="50" ry="14" fill="#8A6A3A"/>
 <path d="M64 78 Q110 98 156 78" stroke="#6A4A22" stroke-width="5" fill="none"/>
 <ellipse class="balanca" cx="70" cy="66" rx="16" ry="8" fill="#5CBF5C"/><ellipse cx="150" cy="66" rx="16" ry="8" fill="#5CBF5C"/><ellipse cx="110" cy="60" rx="18" ry="8" fill="#4CA64C"/>
</g>` },
chimpanze: { nome: 'bananeira', svg: `<g>
 <ellipse cx="110" cy="204" rx="100" ry="12" fill="#5A9E3A"/>
 <path d="M100 204 L104 80 L116 80 L120 204 Z" fill="#8AAE4A"/>
 <path d="M110 84 Q60 40 20 70 Q60 70 110 92 Z" fill="#4CB04C"/>
 <path class="balanca" d="M110 84 Q160 40 200 70 Q160 70 110 92 Z" fill="#5CC05C"/>
 <path d="M110 80 Q90 30 110 14 Q124 40 112 80 Z" fill="#3E9E3E"/>
 <path d="M114 96 Q140 100 140 130 Q130 120 116 116 Z" fill="#FFD84D"/>
 <path d="M114 104 Q132 112 130 136 Q122 124 114 120 Z" fill="#F5C232"/>
</g>` },
lemure: { nome: 'ilha', svg: `<g>
 <ellipse cx="110" cy="200" rx="106" ry="18" fill="#5AB0D8"/>
 <ellipse cx="110" cy="192" rx="74" ry="16" fill="#F0D89A"/>
 <path d="M100 194 Q96 140 112 96" stroke="#8A5A33" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M112 96 Q80 76 56 96 Q84 90 112 100 Z M112 96 Q144 74 170 94 Q142 90 112 100 Z" fill="#4CA64C"/>
 <path class="balanca" d="M112 96 Q104 64 124 50 Q120 76 114 98 Z" fill="#5CBF5C"/>
 <circle cx="118" cy="104" r="5" fill="#8A5A33"/>
 <ellipse cx="40" cy="198" rx="12" ry="3" fill="#8ACBE8"/>
</g>` },
tatu: { nome: 'areia', svg: `<g>
 <path d="M4 206 Q50 160 110 172 Q170 160 216 206 Z" fill="#E8C88A"/>
 <ellipse cx="110" cy="200" rx="106" ry="10" fill="#D8B070"/>
 <circle cx="170" cy="50" r="20" fill="#FFD84D"/>
 <rect x="36" y="140" width="14" height="50" rx="7" fill="#6EAE4A"/><rect x="24" y="152" width="10" height="20" rx="5" fill="#6EAE4A"/><rect class="balanca" x="52" y="146" width="10" height="20" rx="5" fill="#6EAE4A"/>
 <ellipse cx="160" cy="190" rx="12" ry="6" fill="#B89060"/>
</g>` },
tamandua: { nome: 'cupinzeiro', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="14" fill="#B4C860"/>
 <path d="M70 204 Q74 120 100 60 Q110 40 120 60 Q146 120 150 204 Z" fill="#C8783E"/>
 <path d="M84 204 Q86 150 100 120 M134 204 Q132 150 120 120" stroke="#A85E2A" stroke-width="4" fill="none"/>
 <circle cx="104" cy="140" r="4" fill="#5A3010"/><circle cx="118" cy="110" r="4" fill="#5A3010"/><circle cx="112" cy="174" r="4" fill="#5A3010"/>
 <path class="balanca" d="M30 204 L34 180 L38 204 M180 204 L184 178 L188 204" fill="#7AA040"/>
</g>` },
jaguar: { nome: 'cascata', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="14" fill="#4F8F3A"/>
 <path d="M30 204 L40 50 Q70 30 90 50 L90 204 Z M130 204 L130 50 Q150 30 180 50 L190 204 Z" fill="#8A8A96"/>
 <rect x="88" y="48" width="44" height="150" fill="#6EC4EA"/>
 <path d="M98 60 L98 180 M110 56 L110 190 M122 60 L122 180" stroke="#BDE6F8" stroke-width="4" stroke-linecap="round"/>
 <ellipse class="balanca" cx="110" cy="196" rx="36" ry="10" fill="#FFFFFF"/>
 <circle cx="40" cy="60" r="16" fill="#3E8E3E"/><circle cx="182" cy="60" r="16" fill="#3E8E3E"/>
</g>` },
'pantera-negra': { nome: 'tronco', svg: `<g>
 <ellipse cx="110" cy="204" rx="100" ry="10" fill="#3E7E3A"/>
 <rect x="14" y="150" width="192" height="44" rx="22" fill="#8A5A33"/>
 <ellipse cx="192" cy="172" rx="16" ry="22" fill="#C99A62"/><ellipse cx="192" cy="172" rx="8" ry="12" fill="#A8784A"/>
 <path d="M40 162 L90 162 M110 182 L160 182" stroke="#6A4222" stroke-width="4" stroke-linecap="round"/>
 <path class="balanca" d="M60 150 Q56 126 72 116 Q72 136 66 150 Z" fill="#5CBF5C"/>
 <rect x="24" y="60" width="14" height="94" rx="6" fill="#6A4428"/><rect x="183" y="50" width="14" height="104" rx="6" fill="#6A4428"/><circle cx="30" cy="60" r="28" fill="#2E6E2E"/><circle cx="190" cy="50" r="30" fill="#2E6E2E"/>
</g>` },
tapir: { nome: 'riacho', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="14" fill="#5A9E3A"/>
 <path d="M6 190 Q60 170 110 190 Q160 210 214 186 L214 200 Q160 216 110 200 Q60 182 6 202 Z" fill="#5AB0D8"/>
 <ellipse cx="60" cy="186" rx="14" ry="2.5" fill="#BDE6F8"/><ellipse cx="160" cy="198" rx="14" ry="2.5" fill="#BDE6F8"/>
 <rect x="24" y="90" width="12" height="90" rx="5" fill="#7A5230"/><circle cx="30" cy="70" r="30" fill="#3E8E3E"/>
 <path class="balanca" d="M184 186 Q176 140 196 120 Q196 150 192 186 Z" fill="#4CA64C"/>
</g>` },
gazela: { nome: 'arbusto', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="14" fill="#E2C27A"/>
 <circle cx="60" cy="168" r="30" fill="#7BAE3E"/><circle cx="96" cy="156" r="36" fill="#8CC24A"/><circle cx="140" cy="164" r="32" fill="#7BAE3E"/><circle cx="168" cy="178" r="22" fill="#8CC24A"/>
 <circle cx="80" cy="150" r="5" fill="#F26B8A"/><circle cx="120" cy="140" r="5" fill="#F26B8A"/><circle class="balanca" cx="150" cy="160" r="5" fill="#F26B8A"/>
 <circle cx="176" cy="50" r="18" fill="#FFD84D"/>
</g>` },
okapi: { nome: 'bosque', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="12" fill="#3E7E3A"/>
 <rect x="24" y="70" width="14" height="134" rx="6" fill="#6A4428"/><rect x="104" y="50" width="14" height="154" rx="6" fill="#6A4428"/><rect x="180" y="80" width="14" height="124" rx="6" fill="#6A4428"/>
 <circle cx="31" cy="64" r="28" fill="#2E7E3E"/><circle cx="111" cy="44" r="34" fill="#3E8E3E"/><circle cx="187" cy="72" r="26" fill="#2E7E3E"/>
 <ellipse class="balanca" cx="70" cy="196" rx="16" ry="8" fill="#5CBF5C"/><ellipse cx="150" cy="196" rx="16" ry="8" fill="#5CBF5C"/>
</g>` },
babuino: { nome: 'pedregulho', svg: `<g>
 <ellipse cx="110" cy="204" rx="104" ry="12" fill="#D8B870"/>
 <path d="M30 204 Q20 120 80 90 Q140 70 180 120 Q200 160 190 204 Z" fill="#A89C90"/>
 <path d="M60 130 Q90 110 120 120 M120 160 Q150 150 170 170" stroke="#8A7E74" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="150" cy="110" rx="18" ry="8" fill="#BCB0A4"/>
 <path class="balanca" d="M16 204 L20 182 L24 204 M196 204 L200 184 L204 204" fill="#9CB850"/>
 <circle cx="40" cy="50" r="16" fill="#FFD84D"/>
</g>` },
capivara: { nome: 'margem', svg: `<g>
 <path d="M4 206 L4 170 Q60 160 100 176 L100 206 Z" fill="#7FAE4E"/>
 <path d="M100 206 L100 180 Q160 170 216 180 L216 206 Z" fill="#5AB0D8"/>
 <ellipse cx="150" cy="192" rx="20" ry="3" fill="#BDE6F8"/>
 <ellipse cx="186" cy="186" rx="14" ry="5" fill="#4CA64C"/><circle cx="186" cy="182" r="4" fill="#F7B7C4"/>
 <path d="M20 172 L22 120 L26 172 M40 170 L44 130 L46 170 M70 170 L72 126 L76 172" stroke="#5A8A30" stroke-width="3" fill="none"/>
 <ellipse class="balanca" cx="22" cy="118" rx="4" ry="10" fill="#8A5A33"/><ellipse cx="73" cy="124" rx="4" ry="10" fill="#8A5A33"/>
</g>` },
iguana: { nome: 'palmeira', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="14" fill="#E8D08A"/>
 <path d="M104 204 Q100 140 116 70 L124 72 Q112 140 118 204 Z" fill="#A8784A"/>
 <path d="M106 180 L116 180 M108 150 L118 150 M110 120 L120 120 M114 92 L122 92" stroke="#8A5A33" stroke-width="3"/>
 <path d="M120 70 Q80 50 50 80 Q84 66 120 76 Z M120 70 Q160 46 190 76 Q156 64 120 76 Z M120 70 Q100 30 70 30 Q100 44 118 72 Z" fill="#3E9E3E"/>
 <path class="balanca" d="M120 70 Q140 30 170 30 Q142 46 122 74 Z" fill="#4CB04C"/>
 <circle cx="114" cy="78" r="6" fill="#8A5A33"/><circle cx="126" cy="80" r="6" fill="#8A5A33"/>
</g>` },
'dragao-de-komodo': { nome: 'praia', svg: `<g>
 <rect x="4" y="150" width="212" height="30" rx="10" fill="#5AB0D8"/>
 <ellipse cx="110" cy="196" rx="108" ry="18" fill="#F0D89A"/>
 <path class="balanca" d="M30 160 Q40 154 50 160 M120 158 Q130 152 140 158" stroke="#BDE6F8" stroke-width="3" fill="none" stroke-linecap="round"/>
 <circle cx="170" cy="60" r="20" fill="#FFD84D"/>
 <ellipse cx="50" cy="196" rx="8" ry="5" fill="#F7B7C4"/><ellipse cx="170" cy="200" rx="10" ry="5" fill="#C9B080"/>
</g>` },
facoceiro: { nome: 'baobá', svg: `<g>
 <ellipse cx="110" cy="202" rx="104" ry="14" fill="#E2C27A"/>
 <path d="M80 204 Q74 140 86 80 L134 80 Q146 140 140 204 Z" fill="#B08A6A"/>
 <path d="M90 80 L70 50 M104 80 L98 40 M116 80 L122 40 M130 80 L150 50" stroke="#B08A6A" stroke-width="8" stroke-linecap="round"/>
 <circle cx="70" cy="46" r="14" fill="#7BAE3E"/><circle cx="98" cy="36" r="14" fill="#8CC24A"/><circle cx="122" cy="36" r="14" fill="#7BAE3E"/><circle class="balanca" cx="150" cy="46" r="14" fill="#8CC24A"/>
 <path d="M100 120 Q104 160 98 196 M122 110 Q118 150 124 196" stroke="#987258" stroke-width="3" fill="none"/>
</g>` }
});
