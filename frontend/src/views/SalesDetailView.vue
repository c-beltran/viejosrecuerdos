<template>
  <div class="min-h-screen bg-vintage-ivory p-4 lg:p-8">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-2">
            Sale Details
          </h1>
          <p class="text-vintage-gray text-lg">
            View complete sale information and item breakdown
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="goBack"
            class="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft class="w-4 h-4" />
            Back to Sales
          </button>
          <button
            v-if="sale?.status === 'Pending'"
            @click="editSale"
            class="btn-primary flex items-center gap-2"
          >
            <Edit class="w-4 h-4" />
            Edit Sale
          </button>
          <button
            v-if="sale?.status === 'Completed'"
            @click="openInstallments"
            class="btn-primary flex items-center gap-2"
          >
            <CreditCard class="w-4 h-4" />
            Manage Installments
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="loading-spinner w-8 h-8 border-4 border-vintage-beige border-t-antique-gold rounded-full"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card-antique p-8 text-center">
      <AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-vintage-charcoal mb-2">Error Loading Sale</h3>
      <p class="text-vintage-gray mb-4">{{ error }}</p>
      <button @click="loadSale" class="btn-primary">Try Again</button>
    </div>

    <!-- Sale Details -->
    <div v-else-if="sale" class="space-y-6">
      <!-- Sale Information Card -->
      <div class="card-antique p-6">
        <h2 class="text-xl font-semibold text-vintage-charcoal mb-4">Sale Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-vintage-gray mb-1">Sale ID</label>
                            <p class="text-vintage-charcoal font-mono">{{ sale.saleId || 'N/A' }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-vintage-gray mb-1">Sale Date</label>
                            <p class="text-vintage-charcoal">{{ sale.saleDate ? formatDate(sale.saleDate) : 'N/A' }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-vintage-gray mb-1">Status</label>
                            <span :class="getStatusBadgeClass(sale.status || 'Pending')">
                  {{ sale.status || 'Pending' }}
                </span>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-vintage-gray mb-1">Payment Method</label>
                            <p class="text-vintage-charcoal">{{ sale.paymentMethod || 'N/A' }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-vintage-gray mb-1">Total Amount</label>
                            <p class="text-2xl font-bold text-vintage-charcoal">${{ sale.totalAmount ? formatCurrency(sale.totalAmount) : '0.00' }}</p>
          </div>
          
                    <div>
            <label class="block text-sm font-medium text-vintage-gray mb-1">Created By</label>
            <p class="text-vintage-charcoal">{{ sale.createdBy || 'N/A' }}</p>
          </div>
          
          <!-- Installment Plan Indicator -->
          <div v-if="isInstallmentSale" class="md:col-span-2 lg:col-span-3">
            <div class="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CreditCard class="w-5 h-5 text-blue-600" />
              <span class="text-blue-800 font-medium">📋 Installment Plan</span>
              <span class="text-blue-600 text-sm">This sale is being paid in installments</span>
            </div>
          </div>
        </div>

        <!-- Client Information -->
        <div v-if="sale.client" class="mt-6 pt-6 border-t border-vintage-beige">
          <h3 class="text-lg font-medium text-vintage-charcoal mb-3">Client Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-vintage-gray mb-1">Name</label>
                              <p class="text-vintage-charcoal">{{ sale.client?.name || 'N/A' }}</p>
            </div>
            <div v-if="sale.client.email">
              <label class="block text-sm font-medium text-vintage-gray mb-1">Email</label>
                              <p class="text-vintage-charcoal">{{ sale.client?.email || 'N/A' }}</p>
            </div>
            <div v-if="sale.client.phone">
              <label class="block text-sm font-medium text-vintage-gray mb-1">Phone</label>
                              <p class="text-vintage-charcoal">{{ sale.client?.phone || 'N/A' }}</p>
            </div>
            <div v-if="sale.client.address">
              <label class="block text-sm font-medium text-vintage-gray mb-1">Address</label>
                              <p class="text-vintage-charcoal">{{ sale.client?.address || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="sale.notes" class="mt-6 pt-6 border-t border-vintage-beige">
          <label class="block text-sm font-medium text-vintage-gray mb-2">Notes</label>
          <p class="text-vintage-charcoal bg-vintage-ivory p-3 rounded-lg">{{ sale.notes }}</p>
        </div>
      </div>

      <!-- Sale Items Card -->
      <div class="card-antique p-6">
        <h2 class="text-xl font-semibold text-vintage-charcoal mb-4">Sale Items</h2>
        
        <div v-if="sale.items && sale.items.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-vintage-beige">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Item
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Description
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Unit Price
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                  Total Price
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-vintage-beige">
              <tr
                v-for="item in sale.items"
                :key="item.saleItemId"
                class="hover:bg-vintage-ivory transition-colors"
              >
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-vintage-charcoal">
                    {{ getItemName(item.itemId) }}
                  </div>
                  <div class="text-xs text-vintage-gray">
                    ID: {{ item.itemId ? item.itemId.slice(0, 8) + '...' : 'N/A' }}
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="text-sm text-vintage-charcoal">
                    {{ getItemDescription(item.itemId) }}
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-vintage-charcoal">
                  {{ item.quantity }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-vintage-charcoal">
                  ${{ formatCurrency(item.unitPrice) }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-vintage-charcoal">
                  ${{ formatCurrency(item.quantity * item.unitPrice) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="text-center py-8 text-vintage-gray">
          <Package class="w-16 h-16 mx-auto mb-4 text-vintage-beige" />
          <p>No items found for this sale</p>
        </div>
      </div>

      <!-- Summary Card -->
      <div class="card-antique p-6">
        <h2 class="text-xl font-semibold text-vintage-charcoal mb-4">Sale Summary</h2>
        
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-vintage-gray">Total Items:</span>
            <span class="font-medium text-vintage-charcoal">{{ totalItems }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-vintage-gray">Subtotal:</span>
            <span class="font-medium text-vintage-charcoal">${{ formatCurrency(subtotal) }}</span>
          </div>
          
          <div class="border-t border-vintage-beige pt-3">
            <div class="flex justify-between text-lg font-bold text-vintage-charcoal">
              <span>Total Amount:</span>
              <span>${{ formatCurrency(sale.totalAmount) }}</span>
            </div>
          </div>
          
          <!-- Installment Details -->
          <div v-if="isInstallmentSale" class="border-t border-vintage-beige pt-3">
            <h3 class="text-lg font-medium text-vintage-charcoal mb-3">Installment Plan Details</h3>
            
            <div v-if="installmentPlan" class="space-y-3">
              <div class="flex justify-between">
                <span class="text-vintage-gray">Down Payment:</span>
                <span class="font-medium text-vintage-charcoal">${{ formatCurrency(installmentPlan.downPayment || 0) }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-vintage-gray">Installments:</span>
                <span class="font-medium text-vintage-charcoal">{{ installmentPlan.numberOfInstallments }} × ${{ formatCurrency(installmentPlan.installmentAmount || 0) }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-vintage-gray">Amount Paid:</span>
                <span class="font-medium text-vintage-charcoal">${{ formatCurrency(amountPaid) }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-vintage-gray">Remaining Balance:</span>
                <span class="font-medium text-vintage-charcoal">${{ formatCurrency(remainingBalance) }}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-vintage-gray">Status:</span>
                <span :class="getInstallmentStatusBadgeClass(getEffectiveStatus(installmentPlan))">
                  {{ getEffectiveStatus(installmentPlan) }}
                </span>
              </div>
              
              <!-- View Installment Details Button -->
              <div class="pt-2">
                <button
                  @click="openInstallments"
                  class="btn-primary w-full"
                >
                  <CreditCard class="w-4 h-4 mr-2" />
                  View Installment Details
                </button>
              </div>
            </div>
            
            <div v-else class="text-center py-4">
              <p class="text-vintage-gray mb-3">Installment plan details not available</p>
              <button
                @click="openInstallments"
                class="btn-primary"
              >
                <CreditCard class="w-4 h-4 mr-2" />
                View Installment Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useSalesStore } from '@/stores/sales'
import { useInventoryStore } from '@/stores/inventory'
import { 
  ArrowLeft,
  Edit,
  CreditCard,
  Package,
  AlertCircle
} from 'lucide-vue-next'
import type { Sale } from '@/types'

// Composables
const route = useRoute()
const router = useRouter()
const toast = useToast()
const salesStore = useSalesStore()
const inventoryStore = useInventoryStore()

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)
const sale = ref<Sale | null>(null)

// Computed properties
const saleId = computed(() => route.params.id as string)

const totalItems = computed(() => {
  if (!sale.value?.items || !Array.isArray(sale.value.items)) {
    return 0
  }
  return sale.value.items.reduce((sum, item) => sum + (item?.quantity || 0), 0)
})

const subtotal = computed(() => {
  if (!sale.value?.items || !Array.isArray(sale.value.items)) {
    return 0
  }
  return sale.value.items.reduce((sum, item) => sum + ((item?.quantity || 0) * (item?.unitPrice || 0)), 0)
})

// Installment-related computed properties
const isInstallmentSale = computed(() => {
  return !!installmentPlan.value
})

const installmentPlan = computed(() => {
  if (!sale.value?.saleId) return null
  return salesStore.installmentPlans.find(plan => plan.saleId === sale.value.saleId)
})

const amountPaid = computed(() => {
  if (!installmentPlan.value) return 0
  return getAmountPaidForPlan(installmentPlan.value.planId)
})

const remainingBalance = computed(() => {
  if (!installmentPlan.value) return 0
  return (installmentPlan.value.totalAmount || 0) - amountPaid.value
})

// Check if an installment plan is completed (fully paid)
const isPlanCompleted = (plan: any) => {
  if (!plan) return false
  const totalPaid = getAmountPaidForPlan(plan.planId)
  const totalAmount = plan.totalAmount || 0
  return totalPaid >= totalAmount
}

// Get the effective status for display (auto-update to Completed if fully paid)
const getEffectiveStatus = (plan: any) => {
  if (isPlanCompleted(plan)) {
    return 'Completed'
  }
  return plan.status || 'Active'
}

// Helper function to get amount paid for a specific plan
const getAmountPaidForPlan = (planId: string) => {
  if (!planId) return 0
  
  // Find the plan
  const plan = salesStore.installmentPlans.find(p => p.planId === planId)
  if (!plan) return 0
  
  let totalPaid = plan.downPayment || 0
  
  // Add any additional installment payments
  const planPayments = salesStore.payments.filter(payment => payment.planId === planId)
  totalPaid += planPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  
  return totalPaid
}

// Methods
const loadSale = async () => {
  if (!saleId.value) return
  
  try {
    isLoading.value = true
    error.value = null
    
    // Load inventory first to ensure item names are available
    await inventoryStore.fetchAllAvailableItems()
    
    // Then load sale details and installment data in parallel
    const [saleData] = await Promise.all([
      salesStore.fetchSale(saleId.value),
      salesStore.fetchInstallmentPlans(),
      salesStore.fetchPayments()
    ])
    
    if (saleData) {
      sale.value = saleData
    } else {
      error.value = 'Sale not found'
    }
    
  } catch (err) {
    console.error('Error loading sale:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load sale'
    toast.error('Failed to load sale')
  } finally {
    isLoading.value = false
  }
}

const getItemName = (itemId: string) => {
  if (!itemId) return 'Unknown Item'
  
  // First, try to get from sale items if they already contain inventory details
  if (sale.value?.items) {
    const saleItem = sale.value.items.find(si => si.itemId === itemId)
    
    if (saleItem?.inventoryItem) {
      return `${saleItem.inventoryItem.friendlyId} - ${saleItem.inventoryItem.itemName}`
    } else {
    }
  }
  
  // If not found in sale items, try to find in inventory store
  if (inventoryStore.items && Array.isArray(inventoryStore.items)) {
    const item = inventoryStore.items.find(item => item.itemId === itemId)
    if (item) {
      return `${item.friendlyId} - ${item.itemName}`
    }
  }
  
  return `Item ${itemId.slice(0, 8)}...`
}

const getItemDescription = (itemId: string) => {
  if (!itemId) return 'No description available'
  
  // First, try to get from sale items if they already contain inventory details
  if (sale.value?.items) {
    const saleItem = sale.value.items.find(si => si.itemId === itemId)
    if (saleItem?.inventoryItem?.descripcionArticulo) {
      return saleItem.inventoryItem.descripcionArticulo
    }
  }
  
  // If not found in sale items, try to find in inventory store
  if (inventoryStore.items && Array.isArray(inventoryStore.items)) {
    const item = inventoryStore.items.find(item => item.itemId === itemId)
    if (item?.descripcionArticulo) {
      return item.descripcionArticulo
    }
  }
  
  return 'No description available'
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

const getInstallmentStatusBadgeClass = (status: string) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
  
  switch (status) {
    case 'Active':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'Completed':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'Defaulted':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'Cancelled':
      return `${baseClasses} bg-gray-100 text-gray-800`
    default:
      return `${baseClasses} bg-blue-100 text-blue-800`
  }
}

const formatCurrency = (amount: number) => {
  return amount.toFixed(2)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const goBack = () => {
  router.push('/sales')
}

const editSale = () => {
  router.push(`/sales/${saleId.value}/edit`)
}

const openInstallments = () => {
  router.push(`/sales/${saleId.value}/installments`)
}

// Lifecycle
onMounted(() => {
  loadSale()
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