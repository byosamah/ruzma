-- Create exchange_rates table for caching currency conversion rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    base_currency text NOT NULL,
    target_currency text NOT NULL,
    rate numeric(20, 8) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(base_currency, target_currency)
);

-- Add RLS policies
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read exchange rates
CREATE POLICY "Anyone can read exchange rates" ON public.exchange_rates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role can insert/update exchange rates (for the edge function)
CREATE POLICY "Service role can manage exchange rates" ON public.exchange_rates
    FOR ALL USING (auth.role() = 'service_role');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_exchange_rates_base_currency ON public.exchange_rates(base_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_target_currency ON public.exchange_rates(target_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_updated_at ON public.exchange_rates(updated_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exchange_rates_updated_at
    BEFORE UPDATE ON public.exchange_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some initial fallback rates (these will be updated by the edge function)
INSERT INTO public.exchange_rates (base_currency, target_currency, rate) VALUES
    ('USD', 'USD', 1.0),
    ('USD', 'EUR', 0.92),
    ('USD', 'GBP', 0.79),
    ('USD', 'SAR', 3.75),
    ('USD', 'AED', 3.67),
    ('USD', 'JOD', 0.71),
    ('USD', 'EGP', 48.7),
    ('USD', 'KWD', 0.31),
    ('USD', 'QAR', 3.64),
    ('USD', 'BHD', 0.38),
    ('USD', 'OMR', 0.38),
    ('USD', 'LBP', 15000.0),
    ('USD', 'MAD', 10.1),
    ('USD', 'TND', 3.1),
    ('USD', 'DZD', 134.5),
    ('USD', 'CAD', 1.36),
    ('USD', 'AUD', 1.52),
    ('USD', 'CHF', 0.88),
    ('USD', 'JPY', 149.8)
ON CONFLICT (base_currency, target_currency) DO NOTHING;

-- Update the database types (for TypeScript generation)
-- Note: This will be reflected in the generated types after migration