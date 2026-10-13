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
</g>`,
andorinha: `<g class="corpo">
 <path class="cauda" d="M150 160 L206 196 L176 166 L200 140 Z" fill="#1F2D6B"/>
 <ellipse cx="110" cy="162" rx="50" ry="34" fill="#2A3F8F"/>
 <ellipse cx="106" cy="172" rx="32" ry="22" fill="#FFFFFF"/>
 <path class="asa" d="M120 146 Q170 120 200 150 Q160 170 122 164 Z" fill="#1F2D6B"/>
 <path d="M98 194 L94 204 M120 194 L124 204" stroke="#3A3A3A" stroke-width="4" stroke-linecap="round"/>
 <circle cx="104" cy="86" r="52" fill="#2A3F8F"/>
 <ellipse cx="104" cy="122" rx="28" ry="14" fill="#E8463C"/>
 <ellipse cx="104" cy="88" rx="38" ry="30" fill="#3A55B0"/>
 ${olhos(86,122,82)}${bochechas(70,138,104)}
 <path d="M96 100 L112 100 L104 110 Z" fill="#2E2E2E"/>
</g>`,
melro: `<g class="corpo">
 <path class="cauda" d="M152 160 L196 150 L192 182 Z" fill="#1A1A1A"/>
 <ellipse cx="110" cy="162" rx="54" ry="38" fill="#2B2B2B"/>
 <path class="asa" d="M120 146 Q168 132 170 166 Q144 182 118 164 Z" fill="#1A1A1A"/>
 <path d="M96 196 L92 205 M124 196 L128 205" stroke="#F28C28" stroke-width="5" stroke-linecap="round"/>
 <circle cx="106" cy="86" r="54" fill="#333333"/>
 <circle cx="86" cy="84" r="16" fill="#F28C28"/><circle cx="126" cy="84" r="16" fill="#F28C28"/>
 ${olhos(86,126,84)}${bochechas(66,146,108)}
 <path d="M92 100 L120 100 L106 128 Z" fill="#FF8A1E"/>
</g>`,
pardal: `<g class="corpo">
 <path class="cauda" d="M152 164 L192 158 L186 184 Z" fill="#7A5230"/>
 <circle cx="110" cy="150" r="56" fill="#A87444"/>
 <ellipse cx="110" cy="166" rx="36" ry="30" fill="#E8D4B4"/>
 <path class="asa" d="M122 132 Q168 128 166 170 Q140 180 120 158 Z" fill="#7A5230"/>
 <path d="M134 140 L156 146 M132 152 L156 158 M134 164 L152 168" stroke="#4A3018" stroke-width="4" stroke-linecap="round"/>
 <path d="M98 198 L94 205 M122 198 L126 205" stroke="#C8925A" stroke-width="5" stroke-linecap="round"/>
 <circle cx="108" cy="86" r="50" fill="#B98552"/>
 <path d="M70 60 Q108 30 146 60 Q108 50 70 60 Z" fill="#7A5230"/>
 <path d="M76 100 Q108 122 140 100 Q108 140 76 100 Z" fill="#E8D4B4"/>
 ${olhos(88,128,84,10,12)}${bochechas(72,144,104)}
 <path d="M100 98 L116 98 L108 110 Z" fill="#4A3018"/>
</g>`,
rouxinol: `<g class="corpo">
 <path class="balanca" d="M30 40 V14 L44 10 V34" stroke="#3E7FD6" stroke-width="4" fill="none"/>
 <circle cx="26" cy="40" r="6" fill="#3E7FD6"/><circle cx="40" cy="34" r="6" fill="#3E7FD6"/>
 <path d="M184 30 V8" stroke="#E86F8A" stroke-width="4"/><circle cx="180" cy="30" r="6" fill="#E86F8A"/>
 <path d="M194 74 V54" stroke="#7FB040" stroke-width="4"/><circle cx="190" cy="74" r="6" fill="#7FB040"/>
 <path class="cauda" d="M150 162 L194 152 L190 184 Z" fill="#B07A45"/>
 <ellipse cx="110" cy="162" rx="52" ry="38" fill="#C9955E"/>
 <ellipse cx="108" cy="170" rx="32" ry="24" fill="#F2E3C6"/>
 <path class="asa" d="M122 146 Q166 134 168 166 Q144 180 120 162 Z" fill="#A87444"/>
 <path d="M96 196 L92 205 M124 196 L128 205" stroke="#C8925A" stroke-width="5" stroke-linecap="round"/>
 <circle cx="106" cy="88" r="52" fill="#D6A56E"/>
 ${olhos(86,124,80,9,11)}${bochechas(68,142,104)}
 <path d="M94 102 L118 102 L106 110 Z" fill="#8A5A33"/>
 <ellipse cx="106" cy="116" rx="9" ry="8" fill="#B05A74"/>
