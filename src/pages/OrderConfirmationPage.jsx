import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { axiosInstance } from "../api/axios";
import MobileOrderConfirmationPage from "./mobile/MobileOrderConfirmation";
import {
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiClock,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiGift,
  FiShield,
  FiDownload,
  FiPrinter,
  FiArrowLeft,
  FiHome,
  FiList,
  FiCheck
} from "react-icons/fi";
import "./OrderConfirmationPage.css";

const OrderConfirmationPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const { orderNumber } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    } else {
      setError('Order number not provided');
      setLoading(false);
    }
  }, [orderNumber]);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Generate random delivery date (3-7 days from now)
  useEffect(() => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 3);
    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));
  }, []);

  const fetchOrderDetails = async () => {
    try {
      // Try multiple endpoints for compatibility
      let response;

      try {
        response = await axiosInstance.get(`/api/public/orders/detail/?order_number=${orderNumber}`);
      } catch (err) {
        response = await axiosInstance.get(`/api/public/orders/?search=${orderNumber}`);
      }

      if (response.data && response.data.success) {
        const orderData = response.data.data;
        setOrder(orderData);

        // Extract order items if available
        if (orderData.items && Array.isArray(orderData.items)) {
          setOrderItems(orderData.items);
        } else if (response.data.items) {
          setOrderItems(response.data.items);
        }
      } else {
        setError(response.data?.message || 'Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);

      // Try alternative API endpoint
      try {
        const altResponse = await axiosInstance.get(`/api/public/orders/?order_number=${orderNumber}`);
        if (altResponse.data && altResponse.data.success) {
          setOrder(altResponse.data.data);
        } else {
          setError('Failed to fetch order details');
        }
      } catch (altErr) {
        setError('Order not found. Please check your order number.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If no order number in URL, try to get from localStorage
  useEffect(() => {
    if (!orderNumber) {
      const recentOrder = localStorage.getItem('recent_order');
      if (recentOrder) {
        navigate(`/order-confirmation/${recentOrder}`);
      }
    }
  }, [orderNumber, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  const getOrderItemImage = (item) => {
    // 1️⃣ Variant image first
    if (item.variant_image) {
      return getImageUrl(item.variant_image);
    }

    // 2️⃣ Main image fallback
    if (item.product_details?.main_image) {
      return getImageUrl(item.product_details.main_image);
    }

    return "https://placehold.co/80x80/f0f4f8/94a3b8?text=No+Image";
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://placehold.co/80x80/f0f4f8/94a3b8?text=No+Image";
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `https://api.initcart.in${imagePath}`;
  };

  const downloadInvoice = () => {
    const invoiceWindow = window.open('', '_blank');

    const invoiceHTML = `
  <html>
  <head>
    <title>Invoice - ${order.order_number}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 30px;
        color: #333;
        font-size: 14px;
      }

      h1,h2,h3 {
        margin: 0;
      }

      .header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 25px;
      }

      .company-details {
        text-align: right;
      }

      .address-row {
        display: flex;
        justify-content: space-between;
        gap: 40px;
        margin-bottom: 25px;
      }

      .address-box {
        width: 48%;
        background: #f9f9f9;
        padding: 15px;
        border-radius: 6px;
      }

      .address-box h3 {
        margin-bottom: 10px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }

      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      th {
        background-color: #f4f4f4;
      }

      .totals {
        width: 350px;
        margin-top: 20px;
        margin-left: auto;
      }

      .totals div {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
      }

      .grand-total {
        font-weight: bold;
        font-size: 16px;
        border-top: 2px solid #000;
        padding-top: 8px;
      }

      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }

      @media print {
        body {
          margin: 0;
        }
      }
    </style>
  </head>

  <body>

    <div class="header">
      <div>
        <h1>INVOICE</h1>
        <p><strong>Order #:</strong> ${order.order_number}</p>
        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
      </div>

      <div class="company-details">
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
        <p><strong>${order.shipping_name}</strong></p>
        <p>${order.shipping_address}</p>
        <p>${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}</p>
        <p>Phone: ${order.shipping_phone}</p>
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
        ${orderItems.map(item => `
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
    invoiceWindow.print();
  };

  if (isMobile) {
  return <MobileOrderConfirmationPage />;
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Order Details</h3>
          <p className="text-gray-600">Please wait while we fetch your order information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
            >
              Continue Shopping
            </Link>
            <Link
              to="/orders"
              className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-lg transition"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="text-yellow-600 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            to="/"
            className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-full">
                <FiCheckCircle className="text-3xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Order Confirmed!</h1>
                <p className="text-green-100 mt-1">Thank you for your purchase, {user?.username || 'Customer'}!</p>
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-green-100">Order Reference</p>
              <p className="text-xl font-bold tracking-wider">{order.order_number}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Progress Tracker */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiTruck className="text-blue-600" />
                Order Status & Tracking
              </h2>

              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* Steps */}
                <div className="space-y-8 relative">
                  {/* Step 1: Ordered */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center relative z-10">
                      <FiCheck className="text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">Order Confirmed</p>
                          <p className="text-sm text-gray-600">Your order has been confirmed</p>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Processed */}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${order.order_status === 'processing' || order.order_status === 'shipped' || order.order_status === 'delivered' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <FiPackage className="text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">Processing</p>
                          <p className="text-sm text-gray-600">Preparing your items for shipping</p>
                        </div>
                        <span className="text-sm text-gray-500">Soon</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${order.order_status === 'shipped' || order.order_status === 'delivered' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <FiTruck className="text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">Shipped</p>
                          <p className="text-sm text-gray-600">Your order is on the way</p>
                        </div>
                        <span className="text-sm text-gray-500">--</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${order.order_status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <FiCheckCircle className="text-sm" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">Delivered</p>
                          <p className="text-sm text-gray-600">Estimated by {estimatedDelivery}</p>
                        </div>
                        <span className="text-sm text-gray-500">--</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiShoppingBag className="text-blue-600" />
                Order Items ({orderItems.length || 1})
              </h2>

              <div className="space-y-4">
                {orderItems.length > 0 ? (
                  orderItems.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition">
                      <img
                        src={getOrderItemImage(item)}
                        alt={item.product_name || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/80x80/f0f4f8/94a3b8?text=No+Image";
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {item.product_name || 'Product'}
                        </h3>
                        {item.color || item.size ? (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.color && <span>Color: {item.color} </span>}
                            {item.size && <span>Size: {item.size}</span>}
                          </p>
                        ) : null}
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {item.quantity || 1} × ₹{parseFloat(item.unit_price || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ₹{parseFloat(item.total_price || item.unit_price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FiPackage className="text-4xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No items found for this order</p>
                  </div>
                )}
              </div>
            </div>

            {/* Applied Coupon & Discount Section */}
            {(order.discount_amount > 0 || order.loyalty_points_used > 0) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiGift className="text-green-600" />
                  Savings & Rewards
                </h2>

                <div className="space-y-3">
                  {order.discount_amount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded">
                          <FiTag className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Coupon Applied</p>
                          <p className="text-sm text-gray-600">You saved with coupon</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">-₹{parseFloat(order.discount_amount).toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {order.loyalty_points_used > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 rounded">
                          <FiStar className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Loyalty Points Used</p>
                          <p className="text-sm text-gray-600">{order.loyalty_points_used} points redeemed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">-{order.loyalty_points_used} points</p>
                      </div>
                    </div>
                  )}

                  {order.loyalty_points_earned > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded">
                          <FiStar className="text-white text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Loyalty Points Earned</p>
                          <p className="text-sm text-gray-600">🎉 You earned extra rewards!</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">+{order.loyalty_points_earned} points</p>
                        <p className="text-xs text-gray-500">= ₹{(order.loyalty_points_earned * 0.1).toFixed(2)} value</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shipping & Billing Address */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiTruck className="text-blue-600" />
                  Shipping Address
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="text-gray-400 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{order.shipping_name}</p>
                      <p className="text-gray-700">{order.shipping_address}</p>
                      <p className="text-gray-700">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiPhone className="text-gray-400" />
                    <span>{order.shipping_phone}</span>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-purple-600" />
                  Billing Address
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="text-gray-400 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{order.billing_name}</p>
                      <p className="text-gray-700">{order.billing_address}</p>
                      <p className="text-gray-700">{order.billing_city}, {order.billing_state} - {order.billing_pincode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiMail className="text-gray-400" />
                    <span>{order.billing_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiPhone className="text-gray-400" />
                    <span>{order.billing_phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Order Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                    {order.order_status.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Payment</span>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{order.payment_method.toUpperCase()}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium mt-1 ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Order Date</span>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className={order.shipping_charge == 0 ? "text-green-600 font-medium" : ""}>
                      {order.shipping_charge == 0 ? "FREE" : `₹${parseFloat(order.shipping_charge).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax</span>
                    <span>₹{parseFloat(order.tax_amount || 0).toFixed(2)}</span>
                  </div>

                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span className="font-medium">-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-blue-600">₹{parseFloat(order.final_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-6">
                  <button
                    onClick={downloadInvoice}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition shadow-sm hover:shadow"
                  >
                    <FiDownload />
                    Download Invoice
                  </button>

                  {order.payment_method === 'razorpay' && order.payment_status === 'pending' && (
                    <button className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 rounded-lg transition">
                      <FiCreditCard />
                      Complete Payment
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border  border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FiShield className="text-blue-600" />
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order, our customer support team is here to help.
              </p>
              <div className="space-y-2">
                <a href="tel:+911234567890" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                  <FiPhone />
                  Call Support: +91 12345 67890
                </a>
                <a href="mailto:support@supercommerce.com" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm">
                  <FiMail />
                  Email: support@supercommerce.com
                </a>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">What to Expect Next</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <FiCheck className="text-xs" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Confirmation Email</p>
                    <p className="text-sm text-gray-600">Sent to {order.billing_email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FiClock className="text-xs" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Processing Time</p>
                    <p className="text-sm text-gray-600">24-48 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <FiTruck className="text-xs" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivery</p>
                    <p className="text-sm text-gray-600">Estimated by {estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-3">Continue Shopping</h3>
              <p className="text-sm text-gray-600 mb-4">
                Discover more amazing products with exclusive offers.
              </p>
              <div className="space-y-3">
                <Link
                  to="/"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg text-center transition"
                >
                  <FiHome className="inline mr-2" />
                  Back to Home
                </Link>
                <Link
                  to="/orders"
                  className="block w-full border border-green-600 text-green-600 hover:bg-green-50 font-medium py-3 rounded-lg text-center transition"
                >
                  <FiList className="inline mr-2" />
                  View All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-gray-500">
          <div className="flex items-center gap-2">
            <FiShield className="text-green-500" />
            <span className="text-sm">100% Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <FiTruck className="text-blue-500" />
            <span className="text-sm">Free Shipping over ₹999</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-purple-500" />
            <span className="text-sm">Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;