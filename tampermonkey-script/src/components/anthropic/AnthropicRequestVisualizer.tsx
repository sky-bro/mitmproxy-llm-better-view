import React, { useState } from 'react';
import { renderChoiceTextContent } from '../../utils/textRender';
import { AnthropicRequest, AnthropicSystemMessageContent, AnthropicMessage } from '../../types/api/anthropic';
import { ContentBlockParam, ToolChoice, ToolUnion } from '@anthropic-ai/sdk/resources';
import BasicInfo from '../common/BasicInfo';
import InfoItem from '../common/InfoItem';
import MessageContentBlock from '../common/MessageContentBlock';
import { Tools, Tool } from '../common/Tool';

// Component to render message content specifically for Anthropic
const MessageContent: React.FC<{ message: AnthropicMessage }> = ({ message }) => {
  if (typeof message.content === "string") {
    return <div className="prose" data-format="string" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(message.content) }} />;
  } else if (Array.isArray(message.content)) {
    return (
      <div data-format="array">
        {message.content.map((item: ContentBlockParam, idx: number) => {
          const contentType = item.type || 'unknown';
          const contentTitle = item.type === 'tool_use' ? `${item.type}: ${item.name || 'unnamed'}` : contentType;

          let contentElement;
          switch (item.type) {
            case 'text':
              contentElement = (
                <div className="prose" data-format="string" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(item.text) }} />
              );
              break;
            case 'image':
              contentElement = (
                <div className="image-content">
                  <div>Source: {JSON.stringify(item.source, null, 2)}</div>
                </div>
              );
              break;
            case 'tool_use':
              contentElement = (
                <div className="tool-call-content">
                  <div>Tool ID: {item.id}</div>
                  <div className="tool-input">Input: <pre>{JSON.stringify(item.input, null, 2)}</pre></div>
                </div>
              );
              break;
            case 'tool_result':
              contentElement = (
                <div className="tool-result-content">
                  <div>Tool Use ID: {item.tool_use_id}</div>
                  {item.content && (
                    <div className="result-content">
                      {Array.isArray(item.content) ?
                        item.content.map((contentItem: any, contentIdx: number) => (
                          <div key={contentIdx}>Result content item: {JSON.stringify(contentItem)}</div>
                        ))
                        : item.content}
                    </div>
                  )}
                </div>
              );
              break;
            case 'thinking':
              contentElement = (
                <div className="thinking-content" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(item.thinking) }} />
              );
              break;
            default:
              contentElement = (
                <div className="json-content"><pre>{JSON.stringify(item, null, 2)}</pre></div>
              );
          }

          return (
            <MessageContentBlock key={idx} title={contentTitle} defaultOpen={idx === 0}>
              {contentElement}
            </MessageContentBlock>
          );
        })}
      </div>
    );
  }
};

// Component to render a single message
const Message: React.FC<{ message: AnthropicMessage; index: number; isLast: boolean }> = ({ message, index, isLast }) => {
  const [isOpen, setIsOpen] = useState(isLast ? true : false);

  const roleClass = `role-${message.role || 'unknown'}`;

  return (
    <details open={isOpen} className="message-item" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="message-header">
        <div className="flex-container">
          <span className={`role-badge ${roleClass}`}>{message.role || 'unknown'}</span>
          <span className="text-small">#{index + 1}</span>
        </div>
      </summary>
      <div className="message-content">
        <MessageContent message={message} />
      </div>
    </details>
  );
};


// Component to render system message content
const SystemMessageContent: React.FC<{ systemMessage: AnthropicSystemMessageContent }> = ({ systemMessage }) => {
  if (typeof systemMessage === 'string') {
    return (
      <div
        className="prose data-format-string"
        dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(systemMessage as string) }}
      />
    );
  } else if (Array.isArray(systemMessage)) {
    return (
      <div className="anthropic-content-array">
        {systemMessage.map((item, index) => {
          if (item.type !== 'text') {
            return null;
          }
          return (
            <MessageContentBlock key={index} title={`text`} defaultOpen={true}>
              {item.text && (
                <div className="prose" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(item.text) }} />
              )}
            </MessageContentBlock>
          );
        })}
      </div>
    );
  } else {
    return <div className="json-content">{JSON.stringify(systemMessage)}</div>;
  }
};

// Component to render individual tool
const ToolItem: React.FC<{ tool: ToolUnion; index: number }> = ({ tool, index }) => {
  // Check tool type and extract common properties safely
  const toolName = 'name' in tool && typeof tool.name === 'string' ? tool.name : 'unnamed';
  const description = 'description' in tool && typeof tool.description === 'string' ? tool.description : undefined;
  const inputSchema = 'input_schema' in tool ? tool.input_schema : undefined;

  return (
    <Tool
      key={index}
      tool={{
        name: toolName,
        description: description,
        input_schema: inputSchema,
      }}
      index={index}
    />
  );
};

// Component to render tool choice information
const ToolChoiceSection: React.FC<{ tool_choice?: ToolChoice }> = ({ tool_choice }) => {
  if (!tool_choice) return null;

  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Tool Choice</span>
      </summary>
      <div className="section-content">
        <pre>{JSON.stringify(tool_choice, null, 2)}</pre>
      </div>
    </details>
  );
};

// Component to render messages section
const Messages: React.FC<{ messages?: Array<AnthropicMessage>, systemMessage?: AnthropicSystemMessageContent}> = ({ messages = [], systemMessage = '' }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSystemMessageOpen, setIsSystemMessageOpen] = useState(false);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">
          Messages
          {messages.length ? <span>({messages.length})</span> : ''}
        </span>
      </summary>

      <div className="section-content">
        {/* Render systemMessage if it exists */}
        {systemMessage && (
          <details open={isSystemMessageOpen} className="message-item" onChange={(e) => setIsSystemMessageOpen((e.target as HTMLDetailsElement).open)}>
            <summary className="message-header">
              <div className="flex-container">
                <span className="role-badge role-system">system</span>
                <span className="text-small">#0</span>
              </div>
            </summary>
            <div className="message-content">
              <SystemMessageContent systemMessage={systemMessage} />
            </div>
          </details>
        )}

        {!messages.length ? (
          <div className="empty-state">no messages</div>
        ) : (
          messages.map((message, index) => <Message key={index} message={message} index={index} isLast={index === messages.length - 1} />)
        )}
      </div>
    </details>
  );
};

const AnthropicRequestVisualizer: React.FC<{request: AnthropicRequest}> = ({ request }) => {
  if (!request) {
    return <div>No request data available</div>;
  }
  console.log("Rendering Anthropic request:", request);
  return (
    <div className="container">
      <div className="header">
        <h1>Anthropic API Request</h1>
        <p></p>
      </div>

      <BasicInfo>
        <InfoItem label="model" value={request.model} />
        <InfoItem label="max_tokens" value={request.max_tokens} />
        <InfoItem label="temperature" value={request.temperature} />
        <InfoItem label="top_p" value={request.top_p} />
        <InfoItem label="top_k" value={request.top_k} />
        <InfoItem label="stop_sequences" value={request.stop_sequences ? request.stop_sequences.join(', ') : undefined} />
        <InfoItem label="stream" value={request.stream} />
      </BasicInfo>

      <Messages messages={request.messages} systemMessage={request.system} />

      <ToolChoiceSection tool_choice={request.tool_choice} />

      {request.tools && (
        <Tools title="Tools" defaultOpen={false}>
          {request.tools.map((tool, index) => (
            <ToolItem tool={tool} index={index} />
          ))}
        </Tools>
      )}
    </div>
  );
};

export default AnthropicRequestVisualizer;