<template>
  <div class="min-h-screen bg-vintage-ivory p-4 lg:p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-2">Settings</h1>
      <p class="text-vintage-gray text-lg">Manage your application configuration and featured items</p>
    </div>

    <!-- Featured Items Management Section -->
    <div class="card-antique p-6 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-vintage-charcoal">Landing Page Featured Items</h2>
        <div class="flex items-center gap-3">
          <a 
            href="/" 
            target="_blank"
            class="btn-antique-secondary flex items-center gap-2"
          >
            <Eye class="w-4 h-4" />
            Preview Landing Page
          </a>
          <button 
            @click="saveFeaturedItems"
            :disabled="isSaving"
            class="btn-antique flex items-center gap-2"
          >
            <Save v-if="!isSaving" class="w-4 h-4" />
            <div v-else class="loading-spinner w-4 h-4"></div>
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Item Search and Selection -->
      <div class="mb-6">
        <div class="flex flex-col lg:flex-row gap-4 mb-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-vintage-charcoal mb-2">
              Search Items to Feature
            </label>
            <input
              v-model="itemSearch"
              @input="searchItems"
              type="text"
              placeholder="Search by name, friendly ID, or category..."
              class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal placeholder-vintage-gray"
            />
          </div>
          <div class="lg:w-48">
            <label class="block text-sm font-medium text-vintage-charcoal mb-2">
              Category Filter
            </label>
            <select
              v-model="selectedCategory"
              @change="filterItems"
              class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>

        <!-- Search Results -->
        <div v-if="filteredItems.length > 0" class="bg-vintage-ivory rounded-lg p-4 max-h-60 overflow-y-auto">
          <h3 class="font-medium text-vintage-charcoal mb-3">Available Items</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="item in filteredItems"
              :key="item.itemId"
              class="bg-white rounded-lg p-3 border border-vintage-beige hover:border-antique-gold transition-colors cursor-pointer"
              @click="addToFeatured(item)"
            >
              <div class="flex items-center gap-3">
                <img 
                  v-if="item.imageUrls && item.imageUrls.length > 0"
                  :src="item.imageUrls[0].url" 
                  :alt="item.itemName"
                  class="w-12 h-12 object-cover rounded-lg"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-vintage-charcoal truncate">{{ item.itemName }}</div>
                  <div class="text-sm text-vintage-gray">ID: {{ item.friendlyId }}</div>
                  <div class="text-sm text-vintage-gray">{{ item.category }}</div>
                </div>
                <Plus class="w-5 h-5 text-antique-gold" />
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="itemSearch.value || selectedCategory.value" class="bg-vintage-ivory rounded-lg p-4">
          <div class="text-center py-4 text-vintage-gray">
            <Package class="w-8 h-8 mx-auto mb-2 text-vintage-beige" />
            <p>No items found matching your search criteria</p>
          </div>
        </div>
      </div>

      <!-- Featured Items Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Section 1 -->
        <div class="bg-vintage-ivory rounded-lg p-4">
          <h3 class="font-medium text-vintage-charcoal mb-4 flex items-center gap-2">
            <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            First Carousel Section ({{ featuredItems.section1.length }}/12)
          </h3>
          
          <div 
            v-if="featuredItems.section1.length === 0"
            class="text-center py-8 text-vintage-gray"
          >
            <Package class="w-12 h-12 mx-auto mb-2 text-vintage-beige" />
            <p>No items selected for this section</p>
            <p class="text-sm">Search and add items above</p>
          </div>

          <draggable
            v-else
            v-model="featuredItems.section1"
            group="featured-items"
            item-key="itemId"
            class="space-y-2"
            @end="updateOrder(1)"
          >
            <template #item="{ element: item }">
              <div class="bg-white rounded-lg p-3 border border-vintage-beige hover:border-antique-gold transition-colors">
                <div class="flex items-center gap-3">
                  <GripVertical class="w-5 h-5 text-vintage-gray cursor-grab" />
                  <img 
                    v-if="item.imageUrls && item.imageUrls.length > 0"
                    :src="item.imageUrls[0].url" 
                    :alt="item.itemName"
                    class="w-12 h-12 object-cover rounded-lg"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-vintage-charcoal truncate">{{ item.itemName }}</div>
                    <div class="text-sm text-vintage-gray">ID: {{ item.friendlyId }}</div>
                    <div class="text-sm text-vintage-gray">{{ item.category }}</div>
                  </div>
                  <button
                    @click="removeFromFeatured(item, 1)"
                    class="text-red-600 hover:text-red-800 p-1"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <!-- Section 2 -->
        <div class="bg-vintage-ivory rounded-lg p-4">
          <h3 class="font-medium text-vintage-charcoal mb-4 flex items-center gap-2">
            <span class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Second Carousel Section ({{ featuredItems.section2.length }}/12)
          </h3>
          
          <div 
            v-if="featuredItems.section2.length === 0"
            class="text-center py-8 text-vintage-gray"
          >
            <Package class="w-12 h-12 mx-auto mb-2 text-vintage-beige" />
            <p>No items selected for this section</p>
            <p class="text-sm">Search and add items above</p>
          </div>

          <draggable
            v-else
            v-model="featuredItems.section2"
            group="featured-items"
            item-key="itemId"
            class="space-y-2"
            @end="updateOrder(2)"
          >
            <template #item="{ element: item }">
              <div class="bg-white rounded-lg p-3 border border-vintage-beige hover:border-antique-gold transition-colors">
                <div class="flex items-center gap-3">
                  <GripVertical class="w-5 h-5 text-vintage-gray cursor-grab" />
                  <img 
                    v-if="item.imageUrls && item.imageUrls.length > 0"
                    :src="item.imageUrls[0].url" 
                    :alt="item.itemName"
                    class="w-12 h-12 object-cover rounded-lg"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-vintage-charcoal truncate">{{ item.itemName }}</div>
                    <div class="text-sm text-vintage-gray">ID: {{ item.friendlyId }}</div>
                    <div class="text-sm text-vintage-gray">{{ item.category }}</div>
                  </div>
                  <button
                    @click="removeFromFeatured(item, 2)"
                    class="text-red-600 hover:text-red-800 p-1"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Settings View Component
 * 
 * Features:
 * - Manage landing page featured items
 * - Up to 12 items per section (increased from 10)
 * - Drag and drop reordering
 * - Search and filter functionality
 * - Real-time preview of landing page
 */
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useInventoryStore } from '@/stores/inventory'
import { 
  Settings, 
  Save, 
  Plus, 
  X, 
  Package, 
  GripVertical,
  Eye
} from 'lucide-vue-next'
import draggable from 'vuedraggable'
import type { InventoryItem } from '@/types'

