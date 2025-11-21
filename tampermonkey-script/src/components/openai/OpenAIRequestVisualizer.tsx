import React, { useState } from 'react';
import { renderChoiceTextContent, renderToolMessage, isAnthropicContent } from '../../utils/textRender';
import { ChatCompletionCreateParams } from 'openai/resources';

// Define a type that can handle both Chat and Completion requests (as seen in MITM proxy logs)
type OpenAIRequest = (
  & ChatCompletionCreateParams
  & { prompt?: string } // Completion API parameter (not in ChatCompletionCreateParams)
  & { [key: string]: any } // Allow additional properties for flexibility
);

// Component to render basic info items
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

// Component to render message content
const MessageContent: React.FC<{ message: any }> = ({ message }) => {
  console.log('Rendering message content:', message);
  if (message.role === "tool") {
    return <div className="prose" data-type="tool" dangerouslySetInnerHTML={{ __html: renderToolMessage(message.content) }} />;
  } else if (typeof message.content === "string") {
    return <div className="prose" data-format="string" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(message.content) }} />;
  } else if (Array.isArray(message.content)) {
    return (
      <div data-format="array">
        {message.content.map((item: any, idx: number) => (
          <MessageContent key={idx} message={item} />
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
const Message: React.FC<{ message: any; index: number; isLast: boolean }> = ({ message, index, isLast }) => {
  const [isOpen, setIsOpen] = useState(isLast ? true : false);

  const roleClass = `role-${message.role}`;

  return (
    <details open={isOpen} className="message-item" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="message-header">
        <div className="flex-container">
          <span className={`role-badge ${roleClass}`}>{message.role}</span>
          <span className="text-small">#{index + 1}</span>
        </div>
      </summary>
      <div className="message-content">
        <MessageContent message={message} />
      </div>
    </details>
  );
};

// Component to render parameter items
const ParameterItem: React.FC<{ name: string; param: any; required: string[] }> = ({ name, param, required }) => {
  const isRequired = required.includes(name);
  return (
    <div className="parameter-item">
      <div>
        <span className="parameter-name">{name}</span>
        {param.type && <span className="parameter-type">{param.type}</span>}
        {isRequired && <span className="parameter-required">required</span>}
      </div>
      {param.description && (
        <div className="parameter-description">{param.description}</div>
      )}
    </div>
  );
};

// Component to render tool content
const ToolContent: React.FC<{ tool: any; index: number }> = ({ tool, index }) => {
  if (!tool.function) {
    return <div className="json-content">{JSON.stringify(tool, null, 2)}</div>;
  }

  return (
    <>
      {tool.function.description && (
        <div
          className="tool-description prose"
          dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(tool.function.description) }}
        />
      )}
      {tool.function.parameters?.properties && (
        <div className="tool-parameters">
          <div className="tool-parameters-title">parameters:</div>
          {Object.entries(
            tool.function.parameters.properties as { [key: string]: any }
          ).map(([name, param]) => (
            <ParameterItem
              key={name}
              name={name}
              param={param}
              required={tool.function.parameters.required || []}
            />
          ))}
        </div>
      )}
    </>
  );
};

// Component to render a single tool
const Tool: React.FC<{ tool: any; index: number }> = ({ tool, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details open={isOpen} className="tool-item" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="tool-header">
        <div className="flex-container">
          <span className="tool-name-badge">
            {tool.function?.name || `Tool ${index + 1}`}
          </span>
          <span className="text-small">#{index + 1}</span>
        </div>
      </summary>
      <div className="tool-content">
        <ToolContent tool={tool} index={index} />
      </div>
    </details>
  );
};

// Component to render basic info section
const BasicInfo: React.FC<{ obj: OpenAIRequest }> = ({ obj }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Basic Info</span>
      </summary>
      <div className="section-content">
        <InfoItem label="model" value={obj.model} />
        <InfoItem label="Temperature" value={obj.temperature} />
        <InfoItem label="Max Tokens" value={obj.max_tokens} />
        <InfoItem label="Top P" value={obj.top_p} />
        <InfoItem label="Frequency Penalty" value={obj.frequency_penalty} />
        <InfoItem label="Presence Penalty" value={obj.presence_penalty} />
        <InfoItem label="Stream" value={obj.stream} />
        <InfoItem label="n" value={obj.n} />
      </div>
    </details>
  );
};

// Component to render messages section
const Messages: React.FC<{ messages?: any[] }> = ({ messages = [] }) => {
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

// Component to render prompt section
const Prompt: React.FC<{ prompt?: string }> = ({ prompt }) => {
  if (!prompt) return <></>;

  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Prompt</span>
      </summary>
      <div className="section-content">
        <div className="message-content" dangerouslySetInnerHTML={{ __html: renderChoiceTextContent(prompt) }} />
      </div>
    </details>
  );
};

// Component to render tools section
const Tools: React.FC<{ tools?: any[] }> = ({ tools = [] }) => {
  if (tools.length === 0) return <></>;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">
          Tools
          <span>({tools.length})</span>
        </span>
      </summary>
      <div className="section-content">
        {tools.map((tool, index) => (
          <Tool key={index} tool={tool} index={index} />
        ))}
      </div>
    </details>
  );
};

interface OpenAIRequestVisualizerProps {
  obj: OpenAIRequest;
}

const OpenAIRequestVisualizer: React.FC<OpenAIRequestVisualizerProps> = ({ obj }) => {
  return (
    <div className="container">
      <div className="header">
        <h1>OpenAI API Request</h1>
        <p></p>
      </div>

      <BasicInfo obj={obj} />
      {obj.messages && <Messages messages={obj.messages} />}
      {obj.prompt && <Prompt prompt={obj.prompt} />}
      {obj.tools && <Tools tools={obj.tools} />}
    </div>
  );
};

export default OpenAIRequestVisualizer;