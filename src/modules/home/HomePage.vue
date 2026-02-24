<script setup>
import { onMounted, ref } from 'vue'
import { healthService } from '../../services/health.service'
import { formatDateTime } from '../../shared/utils/formatDate'

const loading = ref(false)
const error = ref('')
const healthData = ref(null)
const checkedAt = ref(null)

const checkBackend = async () => {
  loading.value = true
  error.value = ''

  try {
    healthData.value = await healthService.check()
    checkedAt.value = new Date().toISOString()
  } catch (err) {
    error.value = err.message || 'Cannot connect to backend'
  } finally {
    loading.value = false
  }
}

onMounted(checkBackend)
</script>

<template>
  <section>
    <h2>Backend connection</h2>
    <button :disabled="loading" @click="checkBackend">
      {{ loading ? 'Checking...' : 'Check backend' }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>
    <pre v-else-if="healthData">{{ healthData }}</pre>
    <p v-if="checkedAt" class="checked-at">Last check: {{ formatDateTime(checkedAt) }}</p>
  </section>
</template>

<style scoped>
section {
  padding: 12px 0;
}

button {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.error {
  color: #dc2626;
}

.checked-at {
  color: #6b7280;
}

pre {
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}
</style>
