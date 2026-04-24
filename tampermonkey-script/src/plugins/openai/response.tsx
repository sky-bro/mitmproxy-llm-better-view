import { BaseRenderer } from '../../core/renderer/base.tsx';
import OpenAIResponseVisualizer from '../../components/openai/OpenAIResponseVisualizer';
import { processSSEEvents, OpenAIChatCompletion, OpenAIChatCompletionChunk } from '../../types/api/openai';
import OpenAIResponsesResponseVisualizer from '../../components/openai/OpenAIResponsesResponseVisualizer';
import {
  isResponsesResponse,
  OpenAIResponsesResponse,
  parseResponsesSSEEvents,
  processResponsesSSEEvents
} from '../../types/api/openai_responses';

// Validation function specifically for OpenAI responses
function isLLMResponse(parsedObj: any): boolean {
  return (!!parsedObj) && (!!parsedObj['choices']) && (!!parsedObj['model']);
}

export class OpenAIResponseRenderer extends BaseRenderer {
  name = 'openai-response';

  async render(uuid: string, action: 'request' | 'response', viewerName: string = "Auto"): Promise<void> {
    let json = await this.fetchFlowData(uuid, action, viewerName);
    const response = await this.parseResponseForView(json);
    console.log("OpenAI response to render:", response);

    if (!response) {
      return;
    }

    if (response.variant === 'responses') {
      await this.renderReactComponent(OpenAIResponsesResponseVisualizer, { response: response.response });
      return;
    }

    await this.renderReactComponent(OpenAIResponseVisualizer, { response: response.response });
  }

  private async parseResponseForView(json: any): Promise<{
    variant: 'chat_completions' | 'responses',
    response: OpenAIChatCompletion | OpenAIResponsesResponse
  } | null> {
    console.log("Parsing OpenAI response for view:", json);
    switch (json.view_name) {
      case "JSON":
        return await this.parseJsonResponse(json.text);
      case "Raw":
        return await this.parseSSEJsonResponse(json.text);
      default:
        return null;
    }
  }

  private async parseJsonResponse(text: string): Promise<{
    variant: 'chat_completions' | 'responses',
    response: OpenAIChatCompletion | OpenAIResponsesResponse
  } | null> {
    try {
      const parsedObj = this.parseJSON(text);
      if (isResponsesResponse(parsedObj)) {
        return {
          variant: 'responses',
          response: parsedObj as OpenAIResponsesResponse
        };
      }
      if (!isLLMResponse(parsedObj)) {
        return null;
      }
      return {
        variant: 'chat_completions',
        response: parsedObj as OpenAIChatCompletion
      };
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      return null;
    }
  }

  private async parseSSEJsonResponse(text: string): Promise<{
    variant: 'chat_completions' | 'responses',
    response: OpenAIChatCompletion | OpenAIResponsesResponse
  } | null> {
    try {
      console.log("Parsing SSE response text:", text);
      const responseEvents = parseResponsesSSEEvents(text);
      if (responseEvents.length > 0) {
        const hasResponsesEvent = responseEvents.some((event) =>
          typeof event?.type === 'string' && event.type.startsWith('response.')
        );
        if (hasResponsesEvent) {
          const response = processResponsesSSEEvents(responseEvents);
          if (response) {
            return {
              variant: 'responses',
              response
            };
          }
        }
      }

      const events: OpenAIChatCompletionChunk[] = [];

      // Parse SSE events from raw text format
      text.split('\n').forEach((line: string) => {
        line = line.trim();
        if (line.startsWith('data:')) {
          const dataContent = line.slice(5).trim(); // Remove 'data:' prefix and trim
          if (dataContent === '[DONE]' || dataContent === 'data: [DONE]') return; // Skip [DONE] markers

          try {
            const parsedData = this.parseJSON(dataContent);
            events.push(parsedData);
          } catch (parseError) {
            console.error('Error parsing SSE event data:', dataContent, parseError);
          }
        }
        // Handle the data-only format sometimes seen in SSE
        else if (line.startsWith('{') && line.endsWith('}')) {
          try {
            const parsedData = this.parseJSON(line);
            // Only add if it looks like a valid OpenAI streaming event
            if (parsedData && typeof parsedData.choices === 'object') {
              events.push(parsedData);
            }
          } catch (parseError) {
            console.error('Error parsing SSE event data:', line, parseError);
          }
        }
      });

      // Process the collected events using the existing function
      if (events.length > 0) {
        return {
          variant: 'chat_completions',
          response: processSSEEvents(events)
        };
      } else {
        return null; // No response to render if no events
      }
    } catch (e) {
      console.error("Error processing SSE response:", e);
      return null;
    }
  }
}
