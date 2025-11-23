import React, { useState } from 'react';
import { renderChoiceTextContent } from '../../utils/textRender';
import { Message, ContentBlock as AnthropicContentBlock } from "@anthropic-ai/sdk/resources";
import InfoItem from '../common/InfoItem';
import UsageItem from '../common/UsageItem';

// Import the correct Anthropic response type
export type AnthropicResponse = Message;

// Component to render text content block
const TextContentBlock: React.FC<{ block: Extract<AnthropicContentBlock, {type: 'text'}>, index: number }> = ({ block, index }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <details open={expanded} className="content-block" onChange={(e) => setExpanded((e.target as HTMLDetailsElement).open)}>
      <summary className="content-header">
        <span>Text Content #{index + 1}</span>
      </summary>
      <div className="content-body">
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(block.text || '') }} />
        {block.citations && block.citations.length > 0 && (
          <div className="citations-section">
            <div className="section-title">Citations</div>
            {block.citations.map((citation, citationIndex) => (
              <div key={citationIndex} className="citation-item">
                <pre>{JSON.stringify(citation, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  );
};

// Component to render tool use content block
const ToolUseContentBlock: React.FC<{ block: Extract<AnthropicContentBlock, {type: 'tool_use' | 'server_tool_use'}>, index: number }> = ({ block, index }) => {
  const [expanded, setExpanded] = useState(true);
  const isServerToolUse = block.type === 'server_tool_use';

  return (
    <details
      open={expanded}
      className={`content-block ${isServerToolUse ? 'server-tool-block' : ''}`}
      onChange={(e) => setExpanded((e.target as HTMLDetailsElement).open)}
    >
      <summary className="content-header">
        <span>{isServerToolUse ? 'Server Tool Use' : 'Tool Use'} #{index + 1}</span>
      </summary>
      <div className="content-body">
        <div className="tool-info">
          <div className="info-item">
            <div className="info-label">Tool ID</div>
            <div className="info-value">{block.id}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Tool Name</div>
            <div className="info-value">{block.name}</div>
          </div>
          { (block as any).input && (
            <div className="info-item">
              <div className="info-label">Tool Input</div>
              <div className="info-value">
                <pre>{JSON.stringify(block.input, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </details>
  );
};

// Component to render thinking content block
const ThinkingContentBlock: React.FC<{ block: Extract<AnthropicContentBlock, {type: 'thinking'}>, index: number }> = ({ block, index }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <details open={expanded} className="content-block thinking-block" onChange={(e) => setExpanded((e.target as HTMLDetailsElement).open)}>
      <summary className="content-header">
        <span>Thinking #{index + 1}</span>
      </summary>
      <div className="content-body">
        {block.thinking && (
          <div className="thinking-content">
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(block.thinking) }} />
          </div>
        )}
        {block.signature && (
          <div className="signature-section">
            <div className="section-title">Signature</div>
            <div className="signature-content">{block.signature}</div>
          </div>
        )}
      </div>
    </details>
  );
};

// Component to render redacted thinking content block
const RedactedThinkingContentBlock: React.FC<{ block: Extract<AnthropicContentBlock, {type: 'redacted_thinking'}>, index: number }> = ({ block, index }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <details open={expanded} className="content-block redacted-thinking-block" onChange={(e) => setExpanded((e.target as HTMLDetailsElement).open)}>
      <summary className="content-header">
        <span>Redacted Thinking #{index + 1}</span>
      </summary>
      <div className="content-body">
        <div className="data-content">
          <pre>{block.data}</pre>
        </div>
      </div>
    </details>
  );
};

// Component to render individual content blocks
const ContentBlock: React.FC<{ block: AnthropicContentBlock; index: number }> = ({ block, index }) => {
  switch (block.type) {
    case 'text':
      return <TextContentBlock block={block as Extract<AnthropicContentBlock, {type: 'text'}>} index={index} />;
    case 'tool_use':
    case 'server_tool_use':
      return <ToolUseContentBlock block={block as Extract<AnthropicContentBlock, {type: 'tool_use' | 'server_tool_use'}>} index={index} />;
    case 'thinking':
      return <ThinkingContentBlock block={block as Extract<AnthropicContentBlock, {type: 'thinking'}>} index={index} />;
    case 'redacted_thinking':
      return <RedactedThinkingContentBlock block={block as Extract<AnthropicContentBlock, {type: 'redacted_thinking'}>} index={index} />;
    default:
      // Handle unknown content types
      const [expanded, setExpanded] = useState(true);
      return (
        <details open={expanded} className="content-block" onChange={(e) => setExpanded((e.target as HTMLDetailsElement).open)}>
          <summary className="content-header">
            <span>{block.type || 'Unknown Content'} #{index + 1}</span>
          </summary>
          <div className="content-body">
            <pre className="json-content">{JSON.stringify(block, null, 2)}</pre>
          </div>
        </details>
      );
  }
};

// Component to render all content blocks
const ContentSection: React.FC<{ content: Array<AnthropicContentBlock> }> = ({ content }) => {
  if (!content || content.length === 0) return null;

  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Content</span>
      </summary>
      <div className="section-content">
        {content.map((block, index) => (
          <ContentBlock key={index} block={block} index={index} />
        ))}
      </div>
    </details>
  );
};

// Component to render basic response info
const ResponseInfoSection: React.FC<{ response: AnthropicResponse }> = ({ response }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Response Info</span>
      </summary>
      <div className="section-content">
        <InfoItem label="ID" value={response.id} />
        <InfoItem label="Model" value={response.model} />
        <InfoItem label="Type" value={response.type} />
        <InfoItem label="Stop Reason" value={response.stop_reason} />
        <InfoItem label="Stop Sequence" value={response.stop_sequence} />
      </div>
    </details>
  );
};

// Component to render usage info
const UsageSection: React.FC<{ response: AnthropicResponse }> = ({ response }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Token Usage</span>
      </summary>
      <div className="section-content">
        <div className="usage-grid">
          <UsageItem label="Input Tokens" value={response.usage.input_tokens} />
          <UsageItem label="Output Tokens" value={response.usage.output_tokens} />
          <UsageItem label="Cache Creation Input Tokens" value={response.usage.cache_creation_input_tokens} />
          <UsageItem label="Cache Read Input Tokens" value={response.usage.cache_read_input_tokens} />
          <UsageItem
            label="Cache Creation"
            value={typeof response.usage.cache_creation === 'object' ? JSON.stringify(response.usage.cache_creation) : response.usage.cache_creation}
          />
          <UsageItem
            label="Server Tool Use"
            value={typeof response.usage.server_tool_use === 'object' ? JSON.stringify(response.usage.server_tool_use) : response.usage.server_tool_use}
          />
          <UsageItem label="Service Tier" value={response.usage.service_tier} />
        </div>
      </div>
    </details>
  );
};

// Component to render Anthropic response details
interface AnthropicResponseVisualizerProps {
  response: AnthropicResponse;
  eventCount?: number;
}

const AnthropicResponseVisualizer: React.FC<AnthropicResponseVisualizerProps> = ({ response }) => {
  return (
    <div className="container">
      <div className="header">
        <h1>Anthropic API Response</h1>
        <p></p>
      </div>
      <ResponseInfoSection response={response} />
      {response.usage && <UsageSection response={response} />}
      {response.content && <ContentSection content={response.content} />}
    </div>
  );
};

export default AnthropicResponseVisualizer;