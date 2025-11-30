import React, { useState } from 'react';
import Section from './Section'

interface MessagesProps {
  title?: string;
  count?: number; // Number of messages to display in the title
  defaultOpen?: boolean; // Whether the messages section should be open by default
  children?: React.ReactNode;
}

// Collection component to render multiple messages
const Messages: React.FC<MessagesProps> = ({
  title = "Messages",
  count,
  defaultOpen = true,
  children
}) => {
  // If count is provided, include it in the title
  const displayTitle = count !== undefined ? `${title} (${count})` : title;
  return <Section title={displayTitle} defaultOpen={defaultOpen} >
    {children}
  </Section>
};

export default Messages;