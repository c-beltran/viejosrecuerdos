import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest, 
  ClientFilters,
  LoadingState,
  PaginationState
} from '@/types'
import ApiService from '@/utils/api'

export const useClientStore = defineStore('client', () => {
  // State
  const clients = ref<Client[]>([])
  const currentClient = ref<Client | null>(null)
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
  const filters = ref<ClientFilters>({
    search: '',
    limit: 20,
    offset: 0
  })

  // Getters
  const isLoading = computed(() => loading.value.isLoading)
  const error = computed(() => loading.value.error)
  const hasClients = computed(() => clients.value.length > 0)
  const totalClients = computed(() => pagination.value.total)
  const getClients = computed(() => clients.value)

  // Actions
  const setLoading = (isLoading: boolean, error: string | null = null) => {
    loading.value = { isLoading, error }
  }

  const clearError = () => {
    loading.value.error = null
  }

  // Fetch all clients
  const fetchClients = async (newFilters?: Partial<ClientFilters>) => {
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

      const response = await ApiService.get<Client[]>(`/clients?${params.toString()}`)
      
      if (response.success && response.data) {
        clients.value = response.data
        if (response.count !== undefined) {
          pagination.value.total = response.count
        }
        // Calculate total pages
        pagination.value.totalPages = Math.ceil(pagination.value.total / pagination.value.limit)
      } else {
        throw new Error(response.error || 'Failed to fetch clients')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clients'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch single client
  const fetchClient = async (clientId: string) => {
    // Safety check to prevent API calls with invalid IDs
    if (!clientId || clientId === 'undefined' || clientId === 'new') {
      console.warn('fetchClient called with invalid ID:', clientId)
      throw new Error('Invalid client ID')
    }
    
    try {
      setLoading(true)
      
      const response = await ApiService.get<Client>(`/clients/item/${clientId}`)
      
      if (response.success && response.data) {
        currentClient.value = response.data
        return response.data
      } else {
        throw new Error(response.error || 'Failed to fetch client')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch client'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create new client
  const createClient = async (clientData: CreateClientRequest) => {
    try {
      setLoading(true)
      
      const response = await ApiService.post<Client>('/clients', clientData)
      
      if (response.success && response.data) {
        clients.value.unshift(response.data)
        pagination.value.total += 1
        return response.data
      } else {
        throw new Error(response.error || 'Failed to create client')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create client'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update client
  const updateClient = async (clientId: string, updateData: UpdateClientRequest) => {
    try {
      setLoading(true)
      
      const response = await ApiService.put<Client>(`/clients/item/${clientId}`, updateData)
      
      if (response.success && response.data) {
        const index = clients.value.findIndex(client => client.clientId === clientId)
        if (index !== -1) {
          clients.value[index] = response.data
        }
        
        if (currentClient.value?.clientId === clientId) {
          currentClient.value = response.data
        }
        
        return response.data
      } else {
        throw new Error(response.error || 'Failed to update client')
      }
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete client
  const deleteClient = async (clientId: string) => {
    try {
      setLoading(true)
      
      const response = await ApiService.delete(`/clients/item/${clientId}`)
      
      if (response.success) {
        clients.value = clients.value.filter(client => client.clientId !== clientId)
        
        if (currentClient.value?.clientId === clientId) {
          currentClient.value = null
        }
        
        pagination.value.total -= 1
        return true
      } else {
        throw new Error(response.error || 'Failed to delete client')
      }
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Clear current client
  const clearCurrentClient = () => {
    currentClient.value = null
  }

  // Reset store
  const reset = () => {
    clients.value = []
    currentClient.value = null
    loading.value = { isLoading: false, error: null }
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
    filters.value = {
      search: '',
      limit: 20,
      offset: 0
    }
  }

  return {
    // State
    clients,
    currentClient,
    loading,
    pagination,
    filters,
    
    // Getters
    isLoading,
    error,
    hasClients,
    totalClients,
    getClients,
    
    // Actions
    setLoading,
    clearError,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    clearCurrentClient,
    reset
  }
}) 