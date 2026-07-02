import { NextResponse, NextRequest } from 'next/server';
import { config } from '@/backend/utils/config';
import { supabaseAdmin } from '@/backend/database/supabase';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    try {
        const body = await request.json().catch(() => ({}));
        
        // Proxy to Python Service
        const pythonUrl = config.pythonService.url();
        const response = await fetch(`${pythonUrl}/memory/forget`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                project_id: id,
                node_id: body.node_id,
                wipe_project: body.wipe_project
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: 'Python service error', details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        // If the entire project is wiped, we must remove it from Postgres to maintain absolute sync
        if (body.wipe_project) {
            if (!supabaseAdmin) {
                 return NextResponse.json({ error: 'Supabase admin client not initialized' }, { status: 500 });
            }
            const { error: dbError } = await supabaseAdmin
                .from('projects')
                .delete()
                .eq('id', id);
                
            if (dbError) {
                console.error("Error deleting project from database", dbError);
                return NextResponse.json({ error: 'Database sync error', details: dbError.message }, { status: 500 });
            }
        }
        
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json(
            { error: 'Internal Server Error', message: e.message || String(e) },
            { status: 500 }
        );
    }
}
