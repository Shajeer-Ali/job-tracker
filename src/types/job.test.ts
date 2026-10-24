import { describe, expect, it } from "vitest";
import { jobToFormValues, type Job } from "./job";

function makeJob(overrides: Partial<Job> = {}): Job {
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

describe("jobToFormValues", () => {
  it("turns empty (null) fields into empty strings for the form", () => {
    const values = jobToFormValues(makeJob());

    expect(values.location).toBe("");
    expect(values.job_url).toBe("");
    expect(values.salary).toBe("");
    expect(values.notes).toBe("");
    expect(values.applied_date).toBe("");
  });

  it("keeps the values that exist", () => {
    const values = jobToFormValues(
      makeJob({ location: "Berlin", salary: "50k", status: "interview" })
    );

    expect(values.company).toBe("Acme");
    expect(values.location).toBe("Berlin");
    expect(values.salary).toBe("50k");
    expect(values.status).toBe("interview");
  });
});