</g>`,
mocho: `<g class="corpo">
 <ellipse cx="110" cy="166" rx="46" ry="38" fill="#8C6A48"/>
 <ellipse cx="110" cy="172" rx="28" ry="26" fill="#E2CDA8"/>
 <path d="M98 164 h4 M118 164 h4 M108 178 h4 M98 188 h4 M118 188 h4" stroke="#8C6A48" stroke-width="4" stroke-linecap="round"/>
 <path class="asa" d="M66 140 Q50 170 66 198 Q82 180 80 150 Z" fill="#6E5034"/>
 <path class="asa" d="M154 140 Q170 170 154 198 Q138 180 140 150 Z" fill="#6E5034"/>
 <path d="M100 200 v5 M108 200 v5 M114 200 v5 M122 200 v5" stroke="#9A9A9A" stroke-width="4" stroke-linecap="round"/>
 <circle cx="110" cy="88" r="56" fill="#9C7650"/>
 <circle cx="88" cy="56" r="4" fill="#E2CDA8"/><circle cx="110" cy="48" r="4" fill="#E2CDA8"/><circle cx="132" cy="56" r="4" fill="#E2CDA8"/><circle cx="78" cy="122" r="4" fill="#E2CDA8"/><circle cx="142" cy="122" r="4" fill="#E2CDA8"/>
 <path d="M60 92 Q86 64 110 88 Q134 64 160 92 Q134 112 110 100 Q86 112 60 92 Z" fill="#F2E6CC"/>
 <circle cx="88" cy="88" r="17" fill="#FFD23F"/><circle cx="132" cy="88" r="17" fill="#FFD23F"/>
 ${olhos(88,132,88,10,12)}${bochechas(70,150,114)}
 <path d="M104 104 L116 104 L110 116 Z" fill="#6B6B6B"/>
</g>`,
garca: `<g class="corpo">
 <path d="M114 150 L110 202 M130 150 L134 202" stroke="#E2B32A" stroke-width="5" stroke-linecap="round"/>
 <path class="cauda" d="M160 138 L196 146 L170 154 Z" fill="#8E98A8"/>
 <ellipse cx="128" cy="134" rx="42" ry="24" fill="#B8C0CC"/>
 <path class="asa" d="M118 122 Q160 110 180 138 Q150 154 120 140 Z" fill="#8E98A8"/>
 <path d="M100 128 Q70 110 96 90 Q120 74 90 62" stroke="#E6EAF0" stroke-width="16" fill="none" stroke-linecap="round"/>
 <circle cx="76" cy="52" r="32" fill="#F2F4F8"/>
 <path d="M66 24 Q86 12 104 20" stroke="#2E2E2E" stroke-width="5" fill="none" stroke-linecap="round"/>
 ${olhos(64,90,50,7,9)}${bochechas(54,98,66)}
 <path d="M100 52 L168 60 L100 66 Z" fill="#FFD23F"/>
</g>`,
colibri: `<g class="corpo">
 <path class="asa" d="M92 110 Q40 40 20 70 Q40 110 92 124 Z" fill="#BFF0DA" opacity=".85"/>
 <path class="asa" d="M128 110 Q180 40 200 70 Q180 110 128 124 Z" fill="#BFF0DA" opacity=".85"/>
 <path class="cauda" d="M100 168 L92 204 L110 192 L128 204 L120 168 Z" fill="#147A5A"/>
 <ellipse cx="110" cy="146" rx="28" ry="32" fill="#1FA87A"/>
 <ellipse cx="110" cy="152" rx="16" ry="20" fill="#E6F7EF"/>
 <circle cx="110" cy="96" r="40" fill="#22B585"/>
 <ellipse cx="110" cy="126" rx="20" ry="8" fill="#E8463C"/>
 ${olhos(94,126,92,8,10)}${bochechas(82,138,108)}
 <path d="M118 104 L200 110 L118 114 Z" fill="#2E2E2E"/>
