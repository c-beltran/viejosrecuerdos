<template>
  <div class="min-h-screen bg-vintage-ivory p-4 lg:p-8">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-2">
            {{ isEditing ? 'Edit Sale' : 'Create New Sale' }}
          </h1>
          <p class="text-vintage-gray text-lg">
            {{ isEditing ? 'Update sale information and items' : 'Add items to cart and complete the sale' }}
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Sale Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Sale Information -->
        <div class="card-antique p-6">
          <h2 class="text-xl font-semibold text-vintage-charcoal mb-4">Sale Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Client Selection -->
            <div>
              <label class="block text-sm font-medium text-vintage-charcoal mb-2">
                Client (Optional)
              </label>
              <div class="relative">
                <input
                  v-model="clientSearch"
                  @input="searchClients"
                  @focus="showClientDropdown = true"
                  type="text"
                  placeholder="Search clients by name or email..."
                  class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal placeholder-vintage-gray hover:border-antique-gold transition-colors"
                />
                
                <!-- Client Dropdown -->
                <div v-if="showClientDropdown && filteredClients.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-vintage-beige rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    v-for="client in filteredClients"
                    :key="client.clientId"
                    @click="selectClient(client)"
                    class="px-3 py-2 hover:bg-vintage-ivory cursor-pointer border-b border-vintage-beige last:border-b-0"
                  >
                    <div class="font-medium text-vintage-charcoal">{{ client.name }}</div>
                    <div v-if="client.email" class="text-sm text-vintage-gray">{{ client.email }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Selected Client -->
              <div v-if="selectedClient" class="mt-2 p-2 bg-vintage-ivory rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-vintage-charcoal">{{ selectedClient.name }}</div>
                    <div v-if="selectedClient.email" class="text-sm text-vintage-gray">{{ selectedClient.email }}</div>
                  </div>
                  <button
                    @click="removeClient"
                    class="text-red-600 hover:text-red-800"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div>
              <label class="block text-sm font-medium text-vintage-charcoal mb-2">
                Payment Method
              </label>
              <select
                v-model="form.paymentMethod"
                class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal hover:border-antique-gold transition-colors"
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
            </div>

            <!-- Sale Date -->
            <div class="relative">
              <label class="block text-sm font-medium text-vintage-charcoal mb-2">
                Sale Date
              </label>
              <div class="relative date-input-container">
                <input
                  v-model="form.saleDate"
                  type="text"
                  placeholder="DD-MM-YYYY"
                  class="w-full px-3 py-2 pr-10 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal placeholder-vintage-gray cursor-pointer"
                  @blur="validateAndFormatDate"
                  @click="showCalendar = !showCalendar"
                  readonly
                />
                <button
                  @click="showCalendar = !showCalendar"
                  type="button"
                  class="calendar-icon-btn absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-vintage-gray hover:text-antique-gold hover:bg-vintage-ivory rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-antique-gold focus:ring-opacity-50"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-4h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm-3.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008v-.008Z"/>
                  </svg>
                </button>
              </div>
              
              <!-- Calendar Dropdown -->
              <div v-if="showCalendar" class="calendar-container relative z-[99999] mt-2 bg-white border border-vintage-beige rounded-lg shadow-xl p-4 min-w-[280px]">
                <!-- Calendar Header -->
                <div class="flex items-center justify-between mb-4">
                  <button
                    @click="previousMonth"
                    class="p-1 hover:bg-vintage-ivory rounded transition-colors"
                  >
                    <svg class="w-5 h-5 text-vintage-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <div class="text-lg font-semibold text-vintage-charcoal">
                    {{ currentMonthName }} {{ currentYear }}
                  </div>
                  <button
                    @click="nextMonth"
                    class="p-1 hover:bg-vintage-ivory rounded transition-colors"
                  >
                    <svg class="w-5 h-5 text-vintage-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
                
                <!-- Day Headers -->
                <div class="grid grid-cols-7 gap-1 mb-2">
                  <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day" class="text-center text-sm font-medium text-vintage-gray py-1">
                    {{ day }}
                  </div>
                </div>
                
                <!-- Calendar Grid -->
                <div class="grid grid-cols-7 gap-1">
                  <div
                    v-for="date in calendarDates"
                    :key="date.key"
                    @click="selectDate(date)"
                    :class="[
                      'text-center py-2 px-1 cursor-pointer rounded transition-colors text-sm',
                      date.isCurrentMonth 
                        ? date.isToday 
                          ? 'bg-antique-gold text-white font-semibold' 
                          : date.isSelected 
                            ? 'bg-antique-gold text-white font-semibold'
                            : 'hover:bg-vintage-ivory text-vintage-charcoal'
                        : 'text-vintage-gray cursor-default'
                    ]"
                  >
                    {{ date.day }}
                  </div>
                </div>
                
                <!-- Today Button -->
                <div class="mt-4 text-center">
                  <button
                    @click="selectToday"
                    class="px-4 py-2 bg-vintage-ivory hover:bg-antique-gold hover:text-white text-vintage-charcoal rounded-lg transition-colors text-sm font-medium"
                  >
                    Today
                  </button>
                </div>
              </div>
              
              <p class="text-xs text-vintage-gray mt-1">Click anywhere in the date field or the calendar icon to select a date</p>
            </div>
            


            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-vintage-charcoal mb-2">
                Status
              </label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-vintage-charcoal mb-2">
              Notes
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="Additional notes about the sale..."
              class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal placeholder-vintage-gray"
            ></textarea>
          </div>
        </div>

        <!-- Add Items Section -->
        <div class="card-antique p-6">
          <h2 class="text-xl font-semibold text-vintage-charcoal mb-4">Add Items</h2>
          
          <!-- Loading State for Inventory -->
          <div v-if="isLoading" class="mb-4 p-4 bg-vintage-ivory rounded-lg text-center">
            <div class="loading-spinner w-6 h-6 border-4 border-vintage-beige border-t-antique-gold rounded-full mx-auto mb-2"></div>
            <p class="text-vintage-gray">Loading inventory...</p>
          </div>
          
          <!-- Item Lookup by Friendly ID -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-vintage-charcoal">
                Lookup Item by Friendly ID
              </label>
              <button
                @click="debugInventory"
                class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
              >
                Debug Inventory
              </button>
            </div>
            <div class="flex gap-2">
              <div class="flex-1 relative">
                <input
                  v-model="itemLookup"
                  @input="lookupItem"
                  @keyup.enter="addItemByLookup"
                  type="text"
                  placeholder="Enter friendly ID (e.g., M0001, P0001)..."
                  :disabled="isLoading"
                  class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal placeholder-vintage-gray hover:border-antique-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <!-- Loading indicator -->
                <div v-if="isLookingUp" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div class="loading-spinner w-4 h-4 border-2 border-vintage-beige border-t-antique-gold rounded-full"></div>
                </div>
              </div>
              <button
                @click="addItemByLookup"
                :disabled="isLoading || isLookingUp"
                class="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            
            <!-- Item Lookup Results -->
            <div v-if="lookupResults.length > 0" class="mt-2">
              <div class="text-sm text-vintage-gray mb-2">Found items:</div>
              <div class="space-y-2">
                <div
                  v-for="item in lookupResults"
                  :key="item.itemId"
                  class="p-2 bg-vintage-ivory rounded-lg cursor-pointer hover:bg-vintage-beige"
                  @click="selectItemForLookup(item)"
                >
                  <div class="font-medium text-vintage-charcoal">{{ item.friendlyId }} - {{ item.itemName }}</div>
                  <div class="text-sm text-vintage-gray">
                    Available: {{ item.currentQuantity }} | Price: ${{ formatCurrency(item.unitPrice) }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No Results Message -->
            <div v-else-if="itemLookup.trim().length >= 2 && !isLookingUp" class="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="text-sm text-yellow-800">
                No items found matching "{{ itemLookup }}". 
                <span class="font-medium">Try:</span>
                <ul class="mt-1 ml-4 list-disc">
                  <li>Check the spelling of the friendly ID</li>
                  <li>Ensure the item exists in inventory</li>
                  <li>Verify the item has available stock</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Manual Item Addition -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-vintage-charcoal mb-2">
              Or Add Item Manually
            </label>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
              <select
                v-model="newItem.itemId"
                :disabled="isLoading"
                class="px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Item</option>
                <option
                  v-for="item in availableInventory"
                  :key="item.itemId"
                  :value="item.itemId"
                >
                  {{ item.friendlyId }} - {{ item.itemName }}
                </option>
              </select>
              
              <input
                v-model.number="newItem.quantity"
                type="number"
                min="1"
                placeholder="Qty"
                :disabled="isLoading"
                class="px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal placeholder-vintage-gray disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <input
                v-model.number="newItem.unitPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Unit Price"
                :disabled="isLoading"
                class="px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal placeholder-vintage-gray disabled:opacity-50 disabled:cursor-not-allowed"
              />
              
              <button
                @click="addItem"
                :disabled="isLoading || !newItem.itemId || !newItem.quantity"
                class="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>

          <!-- Current Items List -->
          <div v-if="form.items.length > 0">
            <h3 class="text-lg font-medium text-vintage-charcoal mb-3">Current Items</h3>
            <div class="space-y-2">
              <div
                v-for="(item, index) in form.items"
                :key="index"
                class="flex items-center justify-between p-3 bg-vintage-ivory rounded-lg"
              >
                <div class="flex-1">
                  <div class="font-medium text-vintage-charcoal">
                    {{ getItemName(item.itemId) }}
                  </div>
                  <div class="text-sm text-vintage-gray">
                    Qty: {{ item.quantity }} × ${{ formatCurrency(item.unitPrice) }} = ${{ formatCurrency(item.quantity * item.unitPrice) }}
                  </div>
                </div>
                <button
                  @click="removeItem(index)"
                  class="text-red-600 hover:text-red-800 ml-4"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Summary and Actions -->
      <div class="space-y-6">
        <!-- Sale Summary -->
        <div class="card-antique p-6">
          <h2 class="text-xl font-semibold text-vintage-charcoal mb-4">Sale Summary</h2>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-vintage-gray">Items:</span>
              <span class="font-medium text-vintage-charcoal">{{ totalItems }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-vintage-gray">Subtotal:</span>
              <span class="font-medium text-vintage-charcoal">${{ formatCurrency(subtotal) }}</span>
            </div>
            
            <div class="border-t border-vintage-beige pt-3">
              <div class="flex justify-between text-lg font-bold text-vintage-charcoal">
                <span>Total:</span>
                <span>${{ formatCurrency(totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Installment Options -->
        <div class="card-antique p-6">
          <h2 class="text-xl font-semibold text-vintage-charcoal mb-4">Payment Options</h2>
          
          <div class="space-y-4">
            <!-- Full Payment -->
            <div class="flex items-center">
              <input
                v-model="paymentOption"
                type="radio"
                value="full"
                id="full-payment"
                class="mr-3"
              />
              <label for="full-payment" class="text-vintage-charcoal">
                Full Payment - ${{ formatCurrency(totalAmount) }}
              </label>
            </div>
            
            <!-- Installment Plan -->
            <div class="flex items-center">
              <input
                v-model="paymentOption"
                type="radio"
                value="installment"
                id="installment-plan"
                class="mr-3"
              />
              <label for="installment-plan" class="text-vintage-charcoal">
                Installment Plan
              </label>
            </div>
            
            <!-- Installment Details (if selected) -->
            <div v-if="paymentOption === 'installment'" class="ml-6 space-y-3">
              <div>
                <label class="block text-sm font-medium text-vintage-charcoal mb-1">
                  Down Payment
                </label>
                <input
                  v-model.number="installmentPlan.downPayment"
                  type="number"
                  min="0"
                  :max="totalAmount"
                  step="0.01"
                  class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-vintage-charcoal mb-1">
                  Number of Installments
                </label>
                <select
                  v-model="installmentPlan.numberOfInstallments"
                  class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal"
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="6">6</option>
                  <option value="12">12</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-vintage-charcoal mb-1">
                  Frequency
                </label>
                <select
                  v-model="installmentPlan.installmentFrequency"
                  class="w-full px-3 py-2 bg-white border border-vintage-beige rounded-lg focus:ring-2 focus:ring-antique-gold focus:border-transparent text-vintage-charcoal"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
              
              <div class="bg-vintage-ivory p-3 rounded-lg">
                <div class="text-sm text-vintage-gray">Installment Amount:</div>
                <div class="text-lg font-bold text-vintage-charcoal">
                  ${{ formatCurrency(installmentAmount) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            @click="saveSale"
            :disabled="!canSave"
            class="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isEditing ? 'Update Sale' : 'Complete Sale' }}
          </button>
          
          <button
            v-if="isEditing"
            @click="saveAsDraft"
            class="w-full btn-secondary py-3"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6">
        <div class="loading-spinner w-8 h-8 border-4 border-vintage-beige border-t-antique-gold rounded-full mx-auto mb-4"></div>
        <p class="text-vintage-charcoal">Processing...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useSalesStore } from '@/stores/sales'
import { useInventoryStore } from '@/stores/inventory'
import { useClientStore } from '@/stores/client'
import { 
  ArrowLeft,
  X,
  Trash2
} from 'lucide-vue-next'
import type { 
  Sale, 
  CreateSaleRequest, 
  CreateSaleItemRequest,
  InventoryItem,
  Client,
  InstallmentPlan
} from '@/types'

// Composables
const route = useRoute()
const router = useRouter()
const toast = useToast()
const salesStore = useSalesStore()
const inventoryStore = useInventoryStore()
const clientStore = useClientStore()

// Reactive state
const isLoading = ref(false)
const isEditing = computed(() => route.name === 'sale-edit')
const saleId = computed(() => route.params.id as string)

// Helper function for date formatting
const getTodayDate = () => {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const year = today.getFullYear()
  return `${day}-${month}-${year}` // Returns DD-MM-YYYY format
}

const formatDateForInput = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}` // Returns DD-MM-YYYY format
  } catch (err) {
    console.error('Error formatting date:', err)
    return getTodayDate() // Fallback to today's date
  }
}

const validateAndFormatDate = () => {
  const dateValue = form.value.saleDate
  if (!dateValue) return
  
  // Check if it's already in DD-MM-YYYY format
  const dateRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  const match = dateValue.match(dateRegex)
  
  if (match) {
    const day = parseInt(match[1])
    const month = parseInt(match[2])
    const year = parseInt(match[3])
    
    // Validate date ranges
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
      // Format with leading zeros
      form.value.saleDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`
      return
    }
  }
  
  // If invalid format, try to parse and convert
  try {
    const date = new Date(dateValue)
    if (!isNaN(date.getTime())) {
      form.value.saleDate = formatDateForInput(dateValue)
    } else {
      // Invalid date, reset to today
      form.value.saleDate = getTodayDate()
      toast.error('Invalid date format. Please use DD-MM-YYYY format.')
    }
  } catch (err) {
    // Invalid date, reset to today
    form.value.saleDate = getTodayDate()
    toast.error('Invalid date format. Please use DD-MM-YYYY format.')
  }
}

const convertDateForBackend = (dateString: string) => {
  // Convert DD-MM-YYYY to YYYY-MM-DD for backend
  const dateRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  const match = dateString.match(dateRegex)
  
  if (match) {
    const day = match[1]
    const month = match[2]
    const year = match[3]
    return `${year}-${month}-${day}` // Returns YYYY-MM-DD format
  }
  
  // Fallback: try to parse and convert
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
    }
  } catch (err) {
    console.error('Error converting date for backend:', err)
  }
  
  // If all else fails, return today's date in backend format
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Calendar helper functions
const isToday = (date: Date) => {
  const today = new Date()
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear()
}

const isSelectedDate = (date: Date) => {
  if (!selectedDate.value) return false
  return date.getDate() === selectedDate.value.getDate() && 
         date.getMonth() === selectedDate.value.getMonth() && 
         date.getFullYear() === selectedDate.value.getFullYear()
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (dateObj: any) => {
  if (!dateObj.isCurrentMonth) return
  
  selectedDate.value = dateObj.date
  form.value.saleDate = formatDateForInput(dateObj.date.toISOString())
  
  nextTick(() => {
    showCalendar.value = false
  })
}

const selectToday = () => {
  const today = new Date()
  selectedDate.value = today
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
  form.value.saleDate = getTodayDate()
  
  nextTick(() => {
    showCalendar.value = false
  })
}

// Form data
const form = ref<CreateSaleRequest>({
  clientId: undefined,
  saleDate: getTodayDate(), // Today's date in DD-MM-YYYY format
  totalAmount: 0,
  paymentMethod: 'Cash',
  status: 'Pending',
  notes: '',
  items: []
})

// Client selection
const clientSearch = ref('')
const showClientDropdown = ref(false)
const filteredClients = ref<Client[]>([])
const selectedClient = ref<Client | null>(null)

// Item lookup
const itemLookup = ref('')
const lookupResults = ref<InventoryItem[]>([])
const isLookingUp = ref(false)
const newItem = ref<CreateSaleItemRequest>({
  itemId: '',
  quantity: 1,
  unitPrice: 0
})

// Payment options
const paymentOption = ref<'full' | 'installment'>('full')
const installmentPlan = ref({
  downPayment: 0,
  numberOfInstallments: 3,
  installmentFrequency: 'Monthly' as const
})

// Calendar state
const showCalendar = ref(false)
const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(null)

// Computed properties
const availableInventory = computed(() => {
  if (isLoading.value || !inventoryStore.items || !Array.isArray(inventoryStore.items)) {
    return []
  }
  return inventoryStore.items.filter(item => item.currentQuantity > 0)
})

const totalItems = computed(() => {
  if (!form.value.items || !Array.isArray(form.value.items)) {
    return 0
  }
  return form.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

const subtotal = computed(() => {
  if (!form.value.items || !Array.isArray(form.value.items)) {
    return 0
  }
  return form.value.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0)
})

const totalAmount = computed(() => subtotal.value)

const installmentAmount = computed(() => {
  if (paymentOption.value === 'installment' && installmentPlan.value.numberOfInstallments > 0) {
    const remaining = totalAmount.value - installmentPlan.value.downPayment
    return remaining / installmentPlan.value.numberOfInstallments
  }
  return 0
})

const canSave = computed(() => {
  if (!form.value.items || !Array.isArray(form.value.items) || form.value.items.length === 0) {
    return false
  }
  return form.value.items.every(item => 
    item && item.itemId && item.quantity > 0 && item.unitPrice > 0
  )
})

// Calendar computed properties
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long' })
})

const currentYear = computed(() => {
  return currentDate.value.getFullYear()
})

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // Get first day of month and last day of month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay()
  
  // Get the last date of previous month
  const lastDateOfPrevMonth = new Date(year, month, 0)
  
  const dates = []
  
  // Add dates from previous month to fill first week
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, lastDateOfPrevMonth.getDate() - i)
    dates.push({
      key: `prev-${date.getTime()}`,
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: isSelectedDate(date)
    })
  }
  
  // Add dates from current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    dates.push({
      key: `current-${date.getTime()}`,
      date,
      day,
      isCurrentMonth: true,
      isToday: isToday(date),
      isSelected: isSelectedDate(date)
    })
  }
  
  // Add dates from next month to fill last week
  const remainingDays = 42 - dates.length // 6 rows * 7 days = 42
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    dates.push({
      key: `next-${date.getTime()}`,
      date,
      day,
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: isSelectedDate(date)
    })
  }
  
  return dates
})



