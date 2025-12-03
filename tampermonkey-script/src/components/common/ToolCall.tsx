import React from 'react';
import Section from './Section';
import JsonContent from './JsonContent';

interface ToolCallProps {
  callId: string;
  toolName: string;
  toolType?: string;
  argumentsStr?: string;
  index: number;
}

const ToolCall: React.FC<ToolCallProps> = ({
  callId,
  toolName,
  toolType = 'function',
  argumentsStr = '{}',
  index,
}) => {
  let parsedArguments: any = {};

  try {
    parsedArguments = JSON.parse(argumentsStr);
  } catch {
    parsedArguments = argumentsStr;
  }

  const title = (
    <div>
      <div className="tool-call-name">{`${toolType}: ${toolName} #${index + 1}`}</div>
      <div className="tool-call-id">ID: {callId || 'N/A'}</div>
    </div>
  );

  return (
    <Section title={title} defaultOpen={false}>
      <JsonContent jsonObj={parsedArguments} />
    </Section>
  );
};

export default ToolCall;