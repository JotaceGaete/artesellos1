/**
 * Ilustración de portada para artículos y landings SEO.
 * SVG en línea: no hace peticiones extra, no se ve borrosa y carga al instante (buen LCP).
 */

export type StampCoverTone = "indigo" | "rose" | "emerald" | "amber" | "sky" | "violet";

type Props = {
  /** Texto accesible que describe la ilustración */
  title: string;
  /** Líneas del centro de la impronta (máx. 3, cortas) */
  lines: string[];
  shape?: "round" | "rect";
  tone?: StampCoverTone;
  /** Texto curvo del sello redondo */
  ring?: string;
  className?: string;
};

const TONES: Record<StampCoverTone, { bg1: string; bg2: string; ink: string; body: string; accent: string }> = {
  indigo: { bg1: "#eef2ff", bg2: "#c7d2fe", ink: "#4338ca", body: "#1e1b4b", accent: "#818cf8" },
  rose: { bg1: "#fff1f2", bg2: "#fecdd3", ink: "#be123c", body: "#4c0519", accent: "#fb7185" },
  emerald: { bg1: "#ecfdf5", bg2: "#a7f3d0", ink: "#047857", body: "#022c22", accent: "#34d399" },
  amber: { bg1: "#fffbeb", bg2: "#fde68a", ink: "#b45309", body: "#451a03", accent: "#f59e0b" },
  sky: { bg1: "#f0f9ff", bg2: "#bae6fd", ink: "#0369a1", body: "#082f49", accent: "#38bdf8" },
  violet: { bg1: "#f5f3ff", bg2: "#ddd6fe", ink: "#6d28d9", body: "#2e1065", accent: "#a78bfa" },
};

export default function StampCover({
  title,
  lines,
  shape = "round",
  tone = "indigo",
  ring = "ARTESELLOS • TIMBRES DE GOMA • CHILE •",
  className = "",
}: Props) {
  const t = TONES[tone];
  const id = `sc-${tone}-${shape}-${lines.join("").replace(/[^a-z0-9]/gi, "").slice(0, 12)}`;
  const safeLines = lines.slice(0, 3);

  return (
    <svg
      viewBox="0 0 1200 675"
      role="img"
      aria-labelledby={`${id}-t`}
      className={`block h-auto w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id={`${id}-t`}>{title}</title>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.bg1} />
          <stop offset="1" stopColor={t.bg2} />
        </linearGradient>
        <pattern id={`${id}-dots`} width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill={t.ink} opacity="0.12" />
        </pattern>
        <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="5" />
        </filter>
        <path id={`${id}-arc`} d="M 470 337 a 190 190 0 1 1 380 0 a 190 190 0 1 1 -380 0" />
      </defs>

      {/* Fondo */}
      <rect width="1200" height="675" fill={`url(#${id}-bg)`} />
      <rect width="1200" height="675" fill={`url(#${id}-dots)`} />
      <circle cx="1080" cy="90" r="190" fill={t.accent} opacity="0.18" />
      <circle cx="90" cy="640" r="160" fill={t.accent} opacity="0.14" />

      {/* Hoja de papel */}
      <g transform="rotate(-4 660 340)">
        <rect x="360" y="70" width="600" height="540" rx="14" fill="#ffffff" opacity="0.96" />
        <rect x="410" y="520" width="240" height="10" rx="5" fill={t.body} opacity="0.08" />
        <rect x="410" y="545" width="170" height="10" rx="5" fill={t.body} opacity="0.08" />
        <rect x="720" y="520" width="180" height="2" fill={t.body} opacity="0.25" />
      </g>

      {/* Impronta del sello */}
      <g filter={`url(#${id}-rough)`} fill="none" stroke={t.ink} opacity="0.9">
        {shape === "round" ? (
          <>
            <circle cx="660" cy="337" r="215" strokeWidth="10" />
            <circle cx="660" cy="337" r="165" strokeWidth="4" />
            <text
              fill={t.ink}
              stroke="none"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight="700"
              fontSize="30"
              letterSpacing="6"
            >
              <textPath href={`#${id}-arc`} startOffset="0" textLength="1170" lengthAdjust="spacing">
                {ring}
              </textPath>
            </text>
          </>
        ) : (
          <>
            <rect x="420" y="190" width="480" height="295" rx="18" strokeWidth="10" />
            <rect x="442" y="212" width="436" height="251" rx="10" strokeWidth="3" />
          </>
        )}
        <g fill={t.ink} stroke="none" fontFamily="Arial, Helvetica, sans-serif" textAnchor="middle">
          {safeLines.map((line, i) => {
            const n = safeLines.length;
            const y = 337 + (i - (n - 1) / 2) * 62 + 14;
            return (
              <text
                key={i}
                x="660"
                y={y}
                fontSize={fitFont(line, i === 0 ? 50 : 34, shape === "round" ? 300 : 410)}
                fontWeight={i === 0 ? 800 : 600}
                letterSpacing="2"
              >
                {line}
              </text>
            );
          })}
        </g>
      </g>

      {/* Timbre automático (silueta) */}
      <g transform="translate(150 150) rotate(-14 120 200)">
        <ellipse cx="120" cy="400" rx="120" ry="18" fill={t.body} opacity="0.12" />
        <rect x="70" y="0" width="100" height="130" rx="46" fill={t.body} />
        <rect x="88" y="22" width="20" height="80" rx="10" fill="#ffffff" opacity="0.18" />
        <rect x="52" y="120" width="136" height="36" rx="12" fill={t.accent} />
        <path d="M30 156 h180 l-14 190 h-152 z" fill={t.body} />
        <rect x="58" y="190" width="18" height="120" rx="9" fill="#ffffff" opacity="0.14" />
        <rect x="18" y="340" width="204" height="40" rx="10" fill={t.ink} />
        <rect x="30" y="374" width="180" height="14" rx="4" fill={t.accent} />
      </g>

      {/* Gotas de tinta */}
      <circle cx="985" cy="560" r="16" fill={t.ink} opacity="0.55" />
      <circle cx="1020" cy="528" r="8" fill={t.ink} opacity="0.45" />
      <circle cx="950" cy="598" r="6" fill={t.ink} opacity="0.4" />
    </svg>
  );
}

/** Reduce la letra si la línea no cabe en el ancho disponible de la impronta. */
function fitFont(text: string, base: number, maxWidth: number) {
  const estimated = text.length * base * 0.68;
  return estimated > maxWidth ? Math.floor((maxWidth / (text.length * 0.68)) * 10) / 10 : base;
}
