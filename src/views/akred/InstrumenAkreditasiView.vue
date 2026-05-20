<template>
  <div class="container-fluid py-4 page-bg">
    <!-- Floating Search FAB on Scroll -->
    <div v-if="showFloatingSearch" class="floating-search-container font-sans shadow-sm d-flex align-items-center">
      <transition name="slide-left">
        <div v-if="isSearchExpanded" class="floating-search-input-wrapper me-2">
          <input 
            type="text" 
            class="form-control search-input-floating shadow-sm" 
            v-model="searchQuery"
            placeholder="Cari EP, Standar, atau Bukti..."
            @input="debouncedSearch"
            ref="floatingSearchInputRef"
            @keyup.esc="isSearchExpanded = false"
          >
        </div>
      </transition>
      <button 
        class="btn-floating-search-toggle d-flex align-items-center justify-content-center" 
        :class="{ 'active': isSearchExpanded }"
        @click="toggleSearchExpand"
        title="Cari Instrumen"
      >
        <i :class="isSearchExpanded ? 'fas fa-times' : 'fas fa-search'"></i>
      </button>
    </div>

    <!-- Header -->
    <div class="row align-items-center mb-4 g-3">
      <div class="col-12 col-md-8">
        <h3 class="fw-bold text-primary mb-1">
          <i class="fas fa-book-medical me-2"></i>Instrumen Akreditasi RS (STARKES)
        </h3>
        <p class="text-muted mb-0">Penelusuran Bab, Pokja, Standar, dan Elemen Penilaian secara interaktif</p>
      </div>
      <div class="col-12 col-md-4 d-flex justify-content-end align-items-center">
        <!-- Search bar for global search -->
        <div class="position-relative w-100 search-wrapper">
          <input 
            type="text" 
            class="form-control shadow-sm search-input" 
            v-model="searchQuery"
            placeholder="Cari EP, Standar, atau Bukti..."
            @input="debouncedSearch"
          >
          <i class="fas fa-search position-absolute text-muted search-icon"></i>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row g-4">
      
      <!-- Left Column: Bab & Pokja Navigation -->
      <div class="col-12 col-lg-3">
        <div class="sticky-nav">
          <div class="card shadow-sm border-0 navigation-card">
          <div class="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
            <span class="fw-bold text-uppercase nav-header-title tracking-wider small">Daftar Pokja</span>
            <span class="badge bg-soft-primary text-primary px-2 py-1 rounded-pill small-badge">
              {{ totalPokja }} Pokja
            </span>
          </div>
          <div class="card-body p-0 custom-scrollbar" style="max-height: calc(100vh - 400px); overflow-y: auto;">
            <div v-if="loadingBab" class="text-center py-4 text-muted">
              <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
              <div>Memuat data navigasi...</div>
            </div>
            
            <div v-else class="accordion accordion-flush" id="babAccordion">
              <div 
                v-for="(bab, bIdx) in babList" 
                :key="bab.id" 
                class="accordion-item border-0 border-bottom"
              >
                <h2 class="accordion-header" :id="'heading' + bab.id">
                  <button 
                    class="accordion-button collapsed px-3 py-3 fw-bold text-dark small" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    :data-bs-target="'#collapse' + bab.id" 
                    aria-expanded="false" 
                    :aria-controls="'collapse' + bab.id"
                  >
                    <div class="d-flex flex-column align-items-start">
                      <span class="badge bg-slate-label mb-1 px-2 py-1 text-white extra-small">{{ bab.kode }}</span>
                      <span class="text-wrap font-sans text-muted-dark">{{ bab.nama }}</span>
                    </div>
                  </button>
                </h2>
                <div 
                  :id="'collapse' + bab.id" 
                  class="accordion-collapse collapse" 
                  :class="{ show: bIdx === 0 }"
                  :aria-labelledby="'heading' + bab.id" 
                  data-bs-parent="#babAccordion"
                >
                  <div class="accordion-body p-0">
                    <div class="list-group list-group-flush">
                      <button 
                        v-for="pokja in bab.pokjas" 
                        :key="pokja.id"
                        type="button"
                        class="list-group-item list-group-item-action d-flex align-items-center justify-content-between border-0 px-3 py-2.5 pokja-item"
                        :class="{ 'active-pokja': selectedPokja && selectedPokja.id === pokja.id }"
                        @click="selectPokja(pokja)"
                      >
                        <div class="d-flex flex-column align-items-start w-75">
                          <span class="fw-bold font-sans tracking-wide text-dark-blue small">{{ pokja.kode }}</span>
                          <span class="text-muted extra-small text-truncate w-100 text-start">{{ pokja.nama_lengkap }}</span>
                        </div>
                        <i class="fas fa-chevron-right text-muted icon-arrow"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div> <!-- Closes navigation-card -->

      <!-- Legend Tipe Bukti / Metode Evaluasi -->
      <div class="card shadow-sm border-0 mt-3 p-3 mb-4">
          <span class="fw-bold text-uppercase text-secondary tracking-wider extra-small d-block mb-2.5">Metode Evaluasi (STARKES)</span>
          <div class="d-flex flex-column gap-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-soft-danger text-danger font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">R</span>
              <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Regulasi <span class="text-muted extra-small d-inline-block">(Kebijakan, SPO, Pedoman)</span></span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-soft-primary text-primary font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">D</span>
              <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Dokumen <span class="text-muted extra-small d-inline-block">(Catatan Bukti / Berkas)</span></span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-soft-warning text-warning font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">O</span>
              <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Observasi <span class="text-muted extra-small d-inline-block">(Pantau Lapangan)</span></span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-soft-info text-info font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">W</span>
              <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Wawancara <span class="text-muted extra-small d-inline-block">(Tanya Jawab Staf/Pasien)</span></span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-soft-success text-success font-sans fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; font-size: 0.7rem; padding: 0;">S</span>
              <span class="text-secondary font-sans text-xs" style="font-weight: 500;">Simulasi <span class="text-muted extra-small d-inline-block">(Peragaan Prosedur)</span></span>
            </div>
          </div>
        </div>
      </div> <!-- Closes sticky-nav wrapper -->
    </div> <!-- Closes col-12 col-lg-3 -->

      <!-- Middle Column: Standards Quick Nav -->
      <div v-if="selectedPokja && !isSearching" class="col-auto d-none d-lg-block" style="width: 170px;">
        <div class="card shadow-sm border-0 sticky-nav navigation-card animate__animated animate__fadeIn">
          <div class="card-header bg-white border-0 py-3 d-flex align-items-center justify-content-between">
            <span class="fw-bold text-uppercase nav-header-title tracking-wider small">Daftar Standar</span>
          </div>
          <div class="card-body p-0 custom-scrollbar" style="max-height: calc(100vh - 180px); overflow-y: auto;">
            <div class="list-group list-group-flush">
              <button 
                v-for="std in standards" 
                :key="std.id"
                type="button"
                class="list-group-item list-group-item-action border-0 py-2.5 px-3 btn-quick-nav-item font-sans text-xs d-flex align-items-center justify-content-between"
                @click="scrollToStandard(std.kode)"
              >
                <span class="fw-bold">{{ std.kode }}</span>
                <i class="fas fa-chevron-right text-muted extra-small"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Standards & EPs Display -->
      <div class="col-12 col-lg">
        
        <!-- Welcome / Idle state -->
        <div v-if="!selectedPokja && !isSearching" class="card shadow-sm border-0 py-5 text-center bg-white idle-card">
          <div class="card-body py-5">
            <div class="icon-circle mb-4 mx-auto animate__animated animate__pulse animate__infinite">
              <i class="fas fa-hand-holding-medical fa-3x text-primary"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">Selamat Datang di Pustaka Akreditasi</h4>
            <p class="text-muted max-w-md mx-auto mb-0">
              Silakan pilih salah satu Pokja di sebelah kiri untuk menelusuri standar dan elemen penilaian secara terperinci.
            </p>
          </div>
        </div>

        <!-- Search Results State -->
        <div v-else-if="isSearching" class="d-flex flex-column gap-4">
          <div class="card shadow-sm border-0 bg-white">
            <div class="card-body py-3 px-4 d-flex align-items-center justify-content-between">
              <div>
                <h5 class="fw-bold mb-1">Hasil Pencarian</h5>
                <p class="text-muted small mb-0">Menampilkan hasil pencarian untuk "{{ searchQuery }}"</p>
              </div>
              <button class="btn btn-sm btn-light border fw-bold" @click="clearSearch">
                <i class="fas fa-times me-2"></i>Kembali
              </button>
            </div>
          </div>

          <div v-if="loadingSearch" class="text-center py-5 text-muted">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <div>Mencari elemen penilaian...</div>
          </div>

          <div v-else-if="searchResults.length === 0" class="card shadow-sm border-0 py-5 text-center bg-white">
            <div class="card-body py-4">
              <i class="fas fa-search-minus fa-3x text-muted opacity-50 mb-3"></i>
              <h5 class="fw-bold text-muted">Tidak ditemukan hasil</h5>
              <p class="text-muted small">Coba masukkan kata kunci pencarian yang lain.</p>
            </div>
          </div>

          <!-- Search results list -->
          <div v-else class="d-flex flex-column gap-3">
            <div 
              v-for="ep in searchResults" 
              :key="ep.id" 
              class="card shadow-sm border-0 ep-row-card bg-white animate__animated animate__fadeInUp"
            >
              <div class="card-body p-4">
                <div class="d-flex align-items-start gap-3 flex-column flex-sm-row">
                  <span class="badge bg-soft-indigo text-indigo px-3 py-2 font-mono fw-bold fs-6 rounded-3">
                    {{ ep.kode_ep }}
                  </span>
                  <div class="flex-grow-1" style="min-width: 0; width: 100%; overflow: hidden;">
                    <p class="fw-bold text-dark mb-2 lead-statement" style="word-break: break-word;">{{ ep.pernyataan_ep }}</p>
                    <div v-if="ep.kelengkapan_bukti" class="bg-light p-3 rounded-3 mb-2 small text-muted border-start border-primary border-3" style="word-break: break-word;">
                      <strong class="text-secondary small text-uppercase d-block mb-1">Kelengkapan Bukti:</strong>
                      {{ ep.kelengkapan_bukti }}
                    </div>

                    <!-- Todo List Section -->
                    <div class="mt-3.5 border-top pt-3">
                      <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="d-flex align-items-center gap-2">
                          <i class="fas fa-tasks text-muted" style="font-size: 0.8rem;"></i>
                          <span class="fw-bold text-dark font-sans" style="font-size: 0.82rem;">Daftar Tugas / Catatan</span>
                          <span v-if="getEpTodoProgress(ep).total > 0" class="badge rounded-pill bg-light text-secondary border px-2 py-0.5 extra-small" style="font-size: 0.65rem;">
                            {{ getEpTodoProgress(ep).completed }}/{{ getEpTodoProgress(ep).total }} selesai
                          </span>
                        </div>
                      </div>

                      <!-- Task Items -->
                      <div v-if="ep.todos && ep.todos.length > 0" class="d-flex flex-column mb-2.5">
                        <div 
                          v-for="todo in ep.todos" 
                          :key="todo.id" 
                          class="d-flex align-items-center justify-content-between py-2 border-bottom todo-item-row"
                          :class="{ 'todo-completed': todo.status === 1 }"
                        >
                          <div class="d-flex align-items-center gap-2 flex-grow-1" style="min-width: 0;">
                            <input 
                              class="todo-checkbox-circle me-1" 
                              type="checkbox" 
                              :checked="todo.status === 1"
                              @change="handleToggleTodo(todo)"
                              :id="'search-todo-check-' + todo.id"
                            >
                            <input 
                              v-if="editingTodoId === todo.id"
                              v-focus
                              type="text" 
                              class="form-control form-control-sm font-sans edit-todo-input px-2 py-0.5 rounded shadow-none flex-grow-1" 
                              style="font-size: 0.8rem; height: 26px; border: 1.5px solid #3b82f6; background-color: #fff;"
                              v-model="editingTodoText"
                              @keydown.enter="saveEditTodo(todo)"
                              @keydown.esc="cancelEditTodo"
                              @blur="saveEditTodo(todo)"
                            >
                            <label 
                              v-else
                              class="text-dark small font-sans todo-label text-start text-wrap ps-1 mb-0 flex-grow-1" 
                              :class="{ 'text-decoration-line-through text-muted fw-normal': todo.status === 1 }"
                              :for="'search-todo-check-' + todo.id"
                              style="font-size: 0.8rem; font-weight: 500; cursor: pointer;"
                              @dblclick="startEditTodo(todo)"
                              title="Klik ganda untuk mengubah"
                            >
                              {{ todo.todo }}
                            </label>
                          </div>
                          <div class="d-flex align-items-center gap-1 btn-action-container">
                            <button 
                              v-if="editingTodoId !== todo.id"
                              type="button" 
                              class="btn btn-link text-muted hover-primary p-1 border-0 btn-delete-todo"
                              @click="startEditTodo(todo)"
                              title="Ubah"
                            >
                              <i class="far fa-edit" style="font-size: 0.8rem;"></i>
                            </button>
                            <button 
                              type="button" 
                              class="btn btn-link text-muted hover-danger p-1 border-0 btn-delete-todo"
                              @click="handleDeleteTodo(ep, todo)"
                              title="Hapus"
                            >
                              <i class="far fa-trash-alt" style="font-size: 0.8rem;"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Add Task Form -->
                      <form @submit.prevent="handleAddTodo(ep)" class="position-relative d-flex align-items-center w-100 mt-2">
                        <i class="fas fa-plus text-muted position-absolute ms-3" style="font-size: 0.8rem; pointer-events: none; left: 0;"></i>
                        <input 
                          type="text" 
                          class="form-control form-control-sm font-sans todo-input rounded-pill shadow-none w-100" 
                          style="padding-left: 2.25rem; padding-right: 2.25rem; font-size: 0.8rem; height: 34px;"
                          placeholder="Tambah tugas / catatan..."
                          v-model="newTodoTexts[ep.id]"
                        >
                        <button 
                          v-if="newTodoTexts[ep.id]" 
                          type="submit" 
                          class="btn btn-link text-primary position-absolute p-0 d-flex align-items-center justify-content-center" 
                          style="right: 12px; height: 20px; width: 20px; border: none; background: transparent;"
                                                >
                          <i class="fas fa-arrow-up" style="font-size: 0.85rem;"></i>
                        </button>
                      </form>
                    </div>

                    <!-- Dokumen Bukti Section -->
                    <div class="mt-4 border-top pt-3">
                      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                        <div class="d-flex align-items-center gap-2">
                          <i class="fas fa-folder-open text-muted" style="font-size: 0.8rem;"></i>
                          <span class="fw-bold text-dark font-sans" style="font-size: 0.82rem;">Dokumen Bukti / Berkas Terkait</span>
                        </div>
                        <button 
                          type="button" 
                          class="btn-upload-toggle flex-shrink-0"
                          :class="{ 'active': showUploadForms[ep.id] }"
                          @click="toggleUploadForm(ep.id)"
                        >
                          <i class="fas" :class="showUploadForms[ep.id] ? 'fa-times' : 'fa-plus'"></i>
                          <span>{{ showUploadForms[ep.id] ? 'Batal' : 'Unggah Dokumen' }}</span>
                        </button>
                      </div>

                      <!-- Document List -->
                      <div v-if="ep.dokumens && ep.dokumens.length > 0" class="d-flex flex-column gap-2 mb-3" style="overflow: hidden;">
                        <div 
                          v-for="doc in ep.dokumens" 
                          :key="doc.id"
                          class="d-flex align-items-center justify-content-between py-2 px-3 rounded-3 border bg-light-gray-hover transition-all animate__animated animate__fadeIn"
                          style="background-color: #f8fafc; border-color: #e2e8f0 !important; overflow: hidden; min-width: 0;"
                        >
                          <div class="d-flex align-items-center gap-2" style="flex: 1 1 0%; min-width: 0; overflow: hidden;">
                            <!-- Icon Badge -->
                            <div 
                              v-if="doc.file.toLowerCase().endsWith('.pdf')" 
                              class="d-flex align-items-center justify-content-center flex-shrink-0"
                              style="width: 32px; height: 32px; background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border-radius: 8px;"
                            >
                              <i class="fas fa-file-pdf fs-6"></i>
                            </div>
                            <div 
                              v-else 
                              class="d-flex align-items-center justify-content-center flex-shrink-0"
                              style="width: 32px; height: 32px; background-color: rgba(34, 197, 94, 0.08); color: #22c55e; border-radius: 8px;"
                            >
                              <i class="fas fa-file-image fs-6"></i>
                            </div>
                            
                            <div class="d-flex flex-column text-start" style="flex: 1 1 0%; min-width: 0; overflow: hidden;">
                              <button 
                                type="button" 
                                class="btn btn-link p-0 border-0 text-decoration-none text-dark-blue fw-semibold font-sans d-block text-start hover-underline shadow-none" 
                                style="font-size: 0.82rem; background: transparent; line-height: 1.3; width: 100%; overflow: hidden;"
                                :title="doc.nama"
                                @click="handlePreviewDoc(doc)"
                              >
                                <span style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">{{ doc.nama }}</span>
                              </button>
                              <span class="text-muted font-mono d-block mt-0.5 text-start" style="font-size: 0.68rem; font-weight: normal; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">
                                {{ doc.file }}
                              </span>
                            </div>
                          </div>
                          
                          <button 
                            type="button" 
                            class="btn btn-sm shadow-none d-flex align-items-center justify-content-center border-0 list-btn-delete flex-shrink-0 ms-2" 
                            @click="handleDeleteDokumen(ep, doc)"
                            title="Hapus Dokumen"
                          >
                            <i class="far fa-trash-alt" style="font-size: 0.85rem;"></i>
                          </button>
                        </div>
                      </div>
                      <div v-else class="text-center py-2.5 mb-3 rounded-3 border border-dashed" style="background-color: #fafafa; border-color: #cbd5e1 !important;">
                        <span class="text-muted font-sans" style="font-size: 0.78rem;">Belum ada dokumen bukti yang diunggah.</span>
                      </div>

                      <!-- Upload Form (Collapsible) -->
                      <div v-if="showUploadForms[ep.id]" class="p-3 rounded-3 border animate__animated animate__fadeIn" style="background-color: #f8fafc; border-color: #e2e8f0 !important;">
                        <div class="row g-2 align-items-center">
                          <div class="col-sm-auto">
                            <input 
                              type="file" 
                              :id="'file-upload-search-' + ep.id" 
                              class="d-none" 
                              accept=".pdf,image/*" 
                              @change="handleFileChange($event, ep)"
                            >
                            <button 
                              type="button" 
                              class="btn btn-sm btn-white border w-100 font-sans d-flex align-items-center justify-content-center gap-2 shadow-none"
                              style="height: 34px; font-size: 0.78rem; background-color: #fff;"
                              @click="triggerFileInput('search-' + ep.id)"
                            >
                              <i class="fas" :class="documentFiles[ep.id] ? 'fa-check text-success' : 'fa-paperclip text-muted'"></i>
                              <span class="text-truncate" style="max-width: 150px;">
                                {{ documentFiles[ep.id] ? documentFiles[ep.id].name : 'Pilih Berkas (PDF/Gambar)' }}
                              </span>
                            </button>
                          </div>

                          <div class="col-sm">
                            <input 
                              type="text" 
                              class="form-control form-control-sm font-sans rounded shadow-none" 
                              style="font-size: 0.78rem; height: 34px;"
                              placeholder="Nama dokumen bukti..."
                              v-model="documentNames[ep.id]"
                            >
                          </div>

                          <div class="col-sm-auto">
                            <button 
                              type="button" 
                              class="btn btn-sm btn-primary w-100 font-sans d-flex align-items-center justify-content-center gap-1.5 shadow-none"
                              style="height: 34px; font-size: 0.78rem; min-width: 85px;"
                              :disabled="!documentFiles[ep.id] || !documentNames[ep.id] || documentUploadLoadings[ep.id]"
                              @click="handleUploadDokumen(ep)"
                            >
                              <span v-if="documentUploadLoadings[ep.id]" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              <i v-else class="fas fa-upload"></i>
                              <span>Unggah</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex gap-1.5 flex-wrap flex-sm-column align-items-end justify-content-start">
                    <span 
                      v-for="bukti in getBuktiList(ep.tipe_bukti)" 
                      :key="bukti"
                      class="badge bukti-badge"
                      :class="getBuktiColorClass(bukti)"
                    >
                      {{ bukti }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Pokja Standards view -->
        <div v-else class="d-flex flex-column gap-4">
          
          <!-- Pokja Header Card -->
          <div id="pokja-content-area" class="card shadow-sm border-0 bg-gradient-primary text-white header-card overflow-hidden position-relative">
            <div class="card-body p-4 position-relative" style="z-index: 2;">
              <div class="d-flex align-items-center gap-3">
                <div class="header-icon-box shadow">
                  <i class="fas fa-briefcase-medical fa-2x text-white"></i>
                </div>
                <div>
                  <h4 class="fw-bold font-sans mb-1">{{ selectedPokja.kode }}</h4>
                  <p class="mb-0 text-white-80 font-sans lead-text">{{ selectedPokja.nama_lengkap }}</p>
                </div>
              </div>
            </div>
            <!-- Decorative circle -->
            <div class="deco-circle"></div>
          </div>

          <!-- Loading state for standards -->
          <div v-if="loadingStandards" class="text-center py-5 text-muted bg-white card shadow-sm border-0">
            <div class="card-body py-5">
              <div class="spinner-border text-primary mb-3" role="status"></div>
              <div>Memuat data standar & elemen penilaian...</div>
            </div>
          </div>

          <!-- Empty state for standards -->
          <div v-else-if="standards.length === 0" class="card shadow-sm border-0 py-5 text-center bg-white">
            <div class="card-body py-4">
              <i class="fas fa-clipboard-list fa-3x text-muted opacity-50 mb-3"></i>
              <h5 class="fw-bold text-muted">Belum ada data standar</h5>
              <p class="text-muted small">Hubungi administrator untuk melakukan import data instrumen.</p>
            </div>
          </div>

          <!-- Standards list -->
          <div v-else class="d-flex flex-column gap-4">
            <div 
              v-for="std in standards" 
              :key="std.id" 
              :id="'standard-' + std.kode"
              class="card shadow-sm border-0 overflow-hidden standard-card bg-white animate__animated animate__fadeInUp"
            >
              <!-- Standard Header -->
              <div class="card-header bg-light border-0 py-3 px-4 d-flex flex-column gap-2">
                <!-- Row 1: Kode badge + Tugas badge -->
                <div class="d-flex align-items-center justify-content-between gap-2">
                  <span class="badge bg-primary px-3 py-2 font-sans fw-bold rounded-3 text-white flex-shrink-0" style="font-size: 0.88rem;">
                    {{ std.kode }}
                  </span>
                  <div v-if="getStandardTodoProgress(std).total > 0" class="flex-shrink-0">
                    <span class="badge rounded-pill bg-soft-success text-success border-soft-success font-sans d-flex align-items-center gap-1 fw-bold" style="font-size: 0.72rem; padding: 4px 8px; white-space: nowrap;">
                      <i class="fas fa-check-circle"></i>
                      Tugas: {{ getStandardTodoProgress(std).completed }}/{{ getStandardTodoProgress(std).total }}
                    </span>
                  </div>
                </div>
                <!-- Row 2: Pernyataan text full width -->
                <h6 class="fw-bold mb-0 text-dark font-sans text-wrap text-start" style="line-height: 1.5; font-size: 0.88rem;">{{ std.pernyataan }}</h6>
              </div>

              <!-- Standard EPs -->
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <div 
                    v-for="ep in std.elemen_penilaians" 
                    :key="ep.id" 
                    class="list-group-item p-4 border-0 border-bottom ep-item-row"
                    style="min-width: 0; width: 100%; overflow: hidden;"
                  >
                    <div class="d-flex align-items-start gap-3 flex-column flex-md-row" style="overflow: hidden; min-width: 0;">
                      <!-- EP Badge (Letter) -->
                      <span class="badge bg-soft-primary text-primary px-3 py-2 font-mono fw-bold fs-6 rounded-3">
                        EP {{ ep.nomor }}
                      </span>
                      
                      <!-- EP content -->
                      <div class="flex-grow-1" style="min-width: 0; width: 100%; overflow: hidden;">
                        <p class="fw-bold text-dark mb-2 lead-statement" style="word-break: break-word;">{{ ep.pernyataan_ep }}</p>
                        
                        <!-- Kelengkapan bukti box if exists -->
                        <div v-if="ep.kelengkapan_bukti" class="bg-light p-3 rounded-3 mb-0 small text-muted border-start border-primary border-3 mt-3" style="word-break: break-word;">
                          <strong class="text-secondary small text-uppercase d-block mb-1">Kelengkapan Bukti:</strong>
                          {{ ep.kelengkapan_bukti }}
                        </div>

                        <!-- Todo List Section -->
                        <div class="mt-3.5 border-top pt-3">
                          <div class="d-flex align-items-center justify-content-between mb-2">
                            <div class="d-flex align-items-center gap-2">
                              <i class="fas fa-tasks text-muted" style="font-size: 0.8rem;"></i>
                              <span class="fw-bold text-dark font-sans" style="font-size: 0.82rem;">Daftar Tugas / Catatan</span>
                              <span v-if="getEpTodoProgress(ep).total > 0" class="badge rounded-pill bg-light text-secondary border px-2 py-0.5 extra-small" style="font-size: 0.65rem;">
                                {{ getEpTodoProgress(ep).completed }}/{{ getEpTodoProgress(ep).total }} selesai
                              </span>
                            </div>
                          </div>

                          <!-- Task Items -->
                          <div v-if="ep.todos && ep.todos.length > 0" class="d-flex flex-column mb-2.5">
                            <div 
                              v-for="todo in ep.todos" 
                              :key="todo.id" 
                              class="d-flex align-items-center justify-content-between py-2 border-bottom todo-item-row"
                              :class="{ 'todo-completed': todo.status === 1 }"
                            >
                              <div class="d-flex align-items-center gap-2 flex-grow-1" style="min-width: 0;">
                                <input 
                                  class="todo-checkbox-circle me-1" 
                                  type="checkbox" 
                                  :checked="todo.status === 1"
                                  @change="handleToggleTodo(todo)"
                                  :id="'todo-check-' + todo.id"
                                >
                                <input 
                                  v-if="editingTodoId === todo.id"
                                  v-focus
                                  type="text" 
                                  class="form-control form-control-sm font-sans edit-todo-input px-2 py-0.5 rounded shadow-none flex-grow-1" 
                                  style="font-size: 0.8rem; height: 26px; border: 1.5px solid #3b82f6; background-color: #fff;"
                                  v-model="editingTodoText"
                                  @keydown.enter="saveEditTodo(todo)"
                                  @keydown.esc="cancelEditTodo"
                                  @blur="saveEditTodo(todo)"
                                >
                                <label 
                                  v-else
                                  class="text-dark small font-sans todo-label text-start text-wrap ps-1 mb-0 flex-grow-1" 
                                  :class="{ 'text-decoration-line-through text-muted fw-normal': todo.status === 1 }"
                                  :for="'todo-check-' + todo.id"
                                  style="font-size: 0.8rem; font-weight: 500; cursor: pointer;"
                                  @dblclick="startEditTodo(todo)"
                                  title="Klik ganda untuk mengubah"
                                >
                                  {{ todo.todo }}
                                </label>
                              </div>
                              <div class="d-flex align-items-center gap-1 btn-action-container">
                                <button 
                                  v-if="editingTodoId !== todo.id"
                                  type="button" 
                                  class="btn btn-link text-muted hover-primary p-1 border-0 btn-delete-todo"
                                  @click="startEditTodo(todo)"
                                  title="Ubah"
                                >
                                  <i class="far fa-edit" style="font-size: 0.8rem;"></i>
                                </button>
                                <button 
                                  type="button" 
                                  class="btn btn-link text-muted hover-danger p-1 border-0 btn-delete-todo"
                                  @click="handleDeleteTodo(ep, todo)"
                                  title="Hapus"
                                >
                                  <i class="far fa-trash-alt" style="font-size: 0.8rem;"></i>
                                </button>
                              </div>
                            </div>
                          </div>

                          <!-- Add Task Form -->
                          <form @submit.prevent="handleAddTodo(ep)" class="position-relative d-flex align-items-center w-100 mt-2">
                            <i class="fas fa-plus text-muted position-absolute ms-3" style="font-size: 0.8rem; pointer-events: none; left: 0;"></i>
                            <input 
                              type="text" 
                              class="form-control form-control-sm font-sans todo-input rounded-pill shadow-none w-100" 
                              style="padding-left: 2.25rem; padding-right: 2.25rem; font-size: 0.8rem; height: 34px;"
                              placeholder="Tambah tugas / catatan..."
                              v-model="newTodoTexts[ep.id]"
                            >
                            <button 
                              v-if="newTodoTexts[ep.id]" 
                              type="submit" 
                              class="btn btn-link text-primary position-absolute p-0 d-flex align-items-center justify-content-center" 
                              style="right: 12px; height: 20px; width: 20px; border: none; background: transparent;"
                            >
                              <i class="fas fa-arrow-up" style="font-size: 0.85rem;"></i>
                            </button>
                          </form>
                        </div>

                        <!-- Dokumen Bukti Section -->
                        <div class="mt-4 border-top pt-3">
                          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                            <div class="d-flex align-items-center gap-2">
                              <i class="fas fa-folder-open text-muted" style="font-size: 0.8rem;"></i>
                              <span class="fw-bold text-dark font-sans" style="font-size: 0.82rem;">Dokumen Bukti / Berkas Terkait</span>
                            </div>
                            <button 
                              type="button" 
                              class="btn-upload-toggle flex-shrink-0"
                              :class="{ 'active': showUploadForms[ep.id] }"
                              @click="toggleUploadForm(ep.id)"
                            >
                              <i class="fas" :class="showUploadForms[ep.id] ? 'fa-times' : 'fa-plus'"></i>
                              <span>{{ showUploadForms[ep.id] ? 'Batal' : 'Unggah Dokumen' }}</span>
                            </button>
                          </div>

                          <!-- Document List -->
                          <div v-if="ep.dokumens && ep.dokumens.length > 0" class="d-flex flex-column gap-2 mb-3" style="overflow: hidden;">
                            <div 
                              v-for="doc in ep.dokumens" 
                              :key="doc.id"
                              class="d-flex align-items-center justify-content-between py-2 px-3 rounded-3 border bg-light-gray-hover transition-all animate__animated animate__fadeIn"
                              style="background-color: #f8fafc; border-color: #e2e8f0 !important; overflow: hidden; min-width: 0;"
                            >
                              <div class="d-flex align-items-center gap-2" style="flex: 1 1 0%; min-width: 0; overflow: hidden;">
                                <!-- Icon Badge -->
                                <div 
                                  v-if="doc.file.toLowerCase().endsWith('.pdf')" 
                                  class="d-flex align-items-center justify-content-center flex-shrink-0"
                                  style="width: 32px; height: 32px; background-color: rgba(239, 68, 68, 0.08); color: #ef4444; border-radius: 8px;"
                                >
                                  <i class="fas fa-file-pdf fs-6"></i>
                                </div>
                                <div 
                                  v-else 
                                  class="d-flex align-items-center justify-content-center flex-shrink-0"
                                  style="width: 32px; height: 32px; background-color: rgba(34, 197, 94, 0.08); color: #22c55e; border-radius: 8px;"
                                >
                                  <i class="fas fa-file-image fs-6"></i>
                                </div>
                                
                                <div class="d-flex flex-column text-start" style="flex: 1 1 0%; min-width: 0; overflow: hidden;">
                                  <button 
                                    type="button" 
                                    class="btn btn-link p-0 border-0 text-decoration-none text-dark-blue fw-semibold font-sans d-block text-start hover-underline shadow-none" 
                                    style="font-size: 0.82rem; background: transparent; line-height: 1.3; width: 100%; overflow: hidden;"
                                    :title="doc.nama"
                                    @click="handlePreviewDoc(doc)"
                                  >
                                    <span style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">{{ doc.nama }}</span>
                                  </button>
                                  <span class="text-muted font-mono d-block mt-0.5 text-start" style="font-size: 0.68rem; font-weight: normal; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">
                                    {{ doc.file }}
                                  </span>
                                </div>
                              </div>
                              
                              <button 
                                type="button" 
                                class="btn btn-sm shadow-none d-flex align-items-center justify-content-center border-0 list-btn-delete flex-shrink-0 ms-2" 
                                @click="handleDeleteDokumen(ep, doc)"
                                title="Hapus Dokumen"
                              >
                                <i class="far fa-trash-alt" style="font-size: 0.85rem;"></i>
                              </button>
                            </div>
                          </div>
                          <div v-else class="text-center py-2.5 mb-3 rounded-3 border border-dashed" style="background-color: #fafafa; border-color: #cbd5e1 !important;">
                            <span class="text-muted font-sans" style="font-size: 0.78rem;">Belum ada dokumen bukti yang diunggah.</span>
                          </div>

                          <!-- Upload Form (Collapsible) -->
                          <div v-if="showUploadForms[ep.id]" class="p-3 rounded-3 border animate__animated animate__fadeIn" style="background-color: #f8fafc; border-color: #e2e8f0 !important;">
                            <div class="row g-2 align-items-center">
                              <div class="col-sm-auto">
                                <input 
                                  type="file" 
                                  :id="'file-upload-' + ep.id" 
                                  class="d-none" 
                                  accept=".pdf,image/*" 
                                  @change="handleFileChange($event, ep)"
                                >
                                <button 
                                  type="button" 
                                  class="btn btn-sm btn-white border w-100 font-sans d-flex align-items-center justify-content-center gap-2 shadow-none"
                                  style="height: 34px; font-size: 0.78rem; background-color: #fff;"
                                  @click="triggerFileInput(ep.id)"
                                >
                                  <i class="fas" :class="documentFiles[ep.id] ? 'fa-check text-success' : 'fa-paperclip text-muted'"></i>
                                  <span class="text-truncate" style="max-width: 150px;">
                                    {{ documentFiles[ep.id] ? documentFiles[ep.id].name : 'Pilih Berkas (PDF/Gambar)' }}
                                  </span>
                                </button>
                              </div>

                              <div class="col-sm">
                                <input 
                                  type="text" 
                                  class="form-control form-control-sm font-sans rounded shadow-none" 
                                  style="font-size: 0.78rem; height: 34px;"
                                  placeholder="Nama dokumen bukti..."
                                  v-model="documentNames[ep.id]"
                                >
                              </div>

                              <div class="col-sm-auto">
                                <button 
                                  type="button" 
                                  class="btn btn-sm btn-primary w-100 font-sans d-flex align-items-center justify-content-center gap-1.5 shadow-none"
                                  style="height: 34px; font-size: 0.78rem; min-width: 85px;"
                                  :disabled="!documentFiles[ep.id] || !documentNames[ep.id] || documentUploadLoadings[ep.id]"
                                  @click="handleUploadDokumen(ep)"
                                >
                                  <span v-if="documentUploadLoadings[ep.id]" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  <i v-else class="fas fa-upload"></i>
                                  <span>Unggah</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Bukti Type Badges -->
                      <div class="d-flex gap-1.5 flex-wrap flex-md-column align-items-end justify-content-start mt-2 mt-md-0">
                        <span 
                          v-for="bukti in getBuktiList(ep.tipe_bukti)" 
                          :key="bukti"
                          class="badge bukti-badge"
                          :class="getBuktiColorClass(bukti)"
                        >
                          {{ bukti }}
                        </span>
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

    <!-- Floating Action Button for Mobile Quick Nav -->
    <div v-if="selectedPokja && !isSearching && standards.length > 0" class="d-lg-none position-fixed animate__animated animate__bounceIn" style="bottom: 24px; right: 24px; z-index: 1030;">
      <button 
        type="button" 
        class="btn btn-primary shadow-lg rounded-pill d-flex align-items-center gap-2 px-3 py-2.5 btn-fab"
        data-bs-toggle="offcanvas" 
        data-bs-target="#mobileStandardsOffcanvas"
        aria-controls="mobileStandardsOffcanvas"
      >
        <i class="fas fa-compass fa-lg"></i>
        <span class="fw-bold small font-sans text-white">Navigasi</span>
      </button>
    </div>

    <!-- Mobile Navigation Offcanvas (Standards & Pokja Tabs) -->
    <div 
      v-if="selectedPokja && !isSearching && standards.length > 0"
      class="offcanvas offcanvas-end border-0 rounded-start-4 shadow d-lg-none" 
      tabindex="-1" 
      id="mobileStandardsOffcanvas" 
      aria-labelledby="mobileStandardsOffcanvasLabel"
      style="width: 300px;"
    >
      <!-- Dual Tab Header -->
      <div class="offcanvas-header bg-white border-bottom py-2.5 px-3 d-flex align-items-center justify-content-between">
        <div class="nav nav-pills flex-grow-1 flex-nowrap me-2" role="tablist" style="background-color: #f1f5f9; padding: 4px; border-radius: 9999px;">
          <button 
            type="button"
            class="nav-link flex-fill py-1.5 px-2 text-center rounded-pill font-sans extra-small fw-bold border-0" 
            :class="{ active: activeOffcanvasTab === 'standards' }"
            style="font-size: 0.72rem; transition: all 0.2s;"
            @click="activeOffcanvasTab = 'standards'"
          >
            <i class="fas fa-list-ol me-1"></i> Standar
          </button>
          <button 
            type="button"
            class="nav-link flex-fill py-1.5 px-2 text-center rounded-pill font-sans extra-small fw-bold border-0" 
            :class="{ active: activeOffcanvasTab === 'pokja' }"
            style="font-size: 0.72rem; transition: all 0.2s;"
            @click="activeOffcanvasTab = 'pokja'"
          >
            <i class="fas fa-briefcase-medical me-1"></i> Pokja
          </button>
        </div>
        <button type="button" class="btn-close text-reset small" style="width: 0.8em; height: 0.8em;" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>

      <!-- Offcanvas Body -->
      <div class="offcanvas-body p-0 custom-scrollbar bg-light-gray" style="overflow-y: auto;">
        
        <!-- Tab Content 1: Standards List -->
        <div v-show="activeOffcanvasTab === 'standards'" class="animate__animated animate__fadeIn animate__faster">
          <div class="list-group list-group-flush bg-white">
            <button 
              v-for="std in standards" 
              :key="std.id"
              type="button"
              class="list-group-item list-group-item-action border-0 py-3 px-4 btn-quick-nav-item font-sans d-flex align-items-center justify-content-between"
              data-bs-dismiss="offcanvas"
              @click="scrollToStandard(std.kode)"
            >
              <span class="fw-bold text-dark-blue">{{ std.kode }}</span>
              <span v-if="getStandardTodoProgress(std).total > 0" class="badge rounded-pill bg-soft-success text-success extra-small fw-bold">
                {{ getStandardTodoProgress(std).completed }}/{{ getStandardTodoProgress(std).total }}
              </span>
              <i v-else class="fas fa-chevron-right text-muted extra-small"></i>
            </button>
          </div>
        </div>

        <!-- Tab Content 2: Pokja Accordion Navigation -->
        <div v-show="activeOffcanvasTab === 'pokja'" class="animate__animated animate__fadeIn animate__faster">
          <div class="accordion accordion-flush" id="mobileBabAccordion">
            <div 
              v-for="bab in babList" 
              :key="bab.id" 
              class="accordion-item border-0 border-bottom"
            >
              <h2 class="accordion-header" :id="'m-heading' + bab.id">
                <button 
                  class="accordion-button collapsed px-3 py-3 fw-bold text-dark small" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  :data-bs-target="'#m-collapse' + bab.id" 
                  aria-expanded="false" 
                  :aria-controls="'m-collapse' + bab.id"
                >
                  <div class="d-flex flex-column align-items-start">
                    <span class="badge bg-slate-label mb-1 px-2 py-1 text-white extra-small">{{ bab.kode }}</span>
                    <span class="text-wrap font-sans text-muted-dark" style="font-size: 0.8rem; line-height: 1.4;">{{ bab.nama }}</span>
                  </div>
                </button>
              </h2>
              <div 
                :id="'m-collapse' + bab.id" 
                class="accordion-collapse collapse" 
                :aria-labelledby="'m-heading' + bab.id" 
                data-bs-parent="#mobileBabAccordion"
              >
                <div class="accordion-body p-0 bg-white">
                  <div class="list-group list-group-flush">
                    <button 
                      v-for="pokja in bab.pokjas" 
                      :key="pokja.id"
                      type="button"
                      class="list-group-item list-group-item-action d-flex align-items-center justify-content-between border-0 px-3 py-2.5 pokja-item"
                      :class="{ 'active-pokja': selectedPokja && selectedPokja.id === pokja.id }"
                      data-bs-dismiss="offcanvas"
                      @click="selectPokja(pokja)"
                    >
                      <div class="d-flex flex-column align-items-start w-75">
                        <span class="fw-bold font-sans tracking-wide text-dark-blue small">{{ pokja.kode }}</span>
                        <span class="text-muted extra-small text-truncate w-100 text-start">{{ pokja.nama_lengkap }}</span>
                      </div>
                      <i class="fas fa-chevron-right text-muted icon-arrow"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Premium Document Preview Modal -->
    <div 
      v-if="showPreviewModal && activePreviewDoc" 
      class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style="z-index: 2000; background-color: rgba(15, 23, 42, 0.45); backdrop-filter: blur(10px);"
      @click.self="closePreviewModal"
    >
      <div 
        class="bg-white rounded-4 shadow-2xl border w-100 mx-3 d-flex flex-column overflow-hidden animate__animated animate__zoomIn animate__faster" 
        style="max-width: 900px; height: 85vh; border-color: #e2e8f0 !important;"
      >
        <!-- Modal Header -->
        <div class="d-flex align-items-center justify-content-between px-4 py-3 border-bottom preview-modal-header">
          <div class="d-flex align-items-center gap-3 flex-grow-1 me-3" style="min-width: 0;">
            <!-- Icon Badge -->
            <div 
              v-if="activePreviewDoc.file.toLowerCase().endsWith('.pdf')" 
              class="d-flex align-items-center justify-content-center flex-shrink-0 preview-badge-pdf"
            >
              <i class="fas fa-file-pdf fs-4"></i>
            </div>
            <div 
              v-else 
              class="d-flex align-items-center justify-content-center flex-shrink-0 preview-badge-image"
            >
              <i class="fas fa-file-image fs-4"></i>
            </div>

            <!-- Title & Filename -->
            <div class="d-flex flex-column text-start flex-grow-1" style="min-width: 0;">
              <span class="fw-bold text-dark font-sans text-truncate d-block text-start m-0" style="font-size: 0.95rem; line-height: 1.4;">
                {{ activePreviewDoc.nama }}
              </span>
              <span class="text-muted text-truncate font-mono d-block mt-0.5 text-start" style="font-size: 0.7rem; font-weight: normal;">
                {{ activePreviewDoc.file }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex align-items-center gap-2 flex-shrink-0">
            <a 
              :href="getDocUrl(activePreviewDoc.file)" 
              target="_blank" 
              class="btn btn-sm shadow-none font-sans d-flex align-items-center gap-2 px-3 border-0 preview-btn-action"
              style="white-space: nowrap;"
            >
              <i class="fas fa-external-link-alt" style="font-size: 0.75rem;"></i>
              <span>Buka di Tab Baru</span>
            </a>
            <button 
              type="button" 
              class="btn btn-sm shadow-none d-flex align-items-center justify-content-center flex-shrink-0 border-0 preview-btn-close"
              @click="closePreviewModal"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body / Content -->
        <div class="flex-grow-1 p-3 bg-light d-flex align-items-center justify-content-center overflow-auto position-relative" style="background-color: #f8fafc;">
          <!-- PDF Frame -->
          <iframe 
            v-if="activePreviewDoc.file.toLowerCase().endsWith('.pdf')" 
            :src="getDocUrl(activePreviewDoc.file)" 
            width="100%" 
            height="100%" 
            style="border: none; border-radius: 8px; background-color: #fff;"
          ></iframe>
          
          <!-- Image Element -->
          <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center p-2">
            <img 
              :src="getDocUrl(activePreviewDoc.file)" 
              class="img-fluid rounded-3 shadow-lg max-w-100 max-h-100" 
              style="object-fit: contain; max-height: calc(85vh - 100px);"
              alt="Preview Berkas"
            >
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import akreditasiService from '@/services/akreditasiService'
import config from '@/config/api'

const toast = useToast()

// UI state
const showFloatingSearch = ref(false)
const isSearchExpanded = ref(false)
const floatingSearchInputRef = ref(null)

// Document Evidence Upload States
const documentNames = ref({})
const documentFiles = ref({})
const documentUploadLoadings = ref({})

const toggleSearchExpand = () => {
  isSearchExpanded.value = !isSearchExpanded.value
  if (isSearchExpanded.value) {
    setTimeout(() => {
      if (floatingSearchInputRef.value) {
        floatingSearchInputRef.value.focus()
      }
    }, 150)
  }
}

const loadingBab = ref(false)
const loadingStandards = ref(false)
const loadingSearch = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)

// Lists
const babList = ref([])
const standards = ref([])
const searchResults = ref([])
const selectedPokja = ref(null)
const activeOffcanvasTab = ref('standards')

// Total count
const totalPokja = computed(() => {
  return babList.value.reduce((acc, bab) => acc + (bab.pokjas ? bab.pokjas.length : 0), 0)
})

// Fetch all Bab with nested Pokja
const fetchBabAndPokja = async () => {
  loadingBab.value = true
  try {
    const response = await akreditasiService.getBab({
      include: 'pokjas',
      limit: 100
    })
    // Sort Bab list by urutan
    babList.value = response.data.data.sort((a, b) => a.urutan - b.urutan)
  } catch (error) {
    console.error(error)
    toast.error('Gagal memuat navigasi Bab/Pokja')
  } finally {
    loadingBab.value = false
  }
}

// Select a Pokja & fetch its standards
const selectPokja = async (pokja) => {
  selectedPokja.value = pokja
  isSearching.value = false
  searchQuery.value = ''
  activeOffcanvasTab.value = 'standards'

  // On desktop scroll to top; on mobile scroll to the pokja content area after render
  const isMobile = window.innerWidth < 992
  if (!isMobile) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  loadingStandards.value = true
  try {
    const response = await akreditasiService.searchStandar({
      filters: [
        { field: 'pokja_id', operator: '=', value: pokja.id }
      ],
      includes: [
        { relation: 'elemenPenilaians' },
        { relation: 'elemenPenilaians.todos' },
        { relation: 'elemenPenilaians.dokumens' }
      ],
      limit: 100
    })
    // Sort standards by urutan
    standards.value = response.data.data.sort((a, b) => a.urutan - b.urutan)

    // On mobile: scroll to the pokja header after Vue has rendered it
    if (isMobile) {
      await nextTick()
      const el = document.getElementById('pokja-content-area')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal memuat standar untuk Pokja ' + pokja.kode)
  } finally {
    loadingStandards.value = false
  }
}

// Debounced Search Function
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  if (!searchQuery.value.trim()) {
    isSearching.value = false
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  loadingSearch.value = true
  
  searchTimeout = setTimeout(async () => {
    try {
      const response = await akreditasiService.searchElemenPenilaian({
        search: { value: searchQuery.value },
        includes: [
          { relation: 'standar' },
          { relation: 'standar.pokja' },
          { relation: 'todos' },
          { relation: 'dokumens' }
        ],
        limit: 25
      })
      searchResults.value = response.data.data
    } catch (error) {
      console.error(error)
      toast.error('Gagal melakukan pencarian')
    } finally {
      loadingSearch.value = false
    }
  }, 600)
}

const clearSearch = () => {
  searchQuery.value = ''
  isSearching.value = false
  searchResults.value = []
}

const scrollToStandard = (kode) => {
  const element = document.getElementById('standard-' + kode)
  if (element) {
    const yOffset = -94 // 70px header + 24px padding
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

// Utility to parse tipe_bukti (comma-separated string, e.g. "R,D,O")
const getBuktiList = (tipeBukti) => {
  if (!tipeBukti) return []
  return tipeBukti.split(',').map(b => b.trim()).filter(Boolean)
}

// Visual color styling for STARKES Tipe Bukti badges
const getBuktiColorClass = (bukti) => {
  const classes = {
    'R': 'bg-soft-danger text-danger border-soft-danger',
    'D': 'bg-soft-primary text-primary border-soft-primary',
    'O': 'bg-soft-warning text-warning border-soft-warning',
    'W': 'bg-soft-info text-info border-soft-info',
    'S': 'bg-soft-success text-success border-soft-success',
  }
  return classes[bukti.toUpperCase()] || 'bg-light text-dark'
}

// State for todo inputs per EP
const newTodoTexts = ref({})

// Todo list handlers
const handleAddTodo = async (ep) => {
  const text = newTodoTexts.value[ep.id]?.trim()
  if (!text) return

  try {
    const response = await akreditasiService.createTodo({
      elemen_penilaian_id: ep.id,
      todo: text,
      status: 0
    })
    
    if (!ep.todos) {
      ep.todos = []
    }
    const newTodo = response.data?.data || response.data
    if (newTodo) {
      ep.todos.push(newTodo)
      newTodoTexts.value[ep.id] = ''
      toast.success('Tugas berhasil ditambahkan')
    }
  } catch (error) {
    console.error(error)
    toast.error('Gagal menambahkan tugas')
  }
}

const handleToggleTodo = async (todo) => {
  const oldStatus = todo.status
  const newStatus = todo.status === 1 ? 0 : 1
  
  // Optimistic update
  todo.status = newStatus

  try {
    await akreditasiService.updateTodo(todo.id, {
      status: newStatus
    })
  } catch (error) {
    console.error(error)
    // Revert if error
    todo.status = oldStatus
    toast.error('Gagal mengubah status tugas')
  }
}

const handleDeleteTodo = async (ep, todo) => {
  const result = await Swal.fire({
    title: 'Hapus Tugas / Catatan?',
    text: `Apakah Anda yakin ingin menghapus "${todo.todo}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-4 font-sans shadow-lg',
      title: 'fw-bold text-dark fs-5 pt-3',
      htmlContainer: 'text-secondary small py-2',
      actions: 'd-flex align-items-center justify-content-center gap-2 w-100 px-3 mt-3',
      confirmButton: 'btn btn-danger btn-sm px-4 py-2 font-sans small m-0',
      cancelButton: 'btn btn-secondary btn-sm px-4 py-2 font-sans small m-0'
    },
    buttonsStyling: false
  })

  if (result.isConfirmed) {
    try {
      await akreditasiService.deleteTodo(todo.id)
      ep.todos = ep.todos.filter(t => t.id !== todo.id)
      toast.success('Tugas berhasil dihapus')
    } catch (error) {
      console.error(error)
      toast.error('Gagal menghapus tugas')
    }
  }
}

// Directive for auto focusing inputs
const vFocus = {
  mounted: (el) => el.focus()
}

// Inline edit state
const editingTodoId = ref(null)
const editingTodoText = ref('')

const startEditTodo = (todo) => {
  editingTodoId.value = todo.id
  editingTodoText.value = todo.todo
}

const cancelEditTodo = () => {
  editingTodoId.value = null
  editingTodoText.value = ''
}

const saveEditTodo = async (todo) => {
  const text = editingTodoText.value.trim()
  if (!text) {
    cancelEditTodo()
    return
  }
  
  if (text === todo.todo) {
    cancelEditTodo()
    return
  }

  const oldText = todo.todo
  todo.todo = text
  editingTodoId.value = null

  try {
    await akreditasiService.updateTodo(todo.id, {
      todo: text
    })
    toast.success('Tugas berhasil diperbarui')
  } catch (error) {
    console.error(error)
    todo.todo = oldText
    toast.error('Gagal memperbarui tugas')
  } finally {
    cancelEditTodo()
  }
}

// Progress calculation utilities
const getEpTodoProgress = (ep) => {
  if (!ep || !ep.todos || ep.todos.length === 0) return { completed: 0, total: 0 }
  const total = ep.todos.length
  const completed = ep.todos.filter(t => t.status === 1).length
  return { completed, total }
}

const getStandardTodoProgress = (std) => {
  if (!std || !std.elemen_penilaians || std.elemen_penilaians.length === 0) return { completed: 0, total: 0 }
  let total = 0
  let completed = 0
  std.elemen_penilaians.forEach(ep => {
    if (ep.todos) {
      total += ep.todos.length
      completed += ep.todos.filter(t => t.status === 1).length
    }
  })
  return { completed, total }
}

// Document Evidence Handlers
const triggerFileInput = (epId) => {
  const el = document.getElementById('file-upload-' + epId)
  if (el) el.click()
}

const handleFileChange = (event, ep) => {
  const file = event.target.files[0]
  if (file) {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format berkas tidak didukung. Harap pilih file PDF atau Gambar (JPG/JPEG/PNG).')
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran berkas melebihi batas (maksimum 10MB).')
      event.target.value = ''
      return
    }

    documentFiles.value[ep.id] = file
    if (!documentNames.value[ep.id]) {
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.'))
      documentNames.value[ep.id] = cleanName
    }
  }
}

const handleUploadDokumen = async (ep) => {
  const file = documentFiles.value[ep.id]
  const name = documentNames.value[ep.id]?.trim()

  if (!file) {
    toast.error('Harap pilih berkas terlebih dahulu')
    return
  }
  if (!name) {
    toast.error('Harap masukkan nama dokumen')
    return
  }

  documentUploadLoadings.value[ep.id] = true
  const formData = new FormData()
  formData.append('elemen_penilaian_id', ep.id)
  formData.append('file', file)
  formData.append('nama', name)

  try {
    const response = await akreditasiService.uploadDokumen(formData)
    const newDoc = response.data?.data || response.data

    if (!ep.dokumens) {
      ep.dokumens = []
    }
    ep.dokumens.push(newDoc)
    
    documentFiles.value[ep.id] = null
    documentNames.value[ep.id] = ''
    
    const fileEl = document.getElementById('file-upload-' + ep.id)
    if (fileEl) fileEl.value = ''

    toast.success('Dokumen bukti berhasil diunggah')
  } catch (error) {
    console.error(error)
    toast.error(error.response?.data?.message || 'Gagal mengunggah dokumen bukti')
  } finally {
    documentUploadLoadings.value[ep.id] = false
  }
}

const handleDeleteDokumen = async (ep, doc) => {
  const result = await Swal.fire({
    title: 'Hapus Dokumen Bukti?',
    text: `Apakah Anda yakin ingin menghapus "${doc.nama}"? Berkas akan dihapus permanen dari server.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-4 font-sans shadow-lg',
      title: 'fw-bold text-dark fs-5 pt-3',
      htmlContainer: 'text-secondary small py-2',
      actions: 'd-flex align-items-center justify-content-center gap-2 w-100 px-3 mt-3',
      confirmButton: 'btn btn-danger btn-sm px-4 py-2 font-sans small m-0',
      cancelButton: 'btn btn-secondary btn-sm px-4 py-2 font-sans small m-0'
    },
    buttonsStyling: false
  })

  if (result.isConfirmed) {
    try {
      await akreditasiService.deleteDokumen(doc.id)
      ep.dokumens = ep.dokumens.filter(d => d.id !== doc.id)
      toast.success('Dokumen bukti berhasil dihapus')
    } catch (error) {
      console.error(error)
      toast.error('Gagal menghapus dokumen bukti')
    }
  }
}

const getDocUrl = (fileName) => {
  return `${config.public.AKREDITASI_BERKAS_URL}/rsia_akreditasi/${fileName}`
}

// Preview modal and upload form toggle state
const activePreviewDoc = ref(null)
const showPreviewModal = ref(false)
const showUploadForms = ref({})

const toggleUploadForm = (epId) => {
  showUploadForms.value[epId] = !showUploadForms.value[epId]
}

const handlePreviewDoc = (doc) => {
  activePreviewDoc.value = doc
  showPreviewModal.value = true
}

const closePreviewModal = () => {
  activePreviewDoc.value = null
  showPreviewModal.value = false
}

const handleScroll = () => {
  const shouldShow = window.scrollY > 150
  showFloatingSearch.value = shouldShow
  if (!shouldShow) {
    isSearchExpanded.value = false
  }
}

onMounted(() => {
  fetchBabAndPokja()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

.page-bg {
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
}

/* Premium Preview Modal Styles */
.preview-modal-header {
  border-color: #e2e8f0 !important;
  background-color: #f8fafc;
}

.preview-badge-pdf {
  width: 40px;
  height: 40px;
  background-color: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-radius: 10px;
}

.preview-badge-image {
  width: 40px;
  height: 40px;
  background-color: rgba(34, 197, 94, 0.08);
  color: #22c55e;
  border-radius: 10px;
}

.preview-btn-action {
  height: 38px;
  background-color: #f1f5f9;
  color: #64748b;
  font-weight: 500;
  font-size: 0.8rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.preview-btn-action:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

.preview-btn-close {
  height: 38px;
  width: 38px;
  background-color: #f1f5f9;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.preview-btn-close:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.list-btn-delete {
  height: 32px;
  width: 32px;
  background-color: transparent;
  color: #94a3b8;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.list-btn-delete:hover {
  background-color: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.font-sans {
  font-family: 'Outfit', sans-serif;
}

.tracking-wider {
  letter-spacing: 0.08em;
}

.text-white-80 {
  color: rgba(255, 255, 255, 0.85);
}

.extra-small {
  font-size: 0.65rem;
  font-weight: 700;
}

.sticky-nav {
  position: sticky;
  top: calc(70px + 1.5rem);
  z-index: 10;
}

.navigation-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.12);
  background: #ffffff !important;
}

.navigation-card .card-header {
  background: #ffffff !important;
  background-image: none !important;
  border-bottom: 1px solid #f1f5f9 !important;
  color: #334155 !important;
}

.nav-header-title {
  color: #475569 !important;
  font-weight: 700 !important;
}

.small-badge {
  font-size: 0.72rem;
  font-weight: 600;
}

.text-dark-blue {
  color: #1e293b;
}

.text-muted-dark {
  color: #475569;
}

.bg-slate-label {
  background-color: #64748b !important;
}

.pokja-item {
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 3px solid transparent !important;
  background-color: #ffffff !important;
}

.pokja-item:hover {
  background-color: #f8fafc !important;
  border-left-color: #cbd5e1 !important;
  padding-left: 1.25rem !important;
}

.pokja-item:hover .icon-arrow {
  transform: translateX(4px);
  color: #0f172a !important;
}

.icon-arrow {
  font-size: 0.75rem;
  transition: all 0.2s;
}

.active-pokja {
  background-color: #f0f7ff !important;
  border-left: 4px solid #2563eb !important;
}

.active-pokja .text-dark-blue {
  color: #2563eb !important;
}

.active-pokja .icon-arrow {
  color: #2563eb !important;
  transform: translateX(4px);
}

.idle-card {
  border-radius: 20px;
  background: white;
  border: 1px dashed #e2e8f0;
}

.icon-circle {
  width: 90px;
  height: 90px;
  background-color: #eff6ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-wrapper {
  max-width: 100%;
}

.search-input {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  font-size: 0.9rem;
  transition: all 0.2s;
  background-color: white;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
}

.search-icon {
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.header-card {
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.2);
}

.header-icon-box {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deco-circle {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.standard-card {
  border-radius: 20px;
  box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.06);
}

.standard-card .card-header {
  background: #f8fafc !important;
  background-image: none !important;
  border-bottom: 1px solid #e2e8f0 !important;
  color: #0f172a !important;
  padding: 1rem 1.5rem !important;
}

.standard-card .card-header h6 {
  color: #0f172a !important;
  font-size: 0.95rem !important;
  line-height: 1.6 !important;
  text-align: left !important;
}

.ep-item-row {
  transition: all 0.2s;
  min-width: 0;
  width: 100%;
}

.ep-item-row:hover {
  background-color: #fafbfd;
}

.lead-statement {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1e293b;
  font-weight: 500;
}

.bg-soft-danger { background-color: #fee2e2; }
.text-danger { color: #dc2626; }
.bg-soft-primary { background-color: #dbeafe; }
.text-primary { color: #2563eb; }
.bg-soft-warning { background-color: #fef3c7; }
.text-warning { color: #d97706; }
.bg-soft-info { background-color: #ecfeff; }
.text-info { color: #0891b2; }
.bg-soft-success { background-color: #dcfce7; }
.text-success { color: #16a34a; }
.bg-soft-indigo { background-color: #e0e7ff; }
.text-indigo { color: #4f46e5; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.ep-row-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.06);
  transition: all 0.2s;
}

.ep-row-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px -4px rgba(148, 163, 184, 0.12);
}

.accordion-button:not(.collapsed) {
  background-color: #f8fafc;
  box-shadow: none;
}

.accordion-button:focus {
  box-shadow: none;
  border-color: rgba(0, 0, 0, 0.125);
}

/* Animations */
.animate__animated {
  animation-duration: 0.4s;
}

.quick-nav-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.06);
  border: 1px solid #f1f5f9 !important;
}

.btn-quick-nav-item {
  color: #475569 !important;
  background-color: transparent !important;
  border-bottom: 1px solid #f1f5f9 !important;
  border-radius: 0 !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  transition: all 0.2s ease !important;
  text-align: left;
}

.btn-quick-nav-item:hover {
  background-color: #eff6ff !important;
  color: #2563eb !important;
  padding-left: 1.25rem !important;
}

.bukti-badge {
  width: 24px;
  height: 24px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  border-radius: 50% !important;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 0 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-fab {
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.35) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.btn-fab:hover, .btn-fab:focus {
  transform: scale(1.05) translateY(-2px) !important;
  box-shadow: 0 12px 35px rgba(37, 99, 235, 0.45) !important;
}

.rounded-start-4 {
  border-top-left-radius: 1.25rem !important;
  border-bottom-left-radius: 1.25rem !important;
}

/* Todo List Styles */
.todo-item-row {
  background-color: transparent !important;
  border-bottom: 1px solid #f1f5f9 !important;
  transition: all 0.15s ease;
  padding: 8px 4px !important;
}
.todo-item-row:hover {
  background-color: #f8fafc !important;
}
.todo-item-row:hover .btn-delete-todo {
  opacity: 1;
}
.todo-completed .todo-label {
  color: #94a3b8 !important;
  text-decoration: line-through !important;
}
.btn-delete-todo {
  opacity: 0;
  transition: opacity 0.2s ease;
  background: none;
  border: none;
  padding: 2px !important;
}
.hover-danger:hover {
  color: #ef4444 !important;
}
.hover-primary:hover {
  color: #2563eb !important;
}
.bg-light-gray-hover:hover {
  background-color: #f1f5f9 !important;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.hover-underline:hover {
  text-decoration: underline !important;
}
@media (max-width: 768px) {
  .btn-delete-todo {
    opacity: 1;
  }
}
.todo-checkbox-circle {
  appearance: none;
  -webkit-appearance: none;
  width: 17px;
  height: 17px;
  border: 1.5px solid #cbd5e1;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.todo-checkbox-circle:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
.todo-checkbox-circle:checked {
  border-color: #10b981;
  background-color: #10b981;
}
.todo-checkbox-circle:checked::after {
  content: "✓";
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1;
}
.todo-label {
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  line-height: 1.4;
}
.todo-input {
  border: 1.5px solid #e2e8f0;
  background-color: #f8fafc;
  transition: all 0.2s ease;
}
.todo-input:focus {
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Premium Upload Toggle Button */
.btn-upload-toggle {
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 0.45rem 1.1rem;
  border-radius: 50px;
  border: 1px solid #bfdbfe;
  background-color: #eff6ff;
  color: #2563eb;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.05);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-upload-toggle:hover {
  background-color: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.12), 0 2px 4px -1px rgba(37, 99, 235, 0.08);
}
.btn-upload-toggle:active {
  transform: translateY(0);
}
.btn-upload-toggle.active {
  background-color: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.05);
}
.btn-upload-toggle.active:hover {
  background-color: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.12), 0 2px 4px -1px rgba(220, 38, 38, 0.08);
}
</style>

<style>
/* Global override specifically for SweetAlert2 popups using the .rounded-4 class */
.swal2-container .swal2-popup.rounded-4 .swal2-actions {
  display: flex !important;
  flex-direction: row !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
}
.swal2-container .swal2-popup.rounded-4 .swal2-actions button {
  margin: 0 !important;
  flex: 1 !important;
  max-width: 120px !important;
  width: auto !important;
}

/* Floating Search FAB Container */
.floating-search-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1050; /* Above typical elements but below dropdowns/modals */
  border-radius: 50px;
  background: transparent;
  pointer-events: none; /* Let clicks pass through container gaps */
}
@media (max-width: 991.98px) {
  .floating-search-container {
    bottom: 85px; /* Stand vertically above the 'Navigasi' button (at bottom: 24px) */
    right: 24px;
  }
}
.floating-search-container * {
  pointer-events: auto; /* Enable clicks inside active elements */
}
.btn-floating-search-toggle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.35);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 1.1rem;
}
.btn-floating-search-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
}
.btn-floating-search-toggle.active {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  box-shadow: 0 4px 15px rgba(100, 116, 139, 0.35);
}
.floating-search-input-wrapper {
  width: 280px;
}
@media (max-width: 575.98px) {
  .floating-search-input-wrapper {
    width: 200px; /* Keep it compact on mobile screens to prevent overflow */
  }
}
.floating-search-input-wrapper .search-input-floating {
  border-radius: 50px !important;
  border: 1px solid #e2e8f0 !important;
  padding: 0.65rem 1.25rem !important;
  font-size: 0.875rem !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08) !important;
  background-color: white !important;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  width: 100%;
}
.floating-search-input-wrapper .search-input-floating:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.15) !important;
}

/* Slide left animation transition */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: scaleX(0);
  opacity: 0;
  transform-origin: right center;
}
</style>
