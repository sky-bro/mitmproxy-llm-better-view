import React from 'react';
import { formatTextWithLineBreaks } from '../../utils';

export const JsonContent: React.FC<{jsonObj: any}> = ({
  jsonObj
}) => {
  if (!jsonObj) return null;
  if (typeof jsonObj === 'object') {
    return <pre className="json-content">{JSON.stringify(jsonObj, null, 2)}</pre>
  }

  return formatTextWithLineBreaks(String(jsonObj));
};

export default JsonContent;