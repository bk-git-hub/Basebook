export const KBO_STADIUM_OPTIONS = [
  { value: "잠실야구장", label: "잠실야구장" },
  { value: "고척스카이돔", label: "고척스카이돔" },
  { value: "인천SSG랜더스필드", label: "인천SSG랜더스필드" },
  { value: "수원 케이티 위즈 파크", label: "수원 케이티 위즈 파크" },
  { value: "대전 한화생명 볼파크", label: "대전 한화생명 볼파크" },
  { value: "대구삼성라이온즈파크", label: "대구삼성라이온즈파크" },
  { value: "창원NC파크", label: "창원NC파크" },
  { value: "광주-기아 챔피언스 필드", label: "광주-기아 챔피언스 필드" },
  { value: "사직야구장", label: "사직야구장" },
] as const;

const CANONICAL_STADIUM_VALUES = new Set<string>(
  KBO_STADIUM_OPTIONS.map((option) => option.value),
);

const STADIUM_ALIASES: Record<string, (typeof KBO_STADIUM_OPTIONS)[number]["value"]> =
  {
    잠실: "잠실야구장",
    잠실야구장: "잠실야구장",
    고척: "고척스카이돔",
    고척돔: "고척스카이돔",
    고척스카이돔: "고척스카이돔",
    인천: "인천SSG랜더스필드",
    문학: "인천SSG랜더스필드",
    문학야구장: "인천SSG랜더스필드",
    인천ssg랜더스필드: "인천SSG랜더스필드",
    수원: "수원 케이티 위즈 파크",
    수원kt위즈파크: "수원 케이티 위즈 파크",
    수원케이티위즈파크: "수원 케이티 위즈 파크",
    대전: "대전 한화생명 볼파크",
    대전한화생명볼파크: "대전 한화생명 볼파크",
    대구: "대구삼성라이온즈파크",
    대구삼성라이온즈파크: "대구삼성라이온즈파크",
    라이온즈파크: "대구삼성라이온즈파크",
    창원: "창원NC파크",
    창원nc파크: "창원NC파크",
    마산: "창원NC파크",
    광주: "광주-기아 챔피언스 필드",
    광주기아챔피언스필드: "광주-기아 챔피언스 필드",
    챔피언스필드: "광주-기아 챔피언스 필드",
    사직: "사직야구장",
    사직야구장: "사직야구장",
  };

function collapseStadiumKey(value: string): string {
  return value.replace(/[\s-]/g, "").toLowerCase();
}

export function normalizeKboStadium(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return "";
  }

  if (CANONICAL_STADIUM_VALUES.has(trimmed)) {
    return trimmed;
  }

  return STADIUM_ALIASES[collapseStadiumKey(trimmed)] ?? "";
}
