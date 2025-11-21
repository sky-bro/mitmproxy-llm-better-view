// API Provider Registry
import { APIProvider } from './types';

export class APIProviderRegistry {
  private providers: Map<string, APIProvider> = new Map();

  register(provider: APIProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): APIProvider | undefined {
    return this.providers.get(name);
  }

  getAll(): APIProvider[] {
    return Array.from(this.providers.values());
  }

  detectProvider(flow: any): APIProvider | undefined {
    for (const provider of this.providers.values()) {
      if (provider.detector.detect(flow)) {
        return provider;
      }
    }
    return undefined;
  }
}

// Global registry instance
export const apiRegistry = new APIProviderRegistry();