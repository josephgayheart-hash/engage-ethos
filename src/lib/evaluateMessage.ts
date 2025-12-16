import { supabase } from "@/integrations/supabase/client";
import type { MessageContext, EvaluationResult } from "@/types/persist";

export async function evaluateMessage(
  content: string, 
  context: MessageContext
): Promise<EvaluationResult> {
  console.log("Sending message for AI evaluation...");
  
  const { data, error } = await supabase.functions.invoke('evaluate-message', {
    body: { message: content, context }
  });

  if (error) {
    console.error("Evaluation error:", error);
    throw new Error(error.message || "Failed to evaluate message");
  }

  if (data.error) {
    console.error("AI evaluation error:", data.error);
    throw new Error(data.error);
  }

  console.log("Evaluation completed successfully");
  return data as EvaluationResult;
}
