"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`prose-custom max-w-none text-secondary-800 break-words leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-2xl sm:text-3xl font-black text-secondary-950 mt-8 mb-4 tracking-tight border-b border-secondary-100 pb-2">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl sm:text-3xl font-black text-secondary-950 mt-8 mb-4 tracking-tight border-b border-secondary-100 pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl sm:text-2xl font-bold text-secondary-900 mt-6 mb-3 tracking-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-bold text-secondary-900 mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-secondary-700 leading-relaxed text-sm sm:text-base my-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 text-secondary-700 my-4 text-sm sm:text-base marker:text-primary-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 text-secondary-700 my-4 text-sm sm:text-base marker:text-primary-600 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 text-secondary-700">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-secondary-950">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-secondary-800">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-500 bg-primary-50/50 rounded-r-2xl py-3 px-5 my-6 italic text-secondary-800 text-sm sm:text-base">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline font-semibold transition"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse border border-secondary-200 text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-secondary-100 text-secondary-900 font-bold p-3 border border-secondary-200 text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-3 border border-secondary-200 text-secondary-700">
              {children}
            </td>
          ),
          code: ({ children }) => (
            <code className="bg-secondary-100 text-secondary-900 px-1.5 py-0.5 rounded font-mono text-xs">
              {children}
            </code>
          ),
          hr: () => (
            <hr className="my-8 border-secondary-200" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
