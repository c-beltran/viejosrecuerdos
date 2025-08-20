<template>
  <div id="app" class="min-h-screen bg-vintage-ivory">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-vintage-ivory">
      <div class="text-center">
        <div class="loading-spinner w-12 h-12 mx-auto mb-4"></div>
        <h2 class="text-xl font-display text-vintage-charcoal">Viejos Recuerdos</h2>
        <p class="text-vintage-gray mt-2">Cargando...</p>
      </div>
    </div>

    <!-- Main App -->
    <div v-else class="flex h-screen">
      <!-- Desktop Sidebar -->
      <aside v-if="isAuthenticated && !isMobile && !isLandingPage" class="sidebar w-64 hidden lg:block flex flex-col">
        <div class="flex-1 p-6">
          <!-- Logo -->
          <div class="flex items-center space-x-3 mb-8">
            <div class="w-10 h-10 bg-antique-gradient rounded-lg flex items-center justify-center">
              <span class="text-white font-handwriting text-xl">VR</span>
            </div>
            <div>
              <h1 class="font-display text-lg text-vintage-charcoal">Viejos Recuerdos</h1>
              <p class="text-xs text-vintage-gray">Antique Shop</p>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="space-y-2">
            <template v-for="item in navigationItems" :key="item.path">
              <!-- Divider before logout -->
              <div v-if="item.divider" class="border-t border-vintage-beige my-4"></div>
              
              <!-- Logout button -->
              <button 
                v-if="item.action === 'logout'"
                @click="logout"
                class="w-full nav-link text-left hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Logout (Ctrl+L)"
              >
                <component :is="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </button>
              
              <!-- Regular navigation link -->
              <router-link 
                v-else
                :to="item.path"
                :class="[
                  $route.path === item.path ? 'nav-link-active' : 'nav-link'
                ]"
              >
                <component :is="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
                <span v-if="item.badge" class="badge-antique ml-auto">{{ item.badge }}</span>
              </router-link>
            </template>
          </nav>
        </div>

        <!-- User Info -->
        <div class="p-6 border-t border-vintage-beige bg-white">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-antique-gold rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">{{ userInitials }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-vintage-charcoal truncate">{{ user?.name }}</p>
              <p class="text-xs text-vintage-gray">{{ user?.role }}</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Mobile Header -->
      <header v-if="isAuthenticated && isMobile && !isLandingPage" class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-vintage-beige shadow-sm">
        <div class="flex items-center justify-between px-4 py-3">
          <div class="flex items-center space-x-3">
            <button @click="toggleMobileMenu" class="text-vintage-charcoal">
              <Menu class="w-6 h-6" />
            </button>
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-antique-gradient rounded-lg flex items-center justify-center">
                <span class="text-white font-handwriting text-sm">VR</span>
              </div>
              <h1 class="font-display text-lg text-vintage-charcoal">Viejos Recuerdos</h1>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="toggleSearch" class="text-vintage-charcoal">
              <Search class="w-5 h-5" />
            </button>
            <div class="w-8 h-8 bg-antique-gold rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">{{ userInitials }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile Menu Overlay -->
      <div v-if="showMobileMenu && !isLandingPage" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-black/50" @click="closeMobileMenu"></div>
        <div class="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
          <div class="p-6">
            <!-- Mobile Logo -->
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-10 h-10 bg-antique-gradient rounded-lg flex items-center justify-center">
                <span class="text-white font-handwriting text-xl">VR</span>
              </div>
              <div>
                <h1 class="font-display text-lg text-vintage-charcoal">Viejos Recuerdos</h1>
                <p class="text-xs text-vintage-gray">Antique Shop</p>
              </div>
            </div>

            <!-- Mobile Navigation -->
            <nav class="space-y-2">
              <template v-for="item in navigationItems" :key="item.path">
                <!-- Divider before logout -->
                <div v-if="item.divider" class="border-t border-vintage-beige my-4"></div>
                
                <!-- Logout button -->
                <button 
                  v-if="item.action === 'logout'"
                  @click="logout"
                  class="w-full nav-link text-left hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Logout (Ctrl+L)"
                >
                  <component :is="item.icon" class="w-5 h-5 mr-3" />
                  {{ item.name }}
                </button>
                
                <!-- Regular navigation link -->
                <router-link 
                  v-else
                  :to="item.path"
                  :class="[
                    $route.path === item.path ? 'nav-link-active' : 'nav-link'
                  ]"
                  @click="closeMobileMenu"
                >
                  <component :is="item.icon" class="w-5 h-5 mr-3" />
                  {{ item.name }}
                  <span v-if="item.badge" class="badge-antique ml-auto">{{ item.badge }}</span>
                </router-link>
              </template>
            </nav>

            <!-- Mobile User Info -->
            <div class="mt-8 pt-6 border-t border-vintage-beige">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-antique-gold rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">{{ userInitials }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-vintage-charcoal truncate">{{ user?.name }}</p>
                  <p class="text-xs text-vintage-gray">{{ user?.role }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden main-content">
        <!-- Admin Access Button (only on landing page for logged-in users) -->
        <div v-if="isAuthenticated && isLandingPage" class="fixed top-4 right-4 z-40">
          <router-link 
            to="/dashboard"
            class="inline-flex items-center px-4 py-2 bg-antique-gold text-white rounded-lg shadow-lg hover:bg-antique-bronze transition-colors text-sm font-medium"
          >
            <Settings class="w-4 h-4 mr-2" />
            Admin Panel
          </router-link>
        </div>
        <!-- Desktop Content -->
        <div v-if="!isMobile" class="flex-1 overflow-auto relative">
          <router-view />
        </div>

        <!-- Mobile Content -->
        <div v-else class="flex-1 overflow-auto pt-16 pb-20">
          <router-view />
        </div>

        <!-- Mobile Bottom Navigation -->
        <nav v-if="isAuthenticated && isMobile && !isLandingPage" class="mobile-nav">
          <div class="flex justify-around py-2">
            <router-link 
              v-for="item in mobileNavigationItems" 
              :key="item.path"
              :to="item.path"
              :class="[
                $route.path === item.path ? 'text-antique-gold' : 'text-vintage-gray',
                'flex flex-col items-center py-2 px-3 rounded-lg transition-colors'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 mb-1" />
              <span class="text-xs">{{ item.name }}</span>
            </router-link>
          </div>
        </nav>
      </main>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="cancelLogout"></div>
      <div class="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <div class="text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="font-display text-lg text-vintage-charcoal mb-2">Confirm Logout</h3>
          <p class="text-vintage-gray mb-6">Are you sure you want to log out? This will securely end your session.</p>
          <div class="flex space-x-3">
            <button 
              @click="cancelLogout" 
              class="flex-1 px-4 py-2 text-vintage-gray border border-vintage-beige rounded-lg hover:bg-vintage-beige transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="confirmLogout" 
              class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Main App Component
 * 
 * Features:
 * - Responsive navigation with sidebar for authenticated users
 * - Landing page is completely public (no admin UI elements)
 * - Mobile-friendly navigation with bottom nav bar
 * - Admin access button appears on landing page for logged-in users
 * - Conditional rendering based on authentication and current route
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { 
  Home, 
  Package, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  Search,
  BarChart3,
  FileText,
  Globe
} from 'lucide-vue-next'
// Composables
const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const isLoading = ref(true)
const isMobile = ref(false)
const showMobileMenu = ref(false)
const showLogoutModal = ref(false)

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isLandingPage = computed(() => router.currentRoute.value.path === '/')
const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('').toUpperCase()
})

