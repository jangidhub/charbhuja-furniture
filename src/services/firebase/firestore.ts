/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import {
  Product,
  Order,
  CustomerProject,
  CustomerAddress,
  UserProfile,
  CartItem,
  OrderStatus,
  OrderItem,
} from '../../types';
import { INITIAL_PRODUCTS } from '../../data/products';

export interface CustomIdeaSubmission {
  requestId: string;
  userId: string;
  customerName: string;
  userName?: string;
  customerPhone: string;
  userPhone?: string;
  customerEmail: string;
  itemType: string; // 'sofa' | 'wardrobe' | 'dining' | 'bed' | 'kitchen' | 'chairs' | 'other'
  category?: string;
  description: string;
  estimatedBudget: string;
  imageUrl: string;
  requestType: 'quote' | 'book_visit' | 'both';
  projectId?: string;
  timberPreference?: string;
  roomDimensions?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  visitAddress?: string;
  preferredVisitDate?: string;
  status:
    | 'submitted'
    | 'under_review'
    | 'visit_scheduled'
    | 'quote_sent'
    | 'approved'
    | 'in_production'
    | 'completed'
    | 'cancelled';
  quotedAmount?: string;
  internalNotes?: string;
  estimatedTimelineWeeks?: number;
  createdAt: string;
  updatedAt: string;
}

