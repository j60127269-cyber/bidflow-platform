'use client'

import { useState } from 'react';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export default function TruncatedText({ text, maxLength = 150, className = '' }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  const truncatedText = text.substring(0, maxLength);
  const remainingText = text.substring(maxLength);

  return (
    <span className={className}>
      {isExpanded ? (
        <>
          {text}
          <button
            onClick={() => setIsExpanded(false)}
            className="ml-1 text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Show Less
          </button>
        </>
      ) : (
        <>
          {truncatedText}...
          <button
            onClick={() => setIsExpanded(true)}
            className="ml-1 text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            Read More
          </button>
        </>
      )}
    </span>
  );
}
