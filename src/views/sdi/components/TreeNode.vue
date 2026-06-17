<template>
  <div class="tree-branch">

    <!-- ===== NODE CARD ===== -->
    <div
      class="node-card"
      :class="[getLevelClass(node.kd_jabatan), { 'highlighted': isHighlighted }]"
      @click="$emit('select-node', node)"
    >
      <div class="accent-bar"></div>

      <!-- Header: level badge + department code -->
      <div class="node-header">
        <div class="level-tag-wrapper">
          <i class="node-level-icon fas" :class="getLevelIcon(node.kd_jabatan)"></i>
          <span class="node-badge-level">{{ getLevelBadge(node.kd_jabatan) }}</span>
        </div>
        <span class="node-badge-unit">{{ node.dep_id }}</span>
      </div>

      <!-- Title: position name + department name -->
      <div class="node-body">
        <h4 class="node-title">{{ node.name }}</h4>
        <p class="node-subtitle">{{ node.deptName }}</p>
      </div>

      <!-- Divider -->
      <div class="node-divider"></div>

      <!-- Personnel section -->
      <div class="personnel-section">
        <!-- Has employees: show their names + photo avatars -->
        <template v-if="node.holders && node.holders.length > 0">
          <div
            v-for="emp in node.holders.slice(0, 3)"
            :key="emp.nik"
            class="personnel-row"
          >
            <!-- Avatar -->
            <div class="personnel-avatar" :class="getLevelClass(node.kd_jabatan)">
              <img
                v-if="emp.photo && emp.photo !== '-'"
                :src="getPhotoUrl(emp.photo)"
                :alt="emp.nama"
                class="avatar-img"
                @error="$event.target.style.display = 'none'"
              />
              <span v-else class="avatar-initials">{{ getInitials(emp.nama) }}</span>
            </div>
            <!-- Name -->
            <div class="personnel-info">
              <span class="personnel-name">{{ emp.nama }}</span>
              <span class="personnel-nik">{{ emp.nik }}</span>
            </div>
          </div>
          <!-- More than 3 -->
          <div v-if="node.holders.length > 3" class="personnel-more">
            <i class="fas fa-ellipsis-h"></i>
            <span>+{{ node.holders.length - 3 }} lainnya</span>
          </div>
        </template>

        <!-- No employees: vacant badge -->
        <div v-else class="holder-vacant">
          <i class="fas fa-chair"></i>
          <span>Posisi Belum Terisi</span>
        </div>
      </div>

    </div>


    <!-- ===== CHILDREN CONNECTOR + SUBTREES ===== -->
    <template v-if="node.children && node.children.length > 0">
      <!-- Vertical stem going down from card -->
      <div class="v-stem"></div>

      <!-- Row of child subtrees -->
      <div class="children-row">
        <div
          v-for="(child, idx) in node.children"
          :key="child.key"
          class="child-col"
          :class="{
            'c-only':   node.children.length === 1,
            'c-first':  idx === 0 && node.children.length > 1,
            'c-last':   idx === node.children.length - 1 && node.children.length > 1,
            'c-middle': idx > 0 && idx < node.children.length - 1
          }"
        >
          <TreeNode
            :node="child"
            :search-query="searchQuery"
            @select-node="(n) => $emit('select-node', n)"
          />
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import config from '../../../config/api'

const props = defineProps({
  node: Object,
  searchQuery: String
})

defineEmits(['select-node'])

const isHighlighted = computed(() => {
  if (!props.searchQuery) return false
  const q = props.searchQuery.toLowerCase()
  const holderNames = (props.node.holders || []).map(h => h.nama?.toLowerCase() || '')
  return props.node.name.toLowerCase().includes(q) ||
         props.node.deptName.toLowerCase().includes(q) ||
         props.node.kd_jabatan.toLowerCase().includes(q) ||
         holderNames.some(n => n.includes(q))
})

const getLevelClass = (code) => {
  if (!code) return 'level-staff'
  const c = code.toUpperCase()
  if (c === 'DIR' || c === 'RS1' || c === 'WD') return 'level-direksi'
  if (['RS2','RS3','RS4','RS5','RS6','RS7','RS13','RS15','RS17'].includes(c)) return 'level-manager'
  if (c === 'RS8') return 'level-koordinator'
  return 'level-staff'
}

const getLevelBadge = (code) => {
  if (!code) return 'STAF'
  const c = code.toUpperCase()
  if (c === 'DIR' || c === 'RS1' || c === 'WD') return 'DIREKSI'
  if (['RS2','RS3','RS17'].includes(c)) return 'MANAJER'
  if (['RS4','RS5','RS6','RS7','RS13','RS15'].includes(c)) return 'ASST. MGR'
  if (c === 'RS8') return 'KOORD.'
  return 'STAF'
}

const getLevelIcon = (code) => {
  if (!code) return 'fa-user'
  const c = code.toUpperCase()
  if (c === 'DIR' || c === 'RS1' || c === 'WD') return 'fa-crown'
  if (['RS2','RS3','RS4','RS5','RS6','RS7','RS13','RS15','RS17'].includes(c)) return 'fa-briefcase'
  if (c === 'RS8') return 'fa-users'
  return 'fa-user'
}

