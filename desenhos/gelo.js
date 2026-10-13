'use strict';
Object.assign(DESENHOS, {
'urso-polar': `<g class="corpo">
 <ellipse class="cauda" cx="152" cy="176" rx="10" ry="9" fill="#E6EEF5"/>
 <ellipse cx="110" cy="168" rx="50" ry="32" fill="#F7FAFD" stroke="#D5E0EA" stroke-width="2"/><ellipse cx="110" cy="176" rx="28" ry="18" fill="#FFFFFF"/>
 <ellipse cx="86" cy="197" rx="16" ry="9" fill="#EEF3F8" stroke="#D5E0EA" stroke-width="2"/><ellipse cx="134" cy="197" rx="16" ry="9" fill="#EEF3F8" stroke="#D5E0EA" stroke-width="2"/>
 <g class="orelha"><circle cx="64" cy="48" r="17" fill="#F7FAFD" stroke="#D5E0EA" stroke-width="2"/><circle cx="64" cy="48" r="8" fill="#C9D8E6"/></g>
 <g class="orelha"><circle cx="156" cy="48" r="17" fill="#F7FAFD" stroke="#D5E0EA" stroke-width="2"/><circle cx="156" cy="48" r="8" fill="#C9D8E6"/></g>
 <ellipse cx="110" cy="92" rx="62" ry="54" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/>
 ${olhos(88,132,84)}${bochechas(66,154,106)}
 <ellipse cx="110" cy="114" rx="24" ry="17" fill="#EAF1F7"/>
 <ellipse cx="110" cy="106" rx="10" ry="7" fill="#2B1B12"/>
 ${sorriso(110,118)}
 <ellipse cx="88" cy="200" rx="4" ry="2.5" fill="#B9C8D6"/><ellipse cx="132" cy="200" rx="4" ry="2.5" fill="#B9C8D6"/>
</g>`,
pinguim: `<g class="corpo">
 <ellipse cx="110" cy="128" rx="62" ry="72" fill="#2F3A4F"/>
 <path class="asa" d="M52 112 Q30 140 38 168 Q54 160 60 132 Z" fill="#26304A"/>
 <path class="asa" d="M168 112 Q190 140 182 168 Q166 160 160 132 Z" fill="#26304A"/>
 <ellipse cx="110" cy="150" rx="42" ry="48" fill="#FFFFFF"/>
 <path d="M60 80 Q66 46 110 44 Q154 46 160 80 Q150 120 110 112 Q70 120 60 80 Z" fill="#FFFFFF"/>
 <path d="M60 80 Q72 64 92 70 Q100 52 110 62 Q120 52 128 70 Q148 64 160 80 Q160 40 110 36 Q60 40 60 80 Z" fill="#2F3A4F"/>
 ${olhos(90,130,86,10,12)}${bochechas(72,148,104)}
 <path d="M98 98 L122 98 L110 112 Z" fill="#FFA726"/>
 <ellipse cx="92" cy="200" rx="17" ry="7" fill="#FF9F1C"/><ellipse cx="128" cy="200" rx="17" ry="7" fill="#FF9F1C"/>
</g>`,
foca: `<g class="corpo">
 <path class="cauda" d="M156 178 Q186 168 198 186 Q184 200 160 194 Z" fill="#8E9AA8"/>
 <ellipse cx="114" cy="170" rx="54" ry="32" fill="#A7B3C1"/><ellipse cx="110" cy="180" rx="32" ry="18" fill="#CBD4DE"/>
 <path class="asa" d="M70 168 Q50 190 66 200 Q82 194 86 176 Z" fill="#8E9AA8"/>
 <path class="asa" d="M150 168 Q170 190 154 200 Q138 194 134 176 Z" fill="#8E9AA8"/>
 <ellipse cx="110" cy="92" rx="60" ry="56" fill="#B4BFCC"/>
 <circle cx="80" cy="62" r="3" fill="#8E9AA8"/><circle cx="140" cy="56" r="4" fill="#8E9AA8"/><circle cx="148" cy="70" r="2.5" fill="#8E9AA8"/>
 ${olhos(86,134,86,13,15)}${bochechas(64,156,110)}
 <ellipse cx="110" cy="112" rx="20" ry="13" fill="#DDE4EB"/>
 <ellipse cx="110" cy="104" rx="8" ry="5.5" fill="#2B1B12"/>
 ${sorriso(110,116)}
</g>`,
morsa: `<g class="corpo">
 <path class="cauda" d="M158 180 Q190 170 200 190 Q184 202 160 196 Z" fill="#8A5A3C"/>
 <ellipse cx="110" cy="166" rx="62" ry="38" fill="#B9825C"/>
 <path class="asa" d="M60 170 Q38 192 56 202 Q74 196 78 178 Z" fill="#8A5A3C"/>
 <path class="asa" d="M160 170 Q182 192 164 202 Q146 196 142 178 Z" fill="#8A5A3C"/>
 <ellipse cx="110" cy="86" rx="64" ry="54" fill="#C8916A"/>
 ${olhos(84,136,70,10,12)}
 <path d="M90 116 Q86 160 96 176 Q102 150 102 116 Z" fill="#FFF8E7" stroke="#E6D8B8" stroke-width="2"/>
 <path d="M130 116 Q134 160 124 176 Q118 150 118 116 Z" fill="#FFF8E7" stroke="#E6D8B8" stroke-width="2"/>
 <ellipse cx="96" cy="106" rx="20" ry="16" fill="#E3B48E"/><ellipse cx="124" cy="106" rx="20" ry="16" fill="#E3B48E"/>
 <path d="M80 100 L56 94 M80 108 L54 110 M82 116 L58 124 M140 100 L164 94 M140 108 L166 110 M138 116 L162 124" stroke="#6B4630" stroke-width="2.5" stroke-linecap="round"/>
 <circle cx="90" cy="102" r="2" fill="#6B4630"/><circle cx="98" cy="110" r="2" fill="#6B4630"/><circle cx="122" cy="110" r="2" fill="#6B4630"/><circle cx="130" cy="102" r="2" fill="#6B4630"/>
 <ellipse cx="110" cy="92" rx="9" ry="6" fill="#5A3A26"/>
 ${bochechas(60,160,92)}
</g>`,
rena: `<g class="corpo">
 <path d="M80 44 Q70 24 60 10 M72 30 Q58 30 50 22 M66 20 Q74 12 78 4" stroke="#8B5A2B" stroke-width="7" stroke-linecap="round" fill="none"/>
 <path d="M140 44 Q150 24 160 10 M148 30 Q162 30 170 22 M154 20 Q146 12 142 4" stroke="#8B5A2B" stroke-width="7" stroke-linecap="round" fill="none"/>
 <ellipse class="cauda" cx="150" cy="160" rx="9" ry="7" fill="#FFFFFF"/>
 <ellipse cx="110" cy="166" rx="40" ry="28" fill="#A86F45"/><ellipse cx="110" cy="174" rx="22" ry="15" fill="#F1DCC4"/>
 <rect x="80" y="180" width="14" height="22" rx="6" fill="#A86F45"/><rect x="126" y="180" width="14" height="22" rx="6" fill="#A86F45"/>
 <ellipse cx="87" cy="201" rx="9" ry="5" fill="#4A3020"/><ellipse cx="133" cy="201" rx="9" ry="5" fill="#4A3020"/>
 <g class="orelha"><ellipse cx="54" cy="74" rx="20" ry="9" transform="rotate(-25 54 74)" fill="#A86F45"/></g>
 <g class="orelha"><ellipse cx="166" cy="74" rx="20" ry="9" transform="rotate(25 166 74)" fill="#A86F45"/></g>
 <ellipse cx="110" cy="90" rx="54" ry="50" fill="#C08457"/>
 ${olhos(90,130,82,10,12)}${bochechas(70,150,104)}
 <ellipse cx="110" cy="116" rx="26" ry="18" fill="#F1DCC4"/>
 <circle cx="110" cy="106" r="10" fill="#E53935"/><circle cx="106" cy="102" r="3" fill="#FF8A80"/>
 ${sorriso(110,122)}
</g>`,
orca: `<g class="corpo">
 <circle class="bolha" cx="40" cy="40" r="7" fill="none" stroke="#7FC3EA" stroke-width="3"/><circle class="bolha" cx="28" cy="64" r="4" fill="none" stroke="#7FC3EA" stroke-width="3"/>
 <path class="cauda-peixe" d="M160 160 Q196 140 206 150 Q196 170 206 192 Q190 196 162 180 Z" fill="#1E2430"/>
 <path d="M104 44 Q112 6 128 4 Q122 30 132 50 Z" fill="#1E2430"/>
 <ellipse cx="110" cy="120" rx="76" ry="70" fill="#1E2430"/>
 <ellipse cx="110" cy="150" rx="50" ry="40" fill="#FFFFFF"/>
 <ellipse cx="78" cy="92" rx="18" ry="11" transform="rotate(-15 78 92)" fill="#FFFFFF"/><ellipse cx="142" cy="92" rx="18" ry="11" transform="rotate(15 142 92)" fill="#FFFFFF"/>
 <path class="asa" d="M44 150 Q20 176 32 196 Q52 186 60 162 Z" fill="#1E2430"/>
 <path class="asa" d="M176 150 Q200 176 188 196 Q168 186 160 162 Z" fill="#1E2430"/>
 ${olhos(86,134,108,10,12)}${bochechas(70,150,130)}
 ${sorriso(110,138)}
</g>`,
narval: `<g class="corpo">
 <circle class="bolha" cx="186" cy="40" r="6" fill="none" stroke="#7FC3EA" stroke-width="3"/><circle class="bolha" cx="198" cy="64" r="4" fill="none" stroke="#7FC3EA" stroke-width="3"/>
 <path d="M106 64 L110 2 L114 64 Z" fill="#FFF6DD" stroke="#D8C79A" stroke-width="2"/>
 <path d="M107 50 L113 46 M107 36 L113 32 M108 22 L112 18" stroke="#C9B57E" stroke-width="2"/>
 <path class="cauda-peixe" d="M160 170 Q196 150 206 160 Q196 178 206 200 Q190 200 162 188 Z" fill="#9FB0BF"/>
 <ellipse cx="110" cy="130" rx="72" ry="66" fill="#BCCAD6"/>
 <ellipse cx="110" cy="160" rx="44" ry="32" fill="#E4ECF2"/>
 <circle cx="70" cy="150" r="4" fill="#8B9DAE"/><circle cx="150" cy="140" r="5" fill="#8B9DAE"/><circle cx="140" cy="170" r="3" fill="#8B9DAE"/><circle cx="80" cy="176" r="3" fill="#8B9DAE"/>
 <path class="asa" d="M46 156 Q24 180 36 198 Q54 188 62 166 Z" fill="#9FB0BF"/>
 <path class="asa" d="M174 156 Q196 180 184 198 Q166 188 158 166 Z" fill="#9FB0BF"/>
 ${olhos(88,132,116,10,12)}${bochechas(70,150,136)}
 ${sorriso(110,142)}
</g>`,
beluga: `<g class="corpo">
 <circle class="bolha" cx="34" cy="40" r="7" fill="none" stroke="#7FC3EA" stroke-width="3"/><circle class="bolha" cx="190" cy="56" r="5" fill="none" stroke="#7FC3EA" stroke-width="3"/>
 <path class="cauda-peixe" d="M158 168 Q196 148 206 158 Q196 176 206 198 Q190 200 160 186 Z" fill="#E3EBF1"/>
 <ellipse cx="110" cy="146" rx="70" ry="54" fill="#F4F8FB" stroke="#D5E0EA" stroke-width="2"/>
 <ellipse cx="110" cy="84" rx="60" ry="58" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/>
 <ellipse cx="110" cy="132" rx="34" ry="18" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/>
 <path class="asa" d="M48 160 Q26 182 38 200 Q56 190 64 168 Z" fill="#E3EBF1"/>
 <path class="asa" d="M172 160 Q194 182 182 200 Q164 190 156 168 Z" fill="#E3EBF1"/>
 ${olhos(88,132,96,10,12)}${bochechas(68,152,118)}
 <path d="M86 130 Q110 150 134 130" stroke="#5A6B7A" stroke-width="4" fill="none" stroke-linecap="round"/>
</g>`,
'raposa-do-artico': `<g class="corpo">
 <path class="cauda" d="M140 190 Q200 196 204 140 Q206 110 186 108 Q170 140 140 160 Z" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/>
 <ellipse cx="110" cy="168" rx="40" ry="32" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/>
 <ellipse cx="92" cy="198" rx="12" ry="7" fill="#F1F5F9" stroke="#D5E0EA" stroke-width="2"/><ellipse cx="128" cy="198" rx="12" ry="7" fill="#F1F5F9" stroke="#D5E0EA" stroke-width="2"/>
 <g class="orelha"><path d="M56 70 L64 20 L96 52 Z" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/><path d="M64 60 L68 34 L84 52 Z" fill="#F8C9D4"/></g>
 <g class="orelha"><path d="M164 70 L156 20 L124 52 Z" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/><path d="M156 60 L152 34 L136 52 Z" fill="#F8C9D4"/></g>
 <path d="M48 92 Q44 50 110 44 Q176 50 172 92 Q178 120 150 132 Q130 146 110 146 Q90 146 70 132 Q42 120 48 92 Z" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/>
 <path d="M48 104 L36 112 L52 114 M172 104 L184 112 L168 114" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/>
 ${olhos(88,132,88,10,12)}${bochechas(68,152,110)}
 <ellipse cx="110" cy="112" rx="8" ry="5.5" fill="#2B1B12"/>
 ${sorriso(110,124)}
</g>`,
'leao-marinho': `<g class="corpo">
 <path class="cauda" d="M140 192 Q180 186 196 200 Q170 208 140 202 Z" fill="#6B4430"/>
 <path d="M70 200 Q60 130 110 116 Q160 130 150 200 Z" fill="#9A6440"/>
 <ellipse cx="110" cy="168" rx="24" ry="30" fill="#C08A5E"/>
 <path class="asa" d="M78 160 Q54 196 66 204 Q88 204 92 178 Z" fill="#6B4430"/>
 <path class="asa" d="M142 160 Q166 196 154 204 Q132 204 128 178 Z" fill="#6B4430"/>
 <ellipse cx="110" cy="76" rx="56" ry="54" fill="#A86E48"/>
 <g class="orelha"><ellipse cx="58" cy="68" rx="7" ry="5" fill="#6B4430"/></g>
 <g class="orelha"><ellipse cx="162" cy="68" rx="7" ry="5" fill="#6B4430"/></g>
 ${olhos(88,132,70,11,13)}${bochechas(68,152,94)}
 <ellipse cx="110" cy="102" rx="22" ry="15" fill="#D4A47A"/>
 <path d="M90 100 L66 96 M90 106 L66 110 M130 100 L154 96 M130 106 L154 110" stroke="#4A2E1E" stroke-width="2" stroke-linecap="round"/>
 <ellipse cx="110" cy="94" rx="8" ry="5.5" fill="#2B1B12"/>
 ${sorriso(110,106)}
</g>`,
'boi-almiscarado': `<g class="corpo">
 <path d="M30 140 Q20 190 40 204 L180 204 Q200 190 190 140 Q170 110 110 108 Q50 110 30 140 Z" fill="#4A3324"/>
 <path d="M44 170 L44 204 M64 172 L64 204 M84 176 L84 204 M136 176 L136 204 M156 172 L156 204 M176 170 L176 204" stroke="#3A271B" stroke-width="4" stroke-linecap="round"/>
 <path d="M50 66 Q14 56 20 96 Q26 120 46 112 Q36 92 56 84 Z" fill="#E8DCC4" stroke="#BFAE8C" stroke-width="2"/>
 <path d="M170 66 Q206 56 200 96 Q194 120 174 112 Q184 92 164 84 Z" fill="#E8DCC4" stroke="#BFAE8C" stroke-width="2"/>
 <path d="M50 60 Q110 34 170 60 Q166 76 110 70 Q54 76 50 60 Z" fill="#D8C9A8"/>
 <ellipse cx="110" cy="106" rx="50" ry="54" fill="#5C4030"/>
 <path d="M70 70 Q110 54 150 70 Q130 82 110 76 Q90 82 70 70 Z" fill="#6E4E3A"/>
 ${olhos(90,130,98,10,12)}${bochechas(72,148,120)}
 <ellipse cx="110" cy="132" rx="24" ry="16" fill="#8C6A52"/>
 <ellipse cx="102" cy="128" rx="3" ry="2.5" fill="#2B1B12"/><ellipse cx="118" cy="128" rx="3" ry="2.5" fill="#2B1B12"/>
 ${sorriso(110,138)}
</g>`,
'coruja-das-neves': `<g class="corpo">
 <path class="asa" d="M46 100 Q20 140 40 186 Q60 170 66 120 Z" fill="#F1F5F9" stroke="#D5E0EA" stroke-width="2"/>
 <path class="asa" d="M174 100 Q200 140 180 186 Q160 170 154 120 Z" fill="#F1F5F9" stroke="#D5E0EA" stroke-width="2"/>
 <ellipse cx="110" cy="122" rx="68" ry="80" fill="#FFFFFF" stroke="#D5E0EA" stroke-width="2"/>
 <path d="M80 150 l6 4 M120 160 l6 4 M96 176 l6 4 M136 140 l6 4 M70 178 l6 4 M146 176 l6 4 M108 140 l6 4" stroke="#3A3A3A" stroke-width="4" stroke-linecap="round"/>
 <path d="M60 50 l6 4 M150 50 l6 4 M104 40 l6 4" stroke="#3A3A3A" stroke-width="3" stroke-linecap="round"/>
 <circle cx="86" cy="86" r="22" fill="#F4F7FA"/><circle cx="134" cy="86" r="22" fill="#F4F7FA"/>
 <circle cx="86" cy="86" r="14" fill="#FFD21F"/><circle cx="134" cy="86" r="14" fill="#FFD21F"/>
 ${olhos(86,134,86,8,9)}
 ${bochechas(68,152,114)}
 <path d="M102 102 L118 102 L110 118 Z" fill="#3A3A3A"/>
 <path d="M90 200 l-6 4 M96 200 l0 5 M102 200 l6 4 M118 200 l-6 4 M124 200 l0 5 M130 200 l6 4" stroke="#3A3A3A" stroke-width="3" stroke-linecap="round"/>
</g>`,
albatroz: `<g class="corpo">
 <path class="asa" d="M80 130 Q40 100 2 118 Q30 132 6 144 Q50 150 84 150 Z" fill="#FFFFFF" stroke="#C9D3DC" stroke-width="2"/>
 <path d="M2 118 Q30 132 6 144 L24 140 Q20 128 30 124 Z" fill="#3A3A3A"/>
 <g transform="translate(220 0) scale(-1 1)"><path class="asa" d="M80 130 Q40 100 2 118 Q30 132 6 144 Q50 150 84 150 Z" fill="#FFFFFF" stroke="#C9D3DC" stroke-width="2"/>
 <path d="M2 118 Q30 132 6 144 L24 140 Q20 128 30 124 Z" fill="#3A3A3A"/></g>
 <ellipse cx="110" cy="160" rx="38" ry="40" fill="#FFFFFF" stroke="#C9D3DC" stroke-width="2"/>
 <ellipse cx="96" cy="200" rx="12" ry="5" fill="#F4A7B4"/><ellipse cx="124" cy="200" rx="12" ry="5" fill="#F4A7B4"/>
 <ellipse cx="110" cy="80" rx="50" ry="48" fill="#FFFFFF" stroke="#C9D3DC" stroke-width="2"/>
 ${olhos(92,128,72,9,11)}
 ${bochechas(76,144,94)}
 <path d="M96 92 L124 92 Q122 120 110 140 Q98 120 96 92 Z" fill="#FFC928" stroke="#E0A800" stroke-width="2"/>
 <path d="M104 132 Q110 142 116 132" fill="#F0A020"/>
</g>`
});
