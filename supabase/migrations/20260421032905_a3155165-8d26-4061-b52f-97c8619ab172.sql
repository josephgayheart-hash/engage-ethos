ALTER TABLE public.playground_messages REPLICA IDENTITY FULL;
ALTER TABLE public.playground_conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playground_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playground_conversations;