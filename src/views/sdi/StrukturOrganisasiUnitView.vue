<template>
  <div class="org-structure-container animate-fade-in">
    <!-- Top Control Bar -->
    <div class="control-bar shadow-sm">
      <div class="left-controls">
        <div class="title-group">
          <h2>Struktur Organisasi</h2>
          <p class="subtitle text-muted">Bagan hirarki hubungan jabatan dan unit kerja</p>
        </div>
      </div>

      <div class="right-controls">
        <!-- Search Input -->
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Cari jabatan..." 
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Unit Toggle Tabs -->
        <div class="filter-group">
          <div class="tab-toggle-container">
            <button 
              type="button"
              class="tab-toggle-btn"
              :class="{ active: selectedDept === 'ALL' }"
              @click="selectedDept = 'ALL'"
            >
              <i class="fas fa-sitemap"></i>
              <span>Semua Unit</span>
            </button>
            <button 
              v-if="hasUserDept"
              type="button"
              class="tab-toggle-btn"
              :class="{ active: selectedDept === authStore.userDepartment }"
              @click="selectedDept = authStore.userDepartment"
            >
              <i class="fas fa-building"></i>
              <span>{{ userDeptName }}</span>
            </button>
          </div>
        </div>

        <!-- Canvas Controls -->
        <div class="canvas-controls">
          <button @click="zoomOut" class="btn-control" title="Zoom Out">
            <i class="fas fa-minus"></i>
          </button>
          <span class="zoom-value">{{ Math.round(zoom * 100) }}%</span>
          <button @click="zoomIn" class="btn-control" title="Zoom In">
            <i class="fas fa-plus"></i>
          </button>
          <button @click="resetView" class="btn-control" title="Reset Tampilan">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Canvas Wrapper for Panning and Zooming -->
    <div 
      class="canvas-wrapper" 
      ref="canvasWrapper"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @wheel.prevent="handleWheel"
      :class="{ 'dragging': isDragging }"
    >
      <!-- Help Instruction Overlay -->
      <div class="help-overlay">
        <i class="fas fa-mouse-pointer"></i>
        <span>Gunakan <strong>drag mouse</strong> untuk menggeser, dan <strong>scroll wheel</strong> untuk zoom</span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Memuat bagan struktur...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="rootNodes.length === 0" class="empty-state">
        <i class="fas fa-sitemap"></i>
        <p>Tidak ada bagan yang terdefinisi untuk unit ini</p>
      </div>

      <!-- Actual Tree Canvas -->
      <div 
        v-else
        class="tree-canvas"
        :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})` }"
      >
        <div class="org-tree">
          <div class="org-roots">
            <TreeNode 
              v-for="root in rootNodes" 
              :key="root.key" 
              :node="root" 
              :search-query="searchQuery"
              @select-node="showDetail"
            />
          </div>
        </div>
      </div>

    </div>

    <!-- Side Drawer for Position Details -->
    <Transition name="drawer">
      <div v-if="selectedNode" class="detail-drawer">
        <div class="drawer-header">
          <div class="header-icon" :class="getLevelClass(selectedNode.kd_jabatan)">
            <i class="fas fa-sitemap"></i>
          </div>
          <div class="header-titles">
            <h3>{{ selectedNode.name }}</h3>
            <p>{{ selectedNode.deptName }}</p>
          </div>
          <button class="btn-close" @click="selectedNode = null">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="drawer-body">
          <div class="info-card mb-4">
            <div class="info-row">
              <span class="info-label">Kode Jabatan</span>
              <span class="info-value"><code>{{ selectedNode.kd_jabatan }}</code></span>
            </div>
            <div class="info-row">
              <span class="info-label">ID Unit Kerja</span>
              <span class="info-value"><code>{{ selectedNode.dep_id }}</code></span>
            </div>
            <div class="info-row">
              <span class="info-label">Jumlah Personil</span>
              <span class="info-value font-bold text-primary">{{ positionHolders.length }} orang</span>
            </div>
          </div>

          <h4 class="section-title"><i class="fas fa-users"></i> Personil Aktif</h4>
          <div v-if="positionHolders.length > 0" class="holder-list">
            <div v-for="holder in positionHolders" :key="holder.nik" class="holder-card">
              <div class="holder-avatar">
                <img v-if="holder.photo && holder.photo !== '-'" :src="getPhotoUrl(holder.photo)" :alt="holder.nama" class="avatar-img" />
                <div v-else class="avatar-initials">{{ getInitials(holder.nama) }}</div>
              </div>
              <div class="holder-details">
                <span class="holder-name">{{ holder.nama }}</span>
                <div class="holder-meta">
                  <span class="badge-nik">NIK: {{ holder.nik }}</span>
                  <span class="holder-education">{{ holder.pendidikan }}</span>
                </div>
                <p class="holder-title-display text-muted">{{ holder.jbtn }}</p>
              </div>
            </div>
          </div>
          <div v-else class="holder-empty">
            <i class="fas fa-user-slash"></i>
            <p>Belum ada pegawai aktif di jabatan ini</p>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Drawer Overlay -->
    <div v-if="selectedNode" class="drawer-overlay" @click="selectedNode = null"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { pegawaiService } from '../../services/pegawaiService'
import config from '../../config/api'
import TreeNode from './components/TreeNode.vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

// State
const loading = ref(true)

const isAdministrator = computed(() => {
  const roleName = (authStore.userRole || '').toLowerCase()
  const userName = (authStore.userName || '').toLowerCase()
  const position = (authStore.user?.detail?.jbtn || authStore.user?.data?.detail?.jbtn || '').toLowerCase()
  
  return roleName.includes('admin') || 
         roleName.includes('administrator') || 
         userName.includes('admin') || 
         position.includes('admin')
})

const isDeptLocked = computed(() => {
  if (isAdministrator.value) {
    return false
  }
  return !!authStore.userDepartment && authStore.userDepartment !== '-'
})

const selectedDept = ref('ALL')

const hasUserDept = computed(() => {
  return !!authStore.userDepartment && authStore.userDepartment !== '-'
})

const userDeptName = computed(() => {
  const deptId = authStore.userDepartment
  if (!deptId || deptId === '-') return ''
  const dept = departments.value.find(d => d.dep_id === deptId)
  return dept ? dept.nama : deptId
})

const isInitialized = ref(false)

// Sync and set initial department selection on load
watch(() => authStore.userDepartment, (newDept) => {
  if (!isInitialized.value && newDept && newDept !== '-') {
    if (isDeptLocked.value) {
      selectedDept.value = newDept
    } else {
      selectedDept.value = 'ALL'
    }
    isInitialized.value = true
  }
}, { immediate: true })

const searchQuery = ref('')
const selectedNode = ref(null)

const mappings = ref([])
const departments = ref([])
const employees = ref([])
const rootNodes = ref([])
const positionHolders = ref([])

// Canvas state for zooming and panning
const canvasWrapper = ref(null)
const zoom = ref(0.9)
const panX = ref(100)
const panY = ref(50)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// Helper to determine position level styles
const getLevelClass = (code) => {
  if (!code) return 'level-staff'
  const c = code.toUpperCase()
  if (c === 'DIR' || c === 'RS1' || c === 'WD') return 'level-direksi'
  if (c === 'RS2' || c === 'RS3' || c === 'RS4' || c === 'RS5' || c === 'RS6' || c === 'RS7' || c === 'RS13' || c === 'RS15' || c === 'RS17') return 'level-manager'
  if (c === 'RS8') return 'level-koordinator'
  return 'level-staff'
}

// Navigation Zooming and Panning Methods
const zoomIn = () => {
  if (zoom.value < 2.0) zoom.value = parseFloat((zoom.value + 0.1).toFixed(2))
}

const zoomOut = () => {
  if (zoom.value > 0.4) zoom.value = parseFloat((zoom.value - 0.1).toFixed(2))
}

const resetView = () => {
  zoom.value = 0.9
  panX.value = 100
  panY.value = 50
}

const handleWheel = (e) => {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

const startDrag = (e) => {
  if (e.button !== 0) return // Only drag on left click
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - panX.value,
    y: e.clientY - panY.value
  }
}

const onDrag = (e) => {
  if (!isDragging.value) return
  panX.value = e.clientX - dragStart.value.x
  panY.value = e.clientY - dragStart.value.y
}

const endDrag = () => {
  isDragging.value = false
}

// Data Processing
const buildHierarchy = () => {
  const nodes = {}

  // 1. Get or create a node
  const getOrCreateNode = (kd_jabatan, dep_id, name, deptName) => {
    const key = `${kd_jabatan}_${dep_id}`
    if (!nodes[key]) {
      const holders = employees.value.filter(emp => 
        emp.jnj_jabatan === kd_jabatan && 
        (emp.dep?.dep_id === dep_id || emp.departemen === dep_id)
      )
      nodes[key] = {
        key, kd_jabatan, dep_id,
        name: name || kd_jabatan,
        deptName: deptName || dep_id,
        children: [], parents: [],
        holderCount: holders.length,
        holders: holders   // ← actual employee objects with nik, nama, photo, jbtn
      }
    }
    return nodes[key]
  }


  // 2. Build the raw graph (DAG)
  mappings.value.forEach(m => {
    if (!m.kd_jabatan_up || !m.kd_jabatan_down) return
    const upNode = getOrCreateNode(m.kd_jabatan_up, m.dep_id_up, m.nama_jabatan_up, m.nama_departemen_up)
    const downNode = getOrCreateNode(m.kd_jabatan_down, m.dep_id_down, m.nama_jabatan_down, m.nama_departemen_down)
    if (!upNode.children.some(c => c.key === downNode.key)) upNode.children.push(downNode)
    if (!downNode.parents.some(p => p.key === upNode.key)) downNode.parents.push(upNode)
  })

  // Helper: Convert a DAG subgraph into a tree by DFS with visited set (prevents duplicates)
  const dagToTree = (rootKeys) => {
    const visited = new Set()
    const cloneForTree = (key) => {
      if (visited.has(key)) return null  // already rendered elsewhere, skip
      visited.add(key)
      const orig = nodes[key]
      if (!orig) return null
      return {
        ...orig,
        parents: [],
        children: orig.children
          .map(child => cloneForTree(child.key))
          .filter(Boolean)
      }
    }
    return rootKeys.map(k => cloneForTree(k)).filter(Boolean)
  }

  // 3a. ALL view: start from true root nodes (no parents in the graph)
  if (!selectedDept.value || selectedDept.value === 'ALL') {
    const trueRoots = Object.values(nodes).filter(n => n.parents.length === 0).map(n => n.key)
    rootNodes.value = dagToTree(trueRoots)
    return
  }

  // 3b. Filtered view for a specific department
  const deptNodes = Object.values(nodes).filter(n => n.dep_id === selectedDept.value)
  if (deptNodes.length === 0) {
    rootNodes.value = []
    return
  }

  // Collect ancestors of dept nodes using BFS (avoiding duplicate traversal)
  const keepKeys = new Set()
  const bfsQueue = [...deptNodes]
  while (bfsQueue.length > 0) {
    const node = bfsQueue.shift()
    if (keepKeys.has(node.key)) continue
    keepKeys.add(node.key)
    node.parents.forEach(p => {
      if (!keepKeys.has(p.key)) bfsQueue.push(p)
    })
  }

  // Find roots in the filtered subgraph (nodes with no parents also in keepKeys)
  const filteredRoots = [...keepKeys].filter(k => {
    const orig = nodes[k]
    return !orig.parents.some(p => keepKeys.has(p.key))
  })

  // Build tree from filtered subgraph (DAG → Tree via DFS visited set)
  const visitedFilter = new Set()
  const cloneFiltered = (key) => {
    if (!keepKeys.has(key) || visitedFilter.has(key)) return null
    visitedFilter.add(key)
    const orig = nodes[key]
    if (!orig) return null
    return {
      ...orig,
      parents: [],
      children: orig.children
        .filter(c => keepKeys.has(c.key))
        .map(c => cloneFiltered(c.key))
        .filter(Boolean)
    }
  }

  rootNodes.value = filteredRoots.map(k => cloneFiltered(k)).filter(Boolean)
}

const showDetail = (node) => {
  selectedNode.value = node
  // Filter active employee holders
  positionHolders.value = employees.value.filter(emp => 
    emp.jnj_jabatan === node.kd_jabatan && 
    (emp.dep?.dep_id === node.dep_id || emp.departemen === node.dep_id)
  )
}

const getPhotoUrl = (photo) => {
  if (!photo || photo === '-') return ''
  return `${config.public.PHOTO_URL}${photo}`
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const loadData = async () => {
  loading.value = true
  try {
    // 1. Load mappings
    const mappingRes = await pegawaiService.getMappingJabatan({ per_page: 1000 })
    mappings.value = mappingRes.data.data.data || []

    // 2. Load active employees with jnj_jabatan and photo
    const employeeRes = await pegawaiService.getKaryawanList({ limit: 5000, stts_aktif: 'AKTIF' })
    employees.value = employeeRes.data.data || []

    // 3. Load departments for master list
    const deptRes = await pegawaiService.getMaster('departemen', { limit: 1000 })
    departments.value = deptRes.data.data || []

    // 4. Build structure
    buildHierarchy()
  } catch (error) {
    console.error('Failed to load organizational structure:', error)
  } finally {
    loading.value = false
  }
}

// Watch for filter changes
watch(selectedDept, () => {
  buildHierarchy()
  selectedNode.value = null
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.org-structure-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 134px);
  background-color: #f1f5f9;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025);
}

@media (max-width: 768px) {
  .org-structure-container {
    height: calc(100vh - 92px);
  }
}

/* Control Bar */
.control-bar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
}

.title-group h2 {
  font-size: 1.25rem;
  font-weight: 850;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.title-group p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 4px 0 0;
  font-weight: 500;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Search Box */
.search-box {
  position: relative;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.85rem;
  width: 240px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-box:focus-within {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  width: 280px;
}

.search-icon {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-right: 0.65rem;
}

.search-input {
  background: transparent;
  border: none;
  font-size: 0.875rem;
  outline: none;
  width: 100%;
  color: #1e293b;
  font-weight: 500;
}

.clear-search {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.1rem;
  transition: color 0.2s;
}

.clear-search:hover {
  color: #64748b;
}

/* Filter Group - Tab Toggle Style */
.tab-toggle-container {
  display: flex;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  gap: 0.25rem;
}

.tab-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.tab-toggle-btn:hover:not(.active) {
  color: #1e293b;
  background: rgba(226, 232, 240, 0.6);
}

.tab-toggle-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.tab-toggle-btn i {
  font-size: 0.85rem;
}

/* Canvas Controls */
.canvas-controls {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.3rem;
  gap: 0.15rem;
}

.btn-control {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-control:hover {
  background: #cbd5e1;
  color: #0f172a;
}

.zoom-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  padding: 0 0.65rem;
  min-width: 52px;
  text-align: center;
}

/* Canvas Wrapper — this is the only element that needs position:relative
   so the absolutely-positioned tree-canvas can be contained inside it */
.canvas-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  cursor: grab;
  user-select: none;
  background-color: #f8fafc;
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 20px 20px;
}

.canvas-wrapper.dragging {
  cursor: grabbing;
}

.help-overlay {
  position: absolute;
  bottom: 1rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.5rem 1rem;
  border-radius: 30px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
}

.help-overlay i {
  color: #3b82f6;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
}

.loading-state i {
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.tree-canvas {
  position: absolute;
  transform-origin: 0 0;
  will-change: transform;
  padding: 60px 80px;
}

/* Org chart wrapper — inline-block keeps it from stretching full width */
.org-tree {
  display: inline-block;
  white-space: nowrap;
}

/* When there are multiple root nodes (ALL view), show them side by side */
.org-roots {
  display: inline-flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 80px;
}

/* Detail Drawer CSS */
.detail-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.header-titles h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.header-titles p {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.btn-close {
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  background: #f1f5f9;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
}

.drawer-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.info-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #64748b;
}

.info-value {
  font-weight: 600;
  color: #334155;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #475569;
  margin: 1.5rem 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.holder-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.holder-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  transition: all 0.2s;
}

.holder-card:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.holder-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: #475569;
}

.holder-details {
  flex: 1;
  min-width: 0;
}

.holder-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  display: block;
}

.holder-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.badge-nik {
  font-size: 0.65rem;
  color: #db2777;
  font-weight: 600;
  background: #fdf2f8;
  padding: 1px 6px;
  border-radius: 4px;
}

.holder-education {
  font-size: 0.7rem;
  color: #64748b;
}

.holder-title-display {
  font-size: 0.75rem;
  margin: 4px 0 0 0;
  font-style: italic;
}

.holder-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  color: #94a3b8;
  text-align: center;
}

.holder-empty i {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.holder-empty p {
  font-size: 0.8rem;
  margin: 0;
}

/* Drawer Transitions */
.drawer-enter-active, .drawer-leave-active {
  transition: transform 0.3s ease-out;
}

.drawer-enter-from, .drawer-leave-to {
  transform: translateX(100%);
}

.drawer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(1px);
  z-index: 90;
}

@media (max-width: 480px) {
  .detail-drawer {
    width: 100%;
  }
}
</style>