// Methods
const loadSale = async () => {
  if (!isEditing.value || !saleId.value) return
  
  try {
    isLoading.value = true
    const sale = await salesStore.fetchSale(saleId.value)
    
    if (sale) {
      form.value = {
        clientId: sale.clientId,
        saleDate: formatDateForInput(sale.saleDate), // Convert to DD-MM-YYYY format
        totalAmount: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        status: sale.status,
        notes: sale.notes || '',
        items: sale.items?.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })) || []
      }
      
      if (sale.client) {
        selectedClient.value = sale.client
      }
    }
  } catch (err) {
    toast.error('Failed to load sale')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const searchClients = async () => {
  if (clientSearch.value.trim().length < 2) {
    filteredClients.value = []
    return
  }
  
  try {
    await clientStore.fetchClients({ limit: 10, offset: 0 })
    const query = clientSearch.value.toLowerCase()
    filteredClients.value = clientStore.clients.filter(client => 
      client.name.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query))
    )
  } catch (err) {
    console.error('Error searching clients:', err)
  }
}

const selectClient = (client: Client) => {
  selectedClient.value = client
  form.value.clientId = client.clientId
  showClientDropdown.value = false
  clientSearch.value = client.name
}

const removeClient = () => {
  selectedClient.value = null
  form.value.clientId = undefined
  clientSearch.value = ''
}

