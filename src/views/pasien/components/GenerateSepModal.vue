<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content animate__animated animate__zoomIn" @click.stop>
      <!-- Compact Header -->
      <div class="modal-header-compact">
        <div class="d-flex align-items-center gap-2.5">
          <div class="header-icon-compact">
            <i class="fas fa-file-medical"></i>
          </div>
          <div>
            <h4 class="modal-title mb-0">{{ isEditMode ? 'Edit SEP' : 'Terbitkan SEP Baru' }}</h4>
            <p class="text-muted extra-small mb-0">{{ isEditMode ? 'Update Surat Eligibilitas Peserta' : 'Generate Surat Eligibilitas Peserta via BPJS VClaim' }}</p>
          </div>
        </div>
        <button class="btn-close-compact" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Compact Body (3-Column Layout) -->
      <div class="modal-body custom-scroll p-3 p-lg-3.5">
        <div v-if="registration" class="row g-3">
          <!-- Column 1: Peserta & Pelayanan -->
          <div class="col-lg-4">
            <div class="info-section">
              <h5 class="section-subtitle"><i class="fas fa-user-circle me-1.5 text-primary"></i>1. Informasi Peserta & SEP</h5>
              
              <div class="patient-summary-card mb-2.5">
                <div class="patient-avatar-compact">
                   {{ getInitials(registration.pasien?.nm_pasien) }}
                </div>
                <div class="patient-detail flex-grow-1 overflow-hidden">
                  <h6 class="mb-1 text-truncate fw-bold text-dark">{{ registration.pasien?.nm_pasien }}</h6>
                  <div class="d-flex flex-wrap gap-1.5">
                    <span class="badge bg-light text-dark border extra-small">{{ registration.no_rkm_medis }}</span>
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 extra-small">{{ registration.pasien?.no_peserta }}</span>
                  </div>
                </div>
              </div>

              <div class="row g-2 mb-2">
                <div class="col-6">
                  <label class="form-label-compact">No. Kartu BPJS</label>
                  <input type="text" v-model="form.noKartu" class="form-control-compact" readonly />
                </div>
                <div class="col-6">
                  <label class="form-label-compact">Tanggal SEP</label>
                  <input type="date" v-model="form.tglSep" class="form-control-compact" />
                </div>
              </div>

              <div class="row g-2 mb-2">
                <div class="col-6">
                  <label class="form-label-compact">Jenis Pelayanan</label>
                  <select v-model="form.jnsPelayanan" class="form-select-compact">
                    <option value="1">Rawat Inap</option>
                    <option value="2">Rawat Jalan</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label-compact">Kelas Hak</label>
                  <select v-model="form.klsRawat.klsRawatHak" class="form-select-compact">
                    <option value="1">Kelas 1</option>
                    <option value="2">Kelas 2</option>
                    <option value="3">Kelas 3</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label-compact">Catatan SEP</label>
                <input type="text" v-model="form.catatan" class="form-control-compact" placeholder="Catatan tambahan..." />
              </div>
            </div>
          </div>

          <!-- Column 2: Asal Rujukan & Poliklinik -->
          <div class="col-lg-4 border-start-lg">
            <div class="info-section">
              <h5 class="section-subtitle"><i class="fas fa-exchange-alt me-1.5 text-primary"></i>2. Asal Rujukan & Poliklinik</h5>
              
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <label class="form-label-compact">Tgl Rujukan</label>
                  <input type="date" v-model="form.rujukan.tglRujukan" class="form-control-compact" />
                </div>
                <div class="col-6">
                  <label class="form-label-compact">Asal Rujukan</label>
                  <select v-model="form.rujukan.asalRujukan" class="form-select-compact">
                    <option value="1">Faskes 1 (Puskesmas)</option>
                    <option value="2">Faskes 2 (RS Rujukan)</option>
                  </select>
                </div>
              </div>

              <div class="form-group mb-2">
                <label class="form-label-compact">Nomor Rujukan</label>
                <div class="d-flex gap-1.5">
                  <input type="text" v-model="form.rujukan.noRujukan" class="form-control-compact flex-grow-1" placeholder="Masukkan nomor rujukan..." />
                  <button @click="checkRujukan" class="btn-compact-action btn-primary-compact" :disabled="checkingRujukan" title="Cek Rujukan BPJS">
                    <i class="fas fa-search" v-if="!checkingRujukan"></i>
                    <i class="fas fa-spinner fa-spin" v-else></i>
                  </button>
                </div>
              </div>

              <div class="form-group mb-2">
                <label class="form-label-compact">Faskes Perujuk</label>
                <v-select
                  v-model="form.rujukan.ppkRujukan"
                  :options="faskesOptions"
                  :reduce="opt => opt.kode"
                  label="nama"
                  @search="onSearchFaskes"
                  @option:selected="opt => form.rujukan.nmppkrujukan = opt.nama"
                  :filterable="false"
                  placeholder="Cari Faskes..."
                  class="v-select-compact"
                >
                  <template #no-options="{ searching }">
                    <span class="extra-small">{{ searching ? 'Mencari...' : 'Ketik min 3 huruf' }}</span>
                  </template>
                </v-select>
              </div>

              <template v-if="form.jnsPelayanan !== '1'">
                <div class="form-group mb-2">
                  <label class="form-label-compact">Poli Tujuan</label>
                  <v-select
                    v-model="form.poli.tujuan"
                    :options="poliOptions"
                    :reduce="opt => opt.kode"
                    label="nama"
                    @search="onSearchPoli"
                    :filterable="false"
                    placeholder="Ketik nama poli..."
                    class="v-select-compact"
                  >
                    <template #no-options="{ searching }">
                      <span class="extra-small">{{ searching ? 'Mencari...' : 'Cari Poliklinik BPJS' }}</span>
                    </template>
                  </v-select>
                </div>
                <div class="form-check-compact">
                  <input type="checkbox" id="eksekutif" v-model="form.poli.eksekutif" true-value="1" false-value="0" />
                  <label for="eksekutif" class="form-label-compact mb-0 cursor-pointer">Poli Eksekutif</label>
                </div>
              </template>
            </div>
          </div>

          <!-- Column 3: Diagnosa & Dokter DPJP -->
          <div class="col-lg-4 border-start-lg">
            <div class="info-section">
              <h5 class="section-subtitle"><i class="fas fa-stethoscope me-1.5 text-primary"></i>3. Diagnosa & Dokter DPJP</h5>
              
              <div class="form-group mb-2">
                <label class="form-label-compact">Diagnosa Awal (ICD-10)</label>
                <v-select
                  v-model="form.diagAwal"
                  :options="diagnosaOptions"
                  :reduce="opt => opt.kode"
                  label="nama"
                  @search="onSearchDiagnosa"
                  @option:selected="opt => form.nmdiagnosaawal = opt.nama"
                  :filterable="false"
                  placeholder="Ketik kode/nama ICD-10..."
                  class="v-select-compact"
                >
                  <template #no-options="{ searching }">
                    <span class="extra-small">{{ searching ? 'Mencari...' : 'Cari Diagnosa ICD-10' }}</span>
                  </template>
                </v-select>
              </div>

              <div class="form-group mb-2">
                <label class="form-label-compact">Dokter DPJP</label>
                <v-select
                  v-model="form.skdp.kodeDPJP"
                  :options="combinedDokterOptions"
                  :reduce="opt => opt.kode"
                  label="nama"
                  @option:selected="opt => { form.nmdpdjp = opt.nama; if(form.jnsPelayanan == '2') form.nmdpjplayanan = opt.nama; }"
                  placeholder="Pilih Dokter DPJP BPJS..."
                  class="v-select-compact"
                ></v-select>
              </div>

              <div class="form-group mb-2.5">
                <label class="form-label-compact">No. Surat Kontrol / SPRI</label>
                <div class="d-flex gap-1.5 position-relative">
                  <input type="text" v-model="form.skdp.noSurat" class="form-control-compact flex-grow-1" placeholder="No. Surat Kontrol (Opsional)" />
                  <button @click="lookupSurat" class="btn-compact-action btn-outline-compact" :disabled="searchingSurat" title="Riwayat Surat Kontrol">
                    <i class="fas fa-search" v-if="!searchingSurat"></i>
                    <i class="fas fa-spinner fa-spin" v-else></i>
                  </button>

                  <!-- Surat Lookup Results List -->
                  <div v-if="showSuratList" class="surat-lookup-results custom-scroll animate__animated animate__fadeIn">
                    <div class="d-flex justify-content-between align-items-center p-2 border-bottom sticky-top bg-white">
                      <span class="fw-bold extra-small text-muted">RIWAYAT SURAT KONTROL / SPRI</span>
                      <button class="btn-close-small" @click="showSuratList = false"><i class="fas fa-times"></i></button>
                    </div>
                    
                    <div class="p-2 border-bottom bg-light">
                      <div class="row g-1 align-items-center">
                        <div class="col">
                          <input type="date" v-model="lookupDate" class="form-control form-control-sm border-0 shadow-none bg-transparent" />
                        </div>
                        <div class="col-auto">
                          <button @click="lookupSurat" class="btn btn-sm btn-primary rounded-pill px-2 py-0.5 extra-small" :disabled="searchingSurat">
                            <i class="fas fa-sync-alt me-1"></i> Cari
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="searchingSurat" class="p-3 text-center extra-small">
                      <i class="fas fa-spinner fa-spin me-1"></i> Mencari...
                    </div>
                    
                    <div v-else-if="suratOptions.length === 0" class="p-3 text-center text-muted extra-small">
                      Tidak ada surat ditemukan.
                    </div>
                    
                    <div v-else>
                      <div v-for="surat in suratOptions" :key="surat.no_surat" @click="selectSurat(surat)" class="surat-item">
                        <div class="d-flex justify-content-between mb-1">
                          <span class="badge" :class="surat.jenis === 'SPRI' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'">{{ surat.jenis }}</span>
                          <span class="text-muted extra-small">{{ dayjs(surat.tgl_rencana).format('DD/MM/YYYY') }}</span>
                        </div>
                        <div class="fw-bold extra-small text-primary mb-0.5">{{ surat.no_surat }}</div>
                        <div class="extra-small text-dark mb-0.5"><i class="fas fa-user-md me-1 text-muted"></i> {{ surat.nm_dokter }}</div>
                        <div class="extra-small text-muted"><i class="fas fa-hospital me-1"></i> {{ surat.nm_poli }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status KLL Quick Toggle -->
              <div class="form-group">
                <label class="form-label-compact">Status Kecelakaan (Laka Lantas)</label>
                <select v-model="form.jaminan.lakaLantas" class="form-select-compact text-danger fw-bold bg-danger bg-opacity-10 border-danger border-opacity-25">
                  <option value="0">Bukan KLL</option>
                  <option value="1">KLL & Bukan Kec. Kerja</option>
                  <option value="2">KLL & Kec. Kerja</option>
                  <option value="3">Kec. Kerja</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Advanced Collapsible Section -->
          <div class="col-12 mt-2">
            <details class="advanced-section-details">
              <summary class="advanced-section-summary">
                <span><i class="fas fa-sliders-h me-1.5 text-primary"></i> Pengaturan Tambahan (No. Telp, COB, Katarak, Tujuan Kunjungan, Detail Laka Lantas)</span>
                <i class="fas fa-chevron-down summary-icon"></i>
              </summary>
              <div class="advanced-section-body p-3 mt-2 rounded-3 bg-light border">
                <div class="row g-2 mb-3">
                  <div class="col-md-4">
                    <label class="form-label-compact">Nomor Telepon</label>
                    <input type="text" v-model="form.noTelp" class="form-control-compact" placeholder="Nomor telepon aktif..." />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label-compact">COB</label>
                    <select v-model="form.cob.cob" class="form-select-compact">
                      <option value="0">Tidak</option>
                      <option value="1">Ya</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label-compact">Katarak</label>
                    <select v-model="form.katarak.katarak" class="form-select-compact">
                      <option value="0">Tidak</option>
                      <option value="1">Ya</option>
                    </select>
                  </div>
                </div>

                <!-- Tujuan Kunjungan -->
                <div class="row g-2 mb-3 pt-2 border-top">
                  <div class="col-md-3">
                    <label class="form-label-compact">Tujuan Kunjungan</label>
                    <select v-model="form.tujuanKunj" class="form-select-compact">
                      <option value="0">Normal</option>
                      <option value="1">Prosedur</option>
                      <option value="2">Konsul Dokter</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label-compact">Flag Prosedur</label>
                    <select v-model="form.flagProcedure" class="form-select-compact">
                      <option value="">(Tanpa Flag)</option>
                      <option value="0">Prosedur Tidak Berkelanjutan</option>
                      <option value="1">Prosedur Berkelanjutan</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label-compact">Penunjang</label>
                    <select v-model="form.kdPenunjang" class="form-select-compact">
                      <option value="">(Tanpa Penunjang)</option>
                      <option value="1">Radiologi</option>
                      <option value="2">Laboratorium</option>
                      <option value="3">USG</option>
                      <option value="4">Farmasi</option>
                      <option value="5">Lain-lain</option>
                      <option value="6">MRI</option>
                      <option value="7">CT-SCAN</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label-compact">Asesmen Pelayanan</label>
                    <select v-model="form.assesmentPel" class="form-select-compact">
                      <option value="">(Tanpa Asesmen)</option>
                      <option value="1">Poli tidak tersedia hari ini</option>
                      <option value="2">Hari Libur</option>
                      <option value="3">Spesialis luar jam</option>
                      <option value="4">Kendala fasilitas</option>
                    </select>
                  </div>
                </div>

                <!-- Detail Laka Lantas jika KLL -->
                <div v-if="form.jaminan.lakaLantas !== '0'" class="p-3 border border-danger border-opacity-25 rounded-3 bg-danger bg-opacity-10 mb-2">
                  <h6 class="text-danger fw-bold mb-2 extra-small"><i class="fas fa-ambulance me-1"></i> Detail Kecelakaan</h6>
                  <div class="row g-2">
                    <div class="col-md-4">
                      <label class="form-label-compact">Tanggal Kejadian</label>
                      <input type="date" v-model="form.jaminan.penjamin.tglKejadian" class="form-control-compact" />
                    </div>
                    <div class="col-md-4">
                      <label class="form-label-compact">Suplesi</label>
                      <select v-model="form.jaminan.penjamin.suplesi.suplesi" class="form-select-compact">
                        <option value="0">Tidak</option>
                        <option value="1">Ya</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label-compact">No. SEP Suplesi</label>
                      <input type="text" v-model="form.jaminan.penjamin.suplesi.noSepSuplesi" class="form-control-compact" :disabled="form.jaminan.penjamin.suplesi.suplesi === '0'" placeholder="No. SEP Suplesi..." />
                    </div>
                    <div class="col-md-12">
                      <label class="form-label-compact">Keterangan Kejadian</label>
                      <textarea v-model="form.jaminan.penjamin.keterangan" class="form-control-compact" rows="1" placeholder="Kronologi singkat..."></textarea>
                    </div>
                  </div>
                </div>

                <!-- Naik Kelas if Ranap -->
                <div v-if="form.jnsPelayanan === '1'" class="p-3 border border-warning border-opacity-25 rounded-3 bg-warning bg-opacity-10">
                  <h6 class="text-warning-emphasis fw-bold mb-2 extra-small"><i class="fas fa-level-up-alt me-1"></i> Naik Kelas Rawat</h6>
                  <div class="row g-2">
                    <div class="col-md-4">
                      <label class="form-label-compact">Pilih Kelas Naik</label>
                      <select v-model="form.klsRawat.klsRawatNaik" class="form-select-compact">
                        <option value="">(Tidak Naik Kelas)</option>
                        <option value="1">VVIP</option>
                        <option value="2">VIP</option>
                        <option value="3">Kelas 1</option>
                        <option value="4">Kelas 2</option>
                      </select>
                    </div>
                    <div v-if="form.klsRawat.klsRawatNaik" class="col-md-4">
                      <label class="form-label-compact">Pembiayaan</label>
                      <select v-model="form.klsRawat.pembiayaan" class="form-select-compact">
                        <option value="1">Pribadi</option>
                        <option value="2">Pemberi Kerja</option>
                        <option value="3">Asuransi Tambahan</option>
                      </select>
                    </div>
                    <div v-if="form.klsRawat.klsRawatNaik" class="col-md-4">
                      <label class="form-label-compact">Penanggung Jawab</label>
                      <input type="text" v-model="form.klsRawat.penanggungJawab" class="form-control-compact" placeholder="Nama P.J..." />
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      <!-- Compact Footer -->
      <div class="modal-footer-compact px-3 py-2.5">
        <button class="btn-cancel-compact" @click="close" :disabled="submitting">Batal</button>
        <button class="btn-generate-compact" @click="submitSep" :disabled="submitting || !isFormValid">
          <span v-if="submitting"><i class="fas fa-spinner fa-spin me-1.5"></i>Memproses...</span>
          <span v-else>
            <i class="fas me-1.5" :class="isEditMode ? 'fa-save' : 'fa-check-circle'"></i>
             {{ isEditMode ? 'Simpan Perubahan' : 'Terbitkan SEP' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useToast } from 'vue-toastification';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import bpjsVclaimService from '../../../services/bpjsVclaimService';
import { debounce } from 'lodash';

const props = defineProps({
  show: Boolean,
  registration: Object
});

const emit = defineEmits(['close', 'success']);

const submitting = ref(false);
const checkingRujukan = ref(false);

const diagnosaOptions = ref([]);
const poliOptions = ref([]);
const faskesOptions = ref([]);
const dokterDpjpOptions = ref([]);
const localMappedDoctors = ref([]);
const suratOptions = ref([]);
const searchingSurat = ref(false);
const showSuratList = ref(false);
const lookupDate = ref(dayjs().format('YYYY-MM-DD'));
const loadingSepDetail = ref(false);
const propinsiOptions = ref([]);
const kabupatenOptions = ref([]);
const kecamatanOptions = ref([]);

const form = reactive({
  noSep: '',
  no_rawat: '',
  noKartu: '',
  tglSep: dayjs().format('YYYY-MM-DD'),
  ppkPelayanan: '', 
  noTelp: '',
  jnsPelayanan: '2', // Default Rajal
  klsRawat: {
    klsRawatHak: '3',
    klsRawatNaik: '',
    pembiayaan: '',
    penanggungJawab: ''
  },
  noMR: '',
  rujukan: {
    asalRujukan: '1',
    tglRujukan: dayjs().format('YYYY-MM-DD'),
    noRujukan: '',
    ppkRujukan: '',
    nmppkrujukan: ''
  },
  catatan: '-',
  diagAwal: '',
  nmdiagnosaawal: '',
  poli: {
    tujuan: '',
    eksekutif: '0'
  },
  cob: { cob: '0' },
  katarak: { katarak: '0' },
  jaminan: {
    lakaLantas: '0',
    penjamin: {
      tglKejadian: '',
      keterangan: '',
      suplesi: {
        suplesi: '0',
        noSepSuplesi: '',
        lokasiLaka: {
          kdPropinsi: '',
          kdKabupaten: '',
          kdKecamatan: ''
        }
      }
    }
  },
  tujuanKunj: '0',
  flagProcedure: '',
  kdPenunjang: '',
  assesmentPel: '',
  skdp: {
    noSurat: '',
    kodeDPJP: ''
  },
  nmdpdjp: '',
  dpjpLayan: '',
  nmdpjplayanan: '',
  user: 'Bridging RSIAP V2'
});

const isEditMode = computed(() => !!props.registration?.sepSimple);

const fetchSettingInfo = async () => {
  try {
    const res = await bpjsVclaimService.getSettingInfo();
    if (res.data && res.data.database_setting) {
      form.ppkPelayanan = res.data.database_setting.kode_ppk_bpjs;
    }
  } catch (error) {
    console.error('Failed to fetch BPJS setting info:', error);
  }
};

watch(() => form.skdp.kodeDPJP, (newVal) => {
  if (form.jnsPelayanan == '2') {
    form.dpjpLayan = newVal;
  }
});

watch(() => form.poli.tujuan, (newVal) => {
  if (newVal === 'IGD') {
    // Only clear rujukan info if NOT in edit mode and NOT currently loading SEP detail
    if (!isEditMode.value && !loadingSepDetail.value) {
      form.rujukan.noRujukan = '';
      form.rujukan.tglRujukan = dayjs().format('YYYY-MM-DD');
      form.rujukan.ppkRujukan = '';
    }
  }
});

// Load patient data when modal opens
watch(() => props.registration, (reg) => {
  if (reg) {
    resetForm();
    initFromRegistration(reg);
    
    if (reg.sepItem) {
        console.log("SEP Item Data Found:", reg.sepItem);
        initFromLocalSep(reg.sepItem);
    }
    
    if (reg.sepSimple) {
        fetchSepDetail(reg.sepSimple.no_sep);
    }
  }
}, { immediate: true });

// Watchers for DPJP dynamic list
watch(() => form.poli.tujuan, (newVal) => {
    if (newVal) {
        // Clear doctor selection if it doesn't match the new poli
        // But only if we are not in the middle of initial data load
        if (!loadingSepDetail.value) {
            form.skdp.kodeDPJP = '';
            form.nmdpdjp = '';
        }
        fetchDpjps();
    }
});

watch(() => form.tglSep, (newVal) => {
    if (newVal && form.poli.tujuan) {
        fetchDpjps();
    }
});

const combinedDokterOptions = computed(() => {
    // Start with live options from BPJS fetch
    const merged = [...dokterDpjpOptions.value];
    
    // Add local mapped doctors that aren't already in the list
    localMappedDoctors.value.forEach(local => {
        if (!merged.find(m => m.kode === local.kode)) {
            merged.push(local);
        }
    });

    return merged;
});

onMounted(async () => {
    await fetchSettingInfo();
    fetchPropinsi();
    fetchLocalMappedDoctors();
});

watch(() => form.jaminan.penjamin.suplesi.lokasiLaka.kdPropinsi, () => {
    form.jaminan.penjamin.suplesi.lokasiLaka.kdKabupaten = '';
    form.jaminan.penjamin.suplesi.lokasiLaka.kdKecamatan = '';
    fetchKabupaten();
});

watch(() => form.jaminan.penjamin.suplesi.lokasiLaka.kdKabupaten, () => {
    form.jaminan.penjamin.suplesi.lokasiLaka.kdKecamatan = '';
    fetchKecamatan();
});

const resetForm = () => {
    form.noSep = '';
    form.noKartu = '';
    form.diagAwal = '';
    form.rujukan.noRujukan = '';
    form.skdp.noSurat = '';
    form.catatan = '-';
    // ... reset other fields if necessary
};

const initFromLocalSep = (item) => {
    form.noSep = item.no_sep;
    form.no_rawat = item.no_rawat;
    form.noKartu = item.no_kartu;
    form.tglSep = item.tglsep;
    form.noMR = item.nomr;
    form.jnsPelayanan = item.jnspelayanan;
    form.catatan = item.catatan || '-';
    form.noTelp = item.notelep || form.noTelp;

    // Diagnosa
    form.diagAwal = item.diagawal;
    form.nmdiagnosaawal = item.nmdiagnosaawal;
    if (item.diagawal) {
        diagnosaOptions.value = [{
            kode: item.diagawal,
            nama: item.nmdiagnosaawal || item.diagawal
        }];
    }

    // Poli
    form.poli.tujuan = item.kdpolitujuan;
    if (item.kdpolitujuan) {
        poliOptions.value = [{
            kode: item.kdpolitujuan,
            nama: item.nmpolitujuan || item.kdpolitujuan
        }];
    }

    // Rujukan
    form.rujukan.noRujukan = item.no_rujukan;
    form.rujukan.tglRujukan = item.tglrujukan || item.tglsep;
    form.rujukan.ppkRujukan = item.kdppkrujukan;
    form.rujukan.nmppkrujukan = item.nmppkrujukan;
    
    // Extract '1' or '2' from "1. Faskes 1"
    if (item.asal_rujukan) {
        form.rujukan.asalRujukan = typeof item.asal_rujukan === 'string' ? item.asal_rujukan.charAt(0) : item.asal_rujukan;
    }
    
    if (item.kdppkrujukan) {
        faskesOptions.value = [{
            kode: item.kdppkrujukan,
            nama: item.nmppkrujukan || item.kdppkrujukan
        }];
        console.log("Faskes Options Primed (Local):", faskesOptions.value);
    }

    // SKDP / DPJP
    form.skdp.noSurat = item.noskdp;
    form.skdp.kodeDPJP = item.kddpjp;
    form.nmdpdjp = item.nmdpdjp;
    if (form.jnsPelayanan == '2') {
        form.dpjpLayan = item.kddpjp;
        form.nmdpjplayanan = item.nmdpdjp;
    }

    if (item.kddpjp) {
        dokterDpjpOptions.value = [{
            kode: item.kddpjp,
            nama: item.nmdpdjp || item.kddpjp
        }];
    }
};

const initFromRegistration = (reg) => {
    // 1. Pre-fill Patient Info
    form.no_rawat = reg.no_rawat || '';
    form.noKartu = reg.pasien?.no_peserta || '';
    form.noMR = reg.no_rkm_medis || '';
    form.noTelp = reg.pasien?.no_tlp || '';
    
    // Default hospital code for RSIAP Pekajangan if setting fails
    if (!form.ppkPelayanan) {
        form.ppkPelayanan = '0166R001'; 
    }

    // 2. Pre-fill Poliklinik via Mapping
    if (reg.poliklinik?.mapping_bpjs) {
        const mapping = reg.poliklinik.mapping_bpjs;
        form.poli.tujuan = mapping.kd_poli_bpjs;
        poliOptions.value = [{
            kode: mapping.kd_poli_bpjs,
            nama: mapping.nm_poli_bpjs
        }];
    }
    
    // 3. Pre-fill Dokter via Mapping
    if (reg.dokter?.mapping_bpjs) {
        const mapping = reg.dokter.mapping_bpjs;
        form.skdp.kodeDPJP = mapping.kd_dokter_bpjs;
        dokterDpjpOptions.value = [{
            kode: mapping.kd_dokter_bpjs,
            nama: mapping.nm_dokter_bpjs
        }];
    }
};

const fetchSepDetail = async (noSep) => {
    loadingSepDetail.value = true;
    try {
        const res = await bpjsVclaimService.getSep(noSep);
        if (res.data.metaData.code === '200') {
            // Check if response is wrapped in 'sep' object
            const d = res.data.response?.sep || res.data.response;
            
            form.noSep = d.noSep || noSep;
            form.noKartu = d.peserta?.noKartu || d.noKartu || form.noKartu;
            form.tglSep = d.tglSep || form.tglSep;
            form.noMR = d.peserta?.noMr || d.noRm || form.noMR;
            form.jnsPelayanan = d.jnsPelayanan === 'Rawat Inap' ? '1' : '2';
            form.catatan = d.catatan || (d.catatan === "" ? "" : form.catatan);

            // Robust Diagnosis Parsing
            let diagCode = '';
            let diagName = '';
            if (d.diagnosa && typeof d.diagnosa === 'object') {
                diagCode = d.diagnosa.kode;
                diagName = d.diagnosa.nama;
            } else if (typeof d.diagnosa === 'string') {
                if (d.diagnosa.includes(' - ')) {
                    const parts = d.diagnosa.split(' - ');
                    diagCode = parts[0];
                    diagName = parts[1];
                } else {
                    diagCode = d.kdDiagnosa || d.diagnosa;
                    diagName = d.diagnosa;
                }
            }
            
            if (diagCode) {
                form.diagAwal = diagCode;
                form.nmdiagnosaawal = diagName;
                diagnosaOptions.value = [{ kode: diagCode, nama: diagName }];
            }

            // Robust Poli Parsing
            let poliCode = d.kdPoli || (d.poli && typeof d.poli === 'object' ? d.poli.kode : '');
            let poliName = (d.poli && typeof d.poli === 'object' ? d.poli.nama : d.poli) || '';
            
            if (poliCode) {
                form.poli.tujuan = poliCode;
                poliOptions.value = [{ kode: poliCode, nama: poliName }];
            }

            // SKDP / Surat Kontrol / DPJP
            let dpjpCode = '';
            let dpjpName = '';

            if (d.kontrol) {
                form.skdp.noSurat = d.kontrol.noSurat || form.skdp.noSurat;
                dpjpCode = d.kontrol.kdDokter;
                dpjpName = d.kontrol.nmDokter;
            } else if (d.dpjp) {
                dpjpCode = d.dpjp.kdDPJP;
                dpjpName = d.dpjp.nmDPJP;
            } else if (typeof d.dpjpDetail === 'object') {
                dpjpCode = d.dpjpDetail.kdDPJP;
                dpjpName = d.dpjpDetail.nmDPJP;
            }

            if (dpjpCode) {
                form.skdp.kodeDPJP = dpjpCode;
                // Only overwrite name if BPJS actually returns it, otherwise keep local name
                if (dpjpName) form.nmdpdjp = dpjpName;
                
                if (form.jnsPelayanan == '2') {
                    form.dpjpLayan = dpjpCode;
                    if (dpjpName) form.nmdpjplayanan = dpjpName;
                }
                
                // Priming options with current selection
                dokterDpjpOptions.value = [{ 
                    kode: dpjpCode, 
                    nama: dpjpName || form.nmdpdjp || dpjpCode 
                }];
            }

            // Rujukan & Faskes - SMART FILL (Only overwrite if BPJS has data)
            if (d.noRujukan) form.rujukan.noRujukan = d.noRujukan;
            if (d.tglRujukan) form.rujukan.tglRujukan = d.tglRujukan;
            
            let faskesCode = d.kdFaskes || (d.provPerujuk ? (d.provPerujuk.kdProvider || d.provPerujuk.kode) : '');
            let faskesName = d.nmFaskes || (d.provPerujuk ? (d.provPerujuk.nmProvider || d.provPerujuk.nama) : '');
            let asalRujukan = d.jnsFaskes || (faskesCode ? (faskesCode.startsWith('0') ? '1' : '2') : '');

            if (faskesCode) {
                form.rujukan.ppkRujukan = faskesCode;
                if (faskesName) form.rujukan.nmppkrujukan = faskesName;
                if (asalRujukan) form.rujukan.asalRujukan = asalRujukan;
                
                faskesOptions.value = [{ 
                    kode: faskesCode, 
                    nama: faskesName || form.rujukan.nmppkrujukan || faskesCode 
                }];
            } else if (form.rujukan.ppkRujukan) {
                // If BPJS return nothing but we have local data, re-prime the options list
                faskesOptions.value = [{ 
                    kode: form.rujukan.ppkRujukan, 
                    nama: form.rujukan.nmppkrujukan || form.rujukan.ppkRujukan 
                }];
            }
        }
    } catch (e) {
        console.error('Error fetching SEP detail:', e);
    } finally {
        loadingSepDetail.value = false;
    }
};

const onSearchFaskes = debounce(async (search, loading) => {
    if (search.length >= 3) {
        loading(true);
        try {
            const res = await bpjsVclaimService.getRefFaskes(search, form.rujukan.asalRujukan);
            if (res.data.metaData.code === '200') {
                faskesOptions.value = res.data.response.faskes;
            }
        } catch (e) {
            console.error('Error fetching faskes:', e);
        } finally {
            loading(true);
            setTimeout(() => loading(false), 200);
        }
    }
}, 500);

const close = () => {
  emit('close');
};

const isFormValid = computed(() => {
    const isIGD = form.poli.tujuan === 'IGD';
    const common = form.noKartu && form.diagAwal;
    const rujukanValid = isIGD || (form.rujukan.noRujukan && form.rujukan.ppkRujukan);
    
    if (form.jnsPelayanan === '1') {
        return common && rujukanValid;
    }
    return common && rujukanValid && form.poli.tujuan;
});

const onSearchDiagnosa = debounce(async (search, loading) => {
  if (search.length >= 3) {
    loading(true);
    try {
      const res = await bpjsVclaimService.getRefDiagnosa(search);
      if (res.data.metaData.code === '200') {
        diagnosaOptions.value = res.data.response.diagnosa;
      }
    } catch (e) {}
    loading(false);
  }
}, 500);

const onSearchPoli = debounce(async (search, loading) => {
  if (search.length >= 3) {
    loading(true);
    try {
      const res = await bpjsVclaimService.getRefPoli(search);
      if (res.data.metaData.code === '200') {
        poliOptions.value = res.data.response.polisubspesialis || res.data.response.poli;
      }
    } catch (e) {}
    loading(false);
  }
}, 500);

const fetchLocalMappedDoctors = async () => {
    try {
        const res = await bpjsVclaimService.getMappingDokter();
        if (res.data.metadata?.code === 200 || res.data.metadata?.code === '200') {
            localMappedDoctors.value = res.data.response.map(item => ({
                kode: item.kd_dokter_bpjs,
                nama: item.nm_dokter_bpjs
            }));
        }
    } catch (e) {
        console.error('Error fetching local mapped doctors:', e);
    }
};

const fetchDpjps = async () => {
    if (!form.poli.tujuan || !form.tglSep) return;
    
    try {
        const params = {
            pelayanan: form.jnsPelayanan,
            tgl: form.tglSep,
            spesialis: form.poli.tujuan
        };
        const res = await bpjsVclaimService.getRefDokter(params);
        if (res.data.metaData.code === '200') {
            dokterDpjpOptions.value = res.data.response.list;
        } else {
            // If No records found or BPJS error, keep current options (from local/edit)
            // Or clear if it's a fresh search
            if (!form.skdp.kodeDPJP) {
                dokterDpjpOptions.value = [];
            }
        }
    } catch (e) {
        console.error('Error fetching DPJPs:', e);
    }
};

const fetchPropinsi = async () => {
    try {
        const res = await bpjsVclaimService.getRefPropinsi();
        if (res.data.metaData.code === '200') {
            propinsiOptions.value = res.data.response.list;
        }
    } catch (e) {
        console.error('Error fetching propinsi:', e);
    }
};

const fetchKabupaten = async () => {
    if (!form.jaminan.penjamin.suplesi.lokasiLaka.kdPropinsi) return;
    try {
        const res = await bpjsVclaimService.getRefKabupaten(form.jaminan.penjamin.suplesi.lokasiLaka.kdPropinsi);
        if (res.data.metaData.code === '200') {
            kabupatenOptions.value = res.data.response.list;
        }
    } catch (e) {
        console.error('Error fetching kabupaten:', e);
    }
};

const fetchKecamatan = async () => {
    if (!form.jaminan.penjamin.suplesi.lokasiLaka.kdKabupaten) return;
    try {
        const res = await bpjsVclaimService.getRefKecamatan(form.jaminan.penjamin.suplesi.lokasiLaka.kdKabupaten);
        if (res.data.metaData.code === '200') {
            kecamatanOptions.value = res.data.response.list;
        }
    } catch (e) {
        console.error('Error fetching kecamatan:', e);
    }
};

const checkRujukan = async (evt) => {
    if (evt && evt.currentTarget) evt.currentTarget.blur();
    if (!form.noKartu) return;
    checkingRujukan.value = true;
    try {
        const res = await bpjsVclaimService.getRujukanByNoKartu(form.noKartu);
        if (res.data.metaData.code === '200') {
            const rujukan = res.data.response.rujukan;
            form.rujukan.noRujukan = rujukan.noKunjungan;
            form.rujukan.tglRujukan = rujukan.tglKunjungan;
            form.rujukan.ppkRujukan = rujukan.provPerujuk.kode;
            form.rujukan.asalRujukan = rujukan.asalRujukan || form.rujukan.asalRujukan;

            // Auto-populate faskes options for label
            faskesOptions.value = [{
                kode: rujukan.provPerujuk.kode,
                nama: rujukan.provPerujuk.nama
            }];

            form.diagAwal = rujukan.diagnosa.kode;
            diagnosaOptions.value = [rujukan.diagnosa];
            
            form.poli.tujuan = rujukan.poliRujukan.kode;
            poliOptions.value = [rujukan.poliRujukan];

            Swal.fire({
                title: 'Data Ditemukan',
                text: 'Data rujukan berhasil diambil dari BPJS.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'swal2-glass' }
            });
        } else {
            Swal.fire({
                title: 'Tidak Ditemukan',
                text: 'Data rujukan tidak ditemukan untuk nomor kartu ini.',
                icon: 'info',
                customClass: { popup: 'swal2-glass' }
            });
        }
    } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghubungi server BPJS.' });
    } finally {
        checkingRujukan.value = false;
    }
};

const lookupSurat = async (evt) => {
    if (evt && evt.currentTarget) evt.currentTarget.blur();
    if (!form.noKartu) {
        Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nomor Kartu harus terisi terlebih dahulu.' });
        return;
    }
    
    searchingSurat.value = true;
    showSuratList.value = true;
    try {
        const res = await bpjsVclaimService.searchSurat(form.noKartu, lookupDate.value);
        if (res.data.metaData.code === '200') {
            suratOptions.value = res.data.response;
        } else {
            suratOptions.value = [];
        }
    } catch (e) {
        suratOptions.value = [];
    } finally {
        searchingSurat.value = false;
    }
};

const selectSurat = (surat) => {
    form.skdp.noSurat = surat.no_surat;
    form.skdp.kodeDPJP = surat.kd_dokter;
    
    // Auto-fill dokter options so label appears
    dokterDpjpOptions.value = [{
        kode: surat.kd_dokter,
        nama: surat.nm_dokter
    }];
    
    // Auto-fill poli if available and not in Ranap mode
    if (surat.kd_poli && form.jnsPelayanan !== '1') {
        form.poli.tujuan = surat.kd_poli;
        poliOptions.value = [{
            kode: surat.kd_poli,
            nama: surat.nm_poli
        }];
    }
    
    showSuratList.value = false;
    
    Swal.fire({
        title: 'Surat Terpilih',
        text: `Menggunakan ${surat.jenis}: ${surat.no_surat}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'swal2-glass' }
    });
};

const submitSep = async () => {
  submitting.value = true;
  try {
    let res;
    if (isEditMode.value) {
        res = await bpjsVclaimService.updateSep(form);
    } else {
        res = await bpjsVclaimService.insertSep(form);
    }

    if (res.data.metaData.code === '200') {
      const sepNum = res.data.response.sep.noSep;
      const patientName = res.data.response.sep.peserta?.nama || props.registration.pasien?.nm_pasien;
      const poliName = res.data.response.sep.poli || '';
      
      Swal.fire({
        title: '<div class="text-success fw-bold mb-2">Berhasil Diterbitkan!</div>',
        html: `
          <div class="mt-2 text-center">
            <div class="glass-badge mb-4 py-3 px-3 bg-success bg-opacity-10 text-success rounded-4 border border-success border-opacity-25 shadow-sm">
              <div class="extra-small text-uppercase opacity-75 mb-1" style="font-size: 0.65rem; letter-spacing: 1px;">Nomor SEP</div>
              <div class="h5 mb-0 fw-bold" style="letter-spacing: 0.5px;">${sepNum}</div>
            </div>
            <div class="px-2">
              <div class="mb-3">
                <div class="extra-small text-muted text-uppercase mb-1" style="font-size: 0.6rem; letter-spacing: 1px;">Nama Pasien</div>
                <div class="fw-bold text-dark" style="font-size: 1.1rem;">${patientName}</div>
              </div>
              <div class="mb-2">
                <div class="extra-small text-muted text-uppercase mb-1" style="font-size: 0.6rem; letter-spacing: 1px;">Poliklinik Tujuan</div>
                <div class="fw-semibold text-secondary">${poliName}</div>
              </div>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: '<i class="fas fa-check-circle me-1"></i> Selesai',
        confirmButtonColor: '#3b82f6',
        customClass: {
          popup: 'swal2-glass animate__animated animate__fadeInUp',
          confirmButton: 'rounded-pill px-4'
        }
      });
      emit('success');
      close();
    } else {
      Swal.fire({
        title: 'Gagal Menerbitkan SEP',
        text: res.data.metaData.message,
        icon: 'error',
        customClass: { popup: 'swal2-glass' }
      });
    }
  } catch (error) {
    Swal.fire({
      title: 'Terjadi Kesalahan',
      text: error.response?.data?.metaData?.message || 'Nomor rujukan atau kode diagnosa mungkin tidak valid.',
      icon: 'error',
      customClass: { popup: 'swal2-glass' }
    });
  } finally {
    submitting.value = false;
  }
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  width: 96%;
  max-width: 1280px;
  max-height: 94vh;
  background: #ffffff !important;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25);
  color: #1e293b;
}

