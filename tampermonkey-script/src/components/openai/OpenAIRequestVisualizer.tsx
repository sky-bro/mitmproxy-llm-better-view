import React from 'react';
import { renderChoiceTextContent } from '../../utils/textRender';
import { ChatCompletionCreateParams, ChatCompletionMessageParam, ChatCompletionMessageToolCall, ChatCompletionContentPartRefusal, ChatCompletionContentPart } from 'openai/resources';
import BasicInfo from '../common/BasicInfo';
import InfoItem from '../common/InfoItem';
import MessageContentBlock from '../common/MessageContentBlock';
import { Tools, Tool } from '../common/Tool';
import { ChatCompletionTool } from 'openai/resources';
import Messages from '../common/Messages';
import Message from '../common/Message';
import Section from '../common/Section';
import JsonContent from '../common/JsonContent';
import ProseContent from '../common/ProseContent';
import ToolCall from '../common/ToolCall';
import ToolResult from '../common/ToolResult';

// Type that can handle both Chat and Completion requests (as seen in MITM proxy logs)
type OpenAIRequest = ChatCompletionCreateParams & {
  [key: string]: any; // Allow additional properties for flexibility
};

type MessageContentType = string | Array<ChatCompletionContentPart | ChatCompletionContentPartRefusal> | null

const MessageContent: React.FC<{ content?: MessageContentType }> = ({ content }) => {
  if (!content) {
    return null;
  }
  if (typeof content === "string") {
    return <ProseContent contentStr={content} />;
  } else if (Array.isArray(content)) {
    return content.map((item: ChatCompletionContentPart | ChatCompletionContentPartRefusal, idx: number) => {
      return (
        <MessageContentBlock key={idx} title={item.type} defaultOpen={idx === content.length - 1}>
          <ContentPartRenderer item={item} />
        </MessageContentBlock>
      )
    })
  }
}


const ToolCalls: React.FC<{ toolCalls?: Array<ChatCompletionMessageToolCall> }> = ({ toolCalls }) => {
  if (!toolCalls || !toolCalls.length) {
    return null;
  }
  return (<>
  {toolCalls.map((toolCall, idx) => {
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
        key={idx}
        callId={toolCallId}
        toolName={toolName}
        toolType={toolType}
        argumentsStr={argumentsStr}
        index={idx}
      />
    );
  })}
  </>)
}

// Component to render message content
const RoleMessage: React.FC<{ message: ChatCompletionMessageParam }> = ({ message }) => {
  switch (message.role) {
    case 'assistant':
      // Assistant messages get standard prose styling
      return <>
        <Section title='content' defaultOpen={false}>
          {message.content && <MessageContent content={message.content} />}
        </Section>
        <Section title='audio' defaultOpen={false}>
          {message.audio && <JsonContent jsonObj={message.audio} />}
        </Section>
        <Section title={`tool calls (${message.tool_calls?.length})`} defaultOpen={true}>
          {message.tool_calls && <ToolCalls toolCalls={message.tool_calls} />}
        </Section>
        <Section title={`function call (deprecated): ${message.function_call?.name}`} defaultOpen={false}>
          {message.function_call && <ProseContent contentStr={message.function_call?.arguments}/>}
        </Section>
        <Section title='refusal' defaultOpen={true}>
          {message.refusal && <ProseContent contentStr={message.refusal}/>}
        </Section>
      </>
    case 'tool':
      return  (
        <ToolResult toolUseId={message.tool_call_id}>
          <MessageContent content={message.content} />
        </ToolResult>
      )
    case 'function':
    case 'system':
    case 'user':
    case 'developer':
      return <MessageContent content={message.content} />
  }
};

// Component to render a content part based on its type
const ContentPartRenderer: React.FC<{ item: ChatCompletionContentPart | ChatCompletionContentPartRefusal }> = ({ item }) => {
  switch (item.type) {
    case 'text':
      return <ProseContent contentStr={item.text} />
    case 'image_url':
      return <div className="image-content">
        <img src={item.image_url?.url} alt="Content image" style={{ maxWidth: '100%', height: 'auto' }} />
        {item.image_url?.detail && <small>Detail: {item.image_url.detail}</small>}
      </div>;
    case 'input_audio':
      return <div className="audio-content">
        <audio controls src={item.input_audio?.data} />
        {item.input_audio?.format && <small>Format: {item.input_audio.format}</small>}
      </div>;
    case 'refusal':
      return <div className="refusal-content">
        <strong>Refusal:</strong> {item.refusal}
      </div>;
    case 'file':
      return <div>{JSON.stringify(item, null, 2)}</div>;
  }
};


// Update: ToolItem properly handles ChatCompletionTool which only has 'function' type in OpenAI API
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
        return <Tool key={index}
         tool={{ name: tool.custom.name, description: tool.custom.description, input_schema: tool.custom.format, }}
         index={index}
        />
  }
};

const OpenAIRequestVisualizer: React.FC<{obj: OpenAIRequest}> = ({ obj }) => {
  return (
    <div className="container">
      <div className="header">
        <h1>OpenAI API Request</h1>
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

      <Messages title="Messages" count={obj.messages?.length} defaultOpen={true}>
        {obj.messages?.length ? (
          obj.messages.map((message, index) => {
            return (
              <Message key={index} role={message.role} name={(message as any)?.name} index={index} open={index === obj.messages.length - 1}>
                <RoleMessage message={message} />
              </Message>
            )
          })
        ) : (
          <div className="empty-state">no messages</div>
        )}
      </Messages>

      <Tools title="Tools" count={obj.tools?.length} defaultOpen={false}>
        {obj.tools?.map((tool, index) => (
          <ToolItem key={index} tool={tool} index={index} />
        ))}
      </Tools>
    </div>
  );
};

export default OpenAIRequestVisualizer;