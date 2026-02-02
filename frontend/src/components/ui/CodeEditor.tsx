"use client";

import { useState, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: "python" | "java";
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

export default function CodeEditor({
    value,
    onChange,
    language,
    placeholder = "# Escreva seu código aqui...",
    className = "",
    minHeight = "300px",
}: CodeEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newValue = value.substring(0, start) + "    " + value.substring(end);
                onChange(newValue);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 4;
                }, 0);
            }
        }
    };

    const handleScroll = () => {
        if (textareaRef.current && preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Show placeholder as code when empty
    const displayCode = value || placeholder;
    const isPlaceholder = !value;

    return (
        <div
            className={`relative rounded-xl overflow-hidden ${isFocused ? "ring-2 ring-blue-500" : ""} ${className}`}
            style={{ minHeight, backgroundColor: "#1e1e1e" }}
        >
            {/* Syntax highlighted layer */}
            <pre
                ref={preRef}
                className="absolute inset-0 overflow-auto pointer-events-none m-0"
                style={{ minHeight }}
            >
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: "16px",
                        paddingLeft: "56px",
                        minHeight,
                        height: "100%",
                        background: "#1e1e1e",
                        fontSize: "14px",
                        lineHeight: "24px", // Fixed line height for better alignment
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
                        opacity: isPlaceholder ? 0.5 : 1,
                    }}
                    showLineNumbers
                    lineNumberStyle={{
                        minWidth: "3em", // Fixed width for line numbers
                        paddingRight: "1em",
                        color: "#64748b",
                        userSelect: "none",
                        textAlign: "right",
                    }}
                >
                    {displayCode}
                </SyntaxHighlighter>
            </pre>

            {/* Editable textarea (invisible text, visible caret) */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-blue-400 outline-none p-0 m-0 border-0"
                style={{
                    minHeight,
                    padding: "16px",
                    paddingLeft: "calc(3em + 1em + 16px)", // Match SyntaxHighlighter padding + line number width
                    fontSize: "14px",
                    lineHeight: "24px", // Fixed line height MUST match above
                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
                    whiteSpace: "pre", // Critical for alignment
                    overflow: "auto", // Match scrolling behavior
                }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
            />
        </div>
    );
}
