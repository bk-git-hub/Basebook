import { useId } from "react";

import type { TeamCode } from "@basebook/contracts";

import { TEAM_META } from "@/lib/team-meta";

type TeamBadgeProps = {
  team: TeamCode;
  size?: number;
};

function renderCharacterFrame(team: TeamCode) {
  const meta = TEAM_META[team];
  const primary = meta.palette.primary;
  const secondary = meta.palette.secondary;
  const accent = meta.palette.accent;

  switch (meta.character) {
    case "cat":
    case "tiger":
      return (
        <>
          <path
            d="M34 45 42 24 53 43"
            fill={primary}
            stroke={accent}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M86 45 78 24 67 43"
            fill={primary}
            stroke={accent}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M40 39 43 31 48 40" fill={secondary} opacity="0.92" />
          <path d="M80 39 77 31 72 40" fill={secondary} opacity="0.92" />
        </>
      );
    case "bear":
      return (
        <>
          <circle cx="39" cy="38" r="11" fill={primary} opacity="0.96" />
          <circle cx="81" cy="38" r="11" fill={primary} opacity="0.96" />
          <circle cx="39" cy="40" r="5.5" fill={secondary} />
          <circle cx="81" cy="40" r="5.5" fill={secondary} />
        </>
      );
    case "puppy":
      return (
        <>
          <ellipse
            cx="36"
            cy="53"
            rx="12"
            ry="20"
            fill={primary}
            transform="rotate(-18 36 53)"
          />
          <ellipse
            cx="84"
            cy="53"
            rx="12"
            ry="20"
            fill={primary}
            transform="rotate(18 84 53)"
          />
          <path
            d="M43 37c5-9 29-9 34 0"
            fill="none"
            stroke={secondary}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </>
      );
    case "dino":
      return (
        <>
          <path
            d="M31 48 40 34l7 12 9-13 8 13 8-12 8 15"
            fill="none"
            stroke={primary}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="37" cy="62" r="7" fill={secondary} opacity="0.6" />
          <circle cx="83" cy="62" r="7" fill={secondary} opacity="0.6" />
        </>
      );
    case "seagull":
      return (
        <>
          <path
            d="M31 57c5-9 11-13 18-14-5 8-6 14-5 21-5-1-10-3-13-7Z"
            fill={secondary}
            stroke={accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M89 57c-5-9-11-13-18-14 5 8 6 14 5 21 5-1 10-3 13-7Z"
            fill={secondary}
            stroke={accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M56 33c2-6 7-10 12-11-2 7-4 11-12 11Z"
            fill={secondary}
            stroke={accent}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </>
      );
    case "lion":
      return (
        <>
          <path
            d="M60 24c18 0 33 15 33 33S78 90 60 90 27 75 27 57 42 24 60 24Z"
            fill={primary}
            opacity="0.9"
          />
          <circle cx="40" cy="41" r="8" fill={secondary} opacity="0.9" />
          <circle cx="80" cy="41" r="8" fill={secondary} opacity="0.9" />
        </>
      );
    case "eagle":
      return (
        <>
          <path
            d="M37 48 48 27l8 15 4-16 4 16 8-15 11 21"
            fill="none"
            stroke={primary}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M42 39c2-8 10-14 18-14s16 6 18 14"
            fill="none"
            stroke={secondary}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      );
    case "hero":
    case "wizard":
    default:
      return null;
  }
}

function renderHeadwear(team: TeamCode) {
  const meta = TEAM_META[team];
  const primary = meta.palette.primary;
  const secondary = meta.palette.secondary;
  const accent = meta.palette.accent;

  switch (meta.headwear) {
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
    case "helmet":
      return (
        <>
          <path
            d="M34 43c3-14 14-24 26-24s23 10 26 24v6H34Z"
            fill="#A82939"
            stroke={accent}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M42 43c6-3 12-4 18-4s12 1 18 4"
            fill="none"
            stroke="#F6D4DC"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M38 45c6 3 38 3 44 0"
            fill="none"
            stroke={accent}
            strokeWidth="4"
            strokeLinecap="round"
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

function renderSpeciesDetails(team: TeamCode) {
  const meta = TEAM_META[team];
  const secondary = meta.palette.secondary;
  const accent = meta.palette.accent;

  switch (meta.character) {
    case "puppy":
      return (
        <>
          <ellipse cx="50" cy="59" rx="4" ry="4.8" fill="#4D342A" />
          <ellipse cx="70" cy="59" rx="4" ry="4.8" fill="#4D342A" />
          <ellipse cx="60" cy="70" rx="8" ry="6" fill="#FCF3EA" />
          <circle cx="60" cy="66" r="3.4" fill="#4D342A" />
          <path
            d="M54 73c2.5 3 9.5 3 12 0"
            fill="none"
            stroke="#4D342A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      );
    case "dino":
      return (
        <>
          <ellipse cx="49" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
          <ellipse cx="71" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
          <ellipse cx="60" cy="69" rx="9" ry="6.5" fill={secondary} opacity="0.8" />
          <circle cx="56" cy="68" r="1.8" fill="#4D342A" />
          <circle cx="64" cy="68" r="1.8" fill="#4D342A" />
          <path
            d="M53 74c3 3 11 3 14 0"
            fill="none"
            stroke="#4D342A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      );
    case "tiger":
      return (
        <>
          <ellipse cx="49" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
          <ellipse cx="71" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
          <ellipse cx="60" cy="68" rx="4.6" ry="3.4" fill="#F7B07D" />
          <path
            d="M52 75c3 4 13 4 16 0"
            fill="none"
            stroke="#4D342A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M46 52c2-2 5-3 7-4"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M74 52c-2-2-5-3-7-4"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M44 69c3 0 5 1 7 3"
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M76 69c-3 0-5 1-7 3"
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      );
    case "seagull":
      return (
        <>
          <ellipse cx="49" cy="60" rx="3.6" ry="4.4" fill="#4D342A" />
          <ellipse cx="71" cy="60" rx="3.6" ry="4.4" fill="#4D342A" />
          <path
            d="M60 66 52 69l8 6 8-6Z"
            fill="#F2B54A"
            stroke="#9B6A13"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M53 76c3 2 11 2 14 0"
            fill="none"
            stroke="#4D342A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      );
    case "lion":
      return (
        <>
          <ellipse cx="49" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
          <ellipse cx="71" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
          <ellipse cx="60" cy="68" rx="4.6" ry="3.4" fill="#F7B07D" />
          <path
            d="M52 75c3 4 13 4 16 0"
            fill="none"
            stroke="#4D342A"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M44 50c3-2 6-3 10-3"
            fill="none"
            stroke={secondary}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M76 50c-3-2-6-3-10-3"
            fill="none"
            stroke={secondary}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      );
    case "eagle":
      return (
        <>
          <ellipse cx="49" cy="59" rx="3.6" ry="4.4" fill="#4D342A" />
          <ellipse cx="71" cy="59" rx="3.6" ry="4.4" fill="#4D342A" />
          <path
            d="M60 64 51 67l9 8 9-8Z"
            fill="#E39C27"
            stroke="#8F5A10"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M54 75c2 2 10 2 12 0"
            fill="none"
            stroke="#4D342A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M45 52c2-2 5-3 8-3"
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M75 52c-2-2-5-3-8-3"
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      );
    default:
      return (
        <>
          <ellipse cx="49" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
          <ellipse cx="71" cy="60" rx="3.8" ry="4.6" fill="#4D342A" />
          <circle cx="45" cy="69" r="4.7" fill={secondary} opacity="0.78" />
          <circle cx="75" cy="69" r="4.7" fill={secondary} opacity="0.78" />
          <ellipse cx="60" cy="68" rx="4.6" ry="3.4" fill="#F7B07D" />
          <path
            d="M52 75c3 4 13 4 16 0"
            fill="none"
            stroke="#4D342A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      );
  }
}

export function TeamBadge({ team, size = 72 }: TeamBadgeProps) {
  const meta = TEAM_META[team];
  const id = useId().replace(/:/g, "");
  const gradientId = `${id}-${team}-gradient`;
  const sparkleId = `${id}-${team}-sparkle`;
  const pillWidth = meta.initials.length >= 3 ? 84 : 76;
  const pillX = (120 - pillWidth) / 2;
  const pillFontSize = meta.initials.length >= 3 ? 9.5 : 11;
  const pillLetterSpacing = meta.initials.length >= 3 ? 0.6 : 1.2;

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

      <rect
        x="10"
        y="10"
        width="100"
        height="100"
        rx="34"
        fill={`url(#${gradientId})`}
      />
      <circle
        cx="42"
        cy="33"
        r="18"
        fill={`url(#${sparkleId})`}
        opacity="0.55"
      />
      <circle cx="89" cy="50" r="7" fill="white" opacity="0.28" />
      <circle cx="25" cy="88" r="6" fill="white" opacity="0.2" />

      <g transform="translate(0 2)">
        {renderCharacterFrame(team)}
        {renderHeadwear(team)}

        <circle
          cx="60"
          cy="60"
          r="30"
          fill={meta.palette.face}
          stroke="#6A4B3E"
          strokeWidth="3"
        />
        {renderForeheadMark(team)}

        <circle cx="45" cy="69" r="4.7" fill={meta.palette.secondary} opacity="0.72" />
        <circle cx="75" cy="69" r="4.7" fill={meta.palette.secondary} opacity="0.72" />
        {renderSpeciesDetails(team)}
      </g>

      <g transform={`translate(${pillX} 87)`}>
        <rect
          width={pillWidth}
          height="18"
          rx="9"
          fill="rgba(255,255,255,0.86)"
          stroke={meta.palette.accent}
          strokeWidth="2.2"
        />
        <text
          x={pillWidth / 2}
          y="12.5"
          fill={meta.palette.accent}
          fontFamily="inherit"
          fontSize={pillFontSize}
          fontWeight="800"
          letterSpacing={pillLetterSpacing}
          textAnchor="middle"
        >
          {meta.initials}
        </text>
      </g>
    </svg>
  );
}
