<template>
  <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="close">
    <div class="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Modal Header -->
      <div class="px-6 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base shadow-sm">
            <i class="fas fa-id-card"></i>
          </div>
          <h3 class="font-bold text-slate-800 text-base m-0">Cek Kepesertaan BPJS Kesehatan</h3>
        </div>
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> VClaim 2.0 Connected
          </span>
          <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" @click="close">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="p-5 bg-slate-50 overflow-y-auto flex-1">
        
        <!-- Search Form -->
        <div class="bg-white border border-slate-200/80 rounded-xl p-4 mb-4 shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div class="md:col-span-3">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Cari Berdasarkan</label>
              <select v-model="searchType" class="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                <option value="nokartu">No. Kartu BPJS</option>
                <option value="nik">NIK KTP</option>
              </select>
            </div>
            <div class="md:col-span-4">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Nomor {{ searchType === 'nokartu' ? 'Kartu' : 'NIK' }}</label>
              <input
                type="text"
                v-model="searchQuery"
                :placeholder="searchType === 'nokartu' ? '13 digit No. Kartu...' : '16 digit NIK...'"
                class="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                @keyup.enter="handleSearch"
              />
            </div>
            <div class="md:col-span-3">
              <label class="block text-xs font-semibold text-slate-600 mb-1.5">Tgl. SEP / Pelayanan</label>
              <input
                type="date"
                v-model="tglSep"
                class="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div class="md:col-span-2">
              <button
                class="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                :disabled="loading"
                @click="handleSearch"
              >
                <span v-if="loading" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <i v-else class="fas fa-search"></i>
                <span>Cek</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="py-8 text-center">
          <div class="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-slate-600 text-sm font-semibold">Menghubungkan ke Server BPJS VClaim...</p>
        </div>

        <!-- Error Alert State -->
        <div v-else-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 shadow-sm mb-4">
          <i class="fas fa-exclamation-triangle text-lg text-rose-600 mt-0.5"></i>
          <div>
            <h6 class="font-bold text-sm mb-0.5">Pemeriksaan Kepesertaan Gagal</h6>
            <p class="text-xs text-rose-700 m-0">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Result Content -->
        <div v-else-if="peserta" class="space-y-4">
          
          <!-- Header Result Card (Tailwind Styling) -->
          <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 mb-2">
                <i class="fas fa-user-tag text-blue-500"></i> {{ peserta.jenisPeserta?.keterangan || 'Peserta BPJS' }}
              </span>
              <h4 class="text-lg font-extrabold text-slate-900 tracking-tight m-0">{{ peserta.nama }}</h4>
              <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-2.5">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-slate-700 font-medium">
                  <i class="fas fa-credit-card text-blue-600"></i> Kartu: <strong class="text-slate-900">{{ peserta.noKartu }}</strong>
                </span>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-slate-700 font-medium">
                  <i class="fas fa-id-card text-blue-600"></i> NIK: <strong class="text-slate-900">{{ peserta.nik }}</strong>
                </span>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 text-slate-700 font-medium">
                  <i class="fas fa-hospital-user text-blue-600"></i> RM: <strong class="text-slate-900">{{ peserta.mr?.noMR || '-' }}</strong>
                </span>
              </div>
            </div>

            <!-- Status Badge Pill -->
            <div class="text-left md:text-right flex-shrink-0">
              <div :class="[
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border shadow-xs',
                isAktif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              ]">
                <i :class="isAktif ? 'fas fa-check-circle text-emerald-600' : 'fas fa-times-circle text-rose-600'"></i>
                <span>{{ peserta.statusPeserta?.keterangan?.toUpperCase() || 'STATUS UNKNOWN' }}</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1 m-0">TMT: {{ formatDate(peserta.tglTMT) }}</p>
            </div>
          </div>

          <!-- Kelas Rawat Compatibility Banner -->
          <div :class="[
            'p-3.5 rounded-xl border flex items-center gap-3.5 shadow-sm transition-all',
            kelasCheck.bgClass
          ]">
            <div :class="['w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-base shadow-sm', kelasCheck.iconBgClass]">
              <i :class="kelasCheck.icon"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <h6 :class="['font-bold text-sm m-0', kelasCheck.textClass]">{{ kelasCheck.title }}</h6>
                <span :class="['px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs', kelasCheck.badgeClass]">
                  {{ kelasCheck.badgeText }}
                </span>
              </div>
              <p class="text-xs text-slate-600 mt-1 m-0 leading-relaxed">{{ kelasCheck.description }}</p>
            </div>
          </div>

          <!-- Grid Details (Tailwind Utilities) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            <!-- Hak Kelas BPJS -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-all">
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <i class="fas fa-layer-group text-blue-600"></i> Hak Kelas BPJS
              </div>
              <div class="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>{{ peserta.hakKelas?.keterangan || '-' }}</span>
                <span class="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                  Kode: {{ peserta.hakKelas?.kode || '-' }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1 m-0">Sesuai data kepesertaan terdaftar BPJS</p>
            </div>

            <!-- Kelas SEP / SIMRS -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-cyan-600 shadow-sm hover:shadow-md transition-all">
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <i class="fas fa-procedures text-cyan-600"></i> Kelas Rawat di SEP / SIMRS
              </div>
              <div class="text-sm font-bold text-slate-800">
                {{ sepKlsText }}
              </div>
              <p class="text-xs text-slate-500 mt-1 m-0">Kelas yang diinputkan untuk pelayanan ini</p>
            </div>

            <!-- Faskes 1 -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-emerald-600 shadow-sm hover:shadow-md transition-all">
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <i class="fas fa-clinic-medical text-emerald-600"></i> Faskes Tingkat 1 (FKTP)
              </div>
              <div class="text-sm font-bold text-slate-800">
                {{ peserta.provUmum?.nmProvider || '-' }}
              </div>
              <p class="text-xs text-slate-500 mt-1 m-0">Kode Faskes: {{ peserta.provUmum?.kdProvider || '-' }}</p>
            </div>

            <!-- Jenis & Pemberi Kerja -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-amber-600 shadow-sm hover:shadow-md transition-all">
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <i class="fas fa-building text-amber-600"></i> Instansi / Pemberi Kerja
              </div>
              <div class="text-sm font-bold text-slate-800">
                {{ peserta.pemberiKerja?.keterangan || 'Tidak Ada / Mandiri' }}
              </div>
              <p class="text-xs text-slate-500 mt-1 m-0">Jenis: {{ peserta.jenisPeserta?.keterangan || '-' }}</p>
            </div>

            <!-- Demografi & Umur -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-sky-600 shadow-sm hover:shadow-md transition-all">
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <i class="fas fa-user-clock text-sky-600"></i> Tgl Lahir & Umur
              </div>
              <div class="text-sm font-bold text-slate-800">
                {{ formatDate(peserta.tglLahir) }} ({{ peserta.sex === 'L' ? 'Laki-laki' : 'Perempuan' }})
              </div>
              <p class="text-xs text-slate-500 mt-1 m-0">{{ peserta.umur?.umurSaatPelayanan || peserta.umur?.umurSekarang || '-' }}</p>
            </div>

            <!-- COB & Kontak -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/90 border-l-4 border-l-rose-600 shadow-sm hover:shadow-md transition-all">
              <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <i class="fas fa-shield-alt text-rose-600"></i> COB & Kontak
              </div>
              <div class="text-sm font-bold text-slate-800">
                COB: {{ peserta.cob?.nmAsuransi ? peserta.cob.nmAsuransi : 'Tidak Ada' }}
              </div>
              <p class="text-xs text-slate-500 mt-1 m-0">No. Telp: {{ peserta.mr?.noTelepon || '-' }}</p>
            </div>

          </div>

        </div>

      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3 bg-white border-t border-slate-100 flex justify-end flex-shrink-0">
        <button
          type="button"
          class="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 active:bg-slate-200 rounded-full shadow-xs transition-all flex items-center gap-1.5"
          @click="close"
        >
          <i class="fas fa-times text-slate-400"></i>
          <span>Tutup</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import bpjsVclaimService from '@/services/bpjsVclaimService'

