import React, { useState } from 'react';
import BasicInfo from '../common/BasicInfo';
import InfoItem from '../common/InfoItem';
import Section from '../common/Section';
import { ChatCompletion, ChatCompletionMessageToolCall } from 'openai/resources';
import JsonContent from '../common/JsonContent';
import ProseContent from '../common/ProseContent';
import ToolCall from '../common/ToolCall';

// Helper functions that are common between both responses
export const getFinishReasonClass = (finishReason: string) => {
  const classMap: { [key: string]: string } = {
    'stop': 'finish-stop',
    'length': 'finish-length',
    'tool_calls': 'finish-tool-calls',
    'content_filter': 'finish-content-filter',
    'function_call': 'finish-tool-calls'
  };
  return classMap[finishReason] || '';
};


export const UsageItem: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (value === undefined || value === null) return null;
  return (
    <div className="usage-item">
      <div className="usage-label">{label}</div>
      <div className="usage-value">{value}</div>
    </div>
  );
};


export const TokenUsageSection: React.FC<{ usage: any }> = ({ usage }) => {
  if (!usage) return null;

  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Token Usage</span>
      </summary>
      <div className="section-content">
        <div className="usage-grid">
          <UsageItem label="Prompt Tokens" value={usage.prompt_tokens} />
          <UsageItem label="Completion Tokens" value={usage.completion_tokens} />
          <UsageItem label="Total Tokens" value={usage.total_tokens} />
          <UsageItem label="Cached Tokens" value={usage.prompt_tokens_details?.cached_tokens} />
        </div>
      </div>
    </details>
  );
};


// Component for rendering choice content - handles both string and structured content
interface BaseChoiceContentProps {
  content?: string | null;
  setTitle: string;
}

export const ChoiceContentSection: React.FC<BaseChoiceContentProps> = ({
  content,
  setTitle
}) => {
  if (!content) return null;
  return (
    <Section title={setTitle} defaultOpen={true}>
      <ProseContent contentStr={content} />
    </Section>
  )
};

export const ChoiceReasoningContentSection: React.FC<{reasoning_content?: string | null}> = ({
  reasoning_content,
}) => {
  if (!reasoning_content) return null;
  return <Section title={'Reasoning Content'}>
    <ProseContent contentStr={reasoning_content} />
  </Section>
};

// Component for displaying log probabilities
export const LogProbsSection: React.FC<{ logprobs: any }> = ({ logprobs }) => {
  if (!logprobs) return null;

  return (
    <div className="margin-top-md">
      <h4 className="margin-bottom-sm text-small">Log Probabilities:</h4>
      <pre className="json-content">{JSON.stringify(logprobs, null, 2)}</pre>
    </div>
  );
};

export const ToolCalls: React.FC<{toolCalls?: Array<ChatCompletionMessageToolCall>}> = ({ toolCalls }) => {
  if (!toolCalls || !toolCalls.length) return null;

  return (
    <Section title={ `Tool Calls (${toolCalls.length})` } defaultOpen={true}>
      {toolCalls.map((toolCall, index) => {
        const toolCallId = toolCall.id || 'N/A';
        const toolType = toolCall.type || 'function';
        const toolName = toolCall.type === 'custom'
          ? (toolCall as any).custom.name
          : toolCall.function.name;
        const argumentsStr = toolCall.type === 'custom'
          ? (toolCall as any).custom.input
          : toolCall.function.arguments;

        return (
          <ToolCall
            key={index}
            callId={toolCallId}
            toolName={toolName}
            toolType={toolType}
            argumentsStr={argumentsStr}
            index={index}
          />
        );
      })}
    </Section>
  );
};

// Base choice component that works with flexible data structure
interface BaseChoiceComponentProps {
  choice: ChatCompletion.Choice;
  index: number;
}

export const ChoiceItem: React.FC<BaseChoiceComponentProps> = ({ choice, index }) => {
  const content = choice.message?.content;
  const reasoning_content: string = (choice.message as any)?.reasoning_content;
  const tool_calls = choice.message?.tool_calls;
  const finish_reason = choice.finish_reason;
  const logprobs = choice.logprobs;

  const finishReasonClass = getFinishReasonClass(finish_reason);
  return (
    <Section title={
      <div className="flex-container">
        <span className="choice-badge">Choice {index + 1}</span>
        <span className={`finish-reason-badge ${finishReasonClass}`}>
          {finish_reason || 'unknown'}
        </span>
      </div>
    } defaultOpen={true}>
      <Section title={'LogProbs'} defaultOpen={false}>
        {logprobs && <JsonContent jsonObj={logprobs}/>}
      </Section>
      <ChoiceReasoningContentSection reasoning_content={reasoning_content} />
      <ChoiceContentSection content={content} setTitle="Content" />
      <ToolCalls toolCalls={tool_calls} />
      <LogProbsSection logprobs={logprobs} />
    </Section>
  )
};

// Generic choices renderer that supports both data structures
interface BaseChoicesSectionProps {
  choices?: Array<ChatCompletion.Choice>;
  eventCount?: number;
}

export const ChoicesSection: React.FC<BaseChoicesSectionProps> = ({ choices = [], eventCount }) => {
  if (!choices.length) {
    return (
      <details open className="section">
        <summary className="section-header">
          <span className="section-title">
            Choices
            {eventCount !== undefined && <span> - {eventCount} Events</span>}
            <span>(0)</span>
          </span>
        </summary>
        <div className="section-content">
          <div className="empty-state">No choices available</div>
        </div>
      </details>
    );
  }

  return (
    <>
      {choices.map((choice, index) => (
        <ChoiceItem key={index} choice={choice} index={index} />
      ))}
    </>
  );
};

// Base response visualizer component that can handle both regular and streaming data
interface BaseResponseVisualizerProps {
  response: ChatCompletion;
  eventCount?: number;
  title?: string;
  subtitle?: string;
}

const BaseOpenAIResponseVisualizer: React.FC<BaseResponseVisualizerProps> = ({
  response,
  eventCount,
  title = "OpenAI API Response",
  subtitle = ""
}) => {
  return (
    <div className="container">
      <div className="header">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {eventCount !== undefined && (
          <div className="event-badge">{eventCount} events</div>
        )}
      </div>

      <BasicInfo>
        <InfoItem label="Response ID" value={response.id} />
        <InfoItem label="Model" value={response.model} />
        <InfoItem label="Object Type" value={response.object} />
        <InfoItem label="Created" value={response.created ? new Date(response.created * 1000).toLocaleString('en-US') : undefined} />
        <InfoItem label="System Fingerprint" value={response.system_fingerprint} />
        {eventCount !== undefined && <InfoItem label="Events Count" value={eventCount || 0} />}
      </BasicInfo>

      {response.usage && <TokenUsageSection usage={response.usage} />}

      <ChoicesSection choices={response.choices} eventCount={eventCount} />
    </div>
  );
};

// Original OpenAIResponseVisualizerProps
interface OpenAIResponseVisualizerProps {
  response: ChatCompletion;
  eventCount?: number
}

const OpenAIResponseVisualizer: React.FC<OpenAIResponseVisualizerProps> = ({ response, eventCount }) => {
  return (
    <BaseOpenAIResponseVisualizer response={response} eventCount={eventCount} title="OpenAI API Response" />
  );
};

export default OpenAIResponseVisualizer;