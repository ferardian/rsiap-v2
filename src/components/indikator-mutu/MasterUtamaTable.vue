<template>
  <div class="card border-0">
    <div class="card-body p-0">
      <div class="table-responsive d-none d-md-block">
        <table class="table table-hover align-middle mb-0 clean-table">
          <thead>
            <tr>
              <th width="4%" class="text-center">#</th>
              <th width="32%">Nama Indikator</th>
              <th width="18%">Kategori</th>
              <th width="10%" class="text-center">Status</th>
              <th width="12%">Standar</th>
              <th width="10%">Satuan</th>
              <th width="14%" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-5">
                <div class="spinner-border text-primary spinner-border-sm" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                <i class="fas fa-inbox fa-2x mb-2 opacity-40"></i>
                <p class="small mb-0">Tidak ada data ditemukan.</p>
              </td>
            </tr>
            <tr v-else v-for="(item, index) in items" :key="item.id_master">
              <td class="text-center text-slate-400 font-mono small">{{ (page - 1) * limit + index + 1 }}</td>
              <td>
                <div class="inmut-title">{{ item.nama_inmut }}</div>
                <div class="inmut-def text-truncate" style="max-width: 380px;" :title="stripHtml(item.definisi)">{{ stripHtml(item.definisi) }}</div>
              </td>
              <td>
                <span class="badge-kategori">{{ item.kategori }}</span>
              </td>
              <td class="text-center">
                 <span v-if="item.status == '1'" class="badge-status active">
                   <i class="fas fa-check-circle"></i> Aktif
                 </span>
                 <span v-else class="badge-status inactive">
                   <i class="fas fa-times-circle"></i> Non-Aktif
                 </span>
               </td>
              <td class="fw-semibold text-slate-700 small">{{ getRumusSymbol(item.rumus) }} {{ item.standar }}</td>
              <td class="text-slate-600 small">{{ item.satuan || '-' }}</td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn-action-icon edit" @click="$emit('edit', item)" title="Edit">
                    <i class="fas fa-pen"></i>
                  </button>
                  <button v-if="item.status == '1'" class="btn-action-icon delete" @click="$emit('delete', item)" title="Non-aktifkan">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                  <button v-else class="btn-action-icon activate" @click="$emit('activate', item)" title="Aktifkan">
                    <i class="fas fa-check-circle"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="d-md-none p-3">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="items.length === 0" class="text-center py-5 text-muted">
          <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
          <p>Tidak ada data ditemukan.</p>
        </div>
        <div v-else v-for="(item, index) in items" :key="item.id_master" class="card mb-3 border shadow-sm rounded-3 overflow-hidden">
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-light text-dark border small">{{ item.kategori }}</span>
              <span v-if="item.status == '1'" class="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2">
                 Aktif
              </span>
              <span v-else class="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-2">
                 Non-Aktif
              </span>
            </div>
            <h6 class="fw-bold text-primary mb-1">{{ item.nama_inmut }}</h6>
            <p class="text-muted small mb-3 text-truncate-2">{{ stripHtml(item.definisi) }}</p>
            
            <div class="row g-2 mb-3 bg-light p-2 rounded-3">
              <div class="col-6">
                <small class="text-muted d-block">Standar</small>
                <span class="fw-bold">{{ getRumusSymbol(item.rumus) }} {{ item.standar }}</span>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Satuan</small>
                <span class="fw-bold">{{ item.satuan || '-' }}</span>
              </div>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-primary flex-grow-1 py-2 rounded-3" @click="$emit('edit', item)">
                <i class="fas fa-edit me-1"></i> Edit
              </button>
              <button v-if="item.status == '1'" class="btn btn-outline-danger py-2 rounded-3" @click="$emit('delete', item)">
                <i class="fas fa-trash"></i>
              </button>
              <button v-else class="btn btn-outline-success py-2 rounded-3" @click="$emit('activate', item)">
                <i class="fas fa-check-circle"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card-footer bg-white border-top py-3">
      <div class="d-flex justify-content-between align-items-center">
        <div class="text-muted small">
          Menampilkan 
          <span class="fw-bold text-dark" v-if="items.length > 0">
            {{ (page - 1) * limit + 1 }} - {{ (page - 1) * limit + items.length }}
          </span>
          <span class="fw-bold text-dark" v-else>0</span>
          dari <span class="fw-bold text-dark">{{ total }}</span> data
        </div>
        <nav aria-label="Page navigation" v-if="totalPages > 1">
          <ul class="pagination pagination-rounded mb-0 gap-1">
            <li class="page-item" :class="{ disabled: page === 1 }">
              <button class="page-link border-0 shadow-sm rounded-circle" @click="$emit('change-page', page - 1)" aria-label="Previous">
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            
            <template v-for="p in displayedPages" :key="p">
              <li v-if="p === '...'" class="page-item disabled">
                <span class="page-link border-0 bg-transparent">...</span>
              </li>
              <li v-else class="page-item" :class="{ active: page === p }">
                <button class="page-link border-0 shadow-sm rounded-circle mx-1" @click="$emit('change-page', p)">
                  {{ p }}
                </button>
              </li>
            </template>

            <li class="page-item" :class="{ disabled: page === totalPages }">
              <button class="page-link border-0 shadow-sm rounded-circle" @click="$emit('change-page', page + 1)" aria-label="Next">
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: Array,
  loading: Boolean,
  total: Number,
  page: Number,
  limit: Number,
  totalPages: Number
})

