import React from 'react';
import { createRoot } from 'react-dom/client';
import OpenAIRequestVisualizer from './components/OpenAIRequestVisualizer';
import OpenAIResponseVisualizer from './components/OpenAIResponseVisualizer';
import OpenAISSEResponseVisualizer from './components/OpenAISSEResponseVisualizer';
import { CallAction, Flow } from './types/mitmproxy';
import { LRUCache, omit } from './utils/cache';
import { processSSEEvents } from './utils/sse';

// Import Tampermonkey functions
// @ts-ignore
import { unsafeWindow } from '$';

// Import CSS utility functions
import { getStyles } from './utils/cssUtils';

// LRU cache for Flow data to improve performance
const flowKV = new LRUCache<string, Flow>(1024);

// Save the original fetch method for later use
const originalFetch = unsafeWindow.fetch;

// No longer needed as we're not using iframe

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
 * Listen for URL changes and automatically render OpenAI request/response content
 * Entry point for mitmproxy-llm-better-view script.
 * Listens for URL changes in the mitmproxy web interface and renders custom visualizations
 * for OpenAI request/response flows.
 */
listenUrlChange(async ({ uuid, action }) => {
  const flow = await getFlow(uuid);
  if (!flow) {
    return;
  }
  if (isOpenaiFlow(flow)) {
    if (action === 'request') {
      await renderOpenaiRequest(uuid, "json");
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
      await renderOpenaiResponse(uuid, viewerName);
    }
  }
});

/**
 * Render OpenAI request body content
 * @param uuid Unique identifier for the Flow
 */
async function renderOpenaiRequest(uuid: string, viewerName: string = "Auto") {
  const json = await getFlowData(`http://${window.location.host}/flows/${uuid}/request/content/${viewerName}.json`);
  if (!json.text) {
    console.warn("response has no text field.");
  }
  let parsedObj: any;
  try {
    parsedObj = JSON.parse(json.text);
  } catch (e: any) {
    console.error(e);
  }

  if (!isLLMRequest(parsedObj)) {
    return;
  }

  const container = createReactContainer();
  const root = createRoot(container);

  // Create a promise that resolves when React rendering is complete
  await new Promise<void>((resolve) => {
    root.render(
      <React.StrictMode>
        <OpenAIRequestVisualizer obj={parsedObj} />
      </React.StrictMode>
    );

    // Force a React update to ensure rendering is complete
    setTimeout(() => {
      resolve();
    }, 0);
  });

  createDirectElement(container.innerHTML);
}

/**
 * Get Content-Type from response headers
 * @param flow The Flow object
 */
function getContentType(flow: Flow): string | null {
  const headers = flow.response.headers;
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
 * Render OpenAI response body content (supports both JSON and SSE formats)
 * @param uuid Unique identifier for the Flow
 * @param viewerName Optional viewer name to override auto-detection based on content-type
 */
async function renderOpenaiResponse(uuid: string, viewerName: string = "Auto") {
  let json = await getFlowData(`http://${window.location.host}/flows/${uuid}/response/content/${viewerName}.json`);

  // Handle based on viewer type or content
  if (json.view_name === "JSON") {
    try {
      const parsedObj = JSON.parse(json.text);
      // Check if it is an LLM response
      if (!isLLMResponse(parsedObj)) {
        return;
      }

      const container = createReactContainer();
      const root = createRoot(container);

      // Create a promise that resolves when React rendering is complete
      await new Promise<void>((resolve) => {
        root.render(
          <React.StrictMode>
            <OpenAIResponseVisualizer response={parsedObj} />
          </React.StrictMode>
        );

        // Force a React update to ensure rendering is complete
        setTimeout(() => {
          resolve();
        }, 0);
      });

      createDirectElement(container.innerHTML);
    } catch (e) {
      console.error("Error parsing JSON response:", e);
    }
  } else if (json.view_name === "Raw") {
    // Handle SSE content
    const events: any[] = [];
    json.text.split('\n').forEach((line: string) => {
      line = line.trim();
      if (line.startsWith('data:')) {
        const dataContent = line.slice(5);
        if (dataContent === '[DONE]') return;
        try {
          events.push(JSON.parse(dataContent));
        } catch { }
      }
    });

    const input = processSSEEvents(events);

    const container = createReactContainer();
    const root = createRoot(container);

    // Create a promise that resolves when React rendering is complete
    await new Promise<void>((resolve) => {
      root.render(
        <React.StrictMode>
          <OpenAISSEResponseVisualizer
            model={input.model}
            created={input.created}
            system_fingerprint={input.system_fingerprint}
            eventCount={input.eventCount}
            usage={input.usage}
            choices={input.choices}
          />
        </React.StrictMode>
      );

      // Force a React update to ensure rendering is complete
      setTimeout(() => {
        resolve();
      }, 0);
    });

    createDirectElement(container.innerHTML);
  }
}

/**
 * Create a temporary container for React rendering
 */
function createReactContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100%';
  return container;
}

