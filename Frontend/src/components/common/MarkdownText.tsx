import React from 'react';

interface MarkdownTextProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, isUser = false }) => {
  if (!content) return null;

  // Split into paragraphs / sections by double newline
  const blocks = content.split(/\n\n+/);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();

        // 1. Headings (### or ## or #)
        if (trimmed.startsWith('#')) {
          const level = (trimmed.match(/^#+/) || ['#'])[0].length;
          const text = trimmed.replace(/^#+\s*/, '');
          const fontSize = level === 1 ? '1.15rem' : level === 2 ? '1.05rem' : '0.98rem';
          return (
            <h4
              key={bIdx}
              style={{
                fontSize,
                fontWeight: 800,
                marginTop: bIdx === 0 ? '0' : '8px',
                marginBottom: '4px',
                color: isUser ? 'white' : '#0f172a',
                lineHeight: '1.3'
              }}
            >
              {parseInlineMarkdown(text, isUser)}
            </h4>
          );
        }

        // 2. Code Blocks (```code```)
        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const codeContent = trimmed.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
          return (
            <pre
              key={bIdx}
              style={{
                backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : '#f1f5f9',
                color: isUser ? 'white' : '#0f172a',
                padding: '12px 16px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '0.84rem',
                overflowX: 'auto',
                margin: '4px 0'
              }}
            >
              <code>{codeContent}</code>
            </pre>
          );
        }

        // 3. Markdown Tables (| Header | Header |)
        const tableLines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
        const isTable = tableLines.length >= 2 && tableLines[0].startsWith('|') && tableLines[0].endsWith('|');
        if (isTable) {
          const headers = tableLines[0].split('|').map(s => s.trim()).filter(Boolean);
          const bodyRows = tableLines.slice(1).filter(row => !row.includes('---')).map(row => 
            row.split('|').map(s => s.trim()).filter(Boolean)
          );

          return (
            <div key={bIdx} style={{ overflowX: 'auto', margin: '8px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <thead>
                  <tr style={{ backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800 }}>
                        {parseInlineMarkdown(h, isUser)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '8px 12px' }}>
                          {parseInlineMarkdown(cell, isUser)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // 4. Bullet Lists (- or * or 1.)
        const lines = trimmed.split('\n');
        const isBulletList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s/.test(l.trim()));
        if (isBulletList && lines.length > 0) {
          return (
            <ul
              key={bIdx}
              style={{
                margin: '4px 0 4px 18px',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                listStyleType: 'disc'
              }}
            >
              {lines.map((line, lIdx) => {
                const itemText = line.trim().replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
                return (
                  <li key={lIdx} style={{ lineHeight: '1.55', fontSize: '0.88rem' }}>
                    {parseInlineMarkdown(itemText, isUser)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // 5. Blockquotes (> text)
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/, '');
          return (
            <blockquote
              key={bIdx}
              style={{
                borderLeft: isUser ? '3px solid white' : '3px solid var(--primary)',
                paddingLeft: '12px',
                margin: '4px 0',
                fontStyle: 'italic',
                opacity: 0.9,
                fontSize: '0.86rem'
              }}
            >
              {parseInlineMarkdown(quoteText, isUser)}
            </blockquote>
          );
        }

        // 6. Standard Paragraph
        return (
          <p key={bIdx} style={{ margin: 0, lineHeight: '1.6', fontSize: '0.88rem' }}>
            {parseInlineMarkdown(trimmed, isUser)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parse inline **bold**, *italic*, and `code` formatting
 */
function parseInlineMarkdown(text: string, isUser: boolean): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(.*?)\*\*(.*?)\*\*(.*)/s);
    const codeMatch = remaining.match(/^(.*?)`(.*?)`(.*)/s);

    if (boldMatch && (!codeMatch || boldMatch[1].length <= codeMatch[1].length)) {
      if (boldMatch[1]) parts.push(boldMatch[1]);
      parts.push(
        <strong key={`b_${keyIdx++}`} style={{ fontWeight: 800 }}>
          {boldMatch[2]}
        </strong>
      );
      remaining = boldMatch[3];
    } else if (codeMatch) {
      if (codeMatch[1]) parts.push(codeMatch[1]);
      parts.push(
        <code
          key={`c_${keyIdx++}`}
          style={{
            backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
            color: isUser ? 'white' : '#0f172a',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.82rem'
          }}
        >
          {codeMatch[2]}
        </code>
      );
      remaining = codeMatch[3];
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts;
}
