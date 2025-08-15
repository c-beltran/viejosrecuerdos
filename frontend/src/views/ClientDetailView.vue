<template>
  <div class="min-h-screen bg-vintage-ivory p-4 lg:p-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-4 mb-4">
        <button
          @click="goBack"
          class="p-2 text-vintage-gray hover:text-vintage-charcoal transition-colors"
        >
          <ArrowLeft class="w-6 h-6" />
        </button>
        <div class="flex-1">
          <h1 class="font-display text-3xl lg:text-4xl text-vintage-charcoal">
            {{ client?.name || 'Client Details' }}
          </h1>
          <p class="text-vintage-gray text-lg">
            View and manage client information
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="editClient"
            class="btn-secondary flex items-center gap-2"
          >
            <Edit class="w-4 h-4" />
            Edit
          </button>
          <button
            @click="deleteClient"
            class="btn-danger flex items-center gap-2"
          >
            <Trash2 class="w-4 h-4" />
            Delete
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
      <h3 class="text-xl font-semibold text-vintage-charcoal mb-2">Error Loading Client</h3>
      <p class="text-vintage-gray mb-4">{{ error }}</p>
      <button @click="loadClient" class="btn-primary">Try Again</button>
    </div>

    <!-- Client Content -->
    <div v-else-if="client" class="max-w-6xl mx-auto space-y-8">
      <!-- Client Overview -->
      <div class="card-antique p-6">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-green-100 rounded-full">
            <Calendar class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p class="text-vintage-gray text-sm">Member Since</p>
            <p class="text-lg font-semibold text-vintage-charcoal">
              {{ formatDate(client.createdAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - Client Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information -->
          <div class="card-antique p-6">
            <h2 class="text-xl font-semibold text-vintage-charcoal mb-6 flex items-center gap-2">
              <User class="w-5 h-5" />
              Basic Information
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-vintage-gray mb-1">Full Name</label>
                <p class="text-vintage-charcoal font-medium">{{ client.name }}</p>
              </div>
              
              <div v-if="client.email">
                <label class="block text-sm font-medium text-vintage-gray mb-1">Email Address</label>
                <p class="text-vintage-charcoal">
                  <a :href="`mailto:${client.email}`" class="text-antique-gold hover:underline">
                    {{ client.email }}
                  </a>
                </p>
              </div>
              
              <div v-if="client.phone">
                <label class="block text-sm font-medium text-vintage-gray mb-1">Phone Number</label>
                <p class="text-vintage-charcoal">
                  <a :href="`tel:${client.phone}`" class="text-antique-gold hover:underline">
                    {{ client.phone }}
                  </a>
                </p>
              </div>
              
              <div v-if="getAdditionalInfo('company')">
                <label class="block text-sm font-medium text-vintage-gray mb-1">Company</label>
                <p class="text-vintage-charcoal">{{ getAdditionalInfo('company') }}</p>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div v-if="hasAddressInfo()" class="card-antique p-6">
            <h2 class="text-xl font-semibold text-vintage-charcoal mb-6 flex items-center gap-2">
              <MapPin class="w-5 h-5" />
              Address Information
            </h2>
            
            <div class="space-y-3">
              <div v-if="client.address">
                <label class="block text-sm font-medium text-vintage-gray mb-1">Street Address</label>
                <p class="text-vintage-charcoal">{{ client.address }}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-if="getAdditionalInfo('city')">
                  <label class="block text-sm font-medium text-vintage-gray mb-1">City</label>
                  <p class="text-vintage-charcoal">{{ getAdditionalInfo('city') }}</p>
                </div>
                
                <div v-if="getAdditionalInfo('state')">
                  <label class="block text-sm font-medium text-vintage-gray mb-1">State/Province</label>
                  <p class="text-vintage-charcoal">{{ getAdditionalInfo('state') }}</p>
                </div>
                
                <div v-if="getAdditionalInfo('zipCode')">
                  <label class="block text-sm font-medium text-vintage-gray mb-1">ZIP/Postal Code</label>
                  <p class="text-vintage-charcoal">{{ getAdditionalInfo('zipCode') }}</p>
                </div>
              </div>
              
              <div v-if="getAdditionalInfo('country')">
                <label class="block text-sm font-medium text-vintage-gray mb-1">Country</label>
                <p class="text-vintage-charcoal">{{ getAdditionalInfo('country') }}</p>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="client.notes" class="card-antique p-6">
            <h2 class="text-xl font-semibold text-vintage-charcoal mb-6 flex items-center gap-2">
              <FileText class="w-5 h-5" />
              Notes
            </h2>
            
            <div>
              <p class="text-vintage-charcoal bg-vintage-ivory p-4 rounded-lg">
                {{ client.notes }}
              </p>
            </div>
          </div>

          <!-- Client History -->
          <div class="card-antique p-6">
            <h2 class="text-xl font-semibold text-vintage-charcoal mb-6 flex items-center gap-2">
              <Clock class="w-5 h-5" />
              Client History
            </h2>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-vintage-ivory rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-antique-gold rounded-full">
                    <UserPlus class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p class="text-vintage-charcoal font-medium">Client Created</p>
                    <p class="text-sm text-vintage-gray">{{ formatDate(client.createdAt) }}</p>
                  </div>
                </div>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-vintage-ivory rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-antique-gold rounded-full">
                    <Edit class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p class="text-vintage-charcoal font-medium">Last Updated</p>
                    <p class="text-sm text-vintage-gray">{{ formatDate(client.updatedAt) }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Placeholder for future activity items -->
              <div class="text-center py-8 text-vintage-gray">
                <Clock class="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <p class="text-sm">Future interactions will appear here</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="card-antique p-6">
            <h3 class="text-lg font-semibold text-vintage-charcoal mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <button
                @click="createSale"
                class="w-full btn-primary text-left flex items-center gap-2"
              >
                <Plus class="w-4 h-4" />
                Create Sale
              </button>
            </div>
          </div>

          <!-- Client Stats -->
          <div class="card-antique p-6">
            <h3 class="text-lg font-semibold text-vintage-charcoal mb-4">Client Statistics</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-vintage-gray">Total Sales</span>
                <span class="text-vintage-charcoal font-semibold">0</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-vintage-gray">Total Value</span>
                <span class="text-vintage-charcoal font-semibold">$0.00</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-vintage-gray">Last Purchase</span>
                <span class="text-vintage-charcoal font-semibold">Never</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-vintage-gray">Average Order</span>
                <span class="text-vintage-charcoal font-semibold">$0.00</span>
              </div>
            </div>
          </div>

          <!-- Related Items -->
          <div class="card-antique p-6">
            <h3 class="text-lg font-semibold text-vintage-charcoal mb-4">Related Items</h3>
            <div class="space-y-3">
              <div class="text-center py-6 text-vintage-gray">
                <Package class="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p class="text-sm">No related items</p>
              </div>
            </div>
          </div>
        </div>
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
          Are you sure you want to delete <strong>{{ client?.name }}</strong>? This action cannot be undone.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="showDeleteModal = false"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useClientStore } from '@/stores/client'
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  FileText, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  AlertCircle,
  Calendar,
  Clock,
  UserPlus,
  Plus,
  Package
} from 'lucide-vue-next'
import type { Client } from '@/types'

// Composables
const route = useRoute()
const router = useRouter()
const toast = useToast()
const clientStore = useClientStore()

// Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)
const client = ref<Client | null>(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Computed properties
const clientId = computed(() => route.params.id as string)

// Methods
const goBack = () => {
  router.push('/clients')
}

const loadClient = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const clientData = await clientStore.fetchClient(clientId.value)
    client.value = clientData
  } catch (err) {
    console.error('Error loading client:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load client'
    toast.error('Failed to load client')
  } finally {
    isLoading.value = false
  }
}

const editClient = () => {
  router.push(`/clients/${clientId.value}/edit`)
}

const deleteClient = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!client.value) return
  
  try {
    isDeleting.value = true
    await clientStore.deleteClient(client.value.clientId)
    
    toast.success('Client deleted successfully')
    goBack()
  } catch (err) {
    toast.error('Failed to delete client')
  } finally {
    isDeleting.value = false
    showDeleteModal.value = false
  }
}

const getAdditionalInfo = (key: string): any => {
  if (!client.value?.notes) return null
  
  try {
    if (client.value.notes.includes('additionalInfo')) {
      const additionalInfo = JSON.parse(client.value.notes)
      return additionalInfo[key]
    }
  } catch (e) {
    console.warn('Failed to parse additional client info:', e)
  }
  
  return null
}

const hasAddressInfo = (): boolean => {
  return !!(client.value?.address || 
           getAdditionalInfo('city') || 
           getAdditionalInfo('state') || 
           getAdditionalInfo('zipCode') || 
           getAdditionalInfo('country'))
}



const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}



// Placeholder methods for future features
const createSale = () => {
  toast.info('Create sale feature coming soon!')
}



// Lifecycle
onMounted(() => {
  loadClient()
})
</script>

<style scoped>
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

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 