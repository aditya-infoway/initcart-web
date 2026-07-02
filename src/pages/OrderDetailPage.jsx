// src/pages/customer/OrderDetailsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from "html2canvas";
import { toast, Toaster } from 'react-hot-toast';
import MobileOrderDetailsPage from './mobile/MobileOrderDetailPage';

// Icons
import {
    HiOutlineShoppingBag,
    HiOutlineLocationMarker,
    HiOutlineUser,
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineCalendar,
    HiOutlineCreditCard,
    HiOutlineTruck,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlineDownload,
    HiOutlineArrowLeft,
    HiOutlinePrinter,
    HiOutlineCurrencyRupee,
    HiOutlineStar,
    HiOutlineTag,
    HiOutlineCube,
    HiOutlineDocumentText,
    HiOutlinePhotograph,
    HiOutlineExclamationCircle,
    HiOutlineRefresh
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
    FiDownload,
    FiArrowLeft,
    FiBox
} from 'react-icons/fi';

const getItemImage = (item) => {
    const imagePath =
        item.product_details?.variant_image ||
        item.product_details?.main_image;

    if (!imagePath) return null;

    if (imagePath.startsWith("http")) return imagePath;

    return `https://api.initcart.in${imagePath}`;
};

const OrderDetailsPage = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const { orderNumber } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, refreshAuth, loading: authLoading } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Status configuration
    const statusConfig = {
        'pending': {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            icon: <HiOutlineClock className="w-5 h-5" />,
            label: 'Pending',
            border: 'border-yellow-200'
        },
        'confirmed': {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            icon: <HiOutlineCheckCircle className="w-5 h-5" />,
            label: 'Confirmed',
            border: 'border-blue-200'
        },
        'processing': {
            bg: 'bg-purple-100',
            text: 'text-purple-800',
            icon: <HiOutlineShoppingBag className="w-5 h-5" />,
            label: 'Processing',
            border: 'border-purple-200'
        },
        'shipped': {
            bg: 'bg-indigo-100',
            text: 'text-indigo-800',
            icon: <FiTruck className="w-5 h-5" />,
            label: 'Shipped',
            border: 'border-indigo-200'
        },
        'delivered': {
            bg: 'bg-green-100',
            text: 'text-green-800',
            icon: <FiCheckCircle className="w-5 h-5" />,
            label: 'Delivered',
            border: 'border-green-200'
        },
        'cancelled': {
            bg: 'bg-red-100',
            text: 'text-red-800',
            icon: <HiOutlineXCircle className="w-5 h-5" />,
            label: 'Cancelled',
            border: 'border-red-200'
        },
        'refunded': {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            icon: <HiOutlineCurrencyRupee className="w-5 h-5" />,
            label: 'Refunded',
            border: 'border-gray-200'
        }
    };

    const paymentStatusConfig = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'failed': 'bg-red-100 text-red-800',
        'refunded': 'bg-gray-100 text-gray-800'
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

    // Fetch order details
    const fetchOrderDetails = useCallback(async () => {
        if (authLoading) {
            setTimeout(() => fetchOrderDetails(), 500);
            return;
        }

        const authCheck = checkAuth();
        if (authCheck === false) {
            toast.error('Please login to view order details');
            setTimeout(() => navigate('/customer/login'), 1500);
            return;
        }
        if (authCheck === null) return;

        setLoading(true);
        setError(null);

        try {


            const response = await axiosInstance.get('/api/public/orders/detail/', {
                params: { order_number: orderNumber }
            });



            if (response.data.success) {
                setOrder(response.data.data);
                setRetryCount(0);
            } else {
                throw new Error(response.data.message || 'Order not found');
            }
        } catch (err) {
            console.error('❌ Error:', err);

            if (err.response?.status === 401 && retryCount < 2) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => fetchOrderDetails(), 1000);
                return;
            }

            setError(err.response?.data?.message || 'Failed to load order details');
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    }, [orderNumber, authLoading, checkAuth, retryCount, navigate]);

    useEffect(() => {
        if (orderNumber) {
            fetchOrderDetails();
        }
    }, [orderNumber, fetchOrderDetails]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Format functions
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy');
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString) => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Generate PDF Invoice - FIXED: Pure HTML string without any CSS gradients
    const generateInvoice = () => {
        if (!order) return;

        const invoiceWindow = window.open('', '_blank');

        const invoiceHTML = `
    <html>
    <head>
        <title>Invoice - ${order.order_number}</title>

        <style>
        body{
            font-family: Arial, sans-serif;
            padding:30px;
            font-size:14px;
            color:#333;
        }

        h1,h2,h3{
            margin:0;
        }

        .header{
            display:flex;
            justify-content:space-between;
            margin-bottom:25px;
        }

        .company{
            text-align:right;
        }

        .address-row{
            display:flex;
            justify-content:space-between;
            gap:40px;
            margin-bottom:25px;
        }

        .address-box{
            width:48%;
            background:#f9f9f9;
            padding:15px;
            border-radius:6px;
        }

        .address-box h3{
            margin-bottom:10px;
            border-bottom:1px solid #ddd;
            padding-bottom:5px;
        }

        table{
            width:100%;
            border-collapse:collapse;
            margin-top:15px;
        }

        th,td{
            border:1px solid #ddd;
            padding:8px;
            text-align:left;
        }

        th{
            background:#f4f4f4;
        }

        .totals{
            width:350px;
            margin-top:20px;
            margin-left:auto;
        }

        .totals div{
            display:flex;
            justify-content:space-between;
            padding:6px 0;
        }

        .grand-total{
            font-weight:bold;
            font-size:16px;
            border-top:2px solid #000;
            padding-top:8px;
        }

        .footer{
            margin-top:40px;
            text-align:center;
            font-size:12px;
            color:#666;
        }
        </style>
    </head>

    <body>

    <div class="header">

        <div>
            <h1>INVOICE</h1>
            <p><strong>Order #:</strong> ${order.order_number}</p>
            <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
        </div>

        <div class="company">
            <h2>InitCart Pvt Ltd</h2>
            <p>Junagadh, Gujarat</p>
            <p>Email: support@initcart.in</p>
        </div>

    </div>


    <div class="address-row">

        <div class="address-box">
            <h3>Billing Address</h3>
            <p><strong>${order.billing_name}</strong></p>
            <p>${order.billing_address}</p>
            <p>${order.billing_city}, ${order.billing_state} - ${order.billing_pincode}</p>
            <p>Phone: ${order.billing_phone}</p>
            <p>Email: ${order.billing_email}</p>
        </div>

        <div class="address-box">
            <h3>Shipping Address</h3>
            <p><strong>${order.shipping_name || order.billing_name}</strong></p>
            <p>${order.shipping_address || order.billing_address}</p>
            <p>${order.shipping_city || order.billing_city}, ${order.shipping_state || order.billing_state} - ${order.shipping_pincode || order.billing_pincode}</p>
            <p>Phone: ${order.shipping_phone || order.billing_phone}</p>
        </div>

    </div>


    <h3>Order Items</h3>
    <table>
        <thead>
        <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Tax</th>
            <th>Unit Price(Tax Included)</th>
            <th>Total</th>
        </tr>
        </thead>

        <tbody>
        ${order.items?.map(item => `
            <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>${item.tax}%</td>
                <td>₹${parseFloat(item.unit_price).toFixed(2)}</td>
                <td>₹${parseFloat(item.total_price).toFixed(2)}</td>
            </tr>
        `).join('')}

        </tbody>
    </table>


    <div class="totals">

        <div>
            <span>Subtotal:</span>
            <span>₹${parseFloat(order.total_amount).toFixed(2)}</span>
        </div>

        <div>
            <span>Shipping:</span>
            <span>${order.shipping_charge == 0 ? 'FREE' : `₹${parseFloat(order.shipping_charge).toFixed(2)}`}</span>
        </div>

        ${order.discount_amount > 0 ? `
        <div>
            <span>Discount:</span>
            <span>-₹${parseFloat(order.discount_amount).toFixed(2)}</span>
        </div>
        ` : ''}

        <div class="grand-total">
            <span>Total:</span>
            <span>₹${parseFloat(order.final_amount).toFixed(2)}</span>
        </div>

    </div>


    <div class="footer">
        <p>This is a computer generated invoice.</p>
        <p>Thank you for shopping with InitCart!</p>
    </div>


    </body>
    </html>
    `;

        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();

        setTimeout(() => {
            invoiceWindow.print();
        }, 500);
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
        return <MobileOrderDetailsPage />;
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlineExclamationCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/orders')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                    >
                        <FiArrowLeft className="h-5 w-5" />
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header with back button */}
                <div className="mb-6 flex items-center justify-between no-print">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <FiArrowLeft className="h-5 w-5" />
                        <span>Back to Orders</span>
                    </button>

                    <div className="flex items-center gap-3">

                        <button
                            onClick={generateInvoice}
                            disabled={generatingPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <HiOutlineDownload className="h-5 w-5" />
                            <span className="hidden sm:inline">{generatingPDF ? 'Generating...' : 'Download Invoice'}</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="invoice-container bg-white rounded-2xl shadow-xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-blue-600 px-8 py-6 text-white">
                        <div className="flex flex-wrap items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">ORDER DETAILS</h1>
                                <p className="text-blue-100">Order #{order.order_number}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100">Date: {formatDateTime(order.created_at)}</p>
                                <p className="text-blue-100 text-2xl font-bold mt-2">{formatCurrency(order.final_amount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Badges */}
                    <div className="px-8 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig[order.order_status]?.bg} ${statusConfig[order.order_status]?.text}`}>
                            {statusConfig[order.order_status]?.icon}
                            {statusConfig[order.order_status]?.label}
                        </span>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${paymentStatusConfig[order.payment_status]}`}>
                            <HiOutlineCreditCard className="w-4 h-4" />
                            Payment: {order.payment_status}
                        </span>
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                            <HiOutlineTag className="w-4 h-4" />
                            {order.payment_method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
                        </span>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 border-b border-gray-200">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiUser className="h-5 w-5 text-blue-600" />
                                Customer Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <HiOutlineUser className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{order.billing_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <HiOutlineMail className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{order.billing_email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <HiOutlinePhone className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{order.billing_phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiMapPin className="h-5 w-5 text-blue-600" />
                                Shipping Address
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <p className="font-medium">{order.shipping_name || order.billing_name}</p>
                                <p className="text-gray-600 mt-1">{order.shipping_address || order.billing_address}</p>
                                <p className="text-gray-600">{order.shipping_city || order.billing_city}, {order.shipping_state || order.billing_state}</p>
                                <p className="text-gray-600">Pincode: {order.shipping_pincode || order.billing_pincode}</p>
                                <p className="text-gray-600 mt-2">Phone: {order.shipping_phone || order.billing_phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-8 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FiShoppingBag className="h-5 w-5 text-blue-600" />
                            Order Items ({order.items?.length || 0})
                        </h3>

                        {order.items && order.items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {order.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {(item.product_details?.variant_image || item.product_details?.main_image) ? (
                                                            <img
                                                                src={`https://api.initcart.in${item.product_details?.variant_image ||
                                                                    item.product_details?.main_image
                                                                    }`}
                                                                alt={item.product_name}
                                                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <FiBox className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-gray-900">{item.product_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-600">{item.vendor_details?.business_name || 'N/A'}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-mono text-gray-500">{item.sku}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm text-gray-600">
                                                        {item.color && <div>Color: {item.color}</div>}
                                                        {item.size && <div>Size: {item.size}</div>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right">{item.quantity}</td>
                                                <td className="px-4 py-4 text-right">{formatCurrency(item.unit_price)}</td>
                                                <td className="px-4 py-4 text-right font-medium text-blue-600">{formatCurrency(item.total_price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <FiBox className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No items found in this order</p>
                            </div>
                        )}
                    </div>

                    {/* Payment & Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 border-b border-gray-200">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FiCreditCard className="h-5 w-5 text-blue-600" />
                                Payment Details
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Method:</span>
                                    <span className="font-medium">{order.payment_method === 'razorpay' ? 'Razorpay' : 'COD'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium ${paymentStatusConfig[order.payment_status]}`}>{order.payment_status}</span>
                                </div>
                                {order.razorpay_payment_id && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-mono text-xs">{order.razorpay_payment_id}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <HiOutlineCurrencyRupee className="h-5 w-5 text-blue-600" />
                                Price Summary
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span className={order.shipping_charge > 0 ? 'font-medium' : 'text-green-600'}>
                                        {order.shipping_charge > 0 ? formatCurrency(order.shipping_charge) : 'Free'}
                                    </span>
                                </div>
                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-{formatCurrency(order.discount_amount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-2 mt-2">
                                    <div className="flex justify-between font-bold">
                                        <span>Total:</span>
                                        <span className="text-blue-600">{formatCurrency(order.final_amount)}</span>
                                    </div>
                                </div>
                                {order.loyalty_points_earned > 0 && (
                                    <div className="flex justify-between text-xs text-green-600 mt-2">
                                        <span>✨ Points Earned:</span>
                                        <span>+{order.loyalty_points_earned}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="p-8 bg-blue-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <HiOutlineDocumentText className="h-5 w-5 text-blue-600" />
                                Order Notes
                            </h3>
                            <div className="bg-white p-4 rounded-lg border border-gray-200 whitespace-pre-line">
                                {order.notes}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="px-8 py-4 text-center text-sm text-gray-500">
                        <p>Thank you for shopping with us!</p>
                        <p className="mt-1">For any queries, please contact customer support</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;