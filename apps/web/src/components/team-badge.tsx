import { useId } from "react";

import type { TeamCode } from "@basebook/contracts";

import { TEAM_META } from "@/lib/team-meta";

type TeamBadgeProps = {
  team: TeamCode;
  size?: number;
};

export function TeamBadge({ team, size = 72 }: TeamBadgeProps) {
  const meta = TEAM_META[team];
  const id = useId().replace(/:/g, "");
  const gradientId = `${id}-${team}-gradient`;
  const glowId = `${id}-${team}-glow`;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className="shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="15" x2="105" y1="12" y2="108">
          <stop offset="0%" stopColor={meta.palette.backgroundStart} />
          <stop offset="100%" stopColor={meta.palette.backgroundEnd} />
        </linearGradient>
        <radialGradient id={glowId} cx="36%" cy="28%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.88" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect
        x="10"
        y="10"
        width="100"
        height="100"
        rx="34"
        fill={`url(#${gradientId})`}
      />
      <circle cx="40" cy="30" r="18" fill={`url(#${glowId})`} opacity="0.58" />
      <circle cx="90" cy="55" r="6" fill="white" opacity="0.22" />

      <g transform="translate(0 2)">
        <circle cx="60" cy="24" r="3.2" fill={meta.palette.capBrim} opacity="0.9" />
        <path
          d="M42 46c2-15 10-24 18-24s16 9 18 24"
          fill={meta.palette.cap}
          stroke={meta.palette.capBrim}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M45 45c4-4 9-6 15-6s11 2 15 6"
          fill="none"
          stroke={meta.palette.capText}
          strokeOpacity="0.28"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M60 25v19"
          fill="none"
          stroke={meta.palette.capBrim}
          strokeOpacity="0.5"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect
          x="50"
          y="30"
          width="20"
          height="14"
          rx="6"
          fill={meta.palette.capBrim}
          opacity="0.96"
        />
        <text
          x="60"
          y="39.5"
          fill={meta.palette.capText}
          fontFamily="inherit"
          fontSize="11"
          fontWeight="900"
          textAnchor="middle"
        >
          {meta.capLetter}
        </text>
        <path
          d="M35 47c9 6 41 6 50 0 0 6-5 10-25 10s-25-4-25-10Z"
          fill={meta.palette.capBrim}
          stroke={meta.palette.capBrim}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <circle
          cx="60"
          cy="66"
          r="24"
          fill={meta.palette.face}
          stroke="#6A4B3E"
          strokeWidth="3"
        />

        <path
          d="M47 56c4-4 9-6 13-6s9 2 13 6"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M43 63c0-5 2-10 5-13"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M77 63c0-5-2-10-5-13"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="4"
          strokeLinecap="round"
        />

        <ellipse cx="50" cy="66" rx="3.6" ry="4.4" fill="#4D342A" />
        <ellipse cx="70" cy="66" rx="3.6" ry="4.4" fill="#4D342A" />
        <circle cx="46" cy="75" r="4.6" fill={meta.palette.blush} opacity="0.84" />
        <circle cx="74" cy="75" r="4.6" fill={meta.palette.blush} opacity="0.84" />
        <ellipse cx="60" cy="72" rx="4.8" ry="3.5" fill="#F6B48A" />
        <path
          d="M52 79c3 4 13 4 16 0"
          fill="none"
          stroke="#4D342A"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
