import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size?: number) => ({
  width: size ?? 16,
  height: size ?? 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconPin = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconCal = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
  </svg>
);

export const IconTag = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3.5 12.5 12 4h8v8l-8.5 8.5a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8Z" />
    <circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSearch = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.3-4.3" />
  </svg>
);

export const IconSpark = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3Z" />
    <path d="M18.5 16.5 19.2 18.6l2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z" strokeWidth="1.5" />
  </svg>
);

export const IconArrow = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const IconCheck = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const IconX = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconPlus = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconEye = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconBolt = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" />
  </svg>
);

export const IconHandshake = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m3 8 4-2 5 2 5-2 4 2-1.5 8L12 20l-7.5-4L3 8Z" />
    <path d="M12 8 9.5 11a1.6 1.6 0 0 0 2.3 2.2L14 11" />
  </svg>
);

export const IconRadar = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" opacity="0.55" />
    <path d="M12 12 18.5 6" />
    <circle cx="15.5" cy="14.5" r="1.3" fill="currentColor" stroke="none" />
  </svg>
);

export const Logo = ({ size = 30, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...p}>
    <rect width="32" height="32" rx="8" fill="var(--color-ink)" />
    <circle cx="16" cy="14" r="7" stroke="var(--color-signal)" strokeWidth="2.4" />
    <circle cx="16" cy="14" r="2.1" fill="var(--color-signal)" />
    <path d="M16 21.5V27" stroke="var(--color-paper)" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

/* category glyphs */
export function CategoryIcon({ category, size = 14, ...p }: P & { category: string }) {
  const s = base(size);
  const map: Record<string, JSX.Element> = {
    Electronics: (
      <svg {...s} {...p}>
        <rect x="4" y="6" width="16" height="11" rx="1.5" />
        <path d="M9 21h6M12 17v4M8 10h3M8 13h6" />
      </svg>
    ),
    Accessories: (
      <svg {...s} {...p}>
        <circle cx="12" cy="12" r="6" />
        <path d="M12 9v3l2 1.5M9 3.5 12 6l3-2.5" />
      </svg>
    ),
    Bags: (
      <svg {...s} {...p}>
        <path d="M5 8h14l-1 12H6L5 8Z" />
        <path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10" />
      </svg>
    ),
    "Books & Notes": (
      <svg {...s} {...p}>
        <path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h12.5v15H7a2.5 2.5 0 0 0-2.5 2.5v-15Z" />
        <path d="M4.5 18A2.5 2.5 0 0 1 7 15.5h12.5" />
      </svg>
    ),
    Clothing: (
      <svg {...s} {...p}>
        <path d="m8 4-4.5 4 2.5 2.5L8 9v11h8V9l2 1.5L20.5 8 16 4a4 4 0 0 1-8 0Z" />
      </svg>
    ),
    Keys: (
      <svg {...s} {...p}>
        <circle cx="8" cy="8" r="4" />
        <path d="m11 11 8.5 8.5M17 17l2-2M14.5 19.5l2-2" />
      </svg>
    ),
    "ID & Cards": (
      <svg {...s} {...p}>
        <rect x="3" y="5.5" width="18" height="13" rx="2" />
        <circle cx="8.5" cy="11" r="2" />
        <path d="M13.5 9.5H18M13.5 12.5H18M6 16.5c.6-1.3 1.5-2 2.5-2s1.9.7 2.5 2" />
      </svg>
    ),
    Bottles: (
      <svg {...s} {...p}>
        <path d="M10 3h4M10.5 3v4L8.5 10a3 3 0 0 0-.5 1.7V19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7.3a3 3 0 0 0-.5-1.7l-2-3V3" />
        <path d="M8 14h8" />
      </svg>
    ),
    Sports: (
      <svg {...s} {...p}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18" opacity="0.7" />
      </svg>
    ),
    Other: (
      <svg {...s} {...p}>
        <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  };
  return map[category] ?? map.Other;
}
