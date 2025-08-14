import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Toast, { type PluginOptions } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import './style.css'

// Import stores
import { useAuthStore } from './stores/auth'
import { useInventoryStore } from './stores/inventory'
import { useClientStore } from './stores/client'
import { useSalesStore } from './stores/sales'

// Import views
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import InventoryView from './views/InventoryView.vue'
import InventoryDetailView from './views/InventoryDetailView.vue'
import InventoryFormView from './views/InventoryFormView.vue'
import ClientsView from './views/ClientsView.vue'
import ClientDetailView from './views/ClientDetailView.vue'
import ClientFormView from './views/ClientFormView.vue'
import SalesView from './views/SalesView.vue'
import SalesFormView from './views/SalesFormView.vue'
import SalesDetailView from './views/SalesDetailView.vue'
import InstallmentsView from './views/InstallmentsView.vue'
import SettingsView from './views/SettingsView.vue'
import NotFoundView from './views/NotFoundView.vue'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: InventoryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory/new',
      name: 'inventory-new',
      component: InventoryFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory/:id',
      name: 'inventory-detail',
      component: InventoryDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/inventory/:id/edit',
      name: 'inventory-edit',
      component: InventoryFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/clients',
      name: 'clients',
      component: ClientsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/clients/new',
      name: 'client-new',
      component: ClientFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/clients/:id/edit',
      name: 'client-edit',
      component: ClientFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/clients/:id',
      name: 'client-detail',
      component: ClientDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/sales',
      name: 'sales',
      component: SalesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/sales/new',
      name: 'sales-new',
      component: SalesFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/sales/:id',
      name: 'sale-detail',
      component: SalesDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/sales/:id/edit',
      name: 'sale-edit',
      component: SalesFormView,
      meta: { requiresAuth: true }
    },
    {
      path: '/sales/:id/installments',
      name: 'sale-installments',
      component: InstallmentsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/installments',
      name: 'installments',
      component: InstallmentsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // If auth is still loading, wait for it to complete with timeout
  if (authStore.isLoading) {
    console.log('Auth is loading, waiting for initialization...')
    try {
      // Wait for auth to initialize with timeout
      await Promise.race([
        new Promise(resolve => {
          const unwatch = authStore.$subscribe((mutation, state) => {
            if (!state.isLoading) {
              unwatch()
              resolve(true)
            }
          })
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth initialization timeout')), 15000)
        )
      ])
    } catch (err) {
      console.error('Auth initialization timeout or error:', err)
      // Force reset loading state and continue
      authStore.$patch({ isLoading: false })
    }
  }
  
  console.log('Navigation guard - isAuthenticated:', authStore.isAuthenticated, 'Route:', to.path)
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login - not authenticated')
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('Redirecting to dashboard - already authenticated')
    next('/dashboard')
  } else {
    next()
  }
})

// Create app
const app = createApp(App)

// Toast configuration
const toastOptions: PluginOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Use plugins
app.use(createPinia())
app.use(router)
app.use(Toast, toastOptions)

// Mount app
app.mount('#app') 