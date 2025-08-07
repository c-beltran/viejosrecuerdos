<template>
  <div class="min-h-screen bg-vintage-ivory p-4 lg:p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-2">
        Welcome back, {{ user?.name || 'User' }}!
      </h1>
      <p class="text-vintage-gray">
        Here's what's happening with your antique shop today
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Items -->
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-vintage-gray text-sm font-medium">Total Items</p>
            <p class="text-3xl font-display text-vintage-charcoal">{{ stats.totalItems || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-antique-gold/10 rounded-lg flex items-center justify-center">
            <Package class="w-6 h-6 text-antique-gold" />
          </div>
        </div>
      </div>

      <!-- Total Sales -->
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-vintage-gray text-sm font-medium">Total Sales</p>
            <p class="text-3xl font-display text-vintage-charcoal">{{ stats.totalSales || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-vintage-green/10 rounded-lg flex items-center justify-center">
            <ShoppingCart class="w-6 h-6 text-vintage-green" />
          </div>
        </div>
      </div>

      <!-- Total Clients -->
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-vintage-gray text-sm font-medium">Total Clients</p>
            <p class="text-3xl font-display text-vintage-charcoal">{{ stats.totalClients || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-vintage-blue/10 rounded-lg flex items-center justify-center">
            <Users class="w-6 h-6 text-vintage-blue" />
          </div>
        </div>
      </div>

      <!-- Active Installments -->
      <div class="card-antique p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-vintage-gray text-sm font-medium">Active Installments</p>
            <p class="text-3xl font-display text-vintage-charcoal">{{ stats.activeInstallments || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-vintage-rose/10 rounded-lg flex items-center justify-center">
            <CreditCard class="w-6 h-6 text-vintage-rose" />
          </div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Sales -->
      <div class="card-antique p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-display text-xl text-vintage-charcoal">Recent Sales</h2>
          <router-link 
            to="/sales" 
            class="text-antique-gold hover:text-antique-bronze text-sm font-medium transition-colors"
          >
            View All
          </router-link>
        </div>
        
        <div v-if="stats.recentSales && stats.recentSales.length > 0" class="space-y-4">
          <div 
            v-for="sale in stats.recentSales.slice(0, 5)" 
            :key="sale.saleId"
            class="flex items-center justify-between p-4 bg-vintage-cream rounded-lg"
          >
            <div>
              <p class="font-medium text-vintage-charcoal">Sale #{{ sale.saleId.slice(-8) }}</p>
              <p class="text-sm text-vintage-gray">{{ formatDate(sale.saleDate) }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-vintage-charcoal">${{ sale.totalAmount.toFixed(2) }}</p>
              <span :class="getStatusBadgeClass(sale.status)">{{ sale.status }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <ShoppingCart class="w-12 h-12 text-vintage-gray mx-auto mb-4" />
          <p class="text-vintage-gray">No recent sales</p>
        </div>
      </div>

      <!-- Low Stock Items -->
      <div class="card-antique p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-display text-xl text-vintage-charcoal">Low Stock Items</h2>
          <router-link 
            to="/inventory" 
            class="text-antique-gold hover:text-antique-bronze text-sm font-medium transition-colors"
          >
            View All
          </router-link>
        </div>
        
        <div v-if="stats.lowStockItems && stats.lowStockItems.length > 0" class="space-y-4">
          <div 
            v-for="item in stats.lowStockItems.slice(0, 5)" 
            :key="item.itemId"
            class="flex items-center justify-between p-4 bg-vintage-cream rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div v-if="item.imageUrls && item.imageUrls.length > 0" class="w-10 h-10 rounded-lg overflow-hidden">
                <img 
                  :src="item.imageUrls[0].thumbnail" 
                  :alt="item.itemName"
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-else class="w-10 h-10 bg-vintage-beige rounded-lg flex items-center justify-center">
                <Package class="w-5 h-5 text-vintage-gray" />
              </div>
              <div>
                <p class="font-medium text-vintage-charcoal">{{ item.itemName }}</p>
                <p class="text-sm text-vintage-gray">{{ item.category }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-medium text-vintage-charcoal">{{ item.currentQuantity }}</p>
              <p class="text-sm text-vintage-gray">in stock</p>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <Package class="w-12 h-12 text-vintage-gray mx-auto mb-4" />
          <p class="text-vintage-gray">All items well stocked</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="font-display text-xl text-vintage-charcoal mb-6">Quick Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <router-link 
          to="/inventory/new"
          class="card-antique p-6 text-center hover:shadow-xl transition-all duration-300 group"
        >
          <Plus class="w-8 h-8 text-antique-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 class="font-medium text-vintage-charcoal mb-2">Add Item</h3>
          <p class="text-sm text-vintage-gray">Add new inventory item</p>
        </router-link>

        <router-link 
          to="/sales/new"
          class="card-antique p-6 text-center hover:shadow-xl transition-all duration-300 group"
        >
          <ShoppingCart class="w-8 h-8 text-antique-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 class="font-medium text-vintage-charcoal mb-2">New Sale</h3>
          <p class="text-sm text-vintage-gray">Create a new sale</p>
        </router-link>

        <router-link 
          to="/clients/new"
          class="card-antique p-6 text-center hover:shadow-xl transition-all duration-300 group"
        >
          <UserPlus class="w-8 h-8 text-antique-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 class="font-medium text-vintage-charcoal mb-2">Add Client</h3>
          <p class="text-sm text-vintage-gray">Add new customer</p>
        </router-link>

        <router-link 
          to="/installments"
          class="card-antique p-6 text-center hover:shadow-xl transition-all duration-300 group"
        >
          <CreditCard class="w-8 h-8 text-antique-gold mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <h3 class="font-medium text-vintage-charcoal mb-2">Payments</h3>
          <p class="text-sm text-vintage-gray">Manage installments</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'
import { useSalesStore } from '@/stores/sales'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Plus, 
  UserPlus 
} from 'lucide-vue-next'
import { DashboardStats } from '@/types'

// Stores
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()
const salesStore = useSalesStore()

// Reactive state
const stats = ref<DashboardStats>({
  totalItems: 0,
  totalSales: 0,
  totalClients: 0,
  activeInstallments: 0,
  recentSales: [],
  lowStockItems: [],
  upcomingPayments: []
})

// Computed
const user = computed(() => authStore.user)

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'badge-vintage'
    case 'Pending':
      return 'badge-antique'
    case 'Cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'badge-antique'
  }
}

const loadDashboardData = async () => {
  try {
    // Load inventory stats
    const inventoryStats = await inventoryStore.getStats()
    
    // Load recent sales
    await salesStore.fetchSales({ limit: 5 })
    
    // Update stats
    stats.value = {
      totalItems: inventoryStats?.totalItems || 0,
      totalSales: inventoryStats?.totalSales || 0,
      totalClients: inventoryStats?.totalClients || 0,
      activeInstallments: inventoryStats?.activeInstallments || 0,
      recentSales: salesStore.sales.slice(0, 5),
      lowStockItems: inventoryStats?.lowStockItems || [],
      upcomingPayments: []
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.card-antique {
  @apply bg-white rounded-xl shadow-lg border border-vintage-beige hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1;
}
</style> 