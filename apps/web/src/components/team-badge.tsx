import { useId } from "react";

import type { TeamCode } from "@basebook/contracts";

import { TEAM_META } from "@/lib/team-meta";

type TeamBadgeProps = {
  team: TeamCode;
  size?: number;
};

function renderEars(team: TeamCode) {
  const meta = TEAM_META[team];
  const fill = meta.palette.accent;

  if (meta.ears === "round") {
    return (
      <>
        <circle cx="39" cy="38" r="11" fill={fill} opacity="0.92" />
        <circle cx="81" cy="38" r="11" fill={fill} opacity="0.92" />
        <circle cx="39" cy="40" r="5.5" fill={meta.palette.secondary} />
        <circle cx="81" cy="40" r="5.5" fill={meta.palette.secondary} />
      </>
    );
  }

  if (meta.ears === "pointy") {
    return (
      <>
        <path
          d="M34 45 42 24 53 43"
          fill={fill}
          stroke={fill}
          strokeLinejoin="round"
        />
        <path
          d="M86 45 78 24 67 43"
          fill={fill}
          stroke={fill}
          strokeLinejoin="round"
        />
        <path
          d="M40 39 43 31 48 40"
          fill={meta.palette.secondary}
          opacity="0.9"
        />
        <path
          d="M80 39 77 31 72 40"
          fill={meta.palette.secondary}
          opacity="0.9"
        />
      </>
    );
  }

  return null;
}

function renderAccessory(team: TeamCode) {
  const meta = TEAM_META[team];
  const primary = meta.palette.primary;
  const secondary = meta.palette.secondary;
  const accent = meta.palette.accent;

  switch (meta.accessory) {
    case "bow":
      return (
        <>
          <ellipse cx="46" cy="29" rx="10" ry="7" fill={primary} />
          <ellipse cx="74" cy="29" rx="10" ry="7" fill={primary} />
          <circle cx="60" cy="30" r="6" fill={accent} />
        </>
      );
    case "cap":
      return (
        <>
          <path
            d="M34 40c4-12 16-20 26-20s22 8 26 20"
            fill={primary}
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M42 41c5 4 13 6 18 6s13-2 18-6"
            fill="none"
            stroke={secondary}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M40 42c6 4 34 4 40 0"
            fill="none"
            stroke={accent}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      );
    case "star":
      return (
        <>
          <path
            d="m60 20 4.5 8.4 9.2 1.2-6.7 6.2 1.6 9-8.6-4.4-8.6 4.4 1.6-9-6.7-6.2 9.2-1.2Z"
            fill={primary}
            stroke={accent}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="60" cy="30" r="3" fill={secondary} />
        </>
      );
    case "sprout":
      return (
        <>
          <path
            d="M60 36V22"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M60 24c-9 0-13 7-13 12 8 0 13-4 13-12Z"
            fill={secondary}
          />
          <path
            d="M60 24c9 0 13 7 13 12-8 0-13-4-13-12Z"
            fill={primary}
          />
        </>
      );
    case "halo":
      return (
        <ellipse
          cx="60"
          cy="24"
          rx="18"
          ry="6.5"
          fill="none"
          stroke={primary}
          strokeWidth="4"
        />
      );
    case "tuft":
      return (
        <>
          <circle cx="60" cy="25" r="7" fill={primary} />
          <circle cx="50" cy="29" r="4.5" fill={secondary} />
          <circle cx="70" cy="29" r="4.5" fill={secondary} />
        </>
      );
    case "crown":
      return (
        <>
          <path
            d="M39 35 49 22l11 11 11-11 10 13v7H39Z"
            fill={primary}
            stroke={accent}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="49" cy="24" r="3" fill={secondary} />
          <circle cx="60" cy="31" r="3" fill={secondary} />
          <circle cx="71" cy="24" r="3" fill={secondary} />
        </>
      );
    default:
      return null;
  }
}

function renderForeheadMark(team: TeamCode) {
  const meta = TEAM_META[team];
  const fill = meta.palette.accent;

  switch (meta.foreheadMark) {
    case "heart":
      return (
        <path
          d="M60 46c3-5 10-5 10 1 0 5-5 7-10 11-5-4-10-6-10-11 0-6 7-6 10-1Z"
          fill={fill}
          opacity="0.82"
        />
      );
    case "star":
      return (
        <path
          d="m60 45 2.2 4.2 4.8.7-3.5 3.2.8 4.7-4.3-2.3-4.3 2.3.8-4.7-3.5-3.2 4.8-.7Z"
          fill={fill}
          opacity="0.82"
        />
      );
    case "diamond":
      return (
        <path d="M60 43 67 50 60 57 53 50Z" fill={fill} opacity="0.8" />
      );
    case "stripe":
      return (
        <path
          d="M48 48c6-6 18-6 24 0"
          fill="none"
          stroke={fill}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.78"
        />
      );
    default:
      return null;
  }
}

export function TeamBadge({ team, size = 72 }: TeamBadgeProps) {
  const meta = TEAM_META[team];
  const id = useId().replace(/:/g, "");
  const gradientId = `${id}-${team}-gradient`;
  const sparkleId = `${id}-${team}-sparkle`;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className="shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="15" x2="105" y1="15" y2="105">
          <stop offset="0%" stopColor={meta.palette.secondary} />
          <stop offset="100%" stopColor={meta.palette.primary} />
        </linearGradient>
        <radialGradient id={sparkleId} cx="50%" cy="36%" r="68%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="10" y="10" width="100" height="100" rx="34" fill={`url(#${gradientId})`} />
      <circle cx="42" cy="33" r="18" fill={`url(#${sparkleId})`} opacity="0.55" />
      <circle cx="89" cy="50" r="7" fill="white" opacity="0.28" />
      <circle cx="25" cy="88" r="6" fill="white" opacity="0.2" />

      <g transform="translate(0 2)">
        {renderAccessory(team)}
        {renderEars(team)}

        <circle
          cx="60"
          cy="60"
          r="30"
          fill={meta.palette.face}
          stroke="#6A4B3E"
          strokeWidth="3"
        />
        {renderForeheadMark(team)}

        <ellipse cx="49" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
        <ellipse cx="71" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
        <circle cx="45" cy="69" r="4.7" fill={meta.palette.secondary} opacity="0.78" />
        <circle cx="75" cy="69" r="4.7" fill={meta.palette.secondary} opacity="0.78" />
        <ellipse cx="60" cy="68" rx="4.6" ry="3.4" fill="#F7B07D" />
        <path
          d="M52 75c3 4 13 4 16 0"
          fill="none"
          stroke="#4D342A"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      <g transform="translate(22 87)">
        <rect
          width="76"
          height="18"
          rx="9"
          fill="rgba(255,255,255,0.86)"
          stroke={meta.palette.accent}
          strokeWidth="2.2"
        />
        <text
          x="38"
          y="12.5"
          fill={meta.palette.accent}
          fontFamily="inherit"
          fontSize="11"
          fontWeight="800"
          letterSpacing="1.2"
          textAnchor="middle"
        >
          {meta.initials}
        </text>
      </g>
    </svg>
  );
}
