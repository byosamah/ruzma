-- Force PostgREST schema cache refresh by sending a NOTIFY signal
NOTIFY pgrst, 'reload schema';