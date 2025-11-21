import { BaseRenderer } from '../../core/renderer/base.tsx';
import OpenAIRequestVisualizer from '../../components/openai/OpenAIRequestVisualizer';

// Validation function specifically for OpenAI requests
function isLLMRequest(parsedObj: any): boolean {
  return (!!parsedObj) && (!!parsedObj['messages'] || !!parsedObj['prompt']) && (!!parsedObj['model']);
}

export class OpenAIRequestRenderer extends BaseRenderer {
  name = 'openai-request';

  async render(uuid: string, action: 'request' | 'response', viewerName: string = "Auto"): Promise<void> {
    const json = await this.fetchFlowData(uuid, action, viewerName);
    if (!json.text) {
      console.warn("response has no text field.");
      return;
    }

    let parsedObj: any;
    try {
      parsedObj = this.parseJSON(json.text);
    } catch (e: any) {
      console.error(e);
      return;
    }

    if (!isLLMRequest(parsedObj)) {
      return;
    }

    await this.renderReactComponent(OpenAIRequestVisualizer, { obj: parsedObj });
  }
}