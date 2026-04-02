<template>
  <div class="satusehat-patient-view">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div class="header-text">
        <h2 class="page-title mb-1">Monitoring Pasien (SatuSehat)</h2>
        <p class="page-subtitle text-secondary mb-0">Daftar pasien dengan NIK bermasalah atau belum terdaftar di SatuSehat</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4 animate__animated animate__fadeInDown">
      <div class="card-body text-white">
        <div class="row g-3">
          <div class="col-md-9 text-dark">
            <label class="form-label text-xs fw-bold text-uppercase text-muted mb-2 tracking-wide text-dark">Cari Pasien (Nama / No RM / NIK)</label>
            <div class="search-input-wrapper">
              <input 
                type="text" 
                class="form-control form-control-custom" 
                v-model="filters.keyword"
                placeholder="Masukkan kata kunci..."
                @keyup.enter="fetchData(true)"
              >
            </div>
          </div>
          <div class="col-md-3 d-flex align-items-end text-dark">
            <button class="btn btn-primary w-100" @click="fetchData(true)">
              <i class="fas fa-search me-2"></i> Cari Pasien
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm animate__animated animate__fadeInUp">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-custom mb-0">
            <thead>
              <tr>
                <th class="ps-4">No. RM</th>
                <th>Nama Pasien</th>
                <th>NIK / No. KTP</th>
                <th>No. HP / Telepon</th>
                <th>Alamat</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                  <p class="text-muted mt-2 mb-0">Memuat data pasien...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6" class="text-center py-5">
                  <i class="fas fa-user-check fa-3x text-muted mb-3 opacity-50"></i>
                  <h6 class="text-muted">Tidak ada pasien dengan NIK bermasalah (Hore!)</h6>
                </td>
              </tr>
              <tr v-for="(item, index) in items" :key="index" v-else>
                <td class="ps-4">
                  <span class="badge bg-light text-primary border fw-bold">{{ item.no_rkm_medis }}</span>
                </td>
                <td>
                  <span class="fw-bold text-dark d-block mb-1 text-uppercase">{{ item.nm_pasien }}</span>
                  <span class="text-xs text-muted">
                    {{ item.jk === 'L' ? 'Laki-laki' : 'Perempuan' }} • {{ item.tgl_lahir }}
                  </span>
                </td>
                <td>
                  <span :class="item.no_ktp ? 'text-dark' : 'text-danger italic'">
                    {{ item.no_ktp || 'NIK Kosong' }}
                  </span>
                </td>
                <td>
                  <span class="text-sm text-dark">
                    <i class="fas fa-phone-alt me-1 text-muted text-xs"></i> {{ item.no_tlp || '-' }}
                  </span>
                </td>
                <td>
                  <span class="text-xs text-muted d-block text-truncate" style="max-width: 250px;" :title="item.alamat">
                    {{ item.alamat || '-' }}
                  </span>
                </td>
                <td class="text-center pe-4">
                  <button class="btn btn-sm btn-outline-success rounded-pill px-3" @click="openRegisterModal(item)">
                    <i class="fas fa-user-plus me-1"></i> Register FHIR
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="card-footer bg-white border-top-0 py-3" v-if="pagination.total > 0">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div class="text-muted text-sm pb-1">
            Menampilkan <span class="fw-bold text-dark">{{ pagination.from || 0 }}</span> 
            sampai <span class="fw-bold text-dark">{{ pagination.to || 0 }}</span> 
            dari <span class="fw-bold text-dark">{{ pagination.total }}</span> data
          </div>
          
          <nav aria-label="Page navigation" v-if="pagination.last_page > 1">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
                <button class="page-link" @click="changePage(pagination.current_page - 1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              <li class="page-item" v-for="page in displayedPages" :key="page" :class="{ active: page === pagination.current_page }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
                <button class="page-link" @click="changePage(pagination.current_page + 1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Registration Modal -->
    <div class="modal fade" id="registerPatientModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-user-plus me-2"></i>Registrasi Pasien Baru SatuSehat</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4 bg-light">
            <div class="alert alert-info border-0 shadow-sm mb-4">
              <i class="fas fa-info-circle me-1"></i> 
              Lengkapi data berikut untuk mendaftarkan pasien ke SatuSehat. 
              <strong>Provinsi, Kota, Kecamatan, dan Kelurahan</strong> adalah wajib untuk standar SatuSehat ID.
            </div>

            <form @submit.prevent="submitRegistration">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold">NIK / No. KTP</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.no_ktp" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Nama Pasien</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.nm_pasien" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">No. Kartu Keluarga (KK)</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.no_kk" placeholder="Opsional">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">No. Passport</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.passport" placeholder="Opsional (untuk WNA)">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">Jenis Kelamin</label>
                  <select class="form-select shadow-sm" v-model="form.jk" required>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">Tanggal Lahir</label>
                  <input type="date" class="form-control shadow-sm" v-model="form.tgl_lahir" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">Tempat Lahir (Kota)</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.tmp_lahir">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">Status Nikah</label>
                  <select class="form-select shadow-sm" v-model="form.stts_nikah">
                    <option value="BELUM MENIKAH">Belum Menikah</option>
                    <option value="MENIKAH">Menikah</option>
                    <option value="JANDA">Janda</option>
                    <option value="DUDA">Duda</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">No. Telepon</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.no_tlp">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">Email</label>
                  <input type="email" class="form-control shadow-sm" v-model="form.email">
                </div>
                
                <div class="col-12 mt-4">
                  <h6 class="fw-bold border-bottom pb-2 mb-3 text-success"><i class="fas fa-map-marker-alt me-2"></i>Wilayah Administrasi</h6>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Provinsi</label>
                  <v-select
                    v-model="form.provinsi_kode"
                    :options="options.provinsi"
                    :reduce="p => p.code"
                    :get-option-label="opt => typeof opt === 'object' ? `${opt.code} - ${opt.name}` : opt"
                    placeholder="Pilih Provinsi..."
                    @update:modelValue="onProvinsiChange"
                    class="shadow-sm bg-white rounded"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Kabupaten / Kota</label>
                  <v-select
                    v-model="form.kabupaten_kode"
                    :options="options.kabupaten"
                    :reduce="k => k.code"
                    :get-option-label="opt => typeof opt === 'object' ? `${opt.code} - ${opt.name}` : opt"
                    placeholder="Pilih Kabupaten..."
                    @update:modelValue="onKabupatenChange"
                    :disabled="!form.provinsi_kode"
                    class="shadow-sm bg-white rounded"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Kecamatan</label>
                  <v-select
                    v-model="form.kecamatan_kode"
                    :options="options.kecamatan"
                    :reduce="k => k.code"
                    :get-option-label="opt => typeof opt === 'object' ? `${opt.code} - ${opt.name}` : opt"
                    placeholder="Pilih Kecamatan..."
                    @update:modelValue="onKecamatanChange"
                    :disabled="!form.kabupaten_kode"
                    class="shadow-sm bg-white rounded"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Kelurahan</label>
                  <v-select
                    v-model="form.kelurahan_kode"
                    :options="options.kelurahan"
                    :reduce="k => k.code"
                    :get-option-label="opt => typeof opt === 'object' ? `${opt.code} - ${opt.name}` : opt"
                    placeholder="Pilih Kelurahan..."
                    :disabled="!form.kecamatan_kode"
                    class="shadow-sm bg-white rounded"
                  />
                </div>
                
                <div class="col-md-4">
                  <label class="form-label small fw-bold">RT</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.rt" placeholder="001">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">RW</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.rw" placeholder="002">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">Kode Pos</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.kodepos">
                </div>
                <div class="col-12">
                  <label class="form-label small fw-bold">Alamat Detail</label>
                  <textarea class="form-control shadow-sm" v-model="form.alamat" rows="2"></textarea>
                </div>
              </div>
              
              <div class="modal-footer px-0 pb-0 pt-4 border-0 bg-transparent">
                <button type="button" class="btn btn-light border" @click="closeModal">Batal</button>
                <button type="submit" class="btn btn-success px-4" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="fas fa-save me-1"></i> Daftarkan ke SatuSehat
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import satuSehatService from '@/services/satuSehatService'
import publicWilayahService from '@/services/publicWilayahService'
import Swal from 'sweetalert2'
import { Modal } from 'bootstrap'

