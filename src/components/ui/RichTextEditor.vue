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
import { onBeforeUnmount, watch, onMounted } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Extension } from '@tiptap/core'

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
        if (editor.isActive('listItem')) {
          editor.commands.sinkListItem('listItem')
          return true
        }
        // If not in a list, insert 4 spaces (non-breaking spaces) instead of losing focus
        return editor.commands.insertContent('\u00A0\u00A0\u00A0\u00A0')
      },
      'Shift-Tab': () => {
        if (editor.isActive('listItem')) {
          editor.commands.liftListItem('listItem')
          return true
        }
        return false
      }
    }
  }
})

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
  onUpdate: () => {
    emit('update:modelValue', editor.value.getHTML())
  }
})

// Watch modelValue changes to update editor dynamically (preventing feedback loops)
watch(() => props.modelValue, (newValue) => {
  const isSame = convertQuillToNested(newValue) === editor.value.getHTML()
  if (isSame) return
  
  editor.value.commands.setContent(convertQuillToNested(newValue), false)
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
