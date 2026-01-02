<template>
  <div class="searchable-select" ref="containerRef">
    <!-- Selected Display / Trigger -->
    <div 
      class="select-trigger" 
      :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
      @click="toggleDropdown"
    >
      <span v-if="selectedLabel" class="selected-text">{{ selectedLabel }}</span>
      <span v-else class="placeholder-text">{{ placeholder }}</span>
      <i class="fas fa-chevron-down arrow-icon"></i>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="isOpen" class="select-dropdown">
      <!-- Search Box -->
      <div class="search-box">
        <input 
          ref="searchInput"
          v-model="searchQuery" 
          type="text" 
          placeholder="Cari..." 
          class="dropdown-search-input"
          @click.stop
        >
      </div>

      <!-- Options List -->
      <ul class="options-list">
        <li 
          v-for="option in filteredOptions" 
          :key="option[valueKey]" 
          class="option-item"
          :class="{ 'is-selected': option[valueKey] === modelValue }"
          @click="selectOption(option)"
        >
          {{ option[labelKey] }}
        </li>
        <li v-if="filteredOptions.length === 0" class="no-results">
          Tidak ada data
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Pilih...'
  },
  labelKey: {
    type: String,
    default: 'name'
  },
  valueKey: {
    type: String,
    default: 'id'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref(null)
const containerRef = ref(null)
const searchInput = ref(null)

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt[props.valueKey] === props.modelValue)
  return selected ? selected[props.labelKey] : null
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt => 
    String(opt[props.labelKey]).toLowerCase().includes(query)
  )
})

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

function selectOption(option) {
  emit('update:modelValue', option[props.valueKey])
  emit('change', option)
  isOpen.value = false
}

function handleClickOutside(event) {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.searchable-select {
  position: relative;
  width: 100%;
  min-width: 200px;
}

.select-trigger {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem; /* Desktop default */
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 38px;
}

.select-trigger:hover {
  border-color: #cbd5e1;
}

.select-trigger.is-open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.select-trigger.is-disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
  opacity: 0.7;
}

.selected-text {
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder-text {
  color: #94a3b8;
}

.arrow-icon {
  font-size: 0.8rem;
  color: #64748b;
  margin-left: 0.5rem;
  transition: transform 0.2s;
}

.select-trigger.is-open .arrow-icon {
  transform: rotate(180deg);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.search-box {
  padding: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.dropdown-search-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.85rem;
  outline: none;
}

.dropdown-search-input:focus {
  border-color: #3b82f6;
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
}

.option-item {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  color: #334155;
  cursor: pointer;
  transition: background 0.1s;
}

.option-item:hover {
  background-color: #f1f5f9;
}

.option-item.is-selected {
  background-color: #eff6ff;
  color: #3b82f6;
  font-weight: 500;
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .searchable-select {
    width: 100%;
  }

  /* Force larger text on mobile to match previous fixes */
  .select-trigger, 
  .option-item, 
  .dropdown-search-input {
    font-size: 1rem !important; /* 16px */
  }

  .select-trigger {
    padding: 0.75rem;
  }
}
</style>