export default {
  name: 'SatuSehatPatientView',
  data() {
    return {
      items: [],
      loading: false,
      submitting: false,
      isAutoFilling: false,
      filters: {
        keyword: ''
      },
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
      },
      modal: null,
      form: {
        no_rkm_medis: '',
        no_ktp: '',
        nm_pasien: '',
        no_kk: '',
        passport: '',
        jk: 'L',
        tgl_lahir: '',
        tmp_lahir: '',
        stts_nikah: 'BELUM MENIKAH',
        no_tlp: '',
        email: '',
        alamat: '',
        provinsi_kode: '',
        kabupaten_kode: '',
        kecamatan_kode: '',
        kelurahan_kode: '',
        rt: '000',
        rw: '000',
        kodepos: ''
      },
      options: {
        provinsi: [],
        kabupaten: [],
        kecamatan: [],
        kelurahan: []
      },
      rawPatient: null
    }
  },
  watch: {
    'form.no_ktp'(newVal) {
      if (newVal && newVal.length === 16 && !this.isAutoFilling) {
        this.autoFillFromNIK(newVal);
      }
    }
  },
  computed: {
    displayedPages() {
      let pages = [];
      let start = Math.max(1, this.pagination.current_page - 2);
      let end = Math.min(this.pagination.last_page, start + 4);
      if (end - start < 4) start = Math.max(1, end - 4);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    }
  },
  mounted() {
    this.fetchData();
    this.modal = new Modal(document.getElementById('registerPatientModal'));
    this.loadProvinces();
  },
  methods: {
    async fetchData(resetPage = false) {
      if (resetPage) this.pagination.current_page = 1;
      this.loading = true;
      try {
        const response = await satuSehatService.getUnsyncedPatients({
          keyword: this.filters.keyword,
          page: this.pagination.current_page
        });
        if (response.data && response.data.data) {
          const resMap = response.data.data;
          this.items = resMap.data;
          this.pagination = {
            current_page: resMap.current_page,
            last_page: resMap.last_page,
            total: resMap.total,
            from: resMap.from,
            to: resMap.to
          };
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page && page !== this.pagination.current_page) {
        this.pagination.current_page = page;
        this.fetchData();
      }
    },
    openRegisterModal(item) {
      this.rawPatient = item;
      const { rt, rw } = this.extractRTRW(item.alamat || '');
      this.form = {
        no_rkm_medis: item.no_rkm_medis,
        no_ktp: item.no_ktp && item.no_ktp !== '-' ? item.no_ktp : '',
        nm_pasien: this.cleanPatientName(item.nm_pasien),
        no_kk: '',
        passport: '',
        jk: item.jk || 'L',
        tgl_lahir: item.tgl_lahir,
        tmp_lahir: item.tmp_lahir || '',
        stts_nikah: item.stts_nikah || 'BELUM MENIKAH',
        no_tlp: item.no_tlp || '',
        email: item.email || '',
        alamat: item.alamat || '',
        provinsi_kode: '',
        kabupaten_kode: '',
        kecamatan_kode: '',
        kelurahan_kode: '',
        rt: rt || '000',
        rw: rw || '000',
        kodepos: ''
      };
      this.modal.show();
    },
    cleanPatientName(name) {
      if (!name) return '';
      // Remove common suffixes like ", AN", ", BY", ", TN", ", NY"
      // Remove trailing commas and clean up spacing
      return name
        .replace(/[,]?\s*(AN|BY|TN|NY|SDR|SDRY|NN|NY)\.?$/i, '')
        .replace(/[,]?\s*(TN|NY|SDR|NN)\b/gi, '')
        .trim();
    },
    extractRTRW(address) {
      // Regex for "002/001" or "RT 002 RW 001"
      const slashRegex = /(\d{1,3})\/(\d{1,3})/;
      const match = address.match(slashRegex);
      
      if (match) {
        return {
          rt: match[1].padStart(3, '0'),
          rw: match[2].padStart(3, '0')
        };
      }
      return { rt: '000', rw: '000' };
    },
    closeModal() {
      this.modal.hide();
    },

    // Wilayah Methods (Public API)
    async loadProvinces() {
      try {
        const provinces = await publicWilayahService.getProvinces();
        this.options.provinsi = provinces;
      } catch (error) {
        console.error('Fetch Provinces Error:', error);
      }
    },
    async autoFillFromNIK(nik) {
      this.isAutoFilling = true;
      try {
        const provId = nik.substring(0, 2);
        const regencyCode = provId + '.' + nik.substring(2, 4);
        const districtCode = regencyCode + '.' + nik.substring(4, 6);

        // 1. Set Province
        this.form.provinsi_kode = provId;
        await this.onProvinsiChange(provId);

        // 2. Set Kabupaten & Birth Place
        this.form.kabupaten_kode = regencyCode;
        const regency = this.options.kabupaten.find(k => k.code === regencyCode);
        if (regency) {
          // Remove "KABUPATEN " or "KOTA " prefix if exists for tmp_lahir
          this.form.tmp_lahir = regency.name.replace(/^(KABUPATEN|KOTA)\s+/i, '');
        }
        await this.onKabupatenChange(regencyCode);

        // 3. Set Kecamatan
        this.form.kecamatan_kode = districtCode;
        await this.onKecamatanChange(districtCode);

        // 4. Try to auto-select Kelurahan if we have a name match from local DB
        if (this.rawPatient && this.rawPatient.nm_kel) {
          this.findVillageMatch(this.rawPatient.nm_kel);
        }

        Swal.fire({
          icon: 'success',
          title: 'Auto-Fill NIK Berhasil',
          text: 'Wilayah & Tempat Lahir telah disesuaikan.',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } catch (error) {
        console.error('AutoFill Error:', error);
      } finally {
        this.isAutoFilling = false;
      }
    },
    findVillageMatch(localVillageName) {
      const searchName = localVillageName.trim().toUpperCase();
      const match = this.options.kelurahan.find(v => {
        const apiName = v.name.trim().toUpperCase();
        return apiName === searchName || apiName.includes(searchName) || searchName.includes(apiName);
      });
      if (match) {
        this.form.kelurahan_kode = match.code;
      }
    },
    async onProvinsiChange(val) {
      this.form.kabupaten_kode = '';
      this.form.kecamatan_kode = '';
      this.form.kelurahan_kode = '';
      this.options.kabupaten = [];
      if (val) {
        this.options.kabupaten = await publicWilayahService.getRegencies(val);
      }
    },
    async onKabupatenChange(val) {
      this.form.kecamatan_kode = '';
      this.form.kelurahan_kode = '';
      this.options.kecamatan = [];
      if (val) {
        this.options.kecamatan = await publicWilayahService.getDistricts(val);
      }
    },
    async onKecamatanChange(val) {
      this.form.kelurahan_kode = '';
      this.options.kelurahan = [];
      if (val) {
        this.options.kelurahan = await publicWilayahService.getVillages(val);
      }
    },
    onSearchProvinsi(search, loading) {},
    onSearchKabupaten(search, loading) {},
    onSearchKecamatan(search, loading) {},
    onSearchKelurahan(search, loading) {},

    async submitRegistration() {
      this.submitting = true;
      try {
        // Find names for the selected codes
        const prov = this.options.provinsi.find(p => p.code === this.form.provinsi_kode);
        const kab = this.options.kabupaten.find(k => k.code === this.form.kabupaten_kode);
        const kec = this.options.kecamatan.find(k => k.code === this.form.kecamatan_kode);
        const kel = this.options.kelurahan.find(k => k.code === this.form.kelurahan_kode);

        // Clean address from RT/RW suffix to avoid redundancy in 'line'
        let cleanAddress = this.form.alamat || '';
        cleanAddress = cleanAddress.replace(/[\s,]+(RT|RW)?\s*\d{1,3}[\/\s-]*(RW)?\s*\d{1,3}.*$/i, '').trim();

        // Prepare cleaned data
        const cleanPayload = {
          ...this.form,
          alamat: cleanAddress || this.form.alamat,
          provinsi_kode: (this.form.provinsi_kode || '').toString().replace(/\./g, ''),
          kabupaten_kode: (this.form.kabupaten_kode || '').toString().replace(/\./g, ''),
          kecamatan_kode: (this.form.kecamatan_kode || '').toString().replace(/\./g, ''),
          kelurahan_kode: (this.form.kelurahan_kode || '').toString().replace(/\./g, ''),
          provinsi_nama: prov ? prov.name : '',
          kabupaten_nama: kab ? kab.name : '',
          kecamatan_nama: kec ? kec.name : '',
          kelurahan_nama: kel ? kel.name : '',
        };

        const response = await satuSehatService.registerPatient(cleanPayload);
        if (response.data && response.data.success) {
          Swal.fire('Berhasil', 'Pasien berhasil didaftarkan ke SatuSehat', 'success');
          this.closeModal();
          this.fetchData();
        } else {
          Swal.fire('Gagal', (response.data && response.data.message) || 'Terjadi kesalahan', 'error');
        }
      } catch (error) {
        const msg = error.response ? error.response.data.message : error.message;
        Swal.fire('Error', msg, 'error');
      } finally {
        this.submitting = false;
      }
    }
  }
}
</script>

<style scoped>
.table-custom th {
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
}
.italic { font-style: italic; }
</style>