.modal-header-compact {
  padding: 0.85rem 1.5rem;
  background: #ffffff !important;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-icon-compact {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}

.modal-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  color: #0f172a;
  font-size: 1.15rem;
}

.btn-close-compact {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-compact:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
}

.modal-body {
  overflow-y: auto;
  background: #ffffff !important;
}

.info-section {
  position: relative;
}

.section-subtitle {
  font-size: 0.825rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.patient-summary-card {
  background: #f8fafc;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid #e2e8f0;
}

.patient-avatar-compact {
  width: 38px;
  height: 38px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #3b82f6;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.form-label-compact {
  font-size: 0.775rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.2rem;
  display: block;
}

.form-control-compact, 
.form-select-compact {
  width: 100%;
  padding: 0.38rem 0.65rem;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.825rem;
  font-weight: 500;
  height: 36px;
  transition: all 0.2s;
}

.form-control-compact:focus, 
.form-select-compact:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}

.btn-compact-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-primary-compact {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-primary-compact:hover:not(:disabled) {
  background: #2563eb;
}

.btn-outline-compact {
  background: #f8fafc;
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-outline-compact:hover:not(:disabled) {
  background: white;
  color: #3b82f6;
  border-color: #3b82f6;
}

.form-check-compact {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.2rem;
}

.form-check-compact input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

@media (min-width: 992px) {
  .border-start-lg {
    border-left: 1px solid #f1f5f9;
  }
}

.surat-lookup-results {
  position: absolute;
  bottom: 110%;
  right: 0;
  width: 320px;
  max-height: 320px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  border: 1px solid #e2e8f0;
  z-index: 100;
  overflow-y: auto;
}

.surat-item {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
}

.surat-item:hover {
  background: #f8fafc;
}

.extra-small {
  font-size: 0.725rem;
}

.btn-close-small {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.2rem;
}

.advanced-section-details {
  border-radius: 12px;
}

.advanced-section-summary {
  cursor: pointer;
  font-size: 0.825rem;
  font-weight: 700;
  color: #2563eb;
  padding: 0.5rem 0.85rem;
  background: #f0f9ff;
  border-radius: 10px;
  border: 1px solid #bae6fd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.advanced-section-summary:hover {
  background: #e0f2fe;
}

.advanced-section-details[open] .summary-icon {
  transform: rotate(180deg);
}

.summary-icon {
  transition: transform 0.2s ease;
  font-size: 0.75rem;
}

.modal-footer-compact {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.btn-cancel-compact {
  padding: 0.4rem 1.5rem;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  background: white;
  color: #475569;
  font-weight: 700;
  font-size: 0.825rem;
  cursor: pointer;
  height: 36px;
  transition: all 0.2s;
}

.btn-cancel-compact:hover {
  background: #f1f5f9;
}

.btn-generate-compact {
  padding: 0.4rem 1.75rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-weight: 700;
  font-size: 0.825rem;
  cursor: pointer;
  height: 36px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-generate-compact:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.btn-generate-compact:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(1);
}
</style>

<style>
/* Global overwrite for v-select compact look */
.v-select-compact .vs__dropdown-toggle {
  border-radius: 8px !important;
  border: 1.5px solid #cbd5e1 !important;
  padding: 0 !important;
  background: white !important;
  height: 36px !important;
  display: flex !important;
  align-items: center !important;
}

.v-select-compact .vs__selected {
  color: #0f172a !important;
  font-weight: 600 !important;
  font-size: 0.825rem !important;
  margin: 0 2px !important;
  padding: 0 4px !important;
}

.v-select-compact .vs__search {
  font-size: 0.825rem !important;
  margin: 0 !important;
  padding: 0 4px !important;
}

.v-select-compact .vs__search::placeholder {
  color: #94a3b8 !important;
  font-weight: 500 !important;
  font-size: 0.8rem !important;
}

.v-select-compact .vs__actions {
  padding: 0 6px !important;
}
</style>
