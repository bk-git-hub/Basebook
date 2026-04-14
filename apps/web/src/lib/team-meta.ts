import type { TeamCode } from "@basebook/contracts";

export type TeamMeta = {
  code: TeamCode;
  label: string;
  badgeImagePath: string;
};

export const TEAM_META: Record<TeamCode, TeamMeta> = {
  LG: {
    code: "LG",
    label: "LG 트윈스",
    badgeImagePath: "/team-badges/lg.png",
  },
  DOOSAN: {
    code: "DOOSAN",
    label: "두산 베어스",
    badgeImagePath: "/team-badges/doosan.png",
  },
  SSG: {
    code: "SSG",
    label: "SSG 랜더스",
    badgeImagePath: "/team-badges/ssg.png",
  },
  KIWOOM: {
    code: "KIWOOM",
    label: "키움 히어로즈",
    badgeImagePath: "/team-badges/kiwoom.png",
  },
  KT: {
    code: "KT",
    label: "KT 위즈",
    badgeImagePath: "/team-badges/kt.png",
  },
  NC: {
    code: "NC",
    label: "NC 다이노스",
    badgeImagePath: "/team-badges/nc.png",
  },
  KIA: {
    code: "KIA",
    label: "KIA 타이거즈",
    badgeImagePath: "/team-badges/kia.png",
  },
  LOTTE: {
    code: "LOTTE",
    label: "롯데 자이언츠",
    badgeImagePath: "/team-badges/lotte.png",
  },
  SAMSUNG: {
    code: "SAMSUNG",
    label: "삼성 라이온즈",
    badgeImagePath: "/team-badges/samsung.png",
  },
  HANWHA: {
    code: "HANWHA",
    label: "한화 이글스",
    badgeImagePath: "/team-badges/hanwha.png",
  },
};

export const TEAM_OPTIONS = Object.values(TEAM_META).map((team) => ({
  value: team.code,
  label: team.label,
}));

export const TEAM_LABELS: Record<TeamCode, string> = Object.fromEntries(
  Object.values(TEAM_META).map((team) => [team.code, team.label]),
) as Record<TeamCode, string>;

export function getTeamLabel(teamCode: TeamCode) {
  return TEAM_LABELS[teamCode];
}
