import { AppShell } from "@/components/app-shell";
import { SeasonDashboardSkeleton } from "@/components/season-dashboard-skeleton";

export default function SeasonLoading() {
  return (
    <AppShell activeSection="season" title="시즌 기록" tone="home">
      <SeasonDashboardSkeleton />
    </AppShell>
  );
}
