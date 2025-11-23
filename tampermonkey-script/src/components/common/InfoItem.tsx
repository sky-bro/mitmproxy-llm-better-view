import React from 'react';

// Helper component for basic info section - supports flexible data structure
interface BaseInfoItemProps {
  label: string;
  value: any;
  formatter?: (val: any) => string;
}

export const InfoItem: React.FC<BaseInfoItemProps> = ({ label, value, formatter }) => {
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

export default InfoItem;