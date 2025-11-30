import React from 'react';

export const ProseContent: React.FC<{contentStr?: string | null}> = ({
  contentStr
}) => {
  if (!contentStr) return null;

  return <div className="prose" data-format="string">
    <pre className="text-content" style={{whiteSpace: 'pre-wrap', margin: 0}}>{contentStr}</pre>
  </div>;
};

export default ProseContent;