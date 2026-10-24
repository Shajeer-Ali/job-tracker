import { useState } from "react";
import {
  JOB_STATUSES,
  type Job,
  type JobStatus,
  type NewJob,
} from "../types/job";
import JobForm from "./JobForm";

interface JobListProps {
  jobs: Job[];
  onStatusChange: (id: string, status: JobStatus) => Promise<void>;
  onUpdate: (id: string, job: NewJob) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEditingChange: (editing: boolean) => void;
}

function toFormValues(job: Job): NewJob {
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

function JobList({
  jobs,
  onStatusChange,
  onUpdate,
  onDelete,
  onEditingChange,
}: JobListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  function startEditing(id: string) {
    setEditingId(id);
    onEditingChange(true);
  }

  function stopEditing() {
    setEditingId(null);
    onEditingChange(false);
  }

  if (jobs.length === 0) {
    return <p>No jobs yet. Add your first one above.</p>;
  }

  return (
    <ul>
      {jobs.map((job) => {
        if (job.id === editingId) {
          return (
            <li key={job.id}>
              <JobForm
                title="Edit job"
                submitLabel="Save changes"
                initialValues={toFormValues(job)}
                onSubmit={async (values) => {
                  await onUpdate(job.id, values);
                  stopEditing();
                }}
                onCancel={stopEditing}
              />
            </li>
          );
        }

        return (
          <li key={job.id}>
            <strong>{job.role}</strong> at {job.company}
            {job.location && <> · {job.location}</>}
            {job.salary && <> · {job.salary}</>}
            {job.applied_date && <> · Applied {job.applied_date}</>}
            {job.job_url && (
              <>
                {" "}
                ·{" "}
                <a href={job.job_url} target="_blank" rel="noreferrer">
                  Job link
                </a>
              </>
            )}
            {job.notes && <p>{job.notes}</p>}

            <div>
              <select
                aria-label={`Status for ${job.role} at ${job.company}`}
                value={job.status}
                onChange={(e) =>
                  onStatusChange(job.id, e.target.value as JobStatus)
                }
              >
                {JOB_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>{" "}
              <button onClick={() => startEditing(job.id)}>Edit</button>{" "}
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete "${job.role}" at ${job.company}? This can't be undone.`
                    )
                  ) {
                    onDelete(job.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default JobList;