/**
 * Fetch Flow data from the specified URL
 * @param dataUrl The URL to request
 */
async function getFlowData(dataUrl: string) {
  const newResp = await originalFetch(new Request(dataUrl));
  const newJson = await newResp.json();
  return newJson;
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
      // Place your logic here
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
 * Determine if a Flow is an OpenAI chat/completions request
 * @param flow Flow object
 */
function isOpenaiFlow(flow: Flow): boolean {
  return flow.request.path.endsWith('/completions');
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
  // Type assertion here will not change the actual data structure
  const flowArray: Flow[] = await response.json();
  let targetFlow: Flow | null = null;
  for (const flow of flowArray) {
    if (isOpenaiFlow(flow)) {
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

/**
 * Check if the object is an LLM request body
 * @param parsedObj Request body object
 */
function isLLMRequest(parsedObj: any): boolean {
  return (!!parsedObj) && (!!parsedObj['messages'] || !!parsedObj['prompt']) && (!!parsedObj['model']);
}

/**
 * Check if the object is an LLM response body
 * @param parsedObj Response body object
 */
function isLLMResponse(parsedObj: any): boolean {
  return (!!parsedObj) && (!!parsedObj['choices']) && (!!parsedObj['model']);
}

/**
 * Create and insert a direct DOM element to display the rendered result
 * @param html The HTML string to embed directly
 */
async function createDirectElement(html: string) {
  // Get the container element
  let container = document.getElementById('mitmproxy-llm-better-view-container') as HTMLElement | null;
  if (!container) {
    const contentview = document.querySelector('.contentview');
    if (!contentview) {
      console.warn("no `.contentview` element found");
      return;
    }

    const secondChild = contentview.childNodes[1];
    container = document.createElement('details');
    container.toggleAttribute('open');
    container.id = 'mitmproxy-llm-better-view-container';
    container.classList.add('llm-better-view');
    contentview.insertBefore(container, secondChild);
  }

  // Ensure the details element has a summary element
  let summaryElement = Array.from(container.children).find(
    el => el.tagName.toLowerCase() === 'summary'
  ) as HTMLElement | undefined;
  if (!summaryElement) {
    summaryElement = document.createElement('summary');
    summaryElement.textContent = 'LLM Better View'; // You might want to customize this text
    container.prepend(summaryElement); // Add it as the first child
  }

  // Clear existing content and insert new content directly
  const childrenToKeep = Array.from(container.children).filter(
    el => el.tagName.toLowerCase() === 'summary'
  );
  container.innerHTML = '';
  childrenToKeep.forEach(child => container.appendChild(child)); // Add summary back

  // Styles are now loaded in the document head, no need to add them to the container

  // Parse the HTML string and add it to the container
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html.trim();

  // Move all children from tempDiv to container
  while (tempDiv.firstChild) {
    container.appendChild(tempDiv.firstChild);
  }
}