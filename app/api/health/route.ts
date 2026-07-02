import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/backend/database/supabase';
import { config } from '@/backend/utils/config';

export async function GET() {
    const healthStatus: any = { status: 'ok', services: {} };

    // Check Supabase
    try {
        const supabase = createSupabaseClient();
        // A simple query to verify connection
        const { error } = await supabase.from('projects').select('id').limit(1);
        if (error) throw error;
        healthStatus.services.supabase = 'ok';
    } catch (e: any) {
        healthStatus.services.supabase = `error: ${e.message || String(e)}`;
        healthStatus.status = 'error';
    }

    // Check Python Service
    try {
        const pythonUrl = config.pythonService.url();
        const response = await fetch(`${pythonUrl}/health`, { signal: AbortSignal.timeout(5000) });
        if (!response.ok) {
            throw new Error(`Python service returned ${response.status}`);
        }
        healthStatus.services.python = 'ok';
    } catch (e: any) {
        healthStatus.services.python = `error: ${e.message || String(e)}`;
        healthStatus.status = 'error';
    }

    if (healthStatus.status === 'error') {
        return NextResponse.json(healthStatus, { status: 503 });
    }

    return NextResponse.json(healthStatus);
}
