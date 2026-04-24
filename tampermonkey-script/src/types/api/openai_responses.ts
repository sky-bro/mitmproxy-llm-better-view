import type {
  Response,
  ResponseCreateParams,
  ResponseInput,
  ResponseInputContent,
  ResponseInputItem,
  ResponseOutputItem,
  ResponseStreamEvent,
  ResponseUsage,
} from 'openai/resources/responses/responses';

export type OpenAIResponsesRequest = ResponseCreateParams;

// In MITM logs we may receive partial/incremental payloads, so keep a permissive wrapper.
export type OpenAIResponsesResponse =
  | Response
  | (Partial<Response> & {
      object?: string;
      output?: ResponseOutputItem[];
      usage?: Partial<ResponseUsage>;
      [key: string]: any;
    });

export type OpenAIResponsesInput = string | ResponseInput | undefined;
export type OpenAIResponsesInputItem = ResponseInputItem;
export type OpenAIResponsesInputContent = ResponseInputContent;
export type OpenAIResponsesOutputItem = ResponseOutputItem;

export function isResponsesRequest(obj: any): obj is OpenAIResponsesRequest {
  if (!obj || typeof obj !== 'object') return false;
  return !!obj.model && (obj.input !== undefined || obj.instructions !== undefined);
}

export function isResponsesResponse(obj: any): obj is OpenAIResponsesResponse {
  if (!obj || typeof obj !== 'object') return false;
  if (obj.object === 'response') return true;
  return Array.isArray(obj.output) && !!obj.model;
}

export function parseResponsesSSEEvents(raw: string): Array<ResponseStreamEvent | Record<string, any>> {
  const events: Array<ResponseStreamEvent | Record<string, any>> = [];

  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('data:')) {
      const dataContent = trimmed.slice(5).trim();
      if (!dataContent || dataContent === '[DONE]') return;
      try {
        events.push(JSON.parse(dataContent));
      } catch {
        // ignore malformed event line
      }
      return;
    }

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        events.push(JSON.parse(trimmed));
      } catch {
        // ignore malformed event line
      }
    }
  });

  return events;
}

function normalizeFromResponseEnvelope(event: any): OpenAIResponsesResponse | null {
  if (!event || typeof event !== 'object') return null;

  if (event.response && isResponsesResponse(event.response)) {
    return event.response as OpenAIResponsesResponse;
  }

  if (isResponsesResponse(event)) {
    return event as OpenAIResponsesResponse;
  }

  return null;
}

export function processResponsesSSEEvents(
  events: Array<ResponseStreamEvent | Record<string, any>>
): OpenAIResponsesResponse | null {
  if (!events.length) return null;

  // Best case: terminal event contains a full response object.
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const maybe = normalizeFromResponseEnvelope(events[i]);
    if (maybe) return maybe;
  }

  // Fallback: reconstruct a minimal response from incremental events.
  const outputByKey = new Map<string, any>();
  const outputOrder: string[] = [];
  let base: OpenAIResponsesResponse = {
    object: 'response',
    output: [],
  };

  const ensureItem = (key: string, initial: any) => {
    if (!outputByKey.has(key)) {
      outputByKey.set(key, initial);
      outputOrder.push(key);
    }
    return outputByKey.get(key);
  };

  for (const event of events) {
    if (!event || typeof event !== 'object') continue;

    const t = String((event as any).type || '');

    const maybeResp = (event as any).response;
    if (maybeResp && typeof maybeResp === 'object') {
      base = {
        ...base,
        id: maybeResp.id ?? base.id,
        model: maybeResp.model ?? base.model,
        status: maybeResp.status ?? base.status,
        created_at: maybeResp.created_at ?? base.created_at,
        usage: maybeResp.usage ?? base.usage,
      };
    }

    if (t.endsWith('output_item.added')) {
      const item = (event as any).item;
      if (!item) continue;
      const key = item.id || `index:${(event as any).output_index ?? outputOrder.length}`;
      ensureItem(key, { ...item });
      continue;
    }

    if (t.endsWith('content_part.added')) {
      const itemId = (event as any).item_id || `index:${(event as any).output_index ?? 0}`;
      const item = ensureItem(itemId, {
        id: (event as any).item_id,
        type: 'message',
        role: 'assistant',
        content: [],
      });
      if (!Array.isArray(item.content)) item.content = [];
      item.content.push((event as any).part || (event as any).content_part || {});
      continue;
    }

    if (t.endsWith('output_text.delta')) {
      const itemId = (event as any).item_id || `index:${(event as any).output_index ?? 0}`;
      const item = ensureItem(itemId, {
        id: (event as any).item_id,
        type: 'message',
        role: 'assistant',
        content: [{ type: 'output_text', text: '' }],
      });
      if (!Array.isArray(item.content) || !item.content.length) {
        item.content = [{ type: 'output_text', text: '' }];
      }
      let target = item.content[item.content.length - 1];
      if (!target || target.type !== 'output_text') {
        target = { type: 'output_text', text: '' };
        item.content.push(target);
      }
      target.text = `${target.text || ''}${(event as any).delta || ''}`;
      continue;
    }

    if (t.endsWith('function_call_arguments.delta')) {
      const itemId =
        (event as any).item_id || (event as any).call_id || `index:${(event as any).output_index ?? 0}`;
      const item = ensureItem(itemId, {
        id: (event as any).item_id,
        type: 'function_call',
        call_id: (event as any).call_id,
        name: (event as any).name,
        arguments: '',
      });
      item.type = 'function_call';
      item.call_id = item.call_id || (event as any).call_id;
      item.name = item.name || (event as any).name;
      item.arguments = `${item.arguments || ''}${(event as any).delta || ''}`;
      continue;
    }

    if (t.endsWith('output_item.done')) {
      const doneItem = (event as any).item;
      if (!doneItem) continue;
      const key = doneItem.id || `index:${(event as any).output_index ?? outputOrder.length}`;
      outputByKey.set(key, { ...(outputByKey.get(key) || {}), ...doneItem });
      if (!outputOrder.includes(key)) outputOrder.push(key);
      continue;
    }

    if (t.endsWith('completed')) {
      const maybe = normalizeFromResponseEnvelope(event);
      if (maybe) return maybe;
      base.status = 'completed';
    }
  }

  const output = outputOrder.map((k) => outputByKey.get(k)).filter(Boolean);
  if (!output.length && !base.id && !base.model) {
    return null;
  }

  return {
    ...base,
    output,
  };
}
