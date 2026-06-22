<template>
  <div class="tanya-ai-container">
    <div class="page-header d-flex justify-content-between align-items-center flex-shrink-0">
      <div class="header-left">
        <h4 class="page-title">
          <i class="fas fa-brain ai-icon-gradient"></i> Tanya RSIA-AI
        </h4>
        <p class="page-subtitle">Tanyakan apa saja mengenai data operasional dan informasi umum rumah sakit secara real-time</p>
      </div>
    </div>

    <!-- Main Chat Workspace -->
    <div class="chat-workspace card">
      <!-- Welcome Pane / Chat area -->
      <div ref="chatContainer" class="chat-history-container">
        <!-- If empty chat -->
        <div v-if="messages.length === 0" class="welcome-pane text-center">
          <div class="ai-avatar-large">
            <div class="ai-avatar-pulse"></div>
            <i class="fas fa-robot"></i>
          </div>
          <h3 class="welcome-title mt-4">Halo, {{ userName }}! 👋</h3>
          <p class="welcome-subtitle">Saya adalah RSIA-AI. Saya dapat membantu Anda menelusuri data pasien, jadwal dokter, statistik unit, atau informasi internal rumah sakit lainnya.</p>
          
          <div class="example-questions-container mt-5">
            <h6 class="text-uppercase tracking-wider text-muted font-bold mb-3 small">Coba tanyakan seperti ini:</h6>
            <div class="questions-grid">
              <button 
                v-for="(q, idx) in exampleQuestions" 
                :key="idx" 
                class="question-chip"
                @click="sendPresetQuestion(q)"
              >
                <span class="chip-icon">💬</span> {{ q }}
              </button>
            </div>
          </div>
        </div>

        <!-- Chat messages list -->
        <div v-else class="messages-list">
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            class="message-row"
            :class="msg.role === 'user' ? 'message-user' : 'message-assistant'"
          >
            <div class="message-avatar">
              <i v-if="msg.role === 'user'" class="fas fa-circle-user"></i>
              <i v-else class="fas fa-robot"></i>
            </div>
            <div class="message-bubble-wrapper">
              <div class="message-sender-name">{{ msg.role === 'user' ? 'Anda' : 'RSIA-AI' }}</div>
              <div class="message-bubble">
                <div class="message-content" v-html="formatMessage(msg.content)"></div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isLoading" class="message-row message-assistant message-loading">
            <div class="message-avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="message-bubble-wrapper">
              <div class="message-sender-name">RSIA-AI sedang berpikir</div>
              <div class="message-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Pills (Floating above input) -->
      <div v-if="messages.length > 0" class="chat-chips-row flex-shrink-0">
        <button 
          v-for="(q, idx) in exampleQuestions.slice(0, 3)" 
          :key="idx" 
          class="chat-mini-chip"
          @click="sendPresetQuestion(q)"
          :disabled="isLoading"
        >
          {{ q }}
        </button>
      </div>

      <!-- Input Area -->
      <div class="chat-input-wrapper card-footer flex-shrink-0">
        <div class="input-container">
          <textarea
            ref="messageInput"
            v-model="inputMessage"
            class="chat-input-field"
            placeholder="Tulis pertanyaan Anda di sini... (Tekan Enter untuk mengirim)"
            rows="1"
            @keydown.enter.prevent="sendMessage"
            :disabled="isLoading"
          ></textarea>
          <button 
            class="btn btn-send-message" 
            :class="{ 'is-loading': isLoading }"
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isLoading"
            title="Kirim pesan"
          >
            <i class="fas fa-paper-plane" v-if="!isLoading"></i>
            <span v-else class="ai-spinner"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import { showToast } from '../../utils/notification'

const authStore = useAuthStore()

// State
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)

// Refs
const chatContainer = ref(null)
const messageInput = ref(null)

// Computed
const userName = computed(() => authStore.userName)

// Configuration options
const exampleQuestions = [
  'Berapa jumlah pasien IGD hari ini?',
  'Tampilkan statistik pasien bulan ini dikelompokkan berdasarkan poliklinik',
  'Cari dokter spesialis kandungan anak hari ini',
  'Berapa jumlah pegawai aktif saat ini?',
  'Tampilkan rincian kamar kelas 1 yang kosong hari ini',
  'Apakah ada keluhan atau data keterlambatan jadwal dokter hari ini?'
]

const sendPresetQuestion = (question) => {
  if (isLoading.value) return
  inputMessage.value = question
  sendMessage()
}

