<template>
  <div class="katalog-trustmark-wrapper">
    <!-- Header -->
    <div class="page-header mb-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 class="page-title d-flex align-items-center gap-2">
            <span>📚</span> Katalog Web Service BPJS Kesehatan (Trust Mark)
          </h1>
          <p class="page-subtitle mb-0">
            Eksplorasi interaktif seluruh spesifikasi web service resmi BPJS Kesehatan (VClaim, Antrean RS, Aplicares, Apotek, PCare, Antrean FKTP, & i-Care JKN)
          </p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button 
            type="button" 
            class="btn btn-outline-primary fw-bold shadow-sm d-flex align-items-center gap-2 px-3 py-2"
            @click="showBaseUrlModal = true"
          >
            <i class="fas fa-network-wired"></i>
            <span>Base URL & Panduan Header</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Overview Cards -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card stat-card glass-card border-0 shadow-sm p-3 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stat-label text-muted small text-uppercase fw-semibold">Total Endpoint</div>
              <div class="stat-value fw-bold text-primary fs-3">{{ totalEndpoints }}</div>
            </div>
            <div class="stat-icon bg-primary-subtle text-primary rounded-circle p-3">
              <i class="fas fa-layer-group fa-lg"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card stat-card glass-card border-0 shadow-sm p-3 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stat-label text-muted small text-uppercase fw-semibold">FKRTL (Rumah Sakit)</div>
              <div class="stat-value fw-bold text-success fs-3">{{ countByTarget('FKRTL (Rumah Sakit)') }}</div>
            </div>
            <div class="stat-icon bg-success-subtle text-success rounded-circle p-3">
              <i class="fas fa-hospital fa-lg"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card stat-card glass-card border-0 shadow-sm p-3 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stat-label text-muted small text-uppercase fw-semibold">FKTP (Puskesmas/Klinik)</div>
              <div class="stat-value fw-bold text-info fs-3">{{ countByTarget('FKTP (Puskesmas / Klinik)') }}</div>
            </div>
            <div class="stat-icon bg-info-subtle text-info rounded-circle p-3">
              <i class="fas fa-clinic-medical fa-lg"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card stat-card glass-card border-0 shadow-sm p-3 h-100">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stat-label text-muted small text-uppercase fw-semibold">Apotek & Lainnya</div>
              <div class="stat-value fw-bold text-warning-emphasis fs-3">
                {{ countByTarget('Apotek / Farmasi') + countByTarget('FKRTL & FKTP') + countByTarget('Umum / Semua Faskes') }}
              </div>
            </div>
            <div class="stat-icon bg-warning-subtle text-warning-emphasis rounded-circle p-3">
              <i class="fas fa-pills fa-lg"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Tabs Navigation -->
    <div class="card glass-card border-0 shadow-sm mb-4">
      <div class="card-body p-3">
        <div class="d-flex flex-wrap gap-2">
          <button 
            v-for="cat in categoryList" 
            :key="cat.id"
            type="button" 
            class="btn btn-sm rounded-pill fw-semibold transition-all px-3 py-2"
            :class="selectedCategory === cat.id ? 'btn-primary shadow' : 'btn-light text-muted'"
            @click="selectCategory(cat.id)"
          >
            <span class="me-1">{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
            <span class="badge ms-2 rounded-pill" :class="selectedCategory === cat.id ? 'bg-white text-primary' : 'bg-secondary text-white'">
              {{ cat.count }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filter & Search Controls -->
    <div class="card glass-card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="row g-3 align-items-center">
          <!-- Search Input -->
          <div class="col-lg-5 col-md-6">
            <label class="form-label small fw-bold text-muted mb-1">Cari Endpoint atau Layanan</label>
            <div class="input-group">
              <span class="input-group-text bg-white text-muted">
                <i class="fas fa-search"></i>
              </span>
              <input 
                v-model="searchQuery" 
                type="text" 
                class="form-control" 
                placeholder="Cari nama fitur, URL path, kata kunci..."
              >
              <button 
                v-if="searchQuery" 
                class="btn btn-outline-secondary" 
                type="button" 
                @click="searchQuery = ''"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Target Facility Filter -->
          <div class="col-lg-3 col-md-6">
            <label class="form-label small fw-bold text-muted mb-1">Target Fasilitas</label>
            <select v-model="selectedTarget" class="form-select">
              <option value="ALL">Semua Fasilitas</option>
              <option value="FKRTL (Rumah Sakit)">FKRTL (Rumah Sakit)</option>
              <option value="FKTP (Puskesmas / Klinik)">FKTP (Puskesmas / Klinik)</option>
              <option value="Apotek / Farmasi">Apotek / Farmasi</option>
              <option value="FKRTL & FKTP">FKRTL & FKTP</option>
              <option value="Umum / Semua Faskes">Umum / Semua Faskes</option>
            </select>
          </div>

          <!-- HTTP Method Filter -->
          <div class="col-lg-2 col-md-6">
            <label class="form-label small fw-bold text-muted mb-1">Method HTTP</label>
            <select v-model="selectedMethod" class="form-select">
              <option value="ALL">Semua Method</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <!-- View Mode Toggle -->
          <div class="col-lg-2 col-md-6 text-md-end mt-md-4">
            <div class="btn-group w-100" role="group">
              <button 
                type="button" 
                class="btn btn-sm" 
                :class="viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="viewMode = 'grid'"
                title="Tampilan Grid Card"
              >
                <i class="fas fa-th-large me-1"></i> Card
              </button>
              <button 
                type="button" 
                class="btn btn-sm" 
                :class="viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'"
                @click="viewMode = 'table'"
                title="Tampilan Tabel Compact"
              >
                <i class="fas fa-list me-1"></i> Tabel
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Sub-Category Pills (if available for selected main category) -->
        <div v-if="subCategoryList.length > 1" class="mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
          <span class="small fw-bold text-muted me-1">Sub-Modul:</span>
          <button 
            type="button" 
            class="btn btn-xs rounded-pill"
            :class="selectedSubCategory === 'ALL' ? 'btn-secondary text-white' : 'btn-outline-secondary'"
            @click="selectedSubCategory = 'ALL'"
          >
            Semua ({{ filteredByCategory.length }})
          </button>
          <button 
            v-for="sub in subCategoryList" 
            :key="sub.name"
            type="button" 
            class="btn btn-xs rounded-pill"
            :class="selectedSubCategory === sub.name ? 'btn-secondary text-white' : 'btn-outline-secondary'"
            @click="selectedSubCategory = sub.name"
          >
            {{ sub.name }} ({{ sub.count }})
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filter Summary -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="text-muted small">
        Menampilkan <strong>{{ filteredEndpoints.length }}</strong> dari <strong>{{ totalEndpoints }}</strong> endpoint
        <span v-if="searchQuery"> untuk pencarian "<em>{{ searchQuery }}</em>"</span>
      </div>
      <button 
        v-if="searchQuery || selectedCategory !== 'ALL' || selectedTarget !== 'ALL' || selectedMethod !== 'ALL' || selectedSubCategory !== 'ALL'"
        class="btn btn-link btn-sm text-decoration-none p-0 text-danger fw-semibold"
        @click="resetFilter"
      >
        <i class="fas fa-undo me-1"></i> Reset Filter
      </button>
    </div>

    <!-- 1. GRID CARD VIEW -->
    <div v-if="viewMode === 'grid' && filteredEndpoints.length > 0" class="row g-3">
      <div v-for="ep in filteredEndpoints" :key="ep.id" class="col-lg-6 col-xl-4">
        <div class="card endpoint-card glass-card border-0 shadow-sm h-100 d-flex flex-column">
          <!-- Card Header -->
          <div class="card-header bg-white border-bottom-0 pt-3 pb-0 px-3 d-flex justify-content-between align-items-start gap-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge method-badge fw-bold font-monospace" :class="getMethodBadgeClass(ep.method)">
                {{ ep.method }}
              </span>
              <span class="badge bg-light text-dark font-monospace border small">
                #{{ ep.id }}
              </span>
            </div>
            <span class="badge target-badge rounded-pill" :class="getTargetBadgeClass(ep.target)">
              {{ ep.target }}
            </span>
          </div>

          <!-- Card Body -->
          <div class="card-body p-3 flex-grow-1">
            <h6 class="fw-bold mb-2 text-dark title-clamp" :title="ep.title">
              {{ ep.title }}
            </h6>

            <!-- URL snippet with copy button -->
            <div class="url-box bg-light rounded p-2 mb-2 d-flex align-items-center justify-content-between gap-2 border font-monospace small">
              <span class="text-truncate text-secondary" :title="ep.url">{{ ep.url || '-' }}</span>
              <button 
                type="button" 
                class="btn btn-xs btn-link text-muted p-0" 
                @click="copyText(ep.url)"
                title="Salin Endpoint URL"
              >
                <i class="fas fa-copy"></i>
              </button>
            </div>

            <!-- Function / Description -->
            <p class="small text-muted mb-0 desc-clamp">
              {{ ep.function || ep.subCategory || 'Spesifikasi endpoint TrustMark BPJS Kesehatan' }}
            </p>
          </div>

          <!-- Card Footer -->
          <div class="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2 small text-muted">
              <span v-if="ep.parameters && ep.parameters.length > 0" class="badge bg-light text-muted border">
                <i class="fas fa-sliders-h me-1 text-primary"></i>{{ ep.parameters.length }} parameter URL
              </span>
              <span v-if="ep.request" class="badge bg-light text-muted border" title="Memiliki format Request Body">
                <i class="fas fa-arrow-up text-primary"></i> Body JSON
              </span>
            </div>
            <button 
              type="button" 
              class="btn btn-sm btn-primary fw-semibold px-3 py-1 shadow-sm d-flex align-items-center gap-1"
              @click="openDetail(ep)"
            >
              <span>Buka Detail</span>
              <i class="fas fa-arrow-right small"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. TABLE VIEW -->
    <div v-else-if="viewMode === 'table' && filteredEndpoints.length > 0" class="card glass-card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-muted small text-uppercase">
            <tr>
              <th style="width: 75px;" class="ps-3">ID</th>
              <th style="width: 90px;">Method</th>
              <th>Nama Fitur / Layanan</th>
              <th>Endpoint URL</th>
              <th>Kategori / Modul</th>
              <th>Target Fasilitas</th>
              <th class="text-center pe-3" style="width: 100px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ep in filteredEndpoints" :key="ep.id">
              <td class="ps-3 font-monospace small text-muted">#{{ ep.id }}</td>
              <td>
                <span class="badge method-badge fw-bold font-monospace" :class="getMethodBadgeClass(ep.method)">
                  {{ ep.method }}
                </span>
              </td>
              <td>
                <div class="fw-bold text-dark">{{ ep.title }}</div>
                <div class="small text-muted text-truncate" style="max-width: 280px;">{{ ep.function }}</div>
              </td>
              <td class="font-monospace small text-secondary">
                <div class="d-flex align-items-center gap-2">
                  <span class="text-truncate" style="max-width: 320px;" :title="ep.url">{{ ep.url || '-' }}</span>
                  <button 
                    v-if="ep.url" 
                    type="button" 
                    class="btn btn-xs btn-link text-muted p-0" 
                    @click="copyText(ep.url)"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </td>
              <td>
                <span class="badge bg-light text-dark border small">{{ ep.mainCategory }}</span>
                <div class="small text-muted">{{ ep.subCategory }}</div>
              </td>
              <td>
                <span class="badge target-badge rounded-pill" :class="getTargetBadgeClass(ep.target)">
                  {{ ep.target }}
                </span>
              </td>
              <td class="text-center pe-3">
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-primary fw-semibold px-2 py-1"
                  @click="openDetail(ep)"
                >
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card glass-card border-0 shadow-sm p-5 text-center">
      <div class="py-5">
        <i class="fas fa-search-minus fa-4x text-muted opacity-25 mb-3"></i>
        <h5 class="fw-bold text-muted">Tidak Ada Endpoint yang Cocok</h5>
        <p class="text-muted small mb-3">
          Coba ubah kata kunci pencarian atau sesuaikan filter kategori / method HTTP di atas.
        </p>
        <button class="btn btn-outline-primary btn-sm rounded-pill px-4" @click="resetFilter">
          Reset Filter Pencarian
        </button>
      </div>
    </div>

    <!-- MODAL DETAIL ENDPOINT (INTERAKTIF & JELAS) -->
    <div 
      v-if="selectedEndpoint" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(0, 0, 0, 0.55);"
      @click.self="selectedEndpoint = null"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <!-- Modal Header -->
          <div class="modal-header border-bottom py-3 px-4 bg-light">
            <div class="d-flex align-items-center gap-2">
              <span class="badge method-badge fw-bold font-monospace fs-6" :class="getMethodBadgeClass(selectedEndpoint.method)">
                {{ selectedEndpoint.method }}
              </span>
              <h5 class="modal-title fw-bold mb-0 text-dark">
                #{{ selectedEndpoint.id }} - {{ selectedEndpoint.title }}
              </h5>
            </div>
            <button type="button" class="btn-close" @click="selectedEndpoint = null"></button>
          </div>

          <!-- Modal Tabs Navigation -->
          <div class="bg-white border-bottom px-4 pt-2">
            <ul class="nav nav-tabs border-0" role="tablist">
              <li class="nav-item">
                <button 
                  class="nav-link py-2 px-3 fw-bold" 
                  :class="activeModalTab === 'params' ? 'active text-primary border-primary border-bottom border-2' : 'text-muted border-0'"
                  @click="activeModalTab = 'params'"
                >
                  <i class="fas fa-link me-1"></i> Cara Pakai & Parameter URL
                  <span v-if="selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0" class="badge bg-primary-subtle text-primary ms-1">
                    {{ selectedEndpoint.parameters.length }}
                  </span>
                </button>
              </li>
              <li v-if="selectedEndpoint.request" class="nav-item">
                <button 
                  class="nav-link py-2 px-3 fw-bold" 
                  :class="activeModalTab === 'request' ? 'active text-primary border-primary border-bottom border-2' : 'text-muted border-0'"
                  @click="activeModalTab = 'request'"
                >
                  <i class="fas fa-arrow-up me-1 text-primary"></i> Request Body (JSON)
                </button>
              </li>
              <li v-if="selectedEndpoint.response" class="nav-item">
                <button 
                  class="nav-link py-2 px-3 fw-bold" 
                  :class="activeModalTab === 'response' ? 'active text-primary border-primary border-bottom border-2' : 'text-muted border-0'"
                  @click="activeModalTab = 'response'"
                >
                  <i class="fas fa-arrow-down me-1 text-success"></i> Response Balasan (JSON)
                </button>
              </li>
              <li v-if="selectedEndpoint.notes" class="nav-item">
                <button 
                  class="nav-link py-2 px-3 fw-bold" 
                  :class="activeModalTab === 'notes' ? 'active text-primary border-primary border-bottom border-2' : 'text-muted border-0'"
                  @click="activeModalTab = 'notes'"
                >
                  <i class="fas fa-info-circle me-1 text-warning"></i> Catatan Aturan BPJS
                </button>
              </li>
            </ul>
          </div>

          <!-- Modal Body -->
          <div class="modal-body p-4">
            <!-- TAB 1: PARAMETER & URL BUILDER -->
            <div v-if="activeModalTab === 'params'">
              <!-- Info Box Deskripsi -->
              <div class="p-3 bg-light-subtle rounded-3 border mb-4">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="badge bg-light text-dark border">
                    <i class="fas fa-folder text-primary me-1"></i> {{ selectedEndpoint.mainCategory }}
                  </span>
                  <span class="badge bg-light text-dark border">
                    <i class="fas fa-tag text-info me-1"></i> {{ selectedEndpoint.subCategory }}
                  </span>
                  <span class="badge target-badge rounded-pill" :class="getTargetBadgeClass(selectedEndpoint.target)">
                    <i class="fas fa-hospital-alt me-1"></i> {{ selectedEndpoint.target }}
                  </span>
                </div>
                <div class="fw-semibold text-dark">
                  {{ selectedEndpoint.function || selectedEndpoint.title }}
                </div>
              </div>

              <!-- URL TEMPLATE VS REAL PREVIEW -->
              <div class="card border mb-4 shadow-sm">
                <div class="card-header bg-light py-2 px-3 d-flex justify-content-between align-items-center">
                  <span class="small fw-bold text-muted text-uppercase">
                    <i class="fas fa-code me-1 text-primary"></i> 1. Format URL Template (Spesifikasi BPJS)
                  </span>
                  <button class="btn btn-xs btn-outline-secondary" @click="copyText(selectedEndpoint.url)">
                    <i class="fas fa-copy me-1"></i> Salin Template
                  </button>
                </div>
                <div class="card-body p-3 bg-dark text-warning font-monospace small text-break">
                  {{ selectedEndpoint.url }}
                </div>
              </div>

              <!-- REAL SIMULATED URL -->
              <div class="card border mb-4 shadow-sm">
                <div class="card-header bg-success-subtle py-2 px-3 d-flex justify-content-between align-items-center">
                  <span class="small fw-bold text-success-emphasis text-uppercase">
                    <i class="fas fa-play-circle me-1 text-success"></i> 2. Contoh URL Nyata Saat Ditembak (Setelah Parameter Diisi)
                  </span>
                  <button class="btn btn-xs btn-success" @click="copyText(simulatedUrl)">
                    <i class="fas fa-copy me-1"></i> Salin URL Nyata
                  </button>
                </div>
                <div class="card-body p-3 bg-dark text-info font-monospace small text-break">
                  {{ simulatedUrl }}
                </div>
              </div>

              <!-- PARAMETERS TABLE -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="fw-bold mb-0 text-dark">
                    <i class="fas fa-sliders-h text-primary me-1"></i> Variabel Parameter Yang Harus Diisi di URL
                  </h6>
                  <span class="text-muted small">
                    Ubah nilai simulasi di bawah untuk melihat contoh URL berubah otomatis
                  </span>
                </div>

                <div v-if="selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0" class="table-responsive border rounded-3">
                  <table class="table table-hover align-middle mb-0 small">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 170px;">Placeholder di URL</th>
                        <th>Arti / Keterangan Data</th>
                        <th style="width: 130px;">Tipe & Posisi</th>
                        <th style="width: 220px;">Simulasi Nilai Riil</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, pIdx) in selectedEndpoint.parameters" :key="pIdx">
                        <td class="font-monospace text-warning-emphasis fw-bold bg-light">
                          <code>{{ p.placeholder || ('{' + p.name + '}') }}</code>
                        </td>
                        <td>
                          <div class="fw-bold text-dark">{{ p.description }}</div>
                          <div class="text-muted small">Wajib diganti dengan nilai nyata saat memanggil endpoint.</div>
                        </td>
                        <td>
                          <span class="badge bg-light text-dark border">
                            <i class="fas fa-link text-muted me-1"></i> {{ p.type || 'URL Path' }}
                          </span>
                        </td>
                        <td>
                          <input 
                            v-model="simulatedValues[p.placeholder || p.name]" 
                            type="text" 
                            class="form-control form-control-sm font-monospace"
                            :placeholder="p.example || 'Isi nilai...'"
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-else class="p-3 bg-light rounded-3 text-muted small text-center border">
                  <i class="fas fa-check-circle text-success me-1"></i> Endpoint ini tidak memerlukan parameter dinamis di dalam path URL.
                </div>
              </div>

              <!-- HTTP HEADERS -->
              <div class="card border">
                <div class="card-header bg-light py-2 px-3">
                  <span class="small fw-bold text-muted text-uppercase">
                    <i class="fas fa-key text-warning me-1"></i> HTTP Header Wajib
                  </span>
                </div>
                <div class="card-body p-3 small text-muted">
                  <div v-if="selectedEndpoint.header" class="font-monospace text-primary mb-2">
                    <code>{{ selectedEndpoint.header }}</code>
                  </div>
                  <div class="row g-2">
                    <div class="col-md-6">
                      <div class="p-2 border rounded bg-light">
                        <div class="fw-bold text-dark">X-cons-id & X-timestamp</div>
                        <div class="text-muted small">Consumer ID BPJS dan Unix Timestamp UTC dalam detik.</div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="p-2 border rounded bg-light">
                        <div class="fw-bold text-dark">X-signature & user_key</div>
                        <div class="text-muted small">HMAC-SHA256 signature dan User Key TrustMark BPJS.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: REQUEST BODY -->
            <div v-else-if="activeModalTab === 'request'">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold mb-0 text-dark">
                  <i class="fas fa-file-code text-primary me-1"></i> Format JSON Payload Request (Body)
                </h6>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-primary"
                  @click="copyText(selectedEndpoint.request)"
                >
                  <i class="fas fa-copy me-1"></i> Salin Format JSON
                </button>
              </div>
              <p class="text-muted small mb-3">
                Format data yang dikirimkan oleh sistem ke server BPJS Kesehatan (dikirim sebagai payload HTTP Method <strong>{{ selectedEndpoint.method }}</strong>):
              </p>
              <pre class="bg-dark text-success p-3 rounded-3 small font-monospace overflow-auto" style="max-height: 400px;"><code>{{ selectedEndpoint.request }}</code></pre>
            </div>

            <!-- TAB 3: RESPONSE BODY -->
            <div v-else-if="activeModalTab === 'response'">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fw-bold mb-0 text-dark">
                  <i class="fas fa-reply text-success me-1"></i> Contoh Format Response Balasan BPJS
                </h6>
                <button 
                  type="button" 
                  class="btn btn-sm btn-outline-success"
                  @click="copyText(selectedEndpoint.response)"
                >
                  <i class="fas fa-copy me-1"></i> Salin Response
                </button>
              </div>
              <p class="text-muted small mb-3">
                Contoh data JSON yang dikembalikan oleh BPJS setelah response didekripsi (metadata status 200 OK):
              </p>
              <pre class="bg-dark text-info p-3 rounded-3 small font-monospace overflow-auto" style="max-height: 450px;"><code>{{ selectedEndpoint.response }}</code></pre>
            </div>

            <!-- TAB 4: CATATAN & ATURAN -->
            <div v-else-if="activeModalTab === 'notes'">
              <h6 class="fw-bold mb-3 text-dark">
                <i class="fas fa-exclamation-triangle text-warning me-1"></i> Catatan & Aturan Bisnis BPJS
              </h6>
              <div class="p-3 bg-warning-subtle text-warning-emphasis rounded-3 border border-warning-subtle mb-3">
                <p class="mb-0" style="white-space: pre-line;">{{ selectedEndpoint.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer border-top py-2 px-4 bg-light">
            <button type="button" class="btn btn-secondary fw-semibold px-4" @click="selectedEndpoint = null">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL BASE URL & PANDUAN AUTHENTICATION -->
    <div 
      v-if="showBaseUrlModal" 
      class="modal fade show d-block" 
      tabindex="-1" 
      style="background-color: rgba(0, 0, 0, 0.55);"
      @click.self="showBaseUrlModal = false"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom py-3 px-4 bg-light">
            <h5 class="modal-title fw-bold mb-0">
              <i class="fas fa-network-wired text-primary me-2"></i> Base URL & Panduan Autentikasi Web Service BPJS
            </h5>
            <button type="button" class="btn-close" @click="showBaseUrlModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Table Base URLs -->
            <h6 class="fw-bold text-primary mb-3">
              <i class="fas fa-server me-1"></i> 1. Base URL Development (Trust Mark)
            </h6>
            <div class="table-responsive mb-4">
              <table class="table table-bordered table-sm align-middle small mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Layanan Web Service</th>
                    <th>Target Fasilitas</th>
                    <th>Base URL (Development)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in baseUrls" :key="b.layanan">
                    <td class="fw-bold">{{ b.layanan }}</td>
                    <td><span class="badge bg-light text-dark border">{{ b.target }}</span></td>
                    <td class="font-monospace text-primary">
                      {{ b.url }}
                      <button class="btn btn-xs btn-link p-0 ms-1 text-muted" @click="copyText(b.url)">
                        <i class="fas fa-copy"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Headers & Signature Guide -->
            <h6 class="fw-bold text-primary mb-3">
              <i class="fas fa-key me-1"></i> 2. Header Autentikasi Umum (HMAC-SHA256)
            </h6>
            <div class="p-3 bg-light rounded-3 border small mb-4">
              <p class="mb-2">Hampir seluruh pemanggilan API BPJS membutuhkan 4 header wajib:</p>
              <ul class="mb-2">
                <li><code>X-cons-id</code> : Consumer ID yang diberikan BPJS Kesehatan.</li>
                <li><code>X-timestamp</code> : Unix Timestamp UTC dalam detik (format numerik).</li>
                <li><code>X-signature</code> : Hash HMAC-SHA256 dari string <code>{cons_id}&{timestamp}</code> menggunakan key <code>{cons_secret}</code>, kemudian di-encode ke Base64.</li>
                <li><code>user_key</code> : User Key VClaim / Antrol / Apotek yang digenerate di portal TrustMark.</li>
              </ul>
              <div class="p-2 bg-dark text-success rounded font-monospace small">
                signature = Base64( HMAC_SHA256( consId + "&" + timestamp, secretKey ) )
              </div>
            </div>

            <!-- Decrypt Guide -->
            <h6 class="fw-bold text-primary mb-3">
              <i class="fas fa-unlock-alt me-1"></i> 3. Dekripsi Response (AES-256-CBC)
            </h6>
            <div class="p-3 bg-light rounded-3 border small">
              <p class="mb-2">Sebagian besar response dari VClaim, PCare, i-Care, dan Antrean dienkripsi:</p>
              <ul class="mb-0">
                <li><strong>Key Dekripsi:</strong> Gabungan string <code>consId + secretKey + timestamp</code> kemudian di-hash SHA-256 (32 bytes).</li>
                <li><strong>IV (Initialization Vector):</strong> 16 bytes pertama dari key dekripsi.</li>
                <li><strong>Algoritma:</strong> <code>AES-256-CBC</code>.</li>
                <li><strong>Dekompresi:</strong> Setelah didekripsi dengan AES, hasil string didekompresi menggunakan algoritma <code>LZ-String</code> untuk menghasilkan string JSON asli.</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer border-top py-2 px-4 bg-light">
            <button type="button" class="btn btn-secondary fw-semibold px-4" @click="showBaseUrlModal = false">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import rawCatalog from '../../data/bpjsTrustmarkCatalog.json'
import { showToast } from '../../utils/notification'

// Data
const allEndpoints = ref(rawCatalog.endpoints || [])
const totalEndpoints = computed(() => allEndpoints.value.length)

// State filter
const selectedCategory = ref('ALL')
const selectedSubCategory = ref('ALL')
const selectedTarget = ref('ALL')
const selectedMethod = ref('ALL')
const searchQuery = ref('')
const viewMode = ref('grid') // 'grid' | 'table'

// Modals & Tabs
const selectedEndpoint = ref(null)
const activeModalTab = ref('params')
const showBaseUrlModal = ref(false)

// Simulated parameters for active modal
const simulatedValues = reactive({})

// Watch selectedEndpoint to populate simulation defaults
watch(selectedEndpoint, (ep) => {
  if (ep) {
    activeModalTab.value = 'params'
    // Clear & populate defaults
    Object.keys(simulatedValues).forEach(k => delete simulatedValues[k])
    if (ep.parameters) {
      ep.parameters.forEach(p => {
        const key = p.placeholder || p.name
        simulatedValues[key] = p.example || '123'
      })
    }
  }
})

// Dynamic simulated URL based on user input
const simulatedUrl = computed(() => {
  if (!selectedEndpoint.value) return ''
  let url = selectedEndpoint.value.exampleUrl || selectedEndpoint.value.url

  // Replace each parameter if modified by user
  if (selectedEndpoint.value.parameters) {
    let rawUrl = selectedEndpoint.value.url
    const baseMap = {
      'VClaim': 'https://apijkn-dev.bpjs-kesehatan.go.id/vclaim-rest-dev',
      'Antrean RS': 'https://apijkn-dev.bpjs-kesehatan.go.id/antreanrs_dev',
      'Aplicares': 'https://apijkn-dev.bpjs-kesehatan.go.id/aplicaresws',
      'Apotek': 'https://apijkn-dev.bpjs-kesehatan.go.id/apotek-rest-dev',
      'PCare': 'https://apijkn-dev.bpjs-kesehatan.go.id/pcare-rest-dev',
      'Antrean FKTP': 'https://apijkn-dev.bpjs-kesehatan.go.id/antreanfktp_dev',
      'i-Care JKN': 'https://apijkn-dev.bpjs-kesehatan.go.id/ihs_dev'
    }
    const bUrl = baseMap[selectedEndpoint.value.mainCategory] || 'https://apijkn-dev.bpjs-kesehatan.go.id'
    rawUrl = rawUrl.replace(/{base url}/gi, bUrl).replace(/{service name}/gi, '')
    rawUrl = rawUrl.replace('//', '/').replace('https:/', 'https://').replace('http:/', 'http://')

    selectedEndpoint.value.parameters.forEach(p => {
      const key = p.placeholder || p.name
      const val = simulatedValues[key] || p.example || '123'
      const ph = p.placeholder || `{${p.name}}`
      rawUrl = rawUrl.replace(ph, val)
      rawUrl = rawUrl.replace(ph.toLowerCase(), val)
      rawUrl = rawUrl.replace(`{${p.name}}`, val)
    })
    url = rawUrl
  }

  return url
})

// Base URL reference
const baseUrls = [
  { layanan: "VClaim (FKRTL)", target: "FKRTL (Rumah Sakit)", url: "https://apijkn-dev.bpjs-kesehatan.go.id/vclaim-rest-dev" },
  { layanan: "Antrean RS", target: "FKRTL (Rumah Sakit)", url: "https://apijkn-dev.bpjs-kesehatan.go.id/antreanrs_dev" },
  { layanan: "Aplicares (Kamar)", target: "FKRTL (Rumah Sakit)", url: "https://apijkn-dev.bpjs-kesehatan.go.id/aplicaresws" },
  { layanan: "Apotek (Pelayanan Obat)", target: "Apotek / Farmasi", url: "https://apijkn-dev.bpjs-kesehatan.go.id/apotek-rest-dev" },
  { layanan: "PCare (FKTP)", target: "FKTP (Puskesmas/Klinik)", url: "https://apijkn-dev.bpjs-kesehatan.go.id/pcare-rest-dev" },
  { layanan: "Antrean FKTP", target: "FKTP (Puskesmas/Klinik)", url: "https://apijkn-dev.bpjs-kesehatan.go.id/antreanfktp_dev" },
  { layanan: "i-Care JKN (IHS)", target: "FKRTL & FKTP", url: "https://apijkn-dev.bpjs-kesehatan.go.id/ihs_dev" }
]

// Category Tabs Definition
const categoryList = computed(() => {
  return [
    { id: 'ALL', name: 'Semua', icon: '🌐', count: totalEndpoints.value },
    { id: 'VClaim', name: 'VClaim (FKRTL)', icon: '🏥', count: allEndpoints.value.filter(e => e.mainCategory === 'VClaim').length },
    { id: 'Antrean RS', name: 'Antrean RS', icon: '📱', count: allEndpoints.value.filter(e => e.mainCategory === 'Antrean RS').length },
    { id: 'Aplicares', name: 'Aplicares (Kamar)', icon: '🛏️', count: allEndpoints.value.filter(e => e.mainCategory === 'Aplicares').length },
    { id: 'Apotek', name: 'Apotek Farmasi', icon: '💊', count: allEndpoints.value.filter(e => e.mainCategory === 'Apotek').length },
    { id: 'PCare', name: 'PCare (FKTP)', icon: '🩺', count: allEndpoints.value.filter(e => e.mainCategory === 'PCare').length },
    { id: 'Antrean FKTP', name: 'Antrean FKTP', icon: '⏱️', count: allEndpoints.value.filter(e => e.mainCategory === 'Antrean FKTP').length },
    { id: 'i-Care JKN', name: 'i-Care JKN', icon: '📋', count: allEndpoints.value.filter(e => e.mainCategory === 'i-Care JKN').length },
  ]
})

// Subcategory list based on current main category
const filteredByCategory = computed(() => {
  if (selectedCategory.value === 'ALL') return allEndpoints.value
  return allEndpoints.value.filter(e => e.mainCategory === selectedCategory.value)
})

const subCategoryList = computed(() => {
  const list = filteredByCategory.value
  const map = {}
  list.forEach(e => {
    const sub = e.subCategory || 'Lainnya'
    map[sub] = (map[sub] || 0) + 1
  })

  return Object.keys(map).map(k => ({
    name: k,
    count: map[k]
  }))
})

// Count helper
const countByTarget = (targetName) => {
  return allEndpoints.value.filter(e => e.target === targetName).length
}

// Select main category tab
const selectCategory = (catId) => {
  selectedCategory.value = catId
  selectedSubCategory.value = 'ALL'
}

// Filtered endpoints
const filteredEndpoints = computed(() => {
  let list = [...allEndpoints.value]

  // Category
  if (selectedCategory.value !== 'ALL') {
    list = list.filter(e => e.mainCategory === selectedCategory.value)
  }

  // Sub Category
  if (selectedSubCategory.value !== 'ALL') {
    list = list.filter(e => e.subCategory === selectedSubCategory.value)
  }

  // Target Facility
  if (selectedTarget.value !== 'ALL') {
    list = list.filter(e => e.target === selectedTarget.value)
  }

  // Method
  if (selectedMethod.value !== 'ALL') {
    list = list.filter(e => e.method === selectedMethod.value)
  }

  // Search keyword
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(e => {
      const id = (e.id || '').toLowerCase()
      const title = (e.title || '').toLowerCase()
      const url = (e.url || '').toLowerCase()
      const func = (e.function || '').toLowerCase()
      const sub = (e.subCategory || '').toLowerCase()
      const cat = (e.category || '').toLowerCase()
      return id.includes(q) || title.includes(q) || url.includes(q) || func.includes(q) || sub.includes(q) || cat.includes(q)
    })
  }

  return list
})

// Reset Filter
const resetFilter = () => {
  selectedCategory.value = 'ALL'
  selectedSubCategory.value = 'ALL'
  selectedTarget.value = 'ALL'
  selectedMethod.value = 'ALL'
  searchQuery.value = ''
}

// Badge Helpers
const getMethodBadgeClass = (method) => {
  switch ((method || '').toUpperCase()) {
    case 'GET': return 'bg-primary-subtle text-primary border border-primary-subtle'
    case 'POST': return 'bg-success-subtle text-success border border-success-subtle'
    case 'PUT': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
    case 'DELETE': return 'bg-danger-subtle text-danger border border-danger-subtle'
    default: return 'bg-secondary text-white'
  }
}

const getTargetBadgeClass = (target) => {
  if (!target) return 'bg-light text-muted'
  if (target.includes('FKRTL')) return 'bg-success-subtle text-success border'
  if (target.includes('FKTP')) return 'bg-info-subtle text-info border'
  if (target.includes('Apotek')) return 'bg-warning-subtle text-warning-emphasis border'
  return 'bg-light text-muted border'
}

// Actions
const openDetail = (endpoint) => {
  selectedEndpoint.value = endpoint
}

const copyText = (txt) => {
  if (!txt) return
  navigator.clipboard.writeText(txt)
    .then(() => showToast('Teks berhasil disalin ke clipboard', 'success'))
    .catch(() => showToast('Gagal menyalin teks', 'error'))
}
</script>

<style scoped>
.katalog-trustmark-wrapper {
  padding: 1.5rem 0;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.92rem;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06) !important;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.endpoint-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.endpoint-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
}

.method-badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.55rem;
}

.target-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.35rem 0.6rem;
}

.title-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8rem;
}

.desc-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.5rem;
}

.btn-xs {
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
}

.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>
