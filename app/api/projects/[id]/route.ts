import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/database/supabase';
import { config } from '@/backend/utils/config';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin client not initialized' }, { status: 500 });
    }
    
    try {
        const { data: project, error } = await supabaseAdmin.from('projects').select('*').eq('id', id).single();
        if (error) throw error;
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        
        // Parallel call to Python service for canned summary, decisions, tasks, risks
        // Even if this fails, we return the project data.
        let summary = "Loading...";
        let decisions = [];
        let tasks = [];
        let risks = [];
        
        try {
            const pythonUrl = config.pythonService.url();
            
            // We can fetch from /memory/recall/canned or standard recall.
            // But since the architecture mentioned /memory/recall/canned:
            const cannedRes = await fetch(`${pythonUrl}/memory/recall/canned`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: id, type: 'summary' })
            });
            if (cannedRes.ok) {
                const cannedData = await cannedRes.json();
                summary = cannedData.summary || summary;
                decisions = cannedData.decisions || [];
                tasks = cannedData.tasks || [];
                risks = cannedData.risks || [];
            }
        } catch (e) {
            console.error("Failed to fetch canned data from Python service", e);
        }

        return NextResponse.json({ 
            ...project, 
            summary, 
            decisions, 
            tasks, 
            risks 
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
