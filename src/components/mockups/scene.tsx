import { cn } from "@/lib/utils";

/**
 * Flat, matte illustrations that stand in for video frames in the product
 * mockups. Drawn on a 160 x 90 (16:9) canvas. Pass `vertical` to show the
 * same frame reframed to 9:16 around `focusX`, the way Shortzy crops a
 * horizontal source into a short.
 */

export type SceneName = "host" | "guest" | "duo" | "tutorial" | "studio";

const SKIN = {
  a: "#E7ADA0",
  b: "#C08A73",
  c: "#8E5A49",
} as const;

type PersonProps = {
  x: number;
  skin: string;
  shirt: string;
  hair: string;
  hairStyle?: "short" | "long" | "bun" | "none";
  scale?: number;
  y?: number;
};

function Person({ x, skin, shirt, hair, hairStyle = "short", scale = 1, y = 0 }: PersonProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {hairStyle === "long" && (
        <path d="M-14 42 C-15 26 15 26 14 42 L16 66 C8 70 -8 70 -16 66 Z" fill={hair} />
      )}
      <path d="M-30 24 C-30 8 -18 0 0 0 C18 0 30 8 30 24 Z" fill={shirt} transform="translate(0 66)" />
      <rect x="-5" y="54" width="10" height="14" rx="3" fill={skin} />
      <rect x="-5" y="60" width="10" height="5" fill="#000" opacity=".08" />
      <ellipse cx="0" cy="44" rx="12" ry="14" fill={skin} />
      {/* Simple friendly face, same language as the mascot: dot eyes, small smile, freckles. */}
      <ellipse cx="-4.6" cy="45" rx="1.25" ry="1.5" fill="#43202B" />
      <ellipse cx="4.6" cy="45" rx="1.25" ry="1.5" fill="#43202B" />
      <path d="M-2.6 50.2 Q0 52.6 2.6 50.2" stroke="#43202B" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <circle cx="-7.4" cy="49" r="1.5" fill="#702F42" opacity=".18" />
      <circle cx="7.4" cy="49" r="1.5" fill="#702F42" opacity=".18" />
      {hairStyle === "short" && (
        <path d="M-12.5 42 C-14 26 14 26 12.5 42 C10 35 4 33 -2 34 C-7 35 -10 38 -12.5 42 Z" fill={hair} />
      )}
      {hairStyle === "long" && (
        <path d="M-12.5 43 C-14 26 14 26 12.5 43 C8 34 -6 32 -12.5 43 Z" fill={hair} />
      )}
      {hairStyle === "bun" && (
        <>
          <circle cx="0" cy="27" r="6" fill={hair} />
          <path d="M-12.5 42 C-14 28 14 28 12.5 42 C9 35 -9 35 -12.5 42 Z" fill={hair} />
        </>
      )}
    </g>
  );
}

function Mic({ x, flip = false }: { x: number; flip?: boolean }) {
  const s = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} 0) scale(${s} 1)`}>
      <path d="M26 6 L14 30 L4 50" stroke="#292628" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="-3" y="46" width="9" height="20" rx="4.5" fill="#292628" transform="rotate(-18 1 56)" />
      <rect x="-2" y="48" width="7" height="8" rx="3.5" fill="#625B60" transform="rotate(-18 1 56)" />
    </g>
  );
}

function Backdrop({ name }: { name: SceneName }) {
  switch (name) {
    case "host":
      return (
        <>
          <rect width="160" height="90" fill="#E9D6D2" />
          <rect x="10" y="10" width="34" height="44" rx="4" fill="#C9C5C1" opacity=".55" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}-${c}`} x={13 + c * 10.5} y={13 + r * 10} width="8" height="8" rx="1.5" fill="#C9C5C1" />
            )),
          )}
          <rect x="112" y="30" width="40" height="3" rx="1.5" fill="#C9C5C1" />
          <rect x="116" y="19" width="5" height="11" rx="1" fill="#702F42" />
          <rect x="122" y="21" width="4" height="9" rx="1" fill="#D5C28F" />
          <rect x="127" y="17" width="5" height="13" rx="1" fill="#625B60" />
          <circle cx="143" cy="24" r="5" fill="#E7ADA0" />
        </>
      );
    case "guest":
      return (
        <>
          <rect width="160" height="90" fill="#C9C5C1" />
          <rect x="0" y="62" width="160" height="28" fill="#B9B4AF" />
          <circle cx="28" cy="22" r="9" fill="#D5C28F" opacity=".9" />
          <rect x="27" y="31" width="2" height="31" fill="#625B60" />
          <rect x="118" y="12" width="30" height="22" rx="2" fill="#F3F1EE" />
          <rect x="122" y="16" width="22" height="14" rx="1" fill="#E9D6D2" />
        </>
      );
    case "duo":
      return (
        <>
          <rect width="160" height="90" fill="#43202B" />
          <rect x="0" y="0" width="160" height="90" fill="#702F42" opacity=".35" />
          <circle cx="80" cy="18" r="10" fill="#D5C28F" opacity=".22" />
          <rect x="0" y="74" width="160" height="16" fill="#292628" />
        </>
      );
    case "studio":
      return (
        <>
          <rect width="160" height="90" fill="#F3F1EE" />
          <rect x="0" y="0" width="160" height="90" fill="#E7ADA0" opacity=".35" />
          <path d="M120 0 H160 V90 H100 Z" fill="#E9D6D2" />
          <circle cx="132" cy="20" r="6" fill="#702F42" opacity=".85" />
        </>
      );
    case "tutorial":
      return null;
  }
}

