<template>
  <div class="menu-node" :class="{ 'parent-menu': menu.children && menu.children.length }">
    <div class="menu-header" @click="toggleExpanded">
      <div class="menu-info">
        <i :class="menuIcon" class="menu-toggle-icon"></i>
        <span class="menu-name">{{ menu.nama_menu }}</span>
      </div>
      <div class="menu-actions" @click.stop>
        <button 
          class="btn-select-all" 
          @click="toggleSelectAll"
          :class="{ 'all-selected': areAllPermissionsSelected }"
          title="Toggle All Permissions"
        >
          <i :class="areAllPermissionsSelected ? 'fas fa-check-square' : 'far fa-square'"></i>
          <span class="d-none d-sm-inline ms-1">Select All</span>
        </button>
      </div>
    </div>

    <div v-if="expanded" class="permissions-grid">
      <div class="permission-item" v-for="perm in permissions" :key="perm.key">
        <label class="permission-label">
          <input
            type="checkbox"
            :checked="menu.permissions[perm.key]"
            @change="updatePermission(perm.key, $event.target.checked)"
            class="form-check-input"
          />
          <i :class="perm.icon" class="permission-icon"></i>
          {{ perm.label }}
        </label>
      </div>
    </div>

    <div v-if="expanded && menu.children && menu.children.length > 0" class="child-menus">
      <MenuPermissionNode
        v-for="child in menu.children"
        :key="child.id_menu"
        :menu="child"
        @permission-changed="$emit('permission-changed', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  menu: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['permission-changed'])

const expanded = ref(true)

const menuIcon = computed(() => {
  if (props.menu.children && props.menu.children.length > 0) {
    return expanded.value ? 'fas fa-chevron-down' : 'fas fa-chevron-right'
  }
  return 'fas fa-file'
})

const permissions = [
  { key: 'can_view', label: 'View', icon: 'fas fa-eye' },
  { key: 'can_create', label: 'Create', icon: 'fas fa-plus' },
  { key: 'can_update', label: 'Update', icon: 'fas fa-edit' },
  { key: 'can_delete', label: 'Delete', icon: 'fas fa-trash' },
  { key: 'can_export', label: 'Export', icon: 'fas fa-download' },
  { key: 'can_import', label: 'Import', icon: 'fas fa-upload' }
]

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const areAllPermissionsSelected = computed(() => {
  return permissions.every(p => props.menu.permissions[p.key])
})

const toggleSelectAll = () => {
  const newValue = !areAllPermissionsSelected.value
  permissions.forEach(p => {
    props.menu.permissions[p.key] = newValue
  })
  emit('permission-changed', props.menu)
}

const updatePermission = (key, value) => {
  // Directly mutate the prop object (often okay for deep objects in Vue but event is safer)
  // However, since we're just emitting the change for logging/tracking, mutation works for v-model like behavior
  // But strictly we should emit an update.
  // The parent implementation relied on mutation: props.menu.permissions[key] = value
  // Let's keep it consistent with the previous inline component
  props.menu.permissions[key] = value
  emit('permission-changed', props.menu)
}
</script>

<style scoped>
.menu-node {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: border-color 0.2s;
}

.menu-node:hover {
  border-color: #cbd5e1;
}

.menu-node.parent-menu {
  border-left: 4px solid #3b82f6;
}

.menu-header {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-header:hover {
  background: #f1f5f9;
}

.menu-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle-icon {
  color: #94a3b8;
  width: 20px;
  text-align: center;
}

.menu-name {
  font-weight: 600;
  color: #334155;
  font-size: 1rem;
}

.btn-select-all {
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #64748b;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.btn-select-all:hover {
  background: white;
  border-color: #94a3b8;
  color: #334155;
}

.btn-select-all.all-selected {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

.permissions-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.permission-item {
  background: white;
}

.permission-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  font-size: 0.9rem;
  color: #475569;
}

.permission-label:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.form-check-input {
  width: 1.1em;
  height: 1.1em;
  cursor: pointer;
  accent-color: #3b82f6;
}

.permission-icon {
  color: #94a3b8;
  font-size: 0.9rem;
}

.child-menus {
  padding: 0 1.5rem 1.5rem 2.5rem;
  border-top: 1px solid #e2e8f0;
  background: #fafafa;
}

/* Recursive node spacing */
.child-menus .menu-node {
  margin-top: 1rem;
  margin-bottom: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
</style>
