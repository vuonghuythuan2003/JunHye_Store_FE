<template>
  <div class="connection-test">
    <h2>Kiểm tra kết nối Frontend - Backend</h2>
    
    <div class="test-section">
      <h3>1. Kiểm tra Backend Health</h3>
      <button @click="testBackendHealth" :disabled="testing">
        {{ testing ? 'Đang kiểm tra...' : 'Test Backend' }}
      </button>
      <div v-if="healthResult" class="result" :class="healthResult.success ? 'success' : 'error'">
        <pre>{{ JSON.stringify(healthResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="test-section">
      <h3>2. Kiểm tra CORS</h3>
      <p>CORS đã được cấu hình cho: http://localhost:5173</p>
      <p v-if="corsTest" class="result" :class="corsTest.success ? 'success' : 'error'">
        {{ corsTest.message }}
      </p>
    </div>

    <div class="test-section">
      <h3>3. Thông tin kết nối</h3>
      <ul>
        <li><strong>Backend URL:</strong> {{ backendUrl }}</li>
        <li><strong>Frontend URL:</strong> {{ frontendUrl }}</li>
        <li><strong>OAuth Google URL:</strong> {{ oauthGoogleUrl }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHealth } from '../api/health.api'
import { env } from '../core/config/env'

const testing = ref(false)
const healthResult = ref(null)
const corsTest = ref(null)

const backendUrl = ref(env.apiBaseUrl)
const frontendUrl = ref(window.location.origin)
const oauthGoogleUrl = ref(env.oauthGoogleUrl)

const testBackendHealth = async () => {
  testing.value = true
  healthResult.value = null
  
  try {
    const result = await getHealth()
    healthResult.value = {
      success: true,
      data: result,
      message: 'Kết nối Backend thành công!'
    }
    corsTest.value = {
      success: true,
      message: 'CORS hoạt động bình thường'
    }
  } catch (error) {
    healthResult.value = {
      success: false,
      error: error.message,
      message: 'Không thể kết nối đến Backend'
    }
    corsTest.value = {
      success: false,
      message: 'CORS có thể bị chặn hoặc Backend không chạy'
    }
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  testBackendHealth()
})
</script>

<style scoped>
.connection-test {
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card-bg);
}

.test-section {
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
}

.test-section h3 {
  margin-top: 0;
}

button {
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #6366f1;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
}

.result.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #16a34a;
}

.result.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #dc2626;
}

.result pre {
  margin: 0;
  font-size: 0.9rem;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

li:last-child {
  border-bottom: none;
}
</style>
