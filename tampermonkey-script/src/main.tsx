// React imports are used in plugins, but not directly in main.tsx
import { CallAction, Flow } from './types/mitmproxy';
import { LRUCache, omit } from './utils/cache';
import { getStyles } from './utils/cssUtils';
import { apiRegistry } from './core/api/registry';
import { OpenAIProvider } from './plugins/openai';
import { AnthropicProvider } from './plugins/anthropic';

// Import Tampermonkey functions
// @ts-ignore
import { unsafeWindow } from '$';

// Register API providers
apiRegistry.register(OpenAIProvider);
apiRegistry.register(AnthropicProvider);

// LRU cache for Flow data to improve performance
const flowKV = new LRUCache<string, Flow>(1024);

// Save the original fetch method for later use
const originalFetch = unsafeWindow.fetch;

// Add CSS styles
const addStyles = () => {
  // Check if styles are already added
  if (document.getElementById('llm-better-view-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'llm-better-view-styles';
  style.textContent = getStyles();
  document.head.appendChild(style);
};

addStyles();

/**
 * Listen for URL changes and automatically render LLM request/response content
 * Entry point for mitmproxy-llm-better-view script.
 * Listens for URL changes in the mitmproxy web interface and renders custom visualizations
 * for LLM request/response flows.
 */
listenUrlChange(async ({ uuid, action }) => {
  const flow = await getFlow(uuid);
  console.log("Detected flow for rendering:", flow);
  if (!flow) {
    return;
  }

  // Detect which API provider to use
  const provider = apiRegistry.detectProvider(flow);
  if (!provider) {
    return;
  }

  // Render based on action
  if (action === 'request') {
    await provider.requestRenderer.render(uuid, action, "json");
  } else if (action === 'response') {
    let viewerName = "Auto";
    const contentType = getContentType(flow);
    if (contentType) {
      if (contentType.includes('application/json')) {
        viewerName = "json";
      } else if (contentType.includes('text/event-stream')) {
        viewerName = "raw";
      }
    }

    await provider.responseRenderer.render(uuid, action, viewerName);
  }
});

/**
 * Get Content-Type from response headers
 * @param flow The Flow object
 */
function getContentType(flow: Flow): string | null {
  const headers = flow.response?.headers;
  if (!headers) return null;

  // headers is an array of objects, find the Content-Type header
  for (const header of headers) {
    // Handle case where header might be an array (misinterpreted structure)
    if (Array.isArray(header)) {
      // If header is an array, check if it has the expected structure [key, value]
      if (header.length >= 2 && typeof header[0] === 'string' && typeof header[1] === 'string') {
        const [key, value] = header;
        if (key.toLowerCase() === 'content-type') {
          return value.toLowerCase();
        }
      }
      continue;
    }

    // Handle case where header is an object (expected structure)
    if (typeof header === 'object' && header !== null) {
      for (const [key, value] of Object.entries(header)) {
        if (key.toLowerCase() === 'content-type') {
          return value.toLowerCase();
        }
      }
    }
  }
  return null;
}

/**
 * Extract Flow info (uuid and action) from the URL
 * @param url The current page URL
 */
function extractFlowInfo(url: string): CallAction | null {
  const regex = /#\/flows\/([0-9a-fA-F\-]{36})\/(request|response)/;
  const match = url.match(regex);

  if (match) {
    const [, uuid, action] = match;
    return { uuid, action: action as 'request' | 'response' };
  }
  return null;
}

/**
 * Listen for page URL changes and invoke the hook
 * @param hook Callback when the URL changes
 */
async function listenUrlChange(hook?: (flow: CallAction) => void) {
  // Record the current URL
  let currentUrl = location.href;

  // General function: triggered when the URL changes
  function onUrlChange() {
    if (location.href !== currentUrl) {
      const flow = extractFlowInfo(location.href);
      if (flow) {
        hook?.(flow);
      }
      currentUrl = location.href;
    }
  }

  // Hijack pushState and replaceState
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    onUrlChange();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    onUrlChange();
  };

  // Listen for popstate event (browser forward/back)
  window.addEventListener('popstate', onUrlChange);
}

/**
 * Get Flow data from LRU cache or API
 * @param uuid Unique identifier for the Flow
 */
async function getFlow(uuid: string): Promise<Flow | null> {
  const cacheKey = `mitmproxy-flow-${uuid}`;
  let cachedFlow = flowKV.get(cacheKey);
  if (cachedFlow) {
    return cachedFlow;
  }

  // If not in cache, fetch from API
  const response = await originalFetch(`http://${location.host}/flows`);

  if (!response.ok) {
    throw new Error(`Failed to fetch flow with uuid ${uuid}`);
  }

  const flowArray: Flow[] = await response.json();
  let targetFlow: Flow | null = null;
  for (const flow of flowArray) {
    // Cache all LLM flows
    if (apiRegistry.detectProvider(flow)) {
      flowKV.put(flow.id, omit<any, string>(flow, ['client_conn', 'server_conn']) as Flow);
    }
    if (flow.id === uuid) {
      targetFlow = flow;
    }
  }
  if (targetFlow) {
    flowKV.put(cacheKey, targetFlow); // Cache the result
  }
  return targetFlow;
}