<template>
  <div class="min-h-screen bg-vintage-ivory">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-vintage-beige py-8">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="font-display text-4xl lg:text-6xl text-vintage-charcoal mb-4">
          Viejos Recuerdos
        </h1>
        <p class="text-xl text-vintage-gray max-w-3xl mx-auto">
          Descubre la belleza atemporal de antigüedades únicas
        </p>
      </div>
    </header>

    <!-- Hero CTA -->
    <section class="py-16 bg-gradient-to-br from-antique-gold to-antique-bronze">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-white mb-6">Tesoros Únicos Esperando por Ti</h2>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="tel:+1234567890" class="inline-flex items-center px-8 py-3 bg-white text-antique-gold font-semibold rounded-lg hover:bg-gray-50">
            <Phone class="w-5 h-5 mr-2" />
            Llamar Ahora
          </a>
          <a href="https://instagram.com/viejosrecuerdos" target="_blank" class="inline-flex items-center px-8 py-3 bg-vintage-charcoal text-white font-semibold rounded-lg hover:bg-gray-800">
            <Instagram class="w-5 h-5 mr-2" />
            Seguir en Instagram
          </a>
        </div>
      </div>
    </section>

    <!-- Featured Items Section 1 -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-4">Colección Destacada</h2>
          <p class="text-lg text-vintage-gray">Nuestras piezas más preciadas - 12 artículos únicos</p>
        </div>
        
        <div v-if="featuredItems.section1.length > 0" class="relative">
          <!-- Carousel Container -->
          <div class="overflow-hidden rounded-lg px-4 sm:px-8 md:px-6 lg:px-8 carousel-peek">
            <div 
              class="flex transition-transform duration-700 ease-in-out py-4"
              :style="{ transform: `translateX(-${currentSlide1 * 100}%)` }"
            >
              <!-- Create slides with 3.5 items each (12 total items = 3 slides) -->
              <div 
                v-for="(slide, slideIndex) in section1Slides" 
                :key="`slide-${slideIndex}`"
                class="flex flex-shrink-0"
                style="width: 100%"
              >
                <div 
                  v-for="item in slide" 
                  :key="item.itemId"
                  class="w-56 sm:w-64 md:w-72 flex-shrink-0 px-2 sm:px-3 md:px-3 lg:px-4"
                >
                  <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full transform hover:scale-105">
                    <div class="relative h-48 bg-vintage-beige">
                      <img v-if="item.imageUrls && item.imageUrls.length > 0" 
                           :src="item.imageUrls[0].url" 
                           :alt="item.itemName"
                           class="w-full h-full object-cover" />
                      <div v-else class="flex items-center justify-center h-full">
                        <Package class="w-12 h-12 text-vintage-beige" />
                      </div>
                    </div>
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-base text-vintage-charcoal truncate flex-1 mr-2">{{ item.itemName }}</h3>
                        <span class="text-xs text-vintage-gray bg-vintage-beige px-2 py-1 rounded flex-shrink-0">{{ item.friendlyId }}</span>
                      </div>
                      <p class="text-sm text-vintage-gray mb-3">{{ item.category }}</p>
                      <div class="text-xl font-bold text-antique-gold mb-3">${{ formatPrice(item.unitPrice) }}</div>
                      <button @click="viewItemDetails(item.itemId)" class="w-full bg-antique-gold text-white py-2 px-3 rounded-lg hover:bg-antique-bronze transition-colors text-sm">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Navigation Arrows -->
          <button 
            @click="previousSlide(1)"
            :disabled="section1Slides.length <= 1 || currentSlide1 === 0"
            class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 text-vintage-charcoal p-3 rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          <button 
            @click="nextSlide(1)"
            :disabled="section1Slides.length <= 1 || currentSlide1 >= section1Slides.length - 1"
            class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 text-vintage-charcoal p-3 rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
          
          <!-- Slide Indicators -->
          <div v-if="section1Slides.length > 1" class="flex justify-center mt-6 space-x-2">
            <button 
              v-for="index in section1Slides.length" 
              :key="index"
              @click="goToSlide(1, index - 1)"
              :class="[
                'w-3 h-3 rounded-full transition-colors',
                currentSlide1 === index - 1 ? 'bg-antique-gold' : 'bg-vintage-beige hover:bg-antique-gold/50'
              ]"
            />
          </div>
        </div>
        
        <div v-else class="text-center py-16">
          <Package class="w-16 h-16 text-vintage-beige mx-auto mb-4" />
          <p class="text-vintage-gray text-lg">No hay elementos destacados en esta sección</p>
        </div>
      </div>
    </section>

    <!-- Featured Items Section 2 -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-4">Piezas Especiales</h2>
          <p class="text-lg text-vintage-gray">Descubre nuestra segunda colección de 12 artículos especiales</p>
        </div>
        
        <div v-if="featuredItems.section2.length > 0" class="relative">
          <!-- Carousel Container -->
          <div class="overflow-hidden rounded-lg px-4 sm:px-8 md:px-6 lg:px-8 carousel-peek">
            <div 
              class="flex transition-transform duration-700 ease-in-out py-4"
              :style="{ transform: `translateX(-${currentSlide2 * 100}%)` }"
            >
                                                                                        <!-- Create slides with 3.5 items each (12 total items = 3 slides) -->
                              <div 
                                v-for="(slide, slideIndex) in section2Slides" 
                                :key="`slide-${slideIndex}`"
                                class="flex flex-shrink-0"
                                style="width: 100%"
                              >
                                <div 
                                  v-for="item in slide" 
                                  :key="item.itemId"
                                  class="w-56 sm:w-64 md:w-72 flex-shrink-0 px-2 sm:px-3 md:px-3 lg:px-4"
                                >
                  <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-vintage-beige hover:shadow-xl transition-all duration-300 h-full transform hover:scale-105">
                    <div class="relative h-48 bg-vintage-beige">
                      <img v-if="item.imageUrls && item.imageUrls.length > 0" 
                           :src="item.imageUrls[0].url" 
                           :alt="item.itemName"
                           class="w-full h-full object-cover" />
                      <div v-else class="flex items-center justify-center h-full">
                        <Package class="w-12 h-12 text-vintage-beige" />
                      </div>
                    </div>
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-base text-vintage-charcoal truncate flex-1 mr-2">{{ item.itemName }}</h3>
                        <span class="text-xs text-vintage-gray bg-vintage-beige px-2 py-1 rounded flex-shrink-0">{{ item.friendlyId }}</span>
                      </div>
                      <p class="text-sm text-vintage-gray mb-3">{{ item.category }}</p>
                      <div class="text-xl font-bold text-antique-gold mb-3">${{ formatPrice(item.unitPrice) }}</div>
                      <button @click="viewItemDetails(item.itemId)" class="w-full bg-antique-gold text-white py-2 px-3 rounded-lg hover:bg-antique-bronze transition-colors text-sm">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Navigation Arrows -->
          <button 
            @click="previousSlide(2)"
            :disabled="section2Slides.length <= 1 || currentSlide2 === 0"
            class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 text-vintage-charcoal p-3 rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          <button 
            @click="nextSlide(2)"
            :disabled="section2Slides.length <= 1 || currentSlide2 >= section2Slides.length - 1"
            class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 text-vintage-charcoal p-3 rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
          
          <!-- Slide Indicators -->
          <div v-if="section2Slides.length > 1" class="flex justify-center mt-6 space-x-2">
            <button 
              v-for="index in section2Slides.length" 
              :key="index"
              @click="goToSlide(2, index - 1)"
              :class="[
                'w-3 h-3 rounded-full transition-colors',
                currentSlide2 === index - 1 ? 'bg-antique-gold' : 'bg-vintage-beige hover:bg-antique-gold/50'
              ]"
            />
          </div>
        </div>
        
        <div v-else class="text-center py-16">
          <Package class="w-16 h-16 text-vintage-beige mx-auto mb-4" />
          <p class="text-vintage-gray text-lg">No hay elementos destacados en esta sección</p>
        </div>
      </div>
    </section>

    <!-- Featured Items Section 3 -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-4">Colección Exclusiva</h2>
          <p class="text-lg text-vintage-gray">Nuestra tercera colección de 12 artículos exclusivos</p>
        </div>
        
        <div v-if="featuredItems.section3.length > 0" class="relative">
          <!-- Carousel Container -->
          <div class="overflow-hidden rounded-lg px-4 sm:px-8 md:px-6 lg:px-8 carousel-peek">
            <div 
              class="flex transition-transform duration-700 ease-in-out py-4"
              :style="{ transform: `translateX(-${currentSlide3 * 100}%)` }"
            >
              <!-- Create slides with 3.5 items each (12 total items = 3 slides) -->
              <div 
                v-for="(slide, slideIndex) in section3Slides" 
                :key="`slide-${slideIndex}`"
                class="flex flex-shrink-0"
                style="width: 100%"
              >
                <div 
                  v-for="item in slide" 
                  :key="item.itemId"
                  class="w-56 sm:w-64 md:w-72 flex-shrink-0 px-2 sm:px-3 md:px-3 lg:px-4"
                >
                  <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full transform hover:scale-105">
                    <div class="relative h-48 bg-vintage-beige">
                      <img v-if="item.imageUrls && item.imageUrls.length > 0" 
                           :src="item.imageUrls[0].url" 
                           :alt="item.itemName"
                           class="w-full h-full object-cover" />
                      <div v-else class="flex items-center justify-center h-full">
                        <Package class="w-12 h-12 text-vintage-beige" />
                      </div>
                    </div>
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-base text-vintage-charcoal truncate flex-1 mr-2">{{ item.itemName }}</h3>
                        <span class="text-xs text-vintage-gray bg-vintage-beige px-2 py-1 rounded flex-shrink-0">{{ item.friendlyId }}</span>
                      </div>
                      <p class="text-sm text-vintage-gray mb-3">{{ item.category }}</p>
                      <div class="text-xl font-bold text-antique-gold mb-3">${{ formatPrice(item.unitPrice) }}</div>
                      <button @click="viewItemDetails(item.itemId)" class="w-full bg-antique-gold text-white py-2 px-3 rounded-lg hover:bg-antique-bronze transition-colors text-sm">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Navigation Arrows -->
          <button 
            @click="previousSlide(3)"
            :disabled="section3Slides.length <= 1 || currentSlide3 === 0"
            class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 text-vintage-charcoal p-3 rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          <button 
            @click="nextSlide(3)"
            :disabled="section3Slides.length <= 1 || currentSlide3 >= section3Slides.length - 1"
            class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 text-vintage-charcoal p-3 rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
          
          <!-- Slide Indicators -->
          <div v-if="section3Slides.length > 1" class="flex justify-center mt-6 space-x-2">
            <button 
              v-for="index in section3Slides.length" 
              :key="index"
              @click="goToSlide(3, index - 1)"
              :class="[
                'w-3 h-3 rounded-full transition-colors',
                currentSlide3 === index - 1 ? 'bg-antique-gold' : 'bg-vintage-beige hover:bg-antique-gold/50'
              ]"
            />
          </div>
        </div>
        
        <div v-else class="text-center py-16">
          <Package class="w-16 h-16 text-vintage-beige mx-auto mb-4" />
          <p class="text-vintage-gray text-lg">No hay elementos destacados en esta sección</p>
        </div>
      </div>
    </section>

    <!-- Featured Items Section 4 -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="font-display text-3xl lg:text-4xl text-vintage-charcoal mb-4">Tesoros Únicos</h2>
          <p class="text-lg text-vintage-gray">Nuestra cuarta colección de 12 artículos únicos</p>
        </div>
        
        <div v-if="featuredItems.section4.length > 0" class="relative">
          <!-- Carousel Container -->
          <div class="overflow-hidden rounded-lg px-4 sm:px-8 md:px-6 lg:px-8 carousel-peek">
            <div 
              class="flex transition-transform duration-700 ease-in-out py-4"
              :style="{ transform: `translateX(-${currentSlide4 * 100}%)` }"
            >
              <!-- Create slides with 3.5 items each (12 total items = 3 slides) -->
              <div 
                v-for="(slide, slideIndex) in section4Slides" 
                :key="`slide-${slideIndex}`"
                class="flex flex-shrink-0"
                style="width: 100%"
              >
                <div 
                  v-for="item in slide" 
                  :key="item.itemId"
                  class="w-56 sm:w-64 md:w-72 flex-shrink-0 px-2 sm:px-3 md:px-3 lg:px-4"
                >
                  <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-vintage-beige hover:shadow-xl transition-all duration-300 h-full transform hover:scale-105">
                    <div class="relative h-48 bg-vintage-beige">
                      <img v-if="item.imageUrls && item.imageUrls.length > 0" 
                           :src="item.imageUrls[0].url" 
                           :alt="item.itemName"
                           class="w-full h-full object-cover" />
                      <div v-else class="flex items-center justify-center h-full">
                        <Package class="w-12 h-12 text-vintage-beige" />
                      </div>
                    </div>
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-2">
                        <h3 class="font-semibold text-base text-vintage-charcoal truncate flex-1 mr-2">{{ item.itemName }}</h3>
                        <span class="text-xs text-vintage-gray bg-vintage-beige px-2 py-1 rounded flex-shrink-0">{{ item.friendlyId }}</span>
                      </div>
                      <p class="text-sm text-vintage-gray mb-3">{{ item.category }}</p>
                      <div class="text-xl font-bold text-antique-gold mb-3">${{ formatPrice(item.unitPrice) }}</div>
                      <button @click="viewItemDetails(item.itemId)" class="w-full bg-antique-gold text-white py-2 px-3 rounded-lg hover:bg-antique-bronze transition-colors text-sm">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Navigation Arrows -->
          <button 
            @click="previousSlide(4)"
            :disabled="section4Slides.length <= 1 || currentSlide4 === 0"
            class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 text-vintage-charcoal p-3 rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          <button 
            @click="nextSlide(4)"
            :disabled="section4Slides.length <= 1 || currentSlide4 >= section4Slides.length - 1"
            class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 text-vintage-charcoal p-3 rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
          
          <!-- Slide Indicators -->
          <div v-if="section4Slides.length > 1" class="flex justify-center mt-6 space-x-2">
            <button 
              v-for="index in section4Slides.length" 
              :key="index"
              @click="goToSlide(4, index - 1)"
              :class="[
                'w-3 h-3 rounded-full transition-colors',
                currentSlide4 === index - 1 ? 'bg-antique-gold' : 'bg-vintage-beige hover:bg-antique-gold/50'
              ]"
            />
          </div>
        </div>
        
        <div v-else class="text-center py-16">
          <Package class="w-16 h-16 text-vintage-beige mx-auto mb-4" />
          <p class="text-vintage-gray text-lg">No hay elementos destacados en esta sección</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-vintage-charcoal text-white py-12">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h3 class="font-display text-2xl text-antique-gold mb-4">Viejos Recuerdos</h3>
        <p class="text-gray-300 mb-4">Preservando la belleza del pasado</p>
        <p class="text-gray-400">&copy; 2025 Viejos Recuerdos. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * Landing Page Component
 * 
 * Features:
 * - 12 items per section (increased from 10)
 * - 3 slides per section (4 items per slide)
 * - 3.5 items visible per slide with peek effect
 * - Auto-scroll with 8-second pause on user interaction
 * - Touch/swipe support for mobile devices
 * - Responsive design for all screen sizes
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Phone, Instagram, Package, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { InventoryItem } from '@/types'

