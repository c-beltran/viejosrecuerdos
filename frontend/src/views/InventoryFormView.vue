<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-display text-3xl text-vintage-charcoal mb-2">
          {{ isEditing ? 'Edit Item' : 'Add New Item' }}
        </h1>
        <p class="text-vintage-gray">
          {{ isEditing ? 'Update your antique item details' : 'Add a new item to your collection' }}
        </p>
      </div>
      <button 
        @click="router.push('/inventory')" 
        class="btn-antique-secondary"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Inventory
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && isEditing" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="loading-spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-vintage-gray">Loading item details...</p>
      </div>
    </div>

    <!-- Friendly ID Display (when editing) -->
    <div v-if="isEditing && item?.friendlyId" class="card-antique p-4 mb-6">
      <div class="flex items-center space-x-3">
        <span class="text-sm text-vintage-gray">Friendly ID:</span>
        <span class="font-mono font-semibold text-lg text-vintage-charcoal bg-vintage-beige px-3 py-1 rounded">{{ item.friendlyId }}</span>
        <span class="text-xs text-vintage-gray">(Auto-generated, cannot be changed)</span>
      </div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit" class="max-w-4xl">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information -->
          <div class="card-antique p-6">
            <h2 class="font-display text-xl text-vintage-charcoal mb-4">Basic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="itemName" class="block text-sm font-medium text-vintage-charcoal mb-2">
                  Item Name *
                </label>
                <input
                  id="itemName"
                  v-model="form.itemName"
                  type="text"
                  required
                  class="input-antique"
                  placeholder="Enter item name"
                  :disabled="isSubmitting"
                />
              </div>
              <div>
                <label for="category" class="block text-sm font-medium text-vintage-charcoal mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  v-model="form.category"
                  required
                  class="input-antique"
                  :disabled="isSubmitting"
                >
                  <option value="">Select Category</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label for="description" class="block text-sm font-medium text-vintage-charcoal mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="form.descripcionArticulo"
                  rows="3"
                  class="input-antique"
                  placeholder="Describe the item, its condition, history, etc."
                  :disabled="isSubmitting"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Pricing & Quantity -->
          <div class="card-antique p-6">
            <h2 class="font-display text-xl text-vintage-charcoal mb-4">Pricing & Quantity</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="unitPrice" class="block text-sm font-medium text-vintage-charcoal mb-2">
                  Unit Price *
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-vintage-gray">$</span>
                  <input
                    id="unitPrice"
                    v-model.number="form.unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="input-antique pl-8"
                    placeholder="0.00"
                    :disabled="isSubmitting"
                  />
                </div>
              </div>
              <div>
                <label for="initialQuantity" class="block text-sm font-medium text-vintage-charcoal mb-2">
                  Initial Quantity *
                </label>
                <input
                  id="initialQuantity"
                  v-model.number="form.initialQuantity"
                  type="number"
                  min="1"
                  required
                  class="input-antique"
                  placeholder="1"
                  :disabled="isSubmitting"
                />
              </div>
              <div>
                <label for="currentQuantity" class="block text-sm font-medium text-vintage-charcoal mb-2">
                  Current Quantity *
                </label>
                <input
                  id="currentQuantity"
                  v-model.number="form.currentQuantity"
                  type="number"
                  min="0"
                  required
                  class="input-antique"
                  placeholder="1"
                  :disabled="isSubmitting"
                />
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="card-antique p-6">
            <h2 class="font-display text-xl text-vintage-charcoal mb-4">Additional Information</h2>
            <div class="space-y-4">
              <div>
                <label for="internalNotes" class="block text-sm font-medium text-vintage-charcoal mb-2">
                  Internal Notes
                </label>
                <textarea
                  id="internalNotes"
                  v-model="form.internalNotes"
                  rows="3"
                  class="input-antique"
                  placeholder="Private notes about the item (not visible to customers)"
                  :disabled="isSubmitting"
                ></textarea>
              </div>
              <div>
                <label for="status" class="block text-sm font-medium text-vintage-charcoal mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  v-model="form.status"
                  required
                  class="input-antique"
                  :disabled="isSubmitting"
                >
                  <option value="Available">Available</option>
                  <option value="Sold-Out">Sold Out</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Image Upload -->
        <div class="space-y-6">
          <div class="card-antique p-6">
            <h2 class="font-display text-xl text-vintage-charcoal mb-4">Images</h2>
            
            <!-- Image Upload Area -->
            <div class="space-y-4">
              <!-- Upload Button -->
              <div 
                @click="triggerFileInput"
                @dragover.prevent
                @drop.prevent="handleDrop"
                class="border-2 border-dashed border-vintage-beige rounded-lg p-6 text-center cursor-pointer hover:border-antique-gold transition-colors"
                :class="{ 'border-antique-gold bg-antique-gold/5': isDragOver }"
              >
                <Upload class="w-8 h-8 text-vintage-gray mx-auto mb-2" />
                <p class="text-vintage-charcoal font-medium mb-1">Upload Images</p>
                <p class="text-sm text-vintage-gray">Drag & drop or click to browse</p>
                <p class="text-xs text-vintage-gray mt-1">JPEG, PNG, WebP up to 10MB</p>
              </div>
              
              <!-- Hidden File Input -->
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />

              <!-- Upload Progress -->
              <div v-if="uploadProgress.length > 0" class="space-y-2">
                <div 
                  v-for="progress in uploadProgress" 
                  :key="progress.fileName"
                  class="bg-vintage-beige rounded-lg p-3"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-vintage-charcoal truncate">{{ progress.fileName }}</span>
                    <span class="text-xs text-vintage-gray">{{ progress.progress }}%</span>
                  </div>
                  <div class="w-full bg-white rounded-full h-2">
                    <div 
                      class="bg-antique-gold h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${progress.progress}%` }"
                    ></div>
                  </div>
                  <div v-if="progress.status === 'error'" class="text-red-500 text-xs mt-1">
                    {{ progress.error }}
                  </div>
                </div>
              </div>

              <!-- Image Gallery -->
              <div v-if="hasImages" class="space-y-3">
                <!-- Debug info -->
                <div class="text-xs text-gray-500">
                  Pending: {{ pendingImages.length }}, Existing: {{ existingImages.length }}
                </div>
                <h3 class="text-sm font-medium text-vintage-charcoal">Images</h3>
                <div class="grid grid-cols-2 gap-3">
                  <!-- Pending Images (for new items) -->
                  <div 
                    v-for="(file, index) in pendingImages" 
                    :key="`pending-${index}`"
                    class="relative group"
                  >
                    <img 
                      :src="getFileUrl(file)" 
                      :alt="`Pending image ${index + 1}`"
                      class="w-full h-24 object-cover rounded-lg"
                    />
                    <div class="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Pending
                    </div>
                    <button
                      @click="removeImage(index)"
                      class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Remove image"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                  
                  <!-- Existing Images -->
                  <div 
                    v-for="(image, index) in existingImages" 
                    :key="`existing-${index}`"
                    class="relative group"
                  >
                    <img 
                      :src="image.thumbnail" 
                      :alt="`Item image ${index + 1}`"
                      class="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      @click="removeImage((pendingImages.length) + index)"
                      class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      title="Remove image"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="card-antique p-6">
            <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                :disabled="isSubmitting"
                class="btn-antique flex-1"
              >
                <Save v-if="!isSubmitting" class="w-4 h-4 mr-2" />
                <div v-else class="loading-spinner w-4 h-4 mr-2"></div>
                {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Item' : 'Add Item') }}
              </button>
              <button
                type="button"
                @click="router.push('/inventory')"
                :disabled="isSubmitting"
                class="btn-antique-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useInventoryStore } from '@/stores/inventory'
import { 
  ArrowLeft, 
  Upload, 
  Save, 
  X,
  Package
} from 'lucide-vue-next'
import type { CreateInventoryItemRequest, UpdateInventoryItemRequest, ImageData } from '@/types'

// Composables
const router = useRouter()
const route = useRoute()
const toast = useToast()
const inventoryStore = useInventoryStore()

// Reactive state
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDragOver = ref(false)
const uploadProgress = ref<Array<{ fileName: string; progress: number; status: 'uploading' | 'completed' | 'error'; error?: string }>>([])

// Form data
const form = ref<CreateInventoryItemRequest & { currentQuantity: number; pendingImages?: File[] }>({
  itemName: '',
  descripcionArticulo: '',
  category: 'Mobiliario',
  initialQuantity: 1,
  currentQuantity: 1,
  unitPrice: 0,
  internalNotes: '',
  imageUrls: [],
  pendingImages: []
})

// Computed properties
const isEditing = computed(() => {
  console.log('Route params:', route.params)
  console.log('Route path:', route.path)
  console.log('Is editing check:', route.path.includes('/edit'))
  return route.path.includes('/edit')
})
const itemId = computed(() => route.params.id as string)

// Computed properties for images
const pendingImages = computed(() => {
  console.log('Pending images computed:', form.value.pendingImages)
  return form.value.pendingImages || []
})
const existingImages = computed(() => getValidImages(form.value.imageUrls))
const hasImages = computed(() => pendingImages.value.length > 0 || existingImages.value.length > 0)

const categories = [
  'Mobiliario', 'Porcelana', 'Cristal', 'Joyeria', 'Arte', 'Libros', 
  'Textiles', 'Decoracion', 'Herramientas', 'Musica', 'Relojes', 'Otros'
]

// File input ref
const fileInput = ref<HTMLInputElement>()

// Methods
const loadItem = async () => {
  if (!isEditing.value) return

  try {
    isLoading.value = true
    const item = await inventoryStore.fetchItem(itemId.value)
    if (item) {
              form.value = {
          itemName: item.itemName,
          descripcionArticulo: item.descripcionArticulo || '',
          category: item.category,
          initialQuantity: item.initialQuantity,
          currentQuantity: item.currentQuantity,
          unitPrice: item.unitPrice,
          internalNotes: item.internalNotes || '',
          imageUrls: getValidImages(item.imageUrls) || []
        }
    }
  } catch (err) {
    toast.error('Failed to load item details')
    router.push('/inventory')
  } finally {
    isLoading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const handleFiles = async (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) {
    toast.error('Please select valid image files')
    return
  }

  for (const file of imageFiles) {
    await uploadImage(file)
  }
}

const uploadImage = async (file: File) => {
  const progressItem = {
    fileName: file.name,
    progress: 0,
    status: 'uploading' as const
  }
  
  uploadProgress.value.push(progressItem)

  try {
    // For new items, we'll store the file temporarily and upload after item creation
    if (!isEditing.value) {
      // Store file for later upload
      if (!form.value.pendingImages) {
        form.value.pendingImages = []
      }
      form.value.pendingImages.push(file)
      console.log('Added pending image:', file.name, 'Total pending:', form.value.pendingImages.length)
      console.log('Form pendingImages array:', form.value.pendingImages)
      
      // Force reactivity update
      form.value.pendingImages = [...form.value.pendingImages]
      
      // Simulate progress for now
      const progressInterval = setInterval(() => {
        if (progressItem.progress < 90) {
          progressItem.progress += 10
        }
      }, 100)
      
      setTimeout(() => {
        clearInterval(progressInterval)
        progressItem.progress = 100
        progressItem.status = 'completed'
        
        // Remove progress item after a delay
        setTimeout(() => {
          const index = uploadProgress.value.findIndex(p => p.fileName === file.name)
          if (index > -1) {
            uploadProgress.value.splice(index, 1)
          }
        }, 2000)
      }, 1000)
      
      toast.info(`${file.name} will be uploaded after item creation`)
      
      // The image will now show up in the gallery since we added it to pendingImages
      return
    }

    // For editing existing items, upload immediately
    const imageData = await inventoryStore.uploadImage(file, itemId.value, (progress) => {
      progressItem.progress = progress
    })

    progressItem.progress = 100
    progressItem.status = 'completed'

    form.value.imageUrls.push(imageData)
    
    // Remove progress item after a delay
    setTimeout(() => {
      const index = uploadProgress.value.findIndex(p => p.fileName === file.name)
      if (index > -1) {
        uploadProgress.value.splice(index, 1)
      }
    }, 2000)

  } catch (err) {
    progressItem.status = 'error'
    progressItem.error = err instanceof Error ? err.message : 'Upload failed'
    toast.error(`Failed to upload ${file.name}`)
  }
}

const removeImage = (index: number) => {
  // Check if we're removing a pending image or an existing image
  if (form.value.pendingImages && index < form.value.pendingImages.length) {
    form.value.pendingImages.splice(index, 1)
  } else {
    // Adjust index for existing images
    const existingImageIndex = form.value.pendingImages ? index - form.value.pendingImages.length : index
    if (existingImageIndex >= 0 && existingImageIndex < form.value.imageUrls.length) {
      form.value.imageUrls.splice(existingImageIndex, 1)
    }
  }
}

const getValidImages = (imageUrls: any[] | undefined) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return []
  
  // Filter out strings and return only valid image objects
  return imageUrls.filter(img => 
    img && typeof img === 'object' && img.thumbnail && img.original
  )
}

const getFileUrl = (file: File | undefined) => {
  if (!file) return ''
  try {
    return URL.createObjectURL(file)
  } catch (err) {
    console.error('Error creating object URL:', err)
    return ''
  }
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    console.log('Form submit - isEditing:', isEditing.value)
    console.log('Form submit - route path:', route.path)
    console.log('Form submit - route params:', route.params)
    console.log('Form submit - will make:', isEditing.value ? 'PUT request' : 'POST request')

    if (isEditing.value) {
      const updateData: UpdateInventoryItemRequest = {
        itemName: form.value.itemName,
        descripcionArticulo: form.value.descripcionArticulo,
        category: form.value.category,
        initialQuantity: form.value.initialQuantity,
        currentQuantity: form.value.currentQuantity,
        unitPrice: form.value.unitPrice,
        internalNotes: form.value.internalNotes,
        imageUrls: form.value.imageUrls
      }
      
      await inventoryStore.updateItem(itemId.value, updateData)
      toast.success('Item updated successfully')
    } else {
      const createData: CreateInventoryItemRequest = {
        itemName: form.value.itemName,
        descripcionArticulo: form.value.descripcionArticulo,
        category: form.value.category,
        initialQuantity: form.value.initialQuantity,
        currentQuantity: form.value.currentQuantity,
        unitPrice: form.value.unitPrice,
        internalNotes: form.value.internalNotes,
        imageUrls: form.value.imageUrls
      }
      
      console.log('Form submit - createData:', createData)
      console.log('Form submit - calling inventoryStore.createItem')
      
      // Create the item first
      const createdItem = await inventoryStore.createItem(createData)
      console.log('Item created:', createdItem)
      console.log('Created item ID:', createdItem?.itemId)
      console.log('Created item type:', typeof createdItem)
      
      // Upload pending images if any
      if (form.value.pendingImages && form.value.pendingImages.length > 0) {
        console.log('Uploading pending images:', form.value.pendingImages.length)
        
        for (const file of form.value.pendingImages) {
          try {
            const uploadResponse = await inventoryStore.uploadImage(file, createdItem.itemId)
            console.log('Image upload response:', uploadResponse)
            
            // Extract just the image data from the response
            const imageData = uploadResponse.image || uploadResponse
            console.log('Extracted image data:', imageData)
            
            // Add the uploaded image to the item's imageUrls
            const updatedImageUrls = [...(createdItem.imageUrls || []), imageData]
            
            // Update the item with the new image
            await inventoryStore.updateItem(createdItem.itemId, {
              ...createData,
              imageUrls: updatedImageUrls
            })
            
            toast.success(`Image ${file.name} uploaded successfully`)
          } catch (err) {
            console.error('Failed to upload image:', file.name, err)
            toast.error(`Failed to upload ${file.name}`)
          }
        }
      }
      
      toast.success('Item added successfully')
    }

    router.push('/inventory')
  } catch (err) {
    toast.error(isEditing.value ? 'Failed to update item' : 'Failed to add item')
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadItem()
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
</style> 