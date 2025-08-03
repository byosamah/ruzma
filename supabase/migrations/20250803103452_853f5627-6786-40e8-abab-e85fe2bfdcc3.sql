-- Create function to get clients with project count
CREATE OR REPLACE FUNCTION public.get_clients_with_project_count(user_id_param uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  project_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.name,
    c.email,
    c.created_at,
    c.updated_at,
    COALESCE(COUNT(p.id), 0) as project_count
  FROM public.clients c
  LEFT JOIN public.projects p ON c.id = p.client_id
  WHERE c.user_id = user_id_param
  GROUP BY c.id, c.user_id, c.name, c.email, c.created_at, c.updated_at
  ORDER BY c.created_at DESC;
END;
$$;