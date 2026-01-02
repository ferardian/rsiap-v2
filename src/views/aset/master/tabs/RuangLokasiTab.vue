<template>
  <div class="tab-container">
    <div class="section-card">
      <div class="section-header">
        <h3>Ruang & Lokasi Inventaris</h3>
        <button @click="openModal" class="btn-add">
          <i class="fas fa-plus"></i> Tambah
        </button>
      </div>
      
      <div class="search-bar">
        <input 
          v-model="search" 
          @input="fetchData"
          type="text" 
          placeholder="Cari ID / Nama Ruang..." 
          class="form-input"
        >
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th width="150">ID Ruang</th>
              <th>Nama Ruang</th>
              <th width="100">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="3" class="text-center">Memuat...</td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="3" class="text-center">Data kosong</td>
            </tr>
            <tr v-else v-for="item in items" :key="item.id_ruang">
              <td>{{ item.id_ruang }}</td>
              <td>{{ item.nama_ruang }}</td>
              <td>
                <div class="action-group">
                  <button @click="editItem(item)" class="btn-icon text-blue">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button @click="deleteItem(item.id_ruang)" class="btn-icon text-red">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit' : 'Tambah' }} Ruang</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveData">
          <div class="modal-body">
            <div class="form-group">
              <label>ID Ruang <span class="text-red">*</span></label>
              <input 
                v-model="form.id" 
                type="text" 
                class="form-input" 
                required 
                maxlength="5" 
                :disabled="isEdit"
                placeholder="Contoh: R01"
              >
              <small v-if="isEdit" class="text-muted">ID tidak dapat diubah</small>
            </div>
            <div class="form-group">
              <label>Nama Ruang <span class="text-red">*</span></label>
              <input 
                v-model="form.nama" 
                type="text" 
                class="form-input" 
                required 
                maxlength="40"
              >
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save" :disabled="saving">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { asetMasterService } from '@/services/asetMasterService'

// State
const items = ref([])
const loading = ref(false)
const search = ref('')

// Modal State
const showModal = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const form = reactive({ id: '', nama: '' })

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await asetMasterService.getRuang({ search: search.value, limit: 100 })
    if (res.data.data) items.value = res.data.data.data
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

// Actions
const generateNextId = () => {
  const prefix = 'RI'
  // Extract numbers from IDs
  const numbers = items.value
    .map(item => {
      const id = item.id_ruang
      if (id && id.startsWith(prefix)) {
        const num = parseInt(id.replace(prefix, ''), 10)
        return isNaN(num) ? 0 : num
      }
      return 0
    })
  
  const max = numbers.length > 0 ? Math.max(...numbers) : 0
  const next = max + 1
  
  // Pad with leading zeros to 3 digits
  return `${prefix}${next.toString().padStart(3, '0')}`
}

const openModal = () => {
  isEdit.value = false
  form.id = generateNextId()
  form.nama = ''
  showModal.value = true
}

const editItem = (item) => {
  isEdit.value = true
  form.id = item.id_ruang
  form.nama = item.nama_ruang
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveData = async () => {
  saving.value = true
  try {
    const payload = { id_ruang: form.id, nama_ruang: form.nama }
    if (isEdit.value) await asetMasterService.updateRuang(form.id, payload)
    else await asetMasterService.createRuang(payload)
    fetchData()
    closeModal()
  } catch (err) {
    alert('Gagal menyimpan: ' + (err.response?.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('Hapus ruang ini?')) return
  try {
    await asetMasterService.deleteRuang(id)
    fetchData()
  } catch (err) {
    alert('Gagal menghapus: ' + (err.response?.data?.message || err.message))
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Reusing common styles */
.section-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #334155;
}

.search-bar {
  margin-bottom: 1rem;
}

.form-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
}

.btn-add {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-add:hover {
  background: #2563eb;
}

.table-responsive {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 500px;
}

.data-table thead th {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, 
.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  font-size: 0.9rem;
}

.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.action-group {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  transition: transform 0.1s;
}

.btn-icon:hover {
  transform: scale(1.1);
}

.text-blue { color: #3b82f6; }
.text-red { color: #ef4444; }
.text-center { text-align: center; }
.text-muted { color: #94a3b8; font-size: 0.8rem; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 1.1rem; }

.close-btn {
  background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.btn-cancel {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: #334155;
}

.btn-save {
  background: #3b82f6;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: 500;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
