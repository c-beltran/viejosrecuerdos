import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  Sale, 
  SaleItem,
  CreateSaleRequest,
  SaleFilters,
  InstallmentPlan,
  InstallmentPayment,
  CreateInstallmentPlanRequest,
  CreatePaymentRequest,
  LoadingState,
  PaginationState,
  SaleCreationResponse
} from '@/types'
import ApiService from '@/utils/api'

export const useSalesStore = defineStore('sales', () => {
  // State
  const sales = ref<Sale[]>([])
  const currentSale = ref<Sale | null>(null)
  const saleItems = ref<SaleItem[]>([])
  const installmentPlans = ref<InstallmentPlan[]>([])
  const currentInstallmentPlan = ref<InstallmentPlan | null>(null)
  const payments = ref<InstallmentPayment[]>([])
  
  // Ensure sales array is always initialized
  if (!Array.isArray(sales.value)) {
    sales.value = []
  }
  
  const loading = ref<LoadingState>({
    isLoading: false,
    error: null
  })
  
  const pagination = ref<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  
  const filters = ref<SaleFilters>({
    status: undefined,
    paymentMethod: undefined,
    startDate: undefined,
    endDate: undefined,
    clientId: undefined,
    limit: 20,
    offset: 0
  })

  // Getters
  const isLoading = computed(() => loading.value.isLoading)
  const error = computed(() => loading.value.error)
  const hasSales = computed(() => sales.value.length > 0)
  const totalSales = computed(() => pagination.value.total)
  const hasInstallmentPlans = computed(() => installmentPlans.value.length > 0)
  
  // Safe getter for sales that ensures array type
  const getSales = computed(() => {
    if (!Array.isArray(sales.value)) {
      console.warn('Sales array is not an array, resetting to empty array')
      sales.value = []
    }
    return sales.value.filter(sale => sale && sale.saleId)
  })

  // Actions
  const setLoading = (isLoading: boolean, error: string | null = null) => {
    loading.value = { isLoading, error }
  }

  const clearError = () => {
    loading.value.error = null
  }

  // Sales Management
  const fetchSales = async (newFilters?: Partial<SaleFilters>) => {
    try {
      setLoading(true)
      
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      const params = new URLSearchParams()
      Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      const response = await ApiService.get<Sale[]>(`/sales?${params.toString()}`)
      
      if (response.success && response.data) {
        sales.value = response.data
        if (response.count !== undefined) {
          pagination.value.total = response.count
        }
      } else {
        throw new Error(response.error || 'Failed to fetch sales')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchSale = async (saleId: string) => {
    try {
      setLoading(true)
      
      const response = await ApiService.get<Sale>(`/sales/item/${saleId}`)
      
      if (response.success && response.data) {
        currentSale.value = response.data
        return response.data
      } else {
        throw new Error(response.error || 'Failed to fetch sale')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sale'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createSale = async (saleData: CreateSaleRequest) => {
    try {
      setLoading(true)
      
      const response = await ApiService.post<SaleCreationResponse>('/sales', saleData)
      
      console.log('Raw API response:', response)
      
      if (response.success && response.data) {
        // Handle different response structures
        let saleData = response.data
        
        // Check if the response has a nested 'sale' property
        if (response.data.sale && response.data.sale.saleId) {
          saleData = response.data.sale
          console.log('Using nested sale data:', saleData)
        }
        
        // Validate the sale data
        if (!saleData.saleId) {
          console.error('Invalid sale response: missing saleId', response.data)
          throw new Error('Invalid sale response from server')
        }
        
        // Ensure the sale object has all required properties
        const validatedSale: Sale = {
          saleId: saleData.saleId,
          clientId: saleData.clientId,
          client: saleData.client,
          saleDate: saleData.saleDate || new Date().toISOString(),
          totalAmount: saleData.totalAmount || 0,
          paymentMethod: saleData.paymentMethod || 'Cash',
          status: saleData.status || 'Pending',
          notes: saleData.notes,
          createdBy: saleData.createdBy || 'system',
          items: saleData.items || response.data.items || [],
          createdAt: saleData.createdAt || new Date().toISOString(),
          updatedAt: saleData.updatedAt || new Date().toISOString()
        }
        
        console.log('Final validated sale object:', validatedSale)
        console.log('Sale items:', validatedSale.items)
        
        console.log('Validated sale:', validatedSale)
        
        sales.value.unshift(validatedSale)
        pagination.value.total += 1
        return validatedSale
      } else {
        throw new Error(response.error || 'Failed to create sale')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sale'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateSale = async (saleId: string, updateData: Partial<Sale>) => {
    try {
      setLoading(true)
      
      // For now, we only support status updates via the backend API
      if (updateData.status) {
        const response = await ApiService.put<Sale>(`/sales/item/${saleId}/status`, { status: updateData.status })
        
        if (response.success && response.data) {
          const index = sales.value.findIndex(sale => sale.saleId === saleId)
          if (index !== -1) {
            sales.value[index] = response.data
          }
          
          if (currentSale.value?.saleId === saleId) {
            currentSale.value = response.data
          }
          
          return response.data
        } else {
          throw new Error(response.error || 'Failed to update sale status')
        }
      } else {
        throw new Error('Only status updates are currently supported')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update sale'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteSale = async (saleId: string) => {
    try {
      setLoading(true)
      
      const response = await ApiService.delete(`/sales/${saleId}`)
      
      if (response.success) {
        sales.value = sales.value.filter(sale => sale.saleId !== saleId)
        
        if (currentSale.value?.saleId === saleId) {
          currentSale.value = null
        }
        
        pagination.value.total -= 1
        return true
      } else {
        throw new Error(response.error || 'Failed to delete sale')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sale'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Installment Plans Management
  const fetchInstallmentPlans = async (saleId?: string) => {
    try {
      setLoading(true)
      
      const url = saleId ? `/installments/plans?saleId=${saleId}` : '/installments/plans'
      const response = await ApiService.get<InstallmentPlan[]>(url)
      
      if (response.success && response.data) {
        installmentPlans.value = response.data
        return response.data
      } else {
        throw new Error(response.error || 'Failed to fetch installment plans')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch installment plans'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchInstallmentPlan = async (planId: string) => {
    try {
      setLoading(true)
      
      const response = await ApiService.get<InstallmentPlan>(`/installments/plans/${planId}`)
      
      if (response.success && response.data) {
        currentInstallmentPlan.value = response.data
        return response.data
      } else {
        throw new Error(response.error || 'Failed to fetch installment plan')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch installment plan'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createInstallmentPlan = async (planData: CreateInstallmentPlanRequest) => {
    try {
      setLoading(true)
      
      const response = await ApiService.post<InstallmentPlan>('/installments/plans', planData)
      
      if (response.success && response.data) {
        installmentPlans.value.unshift(response.data)
        return response.data
      } else {
        throw new Error(response.error || 'Failed to create installment plan')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create installment plan'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateInstallmentPlan = async (planId: string, updateData: Partial<InstallmentPlan>) => {
    try {
      setLoading(true)
      
      const response = await ApiService.put<InstallmentPlan>(`/installments/plans/${planId}`, updateData)
      
      if (response.success && response.data) {
        const index = installmentPlans.value.findIndex(plan => plan.planId === planId)
        if (index !== -1) {
          installmentPlans.value[index] = response.data
        }
        
        if (currentInstallmentPlan.value?.planId === planId) {
          currentInstallmentPlan.value = response.data
        }
        
        return response.data
      } else {
        throw new Error(response.error || 'Failed to update installment plan')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update installment plan'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Payments Management
  const fetchPayments = async (planId?: string) => {
    try {
      setLoading(true)
      
      const url = planId ? `/installments/payments?planId=${planId}` : '/installments/payments'
      const response = await ApiService.get<InstallmentPayment[]>(url)
      
      if (response.success && response.data) {
        payments.value = response.data
        return response.data
      } else {
        throw new Error(response.error || 'Failed to fetch payments')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async (paymentData: CreatePaymentRequest) => {
    try {
      setLoading(true)
      
      const response = await ApiService.post<InstallmentPayment>('/installments/payments', paymentData)
      
      if (response.success && response.data) {
        payments.value.unshift(response.data)
        return response.data
      } else {
        throw new Error(response.error || 'Failed to create payment')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePayment = async (paymentId: string, updateData: Partial<InstallmentPayment>) => {
    try {
      setLoading(true)
      
      const response = await ApiService.put<InstallmentPayment>(`/installments/payments/${paymentId}`, updateData)
      
      if (response.success && response.data) {
        const index = payments.value.findIndex(payment => payment.paymentId === paymentId)
        if (index !== -1) {
          payments.value[index] = response.data
        }
        
        return response.data
      } else {
        throw new Error(response.error || 'Failed to update payment')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get installment plan summary
  const getInstallmentPlanSummary = async (planId: string) => {
    try {
      const response = await ApiService.get(`/installments/plans/${planId}/summary`)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error || 'Failed to fetch installment plan summary')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch installment plan summary'
      throw err
    }
  }

  // Clear current items
  const clearCurrentSale = () => {
    currentSale.value = null
  }

  const clearCurrentInstallmentPlan = () => {
    currentInstallmentPlan.value = null
  }

  // Reset store
  const reset = () => {
    sales.value = []
    currentSale.value = null
    saleItems.value = []
    installmentPlans.value = []
    currentInstallmentPlan.value = null
    payments.value = []
    loading.value = { isLoading: false, error: null }
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
    filters.value = {
      status: undefined,
      paymentMethod: undefined,
      startDate: undefined,
      endDate: undefined,
      clientId: undefined,
      limit: 20,
      offset: 0
    }
  }

  return {
    // State
    sales,
    currentSale,
    saleItems,
    installmentPlans,
    currentInstallmentPlan,
    payments,
    loading,
    pagination,
    filters,
    
    // Getters
    isLoading,
    error,
    hasSales,
    totalSales,
    hasInstallmentPlans,
    getSales,
    
    // Actions
    setLoading,
    clearError,
    fetchSales,
    fetchSale,
    createSale,
    updateSale,
    deleteSale,
    fetchInstallmentPlans,
    fetchInstallmentPlan,
    createInstallmentPlan,
    updateInstallmentPlan,
    fetchPayments,
    createPayment,
    updatePayment,
    getInstallmentPlanSummary,
    clearCurrentSale,
    clearCurrentInstallmentPlan,
    reset
  }
}) 