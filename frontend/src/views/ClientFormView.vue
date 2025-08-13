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
        <div>
          <h1 class="font-display text-3xl lg:text-4xl text-vintage-charcoal">
            {{ isEditing ? 'Edit Client' : 'Add New Client' }}
          </h1>
          <p class="text-vintage-gray text-lg">
            {{ isEditing ? 'Update client information' : 'Create a new client profile' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="max-w-4xl mx-auto">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Basic Information -->
        <div class="card-antique p-6">
          <h2 class="text-xl font-semibold text-vintage-charcoal mb-6 flex items-center gap-2">
            <User class="w-5 h-5" />
            Basic Information
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-medium text-vintage-charcoal mb-2">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                :class="[
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent transition-colors',
                  errors.name ? 'border-red-300 bg-red-50' : 'border-vintage-beige bg-white'
                ]"
                placeholder="Enter client's full name"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-vintage-charcoal mb-2">
                Email Address
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                :class="[
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent transition-colors',
                  errors.email ? 'border-red-300 bg-red-50' : 'border-vintage-beige bg-white'
                ]"
                placeholder="client@example.com"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-vintage-charcoal mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                :class="[
                  'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent transition-colors',
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-vintage-beige bg-white'
                ]"
                placeholder="+1 (555) 123-4567"
              />
              <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
            </div>

            <div>
              <label for="address" class="block text-sm font-medium text-vintage-charcoal mb-2">
                Address
              </label>
              <input
                id="address"
                v-model="form.address"
                type="text"
                class="w-full px-4 py-3 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent bg-white transition-colors"
                placeholder="123 Main Street, Manhattan, 11101"
              />
            </div>
          </div>
        </div>



                <!-- Notes -->
        <div class="card-antique p-6">
          <h2 class="text-xl font-semibold text-vintage-charcoal mb-6 flex items-center gap-2">
            <FileText class="w-5 h-5" />
            Notes
          </h2>
          
          <div>
            <label for="notes" class="block text-sm font-medium text-vintage-charcoal mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              rows="4"
              class="w-full px-4 py-3 border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent bg-white transition-colors resize-none"
              placeholder="Add any additional notes about this client..."
            ></textarea>
          </div>
        </div>




        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            @click="goBack"
            class="btn-secondary px-8 py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary px-8 py-3 flex items-center gap-2"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Client' : 'Create Client') }}
          </button>
        </div>
      </form>
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
  FileText, 
  Loader2 
} from 'lucide-vue-next'
import type { Client, CreateClientRequest, UpdateClientRequest } from '@/types'

// Composables
const route = useRoute()
const router = useRouter()
const toast = useToast()
const clientStore = useClientStore()

// Reactive state
const isSubmitting = ref(false)

// Form data
const form = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  notes: ''
})

// Form validation errors
const errors = ref<Record<string, string>>({})

// Computed properties
const isEditing = computed(() => route.name === 'client-edit')
const clientId = computed(() => route.params.id as string)

// Methods
const goBack = () => {
  router.push('/clients')
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!form.value.name.trim()) {
    errors.value.name = 'Client name is required'
  }
  
  if (form.value.email && !isValidEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  if (form.value.phone && !isValidPhone(form.value.phone)) {
    errors.value.phone = 'Please enter a valid phone number'
  }
  
  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}



const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error('Please fix the errors in the form')
    return
  }
  
  try {
    isSubmitting.value = true
    
    // Prepare client data - only send fields supported by the API
    const clientData = {
      name: form.value.name.trim(),
      email: form.value.email.trim() || undefined,
      phone: form.value.phone.trim() || undefined,
      address: form.value.address.trim() || undefined,
      notes: form.value.notes.trim() || undefined
    }
    
    if (isEditing.value) {
      await clientStore.updateClient(clientId.value, clientData)
      toast.success('Client updated successfully')
    } else {
      await clientStore.createClient(clientData)
      toast.success('Client created successfully')
    }
    
    goBack()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save client'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

const loadClient = async () => {
  // Double-check that we should be loading a client
  if (!isEditing.value || !clientId.value || clientId.value === 'new') {
    return
  }
  
  try {
    const client = await clientStore.fetchClient(clientId.value)
    if (client) {
      // Populate form with existing client data
      form.value.name = client.name
      form.value.email = client.email || ''
      form.value.phone = client.phone || ''
      form.value.address = client.address || ''
      form.value.notes = client.notes || ''
    }
  } catch (err) {
    toast.error('Failed to load client data')
    goBack()
  }
}

// Lifecycle
onMounted(() => {
  // Only load client data if we're editing an existing client
  if (isEditing.value && clientId.value && clientId.value !== 'new') {
    loadClient()
  }
})


</script>

<style scoped>
.btn-primary {
  @apply bg-antique-gold text-white px-4 py-2 rounded-lg font-medium hover:bg-antique-bronze transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-vintage-beige text-vintage-charcoal px-4 py-2 rounded-lg font-medium hover:bg-antique-gold hover:text-white transition-colors;
}

.card-antique {
  @apply bg-white rounded-lg shadow-sm border border-vintage-beige;
}
</style> 