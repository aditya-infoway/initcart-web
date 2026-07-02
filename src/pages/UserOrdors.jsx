// src/pages/customer/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { format } from 'date-fns';
import { toast, Toaster } from 'react-hot-toast';
import MobileOrdersPage from './mobile/MobileOrderPage';
import ProductReviewWidget from './Productreviewwidget';

// Icons
import {
    HiOutlineShoppingBag,
    HiOutlineSearch,
    HiOutlineRefresh,
    HiOutlineEye,
    HiOutlineCalendar,
    HiOutlineTruck,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlineFilter,
    HiOutlineShoppingCart,
    HiOutlineHome,
    HiOutlineCube,
    HiOutlineExclamationCircle,
    HiOutlineStar,
    HiOutlineLocationMarker,
    HiOutlineCreditCard,
    HiOutlineDownload,
    HiOutlineArrowRight
} from 'react-icons/hi';

import {
    FiPackage,
    FiTruck,
    FiCheckCircle,
    FiHome,
    FiShoppingBag,
    FiUser,
    FiMapPin,
    FiCreditCard,
    FiBox,
    FiArrowLeft
} from 'react-icons/fi';

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
    const handleViewDetails = (productId) => {
        navigate(`/product/${productId}`);
    };
    const itemsPerPage = 5;

    // Status configuration
    const statusConfig = {
        'pending': {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            icon: <HiOutlineClock className="w-3 h-3 sm:w-4 sm:h-4" />,
            label: 'Pending'
        },
        'confirmed': {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            icon: <HiOutlineCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
            label: 'Confirmed'
        },
        'processing': {
            bg: 'bg-purple-100',
            text: 'text-purple-800',
            icon: <HiOutlineRefresh className="w-3 h-3 sm:w-4 sm:h-4" />,
            label: 'Processing'
        },
        'shipped': {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            icon: <FiTruck className="w-3 h-3 sm:w-4 sm:h-4" />,
            label: 'Shipped'
        },
        'delivered': {
            bg: 'bg-green-100',
            text: 'text-green-800',
            icon: <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
            label: 'Delivered'
        },
        'cancelled': {
            bg: 'bg-red-100',
            text: 'text-red-800',
            icon: <HiOutlineXCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
            label: 'Cancelled'
        },
        'refunded': {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            icon: <FiPackage className="w-3 h-3 sm:w-4 sm:h-4" />,
            label: 'Refunded'
        }
    };

    // Check authentication
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

    // Fetch all orders
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
    }, [authLoading, checkAuth, navigate]);

    useEffect(() => {
        if (!authLoading) {
            fetchOrders();
        }
    }, [authLoading]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);
    const getOrderItemImage = (item) => {
        if (item.product_details?.variant_image) {
            return `https://api.initcart.in${item.product_details.variant_image}`;
        }

        if (item.product_details?.main_image) {
            return `https://api.initcart.in${item.product_details.main_image}`;
        }

        return "https://placehold.co/300x300?text=No+Image";
    };
    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.billing_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.billing_phone?.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Format functions
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
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <Toaster />

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

                {/* Header */}
                <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                My Orders ({filteredOrders.length})
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {user?.username ? `Welcome back, ${user.username}!` : 'View and track your orders'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchOrders}
                                disabled={loading}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50"
                            >
                                <HiOutlineRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                                <FiShoppingBag className="h-4 w-4" />
                                <span className="hidden sm:inline">Shop More</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
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
                            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                        >
                            <HiOutlineFilter className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
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
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === status
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {statusConfig[status].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiOutlineExclamationCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={fetchOrders}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <HiOutlineRefresh className="h-4 w-4" />
                            Try Again
                        </button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FiPackage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter'
                                : 'You haven\'t placed any orders yet'}
                        </p>
                        <button
                            onClick={() => navigate('/productlist')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <FiHome className="h-5 w-5" />
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {paginatedOrders.map((order) => (
                                <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden">

                                    {/* Order Header - Amazon/Flipkart Style */}
                                    <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                                                <div>
                                                    <span className="text-xs text-gray-500">ORDER PLACED</span>
                                                    <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                                                </div>
                                                <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                                                <div>
                                                    <span className="text-xs text-gray-500">TOTAL</span>
                                                    <p className="text-sm font-medium text-blue-600">{formatCurrency(order.final_amount)}</p>
                                                </div>
                                                <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                                                <div>
                                                    <span className="text-xs text-gray-500">SHIP TO</span>
                                                    <p className="text-sm font-medium">{order.billing_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500">Order #{order.order_number}</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.order_status]?.bg} ${statusConfig[order.order_status]?.text}`}>
                                                    {statusConfig[order.order_status]?.icon}
                                                    {statusConfig[order.order_status]?.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items - Multiple Products Display */}
                                    <div className="p-4 sm:p-6">
                                        {/* Status & Delivery Info */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.order_status]?.bg} ${statusConfig[order.order_status]?.text}`}>
                                                    {statusConfig[order.order_status]?.icon}
                                                    {statusConfig[order.order_status]?.label}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                                    <HiOutlineCreditCard className="w-3 h-3" />
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <HiOutlineTruck className="w-4 h-4" />
                                                <span>Delivery expected by {formatDate(new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 7)))}</span>
                                            </div>
                                        </div>

                                        {/* ALL Products List - This shows ALL items in the order */}
                                        <div className="space-y-4">
                                            {order.items && order.items.length > 0 ? (
                                                order.items.map((item, index) => (
                                                    <div key={item.id} className="flex gap-3 sm:gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                                                        {/* Product Image */}
                                                        <div className="flex-shrink-0">
                                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
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

                                                        {/* Product Details + Review (right side) */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                                {/* Left: product info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-sm sm:text-base font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                                                                        {item.product_name}
                                                                    </h4>
                                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                                        Sold by: {item.vendor_details?.business_name || 'Unknown Vendor'}
                                                                    </p>

                                                                    {/* Product Attributes */}
                                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                            SKU: {item.sku}
                                                                        </span>
                                                                        {item.color && (
                                                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                                Color: {item.color}
                                                                            </span>
                                                                        )}
                                                                        {item.size && (
                                                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                                Size: {item.size}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                            Qty: {item.quantity}
                                                                        </span>
                                                                    </div>

                                                                    {/* Action Buttons */}
                                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                                        <button
                                                                            onClick={() => handleViewDetails(item.product)}
                                                                            className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-medium transition"
                                                                        >
                                                                            Buy Again
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* Right: price + collapsible review widget */}
                                                                <div className="flex flex-col items-end gap-2 sm:w-64 flex-shrink-0">
                                                                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                                                        <span className="text-sm font-medium text-blue-600">
                                                                            {formatCurrency(item.total_price)}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">
                                                                            {formatCurrency(item.unit_price)} each
                                                                        </span>
                                                                    </div>

                                                                    {/* ⭐ Review widget — sirf delivered order pe dikhega */}
                                                                    <div className="w-full">
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
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6">
                                                    <FiBox className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">No items found in this order</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Actions */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => navigate(`/order/${order.order_number}`)}
                                                className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                                            >
                                                <HiOutlineEye className="h-4 w-4" />
                                                View Order Details
                                            </button>
                                            <button
                                                onClick={() => navigate(`/trackOrder/${order.order_number}`)}
                                                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                                                <HiOutlineTruck className="h-4 w-4" />
                                                Track Order
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        <HiOutlineArrowRight className="h-4 w-4 rotate-180" />
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        Next
                                        <HiOutlineArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;