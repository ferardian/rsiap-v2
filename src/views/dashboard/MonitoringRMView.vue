<template>
  <div class="monitoring-rm-page">
    <div class="main-wrapper">
      <!-- Header Section -->
      <div class="page-header shadow-sm">
        <div class="header-overlay"></div>
        <div class="header-glow-1"></div>
        <div class="header-glow-2"></div>
        <div class="header-content">
          <div class="header-brand">
            <div class="brand-icon-wrapper">
              <i class="fas fa-folder-open icon-brand"></i>
            </div>
            <div class="brand-info">
              <div class="status-indicator">
                <span class="pulse-dot"></span>
                <span class="system-label">MONITORING DIGITALISASI</span>
              </div>
              <h1 class="page-title">Monitoring Migrasi RM</h1>
              <p class="page-subtitle">Pelacakan migrasi berkas rekam medis manual ke ERM</p>
            </div>
          </div>
          <div class="completion-card">
            <div class="completion-card-bg"></div>
            <div class="completion-info">
              <div class="completion-title-row">
                <span class="label">PROGRESS TOTAL</span>
                <span class="percentage">{{ completionRate }}%</span>
              </div>
              <div class="completion-track">
                <div class="completion-fill" :style="{ width: `${completionRate}%` }"></div>
              </div>
              <div class="completion-meta">
                <span>{{ stats.erm || 0 }} dari {{ stats.total || 0 }} berkas selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-container">
      <!-- Stats Summary Cards -->
      <div class="stats-grid">
        <div v-for="stat in statCards" :key="stat.label" class="stat-card" :style="{ borderLeft: `4px solid ${stat.color}` }">
          <div class="stat-icon" :style="{ color: `${stat.color}22` }">{{ stat.icon }}</div>
          <div class="stat-info">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Distribution Chart (Simplified Radial concept with CSS) -->
        <div class="chart-container distribution-chart">
          <h3 class="chart-title">▸ Distribusi Status</h3>
          <div class="radial-group">
            <div v-for="s in radialStats" :key="s.label" class="radial-item">
              <div class="radial-progress" :style="getRadialStyle(s.value, stats.total, s.color)">
                <div class="radial-inner">
                  <span class="radial-value" :style="{ color: s.color }">{{ s.value }}</span>
                </div>
              </div>
              <span class="radial-label">{{ s.label }}</span>
            </div>
          </div>
        </div>

        <!-- Progress per Unit -->
        <div class="chart-container unit-progress">
          <h3 class="chart-title">▸ Progress per Unit</h3>
          <div v-if="loading" class="loading-mini">
            <div class="spinner"></div>
          </div>
          <div v-else class="bar-grid">
            <div v-for="(v, unit) in stats.unit_map" :key="unit" class="bar-item">
              <div class="bar-header">
                <span class="unit-name">{{ unit }}</span>
                <span class="unit-count" :style="{ color: '#10b981' }">{{ v.ERM }}/{{ v.total }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: `${stats.total > 0 ? (v.ERM/v.total)*100 : 0}%`, backgroundColor: '#10b981' }"></div>
              </div>
            </div>
            <div v-if="Object.keys(stats.unit_map).length === 0" class="empty-mini">
              Belum ada data unit
            </div>
          </div>
        </div>
      </div>

      <!-- Filter & Search Bar -->
      <div class="filter-bar card shadow-sm">
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="filters.search" 
            type="text" 
            placeholder="Cari kode, nama berkas, atau departemen..." 
            class="search-input"
          >
        </div>
        <div class="filter-controls">
          <select v-model="filters.unit" class="select-input">
            <option value="Semua Unit">Semua Unit</option>
            <option v-for="dept in departemenList" :key="dept.dep_id" :value="dept.dep_id">{{ dept.nama }}</option>
          </select>
          <select v-model="filters.prioritas" class="select-input">
            <option value="Semua">Semua Prioritas</option>
            <option value="Kritis">Kritis</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
          <select v-model="filters.assigned_to_nik" class="select-input">
            <option value="Semua">Semua Programmer</option>
            <option v-for="p in pegawaiList" :key="p.nik" :value="p.nik">{{ p.nama }}</option>
          </select>
          <div class="status-tabs">
            <button 
              v-for="s in statusOptions" 
              :key="s" 
              @click="filters.status = s"
              :class="['tab-btn', { active: filters.status === s }, s.toLowerCase().replace(' ', '-')] "
            >
              {{ s }}
            </button>
          </div>
          <button @click="openModal()" class="btn-add">
            <i class="fas fa-plus"></i> Tambah Berkas
          </button>
          <div class="result-count">
            <i class="fas fa-file-alt"></i> {{ filteredData.length }} Berkas
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-card shadow-sm">
        <div class="table-container" :class="{ 'is-loading': loading }">
          <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
            <span>Memuat data...</span>
          </div>
          <table class="monitoring-table">
            <thead>
              <tr>
                <th @click="handleSort('kode')" class="sortable">Kode RM <i :class="getSortIcon('kode')"></i></th>
                <th @click="handleSort('nama')" class="sortable">Nama Berkas <i :class="getSortIcon('nama')"></i></th>
                <th @click="handleSort('unit')" class="sortable">Departemen <i :class="getSortIcon('unit')"></i></th>
                <th @click="handleSort('status')" class="sortable">Status <i :class="getSortIcon('status')"></i></th>
                <th @click="handleSort('prioritas')" class="sortable">Prioritas <i :class="getSortIcon('prioritas')"></i></th>
                <th class="text-center">Fisik</th>
                <th @click="handleSort('tabel')" class="sortable">Tabel DB <i :class="getSortIcon('tabel')"></i></th>
                <th @click="handleSort('catatan')" class="sortable">Catatan <i :class="getSortIcon('catatan')"></i></th>
                <th @click="handleSort('updated_at')" class="sortable">Diperbarui <i :class="getSortIcon('updated_at')"></i></th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredData" :key="row.id" class="clickable-row">
                <td class="cell-kode" @click="openDrawer(row)">{{ row.kode }}</td>
                <td class="cell-nama" @click="openDrawer(row)">{{ row.nama }}</td>
                <td class="cell-unit" @click="openDrawer(row)">
                  <div class="dept-badges">
                    <span v-for="dept in row.departemen" :key="dept.dep_id" class="badge-unit">
                      {{ dept.nama }}
                    </span>
                    <span v-if="!row.departemen?.length" class="badge-unit empty">N/A</span>
                  </div>
                </td>
                <td class="cell-status" @click="openDrawer(row)">
                  <span :class="['badge-status', row.status.toLowerCase().replace(' ', '-')]">
                    <span class="status-dot"></span> {{ row.status }}
                  </span>
                </td>
                <td class="cell-prioritas" @click="openDrawer(row)">
                  <span :class="['badge-prioritas', (row.prioritas || 'Sedang').toLowerCase()]">
                    {{ row.prioritas || 'Sedang' }}
                  </span>
                </td>
                <td class="cell-files text-center" @click="openDrawer(row)">
                  <span class="file-counter" :class="{ 'has-files': row.files && row.files.length > 0 }">
                    <i class="fas fa-paperclip"></i> {{ row.files ? row.files.length : 0 }}
                  </span>
                </td>
                <td class="cell-tabel" @click="openDrawer(row)">
                  <code v-if="row.tabel && row.tabel !== '-'" class="tabel-code">{{ row.tabel }}</code>
                  <span v-else class="empty-dash">—</span>
                </td>
                <td class="cell-catatan" @click="openDrawer(row)">
                  <div v-if="row.catatan && row.catatan !== '-'" class="catatan-wrapper">
                    <span class="catatan-text">{{ row.catatan }}</span>
                    <div class="catatan-tooltip">{{ row.catatan }}</div>
                  </div>
                  <span v-else class="empty-dash">—</span>
                </td>
                <td class="cell-updated" @click="openDrawer(row)">{{ formatDateDetailed(row.updated_at) }}</td>
                <td class="cell-actions">
                  <div class="action-btns">
                    <button @click="openModal(row)" class="btn-icon" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete(row)" class="btn-icon delete" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredData.length === 0 && !loading">
                <td colspan="10" class="empty-state">
                  <div class="empty-content">
                    <i class="fas fa-folder-open mb-2"></i>
                    <p>Tidak ada data yang sesuai filter</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="page-footer-info">
        <div class="copyright">&copy; Monitoring Migrasi RM v2.0</div>
        <div class="legend">
          <div class="legend-item"><span class="dot erm"></span> ERM</div>
          <div class="legend-item"><span class="dot progress"></span> On Progress</div>
          <div class="legend-item"><span class="dot manual"></span> Manual</div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content card shadow-lg">
        <div class="modal-header">
          <h3>{{ isEdit ? 'Edit Berkas RM' : 'Tambah Berkas RM' }}</h3>
          <button @click="showModal = false" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="saveData" class="modal-form-wrapper">
          <div class="modal-body">
            <div class="modal-form-grid">
              
              <!-- Left Column: Primary Details -->
              <div class="modal-form-column">
                <div class="form-group">
                  <label>Kode RM</label>
                  <input v-model="formData.kode" type="text" placeholder="Contoh: RM001" required>
                </div>
                <div class="form-group">
                  <label>Nama Berkas</label>
                  <input v-model="formData.nama" type="text" placeholder="Contoh: Ringkasan Pulang" required>
                </div>
                <div class="form-group">
                  <label>Status Migrasi</label>
                  <div class="status-selection">
                    <label v-for="s in ['ERM', 'On Progress', 'Manual']" :key="s" class="radio-label">
                      <input type="radio" v-model="formData.status" :value="s"> 
                      <span>{{ s }}</span>
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <label>Tabel Database (Opsional)</label>
                  <input v-model="formData.tabel" type="text" placeholder="Nama tabel di Khanza">
                </div>
                <div class="form-group" v-if="formData.status !== 'ERM'">
                  <label>Skala Prioritas</label>
                  <select v-model="formData.prioritas" class="select-input-full">
                    <option value="Kritis">Kritis (Segera)</option>
                    <option value="Tinggi">Tinggi (1 Minggu)</option>
                    <option value="Sedang">Sedang (1 Bulan)</option>
                    <option value="Rendah">Rendah (Backlog)</option>
                  </select>
                </div>
                <div class="form-group" v-if="formData.status !== 'ERM'">
                  <label>Deadline Pengerjaan (Opsional)</label>
                  <input v-model="formData.deadline" type="date" class="date-input">
                </div>
                <div class="form-group" v-if="formData.status !== 'ERM'">
                  <label>Ditugaskan Ke (Programmer IT)</label>
                  <select v-model="formData.assigned_to_nik" class="select-input-full">
                    <option value="">-- Belum Ditugaskan --</option>
                    <option v-for="p in pegawaiList" :key="p.nik" :value="p.nik">{{ p.nama }}</option>
                  </select>
                </div>
              </div>

              <!-- Right Column: Departemen & File Upload -->
              <div class="modal-form-column">
                <div class="form-group">
                  <label>Departemen (Bisa pilih lebih dari satu)</label>
                  <div class="dept-search-wrapper mb-2">
                    <i class="fas fa-search search-icon-mini"></i>
                    <input 
                      v-model="deptSearch" 
                      type="text" 
                      placeholder="Cari departemen..." 
                      class="search-input-mini"
                    >
                  </div>
                  <div class="dept-selection-container" style="height: 150px;">
                    <div v-for="dept in filteredDepts" :key="dept.dep_id" class="dept-checkbox">
                      <label>
                        <input type="checkbox" v-model="formData.dep_ids" :value="dept.dep_id">
                        <span>{{ dept.nama }}</span>
                      </label>
                    </div>
                    <div v-if="filteredDepts.length === 0" class="empty-mini">
                      Tidak ada departemen ditemukan
                    </div>
                  </div>
                </div>

                <div class="form-group" v-if="formData.status === 'Manual' || formData.status === 'On Progress'">
                  <label>Lampirkan Berkas Fisik (Opsional)</label>
                  <label class="custom-file-upload">
                    <input type="file" id="modal-file-input" @change="handleModalFileChange" accept=".pdf,image/*">
                    <span class="file-upload-btn-design" style="padding: 0.55rem 0.75rem; font-size: 0.775rem;">
                      <i class="fas fa-paperclip"></i> {{ modalFile ? modalFile.name : 'Pilih Berkas (PDF/Gambar, Max 10MB)' }}
                    </span>
                  </label>
                  <input v-if="modalFile" type="text" v-model="modalFileDesc" placeholder="Keterangan berkas yang dilampirkan..." class="mt-2" style="font-size: 0.775rem; padding: 0.55rem 0.75rem;">
                </div>
              </div>

            </div>

            <!-- Full Width Bottom Section: Catatan -->
            <div class="form-group mt-3">
              <label>Catatan / Kendala</label>
              <textarea v-model="formData.catatan" rows="2" placeholder="Contoh: Masih proses mapping, berkas belum ditemukan, dll" style="font-size: 0.8125rem; padding: 0.55rem 0.75rem;"></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="formLoading">
              <span v-if="formLoading" class="spinner-small"></span>
              {{ isEdit ? 'Simpan Perubahan' : 'Tambah Berkas' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Drawer Panel -->
    <div class="drawer-overlay" :class="{ active: showDrawer }" @click.self="showDrawer = false">
      <div class="drawer-panel" :class="{ active: showDrawer }">
        <div class="drawer-header">
          <div class="drawer-title-wrapper">
            <span class="drawer-tag">Detail Berkas</span>
            <h3>[{{ selectedItem?.kode }}] {{ selectedItem?.nama }}</h3>
          </div>
          <button @click="showDrawer = false" class="btn-close-drawer">&times;</button>
        </div>

        <div class="drawer-tabs">
          <button 
            @click="drawerTab = 'detail'" 
            :class="['drawer-tab-btn', { active: drawerTab === 'detail' }]"
          >
            📋 Detail
          </button>
          <button 
            @click="drawerTab = 'berkas'" 
            :class="['drawer-tab-btn', { active: drawerTab === 'berkas' }]"
          >
            📎 Berkas ({{ selectedItem?.files ? selectedItem.files.length : 0 }})
          </button>
          <button 
            @click="drawerTab = 'logs'" 
            :class="['drawer-tab-btn', { active: drawerTab === 'logs' }]"
          >
            🕐 Audit Trail
          </button>
        </div>

        <div class="drawer-body">
          <!-- Tab 1: Detail Form / Info -->
          <div v-if="drawerTab === 'detail'" class="tab-pane-detail">
            <form @submit.prevent="updateDrawerItem" class="drawer-form">
              <div class="form-grid">
                <div class="form-group">
                  <label>Kode RM</label>
                  <input type="text" :value="selectedItem?.kode" disabled class="disabled-input">
                </div>
                <div class="form-group">
                  <label>Nama Berkas</label>
                  <input type="text" v-model="selectedItemEdit.nama" required>
                </div>
                <div class="form-group">
                  <label>Tabel Database</label>
                  <input type="text" v-model="selectedItemEdit.tabel">
                </div>
                <div class="form-group">
                  <label>Status Migrasi</label>
                  <select v-model="selectedItemEdit.status" class="select-input-full">
                    <option value="ERM">ERM</option>
                    <option value="On Progress">On Progress</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div class="form-group" v-if="selectedItemEdit.status !== 'ERM'">
                  <label>Skala Prioritas</label>
                  <select v-model="selectedItemEdit.prioritas" class="select-input-full">
                    <option value="Kritis">Kritis</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
                  </select>
                </div>
                <div class="form-group" v-if="selectedItemEdit.status !== 'ERM'">
                  <label>Deadline Pengerjaan</label>
                  <input type="date" v-model="selectedItemEdit.deadline" class="date-input">
                </div>
                <div class="form-group full-width" v-if="selectedItemEdit.status !== 'ERM'">
                  <label>Ditugaskan Ke (Programmer IT)</label>
                  <select v-model="selectedItemEdit.assigned_to_nik" class="select-input-full">
                    <option value="">-- Belum Ditugaskan --</option>
                    <option v-for="p in pegawaiList" :key="p.nik" :value="p.nik">{{ p.nama }}</option>
                  </select>
                </div>
                <div class="form-group full-width">
                  <label>Catatan / Kendala</label>
                  <textarea v-model="selectedItemEdit.catatan" rows="3"></textarea>
                </div>
                
                <div class="meta-info-section full-width">
                  <div class="meta-row">
                    <span class="meta-label">Dibuat Oleh:</span>
                    <span class="meta-val">{{ selectedItem?.dibuat_oleh?.nama || 'System' }}</span>
                  </div>
                  <div class="meta-row" v-if="selectedItem?.prioritas_oleh">
                    <span class="meta-label">Prioritas Oleh:</span>
                    <span class="meta-val">{{ selectedItem?.prioritas_oleh?.nama }}</span>
                  </div>
                </div>
              </div>
              <button type="submit" class="btn-primary mt-4" :disabled="formLoading">
                <span v-if="formLoading" class="spinner-small"></span>
                Simpan Perubahan
              </button>
            </form>
          </div>

          <!-- Tab 2: Berkas Fisik -->
          <div v-if="drawerTab === 'berkas'" class="tab-pane-berkas">
            <!-- File List -->
            <div class="file-list-container">
              <h4 class="section-subtitle">Daftar Berkas Terlampir</h4>
              <div v-if="selectedItem?.files && selectedItem.files.length > 0" class="file-cards-grid">
                <div v-for="file in selectedItem.files" :key="file.id" class="file-card">
                  <div class="file-icon">
                    <i class="far" :class="getFileIconClass(file.tipe_file)"></i>
                  </div>
                  <div class="file-meta">
                    <span class="file-name" :title="file.nama_file">{{ file.nama_file }}</span>
                    <span class="file-size-info">{{ formatBytes(file.ukuran) }} • {{ file.tipe_file.toUpperCase() }}</span>
                    <span class="file-desc" v-if="file.keterangan && file.keterangan !== '-'">"{{ file.keterangan }}"</span>
                    <span class="file-uploader-tag">Oleh: {{ file.uploader?.nama || 'Staf' }} • {{ formatDateDetailed(file.created_at) }}</span>
                  </div>
                  <div class="file-card-actions">
                    <button @click="openPreview(file)" class="btn-file-action preview" title="Preview Berkas">
                      <i class="fas fa-eye"></i>
                    </button>
                    <a :href="getFileUrl(file.path_file)" target="_blank" class="btn-file-action download" title="Unduh Berkas">
                      <i class="fas fa-download"></i>
                    </a>
                    <button @click="deleteFile(file)" class="btn-file-action delete" title="Hapus Berkas">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state-mini">
                <i class="fas fa-paperclip empty-icon"></i>
                <p>Belum ada berkas fisik terlampir.</p>
              </div>
            </div>

            <!-- Upload New File Area -->
            <div class="upload-area-card" v-if="selectedItem?.status === 'Manual' || selectedItem?.status === 'On Progress'">
              <h4 class="section-subtitle">📎 Unggah Berkas Baru</h4>
              <form @submit.prevent="uploadFile" class="upload-form">
                <div class="form-group">
                  <label class="custom-file-upload">
                    <input type="file" id="file-input-upload" @change="handleFileChange" accept=".pdf,image/*" required>
                    <span class="file-upload-btn-design">
                      <i class="fas fa-cloud-upload-alt"></i> {{ newFile ? newFile.name : 'Pilih Berkas (PDF/Gambar, Max 10MB)' }}
                    </span>
                  </label>
                </div>
                <div class="form-group">
                  <label>Keterangan Berkas</label>
                  <input type="text" v-model="newFileDesc" placeholder="Contoh: Berkas Hasil Scan RM Manual, dll">
                </div>
                <button type="submit" class="btn-primary" :disabled="uploadingFile">
                  <span v-if="uploadingFile" class="spinner-small"></span>
                  Unggah Berkas
                </button>
              </form>
            </div>
            <div class="upload-disabled-alert" v-else>
              <i class="fas fa-info-circle"></i> Berkas fisik hanya bisa diunggah untuk status Manual atau On Progress.
            </div>
          </div>

          <!-- Tab 3: Audit Trail -->
          <div v-if="drawerTab === 'logs'" class="tab-pane-logs">
            <div v-if="loadingLogs" class="loading-mini">
              <div class="spinner"></div>
              <span>Memuat history log...</span>
            </div>
            <div v-else-if="logsList.length > 0" class="timeline">
              <div v-for="log in logsList" :key="log.id" class="timeline-item">
                <div class="timeline-badge" :class="log.aksi">
                  <i class="fas" :class="getLogIcon(log.aksi)"></i>
                </div>
                <div class="timeline-card">
                  <div class="timeline-header">
                    <span class="timeline-action-label">{{ formatLogAction(log.aksi) }}</span>
                    <span class="timeline-time">{{ formatDateDetailed(log.created_at) }}</span>
                  </div>
                  <p class="timeline-desc">{{ log.keterangan }}</p>
                  <div class="timeline-footer">
                    <i class="fas fa-user-circle"></i> {{ log.petugas?.nama || 'System' }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state-mini">
              <i class="fas fa-history empty-icon"></i>
              <p>Belum ada riwayat aktivitas log.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Preview Berkas -->
  <div v-if="previewOpen" class="modal-overlay" @click.self="closePreview">
    <div class="modal-content preview-modal card shadow-lg">
      <div class="modal-header">
        <h3 class="preview-title">Preview Berkas: {{ previewFileState.nama_file }}</h3>
        <button @click="closePreview" class="btn-close">&times;</button>
      </div>
      <div class="modal-body preview-body">
        <div v-if="previewFileState.isImage" class="preview-image-container">
          <img :src="previewFileState.url" alt="Preview Gambar" class="preview-img-element" />
        </div>
        <div v-else-if="previewFileState.isPdf" class="preview-pdf-container">
          <iframe :src="previewFileState.url" class="preview-iframe-element" frameborder="0"></iframe>
        </div>
        <div v-else class="preview-unsupported">
          <div class="unsupported-content">
            <i class="fas fa-file-alt unsupported-icon"></i>
            <p>Tipe file ini ({{ previewFileState.tipe_file?.toUpperCase() }}) tidak mendukung preview langsung.</p>
            <a :href="previewFileState.url" target="_blank" class="btn-preview-fallback">
              <i class="fas fa-external-link-alt"></i> Buka di Tab Baru / Unduh
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { monitoringRMService } from '../../services/monitoringRMService'
import apiConfig from '../../config/api'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

// State
const rawData = ref([])
const departemenList = ref([])
const pegawaiList = ref([])
const loading = ref(false)
const formLoading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const deptSearch = ref('')

// Detail Drawer Panel State
const showDrawer = ref(false)

// Preview File State
const previewOpen = ref(false)
const previewFileState = reactive({
  nama_file: '',
  tipe_file: '',
  url: '',
  isImage: false,
  isPdf: false
})
const selectedItem = ref(null)
const drawerTab = ref('detail')
const logsList = ref([])
const loadingLogs = ref(false)
const uploadingFile = ref(false)
const newFile = ref(null)
const newFileDesc = ref('')
const modalFile = ref(null)
const modalFileDesc = ref('')
const selectedItemEdit = reactive({
  nama: '',
  status: '',
  prioritas: 'Sedang',
  deadline: '',
  assigned_to_nik: '',
  catatan: '',
  tabel: ''
})

const statsData = ref({
  total: 0,
  erm: 0,
  on_progress: 0,
  manual: 0,
  unit_map: {}
})

const formData = reactive({
  id: null,
  kode: '',
  nama: '',
  dep_ids: [],
  status: 'Manual',
  catatan: '',
  tabel: '',
  prioritas: 'Sedang',
  deadline: '',
  assigned_to_nik: ''
})

const filters = reactive({
  search: '',
  unit: 'Semua Unit',
  status: 'Semua',
  prioritas: 'Semua',
  assigned_to_nik: 'Semua'
})

const sort = reactive({
  column: 'id',
  direction: 'desc'
})

// Computed values
const stats = computed(() => statsData.value)

const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.erm / stats.value.total) * 100)
})

