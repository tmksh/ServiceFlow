import { useId } from "react";
import { cn } from "@/lib/utils";

// ─── ドット配置（3×3グリッド、右上を星に置換） ────────────────────────────────
// 列: x=8,18,28  行: y=8,18,28
const DOTS: [number, number][] = [
  [8,  8], [18, 8],          // 上行: 左・中（右上は星）
  [8, 18], [18, 18], [28, 18], // 中行: 3つ
  [8, 28], [18, 28], [28, 28], // 下行: 3つ
];

// 星（4pointed）の中心: 右上 [28, 8]
const STAR_CX = 28;
const STAR_CY = 8;
const STAR_R  = 5.5; // 外径
function starPoints(cx: number, cy: number, r: number): string {
  // 4-pointed star using 8 points (outer r, inner r*0.38)
  const ri = r * 0.38;
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : ri;
    pts.push(`${cx + rr * Math.cos(angle)},${cy + rr * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

function LogoDefs({ uid }: { uid: string }) {
  return (
    <defs>
      {/* 星グラデーション: 明るい青紫 */}
      <linearGradient id={`${uid}-star`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#818CF8" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      {/* テキストグラデーション: ダーク紫 */}
      <linearGradient id={`${uid}-text`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#3730a3" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
      <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="0.5" stdDeviation="1.2" floodColor="#6366F1" floodOpacity="0.4" />
      </filter>
    </defs>
  );
}

function GridDots({ uid }: { uid: string }) {
  return (
    <>
      {DOTS.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.6} fill="#6B7FA3" opacity="0.75" />
      ))}
      {/* 星（右上） */}
      <polygon
        points={starPoints(STAR_CX, STAR_CY, STAR_R)}
        fill={`url(#${uid}-star)`}
        filter={`url(#${uid}-glow)`}
      />
    </>
  );
}

// ─── コンポーネント ───────────────────────────────────────────────────────────

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 36, className }: LogoIconProps) {
  const uid = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="スマカレ"
    >
      <LogoDefs uid={uid} />
      <GridDots uid={uid} />
    </svg>
  );
}

interface LogoProps {
  variant?: "full" | "icon";
  theme?: "dark" | "light" | "auto";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { icon: 24, fontSize: "text-[17px]", gap: "gap-2"   },
  md: { icon: 30, fontSize: "text-[20px]", gap: "gap-2.5" },
  lg: { icon: 40, fontSize: "text-[26px]", gap: "gap-3"   },
} as const;

export function Logo({ variant = "full", theme = "auto", className, size = "md" }: LogoProps) {
  const uid = useId();
  const s = SIZE_MAP[size];

  if (variant === "icon") {
    return <LogoIcon size={s.icon} className={className} />;
  }

  // フルロゴ: アイコン + SVGテキスト（グラデーション）
  const textH = s.icon;
  const textW = Math.round(textH * 2.8);
  const totalW = s.icon + 8 + textW;

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <svg
        width={totalW}
        height={textH}
        viewBox={`0 0 ${totalW} ${textH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="スマカレ"
      >
        <LogoDefs uid={uid} />
        {/* アイコン部 */}
        <g transform={`scale(${textH / 36})`}>
          <GridDots uid={uid} />
        </g>
        {/* テキスト部 */}
        <text
          x={s.icon + 8}
          y={textH * 0.78}
          fontFamily="'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', sans-serif"
          fontWeight="700"
          fontSize={textH * 0.72}
          fill={theme === "dark" ? "#E2E8F0" : `url(#${uid}-text)`}
          letterSpacing="-0.5"
        >
          スマカレ
        </text>
      </svg>
    </div>
  );
}

/**
 * 横長フルロゴ（OGP・ランディングページ用）
 */
export function LogoHorizontal({
  width = 160,
  theme = "light",
  className,
}: {
  width?: number;
  theme?: "dark" | "light";
  className?: string;
}) {
  const uid = `lh-${width}`;
  const h = Math.round(width * 0.28);
  const iconSize = h;
  const scale = iconSize / 36;
  const textColor = theme === "dark" ? "#E2E8F0" : "#3730a3";

  return (
    <svg
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="スマカレ"
    >
      <defs>
        <linearGradient id={`${uid}-star`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="1.2" floodColor="#6366F1" floodOpacity="0.4" />
        </filter>
      </defs>

      <g transform={`scale(${scale})`}>
        {DOTS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.6} fill="#6B7FA3" opacity="0.75" />
        ))}
        <polygon
          points={starPoints(STAR_CX * scale, STAR_CY * scale, STAR_R * scale)}
          fill={`url(#${uid}-star)`}
          filter={`url(#${uid}-glow)`}
          transform={`scale(${1 / scale})`}
        />
      </g>

      <text
        x={iconSize + 8}
        y={h * 0.78}
        fontFamily="'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif"
        fontWeight="700"
        fontSize={h * 0.72}
        fill={textColor}
        letterSpacing="-0.5"
      >
        スマカレ
      </text>
    </svg>
  );
}
