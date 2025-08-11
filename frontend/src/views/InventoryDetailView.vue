<template>
  <div class="p-6">
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="cancelDelete"></div>
      <div class="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
        <div class="text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="font-display text-lg text-vintage-charcoal mb-2">Delete Item</h3>
          <p class="text-vintage-gray mb-4">
            Are you sure you want to delete <strong>"{{ item?.itemName }}"</strong>?
          </p>
          <p class="text-sm text-red-600 mb-6">
            This action cannot be undone. All associated images and data will be permanently removed.
          </p>
          <div class="flex space-x-3">
            <button 
              @click="cancelDelete" 
              class="flex-1 px-4 py-2 text-vintage-gray border border-vintage-beige rounded-lg hover:bg-vintage-beige transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="confirmDelete" 
              class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              :disabled="isDeleting"
            >
              <div v-if="isDeleting" class="loading-spinner w-4 h-4 mx-auto"></div>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-display text-3xl text-vintage-charcoal mb-2">Item Details</h1>
        <p class="text-vintage-gray">View and manage your antique item</p>
      </div>
      <div class="flex items-center space-x-3">
        <button 
          @click="generateQRCode" 
          class="btn-antique-secondary"
          :disabled="isGeneratingQR"
        >
          <QrCode v-if="!isGeneratingQR" class="w-4 h-4 mr-2" />
          <div v-else class="loading-spinner w-4 h-4 mr-2"></div>
          {{ isGeneratingQR ? 'Generating...' : 'Generate QR' }}
        </button>
        <button 
          @click="router.push(`/inventory/${itemId}/edit`)" 
          class="btn-antique-secondary"
        >
          <Edit class="w-4 h-4 mr-2" />
          Edit
        </button>
        <button 
          @click="router.push('/inventory')" 
          class="btn-antique-secondary"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="loading-spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-vintage-gray">Loading item details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card-antique p-8 text-center">
      <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-vintage-charcoal mb-2">Error Loading Item</h3>
      <p class="text-vintage-gray mb-4">{{ error }}</p>
      <button @click="loadItem" class="btn-antique">Try Again</button>
    </div>

    <!-- Item Details -->
    <div v-else-if="item" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Image Gallery -->
        <div class="card-antique p-6">
          <h2 class="font-display text-xl text-vintage-charcoal mb-4">Images</h2>
          <div v-if="getValidImages(item.imageUrls).length > 0" class="space-y-4">
            <!-- Main Image -->
            <div class="relative">
              <img 
                :src="selectedImage.url" 
                :alt="item.itemName"
                class="w-full h-96 object-cover rounded-lg"
              />
              <!-- Image Navigation -->
              <div v-if="getValidImages(item.imageUrls).length > 1" class="absolute inset-0 flex items-center justify-between p-4">
                <button 
                  @click="previousImage"
                  class="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft class="w-5 h-5" />
                </button>
                <button 
                  @click="nextImage"
                  class="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight class="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <!-- Thumbnail Gallery -->
            <div v-if="getValidImages(item.imageUrls).length > 1" class="flex space-x-2 overflow-x-auto">
              <button
                v-for="(image, index) in getValidImages(item.imageUrls)"
                :key="index"
                @click="selectedImageIndex = index"
                class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors"
                :class="selectedImageIndex === index ? 'border-antique-gold' : 'border-vintage-beige'"
              >
                <img 
                  :src="image.url" 
                  :alt="`${item.itemName} - Image ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <Package class="w-16 h-16 text-vintage-gray mx-auto mb-4" />
            <p class="text-vintage-gray">No images available</p>
          </div>
        </div>

        <!-- Item Information -->
        <div class="card-antique p-6">
          <h2 class="font-display text-xl text-vintage-charcoal mb-4">Item Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-vintage-charcoal mb-2">Basic Details</h3>
              <dl class="space-y-2">
                <div>
                  <dt class="text-sm text-vintage-gray">Friendly ID</dt>
                  <dd class="text-vintage-charcoal font-mono font-medium bg-vintage-beige px-2 py-1 rounded inline-block">{{ item.friendlyId }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-vintage-gray">Name</dt>
                  <dd class="text-vintage-charcoal font-medium">{{ item.itemName }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-vintage-gray">Category</dt>
                  <dd class="text-vintage-charcoal">{{ item.category }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-vintage-gray">Status</dt>
                  <dd>
                    <span 
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        item.status === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ item.status }}
                    </span>
                  </dd>
                </div>
                <div v-if="item.descripcionArticulo">
                  <dt class="text-sm text-vintage-gray">Description</dt>
                  <dd class="text-vintage-charcoal">{{ item.descripcionArticulo }}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 class="font-semibold text-vintage-charcoal mb-2">Pricing & Inventory</h3>
              <dl class="space-y-2">
                <div>
                  <dt class="text-sm text-vintage-gray">Unit Price</dt>
                  <dd class="text-2xl font-semibold text-antique-gold">${{ formatPrice(item?.unitPrice) }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-vintage-gray">Total Value</dt>
                  <dd class="text-lg font-semibold text-vintage-charcoal">${{ formatPrice(item?.totalPrice) }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-vintage-gray">Initial Quantity</dt>
                  <dd class="text-vintage-charcoal">{{ item?.initialQuantity || 0 }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-vintage-gray">Current Quantity</dt>
                  <dd class="text-vintage-charcoal">{{ item?.currentQuantity || 0 }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-vintage-gray">Items Sold</dt>
                  <dd class="text-vintage-charcoal">{{ (item?.initialQuantity || 0) - (item?.currentQuantity || 0) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- Internal Notes -->
        <div v-if="item.internalNotes" class="card-antique p-6">
          <h2 class="font-display text-xl text-vintage-charcoal mb-4">Internal Notes</h2>
          <p class="text-vintage-charcoal">{{ item.internalNotes }}</p>
        </div>

        <!-- Item History -->
        <div class="card-antique p-6">
          <h2 class="font-display text-xl text-vintage-charcoal mb-4">Item History</h2>
          <dl class="space-y-2">
            <div>
              <dt class="text-sm text-vintage-gray">Created</dt>
              <dd class="text-vintage-charcoal">{{ formatDate(item.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-vintage-gray">Last Modified</dt>
              <dd class="text-vintage-charcoal">{{ formatDate(item.updatedAt) }}</dd>
            </div>
            <div v-if="item.lastModifiedBy">
              <dt class="text-sm text-vintage-gray">Last Modified By</dt>
              <dd class="text-vintage-charcoal">{{ item.lastModifiedBy }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- QR Code -->
        <div v-if="item.qrCodeUrl" class="card-antique p-6">
          <h2 class="font-display text-xl text-vintage-charcoal mb-4">QR Code</h2>
          <div class="text-center">
            <img 
              :src="item.qrCodeUrl" 
              :alt="`QR Code for ${item.itemName}`"
              class="w-48 h-48 mx-auto mb-4"
            />
            <button 
              @click="downloadQRCode"
              class="btn-antique-secondary w-full"
            >
              <Download class="w-4 h-4 mr-2" />
              Download QR Code
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card-antique p-6">
          <h2 class="font-display text-xl text-vintage-charcoal mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button 
              @click="router.push(`/inventory/${itemId}/edit`)" 
              class="w-full btn-antique-secondary"
            >
              <Edit class="w-4 h-4 mr-2" />
              Edit Item
            </button>
            <button 
              @click="router.push('/sales/new')" 
              class="w-full btn-antique"
              :disabled="item.status === 'Sold-Out'"
            >
              <ShoppingCart class="w-4 h-4 mr-2" />
              Sell Item
            </button>
            <button 
              @click="deleteItem"
              class="w-full btn-antique-secondary text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 class="w-4 h-4 mr-2" />
              Delete Item
            </button>
          </div>
        </div>

        <!-- Stock Alert -->
        <div v-if="item.currentQuantity <= 3" class="card-antique p-6 border-l-4 border-yellow-400">
          <div class="flex items-start">
            <AlertTriangle class="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h3 class="font-semibold text-vintage-charcoal mb-1">Low Stock Alert</h3>
              <p class="text-sm text-vintage-gray">
                Only {{ item.currentQuantity }} item{{ item.currentQuantity !== 1 ? 's' : '' }} remaining
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useInventoryStore } from '@/stores/inventory'
import { 
  ArrowLeft, 
  Edit, 
  QrCode, 
  Download, 
  ShoppingCart, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Package
} from 'lucide-vue-next'
import type { InventoryItem } from '@/types'

// Composables
const router = useRouter()
const route = useRoute()
const toast = useToast()
const inventoryStore = useInventoryStore()

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)
const item = ref<InventoryItem | null>(null)
const selectedImageIndex = ref(0)
const isGeneratingQR = ref(false)

// Delete modal state
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Computed properties
const itemId = computed(() => route.params.id as string)

const selectedImage = computed(() => {
  const validImages = getValidImages(item.value?.imageUrls)
  if (validImages.length === 0) {
    return { original: '', thumbnail: '' }
  }
  return validImages[selectedImageIndex.value] || validImages[0]
})

// Methods
const loadItem = async () => {
  try {
    isLoading.value = true
    error.value = null
    console.log('Loading item with ID:', itemId.value)
    const loadedItem = await inventoryStore.fetchItem(itemId.value)
    console.log('Loaded item:', loadedItem)
    if (loadedItem) {
      item.value = loadedItem
      console.log('Item set in component:', item.value)
    } else {
      error.value = 'Item not found'
    }
  } catch (err) {
    console.error('Error loading item:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load item'
    toast.error('Failed to load item details')
  } finally {
    isLoading.value = false
  }
}

const nextImage = () => {
  const validImages = getValidImages(item.value?.imageUrls)
  if (validImages.length === 0) return
  selectedImageIndex.value = (selectedImageIndex.value + 1) % validImages.length
}

const previousImage = () => {
  const validImages = getValidImages(item.value?.imageUrls)
  if (validImages.length === 0) return
  selectedImageIndex.value = selectedImageIndex.value === 0 
    ? validImages.length - 1 
    : selectedImageIndex.value - 1
}

const generateQRCode = async () => {
  if (!item.value) return

  try {
    isGeneratingQR.value = true
    await inventoryStore.generateQRCode(item.value.itemId)
    toast.success('QR code generated successfully')
    // Reload item to get the new QR code URL
    await loadItem()
  } catch (err) {
    toast.error('Failed to generate QR code')
  } finally {
    isGeneratingQR.value = false
  }
}

const downloadQRCode = () => {
  if (!item.value?.qrCodeUrl) return

  const link = document.createElement('a')
  link.href = item.value.qrCodeUrl
  link.download = `qr-${item.value.itemName.replace(/\s+/g, '-').toLowerCase()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const deleteItem = () => {
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  isDeleting.value = false
}

const confirmDelete = async () => {
  if (!item.value) return

  try {
    isDeleting.value = true
    await inventoryStore.deleteItem(item.value.itemId)
    toast.success('Item deleted successfully')
    router.push('/inventory')
  } catch (err) {
    toast.error('Failed to delete item')
  } finally {
    isDeleting.value = false
  }
}

const formatPrice = (price: number | undefined) => {
  if (price === undefined || price === null) return '0.00'
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getValidImages = (imageUrls: any[] | undefined) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return []
  
  // Filter out strings and return only valid image objects with simplified structure
  return imageUrls.filter(img => 
    img && typeof img === 'object' && img.url && img.fileName
  )
}

// Lifecycle
onMounted(() => {
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