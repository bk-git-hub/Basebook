import { render, screen } from "@testing-library/react";

import { SeasonDashboard } from "@/components/season-dashboard";
import {
  SeasonDashboardEmptyState,
  SeasonDashboardErrorState,
} from "@/components/season-dashboard-state";

import { createEntriesResponse } from "../fixtures/entries";

describe("Season dashboard QA smoke", () => {
  it("renders the latest-season summary and entry links", () => {
    render(<SeasonDashboard dashboard={createEntriesResponse()} />);

    expect(screen.getByRole("heading", { name: "LG 트윈스" })).toBeInTheDocument();
    expect(screen.getByText("직관 승률")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("시즌 기록")).toBeInTheDocument();
    expect(screen.getByText("2건")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "전체 기록" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /퇴근길에 휴대폰으로 보던 경기였는데/,
      }),
    ).toHaveAttribute("href", "/entries/entry-lg-2026-04-02");
  });

  it("renders empty and error states for the current dashboard shell", () => {
    const { rerender } = render(<SeasonDashboardEmptyState />);

    expect(
      screen.getByRole("heading", { name: "아직 시즌 기록이 없습니다" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "새 일지 남기기" }),
    ).toHaveAttribute("href", "/entries/new");

    rerender(
      <SeasonDashboardErrorState
        message="백엔드 서버 연결에 실패했습니다."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "시즌 기록을 불러오지 못했습니다" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("백엔드 서버 연결에 실패했습니다."),
    ).toBeInTheDocument();
  });
});
