<template>
  <div>
    <div class="filter-card shadow-sm mb-4">
        <div class="row g-3 align-items-center">
            <!-- Tahun & Jenis Laporan Group -->
            <div class="col-lg-3">
                <div class="d-flex gap-2">
                    <div class="flex-shrink-0" style="width: 100px;">
                        <label class="filter-label"><i class="fas fa-calendar-alt me-1"></i> Tahun</label>
                        <select class="form-select border-0 bg-light-subtle shadow-none" v-model="filters.tahun" @change="fetchData">
                            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                        </select>
                    </div>
                    <div class="flex-grow-1">
                        <label class="filter-label"><i class="fas fa-file-invoice me-1"></i> Jenis Laporan</label>
                        <div class="custom-segmented-control">
                            <input type="radio" name="tipe" id="triwulan" value="triwulan" v-model="filters.tipe" hidden>
                            <label for="triwulan">Triwulan</label>
                            
                            <input type="radio" name="tipe" id="semester" value="semester" v-model="filters.tipe" hidden>
                            <label for="semester">Semester</label>

                            <input type="radio" name="tipe" id="tahunan" value="tahunan" v-model="filters.tipe" hidden>
                            <label for="tahunan">Tahunan</label>
                            <div class="selection-slider"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Periode & Tampilan Group -->
            <div class="col-lg-3">
                <div class="d-flex gap-2">
                    <div class="flex-grow-1">
                        <label class="filter-label"><i class="fas fa-clock me-1"></i> Periode Ke-</label>
                        <div class="custom-segmented-control period-selector" v-if="filters.tipe === 'triwulan'">
                            <input type="radio" name="periode" id="p1" :value="1" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="p1">I</label>
                            <input type="radio" name="periode" id="p2" :value="2" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="p2">II</label>
                            <input type="radio" name="periode" id="p3" :value="3" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="p3">III</label>
                            <input type="radio" name="periode" id="p4" :value="4" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="p4">IV</label>
                            <div class="selection-slider"></div>
                        </div>
                        <div class="custom-segmented-control period-selector" v-else-if="filters.tipe === 'semester'">
                            <input type="radio" name="periode-s" id="s1" :value="1" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="s1">Semester 1</label>
                            <input type="radio" name="periode-s" id="s2" :value="2" v-model="filters.periode" @change="fetchData" hidden>
                            <label for="s2">Semester 2</label>
                            <div class="selection-slider"></div>
                        </div>
                        <div class="custom-segmented-control bg-light-subtle" v-else>
                            <label class="w-100 text-center small fw-bold text-primary">SETAHUN PENUH</label>
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <label class="filter-label"><i class="fas fa-layer-group me-1"></i> Tampilan</label>
                        <div class="custom-segmented-control">
                            <input type="radio" name="jenis" id="semua" value="semua" v-model="filters.jenis" @change="fetchData" hidden>
                            <label for="semua">Semua</label>
            
                            <input type="radio" name="jenis" id="group" value="group" v-model="filters.jenis" @change="fetchData" hidden>
                            <label for="group">Indikator</label>
                            <div class="selection-slider"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Master Indikator Filter -->
            <div class="col-lg-2" v-if="filters.jenis === 'group'">
                <label class="filter-label"><i class="fas fa-star me-1"></i> Indikator Utama</label>
                <v-select 
                    :options="masterUtamaList" 
                    label="nama_inmut" 
                    v-model="filters.id_master"
                    :reduce="m => m.id_master"
                    placeholder="Semua Indikator"
                    class="modern-select"
                    @update:modelValue="fetchData"
                />
            </div>

            <!-- Unit / Dep Filter -->
            <div class="col-lg-2" v-if="filters.jenis !== 'group'">
                <label class="filter-label"><i class="fas fa-hospital-user me-1"></i> Unit / Ruang</label>
                <v-select 
                    :options="units" 
                    label="nama_ruang" 
                    v-model="filters.unit"
                    :reduce="unit => unit.dep_id"
                    placeholder="Semua Unit"
                    class="modern-select"
                    @update:modelValue="fetchData"
                />
            </div>

            <!-- Cari Indikator Filter -->
            <div class="col-lg">
                <label class="filter-label"><i class="fas fa-search me-1"></i> Cari Indikator</label>
                <input 
                    type="text" 
                    class="form-control form-control-sm border-0 bg-light-subtle shadow-none" 
                    v-model="filters.keyword" 
                    placeholder="Kata kunci..." 
                    @input="debounceFetch" 
                    style="height: 38px; border-radius: 8px;"
                />
            </div>

            <!-- Action Area -->
            <div class="col-lg-auto">
                <label class="filter-label" style="visibility: hidden;">Action</label>
                <div class="d-flex gap-2 action-area-buttons">
                    <button class="btn btn-refresh rounded-3 btn-sm px-2" @click="fetchData" title="Refresh Data" style="height: 38px; width: 38px; flex-shrink: 0;">
                        <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i>
                    </button>
                    <div class="dropdown" ref="exportDropdownRef" style="min-width: 90px; flex-shrink: 0;">
                        <button class="btn btn-danger text-white rounded-3 w-100 dropdown-toggle btn-sm fw-bold px-2" type="button" @click.stop="toggleExportDropdown" :disabled="loading || printingProgress > 0" style="height: 38px; font-size: 11px;">
                            <i class="fas fa-file-export me-1"></i> 
                            <span v-if="printingProgress > 0" style="font-size: 10px;">{{ printingProgress }}%</span>
                            <span v-else>Ekspor</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 show" v-if="showExportDropdown" style="display: block; position: absolute; right: 0; top: 100%; z-index: 1050; min-width: 200px;">
                            <li><a class="dropdown-item py-2" @click.prevent="handleExportRekap" href="#"><i class="fas fa-list-alt me-2 text-primary"></i> Rekapitulasi (Tabel)</a></li>
                            <li><a class="dropdown-item py-2" @click.prevent="handleExportFull" href="#"><i class="fas fa-file-medical me-2 text-danger"></i> Laporan Lengkap (Semua)</a></li>
                        </ul>
                    </div>
                    <button class="btn btn-warning rounded-3 btn-sm fw-bold px-2 text-white flex-shrink-0" @click="openRegisterModal" :disabled="loading" style="height: 38px; font-size: 11px; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-book"></i>
                        <span>Data Harian</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="alert alert-info d-flex align-items-center mb-4" v-if="periodeInfo">
        <i class="fas fa-info-circle me-2 fs-4"></i>
        <div>
            <div class="fw-bold text-uppercase">Laporan {{ filters.tipe }} {{ filters.periode }} Tahun {{ filters.tahun }}</div>
            <small>Periode Data: {{ formatDate(periodeInfo.start) }} s/d {{ formatDate(periodeInfo.end) }}</small>
        </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-bordered table-hover align-middle mb-0">
            <thead class="bg-light text-center">
              <tr>
                <th width="5%">#</th>
                <th width="30%">
                  {{ filters.jenis === 'group' ? 'Indikator Utama' : 'Indikator & Unit' }}
                </th>
                <th width="15%">Target</th>
                <th width="10%">Num</th>
                <th width="10%">Denum</th>
                <th width="15%">Capaian (%)</th>
                <th width="15%">Kesimpulan</th>
                <th width="10%">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                   <p class="mb-0">Tidak ada data laporan untuk periode ini.</p>
                </td>
              </tr>
            <template v-for="(item, index) in items" :key="getRowId(item)">
              <tr :class="{ 'table-active fw-medium': expandedRowId === getRowId(item) }">
                <td class="text-center">{{ (page - 1) * limit + index + 1 }}</td>
                <td>
                   <div class="fw-bold">{{ item.nama_inmut }}</div>
                   <small class="text-muted" v-if="filters.jenis !== 'group'">{{ item.nama_ruang }}</small>
                </td>
                <td class="text-center">
                    {{ getStandar(item) }}
                </td>
                <td class="text-center">{{ item.total_num }}</td>
                <td class="text-center">{{ item.total_denum }}</td>
                <td class="text-center fw-bold text-lg" :class="isTercapai(item) ? 'text-success' : 'text-danger'">
                    {{ item.score }}%
                </td>
                <td class="text-center">
                    <span class="badge" :class="isTercapai(item) ? 'bg-success' : 'bg-danger'">{{ isTercapai(item) ? 'Tercapai' : 'Tidak Tercapai' }}</span>
                </td>
                <td class="text-center">
                    <button 
                        class="btn btn-detail-toggle" 
                        :class="{ 'active': expandedRowId === getRowId(item) }"
                        @click="fetchDetail(item)"
                    >
                        <span>Detail</span>
                        <i class="fas fa-chevron-down ms-1 transition-transform" :class="{ 'fa-rotate-180': expandedRowId === getRowId(item) }"></i>
                    </button>
                </td>
              </tr>

              <!-- Expandable Detail Row -->
              <tr v-if="expandedRowId === getRowId(item)">
                <td colspan="8" class="p-0 border-0 bg-light">
                  <div class="expandable-content-wrapper overflow-hidden">
                    <div class="detail-container p-4">
                      <div v-if="detailLoading" class="text-center py-4">
                        <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
                        <span class="ms-2 text-muted small">Memuat rincian...</span>
                      </div>
                      
                      <div v-else-if="detailData" class="detail-content animate-fade-in">
                        <!-- Header Detail Card -->
                        <div class="detail-header-card shadow-sm mb-4">
                          <div class="row g-4">
                            <div class="col-md-7">
                              <div class="d-flex align-items-start gap-3 mb-3">
                                <div class="detail-icon-box">
                                  <i class="fas fa-info-circle"></i>
                                </div>
                                <div>
                                  <h6 class="fw-800 text-dark mb-1">{{ detailData.indicator.nama_inmut_utama || detailData.indicator.nama_inmut }}</h6>
                                  <p class="text-muted small mb-0">
                                    {{ filters.jenis === 'group' ? ('Rekapitulasi Global • ' + (detailData.indicator.kategori || 'Indikator Mutu')) : (detailData.indicator.nama_ruang || '-') }}
                                  </p>
                                </div>
                              </div>
                              <div class="row g-3">
                                <div class="col-sm-6">
                                  <div class="meta-item">
                                    <span class="meta-label">Numerator</span>
                                    <span class="meta-value" v-html="detailData.indicator.ket_num_utama || '-'"></span>
                                  </div>
                                </div>
                                <div class="col-sm-6">
                                  <div class="meta-item">
                                    <span class="meta-label">Denominator</span>
                                    <span class="meta-value" v-html="detailData.indicator.ket_denum_utama || '-'"></span>
                                  </div>
                                </div>
                              </div>
                            </div>
                                <div class="col-md-5">
                                  <div class="d-flex justify-content-between align-items-start mb-3">
                                      <div class="target-card-mini flex-grow-1 me-2">
                                        <div class="d-flex justify-content-between align-items-center">
                                          <span class="text-muted small fw-bold">TARGET / STANDAR</span>
                                          <span class="target-value">{{ getStandar(detailData.indicator) }}</span>
                                        </div>
                                      </div>
                                      <button class="btn btn-outline-danger btn-sm rounded-3 shadow-sm px-3" @click="exportDetailToPDF(detailData)" title="Download PDF Laporan">
                                          <i class="fas fa-file-pdf me-1"></i> PDF
                                      </button>
                                  </div>
                                  <div class="d-flex justify-content-between align-items-center">
                                    <span class="text-muted small fw-bold">PERIODE</span>
                                    <span class="text-dark fw-bold">{{ filters.tipe.toUpperCase() }} {{ filters.periode }} - {{ filters.tahun }}</span>
                                  </div>
                                </div>
                          </div>
                        </div>

                        <!-- Data & Trend Split -->
                        <div class="row g-4">
                          <div class="col-xl-7">
                            <div class="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
                              <div class="card-header bg-primary py-3 border-0 d-flex justify-content-between align-items-center">
                                <h6 class="mb-0 fw-bold text-white"><i class="fas fa-table me-2"></i>Rincian Capaian Per Bulan</h6>
                              </div>
                              <div class="table-responsive">
                                <table class="table table-sm mb-0 align-middle">
                                  <thead class="bg-gray-50 text-center text-xs fw-800 text-uppercase text-muted">
                                    <tr>
                                      <th class="py-3">Bulan</th>
                                      <th>Target</th>
                                      <th>Num</th>
                                      <th>Denum</th>
                                      <th>Capaian</th>
                                      <th>Hasil</th>
                                    </tr>
                                  </thead>
                                  <tbody class="text-center font-sm">
                                    <tr v-if="detailData.monthly.length === 0">
                                      <td colspan="6" class="py-4 text-muted">Belum ada data bulanan</td>
                                    </tr>
                                    <tr v-for="m in detailData.monthly" :key="m.bulan">
                                      <td class="fw-bold">{{ getMonthName(m.bulan) }} {{ m.tahun }}</td>
                                      <td>{{ getStandar(detailData.indicator) }}</td>
                                      <td>{{ m.total_num }}</td>
                                      <td>{{ m.total_denum }}</td>
                                      <td class="fw-bold" :class="isTercapai(m, detailData.indicator) ? 'text-success' : 'text-danger'">
                                        {{ m.score }}%
                                      </td>
                                      <td>
                                        <span class="badge" :class="isTercapai(m, detailData.indicator) ? 'bg-success' : 'bg-danger'">
                                          <i :class="isTercapai(m, detailData.indicator) ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-1"></i>
                                          {{ isTercapai(m, detailData.indicator) ? 'Tercapai' : 'Tidak Tercapai' }}
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                  <tfoot class="text-center font-sm bg-light fw-bold" v-if="detailData.monthly.length > 0 && monthlyAverage">
                                    <tr>
                                      <td class="py-3 text-primary">Rata-Rata / Total</td>
                                      <td class="text-primary">{{ getStandar(detailData.indicator) }}</td>
                                      <td class="text-primary">{{ monthlyAverage.total_num }}</td>
                                      <td class="text-primary">{{ monthlyAverage.total_denum }}</td>
                                      <td :class="isTercapai(monthlyAverage, detailData.indicator) ? 'text-success' : 'text-danger'">
                                        {{ monthlyAverage.score }}%
                                      </td>
                                      <td>
                                        <span class="badge" :class="isTercapai(monthlyAverage, detailData.indicator) ? 'bg-success' : 'bg-danger'">
                                          <i :class="isTercapai(monthlyAverage, detailData.indicator) ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-1"></i>
                                          {{ isTercapai(monthlyAverage, detailData.indicator) ? 'Tercapai' : 'Tidak Tercapai' }}
                                        </span>
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </div>
                          <div class="col-xl-5">
                            <div class="card border-0 shadow-sm rounded-3 overflow-hidden h-100">
                              <div class="card-header bg-primary py-3 border-0">
                                <h6 class="mb-0 fw-bold text-white"><i class="fas fa-chart-line me-2"></i>Tren Capaian</h6>
                              </div>
                              <div class="card-body p-2">
                                <apexchart 
                                  v-if="chartSeries.length > 0"
                                  ref="chartRef"
                                  width="100%" 
                                  height="280" 
                                  :options="chartOptions" 
                                  :series="chartSeries"
                                ></apexchart>
                                <div v-else class="text-center text-muted py-5">Data grafik tidak tersedia</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Hasil PDSA (Triwulan Only) -->
                        <div class="row g-4 mt-2 mb-4" v-if="filters.tipe === 'triwulan' && detailData.pdsa">
                          <div class="col-12">
                            <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
                              <div class="card-header bg-primary py-2 px-3 border-0 d-flex justify-content-between align-items-center">
                                <h6 class="mb-0 fw-bold text-white small"><i class="fas fa-clipboard-check me-2"></i>Hasil PDSA (Plan-Do-Study-Act)</h6>
                              </div>
                              <div class="card-body p-0">
                                <!-- PLAN -->
                                <div class="py-2 px-3 border-bottom">
                                    <h6 class="fw-bold text-primary mb-2 mt-1" style="font-size: 0.9rem;"><i class="fas fa-clipboard-list me-2"></i> PLAN (Rencana)</h6>
                                    <div class="row g-1" style="font-size: 0.85rem;">
                                        <div class="col-sm-3 fw-bold text-dark">Latar Belakang / Masalah</div>
                                        <div class="col-sm-9 text-muted mb-1">{{ detailData.pdsa.p_latar_belakang || '-' }}</div>
                                        
                                        <div class="col-sm-3 fw-bold text-dark">Tujuan Perbaikan</div>
                                        <div class="col-sm-9 text-muted mb-1">{{ detailData.pdsa.p_tujuan || '-' }}</div>
                                        
                                        <div class="col-sm-3 fw-bold text-dark">Analisis Akar Masalah</div>
                                        <div class="col-sm-9 text-muted mb-1">{{ detailData.pdsa.p_akar_masalah || '-' }}</div>
                                        
                                        <div class="col-sm-3 fw-bold text-dark">Rencana Intervensi</div>
                                        <div class="col-sm-9 text-muted mb-1">{{ detailData.pdsa.p_rencana_intervensi || '-' }}</div>
                                    </div>
                                </div>
                                
                                <!-- DO & STUDY -->
                                <div class="row g-0 border-bottom">
                                    <div class="col-md-6 py-2 px-3 border-end">
                                        <h6 class="fw-bold text-warning mb-2 mt-1" style="font-size: 0.9rem;"><i class="fas fa-running me-2"></i> DO (Pelaksanaan)</h6>
                                        <div class="row g-1" style="font-size: 0.85rem;">
                                            <div class="col-sm-12 fw-bold text-dark">Uraian Pelaksanaan:</div>
                                            <div class="col-sm-12 text-muted mb-2">{{ detailData.pdsa.d_uraian || '-' }}</div>
                                            
                                            <div class="col-sm-12 fw-bold text-dark">Kendala Pelaksanaan:</div>
                                            <div class="col-sm-12 text-muted mb-1">{{ detailData.pdsa.d_kendala || '-' }}</div>
                                        </div>
                                    </div>
                                    <div class="col-md-6 py-2 px-3 bg-light bg-opacity-50">
                                        <h6 class="fw-bold text-info mb-2 mt-1" style="font-size: 0.9rem;"><i class="fas fa-search me-2"></i> STUDY (Pembelajaran)</h6>
                                        <div class="row g-1" style="font-size: 0.85rem;">
                                            <div class="col-sm-12 fw-bold text-dark">Hasil & Data:</div>
                                            <div class="col-sm-12 text-muted mb-2">{{ detailData.pdsa.s_hasil || '-' }}</div>
                                            
                                            <div class="col-sm-12 fw-bold text-dark">Analisis & Pembelajaran:</div>
                                            <div class="col-sm-12 text-muted mb-1">
                                                <div class="mb-1"><i class="fas fa-caret-right text-info me-1"></i> <span class="fw-bold">Analisis:</span> {{ detailData.pdsa.s_analisis || '-' }}</div>
                                                <div><i class="fas fa-caret-right text-info me-1"></i> <span class="fw-bold">Lesson Learned:</span> {{ detailData.pdsa.s_pembelajaran || '-' }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- ACT -->
                                <div class="py-2 px-3 bg-white">
                                    <h6 class="fw-bold text-success mb-2 mt-1" style="font-size: 0.9rem;"><i class="fas fa-check-double me-2"></i> ACT (Tindak Lanjut)</h6>
                                    <div class="d-flex flex-column flex-md-row align-items-md-center gap-3 bg-light p-2 mb-1 rounded-3 border border-success border-opacity-25 shadow-sm">
                                        <div class="text-center text-md-start">
                                            <span class="d-block text-muted mb-1" style="font-size: 0.7rem; font-weight: 800;">KEPUTUSAN</span>
                                            <span class="badge rounded-pill px-3 py-1" :class="{'bg-success': detailData.pdsa.a_keputusan === 'Adopt', 'bg-warning text-dark': detailData.pdsa.a_keputusan === 'Adapt', 'bg-danger': detailData.pdsa.a_keputusan === 'Abandon'}" style="font-size: 0.8rem; min-width: 90px;">
                                                <i class="fas me-1" :class="{'fa-check-circle': detailData.pdsa.a_keputusan === 'Adopt', 'fa-sync-alt': detailData.pdsa.a_keputusan === 'Adapt', 'fa-times-circle': detailData.pdsa.a_keputusan === 'Abandon'}"></i>
                                                {{ detailData.pdsa.a_keputusan ? detailData.pdsa.a_keputusan.toUpperCase() : '-' }}
                                            </span>
                                        </div>
                                        <div class="flex-grow-1 border-start-md ps-md-3 border-2 border-success border-opacity-25" style="font-size: 0.85rem;">
                                            <span class="fw-bold text-dark d-block mb-1">Rencana Tindak Lanjut:</span>
                                            <span class="text-muted" style="line-height: 1.4;">{{ detailData.pdsa.a_tindak_lanjut || 'Belum ada rencana tindak lanjut yang ditentukan.' }}</span>
                                        </div>
                                    </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Rincian Per Ruang / Unit (Only shown in Group/Indikator mode) -->
                        <div class="row g-4 mt-2 mb-5" v-if="filters.jenis === 'group' && detailData.units_detail && detailData.units_detail.length > 0">
                          <div class="col-12">
                            <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
                              <div class="card-header bg-primary py-3 border-0 d-flex justify-content-between align-items-center">
                                <h6 class="mb-0 fw-bold text-white"><i class="fas fa-hospital me-2"></i>Rincian Capaian Per Ruangan / Unit</h6>
                              </div>
                              <div class="table-responsive">
                                <table class="table table-sm mb-0 align-middle">
                                  <colgroup>
                                    <col style="width: 30%;">
                                    <col style="width: 14%;">
                                    <col style="width: 14%;">
                                    <col style="width: 14%;">
                                    <col style="width: 14%;">
                                    <col style="width: 14%;">
                                  </colgroup>
                                  <thead class="bg-gray-50 text-center text-xs fw-800 text-uppercase text-muted">
                                    <tr class="align-middle">
                                      <th class="py-3 text-start ps-4">Nama Ruang / Unit</th>
                                      <th class="py-3">Target</th>
                                      <th class="py-3">Num</th>
                                      <th class="py-3">Denum</th>
                                      <th class="py-3">Capaian</th>
                                      <th class="py-3">Hasil</th>
                                    </tr>
                                  </thead>
                                  <tbody class="text-center font-sm">
                                    <template v-for="u in unitsGrouped" :key="u.id_inmut">
                                      <tr @click="toggleUnitExpand(u.id_inmut)" style="cursor: pointer;" class="hover-bg-light align-middle">
                                        <td class="fw-bold text-start ps-4 py-2">
                                          <div class="d-flex align-items-center">
                                            <i class="fas me-2 text-primary" :class="expandedUnitIds.includes(u.id_inmut) ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                                            <span>{{ u.nama_ruang }}</span>
                                          </div>
                                        </td>
                                        <td class="py-2">{{ getStandar(detailData.indicator) }}</td>
                                        <td class="py-2">{{ u.total_num }}</td>
                                        <td class="py-2">{{ u.total_denum }}</td>
                                        <td class="py-2 fw-bold" :class="isTercapai(u, detailData.indicator) ? 'text-success' : 'text-danger'">
                                          {{ u.score }}%
                                        </td>
                                        <td class="py-2">
                                          <span class="badge" :class="isTercapai(u, detailData.indicator) ? 'bg-success' : 'bg-danger'">
                                            <i :class="isTercapai(u, detailData.indicator) ? 'fas fa-check-circle' : 'fas fa-times-circle'" class="me-1"></i>
                                            {{ isTercapai(u, detailData.indicator) ? 'Tercapai' : 'Tidak Tercapai' }}
                                          </span>
                                        </td>
                                      </tr>
                                      <!-- Monthly nested table for this unit -->
                                      <tr v-if="expandedUnitIds.includes(u.id_inmut)">
                                        <td colspan="6" class="p-3 bg-light border-0">
                                          <div class="px-4 py-3 bg-white rounded-3 border border-light-subtle shadow-sm">
                                            <div class="fw-bold text-xs text-muted mb-2 text-uppercase"><i class="fas fa-calendar-alt me-1 text-primary"></i>Rincian Bulanan Unit: {{ u.nama_ruang }}</div>
                                            <table class="table table-sm table-bordered mb-0 align-middle">
                                              <colgroup>
                                                <col style="width: 30%;">
                                                <col style="width: 14%;">
                                                <col style="width: 14%;">
                                                <col style="width: 14%;">
                                                <col style="width: 14%;">
                                                <col style="width: 14%;">
                                              </colgroup>
                                              <thead class="bg-light text-center text-xs text-muted">
                                                <tr class="align-middle">
                                                  <th class="py-2">Bulan</th>
                                                  <th class="py-2">Target</th>
                                                  <th class="py-2">Num</th>
                                                  <th class="py-2">Denum</th>
                                                  <th class="py-2">Capaian</th>
                                                  <th class="py-2">Hasil</th>
                                                </tr>
                                              </thead>
                                              <tbody class="text-center text-sm">
                                                <tr v-for="m in u.months" :key="m.bulan" class="align-middle">
                                                  <td class="fw-medium py-2">{{ getMonthName(m.bulan) }} {{ m.tahun }}</td>
                                                  <td class="py-2">{{ getStandar(detailData.indicator) }}</td>
                                                  <td class="py-2">{{ m.total_num }}</td>
                                                  <td class="py-2">{{ m.total_denum }}</td>
                                                  <td class="fw-bold py-2" :class="isTercapai(m, detailData.indicator) ? 'text-success' : 'text-danger'">
                                                    {{ m.score }}%
                                                  </td>
                                                  <td class="py-2">
                                                    <span class="badge badge-sm" :class="isTercapai(m, detailData.indicator) ? 'bg-success' : 'bg-danger'">
                                                      {{ isTercapai(m, detailData.indicator) ? 'Tercapai' : 'Tidak Tercapai' }}
                                                    </span>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </div>
                                        </td>
                                      </tr>
                                    </template>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            </tbody>
          </table>
        </div>
      </div>
       <div class="card-footer bg-white border-top-0 py-4 px-4">
         <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div class="pagination-info">
                <span class="text-muted fw-medium">Menampilkan </span>
                <span class="badge bg-light text-primary rounded-pill px-3">{{ paginationRange }}</span>
                <span class="text-muted fw-medium"> dari </span>
                <span class="badge bg-light text-dark rounded-pill px-3">{{ total }}</span>
                <span class="text-muted fw-medium"> data indikator</span>
            </div>
            <nav aria-label="Page navigation" v-if="totalPages > 1">
                <ul class="pagination custom-pagination mb-0">
                    <!-- First Page -->
                    <li class="page-item" :class="{ disabled: page === 1 }">
                        <button class="page-link" @click="changePage(1)" aria-label="First">
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                    </li>
                    
                    <!-- Previous -->
                    <li class="page-item" :class="{ disabled: page === 1 }">
                        <button class="page-link" @click="changePage(page - 1)" aria-label="Previous">
                            <i class="fas fa-angle-left"></i>
                        </button>
                    </li>

                    <!-- Page Numbers -->
                    <li class="page-item" :class="{ active: page === p, disabled: p === '...' }" v-for="(p, idx) in displayedPages" :key="idx">
                        <button v-if="p !== '...'" class="page-link" @click="changePage(p)">{{ p }}</button>
                        <span v-else class="page-link">{{ p }}</span>
                    </li>

                    <!-- Next -->
                    <li class="page-item" :class="{ disabled: page === totalPages }">
                        <button class="page-link" @click="changePage(page + 1)" aria-label="Next">
                            <i class="fas fa-angle-right"></i>
                        </button>
                    </li>

                    <!-- Last Page -->
                    <li class="page-item" :class="{ disabled: page === totalPages }">
                        <button class="page-link" @click="changePage(totalPages)" aria-label="Last">
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
      </div>
    </div>

    <!-- Hidden Chart for Batch Export -->
    <div style="position: absolute; left: -9999px; top: -9999px; visibility: hidden; pointer-events: none;">
        <apexchart 
            v-if="printChartData"
            ref="printChartRef"
            :options="printChartOptions"
            :series="printChartData.series"
            width="600"
            height="300"
        />
    </div>

    <!-- Buku Register Harian Modal -->
    <div class="modal fade show d-block" tabindex="-1" v-if="showRegisterModal" style="background: rgba(0, 0, 0, 0.5); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header text-white py-3 px-4 rounded-top-4 d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #435ebe, #2a4185);">
            <h5 class="modal-title fw-bold m-0 d-flex align-items-center"><i class="fas fa-book me-2"></i> Buku Register Harian</h5>
            <button type="button" class="btn-close btn-close-white" @click="showRegisterModal = false" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-bold text-muted small mb-1">PILIH BULAN &amp; TAHUN</label>
              <input type="month" class="form-control rounded-3 border-light-subtle shadow-none py-2" v-model="modalFilters.bulanTahun" style="height: 42px;">
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold text-muted small mb-1">UNIT / RUANGAN</label>
              <v-select append-to-body
                :options="units"
                label="nama_ruang"
                v-model="modalFilters.unit"
                :reduce="unit => unit.dep_id"
                placeholder="Pilih Unit"
                class="modern-select"
              />
            </div>
          </div>
          <div class="modal-footer bg-light border-0 py-3 px-4 rounded-bottom-4 d-flex justify-content-between modal-action-buttons">
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-success rounded-3 fw-bold py-2 px-3" @click="executeExport('excel')">
                <i class="fas fa-file-excel me-1"></i> Excel
              </button>
              <button type="button" class="btn btn-danger rounded-3 fw-bold py-2 px-3" @click="executeExport('pdf')">
                <i class="fas fa-file-pdf me-1"></i> PDF
              </button>
            </div>
            <button type="button" class="btn btn-light rounded-3 fw-bold border py-2 px-3" @click="showRegisterModal = false">Batal</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/indikatorMutuService'
import VueApexCharts from 'vue3-apexcharts'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import pdfHeader from '@/assets/pdf-header.png'
import pdfFooter from '@/assets/pdf-footer.png'
import QRCode from 'qrcode'
import { useAuthStore } from '@/stores/auth'
import committeeService from '@/services/committeeService'

import logoUrl from '@/assets/logo.png'
import logoLarsiUrl from '@/assets/logo-larsi.png'

const toast = useToast()

const apexchart = VueApexCharts

const authStore = useAuthStore()
const isUnitLocked = ref(false)
const userCommittees = ref([])
const isCommitteeMember = ref(false)
const userUnitId = ref(null)

const showRegisterModal = ref(false)
const modalFilters = reactive({
    bulanTahun: new Date().toISOString().slice(0, 7),
    unit: null
})

const items = ref([])
const units = ref([])
const masterUtamaList = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const periodeInfo = ref(null)

// Detail View State (Refactored for Expandable Rows)
const expandedRowId = ref(null)
const detailLoading = ref(false)
const detailData = ref(null)
const chartRef = ref(null)

// Batch Printing State
const printChartRef = ref(null)
const printChartData = ref(null)
const printingProgress = ref(0)
const showExportDropdown = ref(false)
const exportDropdownRef = ref(null)

let imgLogo = null;
let imgLogoLarsi = null;

const toggleExportDropdown = () => {
    showExportDropdown.value = !showExportDropdown.value
}

const handleExportRekap = () => {
    showExportDropdown.value = false
    exportRekapToPDF()
}

const handleExportFull = () => {
    showExportDropdown.value = false
    exportFullReportToPDF()
}

const handleClickOutside = (event) => {
    if (exportDropdownRef.value && !exportDropdownRef.value.contains(event.target)) {
        showExportDropdown.value = false
    }
}

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

const printChartOptions = reactive({
    chart: { type: 'line', toolbar: { show: false }, animations: { enabled: false } },
    stroke: { 
        width: [4, 2],
        curve: 'smooth',
        dashArray: [0, 8]
    },
    markers: { size: 5 },
    xaxis: { categories: [] },
    yaxis: { min: 0, max: 100 },
    colors: ['#435ebe', '#ff4560'],
    legend: { show: true, position: 'top' }
})

const currentYear = new Date().getFullYear()
const years = Array.from({length: 5}, (_, i) => currentYear - i)

const filters = reactive({
    tahun: currentYear,
    tipe: 'triwulan',
    periode: 1, // Default Triwulan 1
    unit: null,
    id_master: null,
    jenis: 'semua',
    keyword: ''
})

// Watch filters to refresh data
watch(() => filters.tipe, (newVal) => {
    filters.periode = 1
    fetchData()
})

watch(() => filters.jenis, (newVal) => {
    if (newVal === 'group') {
        filters.unit = null; // Clear unit filter when grouping by indicator
    } else {
        filters.id_master = null; // Clear master filter when viewing all units
    }
    fetchData()
})

// Watch filters complex to refresh detail if open
watch(() => [filters.tahun, filters.tipe, filters.periode, filters.unit, filters.jenis, filters.id_master], () => {
    if (expandedRowId.value) {
        // Find the item in the current items list
        const item = items.value.find(i => getRowId(i) === expandedRowId.value);
        if (item) {
            fetchDetail(item, true); // force reload
        } else {
            // If item is no longer in the list after filter change, close it
            closeDetail();
        }
    }
})

const fetchUnits = async () => {
    try {
        const response = await api.getUnits()
        units.value = response.data.data
        
        // Lock unit logic if any
        const userNik = authStore.user?.data?.detail?.nik || authStore.user?.detail?.nik || authStore.user?.nik
        const userDepNameOrId = authStore.user?.data?.detail?.departemen || 
                                authStore.user?.detail?.departemen || 
                                authStore.user?.dep_id
        
        if (userDepNameOrId) {
            const myUnit = units.value.find(u => u.dep_id === userDepNameOrId || u.nama_ruang === userDepNameOrId)
            if (myUnit) {
                userUnitId.value = myUnit.dep_id
                modalFilters.unit = myUnit.dep_id
            }
        }
        
        if (userNik) {
            try {
                const commRes = await committeeService.getByNik(userNik)
                if (commRes.data.success && commRes.data.data.length > 0) {
                    userCommittees.value = commRes.data.data
                    isCommitteeMember.value = true
                } else {
                    if (userUnitId.value) {
                        isUnitLocked.value = true
                        modalFilters.unit = userUnitId.value
                    }
                }
            } catch (err) {
                console.error('Error checking committee:', err)
                if (userUnitId.value) {
                    isUnitLocked.value = true
                    modalFilters.unit = userUnitId.value
                }
            }
        }
    } catch (error) {
        console.error('Error fetching units:', error)
    }
}

const fetchMasterUtama = async () => {
    try {
        const response = await api.getUtama({ limit: 100, status: '1' })
        masterUtamaList.value = response.data.data.data || response.data.data
    } catch (error) {
        console.error('Error fetching master utama:', error)
    }
}

const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: page.value,
            limit: limit.value,
            tahun: filters.tahun,
            tipe: filters.tipe,
            periode: filters.periode,
            dep_id: filters.unit,
            id_master: filters.id_master,
            jenis: filters.jenis,
            keyword: filters.keyword
        }
        const response = await api.getLaporan(params)
        const data = response.data.data
        items.value = data.data
        total.value = data.total
        totalPages.value = data.last_page
        periodeInfo.value = response.data.periode_info
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

