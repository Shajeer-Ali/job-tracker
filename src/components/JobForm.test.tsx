import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractJob } from "../api/ai";
import JobForm from "./JobForm";

// Replace the real AI call, so tests never use the network or your free quota
vi.mock("../api/ai", () => ({ extractJob: vi.fn() }));
const mockedExtract = vi.mocked(extractJob);

beforeEach(() => {
  mockedExtract.mockReset();
});

describe("JobForm", () => {
  it("rejects a company and role that are only spaces", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<JobForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^Company/), "   ");
    await user.type(screen.getByLabelText(/^Role/), "   ");
    await user.click(screen.getByRole("button", { name: "Add job" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Company and role are required."
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the entered values and clears the form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<JobForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^Company/), "Acme");
    await user.type(screen.getByLabelText(/^Role/), "Frontend Developer");
    await user.click(screen.getByRole("button", { name: "Add job" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          company: "Acme",
          role: "Frontend Developer",
          status: "wishlist",
        })
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText(/^Company/)).toHaveValue("")
    );
  });

  it("fills the form from the AI result without erasing what you typed", async () => {
    const user = userEvent.setup();
    mockedExtract.mockResolvedValue({
      company: "Brightwave GmbH",
      role: "Frontend Developer",
      location: "Berlin",
      salary: "",
      skills: ["React", "TypeScript"],
    });
    render(<JobForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText("Salary"), "50k");
    await user.click(screen.getByLabelText(/paste the job description/i));
    await user.paste(
      "Frontend Developer at Brightwave GmbH in Berlin. React and TypeScript."
    );
    await user.click(screen.getByRole("button", { name: "Auto-fill with AI" }));

    expect(await screen.findByDisplayValue("Brightwave GmbH")).toBeInTheDocument();
    expect(screen.getByLabelText(/^Role/)).toHaveValue("Frontend Developer");
    expect(screen.getByLabelText("Location")).toHaveValue("Berlin");
    // The AI found no salary, so the one typed by the user stays
    expect(screen.getByLabelText("Salary")).toHaveValue("50k");
    expect(screen.getByLabelText("Notes")).toHaveValue(
      "Skills: React, TypeScript"
    );
  });

  it("asks for more text before calling the AI", async () => {
    const user = userEvent.setup();
    render(<JobForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Auto-fill with AI" }));

    expect(
      screen.getByText("Paste a longer job description first.")
    ).toBeInTheDocument();
    expect(mockedExtract).not.toHaveBeenCalled();
  });

  it("shows a readable message when the AI fails", async () => {
    const user = userEvent.setup();
    mockedExtract.mockRejectedValue(new Error("The AI limit was reached."));
    render(<JobForm onSubmit={vi.fn()} />);

    await user.click(screen.getByLabelText(/paste the job description/i));
    await user.paste("A long enough job description for the check to pass.");
    await user.click(screen.getByRole("button", { name: "Auto-fill with AI" }));

    expect(
      await screen.findByText("The AI limit was reached.")
    ).toBeInTheDocument();
  });
});