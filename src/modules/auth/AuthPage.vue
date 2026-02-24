<template>
  <main class="auth-page">
    <div class="auth-shell">
      <RouterLink to="/" class="back-link">← Về trang khách hàng</RouterLink>
      <AuthPanel />
    </div>
  </main>
</template>

<script setup>
import AuthPanel from './components/AuthPanel.vue'
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 12px;
}

.auth-shell {
  width: min(920px, 100%);
}

.back-link {
  display: inline-block;
  margin: 0 0 12px;
  color: var(--text-main);
  text-decoration: none;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