let debounceTimeout = null
const debounceFetch = () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
        page.value = 1
        fetchData()
    }, 500)
}

const changePage = (p) => {
    page.value = p
    fetchData()
}

const formatDate = (dateString) => {
    if(!dateString) return '-'
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('id-ID', options)
}

const paginationRange = computed(() => {
    const from = (page.value - 1) * limit.value + 1
    const to = (page.value - 1) * limit.value + items.value.length
    return items.value.length > 0 ? `${from} - ${to}` : '0'
})

const displayedPages = computed(() => {
    const total = totalPages.value
    const current = page.value
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i)
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1)
            } else if (i - l !== 1) {
                rangeWithDots.push('...')
            }
        }
        rangeWithDots.push(i)
        l = i
    }

    return rangeWithDots
})

const getRowId = (item) => {
    if (!item) return ''
    return filters.jenis === 'group' ? `master-${item.id_master}` : `inmut-${item.id_inmut}`
}

const getMonthName = (m) => monthNames[parseInt(m) - 1]

const groupUnitsDetail = (unitsDetail) => {
    if (!unitsDetail) return [];
    const groups = {};
    unitsDetail.forEach(item => {
        const key = item.id_inmut;
        if (!groups[key]) {
            groups[key] = {
                nama_ruang: item.nama_ruang,
                id_inmut: item.id_inmut,
                total_num: 0,
                total_denum: 0,
                months: []
            };
        }
        groups[key].total_num += parseInt(item.total_num);
        groups[key].total_denum += parseInt(item.total_denum);
        groups[key].months.push(item);
    });

    return Object.values(groups).map(g => {
        g.score = g.total_denum > 0 ? parseFloat(((g.total_num / g.total_denum) * 100).toFixed(2)) : 0;
        return g;
    });
}

