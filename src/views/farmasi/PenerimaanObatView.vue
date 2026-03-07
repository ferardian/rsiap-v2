<template>
  <div class="penerimaan-obat-page">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1 fw-bold text-dark">Penerimaan Obat (Faktur Pembelian)</h2>
        <p class="text-muted mb-0 small">Farmasi / Penerimaan Obat</p>
      </div>
      <div>
        <button @click="simpanTransaksi" :disabled="loading" class="btn btn-primary d-flex align-items-center">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <i v-else class="fas fa-save me-2"></i>
          Simpan Faktur
        </button>
      </div>
    </div>

    <!-- Informasi Faktur Form -->
    <div class="card shadow-sm mb-4 border-0">
      <div class="card-header border-bottom-0 py-3">
        <h6 class="text-uppercase fw-bold text-white mb-0">Informasi Faktur & Pengiriman</h6>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <!-- Col 1 -->
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary mb-1">No. Faktur <span class="text-danger">*</span></label>
              <input v-model="form.no_faktur" type="text" class="form-control" placeholder="Contoh: INV-2026/001">
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary mb-1">No. Order / SP <span class="text-danger">*</span></label>
              <input v-model="form.no_order" type="text" class="form-control" placeholder="Contoh: PO-001/03/2026">
            </div>
          </div>

          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary mb-1">Pilih Supplier <span class="text-danger">*</span></label>
              <v-select 
                v-model="form.kode_suplier" 
                :reduce="sup => sup.kode_suplier" 
                label="nama_suplier" 
                :options="suppliers" 
                placeholder="-- Pilih Supplier --"
                :append-to-body="true">
              </v-select>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary mb-1">Gudang Tujuan <span class="text-danger">*</span></label>
              <v-select 
                v-model="form.kd_bangsal" 
                :reduce="gudang => gudang.kd_bangsal" 
                label="nm_bangsal" 
                :options="bangsal_pkp" 
                placeholder="-- Pilih Gudang Tujuan --"
                :append-to-body="true">
              </v-select>
              <div class="form-text" style="font-size: 0.75rem;">Stok riil dan riwayat akan dimutasikan ke sini.</div>
            </div>
          </div>

          <!-- Col 3 -->
          <div class="col-md-4">
            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label small fw-semibold text-secondary mb-1">Tgl Datang <span class="text-danger">*</span></label>
                <input v-model="form.tgl_pesan" type="date" class="form-control">
              </div>
              <div class="col-6">
                <label class="form-label small fw-semibold text-secondary mb-1">Tgl Faktur <span class="text-danger">*</span></label>
                <input v-model="form.tgl_faktur" type="date" class="form-control">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label small fw-semibold text-secondary mb-1">Tgl Jatuh Tempo <span class="text-danger">*</span></label>
              <input v-model="form.tgl_tempo" type="date" class="form-control">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Table -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 gap-md-0 py-3">
        <h6 class="text-uppercase fw-bold text-white mb-0">Detail Item Diterima</h6>
        <div class="d-flex flex-wrap flex-md-nowrap gap-2 w-100 mt-2 mt-md-0 justify-content-md-end">
          <button @click="openScanModal" class="btn btn-sm btn-warning text-dark fw-bold shadow-sm flex-grow-1 flex-md-grow-0">
            <i class="fas fa-robot me-1"></i> Scan Smart Faktur
          </button>
          <button @click="openBarangModal" class="btn btn-sm btn-light text-primary fw-semibold flex-grow-1 flex-md-grow-0">
            <i class="fas fa-plus me-1"></i> Tambah Obat / Alkes
          </button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-secondary small">
            <tr>
              <th scope="col" style="min-width: 250px;">Nama Barang / Kode</th>
              <th scope="col" style="width: 100px;">Satuan</th>
              <th scope="col" class="text-center" style="width: 100px;">Jumlah</th>
              <th scope="col" class="text-end" style="width: 150px;">Harga Pesan</th>
              <th scope="col" class="text-center" style="width: 100px;">Diskon (%)</th>
              <th scope="col" style="width: 150px;">No Batch</th>
              <th scope="col" style="width: 130px;">Kadaluarsa</th>
              <th scope="col" class="text-end text-primary" style="width: 150px;">Total</th>
              <th scope="col" class="text-center" style="width: 50px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="items.length === 0">
              <td colspan="9" class="text-center text-muted py-5">
                <i class="fas fa-box-open fa-3x mb-3 text-light"></i>
                <p class="mb-0">Belum ada item ditambahkan pada penerimaan faktur ini.</p>
              </td>
            </tr>
            <tr v-for="(item, index) in items" :key="index">
              <td>
                <div class="d-flex align-items-center mb-1">
                  <div class="fw-bold text-dark text-truncate d-inline-block" style="max-width: 230px;" :title="item.nama_brng">{{ item.nama_brng }}</div>
                  <span v-if="!item.kode_brng || item.is_new_item" class="badge bg-danger ms-2" title="Belum Terdaftar di Master Data"><i class="fas fa-exclamation-triangle me-1"></i> Data Baru</span>
                </div>
                <div v-if="item.kode_brng && !item.is_new_item" class="small text-muted">{{ item.kode_brng }}</div>
                <div v-else class="small mt-1 d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary py-0 px-2 flex-grow-1" style="font-size: 0.75rem;" @click="openMappingModal(index)">
                    <i class="fas fa-search me-1"></i> Pilih Manual
                  </button>
                  <button class="btn btn-sm btn-outline-success py-0 px-2 flex-grow-1" style="font-size: 0.75rem;" @click="openTambahMaster(index)">
                    <i class="fas fa-plus me-1"></i> Tambah Baru
                  </button>
                </div>
              </td>
              <td>
                <span class="badge bg-secondary">{{ item.nama_satuan || item.kode_sat }}</span>
              </td>
              <td>
                <input type="number" min="1" v-model.number="item.jumlah" @input="recalculate" class="form-control form-control-sm text-center">
              </td>
              <td>
                <input type="number" min="0" v-model.number="item.h_pesan" @input="recalculate" class="form-control form-control-sm text-end">
              </td>
              <td>
                <input type="number" min="0" max="100" v-model.number="item.dis" @input="recalculate" class="form-control form-control-sm text-center">
              </td>
              <td>
                <input type="text" v-model="item.no_batch" class="form-control form-control-sm" placeholder="Opsional">
              </td>
              <td>
                <input type="date" v-model="item.kadaluarsa" class="form-control form-control-sm text-muted">
              </td>
              <td class="text-end fw-bold text-dark">
                Rp {{ formatRupiah(item.total) }}
              </td>
              <td class="text-center">
                <button @click="removeItem(index)" class="btn btn-sm btn-link text-danger p-0" title="Hapus">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Summary Box -->
    <div class="row justify-content-end mb-5">
      <div class="col-md-5 col-lg-4">
        <div class="card shadow-sm border-0 border-end border-primary border-4 text-sm" style="font-size: 0.875rem;">
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Subtotal ({{ items.length }} Item)</span>
              <span class="fw-semibold">Rp {{ formatRupiah(form.total1) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 text-danger">
              <span>Total Potongan</span>
              <span class="fw-semibold">- Rp {{ formatRupiah(form.potongan) }}</span>
            </div>
            
            <div class="d-flex justify-content-between pt-3 border-top mb-2 fw-semibold">
              <span class="text-muted">Dasar Pengenaan Pajak (DPP)</span>
              <span>Rp {{ formatRupiah(form.total2) }}</span>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mb-2 text-muted">
              <div class="d-flex align-items-center">
                <span>PPN (%)</span>
                <input type="number" min="0" max="100" v-model.number="ppnPercent" @input="recalculate" class="form-control form-control-sm mx-2 text-center" style="width: 60px;">
              </div>
              <span class="fw-semibold">+ Rp {{ formatRupiah(form.ppn) }}</span>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mb-3 text-muted">
              <span>Biaya Meterai</span>
              <div class="d-flex align-items-center justify-content-end">
                 <span class="me-2">+ Rp</span>
                 <input type="number" min="0" v-model.number="form.meterai" @input="recalculate" class="form-control form-control-sm text-end" style="width: 90px;">
              </div>
            </div>
            
            <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-2" style="border-style: dashed !important; border-width: 2px !important; border-color: #dee2e6 !important;">
              <span class="fw-bold text-dark" style="font-size: 1rem;">TOTAL TAGIHAN</span>
              <span class="fw-bold text-primary" style="font-size: 1.25rem;">Rp {{ formatRupiah(form.tagihan) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Modal Smart Faktur -->
    <div v-if="showScanModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header bg-warning text-dark border-bottom-0 pb-1">
            <h5 class="modal-title fw-bold"><i class="fas fa-robot me-2"></i>AI Smart Faktur</h5>
            <button type="button" class="btn-close" @click="closeScanModal" :disabled="isScanning"></button>
          </div>
          <div class="modal-body pt-4 pb-4">
            <div class="text-center mb-3">
              <p class="text-muted small">Unggah foto faktur fisik Anda, AI akan otomatis membaca nama obat, jumlah, dan harga untuk memasukkannya ke transaksi.</p>
            </div>
            
            <div class="upload-container text-center p-4 border rounded" :class="{'border-primary bg-light': scanPreview, 'border-dashed border-secondary': !scanPreview}" style="border-width: 2px !important; position: relative;">
               <input type="file" ref="fakturFileInput" class="d-none" accept="image/*" @change="handleFakturFileSelect" :disabled="isScanning">
               
               <div v-if="!scanPreview" class="py-3 cursor-pointer" @click="triggerFileInput">
                  <i class="fas fa-camera fa-3x text-secondary mb-3"></i>
                  <h6 class="fw-semibold">Ambil Foto / Pilih File</h6>
                  <p class="small text-muted mb-0">Sistem mendukung JPG dan PNG.</p>
               </div>
               
               <div v-else>
                  <img :src="scanPreview" class="img-fluid rounded shadow-sm mb-3" style="max-height: 200px; object-fit: contain;">
                  <div>
                    <button class="btn btn-sm btn-outline-danger me-2" @click="removeScanFile" :disabled="isScanning">
                      <i class="fas fa-times me-1"></i> Ganti Foto
                    </button>
                  </div>
               </div>
            </div>
            
            <div v-if="isScanning" class="text-center mt-4">
               <div class="spinner-border text-warning mb-2" role="status"></div>
               <p class="fw-bold text-dark mb-0 animate-pulse">AI sedang menganalisa faktur...</p>
               <span class="small text-muted">Bisa memakan waktu memanggil Webhook n8n dan DeepSeek.</span>
            </div>
          </div>
          <div class="modal-footer bg-light border-top-0">
            <button type="button" class="btn btn-secondary" @click="closeScanModal" :disabled="isScanning">Batal</button>
            <button type="button" class="btn btn-warning fw-bold text-dark" @click="processScan" :disabled="!scanFile || isScanning">
              <i class="fas fa-magic me-1"></i> Proses AI Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5);" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cari Data Barang (Obat & Alkes)</h5>
            <button type="button" class="btn-close" @click="closeBarangModal"></button>
          </div>
          <div class="modal-body">
            <div class="input-group mb-3">
              <input type="text" class="form-control" placeholder="Ketik nama atau kode barang..." v-model="searchQuery" @keyup.enter="searchBarang">
              <button class="btn btn-primary" type="button" @click="searchBarang" :disabled="loadingSearch">
                <i class="fas fa-search me-1" v-if="!loadingSearch"></i>
                <span v-else class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Cari
              </button>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover table-sm border align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Kode</th>
                    <th>Nama Barang</th>
                    <th>Satuan</th>
                    <th>Kategori</th>
                    <th class="text-end">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingSearch">
                    <td colspan="5" class="text-center py-4">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="searchResults.length === 0">
                    <td colspan="5" class="text-center py-4 text-muted">
                      Tidak ada hasil pencarian.
                    </td>
                  </tr>
                  <tr v-for="brg in searchResults" :key="brg.kode_brng">
                    <td>{{ brg.kode_brng }}</td>
                    <td class="fw-medium">{{ brg.nama_brng }}</td>
                    <td>{{ brg.satuan?.satuan || brg.kode_sat }}</td>
                    <td><span class="badge bg-secondary">{{ brg.kategori?.nm_kategori || '-' }}</span></td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-success" @click="selectBarang(brg)">
                        <i class="fas fa-plus"></i> Pilih
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../../services/api'
import Swal from 'sweetalert2'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

const dateToISO = (dateStr) => {
  return new Date(dateStr).toISOString().split('T')[0]
}
const loading = ref(false)

// Master Data references
const suppliers = ref([])
const bangsal_pkp = ref([])

const ppnPercent = ref(11) // standard tax
const items = ref([])

const form = reactive({
  no_faktur: '',
  no_order: '',
  kode_suplier: '',
  nip: 'NIP_CURRENT', // We will replace in backend mostly, but need mock front
  kd_bangsal: '',
  tgl_pesan: dateToISO(new Date()),
  tgl_faktur: dateToISO(new Date()),
  tgl_tempo: dateToISO(new Date()),
  status: 'Belum Dibayar',
  
  // Kalkulasi
  total1: 0,
  potongan: 0,
  total2: 0,
  ppn: 0,
  meterai: 0,
  tagihan: 0
})

const fetchMasterData = async () => {
    try {
        const { data } = await api.get('/farmasi/penerimaan-obat/attributes')
        if (data.success) {
            suppliers.value = data.data.suplier
            bangsal_pkp.value = data.data.bangsal
        }
    } catch (err) {
        console.error("Gagal load master data", err)
    }
}

onMounted(() => {
    fetchMasterData()
})

const formatRupiah = (val) => {
    return Number(val || 0).toLocaleString('id-ID')
}

// Modal and Search State
const showModal = ref(false)
const mappingItemIndex = ref(null)

const searchQuery = ref('')
const searchResults = ref([])
const loadingSearch = ref(false)

const openBarangModal = () => {
  mappingItemIndex.value = null
  showModal.value = true
}

const openMappingModal = (index) => {
  mappingItemIndex.value = index
  const itemToMap = items.value[index]
  
  // Auto-fill pencarian dengan nama dari AI 
  searchQuery.value = itemToMap.nama_brng || ''
  showModal.value = true
  if (searchQuery.value) {
      searchBarang()
  }
}

const openTambahMaster = (index) => {
   // Placeholder sementara, bapak bisa hubungkan ini ke form data barang master bapak
   Swal.fire('Info', 'Fitur Form Tambah Baru belum dihubungkan. Saat ini Anda bisa meregistrasi Master Data secara terpisah atau fitur pop-up ini akan dibangun.', 'info')
}

const closeBarangModal = () => {
  showModal.value = false
  searchQuery.value = ''
  searchResults.value = []
  mappingItemIndex.value = null
}

// Smart Faktur State
const showScanModal = ref(false)
const scanFile = ref(null)
const scanPreview = ref(null)
const fakturFileInput = ref(null)
const isScanning = ref(false)

const openScanModal = () => {
  showScanModal.value = true
}
const closeScanModal = () => {
  if (isScanning.value) return
  showScanModal.value = false
  removeScanFile()
}
const triggerFileInput = () => {
  if (fakturFileInput.value) {
    fakturFileInput.value.click()
  }
}
const handleFakturFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    scanFile.value = file
    scanPreview.value = URL.createObjectURL(file)
  }
}
const removeScanFile = () => {
  scanFile.value = null
  if (scanPreview.value) {
    URL.revokeObjectURL(scanPreview.value)
    scanPreview.value = null
  }
  if (fakturFileInput.value) {
    fakturFileInput.value.value = ''
  }
}

const processScan = async () => {
  if (!scanFile.value) return;
  
  isScanning.value = true;
  
  const formData = new FormData();
  formData.append('image', scanFile.value);
  
  try {
    const { data } = await api.post('/farmasi/penerimaan-obat/scan-faktur', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
        
    // Asumsi balikan: data.data.items = array objek {kode_brng, nama_brng, jumlah, h_pesan}
    if (data.success) {
       if (!data.data || !data.data.items) {
           Swal.fire('Data Kosong', 'AI tidak berhasil mengekstrak data obat dari faktur.', 'warning');
           return;
       }
       
       let addedCount = 0;
       
       // Handle mapping data
       for (const scanItem of data.data.items) {
           // Fitur popup 'Tambah Obat Baru' sementara DIMATIKAN agar tidak nge-block
           // Biarkan semua item dari AI mengalir bebas masuk ke tabel walau kodenya kosong
       
           // Check existing in list (baikan jika sama-sama kosong biar gak dianggap duplikat)
           const exists = scanItem.kode_brng ? items.value.find(item => item.kode_brng === scanItem.kode_brng) : false;
           
           if (!exists) {
               items.value.push({
                  kode_brng: scanItem.kode_brng || '',
                  nama_brng: scanItem.nama_brng || 'Barang Tidak Dikenal',
                  kode_sat: scanItem.kode_sat || '-',
                  nama_satuan: scanItem.nama_satuan || '-',
                  jumlah: scanItem.jumlah || 1,
                  h_pesan: scanItem.h_pesan || 0,
                  dis: 0,
                  besardis: 0,
                  subtotal: 0,
                  total: 0,
                  no_batch: '',
                  kadaluarsa: dateToISO(new Date(new Date().setFullYear(new Date().getFullYear() + 2))),
                  is_new_item: scanItem.is_new_item
               });
               addedCount++;
           }
       }
       
       recalculate();
       
       Swal.fire({
         title: 'Scan Berhasil',
         text: `${addedCount} item obat telah ditambahkan ke tabel.`,
         icon: 'success'
       });
       
       // Auto fill supplier or note if detected
       if (data.data.supplier_name) {
          // You could optionally match the supplier_name with the suppliers dropdown list here
       }
       if (data.data.tanggal_faktur) {
          form.tgl_faktur = data.data.tanggal_faktur;
       }
       
       // Menutup Paksa Modal (Bypass limitasi isScanning di dalam closeScanModal)
       showScanModal.value = false;
       removeScanFile();
    } else {       Swal.fire('Info AI', data.message || 'Respons tidak valid', 'info');
    }
  } catch(err) {
     console.error("CATCH ERROR:", err);
     let msg = 'Gagal memproses gambar ke n8n/DeepSeek';
     if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message
     }
     Swal.fire('Error AI', typeof msg === 'string' ? msg : JSON.stringify(msg), 'error');
  } finally {
     isScanning.value = false;
  }
}

const searchBarang = async () => {
    if(!searchQuery.value) return
    
    loadingSearch.value = true
    try {
        const { data } = await api.get('/farmasi/databarang', {
            params: {
                q: searchQuery.value,
                per_page: 20
            }
        })
        searchResults.value = data.data.data // Pagination object structure
    } catch (err) {
        console.error("Gagal mencari barang", err)
        Swal.fire('Error', 'Gagal mencari data barang', 'error')
    } finally {
        loadingSearch.value = false
    }
}

const selectBarang = (brg) => {
  // Check if already in list
  const exists = items.value.find(item => item.kode_brng === brg.kode_brng)
  if (exists) {
      Swal.fire('Info', 'Barang ini sudah ada di dalam tabel.', 'info')
      return;
  }

  const newItem = {
      kode_brng: brg.kode_brng,
      nama_brng: brg.nama_brng,
      kode_sat: brg.kode_sat,
      nama_satuan: brg.satuan?.satuan || brg.kode_sat,
      jumlah: 1,
      h_pesan: brg.dasar || 0, // Using harga dasar as starting point for PO
      dis: 0,
      besardis: 0,
      subtotal: 0,
      total: 0,
      no_batch: '',
      kadaluarsa: dateToISO(new Date(new Date().setFullYear(new Date().getFullYear() + 2))),
      is_new_item: false
  }

  if (mappingItemIndex.value !== null) {
      // Kita sedang me-mapping item AI ke Master Data
      const aiItem = items.value[mappingItemIndex.value]
      // Pertahankan jumlah dan harga yang dibaca AI dari faktur kertas
      newItem.jumlah = aiItem.jumlah || 1
      newItem.h_pesan = aiItem.h_pesan || brg.dasar || 0
      
      // Gantikan item AI yang kosong dengan item resmi ini
      items.value.splice(mappingItemIndex.value, 1, newItem)
      
      Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          icon: 'success',
          title: `Berhasil dipetakan ke ${brg.nama_brng}`
      })
      closeBarangModal() // Langsung tutup kalau milih dari mapping modal
  } else {
      // Tambah barang biasa lewat tombol "Tambah Obat"
      items.value.push(newItem)
      
      Swal.fire({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          icon: 'success',
          title: `${brg.nama_brng} ditambahkan`
      })
  }
  
  recalculate()
}

