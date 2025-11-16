import React, { useState } from 'react';
import { renderChoiceTextContent, renderToolChoiceArgument } from '../utils/textRender';


// Helper functions that are common between both responses
export const getFinishReasonClass = (finishReason: string) => {
  const classMap: { [key: string]: string } = {
    'stop': 'finish-stop',
    'length': 'finish-length',
    'tool_calls': 'finish-tool-calls',
    'content_filter': 'finish-content-filter'
  };
  return classMap[finishReason] || '';
};

// Helper component for basic info section - supports flexible data structure
interface BaseInfoItemProps {
  label: string;
  value: any;
  formatter?: (val: any) => string;
}

export const InfoItem: React.FC<BaseInfoItemProps> = ({ label, value, formatter }) => {
  if (value === undefined || value === null) return null;

  const displayValue = formatter ? formatter(value) : value;
  return (
    <div className="info-item">
      <div className="info-label">{label}</div>
      <div className="info-value">
        {typeof displayValue === 'boolean' ? (displayValue ? 'true' : 'false') : displayValue}
      </div>
    </div>
  );
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

interface BaseInfoSectionProps {
  obj: any;
  eventCount?: number;
}

export const BasicInfoSection: React.FC<{ data: BaseInfoSectionProps }> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(true);

  const { obj, eventCount } = data;
  const createdDate = obj.created ? new Date(obj.created * 1000).toLocaleString('en-US') : undefined;

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Basic Info</span>
      </summary>
      <div className="section-content">
        <InfoItem label="Response ID" value={obj.id} />
        <InfoItem label="Model" value={obj.model} />
        <InfoItem label="Object Type" value={obj.object} />
        <InfoItem label="Created" value={createdDate} />
        <InfoItem label="System Fingerprint" value={obj.system_fingerprint} />
        {eventCount !== undefined && <InfoItem label="Events Count" value={eventCount || 0} />}
      </div>
    </details>
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

// Component for rendering tool calls - needs to handle both regular response and aggregated SSE structure
export const ToolCall: React.FC<{ toolCall: any; index: number }> = ({ toolCall, index }) => {
  const [expanded, setExpanded] = useState(true);

  let parsedArguments = {};
  if (toolCall.function?.arguments) {
    try {
      // Handle both string and object arguments
      if (typeof toolCall.function?.arguments === 'string') {
        parsedArguments = JSON.parse(toolCall.function.arguments);
      } else {
        parsedArguments = toolCall.function.arguments;
      }
    } catch {
      parsedArguments = {};
    }
  } else if (typeof toolCall.function === 'object' && toolCall.function !== null) {
    parsedArguments = toolCall.function.arguments || {};
  }

  return (
    <details open={expanded} className="tool-call-item">
      <summary className="tool-call-header">
        <div>
          <div className="tool-call-name">{toolCall.function?.name || 'Unknown Function'}</div>
          <div className="tool-call-id">ID: {toolCall.id || 'N/A'}</div>
        </div>
      </summary>
      <div className="tool-call-content">
        <pre className="json-content" dangerouslySetInnerHTML={{ __html: renderToolChoiceArgument(parsedArguments) }} />
      </div>
    </details>
  );
};

// Component for rendering choice content - handles both string and structured content
interface BaseChoiceContentProps {
  content: any;
  setTitle: string;
  setContentExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  contentExpanded: boolean;
}

export const ChoiceContentSection: React.FC<BaseChoiceContentProps> = ({
  content,
  setTitle,
  setContentExpanded,
  contentExpanded
}) => {
  if (!content) return null;

  return (
    <details open={contentExpanded} className="content-section"
      onChange={(e) => setContentExpanded((e.target as HTMLDetailsElement).open)}>
      <summary className="content-header">
        <h4>{setTitle}</h4>
      </summary>
      <div className="prose">
        {typeof content === "string"
          ? <div dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(content) }} />
          : <pre className="json-content">{JSON.stringify(content, null, 2)}</pre>
        }
      </div>
    </details>
  );
};

