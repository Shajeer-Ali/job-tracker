import { supabase } from "../lib/supabase";
import type { Job, JobStatus, NewJob } from "../types/job";

function toRow(job: NewJob) {
  return {
    company: job.company.trim(),
    role: job.role.trim(),
    location: job.location.trim() || null,
    job_url: job.job_url.trim() || null,
    salary: job.salary.trim() || null,
    status: job.status,
    notes: job.notes.trim() || null,
    applied_date: job.applied_date || null,
  };
}

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Job[];
}

export async function createJob(job: NewJob): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .insert(toRow(job))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Job;
}

export async function updateJob(id: string, job: NewJob): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .update(toRow(job))
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Job;
}

export async function updateJobStatus(
  id: string,
  status: JobStatus
): Promise<Job> {
  const { data, error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Job;
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) throw new Error(error.message);
}