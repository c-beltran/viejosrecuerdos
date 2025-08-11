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
            Are you sure you want to delete <strong>"{{ itemToDelete?.itemName }}"</strong>?
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
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div>
        <h1 class="font-display text-3xl text-vintage-charcoal mb-2">Inventory Management</h1>
        <p class="text-vintage-gray">Manage your antique collection with ease</p>
      </div>
      <div class="flex items-center space-x-3 mt-4 lg:mt-0">
        <button 
          @click="toggleViewMode" 
          class="btn-antique-secondary"
          title="Toggle view mode"
        >
          <Grid v-if="viewMode === 'list'" class="w-4 h-4" />
          <List v-else class="w-4 h-4" />
        </button>
        <button 
          @click="showFilters = !showFilters" 
          class="btn-antique-secondary"
          :class="{ 'bg-antique-gold text-white': showFilters }"
        >
          <Filter class="w-4 h-4 mr-2" />
          Filters
        </button>
        <button 
          @click="router.push('/inventory/new')" 
          class="btn-antique"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Item
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card-antique p-6 mb-6">
      <!-- Search Bar -->
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-vintage-gray w-5 h-5" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search items by name, description, category, or friendly ID (e.g., M0001)..."
          class="w-full pl-10 pr-4 py-3 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent"
          @input="handleSearch"
        />
      </div>

      <!-- Filters -->
      <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-vintage-charcoal mb-2">Category</label>
          <select 
            v-model="filters.category" 
            @change="applyFilters"
            class="w-full px-3 py-2 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-vintage-charcoal mb-2">Status</label>
          <select 
            v-model="filters.status" 
            @change="applyFilters"
            class="w-full px-3 py-2 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Sold-Out">Sold Out</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-vintage-charcoal mb-2">Price Range</label>
          <div class="flex space-x-2">
            <input
              v-model="filters.minPrice"
              type="number"
              placeholder="Min"
              class="flex-1 px-3 py-2 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent"
              @input="applyFilters"
            />
            <input
              v-model="filters.maxPrice"
              type="number"
              placeholder="Max"
              class="flex-1 px-3 py-2 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent"
              @input="applyFilters"
            />
          </div>
        </div>
        <div class="flex items-end">
          <button 
            @click="clearFilters" 
            class="w-full btn-antique-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="card-antique p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Package class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-vintage-gray">Total Items</p>
            <p class="text-xl font-semibold text-vintage-charcoal">{{ stats.totalItems }}</p>
          </div>
        </div>
      </div>
      <div class="card-antique p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-vintage-gray">Available</p>
            <p class="text-xl font-semibold text-vintage-charcoal">{{ stats.availableItems }}</p>
          </div>
        </div>
      </div>
      <div class="card-antique p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
            <XCircle class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="text-sm text-vintage-gray">Sold Out</p>
            <p class="text-xl font-semibold text-vintage-charcoal">{{ stats.soldOutItems }}</p>
          </div>
        </div>
      </div>
      <div class="card-antique p-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
            <AlertTriangle class="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p class="text-sm text-vintage-gray">Low Stock</p>
            <p class="text-xl font-semibold text-vintage-charcoal">{{ stats.lowStockItems }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="loading-spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-vintage-gray">Loading inventory...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card-antique p-8 text-center">
      <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-vintage-charcoal mb-2">Error Loading Inventory</h3>
      <p class="text-vintage-gray mb-4">{{ error }}</p>
      <button @click="loadInventory" class="btn-antique">Try Again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredItems.length === 0" class="card-antique p-8 text-center">
      <Package class="w-12 h-12 text-vintage-gray mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-vintage-charcoal mb-2">
        {{ searchQuery || Object.values(filters).some(f => f) ? 'No items found' : 'No inventory items yet' }}
      </h3>
      <p class="text-vintage-gray mb-4">
        {{ searchQuery || Object.values(filters).some(f => f) 
          ? 'Try adjusting your search or filters' 
          : 'Start building your antique collection by adding your first item' }}
      </p>
      <button 
        v-if="!searchQuery && !Object.values(filters).some(f => f)"
        @click="router.push('/inventory/new')" 
        class="btn-antique"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Your First Item
      </button>
    </div>

    <!-- Inventory Items -->
    <div v-else>
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="item in paginatedItems" 
          :key="item.itemId"
          class="card-antique overflow-hidden group"
        >
          <!-- Item Image -->
          <div class="relative h-48 bg-vintage-beige overflow-hidden">
            <img 
              v-if="getFirstValidImage(item.imageUrls)"
                              :src="getFirstValidImage(item.imageUrls)?.url" 
              :alt="item.itemName"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Package class="w-12 h-12 text-vintage-gray" />
            </div>
            <!-- Quick Actions -->
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button 
                @click="router.push(`/inventory/${item.itemId}`)"
                class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="View Details"
              >
                <Eye class="w-4 h-4 text-vintage-charcoal" />
              </button>
              <button 
                @click="router.push(`/inventory/${item.itemId}/edit`)"
                class="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                title="Edit Item"
              >
                <Edit class="w-4 h-4 text-vintage-charcoal" />
              </button>
              <button 
                @click="deleteItem(item)"
                class="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                title="Delete Item"
              >
                <Trash2 class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          
          <!-- Item Info -->
          <div class="p-4">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-mono text-vintage-gray bg-vintage-beige px-2 py-1 rounded">{{ item.friendlyId }}</span>
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
            </div>
            <h3 class="font-semibold text-vintage-charcoal mb-1 truncate">{{ item.itemName }}</h3>
            <p class="text-sm text-vintage-gray mb-2">{{ item.category }}</p>
            <div class="flex items-center justify-between mb-2">
              <span class="text-lg font-semibold text-antique-gold">${{ formatPrice(item.unitPrice) }}</span>
              <span class="text-sm text-vintage-gray">Qty: {{ item.currentQuantity }}</span>
            </div>
            <p v-if="item.descripcionArticulo" class="text-sm text-vintage-gray line-clamp-2">
              {{ item.descripcionArticulo }}
            </p>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="card-antique overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-vintage-beige">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Item
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Price
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-vintage-beige">
              <tr 
                v-for="item in paginatedItems" 
                :key="item.itemId"
                class="hover:bg-vintage-beige/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-vintage-beige rounded-lg overflow-hidden mr-3">
                      <img 
                        v-if="getFirstValidImage(item.imageUrls)"
                        :src="getFirstValidImage(item.imageUrls)?.url" 
                        :alt="item.itemName"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <Package class="w-5 h-5 text-vintage-gray" />
                      </div>
                    </div>
                    <div>
                      <div class="font-medium text-vintage-charcoal">{{ item.itemName }}</div>
                      <div v-if="item.descripcionArticulo" class="text-sm text-vintage-gray truncate max-w-xs">
                        {{ item.descripcionArticulo }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-vintage-charcoal">{{ item.category }}</td>
                <td class="px-6 py-4 text-sm font-semibold text-antique-gold">${{ formatPrice(item.unitPrice) }}</td>
                <td class="px-6 py-4 text-sm text-vintage-charcoal">{{ item.currentQuantity }}</td>
                <td class="px-6 py-4">
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
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="router.push(`/inventory/${item.itemId}`)"
                      class="text-vintage-gray hover:text-antique-gold transition-colors"
                      title="View Details"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                    <button 
                      @click="router.push(`/inventory/${item.itemId}/edit`)"
                      class="text-vintage-gray hover:text-antique-gold transition-colors"
                      title="Edit Item"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    <button 
                      @click="deleteItem(item)"
                      class="text-red-500 hover:text-red-600 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
        <div class="text-sm text-vintage-gray">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredItems.length) }} of {{ filteredItems.length }} items
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm border border-vintage-beige rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vintage-beige transition-colors"
          >
            Previous
          </button>
          <span class="px-3 py-2 text-sm text-vintage-charcoal">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button 
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm border border-vintage-beige rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-vintage-beige transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useInventoryStore } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'
import { 
  Search, 
  Plus, 
  Filter, 
  Grid, 
  List, 
  Package, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle
} from 'lucide-vue-next'
import type { InventoryItem, InventoryFilters } from '@/types'

