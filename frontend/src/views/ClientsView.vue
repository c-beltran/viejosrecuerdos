<template>
  <div class="min-h-screen bg-vintage-ivory p-4 lg:p-8">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-2">
            Client Management
          </h1>
          <p class="text-vintage-gray text-lg">
            Manage your client relationships and track interactions
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="openClientForm()"
            class="btn-primary flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>
    </div>



    <!-- Search -->
    <div class="card-antique p-6 mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search Bar -->
        <div class="flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-vintage-gray w-4 h-4" />
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Search clients by name, email, or phone..."
              class="w-full pl-10 pr-4 py-3 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent bg-white"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-vintage-gray hover:text-vintage-charcoal"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>


      </div>


    </div>

    <!-- Client Grid/List Toggle and Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' 
                ? 'bg-antique-gold text-white' 
                : 'text-vintage-gray hover:bg-vintage-beige'
            ]"
          >
            <Grid class="w-5 h-5" />
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' 
                ? 'bg-antique-gold text-white' 
                : 'text-vintage-gray hover:bg-vintage-beige'
            ]"
          >
            <List class="w-5 h-5" />
          </button>
        </div>
        <span class="text-sm text-vintage-gray">
          {{ filteredClients.length }} of {{ totalClients }} clients
        </span>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedClients.length > 0" class="flex items-center gap-3">
        <span class="text-sm text-vintage-gray">
          {{ selectedClients.length }} selected
        </span>
        <button
          @click="exportSelectedClients"
          class="btn-secondary text-sm"
        >
          Export Selected
        </button>
        <button
          @click="bulkDeleteClients"
          class="btn-danger text-sm"
        >
          Delete Selected
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
              <div class="loading-spinner w-8 h-8 border-4 border-vintage-beige border-t-antique-gold rounded-full"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card-antique p-8 text-center">
      <AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-vintage-charcoal mb-2">Error Loading Clients</h3>
      <p class="text-vintage-gray mb-4">{{ error }}</p>
      <button @click="loadClients" class="btn-primary">Try Again</button>
    </div>

    <!-- Client Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="client in paginatedClients"
        :key="client.clientId"
        class="card-antique p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        @click="openClientDetail(client)"
      >
        <!-- Client Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="font-semibold text-vintage-charcoal text-lg mb-1 group-hover:text-antique-gold transition-colors">
              {{ client.name }}
            </h3>
            <p v-if="client.email" class="text-vintage-gray text-sm truncate">
              {{ client.email }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              :checked="selectedClients.includes(client.clientId)"
              @change="toggleClientSelection(client.clientId)"
              @click.stop
              class="w-4 h-4 text-vintage-gold focus:ring-vintage-gold border-vintage-beige rounded"
            />
            <div class="relative">
              <button
                @click.stop="openClientMenu(client, $event)"
                class="p-1 text-vintage-gray hover:text-vintage-charcoal transition-colors"
              >
                <MoreVertical class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Client Info -->
        <div class="space-y-2 mb-4">
          <div v-if="client.phone" class="flex items-center gap-2 text-sm text-vintage-gray">
            <Phone class="w-4 h-4" />
            {{ client.phone }}
          </div>
          <div v-if="client.address" class="flex items-start gap-2 text-sm text-vintage-gray">
            <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span class="line-clamp-2">{{ client.address }}</span>
          </div>
        </div>

        <!-- Client Meta -->
        <div class="flex items-center justify-between text-xs text-vintage-gray">
          <span>Created {{ formatDate(client.createdAt) }}</span>
          <span v-if="client.notes" class="flex items-center gap-1">
            <FileText class="w-3 h-3" />
            Has notes
          </span>
        </div>

        <!-- Quick Actions -->
        <div class="mt-4 pt-4 border-t border-vintage-beige opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="flex gap-2">
            <button
              @click.stop="editClient(client)"
              class="w-full btn-secondary text-xs py-2"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Client List View -->
    <div v-else class="card-antique overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-vintage-beige">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="w-4 h-4 text-antique-gold focus:ring-antique-gold border-vintage-beige rounded"
                />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Contact
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Last Updated
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-vintage-beige">
            <tr
              v-for="client in paginatedClients"
              :key="client.clientId"
              class="hover:bg-vintage-ivory transition-colors cursor-pointer"
              @click="openClientDetail(client)"
            >
              <td class="px-6 py-4 whitespace-nowrap" @click.stop>
                <input
                  type="checkbox"
                  :checked="selectedClients.includes(client.clientId)"
                  @change="toggleClientSelection(client.clientId)"
                  class="w-4 h-4 text-antique-gold focus:ring-antique-gold border-vintage-beige rounded"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-vintage-charcoal">{{ client.name }}</div>
                  <div v-if="client.notes" class="text-sm text-vintage-gray truncate max-w-xs">
                    {{ client.notes }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-vintage-charcoal">
                  <div v-if="client.email">{{ client.email }}</div>
                  <div v-if="client.phone" class="text-vintage-gray">{{ client.phone }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-gray">
                {{ formatDate(client.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-gray">
                {{ formatDate(client.updatedAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click.stop="editClient(client)"
                    class="text-antique-gold hover:text-vintage-charcoal transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    @click.stop="openClientDetail(client)"
                    class="text-antique-gold hover:text-vintage-charcoal transition-colors"
                  >
                    View
                  </button>
                  <button
                    @click.stop="deleteClient(client)"
                    class="text-red-600 hover:text-red-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-8">
      <div class="text-sm text-vintage-gray">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalClients) }} of {{ totalClients }} clients
      </div>
      <div class="flex items-center space-x-2">
        <!-- First Page Button -->
        <button
          @click="handlePageChange(1)"
          :disabled="isFirstPage"
          class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          title="Go to first page"
        >
          First
        </button>
        
        <!-- Previous Button -->
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="isFirstPage"
          class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <!-- Page Numbers -->
        <div class="flex items-center space-x-1">
          <template v-for="pageNum in visiblePageNumbers" :key="pageNum">
            <button 
              v-if="typeof pageNum === 'number'"
              @click="handlePageChange(pageNum)"
              :class="[
                'px-3 py-2 text-sm border rounded-lg transition-colors',
                pageNum === currentPage 
                  ? 'bg-antique-gold text-white border-antique-gold' 
                  : 'border-vintage-beige hover:bg-vintage-beige text-vintage-charcoal'
              ]"
            >
              {{ pageNum }}
            </button>
            <span v-else class="px-2 py-2 text-sm text-vintage-gray">...</span>
          </template>
        </div>
        
        <!-- Next Button -->
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="isLastPage"
          class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
        
        <!-- Last Page Button -->
        <button
          @click="handlePageChange(totalPages)"
          :disabled="isLastPage"
          class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          title="Go to last page"
        >
          Last
        </button>
      </div>
    </div>

    <!-- Client Menu Dropdown -->
    <div
      v-if="showClientMenu"
      class="fixed inset-0 z-50"
      @click="closeClientMenu"
    >
      <div
        class="absolute bg-white rounded-lg shadow-lg border border-vintage-beige py-2 min-w-[160px]"
        :style="clientMenuPosition"
        @click.stop
      >
        <button
          @click="editClient(selectedClientForMenu)"
          class="w-full px-4 py-2 text-left text-sm text-vintage-charcoal hover:bg-vintage-ivory flex items-center gap-2"
        >
          <Edit class="w-4 h-4" />
          Edit Client
        </button>
        <button
          @click="openClientDetail(selectedClientForMenu)"
          class="w-full px-4 py-2 text-left text-sm text-vintage-charcoal hover:bg-vintage-ivory flex items-center gap-2"
        >
          <Eye class="w-4 h-4" />
          View Details
        </button>

        <div class="border-t border-vintage-beige my-1"></div>
        <button
          @click="deleteClient(selectedClientForMenu)"
          class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <Trash2 class="w-4 h-4" />
          Delete Client
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-red-100 rounded-full">
            <AlertTriangle class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-lg font-semibold text-vintage-charcoal">Delete Client</h3>
        </div>
        <p class="text-vintage-gray mb-6">
          Are you sure you want to delete <strong>{{ clientToDelete?.name }}</strong>? This action cannot be undone.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="cancelDelete"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            :disabled="isDeleting"
            class="btn-danger"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <div
      v-if="showBulkDeleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-red-100 rounded-full">
            <AlertTriangle class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-lg font-semibold text-vintage-charcoal">Delete Multiple Clients</h3>
        </div>
        <p class="text-vintage-gray mb-6">
          Are you sure you want to delete <strong>{{ selectedClients.length }} clients</strong>? This action cannot be undone.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="cancelBulkDelete"
            class="btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="confirmBulkDelete"
            :disabled="isDeleting"
            class="btn-danger"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete All' }}
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
import { useClientStore } from '@/stores/client'
import { 
  Users, 
  Plus, 
  Search, 
  X, 
  Grid, 
  List, 
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Phone,
  MapPin,
  FileText
} from 'lucide-vue-next'
import type { Client, CreateClientRequest, UpdateClientRequest } from '@/types'

// Composables
const router = useRouter()
const toast = useToast()
const clientStore = useClientStore()

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(12)
const viewMode = ref<'grid' | 'list'>('grid')
const showClientMenu = ref(false)
const showDeleteModal = ref(false)
const showBulkDeleteModal = ref(false)
const clientToDelete = ref<Client | null>(null)
const isDeleting = ref(false)
const selectedClients = ref<string[]>([])
const selectedClientForMenu = ref<Client | null>(null)
const clientMenuPosition = ref({ top: '0px', left: '0px' })

// Search
const searchQuery = ref('')



// Computed properties
const clients = computed(() => clientStore.clients)
const totalClients = computed(() => clientStore.totalClients)
const totalPages = computed(() => Math.ceil(totalClients.value / itemsPerPage.value))

// Generate visible page numbers with ellipsis for better UX
const visiblePageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: (number | string)[] = []
  
  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (current <= 4) {
      // Show pages 2-5, then ellipsis, then last page
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // Show first page, ellipsis, then last 4 pages
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
      pages.push('...')
      pages.push(current - 1)
      pages.push(current)
      pages.push(current + 1)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

const filteredClients = computed(() => {
  let filtered = [...clients.value]
  
  // Apply search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(client => 
      client.name.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query)) ||
      (client.phone && client.phone.toLowerCase().includes(query))
    )
  }
  
  // Sort by creation date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  return filtered
})

const paginatedClients = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredClients.value.slice(start, end)
})

