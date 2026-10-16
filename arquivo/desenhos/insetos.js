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
</g>`,
grilo: `<g class="corpo">
 <path d="M70 150 L40 120 L28 200 M150 150 L180 120 L192 200" stroke="#3A2A1E" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M92 186 L86 204 M128 186 L134 204" stroke="#3A2A1E" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="110" cy="160" rx="46" ry="36" fill="#4A3426"/>
 <path class="asa" d="M108 130 Q70 134 70 170 Q90 192 108 190 Z" fill="#6B4C36"/>
 <path class="asa" d="M112 130 Q150 134 150 170 Q130 192 112 190 Z" fill="#6B4C36"/>
 <path class="orelha" d="M88 46 Q60 4 6 20 M132 46 Q160 4 214 20" stroke="#2B1E15" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="110" cy="86" r="48" fill="#3B2A20"/>
 <ellipse cx="90" cy="60" rx="12" ry="7" fill="#7A5A44" opacity=".7"/>
 ${olhos(92,128,84,11,13)}${bochechas(76,144,104)}${sorriso(110,108,'#fff')}
</g>`,
vespa: `<g class="corpo">
 <ellipse class="asa" cx="62" cy="112" rx="40" ry="16" transform="rotate(-30 62 112)" fill="#E6F4FA" opacity=".85" stroke="#B9D3DE" stroke-width="2"/>
 <ellipse class="asa" cx="158" cy="112" rx="40" ry="16" transform="rotate(30 158 112)" fill="#E6F4FA" opacity=".85" stroke="#B9D3DE" stroke-width="2"/>
 <path d="M96 150 L80 200 M124 150 L140 200" stroke="#222" stroke-width="4" stroke-linecap="round"/>
 <ellipse cx="110" cy="174" rx="22" ry="32" fill="#FFD21F"/>
 <path d="M90 166 h40 M92 184 h36" stroke="#222" stroke-width="8" stroke-linecap="round"/>
 <path d="M104 204 L110 214 L116 204 Z" fill="#222"/>
 <ellipse cx="110" cy="140" rx="7" ry="8" fill="#222"/>
 <ellipse cx="110" cy="124" rx="18" ry="14" fill="#FFD21F"/>
 <path d="M92 40 Q78 14 64 14 M128 40 Q142 14 156 14" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="74" rx="44" ry="42" fill="#FFD21F"/>
 <path d="M72 50 Q110 26 148 50 Q130 40 110 40 Q90 40 72 50 Z" fill="#222"/>
 ${olhos(92,128,74,11,13)}${bochechas(78,142,94)}${sorriso(110,96)}
</g>`,
mosquito: `<g class="corpo">
 <ellipse class="asa" cx="60" cy="100" rx="44" ry="14" transform="rotate(-20 60 100)" fill="#EEF6FA" opacity=".85" stroke="#C2D3DB" stroke-width="2"/>
 <ellipse class="asa" cx="160" cy="100" rx="44" ry="14" transform="rotate(20 160 100)" fill="#EEF6FA" opacity=".85" stroke="#C2D3DB" stroke-width="2"/>
 <path d="M100 130 L56 150 L30 204 M104 136 L76 170 L66 204 M120 130 L164 150 L190 204 M116 136 L144 170 L154 204" stroke="#6F7378" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <ellipse cx="110" cy="166" rx="12" ry="40" fill="#8E9398"/>
 <path d="M100 150 h20 M100 166 h20 M100 182 h20" stroke="#6F7378" stroke-width="3"/>
 <ellipse cx="110" cy="128" rx="18" ry="14" fill="#8E9398"/>
 <path d="M96 42 Q86 20 74 20 M124 42 Q134 20 146 20" stroke="#6F7378" stroke-width="3" fill="none" stroke-linecap="round"/>
 <circle cx="110" cy="78" r="40" fill="#A8ADB2"/>
 <path d="M110 100 L110 124" stroke="#4E5257" stroke-width="4" stroke-linecap="round"/>
 ${olhos(94,126,72,11,13)}${bochechas(80,140,88)}${sorriso(110,90)}
