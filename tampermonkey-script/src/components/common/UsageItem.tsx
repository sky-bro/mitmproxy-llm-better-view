import React from 'react';

// Component to render usage items
export const UsageItem: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (value === undefined || value === null) return null;
  return (
    <div className="usage-item">
      <div className="usage-label">{label}</div>
      <div className="usage-value">{value}</div>
    </div>
  );
};

export default UsageItem;