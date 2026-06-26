<template>
  <div class="tiptap-editor-wrapper border rounded-8 overflow-hidden shadow-sm">
    <!-- Toolbar -->
    <div class="editor-toolbar bg-light p-2 d-flex flex-wrap align-items-center gap-1 border-bottom">
      <button 
        type="button"
        class="btn btn-sm btn-toolbar" 
        :class="{ active: editor?.isActive('bold') }"
        @click="editor?.chain().focus().toggleBold().run()"
        title="Tebal (Ctrl+B)"
      >
        <i class="fas fa-bold"></i>
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar" 
        :class="{ active: editor?.isActive('italic') }"
        @click="editor?.chain().focus().toggleItalic().run()"
        title="Miring (Ctrl+I)"
      >
        <i class="fas fa-italic"></i>
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar" 
        :class="{ active: editor?.isActive('underline') }"
        @click="editor?.chain().focus().toggleUnderline().run()"
        title="Garis Bawah (Ctrl+U)"
      >
        <i class="fas fa-underline"></i>
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar" 
        :class="{ active: editor?.isActive('strike') }"
        @click="editor?.chain().focus().toggleStrike().run()"
        title="Coret (Ctrl+Shift+X)"
      >
        <i class="fas fa-strikethrough"></i>
      </button>
      
      <span class="toolbar-divider mx-1">|</span>

      <button 
        type="button"
        class="btn btn-sm btn-toolbar font-monospace" 
        :class="{ active: editor?.isActive('heading', { level: 1 }) }"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        title="Heading 1"
      >
        H1
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar font-monospace" 
        :class="{ active: editor?.isActive('heading', { level: 2 }) }"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        title="Heading 2"
      >
        H2
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar font-monospace" 
        :class="{ active: editor?.isActive('heading', { level: 3 }) }"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        title="Heading 3"
      >
        H3
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar font-monospace" 
        :class="{ active: editor?.isActive('paragraph') }"
        @click="editor?.chain().focus().setParagraph().run()"
        title="Paragraf Biasa"
      >
        P
      </button>

      <span class="toolbar-divider mx-1">|</span>

      <button 
        type="button"
        class="btn btn-sm btn-toolbar" 
        :class="{ active: editor?.isActive('bulletList') }"
        @click="editor?.chain().focus().toggleBulletList().run()"
        title="Daftar Bulatan"
      >
        <i class="fas fa-list-ul"></i>
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar" 
        :class="{ active: editor?.isActive('orderedList') }"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        title="Daftar Angka"
      >
        <i class="fas fa-list-ol"></i>
      </button>
      
      <button 
        type="button"
        class="btn btn-sm btn-toolbar"
        @click="editor?.chain().focus().sinkListItem('listItem').run()"
        :disabled="!editor?.can().sinkListItem('listItem')"
        title="Masuk Tingkatan (Tab)"
      >
        <i class="fas fa-indent"></i>
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar"
        @click="editor?.chain().focus().liftListItem('listItem').run()"
        :disabled="!editor?.can().liftListItem('listItem')"
        title="Keluar Tingkatan (Shift+Tab)"
      >
        <i class="fas fa-outdent"></i>
      </button>

      <span class="toolbar-divider mx-1">|</span>

      <button 
        type="button"
        class="btn btn-sm btn-toolbar" 
        @click="editor?.chain().focus().unsetAllMarks().clearNodes().run()"
        title="Hapus Semua Format Teks"
      >
        <i class="fas fa-eraser"></i>
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar" 
        @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().undo()"
        title="Kembali (Ctrl+Z)"
      >
        <i class="fas fa-undo"></i>
      </button>
      <button 
        type="button"
        class="btn btn-sm btn-toolbar" 
        @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().redo()"
        title="Maju (Ctrl+Y)"
      >
        <i class="fas fa-redo"></i>
      </button>
    </div>

    <!-- Editor Content Area -->
    <editor-content :editor="editor" class="editor-content-area" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Extension, wrappingInputRule } from '@tiptap/core'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Ketik di sini...'
  }
})

const emit = defineEmits(['update:modelValue'])

