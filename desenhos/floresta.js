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
</g>`
});
