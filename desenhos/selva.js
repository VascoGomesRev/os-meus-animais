'use strict';
Object.assign(DESENHOS, {
leao:`<g class="corpo">
 <g class="cauda"><path d="M152 172 Q190 170 186 136" stroke="#E8A93E" stroke-width="8" stroke-linecap="round" fill="none"/><circle cx="186" cy="132" r="9" fill="#B5651D"/></g>
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#F2B84B"/><ellipse cx="110" cy="178" rx="24" ry="17" fill="#FBE0A6"/>
 <ellipse cx="88" cy="197" rx="14" ry="9" fill="#F2B84B"/><ellipse cx="132" cy="197" rx="14" ry="9" fill="#F2B84B"/>
 <circle cx="110" cy="90" r="78" fill="#B5651D"/>
 <circle cx="60" cy="42" r="22" fill="#C9772A"/><circle cx="160" cy="42" r="22" fill="#C9772A"/><circle cx="38" cy="96" r="22" fill="#C9772A"/><circle cx="182" cy="96" r="22" fill="#C9772A"/><circle cx="60" cy="146" r="22" fill="#C9772A"/><circle cx="160" cy="146" r="22" fill="#C9772A"/><circle cx="110" cy="20" r="20" fill="#C9772A"/>
 <circle class="orelha" cx="72" cy="50" r="13" fill="#F2B84B"/><circle class="orelha" cx="148" cy="50" r="13" fill="#F2B84B"/>
 <ellipse cx="110" cy="94" rx="52" ry="48" fill="#F7C65E"/>
 ${olhos(90,130,86)}${bochechas(72,148,108)}
 <ellipse cx="110" cy="116" rx="20" ry="14" fill="#FFF0D0"/>
 <path d="M102 104 L118 104 L110 112 Z" fill="#8A4B22"/>${sorriso(110,116)}
</g>`,
tigre:`<g class="corpo">
 <path class="cauda" d="M152 174 Q194 172 188 132" stroke="#F28A2E" stroke-width="11" stroke-linecap="round" fill="none"/>
 <path d="M180 160 L194 156 M184 146 L196 142" stroke="#2B1B12" stroke-width="4" stroke-linecap="round"/>
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#F28A2E"/><ellipse cx="110" cy="178" rx="22" ry="16" fill="#FFF3E2"/>
 <path d="M74 158 L84 166 M146 158 L136 166 M78 176 L88 180 M142 176 L132 180" stroke="#2B1B12" stroke-width="4" stroke-linecap="round"/>
 <ellipse cx="88" cy="197" rx="14" ry="9" fill="#F28A2E"/><ellipse cx="132" cy="197" rx="14" ry="9" fill="#F28A2E"/>
 <g class="orelha"><circle cx="64" cy="46" r="18" fill="#F28A2E"/><circle cx="64" cy="46" r="9" fill="#FFF3E2"/></g>
 <g class="orelha"><circle cx="156" cy="46" r="18" fill="#F28A2E"/><circle cx="156" cy="46" r="9" fill="#FFF3E2"/></g>
 <ellipse cx="110" cy="92" rx="62" ry="54" fill="#F59A3C"/>
 <path d="M100 42 L104 58 M110 40 L110 60 M120 42 L116 58 M50 82 L68 86 M48 98 L66 98 M170 82 L152 86 M172 98 L154 98" stroke="#2B1B12" stroke-width="4.5" stroke-linecap="round"/>
 <ellipse cx="110" cy="116" rx="30" ry="20" fill="#FFF3E2"/>
 ${olhos(88,132,86)}${bochechas(66,154,110)}
 <path d="M103 104 L117 104 L110 112 Z" fill="#E86F8A"/>${sorriso(110,116)}
</g>`,
elefante:`<g class="corpo">
 <path class="cauda" d="M156 170 Q178 170 180 150" stroke="#8F9BB3" stroke-width="5" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="168" rx="50" ry="32" fill="#A9B4CC"/>
 <rect x="74" y="178" width="26" height="24" rx="10" fill="#A9B4CC"/><rect x="120" y="178" width="26" height="24" rx="10" fill="#A9B4CC"/>
 <path class="orelha" d="M62 52 Q4 40 10 104 Q20 140 66 118 Z" fill="#9AA6C0"/><path d="M58 64 Q20 58 24 102 Q32 124 60 110 Z" fill="#F4B6C6"/>
 <path class="orelha" d="M158 52 Q216 40 210 104 Q200 140 154 118 Z" fill="#9AA6C0"/><path d="M162 64 Q200 58 196 102 Q188 124 160 110 Z" fill="#F4B6C6"/>
 <ellipse cx="110" cy="86" rx="54" ry="52" fill="#B3BED6"/>
 <path d="M118 112 L132 128 M102 112 L88 128" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>
 <path d="M100 100 Q96 140 112 156 Q128 160 130 146 Q118 146 116 130 L120 100 Z" fill="#8F9BB3"/>
 ${olhos(88,132,80)}${bochechas(70,150,104)}
</g>`,
girafa:`<g class="corpo">
 <path class="cauda" d="M146 180 Q170 176 172 156" stroke="#E8B04A" stroke-width="5" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="178" rx="38" ry="22" fill="#F5C45E"/>
 <rect x="84" y="182" width="14" height="20" rx="6" fill="#F5C45E"/><rect x="122" y="182" width="14" height="20" rx="6" fill="#F5C45E"/>
 <rect x="96" y="96" width="28" height="84" rx="12" fill="#F5C45E"/>
 <circle cx="104" cy="120" r="6" fill="#B86A2A"/><circle cx="116" cy="142" r="7" fill="#B86A2A"/><circle cx="104" cy="164" r="6" fill="#B86A2A"/><circle cx="92" cy="176" r="6" fill="#B86A2A"/><circle cx="130" cy="176" r="6" fill="#B86A2A"/>
 <rect x="86" y="16" width="7" height="22" rx="3" fill="#B86A2A"/><rect x="127" y="16" width="7" height="22" rx="3" fill="#B86A2A"/><circle cx="89.5" cy="16" r="7" fill="#8A4B22"/><circle cx="130.5" cy="16" r="7" fill="#8A4B22"/>
 <ellipse class="orelha" cx="62" cy="50" rx="16" ry="8" transform="rotate(-20 62 50)" fill="#F5C45E"/><ellipse class="orelha" cx="158" cy="50" rx="16" ry="8" transform="rotate(20 158 50)" fill="#F5C45E"/>
 <ellipse cx="110" cy="70" rx="44" ry="42" fill="#F8CF6E"/>
 <circle cx="80" cy="46" r="6" fill="#B86A2A"/><circle cx="142" cy="52" r="7" fill="#B86A2A"/>
 <ellipse cx="110" cy="96" rx="30" ry="18" fill="#FBE3B0"/>
 <circle cx="102" cy="92" r="3" fill="#8A4B22"/><circle cx="118" cy="92" r="3" fill="#8A4B22"/>
 ${olhos(92,128,66,9,11)}${bochechas(76,144,84)}${sorriso(110,102)}
</g>`,
zebra:`<g class="corpo">
 <g class="cauda"><path d="M152 170 Q178 172 180 148" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" fill="none"/><ellipse cx="180" cy="144" rx="5" ry="9" fill="#2B2B2B"/></g>
 <ellipse cx="110" cy="170" rx="46" ry="28" fill="#FFFFFF" stroke="#DDD" stroke-width="2"/>
 <path d="M84 146 Q90 170 82 192 M104 142 Q112 170 104 196 M126 144 Q134 170 128 196 M146 152 Q150 170 144 188" stroke="#2B2B2B" stroke-width="6" fill="none" stroke-linecap="round"/>
 <rect x="80" y="184" width="16" height="18" rx="6" fill="#2B2B2B"/><rect x="124" y="184" width="16" height="18" rx="6" fill="#2B2B2B"/>
 <path d="M78 34 Q110 0 142 34 L134 48 L86 48 Z" fill="#2B2B2B"/>
 <ellipse class="orelha" cx="66" cy="42" rx="10" ry="20" transform="rotate(-25 66 42)" fill="#FFFFFF" stroke="#DDD" stroke-width="2"/><ellipse class="orelha" cx="154" cy="42" rx="10" ry="20" transform="rotate(25 154 42)" fill="#FFFFFF" stroke="#DDD" stroke-width="2"/>
 <ellipse cx="110" cy="86" rx="52" ry="50" fill="#FFFFFF" stroke="#DDD" stroke-width="2"/>
 <path d="M64 70 L80 74 M60 88 L76 88 M156 70 L140 74 M160 88 L144 88 M100 44 L104 58 M120 44 L116 58" stroke="#2B2B2B" stroke-width="6" stroke-linecap="round"/>
 <ellipse cx="110" cy="118" rx="30" ry="20" fill="#5A5A5A"/>
 <ellipse cx="100" cy="114" rx="4" ry="3" fill="#2B2B2B"/><ellipse cx="120" cy="114" rx="4" ry="3" fill="#2B2B2B"/>
 ${olhos(88,132,84)}${bochechas(66,154,100)}${sorriso(110,124,'#FFFFFF')}
</g>`,
macaco:`<g class="corpo">
 <path class="cauda" d="M144 180 Q196 184 192 140 Q188 112 166 124" stroke="#8B5A2B" stroke-width="9" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="170" rx="36" ry="28" fill="#8B5A2B"/><ellipse cx="110" cy="176" rx="20" ry="16" fill="#E8C49A"/>
 <ellipse cx="90" cy="198" rx="12" ry="8" fill="#8B5A2B"/><ellipse cx="130" cy="198" rx="12" ry="8" fill="#8B5A2B"/>
 <g class="orelha"><circle cx="46" cy="96" r="20" fill="#8B5A2B"/><circle cx="46" cy="96" r="11" fill="#E8C49A"/></g>
 <g class="orelha"><circle cx="174" cy="96" r="20" fill="#8B5A2B"/><circle cx="174" cy="96" r="11" fill="#E8C49A"/></g>
 <ellipse cx="110" cy="92" rx="58" ry="54" fill="#9C6634"/>
 <path d="M110 56 Q78 46 70 80 Q66 110 84 120 Q110 134 136 120 Q154 110 150 80 Q142 46 110 56 Z" fill="#E8C49A"/>
 ${olhos(92,128,84,10,12)}${bochechas(76,144,106)}
 <circle cx="105" cy="104" r="2.5" fill="#5A3A1A"/><circle cx="115" cy="104" r="2.5" fill="#5A3A1A"/>${sorriso(110,114,'#5A3A1A')}
</g>`,
gorila:`<g class="corpo">
 <ellipse cx="110" cy="164" rx="66" ry="40" fill="#3A3A40"/><ellipse cx="110" cy="166" rx="34" ry="26" fill="#5C5C66"/>
 <ellipse cx="40" cy="176" rx="18" ry="28" fill="#3A3A40"/><ellipse cx="180" cy="176" rx="18" ry="28" fill="#3A3A40"/>
 <ellipse cx="40" cy="198" rx="18" ry="8" fill="#5C5C66"/><ellipse cx="180" cy="198" rx="18" ry="8" fill="#5C5C66"/>
 <ellipse cx="88" cy="198" rx="16" ry="8" fill="#3A3A40"/><ellipse cx="132" cy="198" rx="16" ry="8" fill="#3A3A40"/>
 <circle class="orelha" cx="52" cy="84" r="12" fill="#3A3A40"/><circle class="orelha" cx="168" cy="84" r="12" fill="#3A3A40"/>
 <ellipse cx="110" cy="80" rx="60" ry="58" fill="#3A3A40"/>
 <path d="M70 76 Q72 104 90 112 Q110 120 130 112 Q148 104 150 76 Q130 64 110 74 Q90 64 70 76 Z" fill="#7A7A86"/>
 <path d="M70 64 Q110 50 150 64" stroke="#2A2A2E" stroke-width="8" fill="none" stroke-linecap="round"/>
 ${olhos(92,128,82,9,11)}${bochechas(78,142,104)}
 <ellipse cx="104" cy="100" rx="4" ry="3" fill="#2A2A2E"/><ellipse cx="116" cy="100" rx="4" ry="3" fill="#2A2A2E"/>${sorriso(110,110,'#2A2A2E')}
</g>`,
hipopotamo:`<g class="corpo">
 <path class="cauda" d="M160 166 Q176 164 176 150" stroke="#9A8BB8" stroke-width="6" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="168" rx="56" ry="34" fill="#A897C8"/>
 <rect x="70" y="182" width="26" height="20" rx="9" fill="#9A8BB8"/><rect x="124" y="182" width="26" height="20" rx="9" fill="#9A8BB8"/>
 <ellipse class="orelha" cx="66" cy="34" rx="10" ry="12" fill="#9A8BB8"/><ellipse class="orelha" cx="154" cy="34" rx="10" ry="12" fill="#9A8BB8"/>
 <ellipse cx="110" cy="62" rx="50" ry="36" fill="#B5A6D4"/>
 ${olhos(88,132,56,10,12)}
 <ellipse cx="110" cy="114" rx="76" ry="46" fill="#B5A6D4"/>
 <path d="M50 108 Q110 170 170 108 Q110 124 50 108 Z" fill="#C2405A"/>
 <path d="M70 114 L76 128 L82 116 Z M138 116 L144 128 L150 114 Z" fill="#FFFFFF"/>
 <ellipse cx="88" cy="94" rx="6" ry="4" fill="#7E6EA0"/><ellipse cx="132" cy="94" rx="6" ry="4" fill="#7E6EA0"/>
 ${bochechas(52,168,96)}
</g>`,
rinoceronte:`<g class="corpo">
 <path class="cauda" d="M160 164 Q178 164 178 146" stroke="#8C8C8C" stroke-width="5" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="168" rx="54" ry="32" fill="#9E9E9E"/>
 <rect x="72" y="182" width="24" height="20" rx="8" fill="#8C8C8C"/><rect x="124" y="182" width="24" height="20" rx="8" fill="#8C8C8C"/>
 <ellipse class="orelha" cx="62" cy="50" rx="10" ry="18" transform="rotate(-20 62 50)" fill="#8C8C8C"/><ellipse class="orelha" cx="158" cy="50" rx="10" ry="18" transform="rotate(20 158 50)" fill="#8C8C8C"/>
 <ellipse cx="110" cy="92" rx="56" ry="52" fill="#ABABAB"/>
 <path d="M96 92 Q110 14 124 92 Z" fill="#F3E9D2"/>
 <path d="M102 66 Q110 46 118 66 Z" fill="#F3E9D2"/>
 <ellipse cx="110" cy="120" rx="34" ry="20" fill="#BDBDBD"/>
 ${olhos(80,140,88,9,11)}${bochechas(66,154,108)}
 <ellipse cx="100" cy="114" rx="4" ry="3" fill="#555"/><ellipse cx="120" cy="114" rx="4" ry="3" fill="#555"/>${sorriso(110,126,'#555')}
</g>`,
crocodilo:`<g class="corpo">
 <path class="cauda" d="M150 176 Q200 180 206 150 Q196 164 160 160 Z" fill="#4E9A3A"/>
 <ellipse cx="116" cy="172" rx="46" ry="24" fill="#5BAA45"/><ellipse cx="116" cy="180" rx="28" ry="12" fill="#C9E39A"/>
 <path d="M96 148 L102 140 L108 148 L114 140 L120 148 L126 140 L132 148" fill="#3E7F2E"/>
 <ellipse cx="88" cy="198" rx="14" ry="7" fill="#4E9A3A"/><ellipse cx="144" cy="198" rx="14" ry="7" fill="#4E9A3A"/>
 <circle cx="76" cy="62" r="20" fill="#5BAA45"/><circle cx="124" cy="62" r="20" fill="#5BAA45"/>
 <path d="M14 104 Q14 76 60 70 L150 70 Q170 80 160 108 Q100 116 14 104 Z" fill="#6CBB52"/>
 <path d="M14 108 Q20 134 70 136 L150 134 Q170 124 160 108 Q100 118 14 108 Z" fill="#5BAA45"/>
 <path d="M24 106 L30 114 L36 106 L42 114 L48 106 L54 114 L60 106 L66 114 L72 106 L78 114 L84 106 L90 114 L96 106" fill="#FFFFFF"/>
 <circle cx="24" cy="86" r="3" fill="#2E5E22"/><circle cx="34" cy="84" r="3" fill="#2E5E22"/>
 ${olhos(76,124,60,10,12)}${bochechas(120,150,96)}
</g>`,
cobra:`<g class="corpo">
 <path class="cauda" d="M150 196 Q196 196 196 170 Q196 156 184 160" stroke="#5CC24E" stroke-width="12" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="184" rx="58" ry="18" fill="#5CC24E"/>
 <ellipse cx="110" cy="160" rx="44" ry="16" fill="#6ED35F"/>
 <path d="M100 160 Q110 120 104 96 L128 96 Q130 130 124 160 Z" fill="#6ED35F"/>
 <path d="M72 184 L82 184 M100 186 L112 186 M132 184 L144 184 M88 160 L98 160 M120 160 L130 160" stroke="#F5D547" stroke-width="5" stroke-linecap="round"/>
 <ellipse cx="114" cy="72" rx="52" ry="42" fill="#7ADB6B"/>
 <path d="M114 112 L114 126 L108 134 M114 126 L120 134" stroke="#E5405A" stroke-width="3" fill="none" stroke-linecap="round"/>
 ${olhos(94,134,66)}${bochechas(78,150,90)}
 <circle cx="108" cy="92" r="2.5" fill="#2E6E28"/><circle cx="120" cy="92" r="2.5" fill="#2E6E28"/>${sorriso(114,100)}
</g>`,
leopardo:`<g class="corpo">
 <path class="cauda" d="M152 176 Q198 170 190 128 Q186 112 172 116" stroke="#F5CF5B" stroke-width="12" stroke-linecap="round" fill="none"/>
 <circle cx="186" cy="150" r="3.5" fill="#6B4A1E"/><circle cx="176" cy="170" r="3.5" fill="#6B4A1E"/>
 <ellipse cx="110" cy="170" rx="44" ry="30" fill="#F5CF5B"/><ellipse cx="110" cy="178" rx="22" ry="16" fill="#FFF3D6"/>
 <circle cx="80" cy="160" r="5" fill="#6B4A1E"/><circle cx="140" cy="160" r="5" fill="#6B4A1E"/><circle cx="88" cy="182" r="4" fill="#6B4A1E"/><circle cx="134" cy="180" r="4" fill="#6B4A1E"/>
 <ellipse cx="88" cy="197" rx="14" ry="9" fill="#F5CF5B"/><ellipse cx="132" cy="197" rx="14" ry="9" fill="#F5CF5B"/>
 <g class="orelha"><circle cx="64" cy="46" r="17" fill="#F5CF5B"/><circle cx="64" cy="46" r="8" fill="#F7B7C4"/></g>
 <g class="orelha"><circle cx="156" cy="46" r="17" fill="#F5CF5B"/><circle cx="156" cy="46" r="8" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="92" rx="60" ry="52" fill="#F8D96E"/>
 <circle cx="96" cy="52" r="5" fill="#6B4A1E"/><circle cx="124" cy="52" r="5" fill="#6B4A1E"/><circle cx="110" cy="62" r="4" fill="#6B4A1E"/><circle cx="62" cy="84" r="5" fill="#6B4A1E"/><circle cx="158" cy="84" r="5" fill="#6B4A1E"/><circle cx="66" cy="104" r="4" fill="#6B4A1E"/><circle cx="154" cy="104" r="4" fill="#6B4A1E"/>
 <ellipse cx="110" cy="116" rx="26" ry="17" fill="#FFF3D6"/>
 ${olhos(88,132,88)}${bochechas(68,152,112)}
 <path d="M103 104 L117 104 L110 112 Z" fill="#E86F8A"/>${sorriso(110,116)}
</g>`,
camelo:`<g class="corpo">
 <path class="cauda" d="M174 160 Q190 164 190 146" stroke="#C99A5B" stroke-width="5" stroke-linecap="round" fill="none"/>
 <ellipse cx="128" cy="164" rx="50" ry="26" fill="#D9A866"/>
 <ellipse cx="128" cy="134" rx="30" ry="28" fill="#D9A866"/>
 <rect x="94" y="176" width="14" height="26" rx="6" fill="#C99A5B"/><rect x="150" y="176" width="14" height="26" rx="6" fill="#C99A5B"/>
 <path d="M70 100 Q72 150 96 170 L110 150 Q92 130 96 100 Z" fill="#D9A866"/>
 <ellipse class="orelha" cx="50" cy="36" rx="7" ry="12" transform="rotate(-20 50 36)" fill="#C99A5B"/><ellipse class="orelha" cx="112" cy="36" rx="7" ry="12" transform="rotate(20 112 36)" fill="#C99A5B"/>
 <ellipse cx="80" cy="70" rx="42" ry="38" fill="#E3B676"/>
 <ellipse cx="80" cy="96" rx="28" ry="16" fill="#F0D2A0"/>
 <circle cx="72" cy="92" r="2.5" fill="#6B4A1E"/><circle cx="88" cy="92" r="2.5" fill="#6B4A1E"/>
 ${olhos(64,96,64,9,11)}${bochechas(50,110,82)}${sorriso(80,100,'#6B4A1E')}
</g>`,
lama:`<g class="corpo">
 <path class="cauda" d="M150 164 Q166 156 164 142" stroke="#F4EEE4" stroke-width="10" stroke-linecap="round" fill="none"/>
 <ellipse cx="114" cy="170" rx="40" ry="26" fill="#FAF6EE" stroke="#E2D9C8" stroke-width="2"/>
 <circle cx="88" cy="160" r="12" fill="#FAF6EE"/><circle cx="114" cy="152" r="12" fill="#FAF6EE"/><circle cx="140" cy="160" r="12" fill="#FAF6EE"/>
 <rect x="88" y="182" width="12" height="20" rx="5" fill="#E2D9C8"/><rect x="128" y="182" width="12" height="20" rx="5" fill="#E2D9C8"/>
 <rect x="94" y="80" width="32" height="90" rx="14" fill="#FAF6EE"/>
 <circle cx="96" cy="110" r="9" fill="#FAF6EE"/><circle cx="124" cy="130" r="9" fill="#FAF6EE"/><circle cx="96" cy="150" r="9" fill="#FAF6EE"/>
 <ellipse class="orelha" cx="84" cy="22" rx="7" ry="18" transform="rotate(-12 84 22)" fill="#E2D9C8"/><ellipse class="orelha" cx="136" cy="22" rx="7" ry="18" transform="rotate(12 136 22)" fill="#E2D9C8"/>
 <ellipse cx="110" cy="66" rx="38" ry="36" fill="#FFFFFF" stroke="#E2D9C8" stroke-width="2"/>
 <circle cx="98" cy="34" r="9" fill="#FFFFFF"/><circle cx="110" cy="30" r="10" fill="#FFFFFF"/><circle cx="122" cy="34" r="9" fill="#FFFFFF"/>
 <ellipse cx="110" cy="88" rx="20" ry="13" fill="#F0E2CC"/>
 <path d="M104 84 L110 88 L116 84" stroke="#8A6A4A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
 ${olhos(96,124,62,8,10)}${bochechas(82,138,78)}${sorriso(110,94,'#8A6A4A')}
</g>`,
canguru:`<g class="corpo">
 <path class="cauda" d="M140 190 Q190 196 200 170" stroke="#D08A4E" stroke-width="12" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="160" rx="40" ry="38" fill="#D99556"/><ellipse cx="110" cy="170" rx="24" ry="22" fill="#F3D2A8"/>
 <path d="M90 168 Q110 182 130 168" stroke="#C07A40" stroke-width="3" fill="none"/>
 <circle cx="110" cy="164" r="8" fill="#D99556"/>
 <ellipse cx="80" cy="198" rx="22" ry="7" fill="#C07A40"/><ellipse cx="140" cy="198" rx="22" ry="7" fill="#C07A40"/>
 <g class="orelha"><ellipse cx="82" cy="34" rx="11" ry="26" transform="rotate(-15 82 34)" fill="#D99556"/><ellipse cx="82" cy="36" rx="5" ry="16" transform="rotate(-15 82 36)" fill="#F7B7C4"/></g>
 <g class="orelha"><ellipse cx="138" cy="34" rx="11" ry="26" transform="rotate(15 138 34)" fill="#D99556"/><ellipse cx="138" cy="36" rx="5" ry="16" transform="rotate(15 138 36)" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="84" rx="46" ry="42" fill="#E0A464"/>
 <ellipse cx="110" cy="104" rx="22" ry="15" fill="#F3D2A8"/>
 <ellipse cx="110" cy="98" rx="7" ry="5" fill="#5A3A1A"/>
 ${olhos(92,128,80,9,11)}${bochechas(76,144,100)}${sorriso(110,108,'#5A3A1A')}
</g>`,
preguica:`<g class="corpo">
 <rect x="10" y="20" width="200" height="12" rx="6" fill="#7A5230"/>
 <path d="M60 30 Q50 90 76 140 M160 30 Q170 90 144 140" stroke="#A88A6A" stroke-width="18" stroke-linecap="round" fill="none"/>
 <path d="M54 24 L52 38 M62 24 L62 38 M154 24 L156 38 M162 24 L162 38" stroke="#3E2E1E" stroke-width="4" stroke-linecap="round"/>
 <ellipse cx="110" cy="160" rx="44" ry="40" fill="#A88A6A"/>
 <ellipse cx="88" cy="196" rx="14" ry="8" fill="#8F735A"/><ellipse cx="132" cy="196" rx="14" ry="8" fill="#8F735A"/>
 <circle class="orelha" cx="110" cy="58" r="6" fill="#8F735A"/>
 <ellipse cx="110" cy="100" rx="46" ry="42" fill="#B89A78"/>
 <ellipse cx="110" cy="104" rx="36" ry="30" fill="#F0E0C4"/>
 <ellipse cx="92" cy="98" rx="14" ry="9" transform="rotate(20 92 98)" fill="#5A4030"/><ellipse cx="128" cy="98" rx="14" ry="9" transform="rotate(-20 128 98)" fill="#5A4030"/>
 ${olhos(92,128,98,6,7)}${bochechas(80,140,116)}
 <ellipse cx="110" cy="112" rx="5" ry="4" fill="#3E2E1E"/>${sorriso(110,120)}
</g>`,
suricata:`<g class="corpo">
 <path class="cauda" d="M126 196 Q170 200 176 170" stroke="#C9A06A" stroke-width="7" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="158" rx="30" ry="42" fill="#D8B27C"/><ellipse cx="110" cy="166" rx="18" ry="30" fill="#F3E2C2"/>
 <ellipse cx="88" cy="138" rx="8" ry="16" fill="#C9A06A"/><ellipse cx="132" cy="138" rx="8" ry="16" fill="#C9A06A"/>
 <ellipse cx="96" cy="198" rx="12" ry="6" fill="#C9A06A"/><ellipse cx="124" cy="198" rx="12" ry="6" fill="#C9A06A"/>
 <circle class="orelha" cx="74" cy="56" r="10" fill="#6B4A2E"/><circle class="orelha" cx="146" cy="56" r="10" fill="#6B4A2E"/>
 <ellipse cx="110" cy="72" rx="42" ry="40" fill="#E2BE88"/>
 <ellipse cx="90" cy="70" rx="14" ry="16" fill="#6B4A2E"/><ellipse cx="130" cy="70" rx="14" ry="16" fill="#6B4A2E"/>
 ${olhos(90,130,70,9,11)}
 <ellipse cx="110" cy="96" rx="16" ry="12" fill="#F3E2C2"/>
 <ellipse cx="110" cy="92" rx="5" ry="4" fill="#2B1B12"/>${bochechas(80,140,94)}${sorriso(110,100)}
</g>`,
camaleao:`<g class="corpo">
 <path class="cauda" d="M150 170 Q196 170 196 134 Q196 112 178 112 Q162 114 166 130 Q170 142 180 136" stroke="#3FBF8F" stroke-width="10" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="164" rx="48" ry="30" fill="#4CCB9B"/>
 <path d="M76 146 Q110 120 144 146" stroke="#F2C744" stroke-width="5" fill="none" stroke-linecap="round"/>
 <path d="M80 176 Q90 196 76 200 M140 176 Q130 196 144 200" stroke="#3FBF8F" stroke-width="9" fill="none" stroke-linecap="round"/>
 <path d="M70 52 Q110 10 150 52 Z" fill="#3FBF8F"/>
 <ellipse cx="110" cy="92" rx="56" ry="46" fill="#5AD8A8"/>
 <circle cx="62" cy="80" r="22" fill="#4CCB9B"/><circle cx="158" cy="80" r="22" fill="#4CCB9B"/>
 <circle cx="62" cy="80" r="14" fill="#FFFFFF"/><circle cx="158" cy="80" r="14" fill="#FFFFFF"/>
 ${olhos(66,154,80,8,9)}${bochechas(84,136,112)}
 <path d="M84 120 Q110 134 136 120" stroke="#2B1B12" stroke-width="3" fill="none" stroke-linecap="round"/>
 <circle cx="96" cy="64" r="5" fill="#F2C744"/><circle cx="124" cy="64" r="5" fill="#F2C744"/>
</g>`,
lagarto:`<g class="corpo">
 <path class="cauda" d="M140 184 Q190 196 204 160" stroke="#B5C93A" stroke-width="10" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="176" rx="34" ry="20" fill="#C3D64A"/>
 <circle cx="98" cy="172" r="4" fill="#8FA22A"/><circle cx="122" cy="176" r="4" fill="#8FA22A"/><circle cx="110" cy="166" r="3" fill="#8FA22A"/>
 <ellipse cx="80" cy="196" rx="14" ry="6" fill="#B5C93A"/><ellipse cx="140" cy="196" rx="14" ry="6" fill="#B5C93A"/>
 <ellipse cx="110" cy="112" rx="50" ry="44" fill="#D0E25A"/>
 <ellipse cx="110" cy="136" rx="34" ry="16" fill="#E8F2A0"/>
 <circle cx="104" cy="126" r="2.5" fill="#6E7E1A"/><circle cx="116" cy="126" r="2.5" fill="#6E7E1A"/>
 <circle class="orelha" cx="110" cy="74" r="5" fill="#8FA22A"/><circle cx="80" cy="90" r="4" fill="#8FA22A"/><circle cx="140" cy="90" r="4" fill="#8FA22A"/>
 ${olhos(90,130,106,9,11)}${bochechas(74,146,126)}${sorriso(110,136)}
</g>`,
dinossauro:`<g class="corpo">
 <path class="cauda" d="M144 176 Q196 180 206 140 Q190 166 150 156 Z" fill="#6FB3E8"/>
 <ellipse cx="110" cy="168" rx="46" ry="32" fill="#7CC0F0"/><ellipse cx="110" cy="176" rx="26" ry="20" fill="#D6EEFF"/>
 <ellipse cx="88" cy="197" rx="14" ry="9" fill="#5E9FD6"/><ellipse cx="132" cy="197" rx="14" ry="9" fill="#5E9FD6"/>
 <path d="M58 70 L48 54 L68 56 Z M66 46 L62 26 L82 36 Z M90 30 L94 12 L106 28 Z M118 28 L128 12 L132 30 Z M146 36 L160 26 L156 46 Z M160 56 L174 54 L164 70 Z" fill="#F5A04A"/>
 <ellipse cx="110" cy="88" rx="60" ry="54" fill="#86C8F5"/>
 <ellipse cx="110" cy="116" rx="36" ry="20" fill="#D6EEFF"/>
 <circle cx="100" cy="108" r="3" fill="#3A6E9A"/><circle cx="120" cy="108" r="3" fill="#3A6E9A"/>
 <path d="M96 126 L100 132 L104 126 M116 126 L120 132 L124 126" fill="#FFFFFF"/>
 ${olhos(86,134,82)}${bochechas(66,154,106)}${sorriso(110,120)}
</g>`
});
