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
</g>`,
touro: `<g class="corpo">
 <g class="cauda"><path d="M152 162 Q182 164 182 140" stroke="#2A2626" stroke-width="6" stroke-linecap="round" fill="none"/><ellipse cx="182" cy="134" rx="6" ry="9" fill="#2A2626"/></g>
 <ellipse cx="110" cy="168" rx="50" ry="30" fill="#2E2A2A"/>
 <rect x="78" y="176" width="14" height="26" rx="6" fill="#2E2A2A"/><rect x="128" y="176" width="14" height="26" rx="6" fill="#2E2A2A"/>
 <path d="M70 52 Q30 50 24 18 Q46 36 76 38 Z" fill="#F4EAD0"/><path d="M150 52 Q190 50 196 18 Q174 36 144 38 Z" fill="#F4EAD0"/>
 <ellipse class="orelha" cx="50" cy="74" rx="20" ry="9" transform="rotate(15 50 74)" fill="#3A3434"/>
 <ellipse class="orelha" cx="170" cy="74" rx="20" ry="9" transform="rotate(-15 170 74)" fill="#3A3434"/>
 <ellipse cx="110" cy="86" rx="54" ry="52" fill="#3A3434"/>
 <path d="M98 40 Q110 30 122 40 Q110 48 98 40 Z" fill="#1E1A1A"/>
 ${olhos(88,132,78,10,12)}${bochechas(68,152,100)}
 <ellipse cx="110" cy="118" rx="34" ry="22" fill="#9A8282"/>
 <ellipse cx="97" cy="114" rx="5" ry="6" fill="#2B1B12"/><ellipse cx="123" cy="114" rx="5" ry="6" fill="#2B1B12"/>
 <circle cx="110" cy="132" r="11" fill="none" stroke="#F2C14E" stroke-width="5"/>
</g>`,
cordeiro: `<g class="corpo">
 <circle class="cauda" cx="152" cy="168" r="10" fill="#FFFFFF" stroke="#EADFD0" stroke-width="2"/>
 <rect x="88" y="176" width="11" height="26" rx="5" fill="#F2D2C2"/><rect x="121" y="176" width="11" height="26" rx="5" fill="#F2D2C2"/>
 <circle cx="92" cy="170" r="20" fill="#FFFFFF" stroke="#EADFD0" stroke-width="2"/><circle cx="128" cy="170" r="20" fill="#FFFFFF" stroke="#EADFD0" stroke-width="2"/><circle cx="110" cy="164" r="22" fill="#FFFFFF" stroke="#EADFD0" stroke-width="2"/>
 <ellipse class="orelha" cx="40" cy="96" rx="20" ry="10" transform="rotate(-25 40 96)" fill="#F7C6C6"/>
 <ellipse class="orelha" cx="180" cy="96" rx="20" ry="10" transform="rotate(25 180 96)" fill="#F7C6C6"/>
 <circle cx="62" cy="62" r="22" fill="#FFFFFF" stroke="#EADFD0" stroke-width="2"/><circle cx="158" cy="62" r="22" fill="#FFFFFF" stroke="#EADFD0" stroke-width="2"/><circle cx="86" cy="38" r="22" fill="#FFFFFF" stroke="#EADFD0" stroke-width="2"/><circle cx="134" cy="38" r="22" fill="#FFFFFF" stroke="#EADFD0" stroke-width="2"/><circle cx="110" cy="30" r="22" fill="#FFFFFF" stroke="#EADFD0" stroke-width="2"/>
 <ellipse cx="110" cy="96" rx="56" ry="52" fill="#FBE3D6"/>
 <circle cx="84" cy="56" r="16" fill="#FFFFFF"/><circle cx="110" cy="50" r="18" fill="#FFFFFF"/><circle cx="136" cy="56" r="16" fill="#FFFFFF"/>
 ${olhos(88,132,94,12,14)}${bochechas(70,150,118)}
 <ellipse cx="110" cy="120" rx="7" ry="5" fill="#C97A7A"/>${sorriso(110,128,'#C97A7A')}
