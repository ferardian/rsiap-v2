<template>
  <div class="container-fluid p-0">
    <div class="header-title-section mb-3">
      <h3 class="fw-bold text-primary mb-1">
        <i class="fas fa-edit me-2"></i>Input Data Indikator Mutu
      </h3>
      <p class="text-muted mb-0">Input data realisasi indikator mutu harian</p>
    </div>

    <!-- Content -->
    <!-- Content -->
    <div class="card shadow-md border-0 overflow-hidden">
      <div class="card-header premium-header d-flex flex-wrap align-items-center justify-content-between gap-3 p-3">
        <div class="d-flex align-items-center gap-3">
          <div class="mode-segmented-control">
              <div 
                  v-for="mode in [
                      { id: 'daily', label: 'Harian', icon: 'fa-list' },
                      { id: 'monthly', label: 'Bulanan', icon: 'fa-calendar-alt' },
                      { id: 'analisa', label: 'Analisa', icon: 'fa-chart-line' }
                  ]" 
                  :key="mode.id"
                  class="mode-option"
                  :class="{ 'active': viewMode === mode.id }"
                  @click="viewMode = mode.id"
              >
                  <i class="fas" :class="mode.icon"></i>
                  <span>{{ mode.label }}</span>
              </div>
              <div class="mode-glider" :style="gliderStyle"></div>
          </div>

          <!-- Context Toggle inside blue header -->
          <div v-if="isCommitteeMember" class="btn-group context-toggle-premium" role="group">
            <input type="radio" class="btn-check" name="inputMode" id="modeUnit" value="unit" v-model="inputMode" @change="handleModeChange">
            <label class="btn btn-outline-light btn-sm px-3" for="modeUnit">
              <i class="fas fa-hospital me-1"></i> Unit
            </label>
            
            <input type="radio" class="btn-check" name="inputMode" id="modeKomite" value="komite" v-model="inputMode" @change="handleModeChange">
            <label class="btn btn-outline-light btn-sm px-3" for="modeKomite">
              <i class="fas fa-users-cog me-1"></i> Komite
            </label>
          </div>
        </div>
        
        <!-- Filters Area -->
        <div class="d-flex align-items-center gap-2 flex-grow-1 justify-content-end">
            <!-- DAILY MODE FILTERS -->
            <template v-if="viewMode === 'daily'">
                <div class="header-filter-item">
                    <div class="header-filter-label">Tanggal Transaksi</div>
                    <input type="date" class="form-control form-control-sm header-input" v-model="filters.tgl_transaksi" @change="fetchIndicators">
                </div>
                <div class="header-filter-item unit-select-container">
                    <div class="header-filter-label">Unit / Ruangan</div>
                    <v-select 
                        :options="units" 
                        label="nama_ruang" 
                        v-model="filters.unit"
                        :reduce="unit => unit.dep_id"
                        placeholder="Pilih Unit"
                        class="header-vselect unit-select"
                        :disabled="inputMode === 'komite' || (inputMode === 'unit' && isUnitLocked)"
                        @update:modelValue="fetchIndicators"
                    />
                </div>
            </template>

            <!-- MONTHLY MODE FILTERS -->
            <template v-else-if="viewMode === 'monthly'">
                <div class="header-filter-item">
                    <div class="header-filter-label">Bulan & Tahun</div>
                    <input type="month" class="form-control form-control-sm header-input" v-model="monthlyFilterDate" @change="handleMonthlyDateChange">
                </div>
                <div class="header-filter-item unit-select-container">
                    <div class="header-filter-label">Unit / Ruangan</div>
                    <v-select 
                        :options="units" 
                        label="nama_ruang" 
                        v-model="filters.unit"
                        :reduce="unit => unit.dep_id"
                        placeholder="Pilih Unit"
                        class="header-vselect unit-select"
                        :disabled="inputMode === 'komite' || (inputMode === 'unit' && isUnitLocked)"
                        @update:modelValue="fetchMonthlyData"
                    />
                </div>
                <div class="header-filter-item flex-grow-1" style="max-width: 400px;">
                    <div class="header-filter-label">Pilih Indikator</div>
                    <v-select 
                        :options="indicators" 
                        label="nama_inmut" 
                        v-model="selectedIndicator"
                        placeholder="Pilih Indikator untuk Entri..."
                        class="header-vselect"
                        @update:modelValue="fetchMonthlyData"
                    />
                </div>
            </template>

            <!-- ANALISA MODE FILTERS -->
            <template v-else-if="viewMode === 'analisa'">
                <div class="header-filter-item flex-grow-1" style="max-width: 400px;">
                    <div class="header-filter-label">Pilih Indikator</div>
                    <v-select 
                        :options="indicators" 
                        label="nama_inmut" 
                        v-model="selectedIndicator"
                        placeholder="Pilih Indikator..."
                        class="header-vselect"
                        @update:modelValue="fetchAnalisaData"
                    />
                </div>
                <div class="header-filter-item">
                    <div class="header-filter-label">Bulan & Tahun</div>
                    <input 
                        type="month" 
                        class="form-control form-control-sm header-input" 
                        v-model="monthlyFilterDate"
                        @change="handleMonthlyDateChange"
                    >
                </div>
                <div class="header-filter-item unit-select-container">
                    <div class="header-filter-label">Unit / Ruangan</div>
                    <v-select 
                        :options="units" 
                        label="nama_ruang" 
                        v-model="filters.unit"
                        :reduce="unit => unit.dep_id"
                        placeholder="Pilih Unit"
                        class="header-vselect unit-select"
                        :disabled="inputMode === 'komite' || (inputMode === 'unit' && isUnitLocked)"
                        @update:modelValue="fetchAnalisaData"
                    />
                </div>
            </template>
        </div>
      </div>
      <div class="card-body p-0">
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
            <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                    <tr>
                        <th width="5%" class="text-center">#</th>
                        <th width="35%">Indikator</th>
                        <th width="15%">Standar</th>
                        <th width="30%">Input Data</th>
                        <th width="15%">Hasil</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in indicators" :key="item.id_inmut">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>
                            <div class="fw-bold text-primary">{{ item.nama_inmut }}</div>
                            <small class="text-muted d-block small-text">{{ stripHtml(item.definisi_operasional) }}</small>
                        </td>
                        <td>
                            <span class="badge bg-light text-dark border">
                                {{ getRumusSymbol(item.rumus) }} {{ item.standar }} {{ item.satuan }}
                            </span>
                        </td>
                        <td>
                            <div v-if="item.latest_input_date" class="mb-2">
                                <span class="badge bg-info text-white" style="font-size: 0.65rem;">
                                    <i class="fas fa-history me-1"></i> Input Terakhir: {{ formatDate(item.latest_input_date) }}
                                </span>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <div class="w-50">
                                    <small class="d-block text-muted mb-1" style="font-size: 0.75rem;">Numerator</small>
                                    <input 
                                        type="number" 
                                        class="form-control form-control-sm" 
                                        v-model.number="item.numerator" 
                                        placeholder="0"
                                        min="0"
                                    >
                                </div>
                                <div class="w-50" v-if="needsDenominator(item)">
                                    <small class="d-block text-muted mb-1" style="font-size: 0.75rem;">Denominator</small>
                                    <input 
                                        type="number" 
                                        class="form-control form-control-sm" 
                                        v-model.number="item.denominator" 
                                        placeholder="0"
                                        min="0"
                                    >
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex flex-column align-items-start gap-2">
                                <div class="fw-bold" :class="getScoreColor(calculateScore(item), item)">
                                    {{ calculateScore(item) }} %
                                </div>
                                <button 
                                    class="btn btn-sm btn-outline-success" 
                                    @click="saveItem(item)"
                                    :disabled="item.isSaving"
                                >
                                    <i class="fas fa-save me-1"></i> 
                                    {{ item.isSaving ? 'Menyimpan...' : 'Simpan' }}
                                </button>
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
                 <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 class="mb-0 text-primary">
                            <i class="fas fa-chart-line me-2"></i> {{ selectedIndicator.nama_inmut }}
                        </h5>
                        <small class="text-muted">
                            Periode: {{ new Date(filters.tgl_transaksi).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}
                        </small>
                    </div>
                    <button class="btn btn-primary" @click="saveBulk" :disabled="bulkSaving">
                        <i class="fas fa-save me-2"></i>
                        {{ bulkSaving ? 'Menyimpan...' : 'Simpan Semua Data' }}
                    </button>
                 </div>

                 <div class="calendar-grid">
                    <div v-for="day in calendarDays" :key="day.date" class="calendar-day card" :class="{'has-data': day.hasData}">
                        <div class="card-header py-1 px-2 d-flex justify-content-between align-items-center" :class="day.hasData ? 'bg-success text-white' : 'bg-light'">
                            <small class="fw-bold">{{ day.date.slice(-2) }} {{ day.dayName }}</small>
                            <i v-if="day.hasData" class="fas fa-check-circle small"></i>
                        </div>
                        <div class="card-body p-2">
                            <div class="mb-2">
                                <label class="small text-muted d-block mb-0">Num</label>
                                <input type="number" class="form-control form-control-sm" v-model.number="day.numerator" min="0" @input="day.isTouched = true">
                            </div>
                            <div>
                                <label class="small text-muted d-block mb-0">Denum</label>
                                <input type="number" class="form-control form-control-sm" v-model.number="day.denominator" min="0" :disabled="!needsDenominator(selectedIndicator)" @input="day.isTouched = true">
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
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
                    <div v-for="item in allIndicatorStats" :key="item.id_inmut" class="col-md-6 col-lg-4">
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

                                <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                                    <div class="text-start">
                                        <small class="text-muted d-block extra-small">CAPAIAN</small>
                                        <span class="fw-bold" :class="isTargetMet(item) ? 'text-success' : 'text-danger'">{{ item.score }}%</span>
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
                <div class="mb-4">
                    <button class="btn btn-sm btn-white border shadow-sm px-4 py-2 rounded-pill text-primary fw-bold hover-elevate transition-all" @click="selectedIndicator = null">
                        <i class="fas fa-arrow-left me-2"></i> Kembali ke Daftar Indikator
                    </button>
                </div>

                <!-- DATA ENTRY PROGRESS CARD -->
                <div class="card mb-4 border-0 shadow-sm overflow-hidden" style="border-radius: 15px;">
                    <div class="card-body p-0">
                        <div class="p-4" :class="monthlyStats.isComplete ? 'bg-success-light' : 'bg-warning-light'">
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
                                        Terdapat <span class="fw-bold text-danger">{{ monthlyStats.missingDays.length }} tanggal</span> yang belum diisi. Anda tetap dapat memberikan analisa sekarang.
                                    </p>
                                    <div class="mt-2 d-flex flex-wrap gap-1">
                                        <span v-for="day in monthlyStats.missingDays" :key="day" class="badge bg-light text-dark border extra-small">
                                            Tgl {{ day }}
                                        </span>
                                    </div>
                                </div>
                                <div v-if="!showAnalisaForm && existingAnalisa.length === 0" class="ms-auto flex-shrink-0">
                                    <button class="btn btn-primary btn-sm px-4 rounded-pill shadow-sm" @click="showAnalisaForm = true">
                                        <i class="fas fa-pen-fancy me-2"></i> Beri Analisa
                                    </button>
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
                                <div v-if="!showAnalisaForm && existingAnalisa.length === 0" class="ms-auto">
                                    <button class="btn btn-primary btn-sm px-4 rounded-pill shadow-sm" @click="showAnalisaForm = true">
                                        <i class="fas fa-pen-fancy me-2"></i> Beri Analisa
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Stats Summary Bar -->
                        <div class="bg-white border-top p-3 d-flex justify-content-around flex-wrap gap-3 text-center">
                            <div class="px-2">
                                <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Numerator</small>
                                <span class="fw-bold text-dark h5 mb-0">{{ monthlyStats.totalNum }}</span>
                            </div>
                            <div class="vr opacity-25 d-none d-md-block"></div>
                            <div class="px-2">
                                <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Denominator</small>
                                <span class="fw-bold text-dark h5 mb-0">{{ monthlyStats.totalDenum }}</span>
                            </div>
                            <div class="vr opacity-25 d-none d-md-block"></div>
                            <div class="px-2">
                                <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Target</small>
                                <span class="fw-bold text-dark h5 mb-0 text-primary">{{ getTargetDisplay(selectedIndicator) }}</span>
                            </div>
                            <div class="vr opacity-25 d-none d-md-block"></div>
                            <div class="px-2">
                                <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Capaian</small>
                                <span class="fw-bold h5 mb-0" :class="isTargetMet(monthlyStats) ? 'text-success' : 'text-danger'">{{ monthlyStats.score }}%</span>
                            </div>
                            <div class="vr opacity-25 d-none d-md-block"></div>
                            <div class="px-2">
                                <small class="text-muted d-block text-uppercase extra-small fw-bold mb-1">Status</small>
                                <div v-if="isTargetMet(monthlyStats)" class="badge bg-success rounded-pill px-3 shadow-sm">
                                    <i class="fas fa-check-circle me-1"></i> TERCAPAI
                                </div>
                                <div v-else class="badge bg-danger rounded-pill px-3 shadow-sm">
                                    <i class="fas fa-times-circle me-1"></i> TIDAK TERCAPAI
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- FORM ANALISA (EXPANDABLE) -->
                <Transition name="fade-slide">
                    <div v-if="showAnalisaForm" class="card border-0 shadow-sm mb-4 overflow-hidden" style="border-radius: 12px;">
                        <div class="card-header bg-primary border-0 py-3 px-4 text-start">
                            <h6 class="fw-bold text-white mb-0">
                                <i class="fas fa-edit me-2"></i> Form Analisa & Tindak Lanjut
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label fw-bold small">Analisa Capaian <span class="text-danger">*</span></label>
                                <textarea 
                                    class="form-control premium-textarea" 
                                    rows="4" 
                                    v-model="analisaForm.analisa"
                                    placeholder="Tuliskan analisa mengapa capaian target terpenuhi atau tidak..."
                                ></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold small">Rencana Tindak Lanjut <span class="text-danger">*</span></label>
                                <textarea 
                                    class="form-control premium-textarea" 
                                    rows="4" 
                                    v-model="analisaForm.tindak_lanjut"
                                    placeholder="Tuliskan langkah konkret perbaikan atau pengembangan ke depan..."
                                ></textarea>
                            </div>

                            <div class="d-flex justify-content-end gap-2">
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

                <!-- EXISTING ANALISA RESULTS & COMMITTEE FEEDBACK -->
                <div v-if="existingAnalisa.length > 0">
                    <div class="d-flex align-items-center justify-content-between mb-3 px-1">
                        <h6 class="fw-bold text-dark mb-0">
                            <i class="fas fa-file-alt text-primary me-2"></i> Hasil Analisa & Feedback
                        </h6>
                        <button v-if="!showAnalisaForm" class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="showAnalisaForm = true">
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
                            <div class="card-header bg-primary border-0 py-3 px-3">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'
import committeeService from '@/services/committeeService'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)
const units = ref([])
const indicators = ref([])
const isUnitLocked = ref(false)

