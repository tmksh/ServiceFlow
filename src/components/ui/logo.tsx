import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  theme?: "dark" | "light" | "auto";
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * スマカレ ロゴコンポーネント
 * - full: アイコン + テキスト横並び
 * - icon: アイコンのみ
 * - theme dark: 黒背景用（ロゴ本来の色）
 * - theme light: 白背景用（ダークテキスト）
 * - theme auto: サイドバー等、背景に応じて自動
 */
export function Logo({ variant = "full", theme = "auto", className, size = "md" }: LogoProps) {
  const sizes = {
    sm: { icon: 28, fontSize: "text-base", subSize: "text-[9px]", gap: "gap-2" },
    md: { icon: 36, fontSize: "text-lg", subSize: "text-[10px]", gap: "gap-2.5" },
    lg: { icon: 48, fontSize: "text-2xl", subSize: "text-xs", gap: "gap-3" },
  };
  const s = sizes[size];

  const textColor = theme === "dark"
    ? "text-white"
    : theme === "light"
    ? "text-slate-800"
    : "text-slate-800";

  const subColor = theme === "dark"
    ? "text-slate-400"
    : "text-slate-400";

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <LogoIcon size={s.icon} />
      {variant === "full" && (
        <div className="min-w-0">
          <div className={cn("font-bold leading-tight tracking-tight", s.fontSize, textColor)}>
            スマカレ
          </div>
          <div className={cn("leading-tight", s.subSize, subColor)}>
            顧客管理プラットフォーム
          </div>
        </div>
      )}
    </div>
  );
}

interface LogoIconProps {
  size?: number;
  className?: string;
}

/**
 * スマカレ アイコンSVG
 * 3×3 グリッドドット（右上が4角星）
 */
export function LogoIcon({ size = 36, className }: LogoIconProps) {
  const dotR = 3.2;
  const spacing = 9;
  const starSize = 5.5;
  const offset = 4;

  // 3x3 グリッドの左上を原点として配置
  // 右上(col=2, row=0) のみ星
  const dots: { cx: number; cy: number; isStar?: boolean }[] = [
    // row 0
    { cx: offset, cy: offset },
    { cx: offset + spacing, cy: offset },
    { cx: offset + spacing * 2, cy: offset, isStar: true },
    // row 1
    { cx: offset, cy: offset + spacing },
    { cx: offset + spacing, cy: offset + spacing },
    { cx: offset + spacing * 2, cy: offset + spacing },
    // row 2
    { cx: offset, cy: offset + spacing * 2 },
    { cx: offset + spacing, cy: offset + spacing * 2 },
    { cx: offset + spacing * 2, cy: offset + spacing * 2 },
  ];

  const viewSize = offset * 2 + spacing * 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="スマカレ ロゴアイコン"
    >
      {dots.map((d, i) => {
        if (d.isStar) {
          return <StarShape key={i} cx={d.cx} cy={d.cy} size={starSize} />;
        }
        return (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={dotR}
            fill="#6B7FA3"
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

function StarShape({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const r = size;
  const innerR = r * 0.38;

  const points = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : innerR;
    points.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }

  return (
    <polygon
      points={points.join(" ")}
      fill="url(#starGrad)"
    >
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
    </polygon>
  );
}

/**
 * SVG全幅ロゴ (ヘッダー・OGP等の横長用途)
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
  const textColor = theme === "dark" ? "#E2E8F0" : "#1E293B";
  const subColor = theme === "dark" ? "#64748B" : "#94A3B8";

  const iconSize = 28;
  const spacing = 7.5;
  const dotR = 2.6;
  const starSize = 4.5;
  const offset = 3.5;
  const viewSize = offset * 2 + spacing * 2;

  const dots = [
    { cx: offset, cy: offset },
    { cx: offset + spacing, cy: offset },
    { cx: offset + spacing * 2, cy: offset, isStar: true },
    { cx: offset, cy: offset + spacing },
    { cx: offset + spacing, cy: offset + spacing },
    { cx: offset + spacing * 2, cy: offset + spacing },
    { cx: offset, cy: offset + spacing * 2 },
    { cx: offset + spacing, cy: offset + spacing * 2 },
    { cx: offset + spacing * 2, cy: offset + spacing * 2 },
  ];

  return (
    <svg
      width={width}
      height={Math.round(width * 0.3)}
      viewBox="0 0 160 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="スマカレ"
    >
      <defs>
        <linearGradient id="hStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Icon group, centered vertically at y=24 */}
      <g transform={`translate(4, ${24 - iconSize / 2})`}>
        <svg width={iconSize} height={iconSize} viewBox={`0 0 ${viewSize} ${viewSize}`}>
          {dots.map((d, i) => {
            if (d.isStar) {
              const cx = d.cx;
              const cy = d.cy;
              const r = starSize;
              const innerR = r * 0.38;
              const pts = [];
              for (let j = 0; j < 8; j++) {
                const angle = (j * Math.PI) / 4 - Math.PI / 2;
                const radius = j % 2 === 0 ? r : innerR;
                pts.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
              }
              return <polygon key={i} points={pts.join(" ")} fill="url(#hStarGrad)" />;
            }
            return <circle key={i} cx={d.cx} cy={d.cy} r={dotR} fill="#6B7FA3" opacity={0.85} />;
          })}
        </svg>
      </g>

      {/* Text */}
      <text
        x="40"
        y="28"
        fontFamily="'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif"
        fontWeight="700"
        fontSize="20"
        fill={textColor}
        letterSpacing="-0.3"
      >
        スマカレ
      </text>
      <text
        x="41"
        y="40"
        fontFamily="'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif"
        fontWeight="400"
        fontSize="9"
        fill={subColor}
        letterSpacing="0.2"
      >
        顧客管理プラットフォーム
      </text>
    </svg>
  );
}
