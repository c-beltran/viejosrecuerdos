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
                Client <span class="text-red-500">*</span>
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
                Payment Method <span class="text-red-500">*</span>
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
                Sale Date <span class="text-red-500">*</span>
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
                      'text-center py-2 px-1 rounded transition-colors text-sm',
                      date.isCurrentMonth 
                        ? date.isFuture
                          ? 'text-vintage-gray cursor-not-allowed opacity-50' // Future dates are disabled
                          : date.isToday 
                            ? 'bg-antique-gold text-white font-semibold cursor-pointer' 
                            : date.isSelected 
                              ? 'bg-antique-gold text-white font-semibold cursor-pointer'
                              : 'hover:bg-vintage-ivory text-vintage-charcoal cursor-pointer'
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
                      <h2 class="text-xl font-semibold text-vintage-charcoal mb-4">Add Items <span class="text-red-500">*</span></h2>
          
          <!-- Loading State for Inventory -->
          <div v-if="isLoading" class="mb-4 p-4 bg-vintage-ivory rounded-lg text-center">
            <div class="loading-spinner w-6 h-6 border-4 border-vintage-beige border-t-antique-gold rounded-full mx-auto mb-2"></div>
            <p class="text-vintage-gray">Loading inventory...</p>
          </div>
          
          <!-- Item Lookup by Friendly ID -->
          <div class="mb-4">
            <div class="mb-2">
              <label class="block text-sm font-medium text-vintage-charcoal">
                Lookup Item by Friendly ID
              </label>
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
                <!-- Note about last installment adjustment -->
                <div class="text-xs text-blue-600 mt-1">
                  <span class="font-medium">Note:</span> Last installment may be adjusted to ensure total adds up exactly
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Validation Messages -->
        <div v-if="hasValidationErrors" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Please fix the following issues:
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <ul class="list-disc pl-5 space-y-1">
                  <li v-for="message in validationMessages" :key="message">
                    {{ message }}
                  </li>
                </ul>
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
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/utils/formatters'
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
const authStore = useAuthStore()

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
      // Check if date is in the future
      const selectedDate = new Date(year, month - 1, day, 12, 0, 0, 0) // Set to noon for consistency
      const today = new Date()
      today.setHours(12, 0, 0, 0) // Set to noon for consistent comparison
      
      if (selectedDate > today) {
        toast.error('Cannot select future dates. Please select today or a past date.')
        form.value.saleDate = getTodayDate()
        return
      }
      
      // Format with leading zeros
      form.value.saleDate = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`
      return
    }
  }
  
  // If invalid format, try to parse and convert
  try {
    const date = new Date(dateValue)
    if (!isNaN(date.getTime())) {
          // Check if date is in the future
    const today = new Date()
    today.setHours(12, 0, 0, 0) // Set to noon for consistent comparison
    
    if (date > today) {
      toast.error('Cannot select future dates. Please select today or a past date.')
      form.value.saleDate = getTodayDate()
      return
    }
      
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
  console.log('=== convertDateForBackend Debug ===')
  console.log('Input dateString:', dateString)
  console.log('Input dateString length:', dateString.length)
  console.log('Input dateString type:', typeof dateString)
  
  // Convert DD-MM-YYYY to YYYY-MM-DD for backend
  const dateRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  console.log('Testing regex against:', dateString)
  console.log('Regex test result:', dateRegex.test(dateString))
  
  const match = dateString.match(dateRegex)
  console.log('Regex match result:', match)
  
  if (match) {
    const day = parseInt(match[1])
    const month = parseInt(match[2])
    const year = parseInt(match[3])
    
    console.log('Parsed values:', { day, month, year })
    
    // Create a date object at noon local time to avoid timezone issues
    const localDate = new Date(year, month - 1, day, 12, 0, 0, 0)
    const result = localDate.toISOString() // Send full ISO timestamp
    console.log('Regex match successful:', { day, month, year, localDate, result })
    return result
  }
  
  console.log('Regex match failed, trying fallback parsing')
  
  // Fallback: try to parse and convert
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      // Set time to noon to avoid timezone issues
      date.setHours(12, 0, 0, 0)
      const result = date.toISOString() // Returns full ISO timestamp
      console.log('Fallback parsing successful:', { date, result })
      return result
    }
  } catch (err) {
    console.error('Error converting date for backend:', err)
  }
  
  // If all else fails, return the original date string or throw an error
  console.log('All conversion methods failed, throwing error')
  throw new Error('Invalid date format. Please use DD-MM-YYYY format.')
}

// Calendar helper functions
const isToday = (date: Date) => {
  const today = new Date()
  // Set today to noon for consistent comparison
  today.setHours(12, 0, 0, 0)
  return date.getDate() === today.getDate() && 
         date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear()
}

const isSelectedDate = (date: Date) => {
  if (!selectedDate.value) return false
  // Set selected date to noon for consistent comparison
  const selected = new Date(selectedDate.value)
  selected.setHours(12, 0, 0, 0)
  return date.getDate() === selected.getDate() && 
         date.getMonth() === selected.getMonth() && 
         date.getFullYear() === selected.getFullYear()
}

const isFutureDate = (date: Date) => {
  const today = new Date()
  today.setHours(12, 0, 0, 0) // Set to noon for consistent comparison
  return date > today
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (dateObj: any) => {
  if (!dateObj.isCurrentMonth) return
  
  // Check if the selected date is in the future
  if (dateObj.isFuture) {
    toast.error('Cannot select future dates. Please select today or a past date.')
    return
  }
  
  console.log('=== Date Selection Debug ===')
  console.log('Original date object:', dateObj.date)
  console.log('Date as ISO string:', dateObj.date.toISOString())
  console.log('Date as local string:', dateObj.date.toString())
  console.log('Date getTime():', dateObj.date.getTime())
  
  selectedDate.value = dateObj.date
  const formattedDate = formatDateForInput(dateObj.date.toISOString())
  console.log('Formatted date for form:', formattedDate)
  form.value.saleDate = formattedDate
  
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
    // Round to 2 decimal places to avoid floating point precision issues
    return Math.round((remaining / installmentPlan.value.numberOfInstallments) * 100) / 100
  }
  return 0
})

const canSave = computed(() => {
  // Check if items exist and are valid
  if (!form.value.items || !Array.isArray(form.value.items) || form.value.items.length === 0) {
    return false
  }
  
  // Check if all items have required fields
  const itemsValid = form.value.items.every(item => 
    item && item.itemId && item.quantity > 0 && item.unitPrice > 0
  )
  
  if (!itemsValid) {
    return false
  }
  
  // Check if client is selected
  if (!form.value.clientId) {
    return false
  }
  
  // Check if payment method is selected
  if (!form.value.paymentMethod) {
    return false
  }
  
  // Check if sale date is set
  if (!form.value.saleDate) {
    return false
  }
  
  return true
})

// Validation messages for user feedback
const validationMessages = computed(() => {
  const messages = []
  
  // Check items
  if (!form.value.items || !Array.isArray(form.value.items) || form.value.items.length === 0) {
    messages.push('Add at least one item to the sale')
  } else {
    // Check individual items
    form.value.items.forEach((item, index) => {
      if (!item || !item.itemId) {
        messages.push(`Item ${index + 1}: Select a valid item`)
      }
      if (!item || item.quantity <= 0) {
        messages.push(`Item ${index + 1}: Quantity must be greater than 0`)
      }
      if (!item || item.unitPrice <= 0) {
        messages.push(`Item ${index + 1}: Unit price must be greater than 0`)
      }
    })
  }
  
  // Check client
  if (!form.value.clientId) {
    messages.push('Select a client for the sale')
  }
  
  // Check payment method
  if (!form.value.paymentMethod) {
    messages.push('Select a payment method')
  }
  
  // Check sale date
  if (!form.value.saleDate) {
    messages.push('Select a sale date')
  }
  
  return messages
})

// Check if form has validation errors
const hasValidationErrors = computed(() => validationMessages.value.length > 0)

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
    // Create date at noon to avoid timezone issues
    const date = new Date(year, month - 1, lastDateOfPrevMonth.getDate() - i, 12, 0, 0, 0)
    dates.push({
      key: `prev-${date.getTime()}`,
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: isSelectedDate(date),
      isFuture: isFutureDate(date)
    })
  }
  
  // Add dates from current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    // Create date at noon to avoid timezone issues
    const date = new Date(year, month, day, 12, 0, 0, 0)
    dates.push({
      key: `current-${date.getTime()}`,
      date,
      day,
      isCurrentMonth: true,
      isToday: isToday(date),
      isSelected: isSelectedDate(date),
      isFuture: isFutureDate(date)
    })
  }
  
  // Add dates from next month to fill last week
  const remainingDays = 42 - dates.length // 6 rows * 7 days = 42
  for (let day = 1; day <= remainingDays; day++) {
    // Create date at noon to avoid timezone issues
    const date = new Date(year, month + 1, day, 12, 0, 0, 0)
    dates.push({
      key: `next-${date.getTime()}`,
      date,
      day,
      isCurrentMonth: false,
      isToday: isToday(date),
      isSelected: isSelectedDate(date),
      isFuture: isFutureDate(date)
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
  // Check if item is already in the sale
  const existingItemIndex = form.value.items.findIndex(saleItem => saleItem.itemId === item.itemId)
  
  if (existingItemIndex !== -1) {
    // Item already exists, increase quantity
    form.value.items[existingItemIndex].quantity += 1
    toast.success(`Increased quantity of ${item.friendlyId} to ${form.value.items[existingItemIndex].quantity}`)
  } else {
    // Add new item to sale
    form.value.items.push({
      itemId: item.itemId,
      quantity: 1,
      unitPrice: item.unitPrice
    })
    toast.success(`${item.friendlyId} - ${item.itemName} added to sale`)
  }
  
  // Clear lookup
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



const removeItem = (index: number) => {
  if (!form.value.items || !Array.isArray(form.value.items) || index < 0 || index >= form.value.items.length) {
    toast.error('Invalid item index')
    return
  }
  form.value.items.splice(index, 1)
  toast.success('Item removed from sale')
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
    console.log('=== About to convert date ===')
    console.log('Form saleDate value:', form.value.saleDate)
    console.log('Type of saleDate:', typeof form.value.saleDate)
    
    let convertedDate
    try {
      convertedDate = convertDateForBackend(form.value.saleDate)
      console.log('Date conversion successful:', {
        original: form.value.saleDate,
        converted: convertedDate
      })
    } catch (err) {
      console.error('Date conversion failed:', err)
      console.error('Error details:', err.message)
      toast.error('Invalid date format. Please use DD-MM-YYYY format.')
      return
    }
    
    // Ensure items have totalPrice calculated for both create and update
    const itemsWithTotalPrice = form.value.items.map(item => ({
      ...item,
      totalPrice: (item.quantity || 0) * (item.unitPrice || 0)
    }))
    
    const saleData = {
      ...form.value,
      saleDate: convertedDate,
      items: itemsWithTotalPrice
    }
    
    console.log('=== Final Sale Data Being Sent ===')
    console.log('Complete saleData:', saleData)
    console.log('Sale date being sent to backend:', saleData.saleDate)
    
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
          // Ensure we have a valid user ID for createdBy
          if (!authStore.user?.id) {
            throw new Error('User not authenticated. Please log in again.')
          }
          
          // Calculate installment amounts ensuring they add up exactly to the total
          const remainingAfterDownPayment = sale.totalAmount - installmentPlan.value.downPayment
          const baseInstallmentAmount = Math.floor((remainingAfterDownPayment / installmentPlan.value.numberOfInstallments) * 100) / 100
          const lastInstallmentAmount = remainingAfterDownPayment - (baseInstallmentAmount * (installmentPlan.value.numberOfInstallments - 1))
          
          console.log('Installment calculation:', {
            totalAmount: sale.totalAmount,
            downPayment: installmentPlan.value.downPayment,
            remainingAfterDownPayment,
            baseInstallmentAmount,
            lastInstallmentAmount,
            numberOfInstallments: installmentPlan.value.numberOfInstallments
          })
          
          // Verify the calculation adds up exactly
          const calculatedTotal = installmentPlan.value.downPayment + (baseInstallmentAmount * (installmentPlan.value.numberOfInstallments - 1)) + lastInstallmentAmount
          console.log('Verification - calculated total:', calculatedTotal, 'should equal:', sale.totalAmount)
          
          const installmentData = {
            saleId: sale.saleId,
            totalAmount: sale.totalAmount,
            downPayment: installmentPlan.value.downPayment,
            installmentAmount: baseInstallmentAmount, // Use calculated base amount
            numberOfInstallments: installmentPlan.value.numberOfInstallments,
            installmentFrequency: installmentPlan.value.installmentFrequency,
            startDate: new Date().toISOString().split('T')[0], // Send only the date part (YYYY-MM-DD)
            dueDate: new Date(Date.now() + (installmentPlan.value.numberOfInstallments * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // Send only the date part (YYYY-MM-DD)
            status: 'Active',
            notes: `Installment plan for sale ${sale.saleId}. Last installment adjusted to $${lastInstallmentAmount.toFixed(2)} to ensure total adds up exactly.`,
            createdBy: authStore.user.id // Use authenticated user ID (UUID)
          }
          
          console.log('Creating installment plan:', installmentData)
          console.log('Current user:', authStore.user)
          console.log('User ID:', authStore.user?.id)
          console.log('User name:', authStore.user?.name)
          console.log('Is authenticated:', authStore.isAuthenticated)
          console.log('Auth token available:', !!(await authStore.getAuthToken()))
          
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