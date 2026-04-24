import React from 'react';
import BasicInfo from '../common/BasicInfo';
import InfoItem from '../common/InfoItem';
import JsonContent from '../common/JsonContent';
import ProseContent from '../common/ProseContent';
import Section from '../common/Section';
import ToolCall from '../common/ToolCall';
import Message from '../common/Message';
import UsageItem from '../common/UsageItem';
import { OpenAIResponsesOutputItem, OpenAIResponsesResponse } from '../../types/api/openai_responses';

type AnyRecord = Record<string, any>;

function asRecord(value: unknown): AnyRecord {
  if (!value || typeof value !== 'object') return {};
  return value as AnyRecord;
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

function renderOutputMessageContent(content: unknown[]) {
  if (!content.length) {
    return <div className="empty-state">No content</div>;
  }

  return content.map((part, idx) => {
    const obj = asRecord(part);
    const type = obj.type || 'part';

    if (type === 'output_text') {
      const textValue = typeof obj.text === 'string' ? obj.text : '';
      if (!textValue.trim()) {
        return null;
      }
      return (
        <Section key={idx} title={`output_text #${idx + 1}`} defaultOpen={idx === content.length - 1}>
          <ProseContent contentStr={textValue} />
          {obj.annotations?.length ? (
            <Section title={`Annotations (${obj.annotations.length})`} defaultOpen={false}>
              <JsonContent jsonObj={obj.annotations} />
            </Section>
          ) : null}
          {obj.logprobs?.length ? (
            <Section title={`Logprobs (${obj.logprobs.length})`} defaultOpen={false}>
              <JsonContent jsonObj={obj.logprobs} />
            </Section>
          ) : null}
        </Section>
      );
    }

    if (type === 'refusal') {
      return (
        <Section key={idx} title={`refusal #${idx + 1}`} defaultOpen={true}>
          <ProseContent contentStr={obj.refusal || ''} />
        </Section>
      );
    }

    return (
      <Section key={idx} title={`${type} #${idx + 1}`} defaultOpen={false}>
        <JsonContent jsonObj={part} />
      </Section>
    );
  });
}

function renderFunctionCallItem(item: AnyRecord, index: number) {
  return (
    <Section
      key={index}
      title={renderItemHeader('function_call', index, item.status)}
      defaultOpen={false}
    >
      <ToolCall
        callId={item.call_id || item.id || 'N/A'}
        toolName={item.name || 'unknown'}
        toolType="function"
        argumentsStr={typeof item.arguments === 'string' ? item.arguments : JSON.stringify(item.arguments || {})}
        index={index}
      />
      <BasicInfo title="Function Call Meta">
        <InfoItem label="ID" value={item.id} />
        <InfoItem label="Namespace" value={item.namespace} />
        <InfoItem label="Status" value={item.status} />
      </BasicInfo>
    </Section>
  );
}

function renderReasoningItem(item: AnyRecord, index: number) {
  const summary = Array.isArray(item.summary) ? item.summary : [];
  const content = Array.isArray(item.content) ? item.content : [];

  return (
    <Section
      key={index}
      title={renderItemHeader('reasoning', index)}
      defaultOpen={false}
    >
      <BasicInfo title="Reasoning">
        <InfoItem label="ID" value={item.id} />
        <InfoItem label="Encrypted Content" value={item.encrypted_content} />
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

function renderCallOutputs(item: AnyRecord) {
  if (item.result !== undefined) {
    return (
      <Section title="Result" defaultOpen={true}>
        <JsonContent jsonObj={item.result} />
      </Section>
    );
  }

  if (item.outputs !== undefined) {
    return (
      <Section title="Outputs" defaultOpen={true}>
        <JsonContent jsonObj={item.outputs} />
      </Section>
    );
  }

  if (item.results !== undefined) {
    return (
      <Section title="Results" defaultOpen={true}>
        <JsonContent jsonObj={item.results} />
      </Section>
    );
  }

  if (item.action !== undefined) {
    return (
      <Section title="Action" defaultOpen={true}>
        <JsonContent jsonObj={item.action} />
      </Section>
    );
  }

  return null;
}

function renderGenericOutputItem(item: AnyRecord, index: number, type: string) {
  return (
    <Section
      key={index}
      title={renderItemHeader(type, index, item.status)}
      defaultOpen={false}
    >
      <BasicInfo title="Item Info">
        <InfoItem label="ID" value={item.id} />
        <InfoItem label="Call ID" value={item.call_id} />
        <InfoItem label="Name" value={item.name} />
        <InfoItem label="Status" value={item.status} />
      </BasicInfo>
      {renderCallOutputs(item)}
      {item.arguments !== undefined ? (
        <Section title="Arguments" defaultOpen={false}>
          <JsonContent jsonObj={parseMaybeJson(item.arguments)} />
        </Section>
      ) : null}
      <Section title="Raw Item" defaultOpen={false}>
        <JsonContent jsonObj={item} />
      </Section>
    </Section>
  );
}

function renderOutputItem(item: OpenAIResponsesOutputItem, index: number) {
  const obj = asRecord(item);
  const type = String(obj.type || 'unknown');

  if (type === 'message') {
    const content = Array.isArray(obj.content) ? obj.content : [];
    return (
      <Message key={index} role={obj.role || 'assistant'} index={index} open={true}>
        <BasicInfo title="Message">
          <InfoItem label="ID" value={obj.id} />
          <InfoItem label="Status" value={obj.status} />
          <InfoItem label="Phase" value={obj.phase} />
        </BasicInfo>
        {renderOutputMessageContent(content)}
      </Message>
    );
  }

  if (type === 'function_call') {
    return renderFunctionCallItem(obj, index);
  }

  if (type === 'reasoning') {
    return renderReasoningItem(obj, index);
  }

  if (
    type === 'file_search_call' ||
    type === 'web_search_call' ||
    type === 'tool_search_call' ||
    type === 'tool_search_output' ||
    type === 'computer_call' ||
    type === 'computer_call_output' ||
    type === 'code_interpreter_call' ||
    type === 'image_generation_call' ||
    type === 'local_shell_call' ||
    type === 'local_shell_call_output' ||
    type === 'function_shell_call' ||
    type === 'function_shell_call_output' ||
    type === 'apply_patch_call' ||
    type === 'apply_patch_call_output' ||
    type === 'mcp_call' ||
    type === 'mcp_list_tools' ||
    type === 'mcp_approval_request' ||
    type === 'custom_tool_call' ||
    type === 'compaction'
  ) {
    return renderGenericOutputItem(obj, index, type);
  }

  return (
    <Section
      key={index}
      title={renderItemHeader(type, index, obj.status)}
      defaultOpen={false}
    >
      <JsonContent jsonObj={item} />
    </Section>
  );
}

const OpenAIResponsesResponseVisualizer: React.FC<{ response: OpenAIResponsesResponse }> = ({ response }) => {
  const res = response as AnyRecord;
  const output = Array.isArray(res.output) ? res.output : [];
  const usage = asRecord(res.usage);
  const inputTokensDetails = asRecord(usage.input_tokens_details);
  const outputTokensDetails = asRecord(usage.output_tokens_details);

  return (
    <div className="container responses-view">
      <div className="header">
        <h1>OpenAI Responses API Response</h1>
      </div>

      <BasicInfo>
        <InfoItem label="Response ID" value={res.id} />
        <InfoItem label="Model" value={res.model} />
        <InfoItem label="Object" value={res.object} />
        <InfoItem label="Status" value={res.status} />
        <InfoItem label="Created" value={res.created_at ? new Date(res.created_at * 1000).toLocaleString('en-US') : undefined} />
        <InfoItem label="Parallel Tool Calls" value={res.parallel_tool_calls} />
      </BasicInfo>

      {typeof res.output_text === 'string' && res.output_text.trim() && (
        <Section title="Output Text" defaultOpen={true}>
          <ProseContent contentStr={res.output_text} />
        </Section>
      )}

      <Section title="Usage" defaultOpen={true}>
        {res.usage ? (
          <>
            <div className="usage-grid">
              <UsageItem label="Input Tokens" value={usage.input_tokens} />
              <UsageItem label="Output Tokens" value={usage.output_tokens} />
              <UsageItem label="Total Tokens" value={usage.total_tokens} />
              <UsageItem label="Cached Input Tokens" value={inputTokensDetails.cached_tokens} />
              <UsageItem label="Reasoning Tokens" value={outputTokensDetails.reasoning_tokens} />
            </div>
            <Section title="Raw Usage" defaultOpen={false}>
              <JsonContent jsonObj={res.usage} />
            </Section>
          </>
        ) : <div className="empty-state">No usage</div>}
      </Section>

      <Section title={`Output (${output.length})`} defaultOpen={true}>
        {output.length ? output.map((item, index) => renderOutputItem(item as OpenAIResponsesOutputItem, index)) : <div className="empty-state">No output</div>}
      </Section>

      <Section title="Error" defaultOpen={true}>
        {res.error ? <JsonContent jsonObj={res.error} /> : <div className="empty-state">No error</div>}
      </Section>

      <Section title="Incomplete Details" defaultOpen={false}>
        {res.incomplete_details ? <JsonContent jsonObj={res.incomplete_details} /> : <div className="empty-state">No incomplete details</div>}
      </Section>

      <Section title="Instructions" defaultOpen={false}>
        {res.instructions ? <JsonContent jsonObj={res.instructions} /> : <div className="empty-state">No instructions</div>}
      </Section>

      <Section title="Metadata" defaultOpen={false}>
        {res.metadata ? <JsonContent jsonObj={res.metadata} /> : <div className="empty-state">No metadata</div>}
      </Section>
    </div>
  );
};

export default OpenAIResponsesResponseVisualizer;
