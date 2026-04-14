import type { TeamCode } from "@basebook/contracts";

export type TeamBadgeCharacter =
  | "cat"
  | "bear"
  | "puppy"
  | "hero"
  | "wizard"
  | "dino"
  | "tiger"
  | "seagull"
  | "lion"
  | "eagle";

export type TeamBadgeHeadwear =
  | "bow"
  | "cap"
  | "helmet"
  | "halo"
  | "none";

export type TeamMeta = {
  code: TeamCode;
  label: string;
  shortLabel: string;
  initials: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    face: string;
  };
  character: TeamBadgeCharacter;
  headwear: TeamBadgeHeadwear;
  foreheadMark?: "heart" | "star" | "diamond" | "stripe" | "none";
};

export const TEAM_META: Record<TeamCode, TeamMeta> = {
  LG: {
    code: "LG",
    label: "LG 트윈스",
    shortLabel: "트윈스",
    initials: "LG",
    palette: {
      primary: "#D94A74",
      secondary: "#F8BECF",
      accent: "#8D1F43",
      face: "#FFF6EE",
    },
    character: "cat",
    headwear: "bow",
    foreheadMark: "heart",
  },
  DOOSAN: {
    code: "DOOSAN",
    label: "두산 베어스",
    shortLabel: "베어스",
    initials: "DS",
    palette: {
      primary: "#1F2A44",
      secondary: "#B8C6E5",
      accent: "#4D5F8C",
      face: "#FFF5EA",
    },
    character: "bear",
    headwear: "cap",
    foreheadMark: "none",
  },
  SSG: {
    code: "SSG",
    label: "SSG 랜더스",
    shortLabel: "랜더스",
    initials: "SSG",
    palette: {
      primary: "#C8CDD8",
      secondary: "#EEF1F6",
      accent: "#C53D43",
      face: "#FFF7F1",
    },
    character: "puppy",
    headwear: "none",
    foreheadMark: "star",
  },
  KIWOOM: {
    code: "KIWOOM",
    label: "키움 히어로즈",
    shortLabel: "히어로즈",
    initials: "KW",
    palette: {
      primary: "#7E2947",
      secondary: "#E7B9C8",
      accent: "#4F1732",
      face: "#FFF3EE",
    },
    character: "hero",
    headwear: "helmet",
    foreheadMark: "diamond",
  },
  KT: {
    code: "KT",
    label: "KT 위즈",
    shortLabel: "위즈",
    initials: "KT",
    palette: {
      primary: "#232225",
      secondary: "#F39AA5",
      accent: "#C3374B",
      face: "#FFF4EB",
    },
    character: "wizard",
    headwear: "halo",
    foreheadMark: "stripe",
  },
  NC: {
    code: "NC",
    label: "NC 다이노스",
    shortLabel: "다이노스",
    initials: "NC",
    palette: {
      primary: "#2E6370",
      secondary: "#B3E4EF",
      accent: "#153B4B",
      face: "#FDF5EE",
    },
    character: "dino",
    headwear: "none",
    foreheadMark: "none",
  },
  KIA: {
    code: "KIA",
    label: "KIA 타이거즈",
    shortLabel: "타이거즈",
    initials: "KIA",
    palette: {
      primary: "#B6233D",
      secondary: "#FFD5C7",
      accent: "#15304F",
      face: "#FFF4EA",
    },
    character: "tiger",
    headwear: "none",
    foreheadMark: "stripe",
  },
  LOTTE: {
    code: "LOTTE",
    label: "롯데 자이언츠",
    shortLabel: "자이언츠",
    initials: "LO",
    palette: {
      primary: "#0E3766",
      secondary: "#BFD7F4",
      accent: "#D73A4A",
      face: "#FFF5ED",
    },
    character: "seagull",
    headwear: "cap",
    foreheadMark: "diamond",
  },
  SAMSUNG: {
    code: "SAMSUNG",
    label: "삼성 라이온즈",
    shortLabel: "라이온즈",
    initials: "SL",
    palette: {
      primary: "#1455C0",
      secondary: "#C6DCFF",
      accent: "#0E3580",
      face: "#FFF6EE",
    },
    character: "lion",
    headwear: "none",
    foreheadMark: "star",
  },
  HANWHA: {
    code: "HANWHA",
    label: "한화 이글스",
    shortLabel: "이글스",
    initials: "HE",
    palette: {
      primary: "#F1792B",
      secondary: "#FFD9AD",
      accent: "#A64718",
      face: "#FFF4E9",
    },
    character: "eagle",
    headwear: "none",
    foreheadMark: "heart",
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