const featuredItems = ref({
  section1: [] as InventoryItem[],
  section2: [] as InventoryItem[],
  section3: [] as InventoryItem[],
  section4: [] as InventoryItem[]
})

// Carousel state
const currentSlide1 = ref(0)
const currentSlide2 = ref(0)
const currentSlide3 = ref(0)
const currentSlide4 = ref(0)
const itemsPerSlide = ref(3.5)

      // Responsive items per slide
      const getItemsPerSlide = () => {
        if (window.innerWidth < 640) return 1    // Mobile: 1 item
        if (window.innerWidth < 768) return 2    // Small tablet: 2 items
        if (window.innerWidth < 1024) return 3   // Tablet: 3 items
        return 3.5                                // Desktop: 3.5 items (3 whole + 1 half)
      }

// Update items per slide on resize
const updateItemsPerSlide = () => {
  itemsPerSlide.value = getItemsPerSlide()
}

// Debug logging
const debugCarousel = () => {
  console.log('Section 1 items:', featuredItems.value.section1.length)
  console.log('Section 2 items:', featuredItems.value.section2.length)
  console.log('Section 3 items:', featuredItems.value.section3.length)
  console.log('Section 4 items:', featuredItems.value.section4.length)
  console.log('Items per slide:', itemsPerSlide.value)
  console.log('Current slide 1:', currentSlide1.value)
  console.log('Current slide 2:', currentSlide2.value)
  console.log('Current slide 3:', currentSlide3.value)
  console.log('Current slide 4:', currentSlide4.value)
  console.log('Section 1 slides:', section1Slides.value)
  console.log('Section 2 slides:', section2Slides.value)
  console.log('Section 3 slides:', section3Slides.value)
  console.log('Section 4 slides:', section4Slides.value)
  console.log('Max slides 1:', section1Slides.value.length)
  console.log('Max slides 2:', section2Slides.value.length)
  console.log('Max slides 3:', section3Slides.value.length)
  console.log('Max slides 4:', section4Slides.value.length)
}

