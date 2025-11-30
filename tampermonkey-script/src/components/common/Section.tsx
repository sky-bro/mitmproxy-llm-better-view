import React, { useState } from 'react';

interface SectionProps {
  title?: React.ReactNode;
  defaultOpen?: boolean; // Whether the collection should be open by default
  children?: React.ReactNode;
}
export const Section: React.FC<SectionProps> = ({
  title = "Section",
  defaultOpen = false,
  children
}) => {
    if (!children) return null;

  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">
          {title}
        </span>
      </summary>
      <div className="section-content">
        {children}
      </div>
    </details>
  );
};

export default Section;