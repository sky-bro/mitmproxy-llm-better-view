import React, { useState } from 'react';

interface InfoItemProps {
  label: string;
  value: any;
  formatter?: (val: any) => string;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value, formatter }) => {
  if (value === undefined || value === null) return null;

  const displayValue = formatter ? formatter(value) : value;
  return (
    <div className="info-item">
      <div className="info-label">{label}</div>
      <div className="info-value">
        {typeof displayValue === 'boolean' ? (displayValue ? 'true' : 'false') : displayValue}
      </div>
    </div>
  );
};

interface UsageItemProps {
  label: string;
  value: any;
}

export const UsageItem: React.FC<UsageItemProps> = ({ label, value }) => {
  if (value === undefined || value === null) return null;
  return (
    <div className="usage-item">
      <div className="usage-label">{label}</div>
      <div className="usage-value">{value}</div>
    </div>
  );
};

interface BasicInfoSectionProps {
  data: {
    id?: string;
    model?: string;
    object?: string;
    created?: number;
    system_fingerprint?: string;
    eventCount?: number;
    [key: string]: any;
  };
  title?: string;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ data, title = "Basic Info" }) => {
  const [isOpen, setIsOpen] = useState(true);

  const createdDate = data.created ? new Date(data.created * 1000).toLocaleString('en-US') : undefined;

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">{title}</span>
      </summary>
      <div className="section-content">
        <InfoItem label="Response ID" value={data.id} />
        <InfoItem label="Model" value={data.model} />
        <InfoItem label="Object Type" value={data.object} />
        <InfoItem label="Created" value={createdDate} />
        <InfoItem label="System Fingerprint" value={data.system_fingerprint} />
        {data.eventCount !== undefined && <InfoItem label="Events Count" value={data.eventCount || 0} />}
      </div>
    </details>
  );
};

interface TokenUsageSectionProps {
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
    [key: string]: any;
  };
}

export const TokenUsageSection: React.FC<TokenUsageSectionProps> = ({ usage }) => {
  if (!usage) return null;

  const [isOpen, setIsOpen] = useState(true);

  return (
    <details open={isOpen} className="section" onChange={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="section-header">
        <span className="section-title">Token Usage</span>
      </summary>
      <div className="section-content">
        <div className="usage-grid">
          <UsageItem label="Prompt Tokens" value={usage.prompt_tokens} />
          <UsageItem label="Completion Tokens" value={usage.completion_tokens} />
          <UsageItem label="Total Tokens" value={usage.total_tokens} />
          <UsageItem label="Input Tokens" value={usage.input_tokens} />
          <UsageItem label="Output Tokens" value={usage.output_tokens} />
        </div>
      </div>
    </details>
  );
};