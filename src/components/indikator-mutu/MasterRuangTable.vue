<template>
  <div class="card shadow-sm border-0">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th width="5%" class="text-center">#</th>
              <th width="25%">Nama Indikator</th>
              <th width="15%">Ruang</th>
              <th width="15%">Jenis</th>
              <th width="10%" class="text-center">Status</th>
              <th width="15%">Standar</th>
              <th width="10%" class="text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                <p>Tidak ada data ditemukan.</p>
              </td>
            </tr>
            <tr v-else v-for="(item, index) in items" :key="item.id_inmut">
              <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
              <td>
                <div class="fw-bold text-primary">{{ item.nama_inmut }}</div>
                <small class="text-muted text-truncate d-block" style="max-width: 300px;">{{ stripHtml(item.definisi_operasional) }}</small>
              </td>
              <td>
                <span class="badge bg-light text-dark border">{{ item.nama_ruang || item.dep_id }}</span>
              </td>
               <td>
                {{ item.nama_jenis }}
              </td>
              <td class="text-center">
                <span v-if="item.status == '1'" class="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3">
                  <i class="fas fa-check-circle me-1"></i> Aktif
                </span>
                <span v-else class="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-3">
                  <i class="fas fa-times-circle me-1"></i> Non-Aktif
                </span>
              </td>
              <td>{{ getRumusSymbol(item.rumus) }} {{ item.standar }} {{ item.satuan }}</td>
              <td class="text-center">
                <div class="d-flex justify-content-center">
                  <button class="btn btn-sm btn-outline-primary me-1" @click="$emit('edit', item)" title="Edit">
                    <i class="fas fa-edit"></i>
                  </button>
                   <button v-if="item.status == '1'" class="btn btn-sm btn-outline-danger" @click="$emit('delete', item)" title="Non-aktifkan">
                     <i class="fas fa-trash"></i>
                   </button>
                   <button v-else class="btn btn-sm btn-outline-success" @click="$emit('activate', item)" title="Aktifkan">
                     <i class="fas fa-check-circle"></i>
                   </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
.pagination-rounded .page-link {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: var(--bs-primary);
    background: #f8f9fa;
    transition: all 0.2s ease;
}

.pagination-rounded .page-item.active .page-link {
    background-color: var(--bs-primary);
    color: white;
    box-shadow: 0 4px 10px rgba(var(--bs-primary-rgb), 0.3) !important;
}

.pagination-rounded .page-link:hover:not(.active) {
    background-color: #e9ecef;
    transform: translateY(-2px);
}

.pagination-rounded .page-item.disabled .page-link {
    opacity: 0.5;
    background: #f8f9fa;
    cursor: not-allowed;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .card-footer .d-flex {
    flex-direction: column !important;
    gap: 1rem !important;
    align-items: center !important;
  }
}
</style>
