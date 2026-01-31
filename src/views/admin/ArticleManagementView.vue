<template>
  <div class="article-management container-fluid py-4">
    <div class="row mb-4 align-items-center">
      <div class="col">
        <h2 class="fw-bold mb-0">Kelola Artikel Kesehatan</h2>
        <p class="text-muted mb-0">Atur konten artikel yang tampil di beranda aplikasi mobile.</p>
      </div>
      <div class="col-auto">
        <button @click="openAddModal" class="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg> Tambah Artikel Baru
        </button>
      </div>
    </div>

    <!-- Search Section -->
    <div class="card border-0 shadow-sm mb-4 rounded-4">
      <div class="card-body p-3">
        <div class="input-group">
          <span class="input-group-text bg-transparent border-end-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="form-control border-start-0 ps-0" 
            placeholder="Cari artikel berdasarkan judul atau kategori..."
          >
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <th class="ps-4" style="width: 100px;">Gambar</th>
              <th>Judul & Kategori</th>
              <th style="width: 100px;">Urutan</th>
              <th class="text-center" style="width: 120px;">Status</th>
              <th class="text-end pe-4" style="width: 150px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="text-center py-5 text-muted italic">Memuat data artikel...</td>
            </tr>
            <tr v-else-if="filteredArticles.length === 0">
              <td colspan="5" class="text-center py-5 text-muted italic">Tidak ada artikel ditemukan.</td>
            </tr>
            <tr v-for="article in filteredArticles" :key="article.id">
              <td class="ps-4">
                <div class="article-img-container" @click="viewImage(article.image)">
                  <img :src="article.image" class="rounded shadow-sm scale-on-hover" alt="Article Thumbnail">
                </div>
              </td>
              <td>
                <div class="fw-bold text-dark">{{ article.title }}</div>
                <small class="badge bg-info-subtle text-info rounded-pill px-2">
                  {{ article.category || 'Tanpa Kategori' }}
                </small>
              </td>
              <td>
                <span class="badge bg-light text-dark border">{{ article.order }}</span>
              </td>
              <td class="text-center">
                <button 
                  @click="toggleStatus(article)"
                  class="btn btn-sm px-3 rounded-pill fw-bold"
                  :class="article.status === 'active' ? 'btn-outline-success' : 'btn-outline-danger'"
                >
                  {{ article.status.toUpperCase() }}
                </button>
              </td>
              <td class="text-end pe-4">
                <button @click="openEditModal(article)" class="btn btn-light btn-sm text-primary me-2 rounded-3 shadow-none border">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="confirmDelete(article)" class="btn btn-light btn-sm text-danger rounded-3 shadow-none border">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form (Bootstrap Style) -->
    <div v-if="showModal" class="custom-modal-backdrop" @click.self="closeModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-primary text-white border-0 py-3">
            <h5 class="modal-title fw-bold">{{ isEdit ? 'Edit Artikel' : 'Tambah Artikel Baru' }}</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveArticle">
            <div class="modal-body p-4">
              <div class="row g-4">
                <div class="col-md-5">
                  <label class="form-label fw-bold small text-muted text-uppercase">GAMBAR ARTIKEL</label>
                  <div class="upload-area rounded-4 border-2 border-dashed" @click="$refs.fileInput.click()">
                    <img v-if="imagePreview" :src="imagePreview" class="img-fluid rounded-4 shadow-sm h-100 w-100 object-fit-cover">
                    <div v-else class="text-center p-3 text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="mb-2 opacity-50">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div class="small fw-medium">Klik untuk Unggah</div>
                    </div>
                  </div>
                  <input type="file" ref="fileInput" class="d-none" @change="handleImageChange" accept="image/*">
                  <p class="text-center small text-muted mt-2 italic">Format: JPG/PNG. Maks 10MB.</p>
                </div>
                <div class="col-md-7">
                  <div class="mb-3">
                    <label class="form-label fw-bold small text-muted text-uppercase">Judul Artikel</label>
                    <input v-model="form.title" type="text" class="form-control rounded-3 border-light-subtle bg-light-subtle p-2 px-3 shadow-none border" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold small text-muted text-uppercase">Kategori</label>
                    <input v-model="form.category" type="text" class="form-control rounded-3 border-light-subtle bg-light-subtle p-2 px-3 shadow-none border">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold small text-muted text-uppercase">Urutan Tampil</label>
                    <input v-model.number="form.order" type="number" class="form-control rounded-3 border-light-subtle bg-light-subtle p-2 px-3 shadow-none border">
                  </div>
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold small text-muted text-uppercase">Konten Artikel</label>
                  <textarea v-model="form.content" rows="6" class="form-control rounded-4 border-light-subtle bg-light-subtle p-3 shadow-none border resize-none"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer border-top-0 p-4">
              <button type="button" class="btn btn-light px-4 rounded-3 border" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary px-5 rounded-3 fw-bold" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSaving ? 'Menyimpan...' : isEdit ? 'Update Artikel' : 'Simpan Artikel' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="previewImageUrl" class="image-viewer-backdrop" @click="previewImageUrl = null">
      <img :src="previewImageUrl" class="img-fluid rounded-4 shadow-lg scale-in">
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
    
    if (form.value.image) {
      formData.append('image', form.value.image);
    } else if (!isEdit.value) {
      toast.warning('Gambar thumbnail wajib diisi');
      isSaving.value = false;
      return;
    }

    if (isEdit.value) {
      await articleService.updateArticle(form.value.id, formData);
      toast.success('Artikel berhasil diperbarui!');
    } else {
      await articleService.createArticle(formData);
      toast.success('Artikel berhasil ditambahkan!');
    }
    
    closeModal();
    loadArticles();
  } catch (err) {
    const msg = err.response?.data?.message || 'Terjadi kesalahan sistem';
    toast.error(msg);
  } finally {
    isSaving.value = false;
  }
};

const toggleStatus = async (article) => {
  try {
    const newStatus = article.status === 'active' ? 'inactive' : 'active';
    await articleService.updateStatus(article.id, newStatus);
    article.status = newStatus;
    toast.success(`Status diubah menjadi ${newStatus}`);
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
    confirmButtonColor: '#d33',
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
.article-img-container {
  width: 70px;
  height: 50px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 8px;
  background: #f8f9fa;
}

.article-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scale-on-hover:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}

.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fbfbfb;
  transition: all 0.2s;
  overflow: hidden;
}

.upload-area:hover {
  border-color: var(--bs-primary) !important;
  background: #f0f7ff;
}

.image-viewer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.85);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  padding: 20px;
}

.scale-in {
  animation: scale-in 0.2s ease-out;
  max-width: 90%;
  max-height: 90%;
}

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.resize-none {
  resize: none;
}
</style>