</g>`,
traca: `<g class="corpo">
 <path class="asa" d="M108 96 L24 190 Q60 204 108 196 Z" fill="#C9BBA4"/>
 <path class="asa" d="M112 96 L196 190 Q160 204 112 196 Z" fill="#C9BBA4"/>
 <path d="M60 170 Q80 160 100 172 M120 172 Q140 160 160 170" stroke="#A8977C" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="70" cy="184" r="5" fill="#A8977C"/><circle cx="150" cy="184" r="5" fill="#A8977C"/>
 <ellipse cx="110" cy="150" rx="18" ry="48" fill="#B3A68F"/>
 <path class="orelha" d="M92 44 Q76 18 60 10 M128 44 Q144 18 160 10" stroke="#8C7D66" stroke-width="3" fill="none"/>
 <path d="M84 34 l-8 -4 M78 24 l-8 -2 M70 16 l-8 0 M136 34 l8 -4 M142 24 l8 -2 M150 16 l8 0" stroke="#8C7D66" stroke-width="3" stroke-linecap="round"/>
 <circle cx="110" cy="80" r="42" fill="#D8CDB9"/>
 ${olhos(94,126,78,11,13)}${bochechas(80,140,96)}${sorriso(110,98)}
</g>`,
'bicho-da-seda': `<g class="corpo">
 <ellipse cx="184" cy="178" rx="24" ry="30" fill="#FFF6D6"/>
 <path d="M166 166 Q184 158 202 166 M164 182 Q184 174 204 182 M168 196 Q184 190 200 196" stroke="#E8DBA8" stroke-width="3" fill="none"/>
 <ellipse cx="54" cy="186" rx="26" ry="20" fill="#F2F2EC"/>
 <ellipse cx="84" cy="176" rx="30" ry="26" fill="#F7F7F2"/>
 <ellipse cx="116" cy="164" rx="32" ry="30" fill="#FBFBF7"/>
 <path d="M52 204 v-4 M80 204 v-4 M112 204 v-6 M140 204 v-6" stroke="#D9D4C7" stroke-width="6" stroke-linecap="round"/>
 <path class="cauda" d="M30 184 Q24 170 32 164" stroke="#D9D4C7" stroke-width="5" fill="none" stroke-linecap="round"/>
 <circle cx="110" cy="92" r="54" fill="#FFFFFF"/>
 <path d="M80 44 Q90 36 100 42 M120 42 Q130 36 140 44" stroke="#D9D4C7" stroke-width="4" fill="none" stroke-linecap="round"/>
 ${olhos(90,130,90,12,14)}${bochechas(72,148,112)}${sorriso(110,114)}
</g>`,
centopeia: `<g class="corpo">
 <path d="M20 184 v18 M36 184 v18 M52 180 v20 M68 176 v22 M84 172 v24 M100 168 v28 M116 164 v32 M132 160 v36 M148 158 v38 M24 184 l-6 16 M40 184 l-6 16 M56 180 l-6 18 M72 176 l-6 20 M88 172 l-6 22 M104 168 l-6 26 M120 164 l-6 30 M136 160 l-6 34" stroke="#C4501E" stroke-width="4" stroke-linecap="round"/>
 <circle class="cauda" cx="24" cy="180" r="14" fill="#F07A2E"/>
 <circle cx="42" cy="176" r="16" fill="#F58A3C"/>
 <circle cx="62" cy="172" r="17" fill="#F07A2E"/>
 <circle cx="82" cy="168" r="18" fill="#F58A3C"/>
 <circle cx="102" cy="164" r="19" fill="#F07A2E"/>
 <circle cx="124" cy="160" r="20" fill="#F58A3C"/>
 <circle cx="146" cy="156" r="21" fill="#F07A2E"/>
 <path class="orelha" d="M136 50 Q120 18 104 14 M170 50 Q190 18 206 18" stroke="#C4501E" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="152" cy="98" r="50" fill="#FF9447"/>
 ${olhos(134,170,94,11,13)}${bochechas(118,186,114)}${sorriso(152,116)}
</g>`,
escorpiao: `<g class="corpo">
 <path class="cauda" d="M150 170 Q200 160 196 110 Q192 70 160 70" stroke="#C99A5E" stroke-width="16" fill="none" stroke-linecap="round"/>
 <path d="M160 70 Q150 60 158 52 Q166 62 160 70 Z" fill="#9C7240"/>
 <path d="M70 176 L44 196 M80 182 L66 204 M140 176 L166 196 M130 182 L144 204" stroke="#A97B45" stroke-width="5" stroke-linecap="round"/>
 <path d="M70 130 Q40 128 30 104" stroke="#C99A5E" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M14 98 Q20 70 40 80 L32 92 Q44 96 46 106 Q30 118 14 98 Z" fill="#B78A50"/>
 <ellipse cx="110" cy="168" rx="48" ry="26" fill="#C99A5E"/>
 <path d="M80 166 h60 M86 180 h48" stroke="#A97B45" stroke-width="4" stroke-linecap="round"/>
 <circle cx="104" cy="104" r="44" fill="#DDB27A"/>
 ${olhos(88,120,100,11,13)}${bochechas(72,136,120)}${sorriso(104,122)}
