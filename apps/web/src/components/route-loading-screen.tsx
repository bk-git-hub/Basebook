import Image from "next/image";

type RouteLoadingScreenProps = {
  title: string;
  description?: string;
};

export function RouteLoadingScreen({
  title,
  description = "잠시만 기다려 주세요.",
}: RouteLoadingScreenProps) {
  return (
    <main className="min-h-screen bg-white px-6 py-10 text-[#11284f] sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[36px] border border-[#e5ecf6] bg-white px-8 py-12 text-center shadow-[0_24px_60px_rgba(17,40,79,0.08)] sm:px-12 sm:py-16">
          <div className="mx-auto flex w-fit items-center justify-center rounded-[28px] border border-[#edf2f8] bg-[#fbfdff] p-5">
            <Image
              src="/basebook.png"
              alt="Basebook"
              width={104}
              height={104}
              priority
              className="h-20 w-20 animate-pulse rounded-[20px] bg-white object-contain sm:h-24 sm:w-24"
            />
          </div>

          <p className="mt-6 text-xs font-semibold tracking-[0.28em] text-[#d53342] uppercase">
            basebook
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#11284f] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#5a6f91] sm:text-base">
            {description}
          </p>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#11284f]" />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#c42d3c] [animation-delay:150ms]" />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#91a5c5] [animation-delay:300ms]" />
          </div>
        </section>
      </div>
    </main>
  );
}
