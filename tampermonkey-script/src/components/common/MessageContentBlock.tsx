import React, { useState } from 'react';

interface MessageContentBlockProps {
  title: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  index?: number;
}

const MessageContentBlock: React.FC<MessageContentBlockProps> = ({ title, children, defaultOpen = false, index = 0 }) => {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <details key={index} className="content-block-item" open={expanded} onChange={(e) => setExpanded((e.target as HTMLDetailsElement).open)}>
      <summary className="content-block-header">
        <span className="content-type-badge">{title}</span>
      </summary>
      <div className="content-block-content">
        {children}
      </div>
    </details>
  );
};

export default MessageContentBlock;