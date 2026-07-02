const DEMO_PROJECT_NAME = "ContextOS Hackathon Build";

const DEMO_TEXT = `
Let's figure out the architecture for ContextOS. We need a backend to handle memory extraction and graph logic.
I think we should use FastAPI for the backend. We considered Flask and Django, but FastAPI gives us async support and fast prototyping speed which is crucial for a 7-day build. It relates to our Python backend architecture.
Also, we have a risk: Cognee Cloud latency may stall the live demo. This affects our frontend rendering.
Our main goal is to build a memory operating system for AI projects.
We have an open task to implement the Chrome extension capture logic, which depends on the backend APIs being ready.
`;

async function seed() {
    console.log("Starting seed process...");
    
    // 1. Create Project
    console.log(`Creating project: ${DEMO_PROJECT_NAME}`);
    const res = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: DEMO_PROJECT_NAME })
    });
    
    if (!res.ok) {
        console.error("Failed to create project", await res.text());
        return;
    }
    const project = await res.json();
    console.log(`Project created with ID: ${project.id}`);
    
    // 2. Ingest Data
    console.log("Ingesting demo data (this will take a moment)...");
    const rememberRes = await fetch(`http://localhost:3000/api/projects/${project.id}/remember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            raw_text: DEMO_TEXT,
            source: "Seed Script"
        })
    });
    
    if (!rememberRes.ok) {
        console.error("Failed to ingest data", await rememberRes.text());
        return;
    }
    
    const rememberData = await rememberRes.json();
    console.log("Ingestion complete:", rememberData);
    
    console.log("Seeding finished successfully!");
}

seed().catch(console.error);
