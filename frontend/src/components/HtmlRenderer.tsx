'use client';

import MarkdownRenderer from '@/components/MarkdownRenderer';

interface HtmlRendererProps {
  html: string;
  className?: string;
}

export default function HtmlRenderer({ html, className = '' }: HtmlRendererProps) {
  return <MarkdownRenderer content={html} className={className} />;
}