// Composables
const toast = useToast()
const inventoryStore = useInventoryStore()

// Reactive state
const itemSearch = ref('')
const selectedCategory = ref('')
const isSaving = ref(false)
const allItems = ref<InventoryItem[]>([])
const categories = ref<string[]>([])

// Featured items organized by sections
const featuredItems = ref({
  section1: [] as InventoryItem[],
  section2: [] as InventoryItem[]
})

// Computed properties
const filteredItems = computed(() => {
  let items = allItems.value

  // Filter by search term
  if (itemSearch.value) {
    const searchTerm = itemSearch.value.toLowerCase()
    items = items.filter(item => 
      item.itemName.toLowerCase().includes(searchTerm) ||
      item.friendlyId.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    )
  }

  // Filter by category
  if (selectedCategory.value) {
    items = items.filter(item => item.category === selectedCategory.value)
  }

  // Exclude items that are already featured
  const featuredItemIds = [
    ...featuredItems.value.section1.map(item => item.itemId),
    ...featuredItems.value.section2.map(item => item.itemId)
  ]
  
  return items.filter(item => !featuredItemIds.includes(item.itemId))
})

// Methods
const searchItems = () => {
  // Search is handled by computed property
}

const filterItems = () => {
  // Filtering is handled by computed property
}

const addToFeatured = (item: InventoryItem) => {
  // Determine which section to add to (whichever has fewer items)
  const section1Count = featuredItems.value.section1.length
  const section2Count = featuredItems.value.section2.length
  
  if (section1Count < 12 && section1Count <= section2Count) {
    if (section1Count === 12) {
      toast.warning('Section 1 is full. Please remove an item first.')
      return
    }
    
    const newItem = {
      ...item,
      landing_page_section: 1,
      landing_page_order: section1Count + 1
    }
    
    featuredItems.value.section1.push(newItem)
    toast.success(`Added ${item.itemName} to Section 1`)
  } else if (section2Count < 12) {
    if (section2Count === 12) {
      toast.warning('Section 2 is full. Please remove an item first.')
      return
    }
    
    const newItem = {
      ...item,
      landing_page_section: 2,
      landing_page_order: section2Count + 1
    }
    
    featuredItems.value.section2.push(newItem)
    toast.success(`Added ${item.itemName} to Section 2`)
  } else {
    toast.warning('Both sections are full. Please remove items first.')
  }
}

