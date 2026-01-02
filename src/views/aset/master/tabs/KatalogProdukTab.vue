<template>
  <div class="tab-container">
    <div class="split-view">
      <!-- Merk Section -->
      <div class="section-card">
        <div class="section-header">
          <h3>Merk Inventaris</h3>
          <button @click="openModal('merk')" class="btn-add">
            <i class="fas fa-plus"></i> Tambah
          </button>
        </div>
        
        <div class="search-bar">
          <input 
            v-model="filters.merk" 
            @input="fetchMerk"
            type="text" 
            placeholder="Cari Merk ID / Nama..." 
            class="form-input"
          >
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Merk</th>
                <th width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingMerk">
                <td colspan="3" class="text-center">Memuat...</td>
              </tr>
              <tr v-else-if="listMerk.length === 0">
                <td colspan="3" class="text-center">Data kosong</td>
              </tr>
              <tr v-else v-for="item in listMerk" :key="item.id_merk">
                <td>{{ item.id_merk }}</td>
                <td>{{ item.nama_merk }}</td>
                <td>
                  <div class="action-group">
                    <button @click="editItem('merk', item)" class="btn-icon text-blue">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button @click="deleteItem('merk', item.id_merk)" class="btn-icon text-red">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Produsen Section -->
      <div class="section-card">
        <div class="section-header">
          <h3>Produsen Inventaris</h3>
          <button @click="openModal('produsen')" class="btn-add">
            <i class="fas fa-plus"></i> Tambah
          </button>
        </div>

        <div class="search-bar">
          <input 
            v-model="filters.produsen" 
            @input="fetchProdusen"
            type="text" 
            placeholder="Cari Kode / Nama Produsen..." 
            class="form-input"
          >
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Produsen</th>
                <th>Telp</th>
                <th width="100">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingProdusen">
                <td colspan="4" class="text-center">Memuat...</td>
              </tr>
              <tr v-else-if="listProdusen.length === 0">
                <td colspan="4" class="text-center">Data kosong</td>
              </tr>
              <tr v-else v-for="item in listProdusen" :key="item.kode_produsen">
                <td>{{ item.kode_produsen }}</td>
                <td>
                  <div class="font-bold">{{ item.nama_produsen }}</div>
                  <div class="text-xs text-slate-500">{{ item.website_produsen }}</div>
                </td>
                <td>{{ item.no_telp }}</td>
                <td>
                  <div class="action-group">
                    <button @click="editItem('produsen', item)" class="btn-icon text-blue">
                      <i class="fas fa-pen"></i>
                    </button>
                    <button @click="deleteItem('produsen', item.kode_produsen)" class="btn-icon text-red">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit' : 'Tambah' }} {{ modalType === 'merk' ? 'Merk' : 'Produsen' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveData">
          <div class="modal-body">
            <!-- Common ID Field -->
            <div class="form-group">
              <label>{{ modalType === 'merk' ? 'ID Merk' : 'Kode Produsen' }} <span class="text-red">*</span></label>
              <input 
                v-model="form.id" 
                type="text" 
                class="form-input" 
                required 
                maxlength="10" 
                :disabled="isEdit"
              >
              <small v-if="isEdit" class="text-muted">ID tidak dapat diubah</small>
            </div>
            
            <div class="form-group">
              <label>Nama {{ modalType === 'merk' ? 'Merk' : 'Produsen' }} <span class="text-red">*</span></label>
              <input 
                v-model="form.nama" 
                type="text" 
                class="form-input" 
                required 
                maxlength="40"
              >
            </div>

            <!-- Produsen Specific Fields -->
            <template v-if="modalType === 'produsen'">
              <div class="form-group">
                <label>Alamat</label>
                <input v-model="form.alamat" type="text" class="form-input" maxlength="70">
              </div>
              <div class="row-2">
                <div class="form-group">
                  <label>No. Telp</label>
                  <input v-model="form.no_telp" type="text" class="form-input" maxlength="13">
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input v-model="form.email" type="email" class="form-input" maxlength="25">
                </div>
              </div>
              <div class="form-group">
                <label>Website</label>
                <input v-model="form.website" type="text" class="form-input" maxlength="30">
              </div>
            </template>

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
const listMerk = ref([])
const listProdusen = ref([])
const loadingMerk = ref(false)
const loadingProdusen = ref(false)
const filters = reactive({ merk: '', produsen: '' })

