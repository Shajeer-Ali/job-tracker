export type JobStatus =
  | "wishlist"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export const JOB_STATUSES: { value: JobStatus; label: string }[] = [
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export interface Job {
  id: string;
  company: string;
  role: string;
  location: string | null;
  job_url: string | null;
  salary: string | null;
  status: JobStatus;
  notes: string | null;
  applied_date: string | null;
  created_at: string;
}

export interface NewJob {
  company: string;
  role: string;
  location: string;
  job_url: string;
  salary: string;
  status: JobStatus;
  notes: string;
  applied_date: string;
}

export function jobToFormValues(job: Job): NewJob {
  return {
    company: job.company,
    role: job.role,
    location: job.location ?? "",
    job_url: job.job_url ?? "",
    salary: job.salary ?? "",
    status: job.status,
    notes: job.notes ?? "",
    applied_date: job.applied_date ?? "",
  };
}