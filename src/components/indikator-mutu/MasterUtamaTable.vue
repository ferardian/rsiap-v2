<template>
  <div class="card shadow-sm border-0">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th width="5%" class="text-center">#</th>
              <th width="30%">Nama Indikator</th>
              <th width="20%">Kategori</th>
              <th width="15%">Standar</th>
              <th width="15%">Satuan</th>
              <th width="15%" class="text-end pe-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                <p>Tidak ada data ditemukan.</p>
              </td>
            </tr>
            <tr v-else v-for="(item, index) in items" :key="item.id_master">
              <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
              <td>
                <div class="fw-bold text-primary">{{ item.nama_inmut }}</div>
                <small class="text-muted text-truncate d-block" style="max-width: 300px;">{{ stripHtml(item.definisi) }}</small>
              </td>
              <td>
                <span class="badge bg-light text-dark border">{{ item.kategori }}</span>
              </td>
              <td>{{ getRumusSymbol(item.rumus) }} {{ item.standar }}</td>
              <td>{{ item.satuan }}</td>
              <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary me-1" @click="$emit('edit', item)" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="$emit('delete', item)" title="Hapus">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="card-footer bg-white border-top py-3">
      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          Menampilkan {{ items.length }} dari {{ total }} data
        </small>
        <nav aria-label="Page navigation" v-if="totalPages > 1">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: page === 1 }">
              <button class="page-link" @click="$emit('change-page', page - 1)">Previous</button>
            </li>
            <li class="page-item" :class="{ active: page === p }" v-for="p in totalPages" :key="p">
              <button class="page-link" @click="$emit('change-page', p)">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: page === totalPages }">
              <button class="page-link" @click="$emit('change-page', page + 1)">Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: Array,
  loading: Boolean,
  total: Number,
  page: Number,
  limit: Number,
  totalPages: Number
})

defineEmits(['edit', 'delete', 'change-page'])

const stripHtml = (html) => {
   if (!html) return ''
   const tmp = document.createElement("DIV")
   tmp.innerHTML = html
   return tmp.textContent || tmp.innerText || ""
}

const getRumusSymbol = (val) => {
    const map = {
        '1': '=',
        '2': '≤',
        '3': '<',
        '4': '≥',
        '5': '>'
    }
    return map[val] || val || ''
}
</script>

<style scoped>
/* Mobile Responsive */
@media (max-width: 768px) {
  .card-footer .d-flex {
    flex-direction: column !important;
    gap: 0.75rem !important;
    align-items: flex-start !important;
  }

  .pagination {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    flex-wrap: nowrap !important;
    width: 100% !important;
  }

  .pagination .page-item {
    flex-shrink: 0 !important;
  }

  .pagination .page-link {
    font-size: 0.75rem !important;
    padding: 0.375rem 0.5rem !important;
  }
}
</style>
