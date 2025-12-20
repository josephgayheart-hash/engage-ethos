-- Enable realtime for email_nudges so admin panel can auto-update
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_nudges;