const expandedUnitIds = ref([])
const toggleUnitExpand = (id) => {
    const idx = expandedUnitIds.value.indexOf(id);
    if (idx > -1) {
        expandedUnitIds.value.splice(idx, 1);
    } else {
        expandedUnitIds.value.push(id);
    }
}

const unitsGrouped = computed(() => {
    if (!detailData.value || !detailData.value.units_detail) return [];
    
    const groups = {};
    detailData.value.units_detail.forEach(item => {
        const key = item.id_inmut;
        if (!groups[key]) {
            groups[key] = {
                nama_ruang: item.nama_ruang,
                id_inmut: item.id_inmut,
                total_num: 0,
                total_denum: 0,
                months: []
            };
        }
        groups[key].total_num += parseInt(item.total_num);
        groups[key].total_denum += parseInt(item.total_denum);
        groups[key].months.push(item);
    });

    return Object.values(groups).map(g => {
        g.score = g.total_denum > 0 ? parseFloat(((g.total_num / g.total_denum) * 100).toFixed(2)) : 0;
        return g;
    });
});

const monthlyAverage = computed(() => {
    if (!detailData.value || !detailData.value.monthly || detailData.value.monthly.length === 0) return null;
    let num = 0;
    let denum = 0;
    detailData.value.monthly.forEach(m => {
        num += parseInt(m.total_num || 0);
        denum += parseInt(m.total_denum || 0);
    });
    
    let score = 0;
    if (denum > 0) {
        score = parseFloat(((num / denum) * 100).toFixed(2));
    }
    
    return {
        total_num: num,
        total_denum: denum,
        score: score
    };
});

