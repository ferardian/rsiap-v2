<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content glass-effect animate__animated animate__zoomIn" @click.stop>
      <div class="modal-header-premium">
        <div class="d-flex align-items-center gap-3">
          <div class="header-icon-bg">
            <i class="fas fa-file-medical"></i>
          </div>
          <div>
            <h3 class="modal-title mb-0">{{ isEditMode ? 'Edit SEP' : 'Terbitkan SEP Baru' }}</h3>
            <p class="text-muted small mb-0">{{ isEditMode ? 'Update data Surat Eligibilitas Peserta' : 'Generate Surat Eligibilitas Peserta via BPJS VClaim' }}</p>
          </div>
        </div>
        <button class="btn-close-premium" @click="close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body custom-scroll p-4">
        <div v-if="registration" class="row g-4">
          <!-- Left Column: Patient & Basic Info -->
          <div class="col-lg-5">
            <div class="info-section">
              <h4 class="section-subtitle"><i class="fas fa-user-circle me-2"></i>Informasi Peserta</h4>
              <div class="patient-summary-card mb-4">
                <div class="patient-avatar">
                   {{ getInitials(registration.pasien?.nm_pasien) }}
                </div>
                <div class="patient-detail">
                  <h5 class="mb-1">{{ registration.pasien?.nm_pasien }}</h5>
                  <div class="d-flex flex-wrap gap-2">
                    <span class="badge bg-light text-dark border">{{ registration.no_rkm_medis }}</span>
                    <span class="badge bg-primary bg-opacity-10 text-primary border-primary border-opacity-25">{{ registration.pasien?.no_peserta }}</span>
                  </div>
                </div>
              </div>

              <div class="form-group mb-3">
                <label class="form-label-premium">Nomor Kartu BPJS</label>
                <input type="text" v-model="form.noKartu" class="form-control-premium" readonly />
              </div>

              <div class="form-group mb-3">
                <label class="form-label-premium">Tanggal SEP</label>
                <input type="date" v-model="form.tglSep" class="form-control-premium" />
              </div>

              <div class="form-group mb-3">
                <label class="form-label-premium">Jenis Pelayanan</label>
                <select v-model="form.jnsPelayanan" class="form-select-premium">
                  <option value="1">Rawat Inap</option>
                  <option value="2">Rawat Jalan</option>
                </select>
              </div>

              <div class="form-group mb-3">
                <label class="form-label-premium">Kelas Rawat</label>
                <select v-model="form.klsRawat.klsRawatHak" class="form-select-premium">
                  <option value="1">Kelas 1</option>
                  <option value="2">Kelas 2</option>
                  <option value="3">Kelas 3</option>
                </select>
              </div>

              <div class="form-group mb-3">
                <label class="form-label-premium">Catatan</label>
                <textarea v-model="form.catatan" class="form-control-premium" rows="2" placeholder="Catatan tambahan..."></textarea>
              </div>
            </div>
          </div>

          <!-- Right Column: Rujukan & Clinical -->
          <div class="col-lg-7">
            <div class="info-section">
              <h4 class="section-subtitle"><i class="fas fa-exchange-alt me-2"></i>Asal Rujukan</h4>
              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label class="form-label-premium">Tgl Rujukan</label>
                  <input type="date" v-model="form.rujukan.tglRujukan" class="form-control-premium" />
                </div>
                <div class="col-md-6">
                  <label class="form-label-premium">Asal Rujukan</label>
                  <select v-model="form.rujukan.asalRujukan" class="form-select-premium">
                    <option value="1">Faskes 1 (Puskesmas/Klinik)</option>
                    <option value="2">Faskes 2 (RS Tingkat 2)</option>
                  </select>
                </div>
                    <div class="d-flex gap-2 align-items-end mb-3">
                       <div class="flex-grow-1">
                         <label class="form-label-premium">Nomor Rujukan</label>
                         <input type="text" v-model="form.rujukan.noRujukan" class="form-control-premium" placeholder="Masukkan nomor rujukan..." />
                       </div>
                       <button @click="checkRujukan" class="btn-check-rujukan" :disabled="checkingRujukan">
                         <i class="fas fa-search" v-if="!checkingRujukan"></i>
                         <i class="fas fa-spinner fa-spin" v-else></i>
                       </button>
                    </div>

                 <div class="col-md-12">
                   <label class="form-label-premium">Faskes Perujuk (Pemberi Rujukan)</label>
                   <v-select
                     v-model="form.rujukan.ppkRujukan"
                     :options="faskesOptions"
                     :reduce="opt => opt.kode"
                     label="nama"
                     @search="onSearchFaskes"
                     @option:selected="opt => form.rujukan.nmppkrujukan = opt.nama"
                     :filterable="false"
                     placeholder="Cari Faskes Pemberi Rujukan..."
                     class="v-select-premium"
                   >
                     <template #no-options="{ search, searching }">
                       <template v-if="searching">Mencari...</template>
                       <em v-else style="opacity: 0.5;">Cari Faskes (Ketik minimal 3 huruf)...</em>
                     </template>
                   </v-select>
                 </div>
               </div>

              <h4 class="section-subtitle"><i class="fas fa-stethoscope me-2"></i>Diagnosa & Tujuan</h4>
              <div class="row g-3 mb-4">
                <div class="col-md-12">
                  <label class="form-label-premium">Diagnosa Awal (ICD-10)</label>
                  <v-select
                    v-model="form.diagAwal"
                    :options="diagnosaOptions"
                    :reduce="opt => opt.kode"
                    label="nama"
                    @search="onSearchDiagnosa"
                    @option:selected="opt => form.nmdiagnosaawal = opt.nama"
                    :filterable="false"
                    placeholder="Ketik kode atau nama diagnosa..."
                    class="v-select-premium"
                  >
                    <template #no-options="{ search, searching }">
                      <template v-if="searching">Mencari...</template>
                      <em v-else style="opacity: 0.5;">Cari Diagnosa ICD-10...</em>
                    </template>
                  </v-select>
                </div>
                <template v-if="form.jnsPelayanan !== '1'">
                  <div class="col-md-12">
                    <label class="form-label-premium">Poli Tujuan</label>
                    <v-select
                      v-model="form.poli.tujuan"
                      :options="poliOptions"
                      :reduce="opt => opt.kode"
                      label="nama"
                      @search="onSearchPoli"
                      :filterable="false"
                      placeholder="Ketik nama poli..."
                      class="v-select-premium"
                    >
                      <template #no-options="{ search, searching }">
                        <template v-if="searching">Mencari...</template>
                        <em v-else style="opacity: 0.5;">Cari Poliklinik BPJS...</em>
                      </template>
                    </v-select>
                  </div>
                  <div class="col-md-6">
                    <div class="form-check-premium mt-1">
                      <input type="checkbox" id="eksekutif" v-model="form.poli.eksekutif" true-value="1" false-value="0" />
                      <label for="eksekutif">Poli Eksekutif</label>
                    </div>
                  </div>
                </template>
              </div>

               <h4 class="section-subtitle"><i class="fas fa-user-md me-2"></i>Dokter DPJP</h4>
               <div class="col-md-12 mb-4">
                  <v-select
                    v-model="form.skdp.kodeDPJP"
                    :options="combinedDokterOptions"
                    :reduce="opt => opt.kode"
                    label="nama"
                    @option:selected="opt => { form.nmdpdjp = opt.nama; if(form.jnsPelayanan == '2') form.nmdpjplayanan = opt.nama; }"
                    placeholder="Pilih Dokter DPJP BPJS..."
                    class="v-select-premium mb-2"
                  ></v-select>
                  <div class="d-flex gap-2 position-relative">
                    <input type="text" v-model="form.skdp.noSurat" class="form-control-premium w-100" placeholder="No. Surat Kontrol / SPRI (Opsional)" />
                    <button @click="lookupSurat" class="btn-lookup-surat" :disabled="searchingSurat">
                      <i class="fas fa-search" v-if="!searchingSurat"></i>
                      <i class="fas fa-spinner fa-spin" v-else></i>
                    </button>

                    <!-- Surat Lookup Results List -->
                    <div v-if="showSuratList" class="surat-lookup-results custom-scroll animate__animated animate__fadeIn">
                      <div class="d-flex justify-content-between align-items-center p-3 border-bottom sticky-top bg-white">
                        <span class="fw-bold small text-muted">RIWAYAT SURAT KONTROL / SPRI</span>
                        <button class="btn-close-small" @click="showSuratList = false"><i class="fas fa-times"></i></button>
                      </div>
                      
                      <div class="p-3 border-bottom bg-light">
                        <div class="row g-2 align-items-center">
                          <div class="col">
                            <input type="date" v-model="lookupDate" class="form-control form-control-sm border-0 shadow-none bg-transparent" />
                          </div>
                          <div class="col-auto">
                            <button @click="lookupSurat" class="btn btn-sm btn-primary rounded-pill px-3" :disabled="searchingSurat">
                              <i class="fas fa-sync-alt me-1"></i> Cari
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="searchingSurat" class="p-4 text-center">
                        <i class="fas fa-spinner fa-spin me-2"></i> Mencari...
                      </div>
                      
                      <div v-else-if="suratOptions.length === 0" class="p-4 text-center text-muted">
                        Tidak ada surat kontrol/SPRI ditemukan.
                      </div>
                      
                      <div v-else>
                        <div v-for="surat in suratOptions" :key="surat.no_surat" @click="selectSurat(surat)" class="surat-item">
                          <div class="d-flex justify-content-between mb-1">
                            <span class="badge" :class="surat.jenis === 'SPRI' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'">{{ surat.jenis }}</span>
                            <span class="text-muted extra-small">{{ dayjs(surat.tgl_rencana).format('DD/MM/YYYY') }}</span>
                          </div>
                          <div class="fw-bold small text-primary mb-1">{{ surat.no_surat }}</div>
                          <div class="extra-small text-dark mb-1"><i class="fas fa-user-md me-1 text-muted"></i> {{ surat.nm_dokter }}</div>
                          <div class="extra-small text-muted"><i class="fas fa-hospital me-1"></i> {{ surat.nm_poli }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
             </div>
           </div>
 
         <!-- Advanced Sections -->
         <div class="col-md-12 mt-4 pt-4 border-top px-4">
          <h4 class="section-subtitle mb-4"><i class="fas fa-plus-circle me-2 text-primary"></i>Informasi Tambahan & Penjaminan</h4>
          
          <div class="row g-4">
            <!-- Section: Basic Extra Info -->
            <div class="col-md-6">
              <div class="form-group mb-3">
                <label class="form-label-premium">Nomor Telepon</label>
                <input type="text" v-model="form.noTelp" class="form-control-premium shadow-none" placeholder="Masukkan nomor telepon aktif..." />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group mb-3">
                <label class="form-label-premium">COB</label>
                <select v-model="form.cob.cob" class="form-select-premium">
                  <option value="0">Tidak</option>
                  <option value="1">Ya</option>
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group mb-3">
                <label class="form-label-premium">Katarak</label>
                <select v-model="form.katarak.katarak" class="form-select-premium">
                  <option value="0">Tidak</option>
                  <option value="1">Ya</option>
                </select>
              </div>
            </div>

            <!-- Section: Tujuan Kunjungan -->
            <div class="col-md-12">
              <div class="glass-card p-4 mb-4 border border-info border-opacity-10 bg-info bg-opacity-10 rounded-4 shadow-sm">
                <h6 class="text-info-emphasis fw-bold mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                  <i class="fas fa-hospital-user"></i> Tujuan Kunjungan & Prosedur
                </h6>
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label-premium small">Tujuan Kunjungan</label>
                    <select v-model="form.tujuanKunj" class="form-select-premium">
                      <option value="0">Normal</option>
                      <option value="1">Prosedur</option>
                      <option value="2">Konsul Dokter</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label-premium small">Flag Prosedur</label>
                    <select v-model="form.flagProcedure" class="form-select-premium">
                      <option value="">(Tanpa Flag)</option>
                      <option value="0">Prosedur Tidak Berkelanjutan</option>
                      <option value="1">Prosedur Berkelanjutan</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label-premium small">Penunjang</label>
                    <select v-model="form.kdPenunjang" class="form-select-premium">
                      <option value="">(Tanpa Penunjang)</option>
                      <option value="1">Radiologi</option>
                      <option value="2">Laboratorium</option>
                      <option value="3">USG</option>
                      <option value="4">Farmasi</option>
                      <option value="5">Lain-lain</option>
                      <option value="6">MRI</option>
                      <option value="7">CT-SCAN</option>
                      <option value="8">Echocardiography</option>
                      <option value="9">Endoscopy</option>
                      <option value="10">Kardiologi</option>
                      <option value="11">Hemodialisa</option>
                      <option value="12">Kesehatan Jiwa</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label-premium small">Asesmen Pelayanan</label>
                    <select v-model="form.assesmentPel" class="form-select-premium">
                      <option value="">(Tanpa Asesmen)</option>
                      <option value="1">Poli spesialis tidak tersedia hari ini</option>
                      <option value="2">Hari Libur</option>
                      <option value="3">Spesialis diluar jam pelayanan</option>
                      <option value="4">Kendala fasilitas</option>
                      <option value="5">Pemeriksaan Penunjang</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Laka Lantas -->
            <div class="col-md-12">
              <div class="form-group mb-3">
                <label class="form-label-premium">Status Kecelakaan (Laka Lantas)</label>
                <select v-model="form.jaminan.lakaLantas" class="form-select-premium border-danger border-opacity-25 bg-danger bg-opacity-10 text-danger fw-bold shadow-sm">
                  <option value="0">Bukan KLL</option>
                  <option value="1">KLL & Bukan Kec. Kerja</option>
                  <option value="2">KLL & Kec. Kerja</option>
                  <option value="3">Kec. Kerja</option>
                </select>
              </div>

              <div v-if="form.jaminan.lakaLantas !== '0'" class="animate__animated animate__fadeIn glass-card p-4 border border-danger border-opacity-25 mb-4 rounded-4 shadow-sm bg-danger bg-opacity-10">
                <h6 class="text-danger-emphasis fw-bold mb-4 d-flex align-items-center gap-2 border-bottom border-danger border-opacity-25 pb-2">
                  <i class="fas fa-ambulance text-danger"></i> Detail Kejadian Kecelakaan
                </h6>
                <div class="row g-4">
                  <div class="col-md-4">
                    <label class="form-label-premium small">Tanggal Kejadian</label>
                    <input type="date" v-model="form.jaminan.penjamin.tglKejadian" class="form-control-premium" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label-premium small">Suplesi</label>
                    <select v-model="form.jaminan.penjamin.suplesi.suplesi" class="form-select-premium">
                      <option value="0">Tidak</option>
                      <option value="1">Ya</option>
                    </select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label-premium small">No. SEP Suplesi</label>
                    <input type="text" v-model="form.jaminan.penjamin.suplesi.noSepSuplesi" class="form-control-premium" :disabled="form.jaminan.penjamin.suplesi.suplesi === '0'" placeholder="Input No. SEP Suplesi..." />
                  </div>
                  <div class="col-md-12">
                    <label class="form-label-premium small">Keterangan Kejadian</label>
                    <textarea v-model="form.jaminan.penjamin.keterangan" class="form-control-premium shadow-none" rows="2" placeholder="Jelaskan kronologi singkat kejadian..."></textarea>
                  </div>
                  
                  <!-- Location Lookups -->
                  <div class="col-md-4">
                    <label class="form-label-premium small text-dark">Provinsi Kejadian</label>
                    <v-select 
                      v-model="form.jaminan.penjamin.suplesi.lokasiLaka.kdPropinsi"
                      :options="propinsiOptions"
                      :reduce="opt => opt.kode"
                      label="nama"
                      placeholder="Cari Provinsi..."
                      class="v-select-premium"
                    ></v-select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label-premium small text-dark">Kabupaten Kejadian</label>
                    <v-select 
                      v-model="form.jaminan.penjamin.suplesi.lokasiLaka.kdKabupaten"
                      :options="kabupatenOptions"
                      :reduce="opt => opt.kode"
                      label="nama"
                      placeholder="Cari Kabupaten..."
                      class="v-select-premium"
                      :disabled="!form.jaminan.penjamin.suplesi.lokasiLaka.kdPropinsi"
                    ></v-select>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label-premium small text-dark">Kecamatan Kejadian</label>
                    <v-select 
                      v-model="form.jaminan.penjamin.suplesi.lokasiLaka.kdKecamatan"
                      :options="kecamatanOptions"
                      :reduce="opt => opt.kode"
                      label="nama"
                      placeholder="Cari Kecamatan..."
                      class="v-select-premium"
                      :disabled="!form.jaminan.penjamin.suplesi.lokasiLaka.kdKabupaten"
                    ></v-select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Naik Kelas (Ranap Only) -->
            <div v-if="form.jnsPelayanan === '1'" class="col-md-12">
              <div class="glass-card p-4 border border-warning border-opacity-25 bg-warning bg-opacity-10 rounded-4 shadow-sm mb-4">
                <h6 class="text-warning-emphasis fw-bold mb-4 d-flex align-items-center gap-2 border-bottom border-warning border-opacity-25 pb-2">
                  <i class="fas fa-level-up-alt text-warning"></i> Pengaturan Naik Kelas Rawat
                </h6>
                <div class="row g-4">
                  <div class="col-md-4">
                    <label class="form-label-premium small">Pilih Kelas Naik</label>
                    <select v-model="form.klsRawat.klsRawatNaik" class="form-select-premium">
                      <option value="">(Tidak Naik Kelas)</option>
                      <option value="1">VVIP</option>
                      <option value="2">VIP</option>
                      <option value="3">Kelas 1</option>
                      <option value="4">Kelas 2</option>
                      <option value="5">Kelas 3</option>
                      <option value="6">ICCU</option>
                      <option value="7">ICU</option>
                    </select>
                  </div>
                  <div v-if="form.klsRawat.klsRawatNaik" class="col-md-4">
                    <label class="form-label-premium small">Metode Pembiayaan</label>
                    <select v-model="form.klsRawat.pembiayaan" class="form-select-premium">
                      <option value="1">Pribadi</option>
                      <option value="2">Pemberi Kerja</option>
                      <option value="3">Asuransi Kesehatan Tambahan</option>
                    </select>
                  </div>
                  <div v-if="form.klsRawat.klsRawatNaik" class="col-md-4">
                    <label class="form-label-premium small">Nama Penanggung Jawab</label>
                    <input type="text" v-model="form.klsRawat.penanggungJawab" class="form-control-premium shadow-none" placeholder="Input nama P.J..." />
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>

   <div class="modal-footer-premium p-4">
        <button class="btn-cancel-premium" @click="close" :disabled="submitting">Batal</button>
        <button class="btn-generate-premium" @click="submitSep" :disabled="submitting || !isFormValid">
          <span v-if="submitting"><i class="fas fa-spinner fa-spin me-2"></i>Memproses...</span>
          <span v-else>
            <i class="fas" :class="isEditMode ? 'fa-save' : 'fa-check-circle'"></i>
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
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  width: 95%;
  max-width: 1100px;
  max-height: 90vh;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header-premium {
  padding: 1.5rem 2.5rem;
  background: white;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icon-bg {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 8px 15px rgba(37, 99, 235, 0.2);
}

.modal-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  color: #1e293b;
  font-size: 1.4rem;
}

.btn-close-premium {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-premium:hover {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fca5a5;
  transform: rotate(90deg);
}

.modal-body {
  overflow-y: auto;
}

.info-section {
    position: relative;
}

.section-subtitle {
  font-size: 0.95rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.patient-summary-card {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid #edf2f7;
}

.patient-avatar {
  width: 60px;
  height: 60px;
  background: white;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #3b82f6;
  font-size: 1.25rem;
}

.patient-detail h5 {
  font-weight: 700;
  color: #1e293b;
}

/* Premium Form Elements */
.form-label-premium {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control-premium, 
.form-select-premium {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  color: #1e293b;
  font-weight: 500;
  transition: all 0.2s;
}

.form-control-premium:focus, 
.form-select-premium:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.btn-check-rujukan {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 12px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

.btn-check-rujukan:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-2px);
}

.btn-lookup-surat {
    background: #f8fafc;
    color: #64748b;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-lookup-surat:hover:not(:disabled) {
    background: white;
    color: #3b82f6;
    border-color: #3b82f6;
}

.surat-lookup-results {
    position: absolute;
    bottom: 110%;
    right: 0;
    width: 320px;
    max-height: 350px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
    border: 1px solid #f1f5f9;
    z-index: 100;
    overflow-y: auto;
}

.surat-item {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: all 0.2s;
}

.surat-item:hover {
    background: #f8fafc;
}

.surat-item:last-child {
    border-bottom: none;
}

.extra-small {
    font-size: 0.75rem;
}

.btn-close-small {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.25rem;
}

.form-check-premium {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.form-check-premium input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.form-check-premium label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
    cursor: pointer;
}

.modal-footer-premium {
    flex-shrink: 0;
}

.glass-card {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 16px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
}

.glass-card:hover {
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
}

.text-info-emphasis {
    color: #0891b2;
}

.text-danger-emphasis {
    color: #e11d48;
}

.text-warning-emphasis {
    color: #d97706;
}

.v-select-premium .vs__dropdown-toggle {
    border: 1.5px solid #e2e8f0 !important;
    border-radius: 12px !important;
    padding: 6px 4px !important;
    background: white !important;
    transition: all 0.2s !important;
}

.v-select-premium.vs--open .vs__dropdown-toggle {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
}

.v-select-premium .vs__selected {
    color: #1e293b !important;
    font-weight: 500 !important;
}

.v-select-premium .vs__search::placeholder {
    color: #94a3b8 !important;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translate3d(0, -10px, 0);
    }
    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

.animate__fadeInDown {
    animation-name: fadeInDown;
}

.modal-footer-premium {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel-premium {
  padding: 0.75rem 2rem;
  border-radius: 14px;
  border: 1.5px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-premium:hover {
  background: #f1f5f9;
}

.btn-generate-premium {
  padding: 0.75rem 2.5rem;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.3);
}

.btn-generate-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.4);
}

.btn-generate-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(1);
}

/* SweetAlert2 Glass-morphism & Icon Precision */
.swal2-glass {
    background: rgba(255, 255, 255, 0.8) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border-radius: 28px !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
    padding: 2rem !important;
}

.swal2-glass .swal2-title {
    color: #1e293b !important;
    font-size: 1.75rem !important;
}

.swal2-glass .swal2-icon {
    border-width: 3px !important;
    zoom: 1.1;
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
    box-sizing: content-box !important;
}

/* Precise Icon Alignment Fix */
.swal2-glass .swal2-success-line-tip,
.swal2-glass .swal2-success-line-long {
    background-color: #10b981 !important;
    height: 5px !important;
    border-radius: 5px !important;
}

.swal2-glass .swal2-success-line-tip {
    left: 0.75rem !important;
    top: 2.8rem !important;
    width: 1.5rem !important;
}

.swal2-glass .swal2-success-line-long {
    right: 0.5rem !important;
    top: 2.3rem !important;
    width: 2.8rem !important;
}

.swal2-glass .swal2-success-ring {
    border-color: rgba(16, 185, 129, 0.2) !important;
    border-width: 5px !important;
}

.swal2-glass .swal2-success-fix {
    background-color: transparent !important;
}

.swal2-glass .swal2-success-circular-line-left,
.swal2-glass .swal2-success-circular-line-right {
    background-color: transparent !important;
}

.glass-badge {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    letter-spacing: 0.5px;
    font-size: 1.1rem;
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
}
</style>

<style>
/* Global overwrite for v-select premium look */
.v-select-premium .vs__dropdown-toggle {
    border-radius: 12px !important;
    border: 1.5px solid #e2e8f0 !important;
    padding: 0.4rem 0 !important;
    background: white !important;
}

.v-select-premium .vs__selected {
    color: #1e293b !important;
    font-weight: 600 !important;
}

.v-select-premium .vs__search::placeholder {
    color: #94a3b8 !important;
    font-weight: 500 !important;
}
</style>
