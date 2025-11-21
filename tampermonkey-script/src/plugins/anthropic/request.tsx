import { BaseRenderer } from '../../core/renderer/base.tsx';
import AnthropicRequestVisualizer from '../../components/anthropic/AnthropicRequestVisualizer';
import { AnthropicRequest } from '../../types/api/anthropic';

// Validation function specifically for Anthropic requests
function isAnthropicRequest(parsedObj: any): boolean {
  return (!!parsedObj) && (!!parsedObj['model']) && (!!parsedObj['messages'] || !!parsedObj['prompt']);
}

export class AnthropicRequestRenderer extends BaseRenderer {
  name = 'anthropic-request';

  async render(uuid: string, action: 'request' | 'response', viewerName: string = "Auto"): Promise<void> {
    const json = await this.fetchFlowData(uuid, action, viewerName);
    if (!json.text) {
      console.warn("request has no text field.");
      return;
    }

    let parsedObj: AnthropicRequest;
    try {
      parsedObj = this.parseJSON(json.text);
    } catch (e: any) {
      console.error(e);
      return;
    }

    if (!isAnthropicRequest(parsedObj)) {
      return;
    }

    await this.renderReactComponent(AnthropicRequestVisualizer, { obj: parsedObj });
  }
}