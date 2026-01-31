<template>
  <div class="article-management p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Manage Health Articles</h1>
        <p class="text-gray-500 text-sm mt-1">Manage health articles displayed on the mobile app home screen.</p>
      </div>
      <button 
        @click="openAddModal"
        class="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium"
      >
        <span class="text-xl">+</span> Add New Article
      </button>
    </div>

    <!-- Search & Filter Area -->
    <div class="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center border border-gray-100">
      <div class="relative flex-1 w-full">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search articles by title or category..."
          class="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
        >
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title & Category</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="isLoading" class="animate-pulse">
              <td colspan="5" class="px-6 py-12 text-center text-gray-400 italic">Loading articles...</td>
            </tr>
            <tr v-else-if="filteredArticles.length === 0" class="hover:bg-gray-50 transition-colors">
              <td colspan="5" class="px-6 py-12 text-center text-gray-400 italic">No articles found.</td>
            </tr>
            <tr v-for="article in filteredArticles" :key="article.id" class="hover:bg-gray-50 transition-colors group">
              <td class="px-6 py-4">
                <div class="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                  <img :src="article.image" :alt="article.title" class="w-full h-full object-cover">
                  <div @click="viewImage(article.image)" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-800 line-clamp-1">{{ article.title }}</span>
                  <span class="text-xs text-indigo-500 font-medium">{{ article.category || 'Uncategorized' }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {{ article.order }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-center">
                  <button 
                    @click="toggleStatus(article)"
                    :class="[
                      article.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                      'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95'
                    ]"
                  >
                    {{ article.status }}
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button 
                  @click="openEditModal(article)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  @click="confirmDelete(article)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeModal">
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>
        
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div class="bg-indigo-600 p-6 flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">{{ isEdit ? 'Edit Article' : 'Add New Article' }}</h3>
            <button @click="closeModal" class="text-white/80 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveArticle" class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column: Image -->
              <div class="space-y-4">
                <label class="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Thumbnail Image</label>
                <div 
                  @click="$refs.fileInput.click()"
                  class="aspect-video rounded-3xl border-2 border-dashed border-gray-200 hover:border-indigo-400 bg-gray-50 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden p-2 group relative"
                >
                  <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover rounded-2xl shadow-sm">
                  <div v-else class="flex flex-col items-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-xs font-medium">Click to upload thumbnail</span>
                  </div>
                  <div v-if="imagePreview" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    CHANGE IMAGE
                  </div>
                </div>
                <input type="file" ref="fileInput" class="hidden" @change="handleImageChange" accept="image/*">
                <p class="text-[10px] text-gray-400 px-2 italic text-center">Recommended: 16:9 ratio. Max 10MB.</p>
              </div>

              <!-- Right Column: Details -->
              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Article Title</label>
                  <input 
                    v-model="form.title" 
                    type="text" 
                    required 
                    placeholder="Enter catchy title..."
                    class="w-full bg-gray-50 border-none rounded-2xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                  >
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Category</label>
                  <input 
                    v-model="form.category" 
                    type="text" 
                    placeholder="e.g., Tips Kesehatan, Info RS"
                    class="w-full bg-gray-50 border-none rounded-2xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                  >
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Display Order</label>
                  <input 
                    v-model.number="form.order" 
                    type="number" 
                    placeholder="0"
                    class="w-full bg-gray-50 border-none rounded-2xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                  >
                </div>
              </div>
            </div>

            <div class="mt-6">
              <label class="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Full Content</label>
              <textarea 
                v-model="form.content" 
                rows="6"
                placeholder="Write your health article content here (supports basic structure)..."
                class="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner resize-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button 
                type="button" 
                @click="closeModal"
                class="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="isSaving"
                class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-200 flex items-center gap-2"
              >
                <svg v-if="isSaving" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSaving ? 'SAVING...' : isEdit ? 'UPDATE ARTICLE' : 'SAVE ARTICLE' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal (Native style) -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Delete Article?</h3>
        <p class="text-gray-500 text-center text-sm mb-6">This action cannot be undone. Are you sure you want to delete this article?</p>
        <div class="flex gap-3">
          <button @click="showDeleteModal = false" class="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm">Cancel</button>
          <button @click="handleDelete" class="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm">Yes, Delete</button>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="previewImageUrl" class="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4" @click="previewImageUrl = null">
      <img :src="previewImageUrl" class="max-w-full max-h-full rounded-2xl shadow-stone-900 shadow-2xl">
      <button class="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import articleService from '@/services/articleService';
import { useToast } from 'vue-toastification';

const toast = useToast();
const articles = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const searchQuery = ref('');
const showModal = ref(false);
const showDeleteModal = ref(false);
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
  isLoading.ref = true;
  try {
    const res = await articleService.getAllArticles();
    articles.value = res.data.data;
  } catch (err) {
    toast.error('Failed to load articles');
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
      toast.warning('Image size too large! Max 10MB.');
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
      toast.warning('Thumbnail image is required');
      isSaving.value = false;
      return;
    }

    if (isEdit.value) {
      await articleService.updateArticle(form.value.id, formData);
      toast.success('Article updated successfully!');
    } else {
      await articleService.createArticle(formData);
      toast.success('Article created successfully!');
    }
    
    closeModal();
    loadArticles();
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.message || 'Error saving article';
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
    toast.success(`Article changed to ${newStatus}`);
  } catch (err) {
    toast.error('Failed to change status');
  }
};

const confirmDelete = (article) => {
  selectedArticle.value = article;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  try {
    await articleService.deleteArticle(selectedArticle.value.id);
    toast.success('Article deleted');
    showDeleteModal.value = false;
    loadArticles();
  } catch (err) {
    toast.error('Failed to delete article');
  }
};

const viewImage = (url) => {
  previewImageUrl.value = url;
};

onMounted(loadArticles);
</script>

<style scoped>
.animate-in {
  animation: animate-in 0.2s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
