import { render, screen } from "@testing-library/react";

import { EntryDetail } from "@/components/entry-detail";
import { EntryDetailErrorState } from "@/components/entry-detail-state";

import { createEntry } from "../fixtures/entries";

describe("Entry detail QA smoke", () => {
  it("renders the saved entry payload and edit CTA", () => {
    const entry = createEntry({
      photos: [
        {
          id: "photo-1",
          url: "https://example.com/entry.png",
          fileName: "entry.png",
        },
      ],
    });

    render(<EntryDetail entry={entry} />);

    expect(
      screen.getByRole("heading", { name: "LG 트윈스 vs 두산 베어스" }),
    ).toBeInTheDocument();
    expect(screen.getByText("집관이었지만 끝내기 장면 때문에 소리 질렀다.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "이 기록 수정하기" }),
    ).toHaveAttribute("href", `/entries/${entry.id}/edit`);
    expect(screen.getByRole("link", { name: "원본 열기" })).toHaveAttribute(
      "href",
      "https://example.com/entry.png",
    );
  });

  it("renders the API error guidance card", () => {
    render(
      <EntryDetailErrorState
        message="GET /entries/:id 호출이 실패했습니다."
        apiBaseUrl="http://localhost:4000"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "기록 상세를 불러오지 못했습니다" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/localhost:4000/)).toBeInTheDocument();
  });
});