// Custom extension to handle Tab and Shift+Tab indentation inside lists
const ListTabHandler = Extension.create({
  name: 'listTabHandler',
  addKeyboardShortcuts() {
    const editor = this.editor
    return {
      Tab: () => {
        if (editor.isActive('orderedList') || editor.isActive('bulletList')) {
          editor.commands.sinkListItem('listItem')
          return true
        }
        // If not in a list, insert 4 spaces (non-breaking spaces) instead of losing focus
        return editor.commands.insertContent('\u00A0\u00A0\u00A0\u00A0')
      },
      'Shift-Tab': () => {
        if (editor.isActive('orderedList') || editor.isActive('bulletList')) {
          editor.commands.liftListItem('listItem')
          return true
        }
        return false
      }
    }
  },
  addInputRules() {
    return [
      wrappingInputRule({
        find: /^([A-Z])\.\s$/,
        type: this.editor.schema.nodes.orderedList,
        getAttributes: match => {
          const charCode = match[1].charCodeAt(0)
          const start = charCode - 65 + 1 // 'A' is 65
          return { start }
        }
      }),
      wrappingInputRule({
        find: /^([a-z])\.\s$/,
        type: this.editor.schema.nodes.orderedList,
        getAttributes: match => {
          const charCode = match[1].charCodeAt(0)
          const start = charCode - 97 + 1 // 'a' is 97
          return { start }
        }
      })
    ]
  }
})

// =================== WORD PASTE PARSER ===================

// Check if HTML is from Microsoft Word
const isWordHtml = (html) => {
  return html.includes('mso-list') || html.includes('MsoListParagraph') || html.includes('schemas-microsoft')
}

// Build nested ol/ul string from flat list of { level, content }
// Produces the nested li structure needed by Tiptap
const buildNestedHtmlFromItems = (flatItems) => {
  // flatItems: Array of { level: number (0-based), type: 'ol'|'ul'|'p', content: string }
  let result = ''
  // stack entries: { level, type, items: string }
  const stack = []

  // Close only levels STRICTLY DEEPER than targetLevel (do NOT close targetLevel itself)
  const closeDeeper = (targetLevel) => {
    while (stack.length > 0 && stack[stack.length - 1].level > targetLevel) {
      const closed = stack.pop()
      const closedHtml = `<${closed.type}>${closed.items}</${closed.type}>`
      if (stack.length > 0) {
        // Inject nested list into last </li> of parent level
        const parent = stack[stack.length - 1]
        const idx = parent.items.lastIndexOf('</li>')
        if (idx !== -1) {
          parent.items = parent.items.substring(0, idx) + closedHtml + '</li>'
        } else {
          parent.items += closedHtml
        }
      } else {
        result += closedHtml
      }
    }
  }

  const flushAll = () => closeDeeper(-1)

  flatItems.forEach(item => {
    if (item.type === 'p') {
      flushAll()
      if (item.content) result += `<p>${item.content}</p>`
      return
    }
    const { level, type, content } = item

    // Close only levels DEEPER than current — do NOT close same-level entries
    // This is the key fix: same-level items continue in the same <ol>
    closeDeeper(level)

    const top = stack[stack.length - 1]
    if (top && top.level === level) {
      // Same level: append to existing list (counter continues correctly)
      top.items += `<li>${content}</li>`
    } else {
      // New/deeper level: push a new list onto the stack
      stack.push({ level, type, items: `<li>${content}</li>` })
    }
  })

  flushAll()
  return result
}

// Parse Word HTML (mso-list based) into clean nested HTML
const parseWordMsoHtml = (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  const flatItems = []
  let foundList = false

  // Process all block elements in order
  const walk = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const tag = node.tagName.toLowerCase()

    if (tag === 'p' || tag === 'li') {
      const style = node.getAttribute('style') || ''
      const cls = node.getAttribute('class') || ''

      // Check for mso-list in style or class (MsoListParagraph)
      const msoMatch = style.match(/mso-list:[^;]*\blevel(\d+)\b/)
      const isMsoListClass = cls.includes('MsoListParagraph') || cls.includes('MsoList')

      if (msoMatch || isMsoListClass) {
        foundList = true
        const level = msoMatch ? parseInt(msoMatch[1]) - 1 : 0 // 0-based

        // Clone and clean Word-specific spans
        const cloned = node.cloneNode(true)

        // Remove <!--[if !supportLists]--> span blocks (contain auto-number text)
        // These typically have mso-list in their style
        cloned.querySelectorAll('span').forEach(span => {
          const spanStyle = span.getAttribute('style') || ''
          if (spanStyle.includes('mso-list') || spanStyle.includes('mso-tab-count')) {
            span.remove()
          }
        })

        const content = cloned.innerHTML.trim()
        if (content) {
          flatItems.push({ level, type: 'ol', content })
        }
      } else {
        // Regular paragraph
        const content = node.textContent.trim()
        if (content) {
          flatItems.push({ level: -1, type: 'p', content: node.innerHTML.trim() })
        }
      }
    } else if (tag !== 'script' && tag !== 'style') {
      // Recurse into other containers (div, body, etc.)
      Array.from(node.childNodes).forEach(walk)
    }
  }

  Array.from(body.childNodes).forEach(walk)

  if (!foundList) return null
  return buildNestedHtmlFromItems(flatItems)
}

