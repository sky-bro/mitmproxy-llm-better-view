import React, { useState } from 'react';
import { renderChoiceTextContent, renderToolMessage } from '../../utils/textRender';
import { ChatCompletionCreateParams } from 'openai/resources';
import BasicInfo from '../common/BasicInfo';
import InfoItem from '../common/InfoItem';
import { Tools, Tool } from '../common/Tool';
import { ChatCompletionTool } from 'openai/resources';

// Define a type that can handle both Chat and Completion requests (as seen in MITM proxy logs)
type OpenAIRequest = (
  & ChatCompletionCreateParams
  & { prompt?: string } // Completion API parameter (not in ChatCompletionCreateParams)
  & { [key: string]: any } // Allow additional properties for flexibility
);


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
  } else {
    return <div className="json-content" data-format="object">{JSON.stringify(message.content, null, 2)}</div>;
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

const ToolItem: React.FC<{ tool: ChatCompletionTool; index: number }> = ({ tool, index }) => {
  switch (tool.type) {
    case 'function':
      return (
        <Tool key={index}
         tool={{ name: tool.function.name, description: tool.function.description, input_schema: tool.function.parameters, }}
         index={index}
        />
      );
    case 'custom':
      return (
        <Tool key={index} tool={{ name: tool.custom.name, description: tool.custom.description, }} index={index} />
      );
  }
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

      <BasicInfo>
        <InfoItem label="model" value={obj.model} />
        <InfoItem label="Temperature" value={obj.temperature} />
        <InfoItem label="Max Tokens" value={obj.max_tokens} />
        <InfoItem label="Top P" value={obj.top_p} />
        <InfoItem label="Frequency Penalty" value={obj.frequency_penalty} />
        <InfoItem label="Presence Penalty" value={obj.presence_penalty} />
        <InfoItem label="Stream" value={obj.stream} />
        <InfoItem label="n" value={obj.n} />
      </BasicInfo>
      {obj.messages && <Messages messages={obj.messages} />}
      {obj.prompt && <Prompt prompt={obj.prompt} />}
      {obj.tools && (
        <Tools title="Tools" defaultOpen={false}>
          {obj.tools.map((tool, index) => (
            <ToolItem key={index} tool={tool} index={index} />
          ))}
        </Tools>
      )}
    </div>
  );
};

export default OpenAIRequestVisualizer;