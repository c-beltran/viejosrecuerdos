<template>
  <div class="min-h-screen bg-vintage-ivory flex items-center justify-center p-4">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-vintage-pattern opacity-5"></div>
    
    <!-- Main Login Container -->
    <div class="w-full max-w-md relative z-10">
      <!-- Logo Section -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-antique-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="text-white font-handwriting text-3xl">VR</span>
        </div>
        <h1 class="font-display text-3xl text-vintage-charcoal mb-2">Viejos Recuerdos</h1>
        <p class="text-vintage-gray font-medium">Antique Shop Management</p>
      </div>

      <!-- Login Form -->
      <div class="card-antique p-8">
        <div class="text-center mb-6">
          <h2 class="font-display text-2xl text-vintage-charcoal mb-2">
            {{ isLogin ? 'Welcome Back' : 'Create Account' }}
          </h2>
          <p class="text-vintage-gray">
            {{ isLogin ? 'Sign in to your account' : 'Join our antique family' }}
          </p>
        </div>



        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name Field (Register only) -->
          <div v-if="!isLogin" class="space-y-2">
            <label for="name" class="block text-sm font-medium text-vintage-charcoal">
              Full Name
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input-antique"
              placeholder="Enter your full name"
              :disabled="isLoading"
            />
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-medium text-vintage-charcoal">
              Email Address
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input-antique"
              placeholder="Enter your email"
              :disabled="isLoading"
            />
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-medium text-vintage-charcoal">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="input-antique pr-12"
                placeholder="Enter your password"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-vintage-gray hover:text-antique-gold"
                :disabled="isLoading"
              >
                <Eye v-if="showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Confirm Password Field (Register only) -->
          <div v-if="!isLogin" class="space-y-2">
            <label for="confirmPassword" class="block text-sm font-medium text-vintage-charcoal">
              Confirm Password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="input-antique pr-12"
                placeholder="Confirm your password"
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-vintage-gray hover:text-antique-gold"
                :disabled="isLoading"
              >
                <Eye v-if="showConfirmPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Forgot Password Link (Login only) -->
          <div v-if="isLogin" class="text-right">
            <button
              type="button"
              @click="showForgotPassword = true"
              class="text-sm text-antique-gold hover:text-antique-bronze transition-colors"
              :disabled="isLoading"
            >
              Forgot your password?
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <AlertCircle class="w-5 h-5 text-red-500 mr-2" />
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full btn-antique py-3 text-lg font-medium"
          >
            <div v-if="isLoading" class="flex items-center justify-center">
              <div class="loading-spinner w-5 h-5 mr-2"></div>
              {{ isLogin ? 'Signing In...' : 'Creating Account...' }}
            </div>
            <span v-else>
              {{ isLogin ? 'Sign In' : 'Create Account' }}
            </span>
          </button>
        </form>

        <!-- Toggle Login/Register -->
        <div class="mt-6 text-center">
          <p class="text-vintage-gray">
            {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
            <button
              type="button"
              @click="toggleMode"
              class="text-antique-gold hover:text-antique-bronze font-medium transition-colors"
              :disabled="isLoading"
            >
              {{ isLogin ? 'Sign up' : 'Sign in' }}
            </button>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-vintage-gray">
          © 2024 Viejos Recuerdos. All rights reserved.
        </p>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPassword" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="showForgotPassword = false"></div>
      <div class="card-antique p-6 w-full max-w-md relative">
        <h3 class="font-display text-xl text-vintage-charcoal mb-4">Reset Password</h3>
        <p class="text-vintage-gray mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form @submit.prevent="handleForgotPassword" class="space-y-4">
          <input
            v-model="forgotPasswordEmail"
            type="email"
            required
            class="input-antique"
            placeholder="Enter your email"
            :disabled="isLoading"
          />
          
          <div class="flex space-x-3">
            <button
              type="button"
              @click="showForgotPassword = false"
              class="flex-1 btn-antique-outline"
              :disabled="isLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 btn-antique"
              :disabled="isLoading"
            >
              <div v-if="isLoading" class="flex items-center justify-center">
                <div class="loading-spinner w-4 h-4 mr-2"></div>
                Sending...
              </div>
              <span v-else>Send Reset Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { LoginForm, RegisterForm } from '@/types'
import { Eye, EyeOff, AlertCircle } from 'lucide-vue-next'

// Composables
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

// Reactive state
const isLogin = ref(true)
const isLoading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showForgotPassword = ref(false)
const forgotPasswordEmail = ref('')

// Form data
const form = reactive<LoginForm & RegisterForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Computed properties
const isFormValid = computed(() => {
  if (isLogin.value) {
    return form.email && form.password
  } else {
    return form.name && form.email && form.password && form.confirmPassword && form.password === form.confirmPassword
  }
})

// Methods
const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = null
  // Clear form
  Object.assign(form, {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
}

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Please fill in all required fields'
    return
  }

  if (!isLogin.value && form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    isLoading.value = true
    error.value = null

    let result
    if (isLogin.value) {
      result = await authStore.login({
        email: form.email,
        password: form.password
      })
    } else {
      result = await authStore.register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      })
    }

    if (result.success) {
      toast.success(isLogin.value ? 'Welcome back!' : 'Account created successfully!')
      router.push('/dashboard')
    } else {
      error.value = result.error || 'An error occurred'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}



const handleForgotPassword = async () => {
  if (!forgotPasswordEmail.value) {
    return
  }

  try {
    isLoading.value = true
    const result = await authStore.resetPassword(forgotPasswordEmail.value)
    
    if (result.success) {
      toast.success('Password reset link sent to your email!')
      showForgotPassword.value = false
      forgotPasswordEmail.value = ''
    } else {
      error.value = result.error || 'Failed to send reset link'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send reset link'
  } finally {
    isLoading.value = false
  }
}

// Clear error when form changes
const clearError = () => {
  error.value = null
}

// Watch for form changes to clear errors
import { watch } from 'vue'
watch([() => form.email, () => form.password, () => form.name, () => form.confirmPassword], clearError)
</script>

<style scoped>
/* Custom animations for the login form */
.card-antique {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading spinner animation */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 