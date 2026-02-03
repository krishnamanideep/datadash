'use client';

import { useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Eraser } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Enter text...', minHeight = '100px' }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex gap-1 p-2 bg-gray-50 border-b">
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
        [contentEditable] ul,
        [contentEditable] ol {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        [contentEditable] li {
          margin-bottom: 0.25rem;
        }
        [contentEditable] strong {
          font-weight: 700;
        }
        [contentEditable] em {
          font-style: italic;
        }
      `}</style>
        </div>
    );
}