// Component for rendering reasoning content - handles both string and structured content
interface BaseReasoningContentProps {
  reasoning_content: any;
  setReasoningExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  reasoningExpanded: boolean;
}

export const ChoiceReasoningContentSection: React.FC<BaseReasoningContentProps> = ({
  reasoning_content,
  setReasoningExpanded,
  reasoningExpanded
}) => {
  if (!reasoning_content) return null;

  return (
    <details open={reasoningExpanded} className="reasoning-content-section"
      onChange={(e) => setReasoningExpanded((e.target as HTMLDetailsElement).open)}>
      <summary className="reasoning-header">
        <h4>Reasoning Content</h4>
      </summary>
      <div className="prose">
        <div dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(reasoning_content) }} />
      </div>
    </details>
  );
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

// Tool calls container
interface BaseToolCallsContainerProps {
  toolCalls: any[];
}

export const ToolCallsContainer: React.FC<BaseToolCallsContainerProps> = ({ toolCalls }) => {
  if (!toolCalls || !toolCalls.length) return null;

  return (
    <div className="tool-calls-container">
      <h4 className="margin-bottom-sm text-small">Tool Calls:</h4>
      {toolCalls.map((toolCall, index) => (
        <ToolCall key={index} toolCall={toolCall} index={index} />
      ))}
    </div>
  );
};

// Base choice component that works with flexible data structure
interface BaseChoiceComponentProps {
  choice: any;
  index: number;
}

export const ChoiceItem: React.FC<BaseChoiceComponentProps> = ({ choice, index }) => {
  const [expanded, setExpanded] = useState(true);
  const [reasoningExpanded, setReasoningExpanded] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(true);

  // Support for both data structures: direct properties (regular API) and nested in message (streaming)
  const content = choice.message?.content || choice.content;
  const reasoning_content = choice.message?.reasoning_content || choice.reasoning_content;
  const tool_calls = choice.message?.tool_calls || choice.tool_calls;
  const finish_reason = choice.finish_reason;
  const logprobs = choice.logprobs;

  const finishReasonClass = getFinishReasonClass(finish_reason);

  return (
    <details open={expanded} className="choice-item">
      <summary className="choice-header">
        <div className="flex-container">
          <span className="choice-badge">Choice {index + 1}</span>
          <span className={`finish-reason-badge ${finishReasonClass}`}>
            {finish_reason || 'unknown'}
          </span>
        </div>
      </summary>
      <div className="choice-content">
        {logprobs && (
          <div className="choice-meta">
            <div className="choice-meta-item">
              <span>Log Probs:</span>
              <span>Available</span>
            </div>
          </div>
        )}
        <ChoiceReasoningContentSection
          reasoning_content={reasoning_content}
          setReasoningExpanded={setReasoningExpanded}
          reasoningExpanded={reasoningExpanded}
        />
        <ChoiceContentSection
          content={content}
          setTitle="Content"
          setContentExpanded={setContentExpanded}
          contentExpanded={contentExpanded}
        />
        <ToolCallsContainer toolCalls={tool_calls} />
        <LogProbsSection logprobs={logprobs} />
      </div>
    </details>
  );
};

// Generic choices renderer that supports both data structures
interface BaseChoicesSectionProps {
  choices?: any[];
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

  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">
          Choices
          <span>({choices.length})</span>
        </span>
      </summary>
      <div className="section-content">
        {choices.map((choice, index) => (
          <ChoiceItem key={index} choice={choice} index={index} />
        ))}
      </div>
    </details>
  );
};

// Base response visualizer component that can handle both regular and streaming data
interface BaseResponseVisualizerProps {
  response: any;
  eventCount?: number;
  title?: string;
  subtitle?: string;
}

export const BaseOpenAIResponseVisualizer: React.FC<BaseResponseVisualizerProps> = ({
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
      <BasicInfoSection data={{ obj: response, eventCount }} />
      {response.usage && <TokenUsageSection usage={response.usage} />}
      <ChoicesSection choices={response.choices} eventCount={eventCount} />
    </div>
  );
};