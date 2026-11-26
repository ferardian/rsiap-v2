<template>
  <div class="order-surat-kontrol-wrapper">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-title d-flex align-items-center gap-2">
            <span>🏥</span> Order Surat Kontrol Ranap (Trigger Resume)
          </h1>
          <p class="page-subtitle mb-0">
            Antrean penerbitan Surat Kontrol BPJS otomatis dari Resume Medis Rawat Inap (Batas Maksimal Penerbitan: <strong>H+1</strong> setelah Update Pulang SEP)
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button
            type="button"
            class="btn btn-outline-primary fw-semibold shadow-sm d-flex align-items-center gap-2 px-3 py-2"
            :disabled="loading"
            @click="fetchOrders"
          >
            <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'"></i>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-2">
        <div
          class="card summary-card border-0 shadow-sm h-100 cursor-pointer"
          :class="{ 'ring-active': filter.status === 'ALL' }"
          @click="setStatusFilter('ALL')"
        >
          <div class="card-body p-3">
            <div class="small text-muted fw-semibold">Total Order</div>
            <div class="fs-4 fw-bold text-dark mt-1">{{ summary.total || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div
          class="card summary-card border-0 shadow-sm h-100 cursor-pointer border-start border-4 border-primary"
          :class="{ 'ring-active': filter.status === 'SIAP_TERBIT' }"
          @click="setStatusFilter('SIAP_TERBIT')"
        >
          <div class="card-body p-3">
            <div class="small text-primary fw-semibold">Siap Terbit</div>
            <div class="fs-4 fw-bold text-primary mt-1">{{ summary.siap_terbit || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div
          class="card summary-card border-0 shadow-sm h-100 cursor-pointer border-start border-4 border-warning"
          :class="{ 'ring-active': filter.status === 'BELUM_PULANG_SEP' }"
          @click="setStatusFilter('BELUM_PULANG_SEP')"
        >
          <div class="card-body p-3">
            <div class="small text-warning-emphasis fw-semibold">Blm Pulang SEP</div>
            <div class="fs-4 fw-bold text-warning-emphasis mt-1">{{ summary.belum_pulang_sep || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div
          class="card summary-card border-0 shadow-sm h-100 cursor-pointer border-start border-4 border-danger"
          :class="{ 'ring-active': filter.status === 'LEWAT_H1' }"
          @click="setStatusFilter('LEWAT_H1')"
        >
          <div class="card-body p-3">
            <div class="small text-danger fw-semibold">Lewat Batas H+1</div>
            <div class="fs-4 fw-bold text-danger mt-1">{{ summary.lewat_h1 || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div
          class="card summary-card border-0 shadow-sm h-100 cursor-pointer border-start border-4 border-info"
          :class="{ 'ring-active': filter.status === 'PERLU_UPDATE_SKRJ' }"
          @click="setStatusFilter('PERLU_UPDATE_SKRJ')"
        >
          <div class="card-body p-3">
            <div class="small text-info-emphasis fw-semibold">Perlu Update</div>
            <div class="fs-4 fw-bold text-info-emphasis mt-1">{{ summary.perlu_update || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-2">
        <div
          class="card summary-card border-0 shadow-sm h-100 cursor-pointer border-start border-4 border-success"
          :class="{ 'ring-active': filter.status === 'TERBIT' }"
          @click="setStatusFilter('TERBIT')"
        >
          <div class="card-body p-3">
            <div class="small text-success fw-semibold">Sudah Terbit</div>
            <div class="fs-4 fw-bold text-success mt-1">{{ summary.terbit || 0 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card glass-card border-0 shadow-sm mb-4">
      <div class="card-body p-3">
        <form @submit.prevent="fetchOrders" class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted mb-1">Status Order</label>
            <select v-model="filter.status" class="form-select form-select-sm" @change="fetchOrders">
              <option value="ALL">Semua Status (Aktif)</option>
              <option value="SIAP_TERBIT">Siap Terbit (SEP Sudah Pulang)</option>
              <option value="BELUM_PULANG_SEP">Belum Update Pulang SEP</option>
              <option value="LEWAT_H1">Lewat Batas Maksimal H+1</option>
              <option value="PERLU_UPDATE_SKRJ">Perlu Update SKRJ (Revisi Resume)</option>
              <option value="GAGAL_TERBIT">Gagal Terbit VClaim</option>
              <option value="TERBIT">Sudah Terbit</option>
            </select>
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-bold text-muted mb-1">Tgl Kontrol Awal</label>
            <input v-model="filter.tgl_awal" type="date" class="form-control form-control-sm">
          </div>
          <div class="col-md-2">
            <label class="form-label small fw-bold text-muted mb-1">Tgl Kontrol Akhir</label>
            <input v-model="filter.tgl_akhir" type="date" class="form-control form-control-sm">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted mb-1">Pencarian Pasien / SEP / RM</label>
            <input
              v-model="filter.keyword"
              type="text"
              class="form-control form-control-sm"
              placeholder="Nama, No. RM, No. SEP, Dokter..."
            >
          </div>
          <div class="col-md-2 d-flex gap-1">
            <button type="submit" class="btn btn-primary btn-sm flex-fill fw-semibold" :disabled="loading">
              <i class="fas fa-search me-1"></i> Cari
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" @click="resetFilter" title="Reset Filter">
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabel Antrean Order -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0" style="font-size: 0.875rem;">
            <thead class="table-light">
              <tr>
                <th class="ps-3" width="4%">No</th>
                <th width="22%">Pasien &amp; SEP Ranap</th>
                <th width="16%">Status Pulang SEP</th>
                <th width="16%">Tgl Kontrol (Resume)</th>
                <th width="20%">DPJP &amp; Poli Tujuan BPJS</th>
                <th width="12%">Status &amp; No. SKRJ</th>
                <th class="text-center pe-3" width="10%">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5 text-muted">
                  <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                  Memuat antrean order surat kontrol...
                </td>
              </tr>
              <tr v-else-if="orders.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-2x d-block mb-2 opacity-50"></i>
                  Belum ada data antrean order surat kontrol untuk filter yang dipilih.
                </td>
              </tr>
              <tr v-for="(item, idx) in orders" :key="item.id">
                <td class="ps-3 font-monospace text-muted">{{ idx + 1 }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ item.nm_pasien || '-' }}</div>
                  <div class="small text-muted">
                    RM: <span class="font-monospace fw-semibold text-dark">{{ item.no_rkm_medis }}</span>
                    <span class="mx-1">&bull;</span>
                    <span>{{ item.nm_bangsal || '-' }}</span>
                  </div>
                  <div class="small font-monospace text-primary mt-0.5">
                    SEP: {{ item.no_sep || '-' }}
                  </div>
                </td>
                <td>
                  <div v-if="item.belum_pulang_sep">
                    <span class="badge bg-danger text-white rounded-pill px-2 py-1">
                      <i class="fas fa-exclamation-triangle me-1"></i> Belum Update Pulang SEP
                    </span>
                    <div class="small text-danger mt-1" style="font-size: 0.72rem;">
                      Update tanggal pulang SEP terlebih dahulu
                    </div>
                  </div>
                  <div v-else>
                    <span class="badge bg-success-subtle text-success border border-success rounded-pill px-2 py-1">
                      <i class="fas fa-check-circle me-1"></i> Tgl Pulang: {{ formatTanggal(item.tgl_pulang_sep) }}
                    </span>
                    <div class="mt-1" style="font-size: 0.74rem;">
                      <span v-if="item.sla_status === 'LEWAT_H1'" class="text-danger fw-bold">
                        <i class="fas fa-fire me-1"></i> Lewat Batas H+1 ({{ formatTanggal(item.batas_maksimal_h1) }})
                      </span>
                      <span v-else-if="item.sla_status === 'BATAS_HARI_INI'" class="text-warning-emphasis fw-bold">
                        <i class="fas fa-clock me-1"></i> Batas Terakhir Hari Ini ({{ formatTanggal(item.batas_maksimal_h1) }})
                      </span>
                      <span v-else-if="item.sla_status === 'AMAN'" class="text-muted">
                        Batas Maks: {{ formatTanggal(item.batas_maksimal_h1) }} (H+1)
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-primary fs-6">{{ formatTanggal(item.tgl_kontrol_resume) }}</div>
                  <div class="small text-muted">{{ getNamaHari(item.tgl_kontrol_resume) }}</div>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ item.nm_dokter_bpjs || item.nm_dokter_rs || '-' }}</div>
                  <div class="small">
                    <span v-if="item.kd_dokter_bpjs" class="badge bg-light text-dark border font-monospace me-1">
                      {{ item.kd_dokter_bpjs }}
                    </span>
                    <span v-else class="badge bg-danger-subtle text-danger border border-danger me-1">
                      Dokter Blm Mapping
                    </span>
                    <span v-if="item.kd_poli_bpjs" class="badge bg-info-subtle text-info-emphasis border border-info">
                      {{ item.kd_poli_bpjs }} - {{ item.nm_poli_bpjs }}
                    </span>
                    <span v-else class="badge bg-danger-subtle text-danger border border-danger">
                      Poli Blm Mapping
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge rounded-pill px-2 py-1" :class="getStatusBadgeClass(item.status_order)">
                    {{ formatStatusLabel(item.status_order) }}
                  </span>
                  <div v-if="item.no_surat_kontrol" class="small font-monospace fw-bold text-success mt-1">
                    {{ item.no_surat_kontrol }}
                  </div>
                  <div v-if="item.status_order === 'GAGAL_TERBIT' && item.response_bpjs" class="small text-danger mt-1" style="font-size: 0.72rem;">
                    {{ item.response_bpjs }}
                  </div>
                </td>
                <td class="text-center pe-3">
                  <div class="d-flex justify-content-center gap-1">
                    <button
                      v-if="item.status_order !== 'TERBIT'"
                      type="button"
                      class="btn btn-sm fw-semibold"
                      :class="item.belum_pulang_sep ? 'btn-outline-secondary' : (item.status_order === 'PERLU_UPDATE_SKRJ' ? 'btn-info text-white' : 'btn-primary')"
                      :disabled="processingId === item.id || item.belum_pulang_sep"
                      :title="item.belum_pulang_sep ? 'Update tanggal pulang SEP terlebih dahulu' : 'Terbitkan Surat Kontrol ke VClaim BPJS'"
                      @click="handleTerbitkan(item)"
                    >
                      <i class="fas" :class="processingId === item.id ? 'fa-spinner fa-spin' : (item.status_order === 'PERLU_UPDATE_SKRJ' ? 'fa-edit' : 'fa-paper-plane')"></i>
                      <span class="ms-1">{{ item.status_order === 'PERLU_UPDATE_SKRJ' ? 'Update' : 'Terbitkan' }}</span>
                    </button>
                    <button
                      v-if="item.status_order !== 'TERBIT'"
                      type="button"
                      class="btn btn-outline-secondary btn-sm"
                      :disabled="processingId === item.id"
                      title="Cek Ulang Status SEP di Database"
                      @click="handleSyncSep(item)"
                    >
                      <i class="fas fa-sync"></i>
                    </button>
                    <span v-if="item.status_order === 'TERBIT'" class="text-success small fw-bold">
                      <i class="fas fa-check-double"></i> Selesai
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Override Mapping Dokter / Poli jika belum termapping -->
    <div v-if="modalMapping.show" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.55);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white py-2 px-3">
            <h6 class="modal-title fw-bold mb-0">Lengkapi Mapping &amp; Terbitkan SKRJ</h6>
            <button type="button" class="btn-close btn-close-white" @click="modalMapping.show = false"></button>
          </div>
          <div class="modal-body p-3">
            <div class="alert alert-light border small mb-3">
              <strong>{{ modalMapping.item?.nm_pasien }}</strong><br>
              No. SEP: <span class="font-monospace">{{ modalMapping.item?.no_sep }}</span> &bull;
              Tgl Kontrol: <strong>{{ formatTanggal(modalMapping.item?.tgl_kontrol_resume) }}</strong>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Dokter Tujuan BPJS</label>
              <select v-model="modalMapping.kd_dokter_bpjs" class="form-select form-select-sm" @change="onSelectDokterMapping">
                <option value="">-- Pilih Dokter BPJS --</option>
                <option v-for="d in refDokter" :key="d.kd_dokter_bpjs" :value="d.kd_dokter_bpjs">
                  {{ d.nm_dokter_bpjs }} ({{ d.kd_dokter_bpjs }})
                </option>
              </select>
            </div>
            <div class="mb-2">
              <label class="form-label small fw-bold">Poli Tujuan BPJS</label>
              <select v-model="modalMapping.kd_poli_bpjs" class="form-select form-select-sm" @change="onSelectPoliMapping">
                <option value="">-- Pilih Poli BPJS --</option>
                <option v-for="p in refPoli" :key="p.kd_poli_bpjs" :value="p.kd_poli_bpjs">
                  {{ p.nm_poli_bpjs }} ({{ p.kd_poli_bpjs }})
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer py-2 px-3">
            <button type="button" class="btn btn-secondary btn-sm" @click="modalMapping.show = false">Batal</button>
            <button type="button" class="btn btn-primary btn-sm fw-bold" @click="submitTerbitkanDenganMapping">
              <i class="fas fa-paper-plane me-1"></i> Terbitkan ke VClaim
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bpjsVclaimService from '@/services/bpjsVclaimService';
import Swal from 'sweetalert2';

export default {
  name: 'OrderSuratKontrolView',
  data() {
    return {
      loading: false,
      processingId: null,
      orders: [],
      summary: {
        total: 0,
        belum_pulang_sep: 0,
        siap_terbit: 0,
        lewat_h1: 0,
        gagal: 0,
        perlu_update: 0,
        terbit: 0,
      },
      filter: {
        status: 'ALL',
        tgl_awal: '',
        tgl_akhir: '',
        keyword: '',
      },
      refDokter: [],
      refPoli: [],
      modalMapping: {
        show: false,
        item: null,
        kd_dokter_bpjs: '',
        nm_dokter_bpjs: '',
        kd_poli_bpjs: '',
        nm_poli_bpjs: '',
      },
    };
  },
  mounted() {
    this.fetchOrders();
    this.fetchReferensi();
  },
  methods: {
    async fetchOrders() {
      this.loading = true;
      try {
        const res = await bpjsVclaimService.getOrderSuratKontrol(this.filter);
        if (res.data?.success) {
          this.orders = res.data.data || [];
          this.summary = res.data.summary || this.summary;
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Gagal', err.response?.data?.message || 'Gagal memuat antrean order surat kontrol.', 'error');
      } finally {
        this.loading = false;
      }
    },
    async fetchReferensi() {
      try {
        const res = await bpjsVclaimService.getOrderSuratKontrolReferensi();
        if (res.data?.success) {
          this.refDokter = res.data.dokter || [];
          this.refPoli = res.data.poli || [];
        }
      } catch (err) {
        console.error('Gagal memuat referensi mapping:', err);
      }
    },
    setStatusFilter(status) {
      this.filter.status = status;
      this.fetchOrders();
    },
    resetFilter() {
      this.filter = {
        status: 'ALL',
        tgl_awal: '',
        tgl_akhir: '',
        keyword: '',
      };
      this.fetchOrders();
    },
    handleTerbitkan(item) {
      // Jika kode dokter atau poli BPJS belum termapping, buka modal lengkapi mapping dulu
      if (!item.kd_dokter_bpjs || !item.kd_poli_bpjs) {
        this.modalMapping = {
          show: true,
          item,
          kd_dokter_bpjs: item.kd_dokter_bpjs || '',
          nm_dokter_bpjs: item.nm_dokter_bpjs || '',
          kd_poli_bpjs: item.kd_poli_bpjs || '',
          nm_poli_bpjs: item.nm_poli_bpjs || '',
        };
        return;
      }

      Swal.fire({
        title: item.status_order === 'PERLU_UPDATE_SKRJ' ? 'Update Surat Kontrol BPJS?' : 'Terbitkan Surat Kontrol BPJS?',
        html: `
          <div class="text-start small">
            <div><strong>Pasien:</strong> ${item.nm_pasien} (${item.no_rkm_medis})</div>
            <div><strong>No. SEP:</strong> ${item.no_sep}</div>
            <div><strong>Tgl Kontrol (Resume):</strong> <span class="text-primary fw-bold">${this.formatTanggal(item.tgl_kontrol_resume)}</span></div>
            <div><strong>Dokter / Poli:</strong> ${item.nm_dokter_bpjs} / ${item.nm_poli_bpjs}</div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kirim ke BPJS',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#0d6efd',
      }).then((result) => {
        if (result.isConfirmed) {
          this.executeTerbitkan(item.id, {});
        }
      });
    },
    onSelectDokterMapping() {
      const found = this.refDokter.find((d) => d.kd_dokter_bpjs === this.modalMapping.kd_dokter_bpjs);
      this.modalMapping.nm_dokter_bpjs = found ? found.nm_dokter_bpjs : '';
    },
    onSelectPoliMapping() {
      const found = this.refPoli.find((p) => p.kd_poli_bpjs === this.modalMapping.kd_poli_bpjs);
      this.modalMapping.nm_poli_bpjs = found ? found.nm_poli_bpjs : '';
    },
    submitTerbitkanDenganMapping() {
      if (!this.modalMapping.kd_dokter_bpjs || !this.modalMapping.kd_poli_bpjs) {
        Swal.fire('Peringatan', 'Dokter BPJS dan Poli BPJS wajib dipilih.', 'warning');
        return;
      }
      const id = this.modalMapping.item.id;
      const payload = {
        kd_dokter_bpjs: this.modalMapping.kd_dokter_bpjs,
        nm_dokter_bpjs: this.modalMapping.nm_dokter_bpjs,
        kd_poli_bpjs: this.modalMapping.kd_poli_bpjs,
        nm_poli_bpjs: this.modalMapping.nm_poli_bpjs,
      };
      this.modalMapping.show = false;
      this.executeTerbitkan(id, payload);
    },
    async executeTerbitkan(id, payload) {
      this.processingId = id;
      try {
        const res = await bpjsVclaimService.terbitkanOrderSuratKontrol(id, payload);
        if (res.data?.success) {
          Swal.fire('Berhasil!', res.data.message, 'success');
          this.fetchOrders();
        } else {
          Swal.fire('Gagal VClaim', res.data?.message || 'Gagal menerbitkan surat kontrol.', 'error');
          this.fetchOrders();
        }
      } catch (err) {
        Swal.fire('Gagal VClaim', err.response?.data?.message || 'Terjadi kesalahan saat menghubungi VClaim BPJS.', 'error');
        this.fetchOrders();
      } finally {
        this.processingId = null;
      }
    },
    async handleSyncSep(item) {
      this.processingId = item.id;
      try {
        const res = await bpjsVclaimService.syncOrderSuratKontrolSep(item.id);
        if (res.data?.success) {
          this.fetchOrders();
        }
      } catch (err) {
        Swal.fire('Gagal', err.response?.data?.message || 'Gagal sinkronisasi SEP.', 'error');
      } finally {
        this.processingId = null;
      }
    },
    formatTanggal(tgl) {
      if (!tgl) return '-';
      const parts = String(tgl).split(' ')[0].split('-');
      if (parts.length !== 3) return tgl;
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    },
    getNamaHari(tgl) {
      if (!tgl) return '';
      const d = new Date(tgl);
      if (isNaN(d.getTime())) return '';
      return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
    },
    formatStatusLabel(status) {
      const map = {
        BELUM_PULANG_SEP: 'Blm Pulang SEP',
        SIAP_TERBIT: 'Siap Terbit',
        TERBIT: 'Terbit',
        GAGAL_TERBIT: 'Gagal Terbit',
        PERLU_UPDATE_SKRJ: 'Perlu Update SKRJ',
        BATAL: 'Batal',
      };
      return map[status] || status;
    },
    getStatusBadgeClass(status) {
      const map = {
        BELUM_PULANG_SEP: 'bg-warning-subtle text-warning-emphasis border border-warning',
        SIAP_TERBIT: 'bg-primary-subtle text-primary border border-primary',
        TERBIT: 'bg-success-subtle text-success border border-success',
        GAGAL_TERBIT: 'bg-danger-subtle text-danger border border-danger',
        PERLU_UPDATE_SKRJ: 'bg-info-subtle text-info-emphasis border border-info',
      };
      return map[status] || 'bg-secondary-subtle text-secondary';
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.cursor-pointer:hover {
  transform: translateY(-2px);
}
.ring-active {
  box-shadow: 0 0 0 2px #0d6efd !important;
}
.page-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
}
.page-subtitle {
  font-size: 0.875rem;
  color: #64748b;
}
</style>

