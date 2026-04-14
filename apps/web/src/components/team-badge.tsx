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
        <path
          d="M40 43c4-14 15-23 20-23 6 0 17 9 20 23"
          fill={meta.palette.cap}
          stroke={meta.palette.capBrim}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M36 45c9 5 39 5 48 0"
          fill="none"
          stroke={meta.palette.capBrim}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text
          x="60"
          y="39"
          fill={meta.palette.capText}
          fontFamily="inherit"
          fontSize="14"
          fontWeight="900"
          textAnchor="middle"
        >
          {meta.capLetter}
        </text>

        <path
          d="M47 46c2-8 7-13 13-13s11 5 13 13"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="6"
          strokeLinecap="round"
        />

        <circle
          cx="60"
          cy="62"
          r="26"
          fill={meta.palette.face}
          stroke="#6A4B3E"
          strokeWidth="3"
        />

        <path
          d="M43 56c2-8 9-14 17-14s15 6 17 14"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M45 52c2 3 5 5 8 6"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M75 52c-2 3-5 5-8 6"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="4"
          strokeLinecap="round"
        />

        <ellipse cx="50" cy="62" rx="3.8" ry="4.6" fill="#4D342A" />
        <ellipse cx="70" cy="62" rx="3.8" ry="4.6" fill="#4D342A" />
        <circle cx="46" cy="71" r="4.8" fill={meta.palette.blush} opacity="0.84" />
        <circle cx="74" cy="71" r="4.8" fill={meta.palette.blush} opacity="0.84" />
        <ellipse cx="60" cy="69" rx="4.8" ry="3.5" fill="#F6B48A" />
        <path
          d="M52 76c3 4 13 4 16 0"
          fill="none"
          stroke="#4D342A"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
