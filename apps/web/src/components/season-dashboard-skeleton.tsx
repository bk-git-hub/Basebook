export function SeasonDashboardSkeleton() {
  return (
    <div
      className="space-y-8"
      aria-busy="true"
      aria-label="시즌 기록을 불러오는 중"
    >
      <section className="h-64 animate-pulse rounded-[32px] border border-[#e5ecf6] bg-[#f7faff]" />
      <section className="grid animate-pulse gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 rounded-[24px] border border-[#e5ecf6] bg-[#f7faff]"
          />
        ))}
      </section>
      <section className="h-80 animate-pulse rounded-[30px] border border-[#e5ecf6] bg-[#f7faff]" />
    </div>
  );
}