const formatMessage = (text) => {
  if (!text) return ''
  
  let formatted = text

  // Convert Blockquote (> text) - must be done before replacing newlines (\n)
  formatted = formatted.replace(/^&gt; (.*?)$/gm, '<blockquote>$1</blockquote>')
  formatted = formatted.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')

  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br>')

  // Convert Bold (*text* or **text**)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/\*(.*?)\*/g, '<strong>$1</strong>')

  // Convert Monospace (```text``` or `text`)
  formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>')
  formatted = formatted.replace(/`(.*?)`/g, '<code class="code-inline">$1</code>')

  // Convert Italic (_text_)
  formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>')

  // Convert Strikethrough (~text~)
  formatted = formatted.replace(/~(.*?)~/g, '<del>$1</del>')

  return formatted
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  const query = inputMessage.value.trim()
  if (!query || isLoading.value) return

  // Format time
  const now = new Date()
  const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  // Add User Message
  messages.value.push({
    role: 'user',
    content: query,
    time: timeString
  })

  inputMessage.value = ''
  isLoading.value = true
  await scrollToBottom()

  // Adjust input textarea height back to default
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }

  try {
    console.log('Sending request to Tanya AI backend proxy...')
    const response = await api.post('/dashboard/tanya-ai', {
      message: query
    })

    const reply = response.data?.output || 'Mohon maaf, terjadi kesalahan dalam memproses respon AI.'
    
    // Add Assistant Message
    messages.value.push({
      role: 'assistant',
      content: reply,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    })

  } catch (err) {
    console.error('Error connecting to Tanya AI:', err)
    
    let errMsg = 'Gagal menghubungi server AI. Hubungi administrator.'
    let replyErr = '❌ **Gagal Terhubung ke Layanan AI**\n\nTerjadi gangguan koneksi ke server AI.'
    
    if (err.response?.data?.output) {
      errMsg = err.response.data.output
      replyErr = `❌ **Error dari Server AI**\n\n${err.response.data.output}`
    } else if (err.response) {
      errMsg = `Server merespon dengan error: ${err.response.status}.`
      replyErr = `❌ **Error Server (${err.response.status})**\n\nTerjadi kesalahan di server.`
    }
    
    showToast(errMsg, 'error')
    
    messages.value.push({
      role: 'assistant',
      content: replyErr,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
    // Auto-focus input on desktop
    nextTick(() => {
      if (messageInput.value && window.innerWidth > 768) {
        messageInput.value.focus()
      }
    })
  }
}

// Auto-grow input field as user types
onMounted(() => {
  if (messageInput.value) {
    messageInput.value.addEventListener('input', function() {
      this.style.height = 'auto'
      this.style.height = (this.scrollHeight) + 'px'
    })
  }
})
</script>

<style scoped>
.tanya-ai-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  gap: 1.25rem;
  padding-bottom: 1rem;
}

.page-header {
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.ai-icon-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: #64748b;
  margin-bottom: 0;
  font-size: 0.875rem;
}

.btn-outline-secondary-modern {
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.btn-outline-secondary-modern:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
}

.settings-card {
  border: 1px solid #d8b4fe;
  background: #faf5ff;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.08);
}

.chat-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
}

.chat-history-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: #f8fafc;
}

/* Welcome Screen */
.welcome-pane {
  max-width: 600px;
  margin: 3rem auto;
}

.ai-avatar-large {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
  color: white;
  font-size: 2.25rem;
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.3);
}

.ai-avatar-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.3);
  animation: pulse 2s infinite;
  z-index: 0;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(0.95);
    opacity: 0;
  }
}

.ai-avatar-large i {
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-weight: 700;
  color: #0f172a;
}

.welcome-subtitle {
  color: #475569;
  font-size: 1rem;
  line-height: 1.6;
}

.questions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .questions-grid {
    grid-template-columns: 1fr;
  }
}

.question-chip {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.875rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  text-align: left;
  color: #334155;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.question-chip:hover {
  border-color: #a855f7;
  background: #faf5ff;
  color: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(168, 85, 247, 0.1);
}

.chip-icon {
  margin-right: 0.5rem;
}

/* Chat Messages */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-row {
  display: flex;
  gap: 1rem;
  max-width: 85%;
}

.message-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-assistant {
  align-self: flex-start;
}

.message-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.message-avatar i {
  font-size: 1.35rem;
  line-height: 1;
  display: block;
}

.message-user .message-avatar {
  background: #dbeafe;
  color: #2563eb;
}

.message-assistant .message-avatar {
  background: #faf5ff;
  color: #7c3aed;
  border: 1px solid #f3e8ff;
}

.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
}

.message-sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.25rem;
  margin-left: 0.5rem;
}

.message-user .message-sender-name {
  align-self: flex-end;
  margin-right: 0.5rem;
}

