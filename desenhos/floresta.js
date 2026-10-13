'use strict';
Object.assign(DESENHOS, {
urso: `<g class="corpo">
 <ellipse class="cauda" cx="158" cy="180" rx="10" ry="9" fill="#7A4A26"/>
 <ellipse cx="110" cy="168" rx="52" ry="34" fill="#8B5A2B"/><ellipse cx="110" cy="176" rx="30" ry="21" fill="#D9A877"/>
 <ellipse cx="84" cy="197" rx="17" ry="10" fill="#7A4A26"/><ellipse cx="136" cy="197" rx="17" ry="10" fill="#7A4A26"/>
 <g class="orelha"><circle cx="62" cy="46" r="20" fill="#8B5A2B"/><circle cx="62" cy="46" r="10" fill="#D9A877"/></g>
 <g class="orelha"><circle cx="158" cy="46" r="20" fill="#8B5A2B"/><circle cx="158" cy="46" r="10" fill="#D9A877"/></g>
 <ellipse cx="110" cy="92" rx="62" ry="54" fill="#9C6634"/>
 ${olhos(86,134,84)}${bochechas(66,154,108)}
 <ellipse cx="110" cy="114" rx="26" ry="19" fill="#E8C49A"/>
 <ellipse cx="110" cy="105" rx="11" ry="7.5" fill="#2B1B12"/>${sorriso(110,118)}
</g>`,
raposa: `<g class="corpo">
 <g class="cauda"><path d="M140 182 Q200 186 200 132 Q196 104 176 98 Q170 140 140 160 Z" fill="#F07A22"/><path d="M200 132 Q196 104 176 98 Q176 120 186 136 Z" fill="#FFFFFF"/></g>
 <ellipse cx="110" cy="170" rx="42" ry="30" fill="#F28A30"/><ellipse cx="110" cy="178" rx="22" ry="18" fill="#FFF3E6"/>
 <ellipse cx="88" cy="198" rx="13" ry="8" fill="#3A2A22"/><ellipse cx="132" cy="198" rx="13" ry="8" fill="#3A2A22"/>
 <g class="orelha"><path d="M52 76 L58 16 L98 52 Z" fill="#F28A30"/><path d="M62 64 L64 32 L86 54 Z" fill="#3A2A22"/></g>
 <g class="orelha"><path d="M168 76 L162 16 L122 52 Z" fill="#F28A30"/><path d="M158 64 L156 32 L134 54 Z" fill="#3A2A22"/></g>
 <ellipse cx="110" cy="90" rx="62" ry="50" fill="#F5962F"/>
 <path d="M50 96 Q80 104 110 140 Q140 104 170 96 Q166 130 110 142 Q54 130 50 96 Z" fill="#FFF3E6"/>
 ${olhos(86,134,86)}${bochechas(68,152,108)}
 <ellipse cx="110" cy="118" rx="9" ry="6.5" fill="#2B1B12"/>${sorriso(110,126)}
</g>`,
lobo: `<g class="corpo">
 <path class="cauda" d="M148 178 Q192 172 196 128 Q178 146 150 160 Z" fill="#7D8794"/>
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#8E98A6"/><ellipse cx="110" cy="178" rx="24" ry="18" fill="#E4E8EE"/>
 <ellipse cx="88" cy="198" rx="14" ry="8" fill="#6B7480"/><ellipse cx="132" cy="198" rx="14" ry="8" fill="#6B7480"/>
 <g class="orelha"><path d="M50 80 L56 6 L100 50 Z" fill="#6B7480"/><path d="M60 66 L62 26 L86 52 Z" fill="#D7DCE3"/></g>
 <g class="orelha"><path d="M170 80 L164 6 L120 50 Z" fill="#6B7480"/><path d="M160 66 L158 26 L134 52 Z" fill="#D7DCE3"/></g>
 <ellipse cx="110" cy="88" rx="60" ry="50" fill="#97A1AE"/>
 <path d="M86 46 L110 64 L134 46 Q110 38 86 46 Z" fill="#6B7480"/>
 ${olhos(84,136,82,10,12)}${bochechas(64,156,104)}
 <ellipse cx="110" cy="120" rx="26" ry="26" fill="#E4E8EE"/>
 <ellipse cx="110" cy="110" rx="11" ry="7.5" fill="#2B1B12"/>${sorriso(110,126)}
</g>`,
veado: `<g class="corpo">
 <ellipse class="cauda" cx="154" cy="160" rx="8" ry="11" fill="#FFFFFF"/>
 <ellipse cx="110" cy="170" rx="42" ry="30" fill="#C98A4B"/>
 <circle cx="92" cy="160" r="4" fill="#FFF3E0"/><circle cx="128" cy="156" r="4" fill="#FFF3E0"/><circle cx="114" cy="166" r="3.5" fill="#FFF3E0"/>
 <rect x="80" y="186" width="14" height="18" rx="6" fill="#8B5A2B"/><rect x="126" y="186" width="14" height="18" rx="6" fill="#8B5A2B"/>
 <path d="M80 50 Q70 30 74 8 M74 30 Q60 26 56 14 M80 38 Q90 26 90 14" stroke="#8B5A2B" stroke-width="7" fill="none" stroke-linecap="round"/>
 <path d="M140 50 Q150 30 146 8 M146 30 Q160 26 164 14 M140 38 Q130 26 130 14" stroke="#8B5A2B" stroke-width="7" fill="none" stroke-linecap="round"/>
 <g class="orelha"><ellipse cx="44" cy="72" rx="24" ry="11" transform="rotate(-25 44 72)" fill="#C98A4B"/><ellipse cx="46" cy="72" rx="13" ry="5" transform="rotate(-25 46 72)" fill="#F7B7C4"/></g>
 <g class="orelha"><ellipse cx="176" cy="72" rx="24" ry="11" transform="rotate(25 176 72)" fill="#C98A4B"/><ellipse cx="174" cy="72" rx="13" ry="5" transform="rotate(25 174 72)" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="94" rx="54" ry="50" fill="#D69A5A"/>
 ${olhos(88,132,88)}${bochechas(68,152,110)}
 <ellipse cx="110" cy="122" rx="22" ry="16" fill="#FFF3E0"/>
 <ellipse cx="110" cy="114" rx="8" ry="6" fill="#2B1B12"/>${sorriso(110,126)}
</g>`,
esquilo: `<g class="corpo">
 <path class="cauda" d="M140 190 Q210 190 204 110 Q200 40 150 40 Q120 44 132 74 Q172 70 168 120 Q164 160 136 164 Z" fill="#C8642A"/>
 <path d="M190 100 Q186 66 158 58" stroke="#E08A4A" stroke-width="6" fill="none" stroke-linecap="round"/>
 <ellipse cx="100" cy="170" rx="38" ry="30" fill="#D9773A"/><ellipse cx="100" cy="178" rx="20" ry="18" fill="#FBE3C2"/>
 <ellipse cx="80" cy="198" rx="13" ry="8" fill="#B5571F"/><ellipse cx="120" cy="198" rx="13" ry="8" fill="#B5571F"/>
 <g class="orelha"><path d="M54 64 L56 20 L86 48 Z" fill="#D9773A"/><path d="M60 56 L61 32 L78 48 Z" fill="#F7B7C4"/></g>
 <g class="orelha"><path d="M146 64 L144 20 L114 48 Z" fill="#D9773A"/><path d="M140 56 L139 32 L122 48 Z" fill="#F7B7C4"/></g>
 <ellipse cx="100" cy="92" rx="52" ry="46" fill="#E08A4A"/>
 ${olhos(80,120,86,10,12)}${bochechas(62,138,106)}
 <ellipse cx="100" cy="114" rx="18" ry="13" fill="#FBE3C2"/>
 <ellipse cx="100" cy="106" rx="7" ry="5" fill="#2B1B12"/>${sorriso(100,116)}
 <ellipse cx="100" cy="166" rx="12" ry="10" fill="#8B5A2B"/><path d="M90 160 Q100 150 110 160 Z" fill="#5E3A1A"/>
</g>`,
ourico: `<g class="corpo">
 <path d="M30 170 L22 140 L40 146 L36 112 L54 122 L56 88 L74 104 L84 70 L98 94 L114 64 L124 92 L142 68 L148 98 L168 80 L168 112 L188 104 L182 136 L200 140 L190 170 Z" fill="#6B4A32"/>
 <ellipse class="cauda" cx="190" cy="176" rx="8" ry="6" fill="#6B4A32"/>
 <ellipse cx="110" cy="160" rx="82" ry="42" fill="#7D573A"/>
 <path d="M60 140 L66 126 M90 130 L94 116 M124 128 L128 114 M156 136 L162 122" stroke="#4E3524" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="80" cy="198" rx="14" ry="8" fill="#E9C9A0"/><ellipse cx="140" cy="198" rx="14" ry="8" fill="#E9C9A0"/>
 <ellipse cx="110" cy="138" rx="56" ry="48" fill="#F2D6B0"/>
 <g class="orelha"><circle cx="66" cy="102" r="11" fill="#E9C9A0"/></g><g class="orelha"><circle cx="154" cy="102" r="11" fill="#E9C9A0"/></g>
 ${olhos(90,130,132,10,12)}${bochechas(72,148,152)}
 <ellipse cx="110" cy="152" rx="8" ry="6" fill="#2B1B12"/>${sorriso(110,162)}
</g>`,
javali: `<g class="corpo">
 <path class="cauda" d="M150 160 Q172 150 168 170 Q160 178 172 184" stroke="#5E3F2A" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="168" rx="50" ry="32" fill="#6E4A32"/>
 <rect x="76" y="184" width="16" height="18" rx="6" fill="#4A3020"/><rect x="128" y="184" width="16" height="18" rx="6" fill="#4A3020"/>
 <path d="M90 40 L96 26 L104 38 L110 22 L116 38 L124 26 L130 40 Z" fill="#4A3020"/>
 <g class="orelha"><path d="M52 66 L48 26 L84 48 Z" fill="#5E3F2A"/></g>
 <g class="orelha"><path d="M168 66 L172 26 L136 48 Z" fill="#5E3F2A"/></g>
 <ellipse cx="110" cy="90" rx="60" ry="52" fill="#7D563A"/>
 ${olhos(86,134,80,10,12)}${bochechas(64,156,102)}
 <ellipse cx="110" cy="118" rx="30" ry="20" fill="#D49A8A"/>
 <ellipse cx="100" cy="118" rx="5" ry="6" fill="#7A4040"/><ellipse cx="120" cy="118" rx="5" ry="6" fill="#7A4040"/>
 <path d="M80 126 Q74 114 78 104 Q84 116 88 124 Z" fill="#FFFDF2"/><path d="M140 126 Q146 114 142 104 Q136 116 132 124 Z" fill="#FFFDF2"/>
 ${sorriso(110,138)}
</g>`,
texugo: `<g class="corpo">
 <ellipse class="cauda" cx="160" cy="176" rx="14" ry="8" fill="#8A8F96"/>
 <ellipse cx="110" cy="170" rx="50" ry="30" fill="#8A8F96"/>
 <ellipse cx="84" cy="198" rx="15" ry="8" fill="#2E2E2E"/><ellipse cx="136" cy="198" rx="15" ry="8" fill="#2E2E2E"/>
 <g class="orelha"><circle cx="58" cy="62" r="13" fill="#2E2E2E"/><circle cx="58" cy="62" r="6" fill="#FFFFFF"/></g>
 <g class="orelha"><circle cx="162" cy="62" r="13" fill="#2E2E2E"/><circle cx="162" cy="62" r="6" fill="#FFFFFF"/></g>
 <ellipse cx="110" cy="96" rx="60" ry="54" fill="#FFFFFF"/>
 <path d="M66 58 Q80 48 92 58 L102 140 Q86 134 72 118 Z" fill="#2E2E2E"/>
 <path d="M154 58 Q140 48 128 58 L118 140 Q134 134 148 118 Z" fill="#2E2E2E"/>
 ${olhos(84,136,92,9,11)}${bochechas(62,158,118)}
 <ellipse cx="110" cy="124" rx="10" ry="7" fill="#2B1B12"/>${sorriso(110,140)}
</g>`,
castor: `<g class="corpo">
 <g class="cauda"><ellipse cx="170" cy="186" rx="34" ry="14" transform="rotate(-20 170 186)" fill="#5A3B26"/><path d="M148 184 L190 172 M152 194 L194 180" stroke="#463020" stroke-width="3"/></g>
 <ellipse cx="108" cy="168" rx="46" ry="32" fill="#9B6A40"/><ellipse cx="108" cy="176" rx="26" ry="20" fill="#C79A6C"/>
 <ellipse cx="84" cy="198" rx="14" ry="8" fill="#5A3B26"/><ellipse cx="132" cy="198" rx="14" ry="8" fill="#5A3B26"/>
 <g class="orelha"><circle cx="64" cy="50" r="12" fill="#7E5432"/></g><g class="orelha"><circle cx="156" cy="50" r="12" fill="#7E5432"/></g>
 <ellipse cx="110" cy="90" rx="58" ry="50" fill="#A8733F"/>
 ${olhos(88,132,80,10,12)}${bochechas(66,154,102)}
 <ellipse cx="110" cy="110" rx="26" ry="17" fill="#D9B58C"/>
 <ellipse cx="110" cy="100" rx="10" ry="7" fill="#2B1B12"/>
 <rect x="99" y="116" width="10" height="16" rx="2" fill="#FFFDF2"/><rect x="111" y="116" width="10" height="16" rx="2" fill="#FFFDF2"/>
 <path d="M96 114 Q110 120 124 114" stroke="#2B1B12" stroke-width="3" fill="none" stroke-linecap="round"/>
</g>`,
toupeira: `<g class="corpo">
 <path class="cauda" d="M152 180 Q170 178 172 166" stroke="#F7A3B5" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="110" cy="166" rx="54" ry="36" fill="#4A3F4E"/>
 <g><ellipse cx="62" cy="182" rx="26" ry="18" fill="#F7A3B5"/><path d="M42 172 L36 160 M52 166 L48 152 M64 164 L64 150 M76 166 L80 154" stroke="#F7A3B5" stroke-width="7" stroke-linecap="round"/></g>
 <g><ellipse cx="158" cy="182" rx="26" ry="18" fill="#F7A3B5"/><path d="M178 172 L184 160 M168 166 L172 152 M156 164 L156 150 M144 166 L140 154" stroke="#F7A3B5" stroke-width="7" stroke-linecap="round"/></g>
 <ellipse cx="110" cy="88" rx="58" ry="54" fill="#574A5C"/>
 <g class="orelha"><ellipse cx="110" cy="40" rx="10" ry="6" fill="#6A5C70"/></g>
 <path d="M84 86 Q90 80 96 86 M124 86 Q130 80 136 86" stroke="#2B1B12" stroke-width="3.5" fill="none" stroke-linecap="round"/>
 <g class="olhos"><circle cx="90" cy="92" r="1" fill="#574A5C"/></g>
 ${bochechas(70,150,104)}
 <ellipse cx="110" cy="120" rx="20" ry="14" fill="#F7A3B5"/><ellipse cx="104" cy="118" rx="3" ry="4" fill="#C9718A"/><ellipse cx="116" cy="118" rx="3" ry="4" fill="#C9718A"/>
 ${sorriso(110,142)}
</g>`,
morcego: `<g class="corpo">
 <path class="asa" d="M80 110 Q40 60 6 92 Q20 104 16 124 Q30 118 38 136 Q50 124 62 146 Q72 130 86 140 Z" fill="#4B3A66"/>
 <path class="asa" d="M140 110 Q180 60 214 92 Q200 104 204 124 Q190 118 182 136 Q170 124 158 146 Q148 130 134 140 Z" fill="#4B3A66"/>
 <ellipse cx="110" cy="160" rx="34" ry="34" fill="#6B5590"/><ellipse cx="110" cy="166" rx="18" ry="20" fill="#9A86BC"/>
 <ellipse cx="96" cy="198" rx="9" ry="6" fill="#3A2C50"/><ellipse cx="124" cy="198" rx="9" ry="6" fill="#3A2C50"/>
 <g class="orelha"><path d="M66 72 L56 18 L98 50 Z" fill="#6B5590"/><path d="M70 62 L64 32 L88 50 Z" fill="#F7B7C4"/></g>
 <g class="orelha"><path d="M154 72 L164 18 L122 50 Z" fill="#6B5590"/><path d="M150 62 L156 32 L132 50 Z" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="96" rx="50" ry="44" fill="#7A64A0"/>
 ${olhos(90,130,92,10,12)}${bochechas(72,148,112)}
 <ellipse cx="110" cy="108" rx="6" ry="4" fill="#2B1B12"/>${sorriso(110,114)}
 <path d="M101 117 L104 124 L107 117 Z M113 117 L116 124 L119 117 Z" fill="#FFFFFF"/>
</g>`,
lince: `<g class="corpo">
 <g class="cauda"><ellipse cx="160" cy="168" rx="12" ry="9" fill="#D9A866"/><ellipse cx="170" cy="164" rx="6" ry="6" fill="#2E2E2E"/></g>
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#D9A866"/><ellipse cx="110" cy="178" rx="24" ry="17" fill="#FFF3E0"/>
 <circle cx="88" cy="160" r="4" fill="#8B5A2B"/><circle cx="132" cy="158" r="4" fill="#8B5A2B"/><circle cx="96" cy="176" r="3" fill="#8B5A2B"/>
 <ellipse cx="88" cy="197" rx="14" ry="9" fill="#C8955A"/><ellipse cx="132" cy="197" rx="14" ry="9" fill="#C8955A"/>
 <g class="orelha"><path d="M54 70 L62 26 L98 50 Z" fill="#D9A866"/><path d="M60 30 L60 4 L66 28 Z" fill="#2E2E2E"/><path d="M66 58 L68 38 L86 52 Z" fill="#2E2E2E"/></g>
 <g class="orelha"><path d="M166 70 L158 26 L122 50 Z" fill="#D9A866"/><path d="M160 30 L160 4 L154 28 Z" fill="#2E2E2E"/><path d="M154 58 L152 38 L134 52 Z" fill="#2E2E2E"/></g>
 <path d="M52 100 L34 128 L60 118 Z M168 100 L186 128 L160 118 Z" fill="#FFF3E0"/>
 <ellipse cx="110" cy="92" rx="60" ry="50" fill="#E3B575"/>
 <circle cx="76" cy="64" r="3.5" fill="#8B5A2B"/><circle cx="144" cy="64" r="3.5" fill="#8B5A2B"/><circle cx="110" cy="56" r="3.5" fill="#8B5A2B"/>
 ${olhos(88,132,90)}${bochechas(68,152,110)}
 <ellipse cx="110" cy="116" rx="18" ry="13" fill="#FFF3E0"/>
 <path d="M104 106 L116 106 L110 113 Z" fill="#E86F8A"/>${sorriso(110,116)}
</g>`,
panda: `<g class="corpo">
 <ellipse class="cauda" cx="156" cy="182" rx="9" ry="8" fill="#FFFFFF"/>
 <ellipse cx="110" cy="168" rx="50" ry="32" fill="#FFFFFF"/>
 <ellipse cx="72" cy="164" rx="16" ry="24" transform="rotate(20 72 164)" fill="#222"/><ellipse cx="148" cy="164" rx="16" ry="24" transform="rotate(-20 148 164)" fill="#222"/>
 <ellipse cx="84" cy="196" rx="17" ry="10" fill="#222"/><ellipse cx="136" cy="196" rx="17" ry="10" fill="#222"/>
 <g class="orelha"><circle cx="62" cy="46" r="19" fill="#222"/></g><g class="orelha"><circle cx="158" cy="46" r="19" fill="#222"/></g>
 <ellipse cx="110" cy="92" rx="62" ry="54" fill="#FFFFFF"/>
 <ellipse cx="86" cy="88" rx="18" ry="22" transform="rotate(25 86 88)" fill="#222"/>
 <ellipse cx="134" cy="88" rx="18" ry="22" transform="rotate(-25 134 88)" fill="#222"/>
 <g class="olhos"><circle cx="88" cy="86" r="8" fill="#FFFFFF"/><circle cx="88" cy="87" r="5" fill="#2B1B12"/><circle cx="132" cy="86" r="8" fill="#FFFFFF"/><circle cx="132" cy="87" r="5" fill="#2B1B12"/></g>
 ${bochechas(64,156,114)}
 <ellipse cx="110" cy="112" rx="9" ry="6" fill="#222"/>${sorriso(110,122)}
 <path d="M144 172 L176 120" stroke="#7DBF5A" stroke-width="7" stroke-linecap="round"/><path d="M174 124 Q188 112 194 120 Q184 128 174 124 Z" fill="#5CA83A"/>
</g>`,
coala: `<g class="corpo">
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#9AA3AD"/><ellipse cx="110" cy="178" rx="24" ry="18" fill="#E8ECF0"/>
 <ellipse cx="88" cy="198" rx="14" ry="8" fill="#7E8892"/><ellipse cx="132" cy="198" rx="14" ry="8" fill="#7E8892"/>
 <g class="orelha"><circle cx="46" cy="66" r="30" fill="#9AA3AD"/><circle cx="48" cy="68" r="18" fill="#F1E6EE"/></g>
 <g class="orelha"><circle cx="174" cy="66" r="30" fill="#9AA3AD"/><circle cx="172" cy="68" r="18" fill="#F1E6EE"/></g>
 <ellipse cx="110" cy="96" rx="58" ry="50" fill="#A9B2BC"/>
 ${olhos(82,138,88,9,11)}${bochechas(68,152,118)}
 <ellipse cx="110" cy="104" rx="16" ry="22" fill="#2E2E2E"/><ellipse cx="104" cy="94" rx="4" ry="6" fill="#5A5A5A"/>
 ${sorriso(110,132)}
</g>`,
alce: `<g class="corpo">
 <ellipse class="cauda" cx="156" cy="160" rx="7" ry="9" fill="#4A2E1A"/>
 <ellipse cx="110" cy="170" rx="46" ry="30" fill="#5A3820"/>
 <rect x="78" y="184" width="15" height="20" rx="6" fill="#3A2414"/><rect x="127" y="184" width="15" height="20" rx="6" fill="#3A2414"/>
 <path d="M76 52 Q40 52 18 22 Q30 26 34 14 Q40 26 46 14 Q50 28 58 18 Q60 32 70 26 Q72 40 82 44 Z" fill="#D9B98A"/>
 <path d="M144 52 Q180 52 202 22 Q190 26 186 14 Q180 26 174 14 Q170 28 162 18 Q160 32 150 26 Q148 40 138 44 Z" fill="#D9B98A"/>
 <g class="orelha"><ellipse cx="50" cy="78" rx="20" ry="9" transform="rotate(-20 50 78)" fill="#5A3820"/></g>
 <g class="orelha"><ellipse cx="170" cy="78" rx="20" ry="9" transform="rotate(20 170 78)" fill="#5A3820"/></g>
 <ellipse cx="110" cy="88" rx="50" ry="44" fill="#6B4428"/>
 <ellipse cx="110" cy="128" rx="38" ry="26" fill="#8A5C3A"/>
 <path d="M100 150 Q110 172 120 150 Z" fill="#4A2E1A"/>
 ${olhos(88,132,82,10,12)}${bochechas(66,154,104)}
 <ellipse cx="96" cy="126" rx="6" ry="5" fill="#2B1B12"/><ellipse cx="124" cy="126" rx="6" ry="5" fill="#2B1B12"/>${sorriso(110,140)}
</g>`,
doninha: `<g class="corpo">
 <path class="cauda" d="M150 186 Q196 190 204 150 Q206 136 196 134 Q192 168 150 172 Z" fill="#8A5530"/>
 <ellipse cx="110" cy="172" rx="56" ry="24" fill="#9A6236"/><ellipse cx="104" cy="178" rx="38" ry="14" fill="#FFF6E8"/>
 <ellipse cx="72" cy="198" rx="12" ry="7" fill="#7A4626"/><ellipse cx="148" cy="198" rx="12" ry="7" fill="#7A4626"/>
 <g class="orelha"><circle cx="70" cy="60" r="15" fill="#9A6236"/><circle cx="70" cy="60" r="7" fill="#F7B7C4"/></g>
 <g class="orelha"><circle cx="150" cy="60" r="15" fill="#9A6236"/><circle cx="150" cy="60" r="7" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="96" rx="52" ry="44" fill="#A86C3C"/>
 <path d="M64 108 Q110 96 156 108 Q150 142 110 144 Q70 142 64 108 Z" fill="#FFF6E8"/>
 ${olhos(88,132,88,10,12)}${bochechas(70,150,112)}
 <ellipse cx="110" cy="112" rx="7" ry="5" fill="#2B1B12"/>${sorriso(110,122)}
</g>`,
gamo: `<g class="corpo">
 <ellipse class="cauda" cx="154" cy="158" rx="8" ry="12" fill="#3A2414"/>
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#B5652E"/>
 <circle cx="84" cy="158" r="5" fill="#FFF"/><circle cx="102" cy="152" r="5" fill="#FFF"/><circle cx="120" cy="152" r="5" fill="#FFF"/><circle cx="138" cy="158" r="5" fill="#FFF"/><circle cx="92" cy="172" r="4" fill="#FFF"/><circle cx="128" cy="172" r="4" fill="#FFF"/><circle cx="110" cy="166" r="4" fill="#FFF"/>
 <rect x="80" y="186" width="13" height="18" rx="6" fill="#7A4022"/><rect x="127" y="186" width="13" height="18" rx="6" fill="#7A4022"/>
 <path d="M84 50 Q70 36 56 20 Q66 18 70 26 Q72 12 80 16 Q78 28 90 40 Z" fill="#7A5A3A"/>
 <path d="M136 50 Q150 36 164 20 Q154 18 150 26 Q148 12 140 16 Q142 28 130 40 Z" fill="#7A5A3A"/>
 <g class="orelha"><ellipse cx="46" cy="74" rx="22" ry="10" transform="rotate(-25 46 74)" fill="#B5652E"/><ellipse cx="48" cy="74" rx="12" ry="5" transform="rotate(-25 48 74)" fill="#F7B7C4"/></g>
 <g class="orelha"><ellipse cx="174" cy="74" rx="22" ry="10" transform="rotate(25 174 74)" fill="#B5652E"/><ellipse cx="172" cy="74" rx="12" ry="5" transform="rotate(25 172 74)" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="94" rx="52" ry="48" fill="#C2713A"/>
 <circle cx="76" cy="62" r="4" fill="#FFF"/><circle cx="144" cy="62" r="4" fill="#FFF"/>
 ${olhos(88,132,88)}${bochechas(68,152,110)}
 <ellipse cx="110" cy="122" rx="20" ry="15" fill="#F2DCC0"/>
 <ellipse cx="110" cy="114" rx="8" ry="6" fill="#2B1B12"/>${sorriso(110,126)}
</g>`,
corco: `<g class="corpo">
 <ellipse cx="110" cy="174" rx="38" ry="26" fill="#A8683A"/>
 <ellipse class="cauda" cx="146" cy="168" rx="14" ry="16" fill="#FFFFFF"/>
 <rect x="86" y="188" width="11" height="16" rx="5" fill="#6E4024"/><rect x="123" y="188" width="11" height="16" rx="5" fill="#6E4024"/>
 <path d="M96 50 L92 28 M124 50 L128 28" stroke="#6E4024" stroke-width="6" stroke-linecap="round"/>
 <g class="orelha"><ellipse cx="54" cy="70" rx="22" ry="12" transform="rotate(-30 54 70)" fill="#A8683A"/><ellipse cx="56" cy="70" rx="12" ry="6" transform="rotate(-30 56 70)" fill="#F7B7C4"/></g>
 <g class="orelha"><ellipse cx="166" cy="70" rx="22" ry="12" transform="rotate(30 166 70)" fill="#A8683A"/><ellipse cx="164" cy="70" rx="12" ry="6" transform="rotate(30 164 70)" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="98" rx="50" ry="46" fill="#B87644"/>
 ${olhos(90,130,92)}${bochechas(70,150,114)}
 <ellipse cx="110" cy="124" rx="18" ry="13" fill="#FFFFFF"/>
 <ellipse cx="110" cy="118" rx="9" ry="6" fill="#2B1B12"/>${sorriso(110,129)}
</g>`,
lebre: `<g class="corpo">
 <circle class="cauda" cx="152" cy="176" r="10" fill="#FFFFFF"/>
 <ellipse cx="110" cy="172" rx="44" ry="30" fill="#C9A26A"/><ellipse cx="110" cy="180" rx="22" ry="18" fill="#F3E4C8"/>
 <ellipse cx="82" cy="198" rx="20" ry="8" fill="#B08850"/><ellipse cx="138" cy="198" rx="20" ry="8" fill="#B08850"/>
 <g class="orelha"><ellipse cx="80" cy="46" rx="13" ry="34" transform="rotate(-12 80 36)" fill="#C9A26A"/><ellipse cx="80" cy="40" rx="6" ry="24" transform="rotate(-12 80 40)" fill="#F3E4C8"/><path d="M76 14 Q86 10 90 20 Q82 24 72 20 Z" fill="#2B1B12"/></g>
 <g class="orelha"><ellipse cx="140" cy="46" rx="13" ry="34" transform="rotate(12 140 36)" fill="#C9A26A"/><ellipse cx="140" cy="40" rx="6" ry="24" transform="rotate(12 140 40)" fill="#F3E4C8"/><path d="M144 14 Q134 10 130 20 Q138 24 148 20 Z" fill="#2B1B12"/></g>
 <ellipse cx="110" cy="104" rx="50" ry="44" fill="#D4AE76"/>
 ${olhos(90,130,98,10,12)}${bochechas(70,150,120)}
 <ellipse cx="110" cy="128" rx="16" ry="11" fill="#F3E4C8"/>
 <path d="M104 120 L116 120 L110 127 Z" fill="#E07A8A"/>${sorriso(110,132)}
</g>`,
salamandra: `<g class="corpo">
 <path class="cauda" d="M140 186 Q190 196 206 160 Q210 146 200 150 Q186 176 140 172 Z" fill="#1F1F24"/>
 <ellipse cx="110" cy="178" rx="50" ry="20" fill="#26262C"/>
 <ellipse cx="96" cy="174" rx="8" ry="5" fill="#FFD21F"/><ellipse cx="126" cy="180" rx="7" ry="5" fill="#FFD21F"/><circle cx="188" cy="168" r="4" fill="#FFD21F"/>
 <ellipse cx="62" cy="198" rx="14" ry="7" fill="#1F1F24"/><ellipse cx="158" cy="198" rx="14" ry="7" fill="#1F1F24"/>
 <ellipse cx="110" cy="104" rx="64" ry="50" fill="#2E2E36"/>
 <ellipse class="orelha" cx="66" cy="74" rx="14" ry="9" fill="#FFD21F"/><ellipse class="orelha" cx="154" cy="74" rx="14" ry="9" fill="#FFD21F"/>
 <circle cx="110" cy="62" r="8" fill="#FFD21F"/><circle cx="62" cy="122" r="6" fill="#FFD21F"/><circle cx="158" cy="122" r="6" fill="#FFD21F"/>
 ${olhos(88,132,98,11,13)}${bochechas(74,146,124)}
 ${sorriso(110,130,'#FFD21F')}
</g>`,
ra: `<g class="corpo">
 <ellipse cx="62" cy="190" rx="30" ry="12" fill="#5DBB4A"/><ellipse cx="158" cy="190" rx="30" ry="12" fill="#5DBB4A"/>
 <ellipse cx="110" cy="164" rx="48" ry="36" fill="#7CD65E"/><ellipse cx="110" cy="174" rx="30" ry="24" fill="#E8F7C8"/>
 <ellipse cx="86" cy="200" rx="13" ry="6" fill="#5DBB4A"/><ellipse cx="134" cy="200" rx="13" ry="6" fill="#5DBB4A"/>
 <ellipse cx="110" cy="104" rx="68" ry="44" fill="#86DE66"/>
 <g class="orelha"><circle cx="76" cy="66" r="24" fill="#86DE66"/></g><g class="orelha"><circle cx="144" cy="66" r="24" fill="#86DE66"/></g>
 <circle cx="76" cy="66" r="15" fill="#FFFFFF"/><circle cx="144" cy="66" r="15" fill="#FFFFFF"/>
 ${olhos(76,144,68,9,11)}${bochechas(60,160,114)}
 <path d="M76 116 Q110 136 144 116" stroke="#2B1B12" stroke-width="4" fill="none" stroke-linecap="round"/>
</g>`,
guaxinim: `<g class="corpo">
 <g class="cauda"><path d="M146 186 Q200 184 204 130 Q194 120 184 126 Q186 168 146 168 Z" fill="#8E8E96"/><path d="M200 146 L184 140 M196 164 L176 160 M178 180 L164 172" stroke="#2E2E34" stroke-width="8" stroke-linecap="round"/></g>
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#8E8E96"/><ellipse cx="110" cy="178" rx="24" ry="18" fill="#D8D8DE"/>
 <ellipse cx="88" cy="198" rx="13" ry="8" fill="#2E2E34"/><ellipse cx="132" cy="198" rx="13" ry="8" fill="#2E2E34"/>
 <g class="orelha"><path d="M56 70 L62 26 L96 52 Z" fill="#8E8E96"/><path d="M64 60 L66 38 L84 52 Z" fill="#FFFFFF"/></g>
 <g class="orelha"><path d="M164 70 L158 26 L124 52 Z" fill="#8E8E96"/><path d="M156 60 L154 38 L136 52 Z" fill="#FFFFFF"/></g>
 <ellipse cx="110" cy="92" rx="60" ry="48" fill="#9E9EA6"/>
 <path d="M52 92 Q80 70 110 92 Q140 70 168 92 Q150 112 110 100 Q70 112 52 92 Z" fill="#2E2E34"/>
 <path d="M90 68 Q110 60 130 68" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round"/>
 ${olhos(84,136,88,10,12)}${bochechas(66,154,112)}
 <ellipse cx="110" cy="122" rx="22" ry="16" fill="#FFFFFF"/>
 <ellipse cx="110" cy="114" rx="8" ry="6" fill="#2B1B12"/>${sorriso(110,126)}
</g>`,
gamba: `<g class="corpo">
 <path class="cauda" d="M146 184 Q200 190 200 146 Q200 128 186 132 Q190 150 182 160 Q170 172 146 170 Z" fill="#F2A7B6"/>
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#A3A3AB"/><ellipse cx="110" cy="178" rx="24" ry="18" fill="#E2E2E8"/>
 <ellipse cx="88" cy="198" rx="13" ry="8" fill="#F2A7B6"/><ellipse cx="132" cy="198" rx="13" ry="8" fill="#F2A7B6"/>
 <g class="orelha"><circle cx="62" cy="56" r="20" fill="#3A3A40"/><circle cx="62" cy="56" r="11" fill="#F2A7B6"/></g>
 <g class="orelha"><circle cx="158" cy="56" r="20" fill="#3A3A40"/><circle cx="158" cy="56" r="11" fill="#F2A7B6"/></g>
 <ellipse cx="110" cy="94" rx="58" ry="48" fill="#A3A3AB"/>
 <path d="M80 50 Q110 40 140 50 Q130 100 140 136 Q110 150 80 136 Q90 100 80 50 Z" fill="#FFFFFF"/>
 ${olhos(82,138,90,10,12)}${bochechas(66,154,114)}
 <ellipse cx="110" cy="128" rx="8" ry="6" fill="#F27E93"/>${sorriso(110,138)}
</g>`,
'porco-espinho': `<g class="corpo">
 <path d="M60 150 L150 40 M70 160 L180 70 M80 172 L204 106 M60 140 L110 26 M90 180 L206 150 M54 130 L74 24" stroke="#3E2E22" stroke-width="7" stroke-linecap="round"/>
 <path d="M66 146 L160 52 M84 166 L196 120 M58 134 L92 30" stroke="#F2EAD8" stroke-width="4" stroke-linecap="round"/>
 <ellipse class="cauda" cx="176" cy="180" rx="12" ry="8" fill="#3E2E22"/>
 <ellipse cx="104" cy="172" rx="48" ry="28" fill="#5A4430"/>
 <ellipse cx="80" cy="198" rx="13" ry="7" fill="#3E2E22"/><ellipse cx="128" cy="198" rx="13" ry="7" fill="#3E2E22"/>
 <g class="orelha"><circle cx="54" cy="80" r="11" fill="#7A6048"/></g><g class="orelha"><circle cx="130" cy="72" r="11" fill="#7A6048"/></g>
 <ellipse cx="88" cy="114" rx="50" ry="42" fill="#7A6048"/>
 <ellipse cx="80" cy="132" rx="22" ry="15" fill="#B89878"/>
 ${olhos(68,108,108,10,12)}${bochechas(52,124,130)}
 <ellipse cx="80" cy="126" rx="8" ry="6" fill="#2B1B12"/>${sorriso(80,138)}
</g>`,
bisonte: `<g class="corpo">
 <path class="cauda" d="M166 160 Q186 166 184 186" stroke="#3A2414" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="120" cy="164" rx="56" ry="34" fill="#6B4426"/>
 <rect x="76" y="182" width="16" height="22" rx="6" fill="#3A2414"/><rect x="146" y="182" width="16" height="22" rx="6" fill="#3A2414"/>
 <path d="M64 50 Q110 6 170 46 Q190 90 166 126 L60 126 Z" fill="#4A2E18"/>
 <path d="M42 70 Q26 60 30 40 Q40 56 54 58 Z M178 70 Q194 60 190 40 Q180 56 166 58 Z" fill="#E8DCC4"/>
 <g class="orelha"><ellipse cx="44" cy="86" rx="14" ry="8" fill="#4A2E18"/></g><g class="orelha"><ellipse cx="176" cy="86" rx="14" ry="8" fill="#4A2E18"/></g>
 <ellipse cx="110" cy="96" rx="62" ry="54" fill="#5A381E"/>
 <path d="M64 60 Q72 40 90 50 Q100 34 116 46 Q132 34 142 52 Q160 44 158 66 Q110 54 64 60 Z" fill="#3A2414"/>
 <path d="M82 140 Q110 186 138 140 Z" fill="#3A2414"/>
 ${olhos(86,134,90,10,12)}${bochechas(66,154,112)}
 <ellipse cx="110" cy="126" rx="26" ry="16" fill="#8A6040"/>
 <ellipse cx="100" cy="124" rx="5" ry="4" fill="#2B1B12"/><ellipse cx="120" cy="124" rx="5" ry="4" fill="#2B1B12"/>${sorriso(110,134)}
</g>`,
arminho: `<g class="corpo">
 <g class="cauda"><path d="M150 186 Q194 190 204 152 Q200 144 192 150 Q186 172 150 172 Z" fill="#FFFFFF"/><path d="M204 152 Q206 136 196 132 Q188 140 192 150 Z" fill="#1F1F24"/></g>
 <ellipse cx="110" cy="172" rx="54" ry="24" fill="#F4F4F8"/>
 <ellipse cx="74" cy="198" rx="12" ry="7" fill="#E2E2EA"/><ellipse cx="146" cy="198" rx="12" ry="7" fill="#E2E2EA"/>
 <g class="orelha"><circle cx="70" cy="60" r="15" fill="#F4F4F8"/><circle cx="70" cy="60" r="7" fill="#F7B7C4"/></g>
 <g class="orelha"><circle cx="150" cy="60" r="15" fill="#F4F4F8"/><circle cx="150" cy="60" r="7" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="96" rx="52" ry="44" fill="#FFFFFF"/>
 ${olhos(88,132,90,10,12)}${bochechas(70,150,112)}
 <ellipse cx="110" cy="112" rx="7" ry="5" fill="#F27E93"/>${sorriso(110,122)}
</g>`,
marta: `<g class="corpo">
 <path class="cauda" d="M146 188 Q204 194 206 140 Q204 120 188 124 Q190 168 146 168 Z" fill="#4E2E18"/>
 <ellipse cx="110" cy="170" rx="46" ry="28" fill="#5E3820"/>
 <path d="M84 150 Q110 140 136 150 Q130 178 110 182 Q90 178 84 150 Z" fill="#FFC93C"/>
 <ellipse cx="86" cy="198" rx="13" ry="7" fill="#3A2210"/><ellipse cx="134" cy="198" rx="13" ry="7" fill="#3A2210"/>
 <g class="orelha"><circle cx="64" cy="58" r="17" fill="#5E3820"/><circle cx="64" cy="58" r="8" fill="#FFE08A"/></g>
 <g class="orelha"><circle cx="156" cy="58" r="17" fill="#5E3820"/><circle cx="156" cy="58" r="8" fill="#FFE08A"/></g>
 <ellipse cx="110" cy="94" rx="54" ry="46" fill="#6E4428"/>
 <path d="M78 124 Q110 150 142 124 Q130 148 110 150 Q90 148 78 124 Z" fill="#FFC93C"/>
 ${olhos(88,132,88,10,12)}${bochechas(70,150,110)}
 <ellipse cx="110" cy="116" rx="16" ry="11" fill="#C49A70"/>
 <ellipse cx="110" cy="110" rx="7" ry="5" fill="#2B1B12"/>${sorriso(110,120)}
</g>`,
cuco: `<g class="corpo">
 <path class="cauda" d="M140 170 L196 200 L204 186 L150 156 Z" fill="#5E6670"/>
 <ellipse cx="110" cy="164" rx="46" ry="36" fill="#7E8892"/>
 <ellipse cx="110" cy="172" rx="30" ry="26" fill="#F4F1E8"/>
 <path d="M86 160 H134 M84 170 H136 M86 180 H134 M92 190 H128" stroke="#5E6670" stroke-width="3"/>
 <path class="asa" d="M64 140 Q30 160 40 190 Q66 186 80 160 Z" fill="#5E6670"/>
 <path d="M94 196 L94 206 M126 196 L126 206" stroke="#F2B21F" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="110" cy="88" rx="56" ry="50" fill="#8E98A2"/>
 ${olhos(88,132,84,10,12)}${bochechas(68,152,106)}
 <circle cx="88" cy="84" r="15" fill="none" stroke="#FFC93C" stroke-width="3"/><circle cx="132" cy="84" r="15" fill="none" stroke="#FFC93C" stroke-width="3"/>
 <path d="M98 104 L122 104 L110 124 Z" fill="#3A3A40"/><path d="M98 104 L122 104 L110 110 Z" fill="#F2B21F"/>
</g>`
});
