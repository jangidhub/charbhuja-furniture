/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MeasurementUnit = 'mm' | 'cm' | 'inches' | 'ft';

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
  unit: MeasurementUnit;
}

export type ProductType = 'ready_made' | 'made_to_order' | 'custom';

export interface Product {
  productId: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  images: string[];
  price: number; // In INR (or paise / 100 for display)
  startingPrice?: boolean; // True for made-to-order items
  dimensions: ProductDimensions;
  materials: string[];
  finishes: string[];
  productType: ProductType;
  isActive: boolean;
  isFeatured: boolean;
  inStock: boolean;
  leadTimeWeeks?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  svgIcon?: string;
  productCount?: number;
  isActive: boolean;
  sortOrder: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedFinish?: string;
  selectedMaterial?: string;
  notes?: string;
}

export interface CustomerAddress {
  addressId: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
  selectedFinish?: string;
  selectedMaterial?: string;
  dimensions?: ProductDimensions;
  isCustomQuote?: boolean;
  customRequestId?: string;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  userId: string;
  customerSnapshot: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress: CustomerAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: 'pending_confirmation' | 'unpaid' | 'paid';
  orderStatus: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
  internalNotes?: string;
  deliveryTrackingNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'info_required'
  | 'quotation_sent'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'in_production'
  | 'completed';

export interface CustomDesignRequest {
  requestId: string;
  userId: string;
  title: string;
  category: string;
  roomType: string;
  description: string;
  dimensions: ProductDimensions;
  preferredMaterial: string;
  preferredFinish: string;
  estimatedBudget: string;
  expectedTimeline: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  status: CustomRequestStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProject {
  projectId: string;
  userId: string;
  name: string;
  description?: string;
  roomType?: string;
  productIds: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  addresses?: CustomerAddress[];
  role?: 'customer' | 'admin';
  createdAt?: string;
}
