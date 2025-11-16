// Anthropic API request/response types (to be implemented)
// These will be similar to the OpenAI types once we add Anthropic support

export interface AnthropicRequest {
  model: string;
  messages?: any[];
  system?: string;
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
  stop_sequences?: string[];
  [key: string]: any;
}

export interface AnthropicResponse {
  id: string;
  type: 'message';
  role: string;
  model: string;
  content: Array<{
    type: 'text';
    text: string;
  }>;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  [key: string]: any;
}

// Anthropic SSE Response Types (will be used when we implement streaming)
export interface AnthropicSSEEvent {
  type: string;
  message?: AnthropicResponse;
  delta?: {
    type: 'text_delta' | 'input_json_delta' | 'end_turn';
    text?: string;
    partial_json?: string;
  };
  deltaContent?: string; // For aggregating deltas
}

export interface AnthropicSSEResponseData {
  id: string;
  type: 'message';
  role: string;
  model: string;
  content: string; // aggregated content
  stop_reason: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  eventCount: number;
}