// Computed properties for carousel slides
      const section1Slides = computed(() => {
        const slides = []
        // For desktop (3.5 items), we want to show 3.5 items per slide
        // Each slide should contain 4 items, but display only 3.5
        // With 12 items, we'll have 3 slides (4 + 4 + 4)
        const slideSize = 4
        for (let i = 0; i < featuredItems.value.section1.length; i += slideSize) {
          slides.push(featuredItems.value.section1.slice(i, i + slideSize))
        }
        return slides
      })

      const section2Slides = computed(() => {
        const slides = []
        // For desktop (3.5 items), we want to show 3.5 items per slide
        // Each slide should contain 4 items, but display only 3.5
        // With 12 items, we'll have 3 slides (4 + 4 + 4)
        const slideSize = 4
        for (let i = 0; i < featuredItems.value.section2.length; i += slideSize) {
          slides.push(featuredItems.value.section2.slice(i, i + slideSize))
        }
        return slides
      })

      const section3Slides = computed(() => {
        const slides = []
        // For desktop (3.5 items), we want to show 3.5 items per slide
        // Each slide should contain 4 items, but display only 3.5
        // With 12 items, we'll have 3 slides (4 + 4 + 4)
        const slideSize = 4
        for (let i = 0; i < featuredItems.value.section3.length; i += slideSize) {
          slides.push(featuredItems.value.section3.slice(i, i + slideSize))
        }
        return slides
      })

      const section4Slides = computed(() => {
        const slides = []
        // For desktop (3.5 items), we want to show 3.5 items per slide
        // Each slide should contain 4 items, but display only 3.5
        // With 12 items, we'll have 3 slides (4 + 4 + 4)
        const slideSize = 4
        for (let i = 0; i < featuredItems.value.section4.length; i += slideSize) {
          slides.push(featuredItems.value.section4.slice(i, i + slideSize))
        }
        return slides
      })

