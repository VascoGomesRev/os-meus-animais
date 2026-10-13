'use strict';
Object.assign(DESENHOS, {
passaro: `<g class="corpo">
 <path class="cauda" d="M150 160 L192 140 L186 176 Z" fill="#3E7FD6"/>
 <ellipse cx="110" cy="160" rx="50" ry="38" fill="#5AA0F2"/>
 <ellipse cx="110" cy="170" rx="30" ry="22" fill="#DCEBFF"/>
 <path class="asa" d="M128 142 Q166 130 168 164 Q146 178 126 162 Z" fill="#3E7FD6"/>
 <path d="M96 192 L92 204 M124 192 L128 204" stroke="#F28C28" stroke-width="5" stroke-linecap="round"/>
 <circle cx="108" cy="88" r="56" fill="#6CB0FA"/>
 <path d="M100 34 Q104 14 116 22 Q110 30 112 36 Z" fill="#3E7FD6"/>
 ${olhos(86,130,84)}${bochechas(66,150,106)}
 <path d="M98 104 L122 104 L110 120 Z" fill="#FFB020"/>
</g>`,
pomba: `<g class="corpo">
 <path class="cauda" d="M152 168 L194 156 L190 186 Z" fill="#7C86A0"/>
 <ellipse cx="110" cy="162" rx="58" ry="40" fill="#A9B3CC"/>
 <ellipse cx="96" cy="140" rx="34" ry="16" fill="#8FD3B8" opacity=".8"/>
 <path class="asa" d="M120 146 Q170 134 172 168 Q144 186 118 166 Z" fill="#8E98B4"/>
 <path d="M140 160 L160 158 M138 168 L158 168" stroke="#4A5068" stroke-width="4" stroke-linecap="round"/>
 <ellipse cx="94" cy="201" rx="12" ry="5" fill="#E86F8A"/><ellipse cx="126" cy="201" rx="12" ry="5" fill="#E86F8A"/>
 <circle cx="104" cy="86" r="52" fill="#B7C0D8"/>
 ${olhos(84,124,82)}${bochechas(64,144,104)}
 <path d="M96 100 L112 100 L104 116 Z" fill="#E86F8A"/>
 <ellipse cx="104" cy="100" rx="8" ry="3" fill="#FFFFFF"/>
</g>`,
gaivota: `<g class="corpo">
 <path class="cauda" d="M150 160 L190 150 L182 176 Z" fill="#2E2E2E"/>
 <ellipse cx="110" cy="162" rx="54" ry="36" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <path class="asa" d="M88 140 Q140 120 184 150 Q150 176 96 160 Z" fill="#9EA7B3"/>
 <path d="M170 146 L186 150 L176 162 Z" fill="#2E2E2E"/>
 <path d="M96 194 L94 204 M124 194 L126 204" stroke="#F2B32A" stroke-width="5" stroke-linecap="round"/>
 <circle cx="102" cy="86" r="52" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 ${olhos(82,120,80,9,11)}${bochechas(64,136,100)}
 <path d="M100 98 L150 106 Q148 116 136 114 L100 112 Z" fill="#FFD23F"/>
 <circle cx="138" cy="109" r="4" fill="#E8463C"/>
</g>`,
coruja: `<g class="corpo">
 <ellipse cx="110" cy="158" rx="58" ry="46" fill="#8A5A33"/>
 <ellipse cx="110" cy="168" rx="36" ry="30" fill="#E8C9A0"/>
 <path d="M96 156 q4 5 8 0 M116 156 q4 5 8 0 M106 172 q4 5 8 0" stroke="#8A5A33" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path class="asa" d="M58 128 Q36 160 56 194 Q74 176 72 140 Z" fill="#6B4226"/>
 <path class="asa" d="M162 128 Q184 160 164 194 Q146 176 148 140 Z" fill="#6B4226"/>
 <path d="M96 198 l-4 6 M104 198 v7 M116 198 v7 M124 198 l4 6" stroke="#F2B32A" stroke-width="4" stroke-linecap="round"/>
 <path class="orelha" d="M54 50 L50 14 L82 38 Z" fill="#8A5A33"/>
 <path class="orelha" d="M166 50 L170 14 L138 38 Z" fill="#8A5A33"/>
 <ellipse cx="110" cy="80" rx="62" ry="52" fill="#A06A3E"/>
 <circle cx="84" cy="80" r="26" fill="#FFF3DC"/><circle cx="136" cy="80" r="26" fill="#FFF3DC"/>
 ${olhos(84,136,80,17,19)}
 ${bochechas(62,158,110)}
 <path d="M102 100 L118 100 L110 118 Z" fill="#F2B32A"/>
</g>`,
cisne: `<g class="corpo">
 <path class="cauda" d="M160 160 Q196 140 190 176 Z" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <ellipse cx="124" cy="170" rx="62" ry="34" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <path class="asa" d="M110 156 Q150 128 182 158 Q150 186 112 172 Z" fill="#EEF2F7"/>
 <path d="M64 170 Q40 140 62 110 Q84 84 70 62" stroke="#FFFFFF" stroke-width="24" fill="none" stroke-linecap="round"/>
 <path d="M64 170 Q40 140 62 110 Q84 84 70 62" stroke="#DADADA" stroke-width="2" fill="none" opacity="0"/>
 <path d="M56 192 Q110 208 176 194" stroke="#7FC8F0" stroke-width="6" fill="none" stroke-linecap="round"/>
 <circle cx="90" cy="62" r="44" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <path d="M90 26 Q108 16 120 32" stroke="#C9A0E0" stroke-width="5" fill="none" stroke-linecap="round"/>
 ${olhos(74,108,58,8,10)}${bochechas(60,120,78)}
 <path d="M112 70 L146 76 Q140 86 112 82 Z" fill="#F28C28"/>
 <path d="M108 66 L118 70 L110 84 Z" fill="#2E2E2E"/>
</g>`,
pelicano: `<g class="corpo">
 <path class="cauda" d="M150 164 L186 150 L180 180 Z" fill="#E6E6E6"/>
 <ellipse cx="116" cy="166" rx="54" ry="34" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <path class="asa" d="M112 148 Q160 132 180 164 Q150 184 114 168 Z" fill="#B8C2CC"/>
 <path d="M104 194 L100 204 M130 194 L134 204" stroke="#F28C28" stroke-width="5" stroke-linecap="round"/>
 <circle cx="96" cy="76" r="48" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <path d="M92 30 Q100 14 112 26" stroke="#FFE07A" stroke-width="6" fill="none" stroke-linecap="round"/>
 ${olhos(78,112,70,9,11)}${bochechas(60,128,90)}
 <path d="M100 92 L196 98 L192 106 L104 104 Z" fill="#FFB020"/>
 <path d="M104 104 L192 106 Q170 156 120 146 Q100 134 104 104 Z" fill="#FFD23F"/>
</g>`,
flamingo: `<g class="corpo">
 <path d="M112 168 L112 204" stroke="#E85F8C" stroke-width="5" stroke-linecap="round"/>
 <path d="M118 166 L130 186 L112 186" stroke="#E85F8C" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
 <path class="cauda" d="M150 140 L186 128 L176 156 Z" fill="#F06C9B"/>
 <ellipse cx="122" cy="146" rx="46" ry="28" fill="#FF8FB3"/>
 <path class="asa" d="M112 132 Q150 118 168 146 Q142 162 114 150 Z" fill="#F06C9B"/>
 <path d="M86 150 Q62 130 80 106 Q98 86 86 70" stroke="#FF8FB3" stroke-width="16" fill="none" stroke-linecap="round"/>
 <circle cx="90" cy="58" r="40" fill="#FFA3C2"/>
 ${olhos(74,106,54,8,10)}${bochechas(60,118,72)}
 <path d="M112 64 L140 70 Q146 82 136 92 L130 80 L112 78 Z" fill="#FFFFFF"/>
 <path d="M136 72 Q146 82 136 92 L132 80 Z" fill="#2E2E2E"/>
</g>`,
avestruz: `<g class="corpo">
 <path d="M96 168 L90 200 M126 168 L132 200" stroke="#F2B8A0" stroke-width="8" stroke-linecap="round"/>
 <ellipse cx="86" cy="202" rx="12" ry="5" fill="#E09A80"/><ellipse cx="136" cy="202" rx="12" ry="5" fill="#E09A80"/>
 <path class="cauda" d="M148 132 Q186 110 190 140 Q176 150 154 150 Z" fill="#FFFFFF"/>
 <ellipse cx="112" cy="150" rx="52" ry="30" fill="#3A3A3A"/>
 <path class="asa" d="M108 134 Q150 118 166 150 Q140 166 110 152 Z" fill="#262626"/>
 <path d="M100 126 L102 80" stroke="#F2B8A0" stroke-width="18" stroke-linecap="round"/>
 <circle cx="104" cy="58" r="40" fill="#F2B8A0"/>
 <path d="M94 20 q4 -8 8 0 q4 -8 8 0" stroke="#7A6A60" stroke-width="3" fill="none"/>
 ${olhos(88,120,54,10,13)}${bochechas(72,136,74)}
 <ellipse cx="104" cy="82" rx="18" ry="8" fill="#E8A040"/>
 <path d="M88 82 Q104 88 120 82" stroke="#B87020" stroke-width="2" fill="none"/>
</g>`,
tucano: `<g class="corpo">
 <path class="cauda" d="M98 166 L92 204 L116 204 Z" fill="#1E1E1E"/>
 <ellipse cx="96" cy="150" rx="40" ry="42" fill="#262626"/>
 <ellipse cx="94" cy="150" rx="22" ry="18" fill="#FFFFFF"/>
 <path class="asa" d="M108 130 Q140 140 132 180 Q110 176 106 150 Z" fill="#111111"/>
 <path d="M80 190 L76 204 M100 190 L104 204" stroke="#4A7FD0" stroke-width="5" stroke-linecap="round"/>
 <circle cx="84" cy="80" r="44" fill="#262626"/>
 <ellipse cx="80" cy="86" rx="28" ry="26" fill="#FFF2A8"/>
 ${olhos(72,98,74,9,11)}${bochechas(60,104,98)}
 <path d="M110 66 Q170 48 206 84 Q170 112 112 102 Z" fill="#FF8C1A"/>
 <path d="M112 84 Q170 80 206 84 Q170 112 112 102 Z" fill="#FFD23F"/>
 <path d="M196 74 Q206 78 206 84 L194 88 Z" fill="#E8463C"/>
 <path d="M110 66 L118 102" stroke="#3FB060" stroke-width="5"/>
</g>`,
papagaio: `<g class="corpo">
 <path class="cauda" d="M100 176 L92 214 L112 208 L118 176 Z" fill="#E8463C"/>
 <path d="M112 176 L120 212 L130 204 L124 176 Z" fill="#3E7FD6"/>
 <ellipse cx="110" cy="160" rx="46" ry="38" fill="#3FB060"/>
 <path class="asa" d="M124 132 Q164 142 158 186 Q132 182 124 156 Z" fill="#2A8C46"/>
 <path d="M138 168 L156 172 M134 178 L154 184" stroke="#3E7FD6" stroke-width="5" stroke-linecap="round"/>
 <path d="M92 194 l-6 8 M100 196 v8 M120 196 v8 M128 194 l6 8" stroke="#555555" stroke-width="4" stroke-linecap="round"/>
 <circle cx="104" cy="84" r="52" fill="#E8463C"/>
 <ellipse cx="84" cy="84" rx="22" ry="20" fill="#FFFFFF"/>
 ${olhos(84,126,80,9,11)}${bochechas(66,140,102)}
 <path d="M118 92 Q150 86 150 112 Q146 124 134 124 Q140 108 118 108 Z" fill="#3A3A3A"/>
 <path d="M118 106 Q132 108 134 122 Q122 122 118 112 Z" fill="#555555"/>
 <path d="M100 32 Q106 18 116 30" stroke="#FFD23F" stroke-width="6" fill="none" stroke-linecap="round"/>
</g>`,
aguia: `<g class="corpo">
 <path class="cauda" d="M98 176 L92 206 L128 206 L122 176 Z" fill="#FFFFFF"/>
 <ellipse cx="110" cy="158" rx="50" ry="40" fill="#7A4A26"/>
 <path class="asa" d="M60 130 Q20 150 30 196 Q60 184 74 150 Z" fill="#5E3519"/>
 <path class="asa" d="M160 130 Q200 150 190 196 Q160 184 146 150 Z" fill="#5E3519"/>
 <path d="M96 192 l-6 10 M104 194 v10 M116 194 v10 M124 192 l6 10" stroke="#F2B32A" stroke-width="5" stroke-linecap="round"/>
 <circle cx="110" cy="80" r="56" fill="#FFFFFF"/>
 <path d="M60 64 Q110 50 160 64" stroke="#7A4A26" stroke-width="5" fill="none" opacity="0"/>
 <path d="M70 66 L100 74 M150 66 L120 74" stroke="#5E3519" stroke-width="5" stroke-linecap="round"/>
 ${olhos(88,132,84,10,12)}${bochechas(66,154,106)}
 <path d="M96 98 Q110 90 126 98 Q132 112 116 130 Q114 116 100 112 Z" fill="#FFB020"/>
</g>`,
'pica-pau': `<g class="corpo">
 <path class="cauda" d="M100 176 L94 208 L114 200 Z" fill="#2E2E2E"/>
 <ellipse cx="104" cy="160" rx="44" ry="38" fill="#2E2E2E"/>
 <ellipse cx="100" cy="168" rx="24" ry="22" fill="#FFFFFF"/>
 <path class="asa" d="M120 136 Q156 146 150 182 Q126 180 120 156 Z" fill="#1E1E1E"/>
 <path d="M132 150 h10 M130 162 h12 M132 172 h10" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
 <path d="M90 194 L86 204 M114 194 L118 204" stroke="#777777" stroke-width="5" stroke-linecap="round"/>
 <circle cx="98" cy="84" r="50" fill="#FFFFFF"/>
 <path d="M50 76 Q56 26 104 28 Q146 30 148 70 Q120 48 92 54 Q66 58 50 76 Z" fill="#E8463C"/>
 <path d="M70 26 L100 6 L104 30 Z" fill="#E8463C"/>
 ${olhos(80,118,80,9,11)}${bochechas(64,132,100)}
 <path d="M138 84 L196 92 L138 100 Z" fill="#7A6A60"/>
</g>`,
pavao: `<g class="corpo">
 <g class="cauda">
  <path d="M110 160 L14 60 Q30 20 70 18 Z" fill="#2E9E78"/>
  <path d="M110 160 L70 14 Q110 0 150 14 Z" fill="#3FB08A"/>
  <path d="M110 160 L150 18 Q190 20 206 60 Z" fill="#2E9E78"/>
  <path d="M110 160 L4 110 Q2 80 14 60 Z" fill="#3FB08A"/>
  <path d="M110 160 L206 60 Q218 80 216 110 Z" fill="#3FB08A"/>
  <circle cx="40" cy="48" r="9" fill="#3E7FD6"/><circle cx="40" cy="48" r="4" fill="#FFD23F"/>
  <circle cx="110" cy="18" r="9" fill="#3E7FD6"/><circle cx="110" cy="18" r="4" fill="#FFD23F"/>
  <circle cx="180" cy="48" r="9" fill="#3E7FD6"/><circle cx="180" cy="48" r="4" fill="#FFD23F"/>
  <circle cx="16" cy="90" r="9" fill="#3E7FD6"/><circle cx="16" cy="90" r="4" fill="#FFD23F"/>
  <circle cx="204" cy="90" r="9" fill="#3E7FD6"/><circle cx="204" cy="90" r="4" fill="#FFD23F"/>
 </g>
 <ellipse cx="110" cy="166" rx="34" ry="32" fill="#2A5FC0"/>
 <path class="asa" d="M120 150 Q148 156 144 186 Q124 184 118 166 Z" fill="#1E4A9A"/>
 <path d="M98 194 L94 204 M122 194 L126 204" stroke="#8A7A70" stroke-width="5" stroke-linecap="round"/>
 <circle cx="110" cy="102" r="40" fill="#3E7FD6"/>
 <path d="M100 62 L94 46 M110 62 V44 M120 62 L126 46" stroke="#2A5FC0" stroke-width="3"/>
 <circle cx="94" cy="44" r="4" fill="#2E9E78"/><circle cx="110" cy="42" r="4" fill="#2E9E78"/><circle cx="126" cy="44" r="4" fill="#2E9E78"/>
 ${olhos(94,126,98,9,11)}${bochechas(80,140,116)}
 <path d="M104 112 L116 112 L110 124 Z" fill="#E8C9A0"/>
</g>`,
cegonha: `<g class="corpo">
 <path d="M100 160 L96 202 M122 160 L126 202" stroke="#E8463C" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="90" cy="203" rx="10" ry="4" fill="#E8463C"/><ellipse cx="132" cy="203" rx="10" ry="4" fill="#E8463C"/>
 <path class="cauda" d="M150 136 L184 132 L176 154 Z" fill="#2E2E2E"/>
 <ellipse cx="114" cy="140" rx="46" ry="28" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <path class="asa" d="M110 126 Q156 112 180 140 Q150 162 112 148 Z" fill="#2E2E2E"/>
 <path d="M96 120 L94 92" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>
 <circle cx="94" cy="66" r="40" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 ${olhos(78,110,60,8,10)}${bochechas(64,122,80)}
 <path d="M116 68 L190 84 L116 82 Z" fill="#E8463C"/>
</g>`
});
