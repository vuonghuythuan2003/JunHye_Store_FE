<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from './modules/auth/useAuth'

onMounted(() => {
  useAuth().refreshUser()
})
</script>