const fetchDetail = async (item, force = false) => {
    const rowId = getRowId(item)
    // Toggle off if clicking the same item (unless forced)
    if (!force && expandedRowId.value === rowId) {
        expandedRowId.value = null
        detailData.value = null
        return
    }

    detailLoading.value = true
    expandedRowId.value = rowId
    expandedUnitIds.value = []
    // Only clear if not forced (to keep previous data visible while loading new data if desirable)
    // but clearing is cleaner for "reload" feel
    detailData.value = null
    
    try {
        const params = {
            tahun: filters.tahun,
            tipe: filters.tipe,
            periode: filters.periode,
            dep_id: filters.unit,
            id_inmut: item.id_inmut,
            id_master: item.id_master
        }
        const response = await api.getLaporanDetail(params)
        detailData.value = response.data.data
    } catch (error) {
        console.error(error)
        if (!force) expandedRowId.value = null
    } finally {
        detailLoading.value = false
    }
}

const closeDetail = () => {
    expandedRowId.value = null
    detailData.value = null
}

const chartSeries = computed(() => {
    if (!detailData.value || !detailData.value.monthly) return []
    return [
        {
            name: 'Capaian (%)',
            data: detailData.value.monthly.map(m => m.score)
        },
        {
            name: 'Target',
            type: 'line',
            data: detailData.value.monthly.map(m => {
                const std = parseFloat(detailData.value.indicator.standar_utama || detailData.value.indicator.standar)
                return isNaN(std) ? 0 : std
            })
        }
    ]
})

const chartOptions = computed(() => {
    if (!detailData.value || !detailData.value.monthly) return {}
    
    const months = detailData.value.monthly.map(m => shortMonthNames[parseInt(m.bulan) - 1])
    const std = parseFloat(detailData.value.indicator.standar_utama || detailData.value.indicator.standar)
    
    return {
        chart: {
            height: 350,
            type: 'line',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        stroke: {
            width: [4, 2],
            curve: 'smooth',
            dashArray: [0, 8]
        },
        colors: ['#435ebe', '#ff4560'],
        xaxis: {
            categories: months
        },
        yaxis: {
            min: 0,
            max: 100,
            title: { text: 'Persentase (%)' }
        },
        markers: {
            size: 5,
            hover: { size: 7 }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center'
        },
        grid: {
            borderColor: '#f1f1f1'
        },
        tooltip: {
            y: { formatter: (val) => val + '%' }
        }
    }
})

// Logic reused from AnalisaTab roughly
const getRumusSymbol = (val) => {
    const map = {
        '1': '',
        '2': '<=',
        '3': '<',
        '4': '>=',
        '5': '>'
    }
    return (val in map) ? map[val] : (val || '')
}

const getStandar = (item) => {
    // item here might be from rekap query merged into indicator master
    const ind = item; 
    
    // In Laporan controller we use leftJoin, so fields like 'standar_utama' are available directly on item if joined
    // But our controller logic populates: nama_inmut_utama, standar_utama, etc.
    // However, if we look at `MonitoringIndikatorMutuController` update:
    /*
        $indicators = RsiaMasterInmut::select(...) ... leftJoin(...)
    */
    // So `item` has `standar_utama` etc directly.
    
    const std = (item.standar_utama) ? item.standar_utama : item.standar;
    const rumus = (item.rumus_utama) ? item.rumus_utama : item.rumus;
    let satuan = (item.satuan_utama) ? item.satuan_utama : item.satuan;
    if (satuan === 'Persentase') satuan = '%'
    
    return `${getRumusSymbol(rumus)} ${std} ${satuan || ''}`.trim();
}

const isTercapai = (data, meta = null) => {
    const target = meta || data;
    const std = parseFloat((target.standar_utama) ? target.standar_utama : target.standar);
    const rumus = String((target.rumus_utama) ? target.rumus_utama : target.rumus);
    
    const score = parseFloat(data.score);
    
    if (isNaN(std)) return false;

    switch (rumus) {
        case '1': return score == std; // =
        case '2': return score <= std; // <=
        case '3': return score < std; // <
        case '4': return score >= std; // >=
        case '5': return score > std; // >
        default: return false;
    }
}

onMounted(() => {
    fetchUnits()
    fetchMasterUtama()
    fetchData()
    window.addEventListener('click', handleClickOutside)
    
    const loadImg = (src) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }
    loadImg(logoUrl).then(img => imgLogo = img);
    loadImg(logoLarsiUrl).then(img => imgLogoLarsi = img);
})

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside)
})

