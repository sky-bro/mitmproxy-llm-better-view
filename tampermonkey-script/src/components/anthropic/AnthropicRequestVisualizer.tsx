import React, { useState } from 'react';
import { renderChoiceTextContent, isAnthropicContent } from '../../utils/textRender';
import { AnthropicRequest } from '../../types/api/anthropic';

// Component to render basic info items (extracted from OpenAI version)
const InfoItem: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (value === undefined) return <></>;
  return (
    <div className="info-item">
      <div className="info-label">{label}</div>
      <div className="info-value">
        {typeof value === 'boolean' ? (value ? 'true' : 'false') : value}
      </div>
    </div>
  );
};

interface AnthropicMessage {
  role: string;
  content: string | Array<{
    type: string;
    text?: string;
    image?: any;
  }>;
}

// Component to render message content specifically for Anthropic
const MessageContent: React.FC<{ message: AnthropicMessage }> = ({ message }) => {
  if (typeof message.content === "string") {
    return <div className="prose" data-format="string" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(message.content) }} />;
  } else if (Array.isArray(message.content)) {
    return (
      <div data-format="array">
        {message.content.map((item: any, idx: number) => (
          <div key={idx} className="anthropic-content-block">
            <div className="content-type">{item.type}</div>
            {item.text && (
              <div className="prose" data-format="string" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(item.text) }} />
            )}
            {item.image && <div className="image-content">{JSON.stringify(item.image)}</div>}
          </div>
        ))}
      </div>
    );
  } else if (isAnthropicContent(message)) {
    return <AnthropicContent content={message} />;
  } else {
    return <div className="json-content" data-format="object">{JSON.stringify(message.content, null, 2)}</div>;
  }
};

// Component to render Anthropic content
const AnthropicContent: React.FC<{ content: any }> = ({ content }) => {
  if (content.type === 'text') {
    return (
      <div className="prose" data-format="string" data-content-type="anthropic" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(content.text) }} />
    );
  } else {
    return (
      <div className="json-content" data-format="object" data-content-type="anthropic">
        {JSON.stringify(content, null, 2)}
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

// Component to render basic info section for Anthropic requests
const BasicInfo: React.FC<{ obj: AnthropicRequest }> = ({ obj }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Basic Info</span>
      </summary>
      <div className="section-content">
        <InfoItem label="model" value={obj.model} />
        <InfoItem label="max_tokens" value={obj.max_tokens} />
        <InfoItem label="temperature" value={obj.temperature} />
        <InfoItem label="top_p" value={obj.top_p} />
        <InfoItem label="top_k" value={obj.top_k} />
        <InfoItem label="stop_sequences" value={obj.stop_sequences ? obj.stop_sequences.join(', ') : undefined} />
        <InfoItem label="stream" value={obj.stream} />
      </div>
    </details>
  );
};

// Component to render messages section
const Messages: React.FC<{ messages?: AnthropicMessage[] }> = ({ messages = [] }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">
          Messages
          {messages.length ? <span>({messages.length})</span> : ''}
        </span>
      </summary>
      <div className="section-content">
        {!messages.length ? (
          <div className="empty-state">no messages</div>
        ) : (
          messages.map((message, index) => <Message key={index} message={message} index={index} isLast={index === messages.length - 1} />)
        )}
      </div>
    </details>
  );
};

// Component to render system prompt section
const SystemPrompt: React.FC<{ system?: string | any[] }> = ({ system }) => {
  if (!system) return <></>;

  const [isOpen, setIsOpen] = useState(true);

  const systemContent = typeof system === 'string'
    ? system
    : Array.isArray(system)
      ? system.map((item, _idx /* using underscore prefix to indicate it's intentionally unused */) => typeof item === 'string' ? item : JSON.stringify(item)).join(' ')
      : JSON.stringify(system);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">System Prompt</span>
      </summary>
      <div className="section-content">
        <div className="message-content" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(systemContent) }} />
      </div>
    </details>
  );
};

interface AnthropicRequestVisualizerProps {
  obj: AnthropicRequest;
}

const AnthropicRequestVisualizer: React.FC<AnthropicRequestVisualizerProps> = ({ obj }) => {
  return (
    <div className="container">
      <div className="header">
        <h1>Anthropic API Request</h1>
        <p></p>
      </div>

      <BasicInfo obj={obj} />
      {obj.messages && <Messages messages={obj.messages as AnthropicMessage[]} />}
      {obj.system && <SystemPrompt system={obj.system} />}
    </div>
  );
};

export default AnthropicRequestVisualizer;