import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  Users,
  Search,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  ShoppingBag,
  Bell,
  SlidersHorizontal,
  Archive,
  Image as ImageIcon,
  ArrowUpDown,
  Tag,
  Ship,
  Plane,
  Eye,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import NotificationBell from '../components/NotificationBell';
import ShipFromBadge from '../components/ShipFromBadge';

const SNEAKER_SIZE_OPTIONS = Array.from({ length: 14 }, (_, index) => String(index + 35));
const CLOTHING_SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'Extra Large'];
const recommendedSizes = (category) => category === 'Sneakers'
  ? SNEAKER_SIZE_OPTIONS
  : ['Jeans', 'Designer Brands'].includes(category)
    ? CLOTHING_SIZE_OPTIONS
    : ['One Size'];

export default function AdminDashboardPage() {
  const { user, token, openAuthModal } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [shippingRates, setShippingRates] = useState({ air: {}, sea: {} });

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'categories' | 'banners' | 'shipping' | 'requests' | 'customers' | 'audit'
  const [loading, setLoading] = useState(true);

  // Status updating state & override
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [statusOverride, setStatusOverride] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');

  // Edit Order modal state
  const [editOrderModal, setEditOrderModal] = useState(null);
  const [editOrderTracking, setEditOrderTracking] = useState('');
  const [editOrderNotes, setEditOrderNotes] = useState('');
  const [editOrderShippingMethod, setEditOrderShippingMethod] = useState('air');

  // Product Management Modal State (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    brand: '',
    category: 'Sneakers',
    subCategory: 'Low Top',
    description: '',
    priceGHS: '',
    priceUSD: '',
    depositPercent: 50,
    sizes: SNEAKER_SIZE_OPTIONS.join(', '),
    colors: 'Black, White, Red, Blue',
    imageColors: ['Black'],
    stock: '',
    shipFromCountry: 'US',
    estimatedDays: '10–18 Days',
    visibility: 'published',
    images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80']
  });

  // Product filtering, search & pagination
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [productSort, setProductSort] = useState('newest');
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 8;

  // Image Upload / Add URL state
  const [uploadFeedback, setUploadFeedback] = useState(null);

  // New Category State
  const [newCatName, setNewCatName] = useState('');

  // New Banner State
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    ctaText: 'Shop Now',
    ctaUrl: '/',
    image: ''
  });

  // Toast / feedback message
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Dashboard request failed (${response.status})`);
      }
      setStats(data.stats || null);
      setOrders(data.orders || []);
      setRequests(data.requests || []);
      setProducts(data.products || []);
      setCustomers(data.customers || []);
      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setShippingRates(data.rates || {});
      setAuditLogs(data.logs || []);
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
      showToast(err.message || 'Could not load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      openAuthModal('login');
      return;
    }
    fetchAdminData();
  }, [token]);

  // Handle Mark Orders Viewed
  const handleMarkOrdersViewed = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/orders/mark-viewed`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => ({ ...o, adminViewed: true })));
        if (stats) setStats({ ...stats, newOrders: 0 });
        showToast('All orders marked as viewed');
      }
    } catch {
      showToast('Failed to mark orders viewed', 'error');
    }
  };

  // Status Change Confirmation Modal Trigger
  const promptStatusChange = (order, newStatus) => {
    setStatusModalOrder(order);
    setTargetStatus(newStatus);
    setStatusNote('');
    setStatusOverride(false);
  };

  const executeStatusChange = async () => {
    if (!statusModalOrder || !targetStatus) return;
    setStatusUpdating(statusModalOrder.id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/orders/${statusModalOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: targetStatus,
          note: statusNote.trim() || undefined,
          adminOverride: statusOverride
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order #${statusModalOrder.orderNumber} updated to ${targetStatus}`);
        setStatusModalOrder(null);
        fetchAdminData();
      } else {
        showToast(data.message || 'Status transition rejected', 'error');
      }
    } catch {
      showToast('Network error updating status', 'error');
    } finally {
      setStatusUpdating(null);
    }
  };

  // Save Order Edits (Notes, Tracking, Shipping Method)
  const handleSaveOrderEdits = async () => {
    if (!editOrderModal) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/orders/${editOrderModal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          adminNotes: editOrderNotes,
          trackingNumber: editOrderTracking,
          shippingMethod: editOrderShippingMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Order details updated');
        setEditOrderModal(null);
        fetchAdminData();
      } else {
        showToast(data.message || 'Failed to update order', 'error');
      }
    } catch {
      showToast('Error updating order details', 'error');
    }
  };

  // Confirm manual payment
  const handleConfirmPayment = async (orderId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/orders/${orderId}/confirm-payment`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Payment confirmed successfully');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to confirm payment', 'error');
    }
  };

  // Open Create Product Modal
  const openCreateProduct = () => {
    setEditingProductId(null);
    setProdForm({
      name: '',
      brand: '',
      category: 'Sneakers',
      subCategory: 'Low Top',
      description: '',
      priceGHS: '',
      priceUSD: '',
      depositPercent: 50,
      sizes: SNEAKER_SIZE_OPTIONS.join(', '),
      colors: 'Black, White, Red, Blue',
      imageColors: ['Black'],
      stock: '10',
      shipFromCountry: 'US',
      estimatedDays: '10–18 Days',
      visibility: 'published',
      images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80']
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const openEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setProdForm({
      name: prod.name || '',
      brand: prod.brand || '',
      category: prod.category || 'Sneakers',
      subCategory: prod.subCategory || 'General',
      description: prod.description || '',
      priceGHS: prod.priceGHS || '',
      priceUSD: prod.priceUSD || '',
      depositPercent: prod.depositPercent || 50,
      sizes: Array.isArray(prod.sizes) ? prod.sizes.join(', ') : (prod.sizes || ''),
      colors: Array.isArray(prod.colors) ? prod.colors.join(', ') : (prod.colors || ''),
      imageColors: (prod.imageColors || []).slice(),
      stock: prod.stock !== undefined && prod.stock !== null ? String(prod.stock) : '',
      shipFromCountry: prod.shipFromCountry || 'US',
      estimatedDays: prod.estimatedDays || '10–18 Days',
      visibility: prod.visibility || 'published',
      images: prod.images && prod.images.length > 0 ? [...prod.images] : []
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.priceGHS) {
      showToast('Product name and price in GHS are required', 'error');
      return;
    }
    if (prodForm.images.some(image => image.startsWith('data:image/'))) {
      showToast('One or more photos are not stored yet. Upload them again before saving.', 'error');
      return;
    }

    const payload = {
      name: prodForm.name.trim(),
      brand: prodForm.brand.trim() || 'Luxury Brand',
      category: prodForm.category,
      subCategory: prodForm.subCategory,
      description: prodForm.description.trim(),
      priceGHS: Number(prodForm.priceGHS),
      priceUSD: prodForm.priceUSD ? Number(prodForm.priceUSD) : undefined,
      depositPercent: Number(prodForm.depositPercent) || 50,
      sizes: prodForm.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: prodForm.colors.split(',').map(c => c.trim()).filter(Boolean),
      imageColors: prodForm.imageColors,
      stock: prodForm.stock !== '' ? Number(prodForm.stock) : null,
      shipFromCountry: prodForm.shipFromCountry,
      estimatedDays: prodForm.estimatedDays,
      visibility: prodForm.visibility,
      images: prodForm.images.length > 0 ? prodForm.images : ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80']
    };

    try {
      const url = editingProductId ? `${import.meta.env.VITE_API_URL || ''}/api/products/${editingProductId}` : `${import.meta.env.VITE_API_URL || ''}/api/products`;
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingProductId ? 'Product updated successfully' : 'Product created successfully');
        setIsProductModalOpen(false);
        fetchAdminData();
      } else {
        showToast(data.message || 'Operation failed', 'error');
      }
    } catch {
      showToast('Error saving product', 'error');
    }
  };

  // Archive Product
  const handleArchiveProduct = async (id) => {
    if (!confirm('Archive this product? It will be hidden from buyers.')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/${id}/archive`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product archived');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to archive product', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prodId) => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Product permanently deleted');
        fetchAdminData();
      } else {
        showToast(data.message || 'Failed to delete product', 'error');
      }
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  // Image Management in Modal
  const [uploadingFile, setUploadingFile] = useState(false);

  // Paste & Buy Verification Modal state
  const [verifyModalReq, setVerifyModalReq] = useState(null);
  const [verifyQuotedGHS, setVerifyQuotedGHS] = useState('');
  const [verifyDepositGHS, setVerifyDepositGHS] = useState('');
  const [verifyStatus, setVerifyStatus] = useState('Approved');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyWeight, setVerifyWeight] = useState('');
  const [verifyUpdating, setVerifyUpdating] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5 MB', 'error');
      return;
    }

    setUploadingFile(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/upload-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            dataUrl: reader.result,
            filename: file.name
          })
        });
        const data = await res.json();
        if (res.ok && data.success && data.url && !data.url.startsWith('data:image/')) {
          setProdForm(prev => ({
            ...prev,
            images: [...prev.images, data.url],
            imageColors: (() => {
              const imageColors = [...(prev.imageColors || [])];
              while (imageColors.length < prev.images.length) imageColors.push('');
              imageColors.push(prev.colors.split(',').map(color => color.trim()).filter(Boolean)[0] || '');
              return imageColors;
            })()
          }));
          showToast('Image uploaded and preview ready!');
        } else {
          showToast(data.message || 'Image could not be stored. Check Supabase storage and try again.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Image upload failed. Check your connection and try again.', 'error');
      } finally {
        setUploadingFile(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      showToast('Failed to read image file', 'error');
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  // Open Verify Request Modal
  const openVerifyRequest = (req) => {
    setVerifyModalReq(req);
    setVerifyQuotedGHS(req.quotedPriceGHS || '');
    setVerifyDepositGHS(req.depositRequiredGHS || Math.round((req.quotedPriceGHS || 0) * 0.5));
    setVerifyStatus(req.status === 'Pending Review' ? 'Approved' : req.status);
    setVerifyNotes(req.adminNotes || '');
    setVerifyWeight(req.itemWeightKg || '1.0');
  };

  // Save Verify Request Action
  const handleSaveVerification = async (isApproved = true) => {
    if (!verifyModalReq) return;
    setVerifyUpdating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/requests/${verifyModalReq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: isApproved ? verifyStatus : 'Rejected',
          quotedPriceGHS: Number(verifyQuotedGHS),
          depositRequiredGHS: Number(verifyDepositGHS),
          adminNotes: verifyNotes,
          itemWeightKg: Number(verifyWeight),
          verified: isApproved
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(isApproved ? `Ticket #${verifyModalReq.requestNumber} verified & approved!` : `Ticket #${verifyModalReq.requestNumber} rejected`);
        setVerifyModalReq(null);
        fetchAdminData();
      } else {
        showToast(data.message || 'Verification update failed', 'error');
      }
    } catch {
      showToast('Network error during verification', 'error');
    } finally {
      setVerifyUpdating(false);
    }
  };

  const handleRemoveImage = (index) => {
    setProdForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageColors: (prev.imageColors || []).filter((_, i) => i !== index)
    }));
  };

  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setProdForm(prev => {
      const imgs = [...prev.images];
      const [chosen] = imgs.splice(index, 1);
      imgs.unshift(chosen);
      const imageColors = [...(prev.imageColors || [])];
      const [chosenColor] = imageColors.splice(index, 1);
      imageColors.unshift(chosenColor || '');
      return { ...prev, images: imgs, imageColors };
    });
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= prodForm.images.length) return;
    setProdForm(prev => {
      const imgs = [...prev.images];
      const [item] = imgs.splice(fromIndex, 1);
      imgs.splice(toIndex, 0, item);
      const imageColors = [...(prev.imageColors || [])];
      const [itemColor] = imageColors.splice(fromIndex, 1);
      imageColors.splice(toIndex, 0, itemColor || '');
      return { ...prev, images: imgs, imageColors };
    });
  };

  // Categories CRUD
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category created');
        setNewCatName('');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Category deleted');
      fetchAdminData();
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  // Banners CRUD
  const handleCreateBanner = async (e) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.image) {
      showToast('Banner title and image are required', 'error');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBanner)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Banner created');
        setNewBanner({ title: '', subtitle: '', ctaText: 'Shop Now', ctaUrl: '/', image: '' });
        fetchAdminData();
      }
    } catch {
      showToast('Failed to create banner', 'error');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Banner deleted');
      fetchAdminData();
    } catch {
      showToast('Failed to delete banner', 'error');
    }
  };

  // Shipping Rates Save
  const handleSaveShippingRates = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/shipping-rates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(shippingRates)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Shipping rate logic updated');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update shipping rates', 'error');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen py-24 text-center space-y-4">
        <h2 className="text-2xl font-black text-black dark:text-white">Admin Privileges Required</h2>
        <p className="text-xs text-zinc-500">
          You must be logged in as an administrator.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  // Filtered products list
  const filteredProducts = products.filter(p => {
    if (productCategoryFilter !== 'All' && p.category !== productCategoryFilter) return false;
    if (productStatusFilter !== 'all') {
      const vis = p.visibility || 'published';
      if (vis !== productStatusFilter) return false;
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q));
    }
    return true;
  });

  // Sort filtered products
  if (productSort === 'price_asc') {
    filteredProducts.sort((a, b) => a.priceGHS - b.priceGHS);
  } else if (productSort === 'price_desc') {
    filteredProducts.sort((a, b) => b.priceGHS - a.priceGHS);
  } else if (productSort === 'name') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * productsPerPage,
    productPage * productsPerPage
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] py-10">
      {/* Toast Alert */}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border transition ${
            toast.type === 'error'
              ? 'bg-red-950 text-red-200 border-red-800'
              : 'bg-zinc-950 text-white border-zinc-800'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black">
                ADMIN CONTROL CENTER
              </span>
              {stats?.newOrders > 0 && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                  {stats.newOrders} NEW ORDER{stats.newOrders > 1 ? 'S' : ''}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black dark:text-white mt-1">
              EARLYCLAIM Operations
            </h1>
            <p className="text-xs text-zinc-500">
              Manage pre-orders, real-time alerts, product catalog, categories, banners, and rates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell mode="admin" />
            <button
              onClick={openCreateProduct}
              className="px-4 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
            <button
              onClick={fetchAdminData}
              className="p-2.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Refresh Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analytics KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Pre-Order Deposits</span>
            <p className="text-2xl font-black text-black dark:text-white">
              {formatPrice(stats?.totalRevenueGHS || 0)}
            </p>
            <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold">Verified revenue</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Pre-Orders</span>
              {stats?.newOrders > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black text-white dark:bg-white dark:text-black">
                  {stats.newOrders} unviewed
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-black dark:text-white">{stats?.totalOrders || 0}</p>
            <p className="text-[10px] text-zinc-500">{stats?.pendingOrders || 0} active</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Pending MoMo Verifications</span>
            <p className="text-2xl font-black text-black dark:text-white">{stats?.pendingPayments || 0}</p>
            <p className="text-[10px] text-zinc-500">Require staff sign-off</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Catalog Size</span>
            <p className="text-2xl font-black text-black dark:text-white">{stats?.totalProducts || 0}</p>
            <p className="text-[10px] text-zinc-500">{categories.length} active categories</p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto no-scrollbar gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <span>Pre-Orders ({orders.length})</span>
            {stats?.newOrders > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'products'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'categories'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'banners'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Banners ({banners.length})
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'shipping'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Shipping Rates
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'requests'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Paste & Buy ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'customers'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === 'audit'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Audit Log
          </button>
        </div>

        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                All pre-orders placed across Ghana. Status changes automatically notify the buyer.
              </span>
              {orders.some(o => !o.adminViewed) && (
                <button
                  onClick={handleMarkOrdersViewed}
                  className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Mark All Viewed
                </button>
              )}
            </div>

            {orders.map((o) => (
              <div
                key={o.id}
                className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border transition shadow-sm space-y-4 ${
                  !o.adminViewed
                    ? 'border-black dark:border-white ring-1 ring-black dark:ring-white'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">Order #{o.orderNumber}</span>
                      {!o.adminViewed && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-black text-white dark:bg-white dark:text-black">
                          NEW
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold uppercase text-zinc-600 dark:text-zinc-400">
                        {o.shippingMethod === 'sea' ? <Ship className="w-3 h-3" /> : <Plane className="w-3 h-3" />}
                        <span>{o.shippingMethod === 'sea' ? 'Sea' : 'Air'}</span>
                      </span>
                    </div>
                    <h4 className="font-black text-base text-black dark:text-white mt-0.5">{o.customerName} ({o.customerPhone})</h4>
                    <p className="text-xs text-zinc-500">
                      Destination: {o.shippingAddress?.street}, {o.shippingAddress?.city}, {o.shippingAddress?.region}
                    </p>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Manual MoMo Confirmation */}
                    {o.paymentStatus === 'pending_confirmation' && (
                      <button
                        onClick={() => handleConfirmPayment(o.id)}
                        className="px-3.5 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase"
                      >
                        Confirm MoMo
                      </button>
                    )}

                    {/* Edit Details */}
                    <button
                      onClick={() => {
                        setEditOrderModal(o);
                        setEditOrderTracking(o.trackingNumber || '');
                        setEditOrderNotes(o.adminNotes || '');
                        setEditOrderShippingMethod(o.shippingMethod || 'air');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold"
                    >
                      Edit Details
                    </button>

                    {/* Status Changer Trigger */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">Stage:</span>
                      <select
                        value={o.status}
                        onChange={(e) => promptStatusChange(o, e.target.value)}
                        className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
                      >
                        <option value="Pre-ordered">Pre-ordered</option>
                        <option value="Purchased">Purchased</option>
                        <option value="Shipped">Shipped</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Arrived">Arrived</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    <Link
                      to={`/tracking?query=${o.orderNumber}`}
                      className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                      title="View Customer Tracking Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Items */}
                  <div className="space-y-1">
                    {o.items?.map((it, idx) => (
                      <p key={idx} className="text-zinc-600 dark:text-zinc-400">
                        • <strong>{it.quantity}x {it.name}</strong> ({it.size}, {it.color})
                      </p>
                    ))}
                    {o.trackingNumber && (
                      <p className="text-[11px] font-mono text-zinc-500 pt-1">
                        Tracking No: <strong>{o.trackingNumber}</strong>
                      </p>
                    )}
                    {o.adminNotes && (
                      <p className="text-[11px] text-zinc-500 italic pt-1">
                        Notes: "{o.adminNotes}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <p className="text-zinc-500">Total: <strong className="text-black dark:text-white">{formatPrice(o.totalGHS, o.totalUSD)}</strong></p>
                    <p className="text-zinc-500">Deposit Paid: <strong className="text-green-600 dark:text-green-400">{formatPrice(o.depositPaidGHS)}</strong></p>
                    <p className="text-zinc-500">Method: <span className="uppercase font-bold">{o.shippingMethod === 'sea' ? 'Sea Freight' : 'Air Freight'}</span></p>
                    <p className="text-zinc-500">Payment: <span className="uppercase font-bold">{o.paymentMethod}</span> ({o.paymentStatus})</p>
                    {o.manualPaymentDetails && (
                      <p className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-lg inline-block">
                        TxID: {o.manualPaymentDetails.transactionId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Products Management (Search, Filter, Table, Pagination) */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="flex-1 max-w-sm relative">
                <input
                  type="text"
                  placeholder="Search products by title or brand..."
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-black dark:text-white focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => { setProductCategoryFilter(e.target.value); setProductPage(1); }}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                <select
                  value={productStatusFilter}
                  onChange={(e) => { setProductStatusFilter(e.target.value); setProductPage(1); }}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none"
                >
                  <option value="all">All Visibility</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>

                <select
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-xl px-3 py-2 text-black dark:text-white focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">Item</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Origin</th>
                      <th className="p-4">Price (GHS)</th>
                      <th className="p-4">Deposit</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-500">
                          {loading ? 'Loading products…' : 'No products found matching filters.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map(p => (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'}
                              alt=""
                              className="w-10 h-10 object-cover rounded-xl bg-zinc-100 dark:bg-zinc-800 flex-shrink-0"
                            />
                            <div>
                              <p className="font-bold text-black dark:text-white truncate max-w-xs">{p.name}</p>
                              <p className="text-[10px] text-zinc-400">{p.brand} • {p.subCategory || 'General'}</p>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-600 dark:text-zinc-400 font-medium">{p.category}</td>
                          <td className="p-4">
                            <ShipFromBadge countryCode={p.shipFromCountry || 'US'} />
                          </td>
                          <td className="p-4 font-black text-black dark:text-white">
                            {formatPrice(p.priceGHS, p.priceUSD)}
                          </td>
                          <td className="p-4 text-zinc-500">
                            {p.depositPercent || 50}%
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              p.visibility === 'published'
                                ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                                : p.visibility === 'draft'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}>
                              {p.visibility || 'published'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditProduct(p)}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                title="Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {p.visibility !== 'archived' && (
                                <button
                                  onClick={() => handleArchiveProduct(p.id)}
                                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-amber-600"
                                  title="Archive Product"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-500"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalProductPages > 1 && (
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">
                    Showing {(productPage - 1) * productsPerPage + 1}–{Math.min(productPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setProductPage(prev => Math.max(1, prev - 1))}
                      disabled={productPage === 1}
                      className="px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 disabled:opacity-30"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(num => (
                      <button
                        key={num}
                        onClick={() => setProductPage(num)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold ${
                          productPage === num
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => setProductPage(prev => Math.min(totalProductPages, prev + 1))}
                      disabled={productPage === totalProductPages}
                      className="px-3 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Categories Management */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="font-black uppercase text-sm text-black dark:text-white">Create New Category</h3>
              <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eyewear, Electronics"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs"
                >
                  Save Category
                </button>
              </form>
            </div>

            <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase text-zinc-400">
                Active Categories ({categories.length})
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {categories.map(cat => (
                  <div key={cat.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-black dark:text-white">{cat.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">slug: {cat.slug}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Homepage Banners */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="font-black uppercase text-sm text-black dark:text-white">Add Homepage Promo Banner</h3>
              <form onSubmit={handleCreateBanner} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Black Friday Sneaker Drop"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Subtitle</label>
                  <input
                    type="text"
                    placeholder="e.g. Sourced directly from US & London retailers"
                    value={newBanner.subtitle}
                    onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>
                {/* Add Photo by Upload */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition">
                      <ImageIcon className="w-4 h-4" />
                      <span>{uploadingFile ? 'Uploading...' : 'Upload Banner Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingFile(true);
                          const reader = new FileReader();
                          reader.onload = async () => {
                            try {
                              const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/products/upload-image`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ dataUrl: reader.result, filename: file.name })
                              });
                              const data = await res.json();
                              if (data.success) {
                                setNewBanner({ ...newBanner, image: data.url });
                                showToast('Banner image uploaded');
                              } else {
                                showToast('Failed to upload', 'error');
                              }
                            } catch {
                              showToast('Error uploading', 'error');
                            } finally {
                              setUploadingFile(false);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {newBanner.image && <p className="text-[10px] text-green-600">Image uploaded.</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Button Text</label>
                    <input
                      type="text"
                      placeholder="Shop Now"
                      value={newBanner.ctaText}
                      onChange={(e) => setNewBanner({ ...newBanner, ctaText: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Button Link</label>
                    <input
                      type="text"
                      placeholder="/"
                      value={newBanner.ctaUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, ctaUrl: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs"
                  >
                    Save Banner
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banners.map(b => (
                <div key={b.id} className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm aspect-[16/9] group">
                  <img src={b.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 p-6 flex flex-col justify-end text-white">
                    <h4 className="font-black text-lg">{b.title}</h4>
                    <p className="text-xs text-zinc-300 mt-0.5">{b.subtitle}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase">
                        {b.ctaText} → {b.ctaUrl}
                      </span>
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Shipping Rates Configuration */}
        {activeTab === 'shipping' && (
          <div className="max-w-2xl p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div>
              <h3 className="font-black uppercase text-sm text-black dark:text-white">Shipping Method & Rate Configuration</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Configure rates per kg for Air Freight and per CBM for Sea Freight. These directly power checkout calculations.
              </p>
            </div>

            <form onSubmit={handleSaveShippingRates} className="space-y-6 text-xs">
              {/* Air Freight Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-black dark:text-white" />
                  <h4 className="font-bold text-black dark:text-white uppercase">Air Freight</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Rate per Kg (GHS)</label>
                    <input
                      type="number"
                      value={shippingRates.air?.ratePerKg || ''}
                      onChange={(e) => setShippingRates({
                        ...shippingRates,
                        air: { ...shippingRates.air, ratePerKg: Number(e.target.value) }
                      })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Base Minimum (GHS)</label>
                    <input
                      type="number"
                      value={shippingRates.air?.minimumGHS || ''}
                      onChange={(e) => setShippingRates({
                        ...shippingRates,
                        air: { ...shippingRates.air, minimumGHS: Number(e.target.value) }
                      })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl text-black dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Estimated Lead Time Display</label>
                  <input
                    type="text"
                    value={shippingRates.air?.estimateWeeks || ''}
                    onChange={(e) => setShippingRates({
                      ...shippingRates,
                      air: { ...shippingRates.air, estimateWeeks: e.target.value }
                    })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl text-black dark:text-white"
                  />
                </div>
              </div>

              {/* Sea Freight Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-black dark:text-white" />
                  <h4 className="font-bold text-black dark:text-white uppercase">Sea Freight</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Rate per CBM (GHS)</label>
                    <input
                      type="number"
                      value={shippingRates.sea?.ratePerCBM || ''}
                      onChange={(e) => setShippingRates({
                        ...shippingRates,
                        sea: { ...shippingRates.sea, ratePerCBM: Number(e.target.value) }
                      })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Base Minimum (GHS)</label>
                    <input
                      type="number"
                      value={shippingRates.sea?.minimumGHS || ''}
                      onChange={(e) => setShippingRates({
                        ...shippingRates,
                        sea: { ...shippingRates.sea, minimumGHS: Number(e.target.value) }
                      })}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl text-black dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Estimated Lead Time Display</label>
                  <input
                    type="text"
                    value={shippingRates.sea?.estimateWeeks || ''}
                    onChange={(e) => setShippingRates({
                      ...shippingRates,
                      sea: { ...shippingRates.sea, estimateWeeks: e.target.value }
                    })}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl text-black dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs"
              >
                Save Shipping Rates
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: Paste & Buy Verification & Quotes */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-black text-sm uppercase text-black dark:text-white">
                  Customer Paste & Buy Verification Desk
                </h3>
                <p className="text-xs text-zinc-500">
                  Inspect customer links, verify item availability and authenticity, provide official quotes, and approve tickets.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold font-mono">
                {requests.filter(r => r.status === 'Pending Review' || !r.verified).length} Awaiting Verification
              </span>
            </div>

            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs">
                  No Paste & Buy requests submitted yet.
                </div>
              ) : (
                requests.map((r) => (
                  <div
                    key={r.id}
                    className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border transition shadow-sm space-y-4 ${
                      r.status === 'Pending Review' || !r.verified
                        ? 'border-black dark:border-white ring-1 ring-black dark:ring-white'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">Ticket #{r.requestNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            r.verified
                              ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {r.verified ? 'Verified & Approved' : 'Pending Verification'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] font-bold">
                            {r.status}
                          </span>
                        </div>
                        <h4 className="font-black text-base text-black dark:text-white mt-1">{r.productName}</h4>
                        <p className="text-xs text-zinc-500">
                          Customer: <strong className="text-black dark:text-white">{r.customerName}</strong> • Phone: <a href={`tel:${r.customerPhone}`} className="underline">{r.customerPhone}</a> • Email: {r.customerEmail}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openVerifyRequest(r)}
                          className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:opacity-90"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify & Quote Ticket</span>
                        </button>
                        <a
                          href={`https://wa.me/${r.customerPhone?.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(r.customerName)},%20this%20is%20EarlyClaim%20Ghana.%20Regarding%20your%20Paste%20%26%20Buy%20ticket%20%23${r.requestNumber}%20(${encodeURIComponent(r.productName)}):%20Total%20quote%20is%20GH₵${r.quotedPriceGHS}%20(50%25%20deposit:%20GH₵${r.depositRequiredGHS}).%20Link:%20${encodeURIComponent(r.url)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-95"
                          title="Contact Customer on WhatsApp"
                        >
                          <span>WhatsApp Quote</span>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Sourced Product Link</span>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 font-semibold underline break-all flex items-center gap-1 hover:opacity-80"
                          >
                            <span>{r.url}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          <strong>Category:</strong> {r.category} • <strong>Size:</strong> {r.size} • <strong>Color:</strong> {r.color}
                        </p>
                        {r.notes && (
                          <p className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 italic">
                            Customer Notes: "{r.notes}"
                          </p>
                        )}
                      </div>

                      <div className="space-y-1 sm:text-right">
                        <p className="text-zinc-500">
                          Target Budget: <strong className="text-black dark:text-white">${r.targetPriceUSD || 0} USD</strong>
                        </p>
                        <p className="text-zinc-500">
                          Official Quoted Price: <strong className="text-black dark:text-white text-sm">{formatPrice(r.quotedPriceGHS)}</strong>
                        </p>
                        <p className="text-zinc-500">
                          Deposit Required (50%): <strong className="text-green-600 dark:text-green-400">{formatPrice(r.depositRequiredGHS)}</strong>
                        </p>
                        {r.itemWeightKg && (
                          <p className="text-zinc-500">
                            Estimated Weight: <strong>{r.itemWeightKg} kg</strong>
                          </p>
                        )}
                        {r.adminNotes && (
                          <p className="text-[11px] text-zinc-500 italic pt-1">
                            Admin Remarks: "{r.adminNotes}"
                          </p>
                        )}
                        {r.verifiedAt && (
                          <p className="text-[10px] text-zinc-400 font-mono pt-1">
                            Verified on {new Date(r.verifiedAt).toLocaleString('en-GB')} by {r.verifiedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Customers */}
        {activeTab === 'customers' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase text-zinc-400">
              Registered Customers ({customers.length})
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {customers.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-black dark:text-white">{c.name}</p>
                    <p className="text-zinc-500">{c.email} • {c.phone || 'No phone'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-zinc-400">Ref: {c.referralCode}</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">Earned: {formatPrice(c.referralEarningsGHS || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Audit Log */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase text-zinc-400">
              Product & Change Audit Trail ({auditLogs.length} events)
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No audit events recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-400 uppercase font-bold">{log.action}</span>
                        <span className="font-semibold text-black dark:text-white">Product {log.productId}</span>
                      </div>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        Admin: {log.adminId} • Changes: {JSON.stringify(log.changes || {})}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono flex-shrink-0">
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Change Confirmation Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="text-base font-black uppercase text-black dark:text-white">
              Confirm Status Transition
            </h3>
            <p className="text-xs text-zinc-500">
              Order #{statusModalOrder.orderNumber} will transition from <strong>{statusModalOrder.status}</strong> to <strong>{targetStatus}</strong>.
              The buyer will receive an in-app alert and email notification automatically.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">
                  Custom Event Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared customs at KIA terminal 3"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={statusOverride}
                  onChange={(e) => setStatusOverride(e.target.checked)}
                  className="rounded"
                />
                <span className="text-zinc-600 dark:text-zinc-400">Admin Override (Allow backward transition)</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={executeStatusChange}
                disabled={statusUpdating === statusModalOrder.id}
                className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs"
              >
                {statusUpdating === statusModalOrder.id ? 'Updating...' : 'Confirm Transition'}
              </button>
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="px-5 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 font-bold uppercase text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Details Modal */}
      {editOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h3 className="text-base font-black uppercase text-black dark:text-white">
              Edit Order #{editOrderModal.orderNumber}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">
                  Airway Bill / Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. DHL-8392183921"
                  value={editOrderTracking}
                  onChange={(e) => setEditOrderTracking(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">
                  Shipping Method
                </label>
                <select
                  value={editOrderShippingMethod}
                  onChange={(e) => setEditOrderShippingMethod(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                >
                  <option value="air">Air Freight (~2–3 weeks)</option>
                  <option value="sea">Sea Freight (~6–8 weeks)</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Private notes for staff..."
                  value={editOrderNotes}
                  onChange={(e) => setEditOrderNotes(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveOrderEdits}
                className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs"
              >
                Save Details
              </button>
              <button
                type="button"
                onClick={() => setEditOrderModal(null)}
                className="px-5 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 font-bold uppercase text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Create / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-hidden">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overscroll-behavior-contain">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <h3 className="text-base font-black uppercase text-black dark:text-white">
                {editingProductId ? 'Edit Product Details' : 'Add New Product to Pre-Order'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Air Jordan 4 Retro Military Blue"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Nike / Jordan"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Category *</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({
                      ...prodForm,
                      category: e.target.value,
                      sizes: recommendedSizes(e.target.value).join(', ')
                    })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Price (GHS) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4850"
                    value={prodForm.priceGHS}
                    onChange={(e) => setProdForm({ ...prodForm, priceGHS: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">USD Reference (Optional)</label>
                  <input
                    type="number"
                    placeholder="Auto-calculated if blank"
                    value={prodForm.priceUSD}
                    onChange={(e) => setProdForm({ ...prodForm, priceUSD: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Deposit Percentage (%)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={prodForm.depositPercent}
                    onChange={(e) => setProdForm({ ...prodForm, depositPercent: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Ship-From Country</label>
                  <select
                    value={prodForm.shipFromCountry}
                    onChange={(e) => setProdForm({ ...prodForm, shipFromCountry: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  >
                    <option value="US">🇺🇸 United States</option>
                    <option value="GB">🇬🇧 United Kingdom</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="IT">🇮🇹 Italy</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Estimated Lead Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10–18 Days"
                    value={prodForm.estimatedDays}
                    onChange={(e) => setProdForm({ ...prodForm, estimatedDays: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Visibility</label>
                  <select
                    value={prodForm.visibility}
                    onChange={(e) => setProdForm({ ...prodForm, visibility: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Available Sizes (comma-separated)</label>
                  <input
                    type="text"
                    placeholder={recommendedSizes(prodForm.category).join(', ')}
                    value={prodForm.sizes}
                    onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                  <p className="mt-1 text-[9px] text-zinc-400">
                    {prodForm.category === 'Sneakers' ? 'Suggested EU sizes: 35–48.' : ['Jeans', 'Designer Brands'].includes(prodForm.category) ? 'Suggested clothing sizes: Small, Medium, Large, Extra Large.' : 'Enter each available size separated by a comma.'}
                  </p>
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Colors (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Red, White, Black"
                    value={prodForm.colors}
                    onChange={(e) => setProdForm({ ...prodForm, colors: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Product Description</label>
                  <textarea
                    rows={3}
                    placeholder="Item details, sourcing background, sizing advice..."
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>
              </div>

              {/* Image Manager: Multiple Photos, Primary Tag, Reorder */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-[10px] text-zinc-400">
                    Product Photos ({prodForm.images.length}) • First image is primary
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">Assign each photo a color. Customers will see the matching product photo when they choose that color.</p>

                {/* Thumbnails row with reorder controls */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {prodForm.images.map((img, idx) => (
                    <div key={idx} className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50 dark:bg-zinc-950 group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black text-white dark:bg-white dark:text-black">
                          PRIMARY
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-1 px-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="text-zinc-500 hover:text-black dark:hover:text-white underline"
                        >
                          {idx === 0 ? 'Primary' : 'Make Primary'}
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30"
                            title="Move left"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(idx, idx + 1)}
                            disabled={idx === prodForm.images.length - 1}
                            className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30"
                            title="Move right"
                          >
                            →
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="text-red-500 hover:text-red-700 ml-1"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <label className="block mt-2 px-1 text-[9px] font-bold uppercase text-zinc-400">
                        Photo color
                        <select
                          value={prodForm.imageColors?.[idx] || ''}
                          onChange={(e) => setProdForm(prev => {
                            const imageColors = [...(prev.imageColors || [])];
                            while (imageColors.length < prev.images.length) imageColors.push('');
                            imageColors[idx] = e.target.value;
                            return { ...prev, imageColors };
                          })}
                          className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-[10px] font-medium normal-case text-zinc-800 dark:text-zinc-200"
                        >
                          <option value="">All colors / general photo</option>
                          {prodForm.colors.split(',').map(color => color.trim()).filter(Boolean).map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Add Photo by Upload */}
                <div className="space-y-2">
                  {/* File Upload Button */}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition">
                      <ImageIcon className="w-4 h-4" />
                      <span>{uploadingFile ? 'Uploading File...' : 'Upload Image from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-zinc-400">
                      Supports JPG, PNG, WEBP (stored automatically)
                    </span>
                  </div>
                </div>
              </div>

              {/* P&B Request Image View */}
              {verifyModalReq && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="font-bold uppercase text-[10px] text-zinc-400">
                    Product Image
                  </span>
                  {verifyModalReq.imageUrl ? (
                    <img
                      src={verifyModalReq.imageUrl}
                      alt="Product"
                      className="w-full max-h-64 object-contain rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-center text-xs">
                      No image provided for this request.
                    </div>
                  )}
                </div>
              )}
            </form>

            <div className="flex gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              <button
                type="button"
                onClick={handleSaveProduct}
                className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs"
              >
                {editingProductId ? 'Update Product' : 'Save & Publish'}
              </button>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-5 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 font-bold uppercase text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify & Quote Paste & Buy Request Modal */}
      {verifyModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-hidden">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overscroll-behavior-contain">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">
                  Ticket #{verifyModalReq.requestNumber}
                </span>
                <h3 className="text-base font-black uppercase text-black dark:text-white">
                  Verify & Quote Paste & Buy Ticket
                </h3>
              </div>
              <button
                onClick={() => setVerifyModalReq(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <p className="font-bold text-black dark:text-white text-sm">{verifyModalReq.productName}</p>
                <p className="text-zinc-500">Customer: <strong>{verifyModalReq.customerName}</strong> ({verifyModalReq.customerPhone})</p>
                <p className="text-zinc-500">Requested Specs: {verifyModalReq.size} • {verifyModalReq.color}</p>
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-0.5">Customer Sourced Link</span>
                  <a
                    href={verifyModalReq.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-semibold underline break-all flex items-center gap-1"
                  >
                    <span>{verifyModalReq.url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">
                    Official Quoted Price (GHS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={verifyQuotedGHS}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVerifyQuotedGHS(val);
                      if (val) setVerifyDepositGHS(Math.round(Number(val) * 0.5));
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">
                    Deposit Required (50%)
                  </label>
                  <input
                    type="number"
                    value={verifyDepositGHS}
                    onChange={(e) => setVerifyDepositGHS(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">
                    Estimated Weight (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={verifyWeight}
                    onChange={(e) => setVerifyWeight(e.target.value)}
                    placeholder="1.0"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">
                    Ticket Status
                  </label>
                  <select
                    value={verifyStatus}
                    onChange={(e) => setVerifyStatus(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                  >
                    <option value="Approved">Approved & Quoted</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Paid">Deposit Paid</option>
                    <option value="Purchased">Purchased by Agent</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Arrived">Arrived in Accra</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">
                  Verification Notes & Instructions for Customer
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Verified genuine box and stock available from Tokyo agent. Freight booked via Air Cargo."
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleSaveVerification(true)}
                disabled={verifyUpdating}
                className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs hover:opacity-90 transition"
              >
                {verifyUpdating ? 'Saving...' : 'Verify & Approve Ticket'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveVerification(false)}
                disabled={verifyUpdating}
                className="px-4 py-3 rounded-full border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-bold uppercase text-xs hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
