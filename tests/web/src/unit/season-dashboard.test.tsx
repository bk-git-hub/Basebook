import { render, screen } from "@testing-library/react";

import { SeasonDashboard } from "@/components/season-dashboard";
import {
  SeasonDashboardEmptyState,
  SeasonDashboardErrorState,
} from "@/components/season-dashboard-state";

import { createEntriesResponse } from "../fixtures/entries";

describe("Season dashboard QA smoke", () => {
  it("renders the API-backed summary and recent entry links", () => {
    render(<SeasonDashboard dashboard={createEntriesResponse()} />);

    expect(screen.getByText("총 경기 수")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "최근 기록" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /퇴근길에 휴대폰으로 보던 경기였는데/,
      }),
    ).toHaveAttribute("href", "/entries/entry-lg-2026-04-02");
  });

  it("renders empty and error states with operator guidance", () => {
    const { rerender } = render(<SeasonDashboardEmptyState />);

    expect(
      screen.getByRole("heading", { name: "표시할 시즌 기록이 아직 없습니다" }),
    ).toBeInTheDocument();

    rerender(
      <SeasonDashboardErrorState
        message="백엔드 서버 연결에 실패했습니다."
        apiBaseUrl="http://localhost:4000"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "시즌 기록을 불러오지 못했습니다" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/localhost:4000/)).toBeInTheDocument();
  });
});
