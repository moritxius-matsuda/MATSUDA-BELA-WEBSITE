'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { lowlight } from 'lowlight'
import { useCallback } from 'react'

// Sprachen für Code-Highlighting
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'

// Registriere Sprachen
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('python', python)
lowlight.register('bash', bash)
lowlight.register('json', json)
lowlight.register('css', css)
lowlight.register('html', html)

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function TiptapEditor({ content, onChange, placeholder = 'Schreiben Sie hier...' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Wir verwenden CodeBlockLowlight stattdessen
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline hover:text-blue-300',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-green-300 p-4 rounded-lg font-mono text-sm overflow-x-auto',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-white/20 w-full',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-white/20',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-white/20 bg-white/10 p-2 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-white/20 p-2',
        },
      }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt('Bild URL')

    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-white/20 rounded-lg bg-black/20 overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-white/20 p-3 bg-black/30">
        <div className="flex flex-wrap gap-2">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-white/20 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded text-sm font-bold ${
                editor.isActive('bold') ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Fett"
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded text-sm italic ${
                editor.isActive('italic') ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Kursiv"
            >
              I
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded text-sm line-through ${
                editor.isActive('strike') ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Durchgestrichen"
            >
              S
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 rounded text-sm font-mono ${
                editor.isActive('code') ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Inline Code"
            >
              &lt;/&gt;
            </button>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-white/20 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded text-sm font-bold ${
                editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Überschrift 1"
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded text-sm font-bold ${
                editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Überschrift 2"
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded text-sm font-bold ${
                editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Überschrift 3"
            >
              H3
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-white/20 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded text-sm ${
                editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Aufzählung"
            >
              •
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded text-sm ${
                editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Nummerierte Liste"
            >
              1.
            </button>
          </div>

          {/* Blocks */}
          <div className="flex gap-1 border-r border-white/20 pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded text-sm ${
                editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Zitat"
            >
              "
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded text-sm font-mono ${
                editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Code Block"
            >
              { }
            </button>
          </div>

          {/* Links & Media */}
          <div className="flex gap-1 border-r border-white/20 pr-2">
            <button
              onClick={setLink}
              className={`p-2 rounded text-sm ${
                editor.isActive('link') ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
              }`}
              title="Link"
            >
              🔗
            </button>
            <button
              onClick={addImage}
              className="p-2 rounded text-sm text-white/70 hover:bg-white/10"
              title="Bild"
            >
              🖼️
            </button>
          </div>

          {/* Table */}
          <div className="flex gap-1 border-r border-white/20 pr-2">
            <button
              onClick={insertTable}
              className="p-2 rounded text-sm text-white/70 hover:bg-white/10"
              title="Tabelle einfügen"
            >
              📊
            </button>
            {editor.isActive('table') && (
              <>
                <button
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  className="p-2 rounded text-sm text-white/70 hover:bg-white/10"
                  title="Spalte links hinzufügen"
                >
                  ⬅️+
                </button>
                <button
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="p-2 rounded text-sm text-white/70 hover:bg-white/10"
                  title="Spalte rechts hinzufügen"
                >
                  ➡️+
                </button>
                <button
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="p-2 rounded text-sm text-white/70 hover:bg-white/10"
                  title="Spalte löschen"
                >
                  ❌
                </button>
              </>
            )}
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="p-2 rounded text-sm text-white/70 hover:bg-white/10 disabled:opacity-50"
              title="Rückgängig"
            >
              ↶
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="p-2 rounded text-sm text-white/70 hover:bg-white/10 disabled:opacity-50"
              title="Wiederholen"
            >
              ↷
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-[200px]">
        <EditorContent 
          editor={editor} 
          className="text-white"
        />
      </div>
    </div>
  )
}