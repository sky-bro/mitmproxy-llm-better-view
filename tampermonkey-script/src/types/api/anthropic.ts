// Anthropic API request/response types
import { MessageCreateParams, RawMessageStreamEvent, Message, MessageParam, ContentBlock, TextBlockParam } from "@anthropic-ai/sdk/resources";

export type AnthropicRequest = MessageCreateParams;

export type AnthropicSystemMessageContent = string | Array<TextBlockParam>

export type AnthropicMessage = MessageParam;

export type AnthropicResponse = Message;

export type AnthropicSSEEvent = RawMessageStreamEvent

// Convert and aggregate Anthropic SSE events into a final response format
export function processAnthropicSSEEvents(events: AnthropicSSEEvent[]): AnthropicResponse {
  if (!events.length) {
    throw new Error("No events to process");
  }

  let current_snapshot: AnthropicResponse | null = null;

  for (const event of events) {
    switch (event.type) {
      case 'message_start':
        // Initialize with the message from the start event
        current_snapshot = {
          id: event.message.id,
          type: event.message.type,
          role: event.message.role,
          model: event.message.model,
          content: [...event.message.content], // shallow copy the initial content
          stop_reason: event.message.stop_reason,
          stop_sequence: event.message.stop_sequence,
          usage: {
            input_tokens: event.message.usage?.input_tokens ?? 0,
            output_tokens: event.message.usage?.output_tokens ?? 0,
            cache_creation_input_tokens: event.message.usage?.cache_creation_input_tokens ?? null,
            cache_read_input_tokens: event.message.usage?.cache_read_input_tokens ?? null,
            cache_creation: (event.message.usage as any)?.cache_creation ?? null,
            server_tool_use: (event.message.usage as any)?.server_tool_use ?? null,
            service_tier: (event.message.usage as any)?.service_tier ?? null,
          },
        };
        break;

      case 'content_block_start':
        if (current_snapshot) {
          let newContentBlock: ContentBlock;

          if (event.content_block.type === 'text') {
            // For text blocks, create with text and citations fields
            newContentBlock = {
              type: 'text',
              text: event.content_block.text || '',
              citations: (event.content_block as any).citations || [],
            };
          } else {
            // For non-text blocks (tool_use, thinking, etc), spread the existing properties
            newContentBlock = { ...event.content_block } as ContentBlock;
          }

          current_snapshot.content.push(newContentBlock);
        }
        break;

      case 'content_block_delta':
        if (current_snapshot) {
          // Get the content block to append delta to using index
          const contentIndex = event.index;
          if (contentIndex !== undefined && contentIndex < current_snapshot.content.length) {
            const contentBlock = current_snapshot.content[contentIndex];

            if (event.delta.type === 'text_delta') {
              // Handle text deltas for text content blocks
              if (contentBlock.type === 'text') {
                contentBlock.text = (contentBlock.text || '') + (event.delta.text || '');
              }
            } else if (event.delta.type === 'input_json_delta') {
              // Handle input json deltas for tool use blocks
              if (contentBlock.type === 'tool_use' || contentBlock.type === 'server_tool_use') {
                // Store and accumulate raw JSON string for parsing
                const accumulatedInput = (contentBlock as any)._partial_json || '';
                const newInput = accumulatedInput + (event.delta.partial_json || '');
                (contentBlock as any)._partial_json = newInput;
                try {
                  contentBlock.input = JSON.parse(newInput);
                } catch (e) {
                  // If JSON is incomplete/partial, store what we have
                  // and continue with partial parsing later
                }
              }
            } else if (event.delta.type === 'citations_delta') {
              // Handle citation deltas for text blocks
              if (contentBlock.type === 'text') {
                if (!contentBlock.citations) {
                  contentBlock.citations = [event.delta.citation];
                } else {
                  contentBlock.citations.push(event.delta.citation);
                }
              }
            } else if (event.delta.type === 'thinking_delta') {
              // Handle thinking deltas
              if (contentBlock.type === 'thinking') {
                contentBlock.thinking = (contentBlock.thinking || '') + (event.delta.thinking || '');
              }
            } else if (event.delta.type === 'signature_delta') {
              // Handle signature deltas for thinking blocks
              if (contentBlock.type === 'thinking') {
                contentBlock.signature = event.delta.signature;
              }
            }
          }
        }
        break;

      case 'message_delta':
        if (current_snapshot) {
          // Update message-level properties from the delta
          if (event.delta.stop_reason) {
            current_snapshot.stop_reason = event.delta.stop_reason;
          }
          if (event.delta.stop_sequence) {
            current_snapshot.stop_sequence = event.delta.stop_sequence;
          }

          // Update usage information
          if (event.usage) {
            current_snapshot.usage = {
              ...current_snapshot.usage,
              input_tokens: event.usage.input_tokens ?? current_snapshot.usage.input_tokens,
              output_tokens: event.usage.output_tokens ?? current_snapshot.usage.output_tokens,
              cache_creation_input_tokens: event.usage.cache_creation_input_tokens ?? current_snapshot.usage.cache_creation_input_tokens,
              cache_read_input_tokens: event.usage.cache_read_input_tokens ?? current_snapshot.usage.cache_read_input_tokens,
              server_tool_use: event.usage.server_tool_use ?? current_snapshot.usage.server_tool_use,
            };
          }
        }
        break;

      case 'content_block_stop':
      case 'message_stop':
      default:
        // Handle unexpected event types - removing the ping handler for now as it might be invalid
        break;
    }
  }

  // If we didn't get a message_stop event, return the current snapshot
  if (current_snapshot) {
    return current_snapshot;
  }

  // Fallback - return a default response if no proper events were processed
  return {
    id: "N/A",
    type: "message",
    role: "assistant",
    model: "N/A",
    content: [],
    stop_reason: null,
    stop_sequence: null,
    usage: {
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_input_tokens: null,
      cache_read_input_tokens: null,
      cache_creation: null,
      server_tool_use: null,
      service_tier: null,
    },
  };
}
