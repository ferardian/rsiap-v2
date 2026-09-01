<template>
  <div>
    <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(15, 23, 42, 0.5); backdrop-filter: blur(4px); z-index: 1055;" @click.self="close">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
          
          <!-- Modal Header -->
          <div class="modal-header bg-white py-3 px-4 border-b border-slate-100 flex items-center justify-between">
            <h6 class="modal-title font-bold flex items-center gap-2.5 text-slate-800 m-0 text-base">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm shadow-xs">
                <i class="fas fa-globe"></i>
              </div>
              <span>Detail SEP dari WebService BPJS VClaim</span>
            </h6>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Realtime VClaim WS
              </span>
              <button type="button" class="btn-close shadow-none ms-2" @click="close"></button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-4 bg-slate-50">
            
            <!-- Loading State -->
            <div v-if="loading" class="py-12 text-center">
              <div class="spinner-border text-blue-600 mb-3" role="status" style="width: 2.5rem; height: 2.5rem;">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="text-slate-600 text-sm font-semibold m-0">Mengambil Data SEP Langsung dari Server BPJS VClaim...</p>
              <small class="text-slate-400 text-xs mt-1 block">No. SEP: {{ noSep }}</small>
            </div>

            <!-- Error Alert State -->
            <div v-else-if="errorMessage" class="alert alert-danger shadow-xs border border-rose-200 rounded-xl flex items-start gap-3 p-3.5 mb-0">
              <i class="fas fa-exclamation-triangle text-xl text-rose-600 mt-0.5"></i>
              <div>
                <h6 class="font-bold text-xs mb-0.5">Gagal Mengambil Data SEP dari WebService BPJS</h6>
                <p class="text-xs text-secondary m-0">{{ errorMessage }}</p>
              </div>
            </div>

            <!-- Data SEP Display -->
            <div v-else-if="sepWs" class="fade-in space-y-3">
              
              <!-- Patient Header Card -->
              <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 mb-1.5">
                    <i class="fas fa-user-tag text-blue-500"></i> {{ sepWs.peserta?.jnsPeserta || sepWs.peserta?.jenisPeserta || 'Peserta BPJS' }}
                  </span>
                  <h5 class="font-extrabold text-slate-900 tracking-tight m-0 text-lg">{{ sepWs.peserta?.nama || sepWs.nama }}</h5>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-2">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200 text-slate-700 font-medium">
                      <i class="fas fa-credit-card text-blue-600"></i> Kartu: <strong class="text-slate-900">{{ sepWs.peserta?.noKartu || sepWs.noKartu }}</strong>
                    </span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200 text-slate-700 font-medium">
                      <i class="fas fa-hospital-user text-blue-600"></i> RM: <strong class="text-slate-900">{{ sepWs.peserta?.noMr || sepWs.nomr || '-' }}</strong>
                    </span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200 text-slate-700 font-medium">
                      <i class="fas fa-calendar-alt text-blue-600"></i> Lahir: <strong class="text-slate-900">{{ formatDate(sepWs.peserta?.tglLahir) }}</strong>
                    </span>
                  </div>
                </div>

                <div class="text-left md:text-right flex-shrink-0">
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                    <i class="fas fa-file-invoice me-1"></i> {{ sepWs.noSep }}
                  </div>
                  <small class="block text-slate-500 text-[11px] mt-1">Tgl SEP: {{ formatLongDate(sepWs.tglSep) }}</small>
                </div>
              </div>

              <!-- Main SEP Grid Details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                <!-- Jenis Pelayanan -->
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-blue-600 shadow-xs">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <i class="fas fa-clinic-medical text-blue-600"></i> Jenis Pelayanan
                  </div>
                  <div class="text-sm font-bold text-slate-900">
                    {{ sepWs.jnsPelayanan == '1' ? '1. Rawat Inap' : '2. Rawat Jalan' }}
                  </div>
                  <p class="text-xs text-slate-500 mt-1 m-0">Kelas Hak: {{ sepWs.kelasRawat || sepWs.peserta?.hakKelas || '-' }}</p>
                </div>

                <!-- Poli / Spesialis -->
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-cyan-600 shadow-xs">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <i class="fas fa-stethoscope text-cyan-600"></i> Poli Tujuan & Eksekutif
                  </div>
                  <div class="text-sm font-bold text-slate-900">
                    {{ sepWs.poli || '-' }}
                  </div>
                  <p class="text-xs text-slate-500 mt-1 m-0">Poli Eksekutif: {{ sepWs.poliEksekutif == '1' ? 'Ya (Eksekutif)' : 'Tidak (Reguler)' }}</p>
                </div>

                <!-- DPJP -->
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-emerald-600 shadow-xs">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <i class="fas fa-user-md text-emerald-600"></i> DPJP Pelayanan
                  </div>
                  <div class="text-sm font-bold text-slate-900">
                    {{ sepWs.dpjp?.nmDPJP || sepWs.nmdpjplayanan || '-' }}
                  </div>
                  <p class="text-xs text-slate-500 mt-1 m-0">Kode DPJP: {{ sepWs.dpjp?.kdDPJP || '-' }}</p>
                </div>

                <!-- Diagnosa Awal -->
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-amber-600 shadow-xs">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <i class="fas fa-notes-medical text-amber-600"></i> Diagnosa Awal BPJS
                  </div>
                  <div class="text-sm font-bold text-slate-900">
                    {{ sepWs.diagnosa || '-' }}
                  </div>
                  <p class="text-xs text-slate-500 mt-1 m-0">Kode ICD-10 terdaftar di VClaim</p>
                </div>

                <!-- No Rujukan & Penjamin -->
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-sky-600 shadow-xs">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <i class="fas fa-file-alt text-sky-600"></i> Rujukan & Penjamin
                  </div>
                  <div class="text-sm font-bold text-slate-900">
                    Rujukan: {{ sepWs.noRujukan || '-' }}
                  </div>
                  <p class="text-xs text-slate-500 mt-1 m-0">Penjamin: {{ sepWs.penjamin || '-' }}</p>
                </div>

                <!-- Catatan SEP -->
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-rose-600 shadow-xs">
                  <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <i class="fas fa-comment-medical text-rose-600"></i> Catatan SEP
                  </div>
                  <div class="text-sm font-bold text-slate-900">
                    {{ sepWs.catatan || '-' }}
                  </div>
                  <p class="text-xs text-slate-500 mt-1 m-0">Catatan resmi pada lembar SEP</p>
                </div>

              </div>

              <!-- Kontrol & Surat SKDP Section (If Available) -->
              <div v-if="sepWs.kontrol && sepWs.kontrol.noSurat" class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <div class="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-1.5">
                  <i class="fas fa-envelope-open-text text-indigo-600"></i> Informasi Surat Kontrol / SKDP
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div><span class="text-slate-400">No. Surat:</span> <strong class="text-slate-800">{{ sepWs.kontrol.noSurat }}</strong></div>
                  <div><span class="text-slate-400">Dokter Kontrol:</span> <strong class="text-slate-800">{{ sepWs.kontrol.nmDokter }}</strong></div>
                  <div><span class="text-slate-400">Kode Dokter:</span> <strong class="text-slate-800">{{ sepWs.kontrol.kdDokter }}</strong></div>
                </div>
              </div>

              <!-- Kecelakaan & Lokasi Section (If Available) -->
              <div v-if="sepWs.kdStatusKecelakaan && sepWs.kdStatusKecelakaan != '0'" class="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900">
                <div class="font-bold mb-1 flex items-center gap-1.5 text-amber-900">
                  <i class="fas fa-car-crash text-amber-600"></i> Status & Lokasi Kecelakaan: {{ sepWs.nmstatusKecelakaan || sepWs.kdStatusKecelakaan }}
                </div>
                <div v-if="sepWs.lokasiKejadian" class="mt-1 space-y-0.5 text-amber-800">
                  <div>Lokasi: {{ sepWs.lokasiKejadian.lokasi || '-' }}</div>
                  <div>Wilayah: Kec. {{ sepWs.lokasiKejadian.kdKec }}, Kab. {{ sepWs.lokasiKejadian.kdKab }}, Prov. {{ sepWs.lokasiKejadian.kdProp }}</div>
                  <div>Keterangan: {{ sepWs.lokasiKejadian.ketKejadian || '-' }}</div>
                </div>
              </div>

            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer bg-white border-t border-slate-100 py-2.5 px-4 flex justify-end gap-2">
            <button type="button" class="btn btn-sm btn-light border border-slate-300 rounded-full px-4 font-semibold text-slate-600 shadow-xs" style="width: auto !important;" @click="close">
              <i class="fas fa-times me-1 text-slate-400"></i> Tutup
            </button>
            <button v-if="sepWs" type="button" class="btn btn-sm btn-primary rounded-full px-4 font-semibold shadow-xs" style="width: auto !important;" @click="handlePrint">
              <i class="fas fa-print me-1"></i> Cetak SEP
            </button>
          </div>

        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import bpjsVclaimService from '@/services/bpjsVclaimService'