const removeFromFeatured = (item: InventoryItem, section: number) => {
  if (section === 1) {
    const index = featuredItems.value.section1.findIndex(i => i.itemId === item.itemId)
    if (index > -1) {
      featuredItems.value.section1.splice(index, 1)
      // Update order for remaining items
      featuredItems.value.section1.forEach((item, idx) => {
        item.landing_page_order = idx + 1
      })
      toast.success(`Removed ${item.itemName} from Section 1`)
    }
  } else if (section === 2) {
    const index = featuredItems.value.section2.findIndex(i => i.itemId === item.itemId)
    if (index > -1) {
      featuredItems.value.section2.splice(index, 1)
      // Update order for remaining items
      featuredItems.value.section2.forEach((item, idx) => {
        item.landing_page_order = idx + 1
      })
      toast.success(`Removed ${item.itemName} from Section 2`)
    }
  }
}

const updateOrder = (section: number) => {
  // Update order for items in the specified section
  if (section === 1) {
    featuredItems.value.section1.forEach((item, idx) => {
      item.landing_page_order = idx + 1
    })
  } else if (section === 2) {
    featuredItems.value.section2.forEach((item, idx) => {
      item.landing_page_order = idx + 1
    })
  }
}

const saveFeaturedItems = async () => {
  try {
    isSaving.value = true
    
    // Prepare data for API
    const allFeaturedItems = [
      ...featuredItems.value.section1.map(item => ({
        itemId: item.itemId,
        featured_on_landing: true,
        landing_page_section: 1,
        landing_page_order: item.landing_page_order
      })),
      ...featuredItems.value.section2.map(item => ({
        itemId: item.itemId,
        featured_on_landing: true,
        landing_page_section: 2,
        landing_page_order: item.landing_page_order
      }))
    ]
    
    // Call API to update featured items
    const response = await fetch('/api/landing/featured-items', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ featuredItems: allFeaturedItems })
    })
    
    if (response.ok) {
      toast.success('Featured items saved successfully!')
    } else {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save featured items')
    }
  } catch (error) {
    console.error('Error saving featured items:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to save featured items')
  } finally {
    isSaving.value = false
  }
}

const loadFeaturedItems = async () => {
  try {
    const response = await fetch('/api/landing/featured-items')
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        featuredItems.value.section1 = data.data.section1 || []
        featuredItems.value.section2 = data.data.section2 || []
      }
    }
  } catch (error) {
    console.error('Error loading featured items:', error)
  }
}

const loadInventoryData = async () => {
  try {
    // Load categories first (public endpoint)
    const categoriesResponse = await fetch('/api/categories')
    if (categoriesResponse.ok) {
      const data = await categoriesResponse.json()
      if (data.success) {
        categories.value = data.data || []
      }
    } else {
      console.warn('Failed to load categories, using empty array')
      categories.value = []
    }
    
    // Load all inventory items for search functionality
    await inventoryStore.fetchAllAvailableItems()
    allItems.value = inventoryStore.items || []
    
  } catch (error) {
    console.error('Error loading inventory data:', error)
    toast.error('Failed to load inventory data')
    categories.value = []
    allItems.value = []
  }
}

// Lifecycle
onMounted(async () => {
  await loadInventoryData()
  await loadFeaturedItems()
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

.btn-antique {
  @apply bg-antique-gold text-white px-4 py-2 rounded-lg font-medium hover:bg-antique-bronze transition-colors;
}

.card-antique {
  @apply bg-white rounded-lg shadow-sm border border-vintage-beige;
}
</style> 