// Auto-scroll intervals and interaction tracking
let autoSlideInterval1: NodeJS.Timeout
let autoSlideInterval2: NodeJS.Timeout
let autoSlideInterval3: NodeJS.Timeout
let autoSlideInterval4: NodeJS.Timeout
let interactionTimeout1: NodeJS.Timeout
let interactionTimeout2: NodeJS.Timeout
let interactionTimeout3: NodeJS.Timeout
let interactionTimeout4: NodeJS.Timeout
const isAutoScrollPaused1 = ref(false)
const isAutoScrollPaused2 = ref(false)
const isAutoScrollPaused3 = ref(false)
const isAutoScrollPaused4 = ref(false)

const loadFeaturedItems = async () => {
  try {
    const response = await fetch('/api/landing/featured-items')
    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        featuredItems.value = data.data
        // Debug the carousel structure
        setTimeout(() => debugCarousel(), 100)
      }
    }
  } catch (error) {
    console.error('Error loading featured items:', error)
  }
}

const viewItemDetails = (itemId: string) => {
  window.open(`/api/qr/${itemId}/view`, '_blank')
}

const formatPrice = (price: number) => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Carousel functions
const nextSlide = (section: number) => {
  if (section === 1) {
    const maxSlides = Math.max(0, section1Slides.value.length - 1)
    currentSlide1.value = currentSlide1.value >= maxSlides ? 0 : currentSlide1.value + 1
    pauseAutoScroll(1)
  } else if (section === 2) {
    const maxSlides = Math.max(0, section2Slides.value.length - 1)
    currentSlide2.value = currentSlide2.value >= maxSlides ? 0 : currentSlide2.value + 1
    pauseAutoScroll(2)
  } else if (section === 3) {
    const maxSlides = Math.max(0, section3Slides.value.length - 1)
    currentSlide3.value = currentSlide3.value >= maxSlides ? 0 : currentSlide3.value + 1
    pauseAutoScroll(3)
  } else if (section === 4) {
    const maxSlides = Math.max(0, section4Slides.value.length - 1)
    currentSlide4.value = currentSlide4.value >= maxSlides ? 0 : currentSlide4.value + 1
    pauseAutoScroll(4)
  }
}