</g>`,
lesma: `<g class="corpo">
 <path class="cauda" d="M20 202 Q20 180 60 178 L150 172 L150 204 Z" fill="#B07A4A"/>
 <path d="M40 196 Q80 190 140 192" stroke="#C99466" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path class="orelha" d="M100 62 Q92 30 80 16 M140 62 Q150 30 164 16" stroke="#9C6A3E" stroke-width="7" fill="none" stroke-linecap="round"/>
 <circle cx="80" cy="16" r="10" fill="#9C6A3E"/><circle cx="164" cy="16" r="10" fill="#9C6A3E"/>
 <circle cx="80" cy="15" r="5" fill="#2B1E15"/><circle cx="164" cy="15" r="5" fill="#2B1E15"/>
 <circle cx="82" cy="12" r="2" fill="#fff"/><circle cx="166" cy="12" r="2" fill="#fff"/>
 <path d="M70 204 Q66 70 122 64 Q176 70 172 204 Z" fill="#C08552"/>
 <ellipse cx="96" cy="96" rx="10" ry="16" fill="#D9A273" opacity=".7"/>
 ${olhos(104,140,120,10,12)}${bochechas(90,156,140)}${sorriso(122,142)}
</g>`,
cigarra: `<g class="corpo">
 <path class="asa" d="M100 104 Q30 110 24 200 Q70 196 102 150 Z" fill="#E4F7F2" opacity=".75" stroke="#7FB8A4" stroke-width="3"/>
 <path class="asa" d="M120 104 Q190 110 196 200 Q150 196 118 150 Z" fill="#E4F7F2" opacity=".75" stroke="#7FB8A4" stroke-width="3"/>
 <path d="M60 140 L80 170 M160 140 L140 170" stroke="#7FB8A4" stroke-width="2"/>
 <path d="M92 180 L80 204 M128 180 L140 204" stroke="#5A4630" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="110" cy="160" rx="26" ry="42" fill="#7A6040"/>
 <path d="M90 150 h40 M90 168 h40 M94 186 h32" stroke="#5A4630" stroke-width="4" stroke-linecap="round"/>
 <ellipse cx="110" cy="80" rx="54" ry="42" fill="#6FA552"/>
 <circle cx="58" cy="70" r="12" fill="#5A4630"/><circle cx="162" cy="70" r="12" fill="#5A4630"/>
 ${olhos(92,128,78,11,13)}${bochechas(76,144,98)}${sorriso(110,100)}
</g>`,
zangao: `<g class="corpo">
 <ellipse class="asa" cx="44" cy="70" rx="30" ry="20" transform="rotate(-30 44 70)" fill="#E6F4FA" opacity=".85" stroke="#B9D3DE" stroke-width="2"/>
 <ellipse class="asa" cx="176" cy="70" rx="30" ry="20" transform="rotate(30 176 70)" fill="#E6F4FA" opacity=".85" stroke="#B9D3DE" stroke-width="2"/>
 <path d="M80 190 L74 204 M110 196 v8 M140 190 L146 204" stroke="#222" stroke-width="6" stroke-linecap="round"/>
 <circle cx="110" cy="120" r="88" fill="#FFC21A"/>
 <path d="M30 150 Q110 180 190 150 L180 172 Q110 204 40 172 Z" fill="#2A2A2A"/>
 <path d="M24 108 Q110 130 196 108 L198 92 Q110 110 22 92 Z" fill="#2A2A2A"/>
 <path d="M40 60 l-6 -6 M60 44 l-4 -8 M84 36 l-2 -8 M136 36 l2 -8 M160 44 l4 -8 M180 60 l6 -6" stroke="#E0A400" stroke-width="4" stroke-linecap="round"/>
 <path d="M90 36 Q80 14 70 10 M130 36 Q140 14 150 10" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>
 ${olhos(88,132,70,13,15)}${bochechas(66,154,86)}${sorriso(110,88)}