const filters = reactive({
    tgl_transaksi: new Date().toISOString().slice(0, 10),
    unit: null
})

// === VIEW MODE STATE ===
const viewMode = ref('daily') // 'daily' | 'monthly' | 'analisa'
const selectedIndicator = ref(null)
const bulkSaving = ref(false)
const calendarData = ref([])

// === MODE GLIDER LOGIC ===
const gliderStyle = computed(() => {
    const modes = ['daily', 'monthly', 'analisa']
    const activeIndex = modes.indexOf(viewMode.value)
    return {
        transform: `translateX(${activeIndex * 100}%)`
    }
})

// === CONTEXT MODE STATE ===
const inputMode = ref('unit') // 'unit' | 'komite'
const isCommitteeMember = ref(false)
const userCommittees = ref([])

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
        if (viewMode.value === 'monthly') {
            fetchMonthlyData()
        } else if (viewMode.value === 'analisa') {
            fetchAnalisaData()
        }
    }
}

const fetchCorrectData = () => {
    if (viewMode.value === 'daily') fetchIndicators()
    else if (viewMode.value === 'monthly') fetchMonthlyData()
    else if (viewMode.value === 'analisa') fetchAnalisaData()
}

// Watch viewMode to sync and auto-fetch
watch(viewMode, (newMode) => {
    if (newMode === 'monthly' || newMode === 'analisa') {
        monthlyFilterDate.value = filters.tgl_transaksi.slice(0, 7)
        analisaFilters.bulan = monthlyFilterDate.value
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

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
        
        const userNik = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik
        const userDepNameOrId = authStore.user?.data?.detail?.departemen || 
                                authStore.user?.detail?.departemen || 
                                authStore.user?.dep_id
        
        if (userDepNameOrId) {
            const myUnit = units.value.find(u => u.dep_id === userDepNameOrId || u.nama_ruang === userDepNameOrId)
            
            if (myUnit) {
                filters.unit = myUnit.dep_id
                isUnitLocked.value = true
                console.log('Unit locked to user department:', myUnit.nama_ruang)
            }
        }

        if (units.value.length > 0 && !filters.unit) {
            filters.unit = units.value[0].dep_id
        }

        // Check committee membership
        if (userNik) {
            const commRes = await committeeService.getByNik(userNik)
            if (commRes.data.success && commRes.data.data.length > 0) {
                userCommittees.value = commRes.data.data
                isCommitteeMember.value = true
            }
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
                numerator: saved ? saved.num : 0,
                denominator: saved ? saved.denum : 0,
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
            numerator: existing ? existing.num : 0,
            denominator: existing ? existing.denum : 0,
            hasData: !!existing,
            isTouched: !!existing // Mark as touched if data exists from DB
        })
    }
    return days
})

