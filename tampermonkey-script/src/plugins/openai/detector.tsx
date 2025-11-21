import { BaseDetector } from '../../core/detector/base';
import { Flow } from '../../core/api/types';

export class OpenAIDetector extends BaseDetector {
  name = 'openai';

  detect(flow: Flow): boolean {
    // Check for OpenAI API patterns
    const openAIPatterns = [
      '/completions',
      '/chat/completions',
      '/embeddings',
      '/audio/transcriptions'
    ];

    return this.matchesPath(flow, openAIPatterns);
  }
}