const isFirstPage = computed(() => currentPage.value <= 1)
const isLastPage = computed(() => currentPage.value >= totalPages.value)
const isAllSelected = computed(() => 
  selectedClients.value.length === paginatedClients.value.length && 
  paginatedClients.value.length > 0
)

// Methods
const loadClients = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    await clientStore.fetchClients({
      limit: 100, // Load more clients for better filtering
      offset: 0
    })
    

  } catch (err) {
    console.error('Error loading clients:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load clients'
    toast.error('Failed to load clients')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  // Real-time search - no debouncing needed for small datasets
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}



const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages.value) return
  currentPage.value = newPage
}

const toggleClientSelection = (clientId: string) => {
  const index = selectedClients.value.indexOf(clientId)
  if (index > -1) {
    selectedClients.value.splice(index, 1)
  } else {
    selectedClients.value.push(clientId)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedClients.value = []
  } else {
    selectedClients.value = paginatedClients.value.map(client => client.clientId)
  }
}

const openClientMenu = (client: Client, event: Event) => {
  event.stopPropagation()
  selectedClientForMenu.value = client
  showClientMenu.value = true
  
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  clientMenuPosition.value = {
    top: `${rect.bottom + window.scrollY + 5}px`,
    left: `${rect.left + window.scrollX}px`
  }
}

