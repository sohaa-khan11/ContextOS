import { ProjectDetailLayout } from "@/components/ProjectDetailLayout";

// Since it's a dynamic route we get params
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  // In a real app we'd fetch the project by ID.
  // For the UI demonstration, we'll mock it.
  const projectName = `Project ${resolvedParams.id}`;

  return (
    <div className="w-full">
      <ProjectDetailLayout projectName={projectName} />
    </div>
  );
}
