import { createClient } from '@supabase/supabase-js'
import { config } from '../utils/config'

export const createSupabaseClient = () => {
    const supabaseUrl = config.supabase.url();
    const supabaseKey = config.supabase.serviceRoleKey();
    return createClient(supabaseUrl, supabaseKey);
}

export const supabaseAdmin = createSupabaseClient();
