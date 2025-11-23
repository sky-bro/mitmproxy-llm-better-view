import { BaseRenderer } from '../../core/renderer/base.tsx';
import AnthropicResponseVisualizer from '../../components/anthropic/AnthropicResponseVisualizer';
import { processAnthropicSSEEvents, AnthropicResponse } from '../../types/api/anthropic';

// Validation function specifically for Anthropic responses
function isAnthropicResponse(parsedObj: any): boolean {
  return (!!parsedObj) && (!!parsedObj['content']) && (!!parsedObj['model']);
}

export class AnthropicResponseRenderer extends BaseRenderer {
  name = 'anthropic-response';

  async render(uuid: string, action: 'request' | 'response', viewerName: string = "Auto"): Promise<void> {
    let json = await this.fetchFlowData(uuid, action, viewerName);
    const response: AnthropicResponse | null = await this.parseResponseForView(json);
    console.log("Anthropic response to render:", response);

    if (response) {
      await this.renderReactComponent(AnthropicResponseVisualizer, { response: response });
    }
  }

  private async parseResponseForView(json: any): Promise<AnthropicResponse | null> {
    console.log("Parsing Anthropic response for view:", json);
    switch (json.view_name) {
      case "JSON":
        return await this.parseJsonResponse(json.text);
      case "Raw":
        return await this.parseSSEJsonResponse(json.text);
      default:
        return null;
    }
  }

  private async parseJsonResponse(text: string): Promise<AnthropicResponse | null> {
    try {
      const parsedObj = this.parseJSON(text);
      if (!isAnthropicResponse(parsedObj)) {
        return null;
      }
      return parsedObj as AnthropicResponse;
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      return null;
    }
  }

  private async parseSSEJsonResponse(text: string): Promise<AnthropicResponse | null> {
    try {
      console.log("Parsing SSE response text:", text);
      const events: any[] = [];

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
            // Only add if it looks like a valid Anthropic streaming event
            if (parsedData && typeof parsedData.type === 'string') {
              events.push(parsedData);
            }
          } catch (parseError) {
            console.error('Error parsing SSE event data:', line, parseError);
          }
        }
      });

      // Process the collected events using the existing function
      if (events.length > 0) {
        return processAnthropicSSEEvents(events);
      } else {
        return null; // No response to render if no events
      }
    } catch (e) {
      console.error("Error processing SSE response:", e);
      return null;
    }
  }
}