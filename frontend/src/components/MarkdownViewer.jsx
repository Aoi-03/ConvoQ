import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Rich Markdown Viewer component for ConvoQ agent responses.
 * Renders GitHub Flavored Markdown (headers, lists, bolding, blockquotes)
 * with custom warm palette styling and interactive [Ref X] citation pills.
 */
export default function MarkdownViewer({ content, onOpenCitation }) {
  if (!content) return null;

  return (
    <div className="markdown-viewer text-[#150e0f] text-sm leading-relaxed space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-lg md:text-xl font-bold text-[#150e0f] pb-1.5 border-b border-[#e8dfe2] mt-4 mb-2 flex items-center gap-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-base md:text-lg font-bold text-[#9b6d77] mt-4 mb-1.5 flex items-center gap-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-sm md:text-base font-bold text-[#3a6357] mt-3 mb-1" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xs md:text-sm font-bold text-[#6f5e63] uppercase tracking-wider mt-2 mb-1" {...props} />
          ),
          p: ({ node, children, ...props }) => {
            // Process children to find [Ref X] pattern and render as interactive badge
            return (
              <p className="text-xs md:text-sm text-[#2a1d20] leading-relaxed my-1.5" {...props}>
                {renderChildrenWithCitations(children, onOpenCitation)}
              </p>
            );
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside pl-5 space-y-1.5 my-2 text-xs md:text-sm text-[#2a1d20]" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside pl-5 space-y-1.5 my-2 text-xs md:text-sm text-[#2a1d20]" {...props} />
          ),
          li: ({ node, children, ...props }) => (
            <li className="leading-relaxed pl-1" {...props}>
              {renderChildrenWithCitations(children, onOpenCitation)}
            </li>
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-[#150e0f] text-inherit" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-[#4d3f43]" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-[#9b6d77] bg-[#fcfafb] pl-3.5 pr-3 py-2 rounded-r-xl my-2 text-xs md:text-sm text-[#5e4f53] italic shadow-xs"
              {...props}
            />
          ),
          code: ({ node, inline, ...props }) => (
            <code
              className="px-1.5 py-0.5 rounded bg-[#f4ecee] text-[#9b6d77] font-mono text-xs font-semibold"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-4 border-[#e8dfe2]" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Transforms string children containing "[Ref X]" into clickable badge components
 */
function renderChildrenWithCitations(children, onOpenCitation) {
  if (!children) return null;

  return React.Children.map(children, (child) => {
    if (typeof child !== 'string') return child;

    // Match citations like [Ref 1], [Ref 2], [Ref 1, 2]
    const regex = /\[Ref\s*([\d,\s]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(child)) !== null) {
      if (match.index > lastIndex) {
        parts.push(child.substring(lastIndex, match.index));
      }

      const refId = `Ref ${match[1].trim()}`;
      parts.push(
        <button
          key={`ref-${match.index}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenCitation) onOpenCitation(refId);
          }}
          className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md bg-[#f4ecee] hover:bg-[#ebdada] text-[#9b6d77] border border-[#9b6d77]/30 text-[11px] font-bold font-mono transition cursor-pointer hover:scale-105 transform active:scale-95 shadow-2xs"
          title={`Click to view verified evidence message ${refId}`}
        >
          <span>📜</span>
          <span>{refId}</span>
        </button>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < child.length) {
      parts.push(child.substring(lastIndex));
    }

    return parts.length > 0 ? parts : child;
  });
}
