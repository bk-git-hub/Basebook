export function HomeContentSkeleton() {
  return (
    <div aria-busy="true" aria-label="홈 기록을 불러오는 중">
      <section className="mx-auto max-w-7xl px-5 py-5 sm:px-10 sm:py-14">
        <div className="grid animate-pulse gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(20rem,0.82fr)]">
          <div className="h-56 rounded-[32px] border border-[#e5ecf6] bg-[#f7faff]" />
          <div className="h-56 rounded-[32px] border border-[#e5ecf6] bg-[#f7faff]" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-10 sm:pb-20">
        <div className="animate-pulse border-b border-[#e6eef8] pb-5">
          <div className="h-3 w-24 rounded-full bg-[#e8eef7]" />
          <div className="mt-3 h-8 w-56 rounded-xl bg-[#e8eef7]" />
        </div>
        <div className="mt-6 grid animate-pulse gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-44 rounded-[30px] border border-[#e5ecf6] bg-[#f7faff]"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
