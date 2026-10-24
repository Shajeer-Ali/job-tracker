import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface ExtractedJob {
  company: string;
  role: string;
  location: string;
  salary: string;
  skills: string[];
}

export async function extractJob(description: string): Promise<ExtractedJob> {
  const { data, error } = await supabase.functions.invoke("extract-job", {
    body: { description },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      throw new Error(body?.error ?? "The AI request failed.");
    }
    throw new Error("Could not reach the AI service. Check your connection.");
  }

  return data as ExtractedJob;
}