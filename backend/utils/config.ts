import { AppError } from './errors';

export const requireEnvVar = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new AppError(`Missing required environment variable: ${name}`, 500);
    }
    return value;
};

export const config = {
    supabase: {
        url: () => requireEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
        anonKey: () => requireEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        serviceRoleKey: () => process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    pythonService: {
        url: () => requireEnvVar('PYTHON_SERVICE_URL'),
    }
};
