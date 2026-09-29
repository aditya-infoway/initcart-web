// src/pages/customer/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { format } from 'date-fns';
import { toast, Toaster } from 'react-hot-toast';
import MobileOrdersPage from './mobile/MobileOrderPage';
import ProductReviewWidget from './Productreviewwidget';
import ReturnRequestModal from './ReturnRequestModal';

// Icons
import {
    HiOutlineSearch,
    HiOutlineRefresh,
    HiOutlineEye,
    HiOutlineTruck,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlineFilter,
    HiOutlineShoppingBag,
    HiOutlineHome,
    HiOutlineExclamationCircle,
    HiOutlineCreditCard,
    HiOutlineArrowRight
} from 'react-icons/hi';

import {
    FiPackage,
    FiTruck,
    FiCheckCircle,
    FiHome,
    FiShoppingBag,
    FiBox,
    FiRotateCcw,
    FiRefreshCw,
    FiXCircle,
    FiClock,
    FiAlertCircle
} from 'react-icons/fi';
import { FaUndoAlt, FaCartPlus } from 'react-icons/fa';

const OrdersPage = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const navigate = useNavigate();
    const { isAuthenticated, user, refreshAuth, loading: authLoading } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [retryCount, setRetryCount] = useState(0);
    const [returnMap, setReturnMap] = useState({});
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [activeReturnItem, setActiveReturnItem] = useState(null);

    const handleViewDetails = (productId) => {
        navigate(`/product/${productId}`);
    };
    const itemsPerPage = 8; // Increased from 5 → more orders per page

    // Status configuration
    const statusConfig = {
        'pending': {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            icon: <HiOutlineClock className="w-4 h-4" />,
            label: 'Pending'
        },
        'confirmed': {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            icon: <HiOutlineCheckCircle className="w-4 h-4" />,
            label: 'Confirmed'
        },
        'processing': {
            bg: 'bg-purple-100',
            text: 'text-purple-800',
            icon: <HiOutlineRefresh className="w-4 h-4" />,
            label: 'Processing'
        },
        'shipped': {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            icon: <FiTruck className="w-4 h-4" />,
            label: 'Shipped'
        },
        'delivered': {
            bg: 'bg-green-100',
            text: 'text-green-800',
            icon: <FiCheckCircle className="w-4 h-4" />,
            label: 'Delivered'
        },
        'cancelled': {
            bg: 'bg-red-100',
            text: 'text-red-800',
            icon: <HiOutlineXCircle className="w-4 h-4" />,
            label: 'Cancelled'
        },
        'refunded': {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            icon: <FiPackage className="w-4 h-4" />,
            label: 'Refunded'
        }
    };

    const checkAuth = useCallback(() => {
        if (authLoading) return null;
        const authenticated = isAuthenticated();
        if (!authenticated) {
            const refreshed = refreshAuth();
            if (refreshed) return true;
            return false;
        }
        return true;
    }, [authLoading, isAuthenticated, refreshAuth]);

    const fetchOrders = useCallback(async () => {
        if (authLoading) {
            setTimeout(() => fetchOrders(), 500);
            return;
        }
        const authCheck = checkAuth();
        if (authCheck === false) {
            toast.error('Please login to view orders');
            setTimeout(() => navigate('/customer/login'), 1500);
            return;
        }
        if (authCheck === null) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get('/api/public/orders/');
            if (response.data.success) {
                setOrders(response.data.data);
                setRetryCount(0);
            } else {
                throw new Error(response.data.message || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error('❌ Error:', err);
            if (err.response?.status === 401 && retryCount < 2) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => fetchOrders(), 1000);
                return;
            }
            setError(err.response?.data?.message || 'Failed to load orders');
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [authLoading, checkAuth, navigate, retryCount]);

    const fetchReturnRequests = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/api/ecommerce/public/returns/');
            if (res.data.success) {
                const map = {};
                res.data.data.forEach(rr => {
                    if (!map[rr.order_item] || rr.id > map[rr.order_item].id) {
                        map[rr.order_item] = rr;
                    }
                });
                setReturnMap(map);
            }
        } catch (err) {
            console.error('Error fetching return requests:', err);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            fetchOrders();
            fetchReturnRequests();
        }
    }, [authLoading, fetchOrders, fetchReturnRequests]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const getOrderItemImage = (item) => {
        if (item.product_details?.variant_image) {
            return `http://localhost:8000/${item.product_details.variant_image}`;
        }
        if (item.product_details?.main_image) {
            return `http://localhost:8000/${item.product_details.main_image}`;
        }
        return "https://placehold.co/300x300?text=No+Image";
    };

    const isReturnEligible = (order, item) => {
        if (item.item_status !== 'delivered' || !item.delivered_at) return false;
        const daysSince = (Date.now() - new Date(item.delivered_at).getTime()) / 86400000;
        if (daysSince > 7) return false;
        if (returnMap[item.id]) return false;
        return true;
    };

    const handleReturnClick = (order, item) => {
        setActiveReturnItem({ order, item });
        setReturnModalOpen(true);
    };

    const handleRequestAgain = async (returnId) => {
        try {
            const res = await axiosInstance.post(`/api/ecommerce/public/returns/${returnId}/request-again/`);
            if (res.data.success) {
                toast.success('Sent for review');
                fetchReturnRequests();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend request');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.billing_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.billing_phone?.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy');
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getReturnStatusMeta = (status) => {
        switch (status) {
            case 'requested':
                return {
                    icon: <FiClock className="w-3.5 h-3.5" />,
                    className: 'bg-amber-50 text-amber-700 border border-amber-200',
                    title: 'Return Requested — awaiting vendor review',
                };
            case 'approved':
                return {
                    icon: <FiCheckCircle className="w-3.5 h-3.5" />,
                    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                    title: 'Return Approved',
                };
            case 'vendor_rejected':
                return {
                    icon: <FiXCircle className="w-3.5 h-3.5" />,
                    className: 'bg-rose-50 text-rose-700 border border-rose-200',
                    title: 'Return Rejected by Vendor',
                };
            case 'pickup_scheduled':
                return {
                    icon: <FiTruck className="w-3.5 h-3.5" />,
                    className: 'bg-sky-50 text-sky-700 border border-sky-200',
                    title: 'Pickup Scheduled',
                };
            case 'picked_up':
                return {
                    icon: <FiBox className="w-3.5 h-3.5" />,
                    className: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
                    title: 'Item Picked Up',
                };
            case 'refunded':
                return {
                    icon: <FiRefreshCw className="w-3.5 h-3.5" />,
                    className: 'bg-gray-100 text-gray-700 border border-gray-200',
                    title: 'Refunded',
                };
            case 'completed':
                return {
                    icon: <FiCheckCircle className="w-3.5 h-3.5" />,
                    className: 'bg-green-50 text-green-700 border border-green-200',
                    title: 'Return Completed',
                };
            default:
                return {
                    icon: <FiAlertCircle className="w-3.5 h-3.5" />,
                    className: 'bg-gray-100 text-gray-700 border border-gray-200',
                    title: (status || '').replace('_', ' '),
                };
        }
    };

    const getStatusIconBadge = (status) => {
        const meta = statusConfig[status];
        if (!meta) {
            return {
                icon: <FiAlertCircle className="w-4 h-4" />,
                className: 'bg-gray-100 text-gray-700 border border-gray-200',
                title: (status || '').replace('_', ' '),
            };
        }
        return {
            icon: meta.icon,
            className: `${meta.bg} ${meta.text} border border-transparent`,
            title: meta.label,
        };
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }
    if (isMobile) {
        return <MobileOrdersPage />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-3">
            <Toaster />

            <div className="max-w-7xl mx-auto px-4 lg:px-8">

                {/* Compact Header */}
                <div className="mb-3 bg-white rounded-lg shadow-sm px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-bold text-gray-900">
                                My Orders
                            </h1>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {filteredOrders.length}
                            </span>
                            {user?.username && (
                                <span className="text-sm text-gray-500">
                                    • Welcome, {user.username}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchOrders}
                                disabled={loading}
                                title="Refresh orders"
                                aria-label="Refresh orders"
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50"
                            >
                                <HiOutlineRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                title="Shop more products"
                                aria-label="Shop more products"
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                                <FiShoppingBag className="h-4 w-4" />
                                <span>Shop More</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Compact Search & Filter */}
                <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-3">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by order number or product name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            title="Toggle filters"
                            aria-label="Toggle filters"
                            className={`px-4 py-2 rounded-lg transition ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'}`}
                        >
                            <HiOutlineFilter className="h-5 w-5" />
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    All Orders
                                </button>
                                {Object.keys(statusConfig).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        title={statusConfig[status].label}
                                        aria-label={statusConfig[status].label}
                                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition ${statusFilter === status
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {statusConfig[status].icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiOutlineExclamationCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={fetchOrders}
                            title="Try again"
                            aria-label="Try again"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <HiOutlineRefresh className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <FiPackage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter'
                                : 'You haven\'t placed any orders yet'}
                        </p>
                        <button
                            onClick={() => navigate('/productlist')}
                            title="Start shopping"
                            aria-label="Start shopping"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <FiHome className="h-5 w-5" />
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2.5">
                            {paginatedOrders.map((order) => {
                                const orderStatusBadge = getStatusIconBadge(order.order_status);
                                const deliveryDate = formatDate(new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 7)));

                                return (
                                    <div key={order.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden">

                                        {/* Compact Order Header — single row */}
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-gray-500">Order</span>
                                                    <span className="font-semibold text-gray-900">#{order.order_number}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-gray-500">Placed</span>
                                                    <span className="font-medium text-gray-700">{formatDate(order.created_at)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-gray-500">Total</span>
                                                    <span className="font-semibold text-blue-600">{formatCurrency(order.final_amount)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-gray-500">Ship to</span>
                                                    <span className="font-medium text-gray-700">{order.billing_name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <HiOutlineTruck className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-gray-500">By {deliveryDate}</span>
                                                </div>
                                                <div className="ml-auto flex items-center gap-2">
                                                    <span
                                                        title={`Payment: ${order.payment_status}`}
                                                        aria-label={`Payment: ${order.payment_status}`}
                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600"
                                                    >
                                                        <HiOutlineCreditCard className="w-4 h-4" />
                                                    </span>
                                                    <span
                                                        title={orderStatusBadge.title}
                                                        aria-label={orderStatusBadge.title}
                                                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${orderStatusBadge.className}`}
                                                    >
                                                        {orderStatusBadge.icon}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items — compact grid, 2 columns on xl */}
                                        <div className="p-3">
                                            <div className={`grid gap-2 ${order.items?.length > 1 ? 'xl:grid-cols-2' : 'grid-cols-1'}`}>
                                                {order.items && order.items.length > 0 ? (
                                                    order.items.map((item) => {
                                                        const returnReq = returnMap[item.id];
                                                        const returnMeta = returnReq ? getReturnStatusMeta(returnReq.status) : null;
                                                        const itemStatusBadge = getStatusIconBadge(item.item_status);

                                                        const isReturnActive = !!returnReq;
                                                        const isRefunded = item.item_status === 'refunded' || returnReq?.status === 'refunded' || returnReq?.status === 'completed';
                                                        const showRedCard = isReturnActive || isRefunded;

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                className={`flex gap-3 p-3 rounded-lg border transition ${showRedCard
                                                                    ? 'bg-red-50/60 border-red-200 border-l-4 border-l-red-500'
                                                                    : 'bg-white border-gray-100'
                                                                    }`}
                                                            >
                                                                {/* Product Image */}
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                                                                        <img
                                                                            loading="lazy"
                                                                            src={getOrderItemImage(item)}
                                                                            alt={item.product_name}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                e.target.onerror = null;
                                                                                e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Product Details */}
                                                                <div className="flex-1 min-w-0 flex flex-col">
                                                                    {/* Return label */}
                                                                    {showRedCard && (
                                                                        <div className="flex items-center gap-1.5 mb-1">
                                                                            <FaUndoAlt className="w-3 h-3 text-red-600" />
                                                                            <span className="text-[11px] font-bold tracking-wide text-red-600 uppercase">
                                                                                {isRefunded ? 'Refunded' : 'Return / Refund'}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {/* Name + price inline */}
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="min-w-0 flex-1">
                                                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                                {item.product_name}
                                                                            </h4>
                                                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                                                {item.vendor_details?.business_name || 'Unknown Vendor'}
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right flex-shrink-0">
                                                                            <p className={`text-sm font-semibold ${showRedCard ? 'text-red-600' : 'text-blue-600'}`}>
                                                                                {formatCurrency(item.total_price)}
                                                                            </p>
                                                                            <p className="text-[11px] text-gray-400">
                                                                                {formatCurrency(item.unit_price)} each
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Attributes + status badges in one row */}
                                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                                        <span className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                                            SKU: {item.sku}
                                                                        </span>
                                                                        {item.color && (
                                                                            <span className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                                                {item.color}
                                                                            </span>
                                                                        )}
                                                                        {item.size && (
                                                                            <span className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                                                {item.size}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                                                            Qty: {item.quantity}
                                                                        </span>
                                                                        <span
                                                                            title={itemStatusBadge.title}
                                                                            aria-label={itemStatusBadge.title}
                                                                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${itemStatusBadge.className}`}
                                                                        >
                                                                            {itemStatusBadge.icon}
                                                                        </span>
                                                                        {returnReq && returnMeta && (
                                                                            <span
                                                                                title={returnMeta.title}
                                                                                aria-label={returnMeta.title}
                                                                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${returnMeta.className}`}
                                                                            >
                                                                                {returnMeta.icon}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Actions + Review row */}
                                                                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <button
                                                                                onClick={() => handleViewDetails(item.product)}
                                                                                title="Buy again"
                                                                                aria-label="Buy again"
                                                                                className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition"
                                                                            >
                                                                                <FaCartPlus className="w-3.5 h-3.5" />
                                                                            </button>

                                                                            {isReturnEligible(order, item) && (
                                                                                <button
                                                                                    onClick={() => handleReturnClick(order, item)}
                                                                                    title="Return this item (within 7 days of delivery)"
                                                                                    aria-label="Return this item"
                                                                                    className="inline-flex items-center justify-center w-8 h-8 border border-red-300 bg-white text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                                >
                                                                                    <FaUndoAlt className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            )}

                                                                            {returnReq?.status === 'vendor_rejected' && (
                                                                                <button
                                                                                    onClick={() => handleRequestAgain(returnReq.id)}
                                                                                    title="Request return again — your previous request was rejected"
                                                                                    aria-label="Request return again"
                                                                                    className="inline-flex items-center justify-center w-8 h-8 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-lg transition"
                                                                                >
                                                                                    <FiRefreshCw className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            )}

                                                                            {/* Order level actions */}
                                                                            <button
                                                                                onClick={() => navigate(`/order/${order.order_number}`)}
                                                                                title="View order details"
                                                                                aria-label="View order details"
                                                                                className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                                                                            >
                                                                                <HiOutlineEye className="h-3.5 w-3.5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => navigate(`/trackOrder/${order.order_number}`)}
                                                                                title="Track order"
                                                                                aria-label="Track order"
                                                                                className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                                                            >
                                                                                <HiOutlineTruck className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        </div>

                                                                        <div className="flex-shrink-0">
                                                                            <ProductReviewWidget
                                                                                productId={item.product}
                                                                                productName={item.product_name}
                                                                                orderStatus={order.order_status}
                                                                                orderItemId={item.id}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-center py-4">
                                                        <FiBox className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-500">No items found in this order</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-3 bg-white rounded-lg shadow-sm px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        title="Previous page"
                                        aria-label="Previous page"
                                        className="inline-flex items-center justify-center w-9 h-9 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        <HiOutlineArrowRight className="h-4 w-4 rotate-180" />
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        title="Next page"
                                        aria-label="Next page"
                                        className="inline-flex items-center justify-center w-9 h-9 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        <HiOutlineArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Return modal */}
                {returnModalOpen && activeReturnItem && (
                    <ReturnRequestModal
                        item={activeReturnItem.item}
                        onClose={() => setReturnModalOpen(false)}
                        onSuccess={() => {
                            setReturnModalOpen(false);
                            fetchReturnRequests();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default OrdersPage;