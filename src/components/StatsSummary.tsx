import { JOB_STATUSES, type Job } from "../types/job";

interface StatsSummaryProps {
  jobs: Job[];
}

function StatsSummary({ jobs }: StatsSummaryProps) {
  return (
    <section aria-label="Summary" className="stats">
      <div className="stat" data-status="total">
        <strong>{jobs.length}</strong>
        <span>Total</span>
      </div>
      {JOB_STATUSES.map(({ value, label }) => (
        <div className="stat" data-status={value} key={value}>
          <strong>{jobs.filter((job) => job.status === value).length}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}

export default StatsSummary;