const statCards = computed(() => [
  { label: 'Total Berkas', value: stats.value.total, color: '#3b82f6', icon: '▣' },
  { label: 'ERM', value: stats.value.erm, color: '#10b981', icon: '✦' },
  { label: 'On Progress', value: stats.value.on_progress, color: '#f59e0b', icon: '◎' },
  { label: 'Manual', value: stats.value.manual, color: '#ef4444', icon: '✕' },
])

const radialStats = computed(() => [
  { label: 'ERM', value: stats.value.erm, color: '#10b981' },
  { label: 'Progress', value: stats.value.on_progress, color: '#f59e0b' },
  { label: 'Manual', value: stats.value.manual, color: '#ef4444' },
])

const statusOptions = ['Semua', 'ERM', 'On Progress', 'Manual']
const departemenOptions = computed(() => departemenList.value)

const filteredDepts = computed(() => {
  if (!deptSearch.value) return departemenList.value
  const q = deptSearch.value.toLowerCase()
  return departemenList.value.filter(d => d.nama.toLowerCase().includes(q))
})

const filteredData = computed(() => {
  let result = [...rawData.value]
  
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(d => 
      d.kode.toLowerCase().includes(q) || 
      d.nama.toLowerCase().includes(q) || 
      (d.tabel && d.tabel.toLowerCase().includes(q)) ||
      (d.catatan && d.catatan.toLowerCase().includes(q)) ||
      d.departemen?.some(dept => dept.nama.toLowerCase().includes(q)) ||
      (d.assigned_to && d.assigned_to.nama && d.assigned_to.nama.toLowerCase().includes(q))
    )
  }

  if (filters.unit !== 'Semua Unit') {
    result = result.filter(d => d.departemen?.some(dept => dept.dep_id === filters.unit))
  }
  
  if (filters.status !== 'Semua') {
    result = result.filter(d => d.status === filters.status)
  }

  if (filters.prioritas !== 'Semua') {
    result = result.filter(d => (d.prioritas || 'Sedang') === filters.prioritas)
  }

  if (filters.assigned_to_nik !== 'Semua') {
    result = result.filter(d => d.assigned_to_nik === filters.assigned_to_nik)
  }
  
  return result.sort((a, b) => {
    let va = a[sort.column], vb = b[sort.column]
    if (va < vb) return sort.direction === 'asc' ? -1 : 1
    if (va > vb) return sort.direction === 'asc' ? 1 : -1
    return 0
  })
})

