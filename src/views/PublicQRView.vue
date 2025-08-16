<template>
  <div class="min-h-screen bg-gradient-to-br from-vintage-ivory via-vintage-cream to-vintage-beige">
    <!-- Simple Test Header -->
    <div class="bg-white shadow-sm border-b border-vintage-beige p-8">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-3xl font-display text-vintage-charcoal mb-4">QR Code Test</h1>
        <p class="text-vintage-gray">Testing QR Code View Component</p>
        <p class="text-sm text-vintage-gray mt-2">Item ID: {{ route.params.id }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-96">
      <div class="text-center">
        <div class="loading-spinner w-12 h-12 mx-auto mb-4"></div>
        <p class="text-vintage-gray">Loading item details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <h2 class="text-2xl font-display text-vintage-charcoal mb-2">Error Loading Item</h2>
        <p class="text-vintage-gray mb-6">{{ error }}</p>
        <div class="bg-red-50 p-4 rounded-lg text-left">
          <p class="text-sm text-red-800">Debug Info:</p>
          <p class="text-xs text-red-600">Route: {{ route.path }}</p>
          <p class="text-xs text-red-600">Item ID: {{ route.params.id }}</p>
        </div>
      </div>
    </div>

    <!-- Item Details -->
    <div v-else-if="item" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-2xl p-8 shadow-lg">
        <h2 class="text-2xl font-display text-vintage-charcoal mb-4">{{ item.itemName }}</h2>
        <p class="text-vintage-gray mb-4">{{ item.descripcionArticulo }}</p>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-vintage-charcoal">Category:</span>
            <span class="text-vintage-gray ml-2">{{ item.category }}</span>
          </div>
          <div>
            <span class="font-medium text-vintage-charcoal">Price:</span>
            <span class="text-vintage-gray ml-2">${{ formatCurrency(item.unitPrice) }}</span>
          </div>
          <div>
            <span class="font-medium text-vintage-charcoal">Status:</span>
            <span class="text-vintage-gray ml-2">{{ item.status }}</span>
          </div>
          <div>
            <span class="font-medium text-vintage-charcoal">Images:</span>
            <span class="text-vintage-gray ml-2">{{ item.imageUrls.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="font-medium text-gray-800 mb-2">Debug Information</h3>
        <div class="text-sm text-gray-600 space-y-1">
          <p>Route: {{ route.path }}</p>
          <p>Item ID: {{ route.params.id }}</p>
          <p>Loading: {{ isLoading }}</p>
          <p>Error: {{ error }}</p>
          <p>Item Data: {{ item ? 'Loaded' : 'Not Loaded' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// Types
interface PublicItem {
  itemId: string
  itemName: string
  descripcionArticulo?: string
  category: string
  unitPrice: number
  status: string
  imageUrls: Array<{
    url: string
    fileName: string
    originalName: string
  }>
}

// Composables
const route = useRoute()

// Reactive state
const isLoading = ref(true)
const error = ref<string | null>(null)
const item = ref<PublicItem | null>(null)

// Methods
const loadItem = async () => {
  try {
    console.log('=== loadItem called ===')
    console.log('Route params:', route.params)
    console.log('Item ID:', route.params.id)
    
    isLoading.value = true
    error.value = null
    
    const itemId = route.params.id as string
    console.log('Loading item with ID:', itemId)
    
    // Fetch item data from the QR data endpoint (not the view endpoint)
    const response = await fetch(`/api/qr/${itemId}/data`)
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Item not found')
      }
      throw new Error(`Failed to load item: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('Response data:', result)
    
    if (result.success && result.data) {
      item.value = result.data
      console.log('Item loaded successfully:', item.value)
    } else {
      throw new Error(result.error || 'Failed to load item')
    }
  } catch (err) {
    console.error('Error loading item:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load item'
  } finally {
    isLoading.value = false
    console.log('Loading completed. Error:', error.value, 'Item:', !!item.value)
  }
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })
}

// Lifecycle
onMounted(() => {
  console.log('=== PublicQRView mounted ===')
  console.log('Route:', route.path)
  console.log('Params:', route.params)
  loadItem()
})
</script>

<style scoped>
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 