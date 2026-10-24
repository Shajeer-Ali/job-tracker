import { useState, type FormEvent } from "react";
import { extractJob } from "../api/ai";
import { JOB_STATUSES, type JobStatus, type NewJob } from "../types/job";

interface JobFormProps {
  onSubmit: (job: NewJob) => Promise<void>;
  initialValues?: NewJob;
  title?: string;
  submitLabel?: string;
  onCancel?: () => void;
}

const EMPTY_JOB: NewJob = {
  company: "",
  role: "",
  location: "",
  job_url: "",
  salary: "",
  status: "wishlist",
  notes: "",
  applied_date: "",
};

function JobForm({
  onSubmit,
  initialValues,
  title = "Add a job",
  submitLabel = "Add job",
  onCancel,
}: JobFormProps) {
  const [values, setValues] = useState<NewJob>(initialValues ?? EMPTY_JOB);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiNote, setAiNote] = useState("");

  function update<K extends keyof NewJob>(key: K, value: NewJob[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAutoFill() {
    setAiError("");
    setAiNote("");

    if (aiText.trim().length < 20) {
      setAiError("Paste a longer job description first.");
      return;
    }

    setAiLoading(true);
    try {
      const result = await extractJob(aiText);

      setValues((prev) => {
        const keptNotes = prev.notes
          .split("\n")
          .filter((line) => !line.startsWith("Skills:"));
        const notes =
          result.skills.length > 0
            ? [...keptNotes, `Skills: ${result.skills.join(", ")}`]
                .filter(Boolean)
                .join("\n")
            : prev.notes;

        return {
          ...prev,
          company: result.company || prev.company,
          role: result.role || prev.role,
          location: result.location || prev.location,
          salary: result.salary || prev.salary,
          notes,
        };
      });

      setAiNote(
        "Fields filled in. Please check them before saving, because AI can make mistakes."
      );
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "The AI request failed."
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!values.company.trim() || !values.role.trim()) {
      setError("Company and role are required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
      if (!initialValues) {
        setValues(EMPTY_JOB);
        setAiText("");
        setAiNote("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>

      {!initialValues && (
        <fieldset>
          <legend>Auto-fill with AI (optional)</legend>
          <label htmlFor="ai-description">
            Paste the job description (public text only)
          </label>
          <br />
          <textarea
            id="ai-description"
            rows={5}
            maxLength={12000}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
          />
          <br />
          <button type="button" onClick={handleAutoFill} disabled={aiLoading}>
            {aiLoading ? "Reading..." : "Auto-fill with AI"}
          </button>
          <p>
            <small>
              The text is sent to Google's Gemini free tier, which may use it
              to improve Google's products. Don't paste private details.
            </small>
          </p>
          {aiError && (
            <p role="alert" >
              {aiError}
            </p>
          )}
          {aiNote && <p aria-live="polite">{aiNote}</p>}className="error-text"
        </fieldset>
      )}

      <div>
        <label htmlFor="company">Company *</label>
        <br />
        <input
          id="company"
          required
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="role">Role *</label>
        <br />
        <input
          id="role"
          required
          value={values.role}
          onChange={(e) => update("role", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="location">Location</label>
        <br />
        <input
          id="location"
          value={values.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="job_url">Job link</label>
        <br />
        <input
          id="job_url"
          type="url"
          placeholder="https://..."
          value={values.job_url}
          onChange={(e) => update("job_url", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="salary">Salary</label>
        <br />
        <input
          id="salary"
          value={values.salary}
          onChange={(e) => update("salary", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <br />
        <select
          id="status"
          value={values.status}
          onChange={(e) => update("status", e.target.value as JobStatus)}
        >
          {JOB_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="applied_date">Date applied</label>
        <br />
        <input
          id="applied_date"
          type="date"
          value={values.applied_date}
          onChange={(e) => update("applied_date", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <br />
        <textarea
          id="notes"
          rows={3}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default JobForm;