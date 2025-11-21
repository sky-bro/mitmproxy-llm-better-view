// Renderer Registry (optional - could be merged with main API registry)
import { APIRenderer } from '../api/types';

export class RendererRegistry {
  private renderers: Map<string, APIRenderer> = new Map();

  register(renderer: APIRenderer): void {
    this.renderers.set(renderer.name, renderer);
  }

  get(name: string): APIRenderer | undefined {
    return this.renderers.get(name);
  }

  getAll(): APIRenderer[] {
    return Array.from(this.renderers.values());
  }

  getByType(type: 'request' | 'response' | 'sse'): APIRenderer[] {
    return Array.from(this.renderers.values()).filter(renderer =>
      renderer.name.includes(type)
    );
  }
}

// Global renderer registry instance
export const rendererRegistry = new RendererRegistry();