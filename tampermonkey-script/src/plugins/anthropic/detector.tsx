import { APIDetector, Flow } from '../../core/api/types';

export class AnthropicDetector implements APIDetector {
  name = 'anthropic';

  detect(flow: Flow): boolean {
    // Extract the path without any query parameters
    const path = flow.request?.path?.split('?')[0];
    if (!path) {
      return false;
    }
    return path.endsWith('/messages');
  }
}