</g>`,
corvo: `<g class="corpo">
 <path class="cauda" d="M150 160 L200 150 L196 190 Z" fill="#14141E"/>
 <ellipse cx="110" cy="160" rx="62" ry="42" fill="#22222E"/>
 <path class="asa" d="M112 140 Q176 124 186 170 Q148 190 112 166 Z" fill="#14141E"/>
 <path d="M92 196 L86 205 M128 196 L134 205" stroke="#3A3A3A" stroke-width="6" stroke-linecap="round"/>
 <circle cx="100" cy="82" r="58" fill="#2C2C3A"/>
 <path d="M60 50 Q100 26 140 50" stroke="#4A4A66" stroke-width="5" fill="none" stroke-linecap="round"/>
 ${olhos(80,122,78)}${bochechas(60,140,104)}
 <path d="M88 96 Q140 86 170 112 Q136 124 88 116 Z" fill="#4A4A4A"/>
 <path d="M90 106 L160 110" stroke="#2E2E2E" stroke-width="2"/>
</g>`,
pega: `<g class="corpo">
 <path class="cauda" d="M146 160 L208 120 L214 134 L156 176 Z" fill="#2E5FA8"/>
 <ellipse cx="108" cy="162" rx="50" ry="36" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <path d="M60 150 Q80 130 110 136 Q100 160 66 176 Z" fill="#1A1A1A"/>
 <path class="asa" d="M112 142 Q160 128 168 162 Q140 182 112 166 Z" fill="#1A1A1A"/>
 <path d="M128 158 Q148 150 160 160" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round"/>
 <path d="M96 194 L92 205 M120 194 L124 205" stroke="#2E2E2E" stroke-width="5" stroke-linecap="round"/>
 <circle cx="100" cy="84" r="52" fill="#1A1A1A"/>
 <circle cx="80" cy="82" r="15" fill="#3A3A3A"/><circle cx="120" cy="82" r="15" fill="#3A3A3A"/>
 ${olhos(80,120,82)}${bochechas(62,138,104)}
 <path d="M90 98 L114 98 L102 116 Z" fill="#555555"/>
</g>`,
falcao: `<g class="corpo">
 <path class="cauda" d="M150 164 L190 170 L180 190 Z" fill="#4A5A78"/>
 <ellipse cx="110" cy="162" rx="48" ry="38" fill="#6F82A6"/>
 <ellipse cx="108" cy="170" rx="30" ry="26" fill="#F2EADA"/>
 <path d="M96 160 l4 4 M112 166 l4 4 M100 180 l4 4 M118 182 l4 4" stroke="#4A5A78" stroke-width="3" stroke-linecap="round"/>
 <path class="asa" d="M128 136 Q196 120 214 150 Q170 156 132 170 Z" fill="#4A5A78"/>
 <path d="M96 196 L92 205 M124 196 L128 205" stroke="#FFC21A" stroke-width="6" stroke-linecap="round"/>
 <circle cx="106" cy="86" r="52" fill="#7C90B4"/>
 <path d="M64 96 Q72 70 108 70 Q144 70 150 96 Q130 110 108 108 Q84 110 64 96 Z" fill="#F2EADA"/>
 <path d="M76 84 Q70 104 78 122 L90 118 Q84 100 88 86 Z M136 84 Q142 104 134 122 L122 118 Q128 100 124 86 Z" fill="#1E1E28"/>
 <circle cx="90" cy="82" r="14" fill="#FFC21A"/><circle cx="124" cy="82" r="14" fill="#FFC21A"/>
 ${olhos(90,124,82,9,11)}${bochechas(78,136,106)}
 <path d="M98 96 L116 96 Q118 110 104 114 Z" fill="#3A3A3A"/>
