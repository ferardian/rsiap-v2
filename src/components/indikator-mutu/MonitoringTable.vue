<template>
  <div class="card shadow-sm border-0">
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th width="5%" class="text-center">#</th>
              <th width="35%">Indikator</th>
              <th width="15%">Standar</th>
              <th width="10%" class="text-center">Num</th>
              <th width="10%" class="text-center">Denum</th>
              <th width="15%" class="text-center">Capaian</th>
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
                <i class="fas fa-chart-bar fa-3x mb-3 opacity-50"></i>
                <p>Tidak ada data monitoring.</p>
              </td>
            </tr>
            <tr v-else v-for="(item, index) in items" :key="item.id_inmut">
              <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
              <td>
                <div class="fw-bold text-primary">{{ item.nama_inmut }}</div>
                <small class="text-muted">{{ item.nama_ruang }}</small>
              </td>
              <td>
                 {{ getRumusSymbol(item.rumus || item.rumus_utama) }} 
                 {{ item.standar || item.standar_utama }} 
                 {{ item.satuan || item.satuan_utama }}
              </td>
              <td class="text-center">{{ item.total_num }}</td>
              <td class="text-center">{{ item.total_denum }}</td>
              <td class="text-center">
                <span class="badge" :class="getBadgeClass(item.score, item.standar || item.standar_utama, item.rumus || item.rumus_utama)">
                    {{ parseFloat(item.score).toFixed(2) }}%
                </span>
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-info" @click="$emit('detail', item)" title="Detail / Analisa">
                  <i class="fas fa-search"></i>
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

defineEmits(['detail', 'change-page'])

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

const getBadgeClass = (score, standar, rumus) => {
    // Simple logic for checking if score meets standard based on rumus
    // Note: This is a simplified check. Accurate check needs parsing standar.
    let isPass = false;
    const std = parseFloat(standar);
    
    if (isNaN(std)) return 'bg-secondary';

    switch (String(rumus)) {
        case '1': isPass = score == std; break; // =
        case '2': isPass = score <= std; break; // <=
        case '3': isPass = score < std; break; // <
        case '4': isPass = score >= std; break; // >=
        case '5': isPass = score > std; break; // >
        default: return 'bg-secondary';
    }

    return isPass ? 'bg-success' : 'bg-danger';
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
