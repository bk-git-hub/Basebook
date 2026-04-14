import Image from "next/image";

import type { TeamCode } from "@basebook/contracts";

import { TEAM_META } from "@/lib/team-meta";

type TeamBadgeProps = {
  team: TeamCode;
  size?: number;
};

export function TeamBadge({ team, size = 72 }: TeamBadgeProps) {
  const meta = TEAM_META[team];

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Image
        src={meta.badgeImagePath}
        alt=""
        width={size}
        height={size}
        className="h-auto w-auto shrink-0"
      />
    </span>
  );
}