</g>`,
abutre: `<g class="corpo">
 <path class="cauda" d="M150 170 L190 174 L178 194 Z" fill="#4A3A30"/>
 <path class="asa" d="M60 120 Q10 150 30 196 Q60 180 70 150 Z" fill="#4A3A30"/>
 <path class="asa" d="M160 120 Q210 150 190 196 Q160 180 150 150 Z" fill="#4A3A30"/>
 <ellipse cx="110" cy="164" rx="52" ry="40" fill="#6B5444"/>
 <path d="M90 196 L84 205 M130 196 L136 205" stroke="#C8A890" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="110" cy="130" rx="50" ry="20" fill="#FFFFFF"/>
 <circle cx="70" cy="128" r="14" fill="#FFFFFF"/><circle cx="150" cy="128" r="14" fill="#FFFFFF"/><circle cx="90" cy="140" r="14" fill="#FFFFFF"/><circle cx="130" cy="140" r="14" fill="#FFFFFF"/>
 <rect x="94" y="96" width="32" height="34" rx="14" fill="#F2A0A8"/>
 <circle cx="110" cy="72" r="44" fill="#F6B2B8"/>
 ${olhos(92,128,68,9,11)}${bochechas(78,142,88)}
 <path d="M98 84 L122 84 Q124 100 110 108 Q96 100 98 84 Z" fill="#E8D8A0"/>
 <path d="M110 100 Q112 108 106 110" stroke="#8A7A50" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>`,
arara: `<g class="corpo">
 <g class="cauda"><path d="M120 160 L150 214 L166 208 L136 156 Z" fill="#3E7FD6"/><path d="M104 160 L120 216 L136 214 L120 156 Z" fill="#E8463C"/></g>
 <ellipse cx="110" cy="150" rx="40" ry="38" fill="#E8463C"/>
 <path class="asa" d="M120 130 Q166 132 162 186 Q132 182 118 156 Z" fill="#FFD23F"/>
 <path d="M140 168 Q156 172 160 186 Q144 186 136 176 Z" fill="#3E7FD6"/>
 <path d="M90 182 L86 192 M110 184 L112 194" stroke="#6B6B6B" stroke-width="5" stroke-linecap="round"/>
 <circle cx="104" cy="82" r="52" fill="#F04A3C"/>
 <ellipse cx="84" cy="88" rx="22" ry="20" fill="#FFFFFF"/>
 <path d="M70 92 h12 M72 100 h12" stroke="#2E2E2E" stroke-width="2"/>
 ${olhos(86,128,80,9,11)}${bochechas(70,146,104)}
 <path d="M118 94 Q156 92 150 130 Q136 112 116 114 Z" fill="#3A3A3A"/>
 <path d="M114 112 Q128 122 138 116" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>`,
cacatua: `<g class="corpo">
 <g class="orelha"><path d="M96 46 Q70 6 90 4 Q100 24 108 42 Z" fill="#FFD23F"/><path d="M106 42 Q100 -2 120 4 Q118 24 116 42 Z" fill="#FFD23F"/><path d="M116 44 Q132 4 148 14 Q132 28 124 46 Z" fill="#FFE27A"/></g>
 <path class="cauda" d="M146 168 L184 178 L170 198 Z" fill="#F2F2F2"/>
 <ellipse cx="110" cy="164" rx="48" ry="38" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <path class="asa" d="M120 146 Q164 140 164 178 Q138 186 118 166 Z" fill="#F2F2F2" stroke="#DADADA" stroke-width="2"/>
 <path d="M94 198 L90 205 M124 198 L128 205" stroke="#8A8A8A" stroke-width="5" stroke-linecap="round"/>
 <circle cx="110" cy="94" r="52" fill="#FFFFFF" stroke="#DADADA" stroke-width="2"/>
 <ellipse cx="74" cy="104" rx="10" ry="7" fill="#FFE27A" opacity=".7"/>
 ${olhos(88,128,90)}${bochechas(70,150,112)}
 <path d="M96 104 Q110 96 124 104 Q122 126 104 130 Q96 120 96 104 Z" fill="#3A3A3A"/>
</g>`,
perdiz: `<g class="corpo">
 <path class="cauda" d="M156 160 L188 150 L184 174 Z" fill="#B07A45"/>
 <circle cx="110" cy="148" r="56" fill="#A88A6A"/>
 <path d="M70 144 l10 -10 M66 162 l10 -10 M150 144 l-10 -10 M154 162 l-10 -10" stroke="#8A3A22" stroke-width="5" stroke-linecap="round"/>
 <path class="asa" d="M124 132 Q166 130 166 168 Q140 178 122 158 Z" fill="#8A6A4A"/>
 <path d="M96 198 L92 205 M124 198 L128 205" stroke="#E8463C" stroke-width="5" stroke-linecap="round"/>
 <circle cx="108" cy="86" r="48" fill="#B89878"/>
 <path d="M68 92 Q70 60 108 58 Q146 60 148 92 Q148 112 108 116 Q68 112 68 92 Z" fill="#F2A65A"/>
 <path d="M68 100 Q74 122 108 124 Q142 122 148 100 Q142 132 108 134 Q74 132 68 100 Z" fill="#1E1E1E"/>
 <circle cx="88" cy="84" r="13" fill="#FFFFFF"/><circle cx="128" cy="84" r="13" fill="#FFFFFF"/>
 ${olhos(88,128,84,9,11)}
 <circle cx="88" cy="84" r="13" fill="none" stroke="#E8463C" stroke-width="3"/><circle cx="128" cy="84" r="13" fill="none" stroke="#E8463C" stroke-width="3"/>
 ${bochechas(74,142,104)}
 <path d="M100 98 L116 98 L108 110 Z" fill="#E8463C"/>
</g>`
});
