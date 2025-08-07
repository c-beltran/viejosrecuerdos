<template>
  <div class="min-h-screen bg-vintage-ivory flex items-center justify-center p-4">
    <div class="card-antique p-8 text-center max-w-md">
      <div class="w-20 h-20 bg-antique-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <span class="text-4xl font-handwriting text-antique-gold">404</span>
      </div>
      <h1 class="font-display text-2xl text-vintage-charcoal mb-4">Page Not Found</h1>
      <p class="text-vintage-gray mb-6">
        The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <router-link 
        to="/dashboard" 
        class="btn-antique inline-flex items-center"
      >
        <Home class="w-4 h-4 mr-2" />
        Go to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Home } from 'lucide-vue-next'
</script> 