const handleSort = (col) => {
  if (sort.column === col) {
    sort.direction = sort.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sort.column = col
    sort.direction = 'asc'
  }
}

const getSortIcon = (col) => {
  if (sort.column !== col) return 'fas fa-sort text-muted op-3'
  return sort.direction === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary'
}

const getRadialStyle = (val, total, color) => {
  if (total === 0) return { background: '#f1f5f9' }
  const pct = (val / total) * 360
  return {
    background: `conic-gradient(${color} ${pct}deg, #f1f5f9 0deg)`
  }
}

const formatDate = (date) => date ? dayjs(date).format('DD MMM YYYY') : '—'

const fetchData = async () => {
  loading.value = true
  try {
    const [resData, resStats] = await Promise.all([
      monitoringRMService.getData(),
      monitoringRMService.getStats()
    ])
    
    if (resData.data.success) {
      rawData.value = resData.data.data
    }
    
    if (resStats.data.success) {
      statsData.value = resStats.data.data
    }
  } catch (err) {
    console.error('Failed to fetch monitoring RM data', err)
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Gagal mengambil data monitoring RM!'
    })
  } finally {
    loading.value = false
  }
}

const fetchDepartemen = async () => {
  try {
    const res = await monitoringRMService.getDepartemen()
    if (res.data.success) {
      departemenList.value = res.data.data
    }
  } catch (err) {
    console.error('Err Dept:', err)
  }
}