const closeClientMenu = () => {
  showClientMenu.value = false
  selectedClientForMenu.value = null
}

const openClientForm = (client?: Client) => {
  if (client) {
    router.push(`/clients/${client.clientId}/edit`)
  } else {
    router.push('/clients/new')
  }
}

const openClientDetail = (client: Client) => {
  router.push(`/clients/${client.clientId}`)
}

const editClient = (client: Client) => {
  openClientForm(client)
}



const deleteClient = (client: Client) => {
  clientToDelete.value = client
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  clientToDelete.value = null
}

const confirmDelete = async () => {
  if (!clientToDelete.value) return
  
  try {
    isDeleting.value = true
    await clientStore.deleteClient(clientToDelete.value.clientId)
    
    toast.success('Client deleted successfully')
    showDeleteModal.value = false
    clientToDelete.value = null
    
    // Refresh clients if needed
    if (clients.value.length === 0) {
      await loadClients()
    }
  } catch (err) {
    toast.error('Failed to delete client')
  } finally {
    isDeleting.value = false
  }
}

const bulkDeleteClients = () => {
  showBulkDeleteModal.value = true
}

const cancelBulkDelete = () => {
  showBulkDeleteModal.value = false
}

const confirmBulkDelete = async () => {
  try {
    isDeleting.value = true
    
    // Delete all selected clients
    for (const clientId of selectedClients.value) {
      await clientStore.deleteClient(clientId)
    }
    
    toast.success(`${selectedClients.value.length} clients deleted successfully`)
    showBulkDeleteModal.value = false
    selectedClients.value = []
    
    // Refresh clients
    await loadClients()
  } catch (err) {
    toast.error('Failed to delete some clients')
  } finally {
    isDeleting.value = false
  }
}

const exportSelectedClients = () => {
  // TODO: Implement export functionality
  toast.info('Export feature coming soon!')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return date.toLocaleDateString()
}

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadClients()
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

.btn-primary {
  @apply bg-antique-gold text-white px-4 py-2 rounded-lg font-medium hover:bg-antique-bronze transition-colors;
}

.btn-secondary {
  @apply bg-vintage-beige text-vintage-charcoal px-4 py-2 rounded-lg font-medium hover:bg-antique-gold hover:text-white transition-colors;
}

.btn-danger {
  @apply bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors;
}

.card-antique {
  @apply bg-white rounded-lg shadow-sm border border-vintage-beige;
}
</style> 