const fetchMonthlyData = async () => {
    if (!filters.unit || !selectedIndicator.value || viewMode.value !== 'monthly') return
    
    loading.value = true
    try {
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
        // Only send days that have been touched/modified by user
        const allDays = calendarDays.value.map(day => ({
            id_inmut: selectedIndicator.value.id_inmut,
            tgl_transaksi: day.date,
            dep_id: filters.unit,
            numerator: day.numerator,
            denominator: day.denominator,
            isTouched: day.isTouched
        }))

        // Filter: only include entries that user has touched (modified or from DB)
        const payload = allDays.filter(item => item.isTouched).map(({ isTouched, ...rest }) => rest)

        if (payload.length === 0) {
            toast.warning('Tidak ada data yang diisi. Silakan isi minimal satu tanggal.')
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
            const currentIndRealisasi = (realisasiRes.data.data || []).filter(r => r.id_inmut === selectedIndicator.value.id_inmut)
            
            let totalNum = 0, totalDenum = 0
            currentIndRealisasi.forEach(r => {
                totalNum += parseInt(r.num) || 0
                totalDenum += parseInt(r.denum) || 0
            })
            
            const filledDays = new Set(currentIndRealisasi.map(r => new Date(r.tanggal_inmut).getDate()))
            const missingDays = []
            for (let d = 1; d <= daysInMonth; d++) if (!filledDays.has(d)) missingDays.push(d)
            
            monthlyStats.value = {
                totalNum, totalDenum,
                score: totalDenum > 0 ? ((totalNum / totalDenum) * 100).toFixed(2) : 0,
                isComplete: missingDays.length === 0,
                missingDays,
                fillPercentage: Math.round(((daysInMonth - missingDays.length) / daysInMonth) * 100)
            }

            // Auto-populate form
            if (existingAnalisa.value.length > 0) {
                const data = existingAnalisa.value[0]
                analisaForm.id_analisa = data.id_analisa
                analisaForm.analisa = data.analisa
                analisaForm.tindak_lanjut = data.tindak_lanjut
                isEditingAnalisa.value = true
                showAnalisaForm.value = true
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
                const filledDays = new Set(indRealisasi.map(r => new Date(r.tanggal_inmut).getDate()))
                const filledCount = filledDays.size
                const progress = Math.round((filledCount / daysInMonth) * 100)
                const isComplete = filledCount === daysInMonth
                
                // Calculate current score
                let tNum = 0, tDenum = 0
                indRealisasi.forEach(r => { tNum += parseInt(r.num) || 0; tDenum += parseInt(r.denum) || 0 })
                const score = tDenum > 0 ? ((tNum / tDenum) * 100).toFixed(2) : 0

                // Check if already analyzed
                const analyzis = existingAnalisa.value.find(ans => ans.id_inmut === ind.id_inmut)

                return {
                    ...ind,
                    progress,
                    isComplete,
                    score,
                    isAnalyzed: !!analyzis,
                    analysisId: analyzis?.id_analisa,
                    hasFeedback: !!analyzis?.feedback
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
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    // Try to get indicator data from item.indikator first (like in monitoring)
    const ind = item?.indikator
    let target, rumus, score
    
    if (ind) {
        const utama = ind.master_utama || ind.masterUtama
        target = parseFloat((utama && utama.standar) ? utama.standar : ind.standar)
        rumus = String((utama && utama.rumus) ? utama.rumus : ind.rumus)
        score = parseFloat(item.jumlah || calculateCapaian(item.jml_num, item.jml_denum))
    } else if (selectedIndicator.value) {
        const indicator = selectedIndicator.value
        score = parseFloat(item.score || calculateCapaian(item.jml_num || item.totalNum, item.jml_denum || item.totalDenum))
        target = parseFloat(indicator.standar)
        rumus = String(indicator.rumus)
    } else {
        return false
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
        const myUnit = units.value.find(u => u.dep_id === userDepNameOrId || u.nama_ruang === userDepNameOrId)
        if (myUnit) filters.unit = myUnit.dep_id
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
    if (viewMode.value === 'analisa') fetchAnalisaData()
})

watch(() => viewMode.value, (newMode) => {
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

onMounted(() => {
    fetchUnits()
})
</script>

<style scoped>
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

.premium-header {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
    color: #ffffff !important;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
}

.header-filter-item {
    display: flex;
    flex-direction: column;
}

.header-filter-label {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 5px;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.header-input {
    background-color: #ffffff !important;
    border: 1px solid #dee2e6 !important;
    color: #2c3e50 !important;
    border-radius: 8px !important;
    font-weight: 500;
    height: 38px !important;
}

.header-input:focus {
    border-color: #3498db !important;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2) !important;
}

.context-toggle-premium .btn-outline-light {
    border-color: rgba(255, 255, 255, 0.3) !important;
    font-weight: 500;
}

.context-toggle-premium .btn-check:checked + .btn {
    background-color: #ffffff !important;
    color: #1e3c72 !important;
    border-color: #ffffff !important;
}

/* Segmented Control Styles */
.mode-segmented-control {
    position: relative;
    display: flex;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 4px;
    border-radius: 12px;
    width: fit-content;
    user-select: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.mode-option {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    z-index: 2;
    transition: all 0.3s ease;
    min-width: 110px;
    flex: 1;
}

.mode-option i {
    font-size: 0.9rem;
    transition: transform 0.3s ease;
}

.mode-option.active {
    color: #1e40af; /* Matches sidebar dark blue */
}

.mode-option:hover:not(.active) {
    color: #ffffff;
}

.mode-option:hover i {
    transform: translateY(-1px);
}

.mode-glider {
    position: absolute;
    top: 4px;
    left: 4px;
    height: calc(100% - 8px);
    width: calc((100% - 8px) / 3);
    background: #ffffff;
    border-radius: 10px;
    z-index: 1;
    transition: transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Specific item width overrides for desktop to keep them centered */
.mode-segmented-control .mode-option {
    flex: 0 0 auto;
    width: 110px;
}

.mode-glider {
    width: 110px;
}

/* Premium V-Select for Header */
.header-vselect .vs__dropdown-toggle {
    background-color: #ffffff !important;
    border: 1px solid #dee2e6 !important;
    border-radius: 8px !important;
    min-height: 38px !important;
    padding: 0 4px !important;
    transition: all 0.2s ease;
}

/* Force white background for all children of dropdown-toggle */
.header-vselect .vs__dropdown-toggle * {
    background-color: transparent !important;
}

.header-vselect.vs--open .vs__dropdown-toggle {
    border-color: #3498db !important;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2) !important;
    border-bottom-left-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}

.header-vselect .vs__selected {
    color: #212529 !important;
    font-size: 0.9rem !important;
    font-weight: 500 !important;
    margin: 4px 2px !important;
    background: transparent !important;
}

.header-vselect .vs__search {
    color: #212529 !important;
    font-size: 0.9rem !important;
    margin: 4px 2px !important;
    background: transparent !important;
}

.header-vselect .vs__search::placeholder {
    color: #adb5bd !important;
    font-size: 0.85rem !important;
}

.header-vselect .vs__open-indicator {
    fill: #6c757d !important;
    transform: scale(0.8) !important;
}

.header-vselect .vs__actions {
    padding: 0 8px !important;
    background: transparent !important;
}

.header-vselect .vs__clear {
    fill: #6c757d !important;
}

.header-vselect .vs__dropdown-menu {
    background: #ffffff !important;
    border: 1px solid #dee2e6 !important;
    border-top: none !important;
    border-radius: 0 0 8px 8px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
    z-index: 1050 !important;
    margin-top: -1px !important;
    padding: 5px 0 !important;
}

.header-vselect .vs__dropdown-option {
    color: #212529 !important;
    padding: 10px 15px !important;
    font-size: 0.85rem !important;
    white-space: normal !important;
}

.header-vselect .vs__dropdown-option--highlight {
    background: #3b82f6 !important;
    color: #ffffff !important;
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