const handleModalFileChange = (event) => {
  modalFile.value = event.target.files[0]
}

const openModal = (item = null) => {
  deptSearch.value = ''
  modalFile.value = null
  modalFileDesc.value = ''
  const modalFileInput = document.getElementById('modal-file-input')
  if (modalFileInput) modalFileInput.value = ''
  
  if (item) {
    isEdit.value = true
    formData.id = item.id
    formData.kode = item.kode
    formData.nama = item.nama
    formData.dep_ids = item.departemen?.map(d => d.dep_id) || []
    formData.status = item.status
    formData.catatan = item.catatan === '-' ? '' : item.catatan
    formData.tabel = item.tabel === '-' ? '' : item.tabel
    formData.prioritas = item.prioritas || 'Sedang'
    formData.deadline = item.deadline || ''
    formData.assigned_to_nik = item.assigned_to_nik || ''
  } else {
    isEdit.value = false
    formData.id = null
    formData.kode = ''
    formData.nama = ''
    formData.dep_ids = []
    formData.status = 'Manual'
    formData.catatan = ''
    formData.tabel = ''
    formData.prioritas = 'Sedang'
    formData.deadline = ''
    formData.assigned_to_nik = ''
  }
  showModal.value = true
}

const saveData = async () => {
  formLoading.value = true
  try {
    const payload = { ...formData }
    if (payload.status === 'ERM') {
      payload.prioritas = null
      payload.deadline = null
      payload.assigned_to_nik = null
    }
    if (payload.tabel === '') payload.tabel = '-'
    
    let res
    if (isEdit.value) {
      res = await monitoringRMService.update(payload.id, payload)
    } else {
      res = await monitoringRMService.create(payload)
    }

    if (res.data.success) {
      const rmId = isEdit.value ? payload.id : res.data.data.id
      
      // Upload file if selected in modal
      if (modalFile.value && (payload.status === 'Manual' || payload.status === 'On Progress')) {
        const formDataObj = new FormData()
        formDataObj.append('file', modalFile.value)
        formDataObj.append('keterangan', modalFileDesc.value || '-')
        await monitoringRMService.uploadFile(rmId, formDataObj)
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: res.data.message,
        timer: 1500,
        showConfirmButton: false
      })
      
      modalFile.value = null
      modalFileDesc.value = ''
      const modalFileInput = document.getElementById('modal-file-input')
      if (modalFileInput) modalFileInput.value = ''
      
      showModal.value = false
      fetchData()
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: err.response?.data?.message || 'Terjadi kesalahan sistem'
    })
  } finally {
    formLoading.value = false
  }
}