const lookupItem = async () => {
  console.log('lookupItem called with:', itemLookup.value)
  
  if (itemLookup.value.trim().length < 2) {
    lookupResults.value = []
    return
  }
  
  try {
    isLookingUp.value = true
    
    console.log('Debug: Before inventory check')
    console.log('- inventoryStore.items:', inventoryStore.items)
    console.log('- inventoryStore.items.length:', inventoryStore.items?.length)
    console.log('- inventoryStore.hasItems:', inventoryStore.hasItems)
    
    // Ensure inventory is loaded
    if (!inventoryStore.items || inventoryStore.items.length === 0) {
      console.log('Inventory not loaded, fetching all available items...')
      await inventoryStore.fetchAllAvailableItems()
      console.log('Debug: After fetchAllAvailableItems call')
      console.log('- inventoryStore.items:', inventoryStore.items)
      console.log('- inventoryStore.items.length:', inventoryStore.items?.length)
    }
    
    const query = itemLookup.value.toLowerCase()
    console.log('Searching for query:', query)
    console.log('Available inventory:', inventoryStore.items?.length || 0)
    
    if (!inventoryStore.items || !Array.isArray(inventoryStore.items)) {
      console.log('Inventory still not available')
      lookupResults.value = []
      return
    }
    
    // Filter items by friendly ID and availability
    const filtered = inventoryStore.items.filter(item => {
      const matchesQuery = item.friendlyId && item.friendlyId.toLowerCase().includes(query)
      const isAvailable = item.currentQuantity > 0
      console.log(`Item ${item.friendlyId}: matches=${matchesQuery}, available=${isAvailable}`)
      return matchesQuery && isAvailable
    })
    
    console.log('Filtered results:', filtered.length)
    lookupResults.value = filtered.slice(0, 5)
    
  } catch (err) {
    console.error('Error looking up item:', err)
    toast.error('Failed to lookup item. Please try again.')
  } finally {
    isLookingUp.value = false
  }
}

