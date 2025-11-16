// Common OpenAI request/response types
export interface OpenAIRequest {
  model: string;
  messages?: any[];
  prompt?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  n?: number;
  tools?: any[];
  [key: string]: any;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint: string;
  choices: any[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details?: {
      cached_tokens: number;
    };
  };
  [key: string]: any;
}

// OpenAI SSE Response Types
export interface OpenAISSEEvent {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  system_fingerprint?: string;
  choices?: OpenAIChoice[];
  usage?: OpenAIUsage;
}

export interface OpenAIChoice {
  index: number;
  delta?: OpenAIDelta;
  finish_reason?: string | null;
  logprobs?: any;
}

export interface OpenAIDelta {
  role?: string;
  content?: string;
  reasoning_content?: string;
  tool_calls?: OpenAIToolCallDelta[];
  logprobs?: any;
}

export interface OpenAIToolCallDelta {
  index: number;
  id?: string;
  type?: string;
  function?: {
    name?: string;
    arguments?: string;
  };
}

export interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
}

// Aggregated Response Data Types
export interface OpenAISSEResponseData {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint?: string;
  choices: OpenAIAggregatedChoice[];
  usage?: OpenAIUsage;
  eventCount: number;
}

export interface OpenAIAggregatedChoice {
  index: number;
  role: string;
  content: string;
  reasoning_content: string;
  tool_calls: OpenAIAggregatedToolCall[];
  finish_reason: string;
  logprobs?: any;
}

export interface OpenAIAggregatedToolCall {
  index: number;
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}