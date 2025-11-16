// Utility functions for CSS handling

/**
 * Gets all necessary CSS styles for content, including base styles and component styles
 */
export const getStyles = (): string => {
  return `details.llm-better-view {
  border: 1px solid #aaa;
  border-radius: 4px;
  margin-bottom: 16px;
}

details[open].llm-better-view summary {
  border-bottom: 1px solid #aaa;
  margin-bottom: 0.5em;
}

.llm-better-view {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 10px;
  line-height: 1.6;
  box-sizing: border-box;
  max-width: 100%;
  margin: 0 auto;
  width: 100%;
}

.llm-better-view * {
  box-sizing: border-box;
}

.llm-better-view,
.llm-better-view * {
  /* Prevent overflow on all elements */
  max-width: 100%;
}

details.llm-better-view {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin: 16px 0;
  background: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Prevent content overflow */
}

.llm-better-view summary {
  font-weight: 600;
  padding: 12px 16px;
  cursor: pointer;
  background: #f9fafb;
  border-radius: 6px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  color: #1f2937;
  font-size: 1.6rem;
  transition: background-color 0.2s;
  word-break: break-word; /* Prevent long words from overflowing */
}

.llm-better-view summary:hover {
  background: #f3f4f6;
}

details[open].llm-better-view summary {
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0;
}

/* Container styles */
.llm-better-view .container {
  padding: 16px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* Prevent container overflow */
}

.llm-better-view .header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  padding: 0 16px;
  width: 100%;
  max-width: 100%;
  overflow-wrap: break-word; /* Handle long words */
}

.llm-better-view .header h1 {
  color: #111827;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  word-break: break-word; /* Prevent title overflow */
}

.llm-better-view .header p {
  color: #6b7280;
  font-size: 1.4rem;
  word-break: break-word; /* Prevent description overflow */
}

.llm-better-view .global-collapse-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: #e5e7eb;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.4rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s;
  font-weight: 500;
  flex-shrink: 0; /* Prevent button from shrinking */
}

.llm-better-view .global-collapse-btn:hover {
  background: #d1d5db;
}

.llm-better-view .section {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .section:last-child {
  margin-bottom: 0;
}

.llm-better-view .section-header {
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  width: 100%;
  max-width: 100%;
  word-break: break-word; /* Prevent header text overflow */
  font-size: 1.4rem;
}

.llm-better-view .section-header:hover {
  background: #f3f4f6;
}

.llm-better-view .section-title {
  font-weight: 600;
  font-size: 1.6rem;
  color: #111827;
  word-break: break-word; /* Prevent title overflow */
  flex-grow: 1; /* Allow title to take available space */
  margin-right: 8px;
}

.llm-better-view .section-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0; /* Prevent controls from shrinking */
}

.llm-better-view .expand-collapse-btn {
  background: #dbeafe;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.4rem;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: background-color 0.2s;
  font-weight: 500;
  white-space: nowrap; /* Prevent button text wrapping */
  flex-shrink: 0; /* Prevent button from shrinking */
}

.llm-better-view .expand-collapse-btn:hover {
  background: #bfdbfe;
}

.llm-better-view .expand-collapse-btn.tools {
  background: #f3e8ff;
  color: #7c3aed;
}

.llm-better-view .expand-collapse-btn.tools:hover {
  background: #e9d5ff;
}

.llm-better-view .toggle-icon {
  transition: transform 0.2s;
  color: #6b7280;
  font-size: 1.2rem;
  flex-shrink: 0; /* Prevent icon from shrinking */
}

.llm-better-view .toggle-icon.rotated {
  transform: rotate(180deg);
}

.llm-better-view .section-content {
  padding: 16px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* Prevent content overflow */
}

.llm-better-view .info-item {
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .info-item:last-child {
  border-bottom: none;
}

.llm-better-view .info-label {
  font-size: 1.4rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 140px;
  word-break: break-word; /* Prevent label overflow */
}

.llm-better-view .info-value {
  font-weight: 600;
  color: #111827;
  font-size: 1.4rem;
  text-align: right;
  word-break: break-word; /* Handle long values */
  max-width: 70%;
  overflow-wrap: break-word; /* Additional word breaking */
}

.llm-better-view .message-item,
.llm-better-view .tool-item {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* Prevent item overflow */
}

.llm-better-view .message-item:last-child,
.llm-better-view .tool-item:last-child {
  border-bottom: none;
}

.llm-better-view .message-header,
.llm-better-view .tool-header {
  padding: 8px 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 100%;
  word-break: break-word; /* Handle long header text */
  font-size: 1.4rem;
}

.llm-better-view .message-header:hover,
.llm-better-view .tool-header:hover {
  background: #f9fafb;
  margin: 0 -16px;
  padding: 8px 16px;
  border-radius: 4px;
  width: calc(100% + 32px); /* Account for negative margins */
  max-width: calc(100% + 32px);
}

.llm-better-view .role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0; /* Prevent badge from shrinking */
  white-space: nowrap; /* Prevent badge text wrapping */
}

.llm-better-view .role-user {
  background: #dbeafe;
  color: #1d4ed8;
}

.llm-better-view .role-assistant {
  background: #dcfce7;
  color: #166534;
}

.llm-better-view .role-system {
  background: #fef3c7;
  color: #92400e;
}

.llm-better-view .role-tool {
  background: #f3e8ff;
  color: #7c3aed;
}

.llm-better-view .tool-name-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: none;
  background: #f3e8ff;
  color: #7c3aed;
  font-family: "Monaco", "Menlo", monospace;
  word-break: break-word; /* Handle long tool names */
  max-width: 100%;
  overflow-wrap: break-word; /* Additional word breaking */
}

.llm-better-view .message-content,
.llm-better-view .tool-content {
  padding: 12px 0;
  font-size: 1.4rem;
  background-color: transparent;
  overflow-y: auto;
  width: 100%;
  max-width: 100%;
  word-break: break-word; /* Handle long content */
  overflow-wrap: break-word; /* Additional word breaking */
}

.llm-better-view .json-content {
  font-family: "Monaco", "Menlo", monospace;
  background: #1f2937;
  color: #f9fafb;
  padding: 16px;
  border-radius: 6px;
  font-size: 1.2rem;
  white-space: pre-wrap;
  overflow-x: auto; /* Allow horizontal scrolling for long lines */
  margin: 8px 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.llm-better-view .usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .usage-item {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 100%;
  word-break: break-word; /* Handle long usage values */
}

.llm-better-view .usage-label {
  font-size: 1.4rem;
  color: #6b7280;
  margin-bottom: 4px;
  word-break: break-word; /* Prevent label overflow */
}

.llm-better-view .usage-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  word-break: break-word; /* Handle long values */
}

.llm-better-view .choice-item {
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .choice-header {
  background: #f9fafb;
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  width: 100%;
  text-align: left;
  word-break: break-word; /* Handle long header text */
  font-size: 1.4rem;
}

.llm-better-view .choice-header:hover {
  background: #f3f4f6;
}

.llm-better-view .choice-badge {
  background: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1.2rem;
  font-weight: 600;
  flex-shrink: 0; /* Prevent badge from shrinking */
  white-space: nowrap; /* Prevent badge text wrapping */
}

.llm-better-view .choice-content {
  padding: 16px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* Prevent content overflow */
}

.llm-better-view .choice-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 1.4rem;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .choice-meta-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  min-width: 0; /* Allow flex items to shrink below content size */
}

.llm-better-view .choice-meta-item span:first-child {
  font-weight: 600;
  color: #374151;
  word-break: break-word; /* Handle long labels */
}

/* GitHub-style Markdown prose */
.llm-better-view .prose {
  line-height: 1.7;
  color: #374151;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* Prevent prose overflow */
  word-break: break-word; /* Handle long words */
  overflow-wrap: break-word; /* Additional word breaking */
  font-size: 1.4rem;
}

.llm-better-view .prose h1,
.llm-better-view .prose h2,
.llm-better-view .prose h3,
.llm-better-view .prose h4,
.llm-better-view .prose h5,
.llm-better-view .prose h6 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 700;
  line-height: 1.25;
  color: #111827;
  word-break: break-word; /* Handle long headers */
  max-width: 100%;
}

.llm-better-view .prose h1 {
  font-size: 2em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.llm-better-view .prose h2 {
  font-size: 1.8em;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.llm-better-view .prose h3 {
  font-size: 1.6em;
}

.llm-better-view .prose h4 {
  font-size: 1.4rem;
}

.llm-better-view .prose h5 {
  font-size: 1.2rem;
}

.llm-better-view .prose h6 {
  font-size: 1.1em;
  color: #6b7280;
}

.llm-better-view .prose p {
  margin-top: 0;
  margin-bottom: 1em;
  word-break: break-word; /* Handle long paragraphs */
  max-width: 100%;
  font-size: 1.4rem;
}

.llm-better-view .prose ul,
.llm-better-view .prose ol {
  margin-top: 0;
  margin-bottom: 1em;
  padding-left: 1.75em;
  width: 100%;
  max-width: 100%;
  word-break: break-word; /* Handle long list items */
}

.llm-better-view .prose li {
  margin-bottom: 0.25em;
  word-break: break-word; /* Handle long list items */
}

.llm-better-view .prose blockquote {
  margin: 16px 0;
  padding: 0 16px;
  color: #6b7280;
  border-left: 4px solid #d1d5db;
  font-style: italic;
  width: 100%;
  max-width: 100%;
  word-break: break-word; /* Handle long quotes */
}

.llm-better-view .prose code {
  background: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.375em;
  font-size: 1.1em;
  font-family: "Monaco", "Menlo", "Consolas", monospace;
  word-break: break-word; /* Handle long inline code */
  overflow-wrap: break-word; /* Additional word breaking */
}

.llm-better-view .prose pre {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto; /* Allow horizontal scrolling */
  margin: 1rem 0;
  border: 1px solid #d1d5db;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.llm-better-view .prose pre code {
  background: none;
  padding: 0;
  word-break: normal; /* Allow normal breaking in code blocks */
  white-space: pre; /* Preserve whitespace in code blocks */
}

/* Style for plain text content preserving whitespace */
.llm-better-view .prose pre.text-content {
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  border: none;
  margin: 0;
  overflow-x: visible;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.llm-better-view .prose a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  word-break: break-word; /* Handle long URLs */
}

.llm-better-view .prose a:hover {
  text-decoration: underline;
}

.llm-better-view .prose strong {
  font-weight: 700;
}

.llm-better-view .prose em {
  font-style: italic;
}

.llm-better-view .prose table {
  border-collapse: collapse;
  margin: 16px 0;
  width: 100%;
  max-width: 100%;
  overflow-x: auto; /* Allow horizontal scrolling */
  display: block; /* Enable scrolling */
  box-sizing: border-box;
}

.llm-better-view .prose th,
.llm-better-view .prose td {
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  text-align: left;
  word-break: break-word; /* Handle long cell content */
}

.llm-better-view .prose th {
  background: #f9fafb;
  font-weight: 600;
}

.llm-better-view .tool-description {
  margin: 8px 0;
  font-size: 1.5rem;
  color: #374151;
  word-break: break-word; /* Handle long descriptions */
}

.llm-better-view .tool-call-name {
  font-weight: 700;
  color: #111827;
  font-size: 1.5rem;
  margin-bottom: 8px;
  word-break: break-word; /* Handle long tool names */
}

.llm-better-view .tool-parameters {
  margin-top: 12px;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .tool-parameters-title {
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
  font-size: 1.3rem;
  word-break: break-word; /* Handle long titles */
}

.llm-better-view .parameter-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 4px solid #3b82f6;
  width: 100%;
  max-width: 100%;
  word-break: break-word; /* Handle long parameter content */
}

.llm-better-view .parameter-name {
  font-weight: 700;
  font-size: 1.4rem;
  color: #111827;
  font-family: "Monaco", "Menlo", monospace;
  margin-bottom: 4px;
  word-break: break-word; /* Handle long parameter names */
}

.llm-better-view .parameter-type {
  font-size: 1.1rem;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  flex-shrink: 0; /* Prevent type badge from shrinking */
  white-space: nowrap; /* Prevent type text wrapping */
}

.llm-better-view .parameter-required {
  font-size: 1rem;
  color: #dc2626;
  background: #fef2f2;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
  flex-shrink: 0; /* Prevent required badge from shrinking */
  white-space: nowrap; /* Prevent required text wrapping */
}

.llm-better-view .parameter-description {
  font-size: 1.3rem;
  color: #6b7280;
  margin-top: 4px;
  word-break: break-word; /* Handle long descriptions */
}

.llm-better-view .empty-state {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 48px 24px;
  width: 100%;
  max-width: 100%;
  word-break: break-word; /* Handle long empty state messages */
}

/* SVG Icons */
.llm-better-view .icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
  flex-shrink: 0; /* Prevent icons from shrinking */
}

.llm-better-view .event-badge {
  position: absolute;
  top: 16px;
  right: 24px;
  background: #4f46e5;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  flex-shrink: 0; /* Prevent badge from shrinking */
}

.llm-better-view .content {
  padding: 0;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .finish-reason-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  flex-shrink: 0; /* Prevent badge from shrinking */
  white-space: nowrap; /* Prevent badge text wrapping */
}

.llm-better-view .finish-stop {
  background: #dcfce7;
  color: #166534;
}

.llm-better-view .finish-length {
  background: #fef3c7;
  color: #92400e;
}

.llm-better-view .finish-tool-calls {
  background: #dbeafe;
  color: #1e40af;
}

.llm-better-view .finish-content-filter {
  background: #fecaca;
  color: #991b1b;
}

.llm-better-view .content-section {
  margin-bottom: 20px;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .content-section h4 {
  margin-bottom: 12px;
  font-size: 1.4rem;
  color: #111827;
  font-weight: 600;
  word-break: break-word; /* Handle long section titles */
}

.llm-better-view .tool-calls-container {
  margin-top: 12px;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .tool-calls-container h4 {
  margin-bottom: 12px;
  font-size: 1rem;
  color: #111827;
  font-weight: 600;
  word-break: break-word; /* Handle long container titles */
}

.llm-better-view .tool-call-item {
  border-radius: 6px;
  margin-bottom: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .tool-call-header {
  background: #fafafa;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  width: 100%;
  text-align: left;
  word-break: break-word; /* Handle long header text */
  font-size: 1.4rem;
}

.llm-better-view .tool-call-header:hover {
  background: #f5f5f5;
}

.llm-better-view .tool-call-id {
  font-size: 1.2rem;
  color: #6b7280;
  word-break: break-word; /* Handle long IDs */
}

.llm-better-view .tool-call-content {
  padding: 12px 16px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* Prevent content overflow */
}

.llm-better-view .events-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .event-item {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.llm-better-view .event-header {
  background: #f9fafb;
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  width: 100%;
  text-align: left;
  word-break: break-word; /* Handle long header text */
  font-size: 1.4rem;
}

.llm-better-view .event-header:hover {
  background: #f3f4f6;
}

.llm-better-view .event-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap; /* Allow meta items to wrap */
}

.llm-better-view .event-type-badge {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  flex-shrink: 0; /* Prevent badge from shrinking */
  white-space: nowrap; /* Prevent badge text wrapping */
}

.llm-better-view .event-timestamp {
  font-size: 1.2rem;
  color: #6b7280;
  font-family: 'Monaco', 'Menlo', monospace;
  word-break: break-word; /* Handle long timestamps */
}

.llm-better-view .event-content {
  padding: 16px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* Prevent content overflow */
}

/* Utility classes for inline styles */
.llm-better-view .flex-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.llm-better-view .text-small {
  font-size: 1.3rem; /* Adjusted for 10px base font */
  color: #1e293b;
}

.llm-better-view .margin-bottom-sm {
  margin-bottom: 8px;
}

.llm-better-view .margin-top-md {
  margin-top: 12px;
}

.llm-better-view [data-content-type="anthropic"] {
  margin: 16px 0;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #fed7aa;
  background: #fffbeb;
  width: 100%;
  max-width: 100%;
  word-break: break-word; /* Handle long anthropic content */
}
`;
};

/**
 * Wraps HTML content in a complete HTML document with embedded CSS
 */
export const wrapHtmlWithStyles = (html: string): string => {
  const cssText = getStyles();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssText}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
};