const drawPDFHeader = (doc, title, subtitle1, subtitle2, isLandscape = false) => {
    const pageWidth = isLandscape ? 297 : 210;
    const centerX = pageWidth / 2;
    
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    if (imgLogo) {
        doc.addImage(imgLogo, 'PNG', 15, 8, 20, 20);
    }
    if (imgLogoLarsi) {
        doc.addImage(imgLogoLarsi, 'PNG', pageWidth - 49, 11, 34, 13);
    }
    
    doc.setTextColor(33, 37, 41);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RSIA AISYIYAH PEKAJANGAN', centerX, 15, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('JL. RAYA PEKAJANGAN NO. 610 PEKALONGAN, JAWA TENGAH', centerX, 21, { align: 'center' });
    doc.text('Telp: (0285) 785909 | Email: rba610@gmail.com', centerX, 26, { align: 'center' });
    
    // Divider lines
    doc.setDrawColor(33, 37, 41);
    doc.setLineWidth(1.0);
    doc.line(15, 31, pageWidth - 15, 31);
    
    doc.setLineWidth(0.2);
    doc.line(15, 32.5, pageWidth - 15, 32.5);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, centerX, 42, { align: 'center' });
    
    let nextY = 47;
    
    if (subtitle1) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(subtitle1, centerX, nextY, { align: 'center' });
        if (subtitle2) {
            nextY += 5;
            doc.text(subtitle2, centerX, nextY, { align: 'center' });
        }
        nextY += 12; // Extra padding below subtitles
    } else {
        nextY += 10; // Extra padding below main title when no subtitles exist
    }
    
    return nextY;
}