defineEmits(['edit', 'delete', 'activate', 'change-page'])

const displayedPages = computed(() => {
    const current = props.page
    const last = props.totalPages
    const delta = 2
    const left = current - delta
    const right = current + delta + 1
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= last; i++) {
        if (i === 1 || i === last || (i >= left && i < right)) {
            range.push(i)
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1)
            } else if (i - l !== 1) {
                rangeWithDots.push('...')
            }
        }
        rangeWithDots.push(i)
        l = i
    }

    return rangeWithDots
})

const stripHtml = (html) => {
   if (!html) return ''
   const tmp = document.createElement("DIV")
   tmp.innerHTML = html
   return tmp.textContent || tmp.innerText || ""
}

const getRumusSymbol = (val) => {
    const map = {
        '1': '',
        '2': '≤',
        '3': '<',
        '4': '≥',
        '5': '>'
    }
    return map[val] !== undefined ? map[val] : (val || '')
}
</script>

<style scoped>
.clean-table {
  border-collapse: separate;
  border-spacing: 0;
}

.clean-table thead th {
  background-color: #f8fafc;
  color: #64748b;
  font-size: 0.725rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.clean-table tbody td {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.clean-table tbody tr:hover {
  background-color: #f8fafc;
}

.inmut-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.85rem;
  line-height: 1.3;
}

.inmut-def {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 1px;
}

.badge-kategori {
  display: inline-block;
  padding: 3px 8px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.badge-status.active {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.badge-status.inactive {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-action-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: #f8fafc;
  color: #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.775rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-icon.edit:hover {
  background: #eff6ff;
  color: #2563eb;
}

.btn-action-icon.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.btn-action-icon.activate:hover {
  background: #ecfdf5;
  color: #10b981;
}

.pagination-rounded .page-link {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 0.775rem;
  color: #475569;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.pagination-rounded .page-item.active .page-link {
  background-color: #2563eb;
  color: white;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25) !important;
}

.pagination-rounded .page-link:hover:not(.active) {
  background-color: #e2e8f0;
}

.text-slate-400 { color: #94a3b8; }
.text-slate-600 { color: #475569; }
.text-slate-700 { color: #334155; }

/* Mobile Responsive */
@media (max-width: 768px) {
  .card-footer .d-flex {
    flex-direction: column !important;
    gap: 1rem !important;
    align-items: center !important;
  }
}
</style>
