import React from 'react';
import Section from './Section';

interface ToolResultProps {
  title?: string
  toolUseId: string;
  children?: React.ReactNode
}

const ToolResult: React.FC<ToolResultProps> = ({
  title,
  toolUseId,
  children
}) => {
  const titleEle = (
    <div>
      {title && <div className="tool-call-name">{title}</div>}
      <div className="tool-call-id">ID: {toolUseId || 'N/A'}</div>
    </div>
  );

  return (
    <Section title={titleEle} defaultOpen={true}>
      {children}
    </Section>
  );
};

export default ToolResult;