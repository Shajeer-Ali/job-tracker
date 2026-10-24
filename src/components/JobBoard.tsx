import { useState, type DragEvent } from "react";
import { JOB_STATUSES, type Job, type JobStatus } from "../types/job";
import JobCard from "./JobCard";

interface JobBoardProps {
  jobs: Job[];
  onStatusChange: (id: string, status: JobStatus) => void;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

function JobBoard({ jobs, onStatusChange, onEdit, onDelete }: JobBoardProps) {
  const [overStatus, setOverStatus] = useState<JobStatus | null>(null);

  function handleDrop(e: DragEvent, status: JobStatus) {
    e.preventDefault();
    setOverStatus(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onStatusChange(id, status);
  }

  return (
    <div className="board">
      {JOB_STATUSES.map(({ value, label }) => {
        const columnJobs = jobs.filter((job) => job.status === value);

        return (
          <section
            key={value}
            data-status={value}
            className={`column${overStatus === value ? " column-over" : ""}`}
            aria-labelledby={`column-${value}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOverStatus(value);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setOverStatus(null);
              }
            }}
            onDrop={(e) => handleDrop(e, value)}
          >
            <h3 id={`column-${value}`}>
              {label}
              <span className="count">{columnJobs.length}</span>
            </h3>
            {columnJobs.length === 0 && <p className="empty">Drop a job here</p>}
            {columnJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}

export default JobBoard;