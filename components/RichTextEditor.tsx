'use client'

import { useEffect, useRef, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML
    onChange(content)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  useEffect(() => {
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = value
    }
  }, [value, isEditing])

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-2 flex flex-wrap gap-1 bg-gray-50">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200 font-bold"
          title="Fett"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200 italic"
          title="Kursiv"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200 underline"
          title="Unterstrichen"
        >
          U
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Aufzählung"
        >
          • Liste
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Nummerierte Liste"
        >
          1. Liste
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'h3')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200 font-bold"
          title="Überschrift"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'h4')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200 font-semibold"
          title="Unterüberschrift"
        >
          H4
        </button>
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'p')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Absatz"
        >
          P
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => formatText('indent')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Einrücken"
        >
          →
        </button>
        <button
          type="button"
          onClick={() => formatText('outdent')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Ausrücken"
        >
          ←
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => {
            const code = prompt('Code eingeben:')
            if (code) {
              formatText('insertHTML', `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">${code}</code>`)
            }
          }}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200 font-mono"
          title="Code"
        >
          &lt;/&gt;
        </button>
        
        <button
          type="button"
          onClick={() => {
            const url = prompt('Link URL eingeben:')
            if (url) {
              formatText('createLink', url)
            }
          }}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Link"
        >
          🔗
        </button>
        
        <div className="w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={() => formatText('removeFormat')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200 text-red-600"
          title="Formatierung entfernen"
        >
          ✕
        </button>
      </div>
      
      {/* Editor Container */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className="p-3 min-h-[200px] focus:outline-none prose max-w-none"
          style={{ whiteSpace: 'pre-wrap' }}
          suppressContentEditableWarning={true}
        />
        
        {/* Placeholder */}
        {!value && placeholder && (
          <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
      
      {/* Hilfetext */}
      <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500 bg-gray-50">
        <strong>Tipp:</strong> Verwenden Sie die Toolbar-Buttons für Formatierung. 
        Für Code-Blöcke verwenden Sie den &lt;/&gt; Button.
      </div>
    </div>
  )
}