</g>`,
leitao: `<g class="corpo">
 <path class="cauda" d="M144 176 q14 -2 11 -12 q-3 -8 -9 -2 q-5 6 5 8" stroke="#F7A9BE" stroke-width="4" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="176" rx="36" ry="24" fill="#FFD3DE"/>
 <ellipse cx="92" cy="198" rx="10" ry="7" fill="#F7A9BE"/><ellipse cx="128" cy="198" rx="10" ry="7" fill="#F7A9BE"/>
 <path class="orelha" d="M62 76 L60 44 L92 62 Z" fill="#F7A9BE"/>
 <path class="orelha" d="M158 76 L160 44 L128 62 Z" fill="#F7A9BE"/>
 <ellipse cx="110" cy="108" rx="54" ry="50" fill="#FFDDE6"/>
 ${olhos(88,132,98,11,13)}${bochechas(68,152,122)}
 <ellipse cx="110" cy="126" rx="20" ry="14" fill="#F7A9BE"/>
 <ellipse cx="103" cy="126" rx="3.5" ry="5" fill="#C0647E"/><ellipse cx="117" cy="126" rx="3.5" ry="5" fill="#C0647E"/>
 ${sorriso(110,146,'#C0647E')}
</g>`,
bezerro: `<g class="corpo">
 <g class="cauda"><path d="M146 168 Q172 168 172 148" stroke="#A86A3A" stroke-width="5" stroke-linecap="round" fill="none"/><ellipse cx="172" cy="143" rx="5" ry="7" fill="#6E4426"/></g>
 <ellipse cx="110" cy="172" rx="40" ry="26" fill="#FFFFFF"/>
 <ellipse cx="96" cy="166" rx="14" ry="10" fill="#A86A3A"/><ellipse cx="130" cy="178" rx="10" ry="8" fill="#A86A3A"/>
 <rect x="86" y="182" width="12" height="20" rx="5" fill="#FFFFFF"/><rect x="122" y="182" width="12" height="20" rx="5" fill="#FFFFFF"/>
 <rect x="86" y="195" width="12" height="8" rx="3" fill="#6E4426"/><rect x="122" y="195" width="12" height="8" rx="3" fill="#6E4426"/>
 <ellipse class="orelha" cx="46" cy="84" rx="22" ry="11" transform="rotate(20 46 84)" fill="#A86A3A"/>
 <ellipse class="orelha" cx="174" cy="84" rx="22" ry="11" transform="rotate(-20 174 84)" fill="#A86A3A"/>
 <ellipse cx="110" cy="94" rx="56" ry="52" fill="#FFFFFF"/>
 <path d="M58 82 Q62 46 96 46 Q100 70 82 92 Q68 98 58 82 Z" fill="#A86A3A"/>
 <path d="M146 50 Q164 60 162 84 Q146 80 140 62 Z" fill="#A86A3A"/>
 ${olhos(88,132,88,11,13)}${bochechas(68,152,110)}
 <ellipse cx="110" cy="124" rx="30" ry="18" fill="#F7C6C6"/>
 <ellipse cx="100" cy="122" rx="4" ry="4.5" fill="#B0606A"/><ellipse cx="120" cy="122" rx="4" ry="4.5" fill="#B0606A"/>${sorriso(110,132,'#B0606A')}
</g>`,
potro: `<g class="corpo">
 <path class="cauda" d="M144 150 Q172 146 170 176 Q160 164 146 162 Z" fill="#8A5A30"/>
 <ellipse cx="110" cy="152" rx="38" ry="20" fill="#D9A066"/>
 <rect x="80" y="156" width="10" height="46" rx="5" fill="#D9A066"/><rect x="96" y="158" width="10" height="44" rx="5" fill="#C98E54"/><rect x="114" y="158" width="10" height="44" rx="5" fill="#C98E54"/><rect x="130" y="156" width="10" height="46" rx="5" fill="#D9A066"/>
 <rect x="80" y="196" width="10" height="7" rx="3" fill="#5A3A20"/><rect x="96" y="196" width="10" height="7" rx="3" fill="#5A3A20"/><rect x="114" y="196" width="10" height="7" rx="3" fill="#5A3A20"/><rect x="130" y="196" width="10" height="7" rx="3" fill="#5A3A20"/>
 <path class="orelha" d="M74 46 L70 16 L94 36 Z" fill="#D9A066"/>
 <path class="orelha" d="M146 46 L150 16 L126 36 Z" fill="#D9A066"/>
 <ellipse cx="110" cy="80" rx="52" ry="50" fill="#E6B37C"/>
 <path d="M96 34 Q104 22 112 32 Q120 22 126 36 Q116 34 110 44 Q102 36 96 42 Z" fill="#8A5A30"/>
 ${olhos(88,132,76,11,13)}${bochechas(70,150,98)}
 <ellipse cx="110" cy="110" rx="28" ry="17" fill="#F4DCC0"/>
 <ellipse cx="100" cy="107" rx="3.5" ry="4.5" fill="#5A3A20"/><ellipse cx="120" cy="107" rx="3.5" ry="4.5" fill="#5A3A20"/>${sorriso(110,117,'#5A3A20')}