const selectItemForLookup = (item: InventoryItem) => {
  newItem.value = {
    itemId: item.itemId,
    quantity: 1,
    unitPrice: item.unitPrice
  }
  addItem()
  itemLookup.value = ''
  lookupResults.value = []
}

const addItemByLookup = () => {
  console.log('addItemByLookup called, results:', lookupResults.value.length)
  
  if (lookupResults.value.length === 0) {
    toast.error('No items found. Please search for an item first.')
    return
  }
  
  if (lookupResults.value.length === 1) {
    selectItemForLookup(lookupResults.value[0])
  } else if (lookupResults.value.length > 1) {
    toast.info('Multiple items found. Please select a specific item from the results below.')
  }
}

const addItem = () => {
  if (!newItem.value.itemId || !newItem.value.quantity) {
    toast.error('Please fill in all item fields')
    return
  }
  
  if (!inventoryStore.items || !Array.isArray(inventoryStore.items)) {
    toast.error('Inventory not loaded. Please try again.')
    return
  }
  
  const inventoryItem = inventoryStore.items.find(item => item.itemId === newItem.value.itemId)
  if (!inventoryItem) {
    toast.error('Item not found')
    return
  }
  
  if (newItem.value.quantity > inventoryItem.currentQuantity) {
    toast.error(`Only ${inventoryItem.currentQuantity} items available`)
    return
  }
  
  // Use inventory price if unit price not specified
  const unitPrice = newItem.value.unitPrice || inventoryItem.unitPrice
  
  form.value.items.push({
    itemId: newItem.value.itemId,
    quantity: newItem.value.quantity,
    unitPrice
  })
  
  // Reset form
  newItem.value = {
    itemId: '',
    quantity: 1,
    unitPrice: 0
  }
  
  toast.success('Item added to sale')
}

