import type { TeamCode } from "@basebook/contracts";

export type TeamMeta = {
  code: TeamCode;
  label: string;
  capLetter: string;
  palette: {
    backgroundStart: string;
    backgroundEnd: string;
    cap: string;
    capBrim: string;
    capText: string;
    face: string;
    hair: string;
    blush: string;
  };
};

export const TEAM_META: Record<TeamCode, TeamMeta> = {
  LG: {
    code: "LG",
    label: "LG 트윈스",
    capLetter: "T",
    palette: {
      backgroundStart: "#F8BECF",
      backgroundEnd: "#D94A74",
      cap: "#AA214F",
      capBrim: "#80133A",
      capText: "#FFF9FB",
      face: "#FFF3E8",
      hair: "#5A3429",
      blush: "#F2A9BA",
    },
  },
  DOOSAN: {
    code: "DOOSAN",
    label: "두산 베어스",
    capLetter: "D",
    palette: {
      backgroundStart: "#D4DEF3",
      backgroundEnd: "#7C96C9",
      cap: "#22355E",
      capBrim: "#172643",
      capText: "#F4F8FF",
      face: "#FFF4EA",
      hair: "#4D3429",
      blush: "#D8C2BD",
    },
  },
  SSG: {
    code: "SSG",
    label: "SSG 랜더스",
    capLetter: "L",
    palette: {
      backgroundStart: "#F3F4F7",
      backgroundEnd: "#C8CDD8",
      cap: "#6D7583",
      capBrim: "#C53D43",
      capText: "#FFFFFF",
      face: "#FFF5EC",
      hair: "#5C4336",
      blush: "#E7C6CB",
    },
  },
  KIWOOM: {
    code: "KIWOOM",
    label: "키움 히어로즈",
    capLetter: "K",
    palette: {
      backgroundStart: "#E8BCD0",
      backgroundEnd: "#9D4466",
      cap: "#7E2947",
      capBrim: "#4F1732",
      capText: "#FFF7FB",
      face: "#FFF1EB",
      hair: "#513127",
      blush: "#E7B2C6",
    },
  },
  KT: {
    code: "KT",
    label: "KT 위즈",
    capLetter: "W",
    palette: {
      backgroundStart: "#F7B0BC",
      backgroundEnd: "#D44961",
      cap: "#232225",
      capBrim: "#C3374B",
      capText: "#FFF8F9",
      face: "#FFF3EA",
      hair: "#403129",
      blush: "#F0B0B5",
    },
  },
  NC: {
    code: "NC",
    label: "NC 다이노스",
    capLetter: "D",
    palette: {
      backgroundStart: "#CBEFF6",
      backgroundEnd: "#71BFD2",
      cap: "#2E6370",
      capBrim: "#153B4B",
      capText: "#F6FDFF",
      face: "#FFF5ED",
      hair: "#4B3429",
      blush: "#BFE0E6",
    },
  },
  KIA: {
    code: "KIA",
    label: "KIA 타이거즈",
    capLetter: "T",
    palette: {
      backgroundStart: "#FFD6C7",
      backgroundEnd: "#E79B86",
      cap: "#B6233D",
      capBrim: "#15304F",
      capText: "#FFF8FA",
      face: "#FFF2E7",
      hair: "#5E3628",
      blush: "#F0BCB3",
    },
  },
  LOTTE: {
    code: "LOTTE",
    label: "롯데 자이언츠",
    capLetter: "G",
    palette: {
      backgroundStart: "#D2E0FA",
      backgroundEnd: "#87A9DD",
      cap: "#0E3766",
      capBrim: "#D73A4A",
      capText: "#F7FBFF",
      face: "#FFF4EB",
      hair: "#503227",
      blush: "#D3C2C0",
    },
  },
  SAMSUNG: {
    code: "SAMSUNG",
    label: "삼성 라이온즈",
    capLetter: "S",
    palette: {
      backgroundStart: "#D7E6FF",
      backgroundEnd: "#90B8F6",
      cap: "#1455C0",
      capBrim: "#0E3580",
      capText: "#F6FAFF",
      face: "#FFF4EA",
      hair: "#5B392A",
      blush: "#C4D8F6",
    },
  },
  HANWHA: {
    code: "HANWHA",
    label: "한화 이글스",
    capLetter: "E",
    palette: {
      backgroundStart: "#FFE0BE",
      backgroundEnd: "#F5AF61",
      cap: "#F1792B",
      capBrim: "#A64718",
      capText: "#FFF9F4",
      face: "#FFF2E6",
      hair: "#573528",
      blush: "#F4C6A0",
    },
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
