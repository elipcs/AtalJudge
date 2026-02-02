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
                        padding: "10px", // Base padding
                        paddingLeft: "60px", // Total left padding (LineNumWidth + Gap + BasePadding) -> 40px + 10px + 10px = 60px
                        minHeight,
                        height: "100%",
                        background: "#1e1e1e",
                        fontSize: "14px",
                        lineHeight: "24px",
                        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
                        letterSpacing: "normal",
                        fontVariantLigatures: "none",
                        opacity: isPlaceholder ? 0.5 : 1,
                    }}
                    showLineNumbers
                    lineNumberStyle={{
                        minWidth: "40px", // Fixed pixel width
                        paddingRight: "10px", // Fixed pixel gap
                        color: "#64748b",
                        userSelect: "none",
                        textAlign: "right",
                        marginRight: "10px", // IMPORTANT: SyntaxHighlighter often adds margin to line numbers
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
                    padding: "10px", // Base padding
                    paddingLeft: "60px", // MUST MATCH SyntaxHighlighter total paddingLeft exactly
                    fontSize: "14px",
                    lineHeight: "24px",
                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
                    letterSpacing: "normal",
                    fontVariantLigatures: "none",
                    whiteSpace: "pre",
                    overflow: "auto",
                }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
            />
        </div>
    );
}