// Composables
const router = useRouter()
const toast = useToast()
const inventoryStore = useInventoryStore()
const authStore = useAuthStore()

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)
const hasLoadedInventory = ref(false)
const searchQuery = ref('')
const showFilters = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const itemsPerPage = ref(12)

// Delete modal state
const showDeleteModal = ref(false)
const itemToDelete = ref<InventoryItem | null>(null)
const isDeleting = ref(false)

// Filters
const filters = ref<InventoryFilters>({
  category: '',
  status: '',
  minPrice: undefined,
  maxPrice: undefined
})

// Computed properties
const items = computed(() => inventoryStore.items)
const categories = computed(() => [
  'Mobiliario', 'Porcelana', 'Cristal', 'Joyeria', 'Arte', 'Libros', 
  'Textiles', 'Decoracion', 'Herramientas', 'Musica', 'Relojes', 'Otros'
])

const filteredItems = computed(() => {
  let filtered = [...items.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.itemName.toLowerCase().includes(query) ||
      item.descripcionArticulo?.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (filters.value.category) {
    filtered = filtered.filter(item => item.category === filters.value.category)
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter(item => item.status === filters.value.status)
  }

  // Price range filter
  if (filters.value.minPrice !== undefined) {
    filtered = filtered.filter(item => item.unitPrice >= filters.value.minPrice!)
  }
  if (filters.value.maxPrice !== undefined) {
    filtered = filtered.filter(item => item.unitPrice <= filters.value.maxPrice!)
  }

  return filtered
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value))

const stats = computed(() => {
  const items = inventoryStore.items
  return {
    totalItems: items.length,
    availableItems: items.filter(item => item.status === 'Available').length,
    soldOutItems: items.filter(item => item.status === 'Sold-Out').length,
    lowStockItems: items.filter(item => item.currentQuantity <= 3).length
  }
})

// Methods
const loadInventory = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    await inventoryStore.fetchItems()
    hasLoadedInventory.value = true
  } catch (err) {
    console.error('Error loading inventory:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load inventory'
    toast.error('Failed to load inventory items')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    category: '',
    status: '',
    minPrice: undefined,
    maxPrice: undefined
  }
  searchQuery.value = ''
  currentPage.value = 1
  // Reset inventory state when filters are cleared
  hasLoadedInventory.value = false
  loadInventory()
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

const deleteItem = (item: InventoryItem) => {
  itemToDelete.value = item
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  itemToDelete.value = null
  isDeleting.value = false
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return

  try {
    isDeleting.value = true
    
    // Add a timeout to prevent hanging
    const deletePromise = inventoryStore.deleteItem(itemToDelete.value.itemId)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Delete operation timed out')), 10000)
    )
    
    await Promise.race([deletePromise, timeoutPromise])
    
    toast.success('Item deleted successfully')
    
    // Close modal and reset state
    cancelDelete()
    
    // Optionally refresh the inventory list to ensure consistency
    await loadInventory()
    
  } catch (err) {
    if (err.message === 'Delete operation timed out') {
      toast.error('Delete operation timed out. Please try again.')
    } else {
      toast.error('Failed to delete item')
    }
  } finally {
    isDeleting.value = false
  }
}

const formatPrice = (price: number | undefined) => {
  if (price === undefined || price === null) return '0.00'
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getFirstValidImage = (imageUrls: any[] | undefined) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return null
  
  // Find the first valid image object with simplified structure
  const validImage = imageUrls.find(img => 
    img && typeof img === 'object' && img.url && img.fileName
  )
  
  return validImage || null
}

// Watchers
watch([searchQuery, filters], () => {
  currentPage.value = 1
  // Reload inventory when filters change significantly
  if (hasLoadedInventory.value) {
    loadInventory()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Only load inventory if it's not already loaded
  if (!hasLoadedInventory.value) {
    loadInventory()
  }
})

// Watch for route changes to reload inventory when navigating back
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/inventory' && !hasLoadedInventory.value) {
    loadInventory()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 