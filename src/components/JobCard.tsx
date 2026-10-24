import { useState } from "react";
import { JOB_STATUSES, type Job, type JobStatus } from "../types/job";

interface JobCardProps {
  job: Job;
  onStatusChange: (id: string, status: JobStatus) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

function JobCard({ job, onStatusChange, onEdit, onDelete }: JobCardProps) {
  const [dragging, setDragging] = useState(false);

  const hue =
    ([...job.company].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) * 37) %
    360;

  return (
    <article
      className={`job-card${dragging ? " dragging" : ""}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", job.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
    >
      <div className="job-top">
        <div
          className="avatar"
          aria-hidden="true"
          style={{ background: `hsl(${hue} 65% 40%)` }}
        >
          {job.company.charAt(0).toUpperCase()}
        </div>
        <div className="job-title">
          <h4>{job.role}</h4>
          <p className="company">{job.company}</p>
        </div>
      </div>

      {(job.location || job.salary || job.applied_date) && (
        <ul className="chips">
          {job.location && (
            <li>
              <span aria-hidden="true">📍 </span>
              {job.location}
            </li>
          )}
          {job.salary && (
            <li>
              <span aria-hidden="true">💰 </span>
              {job.salary}
            </li>
          )}
          {job.applied_date && (
            <li>
              <span aria-hidden="true">📅 </span>
              {job.applied_date}
            </li>
          )}
        </ul>
      )}

      {job.notes && <p className="notes">{job.notes}</p>}

      {job.job_url && (
        <a
          className="job-link"
          href={job.job_url}
          target="_blank"
          rel="noreferrer"
        >
          Open posting <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}

      <div className="job-actions">
        <select
          aria-label={`Status for ${job.role} at ${job.company}`}
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value as JobStatus)}
        >
          {JOB_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          aria-label={`Edit ${job.role} at ${job.company}`}
          onClick={() => onEdit(job)}
        >
          Edit
        </button>
        <button
          className="btn-danger"
          aria-label={`Delete ${job.role} at ${job.company}`}
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
    </article>
  );
}

export default JobCard;