const confirmDelete = (item) => {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: `Hapus berkas RM "${item.nama}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await monitoringRMService.delete(item.id)
        if (res.data.success) {
          Swal.fire('Terhapus!', res.data.message, 'success')
          fetchData()
        }
      } catch (err) {
        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error')
      }
    }
  })
}

// Drawer and Detail Panel Actions
const openDrawer = (item) => {
  selectedItem.value = item
  selectedItemEdit.nama = item.nama
  selectedItemEdit.status = item.status
  selectedItemEdit.prioritas = item.prioritas || 'Sedang'
  selectedItemEdit.deadline = item.deadline || ''
  selectedItemEdit.assigned_to_nik = item.assigned_to_nik || ''
  selectedItemEdit.catatan = item.catatan === '-' ? '' : item.catatan
  selectedItemEdit.tabel = item.tabel === '-' ? '' : item.tabel

  drawerTab.value = 'detail'
  showDrawer.value = true
  fetchLogs(item.id)
}

const fetchLogs = async (id) => {
  loadingLogs.value = true
  try {
    const res = await monitoringRMService.getLogs(id)
    if (res.data.success) {
      logsList.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal mengambil history logs:', err)
  } finally {
    loadingLogs.value = false
  }
}

const updateDrawerItem = async () => {
  formLoading.value = true
  try {
    const payload = {
      nama: selectedItemEdit.nama,
      status: selectedItemEdit.status,
      prioritas: selectedItemEdit.status === 'ERM' ? null : selectedItemEdit.prioritas,
      deadline: selectedItemEdit.status === 'ERM' ? null : (selectedItemEdit.deadline || null),
      assigned_to_nik: selectedItemEdit.status === 'ERM' ? null : (selectedItemEdit.assigned_to_nik || null),
      catatan: selectedItemEdit.catatan === '' ? '-' : selectedItemEdit.catatan,
      tabel: selectedItemEdit.tabel === '' ? '-' : selectedItemEdit.tabel
    }
    const res = await monitoringRMService.update(selectedItem.value.id, payload)
    if (res.data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil diperbarui',
        text: 'Detail berkas RM berhasil diperbarui',
        timer: 1500,
        showConfirmButton: false
      })
      await fetchData()
      // Refresh selectedItem from rawData
      const updated = rawData.value.find(x => x.id === selectedItem.value.id)
      if (updated) selectedItem.value = updated
      fetchLogs(selectedItem.value.id)
    }
  } catch (err) {
    Swal.fire('Gagal', err.response?.data?.message || 'Gagal memperbarui data', 'error')
  } finally {
    formLoading.value = false
  }
}

// File Handlers
const handleFileChange = (event) => {
  newFile.value = event.target.files[0]
}

const uploadFile = async () => {
  if (!newFile.value) {
    Swal.fire('Peringatan', 'Silakan pilih file terlebih dahulu', 'warning')
    return
  }
  
  uploadingFile.value = true
  const formDataObj = new FormData()
  formDataObj.append('file', newFile.value)
  formDataObj.append('keterangan', newFileDesc.value || '-')

  try {
    const res = await monitoringRMService.uploadFile(selectedItem.value.id, formDataObj)
    if (res.data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Berkas fisik berhasil diunggah',
        timer: 1500,
        showConfirmButton: false
      })
      newFile.value = null
      newFileDesc.value = ''
      const fileInput = document.getElementById('file-input-upload')
      if (fileInput) fileInput.value = ''
      
      await fetchData()
      const updated = rawData.value.find(x => x.id === selectedItem.value.id)
      if (updated) selectedItem.value = updated
      fetchLogs(selectedItem.value.id)
    }
  } catch (err) {
    Swal.fire('Gagal', err.response?.data?.message || 'Gagal mengunggah file', 'error')
  } finally {
    uploadingFile.value = false
  }
}

const deleteFile = (file) => {
  Swal.fire({
    title: 'Hapus berkas?',
    text: `Apakah Anda yakin ingin menghapus berkas "${file.nama_file}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await monitoringRMService.deleteFile(selectedItem.value.id, file.id)
        if (res.data.success) {
          Swal.fire('Terhapus!', 'Berkas fisik berhasil dihapus', 'success')
          await fetchData()
          const updated = rawData.value.find(x => x.id === selectedItem.value.id)
          if (updated) selectedItem.value = updated
          fetchLogs(selectedItem.value.id)
        }
      } catch (err) {
        Swal.fire('Gagal!', 'Gagal menghapus berkas.', 'error')
      }
    }
  })
}

