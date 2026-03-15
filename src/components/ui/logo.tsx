import { cn } from "@/lib/utils";

// ─── 共通座標定義 ──────────────────────────────────────────────────────────────
// 3×3 グリッド：spacing=8, offset=4, r=2.4（favicon.svg と同一）
const DOTS_BASE = [
  [8,  8 ], [16, 8 ],               // row 0: col 0, 1  (col 2 = 星)
  [8,  16], [16, 16], [24, 16],      // row 1
  [8,  24], [16, 24], [24, 24],      // row 2
] as const;
const STAR_POINTS = "24,3.6 25.1,6.9 28.4,6.9 25.8,8.9 26.8,12.2 24,10.3 21.2,12.2 22.2,8.9 19.6,6.9 22.9,6.9";

// ─── ロゴシンボル（共通定義） ─────────────────────────────────────────────────
// SVG <symbol> を使うとグラデーション ID の衝突を避けられるが、
// React では各 SVG に defs を埋め込む方が確実なため、
// id を "logo-grad" に固定（同一ページに複数レンダーされても同じグラデーション定義は上書きで問題なし）
const GRAD_ID = "logo-grad";

function LogoDefs() {
  return (
    <defs>
      <linearGradient id={GRAD_ID} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#6366F1" floodOpacity="0.35" />
      </filter>
    </defs>
  );
}

function GridDots({ r = 2.4 }: { r?: number }) {
  return (
    <>
      {DOTS_BASE.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#6B7FA3" opacity="0.8" />
      ))}
      <polygon
        points={STAR_POINTS}
        fill={`url(#${GRAD_ID})`}
        filter={`url(#logo-shadow)`}
      />
    </>
  );
}

// ─── コンポーネント ───────────────────────────────────────────────────────────

interface LogoIconProps {
  size?: number;
  /** ガラス背景つき角丸矩形（サイドバー・ヘッダーロゴ用） */
  bg?: boolean;
  className?: string;
}

/**
 * スマカレ ロゴアイコン
 * - bg=true: iOSアイコン風の角丸ダーク背景付き
 * - bg=false (default): 透明背景（テキストロゴと並べる用途）
 */
export function LogoIcon({ size = 36, bg = false, className }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="スマカレ"
    >
      <LogoDefs />
      {bg && (
        <rect
          width="32" height="32" rx="8"
          fill="#0F0F1A"
        />
      )}
      <GridDots />
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
  sm: { icon: 26, fontSize: "text-[15px]", subSize: "text-[9px]",  gap: "gap-2"   },
  md: { icon: 32, fontSize: "text-lg",      subSize: "text-[10px]", gap: "gap-2.5" },
  lg: { icon: 42, fontSize: "text-2xl",     subSize: "text-xs",     gap: "gap-3"   },
} as const;

/**
 * スマカレ ロゴ（アイコン + テキスト）
 */
export function Logo({ variant = "full", theme = "auto", className, size = "md" }: LogoProps) {
  const s = SIZE_MAP[size];
  const textColor = theme === "dark" ? "text-white" : "text-slate-800";

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <LogoIcon size={s.icon} />
      {variant === "full" && (
        <div className="min-w-0">
          <p className={cn("font-bold leading-none tracking-tight", s.fontSize, textColor)}>
            スマカレ
          </p>
          <p className={cn("leading-none mt-0.5", s.subSize, "text-slate-400")}>
            顧客管理プラットフォーム
          </p>
        </div>
      )}
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
  const h = Math.round(width * 0.3);
  const iconSize = h;
  const scale = iconSize / 32;
  const textColor = theme === "dark" ? "#E2E8F0" : "#1E293B";
  const subColor  = theme === "dark" ? "#64748B" : "#94A3B8";

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
        <linearGradient id="lh-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <filter id="lh-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#6366F1" floodOpacity="0.35" />
        </filter>
      </defs>

      <g transform={`scale(${scale})`}>
        {DOTS_BASE.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.4} fill="#6B7FA3" opacity="0.8" />
        ))}
        <polygon points={STAR_POINTS} fill="url(#lh-grad)" filter="url(#lh-shadow)" />
      </g>

      <text
        x={iconSize + 8} y={h * 0.58}
        fontFamily="'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif"
        fontWeight="700"
        fontSize={h * 0.44}
        fill={textColor}
        letterSpacing="-0.3"
      >
        スマカレ
      </text>
      <text
        x={iconSize + 9} y={h * 0.88}
        fontFamily="'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif"
        fontWeight="400"
        fontSize={h * 0.2}
        fill={subColor}
        letterSpacing="0.2"
      >
        顧客管理プラットフォーム
      </text>
    </svg>
  );
}
