import { OpenAI } from "openai/client.js";
import { ChatCompletionCreateParamsBase, ChatCompletion, ChatCompletionMessage, ChatCompletionMessageToolCall, ChatCompletionMessageFunctionToolCall, ChatCompletionChunk } from "openai/resources/chat/completions.mjs";

// export interface OpenAIResponse {
//   id: string;
//   object: string;
//   created: number;
//   model: string;
//   system_fingerprint: string;
//   choices: any[];
//   usage: {
//     prompt_tokens: number;
//     completion_tokens: number;
//     total_tokens: number;
//     prompt_tokens_details?: {
//       cached_tokens: number;
//     };
//   };
//   [key: string]: any;
// }

// non stream

export type OpenAIChatCompletionChoiceMessage = ChatCompletionMessage & {
  reasoning_content?: string
}

export type OpenAIChatCompletionChoice = Omit<ChatCompletion.Choice, "message"> & {
  message: OpenAIChatCompletionChoiceMessage
}

export type OpenAIChatCompletion = Omit<ChatCompletion, "choices"> & {
  choices: Array<OpenAIChatCompletionChoice>
}

// stream
export type OpenAIChatCompletionChunkChoiceDelta = ChatCompletionChunk.Choice.Delta & {
  reasoning_content?: string
}

export type OpenAIChatCompletionChunkChoice = Omit<ChatCompletionChunk.Choice, "delta"> & {
  delta: OpenAIChatCompletionChunkChoiceDelta
}

export type OpenAIChatCompletionChunk = Omit<ChatCompletionChunk, "choices">  & {
  choices: Array<OpenAIChatCompletionChunkChoice>
}

export function processSSEEvents(events: Array<OpenAIChatCompletionChunk>): OpenAIChatCompletion {
  if (!events.length) {
    throw new Error("No events to process")
  }

  let currentSnapshot: OpenAIChatCompletion = {
    id: "N/A",
    choices: [],
    created: 0,
    model: "N/A",
    object: "chat.completion",
  }

  for (const event of events) {
    if (event.id) {
      currentSnapshot.id = event.id
    }
    if (event.created) {
      currentSnapshot.created = event.created
    }
    if (event.model) {
      currentSnapshot.model = event.model
    }
    if (event.service_tier) {
      currentSnapshot.service_tier = event.service_tier
    }
    if (event.usage) {
      currentSnapshot.usage = event.usage
    }
    if (event.system_fingerprint) {
      currentSnapshot.system_fingerprint = event.system_fingerprint
    }

    // choices
    for (const chunkChoice of event.choices) {
      let idx = chunkChoice.index
      if (!currentSnapshot.choices[idx]) {
        currentSnapshot.choices[idx] = {
          message: {
            role: 'assistant',
            refusal: '',
            reasoning_content: '',
            content: '',
            tool_calls: [],
            function_call: null
          },
          index: chunkChoice.index,
          finish_reason: 'stop',
          logprobs: chunkChoice.logprobs ? chunkChoice.logprobs : null
        }
      }
      const choice = currentSnapshot.choices[idx]
      if (chunkChoice.finish_reason) {
        choice.finish_reason = chunkChoice.finish_reason
      }
      if (chunkChoice.logprobs) {
        choice.logprobs = chunkChoice.logprobs
      }
      // merge message delta
      if (chunkChoice.delta) {
        if (chunkChoice.delta.refusal) {
          choice.message.refusal += chunkChoice.delta.refusal
        }
        if (chunkChoice.delta.reasoning_content) {
          choice.message.reasoning_content += chunkChoice.delta.reasoning_content
        }
        if (chunkChoice.delta.content) {
          choice.message.content += chunkChoice.delta.content
        }

        if (chunkChoice.delta.function_call) {
          if (!choice.message.function_call) {
            choice.message.function_call = {
              arguments: '',
              name: ''
            }
          }
          if (chunkChoice.delta.function_call.arguments) {
            choice.message.function_call.arguments += chunkChoice.delta.function_call.arguments
          }
          if (chunkChoice.delta.function_call.name) {
            choice.message.function_call.name += chunkChoice.delta.function_call.name
          }
        }

        if (chunkChoice.delta.tool_calls && chunkChoice.delta.tool_calls.length) {
          for (const toolCallDelta of chunkChoice.delta.tool_calls) {
            const idx2 = toolCallDelta.index;
            if (!choice.message.tool_calls) {
              choice.message.tool_calls = []
            }
            if (!choice.message.tool_calls[idx2]) {
              choice.message.tool_calls[idx2] = {
                type: toolCallDelta.type || 'function',
                id: '',
                function: {
                  arguments: '',
                  name: ''
                }
              }
            }
            const toolCall = choice.message.tool_calls[idx2] as ChatCompletionMessageFunctionToolCall
            if (toolCallDelta.id) {
              toolCall.id += toolCallDelta.id
            }
            if (toolCallDelta.function) {
              if (toolCallDelta.function.arguments) {
                toolCall.function.arguments += toolCallDelta.function.arguments
              }
              if (toolCallDelta.function.name) {
                toolCall.function.name += toolCallDelta.function.name
              }
            }
          }
        }
      }

    }
  }
  return currentSnapshot
}

// OpenAI SSE Response Types
// export interface OpenAISSEEvent {
//   id?: string;
//   object?: string;
//   created?: number;
//   model?: string;
//   system_fingerprint?: string;
//   choices?: OpenAIChoice[];
//   usage?: OpenAIUsage;
// }

// export interface OpenAIChoice {
//   index: number;
//   delta?: OpenAIDelta;
//   finish_reason?: string | null;
//   logprobs?: any;
// }

// export interface OpenAIDelta {
//   role?: string;
//   content?: string;
//   reasoning_content?: string;
//   tool_calls?: OpenAIToolCallDelta[];
//   logprobs?: any;
// }

// export interface OpenAIToolCallDelta {
//   index: number;
//   id?: string;
//   type?: string;
//   function?: {
//     name?: string;
//     arguments?: string;
//   };
// }

// export interface OpenAIUsage {
//   prompt_tokens?: number;
//   completion_tokens?: number;
//   total_tokens?: number;
//   prompt_tokens_details?: {
//     cached_tokens?: number;
//   };
// }

// // Aggregated Response Data Types
// export interface OpenAISSEResponseData {
//   id: string;
//   object: string;
//   created: number;
//   model: string;
//   system_fingerprint?: string;
//   choices: OpenAIAggregatedChoice[];
//   usage?: OpenAIUsage;
//   eventCount: number;
// }

// export interface OpenAIAggregatedChoice {
//   index: number;
//   message: ChatCompletionMessage & {
//     reasoning_content: string
//   }
//     // role: string;
//     // content: string;
//     // reasoning_content: string;
//     // tool_calls: OpenAIAggregatedToolCall[];
//   finish_reason: string;
//   logprobs?: any;
// }

// // export type OpenAIAggregatedToolCall = ChatCompletionMessageToolCall
// export interface OpenAIAggregatedToolCall {
//   index: number;
//   id: string;
//   type: string;
//   custom?: {
//     name: string;
//     input: string
//   }
//   function?: {
//     name: string;
//     arguments: string;
//   };
// }