const removeItem = (index: number) => {
  if (!form.value.items || !Array.isArray(form.value.items) || index < 0 || index >= form.value.items.length) {
    toast.error('Invalid item index')
    return
  }
  form.value.items.splice(index, 1)
  toast.success('Item removed from sale')
}

const debugInventory = () => {
  console.log('Debug: Current inventory store state:')
  console.log('- items:', inventoryStore.items)
  console.log('- hasItems:', inventoryStore.hasItems)
  console.log('- totalItems:', inventoryStore.totalItems)
  console.log('- loading:', inventoryStore.loading)
  
  // Try to fetch items manually
  console.log('Debug: Attempting to fetch all available items manually...')
  console.log('Note: This will fetch ALL available items (not just 20) for complete search coverage')
  inventoryStore.fetchAllAvailableItems().then(() => {
    console.log('Debug: Manual fetch completed')
    console.log('- items after fetch:', inventoryStore.items)
    console.log('- hasItems after fetch:', inventoryStore.hasItems)
    console.log('- Total available items loaded:', inventoryStore.items?.length || 0)
  }).catch(err => {
    console.error('Debug: Manual fetch failed:', err)
  })
}

const getItemName = (itemId: string) => {
  if (!itemId) return 'Unknown Item'
  if (!inventoryStore.items || !Array.isArray(inventoryStore.items)) {
    return 'Unknown Item'
  }
  const item = inventoryStore.items.find(item => item.itemId === itemId)
  return item ? `${item.friendlyId} - ${item.itemName}` : 'Unknown Item'
}