// Fallback: parse plain text with visible prefix patterns (e.g. typed "A." manually)
const PLAIN_PATTERNS = [
  { level: 0, type: 'ul', detect: /^[\u2022\u25cf\u25e6\u2013\u2212\u00b7]\s+/, strip: /^[\u2022\u25cf\u25e6\u2013\u2212\u00b7]\s+/ },
  { level: 0, type: 'ol', detect: /^[A-Z]\.[\t \u00A0]/, strip: /^[A-Z]\.\s+/ },
  { level: 1, type: 'ol', detect: /^\d+\.[\t \u00A0]/, strip: /^\d+\.\s+/ },
  { level: 2, type: 'ol', detect: /^[a-z]\.[\t \u00A0]/, strip: /^[a-z]\.\s+/ },
  { level: 3, type: 'ol', detect: /^\d+\)[\t \u00A0]/, strip: /^\d+\)\s+/ },
  { level: 4, type: 'ol', detect: /^[a-z]\)[\t \u00A0]/, strip: /^[a-z]\)\s+/ },
  { level: 5, type: 'ol', detect: /^[ivxlcdm]+\)[\t \u00A0]/i, strip: /^[ivxlcdm]+\)\s+/i },
]

const parsePlainTextToNestedHtml = (text) => {
  const lines = text.split(/\r?\n/)
  const flatItems = []

  lines.forEach(rawLine => {
    const line = rawLine.trimStart()
    if (!line) {
      flatItems.push({ level: -1, type: 'p', content: '' })
      return
    }
    let matched = null
    for (const p of PLAIN_PATTERNS) {
      if (p.detect.test(line)) { matched = p; break }
    }
    if (matched) {
      flatItems.push({
        level: matched.level,
        type: matched.type,
        content: line.replace(matched.strip, '').trim()
      })
    } else {
      flatItems.push({ level: -1, type: 'p', content: line })
    }
  })

  return buildNestedHtmlFromItems(flatItems)
}

const looksLikeManualList = (text) => {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  let count = 0
  for (const line of lines) {
    for (const p of PLAIN_PATTERNS) {
      if (p.detect.test(line.trimStart())) { count++; break }
    }
  }
  return count > 0 && (count / lines.length >= 0.1 || count >= 2)
}

const stripPrefixFromLiNode = (li, stripRegex) => {
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const match = node.nodeValue.match(stripRegex)
      if (match) {
        node.nodeValue = node.nodeValue.replace(stripRegex, '')
        return true
      }
    } else {
      for (const child of node.childNodes) {
        if (walk(child)) return true
      }
    }
    return false
  }
  walk(li)
}

const cleanHtmlListPrefixes = (html) => {
  if (!html) return html
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  const lis = doc.querySelectorAll('li')
  lis.forEach(li => {
    const text = li.textContent.trimStart()
    for (const p of PLAIN_PATTERNS) {
      if (p.detect.test(text)) {
        stripPrefixFromLiNode(li, p.strip)
        break
      }
    }
  })
  
  return doc.body.innerHTML
}

