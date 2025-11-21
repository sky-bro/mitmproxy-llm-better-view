import { BaseRenderer } from '../../core/renderer/base.tsx';
import OpenAIResponseVisualizer from '../../components/openai/OpenAIResponseVisualizer';

// Validation function specifically for OpenAI responses
function isLLMResponse(parsedObj: any): boolean {
  return (!!parsedObj) && (!!parsedObj['choices']) && (!!parsedObj['model']);
}

export class OpenAIResponseRenderer extends BaseRenderer {
  name = 'openai-response';

  async render(uuid: string, action: 'request' | 'response', viewerName: string = "Auto"): Promise<void> {
    let json = await this.fetchFlowData(uuid, action, viewerName);

    // Handle based on viewer type or content
    if (json.view_name === "JSON") {
      try {
        const parsedObj = this.parseJSON(json.text);
        // Check if it is an LLM response
        if (!isLLMResponse(parsedObj)) {
          return;
        }

        await this.renderReactComponent(OpenAIResponseVisualizer, { response: parsedObj });
      } catch (e) {
        console.error("Error parsing JSON response:", e);
      }
    }
  }
}