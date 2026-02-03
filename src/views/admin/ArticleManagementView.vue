<template>
  <div class="article-management">
    <div class="page-header">
      <div class="header-container">
        <div class="header-left">
          <h1 class="page-title">📄 Kelola Artikel Kesehatan</h1>
          <p class="page-subtitle">Atur konten artikel yang tampil di beranda aplikasi mobile</p>
        </div>
        <div class="header-right">
          <button class="btn btn-primary btn-add" @click="openAddModal">
            <i class="fas fa-plus"></i>
            <span>Tambah Artikel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Article Search -->
    <div class="card border-0 shadow-sm mb-4 rounded-4" style="border: 1px solid #e2e8f0 !important;">
      <div class="card-body p-3">
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="fas fa-search text-muted"></i>
          </span>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="form-control border-start-0 ps-0 shadow-none" 
            style="padding-left: 0.5rem !important;"
            placeholder="Cari artikel berdasarkan judul atau kategori..."
          >
        </div>
      </div>
    </div>

    <!-- Article Table -->
    <div class="card flex-grow-1">
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Memuat data artikel...</p>
        </div>

        <div v-else-if="articles.length === 0" class="text-center py-5">
          <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Belum ada data artikel</h5>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th style="width: 80px;">Urutan</th>
                <th style="width: 120px;">Gambar</th>
                <th>Judul & Kategori</th>
                <th>Konten</th>
                <th style="width: 140px;">Status</th>
                <th class="text-center" style="width: 120px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in filteredArticles" :key="article.id">
                <td>{{ article.order }}</td>
                <td>
                  <div class="thumbnail-wrapper" @click="viewImage(article.image)">
                    <img :src="article.image" class="slider-thumbnail" alt="article" />
                    <div class="thumbnail-overlay">
                      <i class="fas fa-expand"></i>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ article.title }}</div>
                  <small class="badge bg-info-subtle text-info rounded-pill px-2">
                    {{ article.category || 'Tanpa Kategori' }}
                  </small>
                </td>
                <td>
                  <small class="text-muted text-truncate d-inline-block" style="max-width: 200px;">
                    {{ article.content || '-' }}
                  </small>
                </td>
                <td>
                  <div class="status-badge" :class="{ active: article.status === 'active' }" @click="toggleStatus(article)">
                    <span class="status-dot"></span>
                    {{ article.status === 'active' ? 'Aktif' : 'Non-aktif' }}
                  </div>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="openEditModal(article)" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" @click="confirmDelete(article)" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Sidebar -->
    <div class="sidebar-form" :class="{ active: showModal }">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <h5 class="sidebar-title">
            {{ isEdit ? '✏️ Edit Artikel' : '➕ Tambah Artikel Baru' }}
          </h5>
          <button type="button" class="btn-sidebar-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="sidebar-body">
          <form @submit.prevent="saveArticle">
            <div class="form-group mb-4">
              <label class="form-label fw-bold">Gambar Thumbnail *</label>
              <div class="upload-area" :class="{ 'has-file': imagePreview }" @click="$refs.fileInput.click()">
                <input
                  type="file"
                  ref="fileInput"
                  class="d-none"
                  @change="handleImageChange"
                  accept="image/*"
                />
                
                <div v-if="!imagePreview" class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt mb-2 text-primary"></i>
                  <span class="fw-bold text-dark">Klik untuk pilih gambar</span>
                  <small class="text-muted">JPG, PNG (Maks. 10MB)</small>
                </div>
                
                <div v-else class="preview-container">
                  <img :src="imagePreview" class="img-preview" alt="Preview" />
                  <div class="preview-overlay">
                    <span>Ganti Gambar</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label fw-bold">Judul Artikel</label>
              <div class="input-wrapper">
                <input v-model="form.title" type="text" class="form-control" placeholder="Contoh: Tips Hidup Sehat" required />
                <i class="fas fa-heading input-icon"></i>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label fw-bold">Kategori</label>
              <div class="input-wrapper">
                <input v-model="form.category" type="text" class="form-control" placeholder="Contoh: Tips Kesehatan" />
                <i class="fas fa-tag input-icon"></i>
              </div>
            </div>

            <div class="row">
              <div class="col-6">
                <div class="form-group mb-4">
                  <label class="form-label fw-bold">Urutan</label>
                  <div class="input-wrapper">
                    <input v-model.number="form.order" type="number" class="form-control" min="0" />
                    <i class="fas fa-sort-numeric-up input-icon"></i>
                  </div>
                </div>
              </div>
              <div v-if="isEdit" class="col-6">
                <div class="form-group mb-4">
                  <label class="form-label fw-bold">Status</label>
                  <div class="toggle-group mt-1">
                    <div class="toggle-switch" :class="{ active: form.status === 'active' }" @click="form.status = form.status === 'active' ? 'inactive' : 'active'">
                      <div class="toggle-slider"></div>
                    </div>
                    <span class="toggle-label small fw-bold text-muted">{{ form.status === 'active' ? 'Aktif' : 'Non-aktif' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label fw-bold">Konten Lengkap</label>
              <textarea v-model="form.content" rows="8" class="form-control ps-3" placeholder="Tulis isi artikel di sini..." style="resize: none;"></textarea>
            </div>
          </form>
        </div>

        <div class="sidebar-footer">
          <button type="button" class="btn btn-secondary border" @click="closeModal">
            <i class="fas fa-times me-2"></i>Batal
          </button>
          <button type="button" class="btn btn-primary px-4 fw-bold" @click="saveArticle" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-save me-2"></i>
            {{ isEdit ? 'Update Artikel' : 'Simpan Artikel' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Image Modal View -->
    <div class="modal fade" :class="{ show: previewImageUrl }" :style="{ display: previewImageUrl ? 'block' : 'none' }" tabindex="-1" @click="previewImageUrl = null">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 bg-transparent">
          <div class="modal-body p-0 text-center">
            <img :src="previewImageUrl" class="img-fluid rounded shadow-lg" alt="Full Image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import articleService from '@/services/articleService';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';

const toast = useToast();
const articles = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const searchQuery = ref('');
const showModal = ref(false);
const isEdit = ref(false);
const imagePreview = ref(null);
const fileInput = ref(null);
const selectedArticle = ref(null);
const previewImageUrl = ref(null);

const form = ref({
  id: null,
  title: '',
  content: '',
  category: '',
  order: 0,
  status: 'active',
  image: null,
});

const loadArticles = async () => {
  isLoading.value = true;
  try {
    const res = await articleService.getAllArticles();
    articles.value = res.data.data;
  } catch (err) {
    toast.error('Gagal memuat artikel');
  } finally {
    isLoading.value = false;
  }
};

const filteredArticles = computed(() => {
  if (!searchQuery.value) return articles.value;
  const q = searchQuery.value.toLowerCase();
  return articles.value.filter(a => 
    a.title.toLowerCase().includes(q) || 
    (a.category && a.category.toLowerCase().includes(q))
  );
});

const openAddModal = () => {
  isEdit.value = false;
  resetForm();
  showModal.value = true;
};

const openEditModal = (article) => {
  isEdit.value = true;
  selectedArticle.value = article;
  form.value = {
    id: article.id,
    title: article.title,
    content: article.content || '',
    category: article.category || '',
    order: article.order,
    status: article.status,
    image: null,
  };
  imagePreview.value = article.image;
  showModal.value = true;
};

const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    content: '',
    category: '',
    order: 0,
    status: 'active',
    image: null,
  };
  imagePreview.value = null;
};

const closeModal = () => {
  showModal.value = false;
};

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      toast.warning('Ukuran file terlalu besar! Maks 10MB.');
      return;
    }
    form.value.image = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const saveArticle = async () => {
  isSaving.value = true;
  try {
    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('content', form.value.content || '');
    formData.append('category', form.value.category || '');
    formData.append('order', form.value.order || 0);
    formData.append('status', form.value.status);
    
    if (form.value.image) {
      formData.append('image', form.value.image);
    } else if (!isEdit.value) {
      toast.warning('Gambar thumbnail wajib diisi');
      isSaving.value = false;
      return;
    }

    if (isEdit.value) {
      await articleService.updateArticle(form.value.id, formData);
      toast.success('Artikel diperbarui');
    } else {
      await articleService.createArticle(formData);
      toast.success('Artikel ditambahkan');
    }
    
    closeModal();
    loadArticles();
  } catch (err) {
    toast.error('Gagal menyimpan artikel');
  } finally {
    isSaving.value = false;
  }
};

const toggleStatus = async (article) => {
  try {
    const newStatus = article.status === 'active' ? 'inactive' : 'active';
    await articleService.updateStatus(article.id, newStatus);
    article.status = newStatus;
    toast.success(`Status diubah`);
  } catch (err) {
    toast.error('Gagal mengubah status');
  }
};

const confirmDelete = (article) => {
  Swal.fire({
    title: 'Hapus Artikel?',
    text: "Tindakan ini tidak dapat dibatalkan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1e40af',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await articleService.deleteArticle(article.id);
        toast.success('Artikel dihapus');
        loadArticles();
      } catch (err) {
        toast.error('Gagal menghapus artikel');
      }
    }
  });
};

