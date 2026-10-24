import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Job } from "../types/job";
import JobBoard from "./JobBoard";

function makeJob(overrides: Partial<Job>): Job {
  return {
    id: "1",
    company: "Acme",
    role: "Developer",
    location: null,
    job_url: null,
    salary: null,
    status: "wishlist",
    notes: null,
    applied_date: null,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const jobs: Job[] = [
  makeJob({ id: "a1", company: "Acme", status: "wishlist" }),
  makeJob({ id: "b1", company: "Beta", status: "interview" }),
  makeJob({ id: "c1", company: "Gamma", status: "offer" }),
];

function renderBoard(list: Job[] = jobs) {
  const onStatusChange = vi.fn();
  render(
    <JobBoard
      jobs={list}
      onStatusChange={onStatusChange}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
    />
  );
  return { onStatusChange };
}

describe("JobBoard", () => {
  it("puts each job in the column that matches its status", () => {
    renderBoard();

    const interview = screen.getByRole("region", { name: /^Interview/ });
    expect(within(interview).getByText("Beta")).toBeInTheDocument();
    expect(within(interview).queryByText("Acme")).not.toBeInTheDocument();

    const wishlist = screen.getByRole("region", { name: /^Wishlist/ });
    expect(within(wishlist).getByText("Acme")).toBeInTheDocument();
  });

  it("shows a hint in empty columns", () => {
    renderBoard();

    // 5 columns, 3 of them have a job, so 2 are empty
    expect(screen.getAllByText("Drop a job here")).toHaveLength(2);
  });

  it("calls onStatusChange when a card is dropped on another column", () => {
    const { onStatusChange } = renderBoard();
    const offer = screen.getByRole("region", { name: /^Offer/ });

    fireEvent.drop(offer, { dataTransfer: { getData: () => "a1" } });

    expect(onStatusChange).toHaveBeenCalledWith("a1", "offer");
  });

  it("calls onStatusChange when the dropdown on a card changes", async () => {
    const user = userEvent.setup();
    const { onStatusChange } = renderBoard([
      makeJob({ id: "a1", company: "Acme", role: "Developer" }),
    ]);

    await user.selectOptions(
      screen.getByRole("combobox", { name: /Status for Developer at Acme/ }),
      "applied"
    );

    expect(onStatusChange).toHaveBeenCalledWith("a1", "applied");
  });

  it("shows only an empty hint when there are no jobs", () => {
    renderBoard([]);

    expect(screen.getAllByText("Drop a job here")).toHaveLength(5);
  });
});