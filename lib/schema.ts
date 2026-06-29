export type MemoryType =
  | "Project"
  | "Decision"
  | "Task"
  | "Risk"
  | "OpenQuestion"
  | "Fact"
  | "Goal"
  | "Technology"
  | "TimelineEvent";

export interface MemoryUnit {
  type: MemoryType;
  project_id: string;
  content: string;
  rationale?: string;
  considered_alternatives?: string[];
  relates_to?: string[];
  status?: "active" | "archived" | "superseded" | string;
  source: "extension_capture" | "dashboard_paste" | string;
  timestamp: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  status: string;
  cognee_dataset_id: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}