// robust parser to convert flat lists with class 'ql-indent-X' from Quill into nested lists for Tiptap
const convertQuillToNested = (html) => {
  if (!html || html === '-') return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const lists = doc.querySelectorAll('ol, ul');
  lists.forEach(list => {
    // If the list is already nested (contains nested lists), skip processing
    if (list.querySelector('ol, ul')) return;

    const items = Array.from(list.children);
    if (items.length === 0) return;

    const listTag = list.tagName.toLowerCase(); // 'ol' or 'ul'
    const newRoot = document.createElement(listTag);
    let currentLevel = 0;
    let currentContainer = newRoot;
    let activeLi = null;

    const getLevel = (li) => {
      const match = li.className.match(/ql-indent-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };

    items.forEach(li => {
      const level = getLevel(li);
      
      // Clean up Quill class names
      li.className = li.className.replace(/ql-indent-\d+/, '').trim();
      if (!li.className) li.removeAttribute('class');

      if (level === currentLevel) {
        const newLi = li.cloneNode(true);
        currentContainer.appendChild(newLi);
        activeLi = newLi;
      } else if (level > currentLevel) {
        while (level > currentLevel) {
          if (!activeLi) {
            activeLi = document.createElement('li');
            currentContainer.appendChild(activeLi);
          }
          let nestedList = activeLi.querySelector(listTag);
          if (!nestedList) {
            nestedList = document.createElement(listTag);
            activeLi.appendChild(nestedList);
          }
          currentContainer = nestedList;
          activeLi = document.createElement('li');
          currentContainer.appendChild(activeLi);
          currentLevel++;
        }
        while (li.firstChild) {
          activeLi.appendChild(li.firstChild);
        }
      } else {
        while (level < currentLevel && currentContainer.parentNode) {
          currentContainer = currentContainer.parentNode.parentNode;
          currentLevel--;
        }
        const newLi = li.cloneNode(true);
        currentContainer.appendChild(newLi);
        activeLi = newLi;
      }
    });

    list.parentNode.replaceChild(newRoot, list);
  });

  return doc.body.innerHTML;
}

const editor = useEditor({
  content: convertQuillToNested(props.modelValue),
  extensions: [
    StarterKit,
    Underline,
    ListTabHandler
  ],
  editorProps: {
    transformPastedHTML(html) {
      return cleanHtmlListPrefixes(html)
    },
    handlePaste(view, event) {
      const clipboardData = event.clipboardData
      if (!clipboardData) return false

      const htmlData = clipboardData.getData('text/html')
      const plainText = clipboardData.getData('text/plain')

      // Approach 1 (PRIORITY): Plain text with visible prefixes (A./1./a./bullet).
      // This runs BEFORE Word HTML parsing, so Cmd+V from Word behaves the same
      // as Cmd+Shift+V when the content has explicit list prefixes in plain text.
      // This prevents the Word HTML parser from producing double-numbered output.
      if (plainText && looksLikeManualList(plainText)) {
        event.preventDefault()
        const html = parsePlainTextToNestedHtml(plainText)
        editor.value.commands.insertContent(html)
        return true
      }

      // Approach 2 (FALLBACK): Word HTML with mso-list, only when plain text
      // does NOT already look like a list (e.g. Word bullet symbols like • that
      // are not captured by our PLAIN_PATTERNS).
      if (htmlData && isWordHtml(htmlData)) {
        const parsed = parseWordMsoHtml(htmlData)
        if (parsed) {
          event.preventDefault()
          editor.value.commands.insertContent(parsed)
          return true
        }
      }

      // Approach 3: Non-list HTML — let default Tiptap paste + transformPastedHTML handle it.
      return false
    }
  },
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML())
  }
})

// Watch modelValue changes to update editor dynamically (preventing feedback loops)
watch(() => props.modelValue, (newValue) => {
  // If the new value is exactly what the editor already has, do nothing
  if (newValue === editor.value.getHTML()) return
  
  const converted = convertQuillToNested(newValue)
  if (converted === editor.value.getHTML()) return
  
  editor.value.commands.setContent(converted, false)
})

onBeforeUnmount(() => {
  editor.value.destroy()
})
</script>

<style scoped>
.tiptap-editor-wrapper {
  background: white;
  border-color: #e2e8f0 !important;
}

.btn-toolbar {
  color: #64748b;
  border: 1px solid transparent;
  background: transparent;
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  width: auto !important; /* Fix conflict with global .btn { width: 100% } */
}

.btn-toolbar:hover:not(:disabled) {
  background-color: #f1f5f9;
  color: #1e293b;
  border-color: #cbd5e1;
}

.btn-toolbar.active {
  background-color: #e0e7ff;
  color: #4f46e5;
  border-color: #c7d2fe;
  font-weight: bold;
}

.btn-toolbar:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-divider {
  color: #cbd5e1;
  font-size: 0.85rem;
  pointer-events: none;
}

