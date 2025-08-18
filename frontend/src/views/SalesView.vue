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
            @click="exportSales"
            class="btn-secondary flex items-center gap-2"
            title="Export to Excel"
          >
            <Download class="w-4 h-4" />
            Export
          </button>
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
            <p class="text-2xl font-bold text-vintage-charcoal">{{ formatCurrency(salesStats.totalRevenue || 0) }}</p>
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
            <p class="text-sm text-vintage-gray">Active Installments</p>
            <p class="text-2xl font-bold text-vintage-charcoal">{{ getActiveInstallmentCount() }}</p>
            <p class="text-sm text-vintage-gray mt-1">${{ getTotalOutstandingAmount().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} outstanding</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <CreditCard class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="card-antique p-6 mb-6">
      <div class="flex flex-col gap-4">
        <!-- Search Bar -->
        <div class="flex-1">
          <label class="block text-sm font-medium text-vintage-charcoal mb-2">Search Sales</label>
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

        <!-- Filter Controls -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Status Filter -->
          <div class="w-full">
            <label class="block text-sm font-medium text-vintage-charcoal mb-2">Status</label>
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
          <div class="w-full">
            <label class="block text-sm font-medium text-vintage-charcoal mb-2">Payment Method</label>
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
          <div class="w-full sm:col-span-2">
            <label class="block text-sm font-medium text-vintage-charcoal mb-2">Date Range</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <div class="relative flex-1 min-w-0">
                <input
                  v-model="filters.startDate"
                  type="date"
                  @change="applyFilters"
                  class="w-full px-3 py-3 pr-8 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent bg-white text-sm"
                  placeholder="Start Date"
                />
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-vintage-gray">
                  From
                </span>
              </div>
              <div class="relative flex-1 min-w-0">
                <input
                  v-model="filters.endDate"
                  type="date"
                  @change="applyFilters"
                  class="w-full px-3 py-3 pr-8 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent bg-white text-sm"
                  placeholder="End Date"
                />
                <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-vintage-gray">
                  To
                </span>
              </div>
            </div>
          </div>

          <!-- Clear Filters -->
          <div v-if="hasActiveFilters" class="w-full sm:col-span-2 lg:col-span-1 flex items-end">
            <button
              @click="clearAllFilters"
              class="w-full btn-secondary px-4 py-3"
            >
              Clear All Filters
            </button>
          </div>
        </div>
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
                  ${{ sale.totalAmount ? sale.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }}
                </div>
                <!-- Show installment information if available -->
                <div v-if="isInstallmentSale(sale.saleId)" class="text-xs text-blue-600">
                  <div class="flex items-center gap-1">
                    <span class="font-medium">Installment:</span>
                    <span>${{ getAmountPaidForSale(sale.saleId).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} paid</span>
                    <span class="text-vintage-gray">/</span>
                    <span class="text-vintage-gray">${{ getRemainingAmountForSale(sale.saleId).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} remaining</span>
                  </div>
                  <!-- Show payment breakdown -->
                  <div class="text-xs text-vintage-gray mt-1">
                    <span>Down: ${{ (getInstallmentPlanForSale(sale.saleId)?.downPayment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    <span class="mx-1">+</span>
                    <span>Payments: ${{ (getAmountPaidForSale(sale.saleId) - (getInstallmentPlanForSale(sale.saleId)?.downPayment || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                  </div>
                </div>
                <div v-if="sale.items && Array.isArray(sale.items)" class="text-xs text-vintage-gray">
                  {{ sale.items.length }} item(s)
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col gap-1">
                  <span :class="getStatusBadgeClass(sale.status || 'Pending')">
                    {{ sale.status || 'Pending' }}
                  </span>
                  <!-- Show installment indicator -->
                  <span v-if="isInstallmentSale(sale.saleId)" class="text-xs text-blue-600 font-medium">
                    📋 Installment Plan
                  </span>
                </div>
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
                    v-if="sale.saleId && sale.status === 'Completed' && isInstallmentSale(sale.saleId)"
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
import { formatCurrency } from '@/utils/formatters'

import * as XLSX from 'xlsx'
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  X, 
  DollarSign,
  CheckCircle,
  BarChart3,
  AlertCircle,
  CreditCard,
  Download
} from 'lucide-vue-next'
import type { Sale, SaleFilters } from '@/types'

// Helper functions for date formatting (no default values)
const formatDateForFilter = (date: Date) => {
  return date.toISOString().split('T')[0]
}

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

// Filters - start with no filters applied
const filters = ref<SaleFilters>({
  status: undefined,
  paymentMethod: undefined,
  startDate: undefined, // No default start date
  endDate: undefined, // No default end date
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
  
  // Debug: Log initial count
  console.log('Initial sales count:', filtered.length)
  
  // Apply search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    const beforeSearch = filtered.length
    filtered = filtered.filter(sale => 
      sale.saleId.toLowerCase().includes(query) ||
      (sale.client?.name && sale.client.name.toLowerCase().includes(query)) ||
      (sale.notes && sale.notes.toLowerCase().includes(query))
    )
    console.log(`Search filter applied: ${beforeSearch} -> ${filtered.length} results`)
  }
  
  // Apply status filter
  if (filters.value.status) {
    const beforeStatus = filtered.length
    filtered = filtered.filter(sale => sale.status === filters.value.status)
    console.log(`Status filter (${filters.value.status}) applied: ${beforeStatus} -> ${filtered.length} results`)
  }
  
  // Apply payment method filter
  if (filters.value.paymentMethod) {
    const beforePayment = filtered.length
    filtered = filtered.filter(sale => sale.paymentMethod === filters.value.paymentMethod)
    console.log(`Payment method filter (${filters.value.paymentMethod}) applied: ${beforePayment} -> ${filtered.length} results`)
  }
  
  // Apply date range filters
  if (filters.value.startDate) {
    const beforeStartDate = filtered.length
    filtered = filtered.filter(sale => {
      if (!sale.saleDate) return false
      const saleDate = new Date(sale.saleDate)
      const startDate = new Date(filters.value.startDate)
      return saleDate >= startDate
    })
    console.log(`Start date filter (${filters.value.startDate}) applied: ${beforeStartDate} -> ${filtered.length} results`)
  }
  
  if (filters.value.endDate) {
    const beforeEndDate = filtered.length
    filtered = filtered.filter(sale => {
      if (!sale.saleDate) return false
      const saleDate = new Date(sale.saleDate)
      const endDate = new Date(filters.value.endDate)
      // Set end date to end of day for inclusive filtering
      endDate.setHours(23, 59, 59, 999)
      return saleDate <= endDate
    })
    console.log(`End date filter (${filters.value.endDate}) applied: ${beforeEndDate} -> ${filtered.length} results`)
  }
  
  // Sort by sale date (newest first)
  filtered.sort((a, b) => {
    if (!a.saleDate || !b.saleDate) return 0
    return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
  })
  
  console.log('Final filtered results:', filtered.length)
  return filtered
})

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSales.value.slice(start, end)
})

const isFirstPage = computed(() => currentPage.value <= 1)
const isLastPage = computed(() => currentPage.value >= totalPages.value)

// Helper functions for installment calculations
const getActiveInstallmentCount = () => {
  // Only count plans that are not completed (fully paid)
  return salesStore.installmentPlans.filter(plan => {
    const totalPaid = getAmountPaidForSale(plan.saleId)
    const totalAmount = plan.totalAmount || 0
    return totalPaid < totalAmount // Only active if not fully paid
  }).length
}

// Methods
const loadSales = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Load sales and installment information in parallel
    await Promise.all([
      salesStore.fetchSales({
        limit: 100, // Load more sales for better filtering
        offset: 0
      }),
      salesStore.fetchInstallmentPlans(),
      salesStore.fetchPayments()
    ])
    
    // Debug: Log what was loaded
    console.log('Sales loaded:', salesStore.sales.length)
    console.log('Installment plans loaded:', salesStore.installmentPlans.length)
    console.log('Payments loaded:', salesStore.payments.length)
    
    // Log first few installment plans to verify data
    if (salesStore.installmentPlans.length > 0) {
      console.log('First installment plan:', salesStore.installmentPlans[0])
    }
    
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
  // Force a reactive update by triggering the computed property
  // The filteredSales computed will automatically update when searchQuery changes
}

const applyFilters = () => {
  currentPage.value = 1
  // No need to reload sales - the computed filteredSales will automatically update
  // when filters change due to Vue's reactivity system
}

const clearFilters = () => {
  // Reset all filters
  filters.value = {
    status: undefined,
    paymentMethod: undefined,
    startDate: undefined,
    endDate: undefined,
    limit: 20,
    offset: 0
  }
  // Reset search query as well
  searchQuery.value = ''
  currentPage.value = 1
  // No need to reload sales - the computed filteredSales will automatically update
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



const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
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

// Helper functions for installment calculations
const getInstallmentPlanForSale = (saleId: string) => {
  return salesStore.installmentPlans.find(plan => plan.saleId === saleId)
}

const getAmountPaidForSale = (saleId: string) => {
  const plan = getInstallmentPlanForSale(saleId)
  if (!plan) return 0
  
  // Include the down payment that was made when the sale was created
  let totalPaid = plan.downPayment || 0
  
  // Add any additional installment payments
  const planPayments = salesStore.payments.filter(payment => payment.planId === plan.planId)
  totalPaid += planPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  
  return totalPaid
}

const getRemainingAmountForSale = (saleId: string) => {
  const plan = getInstallmentPlanForSale(saleId)
  if (!plan) return 0
  
  const amountPaid = getAmountPaidForSale(saleId)
  return plan.totalAmount - amountPaid
}

const isInstallmentSale = (saleId: string) => {
  return !!getInstallmentPlanForSale(saleId)
}

const getTotalOutstandingAmount = () => {
  // Calculate total outstanding for all active plans only
  return salesStore.installmentPlans.reduce((total, plan) => {
    const amountPaid = getAmountPaidForSale(plan.saleId)
    const totalAmount = plan.totalAmount || 0
    const remaining = totalAmount - amountPaid
    
    // Only include if there's still money owed (active plans)
    if (remaining > 0) {
      return total + remaining
    }
    return total
  }, 0)
}

const exportSales = async () => {
  try {
    // Get all sales data
    const allSales = salesStore.getSales
    
    if (!allSales || allSales.length === 0) {
      toast.error('No sales data to export')
      return
    }
    
    // Prepare data for export
    const exportData = allSales.map(sale => {
      const installmentPlan = getInstallmentPlanForSale(sale.saleId)
      const amountPaid = getAmountPaidForSale(sale.saleId)
      const remainingAmount = getRemainingAmountForSale(sale.saleId)
      
      return {
        'Sale ID': sale.saleId,
        'Date': formatDate(sale.saleDate),
        'Client': sale.client?.name || 'N/A',
        'Client Email': sale.client?.email || 'N/A',
        'Client Phone': sale.client?.phone || 'N/A',
        'Total Amount': `$${sale.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        'Payment Method': sale.paymentMethod,
        'Status': sale.status,
        'Notes': sale.notes || 'N/A',
        'Items Count': sale.items?.length || 0,
        'Is Installment': isInstallmentSale(sale.saleId) ? 'Yes' : 'No',
        'Down Payment': installmentPlan ? `$${(installmentPlan.downPayment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
'Amount Paid': `$${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
'Remaining Amount': `$${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        'Installment Status': installmentPlan ? getEffectiveStatus(installmentPlan) : 'N/A',
        'Created Date': formatDate(sale.createdAt),
        'Updated Date': formatDate(sale.updatedAt)
      }
    })
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Sale ID
      { wch: 12 }, // Date
      { wch: 20 }, // Client
      { wch: 25 }, // Client Email
      { wch: 15 }, // Client Phone
      { wch: 15 }, // Total Amount
      { wch: 15 }, // Payment Method
      { wch: 12 }, // Status
      { wch: 30 }, // Notes
      { wch: 12 }, // Items Count
      { wch: 15 }, // Is Installment
      { wch: 15 }, // Down Payment
      { wch: 15 }, // Amount Paid
      { wch: 15 }, // Remaining Amount
      { wch: 18 }, // Installment Status
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ]
    worksheet['!cols'] = columnWidths
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data')
    
    // Generate filename with current date
    const currentDate = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const filename = `sales_export_${currentDate}.xlsx`
    
    // Save the file
    XLSX.writeFile(workbook, filename)
    
    toast.success(`Exported ${exportData.length} sales to ${filename}`)
  } catch (error) {
    console.error('Export error:', error)
    toast.error('Failed to export sales data')
  }
}

// Helper function for installment status
const getEffectiveStatus = (plan: any) => {
  if (!plan) return 'N/A'
  const amountPaid = getAmountPaidForSale(plan.saleId)
  const totalAmount = plan.totalAmount || 0
  return amountPaid >= totalAmount ? 'Completed' : plan.status || 'Active'
}

// Clear all filters and reset to default state
const clearAllFilters = () => {
  filters.value = {
    status: undefined,
    paymentMethod: undefined,
    startDate: undefined,
    endDate: undefined,
    limit: 20,
    offset: 0
  }
  searchQuery.value = ''
  currentPage.value = 1
  toast.success('All filters cleared')
}

// Check if any filters are currently applied
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.status ||
    filters.value.paymentMethod ||
    filters.value.startDate ||
    filters.value.endDate ||
    searchQuery.value.trim()
  )
})

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1
})

// Watch for filter changes to reset pagination
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

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