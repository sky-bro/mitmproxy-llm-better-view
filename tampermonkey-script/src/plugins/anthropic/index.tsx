import { APIProvider } from '../../core/api/types';
import { AnthropicDetector } from './detector';
import { AnthropicRequestRenderer } from './request';
import { AnthropicResponseRenderer } from './response';

export const AnthropicProvider: APIProvider = {
  name: 'anthropic',
  detector: new AnthropicDetector(),
  requestRenderer: new AnthropicRequestRenderer(),
  responseRenderer: new AnthropicResponseRenderer(),
};