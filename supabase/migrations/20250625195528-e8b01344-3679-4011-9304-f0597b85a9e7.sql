
-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  project_name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  project_id UUID,
  invoice_data JSONB, -- Store the complete invoice form data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own invoices
CREATE POLICY "Users can view their own invoices" 
  ON public.invoices 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own invoices
CREATE POLICY "Users can create their own invoices" 
  ON public.invoices 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own invoices
CREATE POLICY "Users can update their own invoices" 
  ON public.invoices 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own invoices
CREATE POLICY "Users can delete their own invoices" 
  ON public.invoices 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_transaction_id ON public.invoices(transaction_id);
