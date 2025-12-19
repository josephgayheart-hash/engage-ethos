-- Create conversations table
CREATE TABLE public.playground_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  institutional_profile_id UUID REFERENCES public.institutional_profiles(id) ON DELETE SET NULL,
  content_dna_id UUID REFERENCES public.content_dna_analysis(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.playground_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.playground_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playground_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playground_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
ON public.playground_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.playground_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.playground_conversations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.playground_conversations
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for messages (via conversation ownership)
CREATE POLICY "Users can view messages in their conversations"
ON public.playground_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.playground_conversations
    WHERE id = playground_messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.playground_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playground_conversations
    WHERE id = playground_messages.conversation_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages in their conversations"
ON public.playground_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.playground_conversations
    WHERE id = playground_messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_playground_conversations_user_id ON public.playground_conversations(user_id);
CREATE INDEX idx_playground_conversations_tenant_id ON public.playground_conversations(tenant_id);
CREATE INDEX idx_playground_messages_conversation_id ON public.playground_messages(conversation_id);
CREATE INDEX idx_playground_messages_created_at ON public.playground_messages(created_at);

-- Update timestamp trigger
CREATE TRIGGER update_playground_conversations_updated_at
BEFORE UPDATE ON public.playground_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();