.message-bubble {
  position: relative;
  padding: 0.875rem 1.25rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  font-size: 0.9375rem;
  line-height: 1.55;
  color: #1e293b;
}

.message-user .message-bubble {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-top-right-radius: 0.25rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.message-assistant .message-bubble {
  background: white;
  border: 1px solid #e2e8f0;
  border-top-left-radius: 0.25rem;
}

.message-time {
  font-size: 0.7rem;
  margin-top: 0.35rem;
  color: #94a3b8;
  text-align: right;
}

.message-user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* Chat Input Bar */
.chat-chips-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background-color: #f8fafc;
  overflow-x: auto;
  border-top: 1px solid #f1f5f9;
}

.chat-chips-row::-webkit-scrollbar {
  display: none;
}

.chat-mini-chip {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.35rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.chat-mini-chip:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #2563eb;
  background: #f0fdf4;
}

.chat-input-wrapper {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
}

.input-container {
  display: flex;
  background: #f8fafc;
  border: 1.5px solid #cbd5e1;
  border-radius: 0.75rem;
  padding: 0.35rem 0.5rem;
  align-items: flex-end;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.chat-input-field {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-size: 0.9375rem;
  color: #1e293b;
  resize: none;
  max-height: 120px;
  outline: none;
}

.btn-send-message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #2563eb;
  color: white;
  border: none;
  transition: all 0.2s ease;
  margin-bottom: 0.2rem;
  overflow: visible;
}

.btn-send-message:hover:not(:disabled) {
  background: #1d4ed8;
  transform: scale(1.05);
}

.btn-send-message:disabled:not(.is-loading) {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

/* Keep button blue and show loading cursor when loading */
.btn-send-message.is-loading {
  background: #2563eb;
  color: white;
  cursor: wait;
  opacity: 0.85;
}

/* Custom spinner - white circle ring */
.ai-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: ai-spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes ai-spin {
  to { transform: rotate(360deg); }
}

/* Typing loading dots */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.25rem;
}

.typing-indicator span {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a855f7;
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing-bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1.0);
  }
}

/* Format Styles inside message content */
:deep(.code-block) {
  background: #0f172a;
  color: #38bdf8;
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  overflow-x: auto;
  margin: 0.75rem 0;
  border-left: 4px solid #a855f7;
}

:deep(.code-inline) {
  background: #f1f5f9;
  color: #ec4899;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
}

:deep(blockquote) {
  border-left: 4px solid #a855f7;
  background: #faf5ff;
  color: #5b21b6;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  margin: 0.875rem 0;
  font-style: italic;
  font-size: 0.925rem;
  line-height: 1.6;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* ── Mobile Layout Overrides ────────────────────────────────── */
@media (max-width: 768px) {
  /* Container: hide header card, remove gap, fix height */
  .tanya-ai-container {
    height: calc(100vh - 92px); /* 60px top-header + 2×1rem padding */
    gap: 0;
    padding-bottom: 0;
  }

  /* Hide page header — breadcrumb already shows "Tanya Ai" */
  .page-header {
    display: none;
  }

  /* Chat workspace fills all remaining space */
  .chat-workspace {
    border-radius: 0.75rem;
    flex: 1;
    min-height: 0;
  }

  /* Reduce chat history padding */
  .chat-history-container {
    padding: 0.875rem 0.75rem;
  }

  /* Welcome pane smaller on mobile */
  .welcome-pane {
    margin: 1.5rem auto;
  }

  .ai-avatar-large {
    width: 60px;
    height: 60px;
    font-size: 1.75rem;
  }

  .welcome-title {
    font-size: 1.1rem;
  }

  .welcome-subtitle {
    font-size: 0.875rem;
  }

  .example-questions-container {
    margin-top: 1.5rem !important;
  }

  /* Message row wider on mobile */
  .message-row {
    max-width: 95%;
    gap: 0.5rem;
  }

  /* Smaller avatars */
  .message-avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .message-avatar i {
    font-size: 1.1rem;
  }

  /* Tighter bubble */
  .message-bubble {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
  }

  .message-sender-name {
    font-size: 0.7rem;
    margin-bottom: 0.15rem;
  }

  /* Quick chips bar */
  .chat-chips-row {
    padding: 0.35rem 0.75rem;
    gap: 0.35rem;
  }

  .chat-mini-chip {
    font-size: 0.75rem;
    padding: 0.25rem 0.65rem;
  }

  /* Input area */
  .chat-input-wrapper {
    padding: 0.75rem;
  }

  .chat-input-field {
    font-size: 0.875rem;
  }

  .btn-send-message {
    width: 34px;
    height: 34px;
    border-radius: 7px;
  }
}
</style>

