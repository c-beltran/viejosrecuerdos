<template>
  <div class="min-h-screen bg-vintage-ivory p-4 lg:p-8">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-2">
            Installment Management
          </h1>
          <p class="text-vintage-gray text-lg">
            Manage installment plans and track payment schedules
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="goBack"
            class="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft class="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </div>

    <!-- Installment Plans Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-vintage-gray">Active Plans</p>
            <p class="text-2xl font-bold text-vintage-charcoal">{{ activePlansCount }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <Clock class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-vintage-gray">Total Outstanding</p>
            <p class="text-2xl font-bold text-vintage-charcoal">${{ formatCurrency(totalOutstanding) }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <DollarSign class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-vintage-gray">Overdue Payments</p>
            <p class="text-2xl font-bold text-vintage-charcoal">{{ overduePaymentsCount }}</p>
          </div>
          <div class="p-3 bg-red-100 rounded-full">
            <AlertTriangle class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Installment Plans List -->
    <div class="card-antique overflow-hidden">
      <div class="p-6 border-b border-vintage-beige">
        <h2 class="text-xl font-semibold text-vintage-charcoal">Installment Plans</h2>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-vintage-beige">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Sale Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Down Payment
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Installments
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Amount Paid
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Next Payment
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-vintage-charcoal uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-vintage-beige">
            <tr
              v-for="plan in installmentPlans"
              :key="plan.planId"
              class="hover:bg-vintage-ivory transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-vintage-charcoal">
                  {{ getClientName(plan.saleId) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-charcoal">
                ${{ formatCurrency(plan.totalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-charcoal">
                ${{ formatCurrency(plan.downPayment) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-gray">
                {{ plan.numberOfInstallments }} × ${{ formatCurrency(plan.installmentAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-charcoal">
                ${{ formatCurrency(getAmountPaid(plan.planId)) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(plan.status)">
                  {{ plan.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-gray">
                {{ formatDate(plan.dueDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="viewPlanDetails(plan)"
                    class="text-antique-gold hover:text-vintage-charcoal transition-colors"
                  >
                    View
                  </button>
                  <button
                    v-if="plan.status === 'Active'"
                    @click="recordPayment(plan)"
                    class="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Payment
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="loading-spinner w-8 h-8 border-4 border-vintage-beige border-t-antique-gold rounded-full"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="card-antique p-8 text-center">
      <AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-vintage-charcoal mb-2">Error Loading Installments</h3>
      <p class="text-vintage-gray mb-4">{{ error }}</p>
      <button @click="loadInstallments" class="btn-primary">Try Again</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useSalesStore } from '@/stores/sales'
import { useClientStore } from '@/stores/client'
import { 
  ArrowLeft,
  Clock,
  DollarSign,
  AlertTriangle,
  AlertCircle
} from 'lucide-vue-next'
import type { InstallmentPlan, Sale } from '@/types'

// Composables
const router = useRouter()
const toast = useToast()
const salesStore = useSalesStore()
const clientStore = useClientStore()

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)
const installmentPlans = ref<InstallmentPlan[]>([])
const sales = ref<Sale[]>([])

// Computed properties
const activePlansCount = computed(() => 
  installmentPlans.value.filter(plan => plan.status === 'Active').length
)

const totalOutstanding = computed(() => {
  return installmentPlans.value
    .filter(plan => plan.status === 'Active')
    .reduce((sum, plan) => {
      const amountPaid = getAmountPaid(plan.planId)
      return sum + (plan.totalAmount - amountPaid)
    }, 0)
})

const overduePaymentsCount = computed(() => {
  const today = new Date()
  return installmentPlans.value.filter(plan => {
    if (plan.status !== 'Active') return false
    const dueDate = new Date(plan.dueDate)
    return dueDate < today
  }).length
})

// Methods
const loadInstallments = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Load installment plans and sales
    await Promise.all([
      salesStore.fetchInstallmentPlans(),
      salesStore.fetchSales()
    ])
    
    installmentPlans.value = salesStore.installmentPlans
    sales.value = salesStore.sales
    
  } catch (err) {
    console.error('Error loading installments:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load installments'
    toast.error('Failed to load installments')
  } finally {
    isLoading.value = false
  }
}

const getClientName = (saleId: string) => {
  const sale = sales.value.find(s => s.saleId === saleId)
  return sale?.client?.name || 'Unknown Client'
}

const getAmountPaid = (planId: string) => {
  // This would calculate from actual payments
  // For now, return a placeholder
  return 0
}

const getStatusBadgeClass = (status: string) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
  
  switch (status) {
    case 'Active':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'Completed':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'Defaulted':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'Cancelled':
      return `${baseClasses} bg-gray-100 text-gray-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

const formatCurrency = (amount: number) => {
  return amount.toFixed(2)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const viewPlanDetails = (plan: InstallmentPlan) => {
  // TODO: Navigate to plan details view
  toast.info('Plan details view coming soon')
}

const recordPayment = (plan: InstallmentPlan) => {
  // TODO: Open payment recording modal
  toast.info('Payment recording coming soon')
}

const goBack = () => {
  router.push('/sales')
}

// Lifecycle
onMounted(() => {
  loadInstallments()
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