const previousSlide = (section: number) => {
  if (section === 1) {
    const maxSlides = Math.max(0, section1Slides.value.length - 1)
    currentSlide1.value = currentSlide1.value <= 0 ? maxSlides : currentSlide1.value - 1
    pauseAutoScroll(1)
  } else if (section === 2) {
    const maxSlides = Math.max(0, section2Slides.value.length - 1)
    currentSlide2.value = currentSlide2.value <= 0 ? maxSlides : currentSlide2.value - 1
    pauseAutoScroll(2)
  } else if (section === 3) {
    const maxSlides = Math.max(0, section3Slides.value.length - 1)
    currentSlide3.value = currentSlide3.value <= 0 ? maxSlides : currentSlide3.value - 1
    pauseAutoScroll(3)
  } else if (section === 4) {
    const maxSlides = Math.max(0, section4Slides.value.length - 1)
    currentSlide4.value = currentSlide4.value <= 0 ? maxSlides : currentSlide4.value - 1
    pauseAutoScroll(4)
  }
}

const goToSlide = (section: number, index: number) => {
  if (section === 1) {
    currentSlide1.value = index
    pauseAutoScroll(1)
  } else if (section === 2) {
    currentSlide2.value = index
    pauseAutoScroll(2)
  } else if (section === 3) {
    currentSlide3.value = index
    pauseAutoScroll(3)
  } else if (section === 4) {
    currentSlide4.value = index
    pauseAutoScroll(4)
  }
}

