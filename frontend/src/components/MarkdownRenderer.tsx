'use client';

import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ReactNode } from 'react';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ node, ...props }: any) => (
            <h1 className="text-2xl font-bold mt-6 mb-3 text-slate-900" {...props} />
          ),
          h2: ({ node, ...props }: any) => (
            <h2 className="text-xl font-bold mt-5 mb-2 text-slate-800" {...props} />
          ),
          h3: ({ node, ...props }: any) => (
            <h3 className="text-lg font-bold mt-4 mb-2 text-slate-800" {...props} />
          ),
          h4: ({ node, ...props }: any) => (
            <h4 className="text-base font-bold mt-3 mb-2 text-slate-800" {...props} />
          ),
          p: ({ node, ...props }: any) => (
            <p className="text-slate-700 text-base leading-relaxed mb-3" {...props} />
          ),
          ul: ({ node, ...props }: any) => (
            <ul className="list-disc list-outside mb-3 ml-6 pl-2 text-slate-700" {...props} />
          ),
          ol: ({ node, ...props }: any) => (
            <ol className="list-decimal list-outside mb-3 ml-6 pl-2 text-slate-700" {...props} />
          ),
          li: ({ node, ...props }: any) => (
            <li className="mb-1 pl-1" {...props} />
          ),
          code: ({ node, inline, ...props }: any) => (
            inline ? (
              <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-slate-800" {...props} />
            ) : (
              <code {...props} />
            )
          ),
          pre: ({ node, ...props }: any) => (
            <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto mb-3 text-sm font-mono" {...props} />
          ),
          blockquote: ({ node, ...props }: any) => (
            <blockquote className="border-l-4 border-slate-300 pl-4 py-2 mb-3 italic text-slate-600" {...props} />
          ),
          a: ({ node, ...props }: any) => (
            <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
          ),
          table: ({ node, ...props }: any) => (
            <table className="w-full border-collapse mb-3" {...props} />
          ),
          thead: ({ node, ...props }: any) => (
            <thead className="bg-slate-100" {...props} />
          ),
          tbody: ({ node, ...props }: any) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }: any) => (
            <tr className="border-b border-slate-200" {...props} />
          ),
          td: ({ node, ...props }: any) => (
            <td className="border border-slate-200 px-3 py-2 text-slate-700" {...props} />
          ),
          th: ({ node, ...props }: any) => (
            <th className="border border-slate-200 px-3 py-2 bg-slate-100 font-semibold text-slate-800 text-left" {...props} />
          ),
          img: ({ node, ...props }: any) => (
            <img className="max-w-full h-auto rounded-lg my-3" {...props} />
          ),
          hr: ({ node, ...props }: any) => (
            <hr className="border-slate-300 my-4" {...props} />
          ),
          strong: ({ node, ...props }: any) => (
            <strong className="!font-bold !text-slate-900" style={{ fontWeight: 700 }} {...props} />
          ),
          em: ({ node, ...props }: any) => (
            <em className="!italic !text-slate-700" style={{ fontStyle: 'italic' }} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
