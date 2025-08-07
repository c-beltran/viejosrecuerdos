# Viejos Recuerdos - Frontend

A beautiful, mobile-first Vue 3 application for antique shop management with elegant vintage theming.

## 🎨 Features

### **Design & UX**
- **Mobile-First Design**: Optimized for mobile devices with responsive desktop layout
- **Vintage Antique Theme**: Elegant color palette with gold, bronze, and vintage colors
- **Smooth Animations**: Subtle animations and transitions for enhanced UX
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

### **Authentication**
- **Secure Login/Register**: Supabase authentication with email/password
- **Password Reset**: Email-based password recovery
- **Session Management**: Persistent sessions with automatic token refresh
- **Role-Based Access**: Admin, Clerk, and Viewer roles

### **Core Functionality**
- **Dashboard**: Overview with key metrics and recent activity
- **Inventory Management**: Full CRUD with image upload and QR codes
- **Client Management**: Customer profiles and contact information
- **Sales Tracking**: Create and manage sales with multiple items
- **Installment Plans**: Track payment plans and individual payments
- **Reports & Analytics**: Business insights and data visualization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Clone and navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to `http://localhost:3000`

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Project Structure
```
frontend/
├── src/
│   ├── components/     # Reusable Vue components
│   ├── views/         # Page components
│   ├── stores/        # Pinia state management
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   ├── assets/        # Static assets
│   ├── App.vue        # Root component
│   └── main.ts        # Application entry point
├── public/            # Public assets
├── index.html         # HTML template
├── package.json       # Dependencies
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

### Key Technologies

#### **Core Framework**
- **Vue 3**: Progressive JavaScript framework with Composition API
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server

#### **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library for Tailwind
- **Lucide Icons**: Beautiful icon library
- **Custom Vintage Theme**: Antique shop color palette

#### **State Management**
- **Pinia**: Vue 3 state management
- **Vue Router**: Client-side routing

#### **Authentication & Backend**
- **Supabase**: Backend-as-a-Service for auth and database
- **Axios**: HTTP client for API calls

#### **UI Enhancements**
- **Vue Toastification**: Toast notifications
- **Vue3 Carousel**: Image carousels
- **Vue3 Perfect Scrollbar**: Custom scrollbars
- **ApexCharts**: Data visualization

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--antique-gold: #D4AF37
--antique-bronze: #CD7F32
--antique-copper: #B87333

/* Vintage Colors */
--vintage-cream: #F5F5DC
--vintage-ivory: #FFFFF0
--vintage-charcoal: #36454F
--vintage-sage: #9CAF88
--vintage-rose: #E8B4B8
```

### Typography
- **Display**: Playfair Display (headings)
- **Body**: Inter (body text)
- **Handwriting**: Dancing Script (accent text)

### Components
- **Cards**: Elevated with subtle shadows and hover effects
- **Buttons**: Gradient backgrounds with hover animations
- **Forms**: Clean inputs with focus states
- **Navigation**: Responsive sidebar and mobile bottom nav

## 📱 Mobile-First Features

### **Responsive Design**
- Mobile-first approach with progressive enhancement
- Touch-friendly interface elements
- Optimized for various screen sizes

### **Mobile Navigation**
- Bottom navigation bar for quick access
- Slide-out menu for full navigation
- Gesture-friendly interactions

### **Performance**
- Lazy loading for images and components
- Optimized bundle splitting
- Fast loading times on mobile networks

## 🔐 Security

### **Authentication**
- JWT tokens with automatic refresh
- Secure password handling
- Role-based access control

### **Data Protection**
- HTTPS enforcement
- Input validation and sanitization
- XSS protection

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
```

### **Deploy Options**
- **Vercel**: Zero-config deployment
- **Netlify**: Drag-and-drop deployment
- **Firebase Hosting**: Google's hosting platform
- **AWS S3 + CloudFront**: Scalable static hosting

### **Environment Variables**
Ensure all environment variables are set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

## 🤝 Contributing

### **Code Style**
- Follow Vue 3 Composition API patterns
- Use TypeScript for type safety
- Follow Tailwind CSS utility-first approach
- Maintain mobile-first responsive design

### **Component Guidelines**
- Use semantic HTML
- Implement proper accessibility attributes
- Follow BEM-like naming for custom CSS
- Include proper TypeScript interfaces

## 📄 License

This project is part of the Viejos Recuerdos antique shop management system.

## 🆘 Support

For support and questions:
1. Check the backend README for API documentation
2. Review the component documentation
3. Check the browser console for errors
4. Ensure all environment variables are properly configured 