// Modal State
const showModal = ref(false)
const modalType = ref('merk') // 'merk' or 'produsen'
const isEdit = ref(false)
const saving = ref(false)
const form = reactive({ 
  id: '', 
  nama: '',
  // Produsen extra fields
  alamat: '',
  no_telp: '',
  email: '',
  website: ''
})

// Fetch Data
const fetchMerk = async () => {
  loadingMerk.value = true
  try {
    const res = await asetMasterService.getMerk({ search: filters.merk, limit: 100 })
    if (res.data.data) listMerk.value = res.data.data.data
  } catch(e) { console.error(e) }
  finally { loadingMerk.value = false }
}

const fetchProdusen = async () => {
  loadingProdusen.value = true
  try {
    const res = await asetMasterService.getProdusen({ search: filters.produsen, limit: 100 })
    if (res.data.data) listProdusen.value = res.data.data.data
  } catch(e) { console.error(e) }
  finally { loadingProdusen.value = false }
}

// Actions
const generateNextId = (type) => {
  const prefix = type === 'merk' ? 'MI' : 'PD'
  const list = type === 'merk' ? listMerk.value : listProdusen.value
  const padLength = type === 'merk' ? 5 : 8
  
  // Extract numbers from IDs that match the prefix
  const numbers = list
    .map(item => {
      const id = type === 'merk' ? item.id_merk : item.kode_produsen
      if (id && id.startsWith(prefix)) {
        const num = parseInt(id.replace(prefix, ''), 10)
        return isNaN(num) ? 0 : num
      }
      return 0
    })
  
  const max = numbers.length > 0 ? Math.max(...numbers) : 0
  const next = max + 1
  
  // Pad with leading zeros
  return `${prefix}${next.toString().padStart(padLength, '0')}`
}

const openModal = (type) => {
  modalType.value = type
  isEdit.value = false
  // Reset Form
  Object.keys(form).forEach(key => form[key] = '')
  // Auto-fill ID
  form.id = generateNextId(type)
  showModal.value = true
}

const editItem = (type, item) => {
  modalType.value = type
  isEdit.value = true
  if (type === 'merk') {
    form.id = item.id_merk
    form.nama = item.nama_merk
  } else {
    form.id = item.kode_produsen
    form.nama = item.nama_produsen
    form.alamat = item.alamat_produsen
    form.no_telp = item.no_telp
    form.email = item.email
    form.website = item.website_produsen
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveData = async () => {
  saving.value = true
  try {
    if (modalType.value === 'merk') {
      const payload = { id_merk: form.id, nama_merk: form.nama }
      if (isEdit.value) await asetMasterService.updateMerk(form.id, payload)
      else await asetMasterService.createMerk(payload)
      fetchMerk()
    } else {
      const payload = { 
        kode_produsen: form.id, 
        nama_produsen: form.nama,
        alamat_produsen: form.alamat,
        no_telp: form.no_telp,
        email: form.email,
        website_produsen: form.website
      }
      if (isEdit.value) await asetMasterService.updateProdusen(form.id, payload)
      else await asetMasterService.createProdusen(payload)
      fetchProdusen()
    }
    closeModal()
  } catch (err) {
    alert('Gagal menyimpan: ' + (err.response?.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

const deleteItem = async (type, id) => {
  if (!confirm('Hapus data ini?')) return
  try {
    if (type === 'merk') {
      await asetMasterService.deleteMerk(id)
      fetchMerk()
    } else {
      await asetMasterService.deleteProdusen(id)
      fetchProdusen()
    }
  } catch (err) {
    alert('Gagal menghapus: ' + (err.response?.data?.message || err.message))
  }
}

onMounted(() => {
  fetchMerk()
  fetchProdusen()
})
</script>

<style scoped>
/* Reusing styles from common if possible, or copy-pasting for isolation */
.split-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  height: 100%;
}

@media (max-width: 1024px) {
  .split-view {
    grid-template-columns: 1fr;
  }
}

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
.text-xs { font-size: 0.75rem; }
.text-slate-500 { color: #64748b; }
.font-bold { font-weight: 600; }

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
  max-width: 500px;
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

.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
