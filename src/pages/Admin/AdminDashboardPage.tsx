/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Camera,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  ArrowRight,
  Ruler,
  ShieldAlert,
  Eye,
  LogOut,
  UploadCloud,
  X,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Check,
  Search,
  PhoneCall,
  MessageSquare,
  FileText,
  ExternalLink,
  BarChart3,
  Users,
  Layers,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Hammer,
  Truck,
  DollarSign,
  Filter,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  getProducts,
  addProduct,
  updateProduct,
  removeProduct,
  subscribeProducts,
  subscribeAllIdeaRequests,
  updateCustomIdeaStatus,
  subscribeAllOrders,
  updateOrderStatus,
  updateOrderStatusWithNote,
  subscribeAllUsers,
  CustomIdeaSubmission,
} from '../../services/firebase/firestore';
import { uploadProductImage } from '../../services/firebase/storage';
import { CATEGORIES } from '../../data/categories';
import { Product, Order, MeasurementUnit, ProductType, UserProfile } from '../../types';

// Preset sample images from local assets for quick selection
const SAMPLE_WORKSHOP_IMAGES = [
  { label: 'Living Room Suite', url: '/src/assets/images/hero_charbhuja_living_1794381204538.jpg' },
  { label: 'Solid Teak Dining Table', url: '/src/assets/images/furniture_dining_teak_1794381204639.jpg' },
  { label: 'Sculptural Cane Chair', url: '/src/assets/images/furniture_lounge_chair_1794381204953.jpg' },
  { label: 'Fluted Walk-in Wardrobe', url: '/src/assets/images/furniture_walkin_wardrobe_1794381205607.jpg' },
  { label: 'Artisan Workshop Joinery', url: '/src/assets/images/craftsmanship_workshop_1794381206504.jpg' },
];

const PRESET_TIMBERS = [
  'CP Teak (Central Province)',
  'Solid Indian Rosewood (Sheesham)',
  'Solid American Walnut',
  'Solid European White Oak',
  'Seasoned Acacia Wood',
  'Belgian Natural Linen',
  'Hand-Woven Natural Rattan',
  'Champagne Brass Accents',
];

