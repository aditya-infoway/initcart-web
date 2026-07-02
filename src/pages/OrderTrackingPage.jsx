// pages/customer/orders/OrderTracking.jsx - Updated version

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaTruck, FaBox, FaCheckCircle, FaClock,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowLeft,
  FaCalendarAlt, FaIdCard, FaExclamationCircle,
  FaCreditCard
} from "react-icons/fa";
import { MdPending, MdCancel, MdPayment } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../api/axios";
import MobileOrderTrackingPage from "./mobile/MobileorderTrackingPage";

const OrderTrackingPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(null);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0.00';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  // ✅ Payment status color function
  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrderTracking();
    }
  }, [orderNumber]);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchOrderTracking = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/public/orders/detail/?order_number=${orderNumber}`);

      if (response.data.success) {
        const orderData = response.data.data;

        setOrder(orderData);
        setTracking(orderData.tracking || null);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch order tracking'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimelineSteps = () => {
    if (!order) return [];

    const status = order.order_status;
    const isCancelled = status === 'cancelled' || status === 'refunded';

    const steps = [
      {
        label: 'Order Placed',
        date: order.created_at,
        completed: true,
        icon: <FaBox />
      },
      {
        label: 'Order Confirmed',
        date: !['pending'].includes(status) ? order.updated_at : null,
        completed: !['pending'].includes(status),
        icon: <FaCheckCircle />
      },
      {
        label: 'Processing',
        date: ['processing', 'shipped', 'delivered'].includes(status) ? order.updated_at : null,
        completed: ['processing', 'shipped', 'delivered'].includes(status),
        icon: <FaClock />
      },
      {
        label: 'Shipped',
        date: ['shipped', 'delivered'].includes(status) ? order.updated_at : null,
        completed: ['shipped', 'delivered'].includes(status),
        icon: <FaTruck />
      },
      {
        label: 'Delivered',
        date: status === 'delivered' ? order.updated_at : null,
        completed: status === 'delivered',
        icon: <FaCheckCircle />
      }
    ];

    if (isCancelled) {
      return [
        steps[0],
        {
          label: status === 'cancelled' ? 'Cancelled' : 'Refunded',
          date: order.updated_at,
          completed: false,
          icon: <MdCancel className="text-red-600" />
        }
      ];
    }

    return steps;
  };

  const isOrderCancelled = order?.order_status === 'cancelled' || order?.order_status === 'refunded';

  if (isMobile) {
  return <MobileOrderTrackingPage />;
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/orders')}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FaBox className="mx-auto text-6xl text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Order not found</p>
          </div>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Track Order</h1>
              <p className="text-gray-600 mt-1">Order #{order.order_number}</p>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.order_status)}`}>
                {order.order_status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Tracking Timeline Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <FaTruck className="mr-2 text-blue-500" />
            Order Timeline
          </h2>

          <div className="relative">
            {timelineSteps.map((step, index) => (
              <div key={index} className="flex items-start mb-6 last:mb-0">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                    }`}>
                    {step.icon}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className={`absolute top-10 left-4 w-0.5 h-12 -ml-0.5 ${step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {step.date ? formatDate(step.date) : 'Pending'}
                      </p>
                    </div>
                    {step.completed && (
                      <FaCheckCircle className="text-green-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Information Card */}
        {!isOrderCancelled && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaTruck className="mr-2 text-blue-500" />
              Delivery Information
            </h2>

            {tracking ? (
              <div className="space-y-4">
                {/* Current Delivery Status */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Current Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tracking.delivery_status)}`}>
                      {tracking.delivery_status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Expected Delivery */}
                {tracking.expected_delivery_date && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <FaCalendarAlt className="text-blue-500 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Expected Delivery</p>
                        <p className="font-semibold text-gray-800">
                          {formatDateOnly(tracking.expected_delivery_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tracking ID & Courier */}
                {tracking.tracking_id && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <FaIdCard className="text-blue-500 mt-1 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Tracking ID</p>
                        <p className="font-mono font-semibold text-gray-800 break-all">
                          {tracking.tracking_id}
                        </p>
                        {tracking.courier_name && (
                          <p className="text-sm text-gray-600 mt-1">
                            Courier: {tracking.courier_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Service */}
                {tracking.delivery_service && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <FaTruck className="text-blue-500 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Delivery Service</p>
                        <p className="font-semibold text-gray-800 capitalize">
                          {tracking.delivery_service.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaTruck className="mx-auto text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500">No delivery information available yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Tracking details will appear once the order is shipped
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cancelled/Refunded Message */}
        {isOrderCancelled && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaExclamationCircle className="mr-2 text-red-500" />
              Order Status
            </h2>
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <MdCancel className="mx-auto text-5xl text-red-500 mb-3" />
              <p className="text-lg font-semibold text-red-700">
                This order has been {order.order_status}
              </p>
              <p className="text-sm text-red-600 mt-2">
                {order.order_status === 'cancelled'
                  ? 'The order was cancelled and will not be delivered.'
                  : 'The order has been refunded.'}
              </p>
              {order.updated_at && (
                <p className="text-xs text-gray-500 mt-4">
                  Status updated on: {formatDate(order.updated_at)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Shipping Address Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-500" />
            Shipping Address
          </h2>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-800">
              {order.shipping_name || order.billing_name}
            </p>
            <p className="text-sm text-gray-600 mt-2 flex items-center">
              <FaPhone className="mr-2 text-sm text-blue-500" />
              {order.shipping_phone || order.billing_phone}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {order.shipping_address || order.billing_address}
            </p>
            <p className="text-sm text-gray-600">
              {order.shipping_city || order.billing_city}, {order.shipping_state || order.billing_state} - {order.shipping_pincode || order.billing_pincode}
            </p>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaCreditCard className="mr-2 text-blue-500" />
            Order Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-semibold">{order.items?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold capitalize">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="font-medium text-gray-700">Total Amount:</span>
              <span className="font-bold text-xl text-blue-600">
                ₹{formatCurrency(order.final_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Need Help Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <FaPhone className="mr-3 text-blue-500" />
              <span>+91 1234567890</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaEnvelope className="mr-3 text-blue-500" />
              <span>support@initcart.in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;