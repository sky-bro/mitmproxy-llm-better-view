import React, { useState } from 'react';

// Component for basic info section with flexible children content
interface BasicInfoProps {
  title?: string;
  children: React.ReactNode;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ title = 'Basic Info', children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">{title}</span>
      </summary>
      <div className="section-content">
        {children}
      </div>
    </details>
  );
};

export default BasicInfo;