</g>`,
'bicho-de-conta': `<g class="corpo">
 <path d="M60 196 v8 M80 198 v6 M100 200 v4 M120 200 v4 M140 198 v6 M160 196 v8" stroke="#5E646B" stroke-width="5" stroke-linecap="round"/>
 <path class="cauda" d="M196 196 Q214 150 180 110 Q170 160 150 196 Z" fill="#8A9097"/>
 <path d="M30 198 Q30 110 110 104 Q190 110 190 198 Z" fill="#9AA0A7"/>
 <path d="M50 198 Q54 140 70 116 M76 198 Q78 132 90 108 M104 198 V104 M134 198 Q136 132 128 108 M160 198 Q162 140 150 114" stroke="#7A8088" stroke-width="5" fill="none"/>
 <path class="orelha" d="M84 52 Q66 26 52 24 M136 52 Q154 26 168 24" stroke="#5E646B" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="110" cy="92" r="44" fill="#B4BAC1"/>
 ${olhos(94,126,88,11,13)}${bochechas(78,142,108)}${sorriso(110,110)}
</g>`,
lagartixa: `<g class="corpo">
 <path class="cauda" d="M110 150 Q140 190 180 180 Q210 170 200 140" stroke="#BFAE8C" stroke-width="12" fill="none" stroke-linecap="round"/>
 <path d="M84 132 L56 120 L48 108 M136 132 L164 120 L172 108 M88 172 L60 190 L52 202 M132 172 L160 190 L168 202" stroke="#BFAE8C" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <circle cx="46" cy="106" r="6" fill="#CDBD9B"/><circle cx="174" cy="106" r="6" fill="#CDBD9B"/><circle cx="50" cy="204" r="6" fill="#CDBD9B"/><circle cx="170" cy="204" r="6" fill="#CDBD9B"/>
 <ellipse cx="110" cy="150" rx="22" ry="44" fill="#CDBD9B"/>
 <circle cx="104" cy="146" r="4" fill="#A8987A"/><circle cx="118" cy="164" r="4" fill="#A8987A"/>
 <ellipse cx="110" cy="82" rx="66" ry="40" fill="#D8C9AA"/>
 ${olhos(88,132,70,13,15)}${bochechas(70,150,94)}${sorriso(110,98)}
</g>`,
'besouro-veado': `<g class="corpo">
 <path d="M60 150 L34 140 M58 174 L30 184 M66 194 L46 204 M160 150 L186 140 M162 174 L190 184 M154 194 L174 204" stroke="#2A1A10" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="110" cy="164" rx="52" ry="42" fill="#3A2416"/>
 <path class="asa" d="M108 124 Q62 126 60 164 Q64 200 108 206 Z" fill="#5A3622"/>
 <path class="asa" d="M112 124 Q158 126 160 164 Q156 200 112 206 Z" fill="#5A3622"/>
 <path d="M80 72 Q40 60 36 20 Q50 30 54 44 Q60 30 66 36 Q62 52 86 60 Z" fill="#7A3A1E"/>
 <path d="M140 72 Q180 60 184 20 Q170 30 166 44 Q160 30 154 36 Q158 52 134 60 Z" fill="#7A3A1E"/>
 <ellipse cx="110" cy="96" rx="46" ry="36" fill="#7A5038"/>
 <ellipse cx="90" cy="76" rx="10" ry="5" fill="#8C6A50" opacity=".6"/>
 ${olhos(92,128,94,10,12)}${bochechas(76,144,112)}${sorriso(110,114,'#fff')}
</g>`,
tesourinha: `<g class="corpo">
 <path class="cauda" d="M100 180 Q60 196 92 214 M120 180 Q160 196 128 214" stroke="#4A2A18" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M86 140 L56 132 M84 160 L54 168 M134 140 L164 132 M136 160 L166 168" stroke="#6B4028" stroke-width="5" stroke-linecap="round"/>
 <rect x="86" y="110" width="48" height="76" rx="22" fill="#8C5634"/>
 <path d="M88 150 h44 M88 168 h44" stroke="#6B4028" stroke-width="4" stroke-linecap="round"/>
 <path class="asa" d="M88 116 h44 v22 Q110 146 88 138 Z" fill="#B07444"/>
 <path class="orelha" d="M90 40 Q72 14 54 12 M130 40 Q148 14 166 12" stroke="#5A3420" stroke-width="4" fill="none" stroke-linecap="round"/>
 <circle cx="110" cy="76" r="42" fill="#A0653C"/>
 ${olhos(94,126,72,11,13)}${bochechas(78,142,92)}${sorriso(110,94,'#fff')}
</g>`
});
