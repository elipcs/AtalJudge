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
    const lineNumbersRef = useRef<HTMLDivElement>(null);
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
        if (textareaRef.current) {
            const { scrollTop, scrollLeft } = textareaRef.current;
            // Sync Highlighter
            if (preRef.current) {
                preRef.current.scrollTop = scrollTop;
                preRef.current.scrollLeft = scrollLeft;
            }
            // Sync Line Numbers (Vertical only)
            if (lineNumbersRef.current) {
                lineNumbersRef.current.scrollTop = scrollTop;
            }
        }
    };

    // Show placeholder as code when empty
    const displayCode = value || placeholder;
    const isPlaceholder = !value;

    // Generate line numbers
    const lineCount = (value || "").split("\n").length;
    const lines = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

    const fontStyle = {
        fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
        fontSize: "14px",
        lineHeight: "24px",
        letterSpacing: "normal",
        fontVariantLigatures: "none",
        fontWeight: "400", // Critical for cursor alignment
    };

    // Layout configuration
    const LINE_NUMBER_WIDTH = 50;
    const GAP = 10;
    const PADDING_LEFT = 10;
    const TOTAL_PADDING_LEFT = PADDING_LEFT; // Editor area starts after the sidebar

    return (
        <div
            className={`relative flex rounded-xl overflow-hidden ${isFocused ? "ring-2 ring-blue-500" : ""} ${className}`}
            style={{ minHeight, backgroundColor: "#1e1e1e" }}
        >
            {/* Line Numbers Sidebar */}
            <div
                ref={lineNumbersRef}
                className="flex-none flex flex-col items-end text-right text-gray-500 select-none overflow-hidden bg-[#1e1e1e] border-r border-gray-800"
                style={{
                    width: `${LINE_NUMBER_WIDTH}px`,
                    paddingRight: `${GAP}px`,
                    paddingTop: "10px", // Match editor padding
                    ...fontStyle
                }}
            >
                {lines.map((n) => (
                    <div key={n} style={{ height: "24px" }}>{n}</div>
                ))}
            </div>

            {/* Editor Area Container */}
            <div className="relative flex-1 bg-[#1e1e1e] overflow-hidden">
                {/* Syntax highlighted layer */}
                <pre
                    ref={preRef}
                    className="absolute inset-0 overflow-auto pointer-events-none m-0 scrollbar-hide"
                    style={{
                        margin: 0,
                        // Hide scrollbars for the pre layer since textarea handles scrolling
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    <SyntaxHighlighter
                        language={language}
                        style={vscDarkPlus}
                        customStyle={{
                            margin: 0,
                            padding: "10px", // Base padding
                            paddingLeft: `${TOTAL_PADDING_LEFT}px`,
                            minHeight: "100%",
                            background: "transparent", // Transparent to show dark bg
                            overflow: "hidden", // Let pre handle overflow
                            opacity: isPlaceholder ? 0.5 : 1,
                            ...fontStyle
                        }}
                        showLineNumbers={false} // Disable internal line numbers
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
                        padding: "10px", // Base padding
                        paddingLeft: `${TOTAL_PADDING_LEFT}px`,
                        whiteSpace: "pre",
                        overflow: "auto",
                        ...fontStyle
                    }}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                />
            </div>
        </div>
    );
}
