-- ContextOS Supabase Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cognee_dataset_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Capture Hashes Table (for Deduplication)
CREATE TABLE IF NOT EXISTS public.capture_hashes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extension Tokens Table (for Capture Auth)
CREATE TABLE IF NOT EXISTS public.extension_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Seed demo token for hackathon
INSERT INTO public.extension_tokens (user_id, token, expires_at)
VALUES ('demo-user', 'mock-token', NOW() + INTERVAL '1 year');

-- Note: Ensure RLS policies are created or disable RLS for the hackathon demo if using the service role key exclusively.