const PRESET_FINISHES = [
  'Raw Matt Oil Finish',
  'Warm Honey Teak Polish',
  'Dark Smoked Walnut Shade',
  'Natural Wax Silk Satin',
  'Ebonized Black Matt',
  'Natural Raw PU Coat',
];

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin, setDemoAdmin, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'requests' | 'customers' | 'analytics'
  >('overview');

  // Real-time Firestore states
  const [products, setProducts] = useState<Product[]>([]);
  const [ideaRequests, setIdeaRequests] = useState<CustomIdeaSubmission[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter in Admin Products
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');

  // Filter in Admin Orders
  const [adminOrderSearch, setAdminOrderSearch] = useState('');
  const [adminOrderStatusFilter, setAdminOrderStatusFilter] = useState('all');
  const [adminCustomerSearch, setAdminCustomerSearch] = useState('');
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);
  const [orderModalNote, setOrderModalNote] = useState('');
  const [orderModalStatus, setOrderModalStatus] = useState<Order['orderStatus']>('confirmed');
  const [submittingOrderNote, setSubmittingOrderNote] = useState(false);

  // Product CRUD Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit'>('create');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    categoryId: 'sofas',
    categoryName: 'Sofas',
    price: '45000',
    startingPrice: false,
    description: '',
    productType: 'made_to_order' as ProductType,
    leadTimeWeeks: 3,
    isFeatured: true,
    isActive: true,
    inStock: true,
    width: 180,
    depth: 85,
    height: 80,
    unit: 'cm' as MeasurementUnit,
    materials: ['CP Teak (Central Province)', 'Belgian Natural Linen'],
    finishes: ['Raw Matt Oil Finish', 'Warm Honey Teak Polish'],
    images: [] as string[],
  });

  const [customMaterialInput, setCustomMaterialInput] = useState('');
  const [customFinishInput, setCustomFinishInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quotation edit modal
  const [selectedReq, setSelectedReq] = useState<CustomIdeaSubmission | null>(null);
  const [quoteInput, setQuoteInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [timelineInput, setTimelineInput] = useState('3');
  const [statusInput, setStatusInput] = useState<CustomIdeaSubmission['status']>('quote_sent');
  const [reqStatusFilter, setReqStatusFilter] = useState('all');

  // Delete product confirmation
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Subscribe to live products
    const unsubProducts = subscribeProducts((data) => {
      if (data) setProducts(data);
      setLoading(false);
    });

    // Subscribe to custom idea submissions, orders, and users
    const unsubRequests = subscribeAllIdeaRequests((data) => setIdeaRequests(data));
    const unsubOrders = subscribeAllOrders((data) => setOrders(data));
    const unsubUsers = subscribeAllUsers((data) => setRegisteredUsers(data));

    return () => {
      unsubProducts();
      unsubRequests();
      unsubOrders();
      unsubUsers();
    };
  }, []);

  // Strict Admin Gate: If normal user enters /admin
  if (!isAdmin) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7E1D9] p-8 shadow-md text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#29231E]">Staff Access Only</h1>
            <p className="text-xs text-[#77716A] mt-2 leading-relaxed">
              This operational portal is reserved for Charbhuja administrators. Normal customers can browse trending pieces and upload custom ideas from the storefront.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={setDemoAdmin}
              className="w-full py-3 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all"
            >
              Sign In as Admin (sudhanshujangid143@gmail.com)
            </button>
            <Link
              to="/"
              className="inline-block w-full py-2.5 border border-[#E7E1D9] text-[#29231E] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#F0ECE5]"
            >
              Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── PRODUCT CRUD HANDLERS ──────────────────────────────────
  const openCreateProductModal = () => {
    setProductModalMode('create');
    setEditingProductId(null);
    setFormData({
      name: '',
      categoryId: 'sofas',
      categoryName: 'Sofas',
      price: '48000',
      startingPrice: false,
      description: '',
      productType: 'made_to_order',
      leadTimeWeeks: 3,
      isFeatured: true,
      isActive: true,
      inStock: true,
      width: 200,
      depth: 85,
      height: 80,
      unit: 'cm',
      materials: ['CP Teak (Central Province)', 'Belgian Natural Linen'],
      finishes: ['Raw Matt Oil Finish', 'Warm Honey Teak Polish'],
      images: [SAMPLE_WORKSHOP_IMAGES[0].url],
    });
    setFormErrors({});
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setProductModalMode('edit');
    setEditingProductId(product.productId);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      price: product.price.toString(),
      startingPrice: !!product.startingPrice,
      description: product.description,
      productType: product.productType || 'made_to_order',
      leadTimeWeeks: product.leadTimeWeeks || 3,
      isFeatured: !!product.isFeatured,
      isActive: product.isActive !== false,
      inStock: product.inStock !== false,
      width: product.dimensions.width,
      depth: product.dimensions.depth,
      height: product.dimensions.height,
      unit: product.dimensions.unit || 'cm',
      materials: product.materials && product.materials.length > 0 ? product.materials : ['CP Teak (Central Province)'],
      finishes: product.finishes && product.finishes.length > 0 ? product.finishes : ['Raw Matt Oil Finish'],
      images: product.images && product.images.length > 0 ? product.images : [SAMPLE_WORKSHOP_IMAGES[0].url],
    });
    setFormErrors({});
    setProductModalOpen(true);
  };

  const validateProductForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product title is required.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Product title must be at least 3 characters.';
    }

    const priceNum = Number(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Please enter a valid price greater than 0.';
    }

    if (!formData.description.trim()) {
      errors.description = 'Please provide a craft description or specs.';
    }

    if (!formData.images || formData.images.length === 0) {
      errors.images = 'Please upload or select at least one product photo.';
    }

    if (formData.width <= 0 || formData.depth <= 0 || formData.height <= 0) {
      errors.dimensions = 'Dimensions must be positive numbers.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const tempId = editingProductId || `prod_${Date.now()}`;
      const uploadPromises = Array.from(files).map((file) =>
        uploadProductImage(file, tempId)
      );
      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleAddSampleImage = (url: string) => {
    if (!formData.images.includes(url)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    }
  };

  const handleToggleMaterial = (mat: string) => {
    setFormData((prev) => {
      const exists = prev.materials.includes(mat);
      return {
        ...prev,
        materials: exists ? prev.materials.filter((m) => m !== mat) : [...prev.materials, mat],
      };
    });
  };

  const handleAddCustomMaterial = () => {
    if (customMaterialInput.trim()) {
      handleToggleMaterial(customMaterialInput.trim());
      setCustomMaterialInput('');
    }
  };

  const handleToggleFinish = (fin: string) => {
    setFormData((prev) => {
      const exists = prev.finishes.includes(fin);
      return {
        ...prev,
        finishes: exists ? prev.finishes.filter((f) => f !== fin) : [...prev.finishes, fin],
      };
    });
  };

  const handleAddCustomFinish = () => {
    if (customFinishInput.trim()) {
      handleToggleFinish(customFinishInput.trim());
      setCustomFinishInput('');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProductForm()) return;

    setSubmittingProduct(true);
    try {
      const categoryObj = CATEGORIES.find((c) => c.slug === formData.categoryId);
      const categoryName = categoryObj ? categoryObj.name : formData.categoryId;

      const productPayload: Product = {
        productId: editingProductId || `prod_${Date.now()}`,
        name: formData.name.trim(),
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        categoryName,
        price: Number(formData.price),
        startingPrice: formData.startingPrice,
        images: formData.images,
        dimensions: {
          width: Number(formData.width),
          depth: Number(formData.depth),
          height: Number(formData.height),
          unit: formData.unit,
        },
        materials: formData.materials,
        finishes: formData.finishes,
        productType: formData.productType,
        leadTimeWeeks: Number(formData.leadTimeWeeks),
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        inStock: formData.inStock,
      };

      if (productModalMode === 'create') {
        await addProduct(productPayload);
      } else if (editingProductId) {
        await updateProduct(editingProductId, productPayload);
      }

      setProductModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert('Could not save product: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmittingProduct(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await removeProduct(deletingProduct.productId);
      setDeletingProduct(null);
    } catch (err: any) {
      alert('Failed to remove product: ' + (err.message || ''));
    }
  };

  // Quotation Submission Handler
  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    await updateCustomIdeaStatus(
      selectedReq.requestId,
      statusInput,
      quoteInput || selectedReq.quotedAmount,
      noteInput || selectedReq.internalNotes,
      Number(timelineInput) || 3
    );
    setSelectedReq(null);
  };

  // Workshop Order Note & Status Update Handler
  const handleUpdateOrderNoteAndStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderModal) return;
    setSubmittingOrderNote(true);
    try {
      await updateOrderStatusWithNote(
        selectedOrderModal.orderId,
        orderModalStatus,
        orderModalNote.trim() || undefined
      );
      setSelectedOrderModal(null);
      setOrderModalNote('');
    } catch (err: any) {
      alert('Failed to update order milestone: ' + (err.message || ''));
    } finally {
      setSubmittingOrderNote(false);
    }
  };

  // ── COMPUTED REAL FIRESTORE ANALYTICS & METRICS ──────────────
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'processing', 'dispatched'].includes(o.orderStatus)
  );

  const pendingRequests = ideaRequests.filter(
    (r) => r.status === 'submitted' || r.status === 'under_review'
  );

  const activeProducts = products.filter((p) => p.isActive);

  // Filtered Orders in Admin
  const filteredOrders = orders.filter((o) => {
    if (adminOrderStatusFilter !== 'all' && o.orderStatus !== adminOrderStatusFilter) {
      return false;
    }
    if (adminOrderSearch.trim()) {
      const q = adminOrderSearch.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchClient = (o.customerSnapshot?.name || o.customerName || '').toLowerCase().includes(q);
      const matchCity = (o.deliveryAddress?.city || '').toLowerCase().includes(q);
      if (!matchNum && !matchClient && !matchCity) return false;
    }
    return true;
  });

  // Aggregated Customers List
  const customerMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    phone: string;
    ordersCount: number;
    totalSpend: number;
    customRequestsCount: number;
    joinedDate?: string;
  }>();

  registeredUsers.forEach((u) => {
    if (!u.email) return;
    customerMap.set(u.email.toLowerCase(), {
      id: u.uid,
      name: u.displayName || 'Valued Client',
      email: u.email,
      phone: u.phoneNumber || '',
      ordersCount: 0,
      totalSpend: 0,
      customRequestsCount: 0,
      joinedDate: u.createdAt,
    });
  });

  orders.forEach((o) => {
    const email = (o.customerSnapshot?.email || o.customerEmail || '').toLowerCase();
    if (!email) return;
    const existing = customerMap.get(email) || {
      id: o.userId,
      name: o.customerSnapshot?.name || o.customerName || 'Client',
      email,
      phone: o.customerSnapshot?.phoneNumber || o.customerPhone || '',
      ordersCount: 0,
      totalSpend: 0,
      customRequestsCount: 0,
      joinedDate: o.createdAt,
    };
    existing.ordersCount += 1;
    if (o.orderStatus !== 'cancelled') {
      existing.totalSpend += o.totalAmount;
    }
    if (o.customerSnapshot?.phoneNumber && !existing.phone) {
      existing.phone = o.customerSnapshot.phoneNumber;
    }
    customerMap.set(email, existing);
  });

  ideaRequests.forEach((r) => {
    const email = (r.customerEmail || '').toLowerCase();
    if (!email) return;
    const existing = customerMap.get(email) || {
      id: r.userId,
      name: r.customerName || 'Client',
      email,
      phone: r.customerPhone || '',
      ordersCount: 0,
      totalSpend: 0,
      customRequestsCount: 0,
      joinedDate: r.createdAt,
    };
    existing.customRequestsCount += 1;
    customerMap.set(email, existing);
  });

  const customerList = Array.from(customerMap.values());

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7E1D9] gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#68452D] text-white px-2.5 py-0.5 rounded-full">
                Administrator Portal
              </span>
              <span className="text-xs text-[#77716A]">Charbhuja Furniture Operations</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#29231E] mt-1">
              Storefront & Workshop Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 bg-white border border-[#E7E1D9] rounded-full text-xs font-semibold text-[#29231E] hover:bg-[#F0ECE5] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Storefront</span>
            </Link>
            <button
              onClick={logout}
              className="px-3.5 py-2 border border-red-200 text-red-600 rounded-full text-xs font-semibold hover:bg-red-50 flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs (7 functional sections) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#68452D] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#68452D] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catalogue ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'categories'
                ? 'bg-[#68452D] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({CATEGORIES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#68452D] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'requests'
                ? 'bg-[#68452D] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Custom Inquiries ({ideaRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'customers'
                ? 'bg-[#68452D] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers ({customerList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-[#68452D] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Workshop Analytics</span>
          </button>
        </div>

        {/* ── TAB 0: REAL-TIME OVERVIEW & METRICS ─────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Live Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A17A58] block">
                  Gross Workshop Revenue
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-3xl font-bold text-[#68452D] tabular-nums">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#77716A] font-medium">Real-time</span>
                </div>
                <p className="text-[11px] text-[#77716A] pt-1 border-t border-[#E7E1D9]/60">
                  From {orders.filter((o) => o.orderStatus !== 'cancelled').length} confirmed customer orders
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A17A58] block">
                  Active Production Orders
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-3xl font-bold text-[#29231E] tabular-nums">
                    {activeOrders.length}
                  </span>
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
                    {orders.filter((o) => o.orderStatus === 'pending').length} pending
                  </span>
                </div>
                <p className="text-[11px] text-[#77716A] pt-1 border-t border-[#E7E1D9]/60">
                  {orders.filter((o) => o.orderStatus === 'processing').length} in workshop joinery
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A17A58] block">
                  Bespoke Inquiries & Quotes
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-3xl font-bold text-[#29231E] tabular-nums">
                    {ideaRequests.length}
                  </span>
                  <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-semibold">
                    {pendingRequests.length} pending quote
                  </span>
                </div>
                <p className="text-[11px] text-[#77716A] pt-1 border-t border-[#E7E1D9]/60">
                  {ideaRequests.filter((r) => r.status === 'approved').length} client proposals accepted
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A17A58] block">
                  Catalogue Storefront
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-3xl font-bold text-[#29231E] tabular-nums">
                    {activeProducts.length}
                  </span>
                  <span className="text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                    {products.filter((p) => p.inStock).length} in stock
                  </span>
                </div>
                <p className="text-[11px] text-[#77716A] pt-1 border-t border-[#E7E1D9]/60">
                  Across {CATEGORIES.length} furniture categories
                </p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#29231E]">Workshop Operations Shortcuts</h3>
                <p className="text-xs text-[#77716A] mt-0.5">
                  Frequently executed management tasks for storefront and artisan shop.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={openCreateProductModal}
                  className="px-4 py-2.5 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>List Trending Piece</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className="px-4 py-2.5 bg-[#F8F6F2] border border-[#E7E1D9] text-[#29231E] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#E7E1D9] transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-[#68452D]" />
                  <span>Review Custom Inquiries</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="px-4 py-2.5 bg-[#F8F6F2] border border-[#E7E1D9] text-[#29231E] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#E7E1D9] transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#68452D]" />
                  <span>Manage Orders</span>
                </button>
              </div>
            </div>

            {/* Recent Orders & Inquiries Double Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Recent Orders */}
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E1D9] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#29231E]">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-[#68452D] hover:underline font-semibold"
                  >
                    View All ({orders.length})
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-[#77716A] py-8 text-center">No orders recorded in Firestore yet.</p>
                ) : (
                  <div className="divide-y divide-[#E7E1D9]">
                    {orders.slice(0, 4).map((ord) => (
                      <div key={ord.orderId} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#29231E]">Order #{ord.orderNumber}</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-[#F0ECE5] text-[#68452D]">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-[#77716A] text-[11px] mt-0.5 truncate max-w-xs">
                            {ord.customerSnapshot?.name || 'Client'} · {ord.items.map((i) => i.name).join(', ')}
                          </p>
                        </div>
                        <span className="font-serif font-bold text-[#68452D] tabular-nums shrink-0">
                          ₹{ord.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Custom Inquiries */}
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E1D9] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#29231E]">Recent Bespoke Inquiries</h3>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-[#68452D] hover:underline font-semibold"
                  >
                    View All ({ideaRequests.length})
                  </button>
                </div>

                {ideaRequests.length === 0 ? (
                  <p className="text-xs text-[#77716A] py-8 text-center">No custom submissions uploaded yet.</p>
                ) : (
                  <div className="divide-y divide-[#E7E1D9]">
                    {ideaRequests.slice(0, 4).map((req) => (
                      <div key={req.requestId} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          {req.imageUrl ? (
                            <img
                              src={req.imageUrl}
                              alt={req.itemType}
                              className="w-10 h-10 rounded-lg object-cover bg-[#F0ECE5] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#F0ECE5] flex items-center justify-center shrink-0">
                              <Camera className="w-4 h-4 text-[#77716A]" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-bold text-[#29231E] block truncate">
                              {req.customerName || 'Client'} · {req.itemType.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-[#77716A]">{req.customerPhone}</span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F0ECE5] text-[#29231E] block">
                            {req.status.replace('_', ' ')}
                          </span>
                          {req.quotedAmount && (
                            <span className="font-serif text-[11px] font-bold text-green-800 block mt-0.5">
                              {req.quotedAmount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: CATEGORIES OVERVIEW ────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#29231E]">
                  Furniture Categories Portfolio ({CATEGORIES.length})
                </h2>
                <p className="text-xs text-[#77716A] mt-0.5">
                  Organized architectural departments across residential and commercial spaces.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateProductModal}
                className="px-5 py-2.5 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors self-start sm:self-auto shadow-2xs"
              >
                + Add Piece to Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.slug).length;
                const catProducts = products.filter((p) => p.categoryId === cat.slug);
                const minPrice = catProducts.length
                  ? Math.min(...catProducts.map((p) => p.price))
                  : null;

                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm flex flex-col justify-between space-y-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F8F6F2] text-[#68452D] px-2.5 py-0.5 rounded-full border border-[#E7E1D9]">
                          {count} {count === 1 ? 'Piece' : 'Pieces'} Listed
                        </span>
                        {minPrice && (
                          <span className="text-[11px] font-serif font-bold text-[#29231E]">
                            From ₹{minPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#29231E]">{cat.name}</h3>
                      <p className="text-[#77716A] text-[11px] mt-1 leading-relaxed">{cat.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAdminCategoryFilter(cat.slug);
                        setActiveTab('products');
                      }}
                      className="w-full py-2 bg-[#F8F6F2] hover:bg-[#F0ECE5] border border-[#E7E1D9] rounded-xl text-xs font-semibold text-[#29231E] transition-colors text-center"
                    >
                      View {cat.name} in Catalogue
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 1: MANAGE TRENDING CATALOG (FULL CRUD) ──────── */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#29231E]">
                  Curated Catalog ({products.length} pieces)
                </h2>
                <p className="text-xs text-[#77716A] mt-0.5">
                  Publish pieces you feel are trending. Customers can explore them on the storefront or request customized variations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#77716A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminProductSearch}
                    onChange={(e) => setAdminProductSearch(e.target.value)}
                    placeholder="Search catalog..."
                    className="pl-8 pr-3 py-2 bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl text-xs text-[#29231E] focus:outline-none focus:border-[#68452D]"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={adminCategoryFilter}
                  onChange={(e) => setAdminCategoryFilter(e.target.value)}
                  className="bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-2 text-xs font-medium text-[#29231E] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>

                <button
                  onClick={openCreateProductModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>List New Piece</span>
                </button>
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredAdminProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-12 text-center text-xs text-[#77716A]">
                No products match the selected filter. Click "List New Piece" to add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdminProducts.map((p) => (
                  <div
                    key={p.productId}
                    className="p-5 rounded-3xl bg-white border border-[#E7E1D9] shadow-2xs space-y-4 flex flex-col justify-between hover:border-[#A17A58] transition-all"
                  >
                    <div className="space-y-3">
                      {/* Image Preview with Badges */}
                      <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#F0ECE5]">
                        <img
                          src={p.images[0] || '/assets/logo.png'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider bg-white/95 px-2 py-0.5 rounded-md text-[#68452D] border border-[#E7E1D9] shadow-2xs">
                            {p.categoryName}
                          </span>
                          {p.isFeatured && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-[#68452D] text-white px-2 py-0.5 rounded-md shadow-2xs">
                              Trending
                            </span>
                          )}
                        </div>

                        {p.images.length > 1 && (
                          <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>{p.images.length} photos</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="font-serif font-bold text-[#29231E] text-base leading-snug">
                          {p.name}
                        </h3>
                        <p className="text-xs text-[#77716A] line-clamp-2 mt-1 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      {/* Specs snippet */}
                      <div className="text-[11px] text-[#77716A] space-y-1 pt-2 border-t border-[#E7E1D9]">
                        <div className="flex items-center justify-between">
                          <span>Dimensions:</span>
                          <span className="font-medium text-[#29231E]">
                            {p.dimensions.width} × {p.dimensions.depth} × {p.dimensions.height} {p.dimensions.unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Lead Time:</span>
                          <span className="font-medium text-[#29231E]">{p.leadTimeWeeks || 3} weeks</span>
                        </div>
                        {p.materials && p.materials.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span>Timber:</span>
                            <span className="font-medium text-[#29231E] truncate max-w-[150px]">
                              {p.materials[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[#E7E1D9] flex items-center justify-between">
                      <span className="font-serif text-lg font-bold text-[#68452D] tabular-nums">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/product/${p.productId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-[#77716A] hover:text-[#29231E] hover:bg-[#F8F6F2] rounded-xl transition-colors"
                          title="View on Customer Storefront"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="p-2 text-[#68452D] hover:bg-[#F0ECE5] rounded-xl transition-colors"
                          title="Edit Piece"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete from Catalog"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: CUSTOMER PHOTO SUBMISSIONS & VISITS ───────── */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E1D9] pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#29231E]">
                  Customer Photo Submissions & Quotations ({ideaRequests.length})
                </h2>
                <p className="text-xs text-[#77716A] mt-0.5">
                  Photos, sketches, and room visit requests submitted by clients. Review timber specs and send itemized quotes.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#68452D] bg-[#F8F6F2] px-3.5 py-1.5 rounded-full border border-[#E7E1D9]">
                {ideaRequests.filter((r) => r.status === 'submitted').length} pending review
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {[
                { id: 'all', label: 'All Submissions' },
                { id: 'submitted', label: 'Pending Review' },
                { id: 'quote_sent', label: 'Quote Sent' },
                { id: 'approved', label: 'Approved by Client' },
                { id: 'visit_scheduled', label: 'Visit Scheduled' },
                { id: 'in_production', label: 'In Production' },
                { id: 'completed', label: 'Completed' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setReqStatusFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    reqStatusFilter === f.id
                      ? 'bg-[#29231E] text-white shadow-2xs'
                      : 'bg-[#F8F6F2] text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {ideaRequests.filter((r) => reqStatusFilter === 'all' || r.status === reqStatusFilter).length === 0 ? (
              <div className="py-16 text-center text-xs text-[#77716A]">
                No customer submissions matching this filter.
              </div>
            ) : (
              <div className="space-y-4">
                {ideaRequests
                  .filter((r) => reqStatusFilter === 'all' || r.status === reqStatusFilter)
                  .map((req) => {
                    const cleanPhone = (req.customerPhone || '').replace(/[^0-9]/g, '');
                    return (
                      <div
                        key={req.requestId}
                        className="p-5 rounded-2xl bg-[#F8F6F2] border border-[#E7E1D9] flex flex-col md:flex-row items-start gap-5 text-xs shadow-2xs"
                      >
                        {/* Primary Image / Preview */}
                        <div className="w-full md:w-36 aspect-4/3 rounded-xl overflow-hidden bg-white border border-[#E7E1D9] shrink-0">
                          <img
                            src={req.imageUrl || '/assets/logo.png'}
                            alt={req.itemType}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-[#29231E]">
                              Ref #{req.requestId} — {req.itemType.toUpperCase()}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                req.status === 'approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : req.status === 'quote_sent'
                                  ? 'bg-green-100 text-green-800'
                                  : req.status === 'visit_scheduled'
                                  ? 'bg-purple-100 text-purple-800'
                                  : req.status === 'in_production'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-medium text-[#77716A] bg-white px-2 py-0.5 rounded-md border border-[#E7E1D9]">
                              {req.requestType === 'quote'
                                ? 'Quote Request'
                                : req.requestType === 'book_visit'
                                ? 'Measurement Visit'
                                : 'Quote + Visit'}
                            </span>
                            {req.projectId && (
                              <span className="text-[10px] font-medium text-[#68452D] bg-[#F0ECE5] px-2 py-0.5 rounded-md border border-[#E7E1D9]">
                                Room Project: #{req.projectId}
                              </span>
                            )}
                          </div>

                          <p className="text-[#29231E] leading-relaxed">
                            <strong>Description:</strong> {req.description}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#77716A] pt-1 border-t border-[#E7E1D9]">
                            <div>
                              <strong>Client:</strong> {req.customerName}
                              <div className="flex items-center gap-2 mt-1">
                                <a
                                  href={`tel:${req.customerPhone}`}
                                  className="inline-flex items-center gap-1 text-[#68452D] hover:underline"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span>{req.customerPhone}</span>
                                </a>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-md hover:bg-green-100"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>
                            </div>
                            <div>
                              <strong>Budget Target:</strong> {req.estimatedBudget}
                              {req.timberPreference && (
                                <p className="mt-0.5"><strong>Timber:</strong> {req.timberPreference}</p>
                              )}
                              {req.roomDimensions && (
                                <p className="mt-0.5"><strong>Dimensions:</strong> {req.roomDimensions}</p>
                              )}
                            </div>

                            {req.visitAddress && (
                              <div className="sm:col-span-2 text-[#68452D] font-medium">
                                <strong>Visit Address:</strong> {req.visitAddress}{' '}
                                {req.preferredVisitDate ? `(Preferred: ${req.preferredVisitDate})` : ''}
                              </div>
                            )}
                          </div>

                          {/* Uploaded attachments list */}
                          {req.attachments && req.attachments.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-2">
                              {req.attachments.map((att, idx) => (
                                <a
                                  key={idx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E7E1D9] rounded-lg text-[11px] text-[#29231E] hover:border-[#68452D]"
                                >
                                  {att.type === 'application/pdf' ? (
                                    <FileText className="w-3 h-3 text-red-600" />
                                  ) : (
                                    <Camera className="w-3 h-3 text-[#68452D]" />
                                  )}
                                  <span className="truncate max-w-[120px]">{att.name}</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-[#77716A]" />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Active Quote Display */}
                          {req.quotedAmount && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-900 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <strong>Active Quotation: {req.quotedAmount}</strong>
                                {req.estimatedTimelineWeeks && (
                                  <span className="text-[10px] text-green-800">
                                    Timeline: {req.estimatedTimelineWeeks} weeks
                                  </span>
                                )}
                              </div>
                              {req.internalNotes && (
                                <p className="text-[11px] text-green-800">Note: {req.internalNotes}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col items-center gap-2 shrink-0 self-end md:self-center w-full md:w-auto">
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setQuoteInput(req.quotedAmount || '');
                              setNoteInput(req.internalNotes || '');
                              setTimelineInput((req.estimatedTimelineWeeks || 3).toString());
                              setStatusInput(req.status === 'submitted' ? 'quote_sent' : req.status);
                            }}
                            className="flex-1 md:flex-initial px-4 py-2 bg-[#68452D] text-white rounded-xl font-semibold hover:bg-[#523724] text-center shadow-2xs"
                          >
                            Review & Prepare Quote
                          </button>

                          <select
                            value={req.status}
                            onChange={(e) => updateCustomIdeaStatus(req.requestId, e.target.value as any)}
                            className="bg-white border border-[#E7E1D9] rounded-xl px-2.5 py-2 font-medium text-[#29231E]"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="quote_sent">Quote Sent</option>
                            <option value="visit_scheduled">Visit Scheduled</option>
                            <option value="approved">Approved</option>
                            <option value="in_production">In Production</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: CUSTOMER ORDERS MANAGEMENT ─────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Header & Search Toolbar */}
            <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#29231E]">
                  Customer Orders ({orders.length})
                </h2>
                <p className="text-xs text-[#77716A] mt-0.5">
                  Real-time client orders with verified pricing, delivery addresses, and workshop milestone tracking.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#77716A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminOrderSearch}
                    onChange={(e) => setAdminOrderSearch(e.target.value)}
                    placeholder="Search order #, client, city..."
                    className="pl-8 pr-3 py-2 bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={adminOrderStatusFilter}
                  onChange={(e) => setAdminOrderStatusFilter(e.target.value)}
                  className="bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-2 text-xs font-medium text-[#29231E] focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="pending">
                    Pending ({orders.filter((o) => o.orderStatus === 'pending').length})
                  </option>
                  <option value="confirmed">
                    Confirmed ({orders.filter((o) => o.orderStatus === 'confirmed').length})
                  </option>
                  <option value="processing">
                    Workshop Processing ({orders.filter((o) => o.orderStatus === 'processing').length})
                  </option>
                  <option value="dispatched">
                    Dispatched ({orders.filter((o) => o.orderStatus === 'dispatched').length})
                  </option>
                  <option value="delivered">
                    Delivered ({orders.filter((o) => o.orderStatus === 'delivered').length})
                  </option>
                  <option value="cancelled">
                    Cancelled ({orders.filter((o) => o.orderStatus === 'cancelled').length})
                  </option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-12 text-center text-xs text-[#77716A]">
                {orders.length === 0
                  ? 'No customer orders placed yet.'
                  : 'No orders match the search or filter criteria.'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const statusColors: Record<Order['orderStatus'], string> = {
                    pending: 'bg-amber-100 text-amber-900 border-amber-300',
                    confirmed: 'bg-blue-100 text-blue-900 border-blue-300',
                    processing: 'bg-purple-100 text-purple-900 border-purple-300',
                    dispatched: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                    delivered: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                    cancelled: 'bg-red-100 text-red-900 border-red-300',
                  };

                  const cleanPhone = (ord.customerSnapshot?.phoneNumber || ord.customerPhone || '')
                    .replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={ord.orderId}
                      className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm space-y-4 hover:border-[#A17A58] transition-all"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E1D9] gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-serif font-bold text-base text-[#29231E]">
                            Order #{ord.orderNumber}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                              statusColors[ord.orderStatus] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {ord.orderStatus.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-[#77716A]">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#77716A]">Quick Status:</span>
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => updateOrderStatus(ord.orderId, e.target.value as any)}
                            className="bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-1 text-xs font-semibold text-[#29231E] focus:outline-hidden"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="dispatched">Dispatched</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Client Info & Delivery Address */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#F8F6F2] p-4 rounded-2xl border border-[#E7E1D9]/60">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#A17A58] block mb-1">
                            Client Details
                          </span>
                          <p className="font-semibold text-[#29231E] text-sm">
                            {ord.customerSnapshot?.name || ord.customerName || 'Client'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[#77716A]">
                            {(ord.customerSnapshot?.phoneNumber || ord.customerPhone) && (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${ord.customerSnapshot?.phoneNumber || ord.customerPhone}`}
                                  className="inline-flex items-center gap-1 text-[#68452D] hover:underline font-medium"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span>{ord.customerSnapshot?.phoneNumber || ord.customerPhone}</span>
                                </a>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-md hover:bg-green-100 font-medium"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>
                            )}
                            {(ord.customerSnapshot?.email || ord.customerEmail) && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-[#A17A58]" />
                                <span>{ord.customerSnapshot?.email || ord.customerEmail}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#A17A58] block mb-1">
                            Delivery Destination
                          </span>
                          <p className="text-[#29231E] font-medium leading-relaxed">
                            {ord.deliveryAddress?.streetAddress || 'Address on file'}
                            {ord.deliveryAddress?.city ? `, ${ord.deliveryAddress.city}` : ''}
                            {ord.deliveryAddress?.state ? `, ${ord.deliveryAddress.state}` : ''}
                            {ord.deliveryAddress?.postalCode ? ` - ${ord.deliveryAddress.postalCode}` : ''}
                          </p>
                          <span className="text-[11px] text-[#77716A] block mt-0.5">
                            Method: {ord.paymentMethod === 'online' ? 'Online Payment' : 'Manual Confirmation (NEFT / Pay on Delivery)'}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered Snapshot */}
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-[#A17A58] block">
                          Ordered Pieces ({ord.items.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {ord.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-white border border-[#E7E1D9] rounded-2xl"
                            >
                              <div className="w-14 h-14 rounded-xl bg-[#F0ECE5] overflow-hidden shrink-0 border border-[#E7E1D9]">
                                <img
                                  src={item.image || '/assets/logo.png'}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1 text-xs">
                                <p className="font-semibold text-[#29231E] truncate">{item.name}</p>
                                <p className="text-[11px] text-[#77716A]">Qty: {item.quantity}</p>
                                {item.selectedFinish && (
                                  <p className="text-[10px] text-[#A17A58] truncate">
                                    Finish: {item.selectedFinish}
                                  </p>
                                )}
                                <p className="font-serif font-bold text-[#68452D] text-xs mt-0.5">
                                  ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Latest Note & Actions Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-[#E7E1D9] gap-3 text-xs">
                        <div className="text-[11px] text-[#77716A] flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#A17A58] shrink-0" />
                          <span>
                            Latest Milestone:{' '}
                            <strong className="text-[#29231E]">
                              {ord.statusHistory && ord.statusHistory.length > 0
                                ? ord.statusHistory[ord.statusHistory.length - 1].note
                                : 'Order recorded in Charbhuja ledger.'}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className="font-serif text-lg font-bold text-[#68452D] tabular-nums">
                            Total: ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderModal(ord);
                              setOrderModalStatus(ord.orderStatus);
                              setOrderModalNote('');
                            }}
                            className="px-4 py-2 bg-[#68452D] text-white rounded-xl font-semibold hover:bg-[#523724] transition-colors shadow-2xs text-xs flex items-center gap-1.5"
                          >
                            <Hammer className="w-3.5 h-3.5" />
                            <span>Workshop Notes & Log</span>
                          </button>

                          <Link
                            to={`/orders/${ord.orderId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 border border-[#E7E1D9] hover:bg-[#F8F6F2] rounded-xl text-[#77716A] hover:text-[#29231E]"
                            title="Open Customer Tracking Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: REGISTERED & ORDERING CUSTOMERS ───────────── */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#29231E]">
                  Customer Directory ({customerList.length})
                </h2>
                <p className="text-xs text-[#77716A] mt-0.5">
                  Aggregated clients from registered accounts, placed orders, and bespoke design inquiries.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#77716A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminCustomerSearch}
                  onChange={(e) => setAdminCustomerSearch(e.target.value)}
                  placeholder="Search client name, email, phone..."
                  className="pl-8 pr-3 py-2 bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                />
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-3xl border border-[#E7E1D9] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F6F2] border-b border-[#E7E1D9] text-[#77716A] uppercase font-bold tracking-wider text-[10px]">
                    <tr>
                      <th className="py-4 px-6">Client Name</th>
                      <th className="py-4 px-6">Contact Channels</th>
                      <th className="py-4 px-6 text-center">Orders Placed</th>
                      <th className="py-4 px-6 text-center">Custom Ideas</th>
                      <th className="py-4 px-6 text-right">Lifetime Spend</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E1D9]">
                    {customerList
                      .filter((c) => {
                        if (!adminCustomerSearch.trim()) return true;
                        const q = adminCustomerSearch.toLowerCase();
                        return (
                          c.name.toLowerCase().includes(q) ||
                          c.email.toLowerCase().includes(q) ||
                          c.phone.toLowerCase().includes(q)
                        );
                      })
                      .map((cust) => {
                        const cleanPhone = cust.phone.replace(/[^0-9]/g, '');

                        return (
                          <tr key={cust.email} className="hover:bg-[#F8F6F2]/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#68452D] text-white flex items-center justify-center font-bold text-xs uppercase">
                                  {cust.name.charAt(0) || 'C'}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#29231E]">{cust.name}</p>
                                  {cust.joinedDate && (
                                    <span className="text-[10px] text-[#77716A]">
                                      Since {new Date(cust.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <p className="text-[#29231E]">{cust.email}</p>
                                {cust.phone ? (
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={`tel:${cust.phone}`}
                                      className="text-[#68452D] hover:underline inline-flex items-center gap-1"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>{cust.phone}</span>
                                    </a>
                                    {cleanPhone && (
                                      <a
                                        href={`https://wa.me/${cleanPhone}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded-sm hover:bg-green-100 text-[10px] font-semibold"
                                      >
                                        WhatsApp
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[#77716A] text-[10px]">No phone on file</span>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-6 text-center font-semibold text-[#29231E]">
                              {cust.ordersCount}
                            </td>

                            <td className="py-4 px-6 text-center font-semibold text-[#68452D]">
                              {cust.customRequestsCount}
                            </td>

                            <td className="py-4 px-6 text-right font-serif font-bold text-[#68452D]">
                              ₹{cust.totalSpend.toLocaleString('en-IN')}
                            </td>

                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminOrderSearch(cust.name);
                                  setActiveTab('orders');
                                }}
                                className="px-3 py-1 bg-[#F8F6F2] hover:bg-[#F0ECE5] border border-[#E7E1D9] rounded-lg text-xs font-semibold text-[#29231E]"
                              >
                                View Orders
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: WORKSHOP & REVENUE ANALYTICS ──────────────── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-[#29231E]">
                Workshop Production & Commercial Analytics
              </h2>
              <p className="text-xs text-[#77716A] mt-0.5">
                Live aggregations computed directly from verified Firestore orders and bespoke requests.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A17A58]">
                  Verified Lifetime Revenue
                </span>
                <p className="font-serif text-2xl font-bold text-[#29231E]">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-[#77716A]">Excludes cancelled orders</p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A17A58]">
                  Average Order Value (AOV)
                </span>
                <p className="font-serif text-2xl font-bold text-[#29231E]">
                  ₹
                  {orders.filter((o) => o.orderStatus !== 'cancelled').length > 0
                    ? Math.round(
                        totalRevenue /
                          orders.filter((o) => o.orderStatus !== 'cancelled').length
                      ).toLocaleString('en-IN')
                    : 0}
                </p>
                <p className="text-[11px] text-[#77716A]">Across all active purchases</p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A17A58]">
                  Bespoke Inquiries
                </span>
                <p className="font-serif text-2xl font-bold text-[#29231E]">
                  {ideaRequests.length}
                </p>
                <p className="text-[11px] text-green-700 font-medium">
                  {ideaRequests.filter((r) => r.quotedAmount).length} quotes formulated
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A17A58]">
                  Active In Production
                </span>
                <p className="font-serif text-2xl font-bold text-[#68452D]">
                  {orders.filter((o) => o.orderStatus === 'processing').length +
                    ideaRequests.filter((r) => r.status === 'in_production').length}
                </p>
                <p className="text-[11px] text-[#77716A]">Carpenters working in workshop</p>
              </div>
            </div>

            {/* Orders Status Breakdown & Categories Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Status Distribution */}
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#29231E]">
                  Order Pipeline Distribution
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Pending Review', count: orders.filter((o) => o.orderStatus === 'pending').length, color: 'bg-amber-500' },
                    { label: 'Confirmed by Admin', count: orders.filter((o) => o.orderStatus === 'confirmed').length, color: 'bg-blue-500' },
                    { label: 'In Workshop Production', count: orders.filter((o) => o.orderStatus === 'processing').length, color: 'bg-purple-500' },
                    { label: 'Dispatched for Delivery', count: orders.filter((o) => o.orderStatus === 'dispatched').length, color: 'bg-indigo-500' },
                    { label: 'Delivered & Handed Over', count: orders.filter((o) => o.orderStatus === 'delivered').length, color: 'bg-emerald-500' },
                    { label: 'Cancelled', count: orders.filter((o) => o.orderStatus === 'cancelled').length, color: 'bg-red-500' },
                  ].map((pipe) => {
                    const percentage = orders.length > 0 ? Math.round((pipe.count / orders.length) * 100) : 0;
                    return (
                      <div key={pipe.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#29231E]">{pipe.label}</span>
                          <span className="text-[#77716A]">{pipe.count} orders ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#F0ECE5] overflow-hidden">
                          <div
                            className={`h-full ${pipe.color} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bespoke Requests Conversion Funnel */}
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#29231E]">
                  Custom Idea Funnel & Quotation Conversion
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    { label: 'Submissions Received', count: ideaRequests.length, color: 'bg-[#68452D]' },
                    { label: 'Quotes Prepared & Sent', count: ideaRequests.filter((r) => ['quote_sent', 'approved', 'in_production', 'completed'].includes(r.status)).length, color: 'bg-[#A17A58]' },
                    { label: 'Site Visits Scheduled', count: ideaRequests.filter((r) => r.status === 'visit_scheduled').length, color: 'bg-amber-600' },
                    { label: 'Approved by Customer', count: ideaRequests.filter((r) => ['approved', 'in_production', 'completed'].includes(r.status)).length, color: 'bg-emerald-600' },
                    { label: 'Workshop Production Active', count: ideaRequests.filter((r) => r.status === 'in_production').length, color: 'bg-blue-600' },
                    { label: 'Successfully Completed', count: ideaRequests.filter((r) => r.status === 'completed').length, color: 'bg-teal-600' },
                  ].map((step) => {
                    const pct = ideaRequests.length > 0 ? Math.round((step.count / ideaRequests.length) * 100) : 0;
                    return (
                      <div key={step.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#29231E]">{step.label}</span>
                          <span className="text-[#77716A]">{step.count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#F0ECE5] overflow-hidden">
                          <div
                            className={`h-full ${step.color} rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ── MODAL: CREATE OR EDIT PRODUCT ──────────────────── */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-[#E7E1D9] max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E7E1D9] pb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#29231E]">
                    {productModalMode === 'create' ? 'List New Trending Design' : 'Edit Trending Design'}
                  </h3>
                  <p className="text-xs text-[#77716A] mt-0.5">
                    Configure specifications, materials, and upload high-resolution photography.
                  </p>
                </div>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="p-2 text-[#77716A] hover:text-[#29231E] hover:bg-[#F8F6F2] rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
                {/* Product Title */}
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aastha Minimalist Solid Teak 3-Seater Sofa"
                    className={`w-full bg-[#F8F6F2] border rounded-xl px-3.5 py-2.5 text-[#29231E] focus:outline-none focus:border-[#68452D] ${
                      formErrors.name ? 'border-red-400' : 'border-[#E7E1D9]'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* Category & Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-2.5 text-[#29231E] focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                      Starting Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 48000"
                      className={`w-full bg-[#F8F6F2] border rounded-xl px-3 py-2.5 text-[#29231E] focus:outline-none focus:border-[#68452D] ${
                        formErrors.price ? 'border-red-400' : 'border-[#E7E1D9]'
                      }`}
                    />
                    {formErrors.price && (
                      <p className="text-red-500 text-[11px] mt-1">{formErrors.price}</p>
                    )}
                  </div>

                  <div>
                    <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                      Product Type
                    </label>
                    <select
                      value={formData.productType}
                      onChange={(e) => setFormData({ ...formData, productType: e.target.value as ProductType })}
                      className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-2.5 text-[#29231E] focus:outline-none"
                    >
                      <option value="made_to_order">Crafted on Demand</option>
                      <option value="ready_made">Ready to Ship</option>
                      <option value="custom">Bespoke Architecture</option>
                    </select>
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1.5 text-[#29231E]">
                    Standard Dimensions (Width × Depth × Height)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <input
                        type="number"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                        placeholder="Width"
                        className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-2 text-center"
                      />
                      <span className="text-[10px] text-[#77716A] block text-center mt-0.5">Width</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.depth}
                        onChange={(e) => setFormData({ ...formData, depth: Number(e.target.value) })}
                        placeholder="Depth"
                        className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-2 text-center"
                      />
                      <span className="text-[10px] text-[#77716A] block text-center mt-0.5">Depth</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                        placeholder="Height"
                        className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-2 text-center"
                      />
                      <span className="text-[10px] text-[#77716A] block text-center mt-0.5">Height</span>
                    </div>
                    <div>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value as MeasurementUnit })}
                        className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-2 py-2 text-center"
                      >
                        <option value="cm">cm</option>
                        <option value="inches">inches</option>
                        <option value="mm">mm</option>
                        <option value="ft">ft</option>
                      </select>
                      <span className="text-[10px] text-[#77716A] block text-center mt-0.5">Unit</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                    Craftsmanship Description *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mention solid hardwood joinery, foam density, upholstery, or finish specifics..."
                    className={`w-full bg-[#F8F6F2] border rounded-xl p-3 text-[#29231E] focus:outline-none focus:border-[#68452D] ${
                      formErrors.description ? 'border-red-400' : 'border-[#E7E1D9]'
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-[11px] mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* ── MULTI-IMAGE UPLOAD & GALLERY SECTION ── */}
                <div className="space-y-3 p-4 bg-[#F8F6F2] rounded-2xl border border-[#E7E1D9]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold uppercase tracking-wider text-[#29231E] block">
                        Product Photography Gallery ({formData.images.length} images) *
                      </label>
                      <span className="text-[11px] text-[#77716A]">
                        Upload high-resolution shots or select from the workshop sample library.
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-[#68452D] text-white rounded-xl font-semibold flex items-center gap-1.5 hover:bg-[#523724] transition-all disabled:opacity-50 shadow-2xs"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload Photos'}</span>
                    </button>
                  </div>

                  {/* Uploaded Images Preview Thumbnails */}
                  {formData.images.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {formData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E7E1D9] bg-white group shadow-2xs"
                        >
                          <img src={imgUrl} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-[#29231E]/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-sm"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-[#77716A] text-[11px]">
                      No photos attached. Click 'Upload Photos' or pick a sample below.
                    </div>
                  )}

                  {/* Preset workshop images picker */}
                  <div className="pt-2 border-t border-[#E7E1D9]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#77716A] block mb-1.5">
                      Or attach a preset workshop photography angle:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_WORKSHOP_IMAGES.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => handleAddSampleImage(s.url)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#E7E1D9] hover:border-[#68452D] text-[11px] text-[#29231E] flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-[#68452D]" />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formErrors.images && (
                    <p className="text-red-500 text-[11px] mt-1">{formErrors.images}</p>
                  )}
                </div>

                {/* Timber & Materials Tags */}
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                    Available Timbers & Materials
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_TIMBERS.map((mat) => {
                      const isSelected = formData.materials.includes(mat);
                      return (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => handleToggleMaterial(mat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            isSelected
                              ? 'bg-[#29231E] text-white shadow-2xs'
                              : 'bg-[#F8F6F2] text-[#77716A] border border-[#E7E1D9] hover:border-[#68452D]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {mat}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customMaterialInput}
                      onChange={(e) => setCustomMaterialInput(e.target.value)}
                      placeholder="Add custom timber or fabric..."
                      className="flex-1 bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomMaterial}
                      className="px-3 py-1.5 bg-[#68452D] text-white rounded-xl text-xs font-semibold"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Finishes & Polishes Tags */}
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                    Available Finishes & Polishes
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_FINISHES.map((fin) => {
                      const isSelected = formData.finishes.includes(fin);
                      return (
                        <button
                          key={fin}
                          type="button"
                          onClick={() => handleToggleFinish(fin)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            isSelected
                              ? 'bg-[#68452D] text-white shadow-2xs'
                              : 'bg-[#F8F6F2] text-[#77716A] border border-[#E7E1D9] hover:border-[#68452D]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {fin}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customFinishInput}
                      onChange={(e) => setCustomFinishInput(e.target.value)}
                      placeholder="Add custom finish or stain..."
                      className="flex-1 bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFinish}
                      className="px-3 py-1.5 bg-[#68452D] text-white rounded-xl text-xs font-semibold"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Additional Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E7E1D9]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded-sm accent-[#68452D]"
                    />
                    <span className="font-medium text-[#29231E]">Trending on Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.startingPrice}
                      onChange={(e) => setFormData({ ...formData, startingPrice: e.target.checked })}
                      className="rounded-sm accent-[#68452D]"
                    />
                    <span className="font-medium text-[#29231E]">Starting Base Price</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded-sm accent-[#68452D]"
                    />
                    <span className="font-medium text-[#29231E]">Active on Storefront</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E1D9]">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-5 py-2.5 text-[#77716A] hover:text-[#29231E] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="px-6 py-2.5 bg-[#68452D] text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all disabled:opacity-50 shadow-xs flex items-center gap-2"
                  >
                    {submittingProduct ? (
                      <span>Saving to Catalog...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{productModalMode === 'create' ? 'Publish Piece' : 'Save Changes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: DELETE PRODUCT CONFIRMATION ─────────────── */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-[#E7E1D9] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#29231E]">Remove Piece?</h3>
                <p className="text-xs text-[#77716A] mt-1">
                  Are you sure you want to remove <strong>"{deletingProduct.name}"</strong> from the storefront? Customers will no longer be able to explore or order it.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="px-4 py-2 text-[#77716A] hover:text-[#29231E] text-xs font-semibold"
                >
                  Keep Piece
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors"
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: ENTER QUOTATION / NOTE ──────────────────── */}
        {selectedReq && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-[#E7E1D9] max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-5">
              <div className="flex items-start justify-between border-b border-[#E7E1D9] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#68452D] text-white px-2 py-0.5 rounded-full">
                      Bespoke Estimate
                    </span>
                    <span className="text-xs text-[#77716A]">#{selectedReq.requestId}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#29231E] mt-1">
                    Quotation & Workshop Plan: {selectedReq.itemType || selectedReq.category || 'Custom Furniture'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="p-1.5 text-[#77716A] hover:text-[#29231E] hover:bg-[#F0ECE5] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Client & Request Overview */}
              <div className="bg-[#F8F6F2] rounded-2xl p-4 border border-[#E7E1D9] space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-[#77716A]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A17A58] block">Client Name</span>
                    <span className="font-semibold text-[#29231E]">{selectedReq.customerName || selectedReq.userName || 'Client'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A17A58] block">Phone / WhatsApp</span>
                    <span className="font-semibold text-[#29231E]">{selectedReq.customerPhone || selectedReq.userPhone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A17A58] block">Timber Preference</span>
                    <span className="font-semibold text-[#29231E]">{selectedReq.timberPreference || 'Standard Teak'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A17A58] block">Room Dimensions</span>
                    <span className="font-semibold text-[#29231E]">{selectedReq.roomDimensions || 'Standard sizing'}</span>
                  </div>
                </div>

                {selectedReq.description && (
                  <div className="pt-2 border-t border-[#E7E1D9]/60">
                    <span className="text-[10px] uppercase font-bold text-[#A17A58] block mb-0.5">Client Design Vision</span>
                    <p className="text-[#29231E] italic bg-white/70 p-2.5 rounded-xl border border-[#E7E1D9]/40 leading-relaxed">
                      "{selectedReq.description}"
                    </p>
                  </div>
                )}

                {/* Attachments preview */}
                {selectedReq.attachments && selectedReq.attachments.length > 0 && (
                  <div className="pt-2 border-t border-[#E7E1D9]/60">
                    <span className="text-[10px] uppercase font-bold text-[#A17A58] block mb-1">
                      Uploaded Documents & References ({selectedReq.attachments.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedReq.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E7E1D9] rounded-xl text-[11px] font-medium text-[#29231E] hover:border-[#68452D] hover:text-[#68452D] transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#A17A58]" />
                          <span className="truncate max-w-[150px]">{att.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quotation Formulation Form */}
              <form onSubmit={handleSaveQuotation} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                      Quoted Amount (₹) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={quoteInput}
                      onChange={(e) => setQuoteInput(e.target.value)}
                      placeholder="e.g. ₹54,000 (Timber, Joinery & Polish)"
                      className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2.5 text-[#29231E] font-medium focus:outline-hidden focus:border-[#68452D]"
                    />
                  </div>

                  <div>
                    <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                      Estimated Crafting Timeline (Weeks)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={timelineInput}
                      onChange={(e) => setTimelineInput(e.target.value)}
                      placeholder="3"
                      className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2.5 text-[#29231E] font-medium focus:outline-hidden focus:border-[#68452D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                    Workflow Stage / Status
                  </label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as any)}
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2.5 text-[#29231E] font-medium focus:outline-hidden focus:border-[#68452D]"
                  >
                    <option value="under_review">Under Review (Evaluating drawings)</option>
                    <option value="quote_sent">Quote Sent (Waiting for customer acceptance)</option>
                    <option value="visit_scheduled">Carpentry Site Visit Scheduled</option>
                    <option value="approved">Approved & Payment / Order Confirmed</option>
                    <option value="in_production">In Production at Workshop</option>
                    <option value="completed">Completed & Handed Over</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                    Workshop & Joinery Specifications for Client
                  </label>
                  <textarea
                    rows={4}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="e.g. Mortise and tenon joinery in 100% solid CP teakwood. 40-density HR foam with linen fabric, raw matte polyurethane protective sealer. Includes on-site assembly."
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl p-3 text-[#29231E] focus:outline-hidden focus:border-[#68452D] leading-relaxed"
                  />
                  <p className="text-[11px] text-[#77716A] mt-1">
                    This note and quoted price are immediately visible to the customer in their account & projects tab.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E1D9]">
                  <button
                    type="button"
                    onClick={() => setSelectedReq(null)}
                    className="px-5 py-2.5 text-[#77716A] hover:text-[#29231E] font-medium"
                  >
                    Dismiss
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#68452D] text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all shadow-xs"
                  >
                    Send Quotation to Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL: INSPECT ORDER & WORKSHOP MILESTONES ────── */}
        {selectedOrderModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-[#E7E1D9] max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E7E1D9] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-2xl font-bold text-[#29231E]">
                      Order #{selectedOrderModal.orderNumber}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F0ECE5] text-[#68452D] border border-[#E7E1D9]">
                      {selectedOrderModal.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#77716A] mt-0.5">
                    Placed on {new Date(selectedOrderModal.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderModal(null)}
                  className="p-2 text-[#77716A] hover:text-[#29231E] hover:bg-[#F8F6F2] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Client & Shipping Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#F8F6F2] p-4 rounded-2xl border border-[#E7E1D9]/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A17A58] block mb-1">
                    Customer Info
                  </span>
                  <p className="font-semibold text-[#29231E] text-sm">
                    {selectedOrderModal.customerSnapshot?.name || selectedOrderModal.customerName || 'Client'}
                  </p>
                  <p className="text-[#77716A] mt-0.5">
                    {selectedOrderModal.customerSnapshot?.email || selectedOrderModal.customerEmail}
                  </p>
                  {(selectedOrderModal.customerSnapshot?.phoneNumber || selectedOrderModal.customerPhone) && (
                    <div className="flex items-center gap-2 mt-1">
                      <a
                        href={`tel:${selectedOrderModal.customerSnapshot?.phoneNumber || selectedOrderModal.customerPhone}`}
                        className="text-[#68452D] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{selectedOrderModal.customerSnapshot?.phoneNumber || selectedOrderModal.customerPhone}</span>
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A17A58] block mb-1">
                    Delivery Address
                  </span>
                  <p className="text-[#29231E] font-medium leading-relaxed">
                    {selectedOrderModal.deliveryAddress?.streetAddress}
                    <br />
                    {selectedOrderModal.deliveryAddress?.city}, {selectedOrderModal.deliveryAddress?.state} - {selectedOrderModal.deliveryAddress?.postalCode}
                  </p>
                  <span className="text-[11px] text-[#77716A] block mt-1">
                    Payment Mode: {selectedOrderModal.paymentMethod === 'online' ? 'Online' : 'Manual Confirmation (NEFT / Cash on Delivery)'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#A17A58] block">
                  Ordered Items ({selectedOrderModal.items.length})
                </span>
                <div className="divide-y divide-[#E7E1D9] border border-[#E7E1D9] rounded-2xl overflow-hidden text-xs">
                  {selectedOrderModal.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || '/assets/logo.png'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl bg-[#F0ECE5]"
                        />
                        <div>
                          <p className="font-semibold text-[#29231E]">{item.name}</p>
                          <p className="text-[11px] text-[#77716A]">
                            Qty: {item.quantity} {item.selectedFinish ? `· Finish: ${item.selectedFinish}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-[#68452D]">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-[#F8F6F2] flex items-center justify-between text-xs font-semibold text-[#29231E]">
                    <span>Total Amount:</span>
                    <span className="font-serif text-base font-bold text-[#68452D]">
                      ₹{selectedOrderModal.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Milestone History */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#A17A58] block">
                  Milestone History Log ({selectedOrderModal.statusHistory?.length || 0})
                </span>
                <div className="bg-[#F8F6F2] p-4 rounded-2xl border border-[#E7E1D9] max-h-36 overflow-y-auto space-y-2.5 text-xs">
                  {selectedOrderModal.statusHistory && selectedOrderModal.statusHistory.length > 0 ? (
                    selectedOrderModal.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold uppercase tracking-wider text-[#68452D] text-[10px]">
                              {h.status}
                            </span>
                            <span className="text-[10px] text-[#77716A]">
                              {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                              {new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-[#29231E] mt-0.5">{h.note}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#77716A] text-xs">No status updates logged yet.</p>
                  )}
                </div>
              </div>

              {/* Workshop Note & Status Form */}
              <form onSubmit={handleUpdateOrderNoteAndStatus} className="space-y-4 text-xs pt-2 border-t border-[#E7E1D9]">
                <div>
                  <label className="font-bold uppercase tracking-wider block mb-1 text-[#29231E]">
                    Update Milestone Status
                  </label>
                  <select
                    value={orderModalStatus}
                    onChange={(e) => setOrderModalStatus(e.target.value as any)}
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2.5 text-[#29231E] font-medium focus:outline-hidden focus:border-[#68452D]"
                  >
                    <option value="pending">Pending Review (Awaiting Workshop Allocation)</option>
                    <option value="confirmed">Confirmed (Order Accepted & Timber Reserved)</option>
                    <option value="processing">Processing (Joinery & Carpentry Active)</option>
                    <option value="dispatched">Dispatched (Transit & Protective Crating)</option>
                    <option value="delivered">Delivered (White Glove Installation Complete)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold uppercase tracking-wider text-[#29231E]">
                      Milestone / Workshop Note for Customer
                    </label>
                    <span className="text-[10px] text-[#77716A]">Shows on client tracking page</span>
                  </div>
                  <textarea
                    rows={3}
                    value={orderModalNote}
                    onChange={(e) => setOrderModalNote(e.target.value)}
                    placeholder="e.g. Solid CP teak pieces planed and cut to size. Dovetail joinery in progress by master artisan."
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl p-3 text-[#29231E] focus:outline-hidden focus:border-[#68452D] leading-relaxed"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      'Timber selected and cut to specifications.',
                      'Artisanal mortise & tenon joinery completed.',
                      'Applied 1st coat of matte protective oil.',
                      'Protective crated & handed to delivery team.',
                      'Assembled and installed at client site.',
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setOrderModalNote(preset)}
                        className="text-[10px] bg-[#F8F6F2] hover:bg-[#F0ECE5] border border-[#E7E1D9] text-[#68452D] px-2 py-1 rounded-md transition-colors"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#E7E1D9]">
                  <Link
                    to={`/orders/${selectedOrderModal.orderId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#68452D] hover:underline text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Customer Tracking View</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderModal(null)}
                      className="px-4 py-2 text-[#77716A] hover:text-[#29231E] font-medium"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={submittingOrderNote}
                      className="px-5 py-2 bg-[#68452D] text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all disabled:opacity-50 shadow-xs"
                    >
                      {submittingOrderNote ? 'Recording...' : 'Save Milestone'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