const removeItem = (idx) => {
    items.value.splice(idx, 1)
    recalculate()
}

const recalculate = () => {
    let subtotalRaw = 0
    let discountSum = 0

    items.value.forEach(item => {
        // Clean up empty lines
        if(!item.jumlah) item.jumlah = 1;
        if(!item.h_pesan) item.h_pesan = 0;
        if(!item.dis) item.dis = 0;
        
        let itemSub = item.jumlah * item.h_pesan
        let itemDisk = itemSub * (item.dis / 100)
        
        item.subtotal = itemSub
        item.besardis = itemDisk
        item.total = itemSub - itemDisk

        subtotalRaw += itemSub
        discountSum += itemDisk
    })

    form.total1 = subtotalRaw
    form.potongan = discountSum
    form.total2 = subtotalRaw - discountSum
    
    // PPN applied on Total 2 (DPP)
    form.ppn = (ppnPercent.value / 100) * form.total2
    
    // Tagihan
    form.tagihan = form.total2 + form.ppn + (form.meterai || 0)
}

const simpanTransaksi = async () => {
    if(form.no_faktur === '' || form.kd_bangsal === '' || form.kode_suplier === '') {
        Swal.fire('Validasi Error', 'No Faktur, Supplier, dan Gudang Tujuan tidak boleh kosong!', 'warning')
        return
    }

    if(items.value.length === 0) {
        Swal.fire('Validasi Error', 'Silahkan tambahkan minimal 1 item obat.', 'warning')
        return
    }

    loading.value = true

    try {
        const payload = {
            ...form,
            details: items.value
        }
        
        // Use standard POST API
        const { data } = await api.post('/farmasi/penerimaan-obat', payload)
        
        Swal.fire('Berhasil Terkirim', data.message || 'Transaksi penerimaan obat (Faktur) berhasil disimpan dan stok gudang telah ter-update.', 'success')
        
        // Reset form
        items.value = []
        form.no_faktur = ''
        form.no_order = ''
        recalculate()
        
    } catch(err) {
        console.error(err)
        let msg = 'Gagal menyimpan faktur!'
        if (err.response && err.response.data && err.response.data.message) {
            msg = err.response.data.message
        }
        Swal.fire('Error', msg, 'error')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
:deep(.vs__dropdown-menu) {
  z-index: 9999 !important;
}

/* Match v-select height with Bootstrap form-control */
:deep(.vs__dropdown-toggle) {
  min-height: 38px !important;
  border-radius: 0.375rem;
  border-color: #dee2e6;
  padding-bottom: 2px;
}
:deep(.vs__selected-options) {
  padding-top: 2px;
}
:deep(.vs__search) {
  margin-top: 2px;
}
.cursor-pointer {
  cursor: pointer;
  transition: opacity 0.2s;
}
.cursor-pointer:hover {
  opacity: 0.8;
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
