import React, { useState } from 'react';
import { renderChoiceTextContent } from '../../utils/textRender';
import { Message, ContentBlock } from "@anthropic-ai/sdk/resources";

// Import the correct Anthropic response type
export type AnthropicResponse = Message;

// Component to render individual content blocks
const ContentBlock: React.FC<{ block: ContentBlock; index: number }> = ({ block, index }) => {
  const [expanded, setExpanded] = useState(true);

  if (block.type === 'text') {
    return (
      <details open={expanded} className="content-block">
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
  } else if (block.type === 'tool_use') {
    return (
      <details open={expanded} className="content-block">
        <summary className="content-header">
          <span>Tool Use #{index + 1}</span>
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
            <div className="info-item">
              <div className="info-label">Tool Input</div>
              <div className="info-value">
                <pre>{JSON.stringify(block.input, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </details>
    );
  } else if (block.type === 'thinking') {
    return (
      <details open={expanded} className="content-block thinking-block">
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
  } else if (block.type === 'redacted_thinking') {
    return (
      <details open={expanded} className="content-block redacted-thinking-block">
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
  } else if (block.type === 'server_tool_use') {
    return (
      <details open={expanded} className="content-block server-tool-block">
        <summary className="content-header">
          <span>Server Tool Use #{index + 1}</span>
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
            { (block.input as any) && (
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
  } else {
    return (
      <details open={expanded} className="content-block">
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
interface ContentSectionProps {
  content: ContentBlock[];
}

const ContentSection: React.FC<ContentSectionProps> = ({ content }) => {
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
      <div className="section">
        <div className="section-header">
          <span className="section-title">Response Info</span>
        </div>
        <div className="section-content">
          <div className="info-item">
            <div className="info-label">ID</div>
            <div className="info-value">{response.id}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Model</div>
            <div className="info-value">{response.model}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Type</div>
            <div className="info-value">{response.type}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Stop Reason</div>
            <div className="info-value">{response.stop_reason}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Stop Sequence</div>
            <div className="info-value">{response.stop_sequence}</div>
          </div>
        </div>
      </div>
      {response.content && <ContentSection content={response.content} />}
      {response.usage && (
        <details open className="section">
          <summary className="section-header">
            <span className="section-title">Token Usage</span>
          </summary>
          <div className="section-content">
            <div className="usage-grid">
              <div className="usage-item">
                <div className="usage-label">Input Tokens</div>
                <div className="usage-value">{response.usage.input_tokens}</div>
              </div>
              <div className="usage-item">
                <div className="usage-label">Output Tokens</div>
                <div className="usage-value">{response.usage.output_tokens}</div>
              </div>
              {response.usage.cache_creation_input_tokens !== null && (
                <div className="usage-item">
                  <div className="usage-label">Cache Creation Input Tokens</div>
                  <div className="usage-value">{response.usage.cache_creation_input_tokens}</div>
                </div>
              )}
              {response.usage.cache_read_input_tokens !== null && (
                <div className="usage-item">
                  <div className="usage-label">Cache Read Input Tokens</div>
                  <div className="usage-value">{response.usage.cache_read_input_tokens}</div>
                </div>
              )}
              {response.usage.cache_creation !== null && (
                <div className="usage-item">
                  <div className="usage-label">Cache Creation</div>
                  <div className="usage-value">{typeof response.usage.cache_creation === 'object' ? JSON.stringify(response.usage.cache_creation) : response.usage.cache_creation}</div>
                </div>
              )}
              {response.usage.server_tool_use !== null && (
                <div className="usage-item">
                  <div className="usage-label">Server Tool Use</div>
                  <div className="usage-value">{typeof response.usage.server_tool_use === 'object' ? JSON.stringify(response.usage.server_tool_use) : response.usage.server_tool_use}</div>
                </div>
              )}
              {response.usage.service_tier !== null && (
                <div className="usage-item">
                  <div className="usage-label">Service Tier</div>
                  <div className="usage-value">{response.usage.service_tier}</div>
                </div>
              )}
            </div>
          </div>
        </details>
      )}
    </div>
  );
};

export default AnthropicResponseVisualizer;