const exportDetailToPDF = async (data) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const indicator = data.indicator;
    const monthly = data.monthly;
    
    // Calculate Overall Summary
    const totalNum = monthly.reduce((sum, m) => sum + (parseFloat(m.total_num) || 0), 0);
    const totalDenum = monthly.reduce((sum, m) => sum + (parseFloat(m.total_denum) || 0), 0);
    const overallScore = totalDenum > 0 ? ((totalNum / totalDenum) * 100).toFixed(2) : 0;
    const isTotalTercapai = isTercapai({ ...indicator, score: overallScore });

    if (filters.jenis === 'group') {
        // Group Mode Layout (Compact, Side-by-Side & Room Details)
        
        let startYHeader = drawPDFHeader(doc, 'LAPORAN CAPAIAN INDIKATOR MUTU', `Periode: ${filters.tipe.toUpperCase()} ${filters.periode} - ${filters.tahun}`, null, false);

        // Content Title
        doc.setTextColor(33, 37, 41);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        const titleLines = doc.splitTextToSize(indicator.nama_inmut_utama || indicator.nama_inmut, 180);
        doc.text(titleLines, 15, startYHeader);
        
        let startYDetails = startYHeader + (titleLines.length * 4.5);
        
        // Summary Text
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        doc.text(`Target / Standar: ${getStandar(indicator)}`, 15, startYDetails + 2);
        doc.text('Total Capaian: ', 90, startYDetails + 2);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(isTotalTercapai ? 21 : 220, isTotalTercapai ? 128 : 53, isTotalTercapai ? 61 : 69);
        doc.text(`${overallScore}% (${isTotalTercapai ? 'TERCAPAI' : 'TIDAK TERCAPAI'})`, 113, startYDetails + 2);
        doc.setTextColor(33, 37, 41);
        
        // Divider Line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(15, startYDetails + 5, 195, startYDetails + 5);
        
        let startYTable = startYDetails + 10;
        
        // Render Monthly Table on Left Column
        const tableHead = [['Bulan', 'Num', 'Denum', 'Capaian (%)', 'Status']];
        const tableBody = monthly.map(m => [
            getMonthName(m.bulan), m.total_num, m.total_denum, `${m.score}%`,
            isTercapai(m, indicator) ? 'Tercapai' : 'Tidak Tercapai'
        ]);

        autoTable(doc, {
            head: tableHead,
            body: tableBody,
            foot: [['Rata-Rata / Total', totalNum, totalDenum, `${overallScore}%`, isTotalTercapai ? 'Tercapai' : 'Tidak Tercapai']],
            startY: startYTable,
            margin: { left: 15 },
            tableWidth: 90,
            theme: 'grid',
            headStyles: { fillColor: [67, 94, 190], fontSize: 8 },
            footStyles: { fillColor: [240, 244, 253], textColor: [33, 37, 41], fontSize: 8, fontStyle: 'bold' },
            styles: { fontSize: 8 },
            didParseCell: function(data) {
                if (data.column.index === 4 && (data.cell.section === 'body' || data.cell.section === 'foot')) {
                    data.cell.styles.textColor = data.cell.text[0] === 'Tercapai' ? [21, 128, 61] : [220, 53, 69];
                }
            }
        });

        // Render Chart on Right Column
        const chartInstance = Array.isArray(chartRef.value) ? chartRef.value[0] : chartRef.value;
        let chartImg = null;
        if (chartInstance) {
            try {
                const chartDataURI = await chartInstance.dataURI({ scale: 3 });
                if (chartDataURI && chartDataURI.imgURI) {
                    chartImg = chartDataURI.imgURI;
                }
            } catch (e) {
                console.error('Chart export failed', e);
            }
        }
        if (chartImg) {
            const imgProps = doc.getImageProperties(chartImg);
            const pdfWidth = 85;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            doc.addImage(chartImg, 'PNG', 110, startYTable, pdfWidth, pdfHeight);
        }

        // Room / Unit Details Table
        const unitsDetail = data.units_detail || [];
        const groupedUnits = groupUnitsDetail(unitsDetail);
        
        if (groupedUnits.length > 0) {
            const nextY = Math.max(doc.lastAutoTable.finalY, startYTable + 42) + 8;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text('Rincian Capaian Per Ruangan / Unit:', 15, nextY);
            
            const roomHead = [['Nama Ruang / Unit', 'Bulan', 'Target', 'Num', 'Denum', 'Capaian (%)', 'Status']];
            const roomBody = [];
            groupedUnits.forEach((ru) => {
                // Main Room Row
                roomBody.push([
                    ru.nama_ruang,
                    'Total',
                    getStandar(indicator),
                    ru.total_num,
                    ru.total_denum,
                    `${ru.score}%`,
                    isTercapai(ru, indicator) ? 'Tercapai' : 'Tidak Tercapai'
                ]);
                
                // Monthly Breakdown Rows
                ru.months.forEach(m => {
                    roomBody.push([
                        '',
                        `${getMonthName(m.bulan)} ${m.tahun}`,
                        getStandar(indicator),
                        m.total_num,
                        m.total_denum,
                        `${m.score}%`,
                        isTercapai(m, indicator) ? 'Tercapai' : 'Tidak Tercapai'
                    ]);
                });
            });

            autoTable(doc, {
                head: roomHead,
                body: roomBody,
                startY: nextY + 3,
                margin: { left: 15, right: 15 },
                theme: 'grid',
                headStyles: { fillColor: [67, 94, 190], fontSize: 8 },
                styles: { fontSize: 8 },
                didParseCell: function(cellData) {
                    if (cellData.row.cells[1].text[0] === 'Total' && cellData.cell.section === 'body') {
                        cellData.cell.styles.fontStyle = 'bold';
                        cellData.cell.styles.fillColor = [240, 244, 253];
                    }
                    if (cellData.column.index === 6 && cellData.cell.section === 'body') {
                        cellData.cell.styles.textColor = cellData.cell.text[0] === 'Tercapai' ? [21, 128, 61] : [220, 53, 69];
                    }
                }
            });
        }
    } else {
        // Header
        let startYHeader = drawPDFHeader(doc, 'LAPORAN CAPAIAN INDIKATOR MUTU', null, null, false);
        
        // Content Info
        doc.setTextColor(33, 37, 41);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(indicator.nama_inmut_utama || indicator.nama_inmut, 15, startYHeader);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (filters.jenis === 'group') {
            doc.text('Kategori', 15, startYHeader + 7);
            doc.text(`: ${indicator.kategori || 'Global'} (Rekapitulasi Global)`, 40, startYHeader + 7);
        } else {
            doc.text('Unit / Ruang', 15, startYHeader + 7);
            doc.text(`: ${indicator.nama_ruang || '-'}`, 40, startYHeader + 7);
        }
        doc.text('Periode', 15, startYHeader + 12);
        doc.text(`: ${filters.tipe.toUpperCase()} ${filters.periode} - ${filters.tahun}`, 40, startYHeader + 12);
        
        // Summary Box
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, startYHeader + 20, 180, 25, 2, 2, 'FD');
        
        doc.setFont('helvetica', 'bold');
        doc.text('Target / Standar', 25, startYHeader + 30);
        doc.text(': ' + getStandar(indicator), 60, startYHeader + 30);
        
        doc.text('Total Capaian', 25, startYHeader + 37);
        doc.text(':', 60, startYHeader + 37);
        
        doc.setTextColor(isTotalTercapai ? 21 : 220, isTotalTercapai ? 128 : 53, isTotalTercapai ? 61 : 69);
        doc.text(`${overallScore}%`, 63, startYHeader + 37);
        doc.text(`(${isTotalTercapai ? 'TERCAPAI' : 'TIDAK TERCAPAI'})`, 85, startYHeader + 37);
        
        doc.setTextColor(33, 37, 41);
        
        let startYChart = startYHeader + 60;
        let startYTable = startYChart + 100; // Increased to accommodate taller chart
        
        // Chart
        const chartInstance = Array.isArray(chartRef.value) ? chartRef.value[0] : chartRef.value;
        
        if (chartInstance) {
            try {
                const chartDataURI = await chartInstance.dataURI({ scale: 3 });
                if (chartDataURI && chartDataURI.imgURI) {
                    doc.setFont('helvetica', 'bold');
                    doc.text('Grafik Tren Capaian Bulanan:', 15, startYChart - 5);
                    
                    const imgProps = doc.getImageProperties(chartDataURI.imgURI);
                    const pdfWidth = 110; // Reduced further from 140 to 110
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    const xOffset = (210 - pdfWidth) / 2; // Center horizontally
                    
                    doc.addImage(chartDataURI.imgURI, 'PNG', xOffset, startYChart, pdfWidth, pdfHeight);
                    startYTable = startYChart + pdfHeight + 10;
                } else {
                    startYTable = startYChart; // No chart, move table up
                }
            } catch (e) {
                console.error('Chart export failed', e);
                startYTable = startYChart;
            }
        } else {
            startYTable = startYChart;
        }
        
        // Table
        const tableHead = [['Bulan', 'Numerator', 'Denominator', 'Capaian (%)', 'Status']];
        const tableBody = monthly.map(m => [
            `${getMonthName(m.bulan)} ${m.tahun}`,
            m.total_num,
            m.total_denum,
            `${m.score}%`,
            isTercapai(m, indicator) ? 'Tercapai' : 'Tidak Tercapai'
        ]);
        
        autoTable(doc, {
            head: tableHead,
            body: tableBody,
            foot: [['Rata-Rata / Total', totalNum, totalDenum, `${overallScore}%`, isTotalTercapai ? 'Tercapai' : 'Tidak Tercapai']],
            startY: startYTable,
            theme: 'grid',
            headStyles: { fillColor: [67, 94, 190], halign: 'center' },
            footStyles: { fillColor: [240, 244, 253], textColor: [33, 37, 41], fontStyle: 'bold', halign: 'center' },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'center', fontStyle: 'bold' },
                4: { halign: 'center' }
            },
            didParseCell: function(data) {
                if (data.column.index === 4 && (data.cell.section === 'body' || data.cell.section === 'foot')) {
                    if (data.cell.text[0] === 'Tercapai') {
                        data.cell.styles.textColor = [21, 128, 61];
                    } else {
                        data.cell.styles.textColor = [220, 53, 69];
                    }
                }
            }
        });

        if (filters.tipe === 'triwulan' && data.pdsa) {
            doc.addPage();
            const nextYPdsa = 20;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(33, 37, 41);
            doc.text('HASIL PDSA (PLAN-DO-STUDY-ACT):', 15, nextYPdsa);
            
            const pdsaHead = [['Tahap', 'Keterangan', 'Uraian']];
            const pdsaBody = [
                [{ content: 'PLAN', rowSpan: 4, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: [13, 110, 253] } }, { content: 'Latar Belakang', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.p_latar_belakang || '-'],
                [{ content: 'Tujuan', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.p_tujuan || '-'],
                [{ content: 'Akar Masalah', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.p_akar_masalah || '-'],
                [{ content: 'Intervensi', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.p_rencana_intervensi || '-'],
                
                [{ content: 'DO', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: [253, 126, 20] } }, { content: 'Pelaksanaan', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.d_uraian || '-'],
                [{ content: 'Kendala', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.d_kendala || '-'],
                
                [{ content: 'STUDY', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: [13, 202, 240] } }, { content: 'Hasil & Data', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.s_hasil || '-'],
                [{ content: 'Analisis', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.s_analisis || '-'],
                [{ content: 'Pembelajaran', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.s_pembelajaran || '-'],
                
                [{ content: 'ACT', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold', textColor: [25, 135, 84] } }, { content: 'Keputusan', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.a_keputusan ? data.pdsa.a_keputusan.toUpperCase() : '-'],
                [{ content: 'Tindak Lanjut', styles: { fontStyle: 'bold', textColor: [33, 37, 41] } }, data.pdsa.a_tindak_lanjut || '-']
            ];
            
            autoTable(doc, {
                head: pdsaHead,
                body: pdsaBody,
                startY: nextYPdsa + 4,
                theme: 'grid',
                headStyles: { fillColor: [67, 94, 190], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
                styles: { fontSize: 8, cellPadding: 3, valign: 'middle', textColor: [100, 100, 100] },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 35, fillColor: [248, 249, 250] },
                    2: { cellWidth: 'auto' }
                }
            });
        }
    }
    
    // Footer - Page Number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 200, 285, { align: 'right' });
    }
    
    doc.save(`Laporan_Indikator_${indicator.nama_inmut.replace(/\s+/g, '_')}_${filters.tahun}.pdf`);
}

const exportRekapToPDF = async () => {
    loading.value = true;
    let allItems = [];
    try {
        const params = {
            page: 1,
            limit: 1000,
            tahun: filters.tahun,
            tipe: filters.tipe,
            periode: filters.periode,
            dep_id: filters.unit,
            jenis: filters.jenis
        }
        const response = await api.getLaporan(params)
        allItems = response.data.data.data
    } catch (error) {
        console.error('Failed to fetch all data for PDF', error);
        allItems = items.value; // fallback to current page
    } finally {
        loading.value = false;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Header
    const isGroup = filters.jenis === 'group';
    let subtitle = '';
    if (isGroup) {
        subtitle = `Tampilan: Indikator (Rekapitulasi Global) | Periode: ${filters.tipe.toUpperCase()} ${filters.periode} Tahun ${filters.tahun}`;
    } else {
        const unitText = filters.unit ? units.value.find(u => u.dep_id === filters.unit)?.nama_ruang : 'Seluruh Unit';
        subtitle = `Unit: ${unitText} | Periode: ${filters.tipe.toUpperCase()} ${filters.periode} Tahun ${filters.tahun}`;
    }
    let startYTable = drawPDFHeader(doc, 'REKAPITULASI CAPAIAN INDIKATOR MUTU', subtitle, null, true);
    
    const tableHead = [
        isGroup 
            ? ['#', 'Indikator', 'Kategori', 'Target', 'Num', 'Denum', 'Capaian (%)', 'Status']
            : ['#', 'Indikator', 'Unit/Ruang', 'Target', 'Num', 'Denum', 'Capaian (%)', 'Status']
    ];
    const tableBody = allItems.map((item, index) => [
        index + 1,
        item.nama_inmut,
        isGroup ? (item.kategori || 'Global') : (item.nama_ruang || '-'),
        getStandar(item),
        item.total_num,
        item.total_denum,
        `${item.score}%`,
        isTercapai(item) ? 'Tercapai' : 'Tidak Tercapai'
    ]);
    
    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: startYTable,
        theme: 'grid',
        headStyles: { fillColor: [67, 94, 190], halign: 'center' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 80 },
            4: { halign: 'center' },
            5: { halign: 'center' },
            6: { halign: 'center', fontStyle: 'bold' },
            7: { halign: 'center' }
        },
        didParseCell: function(data) {
             if (data.column.index === 7 && data.cell.section === 'body') {
                if (data.cell.text[0] === 'Tercapai') {
                    data.cell.styles.textColor = [21, 128, 61];
                } else {
                    data.cell.styles.textColor = [220, 53, 69];
                }
            }
        }
    });
    
    doc.save(`Rekap_Mutu_${filters.tahun}_${filters.tipe}_${filters.periode}.pdf`);
}

const exportFullReportToPDF = async () => {
    loading.value = true;
    printingProgress.value = 1;
    
    try {
        // 1. Fetch ALL Indicators
        const params = {
            page: 1,
            limit: 1000,
            tahun: filters.tahun,
            tipe: filters.tipe,
            periode: filters.periode,
            dep_id: filters.unit,
            jenis: filters.jenis
        }
        const response = await api.getLaporan(params)
        const allItems = response.data.data.data
        
        if (allItems.length === 0) {
            toast.warning('Tidak ada data untuk diekspor');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const totalItems = allItems.length;

        for (let i = 0; i < totalItems; i++) {
            const item = allItems[i];
            printingProgress.value = Math.round(((i) / totalItems) * 100);
            
            // 2. Fetch Detail for this indicator
            const detailRes = await api.getLaporanDetail({
                id_inmut: item.id_inmut,
                id_master: item.id_master,
                tahun: filters.tahun,
                tipe: filters.tipe,
                periode: filters.periode,
                dep_id: filters.unit
            });
            const monthly = detailRes.data.data.monthly;

            // 3. Render Chart to Hidden Component
            printChartOptions.xaxis.categories = monthly.map(m => shortMonthNames[parseInt(m.bulan) - 1]);
            
            printChartData.value = {
                series: [
                    {
                        name: 'Capaian (%)',
                        data: monthly.map(m => m.score)
                    },
                    {
                        name: 'Target',
                        data: monthly.map(() => {
                            const std = parseFloat(item.standar_utama || item.standar)
                            return isNaN(std) ? 0 : std
                        })
                    }
                ]
            };
            
            // Wait for Vue to render and ApexCharts to be ready
            await new Promise(resolve => setTimeout(resolve, 600));
            
            let chartImg = null;
            if (printChartRef.value) {
                const uri = await printChartRef.value.dataURI({ scale: 3 });
                chartImg = uri.imgURI;
            }

            // 4. Build PDF Page
            if (i > 0) doc.addPage();
            
            let startYHeader = drawPDFHeader(doc, 'LAPORAN CAPAIAN INDIKATOR MUTU', null, null, false);
            
            if (filters.jenis === 'group') {
                // Group Mode Layout (Compact, Side-by-Side & Room Details)
                
                // Content Title
                doc.setTextColor(33, 37, 41);
                doc.setFontSize(10); doc.setFont('helvetica', 'bold');
                const titleLines = doc.splitTextToSize(`${i+1}. ${item.nama_inmut}`, 180);
                doc.text(titleLines, 15, startYHeader);
                
                let startYDetails = startYHeader + (titleLines.length * 4.5);
                
                // Summary Text
                doc.setFontSize(9); doc.setFont('helvetica', 'normal');
                doc.text(`Target / Standar: ${getStandar(item)}`, 15, startYDetails + 2);
                doc.text('Total Capaian: ', 90, startYDetails + 2);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(isTercapai(item) ? 21 : 220, isTercapai(item) ? 128 : 53, isTercapai(item) ? 61 : 69);
                doc.text(`${item.score}% (${isTercapai(item) ? 'TERCAPAI' : 'TIDAK TERCAPAI'})`, 113, startYDetails + 2);
                doc.setTextColor(33, 37, 41);
                
                // Divider Line
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.2);
                doc.line(15, startYDetails + 5, 195, startYDetails + 5);
                
                let startYTable = startYDetails + 10;
                
                // Render Monthly Table on Left Column
                const tableHead = [['Bulan', 'Num', 'Denum', 'Capaian (%)', 'Status']];
                const tableBody = monthly.map(m => [
                    getMonthName(m.bulan), m.total_num, m.total_denum, `${m.score}%`,
                    isTercapai(m, item) ? 'Tercapai' : 'Tidak Tercapai'
                ]);

                autoTable(doc, {
                    head: tableHead,
                    body: tableBody,
                    startY: startYTable,
                    margin: { left: 15 },
                    tableWidth: 90,
                    theme: 'grid',
                    headStyles: { fillColor: [67, 94, 190], fontSize: 8 },
                    styles: { fontSize: 8 },
                    didParseCell: function(data) {
                        if (data.column.index === 4 && data.cell.section === 'body') {
                            data.cell.styles.textColor = data.cell.text[0] === 'Tercapai' ? [21, 128, 61] : [220, 53, 69];
                        }
                    }
                });

                // Render Chart on Right Column
                if (chartImg) {
                    doc.addImage(chartImg, 'PNG', 110, startYTable, 85, 42);
                }

                // Room / Unit Details Table
                const unitsDetail = detailRes.data.data.units_detail || [];
                const groupedUnits = groupUnitsDetail(unitsDetail);
                
                if (groupedUnits.length > 0) {
                    const nextY = Math.max(doc.lastAutoTable.finalY, startYTable + 42) + 8;
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9);
                    doc.text('Rincian Capaian Per Ruangan / Unit:', 15, nextY);
                    
                    const roomHead = [['Nama Ruang / Unit', 'Bulan', 'Target', 'Num', 'Denum', 'Capaian (%)', 'Status']];
                    const roomBody = [];
                    groupedUnits.forEach((ru) => {
                        // Main Room Row
                        roomBody.push([
                            ru.nama_ruang,
                            'Total',
                            getStandar(item),
                            ru.total_num,
                            ru.total_denum,
                            `${ru.score}%`,
                            isTercapai(ru, item) ? 'Tercapai' : 'Tidak Tercapai'
                        ]);
                        
                        // Monthly Breakdown Rows
                        ru.months.forEach(m => {
                            roomBody.push([
                                '',
                                `${getMonthName(m.bulan)} ${m.tahun}`,
                                getStandar(item),
                                m.total_num,
                                m.total_denum,
                                `${m.score}%`,
                                isTercapai(m, item) ? 'Tercapai' : 'Tidak Tercapai'
                            ]);
                        });
                    });

                    autoTable(doc, {
                        head: roomHead,
                        body: roomBody,
                        startY: nextY + 3,
                        margin: { left: 15, right: 15 },
                        theme: 'grid',
                        headStyles: { fillColor: [67, 94, 190], fontSize: 8 },
                        styles: { fontSize: 8 },
                        didParseCell: function(cellData) {
                            if (cellData.row.cells[1].text[0] === 'Total' && cellData.cell.section === 'body') {
                                cellData.cell.styles.fontStyle = 'bold';
                                cellData.cell.styles.fillColor = [240, 244, 253];
                            }
                            if (cellData.column.index === 6 && cellData.cell.section === 'body') {
                                cellData.cell.styles.textColor = cellData.cell.text[0] === 'Tercapai' ? [21, 128, 61] : [220, 53, 69];
                            }
                        }
                    });
                }
            } else {
                // Page Header (Simple version for all-in-one - Semua Mode)
                let startYHeader = drawPDFHeader(doc, 'LAPORAN INDIKATOR MUTU', `Periode: ${filters.tipe.toUpperCase()} ${filters.periode} - ${filters.tahun}`, null, false);

                // Content
                doc.setTextColor(33, 37, 41);
                doc.setFontSize(11); doc.setFont('helvetica', 'bold');
                doc.text(`${i+1}. ${item.nama_inmut}`, 15, startYHeader, { maxWidth: 180 });
                
                doc.setFontSize(9); doc.setFont('helvetica', 'normal');
                doc.text('Unit / Ruang', 15, startYHeader + 10);
                doc.text(`: ${item.nama_ruang || '-'}`, 35, startYHeader + 10);
                
                // Summary Box
                doc.setDrawColor(226, 232, 240); doc.setFillColor(248, 250, 252);
                doc.roundedRect(15, startYHeader + 15, 180, 20, 2, 2, 'FD');
                doc.setFont('helvetica', 'bold');
                doc.text('Target:', 20, startYHeader + 25); doc.text(getStandar(item), 45, startYHeader + 25);
                doc.text('Capaian:', 100, startYHeader + 25); 
                doc.setTextColor(isTercapai(item) ? 21 : 220, isTercapai(item) ? 128 : 53, isTercapai(item) ? 61 : 69);
                doc.text(`${item.score}% (${isTercapai(item) ? 'TERCAPAI' : 'TIDAK TERCAPAI'})`, 118, startYHeader + 25);
                doc.setTextColor(33, 37, 41);

                let startYChart = startYHeader + 40;
                let startYTable = startYChart + 90; // Increased to accommodate taller chart

                // Chart Image
                if (chartImg) {
                    const imgProps = doc.getImageProperties(chartImg);
                    const pdfWidth = 110; // Reduced further from 140 to 110
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    const xOffset = (210 - pdfWidth) / 2; // Center horizontally
                    
                    doc.addImage(chartImg, 'PNG', xOffset, startYChart, pdfWidth, pdfHeight);
                    startYTable = startYChart + pdfHeight + 10;
                } else {
                    startYTable = startYChart;
                }

                // Table
                const tableHead = [['Bulan', 'Num', 'Denum', 'Score', 'Status']];
                const tableBody = monthly.map(m => [
                    getMonthName(m.bulan), m.total_num, m.total_denum, `${m.score}%`,
                    isTercapai(m, item) ? 'Tercapai' : 'Tidak Tercapai'
                ]);

                autoTable(doc, {
                    head: tableHead,
                    body: tableBody,
                    startY: startYTable,
                    theme: 'grid',
                    headStyles: { fillColor: [67, 94, 190], fontSize: 8 },
                    styles: { fontSize: 8 },
                    didParseCell: function(data) {
                        if (data.column.index === 4 && data.cell.section === 'body') {
                            data.cell.styles.textColor = data.cell.text[0] === 'Tercapai' ? [21, 128, 61] : [220, 53, 69];
                        }
                    }
                });
            }
        }

        printingProgress.value = 100;
        doc.save(`Laporan_Lengkap_Mutu_${filters.tahun}_${filters.tipe}.pdf`);
        toast.success('Laporan lengkap berhasil dibuat');
    } catch (error) {
        console.error('Full report export failed', error);
        toast.error('Gagal membuat laporan lengkap');
    } finally {
        loading.value = false;
        setTimeout(() => { printingProgress.value = 0; }, 2000);
    }
}

// === BUKU REGISTER HARIAN EXPORT METHODS ===
const openRegisterModal = () => {
    showExportDropdown.value = false
    modalFilters.unit = filters.unit || userUnitId.value || (units.value.length > 0 ? units.value[0].dep_id : null)
    if (isUnitLocked.value && userUnitId.value) {
        modalFilters.unit = userUnitId.value
    }
    showRegisterModal.value = true
}

const executeExport = async (format) => {
    showRegisterModal.value = false
    await exportRegisterBulanan(format)
}

const formatMonthYear = (dateStr) => {
    if (!dateStr) return ''
    const [year, month] = dateStr.split('-')
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${months[parseInt(month) - 1]} ${year}`
}

const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '-'
    const d = new Date(dateTimeStr)
    const pad = (n) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
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

const needsDenominator = (item) => {
    return item.satuan === '%' || item.satuan === 'Persen' || item.rumus
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

const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
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

const exportRegisterBulanan = async (format) => {
    if (!modalFilters.unit) {
        toast.warning('Silakan pilih unit terlebih dahulu')
        return
    }
    loading.value = true
    try {
        const dateStr = modalFilters.bulanTahun
        const [year, month] = dateStr.split('-').map(x => parseInt(x))
        
        // Fetch all indicators for this unit
        const masterRes = await api.getRuang({
            limit: 100,
            status: '1',
            dep_id: modalFilters.unit
        })
        const rawItems = masterRes.data.data.data || masterRes.data.data || []
        const targetIndicators = rawItems.filter(item => item.dep_id === modalFilters.unit)
        
        if (targetIndicators.length === 0) {
            toast.warning('Tidak ada indikator mutu yang terdaftar untuk unit ini.')
            loading.value = false
            return
        }

        // Fetch all realisasi records for this month and unit
        const response = await api.getRealisasi({
            dep_id: modalFilters.unit,
            bulan: month,
            tahun: year
        })
        const realisasiList = response.data.data || []

        // Fetch all analysis records for this month and unit
        let analisaListAll = []
        try {
            const getAnalisaRes = await api.getAnalisa({
                dep_id: modalFilters.unit,
                bulan: dateStr,
                limit: 100
            })
            analisaListAll = getAnalisaRes.data.success ? (getAnalisaRes.data.data?.data || getAnalisaRes.data.data || []) : []
        } catch (e) {
            console.error('Failed to fetch analysis records:', e)
        }

        // Feedback is loaded directly with getAnalisa records
        
        if (realisasiList.length === 0) {
            toast.warning('Tidak ada data entrian harian untuk periode ini.')
            loading.value = false
            return
        }

        const daysInMonth = new Date(year, month, 0).getDate()
        const activeUnit = units.value.find(u => u.dep_id === modalFilters.unit)
        const unitName = activeUnit?.nama_ruang || modalFilters.unit

        if (format === 'excel') {
            const wb = XLSX.utils.book_new()
            
            for (const indicator of targetIndicators) {
                const indRealisasi = realisasiList.filter(r => r.id_inmut === indicator.id_inmut)
                
                const wsData = [
                    ['BUKU REGISTER HARIAN INDIKATOR MUTU'],
                    [`Unit: ${unitName} | Periode: ${formatMonthYear(dateStr)}`],
                    [`Indikator: ${indicator.nama_inmut}`],
                    [],
                    [
                        'No', 'Tanggal', 
                        'Num (Sebelum Validasi)', 'Denum (Sebelum Validasi)', 'Hasil (Sebelum Validasi)', 
                        'Num (Setelah Validasi)', 'Denum (Setelah Validasi)', 'Hasil (Setelah Validasi)', 
                        'Penginput', 'Tgl/Jam Input', 'TTE Penginput', 
                        'Verifikator PIC', 'Tgl/Jam Verif PIC', 'TTE PIC', 
                        'Verifikator Koor', 'Tgl/Jam Verif Koor', 'TTE Koor'
                    ]
                ]

                for (let d = 1; d <= daysInMonth; d++) {
                    const targetDateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
                    const r = indRealisasi.find(item => item.tanggal_inmut && item.tanggal_inmut.slice(0, 10) === targetDateStr)
                    
                    if (r) {
                        const numUserStr = r.num_user !== null && r.num_user !== undefined ? r.num_user : '-'
                        const denumUserStr = needsDenominator(indicator) ? (r.denum_user !== null && r.denum_user !== undefined ? r.denum_user : '-') : '-'
                        
                        let scoreValUser = '-'
                        if (needsDenominator(indicator)) {
                            if (r.denum_user > 0) {
                                scoreValUser = `${Math.round((r.num_user / r.denum_user) * 100 * 100) / 100}%`
                            }
                        } else if (r.num_user !== null && r.num_user !== undefined) {
                            scoreValUser = `${r.num_user}`
                        }

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
                        const ttePic = r.pic_verified_by ? `TTE-ELEKTRONIK-PIC-${r.pic_verified_by}` : '-'
                        const tteKoor = r.koor_verified_by ? `TTE-ELEKTRONIK-KOOR-${r.koor_verified_by}` : '-'

                        wsData.push([
                            d,
                            formatDateIndoShort(targetDateStr),
                            numUserStr,
                            denumUserStr,
                            scoreValUser,
                            numStr,
                            denumStr,
                            scoreVal,
                            r.penginput?.nama || r.nik_input || '-',
                            r.tanggal_input ? formatDateTime(r.tanggal_input) : '-',
                            tteInput,
                            r.pic_verified?.nama || r.pic_verified_by || '-',
                            r.pic_verified_at ? formatDateTime(r.pic_verified_at) : '-',
                            ttePic,
                            r.koor_verified?.nama || r.koor_verified_by || '-',
                            r.koor_verified_at ? formatDateTime(r.koor_verified_at) : '-',
                            tteKoor
                        ])
                    } else {
                        wsData.push([
                            d,
                            formatDateIndoShort(targetDateStr),
                            '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'
                        ])
                    }
                }

                const ws = XLSX.utils.aoa_to_sheet(wsData)
                const sheetName = indicator.nama_inmut.replace(/[\[\]\*\?:\/\\]/g, '').slice(0, 30)
                XLSX.utils.book_append_sheet(wb, ws, sheetName)
            }
            
            XLSX.writeFile(wb, `Buku_Register_Harian_${unitName.replace(/\s+/g, '_')}_${dateStr}.xlsx`)
            toast.success('Buku Register Harian Excel berhasil diunduh')

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
                        if (r.pic_verified_by) {
                            const name = r.pic_verified?.nama || r.pic_verified_by
                            const txt = `TTE PIC Verifikator\nNama: ${name}\nNIK: ${r.pic_verified_by}\nTanggal: ${formatDateTime(r.pic_verified_at)}`
                            qrCache[d].picQR = await generateQRCode(txt)
                        }
                        if (r.koor_verified_by) {
                            const name = r.koor_verified?.nama || r.koor_verified_by
                            const txt = `TTE Koor Verifikator\nNama: ${name}\nNIK: ${r.koor_verified_by}\nTanggal: ${formatDateTime(r.koor_verified_at)}`
                            qrCache[d].koorQR = await generateQRCode(txt)
                        }
                    }
                }

                doc.setFont('Helvetica', 'bold')
                doc.setFontSize(10)
                doc.setTextColor(0, 0, 0)
                doc.text('BUKU REGISTER HARIAN INDIKATOR MUTU', 105, 36, { align: 'center' })
                
                doc.setFontSize(8.5)
                doc.text(`Indikator : ${indicator.nama_inmut}`, 15, 44)
                doc.setFont('Helvetica', 'normal')
                doc.text(`Unit Kerja: ${unitName}`, 15, 49)
                doc.text(`Periode   : ${formatMonthYear(dateStr)}`, 15, 54)

                const tableData = []
                for (let d = 1; d <= daysInMonth; d++) {
                    const targetDateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
                    const r = indRealisasi.find(item => item.tanggal_inmut && item.tanggal_inmut.slice(0, 10) === targetDateStr)

                    if (r) {
                        const numUserStr = r.num_user !== null && r.num_user !== undefined ? r.num_user : '-'
                        const denumUserStr = needsDenominator(indicator) ? (r.denum_user !== null && r.denum_user !== undefined ? r.denum_user : '-') : '-'
                        
                        let scoreValUser = '-'
                        if (needsDenominator(indicator)) {
                            if (r.denum_user > 0) {
                                scoreValUser = `${Math.round((r.num_user / r.denum_user) * 100 * 100) / 100}%`
                            }
                        } else if (r.num_user !== null && r.num_user !== undefined) {
                            scoreValUser = `${r.num_user}`
                        }

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

                        const picName = r.pic_verified?.nama || r.pic_verified_by || '-'
                        const picTime = r.pic_verified_at ? formatDateTime(r.pic_verified_at).slice(11) : '-'
                        const picDate = r.pic_verified_at ? formatDateTime(r.pic_verified_at).slice(0, 10) : '-'
                        const picTextStr = r.pic_verified_by ? `${picName}\nNIK: ${r.pic_verified_by}\n${picDate} ${picTime}` : '-'

                        const koorName = r.koor_verified?.nama || r.koor_verified_by || '-'
                        const koorTime = r.koor_verified_at ? formatDateTime(r.koor_verified_at).slice(11) : '-'
                        const koorDate = r.koor_verified_at ? formatDateTime(r.koor_verified_at).slice(0, 10) : '-'
                        const koorTextStr = r.koor_verified_by ? `${koorName}\nNIK: ${r.koor_verified_by}\n${koorDate} ${koorTime}` : '-'

                        tableData.push([
                            d,
                            formatDateIndoShort(targetDateStr),
                            numUserStr,
                            denumUserStr,
                            scoreValUser,
                            numStr,
                            denumStr,
                            scoreVal,
                            inputText,
                            picTextStr,
                            koorTextStr
                        ])
                    } else {
                        tableData.push([
                            d,
                            formatDateIndoShort(targetDateStr),
                            '-', '-', '-', '-', '-', '-', '-', '-', '-'
                        ])
                    }
                }

                autoTable(doc, {
                    startY: 58,
                    margin: { left: 15, right: 15, bottom: 20 },
                    tableWidth: 180,
                    head: [
                        [
                            { content: 'NO', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                            { content: 'TANGGAL', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                            { content: 'SEBELUM VALIDASI', colSpan: 3, styles: { halign: 'center' } },
                            { content: 'SETELAH VALIDASI', colSpan: 3, styles: { halign: 'center' } },
                            { content: 'PENGINPUT', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                            { content: 'VERIFIKASI PIC', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
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
                        8: { cellWidth: 34, halign: 'left', cellPadding: { top: 2, bottom: 2, left: 1, right: 11 } },
                        9: { cellWidth: 34, halign: 'left', cellPadding: { top: 2, bottom: 2, left: 1, right: 11 } },
                        10: { cellWidth: 36, halign: 'left', cellPadding: { top: 2, bottom: 2, left: 1, right: 11 } }
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
                                } else if (data.column.index === 9 && cache.picQR) {
                                    doc.addImage(cache.picQR, 'PNG', cell.x + cell.width - 10, qrY, qrSize, qrSize)
                                } else if (data.column.index === 10 && cache.koorQR) {
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

            const pageCount = doc.internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                if (headerImg) {
                    doc.addImage(headerImg, 'PNG', 0, 0, 210, 27.01)
                }
                if (footerImg) {
                    doc.addImage(footerImg, 'PNG', 0, 285.82, 210, 11.18)
                }
            }

            const pdfBlob = doc.output('blob')
            const url = URL.createObjectURL(pdfBlob)
            window.open(url, '_blank')
            toast.success('Buku Register Harian PDF berhasil dibuka')
        }
    } catch (error) {
        console.error('Export failed:', error)
        toast.error('Gagal mengekspor Buku Register Harian')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.filter-card {
    background: #fff;
    padding: 1.25rem;
    border-radius: 12px;
}

.filter-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #8c98a5;
    margin-bottom: 0.5rem;
    display: block;
    letter-spacing: 0.5px;
}

/* Custom Segmented Control */
.custom-segmented-control {
    display: flex;
    position: relative;
    background: #f4f6f9;
    padding: 3px;
    border-radius: 8px;
    height: 38px;
    z-index: 1;
}

.custom-segmented-control label {
    flex: 1;
    z-index: 2;
    font-size: 0.85rem;
    font-weight: 600;
    color: #6e7985;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 0.3s ease;
    margin-bottom: 0;
}

.custom-segmented-control input:checked + label {
    color: #fff;
}

/* Logic for slider background movement would require JS or fixed widths, 
   for now we use a simpler checked approach with pure CSS */
.custom-segmented-control input:checked + label {
    background: #435ebe;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(67, 94, 190, 0.2);
}

.period-selector label {
    font-weight: 800;
}

/* Modern V-Select Styling */
.modern-select :deep(.vs__dropdown-toggle) {
    background: #f4f6f9;
    border: none;
    border-radius: 8px;
    height: 38px;
    padding: 0 4px;
}

.modern-select :deep(.vs__selected) {
    font-weight: 600;
    font-size: 0.85rem;
    color: #435ebe;
}

.modern-select :deep(.vs__search::placeholder) {
    color: #6e7985;
    font-size: 0.85rem;
}

.modern-select :deep(.vs__dropdown-menu) {
    min-width: 450px !important;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border: 1px solid #eef2f7;
    padding: 6px 0;
}

.modern-select :deep(.vs__dropdown-option) {
    white-space: normal !important;
    word-break: break-word !important;
    line-height: 1.4;
    padding: 8px 12px;
    font-size: 0.85rem;
    color: #495057;
    border-bottom: 1px solid #f8f9fa;
}

.modern-select :deep(.vs__dropdown-option--highlight) {
    background: #435ebe !important;
    color: #fff !important;
}

.action-area-buttons .btn,
.modal-action-buttons .btn {
    width: auto !important;
}

.action-area-buttons .dropdown .btn {
    width: 100% !important;
}

.btn-refresh {
    background: #eef2f7;
    color: #435ebe;
    border: none;
    height: 38px;
    transition: all 0.2s;
}

.btn-refresh:hover {
    background: #435ebe;
    color: #fff;
}

/* Custom Pagination Styling */
.custom-pagination {
    gap: 6px;
}

.custom-pagination .page-item .page-link {
    border: none;
    background: #f4f6f9;
    color: #6e7985;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px !important;
    font-weight: 700;
    font-size: 0.85rem;
    transition: all 0.2s ease;
}

.custom-pagination .page-item.active .page-link {
    background: #435ebe;
    color: #fff;
    box-shadow: 0 4px 10px rgba(67, 94, 190, 0.35);
}

.custom-pagination .page-item:not(.active):not(.disabled) .page-link:hover {
    background: #eef2f7;
    color: #435ebe;
    transform: translateY(-2px);
}

.custom-pagination .page-item.disabled .page-link {
    background: #f8f9fa;
    color: #dee2e6;
    cursor: not-allowed;
}

.pagination-info {
    font-size: 0.85rem;
}

.pagination-info .badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
}

/* Pagination Adjustments */
/* Expansion Transition */
.expandable-content-wrapper {
  max-height: 0;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

tr.table-active + tr .expandable-content-wrapper {
  max-height: 4000px; /* Large enough to fit content including expanded nested rooms */
}

.detail-container {
  background-color: #f8fafc;
  border-top: 1px dashed #e2e8f0;
  border-bottom: 3px solid #435ebe;
}

/* Detail UI Components */
.btn-detail-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1.5px solid #e2e8f0;
  color: #64748b;
  padding: 6px 16px;
  border-radius: 50rem;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s;
}

.btn-detail-toggle:hover {
  border-color: #435ebe;
  color: #435ebe;
  transform: translateY(-1px);
}

.btn-detail-toggle.active {
  background: #435ebe;
  border-color: #435ebe;
  color: white;
  box-shadow: 0 4px 10px rgba(67, 94, 190, 0.25);
}

.transition-transform {
  transition: transform 0.3s ease;
}

.fa-rotate-180 {
  transform: rotate(180deg);
}

.detail-header-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
}

.detail-icon-box {
  width: 40px;
  height: 40px;
  background: rgba(67, 94, 190, 0.1);
  color: #435ebe;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 0.82rem;
  color: #334155;
  font-weight: 600;
  line-height: 1.4;
}

.target-card-mini {
  background: #f1f5f9;
  padding: 12px 16px;
  border-radius: 10px;
}

.target-value {
  font-weight: 800;
  color: #435ebe;
}

.bg-gray-50 {
  background-color: #f8fafc;
}

.text-xs { font-size: 0.7rem; }
.font-sm { font-size: 0.85rem; }
.fw-800 { font-weight: 800; }

.animate-fade-in {
  animation: fadeIn 0.4s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media print {
  .expandable-content-wrapper { max-height: none !important; }
  .btn-detail-toggle, .filter-card, .card-footer { display: none !important; }
}

@media (max-width: 991px) {
    .filter-card .row > div {
        margin-bottom: 1rem;
    }
}

@media (max-width: 768px) {
  .pagination-info {
    width: 100%;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .custom-pagination {
    width: 100%;
    justify-content: center;
  }

  .pagination {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    flex-wrap: nowrap !important;
  }
}

/* Reset any blue outlines or focus rings on nested tables and interactive rows */
.detail-container table,
.detail-container tr,
.detail-container td,
.detail-container th {
    outline: none !important;
    box-shadow: none !important;
}

/* Ensure nested room sub-tables use a clean, soft border color */
.detail-container .table-responsive table,
.detail-container .table-responsive table tr,
.detail-container .table-responsive table td,
.detail-container .table-responsive table th {
    border-color: #e2e8f0 !important;
}
</style>

<style>
.vs__dropdown-menu {
    z-index: 9999 !important;
}
</style>
