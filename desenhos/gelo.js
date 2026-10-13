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
</g>`
});
