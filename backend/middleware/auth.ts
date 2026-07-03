import { supabaseAdmin } from '@/backend/database/supabase';

export const validateExtensionToken = async (req: Request) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    
    // DEMO BYPASS
    if (token === 'mock-token') {
        return { userId: 'demo-user-id' };
    }
    
    const { data, error } = await supabaseAdmin
        .from('extension_tokens')
        .select('user_id, expires_at')
        .eq('token', token)
        .single();
        
    if (error || !data) {
        return null;
    }
    
    if (new Date(data.expires_at) < new Date()) {
        return null;
    }
    
    return { userId: data.user_id };
}