</g>`,
mula: `<g class="corpo">
 <g class="cauda"><path d="M152 164 Q178 166 180 144" stroke="#7A5232" stroke-width="7" stroke-linecap="round" fill="none"/><ellipse cx="180" cy="138" rx="6" ry="9" fill="#3A2416"/></g>
 <ellipse cx="110" cy="170" rx="44" ry="28" fill="#8C5E3A"/>
 <rect x="82" y="180" width="12" height="22" rx="6" fill="#6E4628"/><rect x="126" y="180" width="12" height="22" rx="6" fill="#6E4628"/>
 <g class="orelha"><ellipse cx="70" cy="44" rx="12" ry="26" transform="rotate(-20 70 44)" fill="#8C5E3A"/><ellipse cx="70" cy="44" rx="5" ry="17" transform="rotate(-20 70 44)" fill="#E8B8A8"/></g>
 <g class="orelha"><ellipse cx="150" cy="44" rx="12" ry="26" transform="rotate(20 150 44)" fill="#8C5E3A"/><ellipse cx="150" cy="44" rx="5" ry="17" transform="rotate(20 150 44)" fill="#E8B8A8"/></g>
 <ellipse cx="110" cy="96" rx="52" ry="50" fill="#9C6C44"/>
 <path d="M98 50 L102 40 L108 50 L114 40 L120 50 Z" fill="#3A2416"/>
 ${olhos(88,132,90,10,12)}${bochechas(70,150,112)}
 <ellipse cx="110" cy="126" rx="30" ry="19" fill="#E6CDB0"/>
 <ellipse cx="99" cy="122" rx="4" ry="4.5" fill="#3A2416"/><ellipse cx="121" cy="122" rx="4" ry="4.5" fill="#3A2416"/>${sorriso(110,133,'#3A2416')}
</g>`,
bode: `<g class="corpo">
 <path class="cauda" d="M150 156 Q170 140 166 128" stroke="#4A3220" stroke-width="10" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="170" rx="44" ry="28" fill="#5E4028"/>
 <rect x="80" y="180" width="12" height="22" rx="6" fill="#3A2818"/><rect x="128" y="180" width="12" height="22" rx="6" fill="#3A2818"/>
 <path d="M84 46 Q60 2 30 22 Q22 46 44 50 Q38 30 56 26 Q70 30 74 52 Z" fill="#C9B48E"/><path d="M136 46 Q160 2 190 22 Q198 46 176 50 Q182 30 164 26 Q150 30 146 52 Z" fill="#C9B48E"/>
 <ellipse class="orelha" cx="46" cy="82" rx="22" ry="9" transform="rotate(15 46 82)" fill="#5E4028"/>
 <ellipse class="orelha" cx="174" cy="82" rx="22" ry="9" transform="rotate(-15 174 82)" fill="#5E4028"/>
 <ellipse cx="110" cy="86" rx="52" ry="50" fill="#6E4C30"/>
 <path d="M88 124 Q110 196 132 124 Z" fill="#3A2818"/>
 ${olhos(88,132,80,10,12)}${bochechas(70,150,100)}
 <ellipse cx="110" cy="112" rx="22" ry="14" fill="#B08A6A"/>
 <ellipse cx="103" cy="110" rx="3.5" ry="3" fill="#2B1B12"/><ellipse cx="117" cy="110" rx="3.5" ry="3" fill="#2B1B12"/>${sorriso(110,118,'#2B1B12')}
</g>`,
codorniz: `<g class="corpo">
 <path class="cauda" d="M150 150 Q176 140 178 158 Q164 162 150 164 Z" fill="#6E4A2A"/>
 <rect x="92" y="186" width="5" height="16" rx="2" fill="#E0A060"/><rect x="123" y="186" width="5" height="16" rx="2" fill="#E0A060"/>
 <ellipse cx="110" cy="130" rx="66" ry="62" fill="#A8784A"/>
 <ellipse cx="110" cy="152" rx="40" ry="34" fill="#E6CFA6"/>
 <path class="asa" d="M52 124 Q40 160 70 172 Q76 150 66 126 Z" fill="#8A5E36"/>
 <path class="asa" d="M168 124 Q180 160 150 172 Q144 150 154 126 Z" fill="#8A5E36"/>
 <circle cx="96" cy="150" r="3" fill="#6E4A2A"/><circle cx="124" cy="146" r="3" fill="#6E4A2A"/><circle cx="110" cy="164" r="3" fill="#6E4A2A"/><circle cx="92" cy="172" r="3" fill="#6E4A2A"/><circle cx="128" cy="170" r="3" fill="#6E4A2A"/>
 <circle cx="74" cy="100" r="3" fill="#F2E2C2"/><circle cx="146" cy="100" r="3" fill="#F2E2C2"/><circle cx="70" cy="80" r="3" fill="#F2E2C2"/><circle cx="150" cy="80" r="3" fill="#F2E2C2"/>
 <path d="M110 70 Q104 50 116 46" stroke="#3A2416" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="117" cy="46" rx="6" ry="5" fill="#3A2416"/>
 ${olhos(90,130,98,10,12)}${bochechas(76,144,118)}
 <path d="M102 112 Q110 108 118 112 L110 124 Z" fill="#3A2416"/>
