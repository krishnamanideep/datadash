'use client';

import { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Eraser, Heading1, Heading2, Heading3 } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

// Comprehensive HTML cleaning function
const cleanHTML = (html: string): string => {
    if (!html) return '';

    // Remove all inline styles
    let cleaned = html.replace(/\s*style="[^"]*"/gi, '');

    // Remove all class attributes
    cleaned = cleaned.replace(/\s*class="[^"]*"/gi, '');

    // Remove all id attributes except specific ones
    cleaned = cleaned.replace(/\s*id="[^"]*"/gi, '');

    // Remove dir attributes
    cleaned = cleaned.replace(/\s*dir="[^"]*"/gi, '');

    // Remove aria attributes
    cleaned = cleaned.replace(/\s*aria-[^=]*="[^"]*"/gi, '');

    // Remove data attributes
    cleaned = cleaned.replace(/\s*data-[^=]*="[^"]*"/gi, '');

    // Remove span tags (keep content)
    cleaned = cleaned.replace(/<span[^>]*>/gi, '');
    cleaned = cleaned.replace(/<\/span>/gi, '');

    // Convert divs to paragraphs
    cleaned = cleaned.replace(/<div>/gi, '<p>');
    cleaned = cleaned.replace(/<\/div>/gi, '</p>');

    // Remove empty paragraphs
    cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');

    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
};

export default function RichTextEditor({ value, onChange, placeholder = 'Enter text...', minHeight = '100px' }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current) {
            const cleanedValue = cleanHTML(value);
            if (editorRef.current.innerHTML !== cleanedValue) {
                editorRef.current.innerHTML = cleanedValue;
            }
        }
    }, [value]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const handleInput = () => {
        if (editorRef.current) {
            const cleaned = cleanHTML(editorRef.current.innerHTML);
            onChange(cleaned);
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex gap-1 p-2 bg-gray-50 border-b flex-wrap">
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('underline')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Underline"
                >
                    <Underline size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('strikeThrough')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Strikethrough"
                >
                    <Strikethrough size={16} />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Bullet List"
                >
                    <List size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('insertOrderedList')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Numbered List"
                >
                    <ListOrdered size={16} />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'h1')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Heading 1"
                >
                    <Heading1 size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'h2')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Heading 2"
                >
                    <Heading2 size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('formatBlock', 'h3')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Heading 3"
                >
                    <Heading3 size={16} />
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button
                    type="button"
                    onClick={() => execCommand('insertParagraph')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors text-xs font-bold"
                    title="New Paragraph"
                >
                    ¶
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('insertLineBreak')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors text-xs font-bold"
                    title="Line Break"
                >
                    ↵
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button
                    type="button"
                    onClick={() => execCommand('removeFormat')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Clear Formatting"
                >
                    <Eraser size={16} />
                </button>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="p-3 outline-none overflow-auto"
                style={{ minHeight }}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            <style jsx>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contentEditable] {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        [contentEditable] ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        [contentEditable] ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        [contentEditable] li {
          margin-bottom: 0.25rem;
        }
        [contentEditable] p {
          margin-bottom: 0.75rem;
        }
        [contentEditable] p:last-child {
          margin-bottom: 0;
        }
        [contentEditable] strong {
          font-weight: 700;
        }
        [contentEditable] em {
          font-style: italic;
        }
        [contentEditable] u {
          text-decoration: underline;
        }
        [contentEditable] strike,
        [contentEditable] s {
          text-decoration: line-through;
        }
        [contentEditable] h1 {
          font-size: 2em;
          font-weight: 700;
          margin-bottom: 0.5rem;
          margin-top: 0.5rem;
        }
        [contentEditable] h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin-bottom: 0.4rem;
          margin-top: 0.4rem;
        }
        [contentEditable] h3 {
          font-size: 1.25em;
          font-weight: 700;
          margin-bottom: 0.3rem;
          margin-top: 0.3rem;
        }
        [contentEditable] br {
          display: block;
          content: "";
          margin-top: 0.25rem;
        }
      `}</style>
        </div>
    );
}
