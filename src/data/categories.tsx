/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  renderIcon: () => React.ReactNode;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'sofas',
    name: 'Sofas',
    slug: 'sofas',
    shortDesc: 'Solid wood structures with tailored natural linen and bouclé upholstery.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Sofas">
        <rect x="25" y="35" width="150" height="52" rx="16" fill="#29231E"/>
        <rect x="10" y="52" width="34" height="48" rx="13" fill="#29231E"/>
        <rect x="156" y="52" width="34" height="48" rx="13" fill="#29231E"/>
        <rect x="38" y="61" width="58" height="30" rx="8" fill="#68452D"/>
        <rect x="104" y="61" width="58" height="30" rx="8" fill="#68452D"/>
        <rect x="30" y="100" width="5" height="16" rx="2.5" fill="#29231E"/>
        <rect x="165" y="100" width="5" height="16" rx="2.5" fill="#29231E"/>
      </svg>
    ),
  },
  {
    id: 'beds',
    name: 'Beds',
    slug: 'beds',
    shortDesc: 'Platform and upholstered solid teak and sheesham bed frames.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Beds">
        <rect x="20" y="70" width="160" height="30" rx="6" fill="#29231E"/>
        <rect x="20" y="38" width="160" height="36" rx="10" fill="#29231E"/>
        <rect x="24" y="52" width="152" height="22" rx="5" fill="#68452D"/>
        <rect x="32" y="54" width="40" height="14" rx="5" fill="#A17A58"/>
        <rect x="128" y="54" width="40" height="14" rx="5" fill="#A17A58"/>
        <rect x="28" y="100" width="6" height="16" rx="3" fill="#29231E"/>
        <rect x="166" y="100" width="6" height="16" rx="3" fill="#29231E"/>
      </svg>
    ),
  },
  {
    id: 'chairs',
    name: 'Chairs',
    slug: 'chairs',
    shortDesc: 'Sculptural lounge chairs, dining armchairs, and hand-woven cane seats.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Chairs">
        <rect x="62" y="22" width="76" height="52" rx="12" fill="#29231E"/>
        <rect x="52" y="66" width="96" height="22" rx="8" fill="#29231E"/>
        <rect x="70" y="30" width="60" height="36" rx="8" fill="#68452D"/>
        <rect x="62" y="88" width="6" height="30" rx="3" fill="#29231E"/>
        <rect x="132" y="88" width="6" height="30" rx="3" fill="#29231E"/>
        <rect x="68" y="88" width="64" height="4" rx="2" fill="#68452D"/>
      </svg>
    ),
  },
  {
    id: 'dining',
    name: 'Dining Tables',
    slug: 'dining',
    shortDesc: 'Solid Indian rosewood and teak dining tables built for generations.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Dining Tables">
        <rect x="20" y="52" width="160" height="14" rx="7" fill="#29231E"/>
        <rect x="36" y="66" width="8" height="40" rx="4" fill="#29231E"/>
        <rect x="156" y="66" width="8" height="40" rx="4" fill="#29231E"/>
        <rect x="8" y="72" width="24" height="5" rx="2.5" fill="#68452D"/>
        <rect x="10" y="77" width="4" height="22" rx="2" fill="#68452D"/>
        <rect x="28" y="77" width="4" height="22" rx="2" fill="#68452D"/>
        <rect x="8" y="62" width="24" height="12" rx="4" fill="#68452D"/>
        <rect x="168" y="72" width="24" height="5" rx="2.5" fill="#68452D"/>
        <rect x="170" y="77" width="4" height="22" rx="2" fill="#68452D"/>
        <rect x="188" y="77" width="4" height="22" rx="2" fill="#68452D"/>
        <rect x="168" y="62" width="24" height="12" rx="4" fill="#68452D"/>
      </svg>
    ),
  },
  {
    id: 'wardrobes',
    name: 'Wardrobes',
    slug: 'wardrobes',
    shortDesc: 'Integrated hinged and sliding wardrobes with customized internal storage.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Wardrobes">
        <rect x="30" y="20" width="140" height="96" rx="6" fill="#29231E"/>
        <rect x="34" y="24" width="62" height="88" rx="4" fill="#423932"/>
        <rect x="104" y="24" width="62" height="88" rx="4" fill="#423932"/>
        <rect x="90" y="62" width="5" height="16" rx="2.5" fill="#A17A58"/>
        <rect x="105" y="62" width="5" height="16" rx="2.5" fill="#A17A58"/>
        <rect x="38" y="112" width="10" height="8" rx="2" fill="#68452D"/>
        <rect x="152" y="112" width="10" height="8" rx="2" fill="#68452D"/>
      </svg>
    ),
  },
  {
    id: 'walkin',
    name: 'Walk-in Wardrobes',
    slug: 'walkin',
    shortDesc: 'Architectural walk-in dressing suites with soft indirect LED illumination.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Walk-in Wardrobes">
        <rect x="10" y="15" width="180" height="100" rx="4" fill="#29231E"/>
        <rect x="14" y="19" width="38" height="92" rx="3" fill="#423932"/>
        <rect x="56" y="19" width="38" height="92" rx="3" fill="#423932"/>
        <rect x="98" y="19" width="88" height="92" rx="3" fill="#362E28"/>
        <rect x="102" y="30" width="80" height="4" rx="2" fill="#68452D"/>
        <rect x="102" y="50" width="80" height="4" rx="2" fill="#68452D"/>
        <rect x="102" y="70" width="80" height="4" rx="2" fill="#68452D"/>
        <rect x="102" y="90" width="80" height="4" rx="2" fill="#68452D"/>
        <line x1="104" y1="30" x2="178" y2="30" stroke="#A17A58" strokeWidth="1.5"/>
        <rect x="112" y="32" width="6" height="16" rx="2" fill="#A17A58"/>
        <rect x="122" y="32" width="6" height="16" rx="2" fill="#68452D"/>
        <rect x="132" y="32" width="6" height="16" rx="2" fill="#A17A58"/>
        <rect x="48" y="61" width="4" height="12" rx="2" fill="#A17A58"/>
        <rect x="90" y="61" width="4" height="12" rx="2" fill="#A17A58"/>
      </svg>
    ),
  },
  {
    id: 'kitchen',
    name: 'Kitchens',
    slug: 'kitchen',
    shortDesc: 'Bespoke modular kitchens with solid wood finishes and Blum hardware.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Kitchen">
        <rect x="10" y="70" width="180" height="45" rx="5" fill="#29231E"/>
        <rect x="10" y="64" width="180" height="10" rx="3" fill="#423932"/>
        <rect x="10" y="15" width="80" height="44" rx="4" fill="#29231E"/>
        <rect x="96" y="15" width="94" height="44" rx="4" fill="#29231E"/>
        <rect x="14" y="19" width="36" height="36" rx="3" fill="#423932"/>
        <rect x="54" y="19" width="32" height="36" rx="3" fill="#423932"/>
        <rect x="100" y="19" width="42" height="36" rx="3" fill="#423932"/>
        <rect x="146" y="19" width="40" height="36" rx="3" fill="#423932"/>
        <rect x="14" y="75" width="38" height="34" rx="3" fill="#423932"/>
        <rect x="56" y="75" width="38" height="34" rx="3" fill="#423932"/>
        <rect x="98" y="75" width="44" height="34" rx="3" fill="#423932"/>
        <rect x="146" y="75" width="40" height="34" rx="3" fill="#423932"/>
        <rect x="58" y="66" width="84" height="6" rx="2" fill="#68452D"/>
      </svg>
    ),
  },
  {
    id: 'tvunits',
    name: 'TV Units',
    slug: 'tvunits',
    shortDesc: 'Floating and floor console entertainment centers with clean wire bays.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="TV Units">
        <rect x="15" y="60" width="170" height="52" rx="5" fill="#29231E"/>
        <rect x="40" y="15" width="120" height="44" rx="5" fill="#29231E"/>
        <rect x="44" y="19" width="112" height="36" rx="3" fill="#423932"/>
        <rect x="96" y="59" width="8" height="8" rx="2" fill="#423932"/>
        <rect x="19" y="64" width="50" height="44" rx="3" fill="#423932"/>
        <rect x="131" y="64" width="50" height="44" rx="3" fill="#423932"/>
        <rect x="73" y="85" width="54" height="4" rx="2" fill="#68452D"/>
        <rect x="26" y="108" width="6" height="12" rx="3" fill="#423932"/>
        <rect x="168" y="108" width="6" height="12" rx="3" fill="#423932"/>
      </svg>
    ),
  },
  {
    id: 'desks',
    name: 'Study Desks',
    slug: 'desks',
    shortDesc: 'Ergonomic solid wood executive workstations with concealed drawer slots.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Study Desks">
        <rect x="18" y="52" width="164" height="12" rx="6" fill="#29231E"/>
        <rect x="18" y="64" width="10" height="52" rx="4" fill="#423932"/>
        <rect x="172" y="64" width="6" height="52" rx="3" fill="#29231E"/>
        <rect x="28" y="70" width="50" height="38" rx="4" fill="#423932"/>
        <rect x="31" y="74" width="44" height="14" rx="3" fill="#68452D"/>
        <rect x="31" y="92" width="44" height="14" rx="3" fill="#68452D"/>
        <rect x="102" y="24" width="52" height="30" rx="4" fill="#29231E"/>
      </svg>
    ),
  },
  {
    id: 'shelves',
    name: 'Bookshelves',
    slug: 'shelves',
    shortDesc: 'Floor-standing modular display shelving and open book towers.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Bookshelves">
        <rect x="40" y="14" width="120" height="102" rx="5" fill="#29231E"/>
        <rect x="40" y="46" width="120" height="5" rx="2" fill="#68452D"/>
        <rect x="40" y="78" width="120" height="5" rx="2" fill="#68452D"/>
        <rect x="48" y="22" width="10" height="22" rx="2" fill="#A17A58"/>
        <rect x="62" y="26" width="8" height="18" rx="2" fill="#68452D"/>
        <rect x="74" y="20" width="12" height="24" rx="2" fill="#A17A58"/>
        <rect x="103" y="22" width="11" height="22" rx="2" fill="#68452D"/>
        <rect x="48" y="86" width="30" height="22" rx="3" fill="#423932"/>
        <rect x="122" y="86" width="30" height="22" rx="3" fill="#423932"/>
      </svg>
    ),
  },
  {
    id: 'doors',
    name: 'Flush Doors',
    slug: 'doors',
    shortDesc: 'Engineered solid core flush and grooved doors with natural veneers.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Flush Doors">
        <rect x="52" y="8" width="96" height="114" rx="4" fill="#423932"/>
        <rect x="56" y="12" width="88" height="106" rx="3" fill="#29231E"/>
        <rect x="62" y="18" width="76" height="44" rx="2" fill="#362E28"/>
        <rect x="62" y="68" width="76" height="44" rx="2" fill="#362E28"/>
        <rect x="122" y="58" width="5" height="20" rx="2.5" fill="#A17A58"/>
        <circle cx="124.5" cy="57" r="3" fill="#A17A58"/>
      </svg>
    ),
  },
  {
    id: 'custom',
    name: 'Custom Furniture',
    slug: 'custom',
    shortDesc: 'Full custom design, precision carpentry, and custom residential fittings.',
    renderIcon: () => (
      <svg viewBox="0 0 200 130" className="w-full h-full" aria-label="Custom Furniture">
        <rect x="25" y="25" width="150" height="80" rx="6" fill="none" stroke="#29231E" strokeWidth="3" strokeDasharray="6 4"/>
        <path d="M40 90 L80 40 L120 75 L160 30" stroke="#68452D" strokeWidth="3" fill="none"/>
        <circle cx="80" cy="40" r="4" fill="#A17A58"/>
        <circle cx="120" cy="75" r="4" fill="#A17A58"/>
      </svg>
    ),
  },
];
