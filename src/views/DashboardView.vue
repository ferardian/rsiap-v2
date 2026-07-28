<template>
  <div class="dashboard-page">

    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>Selamat datang, {{ getDisplayName }}! 👋</h2>
            <p>{{ getWelcomeMessage }}</p>
            <div class="user-badges">
              <div class="user-badge">
                <span class="badge-text">{{ getUserPosition }}</span>
              </div>
              <div class="department-badge">
                <span class="dept-text">{{ departmentName }}</span>
              </div>
            </div>
          </div>
          <div class="date-time-info">
            <div class="date-time">{{ currentDateTime }}</div>
            <div class="session-info">Sesi aktif</div>
          </div>
        </div>

        <!-- Personal Alert: If email is missing/invalid -->
        <div v-if="isEmailInvalid" class="personal-alert mt-4 animate-fade-in-down">
          <div class="personal-alert-card">
            <div class="personal-alert-icon">
              <i class="fas fa-envelope-open-text"></i>
            </div>
            <div class="personal-alert-content">
              <strong>Email Belum Valid!</strong>
              <span>Email Anda belum terdaftar atau format tidak sesuai. Mohon lengkapi di menu profil.</span>
            </div>
            <router-link to="/profil" class="btn-fix-email">
              Lengkapi Sekarang
            </router-link>
          </div>
        </div>
      </section>

      <!-- Statistics Cards -->
      <section class="stats-section">
        <!-- Filter Section -->
        <div class="filter-section mb-12 flex flex-nowrap justify-end items-center gap-3">

          <!-- Tab-Style Filter (Reference Design) -->
          <div class="filter-tabs-container">
            <div
              @click="selectPeriod('today')"
              role="button"
              tabindex="0"
              class="filter-tab-item"
              :class="{ 'active': selectedPeriod === 'today' }"
            >
              <i class="fas fa-calendar-day"></i>
              <span>Hari Ini</span>
            </div>
            
            <div
              @click="selectPeriod('month')"
              role="button"
              tabindex="0"
              class="filter-tab-item"
              :class="{ 'active': selectedPeriod === 'month' }"
            >
              <i class="fas fa-calendar-alt"></i>
              <span>Bulan Ini</span>
            </div>
            
            <div
              @click="selectPeriod('year')"
              role="button"
              tabindex="0"
              class="filter-tab-item"
              :class="{ 'active': selectedPeriod === 'year' }"
            >
              <i class="fas fa-calendar"></i>
              <span>Tahun Ini</span>
            </div>
            
            <div
              @click="selectPeriod('custom')"
              role="button"
              tabindex="0"
              class="filter-tab-item"
              :class="{ 'active': selectedPeriod === 'custom' }"
            >
              <i class="fas fa-sliders-h"></i>
              <span>Custom</span>
            </div>
          </div>
          
          <!-- Custom Date Inputs (Inline) -->
          <template v-if="selectedPeriod === 'custom'">
               <input type="date" v-model="customStartDate" class="custom-date-input">
               <span class="date-separator">→</span>
               <input type="date" v-model="customEndDate" class="custom-date-input">
               <div @click="applyCustomFilter" role="button" tabindex="0" class="custom-date-apply">
                <i class="fas fa-check"></i>
               </div>
          </template>

          <!-- Auto Reload Toggle -->
          <button 
            @click="toggleAutoReload" 
            class="btn-auto-reload"
            :class="{ 'active': autoReloadEnabled, 'reloading': isReloading }"
            :title="autoReloadEnabled ? 'Auto-reload aktif (30s)' : 'Auto-reload nonaktif'"
          >
            <i class="fas" :class="autoReloadEnabled ? 'fa-sync fa-spin' : 'fa-sync'"></i>
            <span class="reload-status">{{ autoReloadEnabled ? 'Auto' : 'Manual' }}</span>
            <span v-if="isReloading" class="reload-pulse"></span>
          </button>

        </div>

        <div class="stats-grid">
          <div class="stat-card patients-card">
            <div class="stat-icon patients">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <h3>{{ dashboardStats.pasien?.total || 0 }}</h3>
              <p>Total Pasien</p>
              <span class="stat-trend neutral">Ranap + Ralan + IGD</span>
            </div>
          </div>

          <div class="stat-card ranap-card">
            <div class="stat-icon today-visits">
              <i class="fas fa-procedures"></i>
            </div>
            <div class="stat-content">
              <h3>{{ dashboardStats.pasien?.ranap || 0 }}</h3>
              <p>Kunjungan Rawat Inap</p>
              <span class="stat-trend positive">Pasien Masuk</span>
            </div>
          </div>

           <div class="stat-card ralan-card">
            <div class="stat-icon surgeries">
              <i class="fas fa-user-doctor"></i>
            </div>
            <div class="stat-content">
              <h3>{{ dashboardStats.pasien?.ralan || 0 }}</h3>
              <p>Kunjungan Rawat Jalan</p>
              <span class="stat-trend positive">Non IGD</span>
            </div>
          </div>

          <div class="stat-card igd-card">
            <div class="stat-icon emergency">
              <i class="fas fa-truck-medical"></i>
            </div>
            <div class="stat-content">
              <h3>{{ dashboardStats.pasien?.igd || 0 }}</h3>
              <p>Kunjungan IGD</p>
              <span class="stat-trend negative">Gawat Darurat</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 
        Combined Mood & Sentiment Section 
        Side-by-side layout for high-level metrics and individual updates
      -->
      <section class="mood-analytics-combined-section">
        <div class="mood-analytics-wrapper">
          <!-- Summary Side -->
          <div class="mood-summary-side">
            <div class="quick-stat-card mood-card analytic-mood-card">
              <div class="card-glass-overlay"></div>
              
              <div class="stat-header-main">
                <div class="mood-icon-bg">
                  <i class="fas fa-heart"></i>
                </div>
                <div class="mood-badge-premium" v-if="dashboardStats.mood?.total > 0">
                  {{ dashboardStats.mood?.baik_pct }}%
                </div>
              </div>

              <div class="stat-content-premium">
                <h3 class="sentiment-value">{{ dashboardStats.mood?.baik || 0 }}</h3>
                <p class="sentiment-label">Pegawai Bersemangat</p>
                
                <div class="sentiment-progress-container">
                  <!-- Progress Bar for Bersemangat (Baik) -->
                  <div class="progress-segment-label">
                    <span>Bersemangat</span>
                    <span>{{ dashboardStats.mood?.baik_pct }}%</span>
                  </div>
                  <div class="premium-progress-bar">
                    <div class="progress-fill positive" :style="{ width: (dashboardStats.mood?.baik_pct || 0) + '%' }"></div>
                  </div>

                  <!-- Progress Bar for Oke -->
                  <div class="progress-segment-label">
                    <span>Oke</span>
                    <span>{{ dashboardStats.mood?.oke_pct }}%</span>
                  </div>
                  <div class="premium-progress-bar">
                    <div class="progress-fill neutral" :style="{ width: (dashboardStats.mood?.oke_pct || 0) + '%' }"></div>
                  </div>

                  <!-- Progress Bar for Perlu Support -->
                  <div class="progress-segment-label">
                    <span>Perlu Support</span>
                    <span>{{ dashboardStats.mood?.perlu_support_pct || 0 }}%</span>
                  </div>
                  <div class="premium-progress-bar">
                    <div class="progress-fill negative" :style="{ width: (dashboardStats.mood?.perlu_support_pct || 0) + '%' }"></div>
                  </div>
                </div>

                <div class="mood-indicators-premium">
                  <div class="indicator-chip energy" title="Energi rata-rata">
                    <div class="chip-icon"><i class="fas fa-bolt"></i></div>
                    <div class="chip-text">
                      <span class="chip-val">{{ dashboardStats.mood?.avg_energi || 0 }}</span>
                      <span class="chip-lbl">Energy</span>
                    </div>
                  </div>
                  <div class="indicator-chip focus" title="Fokus rata-rata">
                    <div class="chip-icon"><i class="fas fa-bullseye"></i></div>
                    <div class="chip-text">
                      <span class="chip-val">{{ dashboardStats.mood?.avg_fokus || 0 }}</span>
                      <span class="chip-lbl">Focus</span>
                    </div>
                  </div>
                  <div class="indicator-chip stress" title="Stress rata-rata">
                    <div class="chip-icon"><i class="fas fa-brain"></i></div>
                    <div class="chip-text">
                      <span class="chip-val">{{ dashboardStats.mood?.avg_stres || 0 }}</span>
                      <span class="chip-lbl">Stress</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Slider Side -->
          <div class="mood-slider-side">
            <MoodSlider />
          </div>
        </div>
      </section>

      <!-- Bed Availability (Cinema Seat Selection Layout) -->
      <section class="bed-cinema-section mb-4">
        <div class="card border-0 shadow-sm panel-card">
          <div class="panel-header pt-3 pt-md-4 px-3 px-md-4 pb-3 border-bottom">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <!-- Title & Subtitle Header -->
              <div class="d-flex justify-content-between align-items-start w-100 w-md-auto">
                <div>
                  <h5 class="m-0 fw-bold text-dark d-flex align-items-center gap-2">
                    <i class="fas fa-bed text-primary"></i>Ketersediaan Tempat Tidur
                  </h5>
                  <p class="text-muted small m-0 mt-1">Ringkasan ketersediaan kamar rawat inap per unit & kelas secara real-time.</p>
                </div>
                <!-- Refresh Button Mobile Only (< md) -->
                <button class="btn btn-sm btn-outline-secondary rounded-circle p-2 d-md-none flex-shrink-0 ms-2" style="width: 34px; height: 34px;" @click="fetchBedCinemaData" :disabled="loadingBeds" title="Refresh Data">
                  <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingBeds }"></i>
                </button>
              </div>
              
              <!-- Tab Switcher Container -->
              <div class="d-flex align-items-center gap-2 w-100 w-md-auto">
                <div class="p-1 bg-light rounded-pill border d-flex align-items-center w-100 w-md-auto shadow-2sm overflow-hidden" style="max-width: 100%;">
                  <button 
                    class="btn rounded-pill px-2 px-sm-3 py-1.5 fw-bold flex-fill flex-md-grow-0 d-flex align-items-center justify-content-center gap-1.5 transition-all text-nowrap"
                    style="font-size: 0.78rem; line-height: 1.3;"
                    :class="viewMode === 'compact' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary border-0 bg-transparent'"
                    @click="viewMode = 'compact'"
                  >
                    <i class="fas fa-th-large"></i><span>Ringkasan Kamar</span>
                  </button>
                  <button 
                    class="btn rounded-pill px-2 px-sm-3 py-1.5 fw-bold flex-fill flex-md-grow-0 d-flex align-items-center justify-content-center gap-1.5 transition-all text-nowrap"
                    style="font-size: 0.78rem; line-height: 1.3;"
                    :class="viewMode === 'cinema' ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary border-0 bg-transparent'"
                    @click="viewMode = 'cinema'"
                  >
                    <i class="fas fa-map-marked-alt"></i><span>Denah Visual</span>
                  </button>
                </div>

                <!-- Refresh Button Desktop Only (>= md) -->
                <button class="btn btn-sm btn-outline-secondary rounded-circle p-2 d-none d-md-flex align-items-center justify-content-center flex-shrink-0" style="width: 36px; height: 36px;" @click="fetchBedCinemaData" :disabled="loadingBeds" title="Refresh Data">
                  <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingBeds }"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="card-body px-4 pb-4">
            <!-- Mode 1: Compact Registration Matrix View (Modern Design) -->
            <div v-if="viewMode === 'compact'" class="compact-matrix-view">
              <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
                <div v-for="item in allCategoriesMatrix" :key="item.category" class="col">
                  <div class="card h-100 border-0 shadow-sm rounded-4 category-matrix-card-modern position-relative overflow-hidden">
                    <!-- Top Accent Bar -->
                    <div class="card-accent-bar" :class="getCategorySlug(item.category)"></div>

                    <!-- Card Header -->
                    <div class="card-header border-0 pt-3 px-3 pb-2 d-flex justify-content-between align-items-center" style="background: #ffffff !important; background-image: none !important;">
                      <div class="d-flex align-items-center gap-2">
                        <div class="cat-icon-avatar" :class="getCategorySlug(item.category)">
                          <i :class="getCategoryIcon(item.category)"></i>
                        </div>
                        <div>
                          <h6 class="m-0 fw-bold text-dark tracking-tight">{{ item.category }}</h6>
                          <small class="text-muted" style="font-size: 0.72rem;">{{ item.totalCount }} Total Bed</small>
                        </div>
                      </div>
                      
                      <div class="text-end">
                        <span 
                          class="badge py-1 px-2.5 rounded-pill fw-bold"
                          :class="item.emptyCount > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'"
                          style="font-size: 0.75rem;"
                        >
                          <i class="fas fa-check-circle me-1" v-if="item.emptyCount > 0"></i>
                          {{ item.emptyCount }} Kosong
                        </span>
                      </div>
                    </div>

                    <!-- Occupancy Mini Progress Bar -->
                    <div class="px-3 mb-2">
                      <div class="progress rounded-pill" style="height: 5px; background-color: #f1f5f9;">
                        <div 
                          class="progress-bar bg-success rounded-pill" 
                          :style="{ width: (item.totalCount > 0 ? (item.emptyCount / item.totalCount * 100) : 0) + '%' }"
                          title="Persentase Kosong"
                        ></div>
                      </div>
                    </div>

                    <!-- Card Body: Class List -->
                    <div class="card-body p-3 pt-1">
                      <div v-if="item.classes.length > 0" class="d-flex flex-column gap-1.5">
                        <div 
                          v-for="cls in item.classes" 
                          :key="cls.name"
                          class="modern-class-row p-2 px-2.5 rounded-3 d-flex justify-content-between align-items-center cursor-pointer"
                          :class="{ 'is-available': cls.empty > 0, 'is-full': cls.empty === 0 }"
                          @click="openClassLookupModal(item.category, cls.name)"
                          title="Klik untuk rincian nomor kamar & data pasien"
                        >
                          <div class="d-flex align-items-center gap-2 overflow-hidden me-2">
                            <span class="class-dot" :class="getClassColorDot(cls.name)"></span>
                            <span class="small fw-bold text-dark text-truncate">{{ cls.name }}</span>
                          </div>
                          
                          <div class="d-flex align-items-center justify-content-end gap-2 ms-auto">
                            <span 
                              class="badge fw-bold py-1 text-center rounded-2" 
                              style="min-width: 76px; font-size: 0.74rem;"
                              :class="cls.empty > 0 ? 'bg-success text-white' : 'bg-secondary text-white-50'"
                            >
                              {{ cls.empty > 0 ? `${cls.empty} Kosong` : 'Penuh' }}
                            </span>
                            <span class="text-muted small text-end fw-medium" style="min-width: 44px; font-size: 0.72rem; font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                              ({{ cls.occupied }}/{{ cls.total }})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-center py-4 text-muted small">
                        <i class="fas fa-inbox fa-2x mb-2 text-muted opacity-50"></i>
                        <p class="m-0">Tidak ada unit aktif</p>
                      </div>
                    </div>

                    <!-- Card Footer -->
                    <div class="card-footer bg-white border-0 p-3 pt-2 text-center">
                      <button 
                        class="btn btn-sm btn-light-primary w-100 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-1.5 py-2 btn-denah-action" 
                        @click="switchToDenah(item.category)"
                      >
                        <i class="fas fa-map-marked-alt text-primary icon-map"></i>
                        <span>Lihat Denah Visual</span>
                        <i class="fas fa-arrow-right text-primary arrow-icon"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mode 2: Cinema Visual View -->
            <div v-else class="cinema-view-container">
              <!-- Wards Category Tabs -->
              <div class="cinema-tabs-wrapper mb-4">
                <div class="cinema-tabs">
                  <button 
                    v-for="cat in categories" 
                    :key="cat"
                    class="cinema-tab-btn"
                    :class="{ active: activeBedTab === cat }"
                    @click="activeBedTab = cat"
                  >
                    <span class="cat-name">{{ cat }}</span>
                  </button>
                </div>
              </div>

              <!-- Selected Category Summary Stats -->
              <div class="active-category-summary mb-3 p-3 rounded-3 bg-light border d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div class="d-flex align-items-center gap-2">
                  <i class="fas fa-hospital-user text-primary fs-5"></i>
                  <div>
                    <h6 class="m-0 fw-bold text-dark">Kategori {{ activeBedTab }}</h6>
                    <small class="text-muted">Kapasitas aktif untuk unit terpilih</small>
                  </div>
                </div>
                <div class="d-flex gap-4 flex-wrap">
                  <div class="summary-stat-item">
                    <span class="text-muted small d-block" style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;">TOTAL KAPASITAS</span>
                    <span class="fw-bold text-dark fs-5">{{ getCategoryTotalCount(activeBedTab) }} <span class="text-muted" style="font-size: 0.75rem; font-weight: normal;">Bed</span></span>
                  </div>
                  <div class="summary-stat-item border-start ps-3">
                    <span class="text-success small d-block" style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;">TERSEDIA (KOSONG)</span>
                    <span class="fw-bold text-success fs-5">{{ getCategoryEmptyCount(activeBedTab) }} <span class="text-muted" style="font-size: 0.75rem; font-weight: normal;">Bed</span></span>
                  </div>
                  <div class="summary-stat-item border-start ps-3">
                    <span class="text-secondary small d-block" style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;">TERISI</span>
                    <span class="fw-bold text-secondary fs-5">{{ getCategoryOccupiedCount(activeBedTab) }} <span class="text-muted" style="font-size: 0.75rem; font-weight: normal;">Bed</span></span>
                  </div>
                  <div v-if="getCategoryBookedCount(activeBedTab) > 0" class="summary-stat-item border-start ps-3">
                    <span class="text-warning small d-block" style="font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;">BOOKING / INDENT</span>
                    <span class="fw-bold text-warning fs-5">{{ getCategoryBookedCount(activeBedTab) }} <span class="text-muted" style="font-size: 0.75rem; font-weight: normal;">Bed</span></span>
                  </div>
                </div>
              </div>

              <!-- Main Layout Container -->
              <div class="row g-4">
                <!-- Cinema Map (Left Column) -->
                <div class="col-xl-8 col-lg-7">
                  <div class="cinema-room-container p-3 rounded-4 position-relative">
                    <!-- Movie Screen Metaphor (Nursing Station) -->
                    <div class="nursing-station-screen mb-3 text-center">
                      <div class="screen-border mb-2"></div>
                      <small class="screen-label text-muted fw-bold tracking-wider">NURSING STATION / KORIDOR UTAMA</small>
                    </div>

                    <!-- Seat Rows (Beds grouped by Class) -->
                    <div class="cinema-grid d-flex flex-column gap-2">
                      <div 
                        v-for="group in cinemaBedsGrouped" 
                        :key="group.kelas" 
                        class="cinema-class-row d-flex flex-column flex-sm-row gap-2 align-items-sm-center border-bottom pb-2"
                      >
                        <div class="class-label-side fw-bold text-dark text-uppercase small" style="min-width: 100px;">
                          {{ group.kelas }}
                        </div>
                        <div class="seats-row d-flex flex-wrap gap-1 flex-grow-1">
                          <div 
                            v-for="bed in group.beds" 
                            :key="bed.kd_kamar"
                            class="cinema-seat-wrapper"
                            @click="selectBed(bed)"
                          >
                            <div 
                              class="cinema-seat d-flex flex-column align-items-center justify-content-center p-2 rounded-3 text-center border cursor-pointer"
                              :class="[
                                bed.status.toLowerCase(),
                                getClassSlug(bed.kelas),
                                { 'selected': selectedBedForDetail?.kd_kamar === bed.kd_kamar }
                              ]"
                            >
                              <i class="fas fa-bed seat-icon mb-1"></i>
                              <span class="seat-label fw-bold" style="font-size: 0.68rem;">{{ getBedLabel(bed) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div v-if="cinemaBedsGrouped.length === 0" class="text-center py-5 text-muted">
                        <i class="fas fa-bed fa-2x mb-2"></i>
                        <p class="m-0">Tidak ada tempat tidur pada kategori bangsal ini.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Detail Side Panel (Right Column) -->
                <div class="col-xl-4 col-lg-5">
                  <div class="bed-detail-panel h-100 p-4 rounded-4 border">
                    <h6 class="fw-bold mb-3 border-bottom pb-2 text-dark">
                      <i class="fas fa-info-circle me-2 text-primary"></i>Rincian Tempat Tidur
                    </h6>
                    
                    <div v-if="selectedBedForDetail" class="detail-content animate-fade-in">
                      <div class="mb-4 text-center">
                        <div 
                          class="detail-status-badge mb-2 d-inline-block py-1 px-3 rounded-pill fw-bold small"
                          :class="selectedBedForDetail.status.toLowerCase()"
                        >
                          {{ selectedBedForDetail.status === 'KOSONG' ? 'TERSEDIA' : selectedBedForDetail.status }}
                        </div>
                        <h5 class="fw-bold text-dark m-0">{{ selectedBedForDetail.bangsal?.nm_bangsal }}</h5>
                        <p class="text-muted small m-0 mt-1">ID Kamar: {{ selectedBedForDetail.kd_kamar }}</p>
                      </div>

                      <table class="table table-sm table-borderless detail-table">
                        <tbody>
                          <tr class="border-bottom">
                            <td class="text-muted py-2 small">Kelas</td>
                            <td class="fw-bold text-dark text-end py-2 small">{{ selectedBedForDetail.kelas }}</td>
                          </tr>
                          <tr class="border-bottom">
                            <td class="text-muted py-2 small">Tarif Tempat Tidur</td>
                            <td class="fw-bold text-success text-end py-2 small">Rp {{ formatNumber(selectedBedForDetail.trf_kamar) }} / hari</td>
                          </tr>
                          <tr class="border-bottom">
                            <td class="text-muted py-2 small">Kode Kamar</td>
                            <td class="fw-bold text-dark text-end py-2 small">{{ selectedBedForDetail.kd_kamar }}</td>
                          </tr>
                          <tr class="border-bottom">
                            <td class="text-muted py-2 small">Kode Bangsal</td>
                            <td class="fw-bold text-dark text-end py-2 small">{{ selectedBedForDetail.kd_bangsal }}</td>
                          </tr>
                          <tr v-if="selectedBedForDetail.status === 'DIBOOKING'">
                            <td class="text-muted py-2 small">Keterangan</td>
                            <td class="fw-bold text-warning text-end py-2 small">Booking / Pasien Indent</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Placeholder when no bed selected -->
                    <div v-else class="detail-placeholder d-flex flex-column align-items-center justify-content-center h-100 text-center py-5">
                      <i class="fas fa-mouse-pointer fa-2x text-muted mb-3 animate-bounce"></i>
                      <p class="text-muted small m-0">Sorot atau klik salah satu tempat tidur untuk melihat rincian.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Legends Section -->
              <div class="cinema-legend mt-4 pt-3 border-top d-flex flex-wrap gap-4 justify-content-center">
                <div class="legend-item d-flex align-items-center gap-2">
                  <span class="legend-seat-box kosong"></span>
                  <span class="legend-text text-muted small">Tersedia (Kosong)</span>
                </div>
                <div class="legend-item d-flex align-items-center gap-2">
                  <span class="legend-seat-box isi"></span>
                  <span class="legend-text text-muted small">Terisi</span>
                </div>
                <div class="legend-item d-flex align-items-center gap-2">
                  <span class="legend-seat-box dibooking"></span>
                  <span class="legend-text text-muted small">Booking (Indent)</span>
                </div>
                <div class="legend-separator border-start ps-3 d-flex gap-3 flex-wrap">
                  <div class="legend-item d-flex align-items-center gap-2">
                    <span class="legend-class-color vip"></span>
                    <span class="legend-text text-muted small">VIP</span>
                  </div>
                  <div class="legend-item d-flex align-items-center gap-2">
                    <span class="legend-class-color kelas-utama"></span>
                    <span class="legend-text text-muted small">Utama</span>
                  </div>
                  <div class="legend-item d-flex align-items-center gap-2">
                    <span class="legend-class-color kelas-1"></span>
                    <span class="legend-text text-muted small">Kelas 1</span>
                  </div>
                  <div class="legend-item d-flex align-items-center gap-2">
                    <span class="legend-class-color kelas-2"></span>
                    <span class="legend-text text-muted small">Kelas 2</span>
                  </div>
                  <div class="legend-item d-flex align-items-center gap-2">
                    <span class="legend-class-color kelas-3"></span>
                    <span class="legend-text text-muted small">Kelas 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Menu & Recent Activities -->
      <section class="dashboard-sections">

        <!-- Quick Stats Cards -->
        <div class="quick-stats-section">
          <h3><i class="fas fa-chart-line"></i> Statistik Rumah Sakit</h3>
          
          <div v-if="loadingStats" class="stats-loading">
            <i class="fas fa-spinner fa-spin"></i> Memuat statistik...
          </div>

          <div v-else class="quick-stats-grid">
            <!-- 1. Pasien Hari Ini -->
            <div class="quick-stat-card pasien-card">
              <div class="card-header-row">
                <div class="stat-icon-wrapper pasien-gradient">
                  <i class="fas fa-user-injured"></i>
                </div>
                <div class="card-title-block">
                  <h4>{{ dashboardStats.pasien?.total || 0 }}</h4>
                  <p>Pasien Hari Ini</p>
                </div>
              </div>
              <div class="stat-breakdown-full">
                <div class="stat-breakdown-grid">
                  <div v-for="(count, poli) in dashboardStats.pasien?.per_poli || {}" :key="poli" class="breakdown-grid-item">
                    <span class="poli-name" :title="poli">{{ poli }}</span>
                    <span class="poli-count">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Pegawai Aktif -->
            <div class="quick-stat-card pegawai-card">
              <div class="card-header-row">
                <div class="stat-icon-wrapper pegawai-gradient">
                  <i class="fas fa-users"></i>
                </div>
                <div class="card-title-block">
                  <h4>{{ dashboardStats.pegawai?.total || 0 }}</h4>
                  <p>Pegawai Aktif</p>
                </div>
              </div>
              <div class="stat-breakdown-full">
                <div class="stat-breakdown-grid">
                  <div v-for="(count, category) in dashboardStats.pegawai?.breakdown" :key="category" class="breakdown-grid-item">
                    <span class="poli-name" :title="category">{{ category }}</span>
                    <span class="poli-count">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Cuti Bulan Ini -->
            <div class="quick-stat-card cuti-card">
              <div class="card-header-row">
                <div class="stat-icon-wrapper cuti-gradient">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="card-title-block">
                  <h4>{{ dashboardStats.cuti?.bulan_ini || 0 }}</h4>
                  <p>Cuti Bulan Ini</p>
                </div>
              </div>
              <div class="stat-breakdown-full">
                <div class="stat-breakdown">
                  <span class="breakdown-item pending">Pending: {{ dashboardStats.cuti?.pending || 0 }}</span>
                  <span class="breakdown-item approved">Approved: {{ dashboardStats.cuti?.approved || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- 4. Total Tempat Tidur -->
            <div class="quick-stat-card bed-card">
              <div class="card-header-row">
                <div class="stat-icon-wrapper bed-gradient">
                  <i class="fas fa-bed"></i>
                </div>
                <div class="card-title-block">
                  <h4>{{ dashboardStats.bed?.total || 0 }}</h4>
                  <p>Total Tempat Tidur</p>
                </div>
              </div>
              <div class="stat-breakdown-full">
                <div class="stat-breakdown">
                  <span class="breakdown-item available">Tersedia: {{ dashboardStats.bed?.tersedia || 0 }}</span>
                  <span class="breakdown-item occupied">Terisi: {{ dashboardStats.bed?.terisi || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Jadwal Petugas Code Blue -->
        <div class="codeblue-schedule-section">
          <div class="section-header-with-action">
            <h3><i class="fas fa-user-md"></i> Petugas Code Blue</h3>
            <button @click="navigateToCodeBlueManagement" class="btn-manage-codeblue">
              <i class="fas fa-edit"></i>
              <span>Kelola</span>
            </button>
          </div>

          <!-- Shift Tabs -->
          <div class="codeblue-tabs">
            <button 
              @click="activeShiftTab = 'pagi'" 
              class="cb-tab-btn pagi" 
              :class="{ active: activeShiftTab === 'pagi' }"
            >
              <i class="fas fa-sun"></i> <span>Pagi</span>
            </button>
            <button 
              @click="activeShiftTab = 'siang'" 
              class="cb-tab-btn siang" 
              :class="{ active: activeShiftTab === 'siang' }"
            >
              <i class="fas fa-cloud-sun"></i> <span>Siang</span>
            </button>
            <button 
              @click="activeShiftTab = 'malam'" 
              class="cb-tab-btn malam" 
              :class="{ active: activeShiftTab === 'malam' }"
            >
              <i class="fas fa-moon"></i> <span>Malam</span>
            </button>
          </div>
          
          <div class="codeblue-shift-display">
            <!-- Dynamic Shift Card -->
            <div :class="['shift-card', `${activeShiftTab}-shift`, 'active-shift-card']">
              <div class="shift-team">
                <div class="team-member-item leader-item" v-if="codeBlueSchedule[activeShiftTab]?.LEADER">
                  <div class="member-avatar leader-avatar">
                    <i class="fas fa-user-md"></i>
                  </div>
                  <div class="member-info">
                    <span class="member-name">{{ codeBlueSchedule[activeShiftTab].LEADER.nama }}</span>
                    <span class="member-role">Leader Shift</span>
                  </div>
                </div>
                <template v-for="i in 5" :key="i">
                  <div class="team-member-item" v-if="codeBlueSchedule[activeShiftTab]?.[`ANGGOTA ${i}`]">
                    <div class="member-avatar">
                      <i class="fas fa-user-nurse"></i>
                    </div>
                    <div class="member-info">
                      <span class="member-name">{{ codeBlueSchedule[activeShiftTab][`ANGGOTA ${i}`].nama }}</span>
                      <span class="member-role">Anggota {{ i }}</span>
                    </div>
                  </div>
                </template>
                <div v-if="!codeBlueSchedule[activeShiftTab]?.LEADER && !codeBlueSchedule[activeShiftTab]?.['ANGGOTA 1']" class="empty-shift-team">
                  <i class="fas fa-users-slash"></i>
                  <span>Jadwal tidak tersedia</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Patient Reviews -->
        <div class="reviews-section">
          <h3><i class="fas fa-star" style="color: #f59e0b;"></i> Ulasan Pasien (Google Maps)</h3>
          <div v-if="placeRating > 0" class="place-rating-summary">
            <div class="place-rating-score">
              <span class="rating-number">{{ placeRating }}</span>
              <div class="rating-stars">
                <i v-for="n in 5" :key="n" class="fas fa-star" :class="n <= Math.round(placeRating) ? 'active' : ''"></i>
              </div>
            </div>
            <span class="rating-total">dari {{ totalRatings.toLocaleString() }} ulasan</span>
          </div>

          <div v-if="loadingReviews" class="stats-loading">
            <i class="fas fa-spinner fa-spin"></i> Memuat ulasan...
          </div>

          <div v-else-if="reviews.length === 0" class="empty-state">
            <p>Belum ada ulasan yang ditampilkan.</p>
          </div>

          <div v-else class="reviews-list">
            <div v-for="(review, index) in reviews" :key="index" class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <img :src="review.profile_photo_url" alt="Profile" class="reviewer-avatar" referrerpolicy="no-referrer">
                  <div class="reviewer-meta">
                    <a :href="review.author_url" target="_blank" class="reviewer-name">{{ review.author_name }}</a>
                    <span class="review-time">{{ review.relative_time_description }}</span>
                  </div>
                </div>
                <div class="review-rating">
                  <i v-for="n in 5" :key="n" class="fas fa-star" :class="n <= review.rating ? 'active' : ''"></i>
                </div>
              </div>
              <div class="review-body">
                <p>{{ review.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>


    </main>

    <!-- Menu Management Modal -->
    <MenuManagementModal
      v-if="showMenuManagementModal"
      @close="showMenuManagementModal = false"
    />

    <!-- Role Management Modal -->
    <RoleManagementModal
      v-if="showRoleManagementModal"
      @close="showRoleManagementModal = false"
    />

    <!-- User Management Modal -->
    <UserManagementModal
      v-if="showUserManagementModal"
      @close="showUserManagementModal = false"
    />

    <!-- Room & Patient Class Lookup Modal (Overhauled Isolated Custom Modal) -->
    <div 
      v-if="showClassLookupModal" 
      class="lookup-modal-backdrop"
      @click.self="showClassLookupModal = false"
    >
      <div class="lookup-modal-container">
        <!-- Pull Handle (Mobile) -->
        <div class="lookup-modal-pullbar"></div>

        <!-- Modal Header -->
        <div class="lookup-modal-header">
          <div class="lookup-modal-header-info">
            <div class="lookup-modal-icon">
              <i :class="getCategoryIcon(lookupCategory)"></i>
            </div>
            <div class="lookup-modal-title-box">
              <div class="lookup-modal-badges">
                <span class="badge-pill bg-primary">{{ lookupCategory }}</span>
                <span class="badge-pill bg-outline">{{ lookupClass }}</span>
              </div>
              <h6 class="lookup-modal-title">Informasi Kamar & Status Pasien</h6>
            </div>
          </div>
          <button type="button" class="lookup-modal-close" @click="showClassLookupModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Controls: Filter Segment Tabs & Search Input -->
        <div class="lookup-modal-controls">
          <div class="lookup-segmented-tabs">
            <button 
              class="lookup-segmented-btn"
              :class="{ active: lookupFilterStatus === 'ALL' }"
              @click="lookupFilterStatus = 'ALL'"
            >
              Semua ({{ getCategoryBeds(lookupCategory).filter(b => b.kelas === lookupClass).length }})
            </button>
            <button 
              class="lookup-segmented-btn success"
              :class="{ active: lookupFilterStatus === 'KOSONG' }"
              @click="lookupFilterStatus = 'KOSONG'"
            >
              🟢 Tersedia ({{ getCategoryBeds(lookupCategory).filter(b => b.kelas === lookupClass && b.status === 'KOSONG').length }})
            </button>
            <button 
              class="lookup-segmented-btn danger"
              :class="{ active: lookupFilterStatus === 'ISI' }"
              @click="lookupFilterStatus = 'ISI'"
            >
              🔴 Terisi ({{ getCategoryBeds(lookupCategory).filter(b => b.kelas === lookupClass && b.status !== 'KOSONG').length }})
            </button>
          </div>

          <div class="lookup-search-box">
            <i class="fas fa-search lookup-search-icon"></i>
            <input 
              v-model="lookupSearchQuery" 
              type="text" 
              class="lookup-search-input" 
              placeholder="Cari no. bed / nama pasien / RM..."
            />
            <button v-if="lookupSearchQuery" class="lookup-search-clear" @click="lookupSearchQuery = ''">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Body: Bed Cards List -->
        <div class="lookup-modal-body">
          <div v-if="loadingActivePatients" class="text-center py-5 text-muted">
            <i class="fas fa-spinner fa-spin fa-2x text-primary mb-2"></i>
            <p class="m-0 small">Memuat data pasien rawat inap...</p>
          </div>

          <div v-else-if="modalBedsList.length > 0" class="lookup-beds-list">
            <div 
              v-for="bed in modalBedsList" 
              :key="bed.kd_kamar" 
              class="lookup-bed-card"
              :class="bed.status === 'KOSONG' ? 'status-available' : 'status-occupied'"
            >
              <!-- Bed Top Bar -->
              <div class="lookup-bed-top">
                <div class="lookup-bed-pill" :class="bed.status === 'KOSONG' ? 'bg-success' : 'bg-danger'">
                  {{ getBedLabel(bed) }}
                </div>
                <div class="lookup-bed-main-info">
                  <div class="lookup-bed-name-row">
                    <span class="lookup-bed-bangsal">{{ bed.bangsal?.nm_bangsal || bed.kd_bangsal }}</span>
                    <span class="lookup-bed-code">Kode: {{ bed.kd_kamar }}</span>
                  </div>
                  <div class="lookup-bed-sub">Unit {{ lookupCategory }} — {{ bed.kelas }}</div>
                </div>
                <div class="lookup-bed-status">
                  <span v-if="bed.status === 'KOSONG'" class="chip chip-success"><i class="fas fa-check-circle"></i> TERSEDIA</span>
                  <span v-else-if="bed.status === 'DIBOOKING'" class="chip chip-warning"><i class="fas fa-clock"></i> BOOKING</span>
                  <span v-else class="chip chip-danger"><i class="fas fa-user-check"></i> TERISI</span>
                </div>
              </div>

              <!-- Patient Details Box -->
              <div v-if="bed.status !== 'KOSONG' && activePatientsMap[bed.kd_kamar]" class="lookup-patient-box">
                <div class="lookup-patient-row-1">
                  <div class="lookup-patient-avatar"><i class="fas fa-user"></i></div>
                  <div class="lookup-patient-info">
                    <div class="lookup-patient-name">{{ activePatientsMap[bed.kd_kamar].reg_periksa?.pasien?.nm_pasien || 'Pasien Rawat Inap' }}</div>
                    <div class="lookup-patient-meta">
                      <span>RM: <strong>{{ activePatientsMap[bed.kd_kamar].reg_periksa?.pasien?.no_rkm_medis || '-' }}</strong></span>
                      <span class="dot">•</span>
                      <span>No. Rawat: <strong>{{ activePatientsMap[bed.kd_kamar].no_rawat }}</strong></span>
                    </div>
                  </div>
                </div>
                <div class="lookup-patient-row-2">
                  <div class="lookup-dpjp">
                    <span class="label">DPJP:</span>
                    <strong><i class="fas fa-user-md text-info me-1"></i>{{ activePatientsMap[bed.kd_kamar].reg_periksa?.dokter?.nm_dokter || '-' }}</strong>
                  </div>
                  <div class="lookup-penjamin">
                    <span class="chip-penjamin">{{ activePatientsMap[bed.kd_kamar].png_jawab || 'UMUM' }}</span>
                    <span class="lookup-tgl-masuk">Masuk: {{ activePatientsMap[bed.kd_kamar].tgl_masuk || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Empty Bed Banner -->
              <div v-else-if="bed.status === 'KOSONG'" class="lookup-empty-box">
                <i class="fas fa-check-circle fs-6 me-1"></i>
                <span>Tempat tidur ini kosong dan siap dikonfirmasi untuk registrasi pasien baru.</span>
              </div>
            </div>
          </div>

          <!-- Empty Search State -->
          <div v-else class="text-center py-5 text-muted">
            <i class="fas fa-search-minus fa-3x mb-3 text-secondary opacity-50"></i>
            <h6 class="fw-bold text-dark">Data Kamar Tidak Ditemukan</h6>
            <p class="small m-0 text-muted">Tidak ada kamar yang cocok dengan kriteria filter atau pencarian Anda.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="lookup-modal-footer">
          <div class="lookup-footer-count">
            <i class="fas fa-bed text-primary"></i>
            <span>Menampilkan <strong>{{ modalBedsList.length }}</strong> tempat tidur.</span>
          </div>
          <button type="button" class="lookup-modal-btn-close" @click="showClassLookupModal = false">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MenuManagementModal from '../components/MenuManagementModal.vue'
import RoleManagementModal from '../components/RoleManagementModal.vue'
import UserManagementModal from '../components/UserManagementModal.vue'
import departemenService from '../services/departemenService'
import dashboardService from '../services/dashboardService'
import { pegawaiService } from '../services/pegawaiService'
import MoodSlider from '../components/MoodSlider.vue'
import api from '../services/api'


const router = useRouter()
const authStore = useAuthStore()

// Bed Availability (Cinema Layout & Compact Pendaftaran Matrix)
const allBeds = ref([])
const activeBedTab = ref('ANAK')
const selectedBedForDetail = ref(null)
const loadingBeds = ref(false)
const viewMode = ref('compact') // Default view mode: 'compact' (Ringkasan Pendaftaran) or 'cinema' (Denah Visual)

// Class Room & Patient Lookup Modal
const activePatients = ref([])
const loadingActivePatients = ref(false)
const showClassLookupModal = ref(false)
const lookupCategory = ref('')
const lookupClass = ref('')
const lookupSearchQuery = ref('')
const lookupFilterStatus = ref('ALL') // 'ALL', 'KOSONG', 'ISI'

const categories = ['ANAK', 'KANDUNGAN', 'ICU/PICU/NICU', 'PERINATOLOGI', 'ISOLASI', 'KAMAR BERSALIN']

const getCategoryIcon = (cat) => {
  switch (cat) {
    case 'ANAK': return 'fas fa-baby'
    case 'KANDUNGAN': return 'fas fa-female'
    case 'ICU/PICU/NICU': return 'fas fa-heartbeat'
    case 'PERINATOLOGI': return 'fas fa-baby-carriage'
    case 'ISOLASI': return 'fas fa-shield-virus'
    case 'KAMAR BERSALIN': return 'fas fa-bed'
    default: return 'fas fa-hospital'
  }
}

const getCategorySlug = (cat) => {
  return cat.toLowerCase().replace(/[^a-z0-9]/g, '-')
}

const getClassColorDot = (clsName) => {
  if (!clsName) return 'other'
  if (clsName.includes('VIP')) return 'vip'
  if (clsName.includes('Utama')) return 'utama'
  if (clsName.includes('1')) return 'kelas-1'
  if (clsName.includes('2')) return 'kelas-2'
  if (clsName.includes('3')) return 'kelas-3'
  return 'other'
}

const getBedCategory = (bed) => {
  const nmBangsal = (bed.bangsal?.nm_bangsal || bed.kd_bangsal || '').toUpperCase()
  
  if (nmBangsal.includes('ICU') || nmBangsal.includes('NICU') || nmBangsal.includes('PICU')) {
    return 'ICU/PICU/NICU'
  }
  if (nmBangsal.includes('HCU')) {
    return 'HCU'
  }
  if (nmBangsal.includes('BAYI') || nmBangsal.includes('PERINATOLOGI') || nmBangsal.includes('PERINA')) {
    if (nmBangsal.includes('BAYI SEHAT')) {
      return 'PERINATOLOGI'
    }
    return 'EXCLUDED'
  }
  if (nmBangsal.includes('WALIDAH') || nmBangsal.includes('BAROROH') || nmBangsal.includes('KHADIJAH') || nmBangsal.includes('KANDUNGAN')) {
    return 'KANDUNGAN'
  }
  if (nmBangsal.includes('HALIMATUS') || nmBangsal.includes('CHAMAMAH') || nmBangsal.includes('FATIMAH') || nmBangsal.includes('AISYAH') || nmBangsal.includes('ANAK')) {
    return 'ANAK'
  }
  if (nmBangsal.includes('VK') || nmBangsal.includes('BERSALIN')) {
    return 'KAMAR BERSALIN'
  }
  if (nmBangsal.includes('ISOLASI')) {
    return 'ISOLASI'
  }
  return 'LAIN-LAIN'
}

const getBedLabel = (bed) => {
  const nm = bed.bangsal?.nm_bangsal || ''
  const parts = nm.split(' ')
  const lastPart = parts[parts.length - 1]
  
  if (lastPart && lastPart !== '-' && !lastPart.includes('KAMAR') && !lastPart.includes('BANGSAL') && (/\d/.test(lastPart) || lastPart.length <= 4)) {
    return lastPart
  }
  
  const kd = bed.kd_kamar || ''
  const cleanKd = kd.replace(/^[A-Za-z]+(?:\.|\-)?/, '')
  return cleanKd || kd
}

const getClassSlug = (kelas) => {
  if (!kelas) return 'other'
  return kelas.replace(/\s+/g, '-').toLowerCase()
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('id-ID').format(num)
}

const getCategoryBeds = (cat) => {
  return allBeds.value.filter(bed => getBedCategory(bed) === cat)
}

const getCategoryTotalCount = (cat) => {
  return getCategoryBeds(cat).length
}

const getCategoryEmptyCount = (cat) => {
  return getCategoryBeds(cat).filter(bed => bed.status === 'KOSONG').length
}

const getCategoryOccupiedCount = (cat) => {
  return getCategoryBeds(cat).filter(bed => bed.status === 'ISI').length
}

const getCategoryBookedCount = (cat) => {
  return getCategoryBeds(cat).filter(bed => bed.status === 'DIBOOKING').length
}

const getTabBadgeClass = (cat) => {
  const empty = getCategoryEmptyCount(cat)
  if (empty === 0) return 'bg-danger text-white'
  if (empty < 5) return 'bg-warning text-dark'
  return 'bg-success text-white'
}

const cinemaBedsGrouped = computed(() => {
  const filtered = getCategoryBeds(activeBedTab.value)
  const grouped = {}
  
  filtered.forEach(bed => {
    const kelas = bed.kelas || 'Lainnya'
    if (!grouped[kelas]) {
      grouped[kelas] = []
    }
    grouped[kelas].push(bed)
  })
  
  const sortWeights = {
    'Kelas VIP': 5,
    'Kelas Utama': 10,
    'Kelas 1': 20,
    'Kelas 2': 30,
    'Kelas 3': 40,
    'Lainnya': 100
  }
  
  const getWeight = (className) => {
    return sortWeights[className] || 90
  }
  
  return Object.keys(grouped).map(cls => ({
    kelas: cls,
    beds: grouped[cls].sort((a, b) => getBedLabel(a).localeCompare(getBedLabel(b), undefined, { numeric: true })),
    weight: getWeight(cls)
  })).sort((a, b) => a.weight - b.weight)
})

const switchToDenah = (categoryName) => {
  activeBedTab.value = categoryName
  viewMode.value = 'cinema'
}

const allCategoriesMatrix = computed(() => {
  return categories.map(cat => {
    const beds = getCategoryBeds(cat)
    const emptyCount = beds.filter(b => b.status === 'KOSONG').length
    const occupiedCount = beds.filter(b => b.status === 'ISI').length
    const totalCount = beds.length

    const grouped = {}
    beds.forEach(bed => {
      const cls = bed.kelas || 'Lainnya'
      if (!grouped[cls]) {
        grouped[cls] = { empty: 0, occupied: 0, total: 0 }
      }
      grouped[cls].total++
      if (bed.status === 'KOSONG') {
        grouped[cls].empty++
      } else {
        grouped[cls].occupied++
      }
    })

    const sortWeights = {
      'Kelas VIP': 5,
      'Kelas Utama': 10,
      'Kelas 1': 20,
      'Kelas 2': 30,
      'Kelas 3': 40,
      'Lainnya': 100
    }

    const classes = Object.keys(grouped).map(clsName => ({
      name: clsName,
      empty: grouped[clsName].empty,
      occupied: grouped[clsName].occupied,
      total: grouped[clsName].total,
      weight: sortWeights[clsName] || 90
    })).sort((a, b) => a.weight - b.weight)

    return {
      category: cat,
      emptyCount,
      occupiedCount,
      totalCount,
      classes
    }
  })
})

const fetchActivePatients = async () => {
  try {
    loadingActivePatients.value = true
    const response = await api.get('/rawat-inap', {
      params: {
        status: 'belum_pulang',
        per_page: 500
      }
    })
    if (response.data && response.data.data) {
      const list = response.data.data.data || response.data.data || []
      activePatients.value = list
    }
  } catch (err) {
    console.error('Error fetching active patients:', err)
  } finally {
    loadingActivePatients.value = false
  }
}

const activePatientsMap = computed(() => {
  const map = {}
  activePatients.value.forEach(item => {
    if (item.kd_kamar) {
      map[item.kd_kamar] = item
    }
  })
  return map
})

const openClassLookupModal = async (categoryName, className) => {
  lookupCategory.value = categoryName
  lookupClass.value = className
  lookupSearchQuery.value = ''
  lookupFilterStatus.value = 'ALL'
  showClassLookupModal.value = true
  
  if (activePatients.value.length === 0) {
    await fetchActivePatients()
  }
}

const modalBedsList = computed(() => {
  if (!lookupCategory.value || !lookupClass.value) return []
  
  const beds = getCategoryBeds(lookupCategory.value).filter(b => b.kelas === lookupClass.value)
  
  return beds.filter(bed => {
    if (lookupFilterStatus.value === 'KOSONG' && bed.status !== 'KOSONG') return false
    if (lookupFilterStatus.value === 'ISI' && bed.status === 'KOSONG') return false
    
    if (lookupSearchQuery.value.trim()) {
      const q = lookupSearchQuery.value.toLowerCase()
      const bedLabel = getBedLabel(bed).toLowerCase()
      const kdKamar = (bed.kd_kamar || '').toLowerCase()
      const patient = activePatientsMap.value[bed.kd_kamar]
      const patientName = (patient?.reg_periksa?.pasien?.nm_pasien || '').toLowerCase()
      const noRm = (patient?.reg_periksa?.pasien?.no_rkm_medis || '').toLowerCase()
      
      return bedLabel.includes(q) || kdKamar.includes(q) || patientName.includes(q) || noRm.includes(q)
    }
    
    return true
  }).sort((a, b) => getBedLabel(a).localeCompare(getBedLabel(b), undefined, { numeric: true }))
})

const fetchBedCinemaData = async () => {
  loadingBeds.value = true
  try {
    const response = await api.get('/kamar/master?limit=1000')
    allBeds.value = response.data.data || []
    
    const catBeds = getCategoryBeds(activeBedTab.value)
    if (catBeds.length > 0 && !selectedBedForDetail.value) {
      selectedBedForDetail.value = catBeds[0]
    }
  } catch (error) {
    console.error('Failed to fetch bed cinema data', error)
  } finally {
    loadingBeds.value = false
  }
}

const selectBed = (bed) => {
  selectedBedForDetail.value = bed
}

const hoverBed = (bed) => {
  // Option for interactive hover feedback
}

watch(activeBedTab, (newTab) => {
  const catBeds = getCategoryBeds(newTab)
  if (catBeds.length > 0) {
    selectedBedForDetail.value = catBeds[0]
  } else {
    selectedBedForDetail.value = null
  }
})

// Reactive data
const departmentName = ref(authStore.user?.data?.detail?.departemen || 'Unknown')
const currentDateTime = ref('')
const timeInterval = ref(null)
const autoReloadInterval = ref(null)
const autoReloadEnabled = ref(true)
const reloadIntervalSeconds = ref(30) // Auto reload every 30 seconds
const isReloading = ref(false)
const showMenuManagementModal = ref(false)
const showRoleManagementModal = ref(false)
const showUserManagementModal = ref(false)
const loadingStats = ref(false)
const selectedPeriod = ref('today')
const customStartDate = ref('')
const customEndDate = ref('')
const isFilterOpen = ref(false)

// Code Blue Shift Active Tab
const currentHour = new Date().getHours()
let initialShift = 'pagi'
if (currentHour >= 14 && currentHour < 21) {
  initialShift = 'siang'
} else if (currentHour >= 21 || currentHour < 7) {
  initialShift = 'malam'
}
const activeShiftTab = ref(initialShift)

// Watch for changes in user department (e.g. after refreshUserData)
watch(() => authStore.user?.data?.detail?.departemen, (newVal) => {
  if (newVal) {
    fetchDepartmentName()
  }
})

const periodLabels = {
  today: 'Hari Ini',
  month: 'Bulan Ini',
  year: 'Tahun Ini',
  custom: 'Custom'
}

const selectPeriod = (value) => {
  selectedPeriod.value = value
  isFilterOpen.value = false
  handlePeriodChange()
}

const dashboardStats = ref({
  pasien: { total: 0, per_poli: {} },
  pegawai: { total: 0, medis: 0, non_medis: 0 },
  cuti: { bulan_ini: 0, pending: 0, approved: 0 },
  bed: { total: 0, terisi: 0, tersedia: 0, occupancy_rate: 0 },
  approval: { cuti_pending: 0, jadwal_pending: 0, total_pending: 0 },
  farmasi: { total_item: 0, stok_kritis: 0, stok_aman: 0 },
  mood: { total: 0, baik: 0, baik_pct: 0, oke: 0, oke_pct: 0, perlu_support: 0, perlu_support_pct: 0, avg_energi: 0, avg_stres: 0, avg_fokus: 0 }
})

// Statistics data
const stats = ref({
  totalPatients: 2847,
  todayVisits: 156,
  emergencyCases: 23,
  surgeries: 8
})

// Code Blue Schedule
const codeBlueSchedule = ref({
  pagi: {},
  siang: {},
  malam: {}
})

// Google Reviews
const reviews = ref([])
const placeRating = ref(0)
const totalRatings = ref(0)
const loadingReviews = ref(false)

// Computed properties
const getUserInitials = computed(() => {
  // Prioritaskan nama dari detail pegawai, fallback ke username
  const name = authStore.user?.data?.detail?.nama || authStore.userName || 'User'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const getUserRole = computed(() => {
  if (!authStore.user?.data?.detail) {
    // Fallback ke username jika tidak ada detail
    const username = authStore.userName?.toLowerCase() || ''
    if (username.includes('admin')) return 'Administrator'
    return 'Staff'
  }

  const detail = authStore.user.data.detail

  // Prioritaskan jabatan dari response API
  if (detail.jbtn) {
    return detail.jbtn
  }

  // Fallback ke department
  if (detail.departemen) {
    return detail.departemen
  }

  // Fallback ke parsing nama
  const nama = detail.nama?.toLowerCase() || ''
  if (nama.includes('admin')) return 'Administrator'
  if (nama.includes('dokter')) return 'Dokter'
  if (nama.includes('perawat')) return 'Perawat'
  if (nama.includes('farmasi')) return 'Farmasi'

  return 'Staff'
})

const getDisplayName = computed(() => {
  // Prioritaskan nama dari data.detail.nama sesuai response API
  return authStore.user?.data?.detail?.nama || authStore.userName || 'User'
})

const getUserDepartment = computed(() => {
  return authStore.user?.data?.detail?.departemen || 'Unknown'
})

const getUserPosition = computed(() => {
  return authStore.user?.data?.detail?.jbtn || getUserRole.value
})

const showAdminMenu = computed(() => {
  const position = getUserPosition.value.toLowerCase()
  const name = getDisplayName.value.toLowerCase()

  return position.includes('admin') ||
         position.includes('koordinator') ||
         name.includes('admin') ||
         position.includes('ti') // IT staff can manage menu
})

const getWelcomeMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat pagi! Semoga hari Anda menyenangkan.'
  if (hour < 17) return 'Selamat siang! Jaga kesehatan Anda.'
  return 'Selamat malam! Jangan lupa istirahat.'
})

const isEmailInvalid = computed(() => {
  const email = authStore.user?.data?.detail?.email_resmi || authStore.user?.detail?.email_resmi || null
  if (!email || email === '-' || email === '') return true
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  return !regex.test(email)
})

// Methods
const fetchDepartmentName = async () => {
  const depCode = authStore.user?.data?.detail?.departemen
  if (depCode) {
    try {
      const response = await departemenService.show(depCode)
      if (response.data && response.data.data) {
        departmentName.value = response.data.data.nama
      }
    } catch (err) {
      console.error('Failed to fetch department name', err)
      departmentName.value = depCode // Fallback to code
    }
  }
}

const updateDateTime = () => {
  const now = new Date()
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
  currentDateTime.value = now.toLocaleDateString('id-ID', options)
}

const navigateToModule = (module) => {
  // Navigate to specific module (will implement later)
  console.log(`Navigating to ${module} module`)
  // Example: router.push(`/${module}`)
}

const navigateTo = (path) => {
  router.push(path)
}

const navigateToCodeBlueManagement = () => {
  router.push('/codeblue/schedule')
}

const navigateToRoleMenu = () => {
  router.push('/admin/role-menu')
}

const fetchDashboardStats = async (params = {}) => {
  loadingStats.value = true
  try {
    const [statsRes, moodRes] = await Promise.all([
      dashboardService.getStats(params),
      dashboardService.getMoodStats()
    ])
    
    dashboardStats.value = {
      ...statsRes.data.data,
      mood: moodRes.data.data
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  } finally {
    loadingStats.value = false
  }
}

const fetchCodeBlueSchedule = async () => {
  try {
    const response = await dashboardService.getCodeBlueSchedule()
    codeBlueSchedule.value = response.data.data
  } catch (error) {
    console.error('Error fetching code blue schedule:', error)
  }
}

const fetchReviews = async () => {
  loadingReviews.value = true
  try {
    const response = await dashboardService.getReviews()
    if (response.data && response.data.data) {
      reviews.value = response.data.data.reviews || []
      placeRating.value = response.data.data.rating || 0
      totalRatings.value = response.data.data.user_ratings_total || 0
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
  } finally {
    loadingReviews.value = false
  }
}

const fetchPegawaiTanpaEmail = async () => {
  loadingTanpaEmail.value = true
  try {
    const response = await pegawaiService.getPegawaiTanpaEmail()
    if (response.data && response.data.success) {
      pegawaiTanpaEmail.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching pegawai tanpa email:', error)
  } finally {
    loadingTanpaEmail.value = false
  }
}

const handlePeriodChange = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  let params = {}

  if (selectedPeriod.value === 'today') {
    params = { tgl_awal: `${year}-${month}-${day}`, tgl_akhir: `${year}-${month}-${day}` }
    fetchDashboardStats(params)
  } else if (selectedPeriod.value === 'month') {
    // Start of month to today/end of month
    params = { tgl_awal: `${year}-${month}-01`, tgl_akhir: `${year}-${month}-${day}` } // To current date usually for 'Bulan Ini'
    // Or full month? Usually 'Current Month' implies 1st to End of Month.
    // Let's use 1st to current date for accurate "Bulan Ini" progress.
    // Actually, users might want to see full month data if available. Let's do 1st to last day.
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate()
    params = { tgl_awal: `${year}-${month}-01`, tgl_akhir: `${year}-${month}-${lastDay}` }
    fetchDashboardStats(params)
  } else if (selectedPeriod.value === 'year') {
    params = { tgl_awal: `${year}-01-01`, tgl_akhir: `${year}-12-31` }
    fetchDashboardStats(params)
  }
  // 'custom' waits for explicit apply button
}

const applyCustomFilter = () => {
  if (customStartDate.value && customEndDate.value) {
    fetchDashboardStats({
      tgl_awal: customStartDate.value,
      tgl_akhir: customEndDate.value
    })
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Auto reload function
const startAutoReload = () => {
  if (autoReloadInterval.value) {
    clearInterval(autoReloadInterval.value)
  }
  
  if (autoReloadEnabled.value) {
    autoReloadInterval.value = setInterval(async () => {
      isReloading.value = true
      try {
        // Reload stats based on current filter
        await handlePeriodChange()
        // Reload code blue schedule
        await fetchCodeBlueSchedule()
        // Reload bed availability data
        await fetchBedCinemaData()
      } finally {
        // Show reload indicator for at least 500ms for better UX
        setTimeout(() => {
          isReloading.value = false
        }, 500)
      }
    }, reloadIntervalSeconds.value * 1000)
  }
}

const stopAutoReload = () => {
  if (autoReloadInterval.value) {
    clearInterval(autoReloadInterval.value)
    autoReloadInterval.value = null
  }
}

const toggleAutoReload = () => {
  autoReloadEnabled.value = !autoReloadEnabled.value
  if (autoReloadEnabled.value) {
    startAutoReload()
  } else {
    stopAutoReload()
  }
}

// Lifecycle hooks
onMounted(() => {
  authStore.refreshUserData()
  updateDateTime()
  timeInterval.value = setInterval(updateDateTime, 1000)
  fetchDashboardStats() // Initial load
  fetchCodeBlueSchedule() // Load code blue schedule
  fetchDepartmentName() // Fetch real department name
  fetchReviews() // Fetch Google Reviews
  fetchBedCinemaData() // Fetch bed cinema map data
  startAutoReload() // Start auto reload
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }
  stopAutoReload()
})
</script>


<style scoped>
/* Bed Cinema & Compact Matrix Section */
.bed-cinema-section {
  width: 100%;
}

.bg-success-subtle-light {
  background-color: #f0fdf4 !important;
}

/* Bed Item Card Styling */
.bed-item-card {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid #e2e8f0 !important;
  background-color: #ffffff;
}

.bed-item-card.is-available-card {
  border-left: 5px solid #10b981 !important;
}

.bed-item-card.is-occupied-card {
  border-left: 5px solid #ef4444 !important;
}

.bed-item-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06) !important;
  transform: translateY(-1px);
}

/* Modern Category Matrix Cards */
.category-matrix-card-modern {
  background: #ffffff;
  border: 1px solid #edf2f7 !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.category-matrix-card-modern .card-header {
  background: #ffffff !important;
  background-image: none !important;
}

.category-matrix-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.08), 0 4px 8px -4px rgba(0, 0, 0, 0.04) !important;
}

/* Card Top Accent Bar */
.card-accent-bar {
  height: 4px;
  width: 100%;
}
.card-accent-bar.anak { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.card-accent-bar.kandungan { background: linear-gradient(90deg, #ec4899, #f472b6); }
.card-accent-bar.icu-picu-nicu { background: linear-gradient(90deg, #6366f1, #818cf8); }
.card-accent-bar.perinatologi { background: linear-gradient(90deg, #14b8a6, #2dd4bf); }
.card-accent-bar.isolasi { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.card-accent-bar.kamar-bersalin { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

/* Category Icon Avatars */
.cat-icon-avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
}
.cat-icon-avatar.anak { background: #eff6ff; color: #2563eb; }
.cat-icon-avatar.kandungan { background: #fdf2f8; color: #db2777; }
.cat-icon-avatar.icu-picu-nicu { background: #eef2ff; color: #4f46e5; }
.cat-icon-avatar.perinatologi { background: #f0fdfa; color: #0d9488; }
.cat-icon-avatar.isolasi { background: #fffbeb; color: #d97706; }
.cat-icon-avatar.kamar-bersalin { background: #f5f3ff; color: #7c3aed; }

/* Modern Class Row */
.modern-class-row {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: all 0.15s ease;
}

.modern-class-row.is-available {
  background: #f0fdf4;
  border-color: #dcfce7;
}

.modern-class-row:hover {
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

/* Class Dot Colors */
.class-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.class-dot.vip { background-color: #a855f7; }
.class-dot.utama { background-color: #06b6d4; }
.class-dot.kelas-1 { background-color: #3b82f6; }
.class-dot.kelas-2 { background-color: #10b981; }
.class-dot.kelas-3 { background-color: #0d9488; }
.class-dot.other { background-color: #94a3b8; }

/* Modern Action Button in Card Footer */
.btn-light-primary {
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
  font-size: 0.8rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-light-primary .icon-map,
.btn-light-primary .arrow-icon {
  transition: all 0.2s ease;
  display: inline-block;
}

.btn-light-primary:hover {
  background-color: #2563eb;
  color: #ffffff !important;
  border-color: #2563eb;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.btn-light-primary:hover .icon-map,
.btn-light-primary:hover .arrow-icon {
  color: #ffffff !important;
}

.btn-light-primary:hover .arrow-icon {
  transform: translateX(4px);
}

.cinema-tabs-wrapper {
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.cinema-tabs-wrapper::-webkit-scrollbar {
  height: 6px;
}

.cinema-tabs-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.cinema-tabs-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.cinema-tabs {
  display: flex;
  gap: 10px;
  min-width: max-content;
}

.cinema-tab-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 16px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}

.cinema-tab-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}

.cinema-tab-btn.active {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.cinema-tab-btn.active .badge.bg-success {
  background-color: rgba(255, 255, 255, 0.22) !important;
  color: #ffffff !important;
}

/* Custom Lookup Room Modal (Ultra Clean & Responsive Rebuilt Layout) */
.lookup-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

@media (max-width: 575.98px) {
  .lookup-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }
}

.lookup-modal-container {
  background: #ffffff;
  width: 100%;
  max-width: 900px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

@media (max-width: 575.98px) {
  .lookup-modal-container {
    max-height: 94vh;
    height: 94vh;
    border-radius: 20px 20px 0 0;
  }
}

.lookup-modal-pullbar {
  display: none;
  width: 36px;
  height: 4px;
  background: #cbd5e1;
  border-radius: 2px;
  margin: 8px auto 0 auto;
}

@media (max-width: 575.98px) {
  .lookup-modal-pullbar {
    display: block;
  }
}

.lookup-modal-header {
  padding: 14px 18px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
}

.lookup-modal-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.lookup-modal-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background: #eff6ff;
  color: #2563eb;
  flex-shrink: 0;
}

.lookup-modal-title-box {
  min-width: 0;
}

.lookup-modal-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.badge-pill {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 50px;
}

.badge-pill.bg-primary {
  background: #2563eb;
  color: #ffffff;
}

.badge-pill.bg-outline {
  background: #f8fafc;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.lookup-modal-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.lookup-modal-close {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.lookup-modal-controls {
  padding: 12px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lookup-segmented-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 100%;
}

.lookup-segmented-btn {
  padding: 8px 4px;
  border-radius: 50px;
  font-size: 0.76rem;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.lookup-segmented-btn.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
}

.lookup-segmented-btn.success.active {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
}

.lookup-segmented-btn.danger.active {
  background: #ef4444;
  color: #ffffff;
  border-color: #ef4444;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

.lookup-search-box {
  position: relative;
  width: 100%;
}

.lookup-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.82rem;
}

.lookup-search-input {
  width: 100%;
  height: 38px;
  padding: 0 34px 0 34px;
  border-radius: 50px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  font-size: 0.78rem;
  color: #0f172a;
  outline: none;
}

.lookup-search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.lookup-modal-body {
  padding: 14px 18px;
  overflow-y: auto;
  flex: 1;
  background: #ffffff;
}

.lookup-beds-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lookup-bed-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.lookup-bed-card.status-available {
  border-left: 4px solid #10b981;
}

.lookup-bed-card.status-occupied {
  border-left: 4px solid #ef4444;
}

.lookup-bed-top {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.lookup-bed-pill {
  width: 42px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  color: #ffffff;
  flex-shrink: 0;
}

.lookup-bed-main-info {
  flex: 1;
  min-width: 0;
}

.lookup-bed-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.lookup-bed-bangsal {
  font-weight: 700;
  font-size: 0.88rem;
  color: #0f172a;
}

.lookup-bed-code {
  font-size: 0.65rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.lookup-bed-sub {
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 2px;
}

.lookup-bed-status {
  flex-shrink: 0;
}

.chip {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.chip-success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.chip-danger {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.chip-warning {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.lookup-patient-box {
  margin: 0 14px 12px 14px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lookup-patient-row-1 {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.lookup-patient-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  font-size: 0.85rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.lookup-patient-info {
  flex: 1;
  min-width: 0;
}

.lookup-patient-name {
  font-weight: 700;
  font-size: 0.85rem;
  color: #0f172a;
  word-break: break-word;
}

.lookup-patient-meta {
  font-size: 0.72rem;
  color: #64748b;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.lookup-patient-meta .dot {
  color: #cbd5e1;
}

.lookup-patient-row-2 {
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 0.73rem;
}

.lookup-dpjp .label {
  color: #64748b;
  margin-right: 4px;
}

.lookup-penjamin {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chip-penjamin {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  font-weight: 700;
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.lookup-tgl-masuk {
  font-size: 0.68rem;
  color: #64748b;
}

.lookup-empty-box {
  margin: 0 14px 12px 14px;
  padding: 10px 14px;
  background: #f0fdf4;
  color: #15803d;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  font-size: 0.74rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lookup-modal-footer {
  padding: 12px 18px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.lookup-footer-count {
  font-size: 0.78rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.lookup-modal-btn-close {
  padding: 6px 24px;
  border-radius: 50px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  font-size: 0.78rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.15s ease;
}

.lookup-modal-btn-close:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

@media (max-width: 575.98px) {
  .lookup-modal-footer {
    flex-direction: column;
  }
  .lookup-modal-btn-close {
    width: 100%;
  }
}

.cinema-tab-btn.active .badge.bg-secondary {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: #ffffff !important;
}

.cinema-room-container {
  background: #fafafb;
  border: 1px solid #f1f5f9;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.01);
  min-height: unset;
}

/* Movie Screen */
.nursing-station-screen {
  position: relative;
  width: 100%;
}

.screen-border {
  height: 6px;
  width: 80%;
  margin: 0 auto;
  border-radius: 50% / 0 0 100% 100%;
  background: linear-gradient(to bottom, #3b82f6, #60a5fa);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.45);
}

.screen-label {
  letter-spacing: 0.1em;
  font-size: 0.68rem;
  color: #94a3b8;
}

/* Cinema seats layout */
.seats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cinema-seat-wrapper {
  perspective: 1000px;
}

.cinema-seat {
  width: 45px;
  height: 38px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  transition: all 0.2s ease;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px !important;
}

.cinema-seat:hover {
  transform: scale(1.12) translateY(-1px);
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.cinema-seat.selected {
  border-color: #1e293b !important;
  box-shadow: 0 0 0 2px rgba(30, 41, 59, 0.2) !important;
}

.seat-icon {
  font-size: 0.85rem;
  opacity: 0.75;
  margin: 0 !important;
}

.seat-label {
  display: block;
  font-size: 0.55rem;
  letter-spacing: -0.01em;
  margin: -1px 0 0 0 !important;
  font-weight: 800;
  line-height: 1;
}

/* Status: KOSONG (Available) color variations depending on class */
.cinema-seat.kosong.kelas-vip {
  background: #faf5ff;
  border-color: #d8b4fe;
  color: #7c3aed;
}
.cinema-seat.kosong.kelas-vip:hover {
  background: #f3e8ff;
}

.cinema-seat.kosong.kelas-utama {
  background: #ecfeff;
  border-color: #67e8f9;
  color: #0891b2;
}
.cinema-seat.kosong.kelas-utama:hover {
  background: #cffafe;
}

.cinema-seat.kosong.kelas-1 {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #2563eb;
}
.cinema-seat.kosong.kelas-1:hover {
  background: #dbeafe;
}

.cinema-seat.kosong.kelas-2 {
  background: #f0fdf4;
  border-color: #86efac;
  color: #16a34a;
}
.cinema-seat.kosong.kelas-2:hover {
  background: #dcfce7;
}

.cinema-seat.kosong.kelas-3 {
  background: #f0fdfa;
  border-color: #5eead4;
  color: #0d9488;
}
.cinema-seat.kosong.kelas-3:hover {
  background: #ccfbf1;
}

/* Status: ISI (Occupied) */
.cinema-seat.isi {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #64748b;
  opacity: 0.7;
}
.cinema-seat.isi .seat-icon {
  opacity: 0.45;
}
.cinema-seat.isi:hover {
  opacity: 0.95;
  background: #e2e8f0;
}

/* Status: DIBOOKING */
.cinema-seat.dibooking {
  background: #fffbeb;
  border-color: #fde047;
  border-style: dashed;
  color: #d97706;
}
.cinema-seat.dibooking:hover {
  background: #fef3c7;
}

/* Detail Side Panel */
.bed-detail-panel {
  background: #ffffff;
  border-color: #e2e8f0 !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.detail-status-badge {
  font-size: 0.72rem;
  letter-spacing: 0.05em;
}

.detail-status-badge.kosong {
  background: #dcfce7;
  color: #15803d;
}

.detail-status-badge.isi {
  background: #f1f5f9;
  color: #475569;
}

.detail-status-badge.dibooking {
  background: #fef3c7;
  color: #92400e;
}

/* Legends */
.legend-seat-box {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: inline-block;
  border: 1px solid #cbd5e1;
}

.legend-seat-box.kosong {
  background: #ffffff;
}

.legend-seat-box.isi {
  background: #f1f5f9;
}

.legend-seat-box.dibooking {
  background: #fffbeb;
  border-style: dashed;
}

.legend-class-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  display: inline-block;
}

.legend-class-color.vip { background: #7c3aed; }
.legend-class-color.kelas-utama { background: #0891b2; }
.legend-class-color.kelas-1 { background: #2563eb; }
.legend-class-color.kelas-2 { background: #16a34a; }
.legend-class-color.kelas-3 { background: #0d9488; }

/* Dashboard layout */
.dashboard-page {
  width: 100%;
}

/* Alert Section */
.alert-section {
  margin-top: 1rem;
}

.alert-card.warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.alert-icon {
  width: 48px;
  height: 48px;
  background: #fef3c7;
  color: #d97706;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.alert-title h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #92400e;
  margin: 0;
}

.alert-title p {
  font-size: 0.875rem;
  color: #b45309;
  margin: 0.25rem 0 0 0;
}

.btn-toggle-alert {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #fcd34d;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #b45309;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-alert:hover {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-color: #f59e0b;
}

.table-container-minimal {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #fde68a;
}

.alert-table {
  width: 100%;
  border-collapse: collapse;
}

.alert-table th {
  background: #fff9db;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #b45309;
  font-weight: 700;
  border-bottom: 1px solid #fde68a;
}

.alert-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #fef3c7;
  font-size: 0.875rem;
}

.alert-table tr:last-child td {
  border-bottom: none;
}

.email-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.email-badge.missing {
  background: #fee2e2;
  color: #991b1b;
}

.email-badge.invalid {
  background: #fef3c7;
  color: #92400e;
}

/* Personal Email Alert */
.personal-alert-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #fff4e6;
  border: 1px solid #ffd8a8;
  border-radius: 12px;
  color: #d9480f;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.personal-alert-icon {
  font-size: 1.5rem;
  color: #f76707;
  flex-shrink: 0;
}

.personal-alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.personal-alert-content strong {
  font-size: 1rem;
  margin-bottom: 0.125rem;
  color: #d9480f;
}

.personal-alert-content span {
  font-size: 0.85rem;
  color: #862e08;
}

.btn-fix-email {
  padding: 0.5rem 1rem;
  background: #f76707;
  color: white !important;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-fix-email:hover {
  background: #e8590c;
}

/* Welcome Section */
.welcome-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.welcome-text h2 {
  color: #1e40af;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.welcome-text p {
  color: #666;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.user-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.user-badge {
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.department-badge {
  display: inline-block;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.date-time-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-time {
  color: #3b82f6;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}

.session-info {
  background: #dcfce7;
  color: #16a34a;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

/* Statistics Cards */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  padding-top: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  transition: all 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  transition: all 0.2s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.05);
}

.stat-icon.patients {
  background-color: #eff6ff;
  color: #3b82f6;
}

.stat-icon.today-visits {
  background-color: #ecfdf5;
  color: #10b981;
}

.stat-icon.surgeries {
  background-color: #f5f3ff;
  color: #8b5cf6;
}

.stat-icon.emergency {
  background-color: #fef2f2;
  color: #ef4444;
}

.stat-content h3 {
  font-size: 2.1rem;
  font-weight: 750;
  color: #0f172a;
  margin-bottom: 0.1rem;
  letter-spacing: -0.01em;
}

.stat-content p {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-trend {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
}

.stat-trend.positive {
  background: #dcfce7;
  color: #15803d;
}

.stat-trend.negative {
  background: #fee2e2;
  color: #b91c1c;
}

.stat-trend.neutral {
  background: #f1f5f9;
  color: #475569;
}

/* Dashboard Sections */
.dashboard-sections {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.quick-stats-section,
.codeblue-schedule-section,
.reviews-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid #f1f5f9;
  align-self: start; /* Prevent awkward stretching */
}

.quick-stats-section {
  grid-column: span 2;
}

.quick-stats-section h3,
.codeblue-schedule-section h3,
.reviews-section h3 {
  color: #0f172a;
  margin-bottom: 1.25rem;
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.quick-stats-section h3 i {
  color: #4f46e5;
}

.codeblue-schedule-section h3 i {
  color: #ef4444;
}

.reviews-section h3 i {
  color: #fbbf24;
}

/* Section Header with Action Button */
.section-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header-with-action h3 {
  margin-bottom: 0 !important;
}

/* Manage Code Blue Button */
.btn-manage-codeblue {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.btn-manage-codeblue:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-manage-codeblue:active {
  transform: translateY(0);
}

/* Code Blue Tabs */
.codeblue-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 0.25rem;
  margin-bottom: 1.25rem;
  border: 1px solid #e2e8f0;
}

.cb-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.cb-tab-btn:hover {
  color: #1e293b;
  background: rgba(255, 255, 255, 0.5);
}

.cb-tab-btn.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.cb-tab-btn.pagi.active {
  color: #b45309;
}
.cb-tab-btn.siang.active {
  color: #2563eb;
}
.cb-tab-btn.malam.active {
  color: #4f46e5;
}

/* Shift Card */
.shift-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 2px solid #f1f5f9;
}

.shift-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.shift-card.pagi-shift { border-color: rgba(245, 158, 11, 0.2); }
.shift-card.siang-shift { border-color: rgba(59, 130, 246, 0.2); }
.shift-card.malam-shift { border-color: rgba(99, 102, 241, 0.2); }

.shift-card.pagi-shift:hover { border-color: #f59e0b; }
.shift-card.siang-shift:hover { border-color: #3b82f6; }
.shift-card.malam-shift:hover { border-color: #6366f1; }

/* Shift Team */
.shift-team {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Team Member Item (Upgraded avatar style) */
.team-member-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 0.85rem;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid #f1f5f9;
}

.team-member-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
  border-color: #e2e8f0;
}

.team-member-item.leader-item {
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
}

.team-member-item.leader-item:hover {
  background: #dbeafe;
  border-color: #3b82f6;
}

.member-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.leader-avatar {
  background: #3b82f6;
  color: white;
}

.member-info {
  display: flex;
  flex-direction: column;
  min-width: 0; /* Enable text ellipsis on flex children */
  flex: 1;
}

.member-name {
  font-size: 0.85rem;
  color: #1e293b;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.member-role {
  font-size: 0.725rem;
  color: #64748b;
  font-weight: 500;
}

.leader-item .member-name {
  color: #1e3a8a;
  font-weight: 700;
}

.leader-item .member-role {
  color: #2563eb;
  font-weight: 600;
}

.empty-shift-team {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #94a3b8;
  gap: 0.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.empty-shift-team i {
  font-size: 1.5rem;
}

.empty-shift-team span {
  font-size: 0.8rem;
  font-weight: 500;
}

/* Quick Stats Grid */
.quick-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.stats-loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1rem;
}

.stats-loading i {
  margin-right: 0.5rem;
  color: #3b82f6;
}

/* Quick Stat Card (Grid Split Layout) */
.quick-stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  border: 1px solid #f1f5f9;
}

.quick-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.quick-stat-card.pasien-card:hover { border-color: #3b82f6; }
.quick-stat-card.pegawai-card:hover { border-color: #10b981; }
.quick-stat-card.cuti-card:hover { border-color: #f59e0b; }
.quick-stat-card.bed-card:hover { border-color: #8b5cf6; }

.card-header-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
}

.card-title-block {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.card-title-block h4 {
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.card-title-block p {
  color: #64748b;
  font-size: 0.725rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-breakdown-full {
  width: 100%;
}

/* Stat Icon Wrapper */
.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.pasien-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.pegawai-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.cuti-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.bed-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
}

/* Stat Breakdown */
.stat-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
}

.breakdown-item {
  font-size: 0.725rem;
  padding: 0.3rem 0.65rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid #e2e8f0;
}

.breakdown-item.pending {
  background: #fef3c7;
  color: #92400e;
  border-color: #fde68a;
}

.breakdown-item.approved {
  background: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}

.breakdown-item.available {
  background: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}

.breakdown-item.occupied {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

/* Stat Breakdown Grid - for pasien & pegawai */
.stat-breakdown-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.35rem;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.stat-breakdown-grid::-webkit-scrollbar {
  width: 4px;
}

.stat-breakdown-grid::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.stat-breakdown-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.stat-breakdown-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.breakdown-grid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.6rem;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.775rem;
  border: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.breakdown-grid-item:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
  transform: translateX(2px);
}

.poli-name {
  color: #475569;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 0.5rem;
}

.poli-count {
  color: #0f172a;
  font-weight: 700;
  font-size: 0.775rem;
  min-width: 22px;
  text-align: center;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.05rem 0.25rem;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.activity-icon.patient { background: #e0f2fe; }
.activity-icon.emergency { background: #fee2e2; }
.activity-icon.surgery { background: #fef3c7; }
.activity-icon.lab { background: #e9d5ff; }
.activity-icon.pharmacy { background: #d1fae5; }

.activity-content {
  flex: 1;
}

.activity-text {
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #9ca3af;
  font-size: 0.8rem;
}



/* Patient Stats Gradients */
.total-pasien-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.ranap-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.ralan-gradient {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.igd-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.quick-stat-card.total-pasien-card:hover { border-color: #3b82f6; }
.quick-stat-card.ranap-card:hover { border-color: #8b5cf6; }
.quick-stat-card.ralan-card:hover { border-color: #10b981; }
.quick-stat-card.igd-card:hover { border-color: #ef4444; }

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-right {
  animation: fadeInRight 0.3s ease-out forwards;
}

.animate-fade-in-down {
  animation: fadeInDown 0.2s ease-out forwards;
}

/* Filter Section - Force Horizontal Layout */
.filter-section {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 0.75rem !important;
}

/* Filter Tabs - Sliding Pill Control */
.filter-tabs-container {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 0 !important;
  background: #f1f5f9;
  border-radius: 30px;
  padding: 0.25rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
}

.filter-tab-item {
  display: inline-flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  padding: 0.5rem 1.25rem !important;
  border-radius: 30px !important;
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  user-select: none !important;
  color: #64748b !important;
  background: transparent !important;
  border: none !important;
}

.filter-tab-item.active {
  background: white !important;
  color: #3b82f6 !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08) !important;
  border: 1px solid rgba(59, 130, 246, 0.05) !important;
}

.filter-tab-item:not(.active):hover {
  color: #1e293b !important;
  background: rgba(255, 255, 255, 0.5) !important;
}

/* Custom Date Inputs Styling */
.custom-date-input {
  padding: 0.5rem 0.75rem !important;
  font-size: 0.85rem !important;
  color: #334155 !important;
  font-weight: 500 !important;
  border: 1.5px solid #cbd5e1 !important;
  border-radius: 20px !important;
  outline: none !important;
  background: white !important;
  width: 9rem !important;
  transition: all 0.2s ease !important;
}

.custom-date-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.date-separator {
  color: #94a3b8 !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
}

.custom-date-apply {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: #3b82f6 !important;
  color: white !important;
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2) !important;
  border: none !important;
  padding: 0 !important;
}

.custom-date-apply:hover {
  background: #2563eb !important;
  transform: scale(1.05);
  box-shadow: 0 6px 14px rgba(59, 130, 246, 0.3) !important;
}

.custom-date-apply:active {
  transform: scale(0.95);
}

/* Auto Reload Button */
.btn-auto-reload {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  padding: 0.5rem 1rem !important;
  background: white !important;
  border: 1.5px solid #cbd5e1 !important;
  border-radius: 30px !important;
  color: #64748b !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  cursor: pointer !important;
  position: relative !important;
  transition: all 0.2s ease !important;
  white-space: nowrap !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
}

.btn-auto-reload:hover {
  background: #f8fafc !important;
  border-color: #94a3b8 !important;
  color: #334155 !important;
}

.btn-auto-reload.active {
  background: #eff6ff !important;
  color: #2563eb !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08) !important;
}

.btn-auto-reload.active:hover {
  background: #dbeafe !important;
  border-color: #2563eb !important;
}

.btn-auto-reload i {
  font-size: 0.85rem !important;
  transition: transform 0.2s;
}

.btn-auto-reload.active i.fa-spin {
  animation: spin 2s linear infinite !important;
}

.reload-pulse {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
  animation: pulse-reload 1.5s infinite;
}

@keyframes pulse-reload {
  0% {
    box-shadow: 0 0 0 0px rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0px rgba(16, 185, 129, 0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.reload-status {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* Reload Indicator */
.btn-auto-reload {
  position: relative !important;
}

.reload-pulse {
  position: absolute !important;
  top: -4px !important;
  right: -4px !important;
  width: 12px !important;
  height: 12px !important;
  background: #ef4444 !important;
  border-radius: 50% !important;
  animation: pulse 1.5s ease-in-out infinite !important;
  box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7) !important;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.btn-auto-reload.reloading {
  animation: reload-flash 0.5s ease-in-out !important;
}

@keyframes reload-flash {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-sections {
    grid-template-columns: 1fr 1fr;
  }
  .quick-stats-section {
    grid-column: span 2;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-sections {
    grid-template-columns: 1fr;
  }

  .quick-stats-section {
    grid-column: span 1;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .user-menu {
    flex-direction: column;
  }

  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .date-time-info {
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-main {
    padding: 1rem;
  }
}

/* Mobile Optimization - Small Screens */
@media (max-width: 640px) {
  .dashboard-page {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }

  /* Ensure dashboard-main has padding */
  .dashboard-main {
    padding: 0.5rem !important; /* Reduced from 1rem to maximize usable space on mobile */
    overflow-x: hidden !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  /* Filter Section - Stack Vertically */
  .filter-section {
    flex-direction: column !important;
    flex-wrap: wrap !important;
    align-items: stretch !important;
    gap: 0.75rem !important;
  }

  /* Filter Tabs - Full Width Stack */
  .filter-tabs-container {
    display: flex !important;
    width: 100% !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
    border-radius: 0.5rem !important;
    padding: 0 !important;
    background: transparent !important;
  }

  .filter-tab-item {
    width: 100% !important;
    justify-content: center !important;
    padding: 0.75rem 1rem !important;
    border-radius: 0.5rem !important;
    font-size: 0.875rem !important;
  }

  .filter-tab-item i {
    font-size: 1rem !important;
  }

  /* Custom Date Inputs - Full Width */
  .custom-date-input {
    width: 100% !important;
    font-size: 1rem !important;
    padding: 0.75rem !important;
  }

  .date-separator {
    display: none !important;
  }

  .custom-date-apply {
    width: 100% !important;
    padding: 0.75rem !important;
    font-size: 1rem !important;
  }

  /* Auto Reload Button - Full Width */
  .btn-auto-reload {
    width: 100% !important;
    justify-content: center !important;
    padding: 0.75rem 1rem !important;
    font-size: 1rem !important;
  }

  /* Welcome Section */
  .welcome-section {
    padding: 1.25rem !important;
  }

  .welcome-section h2 {
    font-size: 1.25rem !important;
    line-height: 1.4 !important;
  }

  .welcome-section p {
    font-size: 0.875rem !important;
  }

  .user-badges {
    flex-direction: column !important;
    gap: 0.5rem !important;
    width: 100% !important;
  }

  .user-badge,
  .department-badge {
    width: 100% !important;
    justify-content: center !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem !important;
  }

  .date-time {
    font-size: 0.875rem !important;
  }

  .session-info {
    font-size: 0.75rem !important;
  }

  /* Stat Cards */
  .stat-card {
    padding: 1.25rem !important;
  }

  .stat-icon {
    width: 3rem !important;
    height: 3rem !important;
    font-size: 1.5rem !important;
  }

  .stat-content h3 {
    font-size: 1.75rem !important;
  }

  .stat-content p {
    font-size: 0.875rem !important;
  }

  /* Dashboard Sections - Reset to default */
  .dashboard-sections {
    margin-left: 0 !important;
    margin-right: 0 !important;
    gap: 1rem !important;
  }

  /* Card Containers Mobile Spacing Override */
  .quick-stats-section,
  .codeblue-schedule-section,
  .reviews-section {
    padding: 1rem !important; /* Reduced card padding from 1.5rem to 1rem to fit screens */
  }

  /* Quick Stats Section */
  .quick-stats-section h3 {
    font-size: 1.125rem !important;
  }

  .quick-stats-grid {
    grid-template-columns: 1fr !important; /* Stack stats cards vertically on mobile */
    gap: 1rem !important;
  }

  .quick-stat-card {
    padding: 1rem !important; /* Reduced from 1.25rem to align with stat cards */
  }

  .stat-icon-wrapper {
    width: 3rem !important;
    height: 3rem !important;
  }

  .stat-icon-wrapper i {
    font-size: 1.5rem !important;
  }

  .stat-details h4 {
    font-size: 1.75rem !important;
  }

  .stat-details p {
    font-size: 0.875rem !important;
  }

  .breakdown-grid-item,
  .breakdown-item {
    font-size: 0.75rem !important;
  }

  /* Code Blue Header Wrap & Mobile Adjustments */
  .section-header-with-action {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 0.5rem !important;
    justify-content: space-between !important;
    align-items: center !important;
  }

  .section-header-with-action h3 {
    margin-bottom: 0 !important;
  }

  .codeblue-tabs {
    gap: 0.25rem !important;
    padding: 0.25rem !important;
  }

  .cb-tab-btn {
    padding: 0.5rem 0.35rem !important;
    font-size: 0.75rem !important;
    gap: 0.25rem !important;
  }

  .cb-tab-btn span {
    font-size: 0.75rem !important;
  }

  /* Google Reviews Mobile Stacking */
  .place-rating-summary {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.5rem !important;
    padding: 0.75rem 1rem !important;
  }

  .review-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.5rem !important;
  }

  .reviewer-info {
    width: 100% !important;
  }

  .review-rating {
    align-self: flex-start !important;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 1rem;
  }

  .header-left h1 {
    font-size: 1.5rem;
  }

  .welcome-section {
    padding: 1.5rem;
  }

  .welcome-section h2 {
    font-size: 1.5rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}

/* Reviews Section - inside dashboard-sections */
.reviews-section {
  align-self: start;
}

.reviews-section h3 {
  color: #0f172a;
  margin-bottom: 1.25rem;
  font-size: 1.15rem;
  font-weight: 700;
  position: sticky;
  top: 0;
  background: white;
  padding-bottom: 0.5rem;
  z-index: 1;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.reviews-list::-webkit-scrollbar {
  width: 4px;
}

.reviews-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.reviews-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.reviews-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.place-rating-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: 12px;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(251, 191, 36, 0.3);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.05);
}

.place-rating-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-number {
  font-size: 1.6rem;
  font-weight: 800;
  color: #b45309;
  letter-spacing: -0.01em;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars .fa-star {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.rating-stars .fa-star.active {
  color: #fbbf24;
}

.rating-total {
  font-size: 0.825rem;
  color: #b45309;
  font-weight: 600;
  opacity: 0.9;
}

.review-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.01);
}

.review-card:hover {
  background: white;
  border-color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.reviewer-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.reviewer-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #e2e8f0;
}

.reviewer-meta {
  display: flex;
  flex-direction: column;
}

.reviewer-name {
  font-weight: 700;
  color: #1e293b;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.reviewer-name:hover {
  text-decoration: none;
  color: #3b82f6;
}

.review-time {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.review-rating {
  color: #cbd5e1;
  font-size: 0.8rem;
  flex-shrink: 0;
  white-space: nowrap;
}

.review-rating .active {
  color: #fbbf24;
}

.review-body p {
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-state {
  text-align: center;
  padding: 2.5rem;
  color: #64748b;
  background: white;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
}

/* Mood Combined Section Styles */
.mood-analytics-combined-section {
  margin-bottom: 3rem;
  padding: 0;
}

.mood-analytics-wrapper {
  display: flex;
  gap: 2rem;
  align-items: stretch;
}

.mood-summary-side {
  flex: 0 0 calc(25% - 1.5rem);
  max-width: calc(25% - 1.5rem);
}

.mood-slider-side {
  flex: 1;
  min-width: 0;
}

/* Premium Analytic Mood Card */
.analytic-mood-card {
  position: relative;
  height: 100%;
  margin: 0 !important;
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  border-radius: 24px !important;
  padding: 1rem 1.25rem !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.04) !important;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  flex-direction: column !important;
}

.analytic-mood-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.85) !important;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08) !important;
}

.card-glass-overlay {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 77, 77, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.stat-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
  width: 100%;
}

.mood-icon-bg {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff4d4d, #f97316);
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  box-shadow: 0 6px 12px rgba(255, 77, 77, 0.15);
}

.mood-badge-premium {
  background: rgba(34, 197, 94, 0.08);
  color: #16a34a;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  border: 1px solid rgba(34, 197, 94, 0.1);
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.05);
  transition: all 0.3s ease;
  cursor: default;
}

.mood-badge-premium:hover {
  background: rgba(34, 197, 94, 0.12);
  transform: scale(1.05);
}

.stat-content-premium {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
}

.sentiment-value {
  font-size: 1.85rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  line-height: 1;
  text-align: left;
}

.sentiment-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin: 0.2rem 0 0.85rem 0;
  text-align: left;
}

.sentiment-progress-container {
  margin-bottom: 0.75rem;
}

.progress-segment-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.4rem;
}

.premium-progress-bar {
  height: 6px;
  background: #f1f5f9;
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 0.6rem;
}

.progress-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 1s ease-out;
}

.progress-fill.positive { background: linear-gradient(to right, #22c55e, #4ade80); }
.progress-fill.neutral { background: linear-gradient(to right, #64748b, #94a3b8); }
.progress-fill.negative { background: linear-gradient(to right, #ef4444, #f87171); }

.mood-indicators-premium {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 0.75rem;
  width: 100%;
}

.indicator-chip {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  padding: 0.5rem 0.25rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.indicator-chip:hover {
  background: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.06);
  border-color: #e2e8f0;
}

.chip-icon {
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.indicator-chip.energy .chip-icon { color: #f59e0b; }
.indicator-chip.focus .chip-icon { color: #3b82f6; }
.indicator-chip.stress .chip-icon { color: #ef4444; }

.chip-val {
  display: block;
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
}

.chip-lbl {
  font-size: 0.6rem;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 600;
}

/* Mobile responsive */
@media (max-width: 1024px) {
  .mood-analytics-wrapper {
    flex-direction: column;
  }
  
  .mood-summary-side {
    flex: 1;
    width: 100%;
  }

  .analytic-mood-card {
    height: auto !important;
    padding: 1rem !important;
  }

  .stat-header-main {
    margin-bottom: 0.75rem;
  }

  .sentiment-value {
    font-size: 1.75rem;
  }

  .sentiment-label {
    margin: 0.25rem 0 0.75rem 0;
  }

  .sentiment-progress-container {
    margin-bottom: 0.75rem;
  }

  .premium-progress-bar {
    margin-bottom: 0.5rem;
  }

  .mood-indicators-premium {
    gap: 0.5rem;
  }

  .indicator-chip {
    padding: 0.5rem 0.25rem;
  }

  .mood-summary-side {
    flex: 1 1 100% !important;
    max-width: 100% !important;
    width: 100%;
  }
}

.mood-section {
  margin-bottom: 2rem;
}

.mood-gradient {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%);
}

.quick-stat-card.mood-card:hover {
  border-color: #ff6b6b;
}

.stat-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2px;
}

.stat-pct {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 12px;
}

.stat-pct.positive { background: #dcfce7; color: #16a34a; }

.stat-breakdown-multi {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.breakdown-item-new {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot.neutral { background: #94a3b8; }
.dot.negative { background: #fca5a5; }

.mood-indicators-mini {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #64748b;
}

.indicator-item i { font-size: 0.65rem; }
.indicator-item span { font-weight: 700; color: #1e293b; }


/* Ensure line-clamp for compatibility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