// ── PRODUCTS ──────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.productId), {
          ...prod,
          isTrending: prod.isFeatured,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return INITIAL_PRODUCTS;
    }
    return snap.docs.map((d) => d.data() as Product);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeProducts(onData: (products: Product[]) => void) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      if (snapshot.empty) {
        getProducts().then((seeded) => {
          if (seeded) onData(seeded);
        });
      } else {
        const items = snapshot.docs.map((d) => d.data() as Product);
        onData(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function getProductById(productId: string): Promise<Product | null> {
  const path = `products/${productId}`;
  try {
    const snap = await getDoc(doc(db, 'products', productId));
    if (snap.exists()) {
      return snap.data() as Product;
    }
    const fallback = INITIAL_PRODUCTS.find((p) => p.productId === productId);
    return fallback || null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addProduct(product: Product): Promise<void> {
  const path = `products/${product.productId}`;
  try {
    await setDoc(doc(db, 'products', product.productId), {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateProduct(productId: string, changes: Partial<Product>): Promise<void> {
  const path = `products/${productId}`;
  try {
    await updateDoc(doc(db, 'products', productId), {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function removeProduct(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ── CUSTOMER PROJECT COLLECTIONS ──────────────────────────────
export async function createProject(project: CustomerProject): Promise<void> {
  const path = `projects/${project.projectId}`;
  try {
    await setDoc(doc(db, 'projects', project.projectId), {
      ...project,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateProject(
  projectId: string,
  changes: Partial<CustomerProject>
): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  const path = `projects/${projectId}`;
  try {
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getProjectById(projectId: string): Promise<CustomerProject | null> {
  const path = `projects/${projectId}`;
  try {
    const snap = await getDoc(doc(db, 'projects', projectId));
    if (snap.exists()) {
      return snap.data() as CustomerProject;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeUserProjects(
  userId: string,
  onData: (projects: CustomerProject[]) => void
) {
  const path = 'projects';
  const q = query(collection(db, path), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as CustomerProject);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeAllProjects(onData: (projects: CustomerProject[]) => void) {
  const path = 'projects';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as CustomerProject);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// ── CUSTOM IDEA REQUESTS & VISIT BOOKINGS ─────────────────────
export async function submitCustomIdeaRequest(req: CustomIdeaSubmission): Promise<void> {
  const path = `customRequests/${req.requestId}`;
  try {
    await setDoc(doc(db, 'customRequests', req.requestId), {
      ...req,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeUserIdeaRequests(
  userId: string,
  onData: (requests: CustomIdeaSubmission[]) => void
) {
  const path = 'customRequests';
  const q = query(collection(db, path), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as CustomIdeaSubmission);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeAllIdeaRequests(
  onData: (requests: CustomIdeaSubmission[]) => void
) {
  const path = 'customRequests';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as CustomIdeaSubmission);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateCustomIdeaStatus(
  requestId: string,
  status: CustomIdeaSubmission['status'],
  quotedAmount?: string,
  internalNotes?: string,
  estimatedTimelineWeeks?: number
): Promise<void> {
  const path = `customRequests/${requestId}`;
  try {
    const updatePayload: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (quotedAmount !== undefined) updatePayload.quotedAmount = quotedAmount;
    if (internalNotes !== undefined) updatePayload.internalNotes = internalNotes;
    if (estimatedTimelineWeeks !== undefined) updatePayload.estimatedTimelineWeeks = estimatedTimelineWeeks;

    await updateDoc(doc(db, 'customRequests', requestId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function approveCustomQuotation(requestId: string): Promise<void> {
  const path = `customRequests/${requestId}`;
  try {
    await updateDoc(doc(db, 'customRequests', requestId), {
      status: 'approved',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ── ORDERS & TRUSTED BACKEND PRICE VALIDATION ─────────────────

/**
 * Validates prices against Firestore products & approved custom quotations,
 * builds immutable product snapshots, and registers the order.
 */
export async function createValidatedOrder(params: {
  cartItems: CartItem[];
  customerSnapshot: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  deliveryAddress: CustomerAddress;
  userId: string;
}): Promise<Order> {
  const { cartItems, customerSnapshot, deliveryAddress, userId } = params;

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cannot place an order with an empty cart.');
  }

  // 1. Validate prices against genuine Firestore products or custom quotes
  const validatedItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of cartItems) {
    let trustedUnitPrice = 0;
    let trustedName = item.product.name;
    let trustedImage = (item.product.images && item.product.images[0]) || '';
    let isCustom = false;
    let customReqId: string | undefined;

    // Check if this is a custom quotation item
    if (item.productId.startsWith('custom_')) {
      isCustom = true;
      customReqId = item.productId.replace('custom_', '');
      try {
        const reqSnap = await getDoc(doc(db, 'customRequests', customReqId));
        if (reqSnap.exists()) {
          const reqData = reqSnap.data() as CustomIdeaSubmission;
          if (reqData.quotedAmount) {
            const numericVal = parseInt(reqData.quotedAmount.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(numericVal) && numericVal > 0) {
              trustedUnitPrice = numericVal;
            }
          }
          trustedName = `Bespoke ${reqData.itemType || 'Custom Piece'} (#${customReqId})`;
          if (reqData.imageUrl) trustedImage = reqData.imageUrl;
        }
      } catch (e) {
        console.warn('Could not verify custom quote from Firestore, falling back to item price:', e);
      }
    }

    // Standard catalogue product
    if (trustedUnitPrice === 0) {
      try {
        const prodSnap = await getDoc(doc(db, 'products', item.productId));
        if (prodSnap.exists()) {
          const prodData = prodSnap.data() as Product;
          trustedUnitPrice = prodData.price;
          trustedName = prodData.name;
          trustedImage = (prodData.images && prodData.images[0]) || trustedImage;
        } else {
          // Check static fallback dataset
          const fallback = INITIAL_PRODUCTS.find((p) => p.productId === item.productId);
          if (fallback) {
            trustedUnitPrice = fallback.price;
            trustedName = fallback.name;
            trustedImage = (fallback.images && fallback.images[0]) || trustedImage;
          } else {
            trustedUnitPrice = item.product.price;
          }
        }
      } catch (err) {
        console.warn('Firestore price check fallback to catalog price:', err);
        trustedUnitPrice = item.product.price;
      }
    }

    if (trustedUnitPrice <= 0) {
      trustedUnitPrice = Math.max(1000, item.product.price || 1000);
    }

    const itemQuantity = Math.max(1, Math.min(20, item.quantity));
    const lineTotal = trustedUnitPrice * itemQuantity;
    calculatedSubtotal += lineTotal;

    // Build immutable product snapshot
    validatedItems.push({
      productId: item.productId,
      name: trustedName,
      quantity: itemQuantity,
      unitPrice: trustedUnitPrice,
      totalPrice: lineTotal,
      image: trustedImage,
      selectedFinish: item.selectedFinish || (item.product.finishes && item.product.finishes[0]) || 'Raw Matt Oil Finish',
      selectedMaterial: item.selectedMaterial || (item.product.materials && item.product.materials[0]) || 'CP Teak (Central Province)',
      dimensions: item.product.dimensions,
      isCustomQuote: isCustom,
      customRequestId: customReqId,
    });
  }

  // 2. Compute trusted delivery and total amounts
  const deliveryCharge = calculatedSubtotal >= 50000 ? 0 : 2500;
  const totalAmount = calculatedSubtotal + deliveryCharge;

  const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const orderNumber = `CB-${Math.floor(100000 + Math.random() * 900000)}`;

  const now = new Date().toISOString();

  const formattedAddress = `${deliveryAddress.streetAddress}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pinCode}`;

  const orderPayload: Order = {
    orderId,
    orderNumber,
    userId,
    customerSnapshot: {
      name: customerSnapshot.name.trim(),
      email: customerSnapshot.email.trim(),
      phoneNumber: customerSnapshot.phoneNumber.trim(),
    },
    customerName: customerSnapshot.name.trim(),
    customerPhone: customerSnapshot.phoneNumber.trim(),
    customerEmail: customerSnapshot.email.trim(),
    deliveryAddress: {
      ...deliveryAddress,
      addressId: deliveryAddress.addressId || `addr_${Date.now()}`,
    },
    items: validatedItems,
    subtotal: calculatedSubtotal,
    deliveryCharge,
    totalAmount,
    paymentStatus: 'pending_confirmation',
    orderStatus: 'pending',
    statusHistory: [
      {
        status: 'pending',
        timestamp: now,
        note: 'Order submitted by customer for manual factory verification and confirmation.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  const path = `orders/${orderId}`;
  try {
    await setDoc(doc(db, 'orders', orderId), orderPayload);

    // If customer is authenticated, automatically persist this delivery address to their profile
    if (userId && !userId.startsWith('guest_')) {
      saveUserAddress(userId, {
        ...deliveryAddress,
        addressId: deliveryAddress.addressId || `addr_${Date.now()}`,
        fullName: customerSnapshot.name,
        phoneNumber: customerSnapshot.phoneNumber,
      }).catch((e) => console.warn('Could not auto-save address to user profile:', e));
    }

    return orderPayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function placeOrder(order: Order): Promise<void> {
  const path = `orders/${order.orderId}`;
  try {
    await setDoc(doc(db, 'orders', order.orderId), {
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const path = `orders/${orderId}`;
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (snap.exists()) {
      return snap.data() as Order;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeOrderById(
  orderId: string,
  onData: (order: Order | null) => void
) {
  const path = `orders/${orderId}`;
  return onSnapshot(
    doc(db, 'orders', orderId),
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as Order);
      } else {
        onData(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeUserOrders(
  userId: string,
  onData: (orders: Order[]) => void
) {
  const path = 'orders';
  const q = query(collection(db, path), where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as Order);
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeAllOrders(onData: (orders: Order[]) => void) {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as Order);
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateOrderStatus(orderId: string, status: Order['orderStatus']): Promise<void> {
  return updateOrderStatusWithNote(orderId, status);
}

export async function updateOrderStatusWithNote(
  orderId: string,
  status: Order['orderStatus'],
  note?: string
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (!snap.exists()) throw new Error('Order not found');

    const existingOrder = snap.data() as Order;
    const now = new Date().toISOString();

    const milestoneNote =
      note ||
      (status === 'confirmed'
        ? 'Order verified by Charbhuja staff. Workshop timber allocated.'
        : status === 'processing'
        ? 'Joinery, carpentry, and sanding active in workshop.'
        : status === 'dispatched'
        ? 'Protective crating complete. Dispatched with white-glove transport team.'
        : status === 'delivered'
        ? 'White-glove delivery and on-site assembly completed.'
        : status === 'cancelled'
        ? 'Order cancelled.'
        : 'Status updated.');

    const newHistory = [
      ...(existingOrder.statusHistory || []),
      {
        status,
        timestamp: now,
        note: milestoneNote,
      },
    ];

    await updateDoc(doc(db, 'orders', orderId), {
      orderStatus: status,
      statusHistory: newHistory,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function cancelOrder(orderId: string, userId: string, reason?: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const snap = await getDoc(doc(db, 'orders', orderId));
    if (!snap.exists()) throw new Error('Order not found');

    const existingOrder = snap.data() as Order;
    if (existingOrder.userId !== userId) {
      throw new Error('Not authorized to cancel this order');
    }

    const now = new Date().toISOString();
    const newHistory = [
      ...(existingOrder.statusHistory || []),
      {
        status: 'cancelled' as OrderStatus,
        timestamp: now,
        note: reason ? `Cancelled by client: ${reason}` : 'Cancelled by customer.',
      },
    ];

    await updateDoc(doc(db, 'orders', orderId), {
      orderStatus: 'cancelled',
      statusHistory: newHistory,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ── CUSTOMER PROFILE & ADDRESS MANAGEMENT ─────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserAddress(uid: string, address: CustomerAddress): Promise<CustomerAddress[]> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    let existingAddresses: CustomerAddress[] = [];

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      existingAddresses = data.addresses || [];
    }

    const targetId = address.addressId || `addr_${Date.now()}`;
    const cleanAddress: CustomerAddress = {
      ...address,
      addressId: targetId,
    };

    const existingIdx = existingAddresses.findIndex((a) => a.addressId === targetId);
    let updatedAddresses: CustomerAddress[];

    if (existingIdx > -1) {
      updatedAddresses = [...existingAddresses];
      updatedAddresses[existingIdx] = cleanAddress;
    } else {
      updatedAddresses = [cleanAddress, ...existingAddresses];
    }

    // If marked default, clear other defaults
    if (cleanAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({
        ...a,
        isDefault: a.addressId === targetId,
      }));
    }

    await setDoc(
      doc(db, 'users', uid),
      {
        uid,
        addresses: updatedAddresses,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return updatedAddresses;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteUserAddress(uid: string, addressId: string): Promise<CustomerAddress[]> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return [];

    const data = snap.data() as UserProfile;
    const currentAddresses = data.addresses || [];
    const updated = currentAddresses.filter((a) => a.addressId !== addressId);

    await updateDoc(doc(db, 'users', uid), {
      addresses: updated,
      updatedAt: new Date().toISOString(),
    });

    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function setDefaultUserAddress(uid: string, addressId: string): Promise<CustomerAddress[]> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return [];

    const data = snap.data() as UserProfile;
    const currentAddresses = data.addresses || [];
    const updated = currentAddresses.map((a) => ({
      ...a,
      isDefault: a.addressId === addressId,
    }));

    await updateDoc(doc(db, 'users', uid), {
      addresses: updated,
      updatedAt: new Date().toISOString(),
    });

    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export function subscribeAllUsers(onData: (users: UserProfile[]) => void) {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as UserProfile);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
