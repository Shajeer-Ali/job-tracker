import { useEffect, useState } from "react";
import {
  createJob,
  deleteJob,
  fetchJobs,
  updateJob,
  updateJobStatus,
} from "../api/jobs";
import ErrorMessage from "../components/ErrorMessage";
import JobBoard from "../components/JobBoard";
import JobForm from "../components/JobForm";
import Modal from "../components/Modal";
import SearchBox from "../components/SearchBox";
import StatsSummary from "../components/StatsSummary";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  jobToFormValues,
  type Job,
  type JobStatus,
  type NewJob,
} from "../types/job";

function Dashboard() {
  const { session } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [adding, setAdding] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchJobs()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  async function handleAdd(newJob: NewJob) {
    const created = await createJob(newJob);
    setJobs((prev) => [created, ...prev]);
  }

  async function handleUpdate(id: string, values: NewJob) {
    const updated = await updateJob(id, values);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
  }

  async function handleStatusChange(id: string, status: JobStatus) {
    const job = jobs.find((j) => j.id === id);
    if (!job || job.status === status) return;

    const oldStatus = job.status;
    setActionError("");

    // Show the change immediately...
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));

    try {
      // ...then save it in the background
      await updateJobStatus(id, status);
    } catch (err) {
      // If saving fails, put the card back where it was
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: oldStatus } : j))
      );
      setActionError(
        err instanceof Error ? err.message : "Could not change the status."
      );
    }
  }

  async function handleDelete(id: string) {
    setActionError("");
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not delete the job."
      );
    }
  }

  function closeForm() {
    setAdding(false);
    setEditingJob(null);
  }

  function handleRetry() {
    setLoading(true);
    setError("");
    setAttempt((a) => a + 1);
  }

  const query = search.trim().toLowerCase();
  const visibleJobs = query
    ? jobs.filter((job) =>
        [job.company, job.role, job.location, job.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : jobs;

  const ready = !loading && !error;

  return (
    <div>
      <header className="app-header">
        <div className="brand">
          <h1>My Job Tracker</h1>
          <p>Logged in as {session?.user.email}</p>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <button className="btn-primary" onClick={() => setAdding(true)}>
            + Add job
          </button>
          <button onClick={() => supabase.auth.signOut()}>Log out</button>
        </div>
      </header>

      {actionError && (
        <p role="alert" className="error-text">
          {actionError}
        </p>
      )}

      {loading && (
        <div className="loading" aria-busy="true">
          <span className="spinner" aria-hidden="true" />
          Loading your jobs...
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={handleRetry} />}

      {ready && jobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            📋
          </div>
          <h2>No applications yet</h2>
          <p>Add your first job and move it across the board as you progress.</p>
          <button className="btn-primary" onClick={() => setAdding(true)}>
            + Add your first job
          </button>
        </div>
      )}

      {ready && jobs.length > 0 && (
        <>
          <StatsSummary jobs={jobs} />
          <div className="toolbar">
            <SearchBox value={search} onChange={setSearch} />
            <p className="hint">
              Tip: drag cards between columns, or use the dropdown on each card.
            </p>
          </div>
          {visibleJobs.length === 0 && (
            <p className="no-match">No jobs match "{search}".</p>
          )}
          <JobBoard
            jobs={visibleJobs}
            onStatusChange={handleStatusChange}
            onEdit={setEditingJob}
            onDelete={handleDelete}
          />
        </>
      )}

      <Modal
        open={adding || editingJob !== null}
        onClose={closeForm}
        label={editingJob ? "Edit job" : "Add a job"}
      >
        {editingJob ? (
          <JobForm
            key={editingJob.id}
            title="Edit job"
            submitLabel="Save changes"
            initialValues={jobToFormValues(editingJob)}
            onSubmit={async (values) => {
              await handleUpdate(editingJob.id, values);
              closeForm();
            }}
            onCancel={closeForm}
          />
        ) : (
          <JobForm
            key="new"
            onSubmit={async (values) => {
              await handleAdd(values);
              closeForm();
            }}
            onCancel={closeForm}
          />
        )}
      </Modal>
    </div>
  );
}

export default Dashboard;