// Navigation items
const navigationItems = [
  // { name: 'Landing Page', path: '/', icon: Globe, divider: true },
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Clients', path: '/clients', icon: Users },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Installments', path: '/installments', icon: CreditCard },
  // { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Logout', path: '#', icon: LogOut, action: 'logout', divider: true }
]

const mobileNavigationItems = [
  { name: 'Landing', path: '/', icon: Globe },
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'Items', path: '/inventory', icon: Package },
  { name: 'Clients', path: '/clients', icon: Users },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Payments', path: '/installments', icon: CreditCard }
]

// Methods
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const toggleSearch = () => {
  // TODO: Implement search functionality
  console.log('Search functionality coming soon!')
}

const logout = async () => {
  // Show confirmation modal
  showLogoutModal.value = true
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

const confirmLogout = async () => {
  showLogoutModal.value = false
  
  try {
    // Close mobile menu if open
    if (showMobileMenu.value) {
      closeMobileMenu()
    }

    const result = await authStore.logout()
    
    if (result.success) {
      console.log('Logged out successfully')
      // Redirect to login page
      router.push('/login')
    } else {
      console.error('Logout failed:', result.error)
      // Even if logout failed, redirect to login for security
      router.push('/login')
    }
  } catch (error) {
    console.error('Failed to logout:', error)
    // Even if logout failed, redirect to login for security
    router.push('/login')
  }
}

// Lifecycle
onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Add keyboard shortcut for logout (Ctrl+L)
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'l' && isAuthenticated.value) {
      event.preventDefault()
      logout()
    }
  }
  window.addEventListener('keydown', handleKeydown)
  
  // Initialize auth
  try {
    console.log('Initializing auth store...')
    await authStore.initialize()
    console.log('Auth store initialized, user:', authStore.user)
  } catch (error) {
    console.error('Failed to initialize auth:', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Custom scrollbar for main content */
.overflow-auto {
  scrollbar-width: thin;
  scrollbar-color: #D4AF37 #F5F5DC;
}

.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #F5F5DC;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #D4AF37;
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #CD7F32;
}
</style> 