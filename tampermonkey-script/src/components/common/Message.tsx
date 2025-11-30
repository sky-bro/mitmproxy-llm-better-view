import React from 'react';
import Section from './Section'

interface MessageProps {
  children?: React.ReactNode;
  role?: string;             // Role of the message (e.g., user, assistant, system)
  name?: string;
  index: number;            // Index of the message in the list
  open?: boolean;           // Whether to be open by default
}

const Message: React.FC<MessageProps> = ({
  children,
  role = 'user',
  name = '',
  index,
  open = false,
}) => {
  const roleClass = `role-${role || 'unknown'}`;

  return (
    <Section defaultOpen={open} title={
      <div className="flex-container">
        <span className={`role-badge ${roleClass}`}>{role || 'unknown'}{name && `: ${name}`}</span>
        <span className="text-small">#{index + 1}</span>
      </div>
    }>
      {children}
    </Section>
  )
};

export default Message;