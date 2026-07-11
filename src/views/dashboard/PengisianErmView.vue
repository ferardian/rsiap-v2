<template>
  <div class="kepatuhan-erm-page">
    <div class="main-wrapper">
      
      <!-- Header Section -->
      <div class="page-header shadow-sm">
        <div class="header-overlay"></div>
        <div class="header-glow-1"></div>
        <div class="header-glow-2"></div>
        <div class="header-content">
          <div class="header-brand">
            <div class="brand-icon-wrapper">
              <i class="fas fa-clipboard-check icon-brand"></i>
            </div>
            <div class="brand-info">
              <div class="status-indicator">
                <span class="pulse-dot"></span>
                <span class="system-label">MUTU REKAM MEDIS ELEKTRONIK</span>
              </div>
              <h1 class="page-title">Kepatuhan Pengisian E-RM</h1>
              <p class="page-subtitle">Pelacakan kepatuhan kelengkapan pengisian E-RM pasien IGD & Rawat Inap</p>
            </div>
          </div>
          <div class="completion-card">
            <div class="completion-card-bg"></div>
            <div class="completion-info">
              <div class="completion-title-row">
                <span class="label">KEPATUHAN GLOBAL</span>
                <span class="percentage">{{ stats.kepatuhan_global || 0 }}%</span>
              </div>
              <div class="completion-track">
                <div class="completion-fill" :style="{ width: `${stats.kepatuhan_global || 0}%` }"></div>
              </div>
              <div class="completion-meta">
                <span>{{ stats.patuh_count || 0 }} dari {{ stats.total_pasien || 0 }} pasien patuh terisi lengkap</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-container">
        
        <!-- Stats Summary Cards -->
        <div class="stats-grid">
          <div v-for="stat in statCards" :key="stat.label" class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }">
            <div class="stat-icon" :style="{ color: `${stat.color}15` }">{{ stat.icon }}</div>
            <div class="stat-info">
              <span class="stat-label">{{ stat.label }}</span>
              <span class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</span>
            </div>
          </div>
        </div>

        <!-- Component Progress Row -->
        <div class="charts-row">
          <!-- Rawat Jalan & UGD -->
          <div class="chart-container">
            <h3 class="chart-title">▸ Persentase Kelengkapan Indikator Rawat Jalan & UGD</h3>
            <div class="indicators-grid">
              <div v-for="key in ralanKeys" :key="key" v-show="stats.komponen[key] !== undefined" class="indicator-progress-item" @click="openDetailModal(key)">
                <span class="info-hint" v-if="indicatorDefinitions[key]" @click.stop>
                  <i class="fas fa-question-circle hint-icon"></i>
                  <span class="hint-popover">
                    <span class="hint-header">Definisi Operasional</span>
                    <span class="hint-body">{{ indicatorDefinitions[key].do }}</span>
                    <span class="hint-subheader">Rumus Perhitungan</span>
                    <span class="hint-formula">{{ indicatorDefinitions[key].rumus }}</span>
                  </span>
                </span>
                <div class="indicator-meta">
                  <span class="indicator-name">{{ formatComponentLabel(key) }}</span>
                  <span class="indicator-percent" :style="{ color: getPercentColor(stats.komponen[key]) }">{{ stats.komponen[key] }}%</span>
                </div>
                <div class="indicator-bar-track">
                  <div class="indicator-bar-fill" :style="{ width: `${stats.komponen[key]}%`, backgroundColor: getPercentColor(stats.komponen[key]) }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rawat Inap -->
          <div class="chart-container">
            <h3 class="chart-title">▸ Persentase Kelengkapan Indikator Rawat Inap (Ranap)</h3>
            <div class="indicators-grid">
              <div v-for="key in ranapKeys" :key="key" v-show="stats.komponen[key] !== undefined" class="indicator-progress-item" @click="openDetailModal(key)">
                <span class="info-hint" v-if="indicatorDefinitions[key]" @click.stop>
                  <i class="fas fa-question-circle hint-icon"></i>
                  <span class="hint-popover">
                    <span class="hint-header">Definisi Operasional</span>
                    <span class="hint-body">{{ indicatorDefinitions[key].do }}</span>
                    <span class="hint-subheader">Rumus Perhitungan</span>
                    <span class="hint-formula">{{ indicatorDefinitions[key].rumus }}</span>
                  </span>
                </span>
                <div class="indicator-meta">
                  <span class="indicator-name">{{ formatComponentLabel(key) }}</span>
                  <span class="indicator-percent" :style="{ color: getPercentColor(stats.komponen[key]) }">{{ stats.komponen[key] }}%</span>
                </div>
                <div class="indicator-bar-track">
                  <div class="indicator-bar-fill" :style="{ width: `${stats.komponen[key]}%`, backgroundColor: getPercentColor(stats.komponen[key]) }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="filter-bar card shadow-sm">
          <div class="search-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="filters.keyword" 
              type="text" 
              placeholder="Cari No. Rawat, No. RM, atau Nama Pasien..." 
              class="search-input"
              @keyup.enter="handleSearch"
            >
          </div>
          <div class="filter-controls">
            <div class="date-range-inputs" :class="{ 'disabled-field': filters.status_ranap === 'dirawat' }">
              <input 
                type="date" 
                v-model="filters.tgl_awal" 
                class="date-input" 
                :disabled="filters.status_ranap === 'dirawat'"
                @change="handleSearch"
              >
              <span class="date-sep">s/d</span>
              <input 
                type="date" 
                v-model="filters.tgl_akhir" 
                class="date-input" 
                :disabled="filters.status_ranap === 'dirawat'"
                @change="handleSearch"
              >
            </div>
            
            <select v-model="filters.layanan" class="select-input" @change="handleLayananChange">
              <option value="">Semua Layanan</option>
              <option value="IGD">IGD (UGD)</option>
              <option value="Ranap">Rawat Inap (Ranap)</option>
            </select>

            <!-- Tgl Jenis Filter -->
            <select 
              v-model="filters.tgl_jenis" 
              class="select-input" 
              :disabled="filters.layanan === 'IGD' || filters.status_ranap === 'dirawat'"
              @change="handleSearch"
            >
              <option value="masuk">Filter: Tgl Masuk</option>
              <option value="pulang">Filter: Tgl Pulang</option>
            </select>

            <!-- Status Ranap Filter -->
            <select 
              v-model="filters.status_ranap" 
              class="select-input" 
              :disabled="filters.layanan !== 'Ranap'"
              @change="handleSearch"
            >
              <option value="semua">Semua Status Ranap</option>
              <option value="dirawat">Ranap: Masih Dirawat</option>
              <option value="pulang">Ranap: Sudah Pulang</option>
            </select>

            <select v-model="filters.status_pengisian" class="select-input" @change="handleSearch">
              <option value="Semua">Semua Status</option>
              <option value="Patuh">Patuh (Lengkap)</option>
              <option value="Tidak Patuh">Tidak Patuh (Belum Lengkap)</option>
            </select>

            <select v-model="filters.kd_dokter" class="select-input" @change="handleSearch">
              <option value="">Semua Dokter</option>
              <option v-for="d in dokterList" :key="d.kd_dokter" :value="d.kd_dokter">{{ d.nm_dokter }}</option>
            </select>

            <button @click="handleSearch" class="btn-refresh">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i> Terapkan
            </button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tabs-navigation">
          <button 
            @click="activeTab = 'pasien'" 
            :class="['tab-nav-btn', { active: activeTab === 'pasien' }]"
          >
            <i class="fas fa-users"></i> Audit Daftar Pasien
          </button>
          <button 
            @click="activeTab = 'dokter'" 
            :class="['tab-nav-btn', { active: activeTab === 'dokter' }]"
          >
            <i class="fas fa-user-md"></i> Performa Dokter (Medis)
          </button>
        </div>

        <!-- View 1: Pasien Audit Table -->
        <div v-show="activeTab === 'pasien'" class="table-card shadow-sm">
          <div class="table-container" :class="{ 'is-loading': loading }">
            <div v-if="loading" class="loading-overlay">
              <div class="spinner"></div>
              <span>Memuat data audit...</span>
            </div>
            <table class="monitoring-table">
              <thead>
                <tr>
                  <th>Pasien</th>
                  <th>Tgl Reg</th>
                  <th>Layanan</th>
                  <th>Unit / Kamar</th>
                  <th>Dokter DPJP</th>
                  <th class="text-center">Triase</th>
                  <th class="text-center">Medis</th>
                  <th class="text-center">Keperawatan / Jatuh</th>
                  <th class="text-center">Keperawatan Ranap</th>
                  <th class="text-center">Asesmen Nyeri</th>
                  <th class="text-center">Plan of Care</th>
                  <th class="text-center">Transfer Pasien</th>
                  <th class="text-center">Grafik Harian</th>
                  <th class="text-center">Keseimbangan Cairan</th>
                  <th class="text-center">Konsul SBAR</th>
                  <th class="text-center">Edukasi Obat Pulang</th>
                  <th class="text-center">Discharge Planning</th>
                  <th class="text-center">Catatan Edukasi</th>
                  <th class="text-center">Asuhan Gizi</th>
                  <th class="text-center">Catatan ADIME Gizi</th>
                  <th class="text-center">Kepatuhan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableData" :key="row.no_rawat">
                  <td class="cell-pasien">
                    <div class="pasien-info">
                      <span class="pasien-name">{{ row.nm_pasien }}</span>
                      <span class="pasien-no-rawat font-mono">{{ row.no_rawat }}</span>
                      <span class="pasien-sub font-mono">{{ row.no_rkm_medis }} • {{ row.jk }} • {{ row.umurdaftar }} {{ row.sttsumur }}</span>
                    </div>
                  </td>
                  <td class="cell-tgl text-xs">{{ formatDate(row.tgl_registrasi) }} <br><span class="text-muted text-xs" style="font-size: 0.65rem;">{{ row.jam_reg }}</span></td>
                  <td>
                    <span :class="['badge-layanan', row.status_lanjut === 'Ranap' ? 'ranap' : 'igd']">
                      {{ row.status_lanjut === 'Ranap' ? 'Ranap' : 'IGD' }}
                    </span>
                  </td>
                  <td class="cell-unit">
                    <span class="text-xs">{{ row.status_lanjut === 'Ranap' ? (row.nm_bangsal || 'Ranap') : (row.nm_poli || 'IGD') }}</span>
                  </td>
                  <td class="cell-dokter text-xs">{{ row.nm_dokter }}</td>
                  
                  <!-- Triase (Only UGD) -->
                  <td class="text-center">
                    <span v-if="row.compliance.kategori !== 'IGD'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.triase.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.triase.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.triase.date">Diisi: {{ formatDateDetailed(row.compliance.details.triase.date) }}</span>
                    </span>
                  </td>

                  <!-- Medis (Both) -->
                  <td class="text-center">
                    <span :class="['badge-check', row.compliance.details.medis.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.medis.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.medis.date">
                        <strong>{{ row.compliance.details.medis.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.medis.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Keperawatan / Jatuh -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" :class="['badge-check', row.compliance.details.perawat.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.perawat.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.perawat.date">Diisi: {{ formatDateDetailed(row.compliance.details.perawat.date) }}</span>
                    </span>
                    <span v-else :class="['badge-check', row.compliance.details.jatuh.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.jatuh.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.jatuh.date">
                        <strong>{{ row.compliance.details.jatuh.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.jatuh.date) }}
                      </span>
                    </span>
                  </td>
 
                  <!-- Keperawatan Ranap (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.perawat_ranap.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.perawat_ranap.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.perawat_ranap.date">
                        <strong>{{ row.compliance.details.perawat_ranap.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.perawat_ranap.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Asesmen Nyeri (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.nyeri.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.nyeri.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.nyeri.date">
                        <strong>{{ row.compliance.details.nyeri.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.nyeri.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Plan of Care (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.poc.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.poc.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.poc.date">
                        <strong>{{ row.compliance.details.poc.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.poc.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Transfer Pasien (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.transfer.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.transfer.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.transfer.date">
                        <strong>{{ row.compliance.details.transfer.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.transfer.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Grafik Harian (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.grafik.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.grafik.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.grafik.date">
                        <strong>{{ row.compliance.details.grafik.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.grafik.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Keseimbangan Cairan (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.cairan.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.cairan.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.cairan.date">
                        <strong>{{ row.compliance.details.cairan.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.cairan.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Konsul SBAR (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.sbar.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.sbar.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.sbar.date">
                        <strong>{{ row.compliance.details.sbar.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.sbar.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Edukasi Obat Pulang (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.obat_pulang.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.obat_pulang.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.obat_pulang.date">
                        <strong>{{ row.compliance.details.obat_pulang.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.obat_pulang.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Discharge Planning (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.discharge.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.discharge.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.discharge.date">
                        <strong>{{ row.compliance.details.discharge.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.discharge.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Catatan Pelaksanaan Edukasi Pasien (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.edukasi_pasien.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.edukasi_pasien.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.edukasi_pasien.date">
                        <strong>{{ row.compliance.details.edukasi_pasien.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.edukasi_pasien.date) }}
                      </span>
                    </span>
                  </td>

                  <!-- Asuhan Gizi (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.gizi.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.gizi.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.gizi.date">
                        <strong>{{ row.compliance.details.gizi.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.gizi.date) }}
                      </span>
                    </span>
                  </td>
 
                  <!-- Catatan ADIME Gizi (Ranap Only) -->
                  <td class="text-center">
                    <span v-if="row.status_lanjut === 'Ralan'" class="badge-na">N/A</span>
                    <span v-else :class="['badge-check', row.compliance.details.adime_gizi.status === 'Terisi' ? 'success' : 'danger']">
                      <i :class="row.compliance.details.adime_gizi.status === 'Terisi' ? 'fas fa-check' : 'fas fa-times'"></i>
                      <span class="date-tooltip" v-if="row.compliance.details.adime_gizi.date">
                        <strong>{{ row.compliance.details.adime_gizi.label }}</strong><br>
                        Diisi: {{ formatDateDetailed(row.compliance.details.adime_gizi.date) }}
                      </span>
                    </span>
                  </td>
 
                  <!-- Kepatuhan Final -->
                  <td class="text-center">
                    <span :class="['badge-compliance-final', row.compliance.is_patuh ? 'patuh' : 'tidak']">
                      <i :class="row.compliance.is_patuh ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
                      {{ row.compliance.is_patuh ? 'Lengkap' : 'Belum Lengkap' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="tableData.length === 0 && !loading">
                  <td colspan="21" class="empty-state">
                    <div class="empty-content">
                      <i class="fas fa-folder-open mb-2"></i>
                      <p>Tidak ada data audit yang sesuai filter</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div class="pagination-bar" v-if="pagination.last_page > 1">
            <span class="pagination-info">Menampilkan Halaman {{ pagination.current_page }} dari {{ pagination.last_page }} ({{ pagination.total }} Pasien)</span>
            <div class="pagination-buttons">
              <button 
                @click="changePage(pagination.current_page - 1)" 
                :disabled="pagination.current_page === 1"
                class="btn-page"
              >
                Sebelumnya
              </button>
              <button 
                v-for="p in pageRange" 
                :key="p" 
                @click="changePage(p)"
                :class="['btn-page-number', { active: pagination.current_page === p }]"
              >
                {{ p }}
              </button>
              <button 
                @click="changePage(pagination.current_page + 1)" 
                :disabled="pagination.current_page === pagination.last_page"
                class="btn-page"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

        <!-- View 2: Dokter Audit Table -->
        <div v-show="activeTab === 'dokter'" class="table-card shadow-sm">
          <div class="table-container" :class="{ 'is-loading': loadingDokter }">
            <div v-if="loadingDokter" class="loading-overlay">
              <div class="spinner"></div>
              <span>Memuat performa dokter...</span>
            </div>
            <table class="monitoring-table">
              <thead>
                <tr>
                  <th>Nama Dokter</th>
                  <th class="text-center">Total Pasien</th>
                  <th class="text-center">Expected (Medis)</th>
                  <th class="text-center">Terisi (Medis)</th>
                  <th>Persentase Kepatuhan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in dokterStats" :key="d.kd_dokter">
                  <td class="cell-dokter font-semibold"><i class="fas fa-user-md mr-2 text-primary"></i>{{ d.nm_dokter }}</td>
                  <td class="text-center">{{ d.total_pasien }}</td>
                  <td class="text-center">{{ d.medis_expected }}</td>
                  <td class="text-center font-bold text-success">{{ d.medis_filled }}</td>
                  <td class="cell-progress">
                    <div class="progress-wrapper">
                      <div class="progress-bar-container">
                        <div class="progress-bar-fill" :style="{ width: `${d.kepatuhan_persen}%`, backgroundColor: getPercentColor(d.kepatuhan_persen) }"></div>
                      </div>
                      <span class="progress-text-val" :style="{ color: getPercentColor(d.kepatuhan_persen) }">{{ d.kepatuhan_persen }}%</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="dokterStats.length === 0 && !loadingDokter">
                  <td colspan="5" class="empty-state">
                    <div class="empty-content">
                      <i class="fas fa-user-md mb-2"></i>
                      <p>Tidak ada data dokter ditemukan</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detail Modal per Indikator -->
        <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetailModal">
          <div class="modal-card">
            <div class="modal-header">
              <div class="modal-header-content">
                <div class="modal-header-title">
                  <i class="fas fa-clipboard-list mr-2"></i>
                  Detail Pasien: {{ selectedIndicatorLabel }}
                </div>
                <div class="modal-header-subtitle">
                  <span v-if="filters.status_ranap === 'dirawat'">
                    <i class="fas fa-hospital-user"></i> Status: Masih Dirawat (Abaikan Tanggal)
                  </span>
                  <span v-else>
                    <i class="fas fa-calendar-alt"></i> Periode: {{ formatDate(filters.tgl_awal) }} s/d {{ formatDate(filters.tgl_akhir) }} 
                  </span>
                  <span class="modal-subtitle-sep">•</span> 
                  <i class="fas fa-database"></i> Total: {{ modalPatientsList.length }} Pasien
                </div>
              </div>
              <button class="modal-close-btn" @click="closeDetailModal">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <div class="modal-filter-bar">
              <div class="modal-search-wrapper">
                <i class="fas fa-search modal-search-icon"></i>
                <input 
                  v-model="modalSearchQuery" 
                  type="text" 
                  placeholder="Cari nama pasien, no rawat, no rm..." 
                  class="modal-search-input"
                >
              </div>
              <select v-model="modalFilterStatus" class="modal-select-input">
                <option value="Semua">Semua Status ({{ allPatientsCount }})</option>
                <option value="Terisi">Terisi ({{ terisiPatientsCount }})</option>
                <option value="Belum">Belum Terisi ({{ belumPatientsCount }})</option>
              </select>
            </div>
            
            <div class="modal-body">
              <div v-if="modalLoading" class="modal-loading-wrapper">
                <div class="spinner"></div>
                <span>Memuat data audit pasien...</span>
              </div>
              <div v-else-if="modalPatientsList.length === 0" class="modal-empty-state">
                <i class="fas fa-folder-open mb-2 text-muted text-xl"></i>
                <p>Tidak ada data pasien yang sesuai filter</p>
              </div>
              <div v-else class="modal-table-container">
                <table class="modal-table">
                  <thead>
                    <tr>
                      <th>Pasien</th>
                      <th>Dokter DPJP</th>
                      <th>Ruang / Poli</th>
                      <th class="text-center">Status</th>
                      <th>Waktu Pengisian</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in modalPatientsList" :key="p.no_rawat">
                      <td>
                        <div class="pasien-info">
                          <span class="pasien-name">{{ p.nm_pasien }}</span>
                          <span class="pasien-no-rawat font-mono">{{ p.no_rawat }}</span>
                          <span class="pasien-sub font-mono">{{ p.no_rkm_medis }}</span>
                        </div>
                      </td>
                      <td>{{ p.nm_dokter }}</td>
                      <td>{{ p.status_lanjut === 'Ranap' ? p.nm_bangsal : p.nm_poli }}</td>
                      <td class="text-center">
                        <span :class="['badge-status', p.status === 'Terisi' ? 'success' : 'danger']">
                          <i :class="p.status === 'Terisi' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                          {{ p.status }}
                        </span>
                      </td>
                      <td>
                        <span v-if="p.date" class="text-xs font-mono text-muted">{{ formatDateDetailed(p.date) }}</span>
                        <span v-else class="text-muted">—</span>
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
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { kepatuhanErmService } from '../../services/kepatuhanErmService'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

// Indikator Keys
const ralanKeys = ['triase', 'medis_igd', 'perawat_igd']
const ranapKeys = [
  'medis_ranap',
  'resiko_jatuh',
  'nyeri',
  'poc',
  'transfer',
  'perawat_ranap',
  'perawat_ranap_kebidanan',
  'perawat_ranap_anak',
  'perawat_ranap_neonatus',
  'grafik',
  'cairan',
  'sbar',
  'obat_pulang',
  'discharge',
  'edukasi_pasien',
  'gizi_dewasa',
  'gizi_anak',
  'adime_gizi'
]

// Definisi Operasional & Rumus Indikator
const indicatorDefinitions = {
  triase: {
    do: 'Kelengkapan pengisian lembar Triase IGD oleh perawat.',
    rumus: '(Pasien IGD dengan Triase Terisi / Total Pasien IGD Diaudit) × 100%'
  },
  medis_igd: {
    do: 'Kelengkapan asesmen medis awal oleh dokter di IGD.',
    rumus: '(Pasien IGD dengan Asesmen Medis Terisi / Total Pasien IGD Diaudit) × 100%'
  },
  perawat_igd: {
    do: 'Kelengkapan asesmen awal keperawatan oleh perawat di IGD.',
    rumus: '(Pasien IGD dengan Asesmen Keperawatan Terisi / Total Pasien IGD Diaudit) × 100%'
  },
  medis_ranap: {
    do: 'Kelengkapan asesmen medis awal rawat inap oleh dokter DPJP. Pasien kandungan diperiksa pada asesmen medis kandungan, sedangkan pasien lain pada asesmen medis umum.',
    rumus: '(Pasien Ranap dengan Asesmen Medis Terisi / Total Pasien Ranap Diaudit) × 100%'
  },
  resiko_jatuh: {
    do: 'Kelengkapan asesmen lanjutan risiko jatuh oleh perawat. Kategori anak menggunakan skala risiko jatuh anak, kategori dewasa menggunakan skala risiko jatuh dewasa.',
    rumus: '(Pasien Ranap dengan Asesmen Risiko Jatuh Terisi / Total Pasien Ranap Diaudit) × 100%'
  },
  nyeri: {
    do: 'Kelengkapan asesmen nyeri lanjutan oleh perawat menggunakan salah satu dari 5 skala nyeri (neonatal, anak 1bl-3th, anak 3th-7th, anak >7th, atau dewasa) yang sesuai.',
    rumus: '(Pasien Ranap dengan Asesmen Nyeri Terisi / Total Pasien Ranap Diaudit) × 100%'
  },
  poc: {
    do: 'Kelengkapan pengisian Plan of Care (POC) oleh petugas kesehatan.',
    rumus: '(Pasien Ranap dengan POC Terisi / Total Pasien Ranap Diaudit) × 100%'
  },
  transfer: {
    do: 'Kelengkapan dokumen serah terima/transfer pasien antar ruang rawat.',
    rumus: '(Pasien Ranap dengan Dokumen Transfer Terisi / Total Pasien Ranap Diaudit) × 100%'
  },
  perawat_ranap: {
    do: 'Kelengkapan asesmen keperawatan awal rawat inap untuk kategori pasien dewasa umum.',
    rumus: '(Pasien Ranap Dewasa dengan Asesmen Keperawatan Terisi / Total Pasien Ranap Dewasa) × 100%'
  },
  perawat_ranap_kebidanan: {
    do: 'Kelengkapan asesmen keperawatan kebidanan/maternal awal rawat inap untuk pasien kandungan.',
    rumus: '(Pasien Ranap Kebidanan dengan Asesmen Terisi / Total Pasien Ranap Kebidanan) × 100%'
  },
  perawat_ranap_anak: {
    do: 'Kelengkapan asesmen keperawatan awal rawat inap untuk kategori pasien anak.',
    rumus: '(Pasien Ranap Anak dengan Asesmen Terisi / Total Pasien Ranap Anak) × 100%'
  },
  perawat_ranap_neonatus: {
    do: 'Kelengkapan asesmen keperawatan awal rawat inap untuk kategori pasien bayi baru lahir / neonatus.',
    rumus: '(Pasien Ranap Neonatus dengan Asesmen Terisi / Total Pasien Ranap Neonatus) × 100%'
  },
  grafik: {
    do: 'Kelengkapan pengisian Grafik Harian (tanda-tanda vital/TTV) oleh perawat.',
    rumus: '(Pasien Ranap dengan Grafik Harian Terisi [sumber = "-"] / Total Pasien Ranap Diaudit) × 100%'
  },
  cairan: {
    do: 'Kelengkapan pemantauan keseimbangan cairan penderita (input & output cairan) oleh perawat.',
    rumus: '(Pasien Ranap dengan Catatan Keseimbangan Cairan / Total Pasien Ranap Diaudit) × 100%'
  },
  sbar: {
    do: 'Kelengkapan dokumentasi komunikasi konsul instruksi dokter menggunakan metode SBAR.',
    rumus: '(Pasien Ranap dengan Catatan Konsul SBAR / Total Pasien Ranap Diaudit) × 100%'
  },
  obat_pulang: {
    do: 'Kelengkapan pengisian formulir edukasi dan penyerahan obat pulang pasien oleh petugas farmasi.',
    rumus: '(Pasien Ranap dengan Edukasi Obat Pulang Terisi / Total Pasien Ranap Diaudit) × 100%'
  },
  discharge: {
    do: 'Kelengkapan pengisian dokumen Discharge Planning (rencana pemulangan pasien) saat rawat inap.',
    rumus: '(Pasien Ranap dengan Discharge Planning Terisi / Total Pasien Ranap Diaudit) × 100%'
  },
  edukasi_pasien: {
    do: 'Kelengkapan pengisian lembar catatan pelaksanaan edukasi pasien & keluarga.',
    rumus: '(Pasien Ranap dengan Catatan Edukasi Terisi / Total Pasien Ranap Diaudit) × 100%'
  },
  gizi_dewasa: {
    do: 'Kelengkapan asuhan gizi awal oleh dietisien untuk kategori pasien dewasa & maternal.',
    rumus: '(Pasien Ranap Dewasa & Maternal dengan Asuhan Gizi Terisi / Total Pasien Ranap Dewasa & Maternal) × 100%'
  },
  gizi_anak: {
    do: 'Kelengkapan asuhan gizi awal oleh dietisien untuk kategori pasien anak & neonatus.',
    rumus: '(Pasien Ranap Anak & Neonatus dengan Asuhan Gizi Terisi / Total Pasien Ranap Anak & Neonatus) × 100%'
  },
  adime_gizi: {
    do: 'Kelengkapan dokumentasi asuhan gizi dengan format ADIME (Asesmen, Diagnosis, Intervensi, Monitoring, Evaluasi) oleh dietisien.',
    rumus: '(Pasien Ranap dengan Catatan ADIME Gizi Terisi / Total Pasien Ranap Diaudit) × 100%'
  }
}

// State
const loading = ref(false)
const loadingDokter = ref(false)
const activeTab = ref('pasien')
const tableData = ref([])
const dokterStats = ref([])
const dokterList = ref([])

const stats = ref({
  total_pasien: 0,
  patuh_count: 0,
  kepatuhan_global: 0,
  igd_total: 0,
  igd_patuh: 0,
  kepatuhan_igd: 0,
  ranap_total: 0,
  ranap_patuh: 0,
  kepatuhan_ranap: 0,
  komponen: {
    triase: 0,
    medis_igd: 0,
    perawat_igd: 0,
    medis_ranap: 0,
    resiko_jatuh: 0,
    nyeri: 0,
    poc: 0,
    transfer: 0,
    perawat_ranap: 0,
    perawat_ranap_kebidanan: 0,
    perawat_ranap_anak: 0,
    perawat_ranap_neonatus: 0,
    grafik: 0,
    cairan: 0,
    sbar: 0,
    obat_pulang: 0,
    discharge: 0,
    edukasi_pasien: 0,
    gizi_dewasa: 0,
    gizi_anak: 0,
    adime_gizi: 0
  }
})

const filters = reactive({
  tgl_awal: dayjs().format('YYYY-MM-DD'),
  tgl_akhir: dayjs().format('YYYY-MM-DD'),
  layanan: '',
  status_pengisian: 'Semua',
  kd_dokter: '',
  keyword: '',
  page: 1,
  per_page: 25,
  tgl_jenis: 'masuk',
  status_ranap: 'semua'
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 25
})

// Modal State
const showDetailModal = ref(false)
const selectedIndicatorKey = ref('')
const selectedIndicatorLabel = ref('')
const modalSearchQuery = ref('')
const modalFilterStatus = ref('Semua')
const modalLoading = ref(false)
const modalAllPatientsData = ref([])

// Helper function to map indicator key to row compliance details
const getPatientIndicatorStatus = (row, key) => {
  const isIgd = row.status_lanjut === 'Ralan'
  const details = row.compliance?.details
  if (!details) return null

  // Helpers for category detection
  const isFemale = (row.jk === 'P')
  const isObgyn = isFemale && (
    ['P001', 'P007', 'P009'].includes(row.kd_poli) || 
    (row.nm_poli && (row.nm_poli.toLowerCase().includes('kandungan') || row.nm_poli.toLowerCase().includes('kebidanan'))) || 
    (row.nm_bangsal && (
      row.nm_bangsal.toLowerCase().includes('vk') || 
      row.nm_bangsal.toLowerCase().includes('kandungan') || 
      row.nm_bangsal.toLowerCase().includes('kebidanan') || 
      row.nm_bangsal.toLowerCase().includes('nifas')
    )) || 
    (row.medis_ranap_kand_filled == 1)
  )

  const isNeonatus = (row.sttsumur === 'Hr') || (row.sttsumur === 'Bl' && parseInt(row.umurdaftar) === 0) || (row.kd_poli === 'BBL') || (row.nm_bangsal && row.nm_bangsal.toLowerCase().includes('bayi'))
  const ageInYears = row.sttsumur === 'Th' ? parseInt(row.umurdaftar) : 0
  const isChild = !isNeonatus && ((row.sttsumur === 'Th' && ageInYears < 18) || (row.sttsumur !== 'Th'))

  if (isIgd) {
    if (key === 'triase') return details.triase
    if (key === 'medis_igd') return details.medis
    if (key === 'perawat_igd') return details.perawat
    return null
  } else {
    if (key === 'medis_ranap') return details.medis
    if (key === 'resiko_jatuh') return details.jatuh
    if (key === 'nyeri') return details.nyeri
    if (key === 'poc') return details.poc
    if (key === 'transfer') return details.transfer
    
    if (key === 'perawat_ranap') {
      return (!isObgyn && !isNeonatus && !isChild) ? details.perawat_ranap : null
    }
    if (key === 'perawat_ranap_kebidanan') {
      return isObgyn ? details.perawat_ranap : null
    }
    if (key === 'perawat_ranap_anak') {
      return isChild ? details.perawat_ranap : null
    }
    if (key === 'perawat_ranap_neonatus') {
      return isNeonatus ? details.perawat_ranap : null
    }

    if (key === 'grafik') return details.grafik
    if (key === 'cairan') return details.cairan
    if (key === 'sbar') return details.sbar
    if (key === 'obat_pulang') return details.obat_pulang
    if (key === 'discharge') return details.discharge
    if (key === 'edukasi_pasien') return details.edukasi_pasien
    
    if (key === 'gizi_dewasa') {
      return (!isChild && !isNeonatus) ? details.gizi : null
    }
    if (key === 'gizi_anak') {
      return (isChild || isNeonatus) ? details.gizi : null
    }
    
    if (key === 'adime_gizi') return details.adime_gizi
    return null
  }
}

// Computed modal values
const modalAllPatientsListRaw = computed(() => {
  if (!selectedIndicatorKey.value) return []
  return modalAllPatientsData.value
    .map(row => {
      const statusObj = getPatientIndicatorStatus(row, selectedIndicatorKey.value)
      if (!statusObj) return null
      return {
        no_rawat: row.no_rawat,
        no_rkm_medis: row.no_rkm_medis,
        nm_pasien: row.nm_pasien,
        nm_dokter: row.nm_dokter,
        nm_poli: row.nm_poli,
        nm_bangsal: row.nm_bangsal,
        status_lanjut: row.status_lanjut,
        status: statusObj.status,
        date: statusObj.date,
        label: statusObj.label
      }
    })
    .filter(item => item !== null)
})

const allPatientsCount = computed(() => modalAllPatientsListRaw.value.length)
const terisiPatientsCount = computed(() => modalAllPatientsListRaw.value.filter(p => p.status === 'Terisi').length)
const belumPatientsCount = computed(() => modalAllPatientsListRaw.value.filter(p => p.status === 'Belum').length)

const modalPatientsList = computed(() => {
  return modalAllPatientsListRaw.value
    .filter(item => {
      if (modalSearchQuery.value) {
        const query = modalSearchQuery.value.toLowerCase()
        return (
          item.nm_pasien.toLowerCase().includes(query) ||
          item.no_rawat.toLowerCase().includes(query) ||
          item.no_rkm_medis.toLowerCase().includes(query)
        )
      }
      return true
    })
    .filter(item => {
      if (modalFilterStatus.value === 'Terisi') return item.status === 'Terisi'
      if (modalFilterStatus.value === 'Belum') return item.status === 'Belum'
      return true
    })
})

const openDetailModal = async (key) => {
  selectedIndicatorKey.value = key
  selectedIndicatorLabel.value = formatComponentLabel(key)
  modalSearchQuery.value = ''
  modalFilterStatus.value = 'Semua'
  showDetailModal.value = true
  modalLoading.value = true
  modalAllPatientsData.value = []

  try {
    const res = await kepatuhanErmService.getData({
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir,
      layanan: filters.layanan,
      kd_dokter: filters.kd_dokter,
      tgl_jenis: filters.tgl_jenis,
      status_ranap: filters.status_ranap,
      keyword: filters.keyword,
      per_page: 'all' // Fetch all records for full detail view
    })
    if (res.data.success) {
      modalAllPatientsData.value = res.data.data.data || []
    }
  } catch (err) {
    console.error('Failed to load modal details:', err)
  } finally {
    modalLoading.value = false
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedIndicatorKey.value = ''
  selectedIndicatorLabel.value = ''
  modalAllPatientsData.value = []
}

// Computed Cards
const statCards = computed(() => [
  { label: 'Total Pasien Diaudit', value: stats.value.total_pasien, color: '#3b82f6', icon: '▣' },
  { label: 'Kepatuhan IGD', value: `${stats.value.kepatuhan_igd}% (${stats.value.igd_patuh}/${stats.value.igd_total})`, color: '#f59e0b', icon: '⚡' },
  { label: 'Kepatuhan Rawat Inap', value: `${stats.value.kepatuhan_ranap}% (${stats.value.ranap_patuh}/${stats.value.ranap_total})`, color: '#10b981', icon: '🏥' },
])

const pageRange = computed(() => {
  const range = []
  const start = Math.max(1, pagination.value.current_page - 2)
  const end = Math.min(pagination.value.last_page, pagination.value.current_page + 2)
  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
})

// Methods
const formatDate = (date) => date ? dayjs(date).format('DD MMM YYYY') : '—'
const formatDateDetailed = (date) => date ? dayjs(date).format('DD MMM YYYY HH:mm') : '—'

const formatComponentLabel = (key) => {
  const labels = {
    triase: 'Triase UGD (Nurse)',
    medis_igd: 'Asesmen Medis UGD (Doctor)',
    perawat_igd: 'Asesmen Keperawatan UGD (Nurse)',
    medis_ranap: 'Asesmen Medis Awal Ranap (Doctor)',
    resiko_jatuh: 'Lanjutan Resiko Jatuh Ranap (Nurse)',
    nyeri: 'Asesmen Nyeri Ranap (Nurse)',
    poc: 'Plan of Care (Petugas)',
    transfer: 'Transfer Pasien Antar Ruang (Nurse)',
    perawat_ranap: 'Asesmen Keperawatan Ranap (Nurse)',
    perawat_ranap_kebidanan: 'Asesmen Keperawatan Kebidanan/Maternal (Nurse)',
    perawat_ranap_anak: 'Asesmen Keperawatan Ranap Anak (Nurse)',
    perawat_ranap_neonatus: 'Asesmen Keperawatan Ranap Neonatus (Nurse)',
    grafik: 'Grafik Harian (Nurse)',
    cairan: 'Keseimbangan Cairan (Nurse)',
    sbar: 'Konsul SBAR (Nurse)',
    obat_pulang: 'Edukasi Obat Pulang (Petugas)',
    discharge: 'Discharge Planning (Petugas)',
    edukasi_pasien: 'Catatan Edukasi Pasien (Petugas)',
    gizi_dewasa: 'Asuhan Gizi Dewasa (Petugas)',
    gizi_anak: 'Asuhan Gizi Anak (Petugas)',
    adime_gizi: 'Catatan ADIME Gizi (Petugas)'
  }
  return labels[key] || key
}

const getPercentColor = (pct) => {
  if (pct >= 85) return '#10b981' // Green
  if (pct >= 60) return '#f59e0b' // Orange
  return '#ef4444' // Red
}

const fetchStats = async () => {
  try {
    const res = await kepatuhanErmService.getStats({
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir,
      layanan: filters.layanan,
      kd_dokter: filters.kd_dokter,
      keyword: filters.keyword,
      tgl_jenis: filters.tgl_jenis,
      status_ranap: filters.status_ranap
    })
    if (res.data.success) {
      stats.value = res.data.data
    }
  } catch (err) {
    console.error('Failed stats:', err)
  }
}

const fetchDokter = async () => {
  try {
    const res = await kepatuhanErmService.getDokter()
    if (res.data.success) {
      dokterList.value = res.data.data
    }
  } catch (err) {
    console.error('Failed doctors fetch:', err)
  }
}

const fetchDokterStats = async () => {
  loadingDokter.value = true
  try {
    const res = await kepatuhanErmService.getDokterStats({
      tgl_awal: filters.tgl_awal,
      tgl_akhir: filters.tgl_akhir,
      layanan: filters.layanan,
      kd_dokter: filters.kd_dokter,
      keyword: filters.keyword,
      tgl_jenis: filters.tgl_jenis,
      status_ranap: filters.status_ranap
    })
    if (res.data.success) {
      dokterStats.value = res.data.data
    }
  } catch (err) {
    console.error('Failed doctor stats:', err)
  } finally {
    loadingDokter.value = false
  }
}

const fetchAuditData = async () => {
  loading.value = true
  try {
    const res = await kepatuhanErmService.getData(filters)
    if (res.data.success) {
      tableData.value = res.data.data.data
      pagination.value = {
        current_page: res.data.data.current_page,
        last_page: res.data.data.last_page,
        total: res.data.data.total,
        per_page: res.data.data.per_page
      }
    }
  } catch (err) {
    console.error('Failed audit data:', err)
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Gagal mengambil data audit kepatuhan!'
    })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  filters.page = 1
  fetchAuditData()
  fetchStats()
  fetchDokterStats()
}

const handleLayananChange = () => {
  if (filters.layanan === 'IGD') {
    filters.tgl_jenis = 'masuk'
    filters.status_ranap = 'semua'
  }
  handleSearch()
}

const changePage = (page) => {
  filters.page = page
  fetchAuditData()
}

onMounted(() => {
  fetchDokter()
  handleSearch()
})
</script>

<style scoped>
.kepatuhan-erm-page {
  font-family: 'Inter', system-ui, sans-serif;
  color: #0f172a;
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 1.5rem;
  overflow-x: hidden;
}

.main-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-col: column;
  gap: 1.5rem;
  flex-direction: column;
}

/* Header styling cohesive with monitoring-rm.vue */
.page-header {
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 1.25rem;
  padding: 2.25rem 2.5rem;
  color: #ffffff;
  overflow: hidden;
  display: flex;
}

.header-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%);
  z-index: 1;
}

.header-glow-1 {
  position: absolute;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
  top: -150px; left: -100px;
  z-index: 1;
}

.header-glow-2 {
  position: absolute;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%);
  bottom: -100px; right: 100px;
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  gap: 2rem;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.brand-icon-wrapper {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.4) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  width: 4.5rem; height: 4.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-brand {
  font-size: 2.25rem;
  color: #3b82f6;
  text-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pulse-dot {
  width: 8px; height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 12px #10b981; }
  100% { transform: scale(0.9); opacity: 0.8; }
}

.system-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: #94a3b8;
}

.completion-card {
  position: relative;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  min-width: 320px;
  overflow: hidden;
}

.completion-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.completion-title-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.completion-title-row .label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.completion-title-row .percentage {
  font-size: 1.75rem;
  font-weight: 800;
  color: #10b981;
}

.completion-track {
  height: 6px;
  background-color: rgba(255,255,255,0.08);
  border-radius: 9999px;
  overflow: hidden;
}

.completion-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 9999px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.completion-meta {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Stats Cards Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  position: relative;
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.stat-icon {
  font-size: 2rem;
  width: 3.5rem; height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

/* Charts / Indicator breakdown */
.charts-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.chart-container {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.25rem;
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.indicator-progress-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.indicator-progress-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  background-color: #f1f5f9;
}

.indicator-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-right: 1.25rem;
}

.indicator-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
}

.indicator-percent {
  font-size: 1rem;
  font-weight: 700;
}

.indicator-bar-track {
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.indicator-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.6s ease;
}

/* Filter Bar */
.filter-bar {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border-radius: 0.75rem;
  border: 1px solid #cbd5e1;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3b82f6;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-input {
  padding: 0.6rem 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid #cbd5e1;
  font-size: 0.8125rem;
  outline: none;
}

.date-input:disabled,
.select-input:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.75;
  border-color: #e2e8f0;
}

.disabled-field {
  pointer-events: none;
}

.date-sep {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.select-input {
  padding: 0.6rem 2rem 0.6rem 0.75rem;
  border-radius: 0.6rem;
  border: 1px solid #cbd5e1;
  font-size: 0.8125rem;
  background-color: #ffffff;
  outline: none;
}

.btn-refresh {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 0.6rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
}

.btn-refresh:hover {
  opacity: 0.9;
}

/* Tabs Navigation */
.tabs-navigation {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 2px;
}

.tab-nav-btn {
  padding: 0.875rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.tab-nav-btn:hover {
  color: #0f172a;
}

.tab-nav-btn.active {
  color: #3b82f6;
}

.tab-nav-btn.active::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0; right: 0;
  height: 3px;
  background-color: #3b82f6;
  border-radius: 9999px;
}

/* Tables styling */
.table-card {
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-width: 100%;
}

.table-container {
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 550px;
  min-height: 200px;
  width: 100%;
  max-width: 100%;
}

.monitoring-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.monitoring-table th {
  background-color: #f8fafc;
  color: #475569;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 0.6rem;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: inset 0 -1px 0 #e2e8f0;
}

.monitoring-table td {
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.monitoring-table tbody tr:hover {
  background-color: #f8fafc;
}

/* Badges */
.badge-layanan {
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-layanan.igd {
  background-color: #fef3c7;
  color: #d97706;
}

.badge-layanan.ranap {
  background-color: #dcfce7;
  color: #15803d;
}

.badge-na {
  background-color: #e2e8f0;
  color: #64748b;
  padding: 0.15rem 0.45rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.badge-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.35rem; height: 1.35rem;
  border-radius: 50%;
  font-size: 0.75rem;
  cursor: help;
  position: relative;
}

.badge-check.success {
  background-color: #dcfce7;
  color: #16a34a;
}

.badge-check.danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.date-tooltip {
  display: none;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1e293b;
  color: #ffffff;
  font-size: 0.6875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.4rem;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 100;
}

.badge-check:hover .date-tooltip {
  display: block;
}

.badge-compliance-final {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge-compliance-final.patuh {
  background-color: #dcfce7;
  color: #16a34a;
}

.badge-compliance-final.tidak {
  background-color: #fee2e2;
  color: #dc2626;
}

/* Patient Cell info */
.pasien-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.pasien-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.75rem;
}

.pasien-sub {
  font-size: 0.65rem;
  color: #64748b;
}

.pasien-no-rawat {
  font-size: 0.68rem;
  color: #475569;
  font-weight: 600;
}

.cell-rawat {
  font-size: 0.72rem !important;
  font-weight: 500;
  white-space: nowrap;
}

.cell-unit, .cell-unit span {
  font-size: 0.72rem !important;
  line-height: 1.3;
}

.cell-tgl {
  font-size: 0.72rem !important;
  line-height: 1.3;
}

.cell-dokter {
  font-size: 0.72rem !important;
  line-height: 1.3;
}

/* Progress bar for Dokter view */
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 250px;
}

.progress-bar-container {
  flex-grow: 1;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.progress-text-val {
  font-size: 0.8125rem;
  font-weight: 700;
  width: 3rem;
  text-align: right;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(255, 255, 255, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 50;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 600;
}

.spinner {
  width: 2rem; height: 2rem;
  border: 3px solid #cbd5e1;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty states */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
}

.empty-content i {
  font-size: 2.5rem;
}

.empty-content p {
  font-size: 0.875rem;
  font-weight: 600;
}

/* Pagination */
.pagination-bar {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.pagination-buttons {
  display: flex;
  gap: 0.25rem;
}

.btn-page {
  padding: 0.4rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.4rem;
  background-color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-page-number {
  min-width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 0.4rem;
  background-color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.btn-page-number.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem;
  }
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .completion-card {
    width: 100%;
    min-width: 0;
  }
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  .date-range-inputs {
    justify-content: space-between;
  }
  .date-input, .select-input {
    width: 100%;
  }
  .pagination-bar {
    flex-direction: column;
    align-items: center;
  }
}

/* Hint & Tooltip Popover */
.info-hint {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  cursor: help;
  z-index: 10;
}

.hint-icon {
  color: #94a3b8;
  font-size: 0.8125rem;
  transition: color 0.2s;
}

.info-hint:hover .hint-icon {
  color: #3b82f6;
}

.hint-popover {
  display: none;
  position: absolute;
  bottom: 125%;
  right: 0;
  left: auto;
  transform: none;
  width: 280px;
  background-color: #0f172a;
  color: #f8fafc;
  padding: 0.875rem 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
  z-index: 999;
  font-family: inherit;
  white-space: normal;
  text-align: left;
}

.hint-popover::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 4px;
  left: auto;
  transform: none;
  border-width: 6px;
  border-style: solid;
  border-color: #0f172a transparent transparent transparent;
}

.info-hint:hover .hint-popover {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.hint-header {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #3b82f6;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #334155;
  padding-bottom: 0.25rem;
}

.hint-body {
  font-size: 0.75rem;
  color: #cbd5e1;
  line-height: 1.4;
}

.hint-subheader {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #10b981;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

.hint-formula {
  font-size: 0.7rem;
  font-family: monospace;
  background-color: #1e293b;
  padding: 0.35rem 0.5rem;
  border-radius: 0.35rem;
  color: #34d399;
  word-break: break-word;
  line-height: 1.3;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-card {
  background-color: #ffffff;
  border-radius: 1.25rem;
  width: 90%;
  max-width: 850px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modal-enter 0.3s ease-out;
}

@keyframes modal-enter {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #cbd5e1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #ffffff;
}

.modal-header-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-header-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.modal-subtitle-sep {
  color: #475569;
}

.modal-header-title {
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #ffffff;
}

.modal-filter-bar {
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.modal-search-wrapper {
  position: relative;
  flex-grow: 1;
}

.modal-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.modal-search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  outline: none;
}

.modal-search-input:focus {
  border-color: #3b82f6;
}

.modal-select-input {
  padding: 0.5rem 1.5rem 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  background-color: #ffffff;
  outline: none;
  min-width: 180px;
}

.modal-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  position: relative;
  min-height: 200px;
}

.modal-loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: #475569;
  font-weight: 600;
  font-size: 0.875rem;
}

.modal-empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.875rem;
}

.modal-table-container {
  overflow-x: auto;
}

.modal-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.modal-table th {
  background-color: #f8fafc;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.modal-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.8125rem;
}

.modal-table tbody tr:hover {
  background-color: #f8fafc;
}

.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge-status.success {
  background-color: #dcfce7;
  color: #16a34a;
}

.badge-status.danger {
  background-color: #fee2e2;
  color: #dc2626;
}
</style>
