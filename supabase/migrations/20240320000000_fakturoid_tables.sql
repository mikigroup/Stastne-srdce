-- Create fakturoid_tokens table
CREATE TABLE IF NOT EXISTS public.fakturoid_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Create RLS policies for fakturoid_tokens
ALTER TABLE public.fakturoid_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tokens"
    ON public.fakturoid_tokens
    FOR SELECT
    TO authenticated
    USING (auth.uid() = customer_id);

CREATE POLICY "Users can update their own tokens"
    ON public.fakturoid_tokens
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = customer_id);

-- Create fakturoid_auth_states table
CREATE TABLE IF NOT EXISTS public.fakturoid_auth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Create RLS policies for fakturoid_auth_states
ALTER TABLE public.fakturoid_auth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own auth states"
    ON public.fakturoid_auth_states
    FOR SELECT
    TO authenticated
    USING (auth.uid() = customer_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for fakturoid_tokens
CREATE TRIGGER update_fakturoid_tokens_updated_at
    BEFORE UPDATE ON public.fakturoid_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 