const openPreview = (file) => {
  const fileUrl = getFileUrl(file.path_file)
  const ext = file.tipe_file ? file.tipe_file.toLowerCase() : ''
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext)
  const isPdf = ext === 'pdf'

  previewFileState.nama_file = file.nama_file
  previewFileState.tipe_file = file.tipe_file
  previewFileState.url = fileUrl
  previewFileState.isImage = isImage
  previewFileState.isPdf = isPdf

  previewOpen.value = true
}

const closePreview = () => {
  previewOpen.value = false
  previewFileState.nama_file = ''
  previewFileState.tipe_file = ''
  previewFileState.url = ''
  previewFileState.isImage = false
  previewFileState.isPdf = false
}

// Utility Methods
const getFileUrl = (path_file) => {
  const baseUrl = apiConfig.public.API_V2_URL || ''
  const domain = baseUrl.replace(/\/api\/v2\/?$/, '').replace(/\/api\/?$/, '')
  return `${domain}/${path_file}`
}

const getFileIconClass = (ext) => {
  if (!ext) return 'fa-file'
  if (['pdf'].includes(ext.toLowerCase())) return 'fa-file-pdf text-danger'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext.toLowerCase())) return 'fa-file-image text-success'
  return 'fa-file-alt text-muted'
}

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const formatDateDetailed = (date) => {
  return date ? dayjs(date).format('DD MMM YYYY HH:mm') + ' WIB' : '—'
}

const getLogIcon = (action) => {
  switch (action) {
    case 'created': return 'fa-plus'
    case 'status_changed': return 'fa-exchange-alt'
    case 'prioritas_changed': return 'fa-exclamation-triangle'
    case 'assigned': return 'fa-user-tag'
    case 'file_uploaded': return 'fa-paperclip'
    case 'file_deleted': return 'fa-trash-alt'
    case 'catatan_updated': return 'fa-sticky-note'
    case 'selesai': return 'fa-check-circle'
    default: return 'fa-info-circle'
  }
}

const formatLogAction = (action) => {
  switch (action) {
    case 'created': return 'Registrasi'
    case 'status_changed': return 'Ubah Status'
    case 'prioritas_changed': return 'Skala Prioritas'
    case 'assigned': return 'Delegasi IT'
    case 'file_uploaded': return 'Unggah Berkas'
    case 'file_deleted': return 'Hapus Berkas'
    case 'catatan_updated': return 'Catatan'
    case 'selesai': return 'Migrasi Selesai'
    default: return 'Aktivitas'
  }
}

const fetchPegawai = async () => {
  try {
    const res = await monitoringRMService.getPegawai()
    if (res.data.success) {
      pegawaiList.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal mengambil list pegawai:', err)
  }
}

onMounted(() => {
  fetchData()
  fetchDepartemen()
  fetchPegawai()
})
</script>

<style scoped>
.monitoring-rm-page {
  background-color: #f8fafc;
  min-height: calc(100vh - 64px);
  color: #1e293b;
  font-family: 'Inter', sans-serif;
  padding: 0.5rem;
}

.main-wrapper {
  max-width: 100%;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #eff6ff 100%);
  padding: 1rem 1.75rem;
  color: #0f172a;
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid #bae6fd;
  box-shadow: 0 4px 15px -2px rgba(14, 165, 233, 0.06);
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 20px 20px;
  background-image: linear-gradient(to right, rgba(14, 165, 233, 0.04) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(14, 165, 233, 0.04) 1px, transparent 1px);
  pointer-events: none;
}

.header-glow-1 {
  position: absolute;
  top: -100px;
  right: -50px;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}

.header-glow-2 {
  position: absolute;
  bottom: -120px;
  left: 5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
  filter: blur(50px);
  pointer-events: none;
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
  gap: 1.5rem;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 0.85rem;
  background: #ffffff;
  border: 1px solid rgba(14, 165, 233, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.08);
  backdrop-filter: blur(8px);
  transition: transform 0.3s ease;
}

.brand-icon-wrapper:hover {
  transform: translateY(-2px) rotate(5deg);
}

.icon-brand {
  font-size: 1.35rem;
  background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.15rem;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  animation: pulse 2s infinite;
}

.system-label {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  font-weight: 800;
  color: #0284c7;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
  color: #0f172a;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 0.8rem;
  color: #475569;
  margin: 0.2rem 0 0 0;
  font-weight: 500;
}

.completion-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(14, 165, 233, 0.2);
  padding: 0.75rem 1.25rem;
  border-radius: 0.85rem;
  min-width: 220px;
  position: relative;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.03);
  overflow: hidden;
}

.completion-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%);
  pointer-events: none;
}

.completion-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.completion-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.completion-card .label {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  font-weight: 800;
  color: #64748b;
}

.completion-card .percentage {
  font-size: 1.4rem;
  font-weight: 900;
  line-height: 1;
  color: #059669;
  font-family: 'JetBrains Mono', monospace;
}

.completion-track {
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.completion-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.2);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.completion-meta {
  font-size: 0.675rem;
  color: #64748b;
  font-weight: 500;
  text-align: right;
}

.content-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem 0.25rem 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f1f5f9;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  position: absolute;
  right: -0.25rem;
  bottom: -0.25rem;
  font-size: 3.5rem;
  font-weight: 900;
  opacity: 0.3;
  transform: rotate(-10deg);
}

