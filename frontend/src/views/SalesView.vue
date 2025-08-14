<template>
  <div class="min-h-screen bg-vintage-ivory p-4 lg:p-8">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-2">
            Sales Management
          </h1>
          <p class="text-vintage-gray text-lg">
            Track sales, manage transactions, and monitor revenue
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="openSalesForm()"
            class="btn-primary flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            New Sale
          </button>
        </div>
      </div>
    </div>

    <!-- Sales Statistics Dashboard -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-vintage-gray">Total Sales</p>
            <p class="text-2xl font-bold text-vintage-charcoal">{{ salesStats.totalSales || 0 }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <ShoppingCart class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-vintage-gray">Total Revenue</p>
            <p class="text-2xl font-bold text-vintage-charcoal">${{ formatCurrency(salesStats.totalRevenue || 0) }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <DollarSign class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-vintage-gray">Completed Sales</p>
            <p class="text-2xl font-bold text-vintage-charcoal">{{ salesStats.completedSales || 0 }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <CheckCircle class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-vintage-gray">Avg Sale Value</p>
            <p class="text-2xl font-bold text-vintage-charcoal">${{ formatCurrency(salesStats.averageSaleValue || 0) }}</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <BarChart3 class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
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
              placeholder="Search sales by client name, sale ID, or notes..."
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

        <!-- Status Filter -->
        <div class="w-full lg:w-48">
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="w-full px-3 py-3 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <!-- Payment Method Filter -->
        <div class="w-full lg:w-48">
          <select
            v-model="filters.paymentMethod"
            @change="applyFilters"
            class="w-full px-3 py-3 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent bg-white"
          >
            <option value="">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="flex gap-2">
          <input
            v-model="filters.startDate"
            type="date"
            @change="applyFilters"
            class="px-3 py-3 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent bg-white"
          />
          <input
            v-model="filters.endDate"
            type="date"
            @change="applyFilters"
            class="px-3 py-3 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent bg-white"
          />
        </div>

        <!-- Clear Filters -->
        <button
          @click="clearFilters"
          class="btn-secondary px-4 py-3"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Sales List -->
    <div class="card-antique overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-vintage-beige">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Sale ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Payment Method
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-vintage-beige">
            <tr
              v-for="sale in filteredSales"
              :key="sale.saleId"
              class="hover:bg-vintage-ivory transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-vintage-charcoal">
                  {{ sale.saleId ? sale.saleId.slice(0, 8) + '...' : 'N/A' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-vintage-charcoal">
                  {{ sale.client?.name || 'Walk-in Customer' }}
                </div>
                <div v-if="sale.client?.email" class="text-xs text-vintage-gray">
                  {{ sale.client.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-gray">
                {{ sale.saleDate ? formatDate(sale.saleDate) : 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-vintage-charcoal">
                  ${{ sale.totalAmount ? formatCurrency(sale.totalAmount) : '0.00' }}
                </div>
                <div v-if="sale.items && Array.isArray(sale.items)" class="text-xs text-vintage-gray">
                  {{ sale.items.length }} item(s)
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(sale.status || 'Pending')">
                  {{ sale.status || 'Pending' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-gray">
                {{ sale.paymentMethod || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    v-if="sale.saleId"
                    @click="viewSaleDetails(sale)"
                    class="text-antique-gold hover:text-vintage-charcoal transition-colors"
                  >
                    View
                  </button>
                  <button
                    v-if="sale.saleId && sale.status === 'Pending'"
                    @click="editSale(sale)"
                    class="text-antique-gold hover:text-vintage-charcoal transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    v-if="sale.saleId && sale.status === 'Pending'"
                    @click="updateSaleStatus(sale.saleId, 'Completed')"
                    class="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Complete
                  </button>
                  <button
                    v-if="sale.saleId && sale.status === 'Completed'"
                    @click="openInstallmentModal(sale)"
                    class="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Installments
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
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalSales) }} of {{ totalSales }} sales
      </div>
      <div class="flex items-center space-x-2">
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="isFirstPage"
          class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="px-3 py-2 text-sm text-vintage-charcoal">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="isLastPage"
          class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
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
      <h3 class="text-xl font-semibold text-vintage-charcoal mb-2">Error Loading Sales</h3>
      <p class="text-vintage-gray mb-4">{{ error }}</p>
      <button @click="loadSales" class="btn-primary">Try Again</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useSalesStore } from '@/stores/sales'
import { useInventoryStore } from '@/stores/inventory'
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  X, 
  DollarSign,
  CheckCircle,
  BarChart3,
  AlertCircle
} from 'lucide-vue-next'
import type { Sale, SaleFilters } from '@/types'

// Composables
const router = useRouter()
const toast = useToast()
const salesStore = useSalesStore()
const inventoryStore = useInventoryStore()

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(20)
const searchQuery = ref('')
const salesStats = ref({
  totalSales: 0,
  totalRevenue: 0,
  completedSales: 0,
  averageSaleValue: 0
})

// Filters
const filters = ref<SaleFilters>({
  status: undefined,
  paymentMethod: undefined,
  startDate: undefined,
  endDate: undefined,
  limit: 20,
  offset: 0
})

// Computed properties
const sales = computed(() => salesStore.sales)
const totalSales = computed(() => salesStore.totalSales)
const totalPages = computed(() => Math.ceil(totalSales.value / itemsPerPage.value))

const filteredSales = computed(() => {
  // Use the safe getter from the store
  let filtered = salesStore.getSales
  
  // Apply search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(sale => 
      sale.saleId.toLowerCase().includes(query) ||
      (sale.client?.name && sale.client.name.toLowerCase().includes(query)) ||
      (sale.notes && sale.notes.toLowerCase().includes(query))
    )
  }
  
  // Sort by sale date (newest first)
  filtered.sort((a, b) => {
    if (!a.saleDate || !b.saleDate) return 0
    return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
  })
  
  return filtered
})

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSales.value.slice(start, end)
})

const isFirstPage = computed(() => currentPage.value <= 1)
const isLastPage = computed(() => currentPage.value >= totalPages.value)

// Methods
const loadSales = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    await salesStore.fetchSales({
      limit: 100, // Load more sales for better filtering
      offset: 0
    })
    
    // Load sales statistics
    await loadSalesStats()
    
  } catch (err) {
    console.error('Error loading sales:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load sales'
    toast.error('Failed to load sales')
  } finally {
    isLoading.value = false
  }
}

const loadSalesStats = async () => {
  try {
    // This would call the sales stats API endpoint
    // For now, we'll calculate from the loaded sales
    const sales = salesStore.getSales
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
    const completedSales = sales.filter(sale => sale.status === 'Completed').length
    
    salesStats.value = {
      totalSales: sales.length,
      totalRevenue,
      completedSales,
      averageSaleValue: sales.length > 0 ? totalRevenue / sales.length : 0
    }
  } catch (err) {
    console.error('Error loading sales stats:', err)
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
  loadSales()
}

const clearFilters = () => {
  filters.value = {
    status: undefined,
    paymentMethod: undefined,
  startDate: undefined,
    endDate: undefined,
    limit: 20,
    offset: 0
  }
  currentPage.value = 1
  loadSales()
}

const handlePageChange = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages.value) return
  currentPage.value = newPage
}

const openSalesForm = () => {
  router.push('/sales/new')
}

const viewSaleDetails = (sale: Sale) => {
  router.push(`/sales/${sale.saleId}`)
}

const editSale = (sale: Sale) => {
  router.push(`/sales/${sale.saleId}/edit`)
}

const updateSaleStatus = async (saleId: string, status: string) => {
  try {
    await salesStore.updateSale(saleId, { status })
    toast.success('Sale status updated successfully')
    await loadSales()
  } catch (err) {
    toast.error('Failed to update sale status')
  }
}

const openInstallmentModal = (sale: Sale) => {
  router.push(`/sales/${sale.saleId}/installments`)
}

const formatCurrency = (amount: number) => {
  return amount.toFixed(2)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getStatusBadgeClass = (status: string) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
  
  switch (status) {
    case 'Completed':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'Pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'Cancelled':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'Refunded':
      return `${baseClasses} bg-gray-100 text-gray-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadSales()
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

.btn-primary {
  @apply bg-antique-gold text-white px-4 py-2 rounded-lg font-medium hover:bg-antique-bronze transition-colors;
}

.btn-secondary {
  @apply bg-vintage-beige text-vintage-charcoal px-4 py-2 rounded-lg font-medium hover:bg-antique-gold hover:text-white transition-colors;
}

.card-antique {
  @apply bg-white rounded-lg shadow-sm border border-vintage-beige;
}
</style> 