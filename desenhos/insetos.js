'use strict';
Object.assign(DESENHOS, {
borboleta: `<g class="corpo">
 <path class="asa" d="M104 100 Q60 20 22 48 Q4 92 50 116 Q20 150 46 182 Q80 190 104 130 Z" fill="#B57BE8"/>
 <path class="asa" d="M116 100 Q160 20 198 48 Q216 92 170 116 Q200 150 174 182 Q140 190 116 130 Z" fill="#B57BE8"/>
 <circle cx="50" cy="74" r="14" fill="#FFD84D"/><circle cx="170" cy="74" r="14" fill="#FFD84D"/>
 <circle cx="62" cy="158" r="10" fill="#FF8FB1"/><circle cx="158" cy="158" r="10" fill="#FF8FB1"/>
 <circle cx="32" cy="100" r="6" fill="#7FD3F5"/><circle cx="188" cy="100" r="6" fill="#7FD3F5"/>
 <ellipse cx="110" cy="160" rx="13" ry="42" fill="#5B3A82"/>
 <path d="M100 66 Q86 28 74 24 M120 66 Q134 28 146 24" stroke="#5B3A82" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="74" cy="24" r="6" fill="#5B3A82"/><circle cx="146" cy="24" r="6" fill="#5B3A82"/>
 <circle cx="110" cy="96" r="34" fill="#7A52A8"/>
 ${olhos(97,123,92,8,10)}${bochechas(86,134,108)}${sorriso(110,110,'#fff')}
</g>`,
abelha: `<g class="corpo">
 <ellipse class="asa" cx="78" cy="118" rx="22" ry="16" fill="#D8F2FF" opacity=".9"/>
 <ellipse class="asa" cx="142" cy="118" rx="22" ry="16" fill="#D8F2FF" opacity=".9"/>
 <path d="M110 196 L104 210 L116 210 Z" fill="#2E2E2E"/>
 <ellipse cx="110" cy="160" rx="46" ry="40" fill="#FFD23F"/>
 <rect x="66" y="146" width="88" height="11" rx="5" fill="#2E2E2E"/>
 <rect x="70" y="170" width="80" height="11" rx="5" fill="#2E2E2E"/>
 <path d="M90 40 Q80 18 70 16 M130 40 Q140 18 150 16" stroke="#2E2E2E" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="70" cy="16" r="6" fill="#2E2E2E"/><circle cx="150" cy="16" r="6" fill="#2E2E2E"/>
 <circle cx="110" cy="82" r="50" fill="#FFDF5E"/>
 ${olhos(90,130,80)}${bochechas(72,148,100)}${sorriso(110,104)}
</g>`,
joaninha: `<g class="corpo">
 <path d="M60 150 L36 146 M60 172 L36 180 M160 150 L184 146 M160 172 L184 180" stroke="#2E2E2E" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="110" cy="150" rx="62" ry="54" fill="#2E2E2E"/>
 <path class="asa" d="M110 98 Q50 96 50 150 Q54 200 108 204 Z" fill="#E8392E"/>
 <path class="asa" d="M110 98 Q170 96 170 150 Q166 200 112 204 Z" fill="#E8392E"/>
 <circle cx="80" cy="136" r="10" fill="#2E2E2E"/><circle cx="86" cy="174" r="9" fill="#2E2E2E"/>
 <circle cx="140" cy="136" r="10" fill="#2E2E2E"/><circle cx="134" cy="174" r="9" fill="#2E2E2E"/>
 <path d="M90 52 Q80 26 70 22 M130 52 Q140 26 150 22" stroke="#2E2E2E" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="70" cy="22" r="6" fill="#2E2E2E"/><circle cx="150" cy="22" r="6" fill="#2E2E2E"/>
 <ellipse cx="110" cy="82" rx="44" ry="38" fill="#3A3A3A"/>
 ${olhos(94,126,80,9,11)}${bochechas(80,140,98)}${sorriso(110,100,'#fff')}
</g>`,
caracol: `<g class="corpo">
 <path d="M30 196 Q30 150 70 150 L170 150 Q196 150 196 190 Q196 204 180 204 L40 204 Q30 204 30 196 Z" fill="#B9E07A"/>
 <circle cx="130" cy="122" r="66" fill="#E59A4E"/>
 <path d="M130 122 m-8 0 a8 8 0 1 1 16 0 a20 20 0 1 1 -40 0 a32 32 0 1 1 64 0 a46 46 0 1 1 -92 0" stroke="#B5652A" stroke-width="7" fill="none" stroke-linecap="round"/>
 <path class="orelha" d="M44 110 L34 60 M64 108 L70 58" stroke="#9CCB5A" stroke-width="6" stroke-linecap="round"/>
 <circle cx="34" cy="58" r="7" fill="#9CCB5A"/><circle cx="70" cy="56" r="7" fill="#9CCB5A"/>
 <ellipse cx="54" cy="150" rx="40" ry="44" fill="#C7EA8C"/>
 ${olhos(40,68,140,8,10)}${bochechas(30,78,160)}${sorriso(54,164)}
</g>`,
formiga: `<g class="corpo">
 <path d="M86 156 L56 176 L52 200 M134 156 L164 176 L168 200 M90 168 L80 200 M130 168 L140 200" stroke="#5A3220" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="176" rx="34" ry="26" fill="#6E3D24"/>
 <ellipse cx="110" cy="140" rx="18" ry="14" fill="#7E4A2C"/>
 <path class="orelha" d="M92 44 Q76 14 60 16 M128 44 Q144 14 160 16" stroke="#5A3220" stroke-width="5" fill="none" stroke-linecap="round"/>
 <circle cx="60" cy="16" r="6" fill="#5A3220"/><circle cx="160" cy="16" r="6" fill="#5A3220"/>
 <ellipse cx="110" cy="86" rx="52" ry="46" fill="#8C5634"/>
 ${olhos(90,130,82)}${bochechas(72,148,102)}${sorriso(110,106,'#FFE6C9')}
</g>`,
aranha: `<g class="corpo">
 <path d="M70 120 Q30 96 18 130 M68 140 Q26 134 18 170 M72 158 Q40 168 38 200 M80 170 Q66 190 70 204 M150 120 Q190 96 202 130 M152 140 Q194 134 202 170 M148 158 Q180 168 182 200 M140 170 Q154 190 150 204" stroke="#6B5A8E" stroke-width="7" fill="none" stroke-linecap="round"/>
 <circle cx="110" cy="128" r="66" fill="#8E7BB8"/>
 <ellipse cx="110" cy="176" rx="22" ry="12" fill="#A797CC"/>
 <path class="orelha" d="M82 70 Q78 54 88 52 M138 70 Q142 54 132 52" stroke="#6B5A8E" stroke-width="5" fill="none" stroke-linecap="round"/>
 ${olhos(88,132,116,15,17)}${bochechas(70,150,144)}${sorriso(110,148)}
</g>`,
lagarta: `<g class="corpo">
 <circle class="cauda" cx="182" cy="176" r="22" fill="#6CC04A"/>
 <circle cx="148" cy="176" r="26" fill="#8BD65A"/>
 <circle cx="110" cy="172" r="28" fill="#6CC04A"/>
 <path d="M140 200 v6 M156 200 v6 M102 198 v8 M118 198 v8 M176 196 v8" stroke="#3E8A2A" stroke-width="5" stroke-linecap="round"/>
 <circle cx="148" cy="166" r="5" fill="#FFD84D"/><circle cx="110" cy="160" r="5" fill="#FFD84D"/><circle cx="182" cy="168" r="4" fill="#FFD84D"/>
 <path class="orelha" d="M50 50 Q42 22 30 20 M80 46 Q86 18 98 16" stroke="#3E8A2A" stroke-width="5" fill="none" stroke-linecap="round"/>
 <circle cx="30" cy="20" r="6" fill="#FF7A6B"/><circle cx="98" cy="16" r="6" fill="#FF7A6B"/>
 <circle cx="66" cy="110" r="54" fill="#9BE06A"/>
 ${olhos(48,86,104)}${bochechas(32,100,126)}${sorriso(66,128)}
</g>`,
minhoca: `<g class="corpo">
 <path class="cauda" d="M150 190 Q196 194 196 160" stroke="#F49AB0" stroke-width="26" fill="none" stroke-linecap="round"/>
 <path d="M70 120 Q60 186 110 188 L152 190" stroke="#F7A8BC" stroke-width="36" fill="none" stroke-linecap="round"/>
 <ellipse cx="80" cy="84" rx="50" ry="56" fill="#FBB6C8"/>
 ${olhos(62,98,80)}${bochechas(46,114,104)}${sorriso(80,106)}
</g>`,
gafanhoto: `<g class="corpo">
 <path d="M150 150 L196 96 L196 200" stroke="#4FA33A" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M70 160 L30 120 L28 200" stroke="#4FA33A" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <ellipse cx="114" cy="164" rx="56" ry="28" fill="#7CCB4E"/>
 <path class="asa" d="M100 146 Q150 128 182 158 Q140 170 100 160 Z" fill="#5DB33E"/>
 <path d="M96 186 L92 204 M124 186 L128 204" stroke="#4FA33A" stroke-width="6" stroke-linecap="round"/>
 <path class="orelha" d="M90 44 Q70 6 46 10 M130 44 Q150 6 174 10" stroke="#4FA33A" stroke-width="4" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="88" rx="48" ry="50" fill="#8EDB5C"/>
 ${olhos(90,130,82,12,14)}${bochechas(72,148,106)}${sorriso(110,112)}
</g>`,
libelinha: `<g class="corpo">
 <ellipse class="asa" cx="56" cy="86" rx="50" ry="14" transform="rotate(-12 56 86)" fill="#CFF3FF" opacity=".75" stroke="#8FD3EA" stroke-width="2"/>
 <ellipse class="asa" cx="164" cy="86" rx="50" ry="14" transform="rotate(12 164 86)" fill="#CFF3FF" opacity=".75" stroke="#8FD3EA" stroke-width="2"/>
 <ellipse class="asa" cx="60" cy="116" rx="44" ry="12" transform="rotate(10 60 116)" fill="#CFF3FF" opacity=".75" stroke="#8FD3EA" stroke-width="2"/>
 <ellipse class="asa" cx="160" cy="116" rx="44" ry="12" transform="rotate(-10 160 116)" fill="#CFF3FF" opacity=".75" stroke="#8FD3EA" stroke-width="2"/>
 <rect x="104" y="96" width="12" height="110" rx="6" fill="#2BA8C8"/>
 <path d="M104 130 h12 M104 150 h12 M104 170 h12 M104 190 h12" stroke="#1E86A3" stroke-width="3"/>
 <ellipse cx="110" cy="104" rx="14" ry="18" fill="#3BBBD9"/>
 <circle cx="110" cy="60" r="36" fill="#4FC8E6"/>
 ${olhos(94,126,56,11,13)}${bochechas(86,134,74)}${sorriso(110,78)}
</g>`,
mosca: `<g class="corpo">
 <ellipse class="asa" cx="70" cy="110" rx="36" ry="20" transform="rotate(-30 70 110)" fill="#E6F2F7" opacity=".8" stroke="#B9CDD6" stroke-width="2"/>
 <ellipse class="asa" cx="150" cy="110" rx="36" ry="20" transform="rotate(30 150 110)" fill="#E6F2F7" opacity=".8" stroke="#B9CDD6" stroke-width="2"/>
 <path d="M86 176 L74 202 M134 176 L146 202 M100 184 L98 204 M120 184 L122 204" stroke="#4A4A4A" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="110" cy="160" rx="38" ry="32" fill="#6B6B6B"/>
 <path d="M80 150 h60 M82 168 h56" stroke="#555" stroke-width="5" stroke-linecap="round"/>
 <circle cx="110" cy="88" r="46" fill="#8A8A8A"/>
 <g class="olhos"><ellipse cx="78" cy="78" rx="24" ry="26" fill="#D9363E"/><ellipse cx="142" cy="78" rx="24" ry="26" fill="#D9363E"/><circle cx="86" cy="68" r="8" fill="#fff"/><circle cx="150" cy="68" r="8" fill="#fff"/><circle cx="72" cy="88" r="4" fill="#fff"/><circle cx="136" cy="88" r="4" fill="#fff"/></g>
 ${bochechas(86,134,112)}${sorriso(110,116)}
</g>`,
pirilampo: `<g class="corpo">
 <circle cx="110" cy="182" r="34" fill="#FFF27A" opacity=".5"/>
 <ellipse cx="110" cy="178" rx="26" ry="22" fill="#FFE433"/>
 <ellipse cx="110" cy="144" rx="34" ry="26" fill="#6B4F2E"/>
 <ellipse class="asa" cx="78" cy="132" rx="28" ry="14" transform="rotate(-25 78 132)" fill="#E8F4F8" opacity=".85"/>
 <ellipse class="asa" cx="142" cy="132" rx="28" ry="14" transform="rotate(25 142 132)" fill="#E8F4F8" opacity=".85"/>
 <path d="M92 44 Q82 18 70 16 M128 44 Q138 18 150 16" stroke="#3E2E1C" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="70" cy="16" r="6" fill="#3E2E1C"/><circle cx="150" cy="16" r="6" fill="#3E2E1C"/>
 <circle cx="110" cy="84" r="46" fill="#E8693C"/>
 ${olhos(92,128,80,10,12)}${bochechas(76,144,100)}${sorriso(110,104)}
</g>`,
besouro: `<g class="corpo">
 <path d="M58 140 L30 128 M56 164 L28 172 M62 186 L40 202 M162 140 L190 128 M164 164 L192 172 M158 186 L180 202" stroke="#1B2550" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="110" cy="158" rx="56" ry="48" fill="#1E3170"/>
 <path class="asa" d="M108 112 Q58 114 56 158 Q60 200 108 206 Z" fill="#2747A8"/>
 <path class="asa" d="M112 112 Q162 114 164 158 Q160 200 112 206 Z" fill="#2747A8"/>
 <ellipse cx="80" cy="140" rx="8" ry="16" fill="#7FA6FF" opacity=".7"/><ellipse cx="140" cy="140" rx="8" ry="16" fill="#7FA6FF" opacity=".7"/>
 <path d="M110 34 Q104 10 116 6" stroke="#1B2550" stroke-width="7" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="76" rx="48" ry="42" fill="#2A3C80"/>
 <ellipse cx="88" cy="54" rx="10" ry="6" fill="#7FA6FF" opacity=".6"/>
 ${olhos(92,128,76,10,12)}${bochechas(76,144,96)}${sorriso(110,98,'#fff')}
</g>`,
'louva-a-deus': `<g class="corpo">
 <path d="M96 196 L80 152 M124 196 L140 152 M80 204 L60 166 M140 204 L160 166" stroke="#5DB33E" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="110" cy="170" rx="24" ry="34" fill="#7CCB4E"/>
 <rect x="102" y="96" width="16" height="50" rx="8" fill="#8EDB5C"/>
 <path class="asa" d="M100 130 L60 110 L52 82 M120 130 L160 110 L168 82" stroke="#6CC04A" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <path class="orelha" d="M84 34 Q62 8 40 12 M136 34 Q158 8 180 12" stroke="#5DB33E" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M50 48 Q110 10 170 48 Q156 108 110 112 Q64 108 50 48 Z" fill="#9BE06A"/>
 ${olhos(80,140,58,13,15)}${bochechas(82,138,84)}${sorriso(110,90)}
</g>`
});
