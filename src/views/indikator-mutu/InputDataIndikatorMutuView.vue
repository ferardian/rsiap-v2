<template>
  <div class="container-fluid p-3 p-md-4">

    <!-- Premium Page Header -->
    <div class="page-header mb-4" style="overflow: visible !important;">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center">
          <div class="header-icon-bg me-3">
            <i class="fas fa-edit"></i>
          </div>
          <div>
            <h3 class="page-title mb-0">Input Data Indikator Mutu</h3>
            <p class="page-subtitle mb-0 small">Input data realisasi indikator mutu harian</p>
          </div>
        </div>
        <!-- Context Toggle (Komite member only) -->
        <div v-if="isCommitteeMember" class="context-toggle-wrap">
          <div class="header-tabs-premium">
            <button
              class="tab-btn"
              :class="{ active: inputMode === 'unit' }"
              @click="inputMode = 'unit'; handleModeChange()"
            >
              <i class="fas fa-hospital"></i> Unit
            </button>
            <button
              class="tab-btn"
              :class="{ active: inputMode === 'komite' }"
              @click="inputMode = 'komite'; handleModeChange()"
            >
              <i class="fas fa-users-cog"></i> Komite
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode Navigation Tabs -->
    <nav class="tabs-nav mb-3">
      <div class="header-tabs-premium">
        <button class="tab-btn" :class="{ active: viewMode === 'daily' }" @click="viewMode = 'daily'">
          <i class="fas fa-list"></i> Harian
        </button>
        <button class="tab-btn" :class="{ active: viewMode === 'monthly' }" @click="viewMode = 'monthly'">
          <i class="fas fa-calendar-alt"></i> Bulanan
        </button>
        <button class="tab-btn" :class="{ active: viewMode === 'validasi' }" @click="viewMode = 'validasi'">
          <i class="fas fa-check-circle"></i> Validasi Data
        </button>
        <button class="tab-btn" :class="{ active: viewMode === 'analisa' }" @click="viewMode = 'analisa'">
          <i class="fas fa-chart-line"></i> Analisa
        </button>

        <button class="tab-btn" :class="{ active: viewMode === 'pdsa' }" @click="viewMode = 'pdsa'">
          <i class="fas fa-project-diagram"></i> PDSA
        </button>
      </div>
    </nav>

    <!-- Filter Bar -->
    <div class="filter-bar mb-3">
      <!-- DAILY MODE FILTERS -->
      <template v-if="viewMode === 'daily'">
        <div class="filter-bar-item">
          <label class="filter-bar-label">Tanggal Transaksi</label>
          <input type="date" class="filter-date-input" v-model="filters.tgl_transaksi" @change="fetchIndicators">
        </div>
        <div class="filter-bar-item unit-select-container">
          <label class="filter-bar-label">Unit / Ruangan</label>
          <v-select append-to-body
            :options="units"
            label="nama_ruang"
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit"
            class="filter-vselect unit-select"
            :disabled="inputMode === 'komite' || (inputMode === 'unit' && isUnitLocked)"
            @update:modelValue="fetchIndicators"
          />
        </div>
      </template>

      <!-- MONTHLY MODE FILTERS -->
      <template v-else-if="viewMode === 'monthly'">
        <div class="filter-bar-item">
          <label class="filter-bar-label">Bulan &amp; Tahun</label>
          <input type="month" class="filter-date-input" v-model="monthlyFilterDate" @change="handleMonthlyDateChange">
        </div>
        <div class="filter-bar-item unit-select-container">
          <label class="filter-bar-label">Unit / Ruangan</label>
          <v-select append-to-body
            :options="units"
            label="nama_ruang"
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit"
            class="filter-vselect unit-select"
            :disabled="inputMode === 'komite' || (inputMode === 'unit' && isUnitLocked)"
            @update:modelValue="fetchMonthlyData"
          />
        </div>
        <div class="filter-bar-item" style="flex: 2; min-width: 260px;">
          <label class="filter-bar-label">Pilih Indikator</label>
          <v-select append-to-body
            :options="indicators"
            label="nama_inmut"
            v-model="selectedIndicator"
            placeholder="Pilih Indikator untuk Entri..."
            class="filter-vselect"
            @update:modelValue="fetchMonthlyData"
          />
        </div>
      </template>

      <!-- VALIDASI MODE FILTERS -->
      <template v-else-if="viewMode === 'validasi'">
        <div class="filter-bar-item">
          <label class="filter-bar-label">Bulan &amp; Tahun</label>
          <input type="month" class="filter-date-input" v-model="monthlyFilterDate" @change="handleMonthlyDateChange">
        </div>
        <div class="filter-bar-item unit-select-container">
          <label class="filter-bar-label">Unit / Ruangan</label>
          <v-select append-to-body
            :options="units"
            label="nama_ruang"
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit"
            class="filter-vselect unit-select"
            :disabled="inputMode === 'komite' || (inputMode === 'unit' && isUnitLocked)"
          />
        </div>
      </template>

      <!-- ANALISA MODE FILTERS -->
      <template v-else-if="viewMode === 'analisa'">
        <div class="filter-bar-item" style="flex: 2; min-width: 260px;">
          <label class="filter-bar-label">Pilih Indikator</label>
          <v-select append-to-body
            :options="indicators"
            label="nama_inmut"
            v-model="selectedIndicator"
            placeholder="Pilih Indikator..."
            class="filter-vselect"
            @update:modelValue="fetchAnalisaData"
          />
        </div>
        <div class="filter-bar-item">
          <label class="filter-bar-label">Bulan &amp; Tahun</label>
          <input type="month" class="filter-date-input" v-model="monthlyFilterDate" @change="handleMonthlyDateChange">
        </div>
        <div class="filter-bar-item unit-select-container">
          <label class="filter-bar-label">Unit / Ruangan</label>
          <v-select append-to-body
            :options="units"
            label="nama_ruang"
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit"
            class="filter-vselect unit-select"
            :disabled="inputMode === 'komite' || (inputMode === 'unit' && isUnitLocked)"
            @update:modelValue="fetchAnalisaData"
          />
        </div>
      </template>

      <!-- PDSA MODE FILTERS -->
      <template v-else-if="viewMode === 'pdsa'">
        <div class="filter-bar-item" style="flex: 2; min-width: 260px;">
          <label class="filter-bar-label">Pilih Indikator</label>
          <v-select append-to-body
            :options="indicators"
            label="nama_inmut"
            v-model="selectedIndicator"
            placeholder="Pilih Indikator..."
            class="filter-vselect"
            @update:modelValue="fetchPdsaData"
          />
        </div>
        <div class="filter-bar-item">
          <label class="filter-bar-label">Periode Analisa</label>
          <div class="d-flex gap-2">
            <select class="filter-select" v-model="selectedTriwulan" @change="handleTriwulanChange">
              <option value="03">Triwulan 1 (Jan - Mar)</option>
              <option value="06">Triwulan 2 (Apr - Jun)</option>
              <option value="09">Triwulan 3 (Jul - Sep)</option>
              <option value="12">Triwulan 4 (Okt - Des)</option>
            </select>
            <input type="number" class="filter-date-input" style="width: 90px;" v-model="selectedYear" @change="handleTriwulanChange">
          </div>
        </div>
        <div class="filter-bar-item unit-select-container">
          <label class="filter-bar-label">Unit / Ruangan</label>
          <v-select append-to-body
            :options="units"
            label="nama_ruang"
            v-model="filters.unit"
            :reduce="unit => unit.dep_id"
            placeholder="Pilih Unit"
            class="filter-vselect unit-select"
            :disabled="inputMode === 'komite' || (inputMode === 'unit' && isUnitLocked)"
            @update:modelValue="fetchPdsaData"
          />
        </div>
      </template>


    </div>

    <!-- Main Content Card -->
    <div class="content-card">
      <div class="card-body p-0">
        <!-- Unit PIC & Validator Info Bar -->
        <div v-if="filters.unit && activeUnitInfo" class="px-4 py-3 bg-light border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-3 flex-wrap">
                <span class="small text-muted fw-bold text-uppercase">
                    <i class="fas fa-hospital me-1 text-primary"></i> {{ activeUnitInfo.nama_ruang }}
                </span>
                <span v-if="activeUnitInfo.nama_pic" class="badge bg-primary-light text-primary rounded-pill px-3 py-2 border border-primary-light small">
                    <i class="fas fa-user-cog me-1"></i> PIC: {{ activeUnitInfo.nama_pic }}
                </span>
                <span v-else class="badge bg-light text-muted rounded-pill px-3 py-2 border small">
                    <i class="fas fa-user-cog me-1"></i> PIC: -
                </span>
                <span v-if="activeUnitInfo.nama_validator" class="badge bg-success-light text-success rounded-pill px-3 py-2 border border-success-light small">
                    <i class="fas fa-user-check me-1"></i> Validator: {{ activeUnitInfo.nama_validator }}
                </span>
                <span v-else class="badge bg-light text-muted rounded-pill px-3 py-2 border small">
                    <i class="fas fa-user-check me-1"></i> Validator: -
                </span>
            </div>
            <div class="d-flex align-items-center gap-2">
                <div class="extra-small text-muted fw-bold text-uppercase ms-2 d-none d-sm-block">
                    Mode: {{ viewMode === 'daily' ? 'Harian' : (viewMode === 'monthly' ? 'Bulanan' : (viewMode === 'validasi' ? 'Validasi Data' : (viewMode === 'pdsa' ? 'PDSA' : 'Analisa'))) }}
                </div>
            </div>
        </div>

        <div v-if="!filters.unit" class="text-center py-5 text-muted">
            <i class="fas fa-hospital-user fa-3x mb-3 opacity-50"></i>
            <p class="mb-0">Silahkan pilih unit / ruangan terlebih dahulu</p>
        </div>
        
        <div v-else-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <div v-else-if="indicators.length === 0" class="text-center py-5 text-muted">
            <i class="fas fa-list-ul fa-3x mb-3 opacity-50"></i>
            <p class="mb-0">Tidak ada indikator mutu yang terdaftar untuk unit ini</p>
        </div>

        <div v-else-if="viewMode === 'daily'" class="table-responsive">
            <table class="premium-table align-middle mb-0">
                <thead>
                    <tr>
                        <th width="5%" class="text-center">#</th>
                        <th width="40%">Indikator</th>
                        <th width="15%">Standar</th>
                        <th width="25%">Input Data</th>
                        <th width="15%" class="text-end">Hasil &amp; Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in indicators" :key="item.id_inmut">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>
                            <div class="indicator-title">{{ item.nama_inmut }}</div>
                            <div class="indicator-desc" :title="stripHtml(item.definisi_operasional)">
                                {{ stripHtml(item.definisi_operasional) }}
                            </div>
                        </td>
                        <td>
                            <span class="premium-badge-standar">
                                <span class="symbol">{{ getRumusSymbol(item.rumus) }}</span>
                                <span class="val">{{ item.standar }}</span>
                                <span class="unit">{{ item.satuan }}</span>
                            </span>
                        </td>
                        <td>
                            <div v-if="item.latest_input_date" class="latest-input-tag">
                                <i class="fas fa-history me-1"></i> Terakhir: {{ formatDate(item.latest_input_date) }}
                            </div>
                            <div class="d-flex align-items-center gap-3">
                                <div class="input-field-wrapper">
                                    <span class="input-field-label">Numerator</span>
                                    <input 
                                        type="number" 
                                        class="premium-table-input" 
                                        v-model.number="item.numerator" 
                                        placeholder="0"
                                        min="0"
                                        :disabled="isRowLockedForUser(item)"
                                    >
                                </div>
                                <div class="input-field-wrapper" v-if="needsDenominator(item)">
                                    <span class="input-field-label">Denominator</span>
                                    <input 
                                        type="number" 
                                        class="premium-table-input" 
                                        v-model.number="item.denominator" 
                                        placeholder="0"
                                        min="0"
                                        :disabled="isRowLockedForUser(item)"
                                    >
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex flex-column align-items-end gap-2">
                                <div class="score-badge" :class="getScoreColor(calculateScore(item), item)">
                                    {{ calculateScore(item) }} %
                                </div>

                                <!-- Verification Status Badge -->
                                <div v-if="isRowLockedForUser(item)" class="badge bg-danger-light text-danger border border-danger-light py-1 px-2.5 rounded-pill fw-semibold extra-small" style="font-size: 0.7rem;">
                                    <i class="fas fa-lock me-1"></i> Terkunci
                                </div>

                                 <!-- Entry Creator Name & Date -->
                                 <div v-if="item.id_rekap && item.nama_input" class="text-muted extra-small text-end mt-1" style="font-size: 0.72rem; font-weight: 500; line-height: 1.3;">
                                     <div class="d-flex align-items-center justify-content-end gap-1">
                                         <i class="fas fa-user-edit"></i> 
                                         <span>Entri: {{ item.nama_input }}</span>
                                     </div>
                                     <div v-if="item.tanggal_input" class="text-secondary extra-small mt-1" style="font-size: 0.65rem;">
                                         <i class="fas fa-clock me-1"></i>{{ formatDateTime(item.tanggal_input) }}
                                     </div>
                                 </div>

                                <div class="d-flex gap-1 align-items-center">
                                    <button 
                                        class="row-save-btn" 
                                        @click="saveItem(item)"
                                        :disabled="item.isSaving || isRowLockedForUser(item)"
                                    >
                                        <i v-if="item.isSaving" class="fas fa-spinner fa-spin me-1"></i>
                                        <i v-else class="fas fa-save me-1"></i> 
                                        {{ item.isSaving ? 'Menyimpan...' : 'Simpan' }}
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- MONTHLY / BULK VIEW -->
        <div v-else-if="viewMode === 'monthly'" class="p-3">
            <div v-if="!selectedIndicator" class="text-center py-5 text-muted">
                <i class="fas fa-mouse-pointer fa-3x mb-3 opacity-50"></i>
                <p>Pilih Indikator di atas untuk mulai mengisi data bulanan</p>
            </div>
            
            <div v-else>
                 <!-- Monthly Info Bar -->
                 <div class="monthly-info-bar mb-3">
                     <!-- Left: indicator info + status badge -->
                     <div class="monthly-info-left">
                         <div class="monthly-info-icon">
                             <i class="fas fa-calendar-alt"></i>
                         </div>
                         <div class="monthly-info-text">
                             <span class="monthly-info-title">{{ selectedIndicator.nama_inmut }}</span>
                             <div class="monthly-info-period">
                                 <i class="fas fa-clock me-1 opacity-50"></i>
                                 Periode: {{ new Date(filters.tgl_transaksi).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}
                                 <span :class="isIndicatorMonthlyLocked(selectedIndicator.id_inmut) ? 'badge bg-success text-white' : 'badge bg-warning text-dark'"
                                       style="font-size: 0.68rem; padding: 3px 8px; border-radius: 20px;">
                                     <i class="fas fa-circle me-1" style="font-size: 0.45rem; vertical-align: middle;"></i>
                                     {{ isIndicatorMonthlyLocked(selectedIndicator.id_inmut) ? 'Divalidasi' : 'Pending/Draft' }}
                                 </span>
                             </div>
                         </div>
                     </div>

                     <!-- Right: all action buttons in ONE horizontal row -->
                     <div class="monthly-actions-row">
                         <!-- Save all -->
                         <button class="monthly-save-btn" @click="saveBulk" :disabled="bulkSaving || isRowLockedForUser(selectedIndicator)">
                             <i class="fas" :class="bulkSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                             {{ bulkSaving ? 'Menyimpan...' : 'Simpan Semua' }}
                         </button>
                     </div>
                 </div>


                 <div class="calendar-grid">
                    <div v-for="day in calendarDays" :key="day.date" class="calendar-day card" :class="{'has-data': day.hasData, 'is-sunday': day.isSunday}">
                        <div class="card-header py-1 px-2 d-flex justify-content-between align-items-center"
                             :title="day.hasData && day.nama_input ? `Pengentri: ${day.nama_input}\nWaktu: ${formatDateTime(day.tanggal_input)}` : null"
                             :class="day.isSunday ? 'bg-danger text-white' : (day.hasData ? (day.status_verifikasi === 'verified_koor' ? 'bg-success text-white' : day.status_verifikasi === 'verified_pic' ? 'bg-primary text-white' : 'bg-warning text-dark') : 'bg-light')">
                            <small class="fw-bold">{{ day.date.slice(-2) }} {{ day.dayName }}</small>
                            <span v-if="day.hasData && !day.isSunday" style="font-size: 0.6rem;">
                                <i v-if="day.status_verifikasi === 'verified_koor'" class="fas fa-check-double" title="Verified Koor"></i>
                                <i v-else-if="day.status_verifikasi === 'verified_pic'" class="fas fa-check" title="Verified PIC"></i>
                                <i v-else class="fas fa-clock" title="Pending"></i>
                            </span>
                            <i v-else-if="day.isSunday" class="fas fa-calendar-day small"></i>
                        </div>
                        <div class="card-body p-2" :class="{'bg-light opacity-50': day.date > new Date().toISOString().slice(0, 10)}">
                            <div class="mb-2">
                                <label class="small text-muted d-block mb-0">Num</label>
                                <input 
                                    type="number" 
                                    class="form-control form-control-sm" 
                                    v-model.number="day.numerator" 
                                    min="0" 
                                    :disabled="day.date > new Date().toISOString().slice(0, 10) || isRowLockedForUser(day)"
                                    @input="day.isTouched = true"
                                >
                            </div>
                            <div>
                                <label class="small text-muted d-block mb-0">Denum</label>
                                <input 
                                    type="number" 
                                    class="form-control form-control-sm" 
                                    v-model.number="day.denominator" 
                                    min="0" 
                                    :disabled="!needsDenominator(selectedIndicator) || day.date > new Date().toISOString().slice(0, 10) || isRowLockedForUser(day)" 
                                    @input="day.isTouched = true"
                                >
                            </div>
                            <!-- Entry Creator -->
                             <div v-if="day.hasData && day.nama_input" class="mt-2 pt-1 border-top text-center text-muted" style="font-size: 0.65rem; line-height: 1.2;">
                                 <div class="text-truncate" :title="`Pengentri: ${day.nama_input}`">
                                     <i class="fas fa-user-edit" style="font-size: 0.58rem;"></i> {{ day.nama_input }}
                                 </div>
                                 <div v-if="day.tanggal_input" class="text-secondary text-truncate mt-1" style="font-size: 0.6rem;" :title="`Waktu: ${formatDateTime(day.tanggal_input)}`">
                                     <i class="fas fa-clock" style="font-size: 0.55rem;"></i> {{ formatDateTime(day.tanggal_input) }}
                                 </div>
                             </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        <!-- VALIDASI DATA VIEW -->
        <div v-else-if="viewMode === 'validasi'" class="p-3">
            <div v-if="!filters.unit" class="text-center py-5 text-muted">
                <i class="fas fa-hospital-user fa-3x mb-3 opacity-50"></i>
                <p class="mb-0">Silahkan pilih unit / ruangan terlebih dahulu</p>
            </div>
            <ValidasiDataTab 
                v-else
                :dep-id="filters.unit"
                :monthly-date="monthlyFilterDate"
                :user-nik="userNik"
                :is-committee-member="isCommitteeMember"
                :active-unit-info="activeUnitInfo"
                @export="handleTabExport"
            />
        </div>


        <!-- ANALISA VIEW -->
        <div v-else-if="viewMode === 'analisa'" class="p-3">
            <!-- ALL INDICATORS VIEW (DEFAULT) -->
            <div v-if="!selectedIndicator">
                <div class="d-flex align-items-center justify-content-between mb-4 px-1">
                    <div>
                        <h5 class="fw-bold text-dark mb-1">Status Analisa Unit</h5>
                        <p class="text-muted small mb-0">Periode {{ formatMonthYear(analisaFilters.bulan) }}</p>
                    </div>
                    <div class="d-flex gap-2">
                        <div class="badge bg-success-light text-success px-3 py-2 rounded-pill border">
                            {{ allIndicatorStats.filter(s => s.isAnalyzed).length }} Selesai
                        </div>
                        <div class="badge bg-primary-light text-primary px-3 py-2 rounded-pill border">
                            {{ allIndicatorStats.length }} Total
                        </div>
                    </div>
                </div>

                <div v-if="loading" class="text-center py-5">
                    <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                    <p class="text-muted">Memproses data indikator...</p>
                </div>

                <div v-else class="row g-3">
                    <div v-for="item in allIndicatorStats" :key="item.id_inmut" class="col-md-6 col-lg-6">
                        <div class="card h-100 border-0 shadow-sm hover-elevate overflow-hidden" 
                             style="border-radius: 12px; cursor: pointer; transition: all 0.3s ease;"
                             @click="selectedIndicator = item">
                            <div :class="item.isAnalyzed ? 'bg-success' : (item.isComplete ? 'bg-primary' : 'bg-warning')" style="height: 4px;"></div>
                            <div class="card-body p-3">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <div class="flex-grow-1">
                                        <h6 class="fw-bold mb-1 text-dark text-truncate-2" style="font-size: 0.9rem; min-height: 2.7rem;">
                                            {{ item.nama_inmut }}
                                        </h6>
                                    </div>
                                    <div class="ms-2 d-flex flex-column align-items-end gap-1">
                                        <!-- Primary Status -->
                                        <span v-if="item.isAnalyzed" class="badge bg-success rounded-pill extra-small">
                                            <i class="fas fa-check-double"></i> Selesai
                                        </span>
                                        <span v-else-if="item.isComplete" class="badge bg-primary rounded-pill extra-small">
                                            <i class="fas fa-edit"></i> Siap Analisa
                                        </span>
                                        <span v-else class="badge bg-warning text-dark rounded-pill extra-small">
                                            <i class="fas fa-clock"></i> Belum Lengkap
                                        </span>

                                        <!-- Secondary Status -->
                                        <span v-if="item.hasFeedback" class="badge bg-info rounded-pill extra-small">
                                            <i class="fas fa-comment-dots"></i> Feedback Komite
                                        </span>
                                    </div>
                                </div>

                                <div class="mt-3">
                                    <div class="d-flex justify-content-between align-items-end mb-1">
                                        <small class="text-muted extra-small fw-bold text-uppercase">Data Terisi</small>
                                        <small class="fw-bold" :class="item.isComplete ? 'text-primary' : 'text-warning-dark'">{{ item.progress }}%</small>
                                    </div>
                                    <div class="progress" style="height: 6px; border-radius: 3px; background-color: rgba(0,0,0,0.05);">
                                        <div class="progress-bar" 
                                             :class="item.isComplete ? 'bg-primary' : 'bg-warning'"
                                             :style="{ width: item.progress + '%' }"></div>
                                    </div>
                                </div>


                                <!-- Mini Chart Preview -->
                                <div v-if="item.chartOptions" class="mt-3 bg-light rounded-3 p-1 position-relative" style="height: 145px; overflow: hidden;" @click.stop>
                                    <apexchart type="line" height="135" :options="item.chartOptions" :series="item.series"></apexchart>
                                </div>

                                <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                                    <div class="text-start">
                                        <small class="text-muted d-block extra-small">CAPAIAN</small>
                                        <div class="d-flex align-items-center gap-1">
                                            <span class="fw-bold" :class="isTargetMet(item) ? 'text-success' : 'text-danger'">{{ item.score }}%</span>
                                            <span class="badge extra-small rounded-pill p-1 px-2" :class="isTargetMet(item) ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'" style="font-size: 0.6rem !important;">
                                                {{ isTargetMet(item) ? 'Tercapai' : 'Tidak Tercapai' }}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="text-center px-1">
                                        <small class="text-muted d-block extra-small">TARGET</small>
                                        <span class="fw-bold text-dark extra-small">{{ getTargetDisplay(item) }}</span>
                                    </div>
                                    <div v-if="item.isAnalyzed" class="text-end">
                                        <i class="fas fa-chevron-right text-success opacity-50"></i>
                                    </div>
                                    <div v-else-if="item.isComplete" class="text-end">
                                        <button class="btn btn-primary btn-xs py-1 px-2 rounded-pill extra-small">
                                            Input Analisa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- SELECTED INDICATOR VIEW -->
            <div v-else>
                <!-- BACK BUTTON -->
                <div id="details-anchor" class="back-nav-bar mb-4" @click="selectedIndicator = null">
                    <div class="back-nav-icon">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                    <div class="back-nav-content">
                        <span class="back-nav-label">Kembali ke Daftar Indikator</span>
                        <span class="back-nav-sub">{{ selectedIndicator?.nama_inmut }}</span>
                    </div>
                    <i class="fas fa-times back-nav-close"></i>
                </div>                <!-- Side-by-Side Grid Layout -->
                <div class="row g-4">
                    <!-- Left Column: Status Pengisian & Stats Summary -->
                    <div class="col-lg-5 d-flex flex-column gap-4">
                        <!-- DATA ENTRY PROGRESS CARD -->
                        <div class="card border-0 shadow-sm overflow-hidden" style="border-radius: 15px; display: flex; flex-direction: column;">
                            <div class="p-4 flex-grow-1" :class="monthlyStats.isComplete ? 'bg-success-light' : 'bg-warning-light'">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h5 class="fw-bold mb-1" :class="monthlyStats.isComplete ? 'text-success' : 'text-warning-dark'">
                                            <i class="fas" :class="monthlyStats.isComplete ? 'fa-check-circle' : 'fa-tasks'"></i>
                                            Status Pengisian Data
                                        </h5>
                                        <p class="text-muted small mb-0">{{ selectedIndicator.nama_inmut }}</p>
                                    </div>
                                    <div class="text-end">
                                        <span class="display-6 fw-bold" :class="monthlyStats.isComplete ? 'text-success' : 'text-warning-dark'">
                                            {{ monthlyStats.fillPercentage }}%
                                        </span>
                                    </div>
                                </div>
                                
                                <!-- Progress Bar -->
                                <div class="progress mb-3" style="height: 12px; border-radius: 6px; background-color: rgba(0,0,0,0.05);">
                                    <div 
                                        class="progress-bar progress-bar-striped progress-bar-animated" 
                                        role="progressbar" 
                                        :style="{ width: monthlyStats.fillPercentage + '%' }"
                                        :class="monthlyStats.isComplete ? 'bg-success' : 'bg-warning'"
                                    ></div>
                                </div>

                                <!-- Missing Days Info -->
                                <div v-if="!monthlyStats.isComplete" class="d-flex align-items-middle gap-3 p-3 bg-white rounded-3 border">
                                    <div class="badge bg-warning text-dark p-2 rounded-circle flex-shrink-0" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-exclamation"></i>
                                    </div>
                                    <div class="flex-grow-1">
                                        <p class="mb-1 fw-bold text-dark small">Data Belum Lengkap</p>
                                        <p class="mb-0 text-muted extra-small">
                                            Terdapat <span class="fw-bold text-danger">{{ monthlyStats.missingDays.length }} tanggal</span> yang belum diisi.
                                        </p>
                                        <div class="mt-2 d-flex flex-wrap gap-1" style="max-height: 120px; overflow-y: auto;">
                                            <span v-for="day in monthlyStats.missingDays" :key="day" class="badge bg-light text-dark border extra-small">
                                                Tgl {{ day }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div v-else class="d-flex align-items-start gap-3 p-3 bg-white rounded-3 border">
                                    <div class="badge bg-success p-2 rounded-circle text-white flex-shrink-0" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-check"></i>
                                    </div>
                                    <div>
                                        <p class="mb-1 fw-bold text-dark small">Data Siap Dianalisa</p>
                                        <p class="mb-0 text-muted extra-small">Seluruh data pada periode {{ formatMonthYear(analisaFilters.bulan) }} telah terisi lengkap.</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Stats Summary Bar (Inside Card Footer) -->
                            <div class="bg-white border-top p-3 d-flex justify-content-around flex-wrap gap-2 text-center mt-auto">
                                <div class="px-2">
                                    <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Numerator</small>
                                    <span class="fw-bold text-dark h5 mb-0">{{ monthlyStats.totalNum }}</span>
                                </div>
                                <div class="vr opacity-25"></div>
                                <div class="px-2">
                                    <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Denominator</small>
                                    <span class="fw-bold text-dark h5 mb-0">{{ monthlyStats.totalDenum }}</span>
                                </div>
                                <div class="vr opacity-25"></div>
                                <div class="px-2">
                                    <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Target</small>
                                    <span class="fw-bold text-dark h5 mb-0 text-primary">{{ getTargetDisplay(selectedIndicator) }}</span>
                                </div>
                                <div class="vr opacity-25"></div>
                                <div class="px-2">
                                    <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Capaian</small>
                                    <span class="fw-bold h5 mb-0" :class="isTargetMet(monthlyStats) ? 'text-success' : 'text-danger'">{{ monthlyStats.score }}%</span>
                                </div>
                                <div class="vr opacity-25"></div>
                                <div class="px-2">
                                    <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Status</small>
                                    <div v-if="isTargetMet(monthlyStats)" class="badge bg-success rounded-pill px-3 py-1 shadow-sm" style="font-size: 0.75rem;">
                                        TERCAPAI
                                    </div>
                                    <div v-else class="badge bg-danger rounded-pill px-3 py-1 shadow-sm" style="font-size: 0.75rem;">
                                        TIDAK TERCAPAI
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Daily Trend Chart Card -->
                        <div v-if="selectedIndicatorChartData" class="card border-0 shadow-sm" style="border-radius: 15px; overflow: hidden;">
                            <div class="card-header bg-white border-0 py-3 px-4">
                                <h6 class="fw-bold text-dark mb-0">
                                    <i class="fas fa-chart-line text-primary me-2"></i>
                                    Tren Capaian Harian
                                </h6>
                            </div>
                            <div class="card-body p-3">
                                <apexchart type="line" height="230" :options="selectedIndicatorChartData.chartOptions" :series="selectedIndicatorChartData.series"></apexchart>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Form Analisa OR Existing Results / Placeholder -->
                    <div class="col-lg-7">
                        <!-- FORM ANALISA (EXPANDABLE) -->
                        <Transition name="fade-slide">
                            <div v-if="showAnalisaForm && canVerifyAsKoor" class="card border-0 shadow-sm overflow-hidden h-100" style="border-radius: 12px; display: flex; flex-direction: column;">
                                <div class="card-header border-0 py-3 px-4 text-start" style="background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;">
                                    <h6 class="fw-bold text-white mb-0">
                                        <i class="fas fa-edit me-2"></i> Form Analisa & Tindak Lanjut
                                    </h6>
                                </div>
                                <div class="card-body p-4 d-flex flex-column justify-content-between h-100">
                                    <div class="flex-grow-1">
                                        <div class="mb-3">
                                            <label class="form-label fw-bold small">Analisa Capaian <span class="text-danger">*</span></label>
                                            <textarea 
                                                class="form-control premium-textarea" 
                                                rows="4" 
                                                v-model="analisaForm.analisa"
                                                placeholder="Tuliskan analisa mengapa capaian target terpenuhi atau tidak..."
                                                style="min-height: 120px;"
                                            ></textarea>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label class="form-label fw-bold small">Rencana Tindak Lanjut <span class="text-danger">*</span></label>
                                            <textarea 
                                                class="form-control premium-textarea" 
                                                rows="4" 
                                                v-model="analisaForm.tindak_lanjut"
                                                placeholder="Tuliskan langkah konkret perbaikan atau pengembangan ke depan..."
                                                style="min-height: 120px;"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-auto">
                                        <button class="btn btn-light btn-sm px-4" @click="showAnalisaForm = false">
                                            <i class="fas fa-times me-2"></i> Batal
                                        </button>
                                        <button 
                                            class="btn btn-primary btn-sm px-4" 
                                            @click="saveAnalisa"
                                            :disabled="analisaSaving"
                                        >
                                            <i v-if="analisaSaving" class="fas fa-spinner fa-spin me-2"></i>
                                            <i v-else class="fas fa-save me-2"></i>
                                            {{ analisaForm.id_analisa ? 'Update Analisa' : 'Simpan Analisa' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Transition>

                        <!-- PLACEHOLDER IF NO FORM & NO EXISTING ANALYSIS -->
                        <div v-if="!showAnalisaForm && existingAnalisa.length === 0" class="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center text-center p-5 bg-white text-muted" style="border-radius: 12px; min-height: 350px;">
                            <div>
                                <i class="fas fa-file-signature fa-3x mb-3 text-secondary opacity-40"></i>
                                <h6 class="fw-bold text-dark">Belum Ada Analisa Data</h6>
                                <p class="small text-muted mb-4" style="max-width: 320px;">Data analisa capaian untuk indikator ini pada periode ini belum diisi.</p>
                                <button v-if="canVerifyAsKoor" class="btn btn-primary px-4 rounded-pill shadow-sm" @click="showAnalisaForm = true">
                                    <i class="fas fa-pen-fancy me-2"></i> Beri Analisa
                                </button>
                            </div>
                        </div>

                        <!-- EXISTING ANALISA RESULTS & COMMITTEE FEEDBACK -->
                        <div v-if="!showAnalisaForm && existingAnalisa.length > 0">
                            <div class="d-flex align-items-center justify-content-between mb-3 px-1">
                                <h6 class="fw-bold text-dark mb-0">
                                    <i class="fas fa-file-alt text-primary me-2"></i> Hasil Analisa & Feedback
                                </h6>
                                <button v-if="!showAnalisaForm && canVerifyAsKoor" class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="showAnalisaForm = true">
                                    <i class="fas fa-edit me-2"></i> Edit Analisa
                                </button>
                            </div>
                            
                            <div v-for="item in existingAnalisa" :key="item.id_analisa">
                                <!-- Unit Analysis Result -->
                                <div class="card border-0 shadow-sm mb-3 overflow-hidden" style="border-radius: 12px;">
                                    <div class="bg-primary p-2"></div>
                                    <div class="card-body p-4">
                                        <div class="row">
                                            <div class="col-md-6 border-end">
                                                <div class="d-flex align-items-center mb-3">
                                                    <div class="badge bg-primary-light text-primary p-2 rounded-3 me-3">
                                                        <i class="fas fa-search"></i>
                                                    </div>
                                                    <h6 class="fw-bold mb-0">Analisa</h6>
                                                </div>
                                                <p class="text-dark mb-0 text-justify" style="line-height: 1.6; font-size: 0.95rem;">
                                                    {{ item.analisa }}
                                                </p>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="d-flex align-items-center mb-3">
                                                    <div class="badge bg-success-light text-success p-2 rounded-3 me-3">
                                                        <i class="fas fa-rocket"></i>
                                                    </div>
                                                    <h6 class="fw-bold mb-0 text-success">Tindak Lanjut</h6>
                                                </div>
                                                <p class="text-dark mb-0 text-justify" style="line-height: 1.6; font-size: 0.95rem;">
                                                    {{ item.tindak_lanjut }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Committee Feedback Result (If Exists) -->
                                <div v-if="item.feedback" class="card border-0 shadow-sm mb-3 overflow-hidden" style="border-radius: 12px; border: 1px solid #0d6efd !important;">
                                    <div class="card-header border-0 py-3 px-3" style="background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;">
                                        <div class="d-flex align-items-start flex-wrap gap-2 justify-content-between">
                                            <h6 class="fw-bold text-white mb-0">
                                                <i class="fas fa-comment-dots me-2"></i> Feedback Komite Mutu
                                            </h6>
                                            <span class="badge bg-white text-primary rounded-pill px-2 py-1 shadow-sm flex-shrink-0" style="font-size: 0.72rem;">
                                                <i class="fas fa-check-circle me-1"></i> Review Selesai
                                            </span>
                                        </div>
                                    </div>
                                    <div class="card-body p-3">
                                        <div class="mb-3">
                                            <small class="fw-bold text-primary text-uppercase d-block mb-1" style="font-size: 0.7rem; letter-spacing: 0.5px;">Supervisi</small>
                                            <div class="text-dark rich-content" v-html="item.feedback.supervisi"></div>
                                        </div>
                                        <hr class="my-2">
                                        <div>
                                            <small class="fw-bold text-primary text-uppercase d-block mb-1" style="font-size: 0.7rem; letter-spacing: 0.5px;">Rekomendasi / Saran</small>
                                            <div class="text-dark rich-content" v-html="item.feedback.rekomendasi"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>



        <!-- PDSA VIEW -->
        <div v-else-if="viewMode === 'pdsa'" class="p-3">
            <div v-if="!selectedIndicator" class="text-center py-5 text-muted">
                <i class="fas fa-project-diagram fa-3x mb-3 opacity-50"></i>
                <p>Pilih Indikator di atas untuk memuat data PDSA</p>
            </div>
            
            <div v-else-if="pdsaLoading" class="text-center py-5">
                <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                <p class="text-muted">Memuat data PDSA...</p>
            </div>

            <div v-else>
                <!-- Validation Lock -->
                <div v-if="!hasAnalisaForPdsa" class="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-3">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <div>
                        <h6 class="fw-bold mb-1">Data Analisa Belum Tersedia</h6>
                        <p class="mb-0 small">Formulir PDSA hanya dapat diisi jika Bapak/Ibu sudah menginput data Analisa Mutu untuk periode bulan ini. Silakan kembali ke tab <b>Analisa</b> terlebih dahulu.</p>
                    </div>
                </div>

                <!-- PDSA Form Container -->
                <div v-else class="card border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
                    <div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4 border-0">
                        <h6 class="fw-bold mb-0 text-dark">
                            <i class="fas fa-clipboard-list me-2 text-primary"></i> FORM PDSA PERBAIKAN MUTU
                        </h6>
                        <!-- PDSA Status Badge -->
                        <div v-if="pdsaForm.id" class="d-flex align-items-center gap-2">
                            <span class="status-verif-badge" :class="pdsaForm.status_pdsa || 'draft'">
                                {{ formatPdsaStatus(pdsaForm.status_pdsa) }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="card-body p-4 bg-light">
                        <!-- Success Indicator -->
                        <div v-if="pdsaForm.id" class="alert alert-success d-flex align-items-center border-0 shadow-sm mb-4" style="border-radius: 12px; border-left: 4px solid #198754 !important; background: linear-gradient(to right, #d1e7dd, #f8f9fa);">
                            <i class="fas fa-check-circle fa-2x text-success me-3"></i>
                            <div>
                                <h6 class="fw-bold text-success mb-1">Data PDSA Tersimpan</h6>
                                <p class="mb-0 small text-dark">Data PDSA untuk indikator ini sudah tersimpan di sistem. Bapak/Ibu dapat memperbarui data kapan saja jika ada perkembangan dari rencana tindak lanjut.</p>
                            </div>
                        </div>

                        <!-- PDSA Validation Status Indicator -->
                        <div v-if="pdsaForm.id" class="alert alert-info d-flex align-items-center border-0 shadow-sm mb-4" style="border-radius: 12px; border-left: 4px solid #3b82f6 !important; background: linear-gradient(to right, #eff6ff, #f8f9fa);">
                            <i class="fas fa-shield-alt fa-2x text-primary me-3"></i>
                            <div class="flex-grow-1">
                                <h6 class="fw-bold text-primary mb-1">Status Validasi PDSA</h6>
                                <p class="mb-0 small text-dark">
                                    Status saat ini: <strong class="text-capitalize">{{ formatPdsaStatus(pdsaForm.status_pdsa) }}</strong>.
                                    <span v-if="pdsaForm.status_pdsa === 'validated'">
                                        Divalidasi oleh Komite Mutu pada {{ formatDate(pdsaForm.validated_at) }}.
                                    </span>
                                    <span v-else>
                                        Menunggu validasi Komite Mutu.
                                    </span>
                                </p>
                            </div>
                            <div class="ms-3">
                                <!-- Komite Mutu Validation Actions -->
                                <button 
                                    v-if="isKomiteMutu && pdsaForm.status_pdsa !== 'validated'"
                                    class="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                                    @click="validatePdsaItem('validated')"
                                    style="border-radius: 8px; font-weight: 600; padding: 6px 12px;"
                                >
                                    <i class="fas fa-check-circle"></i> Validasi PDSA
                                </button>
                                <button 
                                    v-if="isKomiteMutu && pdsaForm.status_pdsa === 'validated'"
                                    class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                                    @click="validatePdsaItem('draft')"
                                    style="border-radius: 8px; font-weight: 600; padding: 6px 12px;"
                                >
                                    <i class="fas fa-lock-open"></i> Unlock PDSA
                                </button>
                            </div>
                        </div>

                        <!-- PDSA Lock Info Alert for PIC / unauthorized users -->
                        <div v-if="isPdsaLocked" class="alert alert-warning d-flex align-items-center border-0 shadow-sm mb-4" style="border-radius: 12px; border-left: 4px solid #ffc107 !important; background: linear-gradient(to right, #fffde7, #f8f9fa);">
                            <i class="fas fa-exclamation-triangle fa-2x text-warning me-3"></i>
                            <div>
                                <h6 class="fw-bold text-warning mb-1">Formulir PDSA Terkunci (Hanya Baca)</h6>
                                <p class="mb-0 small text-dark">
                                    Formulir PDSA ini hanya dapat diisi atau diperbarui oleh <strong>Validator Data / Koordinator Unit</strong> atau pihak <strong>Komite Mutu</strong>. PIC unit hanya diperkenankan membaca lembar PDSA ini.
                                </p>
                            </div>
                        </div>

                        <!-- Fieldset to wrap and lock PDSA inputs -->
                        <fieldset :disabled="isPdsaLocked" class="border-0 p-0 m-0">
                            <!-- Top Info -->
                            <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px; background: linear-gradient(to right, #f8f9fa, #ffffff); border-left: 4px solid #3b82f6 !important;">
                                <div class="card-body p-4">
                                    <h6 class="fw-bold text-dark mb-4"><i class="fas fa-info-circle text-primary me-2"></i> Informasi Dasar PDSA</h6>
                                    <div class="row g-4">
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-secondary mb-1">Topik Perbaikan</label>
                                            <input type="text" class="form-control form-control-lg bg-white" style="font-size: 0.95rem;" v-model="pdsaForm.topik" placeholder="Contoh: Menurunkan waktu tunggu obat">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-secondary mb-1">Tim</label>
                                            <input type="text" class="form-control form-control-lg bg-white" style="font-size: 0.95rem;" v-model="pdsaForm.tim" placeholder="Contoh: Tim Farmasi">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-secondary mb-1">Tgl Mulai Uji Coba</label>
                                            <input type="date" class="form-control form-control-lg bg-white" style="font-size: 0.95rem;" v-model="pdsaForm.tgl_mulai">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-secondary mb-1">Tgl Selesai Uji Coba</label>
                                            <input type="date" class="form-control form-control-lg bg-white" style="font-size: 0.95rem;" v-model="pdsaForm.tgl_selesai">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 1. PLAN -->
                            <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px;">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                                        <div class="badge bg-primary text-white rounded-circle me-3 shadow-sm d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-size: 1.1rem;">1</div>
                                        <div>
                                            <h5 class="fw-bold text-primary mb-0" style="letter-spacing: 0.5px;">PLAN</h5>
                                            <span class="text-muted small fw-medium">Rencanakan Perbaikan</span>
                                        </div>
                                    </div>
                                    <div class="row g-4">
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-dark">Latar Belakang / Masalah</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6;" rows="3" v-model="pdsaForm.p_latar_belakang" placeholder="Jelaskan masalah berdasarkan data/keluhan/audit."></textarea>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-dark">Tujuan Perbaikan</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6;" rows="3" v-model="pdsaForm.p_tujuan" placeholder="SMART. Contoh: Menurunkan waktu tunggu obat jadi <30 menit dalam 4 minggu."></textarea>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-dark">Analisis Singkat Akar Masalah</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6;" rows="3" v-model="pdsaForm.p_akar_masalah" placeholder="Tulis 1-2 penyebab utama yang akan diuji."></textarea>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-dark">Rencana Perubahan / Intervensi</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6;" rows="3" v-model="pdsaForm.p_rencana_intervensi" placeholder="Apa yang akan dicoba? Siapa PIC? Kapan? Di mana?"></textarea>
                                        </div>
                                        <div class="col-12 mt-4">
                                            <div class="p-4 rounded-3" style="background-color: #f8f9fa; border: 1px dashed #ced4da;">
                                                <h6 class="fw-bold small mb-3 text-secondary text-uppercase"><i class="fas fa-ruler-combined me-2"></i>Rencana Pengukuran</h6>
                                                <div class="row g-3">
                                                    <div class="col-md-3">
                                                        <input type="text" class="form-control" v-model="pdsaForm.p_indikator" placeholder="Indikator Pengukuran">
                                                    </div>
                                                    <div class="col-md-3">
                                                        <input type="text" class="form-control" v-model="pdsaForm.p_cara_ukur" placeholder="Cara Ukur">
                                                    </div>
                                                    <div class="col-md-3">
                                                        <input type="text" class="form-control" v-model="pdsaForm.p_frekuensi" placeholder="Frekuensi (Harian/Mingguan)">
                                                    </div>
                                                    <div class="col-md-3">
                                                        <input type="text" class="form-control" v-model="pdsaForm.p_target" placeholder="Target Angka">
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 2. DO -->
                            <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px;">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                                        <div class="badge text-white rounded-circle me-3 shadow-sm d-flex align-items-center justify-content-center" style="background-color: #f59e0b; width: 40px; height: 40px; font-size: 1.1rem;">2</div>
                                        <div>
                                            <h5 class="fw-bold mb-0" style="color: #d97706; letter-spacing: 0.5px;">DO</h5>
                                            <span class="text-muted small fw-medium">Lakukan Uji Coba</span>
                                        </div>
                                    </div>
                                    <div class="row g-4">
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-dark">Uraian Pelaksanaan</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6;" rows="3" v-model="pdsaForm.d_uraian" placeholder="Tulis singkat apa yang dilakukan sesuai rencana. Catat tanggal mulai."></textarea>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-dark">Kendala & Hal yang Berjalan Baik</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6;" rows="3" v-model="pdsaForm.d_kendala" placeholder="Catat apa yang terjadi di lapangan saat uji coba."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 3. STUDY -->
                            <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px;">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                                        <div class="badge bg-info text-white rounded-circle me-3 shadow-sm d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-size: 1.1rem;">3</div>
                                        <div>
                                            <h5 class="fw-bold text-info mb-0" style="letter-spacing: 0.5px;">STUDY</h5>
                                            <span class="text-muted small fw-medium">Pelajari Hasilnya</span>
                                        </div>
                                    </div>
                                    <div class="row g-4">
                                        <div class="col-md-12">
                                            <label class="form-label small fw-bold text-dark">Hasil & Data</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6;" rows="2" v-model="pdsaForm.s_hasil" placeholder="Tulis data sebelum dan sesudah."></textarea>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-dark">Analisis</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6;" rows="3" v-model="pdsaForm.s_analisis" placeholder="Apakah target tercapai? Mengapa berhasil/gagal? Perubahan mana yang paling berpengaruh?"></textarea>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label small fw-bold text-dark">Pembelajaran</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6;" rows="3" v-model="pdsaForm.s_pembelajaran" placeholder="Apa yang kita pelajari dari uji coba ini?"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 4. ACT -->
                            <div class="card border-0 shadow-sm mb-4" style="border-radius: 12px;">
                                <div class="card-body p-4">
                                    <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                                        <div class="badge bg-success text-white rounded-circle me-3 shadow-sm d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-size: 1.1rem;">4</div>
                                        <div>
                                            <h5 class="fw-bold text-success mb-0" style="letter-spacing: 0.5px;">ACT</h5>
                                            <span class="text-muted small fw-medium">Tindak Lanjuti Keputusan</span>
                                        </div>
                                    </div>
                                    <div class="row g-4">
                                        <div class="col-md-5">
                                            <label class="form-label small fw-bold text-dark mb-3">Keputusan Uji Coba</label>
                                            <div class="d-flex flex-column gap-3">
                                                <label class="form-check p-3 rounded-3 border" :class="{'border-success bg-success-light': pdsaForm.a_keputusan === 'Adopt', 'bg-light': pdsaForm.a_keputusan !== 'Adopt'}" style="cursor: pointer; transition: all 0.2s;">
                                                    <div class="d-flex align-items-center">
                                                        <input class="form-check-input mt-0 me-3" type="radio" v-model="pdsaForm.a_keputusan" value="Adopt" style="transform: scale(1.2);">
                                                        <div>
                                                            <span class="fw-bold d-block text-dark">Adopt</span>
                                                            <span class="small text-muted">Jadikan standar, sebarkan ke unit lain</span>
                                                        </div>
                                                    </div>
                                                </label>
                                                
                                                <label class="form-check p-3 rounded-3 border" :class="{'border-warning bg-warning-light': pdsaForm.a_keputusan === 'Adapt', 'bg-light': pdsaForm.a_keputusan !== 'Adapt'}" style="cursor: pointer; transition: all 0.2s;">
                                                    <div class="d-flex align-items-center">
                                                        <input class="form-check-input mt-0 me-3" type="radio" v-model="pdsaForm.a_keputusan" value="Adapt" style="transform: scale(1.2);">
                                                        <div>
                                                            <span class="fw-bold d-block text-dark">Adapt</span>
                                                            <span class="small text-muted">Modifikasi dan uji lagi di siklus berikutnya</span>
                                                        </div>
                                                    </div>
                                                </label>
                                                
                                                <label class="form-check p-3 rounded-3 border" :class="{'border-danger bg-danger-light': pdsaForm.a_keputusan === 'Abandon', 'bg-light': pdsaForm.a_keputusan !== 'Abandon'}" style="cursor: pointer; transition: all 0.2s;">
                                                    <div class="d-flex align-items-center">
                                                        <input class="form-check-input mt-0 me-3" type="radio" v-model="pdsaForm.a_keputusan" value="Abandon" style="transform: scale(1.2);">
                                                        <div>
                                                            <span class="fw-bold d-block text-dark">Abandon</span>
                                                            <span class="small text-muted">Hentikan, coba intervensi lain</span>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-7">
                                            <label class="form-label small fw-bold text-dark mb-3">Rencana Tindak Lanjut</label>
                                            <textarea class="form-control bg-white" style="border: 1px solid #dee2e6; min-height: 200px;" rows="7" v-model="pdsaForm.a_tindak_lanjut" placeholder="Jelaskan langkah selanjutnya berdasarkan keputusan di atas secara mendetail."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <div class="d-flex justify-content-end mt-4 pt-4 border-top">
                                <button class="btn btn-primary btn-lg px-5 rounded-pill shadow-sm d-flex align-items-center gap-2" @click="savePdsa" :disabled="pdsaSaving || isPdsaLocked" style="font-weight: 600; padding: 12px 30px;">
                                    <i v-if="pdsaSaving" class="fas fa-spinner fa-spin"></i>
                                    <i v-else class="fas fa-save"></i>
                                    {{ pdsaForm.id ? 'Perbarui PDSA' : 'Simpan PDSA' }}
                                </button>
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'
import committeeService from '@/services/committeeService'
import { useAuthStore } from '@/stores/auth'
import VueApexCharts from 'vue3-apexcharts'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import pdfHeader from '@/assets/pdf-header.png'
import pdfFooter from '@/assets/pdf-footer.png'
import QRCode from 'qrcode'
import ValidasiDataTab from '@/components/indikator-mutu/ValidasiDataTab.vue'

const apexchart = VueApexCharts

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)
const units = ref([])
const indicators = ref([])
const isUnitLocked = ref(false)

const userNik = computed(() => authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik || '')

const monthlyValidations = ref([])
const selectedIndicatorChartData = ref(null)

const fetchMonthlyValidations = async () => {
    if (!filters.unit) {
        monthlyValidations.value = []
        return
    }
    
    let y, m
    if (viewMode.value === 'daily') {
        if (!filters.tgl_transaksi) return
        const parts = filters.tgl_transaksi.split('-')
        y = parseInt(parts[0], 10)
        m = parseInt(parts[1], 10)
    } else {
        if (!monthlyFilterDate.value) return
        const parts = monthlyFilterDate.value.split('-')
        y = parseInt(parts[0], 10)
        m = parseInt(parts[1], 10)
    }
    
    try {
        const res = await api.getValidasiBulanan({
            dep_id: filters.unit,
            bulan: m,
            tahun: y
        })
        if (res.data && res.data.success) {
            monthlyValidations.value = res.data.data
        } else {
            monthlyValidations.value = []
        }
    } catch (e) {
        console.error("Gagal memuat status validasi bulanan:", e)
        monthlyValidations.value = []
    }
}

const isIndicatorMonthlyLocked = (id_inmut) => {
    const val = monthlyValidations.value.find(v => v.id_inmut === id_inmut)
    return val && val.status === 'verified'
}

const filters = reactive({
    tgl_transaksi: new Date().toISOString().slice(0, 10),
    unit: null
})

// === VIEW MODE STATE ===
const viewMode = ref('daily') // 'daily' | 'monthly' | 'analisa' | 'grafik' | 'pdsa'
const selectedIndicator = ref(null)
const bulkSaving = ref(false)
const bulkVerifying = ref(false)
const calendarData = ref([])



// === MODE GLIDER LOGIC ===
const gliderStyle = computed(() => {
    const modes = ['daily', 'monthly', 'validasi', 'analisa', 'pdsa']
    const activeIndex = modes.indexOf(viewMode.value)
    return {
        transform: `translateX(${activeIndex * 100}%)`
    }
})

// === CONTEXT MODE STATE ===
const inputMode = ref('unit') // 'unit' | 'komite'
const isCommitteeMember = ref(false)
const userCommittees = ref([])

// === ROLE CHECK COMPUTED VALUES ===
const isKomiteMutu = computed(() => {
    const role = authStore.userRole?.toLowerCase() || '';
    if (role.includes('pic') || role.includes('penginput')) {
        return false;
    }
    return role.includes('mutu') || role.includes('pmkp') || role.includes('admin') || role.includes('komite');
});

const activeUnitInfo = computed(() => {
    if (!filters.unit || !units.value.length) return null;
    return units.value.find(u => u.dep_id === filters.unit) || null;
});

const canVerifyAsPic = computed(() => {
    const role = authStore.userRole?.toLowerCase() || '';

    // 1. Dynamic check: if unit has a PIC NIK mapped, strictly require NIK match
    if (activeUnitInfo.value && activeUnitInfo.value.nik_pic) {
        const match = activeUnitInfo.value.nik_pic === userNik.value;
        console.log(`[Verify PIC Check] Unit NIK PIC: ${activeUnitInfo.value.nik_pic} | User NIK: ${userNik.value} | Match: ${match}`);
        return match;
    }

    // 2. Fallback to hardcoded role ONLY if database mapping is empty
    const isPicRole = role.includes('pic');
    console.log(`[Verify PIC Check] No mapping found. Falling back to role check: ${isPicRole}`);
    return isPicRole;
});

const canVerifyAsKoor = computed(() => {
    const role = authStore.userRole?.toLowerCase() || '';

    // 1. Dynamic check: if unit has a Validator NIK mapped, strictly require NIK match
    if (activeUnitInfo.value && activeUnitInfo.value.nik_validator) {
        const match = activeUnitInfo.value.nik_validator === userNik.value;
        console.log(`[Verify Koor Check] Unit Validator NIK: ${activeUnitInfo.value.nik_validator} | User NIK: ${userNik.value} | Match: ${match}`);
        return match;
    }

    // 2. Fallback to hardcoded role ONLY if database mapping is empty
    const isKoorRole = role.includes('koor') || role.includes('coordinator') || role.includes('kabid') || role.includes('kasi');
    console.log(`[Verify Koor Check] No mapping found. Falling back to role check: ${isKoorRole}`);
    return isKoorRole;
});

const isRowLockedForUser = (item) => {
    const id_inmut = item.id_inmut || selectedIndicator.value?.id_inmut;
    if (!id_inmut) return false;
    return isIndicatorMonthlyLocked(id_inmut);
};



const isPdsaLocked = computed(() => {
    // 1. Locked if validated and user is not Komite Mutu
    if (pdsaForm.status_pdsa === 'validated' && !isKomiteMutu.value) {
        return true;
    }
    // 2. PIC strictly cannot edit/fill PDSA (must be Koordinator/Validator)
    if (canVerifyAsPic.value) {
        return true;
    }
    // 3. Komite Mutu can always edit/fill
    if (isKomiteMutu.value) {
        return false;
    }
    // 4. Otherwise, only allowed if they are Koordinator/Validator
    return !canVerifyAsKoor.value;
});

const formatVerifStatus = (status) => {
    const map = {
        'pending': 'Pending',
        'verified_pic': 'Verified PIC',
        'verified_koor': 'Verified Koor',
        'rejected': 'Rejected'
    }
    return map[status] || status || 'Pending'
}

const formatPdsaStatus = (status) => {
    const map = {
        'draft': 'Draft',
        'submitted': 'Diajukan',
        'validated': 'Divalidasi',
        'rejected': 'Ditolak'
    }
    return map[status] || status || 'Draft'
}


const validatePdsaItem = async (status) => {
    pdsaSaving.value = true
    try {
        const payload = {
            id_analisa: activeAnalisaIdForPdsa.value,
            status: status
        }
        const res = await api.verifyPdsa(payload)
        if (res.data.success) {
            toast.success(`PDSA berhasil ${status === 'validated' ? 'divalidasi' : 'di-unlock'}`)
            pdsaForm.status_pdsa = status
            pdsaForm.validated_by = res.data.data?.validated_by
            pdsaForm.validated_at = res.data.data?.validated_at
        } else {
            toast.error(res.data.message || 'Gagal mengubah status validasi PDSA')
        }
    } catch (error) {
        console.error(error)
        toast.error('Terjadi kesalahan saat validasi PDSA')
    } finally {
        pdsaSaving.value = false
    }
}

// === INDICATOR SYNC ===
// selectedIndicator is already defined above in VIEW MODE STATE

// === ANALISA MODE STATE ===
const analisaSaving = ref(false)
const showAnalisaForm = ref(false) // Toggle for showing/hiding input form
const existingAnalisa = ref([])
const analisaFilters = reactive({
    bulan: new Date().toISOString().slice(0, 7) // YYYY-MM format
})

// === MONTHLY DATE SYNC ===
const monthlyFilterDate = ref(filters.tgl_transaksi.slice(0, 7))

const handleMonthlyDateChange = () => {
    if (monthlyFilterDate.value) {
        filters.tgl_transaksi = `${monthlyFilterDate.value}-01`
        analisaFilters.bulan = monthlyFilterDate.value
        
        // Sync triwulan selector when month changes in Monthly mode
        const dateObj = new Date(filters.tgl_transaksi)
        selectedYear.value = dateObj.getFullYear()
        const month = dateObj.getMonth() + 1
        if (month <= 3) selectedTriwulan.value = '03'
        else if (month <= 6) selectedTriwulan.value = '06'
        else if (month <= 9) selectedTriwulan.value = '09'
        else selectedTriwulan.value = '12'

        if (viewMode.value === 'monthly') {
            fetchMonthlyData()
        } else if (viewMode.value === 'analisa') {
            fetchAnalisaData()
        } else if (viewMode.value === 'pdsa') {
            fetchPdsaData()
        }
    }
}

// === TRIWULAN SYNC ===
const currentMonth = new Date().getMonth() + 1
let initialTriwulan = '03'
if (currentMonth <= 3) initialTriwulan = '03'
else if (currentMonth <= 6) initialTriwulan = '06'
else if (currentMonth <= 9) initialTriwulan = '09'
else initialTriwulan = '12'

const selectedTriwulan = ref(initialTriwulan)
const selectedYear = ref(new Date().getFullYear())

const handleTriwulanChange = () => {
    const newBulan = `${selectedYear.value}-${selectedTriwulan.value}`
    monthlyFilterDate.value = newBulan
    filters.tgl_transaksi = `${newBulan}-01`
    analisaFilters.bulan = newBulan
    
    if (viewMode.value === 'analisa') {
        fetchAnalisaData()
    } else if (viewMode.value === 'pdsa') {
        fetchPdsaData()
    }
}

const fetchCorrectData = () => {
    if (viewMode.value === 'daily') fetchIndicators()
    else if (viewMode.value === 'monthly') fetchMonthlyData()
    else if (viewMode.value === 'analisa') fetchAnalisaData()
    else if (viewMode.value === 'pdsa') fetchPdsaData()
}

// Watch viewMode to sync and auto-fetch
watch(viewMode, (newMode) => {
    if (newMode === 'monthly' || newMode === 'analisa' || newMode === 'pdsa') {
        monthlyFilterDate.value = filters.tgl_transaksi.slice(0, 7)
        analisaFilters.bulan = monthlyFilterDate.value
        
        // Ensure Triwulan selector matches
        if (newMode === 'analisa' || newMode === 'pdsa') {
            const dateObj = new Date(filters.tgl_transaksi)
            selectedYear.value = dateObj.getFullYear()
            const month = dateObj.getMonth() + 1
            if (month <= 3) selectedTriwulan.value = '03'
            else if (month <= 6) selectedTriwulan.value = '06'
            else if (month <= 9) selectedTriwulan.value = '09'
            else selectedTriwulan.value = '12'
            
            // Re-sync to make sure the selectedTriwulan sets the month precisely to the end of the triwulan 
            // only if they haven't explicitly set it to an end month before
            const newBulan = `${selectedYear.value}-${selectedTriwulan.value}`
            monthlyFilterDate.value = newBulan
            filters.tgl_transaksi = `${newBulan}-01`
            analisaFilters.bulan = newBulan
        }
    }
    fetchCorrectData()
})

const analisaForm = reactive({
    id_analisa: null,
    analisa: '',
    tindak_lanjut: ''
})

// Monthly Statistics for Analisa (using ref for dynamic updates)
const monthlyStats = ref({
    totalNum: 0,
    totalDenum: 0,
    score: 0,
    isComplete: false,
    missingDays: []
})

const isEditingAnalisa = ref(false)
const allIndicatorStats = ref([]) // For the "All Indicators" summary view

// === PDSA STATE ===
const pdsaSaving = ref(false)
const pdsaLoading = ref(false)
const existingPdsa = ref(null)
const hasAnalisaForPdsa = ref(false)
const activeAnalisaIdForPdsa = ref(null)

const pdsaForm = reactive({
    id: null,
    topik: '',
    tim: '',
    tgl_mulai: '',
    tgl_selesai: '',
    p_latar_belakang: '',
    p_tujuan: '',
    p_akar_masalah: '',
    p_rencana_intervensi: '',
    p_indikator: '',
    p_cara_ukur: '',
    p_frekuensi: '',
    p_target: '',
    d_uraian: '',
    d_kendala: '',
    s_hasil: '',
    s_analisis: '',
    s_pembelajaran: '',
    a_keputusan: 'Adopt',
    a_tindak_lanjut: '',
    status_pdsa: 'draft',
    validated_by: null,
    validated_at: null
})

const resetPdsaForm = () => {
    Object.keys(pdsaForm).forEach(key => {
        if (key === 'a_keputusan') {
            pdsaForm[key] = 'Adopt'
        } else if (key === 'status_pdsa') {
            pdsaForm[key] = 'draft'
        } else if (key === 'id' || key === 'validated_by' || key === 'validated_at') {
            pdsaForm[key] = null
        } else {
            pdsaForm[key] = ''
        }
    })
}



// === BUILD CHART DATA FOR SPECIFIC INDICATOR ===
const buildChartDataForIndicator = (ind, indRealisasi, daysInMonth, yearMonth, isMini = false) => {
    const dailyData = []
    let totalNum = 0
    let totalDenum = 0
    let daysFilledCount = 0

    const realisasiByDay = {}
    indRealisasi.forEach(r => {
        if (r.tanggal_inmut) {
            const dateOnly = r.tanggal_inmut.split(' ')[0]
            const parts = dateOnly.split('-')
            if (parts.length === 3) {
                const day = parseInt(parts[2], 10)
                realisasiByDay[day] = r
            }
        }
    })

    const needsDen = needsDenominator(ind)

    for (let d = 1; d <= daysInMonth; d++) {
        const r = realisasiByDay[d]
        if (r) {
            const numVal = parseInt(r.num) || 0
            const denumVal = parseInt(r.denum) || 0
            
            totalNum += numVal
            totalDenum += denumVal
            daysFilledCount++

            let score = 0
            if (needsDen) {
                score = denumVal > 0 ? parseFloat(((numVal / denumVal) * 100).toFixed(2)) : 0
            } else {
                score = numVal
            }

            dailyData.push({
                day: d,
                num: numVal,
                denum: denumVal,
                score: score,
                nama_input: r.nama_input || r.pegawai?.nama || 'Petugas',
                tanggal: r.tanggal_inmut
            })
        } else {
            dailyData.push({
                day: d,
                num: null,
                denum: null,
                score: null,
                nama_input: null,
                tanggal: `${yearMonth}-${String(d).padStart(2, '0')}`
            })
        }
    }

    let monthlyAvg = 0
    if (needsDen) {
        monthlyAvg = totalDenum > 0 ? parseFloat(((totalNum / totalDenum) * 100).toFixed(2)) : 0
    } else {
        monthlyAvg = daysFilledCount > 0 ? parseFloat((totalNum / daysFilledCount).toFixed(2)) : 0
    }

    const isMet = isTargetMet({
        ...ind,
        score: monthlyAvg,
        totalNum,
        totalDenum
    })

    const target = parseFloat(ind.standar) || 0
    const categories = Array.from({ length: daysInMonth }, (_, i) => String(i + 1))
    const scoresSeries = dailyData.map(d => d.score)

    const minVal = 0
    const maxVal = needsDen 
        ? Math.max(100, ...dailyData.map(d => Math.max(d.num || 0, d.denum || 0)))
        : Math.max(target * 1.2, ...scoresSeries.filter(s => s !== null).map(Number), 10)

    const chartOptions = {
        chart: {
            id: `chart-${ind.id_inmut}`,
            type: 'line',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
            zoom: { enabled: false }
        },
        stroke: {
            curve: 'smooth',
            width: needsDen ? [2, 2, 4] : [4]
        },
        markers: {
            size: needsDen ? [3, 3, 5] : [5],
            strokeWidth: 0,
            hover: { size: 6 }
        },
        colors: needsDen ? ['#10b981', '#3b82f6', '#6366f1'] : ['#3b82f6'],
        xaxis: {
            categories: categories,
            title: { text: isMini ? '' : 'Hari Ke-', style: { fontSize: '11px', color: '#64748b' } },
            labels: { style: { fontSize: '10px' } }
        },
        yaxis: {
            min: minVal,
            max: Math.ceil(maxVal),
            tickAmount: isMini ? 3 : 5,
            labels: {
                formatter: v => needsDen ? Math.round(v) : `${Math.round(v)}%`,
                style: { fontSize: '10px' }
            }
        },
        annotations: {
            yaxis: [{
                y: target,
                borderColor: '#ef4444',
                borderWidth: 2,
                strokeDashArray: 5,
                label: {
                    text: `Target: ${target}${needsDen ? '%' : ''}`,
                    position: 'left',
                    offsetX: 10,
                    style: { color: '#fff', background: '#ef4444', fontSize: '10px', fontWeight: 'bold', padding: { left: 4, right: 4, top: 2, bottom: 2 } }
                }
            }]
        },
        tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const dayData = dailyData[dataPointIndex]
                if (dayData.score === null) {
                    return `<div class="p-2 bg-white border rounded shadow-sm text-muted small">
                        <b>Hari ${dataPointIndex + 1}</b><br>
                        Tidak ada data
                    </div>`
                }
                
                let detailHtml = ''
                if (needsDen) {
                    detailHtml = `
                        <div><span class="text-muted">Capaian:</span> <span class="fw-bold text-dark">${dayData.score}%</span></div>
                        <div><span class="text-muted">Numerator:</span> <span class="fw-bold text-primary">${dayData.num}</span></div>
                        <div><span class="text-muted">Denominator:</span> <span class="fw-bold text-success">${dayData.denum}</span></div>
                    `
                } else {
                    detailHtml = `
                        <div><span class="text-muted">Nilai:</span> <span class="fw-bold text-primary">${dayData.score}</span></div>
                    `
                }
                
                return `
                    <div class="p-3 bg-white border rounded shadow-sm small" style="font-family: Inter, sans-serif; line-height: 1.5; color: #1e293b;">
                        <div class="fw-bold mb-1 border-bottom pb-1 text-dark">Hari ${dayData.day} (${dayData.tanggal})</div>
                        ${detailHtml}
                        <div class="mt-1 pt-1 border-top text-muted" style="font-size: 9px;">
                            <i class="fas fa-user me-1"></i> ${dayData.nama_input}
                        </div>
                    </div>
                `
            }
        },
        grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
        legend: {
            show: isMini ? false : needsDen,
            position: 'top',
            horizontalAlign: 'right',
            fontSize: isMini ? '9px' : '11px',
            markers: { radius: 12 }
        }
    }

    const series = []
    if (needsDen) {
        series.push({
            name: 'Denominator',
            data: dailyData.map(d => d.denum)
        })
        series.push({
            name: 'Numerator',
            data: dailyData.map(d => d.num)
        })
        series.push({
            name: 'Capaian (%)',
            data: scoresSeries
        })
    } else {
        series.push({
            name: 'Nilai',
            data: scoresSeries
        })
    }

    return {
        ...ind,
        needsDenominator: needsDen,
        dailyData,
        totalNum,
        totalDenum,
        daysFilledCount,
        daysInMonth,
        monthlyAvg,
        isMet,
        series,
        chartOptions
    }
}

const fetchPdsaData = async () => {
    if (!selectedIndicator.value || !filters.unit || !analisaFilters.bulan) return
    
    pdsaLoading.value = true
    existingPdsa.value = null
    hasAnalisaForPdsa.value = false
    activeAnalisaIdForPdsa.value = null
    resetPdsaForm()

    try {
        // Find if Analisa exists in any month of the selected triwulan
        let months = []
        if (selectedTriwulan.value === '03') months = ['03', '02', '01']
        else if (selectedTriwulan.value === '06') months = ['06', '05', '04']
        else if (selectedTriwulan.value === '09') months = ['09', '08', '07']
        else if (selectedTriwulan.value === '12') months = ['12', '11', '10']
        
        let foundAnalisa = null
        
        for (const m of months) {
            const checkBulan = `${selectedYear.value}-${m}`
            const params = {
                dep_id: filters.unit,
                id_inmut: selectedIndicator.value.id_inmut,
                bulan: checkBulan
            }
            
            console.log('Checking analisa for:', checkBulan, params)
            const analisaRes = await api.getAnalisa(params)
            console.log('Response for', checkBulan, ':', analisaRes.data)
            
            const analisaList = analisaRes.data.data?.data || []
            
            if (analisaRes.data.success && analisaList.length > 0) {
                foundAnalisa = analisaList[0]
                console.log('Found analisa!', foundAnalisa)
                break // Stop when we find the most recent one in the triwulan
            }
        }
        
        if (foundAnalisa) {
            hasAnalisaForPdsa.value = true
            activeAnalisaIdForPdsa.value = foundAnalisa.id_analisa
            
            // Fetch PDSA based on id_analisa
            const pdsaRes = await api.getPdsa({ id_analisa: activeAnalisaIdForPdsa.value })
            
            if (pdsaRes.data.success && pdsaRes.data.data) {
                existingPdsa.value = pdsaRes.data.data
                Object.assign(pdsaForm, existingPdsa.value)
            }
        } else {
            hasAnalisaForPdsa.value = false
        }
    } catch (error) {
        console.error('Error fetching PDSA data:', error)
    } finally {
        pdsaLoading.value = false
    }
}

const savePdsa = async () => {
    if (isPdsaLocked.value) {
        toast.error('Anda tidak memiliki akses untuk mengisi atau mengubah PDSA.')
        return
    }

    if (!activeAnalisaIdForPdsa.value) {
        toast.warning('Data analisa tidak ditemukan untuk periode ini')
        return
    }

    pdsaSaving.value = true
    try {
        const payload = {
            ...pdsaForm,
            id_analisa: activeAnalisaIdForPdsa.value,
            dep_id: filters.unit,
            id_inmut: selectedIndicator.value.id_inmut
        }

        const res = await api.storePdsa(payload)
        
        if (res.data.success) {
            toast.success(res.data.message || 'PDSA berhasil disimpan')
            fetchPdsaData() // Reload
        } else {
            toast.error(res.data.message || 'Gagal menyimpan PDSA')
        }
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan PDSA')
    } finally {
        pdsaSaving.value = false
    }
}

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
        
        const userNik = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik
        const userDepNameOrId = authStore.user?.data?.detail?.departemen || 
                                authStore.user?.detail?.departemen || 
                                authStore.user?.dep_id
        
        // Check committee membership first so we know if the user is a committee member
        if (userNik) {
            const commRes = await committeeService.getByNik(userNik)
            if (commRes.data.success && commRes.data.data.length > 0) {
                userCommittees.value = commRes.data.data
                isCommitteeMember.value = true
            }
        }
        
        if (userDepNameOrId) {
            const isPharmacyUser = ['DPM1', 'FAR1', 'FAR2', 'FARMASI', 'FARMASI RAWAT JALAN', 'FARMASI RAWAT INAP'].includes(String(userDepNameOrId).toUpperCase().trim())
            
            if (isPharmacyUser && !isCommitteeMember.value) {
                // Filter dropdown to only show Outpatient and Inpatient Pharmacy (FAR1, FAR2)
                units.value = units.value.filter(u => ['FAR1', 'FAR2'].includes(u.dep_id))
                
                // Default unit selection: if logged in as FAR1 (Inap), select FAR1. Otherwise default to FAR2 (Rawat Jalan)
                if (userDepNameOrId === 'FAR1' || String(userDepNameOrId).toUpperCase().trim() === 'FARMASI RAWAT INAP') {
                    filters.unit = 'FAR1'
                } else {
                    filters.unit = 'FAR2'
                }
                
                // Allow them to switch between FAR1 and FAR2 (do not lock)
                isUnitLocked.value = false
                console.log('Pharmacy units (FAR1, FAR2) unlocked for pharmacy user')
            } else if (!isCommitteeMember.value) {
                const myUnit = units.value.find(u => u.dep_id === userDepNameOrId || u.nama_ruang === userDepNameOrId)
                
                if (myUnit) {
                    filters.unit = myUnit.dep_id
                    isUnitLocked.value = true
                    console.log('Unit locked to user department:', myUnit.nama_ruang)
                }
            } else {
                isUnitLocked.value = false
                const myUnit = units.value.find(u => u.dep_id === userDepNameOrId || u.nama_ruang === userDepNameOrId)
                if (myUnit) {
                    filters.unit = myUnit.dep_id
                }
            }
        }

        if (units.value.length > 0 && !filters.unit) {
            filters.unit = units.value[0].dep_id
        }
        
        if (filters.unit) {
            fetchIndicators()
        }
    } catch (error) {
        console.error('Error fetching units:', error)
    }
}

const fetchIndicators = async () => {
    if (!filters.unit) return

    loading.value = true
    try {
        await fetchMonthlyValidations()
        const params = {
            limit: 100,
            status: '1'
        }
        
        let masterRes;
        // Always use Master Ruang for both modes, as per user requirement
        // "isi Sesuai user ada di Komite mana, krna master indikator kan ada nilai dep_id disitu"
        params.dep_id = filters.unit
        masterRes = await api.getRuang(params)

        const realisasiRes = await api.getRealisasi({
            dep_id: filters.unit,
            tgl_transaksi: filters.tgl_transaksi
        })

        const rawItems = masterRes.data.data.data || masterRes.data.data || []
        const realisasiData = realisasiRes.data.data || []
        
        // Map realisasi by id_inmut for easy lookup
        const realisasiMap = new Map()
        realisasiData.forEach(item => {
            realisasiMap.set(item.id_inmut, item)
        })

        // Always filter by selected unit
        const filteredItems = rawItems.filter(item => item.dep_id === filters.unit)
        
        indicators.value = filteredItems.map(item => {
            const saved = realisasiMap.get(item.id_inmut)
            return {
                ...item,
                id_rekap: saved ? saved.id_rekap : null,
                numerator: saved ? saved.num : 0,
                denominator: saved ? saved.denum : 0,
                num_user: saved ? saved.num_user : 0,
                denum_user: saved ? saved.denum_user : 0,
                status_verifikasi: saved ? saved.status_verifikasi : 'pending',
                nik_input: saved ? saved.nik_input : null,
                nama_input: saved && saved.penginput ? saved.penginput.nama : null,
                tanggal_input: saved ? saved.tanggal_input : null,
                pic_verified_by: saved ? saved.pic_verified_by : null,
                pic_verified_at: saved ? saved.pic_verified_at : null,
                koor_verified_by: saved ? saved.koor_verified_by : null,
                koor_verified_at: saved ? saved.koor_verified_at : null,
                isSaving: false
            }
        })
        
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat indikator')
    } finally {
        loading.value = false
    }
}

const stripHtml = (html) => {
   if (!html) return ''
   const tmp = document.createElement("DIV")
   tmp.innerHTML = html
   return tmp.textContent || tmp.innerText || ""
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }
    return new Date(dateTimeString).toLocaleDateString('id-ID', options).replace(',', '')
}

const getRumusSymbol = (val) => {
    const map = { '1': '=', '2': '≤', '3': '<', '4': '≥', '5': '>' }
    return map[val] || val || ''
}

const needsDenominator = (item) => {
    // Logic to determine if denominator is needed. 
    // Usually all "persentase" or ratio indicators need it.
    // If satuan is '%', likely yes.
    return item.satuan === '%' || item.satuan === 'Persen' || item.rumus
}

const calculateScore = (item) => {
    if (!needsDenominator(item)) {
        return item.numerator
    }
    if (!item.denominator || item.denominator == 0) return 0
    return ((item.numerator / item.denominator) * 100).toFixed(2)
}

const getScoreColor = (score, item) => {
    // Simple logic: Green if meets standard, Red if not.
    // Standard parsing might be complex (e.g. "Top 10", "> 80").
    // We'll rely on simple comparison if standard is a number.
    const std = parseFloat(item.standar)
    if (isNaN(std)) return 'text-dark'
    
    // Check rumus
    const s = parseFloat(score)
    // 1: =, 2: <=, 3: <, 4: >=, 5: >
    let passed = false
    switch(item.rumus) {
        case '1': passed = s == std; break;
        case '2': passed = s <= std; break;
        case '3': passed = s < std; break;
        case '4': passed = s >= std; break;
        case '5': passed = s > std; break;
        default: passed = true;
    }
    return passed ? 'text-success' : 'text-danger'
}

const saveItem = async (item) => {
    item.isSaving = true
    try {
        const payload = {
            id_inmut: item.id_inmut,
            tgl_transaksi: filters.tgl_transaksi,
            dep_id: filters.unit,
            numerator: item.numerator,
            denominator: item.denominator,
            nilai: calculateScore(item)
        }
        await api.saveRealisasi(payload)
        toast.success(`Data ${item.nama_inmut} berhasil disimpan`)
        // Refresh indicator list to populate id_rekap, status_verifikasi, and validation buttons
        await fetchIndicators()
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan data')
    } finally {
        item.isSaving = false
    }
}

// === BULK MODE LOGIC ===
const calendarDays = computed(() => {
    if (!filters.tgl_transaksi) return []
    const date = new Date(filters.tgl_transaksi)
    const year = date.getFullYear()
    const month = date.getMonth() // 0-indexed
    
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    
    for (let d = 1; d <= daysInMonth; d++) {
        const currentDate = new Date(year, month, d)
        
        // Manual formatting to avoid timezone shifts affecting date string
        // Format: YYYY-MM-DD
        const mm = String(month + 1).padStart(2, '0')
        const dd = String(d).padStart(2, '0')
        const dateStr = `${year}-${mm}-${dd}`
        
        // Find existing data for this date
        // CRITICAL FIX: Parse ISO string to Local Date Object to handle Timezone shift (UTC 17:00 -> Local 00:00)
        const existing = calendarData.value.find(c => {
            if (!c.tanggal_inmut) return false
            const d = new Date(c.tanggal_inmut)
            const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            return dStr === dateStr
        })

        // Debug specific date
        if (dateStr === '2026-01-14') {
             console.log(`[Mapping 14th] Target: ${dateStr}, Found:`, existing)
        }
        
        days.push({
            date: dateStr,
            day: d,
            dayName: currentDate.toLocaleDateString('id-ID', { weekday: 'short' }),
            isSunday: currentDate.getDay() === 0,
            numerator: existing ? existing.num : 0,
            denominator: existing ? existing.denum : 0,
            hasData: !!existing,
            isTouched: !!existing, // Mark as touched if data exists from DB
            status_verifikasi: existing ? (existing.status_verifikasi || 'pending') : 'pending',
            nik_input: existing ? existing.nik_input : null,
            nama_input: existing && existing.penginput ? existing.penginput.nama : null,
            tanggal_input: existing ? existing.tanggal_input : null
        })
    }
    return days
})

const fetchMonthlyData = async () => {
    if (!filters.unit || !selectedIndicator.value || viewMode.value !== 'monthly') return
    
    loading.value = true
    try {
        await fetchMonthlyValidations()
        const date = new Date(filters.tgl_transaksi)
        const params = {
            dep_id: filters.unit,
            bulan: date.getMonth() + 1,
            tahun: date.getFullYear(),
            id_inmut: selectedIndicator.value.id_inmut
        }
        
        const response = await api.getRealisasi(params)
        calendarData.value = response.data.data || []
        
        // Check specifically for date 14 if sticking point
        const date14 = calendarData.value.find(c => c.tanggal_inmut && c.tanggal_inmut.includes('2026-01-14'));
        console.log('Debug 14th Record:', date14);

    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data bulanan')
    } finally {
        loading.value = false
    }
}


const saveBulk = async () => {
    if (!selectedIndicator.value) return
    
    bulkSaving.value = true
    try {
        // Get current date string for comparison (YYYY-MM-DD)
        const today = new Date().toISOString().slice(0, 10)
        
        // Map all days, but only those up to today and not locked for the user
        const payload = calendarDays.value
            .filter(day => day.date <= today && !isRowLockedForUser(day))
            .map(day => ({
                id_inmut: selectedIndicator.value.id_inmut,
                tgl_transaksi: day.date,
                dep_id: filters.unit,
                numerator: day.numerator,
                denominator: day.denominator
            }))

        if (payload.length === 0) {
            toast.warning('Tidak ada data yang dapat disimpan untuk periode ini.')
            return
        }

        // Debug: Log payload to see if all inputs are captured
        console.log('Sending Bulk Payload:', payload)


        await api.saveRealisasiBulk({ data: payload })
        toast.success('Data bulanan berhasil disimpan')
        await fetchMonthlyData() // Refresh
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan data bulk')
    } finally {
        bulkSaving.value = false
    }
}



// === ANALISA MODE FUNCTIONS ===
const fetchAnalisaData = async () => {
    if (!analisaFilters.bulan || !filters.unit) return
    
    const isSpecialized = !!selectedIndicator.value
    
    // Clear previous data while loading to avoid mismatch/stale data
    resetAnalisaForm()
    isEditingAnalisa.value = false
    showAnalisaForm.value = false // Hide form on indicator change
    selectedIndicatorChartData.value = null
    monthlyStats.value = {
        totalNum: 0,
        totalDenum: 0,
        score: 0,
        isComplete: false,
        missingDays: [],
        fillPercentage: 0 // Track data entry progress
    }
    existingAnalisa.value = []
    
    loading.value = true
    try {
        const [year, month] = analisaFilters.bulan.split('-')
        const y = parseInt(year)
        const m = parseInt(month)
        const daysInMonth = new Date(y, m, 0).getDate()
        
        // Fetch existing analisa (either filtered by id_inmut or all)
        const analisaParams = { dep_id: filters.unit, bulan: analisaFilters.bulan }
        if (isSpecialized) analisaParams.id_inmut = selectedIndicator.value.id_inmut
        const analisaRes = await api.getAnalisa(analisaParams)
        existingAnalisa.value = analisaRes.data.data.data || []

        if (isSpecialized) {
            // Fetch monthly data for a SPECIFIC indicator
            const realisasiRes = await api.getRealisasi({ dep_id: filters.unit, bulan: m, tahun: y, id_inmut: selectedIndicator.value.id_inmut })
            const currentIndRealisasi = (realisasiRes.data.data || []).filter(r => Number(r.id_inmut) === Number(selectedIndicator.value.id_inmut))
            
            let totalNum = 0, totalDenum = 0
            currentIndRealisasi.forEach(r => {
                totalNum += parseInt(r.num) || 0
                totalDenum += parseInt(r.denum) || 0
            })
            
            const filledDays = new Set(currentIndRealisasi.map(r => {
                const dateOnly = r.tanggal_inmut.split(' ')[0]
                const parts = dateOnly.split('-')
                return parseInt(parts[2], 10)
            }))
            const missingDays = []
            for (let d = 1; d <= daysInMonth; d++) if (!filledDays.has(d)) missingDays.push(d)
            
            monthlyStats.value = {
                totalNum, totalDenum,
                score: totalDenum > 0 ? ((totalNum / totalDenum) * 100).toFixed(2) : 0,
                isComplete: missingDays.length === 0,
                missingDays,
                fillPercentage: Math.round(((daysInMonth - missingDays.length) / daysInMonth) * 100)
            }

            // Build chart data for the selected indicator
            selectedIndicatorChartData.value = buildChartDataForIndicator(
                selectedIndicator.value,
                currentIndRealisasi,
                daysInMonth,
                analisaFilters.bulan
            )

            // Auto-populate form
            if (existingAnalisa.value.length > 0) {
                const data = existingAnalisa.value[0]
                analisaForm.id_analisa = data.id_analisa
                analisaForm.analisa = data.analisa
                analisaForm.tindak_lanjut = data.tindak_lanjut
                isEditingAnalisa.value = true
                showAnalisaForm.value = canVerifyAsKoor.value
            }
        } else {
            // Fetch ALL realisasi for the unit to calculate progress for ALL indicators
            const allRealisasiRes = await api.getRealisasi({ dep_id: filters.unit, bulan: m, tahun: y })
            const allRealisasi = allRealisasiRes.data.data || []
            
            // Group realisasi by id_inmut
            const groupedRealisasi = {}
            allRealisasi.forEach(r => {
                if (!groupedRealisasi[r.id_inmut]) groupedRealisasi[r.id_inmut] = []
                groupedRealisasi[r.id_inmut].push(r)
            })

            // Map indicators to their current stats
            allIndicatorStats.value = indicators.value.map(ind => {
                const indRealisasi = groupedRealisasi[ind.id_inmut] || []
                const filledDays = new Set(indRealisasi.map(r => {
                    if (!r.tanggal_inmut) return 0
                    const dateOnly = r.tanggal_inmut.split(' ')[0]
                    const parts = dateOnly.split('-')
                    return parseInt(parts[2], 10)
                }))
                const filledCount = filledDays.size
                const progress = Math.round((filledCount / daysInMonth) * 100)
                const isComplete = filledCount === daysInMonth
                
                // Calculate current score
                let tNum = 0, tDenum = 0
                indRealisasi.forEach(r => { tNum += parseInt(r.num) || 0; tDenum += parseInt(r.denum) || 0 })
                const score = tDenum > 0 ? ((tNum / tDenum) * 100).toFixed(2) : 0

                // Check if already analyzed
                const analyzis = existingAnalisa.value.find(ans => ans.id_inmut === ind.id_inmut)

                const chartData = buildChartDataForIndicator(
                    ind,
                    indRealisasi,
                    daysInMonth,
                    analisaFilters.bulan,
                    true // isMini
                )

                return {
                    ...ind,
                    progress,
                    isComplete,
                    score,
                    isAnalyzed: !!analyzis,
                    analysisId: analyzis?.id_analisa,
                    hasFeedback: !!analyzis?.feedback,
                    chartOptions: chartData.chartOptions,
                    series: chartData.series
                }
            })
        }
        
    } catch (error) {
        console.error(error)
        toast.error('Gagal memuat data analisa')
    } finally {
        loading.value = false
    }
}

const saveAnalisa = async () => {
    if (!analisaForm.analisa || !analisaForm.tindak_lanjut) {
        toast.warning('Analisa dan Tindak Lanjut harus diisi')
        return
    }
    
    analisaSaving.value = true
    try {
        const payload = {
            id_inmut: selectedIndicator.value.id_inmut,
            analisa: analisaForm.analisa,
            tindak_lanjut: analisaForm.tindak_lanjut,
            jml_num: monthlyStats.value.totalNum,
            jml_denum: monthlyStats.value.totalDenum,
            bulan: analisaFilters.bulan
        }
        
        if (analisaForm.id_analisa) {
            // Update
            await api.updateAnalisa(analisaForm.id_analisa, payload)
            toast.success('Analisa berhasil diperbarui')
        } else {
            // Create
            const response = await api.storeAnalisa(payload)
            toast.success('Analisa berhasil disimpan')
        }

        // Notification Integration (Now for both Create and Update)
        try {
            const unitName = getUnitName()
            const indicatorName = selectedIndicator.value.nama_inmut
            const monthYear = formatMonthYear(analisaFilters.bulan)
            const actionText = analisaForm.id_analisa ? "memperbarui data analisa" : "menginput analisa baru";
            
            // Format updated for better mobile display (shortened lines and simpler title)
            const message = `*🔔 NOTIFIKASI ANALISA MUTU*\n` +
                            `_______________________________\n\n` +
                            `Unit *${unitName}* telah *${actionText}*.\n\n` +
                            `*📊 INDIKATOR:*\n` +
                            `_"${indicatorName}"_\n\n` +
                            `*📅 PERIODE:*\n` +
                            `*${monthYear}*\n\n` +
                            `_______________________________\n` +
                            `Mohon segera ditindaklanjuti untuk *Supervisi & Rekomendasi* melalui menu:\n` +
                            `*Monitoring Indikator Mutu -> Tab Analisa Data*\n\n` +
                            `_Sistem Monitoring Indikator Mutu_`
            
            await api.sendAnalisaNotification({
                message: message,
                type: 'analisa_mutu'
            })
            console.log('WhatsApp notification sent')
        } catch (notifError) {
            console.error('Failed to send WhatsApp notification:', notifError)
        }
        
        resetAnalisaForm()
        showAnalisaForm.value = false // Close form after success
        fetchAnalisaData()
    } catch (error) {
        console.error(error)
        toast.error('Gagal menyimpan analisa')
    } finally {
        analisaSaving.value = false
    }
}

const editAnalisa = async (item) => {
    // Set form data
    analisaForm.id_analisa = item.id_analisa
    analisaForm.analisa = item.analisa
    analisaForm.tindak_lanjut = item.tindak_lanjut
    
    // Extract year-month from item's tanggal_awal (format: YYYY-MM-DD or ISO timestamp)
    // Parse the date and convert to local timezone
    const dateObj = new Date(item.tanggal_awal)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const itemBulan = `${year}-${month}`
    
    // Update selected indicator to match the item
    // First, try to find from existing indicators list
    const matchingIndicator = indicators.value.find(ind => ind.id_inmut === item.id_inmut)
    
    if (matchingIndicator) {
        selectedIndicator.value = matchingIndicator
    } else if (item.indikator) {
        // If not found in list, use the indicator data from item
        selectedIndicator.value = {
            id_inmut: item.id_inmut,
            nama_inmut: item.nama_inmut || item.indikator.nama_inmut,
            dep_id: filters.unit,
            standar: item.indikator.standar,
            rumus: item.indikator.rumus,
            satuan: item.indikator.satuan
        }
    } else {
        // Fallback: create minimal indicator object
        selectedIndicator.value = {
            id_inmut: item.id_inmut,
            nama_inmut: item.nama_inmut,
            dep_id: filters.unit
        }
    }
    
    // Use item's data directly instead of re-fetching
    monthlyStats.value = {
        totalNum: item.jml_num,
        totalDenum: item.jml_denum,
        score: parseFloat(item.jumlah || 0),
        isComplete: true, // Assume complete since it's already saved
        missingDays: []
    }
    
    // Set flag and update filter in nextTick to prevent race condition
    isEditingAnalisa.value = true
    showAnalisaForm.value = true // Ensure form opens when editing
    await nextTick()
    analisaFilters.bulan = itemBulan
    
    // Scroll to details anchor
    nextTick(() => {
        const el = document.getElementById('details-anchor')
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    })
}

const deleteAnalisaItem = async (id) => {
    if (!confirm('Yakin ingin menghapus analisa ini?')) return
    
    try {
        await api.deleteAnalisa(id)
        toast.success('Analisa berhasil dihapus')
        resetAnalisaForm()
        showAnalisaForm.value = false
        fetchAnalisaData()
    } catch (error) {
        console.error(error)
        toast.error('Gagal menghapus analisa')
    }
}

const resetAnalisaForm = () => {
    analisaForm.id_analisa = null
    analisaForm.analisa = ''
    analisaForm.tindak_lanjut = ''
}

const getIndonesianMonthName = (monthStr) => {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    const idx = parseInt(monthStr) - 1
    return months[idx] || ''
}

const calculateCapaian = (num, denum) => {
    if (!denum || denum === 0) return 0
    return ((num / denum) * 100).toFixed(2)
}

const getTargetDisplay = (indicator) => {
    if (!indicator) return '-'
    const symbol = getRumusSymbol(indicator.rumus)
    return `${symbol} ${indicator.standar} ${indicator.satuan || ''}`
}

const getTargetDisplayFromItem = (item) => {
    // Try to get from item.indikator.master_utama first (like in monitoring)
    const ind = item?.indikator
    if (!ind) return getTargetDisplay(selectedIndicator.value)
    
    const utama = ind.master_utama || ind.masterUtama
    const std = (utama && utama.standar) ? utama.standar : ind.standar
    const rumus = (utama && utama.rumus) ? utama.rumus : ind.rumus
    const satuan = (utama && utama.satuan) ? utama.satuan : ind.satuan
    
    return `${getRumusSymbol(rumus)} ${std} ${satuan || ''}`
}

const getUnitName = () => {
    if (!filters.unit || !units.value.length) return '-'
    const unit = units.value.find(u => u.dep_id === filters.unit)
    return unit ? unit.nama_ruang : '-'
}

const isTargetMet = (item) => {
    if (!item) return false
    
    let target, rumus, score
    
    // Check if item has indicator data (either direct or nested)
    let ind = item.indikator || item
    
    // Fallback to selectedIndicator if target info is not present directly in the item (e.g. monthlyStats)
    if (ind.standar === undefined && selectedIndicator.value) {
        ind = selectedIndicator.value
    }
    
    const utama = ind.master_utama || ind.masterUtama
    
    target = parseFloat((utama && utama.standar) ? utama.standar : ind.standar)
    rumus = String((utama && utama.rumus) ? utama.rumus : ind.rumus)
    
    // Get score (from item.score, item.jumlah, or calculate it)
    if (item.score !== undefined) {
        score = parseFloat(item.score)
    } else if (item.jumlah !== undefined) {
        score = parseFloat(item.jumlah)
    } else {
        const num = item.jml_num || item.totalNum || 0
        const denum = item.jml_denum || item.totalDenum || 0
        score = denum > 0 ? (num / denum) * 100 : 0
    }
    
    if (isNaN(target) || isNaN(score)) return false
    
    // 1: =, 2: ≤, 3: <, 4: ≥, 5: >
    switch(rumus) {
        case '1': return Math.abs(score - target) < 0.01
        case '2': return score <= target
        case '3': return score < target
        case '4': return score >= target
        case '5': return score > target
        default: return false
    }
}

const formatMonthYear = (monthStr) => {
    if (!monthStr) return '-'
    const [year, month] = monthStr.split('-')
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${monthNames[parseInt(month) - 1]} ${year}`
}

const formatDateFull = formatMonthYear

const handleModeChange = () => {
    if (inputMode.value === 'unit') {
        const userDepNameOrId = authStore.user?.data?.detail?.departemen || 
                                authStore.user?.detail?.departemen || 
                                authStore.user?.dep_id
        
        const isPharmacyUser = ['DPM1', 'FAR1', 'FAR2', 'FARMASI', 'FARMASI RAWAT JALAN', 'FARMASI RAWAT INAP'].includes(String(userDepNameOrId).toUpperCase().trim())
        
        if (isPharmacyUser && !isCommitteeMember.value) {
            // Keep the selected pharmacy unit if already selected (FAR1 or FAR2), otherwise default to FAR2
            if (!['FAR1', 'FAR2'].includes(filters.unit)) {
                filters.unit = 'FAR2'
            }
        } else {
            const myUnit = units.value.find(u => u.dep_id === userDepNameOrId || u.nama_ruang === userDepNameOrId)
            if (myUnit) filters.unit = myUnit.dep_id
        }
    } else {
        // Switch to the first committee's department
        if (userCommittees.value.length > 0) {
            const commDepId = userCommittees.value[0].komite?.dep_id
            if (commDepId) {
                filters.unit = commDepId
            }
        }
    }
    fetchIndicators()
}

// Unified Watchers
watch(() => selectedIndicator.value, () => {
    if (viewMode.value === 'monthly') fetchMonthlyData()
    if (viewMode.value === 'analisa') {
        fetchAnalisaData()
        if (selectedIndicator.value) {
            // Small delay to ensure Vue transition and DOM heights are fully settled
            setTimeout(() => {
                const el = document.getElementById('details-anchor')
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            }, 250)
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }
})

watch(() => viewMode.value, async (newMode) => {
    if (newMode === 'monthly') fetchMonthlyData()
    if (newMode === 'analisa') fetchAnalisaData()
})

// Re-fetch data if filters change
watch(() => filters.tgl_transaksi, () => {
    if (viewMode.value === 'monthly') fetchMonthlyData()
})

// Watcher for analisaFilters.bulan - only fetch if not editing
watch(() => analisaFilters.bulan, () => {
    if (!isEditingAnalisa.value) {
        fetchAnalisaData()
    } else {
        // Reset flag after skip
        isEditingAnalisa.value = false
    }
})

// === REGISTER EXPORT CODE ===
const handleTabExport = ({ format, indicatorId }) => {
    exportRegisterBulanan(format, indicatorId)
}

const formatDateIndoFull = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const formatDateIndoShort = (dateStr) => {
    if (!dateStr) return '-'
    const parts = dateStr.slice(0, 10).split('-')
    if (parts.length !== 3) return dateStr
    return `${parts[2]}-${parts[1]}-${parts[0]}`
}

const getValDisplay = (val, originalVal) => {
    const finalVal = val !== null && val !== undefined ? val : '-'
    const origVal = originalVal !== null && originalVal !== undefined ? originalVal : '-'
    
    if (finalVal === '-' && origVal === '-') return '-'
    
    return `${finalVal} (Pra: ${origVal})`
}

const generateDailyChartImage = (indicator, dailyData, targetValue) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1800
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    
    // Fill background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const needsDen = needsDenominator(indicator)
    const target = parseFloat(targetValue) || 0
    
    // Margin and drawing dimensions
    const paddingLeft = 90
    const paddingRight = 50
    const paddingTop = 110
    const paddingBottom = 70
    const plotWidth = canvas.width - paddingLeft - paddingRight
    const plotHeight = canvas.height - paddingTop - paddingBottom
    
    // Find min/max values
    let maxVal = 0
    dailyData.forEach(d => {
        if (needsDen) {
            if (d.num !== null) maxVal = Math.max(maxVal, d.num)
            if (d.denum !== null) maxVal = Math.max(maxVal, d.denum)
            if (d.score !== null) maxVal = Math.max(maxVal, d.score)
        } else {
            if (d.score !== null) maxVal = Math.max(maxVal, d.score)
        }
    })
    
    if (needsDen) {
        maxVal = Math.max(100, maxVal)
    } else {
        maxVal = Math.max(target * 1.2, maxVal, 10)
    }
    
    // Y-axis scale helper
    const getPlotY = (val) => {
        if (val === null || val === undefined) return null
        return paddingTop + plotHeight - ((val / maxVal) * plotHeight)
    }
    
    // X-axis scale helper (days 1 to daysInMonth)
    const daysCount = dailyData.length
    const getPlotX = (index) => {
        return paddingLeft + (index / (daysCount - 1)) * plotWidth
    }
    
    // Draw Grid Lines (Y-Axis ticks)
    const ticksCount = 5
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1.5
    ctx.fillStyle = '#475569'
    ctx.font = 'bold 18px Inter, Arial, sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    
    for (let i = 0; i <= ticksCount; i++) {
        const val = (i / ticksCount) * maxVal
        const y = getPlotY(val)
        
        // Grid line
        ctx.beginPath()
        ctx.moveTo(paddingLeft, y)
        ctx.lineTo(canvas.width - paddingRight, y)
        ctx.stroke()
        
        // Label
        const labelText = needsDen ? Math.round(val) : `${Math.round(val)}%`
        ctx.fillText(labelText, paddingLeft - 15, y)
    }
    
    // Draw X-Axis Labels (Day 1 to daysCount)
    ctx.fillStyle = '#475569'
    ctx.font = 'bold 18px Inter, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let i = 0; i < daysCount; i++) {
        if (i % 2 === 0 || i === daysCount - 1) {
            const x = getPlotX(i)
            ctx.fillText(String(i + 1), x, paddingTop + plotHeight + 12)
        }
    }
    
    // Draw Standard/Target line (Red dotted line)
    if (target > 0) {
        const targetY = getPlotY(target)
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 3
        ctx.setLineDash([8, 8])
        ctx.beginPath()
        ctx.moveTo(paddingLeft, targetY)
        ctx.lineTo(canvas.width - paddingRight, targetY)
        ctx.stroke()
        ctx.setLineDash([])
        
        // Label for Target
        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 18px Inter, Arial, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.fillText(`Target: ${target}${needsDen ? '%' : ''}`, paddingLeft + 15, targetY - 6)
    }
    
    // Helper function to draw series
    const drawSeriesLine = (ctx, data, getX, getY, valAccessor, color, lineWidth, dash = []) => {
        const points = []
        for (let i = 0; i < data.length; i++) {
            const val = valAccessor(data[i])
            if (val !== null && val !== undefined) {
                points.push({ x: getX(i), y: getY(val) })
            }
        }
        
        if (points.length === 0) return
        
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        if (dash.length > 0) ctx.setLineDash(dash)
        
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.stroke()
        ctx.setLineDash([])
        
        ctx.fillStyle = color
        points.forEach(pt => {
            ctx.beginPath()
            ctx.arc(pt.x, pt.y, lineWidth + 2, 0, 2 * Math.PI)
            ctx.fill()
        })
    }

    // Draw the series data lines
    if (needsDen) {
        drawSeriesLine(ctx, dailyData, getPlotX, getPlotY, d => d.denum, '#3b82f6', 3, [8, 8])
        drawSeriesLine(ctx, dailyData, getPlotX, getPlotY, d => d.num, '#10b981', 3, [4, 4])
        drawSeriesLine(ctx, dailyData, getPlotX, getPlotY, d => d.score, '#6366f1', 6, [])
    } else {
        drawSeriesLine(ctx, dailyData, getPlotX, getPlotY, d => d.score, '#3b82f6', 6, [])
    }
    
    // Draw Legend
    ctx.font = 'bold 20px Inter, Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    
    let legendX = paddingLeft
    const drawLegendItem = (label, color, dash = []) => {
        ctx.strokeStyle = color
        ctx.lineWidth = 4
        if (dash.length > 0) ctx.setLineDash(dash)
        ctx.beginPath()
        ctx.moveTo(legendX, 50)
        ctx.lineTo(legendX + 25, 50)
        ctx.stroke()
        ctx.setLineDash([])
        
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(legendX + 12.5, 50, 6, 0, 2 * Math.PI)
        ctx.fill()
        
        ctx.fillStyle = '#1e293b'
        ctx.fillText(label, legendX + 35, 50)
        legendX += ctx.measureText(label).width + 75
    }
    
    if (needsDen) {
        drawLegendItem('Denominator', '#3b82f6', [8, 8])
        drawLegendItem('Numerator', '#10b981', [4, 4])
        drawLegendItem('Capaian (%)', '#6366f1', [])
    } else {
        drawLegendItem('Capaian', '#3b82f6', [])
    }
    
    return canvas.toDataURL('image/png')
}

const calculateAgreementRateForExport = (indicator, realisasiList, validation) => {
    const indRealisasi = realisasiList.filter(r => r.id_inmut === indicator.id_inmut)
    const numAwal = indRealisasi.reduce((acc, r) => acc + (r.num || 0), 0)
    const denumAwal = indRealisasi.reduce((acc, r) => acc + (r.denum || 0), 0)

    const numValidasi = validation ? (validation.num_validasi !== null && validation.num_validasi !== undefined ? validation.num_validasi : numAwal) : numAwal
    const denumValidasi = validation ? (validation.denum_validasi !== null && validation.denum_validasi !== undefined ? validation.denum_validasi : denumAwal) : denumAwal

    let accuracyNum = 100
    const maxNum = Math.max(numAwal, numValidasi)
    if (maxNum > 0) {
        accuracyNum = (1 - Math.abs(numAwal - numValidasi) / maxNum) * 100
    }

    let accuracyDenum = 100
    const maxDenum = Math.max(denumAwal, denumValidasi)
    if (maxDenum > 0) {
        accuracyDenum = (1 - Math.abs(denumAwal - denumValidasi) / maxDenum) * 100
    }

    const hasDenum = needsDenominator(indicator)
    if (!hasDenum) {
        accuracyDenum = 100
    }

    const agreementRate = (accuracyNum + accuracyDenum) / 2
    return Math.round(agreementRate * 100) / 100
}

const exportRegisterBulanan = async (format, indicatorId = null) => {
    if (!filters.unit) {
        toast.warning('Silakan pilih unit terlebih dahulu')
        return
    }
    loading.value = true
    try {
        const dateStr = monthlyFilterDate.value || filters.tgl_transaksi.slice(0, 7)
        const [year, month] = dateStr.split('-').map(x => parseInt(x))
        
        // Fetch all realisasi records for this month and unit
        const realisasiParams = {
            dep_id: filters.unit,
            bulan: month,
            tahun: year
        }
        if (indicatorId) {
            realisasiParams.id_inmut = indicatorId
        }
        const response = await api.getRealisasi(realisasiParams)
        const realisasiList = response.data.data || []

        // Fetch all analysis records for this month and unit
        let analisaListAll = []
        try {
            const getAnalisaRes = await api.getAnalisa({
                dep_id: filters.unit,
                bulan: dateStr,
                limit: 100
            })
            analisaListAll = getAnalisaRes.data.success ? (getAnalisaRes.data.data?.data || getAnalisaRes.data.data || []) : []
        } catch (e) {
            console.error('Failed to fetch analysis records:', e)
        }

        // Fetch monthly validation info
        let validationsList = []
        try {
            const valRes = await api.getValidasiBulanan({
                dep_id: filters.unit,
                bulan: month,
                tahun: year
            })
            if (valRes.data && valRes.data.success) {
                validationsList = valRes.data.data || []
            }
        } catch (e) {
            console.error('Failed to fetch monthly validation:', e)
        }

        if (realisasiList.length === 0) {
            toast.warning('Tidak ada data entrian harian untuk periode ini.')
            loading.value = false
            return
        }

        const daysInMonth = new Date(year, month, 0).getDate()
        const unitName = activeUnitInfo.value?.nama_ruang || filters.unit

        const targetIndicators = indicatorId
            ? indicators.value.filter(ind => Number(ind.id_inmut) === Number(indicatorId))
            : indicators.value

        if (format === 'excel') {
            const wb = XLSX.utils.book_new()
            
            for (const indicator of targetIndicators) {
                const indRealisasi = realisasiList.filter(r => r.id_inmut === indicator.id_inmut)
                const validation = validationsList.find(v => Number(v.id_inmut) === Number(indicator.id_inmut))
                const isVerified = validation && validation.status === 'verified'
                
                const validatorName = validation ? (validation.validator_nama || validation.verified_by || '-') : '-'
                const verifiedAt = validation && validation.verified_at ? formatDateTime(validation.verified_at) : '-'
                const verifiedBy = validation ? validation.verified_by : null

                const wsData = [
                    ['DATA INPUT HARIAN INDIKATOR MUTU'],
                    [`Unit: ${unitName} | Periode: ${formatMonthYear(dateStr)}`],
                    [`Indikator: ${indicator.nama_inmut}`]
                ]
                if (isVerified) {
                    const arVal = calculateAgreementRateForExport(indicator, realisasiList, validation)
                    wsData.push([`Agreement Rate: ${arVal}% ${arVal >= 90 ? '(VALID)' : '(TIDAK VALID)'}`])
                }
                wsData.push([]) // spacer
                wsData.push([
                    'No', 'Tanggal', 
                    'Num (Sebelum Validasi)', 'Denum (Sebelum Validasi)', 'Hasil (Sebelum Validasi)', 
                    'Num (Setelah Validasi)', 'Denum (Setelah Validasi)', 'Hasil (Setelah Validasi)', 
                    'Penginput', 'Tgl/Jam Input', 'TTE Penginput', 
                    'Verifikator Koor', 'Tgl/Jam Verif Koor', 'TTE Koor'
                ])

                for (let d = 1; d <= daysInMonth; d++) {
                    const targetDateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
                    const r = indRealisasi.find(item => item.tanggal_inmut && item.tanggal_inmut.slice(0, 10) === targetDateStr)
                    
                    if (r) {
                        const numStr = r.num !== null && r.num !== undefined ? r.num : '-'
                        const denumStr = needsDenominator(indicator) ? (r.denum !== null && r.denum !== undefined ? r.denum : '-') : '-'
                        
                        let scoreVal = '-'
                        if (needsDenominator(indicator)) {
                            if (r.denum > 0) {
                                scoreVal = `${Math.round((r.num / r.denum) * 100 * 100) / 100}%`
                            }
                        } else if (r.num !== null && r.num !== undefined) {
                            scoreVal = `${r.num}`
                        }

                        const tteInput = r.nik_input ? `TTE-ELEKTRONIK-PENGINPUT-${r.nik_input}` : '-'
                        const tteKoor = isVerified && verifiedBy ? `TTE-ELEKTRONIK-KOOR-${verifiedBy}` : '-'

                        wsData.push([
                            d,
                            formatDateIndoShort(targetDateStr),
                            numStr,
                            denumStr,
                            scoreVal,
                            numStr,
                            denumStr,
                            scoreVal,
                            r.penginput?.nama || r.nik_input || '-',
                            r.tanggal_input ? formatDateTime(r.tanggal_input) : '-',
                            tteInput,
                            isVerified ? validatorName : '-',
                            isVerified ? verifiedAt : '-',
                            tteKoor
                        ])
                    } else {
                        wsData.push([
                            d,
                            formatDateIndoShort(targetDateStr),
                            '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'
                        ])
                    }
                }

                const ws = XLSX.utils.aoa_to_sheet(wsData)
                // Limit sheet name to 30 characters
                const sheetName = indicator.nama_inmut.replace(/[\[\]\*\?:\/\\]/g, '').slice(0, 30)
                XLSX.utils.book_append_sheet(wb, ws, sheetName)
            }
            
            const filename = indicatorId 
                ? `Data_Input_Harian_${unitName.replace(/\s+/g, '_')}_${dateStr}_${indicatorId}.xlsx`
                : `Data_Input_Harian_${unitName.replace(/\s+/g, '_')}_${dateStr}.xlsx`
            XLSX.writeFile(wb, filename)
            toast.success('Data Input Harian Excel berhasil diunduh')

        } else if (format === 'pdf') {
            const doc = new jsPDF('p', 'mm', 'a4')
            const headerImg = await loadImage(pdfHeader)
            const footerImg = await loadImage(pdfFooter)
            
            let firstPage = true

            for (const indicator of targetIndicators) {
                if (!firstPage) {
                    doc.addPage()
                }
                firstPage = false

                const indRealisasi = realisasiList.filter(r => r.id_inmut === indicator.id_inmut)
                const validation = validationsList.find(v => Number(v.id_inmut) === Number(indicator.id_inmut))
                const isVerified = validation && validation.status === 'verified'
                
                const validatorName = validation ? (validation.validator_nama || validation.verified_by || '-') : '-'
                const verifiedAt = validation && validation.verified_at ? formatDateTime(validation.verified_at) : '-'
                const verifiedBy = validation ? validation.verified_by : null

                // Pre-generate QR codes for this indicator's daily logs
                const qrCache = {}
                for (let d = 1; d <= daysInMonth; d++) {
                    const targetDateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
                    const r = indRealisasi.find(item => item.tanggal_inmut && item.tanggal_inmut.slice(0, 10) === targetDateStr)
                    
                    if (r) {
                        qrCache[d] = {}
                        if (r.nik_input) {
                            const name = r.penginput?.nama || r.nik_input
                            const txt = `TTE Penginput\nNama: ${name}\nNIK: ${r.nik_input}\nTanggal: ${formatDateTime(r.tanggal_input)}`
                            qrCache[d].inputQR = await generateQRCode(txt)
                        }
                        if (isVerified && verifiedBy) {
                            const txt = `TTE Koor Verifikator\nNama: ${validatorName}\nNIK: ${verifiedBy}\nTanggal: ${verifiedAt}`
                            qrCache[d].koorQR = await generateQRCode(txt)
                        }
                    }
                }

                // Title Section
                doc.setFont('Helvetica', 'bold')
                doc.setFontSize(10)
                doc.setTextColor(0, 0, 0)
                doc.text('DATA INPUT HARIAN INDIKATOR MUTU', 105, 36, { align: 'center' })
                
                doc.setFontSize(8.5)
                doc.text(`Indikator : ${indicator.nama_inmut}`, 15, 44)
                doc.setFont('Helvetica', 'normal')
                doc.text(`Unit Kerja: ${unitName}`, 15, 49)
                doc.text(`Periode   : ${formatMonthYear(dateStr)}`, 15, 54)
                
                let tableStartY = 58
                if (isVerified) {
                    const arVal = calculateAgreementRateForExport(indicator, realisasiList, validation)
                    doc.setFont('Helvetica', 'bold')
                    if (arVal >= 90) {
                        doc.setTextColor(5, 150, 105) // Green
                    } else {
                        doc.setTextColor(220, 38, 38) // Red
                    }
                    doc.text(`Agreement Rate : ${arVal}% ${arVal >= 90 ? '(VALID)' : '(TIDAK VALID)'}`, 15, 59)
                    doc.setTextColor(0, 0, 0) // Reset to black
                    doc.setFont('Helvetica', 'normal')
                    tableStartY = 64
                }

                const tableData = []
                for (let d = 1; d <= daysInMonth; d++) {
                    const targetDateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
                    const r = indRealisasi.find(item => item.tanggal_inmut && item.tanggal_inmut.slice(0, 10) === targetDateStr)

                    if (r) {
                        const numStr = r.num !== null && r.num !== undefined ? r.num : '-'
                        const denumStr = needsDenominator(indicator) ? (r.denum !== null && r.denum !== undefined ? r.denum : '-') : '-'
                        
                        let scoreVal = '-'
                        if (needsDenominator(indicator)) {
                            if (r.denum > 0) {
                                scoreVal = `${Math.round((r.num / r.denum) * 100 * 100) / 100}%`
                            }
                        } else if (r.num !== null && r.num !== undefined) {
                            scoreVal = `${r.num}`
                        }

                        const inputName = r.penginput?.nama || r.nik_input || '-'
                        const inputTime = r.tanggal_input ? formatDateTime(r.tanggal_input).slice(11) : '-'
                        const inputDate = r.tanggal_input ? formatDateTime(r.tanggal_input).slice(0, 10) : '-'
                        const inputText = r.nik_input ? `${inputName}\nNIK: ${r.nik_input}\n${inputDate} ${inputTime}` : '-'

                        const koorTextStr = isVerified && verifiedBy ? `${validatorName}\nNIK: ${verifiedBy}\n${verifiedAt}` : '-'

                        tableData.push([
                            d,
                            formatDateIndoShort(targetDateStr),
                            numStr,
                            denumStr,
                            scoreVal,
                            numStr,
                            denumStr,
                            scoreVal,
                            inputText,
                            koorTextStr
                        ])
                    } else {
                        tableData.push([
                            d,
                            formatDateIndoShort(targetDateStr),
                            '-', '-', '-', '-', '-', '-', '-', '-'
                        ])
                    }
                }

                autoTable(doc, {
                    startY: tableStartY,
                    margin: { left: 15, right: 15, bottom: 20 },
                    tableWidth: 180,
                    head: [
                        [
                            { content: 'NO', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                            { content: 'TANGGAL', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                            { content: 'SEBELUM VALIDASI', colSpan: 3, styles: { halign: 'center' } },
                            { content: 'SETELAH VALIDASI', colSpan: 3, styles: { halign: 'center' } },
                            { content: 'PENGINPUT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                            { content: 'VERIFIKASI KOOR', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
                        ],
                        [
                            { content: 'NUM', styles: { halign: 'center' } },
                            { content: 'DEN', styles: { halign: 'center' } },
                            { content: 'HASIL', styles: { halign: 'center' } },
                            { content: 'NUM', styles: { halign: 'center' } },
                            { content: 'DEN', styles: { halign: 'center' } },
                            { content: 'HASIL', styles: { halign: 'center' } }
                        ]
                    ],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold', halign: 'center', fontSize: 7 },
                    styles: { fontSize: 6, cellPadding: { top: 2, bottom: 2, left: 1, right: 1 }, font: 'Helvetica', valign: 'middle' },
                    columnStyles: {
                        0: { cellWidth: 6, halign: 'center', fontStyle: 'bold' },
                        1: { cellWidth: 14, halign: 'center' },
                        2: { cellWidth: 8, halign: 'center' },
                        3: { cellWidth: 10, halign: 'center' },
                        4: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
                        5: { cellWidth: 8, halign: 'center' },
                        6: { cellWidth: 10, halign: 'center' },
                        7: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
                        8: { cellWidth: 50, halign: 'left', cellPadding: { top: 2, bottom: 2, left: 1, right: 11 } },
                        9: { cellWidth: 54, halign: 'left', cellPadding: { top: 2, bottom: 2, left: 1, right: 11 } }
                    },
                    didDrawCell: (data) => {
                        if (data.cell.section === 'body') {
                            const dIndex = data.row.index + 1
                            const cache = qrCache[dIndex]
                            if (cache) {
                                const qrSize = 8
                                const cell = data.cell
                                const qrY = cell.y + (cell.height - qrSize) / 2
                                if (data.column.index === 8 && cache.inputQR) {
                                    doc.addImage(cache.inputQR, 'PNG', cell.x + cell.width - 10, qrY, qrSize, qrSize)
                                } else if (data.column.index === 9 && cache.koorQR) {
                                    doc.addImage(cache.koorQR, 'PNG', cell.x + cell.width - 10, qrY, qrSize, qrSize)
                                }
                            }
                        }
                    }
                })

                // Generate and draw daily trend chart
                const dailyChartData = []
                for (let d = 1; d <= daysInMonth; d++) {
                    const targetDateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
                    const r = indRealisasi.find(item => item.tanggal_inmut && item.tanggal_inmut.slice(0, 10) === targetDateStr)
                    
                    if (r) {
                        const numVal = r.num !== null && r.num !== undefined ? parseInt(r.num) : null
                        const denumVal = r.denum !== null && r.denum !== undefined ? parseInt(r.denum) : null
                        let scoreVal = null
                        if (needsDenominator(indicator)) {
                            if (denumVal !== null && denumVal > 0 && numVal !== null) {
                                scoreVal = parseFloat(((numVal / denumVal) * 100).toFixed(2))
                            }
                        } else if (numVal !== null) {
                            scoreVal = numVal
                        }
                        
                        dailyChartData.push({
                            num: numVal,
                            denum: denumVal,
                            score: scoreVal
                        })
                    } else {
                        dailyChartData.push({
                            num: null,
                            denum: null,
                            score: null
                        })
                    }
                }

                let runningY = doc.lastAutoTable.finalY || 58
                
                try {
                    const chartImg = generateDailyChartImage(indicator, dailyChartData, indicator.standar)
                    const chartHeight = 60
                    const chartWidth = 180
                    
                    if (runningY + chartHeight + 8 > 275) {
                        doc.addPage()
                        runningY = 36
                    } else {
                        runningY += 4
                    }
                    
                    doc.setFont('Helvetica', 'bold')
                    doc.setFontSize(8.5)
                    doc.setTextColor(59, 130, 246)
                    doc.text('GRAFIK TREN HARIAN', 15, runningY)
                    
                    doc.addImage(chartImg, 'PNG', 15, runningY + 2, chartWidth, chartHeight)
                    runningY = runningY + 2 + chartHeight
                } catch (chartErr) {
                    console.error('Failed to draw chart in PDF:', chartErr)
                }

                // 1. Draw Analysis & Follow-up section (if exists)
                const indAnalisa = analisaListAll.find(a => a.id_inmut === indicator.id_inmut)
                if (indAnalisa && (indAnalisa.analisa || indAnalisa.tindak_lanjut)) {
                    const boxWidth = 180
                    const boxPadding = 4
                    const labelHeight = 4
                    const spaceBetween = 3
                    
                    const txtAnalisa = indAnalisa.analisa || '-'
                    const splitAnalisa = doc.splitTextToSize(txtAnalisa, boxWidth - (boxPadding * 2))
                    const heightAnalisa = (splitAnalisa.length * 3.5)
                    
                    const txtTindakLanjut = indAnalisa.tindak_lanjut || '-'
                    const splitTindakLanjut = doc.splitTextToSize(txtTindakLanjut, boxWidth - (boxPadding * 2))
                    const heightTindakLanjut = (splitTindakLanjut.length * 3.5)
                    
                    const totalBoxHeight = (boxPadding * 2) + labelHeight + heightAnalisa + spaceBetween + labelHeight + heightTindakLanjut
                    
                    if (runningY + totalBoxHeight + 8 > 280) {
                        doc.addPage()
                        runningY = 36
                    } else {
                        runningY += 8
                    }
                    
                    doc.setFont('Helvetica', 'bold')
                    doc.setFontSize(8.5)
                    doc.setTextColor(67, 94, 190)
                    doc.text('ANALISIS & TINDAK LANJUT BULANAN', 15, runningY)
                    
                    const boxStartY = runningY + 2
                    
                    doc.setDrawColor(226, 232, 240)
                    doc.setFillColor(248, 250, 252)
                    doc.rect(15, boxStartY, boxWidth, totalBoxHeight, 'FD')
                    
                    let textY = boxStartY + boxPadding + 3
                    
                    doc.setFont('Helvetica', 'bold')
                    doc.setFontSize(7.5)
                    doc.setTextColor(51, 65, 85)
                    doc.text('Analisis Capaian:', 15 + boxPadding, textY)
                    textY += 4
                    
                    doc.setFont('Helvetica', 'normal')
                    doc.setTextColor(15, 23, 42)
                    doc.text(splitAnalisa, 15 + boxPadding, textY)
                    textY += heightAnalisa + spaceBetween
                    
                    doc.setFont('Helvetica', 'bold')
                    doc.setTextColor(51, 65, 85)
                    doc.text('Rencana Tindak Lanjut:', 15 + boxPadding, textY)
                    textY += 4
                    
                    doc.setFont('Helvetica', 'normal')
                    doc.setTextColor(15, 23, 42)
                    doc.text(splitTindakLanjut, 15 + boxPadding, textY)
                    
                    runningY = boxStartY + totalBoxHeight
                }

                // 2. Draw Supervisi & Rekomendasi section (if exists)
                let hasSupervisiSection = false
                let supervisiText = '-'
                let rekomendasiText = '-'
                
                if (indAnalisa && indAnalisa.feedback) {
                    const fb = indAnalisa.feedback
                    const fbSupervisi = stripHtml(fb.supervisi).trim()
                    const fbRekomendasi = stripHtml(fb.rekomendasi).trim()
                    
                    if (fbSupervisi && fbSupervisi !== '-' && fbSupervisi !== '') {
                        supervisiText = fbSupervisi
                    }
                    if (fbRekomendasi && fbRekomendasi !== '-' && fbRekomendasi !== '') {
                        rekomendasiText = fbRekomendasi
                    }
                    
                    if (supervisiText !== '-' || rekomendasiText !== '-') {
                        hasSupervisiSection = true
                    }
                }
                
                if (hasSupervisiSection) {
                    const boxWidth = 180
                    const boxPadding = 4
                    const labelHeight = 4
                    const spaceBetween = 3
                    
                    const splitSupervisi = doc.splitTextToSize(supervisiText, boxWidth - (boxPadding * 2))
                    const heightSupervisi = (splitSupervisi.length * 3.5)
                    
                    const splitRekomendasi = doc.splitTextToSize(rekomendasiText, boxWidth - (boxPadding * 2))
                    const heightRekomendasi = (splitRekomendasi.length * 3.5)
                    
                    const totalBoxHeight = (boxPadding * 2) + labelHeight + heightSupervisi + spaceBetween + labelHeight + heightRekomendasi
                    
                    if (runningY + totalBoxHeight + 8 > 280) {
                        doc.addPage()
                        runningY = 36
                    } else {
                        runningY += 8
                    }
                    
                    doc.setFont('Helvetica', 'bold')
                    doc.setFontSize(8.5)
                    doc.setTextColor(16, 185, 129)
                    doc.text('SUPERVISI & REKOMENDASI MUTU UNIT', 15, runningY)
                    
                    const boxStartY = runningY + 2
                    
                    doc.setDrawColor(209, 250, 229)
                    doc.setFillColor(240, 253, 250)
                    doc.rect(15, boxStartY, boxWidth, totalBoxHeight, 'FD')
                    
                    let textY = boxStartY + boxPadding + 3
                    
                    doc.setFont('Helvetica', 'bold')
                    doc.setFontSize(7.5)
                    doc.setTextColor(51, 65, 85)
                    doc.text('Hasil Supervisi Mutu (Temuan):', 15 + boxPadding, textY)
                    textY += 4
                    
                    doc.setFont('Helvetica', 'normal')
                    doc.setTextColor(15, 23, 42)
                    doc.text(splitSupervisi, 15 + boxPadding, textY)
                    textY += heightSupervisi + spaceBetween
                    
                    doc.setFont('Helvetica', 'bold')
                    doc.setTextColor(51, 65, 85)
                    doc.text('Rekomendasi Tindak Lanjut:', 15 + boxPadding, textY)
                    textY += 4
                    
                    doc.setFont('Helvetica', 'normal')
                    doc.setTextColor(15, 23, 42)
                    doc.text(splitRekomendasi, 15 + boxPadding, textY)
                }
            }

            // Draw header and footer on all pages
            const pageCount = doc.internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                if (headerImg) {
                    doc.addImage(headerImg, 'PNG', 0, 0, 210, 27.01)
                }
                if (footerImg) {
                    doc.addImage(footerImg, 'PNG', 0, 285.82, 210, 11.18) // A4 portrait height is 297mm. 297 - 11.18 = 285.82
                }
            }

            const pdfBlob = doc.output('blob')
            const url = URL.createObjectURL(pdfBlob)
            window.open(url, '_blank')
            toast.success('Data Input Harian PDF berhasil dibuka')
        }
    } catch (error) {
        console.error('Export failed:', error)
        toast.error('Gagal mengekspor Data Input Harian')
    } finally {
        loading.value = false
    }
}

const loadImage = (src) => {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
    })
}

const generateQRCode = async (text) => {
    try {
        return await QRCode.toDataURL(text, { width: 100, margin: 1 })
    } catch (err) {
        console.error('Error generating QR code:', err)
        return null
    }
}

onMounted(() => {
    fetchUnits()
})
</script>

<style scoped>
/* Back Navigation Bar */
/* Monthly Info Bar */
.monthly-info-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #3b82f6;
    border-radius: 12px;
    padding: 14px 18px;
    flex-wrap: wrap;
}

.monthly-info-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    overflow: hidden;
}

.monthly-info-icon {
    width: 42px;
    height: 42px;
    min-width: 42px;
    border-radius: 10px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
    font-size: 1rem;
}

.monthly-info-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: hidden;
}

.monthly-info-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1e293b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.monthly-info-period {
    font-size: 0.78rem;
    color: #64748b;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.monthly-save-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #ffffff;
    font-size: 0.84rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    white-space: nowrap;
    flex-shrink: 0;
}

.monthly-save-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    transform: translateY(-1px);
}

.monthly-save-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
}

/* Actions row — always ONE horizontal row, no wrapping */
.monthly-actions-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    flex-wrap: nowrap;
}

/* Base action button */
.monthly-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 9px;
    border: none;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
}

.monthly-action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.monthly-action-btn:hover:not(:disabled) {
    transform: translateY(-1px);
}

/* PIC — blue */
.btn-verif-pic {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}
.btn-verif-pic:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

/* Koor — green */
.btn-verif-koor {
    background: linear-gradient(135deg, #16a34a, #15803d);
    color: #fff;
    box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
}
.btn-verif-koor:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.4);
}

/* Unlock — red outline */
.btn-unlock {
    background: transparent;
    color: #dc2626;
    border: 1.5px solid #dc2626;
    box-shadow: none;
}
.btn-unlock:hover:not(:disabled) {
    background: #fee2e2;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
}

.back-nav-bar {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #ffffff;
    border: 1px solid #bfdbfe;
    border-left: 4px solid #3b82f6;
    border-radius: 12px;
    padding: 14px 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 4px rgba(59, 130, 246, 0.08);
}

.back-nav-bar:hover {
    background: #eff6ff;
    border-color: #93c5fd;
    border-left-color: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transform: translateY(-1px);
}

.back-nav-icon {
    width: 38px;
    height: 38px;
    min-width: 38px;
    border-radius: 10px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
    font-size: 0.9rem;
    transition: all 0.2s ease;
}

.back-nav-bar:hover .back-nav-icon {
    background: #2563eb;
    color: #ffffff;
    border-color: #2563eb;
}

.back-nav-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    overflow: hidden;
}

.back-nav-label {
    font-size: 0.875rem;
    font-weight: 700;
    color: #1e40af;
    line-height: 1.2;
}

.back-nav-sub {
    font-size: 0.8rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.back-nav-close {
    color: #94a3b8;
    font-size: 0.875rem;
    flex-shrink: 0;
    transition: color 0.2s ease;
}

.back-nav-bar:hover .back-nav-close {
    color: #ef4444;
}

.small-text {
    font-size: 0.8rem;
    line-height: 1.2;
    max-width: 400px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.small-text:hover {
    white-space: normal;
    overflow: visible;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
}
.calendar-day.has-data {
    border-color: #198754;
}
.calendar-day.is-sunday {
    border-color: #dc3545;
}
.calendar-day.is-sunday .card-header {
    background: #dc3545 !important;
    background-color: #dc3545 !important;
    color: white !important;
}

/* Premium Filter Styles */
.filter-container {
    background: #f8f9fa;
    padding: 10px 15px;
    border-radius: 12px;
    border: 1px solid #e9ecef;
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 220px;
    max-width: 300px;
}

.filter-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #6c757d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.custom-input-group {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    transition: all 0.2s ease;
    height: 38px;
}

.custom-input-group:focus-within {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}

.icon-prefix {
    padding: 0 12px;
    color: #adb5bd;
    font-size: 0.9rem;
}

/* Modern Color Tokens for Workflow */
.bg-success-light { background-color: #f0fdf4 !important; }
.bg-warning-light { background-color: #fffbeb !important; }
.bg-primary-light { background-color: #eff6ff !important; }
.bg-info-light { background-color: #e0f7fa !important; }
.border-primary-light { border-color: #bfdbfe !important; }
.border-success-light { border-color: #bbf7d0 !important; }
.text-warning-dark { color: #92400e !important; }

.rich-content {
    font-size: 0.95rem;
    line-height: 1.6;
}
.rich-content :deep(p) {
    margin-bottom: 0.5rem;
}
.rich-content :deep(ul), .rich-content :deep(ol) {
    padding-left: 1.2rem;
    margin-bottom: 0.5rem;
}

.extra-small {
    font-size: 0.75rem !important;
}

.premium-textarea {
    border: 1px solid #e2e8f0 !important;
    border-radius: 10px !important;
    padding: 12px !important;
    transition: all 0.3s ease !important;
    font-size: 0.95rem !important;
}

.premium-textarea:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Page header icon */
.header-icon-bg {
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
  font-size: 1.5rem;
}

/* Tabs */
.tabs-nav {
  overflow-x: auto;
  overflow-y: hidden;
  display: block;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.tabs-nav::-webkit-scrollbar {
  display: none !important; /* Chrome, Safari, Opera */
}

.header-tabs-premium {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: fit-content;
  max-width: 100%;
}

.tab-btn {
  padding: 8px 18px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.tab-btn:hover:not(.active) {
  color: #0f172a;
  background: #e2e8f0;
}

.tab-btn.active {
  background: white;
  color: #2563eb !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Filter bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
}

.filter-bar-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
  flex: 1;
}

.filter-bar-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Content card */
.content-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow: visible;
}

/* v-select in filter bar */
.filter-vselect .vs__dropdown-toggle {
  background-color: #ffffff !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 8px !important;
  min-height: 38px !important;
  padding: 0 4px !important;
  transition: all 0.2s ease;
}

.filter-vselect.vs--open .vs__dropdown-toggle {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.filter-vselect .vs__selected {
  color: #212529 !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
}

.filter-vselect .vs__search::placeholder {
  color: #adb5bd !important;
  font-size: 0.85rem !important;
}

.filter-vselect .vs__open-indicator { fill: #6c757d !important; transform: scale(0.8) !important; }
.filter-vselect .vs__clear { fill: #6c757d !important; }

.filter-vselect .vs__dropdown-menu {
  background: #ffffff !important;
  border: 1px solid #dee2e6 !important;
  border-top: none !important;
  border-radius: 0 0 8px 8px !important;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
  z-index: 1050 !important;
}

.filter-vselect .vs__dropdown-option {
  color: #212529 !important;
  padding: 9px 14px !important;
  font-size: 0.875rem !important;
  white-space: normal !important;
}

.filter-vselect .vs__dropdown-option--highlight {
  background: #3b82f6 !important;
  color: #ffffff !important;
}

/* Premium Filter Inputs */
.filter-date-input {
  background-color: #ffffff !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 8px !important;
  height: 38px !important;
  padding: 0 12px !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: #212529 !important;
  transition: all 0.2s ease;
  width: 100%;
}

.filter-date-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
  outline: none;
}

.filter-select {
  background-color: #ffffff !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 8px !important;
  height: 38px !important;
  padding: 0 12px !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: #212529 !important;
  transition: all 0.2s ease;
  width: 100%;
}

.filter-select:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
  outline: none;
}

/* Premium Table */
.premium-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.premium-table thead th {
  background-color: #f8fafc;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  padding: 14px 18px;
  border-bottom: 2px solid #e2e8f0;
  border-top: none;
}

.premium-table tbody tr {
  transition: all 0.2s ease;
}

.premium-table tbody tr:hover {
  background-color: #f8fafc;
}

.premium-table tbody td {
  padding: 14px 18px;
  border-bottom: 1px solid #e2e8f0;
}

/* Index column */
.premium-table td.text-center {
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.85rem;
}

/* Indicator title & description */
.indicator-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 0.9rem;
  margin-bottom: 4px;
  line-height: 1.4;
}

.indicator-desc {
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.35;
  max-width: 450px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
}

.indicator-desc:hover {
  white-space: normal;
  overflow: visible;
}

/* Standar badge */
.premium-badge-standar {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}

.premium-badge-standar .symbol {
  color: #64748b;
  font-weight: 700;
}

.premium-badge-standar .val {
  color: #0f172a;
  font-weight: 700;
}

.premium-badge-standar .unit {
  color: #64748b;
  font-size: 0.75rem;
}

/* Input Fields */
.latest-input-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.input-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  max-width: 130px;
}

.input-field-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.premium-table-input {
  width: 100%;
  height: 36px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.2s ease;
}

.premium-table-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  background-color: #ffffff;
}

/* Row Action button */
.row-save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  border: none;
  background: #10b981;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
  white-space: nowrap;
}

.row-save-btn:hover:not(:disabled) {
  background: #059669;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.row-save-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Score badge */
.score-badge {
  font-size: 0.95rem;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 8px;
  display: inline-block;
  text-align: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  min-width: 65px;
}

.score-badge.text-success {
  background-color: #f0fdf4 !important;
  color: #166534 !important;
  border-color: #bbf7d0 !important;
}

.score-badge.text-danger {
  background-color: #fef2f2 !important;
  color: #991b1b !important;
  border-color: #fee2e2 !important;
}

.score-badge.text-dark {
  background-color: #f8fafc !important;
  color: #334155 !important;
  border-color: #e2e8f0 !important;
}

/* Status Verifikasi Badge */
.status-verif-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  margin-bottom: 4px;
}

.status-verif-badge.pending,
.status-verif-badge.draft {
  background-color: #f1f5f9 !important;
  color: #475569 !important;
  border: 1px solid #cbd5e1 !important;
}

.status-verif-badge.verified_pic,
.status-verif-badge.submitted {
  background-color: #eff6ff !important;
  color: #1e40af !important;
  border: 1px solid #bfdbfe !important;
}

.status-verif-badge.verified_koor,
.status-verif-badge.validated {
  background-color: #f0fdf4 !important;
  color: #166534 !important;
  border: 1px solid #bbf7d0 !important;
}

.status-verif-badge.rejected {
  background-color: #fef2f2 !important;
  color: #991b1b !important;
  border: 1px solid #fee2e2 !important;
}

</style>

<style>
/* Global overrides for this component's v-select to ensure it works */
.vs__dropdown-toggle,
.vs__dropdown-menu {
  background: #ffffff !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 8px !important;
  color: #212529 !important;
  text-transform: none !important;
  min-height: 38px !important;
}

.vs__dropdown-toggle:hover {
    border-color: #ced4da !important;
}

.vs__search::placeholder {
    color: #adb5bd !important;
    font-size: 0.9rem;
}

.vs__dropdown-option {
    white-space: normal !important;
    padding: 10px 12px !important;
    line-height: normal !important;
    font-size: 0.9rem;
}

.vs__selected,
.vs__search {
    color: #212529 !important;
    margin: 0 !important;
    padding: 0 !important;
}

.vs__open-indicator {
    fill: #adb5bd !important;
    transform: scale(0.8);
}

.vs__actions {
    padding: 0 8px !important;
}

.vs__clear {
    fill: #adb5bd !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  /* Filter Section */
  .filter-container {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
    margin-top: 1rem !important;
  }

  .date-filter {
    max-width: 100% !important;
    width: 100% !important;
  }

  .unit-select {
    min-width: 100% !important;
    width: 100% !important;
  }

  /* Card Header with Tabs */
  .card-header.py-3 {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.75rem !important;
    padding: 0.75rem !important;
  }

  .btn-group {
    width: 100% !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 0.25rem !important;
  }

  .btn-group .btn {
    flex-shrink: 0 !important;
    font-size: 0.7rem !important;
    padding: 0.4rem 0.6rem !important;
    border-radius: 6px !important;
    font-weight: 500 !important;
  }

  /* Segmented Control Mobile Fixes - High Precision */
  .mode-segmented-control {
    width: 100% !important;
    display: flex !important;
    padding: 4px !important;
    gap: 0 !important;
  }

  .mode-segmented-control .mode-option {
    width: 33.333% !important;
    flex: 1 1 0 !important;
    min-width: 0 !important;
    padding: 12px 4px !important;
    font-size: 0.8rem !important;
    gap: 6px !important;
  }

  .mode-glider {
    width: calc((100% - 8px) / 3) !important;
    top: 4px !important;
    left: 4px !important;
    border-radius: 10px !important;
  }

  /* Softer colors for inactive tabs */
  .btn-group .btn.btn-light {
    background-color: #f8f9fa !important;
    border-color: #e9ecef !important;
    color: #6c757d !important;
  }

  /* Active tab with softer primary color */
  .btn-group .btn.btn-primary {
    background: linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%) !important;
    border-color: #d0d0d0 !important;
    color: #495057 !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    font-weight: 600 !important;
  }

  /* Indicator selectors in tabs */
  .card-header .flex-grow-1 {
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 !important;
  }

  .card-header .d-flex.gap-2 {
    flex-direction: column !important;
    max-width: 100% !important;
    width: 100% !important;
    gap: 0.5rem !important;
    margin: 0 !important;
  }

  .card-header .d-flex.gap-2 .style-chooser {
    width: 100% !important;
  }

  .card-header .d-flex.gap-2 input[type="month"] {
    max-width: 100% !important;
    width: 100% !important;
  }

  /* Ensure v-select in card header is full width */
  .card-header .style-chooser {
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Tabs Nav Mobile Fix */
  .tabs-nav .header-tabs-premium {
    max-width: none !important;
    width: max-content !important;
    flex-wrap: nowrap !important;
  }

  /* Context Toggle Mobile Layout */
  .context-toggle-wrap {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
  }
  .context-toggle-wrap .header-tabs-premium {
    width: 100% !important;
    max-width: 100% !important;
  }
  .context-toggle-wrap .tab-btn {
    flex: 1 !important;
    justify-content: center !important;
  }

  /* Page Header Title Scaling */
  .page-header h3 {
    font-size: 1.25rem !important;
  }
  .header-icon-bg {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    font-size: 1.2rem !important;
  }

  /* Filter Bar Mobile Stacking */
  .filter-bar {
    flex-direction: column !important;
    align-items: stretch !important;
    padding: 12px !important;
    gap: 10px !important;
  }
  .filter-bar-item {
    width: 100% !important;
    min-width: 100% !important;
  }

  /* Monthly Info Bar Mobile Styling */
  .monthly-info-left {
    flex-wrap: wrap !important;
  }
  .monthly-info-title {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
  .monthly-actions-row {
    width: 100% !important;
  }
  .monthly-save-btn {
    width: 100% !important;
    justify-content: center !important;
  }
}

/* Fallback for Bootstrap versions < 5.3 */
.bg-success-subtle { 
  background-color: #d1e7dd !important; 
}
.text-success-emphasis { 
  color: #0a3622 !important; 
}
.bg-danger-subtle { 
  background-color: #f8d7da !important; 
}
.text-danger-emphasis { 
  color: #58151c !important; 
}
</style>
