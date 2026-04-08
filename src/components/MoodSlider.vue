<template>
  <div class="mood-slider-container">
    <div class="slider-header-luxury">
      <div class="header-content">
        <h3 class="premium-title">
          <i class="fas fa-heart pulse-icon"></i>
          Employee Sentiment
        </h3>
        <p class="premium-subtitle">Real-time team mood updates</p>
      </div>
      <div class="header-actions">
        <span class="count-badge" v-if="moods.length">{{ moods.length }} Check-ins today</span>
      </div>
    </div>

    <div class="mood-slider-wrapper" @mouseenter="pauseScroll" @mouseleave="resumeScroll">
      <div 
        ref="sliderTrack"
        class="mood-slider-track" 
        :class="{ 'is-paused': isPaused }"
      >
        <!-- Double the list for infinite scroll effect -->
        <div 
          v-for="(item, index) in displayMoods" 
          :key="`${item.id}-${index}`"
          class="mood-card-premium"
        >
          <div class="mood-card-glass">
            <div class="avatar-container">
              <img 
                :src="getPhotoUrl(item.pegawai?.photo)" 
                :alt="item.pegawai?.nama"
                class="employee-photo"
                @error="handleImageError"
              />
              <div class="mood-badge" :class="`mood-${item.mood}`">
                <i :class="getMoodIcon(item.mood)"></i>
              </div>
            </div>
            <div class="employee-info">
              <span class="emp-name">{{ item.pegawai?.nama || 'Anonymous' }}</span>
              <div class="mood-tags" v-if="item.tags && item.tags.length">
                <span 
                  v-for="tag in item.tags.slice(0, 1)" 
                  :key="tag.id" 
                  class="mood-tag-mini"
                >
                  #{{ tag.name }}
                </span>
              </div>
              <span class="time-ago">{{ formatTime(item.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Placeholder if no data -->
        <div v-if="loading && !moods.length" class="loading-state">
          <div v-for="n in 5" :key="n" class="skeleton-card"></div>
        </div>

        <div v-if="!loading && !moods.length" class="empty-state">
          <p>No mood check-ins today yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import dashboardService from '@/services/dashboardService'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime)

const moods = ref([])
const loading = ref(false)
const isPaused = ref(false)
const sliderTrack = ref(null)

const displayMoods = computed(() => {
  if (moods.value.length === 0) return []
  // Repeat items to ensure smooth infinite loop if there's enough data
  return [...moods.value, ...moods.value, ...moods.value]
})

const fetchMoods = async () => {
  loading.value = true
  try {
    const response = await dashboardService.getMoodAll()
    if (response.data.success) {
      moods.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch moods:', error)
  } finally {
    loading.value = false
  }
}

import config from '@/config/api'

const getPhotoUrl = (photo) => {
  if (!photo || photo === '-') return 'https://ui-avatars.com/api/?name=Employee&background=random'
  return `${config.public.PHOTO_URL}${photo}`
}

const handleImageError = (e) => {
  e.target.src = 'https://ui-avatars.com/api/?name=Employee&background=random'
}

const getMoodIcon = (mood) => {
  const icons = {
    'luar_biasa': 'fas fa-sun',
    'baik': 'fas fa-smile',
    'kurang_oke': 'fas fa-meh',
    'berat': 'fas fa-cloud'
  }
  return icons[mood] || 'fas fa-question'
}

const formatTime = (date) => {
  return dayjs(date).fromNow()
}

const pauseScroll = () => { isPaused.value = true }
const resumeScroll = () => { isPaused.value = false }

onMounted(() => {
  fetchMoods()
  // Refresh every 5 minutes
  const interval = setInterval(fetchMoods, 5 * 60 * 1000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.mood-slider-container {
  margin: 2rem 0;
  padding: 1.5rem;
  background: transparent;
  border-radius: 24px;
  overflow: hidden;
}

.slider-header-luxury {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.premium-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.02em;
}

.pulse-icon {
  color: #ff4d4d;
  animation: pulse 2s infinite;
  font-size: 1.2rem;
}

.premium-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.count-badge {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.4rem 0.8rem;
  border-radius: 100px;
  font-size: 0.75rem;
  color: #64748b;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.mood-slider-wrapper {
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

.mood-slider-track {
  display: flex;
  gap: 1.5rem;
  width: max-content;
  animation: scroll 40s linear infinite;
  padding: 1rem 0;
}

.mood-slider-track.is-paused {
  animation-play-state: paused;
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-33.33% - 1rem)); }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

.mood-card-premium {
  width: 220px;
  flex-shrink: 0;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mood-card-premium:hover {
  transform: translateY(-10px) scale(1.05);
  z-index: 10;
}

.mood-card-glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.avatar-container {
  position: relative;
  width: 55px;
  height: 55px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
}

.employee-photo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: block;
  /* Improve sharpness for low-res photos */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: auto;
}

.mood-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  font-size: 0.7rem;
  color: white;
  z-index: 2;
}

.mood-badge i { font-size: 0.7rem; }

.mood-luar_biasa { background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); box-shadow: 0 0 10px rgba(79, 172, 254, 0.6); }
.mood-baik { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); box-shadow: 0 0 10px rgba(67, 233, 123, 0.6); }
.mood-kurang_oke { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); box-shadow: 0 0 10px rgba(246, 211, 101, 0.6); }
.mood-berat { background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%); box-shadow: 0 0 10px rgba(255, 8, 68, 0.6); }

.employee-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.emp-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mood-tag-mini {
  font-size: 0.7rem;
  color: #4facfe;
  background: rgba(79, 172, 254, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  margin-top: 0.25rem;
  display: inline-block;
}

.time-ago {
  font-size: 0.65rem;
  color: #94a3b8;
  margin-top: 0.35rem;
}

.skeleton-card {
  width: 220px;
  height: 90px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  animation: pulse 1.5s infinite ease-in-out;
}

.empty-state {
  width: 100%;
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
}
</style>