// Pause auto-scroll for 8 seconds when user interacts
const pauseAutoScroll = (section: number) => {
  if (section === 1) {
    isAutoScrollPaused1.value = true
    if (interactionTimeout1) clearTimeout(interactionTimeout1)
    interactionTimeout1 = setTimeout(() => {
      isAutoScrollPaused1.value = false
    }, 8000)
  } else if (section === 2) {
    isAutoScrollPaused2.value = true
    if (interactionTimeout2) clearTimeout(interactionTimeout2)
    interactionTimeout2 = setTimeout(() => {
      isAutoScrollPaused2.value = false
    }, 8000)
  } else if (section === 3) {
    isAutoScrollPaused3.value = true
    if (interactionTimeout3) clearTimeout(interactionTimeout3)
    interactionTimeout3 = setTimeout(() => {
      isAutoScrollPaused3.value = false
    }, 8000)
  } else if (section === 4) {
    isAutoScrollPaused4.value = true
    if (interactionTimeout4) clearTimeout(interactionTimeout4)
    interactionTimeout4 = setTimeout(() => {
      isAutoScrollPaused4.value = false
    }, 8000)
  }
}

// Auto-scroll functionality
const startAutoSlide = () => {
  autoSlideInterval1 = setInterval(() => {
    if (section1Slides.value.length > 1 && !isAutoScrollPaused1.value) {
      // Use internal slide change without triggering pause
      const maxSlides = Math.max(0, section1Slides.value.length - 1)
      currentSlide1.value = currentSlide1.value >= maxSlides ? 0 : currentSlide1.value + 1
    }
  }, 8000)
  
  autoSlideInterval2 = setInterval(() => {
    if (section2Slides.value.length > 1 && !isAutoScrollPaused2.value) {
      // Use internal slide change without triggering pause
      const maxSlides = Math.max(0, section2Slides.value.length - 1)
      currentSlide2.value = currentSlide2.value >= maxSlides ? 0 : currentSlide2.value + 1
    }
  }, 6000)

  autoSlideInterval3 = setInterval(() => {
    if (section3Slides.value.length > 1 && !isAutoScrollPaused3.value) {
      // Use internal slide change without triggering pause
      const maxSlides = Math.max(0, section3Slides.value.length - 1)
      currentSlide3.value = currentSlide3.value >= maxSlides ? 0 : currentSlide3.value + 1
    }
  }, 7000)

  autoSlideInterval4 = setInterval(() => {
    if (section4Slides.value.length > 1 && !isAutoScrollPaused4.value) {
      // Use internal slide change without triggering pause
      const maxSlides = Math.max(0, section4Slides.value.length - 1)
      currentSlide4.value = currentSlide4.value >= maxSlides ? 0 : currentSlide4.value + 1
    }
  }, 9000)
}

