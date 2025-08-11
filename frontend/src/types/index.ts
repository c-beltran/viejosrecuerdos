// Base types
export interface BaseEntity {
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export type UserRole = 'admin' | 'clerk' | 'viewer';

export interface Profile {
  user_id: string;
  role: UserRole;
  name: string;
  created_at: string;
}

// Inventory types
export interface InventoryItem extends BaseEntity {
  itemId: string;
  friendlyId: string; // Human-readable ID (e.g., M0001, P0001)
  itemName: string;
  descripcionArticulo?: string;
  category: InventoryCategory;
  initialQuantity: number;
  currentQuantity: number;
  unitPrice: number;
  totalPrice: number;
  status: InventoryStatus;
  internalNotes?: string;
  imageUrls: ImageData[];
  qrCodeUrl?: string;
  lastModifiedBy: string;
}

export type InventoryCategory = 
  | 'Mobiliario' 
  | 'Porcelana' 
  | 'Cristal' 
  | 'Joyeria' 
  | 'Arte' 
  | 'Libros' 
  | 'Textiles' 
  | 'Decoracion' 
  | 'Herramientas' 
  | 'Musica' 
  | 'Relojes' 
  | 'Otros';

export type InventoryStatus = 'Available' | 'Sold-Out';

export interface CreateInventoryItemRequest {
  itemName: string;
  descripcionArticulo?: string;
  category: InventoryCategory;
  initialQuantity: number;
  currentQuantity: number;
  unitPrice: number;
  internalNotes?: string;
  imageUrls?: ImageData[];
}

export interface UpdateInventoryItemRequest {
  itemName?: string;
  descripcionArticulo?: string;
  category?: InventoryCategory;
  initialQuantity?: number;
  currentQuantity?: number;
  unitPrice?: number;
  internalNotes?: string;
  imageUrls?: ImageData[];
}

// Image types
export interface ImageData {
  fileName: string;
  originalName: string;
  url: string; // Medium size URL only
}

// Client types
export interface Client extends BaseEntity {
  clientId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  lastModifiedBy: string;
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

// Sales types
export interface Sale extends BaseEntity {
  saleId: string;
  clientId?: string;
  saleDate: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  createdBy: string;
}

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Check';
export type SaleStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Refunded';

export interface SaleItem {
  saleItemId: string;
  saleId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface CreateSaleRequest {
  clientId?: string;
  saleDate?: string;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  status?: SaleStatus;
  notes?: string;
  items: CreateSaleItemRequest[];
}

export interface CreateSaleItemRequest {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

// Installment types
export interface InstallmentPlan extends BaseEntity {
  planId: string;
  saleId: string;
  totalAmount: number;
  downPayment: number;
  installmentAmount: number;
  numberOfInstallments: number;
  installmentFrequency: InstallmentFrequency;
  startDate: string;
  dueDate: string;
  status: InstallmentStatus;
  notes?: string;
  createdBy: string;
}

export type InstallmentFrequency = 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly' | 'Other';
export type InstallmentStatus = 'Active' | 'Completed' | 'Defaulted' | 'Cancelled';

export interface InstallmentPayment {
  paymentId: string;
  planId: string;
  paymentNumber: number;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter types
export interface InventoryFilters {
  category?: InventoryCategory;
  status?: InventoryStatus;
  search?: string;
  friendlyId?: string; // Search by friendly ID (e.g., M0001)
  limit?: number;
  offset?: number;
  includeQR?: boolean;
}

export interface ClientFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SaleFilters {
  status?: SaleStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  limit?: number;
  offset?: number;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Navigation types
export interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  badge?: number;
  children?: NavigationItem[];
}

// Dashboard types
export interface DashboardStats {
  totalItems: number;
  totalSales: number;
  totalClients: number;
  activeInstallments: number;
  recentSales: Sale[];
  lowStockItems: InventoryItem[];
  upcomingPayments: InstallmentPayment[];
}

// File upload types
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

// Search types
export interface SearchResult {
  type: 'inventory' | 'client' | 'sale';
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  data: any;
} 