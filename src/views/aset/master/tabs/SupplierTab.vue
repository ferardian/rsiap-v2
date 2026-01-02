<template>
  <div class="tab-container">
    <div class="section-card">
      <div class="section-header">
        <h3>Supplier Aset & Inventaris</h3>
        <button @click="openModal" class="btn-add">
          <i class="fas fa-plus"></i> Tambah
        </button>
      </div>
      
      <div class="search-bar">
        <input 
          v-model="search" 
          @input="fetchData"
          type="text" 
          placeholder="Cari Kode / Nama Supplier..." 
          class="form-input"
        >
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Supplier</th>
              <th>Alamat & Kota</th>
              <th>Bank & Rekening</th>
              <th width="100">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center">Memuat...</td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="5" class="text-center">Data kosong</td>
            </tr>
            <tr v-else v-for="item in items" :key="item.kode_suplier">
              <td>{{ item.kode_suplier }}</td>
              <td>
                <div class="font-bold">{{ item.nama_suplier }}</div>
                <div class="text-xs text-slate-500">{{ item.no_telp }}</div>
              </td>
              <td>
                <div class="text-sm">{{ item.alamat }}</div>
                <div class="text-xs text-slate-500">{{ item.kota }}</div>
              </td>
              <td>
                <div v-if="item.nama_bank" class="text-sm font-semibold">{{ item.nama_bank }}</div>
                <div v-if="item.rekening" class="text-xs">{{ item.rekening }}</div>
                <div v-if="!item.nama_bank && !item.rekening" class="text-xs text-muted">-</div>
              </td>
              <td>
                <div class="action-group">
                  <button @click="editItem(item)" class="btn-icon text-blue">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button @click="deleteItem(item.kode_suplier)" class="btn-icon text-red">
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
          <h3>{{ isEdit ? 'Edit' : 'Tambah' }} Supplier</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <form @submit.prevent="saveData">
          <div class="modal-body">
            <div class="form-group">
              <label>Kode Supplier <span class="text-red">*</span></label>
              <input 
                v-model="form.id" 
                type="text" 
                class="form-input" 
                required 
                maxlength="5" 
                :disabled="isEdit"
              >
              <small v-if="isEdit" class="text-muted">Kode tidak dapat diubah</small>
            </div>
            <div class="form-group">
              <label>Nama Supplier <span class="text-red">*</span></label>
              <input 
                v-model="form.nama" 
                type="text" 
                class="form-input" 
                required 
                maxlength="50"
              >
            </div>
            
            <div class="row-2">
              <div class="form-group">
                <label>Kota</label>
                <input v-model="form.kota" type="text" class="form-input" maxlength="20">
              </div>
              <div class="form-group">
                <label>No. Telp</label>
                <input v-model="form.no_telp" type="text" class="form-input" maxlength="13">
              </div>
            </div>

            <div class="form-group">
              <label>Alamat</label>
              <textarea v-model="form.alamat" class="form-input" maxlength="50" rows="2"></textarea>
            </div>

            <div class="row-2">
              <div class="form-group">
                <label>Nama Bank</label>
                <input v-model="form.bank" type="text" class="form-input" maxlength="30">
              </div>
              <div class="form-group">
                <label>No. Rekening</label>
                <input v-model="form.rekening" type="text" class="form-input" maxlength="20">
              </div>
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
const form = reactive({ 
  id: '', 
  nama: '',
  alamat: '',
  kota: '',
  no_telp: '',
  bank: '',
  rekening: ''
})

// Fetch Data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await asetMasterService.getSuplier({ search: search.value, limit: 100 })
    if (res.data.data) items.value = res.data.data.data
  } catch(e) { console.error(e) }
  finally { loading.value = false }
}

// Actions
const openModal = () => {
  isEdit.value = false
  // Reset
  Object.keys(form).forEach(key => form[key] = '')
  showModal.value = true
}

const editItem = (item) => {
  isEdit.value = true
  form.id = item.kode_suplier
  form.nama = item.nama_suplier
  form.alamat = item.alamat
  form.kota = item.kota
  form.no_telp = item.no_telp
  form.bank = item.nama_bank
  form.rekening = item.rekening
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveData = async () => {
  saving.value = true
  try {
    const payload = { 
      kode_suplier: form.id, 
      nama_suplier: form.nama,
      alamat: form.alamat,
      kota: form.kota,
      no_telp: form.no_telp,
      nama_bank: form.bank,
      rekening: form.rekening
    }
    
    if (isEdit.value) await asetMasterService.updateSuplier(form.id, payload)
    else await asetMasterService.createSuplier(payload)
    fetchData()
    closeModal()
  } catch (err) {
    alert('Gagal menyimpan: ' + (err.response?.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('Hapus supplier ini?')) return
  try {
    await asetMasterService.deleteSuplier(id)
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
  max-height: 600px;
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
.text-sm { font-size: 0.85rem; }
.text-slate-500 { color: #64748b; }
.font-bold { font-weight: 600; }
.font-semibold { font-weight: 500; }

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