const getPhotoUrl = (photo) => {
  if (!photo || photo === '-') return ''
  return `${config.public.PHOTO_URL}${photo}`
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
</script>

<style scoped>
/* =====================================================
   ORG CHART TREE BRANCH LAYOUT
   Each .tree-branch = one node + its subtree, centred
   ===================================================== */

.tree-branch {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

/* Vertical line going DOWN from the card to the children row */
.v-stem {
  width: 2px;
  height: 36px;
  background: #94a3b8;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

/* Row containing all child subtrees side-by-side */
.children-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
}

/* Each child's wrapper column */
.child-col {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
}

/* ── Horizontal branch bar segments ──────────────────
   Each child-col::before draws its HALF of the H-bar
   at top: 0 (where v-stem ends / children-row starts) */

.child-col:not(.c-only)::before {
  content: '';
  position: absolute;
  top: 0;
  height: 2px;
  background: #94a3b8;
}

/* First sibling: bar covers right half only */
.child-col.c-first::before  { left: 50%; right: 0; }
/* Last sibling:  bar covers left  half only */
.child-col.c-last::before   { left: 0;   right: 50%; }
/* Middle siblings: full bar */
.child-col.c-middle::before { left: 0;   right: 0; }

/* ── Vertical drop line per child ────────────────────
   Drops 36px from the H-bar down to the child's card */

.child-col:not(.c-only)::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 36px;
  background: #94a3b8;
}

/* Push child cards below the connector region (H-bar + vertical drop) */
.child-col:not(.c-only) {
  padding-top: 36px;
}

/* Only child: v-stem already provides the straight connector,
   so no extra bar, no extra drop, no extra padding needed */
.child-col.c-only::before,
.child-col.c-only::after {
  display: none;
}

/* =====================================================
   NODE CARD STYLES
   ===================================================== */

.node-card {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 1.1rem 1rem;
  display: inline-flex;
  flex-direction: column;
  width: 220px;
  text-align: left;
  box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  white-space: normal;
}

.node-card:hover {
  transform: translateY(-5px) scale(1.02);
}

.node-card.highlighted {
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15), 0 16px 24px -4px rgba(245, 158, 11, 0.1);
  transform: translateY(-5px) scale(1.03);
}

/* Accent top-bar gradient per level */
.accent-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
  border-radius: 14px 14px 0 0;
}

/* Node Header */
.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.level-tag-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
}

.node-level-icon {
  font-size: 0.7rem;
}

.node-badge-level {
  font-size: 0.6rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.node-badge-unit {
  font-size: 0.6rem;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 5px;
  border: 1px solid #e2e8f0;
}

/* Node Body */
.node-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.3rem 0;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.node-subtitle {
  font-size: 0.72rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* Node Divider */
.node-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.75rem 0 0.6rem;
}

/* Personnel section */
.personnel-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* One employee row: avatar + name/nik */
.personnel-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Avatar circle */
.personnel-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 0.65rem;
  font-weight: 800;
  color: white;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}

/* Avatar image */
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Avatar initials fallback */
.avatar-initials {
  line-height: 1;
}

/* Initials background colour per level */
.level-direksi .avatar-initials,
.level-direksi.personnel-avatar { background: linear-gradient(135deg, #ef4444, #ec4899); }

.level-manager .avatar-initials,
.level-manager.personnel-avatar { background: linear-gradient(135deg, #3b82f6, #06b6d4); }

.level-koordinator .avatar-initials,
.level-koordinator.personnel-avatar { background: linear-gradient(135deg, #f59e0b, #eab308); }

.level-staff .avatar-initials,
.level-staff.personnel-avatar { background: linear-gradient(135deg, #10b981, #14b8a6); }

/* Employee name + NIK */
.personnel-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.personnel-name {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 155px;
}

.personnel-nik {
  font-size: 0.6rem;
  color: #94a3b8;
  font-weight: 500;
}

/* +X lainnya badge */
.personnel-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 2px 8px;
  margin-top: 2px;
}

/* Vacant position: amber dashed border tag */
.holder-vacant {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #92400e;
  background: #fffbeb;
  border: 1px dashed #fbbf24;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  font-style: italic;
}


/* =====================================================
   LEVEL THEMES (Accent bar + badge colours)
   ===================================================== */

/* DIREKSI — red/pink */
.level-direksi .accent-bar       { background: linear-gradient(90deg, #ef4444, #ec4899); }
.level-direksi .node-badge-level  { background: #fee2e2; color: #b91c1c; }
.level-direksi .node-level-icon   { color: #ef4444; }
.level-direksi:hover              { box-shadow: 0 20px 28px -6px rgba(239,68,68,.14); border-color: rgba(239,68,68,.3); }

/* MANAJER — blue/cyan */
.level-manager .accent-bar        { background: linear-gradient(90deg, #3b82f6, #06b6d4); }
.level-manager .node-badge-level  { background: #dbeafe; color: #1d4ed8; }
.level-manager .node-level-icon   { color: #3b82f6; }
.level-manager:hover              { box-shadow: 0 20px 28px -6px rgba(59,130,246,.14); border-color: rgba(59,130,246,.3); }

/* KOORDINATOR — amber */
.level-koordinator .accent-bar        { background: linear-gradient(90deg, #f59e0b, #eab308); }
.level-koordinator .node-badge-level  { background: #fef3c7; color: #b45309; }
.level-koordinator .node-level-icon   { color: #f59e0b; }
.level-koordinator:hover              { box-shadow: 0 20px 28px -6px rgba(245,158,11,.14); border-color: rgba(245,158,11,.3); }

/* STAF — green/teal */
.level-staff .accent-bar        { background: linear-gradient(90deg, #10b981, #14b8a6); }
.level-staff .node-badge-level  { background: #dcfce7; color: #15803d; }
.level-staff .node-level-icon   { color: #10b981; }
.level-staff:hover              { box-shadow: 0 20px 28px -6px rgba(16,185,129,.14); border-color: rgba(16,185,129,.3); }
</style>
