'use client'

import { useEffect, useRef, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  darkMode?: boolean
}

export default function RichTextEditor({ value, onChange, placeholder, className = '', darkMode = false }: RichTextEditorProps) {
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

  const buttonClass = darkMode 
    ? 'px-2 py-1 text-sm border border-white/20 text-white hover:bg-white/10 rounded'
    : 'px-2 py-1 text-sm border border-gray-300 hover:bg-gray-200 rounded'

  const toolbarClass = darkMode
    ? 'border-b border-white/10 bg-black/40 p-2 flex flex-wrap gap-1'
    : 'border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1'

  const containerClass = darkMode
    ? `border border-white/20 rounded-md ${className}`
    : `border border-gray-300 rounded-md ${className}`

  const editorClass = darkMode
    ? 'p-3 min-h-[200px] focus:outline-none prose max-w-none text-white bg-transparent'
    : 'p-3 min-h-[200px] focus:outline-none prose max-w-none'

  const placeholderClass = darkMode
    ? 'absolute top-3 left-3 text-white/40 pointer-events-none'
    : 'absolute top-3 left-3 text-gray-400 pointer-events-none'

  const helpClass = darkMode
    ? 'border-t border-white/10 px-3 py-2 text-xs text-white/60 bg-black/20'
    : 'border-t border-gray-200 px-3 py-2 text-xs text-gray-500 bg-gray-50'

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className={toolbarClass}>
        <button
          type="button"
          onClick={() => formatText('bold')}
          className={`${buttonClass} font-bold`}
          title="Fett"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className={`${buttonClass} italic`}
          title="Kursiv"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className={`${buttonClass} underline`}
          title="Unterstrichen"
        >
          U
        </button>
        
        <div className={`w-px mx-1 ${darkMode ? 'bg-white/20' : 'bg-gray-300'}`}></div>
        
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className={buttonClass}
          title="Aufzählung"
        >
          • Liste
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className={buttonClass}
          title="Nummerierte Liste"
        >
          1. Liste
        </button>
        
        <div className={`w-px mx-1 ${darkMode ? 'bg-white/20' : 'bg-gray-300'}`}></div>
        
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'h3')}
          className={`${buttonClass} font-bold`}
          title="Überschrift"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'h4')}
          className={`${buttonClass} font-semibold`}
          title="Unterüberschrift"
        >
          H4
        </button>
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'p')}
          className={buttonClass}
          title="Absatz"
        >
          P
        </button>
        
        <div className={`w-px mx-1 ${darkMode ? 'bg-white/20' : 'bg-gray-300'}`}></div>
        
        <button
          type="button"
          onClick={() => formatText('indent')}
          className={buttonClass}
          title="Einrücken"
        >
          →
        </button>
        <button
          type="button"
          onClick={() => formatText('outdent')}
          className={buttonClass}
          title="Ausrücken"
        >
          ←
        </button>
        
        <div className={`w-px mx-1 ${darkMode ? 'bg-white/20' : 'bg-gray-300'}`}></div>
        
        <button
          type="button"
          onClick={() => {
            const code = prompt('Code eingeben:')
            if (code) {
              const codeClass = darkMode ? 'bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-green-300' : 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono'
              formatText('insertHTML', `<code class="${codeClass}">${code}</code>`)
            }
          }}
          className={`${buttonClass} font-mono`}
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
          className={buttonClass}
          title="Link"
        >
          🔗
        </button>
        
        <div className={`w-px mx-1 ${darkMode ? 'bg-white/20' : 'bg-gray-300'}`}></div>
        
        <button
          type="button"
          onClick={() => formatText('removeFormat')}
          className={`${buttonClass} ${darkMode ? 'text-red-400' : 'text-red-600'}`}
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
          className={editorClass}
          style={{ whiteSpace: 'pre-wrap' }}
          suppressContentEditableWarning={true}
        />
        
        {/* Placeholder */}
        {!value && placeholder && (
          <div className={placeholderClass}>
            {placeholder}
          </div>
        )}
      </div>
      
      {/* Hilfetext */}
      <div className={helpClass}>
        <strong>Tipp:</strong> Verwenden Sie die Toolbar-Buttons für Formatierung. 
        Für Code-Blöcke verwenden Sie den &lt;/&gt; Button.
      </div>
    </div>
  )
}