</g>`,
'galinha-da-india': `<g class="corpo">
 <rect x="94" y="186" width="6" height="16" rx="2" fill="#E07A30"/><rect x="120" y="186" width="6" height="16" rx="2" fill="#E07A30"/>
 <ellipse cx="110" cy="146" rx="74" ry="48" fill="#5E6670"/>
 <path class="asa" d="M60 130 Q48 170 86 180 Q90 150 76 130 Z" fill="#4A5058"/>
 <circle cx="70" cy="140" r="3.5" fill="#FFFFFF"/><circle cx="84" cy="158" r="3.5" fill="#FFFFFF"/><circle cx="100" cy="136" r="3.5" fill="#FFFFFF"/><circle cx="110" cy="160" r="3.5" fill="#FFFFFF"/><circle cx="124" cy="140" r="3.5" fill="#FFFFFF"/><circle cx="138" cy="164" r="3.5" fill="#FFFFFF"/><circle cx="150" cy="136" r="3.5" fill="#FFFFFF"/><circle cx="164" cy="156" r="3.5" fill="#FFFFFF"/><circle cx="96" cy="180" r="3.5" fill="#FFFFFF"/><circle cx="128" cy="182" r="3.5" fill="#FFFFFF"/><circle cx="170" cy="134" r="3.5" fill="#FFFFFF"/><circle cx="56" cy="152" r="3.5" fill="#FFFFFF"/>
 <rect x="102" y="80" width="16" height="30" rx="8" fill="#5A7FB8"/>
 <ellipse cx="110" cy="70" rx="32" ry="30" fill="#7FA6D8"/>
 <path d="M104 44 L110 28 L116 44 Z" fill="#E8B060"/>
 <ellipse cx="96" cy="92" rx="5" ry="8" fill="#E0403A"/><ellipse cx="124" cy="92" rx="5" ry="8" fill="#E0403A"/>
 ${olhos(98,122,66,8,10)}
 <path d="M104 78 Q110 75 116 78 L110 88 Z" fill="#E8B060"/>
</g>`,
faisao: `<g class="corpo">
 <path class="cauda" d="M130 160 Q180 130 214 40 Q200 120 140 178 Z" fill="#B8742E"/>
 <path d="M134 164 Q176 140 204 70" stroke="#5A3418" stroke-width="3" fill="none"/>
 <rect x="94" y="186" width="6" height="16" rx="2" fill="#9E8A6E"/><rect x="116" y="186" width="6" height="16" rx="2" fill="#9E8A6E"/>
 <ellipse cx="108" cy="160" rx="44" ry="32" fill="#C9772E"/>
 <path class="asa" d="M120 146 Q150 150 152 176 Q130 176 116 162 Z" fill="#9A5622"/>
 <circle cx="96" cy="158" r="3" fill="#5A3418"/><circle cx="84" cy="172" r="3" fill="#5A3418"/><circle cx="104" cy="178" r="3" fill="#5A3418"/>
 <rect x="84" y="112" width="32" height="20" rx="8" fill="#2E7A5A"/>
 <ellipse cx="100" cy="78" rx="44" ry="42" fill="#2E7A5A"/>
 <path d="M66 112 Q100 128 134 112 L134 122 Q100 140 66 122 Z" fill="#FFFFFF"/>
 <ellipse cx="80" cy="76" rx="12" ry="16" fill="#E0403A"/><ellipse cx="120" cy="76" rx="12" ry="16" fill="#E0403A"/>
 <path class="orelha" d="M84 40 L76 28 L94 36 Z" fill="#1E5A40"/><path class="orelha" d="M116 40 L124 28 L106 36 Z" fill="#1E5A40"/>
 ${olhos(82,118,74,8,10)}${bochechas(70,130,98)}
 <path d="M92 90 Q100 86 108 90 L100 104 Z" fill="#E8D08A"/>
</g>`
});