const props = defineProps({
  noKartu: {
    type: String,
    default: ''
  },
  nik: {
    type: String,
    default: ''
  },
  tglSepDate: {
    type: String,
    default: ''
  },
  sepKlsRawat: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const searchType = ref(props.noKartu ? 'nokartu' : (props.nik ? 'nik' : 'nokartu'))
const searchQuery = ref(props.noKartu || props.nik || '')
const tglSep = ref(props.tglSepDate || new Date().toISOString().slice(0, 10))

const loading = ref(false)
const peserta = ref(null)
const errorMessage = ref('')

const isAktif = computed(() => {
  if (!peserta.value || !peserta.value.statusPeserta) return false
  const ket = (peserta.value.statusPeserta.keterangan || '').toUpperCase()
  return ket === 'AKTIF' || peserta.value.statusPeserta.kode === '0'
})

const sepKlsText = computed(() => {
  if (!props.sepKlsRawat) return 'Tidak Terikat Data SEP'
  if (props.sepKlsRawat === '1') return 'Kelas 1'
  if (props.sepKlsRawat === '2') return 'Kelas 2'
  if (props.sepKlsRawat === '3') return 'Kelas 3'
  return `Kelas ${props.sepKlsRawat}`
})

const kelasCheck = computed(() => {
  if (!peserta.value) {
    return {
      title: 'Pemeriksaan Kelas Rawat',
      badgeText: 'MEMUAT',
      badgeClass: 'bg-slate-200 text-slate-700',
      bgClass: 'bg-slate-50 border-slate-200',
      textClass: 'text-slate-800',
      icon: 'fas fa-info-circle',
      iconBgClass: 'bg-white text-slate-500',
      description: 'Sedang memeriksa data kepesertaan...'
    }
  }

  const hakKode = peserta.value.hakKelas?.kode || ''
  const hakKet = peserta.value.hakKelas?.keterangan || `Kelas ${hakKode}`
  const sepKode = props.sepKlsRawat || ''

  if (!sepKode) {
    return {
      title: `Hak Kelas Rawat BPJS: ${hakKet}`,
      badgeText: 'HAK KELAS',
      badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
      bgClass: 'bg-blue-50/80 border-blue-200 border-l-4 border-l-blue-500',
      textClass: 'text-blue-900',
      icon: 'fas fa-id-badge',
      iconBgClass: 'bg-blue-600 text-white',
      description: `Pasien terdaftar secara resmi di BPJS dengan Hak Kelas Rawat: ${hakKet}.`
    }
  }

  if (hakKode === sepKode) {
    return {
      title: 'Kelas Rawat Sesuai (Match)',
      badgeText: 'SESUAI ✅',
      badgeClass: 'bg-emerald-600 text-white',
      bgClass: 'bg-emerald-50/80 border-emerald-200 border-l-4 border-l-emerald-500',
      textClass: 'text-emerald-900',
      icon: 'fas fa-check-circle',
      iconBgClass: 'bg-emerald-600 text-white',
      description: `Kelas rawat di SEP (Kelas ${sepKode}) SUDAH SESUAI dengan Hak Kelas Kepesertaan BPJS (${hakKet}).`
    }
  }

  const hakNum = parseInt(hakKode) || 0
  const sepNum = parseInt(sepKode) || 0

  if (sepNum < hakNum && sepNum > 0) {
    return {
      title: 'Pasien Naik Kelas Rawat',
      badgeText: 'NAIK KELAS ⚠️',
      badgeClass: 'bg-amber-500 text-white',
      bgClass: 'bg-amber-50/80 border-amber-200 border-l-4 border-l-amber-500',
      textClass: 'text-amber-900',
      icon: 'fas fa-arrow-alt-circle-up',
      iconBgClass: 'bg-amber-500 text-white',
      description: `Hak kelas BPJS pasien adalah ${hakKet}, namun SEP diinputkan ke Kelas ${sepKode} (Naik Kelas). Pastikan selisih biaya / pembiayaan sudah sesuai!`
    }
  }

  return {
    title: 'Perbedaan Kelas Rawat Detected',
    badgeText: 'BEDA KELAS ❌',
    badgeClass: 'bg-rose-600 text-white',
    bgClass: 'bg-rose-50/80 border-rose-200 border-l-4 border-l-rose-500',
    textClass: 'text-rose-900',
    icon: 'fas fa-exclamation-circle',
    iconBgClass: 'bg-rose-600 text-white',
    description: `Hak kelas BPJS pasien adalah ${hakKet}, namun di SEP tertera Kelas ${sepKode}. Silakan periksa kembali kesesuaian data pasien.`
  }
})

const handleSearch = async () => {
  if (!searchQuery.value) {
    errorMessage.value = 'Silakan masukkan Nomor Kartu BPJS atau NIK terlebih dahulu.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  peserta.value = null

  try {
    let res
    if (searchType.value === 'nokartu') {
      res = await bpjsVclaimService.getPesertaByNoKartu(searchQuery.value, tglSep.value)
    } else {
      res = await bpjsVclaimService.getPesertaByNik(searchQuery.value, tglSep.value)
    }

    if (res.data?.metaData?.code === '200' && res.data?.response?.peserta) {
      peserta.value = res.data.response.peserta
    } else {
      errorMessage.value = res.data?.metaData?.message || 'Data kepesertaan BPJS tidak ditemukan.'
    }
  } catch (err) {
    console.error('Error fetching BPJS participant:', err)
    errorMessage.value = err.response?.data?.metaData?.message || err.message || 'Terjadi kesalahan saat koneksi ke VClaim BPJS.'
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

const close = () => emit('close')

onMounted(() => {
  if (searchQuery.value) {
    handleSearch()
  }
})
</script>