.editor-content-area {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  outline: none;
}

/* Base styles inside editor */
:deep(.tiptap) {
  min-height: 200px;
  outline: none;
  font-family: inherit;
  font-size: 0.95rem;
  color: #1e293b;
  line-height: 1.6;
}

:deep(.tiptap p) {
  margin-bottom: 0.5rem;
}

/* List spacing and indentation styles within the editor */
:deep(.tiptap ol),
:deep(.tiptap ul) {
  margin-bottom: 0.5rem;
}

/* Custom nested list numbering counters inside Tiptap */
:deep(.tiptap ol) {
  counter-reset: nested-counter-0;
  list-style-type: none !important;
  padding-left: 0 !important;
}

:deep(.tiptap ol li) {
  position: relative;
  list-style-type: none !important;
  counter-increment: nested-counter-0;
  padding-left: 1.5rem !important;
  margin-bottom: 0.25rem;
}

:deep(.tiptap ol li::before) {
  content: counter(nested-counter-0, upper-alpha) ". " !important;
  position: absolute;
  left: 0 !important;
  text-align: right;
  width: 1.2rem;
  color: inherit;
}

/* Level 1: ol ol */
:deep(.tiptap ol ol) {
  counter-reset: nested-counter-1;
  padding-left: 0 !important;
  margin-top: 0.25rem;
  margin-left: 0.5rem !important;
}

:deep(.tiptap ol ol li) {
  counter-increment: nested-counter-1;
}

:deep(.tiptap ol ol li::before) {
  content: counter(nested-counter-1, decimal) ". " !important;
}

/* Level 2: ol ol ol */
:deep(.tiptap ol ol ol) {
  counter-reset: nested-counter-2;
  margin-left: 0.5rem !important;
}

:deep(.tiptap ol ol ol li) {
  counter-increment: nested-counter-2;
}

:deep(.tiptap ol ol ol li::before) {
  content: counter(nested-counter-2, lower-alpha) ". " !important;
}

/* Level 3: ol ol ol ol */
:deep(.tiptap ol ol ol ol) {
  counter-reset: nested-counter-3;
  margin-left: 0.5rem !important;
}

:deep(.tiptap ol ol ol ol li) {
  counter-increment: nested-counter-3;
}

:deep(.tiptap ol ol ol ol li::before) {
  content: counter(nested-counter-3, decimal) ") " !important;
}

/* Level 4: ol ol ol ol ol */
:deep(.tiptap ol ol ol ol ol) {
  counter-reset: nested-counter-4;
  margin-left: 0.5rem !important;
}

:deep(.tiptap ol ol ol ol ol li) {
  counter-increment: nested-counter-4;
}

:deep(.tiptap ol ol ol ol ol li::before) {
  content: counter(nested-counter-4, lower-alpha) ") " !important;
}

/* Level 5: ol ol ol ol ol ol */
:deep(.tiptap ol ol ol ol ol ol) {
  counter-reset: nested-counter-5;
  margin-left: 0.5rem !important;
}

:deep(.tiptap ol ol ol ol ol ol li) {
  counter-increment: nested-counter-5;
}

:deep(.tiptap ol ol ol ol ol ol li::before) {
  content: counter(nested-counter-5, lower-roman) ") " !important;
}

/* Unordered list nesting styling inside Tiptap */
:deep(.tiptap ul) {
  list-style-type: none !important;
  padding-left: 0 !important;
}

:deep(.tiptap ul li) {
  position: relative;
  list-style-type: none !important;
  padding-left: 1.5rem !important;
  margin-bottom: 0.25rem;
}

:deep(.tiptap ul li::before) {
  content: "•" !important;
  position: absolute;
  left: 0 !important;
  text-align: right;
  width: 1.2rem;
  color: inherit;
}

:deep(.tiptap ul ul) {
  padding-left: 0 !important;
  margin-top: 0.25rem;
  margin-left: 0.5rem !important;
}

:deep(.tiptap ul ul li::before) {
  content: "○" !important;
}

:deep(.tiptap ul ul ul) {
  margin-left: 0.5rem !important;
}

:deep(.tiptap ul ul ul li::before) {
  content: "▪" !important;
}

:deep(.tiptap ul ul ul ul) {
  margin-left: 0.5rem !important;
}

:deep(.tiptap ul ul ul ul li::before) {
  content: "▫" !important;
}
</style>
