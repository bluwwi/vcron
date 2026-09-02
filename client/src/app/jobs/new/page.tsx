import { JobForm } from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Job</h1>
        <p className="text-text-dim text-sm mt-0.5">Create a new scheduled HTTP job</p>
      </div>
      <JobForm mode="create" />
    </div>
  );
}