function TutorialSlide() {
  return (
    <>
      <rect width="160" height="90" fill="#FFFFFF" />
      <rect x="10" y="10" width="62" height="7" rx="2" fill="#702F42" />
      <rect x="10" y="23" width="48" height="3" rx="1.5" fill="#C9C5C1" />
      <rect x="10" y="30" width="54" height="3" rx="1.5" fill="#C9C5C1" />
      <rect x="10" y="37" width="40" height="3" rx="1.5" fill="#C9C5C1" />
      <rect x="84" y="10" width="66" height="50" rx="3" fill="#F3F1EE" />
      {[
        [92, 24, "#E9D6D2"],
        [104, 34, "#E7ADA0"],
        [116, 18, "#D5C28F"],
        [128, 40, "#702F42"],
      ].map(([x, h, c], i) => (
        <rect key={i} x={x as number} y={54 - (h as number)} width="8" height={h as number} rx="1.5" fill={c as string} />
      ))}
      <rect x="10" y="50" width="62" height="10" rx="3" fill="#F3F1EE" />
      <rect x="14" y="54" width="30" height="2.5" rx="1.25" fill="#625B60" />
      <rect x="116" y="62" width="40" height="24" rx="3" fill="#E9D6D2" />
      <g transform="translate(136 56) scale(.42)">
        <Person x={0} skin={SKIN.b} shirt="#292628" hair="#292628" />
      </g>
    </>
  );
}

const PEOPLE: Record<Exclude<SceneName, "tutorial">, PersonProps[]> = {
  host: [{ x: 80, skin: SKIN.a, shirt: "#702F42", hair: "#43202B" }],
  guest: [{ x: 80, skin: SKIN.c, shirt: "#292628", hair: "#292628", hairStyle: "bun" }],
  duo: [
    { x: 46, skin: SKIN.b, shirt: "#E9D6D2", hair: "#292628", scale: 0.9, y: 8 },
    { x: 114, skin: SKIN.a, shirt: "#D5C28F", hair: "#43202B", hairStyle: "long", scale: 0.9, y: 8 },
  ],
  studio: [{ x: 74, skin: SKIN.b, shirt: "#43202B", hair: "#292628", hairStyle: "long" }],
};

export const SCENE_FOCUS: Record<SceneName, number> = {
  host: 80,
  guest: 80,
  duo: 114,
  tutorial: 80,
  studio: 74,
};

export function Scene({
  name,
  vertical = false,
  focusX,
  className,
  title,
}: {
  name: SceneName;
  vertical?: boolean;
  focusX?: number;
  className?: string;
  title?: string;
}) {
  const fx = focusX ?? SCENE_FOCUS[name];
  const w = (90 * 9) / 16;
  const vx = Math.min(Math.max(fx - w / 2, 0), 160 - w);
  const viewBox = vertical ? `${vx} 0 ${w} 90` : "0 0 160 90";

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-full w-full", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {name === "tutorial" ? (
        <TutorialSlide />
      ) : (
        <>
          <Backdrop name={name} />
          {PEOPLE[name].map((p, i) => (
            <Person key={i} {...p} />
          ))}
          {name === "host" && <Mic x={98} />}
          {name === "guest" && <Mic x={62} flip />}
          {name === "duo" && (
            <>
              <Mic x={64} />
              <Mic x={96} flip />
              <rect x="0" y="80" width="160" height="10" fill="#292628" />
            </>
          )}
        </>
      )}
    </svg>
  );
}
