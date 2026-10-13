'use strict';
Object.assign(DESENHOS, {
porco: `<g class="corpo">
 <path class="cauda" d="M154 166 q18 -4 14 -16 q-4 -10 -12 -2 q-6 8 6 10" stroke="#F08AA5" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="168" rx="48" ry="32" fill="#F9A8BE"/>
 <ellipse cx="86" cy="197" rx="14" ry="9" fill="#F08AA5"/><ellipse cx="134" cy="197" rx="14" ry="9" fill="#F08AA5"/>
 <path class="orelha" d="M58 58 L52 20 L94 42 Z" fill="#F08AA5"/>
 <path class="orelha" d="M162 58 L168 20 L126 42 Z" fill="#F08AA5"/>
 <ellipse cx="110" cy="90" rx="62" ry="54" fill="#FBB8CB"/>
 ${olhos(86,134,78)}${bochechas(64,156,104)}
 <ellipse cx="110" cy="112" rx="28" ry="20" fill="#F08AA5"/>
 <ellipse cx="100" cy="112" rx="5" ry="7" fill="#B8536F"/><ellipse cx="120" cy="112" rx="5" ry="7" fill="#B8536F"/>
 ${sorriso(110,138,'#B8536F')}
</g>`,
ovelha: `<g class="corpo">
 <circle class="cauda" cx="160" cy="160" r="12" fill="#FFFFFF" stroke="#E4E4E4" stroke-width="2"/>
 <rect x="80" y="170" width="12" height="32" rx="6" fill="#3E3A3A"/><rect x="128" y="170" width="12" height="32" rx="6" fill="#3E3A3A"/>
 <circle cx="80" cy="162" r="24" fill="#FFFFFF" stroke="#E4E4E4" stroke-width="2"/><circle cx="110" cy="170" r="26" fill="#FFFFFF" stroke="#E4E4E4" stroke-width="2"/><circle cx="140" cy="162" r="24" fill="#FFFFFF" stroke="#E4E4E4" stroke-width="2"/>
 <circle cx="70" cy="56" r="24" fill="#FFFFFF" stroke="#E4E4E4" stroke-width="2"/><circle cx="150" cy="56" r="24" fill="#FFFFFF" stroke="#E4E4E4" stroke-width="2"/><circle cx="110" cy="40" r="26" fill="#FFFFFF" stroke="#E4E4E4" stroke-width="2"/>
 <ellipse class="orelha" cx="44" cy="96" rx="20" ry="10" transform="rotate(-20 44 96)" fill="#4A4444"/>
 <ellipse class="orelha" cx="176" cy="96" rx="20" ry="10" transform="rotate(20 176 96)" fill="#4A4444"/>
 <ellipse cx="110" cy="100" rx="50" ry="50" fill="#5A5252"/>
 <circle cx="88" cy="58" r="16" fill="#FFFFFF"/><circle cx="110" cy="54" r="18" fill="#FFFFFF"/><circle cx="132" cy="58" r="16" fill="#FFFFFF"/>
 ${olhos(90,130,96,10,12)}${bochechas(74,146,118)}
 <ellipse cx="110" cy="122" rx="7" ry="5" fill="#2B1B12"/>${sorriso(110,130,'#F7C6D2')}
</g>`,
cabra: `<g class="corpo">
 <path class="cauda" d="M150 156 Q170 140 166 128" stroke="#D9CDB6" stroke-width="10" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="168" rx="44" ry="28" fill="#EFE6D4"/>
 <rect x="80" y="180" width="12" height="22" rx="6" fill="#8A7A62"/><rect x="128" y="180" width="12" height="22" rx="6" fill="#8A7A62"/>
 <path d="M86 46 Q70 14 50 22 Q66 26 74 50 Z" fill="#9C8A70"/><path d="M134 46 Q150 14 170 22 Q154 26 146 50 Z" fill="#9C8A70"/>
 <ellipse class="orelha" cx="44" cy="80" rx="24" ry="9" transform="rotate(15 44 80)" fill="#E2D6BE"/>
 <ellipse class="orelha" cx="176" cy="80" rx="24" ry="9" transform="rotate(-15 176 80)" fill="#E2D6BE"/>
 <ellipse cx="110" cy="86" rx="52" ry="50" fill="#F7F0E2"/>
 <path d="M96 128 Q110 168 124 128 Z" fill="#D9CDB6"/>
 ${olhos(88,132,80,10,12)}${bochechas(70,150,102)}
 <ellipse cx="110" cy="112" rx="22" ry="14" fill="#F2C9C9"/>
 <ellipse cx="103" cy="110" rx="3.5" ry="3" fill="#8A5A5A"/><ellipse cx="117" cy="110" rx="3.5" ry="3" fill="#8A5A5A"/>${sorriso(110,118,'#8A5A5A')}
</g>`,
cavalo: `<g class="corpo">
 <path class="cauda" d="M152 160 Q192 156 186 196 Q172 180 156 176 Z" fill="#5A2E14"/>
 <ellipse cx="110" cy="168" rx="46" ry="30" fill="#A8622E"/>
 <rect x="80" y="176" width="13" height="26" rx="6" fill="#A8622E"/><rect x="127" y="176" width="13" height="26" rx="6" fill="#A8622E"/>
 <rect x="80" y="194" width="13" height="9" rx="3" fill="#3A2214"/><rect x="127" y="194" width="13" height="9" rx="3" fill="#3A2214"/>
 <path class="orelha" d="M72 50 L68 16 L94 38 Z" fill="#A8622E"/>
 <path class="orelha" d="M148 50 L152 16 L126 38 Z" fill="#A8622E"/>
 <ellipse cx="110" cy="88" rx="54" ry="54" fill="#B9733A"/>
 <path d="M84 40 Q100 18 116 30 Q132 18 140 42 Q126 34 116 48 Q104 34 92 52 Q86 46 84 40 Z" fill="#5A2E14"/>
 <path d="M60 60 Q44 90 58 128 Q66 104 66 80 Z M160 60 Q176 90 162 128 Q154 104 154 80 Z" fill="#5A2E14"/>
 ${olhos(88,132,84,10,12)}${bochechas(70,150,108)}
 <ellipse cx="110" cy="122" rx="32" ry="20" fill="#E8C29A"/>
 <ellipse cx="98" cy="118" rx="4" ry="5" fill="#5A2E14"/><ellipse cx="122" cy="118" rx="4" ry="5" fill="#5A2E14"/>${sorriso(110,130,'#5A2E14')}
</g>`,
burro: `<g class="corpo">
 <g class="cauda"><path d="M152 164 Q178 166 180 144" stroke="#8E959C" stroke-width="7" stroke-linecap="round" fill="none"/><ellipse cx="180" cy="138" rx="6" ry="9" fill="#3E4248"/></g>
 <ellipse cx="110" cy="170" rx="44" ry="28" fill="#9AA1A8"/>
 <rect x="82" y="180" width="12" height="22" rx="6" fill="#6E757C"/><rect x="126" y="180" width="12" height="22" rx="6" fill="#6E757C"/>
 <g class="orelha"><ellipse cx="66" cy="40" rx="15" ry="36" transform="rotate(-22 66 40)" fill="#9AA1A8"/><ellipse cx="66" cy="40" rx="7" ry="26" transform="rotate(-22 66 40)" fill="#F2B8C6"/><ellipse cx="58" cy="19" rx="8" ry="9" fill="#3E4248"/></g>
 <g class="orelha"><ellipse cx="154" cy="40" rx="15" ry="36" transform="rotate(22 154 40)" fill="#9AA1A8"/><ellipse cx="154" cy="40" rx="7" ry="26" transform="rotate(22 154 40)" fill="#F2B8C6"/><ellipse cx="162" cy="19" rx="8" ry="9" fill="#3E4248"/></g>
 <ellipse cx="110" cy="96" rx="52" ry="50" fill="#A9B0B7"/>
 <path d="M100 50 L104 40 L110 50 L116 40 L120 50 Z" fill="#3E4248"/>
 ${olhos(88,132,90,10,12)}${bochechas(70,150,112)}
 <ellipse cx="110" cy="126" rx="30" ry="19" fill="#EDEDED"/>
 <ellipse cx="99" cy="122" rx="4" ry="4.5" fill="#3E4248"/><ellipse cx="121" cy="122" rx="4" ry="4.5" fill="#3E4248"/>${sorriso(110,133,'#3E4248')}
</g>`,
galinha: `<g class="corpo">
 <path class="cauda" d="M158 140 Q190 120 186 150 Q196 150 176 172 Z" fill="#C9864A"/>
 <ellipse cx="110" cy="148" rx="62" ry="50" fill="#E8A766"/>
 <path class="asa" d="M120 140 Q152 130 160 160 Q138 178 120 160 Z" fill="#C9864A"/>
 <path d="M90 194 L90 204 M84 204 L96 204 M130 194 L130 204 M124 204 L136 204" stroke="#F2A93B" stroke-width="5" stroke-linecap="round"/>
 <path d="M96 36 Q100 20 108 30 Q114 16 120 32 Q128 24 126 42 Z" fill="#E8453C"/>
 <circle cx="110" cy="80" r="44" fill="#F0B678"/>
 ${olhos(92,128,76,9,11)}${bochechas(76,144,94)}
 <path d="M100 92 L120 92 L110 106 Z" fill="#F2A93B"/>
 <ellipse cx="110" cy="112" rx="6" ry="8" fill="#E8453C"/>
</g>`,
galo: `<g class="corpo">
 <g class="cauda"><path d="M146 140 Q170 70 204 92 Q174 104 164 150 Z" fill="#2E7D4F"/><path d="M150 150 Q190 100 210 130 Q182 132 168 160 Z" fill="#1F5A9E"/><path d="M152 160 Q192 140 200 170 Q176 164 160 172 Z" fill="#C0392B"/></g>
 <ellipse cx="106" cy="156" rx="46" ry="38" fill="#D9762E"/>
 <path class="asa" d="M110 148 Q140 136 148 164 Q128 180 110 166 Z" fill="#A9521C"/>
 <path d="M90 190 L90 204 M84 204 L96 204 M122 190 L122 204 M116 204 L128 204" stroke="#F2A93B" stroke-width="5" stroke-linecap="round"/>
 <path d="M76 44 Q74 10 92 24 Q96 4 110 22 Q122 2 128 26 Q146 14 140 46 Z" fill="#E0281E"/>
 <ellipse cx="106" cy="82" rx="42" ry="42" fill="#E8913A"/>
 <path d="M70 100 Q106 140 142 100 Q140 126 106 132 Q72 126 70 100 Z" fill="#C46420"/>
 ${olhos(88,124,76,9,11)}${bochechas(74,140,94)}
 <path d="M96 92 L116 92 L106 106 Z" fill="#F2C12E"/>
 <path d="M100 106 Q106 128 112 106 Z" fill="#E0281E"/>
</g>`,
pinto: `<g class="corpo">
 <path class="cauda" d="M156 150 L178 138 L170 160 Z" fill="#FFD23F"/>
 <ellipse cx="110" cy="164" rx="48" ry="34" fill="#FFE15C"/>
 <path class="asa" d="M66 152 Q48 160 58 178 Q72 176 74 160 Z" fill="#F5C61E"/>
 <path class="asa" d="M154 152 Q172 160 162 178 Q148 176 146 160 Z" fill="#F5C61E"/>
 <path d="M92 196 L92 204 M86 204 L98 204 M128 196 L128 204 M122 204 L134 204" stroke="#F28C28" stroke-width="5" stroke-linecap="round"/>
 <circle cx="110" cy="88" r="58" fill="#FFE870"/>
 <path d="M104 32 Q100 14 112 22 Q118 12 120 32 Z" fill="#FFE870"/>
 ${olhos(88,132,84)}${bochechas(66,154,104)}
 <path d="M100 100 L120 100 L110 114 Z" fill="#F28C28"/>
</g>`,
peru: `<g class="corpo">
 <g class="cauda"><ellipse cx="110" cy="96" rx="92" ry="84" fill="#8B4A22"/><ellipse cx="110" cy="100" rx="80" ry="72" fill="#D9862E"/><ellipse cx="110" cy="104" rx="64" ry="58" fill="#F2C14E"/><ellipse cx="110" cy="108" rx="48" ry="44" fill="#A85A28"/></g>
 <ellipse cx="110" cy="160" rx="44" ry="38" fill="#6E3A1A"/>
 <path d="M92 194 L92 204 M86 204 L98 204 M128 194 L128 204 M122 204 L134 204" stroke="#F2A93B" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="110" cy="104" rx="36" ry="40" fill="#8A5A3C"/>
 ${olhos(96,124,96,8,10)}${bochechas(84,136,110)}
 <path d="M102 106 L118 106 L110 118 Z" fill="#F2C12E"/>
 <path d="M114 108 Q124 126 114 140 Q108 128 112 110 Z" fill="#E0281E"/>
</g>`,
ganso: `<g class="corpo">
 <path class="cauda" d="M166 150 Q198 130 194 166 Z" fill="#F2F2F2"/>
 <rect x="76" y="80" width="28" height="90" rx="14" fill="#FFFFFF"/>
 <ellipse cx="120" cy="164" rx="58" ry="36" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
 <path class="asa" d="M110 154 Q144 136 164 162 Q138 182 112 170 Z" fill="#E8EAEE"/>
 <ellipse cx="100" cy="202" rx="15" ry="6" fill="#F28C28"/><ellipse cx="140" cy="202" rx="15" ry="6" fill="#F28C28"/>
 <ellipse cx="94" cy="62" rx="44" ry="40" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
 ${olhos(78,112,56,9,11)}${bochechas(62,128,74)}
 <path d="M80 76 Q94 70 108 76 L94 96 Z" fill="#F28C28"/>
 <ellipse cx="94" cy="72" rx="16" ry="5" fill="#E07020"/>
</g>`
});