.stat-info {
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.075em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-container {
  background: white;
  padding: 1.75rem;
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.chart-title {
  font-size: 0.75rem;
  font-weight: 800;
  color: #475569;
  margin-bottom: 1.75rem;
  letter-spacing: 0.075em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 12px;
  background: #3b82f6;
  border-radius: 2px;
}

.radial-group {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.radial-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.radial-progress {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.radial-inner {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radial-value {
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
}

.radial-label {
  font-size: 0.625rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bar-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;
}

.bar-item {
  margin-bottom: 0.5rem;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.unit-name {
  color: #475569;
}

.bar-track {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.filter-bar {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 1.25rem;
  display: flex;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.search-wrapper {
  flex: 2;
  position: relative;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  flex: 3;
  justify-content: flex-end;
}

.select-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background-color: #f8fafc;
  min-width: 180px;
  cursor: pointer;
  color: #475569;
  font-weight: 600;
  transition: all 0.2s;
}

.select-input:hover {
  border-color: #cbd5e1;
  background-color: white;
}

.select-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
}

.status-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 0.35rem;
  border-radius: 0.875rem;
  gap: 0.25rem;
}

.tab-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  background: transparent;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
  white-space: nowrap;
}

.tab-btn.active {
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  color: #1e293b;
}

.tab-btn.active.erm { color: #10b981; }
.tab-btn.active.on-progress { color: #f59e0b; }
.tab-btn.active.manual { color: #ef4444; }

.result-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.55rem 0.85rem;
  border-radius: 0.625rem;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
}

.table-card {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.table-container {
  overflow: auto;
  max-height: 60vh;
  position: relative;
  border-radius: inherit;
}

.monitoring-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th {
  background: #f8fafc;
  padding: 1.25rem 1.75rem;
  text-align: left;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.7rem;
  border-bottom: 2px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 10;
}

th.sortable {
  cursor: pointer;
  user-select: none;
}

th.sortable:hover {
  background: #f1f5f9;
  color: #1e293b;
}

td {
  padding: 1.15rem 1.75rem;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
}

tr:hover td {
  background-color: #f8fafc;
}

.cell-kode {
  font-weight: 700;
  color: #3b82f6;
  font-family: 'JetBrains Mono', monospace;
}

.cell-nama {
  font-weight: 500;
  color: #334155;
}

.badge-unit {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.7rem;
  font-weight: 700;
}

.badge-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.7rem;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-status.erm { background: #dcfce7; color: #15803d; }
.badge-status.erm .status-dot { background: #15803d; }

.badge-status.on-progress { background: #fef3c7; color: #b45309; }
.badge-status.on-progress .status-dot { background: #b45309; }

.badge-status.manual { background: #fee2e2; color: #b91c1c; }
.badge-status.manual .status-dot { background: #b91c1c; }

.tabel-code {
  background: #f1f5f9;
  color: #6366f1;
  padding: 0.2rem 0.4rem;
  border-radius: 0.375rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}

.cell-updated {
  color: #94a3b8;
  font-family: 'JetBrains Mono', monospace;
}

.empty-state {
  text-align: center;
  padding: 4rem !important;
  color: #94a3b8;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-content i {
  font-size: 2.5rem;
  opacity: 0.5;
}

.page-footer-info {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 500;
}

.legend {
  display: flex;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.erm { background: #10b981; }
.dot.progress { background: #f59e0b; }
.dot.manual { background: #ef4444; }

.btn-add {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 0.625rem;
  font-size: 0.775rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.15);
  white-space: nowrap;
}

.btn-add:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 12px -2px rgba(59, 130, 246, 0.25);
}

.cell-actions {
  width: 100px;
}

.action-btns {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-icon.delete:hover {
  color: #ef4444;
  border-color: #ef4444;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 95%;
  max-width: 850px;
  max-height: 90vh;
  background: white;
  border-radius: 1.5rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
  line-height: 1;
  padding: 0;
}

.btn-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 1rem 1.5rem 0.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-form-column {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .modal-form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.modal-form-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.form-group {
  margin-bottom: 0.85rem;
}

.form-group label {
  display: block;
  font-size: 0.775rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.25rem;
}

.form-group input, 
.form-group select {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  background: #f8fafc;
  transition: all 0.2s;
}

.form-group input:focus, 
.form-group select:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.status-selection {
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.35rem;
  border-radius: 0.625rem;
}

.radio-label {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 0.35rem;
  cursor: pointer;
  border-radius: 0.45rem;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.2s;
  text-align: center;
  line-height: 1.2;
}

.radio-label input {
  display: none;
}

.radio-label:has(input:checked) {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  color: #3b82f6;
}

.modal-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
  background: white;
  z-index: 10;
}

.btn-primary, 
.btn-secondary {
  flex: 1;
  padding: 0.55rem 1rem;
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.spinner-small {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

.dept-selection-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dept-checkbox label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s;
}

.dept-checkbox label:hover {
  background: #f1f5f9;
}

.dept-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.dept-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.badge-unit.empty {
  background: #f1f5f9;
  color: #94a3b8;
}

.dept-search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon-mini {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  font-size: 0.75rem;
}

.search-input-mini {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.25rem !important;
  font-size: 0.75rem !important;
  border-radius: 0.5rem !important;
  border: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
}

.search-input-mini:focus {
  background: white !important;
  border-color: #3b82f6 !important;
}

.cell-catatan {
  font-size: 0.75rem;
  color: #64748b;
  max-width: 200px;
  line-height: 1.4;
}

.catatan-wrapper {
  position: relative;
  cursor: pointer;
}

.catatan-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.catatan-tooltip {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: #f8fafc;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 320px;
  min-width: 180px;
  z-index: 50;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.catatan-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #1e293b;
}

.catatan-wrapper:hover .catatan-tooltip {
  display: block;
  animation: tooltipFadeIn 0.2s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.form-group textarea {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.625rem;
  font-size: 0.8125rem;
  background: #f8fafc;
  transition: all 0.2s;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.mb-2 {
  margin-bottom: 0.5rem;
}
@media (max-width: 768px) {
  .monitoring-rm-page {
    padding: 0.25rem;
  }

  .page-header {
    padding: 1.25rem 1rem;
    margin-bottom: 1.25rem;
    border-radius: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.75rem;
    max-width: 100%;
  }

  .completion-card {
    width: 100%;
    min-width: auto;
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .charts-row {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .chart-container {
    padding: 1.25rem;
  }

  .radial-group {
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .radial-progress {
    width: 70px;
    height: 70px;
  }

  .radial-inner {
    width: 54px;
    height: 54px;
  }

  .radial-value {
    font-size: 1.1rem;
  }

  .bar-grid {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    padding: 1.25rem;
    flex-direction: column;
    gap: 1.25rem;
    align-items: stretch;
    margin-bottom: 1.25rem;
  }

  .search-wrapper {
    min-width: auto;
    width: 100%;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 1rem;
  }

  .select-input {
    width: 100%;
    min-width: auto;
    font-size: 0.8rem;
  }

  .status-tabs {
    width: 100%;
    overflow-x: auto;
    padding: 0.25rem;
    justify-content: flex-start;
  }

  .tab-btn {
    flex: 1;
    padding: 0.5rem 0.75rem;
    font-size: 0.7rem;
    text-align: center;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
    order: -1; /* Keep "Tambah" button on top in mobile */
  }

  .result-count {
    justify-content: center;
  }

  .monitoring-table {
    font-size: 0.75rem;
  }

  th, td {
    padding: 0.75rem 1rem;
  }

  .cell-catatan {
    max-width: 150px;
  }

  .page-footer-info {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .legend {
    flex-wrap: wrap;
    gap: 1rem;
  }
}

/* Prioritas badge styling */
.badge-prioritas {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.2;
}
.badge-prioritas.kritis {
  background-color: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
}
.badge-prioritas.tinggi {
  background-color: #fff7ed;
  color: #f97316;
  border: 1px solid #ffedd5;
}
.badge-prioritas.sedang {
  background-color: #fefce8;
  color: #ca8a04;
  border: 1px solid #fef9c3;
}
.badge-prioritas.rendah {
  background-color: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* File counter clip badge */
.file-counter {
  font-size: 0.775rem;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
}
.file-counter.has-files {
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  font-weight: 600;
}
.file-counter.has-files:hover {
  background: #dbeafe;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.clickable-row:hover td:not(.cell-actions) {
  background-color: #f8fafc;
}

/* Drawer CSS */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  display: flex;
  justify-content: flex-end;
}
.drawer-overlay.active {
  opacity: 1;
  pointer-events: auto;
}
.drawer-panel {
  width: 100%;
  max-width: 500px;
  background: white;
  height: 100%;
  box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.1), -4px 0 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}
.drawer-overlay.active .drawer-panel.active {
  transform: translateX(0);
}
.drawer-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #f8fafc;
}
.drawer-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.drawer-tag {
  font-size: 0.65rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.drawer-header h3 {
  margin: 0.25rem 0 0 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}
.btn-close-drawer {
  background: transparent;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s;
  line-height: 1;
  margin-top: -0.25rem;
}
.btn-close-drawer:hover {
  color: #475569;
}

/* Tabs */
.drawer-tabs {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 1rem;
  background: #f8fafc;
}
.drawer-tab-btn {
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-weight: 600;
  font-size: 0.825rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.drawer-tab-btn:hover {
  color: #0f172a;
}
.drawer-tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

/* Drawer Body */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Drawer Form */
.drawer-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-grid .full-width {
  grid-column: span 2;
}
.disabled-input {
  background: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

/* Meta Section */
.meta-info-section {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid #e2e8f0;
}
.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}
.meta-row:last-child {
  margin-bottom: 0;
}
.meta-label {
  color: #64748b;
  font-weight: 500;
}
.meta-val {
  color: #0f172a;
  font-weight: 600;
}

/* Files list */
.file-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}
.file-card {
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
  background: white;
}
.file-card:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.file-icon {
  font-size: 1.5rem;
  color: #3b82f6;
  width: 24px;
  display: flex;
  justify-content: center;
}
.file-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}
.file-name {
  font-size: 0.825rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-size-info {
  font-size: 0.7rem;
  color: #64748b;
}
.file-desc {
  font-style: italic;
  font-size: 0.725rem;
  color: #475569;
}
.file-uploader-tag {
  font-size: 0.65rem;
  color: #94a3b8;
}
.file-card-actions {
  display: flex;
  gap: 0.35rem;
}
.btn-file-action {
  border: none;
  background: #f1f5f9;
  color: #475569;
  width: 28px;
  height: 28px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
}
.btn-file-action:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.btn-file-action.preview:hover {
  background: #f0fdf4;
  color: #10b981;
}
.btn-file-action.download:hover {
  background: #eff6ff;
  color: #2563eb;
}
.btn-file-action.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* Upload Area */
.upload-area-card {
  border: 2px dashed #cbd5e1;
  border-radius: 1rem;
  padding: 1.25rem;
  margin-top: 1.5rem;
  background: #f8fafc;
}
.custom-file-upload {
  display: block;
  cursor: pointer;
}
.custom-file-upload input[type="file"] {
  display: none;
}
.file-upload-btn-design {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.625rem;
  color: #475569;
  font-weight: 600;
  font-size: 0.775rem;
  transition: all 0.2s;
  text-align: center;
}
.file-upload-btn-design:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
.section-subtitle {
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Timeline Logs */
.timeline {
  position: relative;
  padding-left: 1.75rem;
  margin-top: 1rem;
}
.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 6px;
  width: 2px;
  background: #e2e8f0;
}
.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}
.timeline-item:last-child {
  margin-bottom: 0;
}
.timeline-badge {
  position: absolute;
  left: -1.75rem;
  top: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #cbd5e1;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: white;
  box-shadow: 0 0 0 2px #f1f5f9;
}

.timeline-badge.created { background: #3b82f6; }
.timeline-badge.status_changed { background: #eab308; }
.timeline-badge.prioritas_changed { background: #f97316; }
.timeline-badge.assigned { background: #a855f7; }
.timeline-badge.file_uploaded { background: #10b981; }
.timeline-badge.file_deleted { background: #ef4444; }
.timeline-badge.catatan_updated { background: #64748b; }
.timeline-badge.selesai { background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }

.timeline-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  margin-left: 0.5rem;
}
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}
.timeline-action-label {
  font-size: 0.725rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}
.timeline-time {
  font-size: 0.65rem;
  color: #94a3b8;
}
.timeline-desc {
  font-size: 0.8rem;
  color: #475569;
  margin: 0 0 0.5rem 0;
}
.timeline-footer {
  font-size: 0.675rem;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.empty-state-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.5rem;
  color: #94a3b8;
  text-align: center;
}
.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}
.upload-disabled-alert {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  font-size: 0.75rem;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.select-input-full {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background: #f8fafc;
  transition: all 0.2s;
  color: #1e293b;
}
.select-input-full:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
.date-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background: #f8fafc;
  color: #1e293b;
}
.date-input:focus {
  outline: none;
  background: white;
  border-color: #3b82f6;
}
.loading-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #64748b;
  font-size: 0.825rem;
  gap: 0.5rem;
}

/* Preview Modal Styles */
.preview-modal {
  max-width: 1000px !important;
  width: 95vw;
  height: 85vh;
}

.preview-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 40px);
}

.preview-body {
  padding: 0 !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
  overflow: hidden;
}

.preview-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow: auto;
}

.preview-img-element {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.preview-pdf-container {
  flex: 1;
  width: 100%;
  height: 100%;
}

.preview-iframe-element {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.preview-unsupported {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.unsupported-content {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.unsupported-icon {
  font-size: 3.5rem;
  color: #94a3b8;
}

.unsupported-content p {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.btn-preview-fallback {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #2563eb;
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-preview-fallback:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
}
</style>
