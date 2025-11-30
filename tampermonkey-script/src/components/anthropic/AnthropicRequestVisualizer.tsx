import React, { useState } from 'react';
import { renderChoiceTextContent } from '../../utils/textRender';
import { AnthropicRequest, AnthropicSystemMessageContent, AnthropicMessage, AnthropicMessageContent } from '../../types/api/anthropic';
import { ContentBlockParam, ToolChoice, ToolUnion } from '@anthropic-ai/sdk/resources';
import BasicInfo from '../common/BasicInfo';
import InfoItem from '../common/InfoItem';
import MessageContentBlock from '../common/MessageContentBlock';
import { Tools, Tool } from '../common/Tool';
import Messages from '../common/Messages';
import Message from '../common/Message';
import ToolCall from '../common/ToolCall';
import ToolResult from '../common/ToolResult';
import JsonContent from '../common/JsonContent';
import ProseContent from '../common/ProseContent';

// Component to render message content specifically for Anthropic API
const MessageContent: React.FC<{ content: AnthropicMessageContent }> = ({ content }) => {
  if (typeof content === "string") {
    return <ProseContent contentStr={content} />;
  } else if (Array.isArray(content)) {
    return (
      <div data-format="array">
        {content.map((item: ContentBlockParam, idx: number) => {
          const contentType = item.type || 'unknown';
          const contentTitle = item.type === 'tool_use' ? `${contentType}: ${item.name || 'unnamed'}` : contentType;

          let contentElement;
          switch (item.type) {
            case 'text':
              contentElement = (
                <ProseContent contentStr={item.text} />
              );
              break;
            case 'image':
              const imageSource = item.source;
              let imageUrl = '';

              if (imageSource && typeof imageSource === 'object') {
                switch (imageSource.type) {
                  case 'base64':
                    if (imageSource.media_type && imageSource.data) {
                      imageUrl = `data:${imageSource.media_type};base64,${imageSource.data}`;
                    }
                    break;
                  case 'url':
                    imageUrl = imageSource.url
                    break;
                }
              }

              contentElement = (
                <div className="image-content">
                    <img
                      src={imageUrl}
                      alt="Embedded image"
                      style={{ maxWidth: '400px', height: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
              );
              break;
            case 'tool_use':
              contentElement = (
                <ToolCall
                  callId={item.id || 'N/A'}
                  toolName={item.name || 'unnamed'}
                  toolType={item.type}
                  argumentsStr={JSON.stringify(item.input || {})}
                  index={idx}
                />
              );
              break;
            case 'tool_result':
              contentElement = (
                <ToolResult toolUseId={item.tool_use_id || 'N/A'}>
                  {item.content && <MessageContent content={item.content}/>}
                </ToolResult>
              );
              break;
            case 'thinking':
              contentElement = (
                <div className="thinking-content">
                  <ProseContent contentStr={item.thinking} />
                </div>
              );
              break;
            default:
              contentElement = (
                <div className="json-content"><pre>{JSON.stringify(item, null, 2)}</pre></div>
              );
          }

          return (
            <MessageContentBlock key={idx} title={contentTitle} defaultOpen={false}>
              {contentElement}
            </MessageContentBlock>
          );
        })}
      </div>
    );
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

// Component to render messages section with system message capability
const MessagesWithSystem: React.FC<{ messages?: Array<AnthropicMessage>, systemMessage?: AnthropicSystemMessageContent}> = ({ messages = [], systemMessage = '' }) => {
  if (!messages?.length && !systemMessage) {
      return <div className="empty-state">no messages</div>
  }

  return (
    <>
      {systemMessage && (
          <Message key={-1} role="system" index={-1} open={false}>
            <MessageContent content={systemMessage} />
          </Message>
      )}

      {messages?.length && (
        messages.map((message, index) => (
          <Message key={index} role={message.role} index={index} open={index === messages.length - 1}>
            <MessageContent content={message.content} />
          </Message>
        ))
      )}
    </>
  );
};

const AnthropicRequestVisualizer: React.FC<{request: AnthropicRequest}> = ({ request }) => {
  if (!request) {
    return <div>No request data available</div>;
  }
  return (
    <div className="container">
      <div className="header">
        <h1>Anthropic API Request</h1>
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

      <Messages title="Messages" count={request.messages?.length} defaultOpen={true}>
        <MessagesWithSystem messages={request.messages} systemMessage={request.system} />
      </Messages>

      <ToolChoiceSection tool_choice={request.tool_choice} />

      {request.tools && (
        <Tools title="Tools" count={request.tools.length} defaultOpen={false}>
          {request.tools.map((tool, index) => (
            <ToolItem tool={tool} index={index} />
          ))}
        </Tools>
      )}
    </div>
  );
};

export default AnthropicRequestVisualizer;