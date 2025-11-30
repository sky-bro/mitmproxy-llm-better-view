import { APIProvider } from '../../core/api/types';
import { OpenAIDetector } from './detector';
import { OpenAIRequestRenderer } from './request';
import { OpenAIResponseRenderer } from './response';

export const OpenAIProvider: APIProvider = {
  name: 'openai',
  detector: new OpenAIDetector(),
  requestRenderer: new OpenAIRequestRenderer(),
  responseRenderer: new OpenAIResponseRenderer(),
};