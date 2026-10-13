'use strict';
Object.assign(DESENHOS, {
hamster: `<g class="corpo">
 <ellipse cx="110" cy="168" rx="50" ry="34" fill="#E8A75E"/><ellipse cx="110" cy="176" rx="32" ry="22" fill="#FFF3E0"/>
 <ellipse cx="88" cy="199" rx="12" ry="7" fill="#F7B7C4"/><ellipse cx="132" cy="199" rx="12" ry="7" fill="#F7B7C4"/>
 <g class="orelha"><circle cx="66" cy="48" r="17" fill="#E8A75E"/><circle cx="66" cy="48" r="9" fill="#F7B7C4"/></g>
 <g class="orelha"><circle cx="154" cy="48" r="17" fill="#E8A75E"/><circle cx="154" cy="48" r="9" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="92" rx="58" ry="52" fill="#F0B56E"/>
 <ellipse cx="62" cy="114" rx="30" ry="26" fill="#FFF3E0"/><ellipse cx="158" cy="114" rx="30" ry="26" fill="#FFF3E0"/>
 <ellipse cx="110" cy="116" rx="26" ry="20" fill="#FFF3E0"/>
 <path d="M100 46 Q110 40 120 46 L110 64 Z" fill="#FFF3E0"/>
 ${olhos(88,132,86)}${bochechas(62,158,112)}
 <ellipse cx="110" cy="106" rx="6" ry="4.5" fill="#E86F8A"/>${sorriso(110,114)}
 <ellipse cx="96" cy="140" rx="8" ry="6" fill="#F7B7C4"/><ellipse cx="124" cy="140" rx="8" ry="6" fill="#F7B7C4"/>
</g>`,
coelho: `<g class="corpo">
 <circle class="cauda" cx="158" cy="178" r="14" fill="#FFFFFF"/>
 <ellipse cx="110" cy="172" rx="44" ry="30" fill="#E4E4EC"/><ellipse cx="110" cy="178" rx="26" ry="19" fill="#FFFFFF"/>
 <ellipse cx="88" cy="198" rx="15" ry="8" fill="#E4E4EC"/><ellipse cx="132" cy="198" rx="15" ry="8" fill="#E4E4EC"/>
 <g class="orelha"><ellipse cx="84" cy="42" rx="14" ry="38" transform="rotate(-10 84 42)" fill="#E4E4EC"/><ellipse cx="84" cy="44" rx="7" ry="28" transform="rotate(-10 84 44)" fill="#F7B7C4"/></g>
 <g class="orelha"><ellipse cx="136" cy="42" rx="14" ry="38" transform="rotate(10 136 42)" fill="#E4E4EC"/><ellipse cx="136" cy="44" rx="7" ry="28" transform="rotate(10 136 44)" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="112" rx="54" ry="46" fill="#F2F2F7"/>
 ${olhos(90,130,106)}${bochechas(70,150,126)}
 <ellipse cx="110" cy="124" rx="6" ry="4.5" fill="#E86F8A"/>${sorriso(110,130)}
 <rect x="104" y="134" width="12" height="9" rx="2" fill="#FFFFFF" stroke="#D0D0D8" stroke-width="1.5"/>
</g>`,
rato: `<g class="corpo">
 <path class="cauda" d="M150 182 Q196 186 194 150 Q192 128 176 132" stroke="#F2A0B4" stroke-width="5" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="170" rx="42" ry="30" fill="#A9A9B8"/><ellipse cx="110" cy="178" rx="24" ry="18" fill="#E2E2EA"/>
 <ellipse cx="90" cy="199" rx="12" ry="7" fill="#F7B7C4"/><ellipse cx="130" cy="199" rx="12" ry="7" fill="#F7B7C4"/>
 <g class="orelha"><circle cx="56" cy="56" r="34" fill="#A9A9B8"/><circle cx="56" cy="56" r="22" fill="#F7B7C4"/></g>
 <g class="orelha"><circle cx="164" cy="56" r="34" fill="#A9A9B8"/><circle cx="164" cy="56" r="22" fill="#F7B7C4"/></g>
 <ellipse cx="110" cy="102" rx="52" ry="48" fill="#B8B8C6"/>
 <ellipse cx="110" cy="124" rx="22" ry="16" fill="#E2E2EA"/>
 ${olhos(90,130,96)}${bochechas(70,150,118)}
 <circle cx="110" cy="116" r="6" fill="#E86F8A"/>${sorriso(110,125)}
 <path d="M86 118 L54 112 M86 124 L54 128 M134 118 L166 112 M134 124 L166 128" stroke="#5A5A66" stroke-width="2.5" stroke-linecap="round"/>
</g>`,
'porquinho-da-india': `<g class="corpo">
 <ellipse cx="110" cy="166" rx="66" ry="36" fill="#C9844A"/>
 <ellipse cx="148" cy="160" rx="28" ry="26" fill="#FFFFFF"/><ellipse cx="72" cy="164" rx="22" ry="22" fill="#2E2E2E"/>
 <ellipse cx="80" cy="199" rx="13" ry="7" fill="#F7B7C4"/><ellipse cx="140" cy="199" rx="13" ry="7" fill="#F7B7C4"/>
 <g class="orelha"><ellipse cx="58" cy="60" rx="18" ry="12" transform="rotate(-30 58 60)" fill="#9A5A2A"/></g>
 <g class="orelha"><ellipse cx="162" cy="60" rx="18" ry="12" transform="rotate(30 162 60)" fill="#9A5A2A"/></g>
 <ellipse cx="110" cy="98" rx="60" ry="50" fill="#D9955A"/>
 <path d="M96 50 Q110 44 124 50 L120 110 Q110 116 100 110 Z" fill="#FFFFFF"/>
 <path d="M58 70 Q76 52 94 58 L92 90 Q70 96 58 70 Z" fill="#2E2E2E"/>
 ${olhos(80,140,90)}${bochechas(66,154,112)}
 <ellipse cx="110" cy="118" rx="20" ry="13" fill="#FFF3E6"/>
 <path d="M104 112 L116 112 L110 118 Z" fill="#E86F8A"/>${sorriso(110,121)}
</g>`,
periquito: `<g class="corpo">
 <path class="cauda" d="M136 170 L176 206 L190 192 Z" fill="#2F7FD8"/>
 <ellipse cx="110" cy="160" rx="44" ry="40" fill="#5CC24A"/>
 <path class="asa" d="M128 136 Q168 140 160 186 Q136 180 124 156 Z" fill="#3E9E32"/>
 <path d="M134 150 Q148 154 152 168 M132 162 Q144 166 148 178" stroke="#2B6E22" stroke-width="3" fill="none" stroke-linecap="round"/>
 <path d="M92 198 L92 206 M102 198 L102 206 M118 198 L118 206 M128 198 L128 206" stroke="#E8A66A" stroke-width="4" stroke-linecap="round"/>
 <circle cx="110" cy="84" r="54" fill="#FFE14D"/>
 <path d="M66 70 Q72 40 96 34 M80 52 Q100 36 124 36 M130 38 Q150 44 156 62" stroke="#2E2E2E" stroke-width="3" fill="none" stroke-linecap="round"/>
 ${olhos(88,132,84)}${bochechas(70,150,104)}
 <path d="M100 98 Q110 92 120 98 Q118 116 110 120 Q102 116 100 98 Z" fill="#F28C28"/>
 <circle cx="96" cy="128" r="4" fill="#2E2E2E"/><circle cx="124" cy="128" r="4" fill="#2E2E2E"/>
 <ellipse cx="110" cy="94" rx="12" ry="5" fill="#7FB8F0"/>
</g>`,
canario: `<g class="corpo">
 <path class="cauda" d="M150 168 L196 156 L184 184 Z" fill="#F2C200"/>
 <ellipse cx="112" cy="162" rx="50" ry="40" fill="#FFD600"/>
 <path class="asa" d="M120 142 Q164 140 160 180 Q134 182 118 160 Z" fill="#F2C200"/>
 <path d="M96 200 L96 210 M124 200 L124 210" stroke="#E8A66A" stroke-width="5" stroke-linecap="round"/>
 <circle cx="104" cy="88" r="56" fill="#FFE433"/>
 <path d="M96 34 Q100 16 112 22 Q108 30 106 36 Z M104 33 Q116 18 124 30 Q114 32 110 37 Z" fill="#FFD600"/>
 ${olhos(84,126,86)}${bochechas(64,146,106)}
 <path d="M94 104 L126 104 L110 122 Z" fill="#F28C28"/>
 <path d="M96 106 L124 106" stroke="#D86F15" stroke-width="2" stroke-linecap="round"/>
</g>`,
ponei: `<g class="corpo">
 <path class="cauda" d="M150 160 Q192 150 186 196 Q172 176 156 178 Z" fill="#F7A8C8"/>
 <ellipse cx="110" cy="164" rx="48" ry="30" fill="#EED3A6"/>
 <rect x="76" y="176" width="16" height="26" rx="6" fill="#EED3A6"/><rect x="128" y="176" width="16" height="26" rx="6" fill="#EED3A6"/>
 <rect x="76" y="194" width="16" height="10" rx="3" fill="#8A6A4A"/><rect x="128" y="194" width="16" height="10" rx="3" fill="#8A6A4A"/>
 <path class="orelha" d="M62 52 L66 18 L88 42 Z" fill="#E2C08C"/>
 <path class="orelha" d="M158 52 L154 18 L132 42 Z" fill="#E2C08C"/>
 <ellipse cx="110" cy="90" rx="58" ry="52" fill="#F5DEB3"/>
 <path d="M58 70 Q40 110 54 150 Q66 120 64 96 Z M162 70 Q180 110 166 150 Q154 120 156 96 Z" fill="#F7A8C8"/>
 <path d="M72 52 Q110 18 148 52 Q136 70 122 58 Q112 74 100 58 Q86 70 72 52 Z" fill="#FFD966"/>
 <path d="M90 46 Q110 30 130 46" stroke="#F7A8C8" stroke-width="7" fill="none" stroke-linecap="round"/>
 ${olhos(88,132,92)}${bochechas(68,152,114)}
 <ellipse cx="110" cy="122" rx="28" ry="18" fill="#FBEBD0"/>
 <circle cx="100" cy="118" r="3.5" fill="#8A6A4A"/><circle cx="120" cy="118" r="3.5" fill="#8A6A4A"/>
 ${sorriso(110,128)}
</g>`,
furao: `<g class="corpo">
 <path class="cauda" d="M146 176 Q190 180 200 150" stroke="#6B4A33" stroke-width="16" stroke-linecap="round" fill="none"/>
 <ellipse cx="110" cy="168" rx="62" ry="26" fill="#C9A27A"/>
 <ellipse cx="110" cy="176" rx="34" ry="14" fill="#F3E3CC"/>
 <ellipse cx="66" cy="196" rx="13" ry="8" fill="#6B4A33"/><ellipse cx="96" cy="198" rx="13" ry="8" fill="#6B4A33"/>
 <ellipse cx="128" cy="198" rx="13" ry="8" fill="#6B4A33"/><ellipse cx="156" cy="196" rx="13" ry="8" fill="#6B4A33"/>
 <circle class="orelha" cx="66" cy="50" r="15" fill="#E8D4B8"/>
 <circle class="orelha" cx="154" cy="50" r="15" fill="#E8D4B8"/>
 <ellipse cx="110" cy="92" rx="56" ry="48" fill="#F3E3CC"/>
 <path d="M58 90 Q70 70 98 84 Q110 92 122 84 Q150 70 162 90 Q150 108 124 100 Q110 96 96 100 Q70 108 58 90 Z" fill="#5A3E2B"/>
 ${olhos(86,134,90,10,12)}${bochechas(70,150,116)}
 <ellipse cx="110" cy="108" rx="7" ry="5" fill="#E86F8A"/>${sorriso(110,114)}
</g>`,
chinchila: `<g class="corpo">
 <g class="cauda"><circle cx="156" cy="172" r="16" fill="#7E8794"/><circle cx="174" cy="162" r="16" fill="#7E8794"/><circle cx="186" cy="146" r="15" fill="#7E8794"/></g>
 <ellipse cx="110" cy="166" rx="50" ry="36" fill="#A9B1BC"/>
 <ellipse cx="110" cy="176" rx="28" ry="20" fill="#E6E9EE"/>
 <ellipse cx="86" cy="198" rx="14" ry="8" fill="#9AA3AE"/><ellipse cx="134" cy="198" rx="14" ry="8" fill="#9AA3AE"/>
 <g class="orelha"><ellipse cx="62" cy="40" rx="26" ry="30" fill="#A9B1BC"/><ellipse cx="62" cy="42" rx="16" ry="20" fill="#F2B8C6"/></g>
 <g class="orelha"><ellipse cx="158" cy="40" rx="26" ry="30" fill="#A9B1BC"/><ellipse cx="158" cy="42" rx="16" ry="20" fill="#F2B8C6"/></g>
 <circle cx="110" cy="96" r="56" fill="#B8C0CA"/>
 ${olhos(88,132,92)}${bochechas(70,150,114)}
 <ellipse cx="110" cy="116" rx="18" ry="12" fill="#E6E9EE"/>
 <path d="M105 110 L115 110 L110 116 Z" fill="#E86F8A"/>${sorriso(110,120)}
 <path d="M86 116 L52 110 M86 122 L52 126 M134 116 L168 110 M134 122 L168 126" stroke="#5E6670" stroke-width="2" stroke-linecap="round"/>
</g>`,
cagado: `<g class="corpo">
 <ellipse class="cauda" cx="182" cy="182" rx="12" ry="6" fill="#7DAA4E"/>
 <ellipse cx="62" cy="196" rx="16" ry="10" fill="#7DAA4E"/><ellipse cx="158" cy="196" rx="16" ry="10" fill="#7DAA4E"/>
 <ellipse cx="110" cy="172" rx="70" ry="30" fill="#E6C25A"/>
 <path d="M44 172 Q50 116 110 112 Q170 116 176 172 Z" fill="#2F5A2A"/>
 <path d="M90 128 L130 128 L140 150 L110 166 L80 150 Z" fill="#477D3A"/>
 <path d="M58 166 L76 136 M162 166 L144 136 M80 150 L60 160 M140 150 L160 160" stroke="#1E3D1B" stroke-width="3" stroke-linecap="round"/>
 <ellipse cx="110" cy="80" rx="52" ry="46" fill="#8BBF5A"/>
 <ellipse cx="62" cy="76" rx="7" ry="11" fill="#E05A3A"/><ellipse cx="158" cy="76" rx="7" ry="11" fill="#E05A3A"/>
 ${olhos(90,130,74)}${bochechas(76,144,98)}
 <circle cx="104" cy="94" r="2.5" fill="#2B1B12"/><circle cx="116" cy="94" r="2.5" fill="#2B1B12"/>
 ${sorriso(110,104)}
</g>`
});