const stopAutoSlide = () => {
  if (autoSlideInterval1) clearInterval(autoSlideInterval1)
  if (autoSlideInterval2) clearInterval(autoSlideInterval2)
  if (autoSlideInterval3) clearInterval(autoSlideInterval3)
  if (autoSlideInterval4) clearInterval(autoSlideInterval4)
  if (interactionTimeout1) clearTimeout(interactionTimeout1)
  if (interactionTimeout2) clearTimeout(interactionTimeout2)
  if (interactionTimeout3) clearTimeout(interactionTimeout3)
  if (interactionTimeout4) clearTimeout(interactionTimeout4)
}

onMounted(async () => {
  await loadFeaturedItems()
  updateItemsPerSlide() // Initialize responsive items per slide
  startAutoSlide()
  
  // Add resize listener for responsive behavior
  window.addEventListener('resize', updateItemsPerSlide)
  
  // Add touch/swipe detection for mobile devices
  const carouselContainers = document.querySelectorAll('.carousel-peek')
  carouselContainers.forEach((container, index) => {
    let touchStartX = 0
    let touchEndX = 0
    
    container.addEventListener('touchstart', (e) => {
      const touchEvent = e as TouchEvent
      touchStartX = touchEvent.changedTouches[0].screenX
      pauseAutoScroll(index + 1) // Pause auto-scroll for this carousel
    })
    
    container.addEventListener('touchend', (e) => {
      const touchEvent = e as TouchEvent
      touchEndX = touchEvent.changedTouches[0].screenX
      const swipeDistance = touchStartX - touchEndX
      
      // Detect swipe gestures
      if (Math.abs(swipeDistance) > 50) {
        if (swipeDistance > 0) {
          // Swipe left - next slide
          nextSlide(index + 1)
        } else {
          // Swipe right - previous slide
          previousSlide(index + 1)
        }
      }
    })
  })
})

// Cleanup on unmount
onUnmounted(() => {
  stopAutoSlide()
  window.removeEventListener('resize', updateItemsPerSlide)
  
  // Clean up touch event listeners
  const carouselContainers = document.querySelectorAll('.carousel-peek')
  carouselContainers.forEach((container) => {
    container.removeEventListener('touchstart', () => {})
    container.removeEventListener('touchend', () => {})
  })
})
</script>

<style scoped>
.font-display {
  font-family: 'Playfair Display', serif;
}

/* Carousel animations */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 700ms;
}

/* Hover effects */
.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Navigation button hover effects */
.nav-button:hover {
  transform: scale(1.05);
}

/* Slide indicator animations */
.slide-indicator {
  transition: all 0.3s ease;
}

.slide-indicator:hover {
  transform: scale(1.2);
}

/* Carousel container styles */
.overflow-hidden {
  overflow: hidden;
}

/* Ensure smooth horizontal scrolling */
.flex {
  display: flex;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

/* Peek effect - show partial next item */
.carousel-peek {
  position: relative;
}

.carousel-peek::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1.5rem; /* Further reduced for better 3.5 item peek */
  height: 100%;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.02)); /* Very subtle */
  pointer-events: none;
  z-index: 1;
}

/* Enhanced peek effect for better visual hint */
.carousel-peek .flex > div:last-child {
  opacity: 0.7;
  transform: scale(0.95);
  transition: all 0.3s ease;
}

.carousel-peek .flex > div:last-child:hover {
  opacity: 1;
  transform: scale(1);
}

/* Better spacing for desktop items */
@media (min-width: 768px) {
  .carousel-peek .flex > div {
    margin-right: 0.75rem;
  }
  
  .carousel-peek .flex > div:last-child {
    margin-right: 0;
  }
}

@media (min-width: 1024px) {
  .carousel-peek .flex > div {
    margin-right: 1rem;
  }
  
  .carousel-peek .flex > div:last-child {
    margin-right: 0;
  }
}

/* Ensure proper item separation and prevent overlapping */
.carousel-peek .flex > div {
  position: relative;
  z-index: 1;
}

.carousel-peek .flex > div:hover {
  z-index: 2;
}

/* Responsive carousel adjustments */
@media (max-width: 640px) {
  .w-64 {
    width: 256px;
  }
}

@media (min-width: 641px) and (max-width: 767px) {
  .w-72 {
    width: 288px;
  }
}

@media (min-width: 768px) {
  .w-80 {
    width: 320px;
  }
}
</style>
