import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { ApiResponse } from '@/types'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const authStore = useAuthStore()
      const token = await authStore.getAuthToken()
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (err) {
      console.error('API Interceptor: Error getting auth token:', err)
    }
    
    return config
  },
  (error) => {
    console.error('API Interceptor: Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const toast = useToast()
    const authStore = useAuthStore()
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          toast.error('Session expired. Please login again.')
          await authStore.logout()
          window.location.href = '/login'
          break
          
        case 403:
          toast.error('Access denied. You don\'t have permission for this action.')
          break
          
        case 404:
          toast.error('Resource not found.')
          break
          
        case 422:
          // Validation errors
          if (data.details && Array.isArray(data.details)) {
            const errors = data.details.map((err: any) => err.msg).join(', ')
            toast.error(`Validation error: ${errors}`)
          } else {
            toast.error(data.error || 'Validation failed')
          }
          break
          
        case 500:
          toast.error('Server error. Please try again later.')
          break
          
        default:
          toast.error(data.error || 'An error occurred')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred')
    }
    
    return Promise.reject(error)
  }
)

// API service class
export class ApiService {
  // Generic GET request
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(url, config)
      return response.data
    } catch (error) {
      console.error('API Service: Error in GET request:', error)
      throw error
    }
  }

  // Generic POST request
  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(url, data, config)
      return response.data
    } catch (error) {
      console.error('API Service: Error in POST request:', error)
      throw error
    }
  }

  // Generic PUT request
  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Generic PATCH request
  static async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Generic DELETE request
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete(url, config)
      return response.data
    } catch (error) {
      console.error('API Service: Error in DELETE request:', error)
      throw error
    }
  }

  // File upload with progress
  static async uploadFile<T>(
    url: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        }
      })
      
      return response.data
    } catch (error) {
      console.error('API Service: Upload error:', error)
      throw error
    }
  }

  // Multiple file upload
  static async uploadMultipleFiles<T>(
    url: string, 
    files: File[], 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append(`images`, file)
      })
      
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        }
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  }
}

// Export the axios instance for direct use if needed
export { apiClient }

// Export default API service
export default ApiService 