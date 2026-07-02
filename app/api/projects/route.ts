import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/backend/database/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin client not initialized' }, { status: 500 });
    }
    const { data: projects, error } = await supabaseAdmin.from('projects').select('*').order('last_activity_at', { ascending: false });
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(projects || []);
}

export async function POST(request: Request) {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase admin client not initialized' }, { status: 500 });
    }
    try {
        const body = await request.json();
        const projectId = uuidv4();
        
        // In this implementation we assume no authentication is provided for simplicity of demo, 
        // or a mock user is used if foreign key constraints exist. Let's try inserting without user_id first
        // If user_id is required, we may need a default user or get it from auth.
        const { data, error } = await supabaseAdmin.from('projects').insert([{
            id: projectId,
            name: body.name || 'New Project',
            cognee_dataset_id: `ctxos_${projectId}`,
            status: 'active'
        }]).select().single();
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
