import { supabase } from "@/integrations/supabase/client";
import type { 
  MessageContext, 
  EvaluationResult, 
  BuilderResult, 
  MapperResult,
  InstitutionalConfig
} from "@/types/uplaybook";

export async function evaluateMessage(
  content: string, 
  context: MessageContext,
  institutionalConfig?: InstitutionalConfig
): Promise<EvaluationResult> {
  console.log("Sending message for AI evaluation...");
  
  const { data, error } = await supabase.functions.invoke('evaluate-message', {
    body: { 
      message: content, 
      context,
      mode: 'evaluator',
      institutionalConfig
    }
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

export async function buildMessage(
  context: MessageContext,
  institutionalConfig?: InstitutionalConfig
): Promise<BuilderResult> {
  console.log("Building message from context...");
  
  const { data, error } = await supabase.functions.invoke('evaluate-message', {
    body: { 
      context,
      mode: 'builder',
      institutionalConfig
    }
  });

  if (error) {
    console.error("Builder error:", error);
    throw new Error(error.message || "Failed to build message");
  }

  if (data.error) {
    console.error("AI builder error:", data.error);
    throw new Error(data.error);
  }

  console.log("Message build completed successfully");
  return data as BuilderResult;
}

export async function mapMessages(
  context: MessageContext,
  institutionalConfig?: InstitutionalConfig,
  journeyWeeks?: number,
  startDate?: string,
  endDate?: string
): Promise<MapperResult> {
  console.log("Generating messaging strategy...");
  
  const { data, error } = await supabase.functions.invoke('evaluate-message', {
    body: { 
      context,
      mode: 'mapper',
      institutionalConfig,
      journeyWeeks: journeyWeeks || 12,
      startDate,
      endDate
    }
  });

  if (error) {
    console.error("Mapper error:", error);
    throw new Error(error.message || "Failed to generate strategy");
  }

  if (data.error) {
    console.error("AI mapper error:", data.error);
    throw new Error(data.error);
  }

  console.log("Strategy generation completed successfully");
  return data as MapperResult;
}