const props = defineProps({
  noSep: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const loading = ref(true)
const sepWs = ref(null)
const errorMessage = ref('')

const fetchSepWsDetails = async () => {
  if (!props.noSep) {
    errorMessage.value = 'Nomor SEP tidak valid.'
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''
  sepWs.value = null

  try {
    const res = await bpjsVclaimService.getSep(props.noSep)
    console.log('VClaim WS SEP Detail Response:', res.data)
    
    if (res.data?.metaData?.code === '200' && res.data?.response) {
      sepWs.value = res.data.response
    } else {
      errorMessage.value = res.data?.metaData?.message || 'Data SEP tidak ditemukan di server WebService BPJS.'
    }
  } catch (err) {
    console.error('Error fetching VClaim WS SEP details:', err)
    errorMessage.value = err.response?.data?.metaData?.message || err.message || 'Gagal terhubung ke WebService BPJS VClaim.'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00') return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (_) {
    return dateStr
  }
}

const formatLongDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  } catch (_) {
    return dateStr
  }
}

const handlePrint = () => {
  const url = `${import.meta.env.VITE_API_URL}/sep/${props.noSep}/print`
  window.open(url, '_blank')
}

const close = () => emit('close')

onMounted(() => {
  fetchSepWsDetails()
})
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.25s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
