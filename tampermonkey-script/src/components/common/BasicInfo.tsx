import React from 'react';
import Section from './Section'

// Component for basic info section with flexible children content
interface BasicInfoProps {
  title?: string;
  children: React.ReactNode;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ title = 'Basic Info', children }) => {
  return <Section title={title} defaultOpen={true}>
    {children}
  </Section>
};

export default BasicInfo;