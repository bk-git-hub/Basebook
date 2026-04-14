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
          d="M42 52c1-16 9-28 18-28s17 12 18 28"
          fill={meta.palette.cap}
          stroke={meta.palette.capBrim}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M47 49c4-4 8-5 13-5s9 1 13 5"
          fill="none"
          stroke={meta.palette.capText}
          strokeOpacity="0.28"
          strokeWidth="2.5"
          strokeLinecap="round"
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
          d="M44 50c4-7 10-10 16-10s12 3 16 10v7H44Z"
          fill={meta.palette.cap}
          stroke={meta.palette.capBrim}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M48 55c3-2 7-3 12-3s9 1 12 3"
          fill="none"
          stroke={meta.palette.capText}
          strokeOpacity="0.24"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect
          x="50"
          y="46"
          width="20"
          height="12"
          rx="5"
          fill={meta.palette.capBrim}
          opacity="0.98"
        />
        <text
          x="60"
          y="55.2"
          fill={meta.palette.capText}
          fontFamily="inherit"
          fontSize="10"
          fontWeight="900"
          textAnchor="middle"
        >
          {meta.capLetter}
        </text>
        <path
          d="M42 58c7 4 29 4 36 0 0 4-4 7-18 7s-18-3-18-7Z"
          fill={meta.palette.capBrim}
          stroke={meta.palette.capBrim}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M47 60c4-4 9-6 13-6s9 2 13 6"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M44 66c0-4 1-8 4-11"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M76 66c0-4-1-8-4-11"
          fill="none"
          stroke={meta.palette.hair}
          strokeWidth="3.5"
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
