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
            
            const res = await fetch(`${pythonUrl}/memory/recall/canned`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: id, type: 'dashboard_data' })
            });
            
            if (res.ok) {
                const data = await res.json();
                summary = data.summary || summary;
                decisions = data.decisions || [];
                tasks = data.tasks || [];
                risks = data.risks || [];
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin client not initialized' }, { status: 500 });
    }
    
    try {
        // 1. Wipe dataset in Python backend (which handles Cognee)
        const pythonUrl = config.pythonService.url();
        const forgetRes = await fetch(`${pythonUrl}/memory/forget`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: id, wipe_project: true })
        });
        
        if (!forgetRes.ok) {
            const err = await forgetRes.json();
            throw new Error(err.detail || 'Failed to wipe project memory in Cognee');
        }

        // 2. Delete project from Supabase
        // Note: capture_hashes has ON DELETE CASCADE to project_id, so they will be auto-deleted.
        const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);
        if (error) throw error;
        
        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Failed to delete project:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
