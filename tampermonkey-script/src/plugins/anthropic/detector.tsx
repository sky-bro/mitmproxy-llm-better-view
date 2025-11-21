import { APIDetector, Flow } from '../../core/api/types';

export class AnthropicDetector implements APIDetector {
  name = 'anthropic';

  detect(flow: Flow): boolean {
    return flow.request.path.endsWith('/messages');
  }
}