const viewImage = (url) => {
  previewImageUrl.value = url;
};

onMounted(loadArticles);
</script>

<style scoped>
/* Inherit common styles from SliderManagementView */
.article-management {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.page-header {
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0;
}

.card {
  border: none;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}

.thumbnail-wrapper {
  position: relative;
  width: 100px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.slider-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.thumbnail-wrapper:hover .thumbnail-overlay {
  opacity: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.status-badge.active {
  background: #ecfdf5;
  color: #10b981;
  border-color: #a7f3d0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Sidebar Form */
.sidebar-form {
  position: fixed;
  top: 0;
  right: -550px; /* Slightly wider for article content */
  width: 550px;
  height: 100vh;
  background: white;
  z-index: 1050;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  border-left: 1px solid #e2e8f0;
}

.sidebar-form.active {
  right: 0;
}

.sidebar-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.btn-sidebar-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0; /* Anti-gepeng */
}

.btn-sidebar-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.sidebar-body {
  padding: 2rem;
  height: calc(100vh - 150px);
  overflow-y: auto;
  background: #f8fafc;
}

.sidebar-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  background: white;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .article-management {
    gap: 1rem;
    padding-bottom: 2rem;
  }

  .header-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1.25rem;
  }

  .header-right {
    width: 100%;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .sidebar-form {
    width: 100%;
    right: -100%;
    border-left: none;
  }
  
  .sidebar-form.active {
    right: 0;
  }

  .sidebar-body {
    padding: 1.5rem;
  }

  .sidebar-header {
    padding: 1.25rem 1.5rem;
  }

  .sidebar-footer {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
  }

  .sidebar-footer .btn {
    width: 100%;
  }

  .upload-area {
    padding: 1rem;
  }

  .img-preview {
    height: 150px;
  }
}
</style>
