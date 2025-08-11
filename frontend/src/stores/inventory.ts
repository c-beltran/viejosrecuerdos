import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  InventoryItem, 
  CreateInventoryItemRequest, 
  UpdateInventoryItemRequest, 
  InventoryFilters,
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  PaginationState
} from '@/types'
import ApiService from '@/utils/api'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const items = ref<InventoryItem[]>([])
  const currentItem = ref<InventoryItem | null>(null)
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
  const filters = ref<InventoryFilters>({
    category: undefined,
    status: undefined,
    search: '',
    limit: 20,
    offset: 0,
    includeQR: false
  })

  // Getters
  const isLoading = computed(() => loading.value.isLoading)
  const error = computed(() => loading.value.error)
  const hasItems = computed(() => items.value.length > 0)
  const totalItems = computed(() => pagination.value.total)
  const currentFilters = computed(() => filters.value)

  // Actions
  const setLoading = (isLoading: boolean, error: string | null = null) => {
    loading.value = { isLoading, error }
  }

  const clearError = () => {
    loading.value.error = null
  }

  // Fetch all inventory items
  const fetchItems = async (newFilters?: Partial<InventoryFilters>) => {
    try {
      setLoading(true)
      
      // Update filters if provided
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters }
      }

      // Build query parameters
      const params = new URLSearchParams()
      Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })

      const url = `/inventory?${params.toString()}`
      
      const response = await ApiService.get<InventoryItem[]>(url)
      
      if (response.success && response.data) {
        // Handle nested data structure
        const itemsData = response.data.data || response.data
        items.value = itemsData
        if (response.count !== undefined) {
          pagination.value.total = response.count
        }
      } else {
        throw new Error(response.error || 'Failed to fetch inventory items')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory items'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch single inventory item
  const fetchItem = async (itemId: string) => {
    try {
      setLoading(true)
      
      const response = await ApiService.get<InventoryItem>(`/inventory/item/${itemId}`)
      
      if (response.success && response.data) {
        // Handle nested data structure
        const itemData = response.data.data || response.data
        currentItem.value = itemData
        return itemData
      } else {
        throw new Error(response.error || 'Failed to fetch inventory item')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory item'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Fetch single inventory item by friendly ID
  const fetchItemByFriendlyId = async (friendlyId: string) => {
    try {
      setLoading(true)
      
      const response = await ApiService.get<InventoryItem>(`/inventory/friendly/${friendlyId}`)
      
      if (response.success && response.data) {
        // Handle nested data structure
        const itemData = response.data.data || response.data
        currentItem.value = itemData

        return itemData
      } else {
        throw new Error(response.error || 'Failed to fetch inventory item')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory item'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create new inventory item
  const createItem = async (itemData: CreateInventoryItemRequest) => {
    try {
      setLoading(true)
      
      const response = await ApiService.post<InventoryItem>('/inventory', itemData)
      
      if (response.success && response.data) {

        // Handle nested data structure
        const itemData = response.data.data || response.data
        items.value.unshift(itemData)
        pagination.value.total += 1
        return itemData
      } else {
        throw new Error(response.error || 'Failed to create inventory item')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create inventory item'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update inventory item
  const updateItem = async (itemId: string, updateData: UpdateInventoryItemRequest) => {
    try {
      setLoading(true)
      
      const response = await ApiService.put<InventoryItem>(`/inventory/item/${itemId}`, updateData)
      
      if (response.success && response.data) {
        // Update in items array
        const index = items.value.findIndex(item => item.itemId === itemId)
        if (index !== -1) {
          items.value[index] = response.data
        }
        
        // Update current item if it's the one being edited
        if (currentItem.value?.itemId === itemId) {
          currentItem.value = response.data
        }
        
        return response.data
      } else {
        throw new Error(response.error || 'Failed to update inventory item')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inventory item'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete inventory item
  const deleteItem = async (itemId: string) => {
    try {
      // Don't set store loading state - let component handle it locally
      // setLoading(true)
      
      const response = await ApiService.delete(`/inventory/item/${itemId}`)
      
      if (response.success) {
        // Remove from items array
        items.value = items.value.filter(item => item.itemId !== itemId)
        
        // Clear current item if it's the one being deleted
        if (currentItem.value?.itemId === itemId) {
          currentItem.value = null
        }
        
        pagination.value.total -= 1
        return true
      } else {
        throw new Error(response.error || 'Failed to delete inventory item')
      }
    } catch (err) {
      // Don't set store loading state - let component handle it locally
      // const errorMessage = err instanceof Error ? err.message : 'Failed to delete inventory item'
      // setLoading(false, errorMessage)
      throw err
    }
    // Don't set store loading state - let component handle it locally
    // finally {
    //   setLoading(false)
    // }
  }

  // Upload image for inventory item
  const uploadImage = async (file: File, itemId: string, onProgress?: (progress: number) => void) => {
    try {
      setLoading(true)

      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image', file)
      
      // Upload to backend S3 endpoint using the correct path

      
      const response = await ApiService.uploadFile(`/images/upload/${itemId}`, formData, (progress) => {
        if (onProgress) {
          onProgress(progress)
        }
      })
      

      
      if (response.success && response.data) {
        // Handle nested response structure
        const uploadData = response.data.data || response.data
        return uploadData
      } else {
        throw new Error(response.error || 'Failed to upload image to S3')
      }
    } catch (err) {
      console.error('S3 upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete image from inventory item
  const deleteImage = async (itemId: string, imageUrl: string) => {
    try {
      setLoading(true)
      
      // TODO: Implement image delete endpoint in backend

      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Generate QR code for inventory item
  const generateQRCode = async (itemId: string) => {
    try {
      setLoading(true)
      
      // TODO: Implement QR code generation endpoint in backend

      
      // Mock QR code URL for now
      const mockQRCodeUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
      
      return { qrCodeUrl: mockQRCodeUrl }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get inventory statistics
  const getStats = async () => {
    try {
      setLoading(true)
      
      const response = await ApiService.get('/inventory/stats')
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error || 'Failed to fetch inventory statistics')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory statistics'
      setLoading(false, errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get categories
  const getCategories = async () => {
    try {
      const response = await ApiService.get('/inventory/categories')
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error || 'Failed to fetch categories')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
      throw err
    }
  }

  // Clear current item
  const clearCurrentItem = () => {
    currentItem.value = null
  }

  // Reset store
  const reset = () => {
    items.value = []
    currentItem.value = null
    loading.value = { isLoading: false, error: null }
    pagination.value = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
    filters.value = {
      category: undefined,
      status: undefined,
      search: '',
      limit: 20,
      offset: 0,
      includeQR: false
    }
  }

  return {
    // State
    items,
    currentItem,
    loading,
    pagination,
    filters,
    
    // Getters
    isLoading,
    error,
    hasItems,
    totalItems,
    currentFilters,
    
    // Actions
    setLoading,
    clearError,
    fetchItems,
    fetchItem,
    fetchItemByFriendlyId,
    createItem,
    updateItem,
    deleteItem,
    uploadImage,
    deleteImage,
    generateQRCode,
    getStats,
    getCategories,
    clearCurrentItem,
    reset
  }
}) 