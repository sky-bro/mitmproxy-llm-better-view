import React from 'react';
import BasicInfo from '../common/BasicInfo';
import InfoItem from '../common/InfoItem';
import Section from '../common/Section';
import JsonContent from '../common/JsonContent';
import ProseContent from '../common/ProseContent';
import Message from '../common/Message';
import { Tool as ToolItem } from '../common/Tool';
import {
  OpenAIResponsesInput,
  OpenAIResponsesInputContent,
  OpenAIResponsesInputItem,
  OpenAIResponsesRequest,
} from '../../types/api/openai_responses';

type AnyRecord = Record<string, any>;

function asRecord(value: unknown): AnyRecord {
  if (!value || typeof value !== 'object') return {};
  return value as AnyRecord;
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function isPrimitive(value: unknown): value is string | number | boolean {
  const t = typeof value;
  return t === 'string' || t === 'number' || t === 'boolean';
}

function hasStructuredContent(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value as AnyRecord).length > 0;
  return false;
}

function parseMaybeJson(str: unknown): any {
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

function getItemBadgeClass(type: string): string {
  if (type === 'reasoning') return 'role-reasoning';
  if (type === 'function_call' || type === 'custom_tool_call' || type === 'function_shell_call') return 'role-function';
  if (type.endsWith('_output')) return 'role-call-output';
  if (type === 'file_search_call' || type === 'web_search_call' || type === 'tool_search_call') return 'role-search-call';
  if (type.startsWith('mcp_')) return 'role-mcp';
  if (
    type === 'computer_call' ||
    type === 'code_interpreter_call' ||
    type === 'local_shell_call' ||
    type === 'apply_patch_call' ||
    type === 'image_generation_call' ||
    type === 'compaction'
  ) return 'role-system-call';
  return 'role-response-item';
}

function renderItemHeader(label: string, index: number, status?: string) {
  return (
    <div className="flex-container responses-item-header">
      <span className={`role-badge ${getItemBadgeClass(label)}`}>{label}</span>
      {status && <span className="responses-status-badge">{status}</span>}
      <span className="text-small">#{index + 1}</span>
    </div>
  );
}

function renderInputContent(content: OpenAIResponsesInputContent, index: number, isOpenByDefault: boolean) {
  const obj = asRecord(content);
  const type = obj.type as string | undefined;

  if (type === 'input_text') {
    return (
      <Section key={index} title={`input_text #${index + 1}`} defaultOpen={isOpenByDefault}>
        <ProseContent contentStr={obj.text} />
      </Section>
    );
  }

  if (type === 'input_image') {
    return (
      <Section key={index} title={`input_image #${index + 1}`} defaultOpen={isOpenByDefault}>
        <JsonContent
          jsonObj={{
            image_url: obj.image_url,
            file_id: obj.file_id,
            detail: obj.detail,
          }}
        />
      </Section>
    );
  }

  if (type === 'input_file') {
    return (
      <Section key={index} title={`input_file #${index + 1}`} defaultOpen={isOpenByDefault}>
        <JsonContent
          jsonObj={{
            file_id: obj.file_id,
            filename: obj.filename,
            file_url: obj.file_url,
            detail: obj.detail,
            file_data: obj.file_data,
          }}
        />
      </Section>
    );
  }

  return (
    <Section key={index} title={`${type || 'input_part'} #${index + 1}`} defaultOpen={isOpenByDefault}>
      <JsonContent jsonObj={content} />
    </Section>
  );
}

function renderMessageLikeItem(item: OpenAIResponsesInputItem, index: number, isOpenByDefault: boolean) {
  const obj = asRecord(item);
  const role = obj.role || 'unknown';
  const content = obj.content;

  if (typeof content === 'string') {
    return (
      <Message key={index} role={role} index={index} open={isOpenByDefault}>
        <ProseContent contentStr={content} />
      </Message>
    );
  }

  if (Array.isArray(content)) {
    return (
      <Message key={index} role={role} index={index} open={isOpenByDefault}>
        {content.map((part, partIndex) =>
          renderInputContent(
            part as OpenAIResponsesInputContent,
            partIndex,
            partIndex === content.length - 1
          )
        )}
      </Message>
    );
  }

  return (
    <Message key={index} role={role} index={index} open={isOpenByDefault}>
      <JsonContent jsonObj={item} />
    </Message>
  );
}

function renderToolOutput(output: unknown) {
  if (typeof output === 'string') {
    return (
      <Section title="Output" defaultOpen={true}>
        <ProseContent contentStr={output} />
      </Section>
    );
  }

  if (Array.isArray(output)) {
    return (
      <Section title="Output" defaultOpen={true}>
        {output.map((part, partIndex) =>
          renderInputContent(
            part as OpenAIResponsesInputContent,
            partIndex,
            partIndex === output.length - 1
          )
        )}
      </Section>
    );
  }

  if (output === undefined) {
    return (
      <Section title="Output" defaultOpen={true}>
        <div className="empty-state">No output</div>
      </Section>
    );
  }

  return (
    <Section title="Output" defaultOpen={true}>
      <JsonContent jsonObj={output} />
    </Section>
  );
}

function renderFunctionCallLikeItem(item: OpenAIResponsesInputItem, index: number, isOpenByDefault: boolean) {
  const obj = asRecord(item);
  return (
    <Section
      key={index}
      title={renderItemHeader('function_call', index, obj.status)}
      defaultOpen={isOpenByDefault}
    >
      <BasicInfo title="Function Call">
        <InfoItem label="Name" value={obj.name} />
        <InfoItem label="Namespace" value={obj.namespace} />
        <InfoItem label="Call ID" value={obj.call_id} />
        <InfoItem label="Status" value={obj.status} />
      </BasicInfo>
      <Section title="Arguments" defaultOpen={true}>
        <JsonContent jsonObj={parseMaybeJson(obj.arguments)} />
      </Section>
    </Section>
  );
}

function renderReasoningLikeItem(item: OpenAIResponsesInputItem, index: number, isOpenByDefault: boolean) {
  const obj = asRecord(item);
  const summary = Array.isArray(obj.summary) ? obj.summary : [];
  const content = Array.isArray(obj.content) ? obj.content : [];

  return (
    <Section
      key={index}
      title={renderItemHeader('reasoning', index)}
      defaultOpen={isOpenByDefault}
    >
      <BasicInfo title="Reasoning">
        <InfoItem label="ID" value={obj.id} />
        <InfoItem label="Encrypted Content" value={obj.encrypted_content} />
      </BasicInfo>
      <Section title={`Summary (${summary.length})`} defaultOpen={true}>
        {summary.length
          ? summary.map((part, i) => (
              <Section key={i} title={`summary #${i + 1}`} defaultOpen={i === summary.length - 1}>
                <JsonContent jsonObj={part} />
              </Section>
            ))
          : <div className="empty-state">No summary</div>}
      </Section>
      <Section title={`Content (${content.length})`} defaultOpen={false}>
        {content.length ? <JsonContent jsonObj={content} /> : <div className="empty-state">No content</div>}
      </Section>
    </Section>
  );
}

function renderGenericCallItem(
  item: OpenAIResponsesInputItem,
  index: number,
  type: string,
  isOpenByDefault: boolean
) {
  const obj = asRecord(item);
  return (
    <Section
      key={index}
      title={renderItemHeader(type, index, obj.status)}
      defaultOpen={isOpenByDefault}
    >
      <BasicInfo title="Call Info">
        <InfoItem label="ID" value={obj.id} />
        <InfoItem label="Call ID" value={obj.call_id} />
        <InfoItem label="Name" value={obj.name} />
        <InfoItem label="Status" value={obj.status} />
      </BasicInfo>
      <JsonContent jsonObj={item} />
    </Section>
  );
}

function renderInputItem(item: OpenAIResponsesInputItem, index: number, isOpenByDefault: boolean) {
  const obj = asRecord(item);
  const type = obj.type as string | undefined;

  if (obj.role || type === 'message') {
    return renderMessageLikeItem(item, index, isOpenByDefault);
  }

  if (type === 'function_call') {
    return renderFunctionCallLikeItem(item, index, isOpenByDefault);
  }

  if (type === 'reasoning') {
    return renderReasoningLikeItem(item, index, isOpenByDefault);
  }

  if (type === 'function_call_output' || type === 'custom_tool_call_output') {
    return (
      <Section
        key={index}
        title={renderItemHeader(type, index, obj.status)}
        defaultOpen={isOpenByDefault}
      >
        <BasicInfo title="Tool Output Info">
          <InfoItem label="Type" value={type} />
          <InfoItem label="ID" value={obj.id} />
          <InfoItem label="Call ID" value={obj.call_id} />
          <InfoItem label="Status" value={obj.status} />
        </BasicInfo>
        {renderToolOutput(obj.output)}
      </Section>
    );
  }

  if (
    type === 'file_search_call' ||
    type === 'web_search_call' ||
    type === 'tool_search_call' ||
    type === 'computer_call' ||
    type === 'code_interpreter_call' ||
    type === 'image_generation_call' ||
    type === 'local_shell_call' ||
    type === 'function_shell_call' ||
    type === 'apply_patch_call' ||
    type === 'mcp_call' ||
    type === 'mcp_list_tools' ||
    type === 'mcp_approval_request' ||
    type === 'mcp_approval_response' ||
    type === 'custom_tool_call'
  ) {
    return renderGenericCallItem(item, index, type, isOpenByDefault);
  }

  return (
    <Section
      key={index}
      title={renderItemHeader(type || 'input_item', index, obj.status)}
      defaultOpen={isOpenByDefault}
    >
      <JsonContent jsonObj={item} />
    </Section>
  );
}

function renderInput(input: OpenAIResponsesInput) {
  if (input === undefined || input === null) {
    return <div className="empty-state">No input</div>;
  }

  if (typeof input === 'string') {
    return <ProseContent contentStr={input} />;
  }

  if (!Array.isArray(input)) {
    return <JsonContent jsonObj={input} />;
  }

  if (!input.length) {
    return <div className="empty-state">Input is empty</div>;
  }

  return input.map((item, index) =>
    renderInputItem(item as OpenAIResponsesInputItem, index, index === input.length - 1)
  );
}

function getInputStats(input: OpenAIResponsesInput): { messageCount: number; itemCount: number } {
  if (!Array.isArray(input)) {
    return { messageCount: 0, itemCount: 0 };
  }

  let messageCount = 0;
  for (const item of input) {
    const obj = asRecord(item);
    if (obj.role || obj.type === 'message') {
      messageCount += 1;
    }
  }

  return { messageCount, itemCount: input.length };
}

function renderToolDefinition(tool: unknown, index: number) {
  const obj = asRecord(tool);
  const type = String(obj.type || 'unknown');
  const builtInToolDescriptions: Record<string, string> = {
    file_search: 'Built-in file search tool',
    web_search: 'Built-in web search tool',
    web_search_preview: 'Built-in web search preview tool',
    tool_search: 'Built-in tool search tool',
    computer: 'Built-in computer tool',
    computer_use_preview: 'Built-in computer-use preview tool',
    code_interpreter: 'Built-in code interpreter tool',
    image_generation: 'Built-in image generation tool',
    local_shell: 'Built-in local shell tool',
    shell: 'Built-in shell tool',
    apply_patch: 'Built-in apply patch tool',
    mcp: 'MCP tool',
    namespace: 'Tool namespace',
  };

  if (type === 'function') {
    const fn = asRecord(obj.function);
    const name = obj.name || fn.name || `function_${index + 1}`;
    const description = obj.description ?? fn.description;
    const strict = obj.strict ?? fn.strict;
    const parameters = obj.parameters ?? fn.parameters;
    const inputSchema =
      parameters && typeof parameters === 'object'
        ? ({ ...(parameters as AnyRecord), strict } as AnyRecord)
        : { note: 'No parameter schema provided', strict };

    return (
      <ToolItem
        key={index}
        index={index}
        tool={{
          name,
          description,
          input_schema: inputSchema,
        }}
      />
    );
  }

  if (type === 'custom') {
    const name = obj.name || `custom_${index + 1}`;
    const description = obj.description || 'Custom tool';
    const format = asRecord(obj.format);
    const jsonSchema = asRecord(format.json_schema);
    const inputSchema = Object.keys(jsonSchema).length
      ? jsonSchema
      : (Object.keys(format).length ? format : { note: 'No custom format schema provided' });

    return (
      <ToolItem
        key={index}
        index={index}
        tool={{
          name,
          description,
          input_schema: inputSchema,
        }}
      />
    );
  }

  // Responses built-in tools use flat config (no function wrapper).
  // Reuse ToolItem so title and parameter list style stays consistent with Chat Completions.
  const configEntries = Object.entries(obj).filter(([k, v]) => k !== 'type' && v !== undefined);
  const inputSchema =
    configEntries.length > 0
      ? Object.fromEntries(configEntries)
      : { note: 'No configurable parameters' };

  return (
    <ToolItem
      key={index}
      index={index}
      tool={{
        name: obj.name || type,
        description: builtInToolDescriptions[type] || `${type} tool`,
        input_schema: inputSchema,
      }}
    />
  );
}

const OpenAIResponsesRequestVisualizer: React.FC<{ request: OpenAIResponsesRequest }> = ({ request }) => {
  const req = request as AnyRecord;
  const tools = Array.isArray(req.tools) ? req.tools : [];
  const inputValue = req.input as OpenAIResponsesInput;
  const inputStats = getInputStats(inputValue);
  const inputTitle =
    inputStats.messageCount > 0
      ? `Input (${inputStats.messageCount} messages)`
      : inputStats.itemCount > 0
        ? `Input (${inputStats.itemCount} items)`
        : 'Input';
  const hasTextConfig = hasValue(req.text);
  const hasResponseFormat = hasValue(req.response_format);
  const hasMetadata = hasStructuredContent(req.metadata);
  const toolChoicePrimitive = isPrimitive(req.tool_choice) ? req.tool_choice : undefined;
  const textConfigPrimitive = isPrimitive(req.text) ? req.text : undefined;
  const responseFormatPrimitive = isPrimitive(req.response_format) ? req.response_format : undefined;
  const metadataPrimitive = isPrimitive(req.metadata) ? req.metadata : undefined;

  return (
    <div className="container responses-view">
      <div className="header">
        <h1>OpenAI Responses API Request</h1>
      </div>

      <BasicInfo>
        <InfoItem label="Model" value={req.model} />
        <InfoItem label="Stream" value={req.stream} />
        <InfoItem label="Store" value={req.store} />
        <InfoItem label="Background" value={req.background} />
        <InfoItem label="Temperature" value={req.temperature} />
        <InfoItem label="Top P" value={req.top_p} />
        <InfoItem label="Max Output Tokens" value={req.max_output_tokens} />
        <InfoItem label="Previous Response ID" value={req.previous_response_id} />
        <InfoItem label="Parallel Tool Calls" value={req.parallel_tool_calls} />
        <InfoItem label="Tool Choice" value={toolChoicePrimitive} />
        <InfoItem label="Text Config" value={textConfigPrimitive} />
        <InfoItem label="Response Format" value={responseFormatPrimitive} />
        <InfoItem label="Metadata" value={metadataPrimitive} />
      </BasicInfo>

      <Section title="Instructions" defaultOpen={false}>
        {req.instructions
          ? <pre className="text-content" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{req.instructions}</pre>
          : <div className="empty-state">No instructions</div>}
      </Section>

      <Section title={inputTitle} defaultOpen={true}>
        {renderInput(inputValue)}
      </Section>

      <Section title={`Tools (${tools.length})`} defaultOpen={false}>
        {tools.length ? tools.map((tool, index) => renderToolDefinition(tool, index)) : <div className="empty-state">No tools</div>}
      </Section>

      {toolChoicePrimitive === undefined && hasValue(req.tool_choice) && (
        <Section title="Tool Choice" defaultOpen={false}>
          <JsonContent jsonObj={req.tool_choice} />
        </Section>
      )}

      {textConfigPrimitive === undefined && hasTextConfig && (
        <Section title="Response Text Config" defaultOpen={false}>
          <JsonContent jsonObj={req.text} />
        </Section>
      )}

      {responseFormatPrimitive === undefined && hasResponseFormat && (
        <Section title="Response Format" defaultOpen={false}>
          <JsonContent jsonObj={req.response_format} />
        </Section>
      )}

      {metadataPrimitive === undefined && hasMetadata && (
        <Section title="Metadata" defaultOpen={false}>
          <JsonContent jsonObj={req.metadata} />
        </Section>
      )}
    </div>
  );
};

export default OpenAIResponsesRequestVisualizer;
