type HomeStadiumSummaryProps = {
  wins: number;
  draws: number;
  losses: number;
  trackedGames: number;
  winRate: number;
};

const DESKTOP_DONUT_RADIUS = 52;
const DESKTOP_DONUT_CIRCUMFERENCE = 2 * Math.PI * DESKTOP_DONUT_RADIUS;
const MOBILE_DONUT_RADIUS = 36;
const MOBILE_DONUT_CIRCUMFERENCE = 2 * Math.PI * MOBILE_DONUT_RADIUS;

type DonutChartProps = {
  wins: number;
  draws: number;
  losses: number;
  trackedGames: number;
  winRate: number;
  mobile?: boolean;
};

function DonutChart({
  wins,
  draws,
  losses,
  trackedGames,
  winRate,
  mobile = false,
}: DonutChartProps) {
  const radius = mobile ? MOBILE_DONUT_RADIUS : DESKTOP_DONUT_RADIUS;
  const circumference = mobile
    ? MOBILE_DONUT_CIRCUMFERENCE
    : DESKTOP_DONUT_CIRCUMFERENCE;
  const segments = [
    { label: "승", value: wins, color: "#11284f" },
    { label: "무", value: draws, color: "#8ca0c2" },
    { label: "패", value: losses, color: "#d53342" },
  ];
  let offset = 0;

  return (
    <svg
      viewBox={mobile ? "0 0 110 110" : "0 0 140 140"}
      className="h-full w-full"
      aria-label={`직관 승률 ${winRate}%`}
      role="img"
    >
      <circle
        cx={mobile ? "55" : "70"}
        cy={mobile ? "55" : "70"}
        r={radius}
        fill="none"
        stroke="#e8eff8"
        strokeWidth={mobile ? "12" : "16"}
      />
      {trackedGames > 0
        ? segments.map((segment) => {
            const length = (segment.value / trackedGames) * circumference;
            const circle = (
              <circle
                key={segment.label}
                cx={mobile ? "55" : "70"}
                cy={mobile ? "55" : "70"}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={mobile ? "12" : "16"}
                strokeLinecap="round"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${mobile ? "55 55" : "70 70"})`}
              />
            );

            offset += length;

            return circle;
          })
        : null}
      <text
        x={mobile ? "55" : "70"}
        y={mobile ? "49" : "64"}
        textAnchor="middle"
        className={`fill-[#6a7d9f] font-semibold tracking-[0.22em] ${
          mobile ? "text-[6px]" : "text-[10px]"
        }`}
      >
        WIN RATE
      </text>
      <text
        x={mobile ? "55" : "70"}
        y={mobile ? "67" : "84"}
        textAnchor="middle"
        className={`fill-[#11284f] font-semibold ${mobile ? "text-[20px]" : "text-[26px]"}`}
      >
        {trackedGames > 0 ? `${winRate}%` : "-"}
      </text>
    </svg>
  );
}

function MobileMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#e6eef8] bg-[#fbfdff] px-3 py-2.5 text-center">
      <div className="mx-auto flex w-fit items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-semibold text-[#5a6f91]">{label}</span>
      </div>
      <p className="mt-1.5 text-lg font-semibold tracking-tight text-[#11284f]">
        {value}
      </p>
    </div>
  );
}

export function HomeStadiumSummary({
  wins,
  draws,
  losses,
  trackedGames,
  winRate,
}: HomeStadiumSummaryProps) {
  const segments = [
    { label: "승", value: wins, color: "#11284f" },
    { label: "무", value: draws, color: "#8ca0c2" },
    { label: "패", value: losses, color: "#d53342" },
  ];

  return (
    <>
      <section className="rounded-[28px] border border-[#e5ecf6] bg-white p-5 shadow-[0_16px_40px_rgba(17,40,79,0.05)] md:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-[#c42d3c] uppercase">
              stadium record
            </p>
            <h2 className="mt-1 text-[1.9rem] font-semibold tracking-tight text-[#11284f]">
              직관 승률
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-[#e5ecf6] bg-[#f8fbff] px-3 py-1.5 text-sm font-semibold text-[#11284f]">
            {trackedGames}경기
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
          직관으로 남긴 경기만 모아 빠르게 볼 수 있게 압축했습니다.
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-28 w-28 shrink-0">
            <DonutChart
              wins={wins}
              draws={draws}
              losses={losses}
              trackedGames={trackedGames}
              winRate={winRate}
              mobile
            />
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
            <MobileMetric label="승" value={wins} color="#11284f" />
            <MobileMetric label="무" value={draws} color="#8ca0c2" />
            <MobileMetric label="패" value={losses} color="#d53342" />
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-[#5a6f91]">
          {trackedGames > 0
            ? `${wins}승 ${draws}무 ${losses}패 기준 승률`
            : "아직 직관 승무패 기록이 없습니다."}
        </p>
      </section>

      <section className="hidden rounded-[32px] border border-[#e5ecf6] bg-white p-6 shadow-[0_18px_48px_rgba(17,40,79,0.06)] md:block">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
              stadium record
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#11284f]">
              직관 승률
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
              현장 관람으로 남긴 경기만 모아 승무패 흐름을 계산했습니다.
            </p>
          </div>
          <span className="rounded-full border border-[#e5ecf6] bg-[#f8fbff] px-3 py-1 text-sm font-semibold text-[#11284f]">
            {trackedGames}경기
          </span>
        </div>

        <div className="mt-8 grid items-center gap-8 md:grid-cols-[12rem_minmax(0,1fr)]">
          <div className="mx-auto flex h-[13rem] w-[13rem] items-center justify-center">
            <DonutChart
              wins={wins}
              draws={draws}
              losses={losses}
              trackedGames={trackedGames}
              winRate={winRate}
            />
          </div>

          <div className="space-y-3">
            {segments.map((segment) => (
              <div
                key={segment.label}
                className="flex items-center justify-between rounded-[22px] border border-[#edf2f8] bg-[#fbfdff] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium text-[#4e6284]">
                    {segment.label}
                  </span>
                </div>
                <span className="text-lg font-semibold tracking-tight text-[#11284f]">
                  {segment.value}
                </span>
              </div>
            ))}
            <p className="pt-2 text-sm leading-6 text-[#5a6f91]">
              {trackedGames > 0
                ? `${wins}승 ${draws}무 ${losses}패 기준으로 계산한 승률입니다.`
                : "아직 직관으로 기록된 승무패가 없어 승률은 비어 있습니다."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
