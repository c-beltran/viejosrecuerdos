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
            <p class="text-2xl font-bold text-vintage-charcoal">${{ totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
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

    <!-- Filters -->
    <div class="card-antique p-6 mb-6">
      <div class="flex flex-col lg:flex-row gap-4 items-center">
        <div class="flex-1">
          <label class="block text-sm font-medium text-vintage-charcoal mb-2">Filter by Status</label>
          <select
            v-model="statusFilter"
            @change="applyFilters"
            class="w-full lg:w-48 px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal hover:border-antique-gold transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Defaulted">Defaulted</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="exportInstallments"
            class="btn-secondary flex items-center gap-2"
            title="Export to Excel"
          >
            <Download class="w-4 h-4" />
            Export
          </button>
          <button
            @click="loadInstallments"
            class="btn-primary flex items-center gap-2"
          >
            <RefreshCw class="w-4 h-4" />
            Refresh
          </button>
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
              v-for="plan in filteredInstallmentPlans"
              :key="plan.planId"
              class="hover:bg-vintage-ivory transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-vintage-charcoal">
                  {{ getClientName(plan.saleId) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-charcoal">
                ${{ plan.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-charcoal">
                ${{ plan.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-gray">
                {{ plan.numberOfInstallments }} × ${{ plan.installmentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-vintage-charcoal">
                ${{ getAmountPaid(plan.planId).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(getEffectiveStatus(plan))">
                  {{ getEffectiveStatus(plan) }}
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
                    v-if="!isPlanCompleted(plan)"
                    @click="recordPayment(plan)"
                    class="text-green-600 hover:text-green-800 transition-colors"
                  >
                    Payment
                  </button>
                  <span
                    v-else
                    class="text-green-600 font-medium text-sm"
                  >
                    ✓ Paid
                  </span>
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
    
    <!-- Payment Recording Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-vintage-beige">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-vintage-charcoal">Record Payment</h3>
            <button @click="closePaymentModal" class="text-vintage-gray hover:text-vintage-charcoal">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <!-- Plan Summary -->
            <div class="bg-vintage-ivory p-4 rounded-lg">
              <h4 class="font-medium text-vintage-charcoal mb-2">Plan Summary</h4>
              
              <!-- Completion Status Alert -->
              <div v-if="isPlanCompleted(selectedPlan)" class="mb-3 p-2 bg-green-100 border border-green-300 rounded-lg">
                <div class="flex items-center gap-2 text-green-800 text-sm">
                  <span class="font-medium">✓</span>
                  <span>This installment plan is fully paid!</span>
                </div>
              </div>
              
              <div class="text-sm text-vintage-gray space-y-1">
                <div>Client: {{ getClientName(selectedPlan?.saleId || '') }}</div>
                <div>Total: ${{ formatCurrency(selectedPlan?.totalAmount || 0) }}</div>
                <div>Down Payment: ${{ formatCurrency(selectedPlan?.downPayment || 0) }}</div>
                <div>Additional Payments: ${{ formatCurrency(getAmountPaid(selectedPlan?.planId || '') - (selectedPlan?.downPayment || 0)) }}</div>
                <div class="font-medium text-vintage-charcoal">Remaining: ${{ formatCurrency(getRemainingAmount(selectedPlan)) }}</div>
              </div>
            </div>
            
            <!-- Payment Form -->
            <div v-if="!isPlanCompleted(selectedPlan)">
              <label class="block text-sm font-medium text-vintage-charcoal mb-2">
                Payment Amount
              </label>
              <input
                v-model="paymentForm.amount"
                type="number"
                step="0.01"
                min="0"
                :max="getRemainingAmount(selectedPlan)"
                class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal placeholder-vintage-gray hover:border-antique-gold transition-colors"
                placeholder="Enter payment amount"
              />
            </div>
            
            <div v-if="!isPlanCompleted(selectedPlan)">
              <label class="block text-sm font-medium text-vintage-charcoal mb-2">
                Payment Date
              </label>
              <input
                v-model="paymentForm.paymentDate"
                type="date"
                class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal hover:border-antique-gold transition-colors"
              />
            </div>
            
            <div v-if="!isPlanCompleted(selectedPlan)">
              <label class="block text-sm font-medium text-vintage-charcoal mb-2">
                Payment Method
              </label>
              <select
                v-model="paymentForm.paymentMethod"
                class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal hover:border-antique-gold transition-colors"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Check">Check</option>
              </select>
            </div>
            
            <div v-if="!isPlanCompleted(selectedPlan)">
              <label class="block text-sm font-medium text-vintage-charcoal mb-2">
                Notes (Optional)
              </label>
              <textarea
                v-model="paymentForm.notes"
                rows="3"
                class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal placeholder-vintage-gray hover:border-antique-gold transition-colors"
                placeholder="Additional notes about this payment"
              ></textarea>
            </div>
            
            <!-- Payment Preview -->
            <div v-if="!isPlanCompleted(selectedPlan)" class="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div class="text-sm text-blue-800">
                <div class="font-medium mb-1">Payment Preview:</div>
                <div>After this payment of ${{ formatCurrency(paymentForm.amount || 0) }}:</div>
                <div class="font-medium">New Total Paid: ${{ formatCurrency(getNewTotalPaid()) }}</div>
                <div class="font-medium">New Remaining: ${{ formatCurrency(getNewRemaining()) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-vintage-beige flex gap-3">
          <button
            @click="closePaymentModal"
            class="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            v-if="!isPlanCompleted(selectedPlan)"
            @click="submitPayment"
            :disabled="!canSubmitPayment"
            class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Record Payment
          </button>
          <button
            v-else
            disabled
            class="btn-secondary flex-1 opacity-50 cursor-not-allowed"
          >
            Plan Completed ✓
          </button>
        </div>
      </div>
    </div>
    
    <!-- Plan Details Modal -->
    <div v-if="showPlanDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-vintage-beige">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-vintage-charcoal">Plan Details</h3>
            <button @click="closePlanDetailsModal" class="text-vintage-gray hover:text-vintage-charcoal">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div v-if="selectedPlan" class="space-y-6">
            <!-- Plan Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="font-medium text-vintage-charcoal">Plan Information</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Plan ID:</span>
                    <span class="text-vintage-charcoal font-mono">{{ selectedPlan.planId?.slice(0, 8) }}...</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Status:</span>
                    <span :class="getStatusBadgeClass(getEffectiveStatus(selectedPlan))">{{ getEffectiveStatus(selectedPlan) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Total Amount:</span>
                    <span class="text-vintage-charcoal">${{ formatCurrency(selectedPlan.totalAmount) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Down Payment:</span>
                    <span class="text-vintage-charcoal">${{ formatCurrency(selectedPlan.downPayment) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Installments:</span>
                    <span class="text-vintage-charcoal">{{ selectedPlan.numberOfInstallments }} × ${{ formatCurrency(selectedPlan.installmentAmount) }}</span>
                  </div>
                </div>
              </div>
              
              <div class="space-y-4">
                <h4 class="font-medium text-vintage-charcoal">Payment Schedule</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Start Date:</span>
                    <span class="text-vintage-charcoal">{{ formatDate(selectedPlan.startDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Due Date:</span>
                    <span class="text-vintage-charcoal">{{ formatDate(selectedPlan.dueDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Frequency:</span>
                    <span class="text-vintage-charcoal">{{ selectedPlan.installmentFrequency }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Amount Paid:</span>
                    <span class="text-vintage-charcoal">${{ formatCurrency(getAmountPaid(selectedPlan.planId)) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-vintage-gray">Remaining:</span>
                    <span class="text-vintage-charcoal">${{ formatCurrency(getRemainingAmount(selectedPlan)) }}</span>
                  </div>
                  <!-- Payment Breakdown -->
                  <div class="flex justify-between text-xs text-vintage-gray">
                    <span>Down Payment:</span>
                    <span>${{ formatCurrency(selectedPlan.downPayment || 0) }}</span>
                  </div>
                  <div class="flex justify-between text-xs text-vintage-gray">
                    <span>Additional Payments:</span>
                    <span>${{ formatCurrency(getAmountPaid(selectedPlan.planId) - (selectedPlan.downPayment || 0)) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Payment History -->
            <div>
              <h4 class="font-medium text-vintage-charcoal mb-4">Payment History</h4>
              <div v-if="selectedPlanPayments.length > 0" class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-vintage-beige">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-vintage-charcoal">Date</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-vintage-charcoal">Amount</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-vintage-charcoal">Method</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-vintage-charcoal">Status</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-vintage-charcoal">Notes</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-vintage-beige">
                    <tr v-for="payment in selectedPlanPayments" :key="payment.paymentId" class="hover:bg-vintage-ivory">
                      <td class="px-4 py-2 text-sm text-vintage-charcoal">{{ formatDate(payment.paymentDate) }}</td>
                      <td class="px-4 py-2 text-sm text-vintage-charcoal">${{ formatCurrency(payment.amount) }}</td>
                      <td class="px-4 py-2 text-sm text-vintage-charcoal">{{ formatPaymentMethod(payment.paymentMethod) }}</td>
                      <td class="px-4 py-2 text-sm text-vintage-charcoal">
                        <span :class="getPaymentStatusBadgeClass(payment.status)">{{ payment.status }}</span>
                      </td>
                      <td class="px-4 py-2 text-sm text-vintage-gray">{{ payment.notes || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-8 text-vintage-gray">
                <CreditCard class="w-16 h-16 mx-auto mb-4 text-vintage-beige" />
                <p>No payments recorded yet</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-vintage-beige">
          <button
            @click="closePlanDetailsModal"
            class="btn-secondary w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useSalesStore } from '@/stores/sales'
import { useClientStore } from '@/stores/client'

import * as XLSX from 'xlsx'
import { 
  ArrowLeft,
  Clock,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  X,
  CreditCard,
  RefreshCw,
  Download
} from 'lucide-vue-next'
import type { InstallmentPlan, Sale, InstallmentPayment } from '@/types'

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

// Modal state
const showPaymentModal = ref(false)
const showPlanDetailsModal = ref(false)
const selectedPlan = ref<InstallmentPlan | null>(null)
const selectedPlanPayments = ref<InstallmentPayment[]>([])

// Payment form
const paymentForm = ref({
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'cash',
  notes: ''
})

// Filters
const statusFilter = ref('')

// Computed properties
const activePlansCount = computed(() => 
  installmentPlans.value.filter(plan => {
    // Only count as active if status is Active AND not fully completed
    if (plan.status !== 'Active') return false
    return !isPlanCompleted(plan)
  }).length
)

const totalOutstanding = computed(() => {
  return installmentPlans.value
    .filter(plan => {
      // Only include in outstanding if status is Active AND not fully completed
      if (plan.status !== 'Active') return false
      return !isPlanCompleted(plan)
    })
    .reduce((sum, plan) => {
      const amountPaid = getAmountPaid(plan.planId)
      return sum + (plan.totalAmount - amountPaid)
    }, 0)
})

const overduePaymentsCount = computed(() => {
  const today = new Date()
  return installmentPlans.value.filter(plan => {
    // Only check overdue for active plans that are not fully completed
    if (plan.status !== 'Active') return false
    if (isPlanCompleted(plan)) return false
    const dueDate = new Date(plan.dueDate)
    return dueDate < today
  }).length
})

const canSubmitPayment = computed(() => {
  if (!selectedPlan.value) return false
  const amount = parseFloat(paymentForm.value.amount.toString())
  const remaining = getRemainingAmount(selectedPlan.value)
  
  // Debug logging
  console.log('Payment validation:', {
    amount,
    remaining,
    isValid: amount > 0 && amount <= remaining
  })
  
  return amount > 0 && amount <= remaining
})

// Helper functions for payment preview calculations
const getNewTotalPaid = () => {
  if (!selectedPlan.value) return 0
  const currentPaid = getAmountPaid(selectedPlan.value.planId)
  const newPayment = paymentForm.value.amount || 0
  return currentPaid + newPayment
}

const getNewRemaining = () => {
  if (!selectedPlan.value) return 0
  const currentRemaining = getRemainingAmount(selectedPlan.value)
  const newPayment = paymentForm.value.amount || 0
  return currentRemaining - newPayment
}

// Check if an installment plan is completed (fully paid)
const isPlanCompleted = (plan: InstallmentPlan) => {
  const totalPaid = getAmountPaid(plan.planId)
  const totalAmount = plan.totalAmount || 0
  const isCompleted = totalPaid >= totalAmount
  
  // Debug logging for completed plans
  if (isCompleted) {
    console.log('Plan completed:', {
      planId: plan.planId,
      totalAmount,
      totalPaid,
      downPayment: plan.downPayment,
      additionalPayments: totalPaid - (plan.downPayment || 0)
    })
  }
  
  return isCompleted
}

// Get the effective status for display (auto-update to Completed if fully paid)
const getEffectiveStatus = (plan: InstallmentPlan) => {
  if (isPlanCompleted(plan)) {
    return 'Completed'
  }
  return plan.status || 'Active'
}

const filteredInstallmentPlans = computed(() => {
  if (!statusFilter.value) return installmentPlans.value
  
  return installmentPlans.value.filter(plan => {
    // Use effective status for filtering to include completed plans
    const effectiveStatus = getEffectiveStatus(plan)
    return effectiveStatus === statusFilter.value
  })
})

// Methods
const loadInstallments = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Load installment plans, sales, and payments
    await Promise.all([
      salesStore.fetchInstallmentPlans(),
      salesStore.fetchSales(),
      salesStore.fetchPayments()
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
  // Find the installment plan to get the down payment
  const plan = salesStore.installmentPlans.find(p => p.planId === planId)
  if (!plan) return 0
  
  // Include the down payment that was made when the sale was created
  let totalPaid = plan.downPayment || 0
  
  // Add any additional installment payments
  const payments = salesStore.payments.filter(p => p.planId === planId)
  totalPaid += payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  
  return totalPaid
}

const getRemainingAmount = (plan: InstallmentPlan | null) => {
  if (!plan) return 0
  const amountPaid = getAmountPaid(plan.planId)
  return plan.totalAmount - amountPaid
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

const getPaymentStatusBadgeClass = (status: string) => {
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
  
  switch (status) {
    case 'Completed':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'Pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    case 'Failed':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'Refunded':
      return `${baseClasses} bg-gray-100 text-gray-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

const formatPaymentMethod = (method: string) => {
  // The values are now already properly formatted, just return as is
  return method || 'Unknown'
}



const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}` // Returns DD-MM-YYYY format
  } catch (err) {
    console.error('Error formatting date:', err)
    return dateString // Fallback to original string
  }
}

const viewPlanDetails = async (plan: InstallmentPlan) => {
  selectedPlan.value = plan
  showPlanDetailsModal.value = true
  
  try {
    // Load payments for this plan
    const payments = await salesStore.fetchPayments(plan.planId)
    selectedPlanPayments.value = payments || []
    
    // Debug: Log plan details and calculations
    console.log('Plan Details Modal - Plan:', plan)
    console.log('Plan Details Modal - Down Payment:', plan.downPayment)
    console.log('Plan Details Modal - Total Amount:', plan.totalAmount)
    console.log('Plan Details Modal - Amount Paid (calculated):', getAmountPaid(plan.planId))
    console.log('Plan Details Modal - Remaining (calculated):', getRemainingAmount(plan))
    console.log('Plan Details Modal - Payments loaded:', selectedPlanPayments.value)
    
  } catch (err) {
    console.error('Error loading payments:', err)
    selectedPlanPayments.value = []
    toast.error('Failed to load payment history')
  }
}

const recordPayment = (plan: InstallmentPlan) => {
  selectedPlan.value = plan
  paymentForm.value = {
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    notes: ''
  }
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  selectedPlan.value = null
  paymentForm.value = {
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    notes: ''
  }
}

const closePlanDetailsModal = () => {
  showPlanDetailsModal.value = false
  selectedPlan.value = null
  selectedPlanPayments.value = []
}

const submitPayment = async () => {
  if (!selectedPlan.value) return
  
  try {
    // Calculate the next payment number
    const existingPayments = salesStore.payments.filter(p => p.planId === selectedPlan.value.planId)
    const nextPaymentNumber = existingPayments.length + 1
    
    const paymentData = {
      planId: selectedPlan.value.planId,
      paymentNumber: nextPaymentNumber, // Add the required paymentNumber field
      amount: parseFloat(paymentForm.value.amount.toString()),
      paymentDate: paymentForm.value.paymentDate,
      paymentMethod: paymentForm.value.paymentMethod,
      notes: paymentForm.value.notes
    }
    
    console.log('Submitting payment data:', paymentData)
    
    await salesStore.createPayment(paymentData)
    
    toast.success('Payment recorded successfully')
    closePaymentModal()
    
    // Refresh the data
    await loadInstallments()
    
  } catch (err) {
    console.error('Error recording payment:', err)
    toast.error('Failed to record payment')
  }
}

const applyFilters = () => {
  // Filters are applied automatically through computed properties
  // This method can be extended for additional filtering logic
}

const goBack = () => {
  router.push('/sales')
}

const exportInstallments = async () => {
  try {
    // Get all installment plans data
    const allPlans = installmentPlans.value
    
    if (!allPlans || allPlans.length === 0) {
      toast.error('No installment data to export')
      return
    }
    
    // Prepare data for export
    const exportData = allPlans.map(plan => {
      const sale = sales.value.find(s => s.saleId === plan.saleId)
      const client = sale?.client
      const amountPaid = getAmountPaid(plan.planId)
      const remainingAmount = getRemainingAmount(plan)
      const isCompleted = isPlanCompleted(plan)
      
      return {
        'Plan ID': plan.planId,
        'Sale ID': plan.saleId,
        'Client Name': client?.name || 'N/A',
        'Client Email': client?.email || 'N/A',
        'Client Phone': client?.phone || 'N/A',
        'Total Amount': `$${plan.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
'Down Payment': `$${plan.downPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
'Installment Amount': `$${plan.installmentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        'Number of Installments': plan.numberOfInstallments,
        'Installment Frequency': plan.installmentFrequency,
        'Start Date': formatDate(plan.startDate),
        'Due Date': formatDate(plan.dueDate),
        'Amount Paid': `$${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
'Remaining Amount': `$${remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        'Status': isCompleted ? 'Completed' : plan.status,
        'Is Completed': isCompleted ? 'Yes' : 'No',
        'Notes': plan.notes || 'N/A',
        'Created Date': formatDate(plan.createdAt),
        'Updated Date': formatDate(plan.updatedAt)
      }
    })
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Plan ID
      { wch: 15 }, // Sale ID
      { wch: 20 }, // Client Name
      { wch: 25 }, // Client Email
      { wch: 15 }, // Client Phone
      { wch: 15 }, // Total Amount
      { wch: 15 }, // Down Payment
      { wch: 18 }, // Installment Amount
      { wch: 20 }, // Number of Installments
      { wch: 20 }, // Installment Frequency
      { wch: 15 }, // Start Date
      { wch: 15 }, // Due Date
      { wch: 15 }, // Amount Paid
      { wch: 15 }, // Remaining Amount
      { wch: 12 }, // Status
      { wch: 12 }, // Is Completed
      { wch: 30 }, // Notes
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ]
    worksheet['!cols'] = columnWidths
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Installment Plans')
    
    // Generate filename with current date
    const currentDate = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const filename = `installments_export_${currentDate}.xlsx`
    
    // Save the file
    XLSX.writeFile(workbook, filename)
    
    toast.success(`Exported ${exportData.length} installment plans to ${filename}`)
  } catch (error) {
    console.error('Export error:', error)
    toast.error('Failed to export installment data')
  }
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