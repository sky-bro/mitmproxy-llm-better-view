import { BaseRenderer } from '../../core/renderer/base.tsx';
import { processSSEEvents } from '../../utils/sse';
import OpenAISSEResponseVisualizer from '../../components/openai/OpenAISSEResponseVisualizer';

export class OpenAISSERenderer extends BaseRenderer {
  name = 'openai-sse';

  async render(uuid: string, action: 'request' | 'response', viewerName: string = "Auto"): Promise<void> {
    let json = await this.fetchFlowData(uuid, action, viewerName);

    // Handle SSE content
    if (json.view_name === "Raw") {
      const events: any[] = [];
      json.text.split('\n').forEach((line: string) => {
        line = line.trim();
        if (line.startsWith('data:')) {
          const dataContent = line.slice(5);
          if (dataContent === '[DONE]') return;
          try {
            events.push(this.parseJSON(dataContent));
          } catch { }
        }
      });

      const input = processSSEEvents(events);

      await this.renderReactComponent(OpenAISSEResponseVisualizer, {
        model: input.model,
        created: input.created,
        system_fingerprint: input.system_fingerprint,
        eventCount: input.eventCount,
        usage: input.usage,
        choices: input.choices
      });
    }
  }
}