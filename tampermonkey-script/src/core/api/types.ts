// Core API types for the plugin system

export interface Flow {
  id: string;
  request: {
    path: string;
    method: string;
    headers: any[];
  };
  response?: {
    headers: any[];
  };
}

export interface CallAction {
  uuid: string;
  action: 'request' | 'response';
}

export interface APIDetector {
  name: string;
  detect(flow: Flow): boolean;
}

export interface APIRenderer {
  name: string;
  render(uuid: string, action: 'request' | 'response', viewerName?: string): Promise<void>;
}

export interface APIProvider {
  name: string;
  detector: APIDetector;
  requestRenderer: APIRenderer;
  responseRenderer: APIRenderer;
  sseRenderer?: APIRenderer;
}

export interface RenderContext {
  uuid: string;
  action: 'request' | 'response';
  viewerName?: string;
  flow?: Flow;
}