const saveSale = async () => {
  if (!canSave.value) {
    toast.error('Please add at least one item to the sale')
    return
  }
  
  try {
    isLoading.value = true
    
    // Update total amount
    form.value.totalAmount = totalAmount.value
    
    // Convert date format for backend (DD-MM-YYYY to YYYY-MM-DD)
    const saleData = {
      ...form.value,
      saleDate: convertDateForBackend(form.value.saleDate)
    }
    
    // Set status to 'Pending' if using installment plan
    if (paymentOption.value === 'installment') {
      saleData.status = 'Pending'
    }
    
    if (isEditing.value) {
      await salesStore.updateSale(saleId.value, saleData)
      toast.success('Sale updated successfully')
    } else {
      const sale = await salesStore.createSale(saleData)
      toast.success('Sale created successfully')
      
      // Debug: Log the created sale
      console.log('Created sale:', sale)
      
      // If installment plan selected, create it
      if (paymentOption.value === 'installment' && sale) {
        try {
          const installmentData = {
            saleId: sale.saleId,
            totalAmount: sale.totalAmount,
            downPayment: installmentPlan.value.downPayment,
            installmentAmount: installmentAmount.value,
            numberOfInstallments: installmentPlan.value.numberOfInstallments,
            installmentFrequency: installmentPlan.value.installmentFrequency,
            startDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + (installmentPlan.value.numberOfInstallments * 30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days per installment
            status: 'Active',
            notes: `Installment plan for sale ${sale.saleId}`,
            createdBy: 'system' // This should come from auth store
          }
          
          console.log('Creating installment plan:', installmentData)
          const installmentPlanResult = await salesStore.createInstallmentPlan(installmentData)
          console.log('Installment plan created:', installmentPlanResult)
          
          toast.success('Installment plan created successfully')
        } catch (err) {
          console.error('Failed to create installment plan:', err)
          toast.error('Sale created but installment plan failed. Please create it manually.')
        }
      }
    }
    
    // Add a small delay before navigation to ensure store is updated
    await nextTick()
    goBack()
  } catch (err) {
    toast.error('Failed to save sale')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const saveAsDraft = async () => {
  form.value.status = 'Pending'
  await saveSale()
}

const goBack = () => {
  router.push('/sales')
}

const formatCurrency = (amount: number) => {
  return amount.toFixed(2)
}

// Watchers
watch(installmentPlan.value, () => {
  if (installmentPlan.value.downPayment > totalAmount.value) {
    installmentPlan.value.downPayment = totalAmount.value
  }
})

// Lifecycle
onMounted(async () => {
  try {
    console.log('SalesFormView mounted, loading data...')
    
    // Load inventory and clients in parallel
    await Promise.all([
      inventoryStore.fetchAllAvailableItems(),
      clientStore.fetchClients()
    ])
    
    console.log('Data loaded - Inventory:', inventoryStore.items?.length || 0, 'Clients:', clientStore.clients?.length || 0)
    
    if (isEditing.value) {
      await loadSale()
    }
    
    // Set initial selected date to today
    selectedDate.value = new Date()
  } catch (err) {
    console.error('Error loading initial data:', err)
    toast.error('Failed to load initial data. Please refresh the page.')
  }
  
  // Add click outside listener for calendar
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    
    const calendarContainer = target.closest('.calendar-container')
    const dateInputContainer = target.closest('.date-input-container')
    
    // Only close if clicking outside both the calendar and the date input area
    if (!calendarContainer && !dateInputContainer) {
      showCalendar.value = false
    }
  })
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

/* Calendar specific styles */
.calendar-container {
  animation: fadeIn 0.2s ease-out;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  z-index: 999999 !important;
  position: relative !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Date input hover effects */
.date-input-container input[readonly] {
  cursor: pointer;
}

.date-input-container input[readonly]:hover {
  border-color: #d4af37; /* antique-gold */
  background-color: #fefefe;
}
</style> 