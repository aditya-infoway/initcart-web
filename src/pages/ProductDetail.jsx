import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { publicAxios, axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Tag, Zap, ChevronRight, ShoppingCart, Eye } from "lucide-react";
import RelatedProductSlider from "./RelatedProducts";
import MobileProductDetail from "./mobile/MobileProductDetail";
import ProductReviewWidget from "./Productreviewwidget";
import ServiceReviewSection from "../Services/ServiceReviewSection";
import {
    FaEye,
    FaFileInvoice,
    FaSearch,
    FaFilter,
    FaShoppingCart,
    FaChartLine,
    FaTimes,
    FaSpinner,
    FaBox,
    FaCheckCircle,
    FaClock,
    FaCheck,
    FaTruck,
    FaTimesCircle,
    FaUndo,
    FaExclamationTriangle,
    FaFileAlt,
    FaArchive,
    FaEdit,
    FaCreditCard,
    FaRupeeSign,
    FaUser,
    FaStore,
    FaShieldAlt,
    FaCoins,
    FaStar,
} from "react-icons/fa";
import {
    GiConfirmed,
    GiReturnArrow
} from "react-icons/gi";

// Enhanced Coupons Modal Component
const CouponsModal = ({ product, coupons, onClose, onApplyCoupon }) => {
    if (!product || !coupons) return null;

    const handleApplyCoupon = (couponCode) => {
        onApplyCoupon(couponCode);
        onClose();
    };

    const handleCopyCoupon = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            alert(`Coupon ${code} copied!`);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    };

    const getCouponColor = (couponType) => {
        switch (couponType) {
            case 'percentage':
                return 'from-blue-500 to-red-500';
            case 'flat':
                return 'from-blue-500 to-blue-600';
            case 'free_shipping':
                return 'from-green-500 to-emerald-600';
            default:
                return 'from-gray-500 to-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl">
                            <Tag className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                Offers for {product.product_name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Apply coupon and save more on your purchase
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {coupons.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                                <Tag className="h-10 w-10 text-gray-400" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-700 mb-2">No Offers Available</h4>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Currently there are no active offers for this product. Check back later!
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                    <div>
                                        <h4 className="font-semibold text-blue-800"> Pro Tip</h4>
                                        <p className="text-sm text-blue-600">Apply coupon at checkout for instant discount</p>
                                    </div>
                                </div>
                            </div>

                            {coupons.map(coupon => (
                                <div key={coupon.id} className="border border-gray-300 rounded-xl p-5 hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-20 mb-3">
                                                <div className="mb-4 mt-2 border border-gray-300 rounded-lg overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50">
                                                    <div className="flex">
                                                        <div className="flex items-center justify-between px-4 py-3">
                                                            <span className="text-2xl font-bold text-gray-800 tracking-widest">
                                                                {coupon.code}
                                                            </span>
                                                        </div>
                                                        <div
                                                            onClick={() => handleCopyCoupon(coupon.code)}
                                                            className="relative group w-28 flex items-center justify-center text-white font-semibold text-sm cursor-pointer transition-all duration-300"
                                                        >
                                                            <div className="absolute inset-0 bg-blue-600 group-hover:bg-blue-700 transition-colors duration-300"></div>
                                                            <div className="absolute left-[-12px] top-0 bottom-0 my-auto w-0 h-0 border-y-[20px] border-y-transparent border-r-[12px] border-r-blue-600 group-hover:border-r-blue-700 duration-300 transition-all"></div>
                                                            <span className="relative z-10 group-hover:scale-105 transition-transform">
                                                                Copy
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="lg:text-right top-2">
                                                    <button
                                                        onClick={() => handleApplyCoupon(coupon.code)}
                                                        className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full lg:w-auto"
                                                    >
                                                        Apply Coupon
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={`bg-gradient-to-r ${getCouponColor(coupon.coupon_type)} w-29 text-white text-sm font-bold px-3 py-2 mb-4 rounded-full`}>
                                                <div className="flex justify-between gap-2">
                                                    {coupon.discount_display}
                                                    <span>OFF</span>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-lg mb-2">{coupon.title}</h4>
                                            <p className="text-gray-600 text-sm mb-3">{coupon.description || "Get extra discount on this product"}</p>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Verified
                                                </span>
                                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                                    </svg>
                                                    {coupon.validity_display}
                                                </span>
                                            </div>

                                            {coupon.conditions && coupon.conditions.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">Terms & Conditions:</p>
                                                    <ul className="text-xs text-gray-600 space-y-1">
                                                        {coupon.conditions.map((cond, idx) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <span className="text-gray-400 mt-0.5">•</span>
                                                                <span>{cond}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                        >
                            Continue Shopping
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onApplyCoupon('');
                            }}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                        >
                            Go to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Login Modal
const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <span className="text-yellow-600 text-xl">⚠</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        ✗
                    </button>
                </div>

                <p className="text-gray-600 mb-6">
                    You need to login to add items to cart. Please login or create an account.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onLogin}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Login Now
                    </button>

                    <button
                        onClick={onRegister}
                        className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                    >
                        Create New Account
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-2 text-gray-500 hover:text-gray-700 transition"
                    >
                        Continue browsing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ProductDetailPage() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vendorProducts, setVendorProducts] = useState([]);
    const [vendorLoading, setVendorLoading] = useState(false);

    // New states
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCouponsModal, setShowCouponsModal] = useState(false);
    const [productCoupons, setProductCoupons] = useState([]);
    const [couponsLoading, setCouponsLoading] = useState(false);
    const [selectedStockId, setSelectedStockId] = useState(null);
    const [isProductDelivered, setIsProductDelivered] = useState(false);


    // Countdown state
    const [countdown, setCountdown] = useState(null);

    // Auth and Toast context
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();

    // Image helper functions - IMPROVED TO GET ALL IMAGES
    const getProductImage = (productData) => {
        if (!productData) return null;

        if (productData.main_image_url) {
            return productData.main_image_url;
        }

        if (productData.thumbnail_image_url) {
            return productData.thumbnail_image_url;
        }

        if (productData.main_image) {
            if (productData.main_image.startsWith('http')) {
                return productData.main_image;
            }
            return `https://api.initcart.in${productData.main_image}`;
        }

        if (productData.thumbnail_image) {
            if (productData.thumbnail_image.startsWith('http')) {
                return productData.thumbnail_image;
            }
            return `https://api.initcart.in${productData.thumbnail_image}`;
        }

        return null;
    };

    const getThumbnailImage = (productData) => {
        if (!productData) return null;

        if (productData.thumbnail_image_url) {
            return productData.thumbnail_image_url;
        }

        if (productData.thumbnail_image) {
            if (productData.thumbnail_image.startsWith('http')) {
                return productData.thumbnail_image;
            }
            return `https://api.initcart.in${productData.thumbnail_image}`;
        }

        return null;
    };

    const getGalleryImages = (productData) => {
        if (!productData) return [];

        // First, check if product has gallery (ProductGallery model)
        if (productData.gallery && Array.isArray(productData.gallery)) {
            return productData.gallery.map(item => {
                // Handle different gallery item formats
                if (typeof item === 'string') {
                    if (item.startsWith('http')) {
                        return item;
                    }
                    return `https://api.initcart.in${item}`;
                }
                if (item.image_url) {
                    return item.image_url;
                }
                if (item.image) {
                    if (item.image.startsWith('http')) {
                        return item.image;
                    }
                    // Handle product gallery images (stored in products/gallery/)
                    if (item.image.startsWith('/media/products/gallery/') || item.image.startsWith('products/gallery/')) {
                        return `https://api.initcart.in${item.image.startsWith('/') ? item.image : '/' + item.image}`;
                    }
                    return `https://api.initcart.in${item.image.startsWith('/') ? item.image : '/' + item.image}`;
                }
                return null;
            }).filter(Boolean);
        }

        // If gallery is a JSON string (legacy)
        if (typeof productData.gallery === 'string') {
            try {
                const parsed = JSON.parse(productData.gallery);
                if (Array.isArray(parsed)) {
                    return parsed.map(img => {
                        if (typeof img === 'string') {
                            return img.startsWith('http') ? img : `https://api.initcart.in${img}`;
                        }
                        return img.image_url || (img.image ? `https://api.initcart.in${img.image}` : null);
                    }).filter(Boolean);
                }
            } catch (e) {
                console.error("Error parsing gallery:", e);
            }
        }

        return [];
    };

    const getVariantImage = (stock) => {
        if (!stock) return null;

        if (stock.variant_image_url) {
            return stock.variant_image_url;
        }

        if (stock.variant_image) {
            if (stock.variant_image.startsWith('http')) {
                return stock.variant_image;
            }
            return `https://api.initcart.in${stock.variant_image}`;
        }

        return null;
    };

    // NEW FUNCTION: Get ALL images for the product (variant images + main + thumbnail + gallery)
    const getAllProductImages = (productData) => {
        if (!productData) return [];

        const allImages = [];
        const seenUrls = new Set(); // Track unique URLs

        // 1. Add main image
        const mainImage = getProductImage(productData);
        if (mainImage && !seenUrls.has(mainImage)) {
            seenUrls.add(mainImage);
            allImages.push({
                url: mainImage,
                type: 'main',
                label: 'Main Image'
            });
        }

        // 2. Add thumbnail image (if different from main)
        const thumbnailImage = getThumbnailImage(productData);
        if (thumbnailImage && thumbnailImage !== mainImage && !seenUrls.has(thumbnailImage)) {
            seenUrls.add(thumbnailImage);
            allImages.push({
                url: thumbnailImage,
                type: 'thumbnail',
                label: 'Thumbnail'
            });
        }

        // 3. Add all variant images from stocks
        if (productData.stocks && productData.stocks.length > 0) {
            productData.stocks.forEach((stock, index) => {
                const variantImage = getVariantImage(stock);
                if (variantImage && !seenUrls.has(variantImage)) {
                    seenUrls.add(variantImage);
                    allImages.push({
                        url: variantImage,
                        type: 'variant',
                        label: `${stock.color || 'Variant'} ${stock.size || ''}`.trim() || `Variant ${index + 1}`,
                        color: stock.color,
                        size: stock.size,
                        stockId: stock.id
                    });
                }
            });
        }

        // 4. 🔥 FIX: Add all gallery images - THIS IS THE CRITICAL PART
        const galleryImages = getGalleryImages(productData);


        galleryImages.forEach((img, index) => {
            if (img && !seenUrls.has(img)) {
                seenUrls.add(img);
                allImages.push({
                    url: img,
                    type: 'gallery',
                    label: `Gallery ${index + 1}`
                });
            }
        });

        return allImages;
    };

    // 🔥 NEW FUNCTION: Update price based on variant image
    const updatePriceFromVariantImage = (variantImageUrl) => {
        const stock = getStockByVariantImage(variantImageUrl);
        if (stock) {
            // Manually update selectedColor and selectedSize if they exist
            if (stock.color) {
                const colorId = stock.color.toLowerCase().replace(/\s+/g, '_');
                setSelectedColor(colorId);
            }
            if (stock.size) {
                setSelectedSize(stock.size.toUpperCase());
            }
            // Force price update by triggering a re-render
            // The useEffect will handle the rest
            return true;
        }
        return false;
    };
    const getVendorLogo = (vendorData) => {
        if (!vendorData) return null;

        if (vendorData.store_logo_url) {
            return vendorData.store_logo_url;
        }

        if (vendorData.store_logo) {
            if (vendorData.store_logo.startsWith('http')) {
                return vendorData.store_logo;
            }
            return `https://api.initcart.in${vendorData.store_logo}`;
        }

        return null;
    };

    // ADD TO CART FUNCTION
    const addToCart = async (productStockId, quantity = 1) => {
        try {
            if (!isAuthenticated()) {
                addToast('Please login to add items to cart', 'warning');
                setShowLoginModal(true);
                return;
            }

            const response = await axiosInstance.post('api/public/cart/', {
                product_stock: productStockId,
                quantity: quantity
            });

            if (response.data.success) {
                addToast('Added to cart successfully!', 'success');
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to add to cart');
            }
        } catch (error) {
            console.error('Add to cart error:', error);

            if (error.response) {
                const { status, data } = error.response;

                if (status === 401) {
                    addToast('Session expired. Please login again.', 'error');
                    navigate('/customer/login');
                } else if (status === 400) {
                    addToast(data.message || 'Invalid request', 'error');
                } else if (status === 404) {
                    addToast('Product not found or out of stock', 'error');
                } else {
                    addToast('Failed to add to cart. Please try again.', 'error');
                }
            } else {
                addToast('Network error. Please check your connection.', 'error');
            }

            throw error;
        }
    };

    // BUY NOW FUNCTION
    const handleBuyNow = async (productStockId, quantity = 1) => {
        try {
            if (!isAuthenticated()) {
                addToast('Please login to proceed with purchase', 'warning');
                setShowLoginModal(true);
                return;
            }

            await addToCart(productStockId, quantity);
            navigate('/checkout');
        } catch (error) {
            console.error('Buy now error:', error);
        }
    };

    // FETCH COUPONS FOR PRODUCT
    const fetchCouponsForProduct = async (productId) => {
        try {
            setCouponsLoading(true);
            const response = await publicAxios.get(`ecommerce/public/coupons/product/${productId}/`);
            if (response.data.success) {
                setProductCoupons(response.data.coupons || []);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setCouponsLoading(false);
        }
    };

    // HANDLE VIEW COUPONS
    const handleViewCoupons = () => {
        if (!productCoupons || productCoupons.length === 0) {
            fetchCouponsForProduct(product.id);
        }
        setShowCouponsModal(true);
    };

    // HANDLE APPLY COUPON
    const handleApplyCoupon = (couponCode) => {
        navigate('/cart', {
            state: {
                applyCoupon: couponCode,
                fromProduct: product?.id
            }
        });
    };

    // LOGIN MODAL HANDLERS
    const handleLoginClick = () => {
        setShowLoginModal(false);
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/customer/login', {
            state: { from: window.location.pathname }
        });
    };

    const handleRegisterClick = () => {
        setShowLoginModal(false);
        navigate('/customer/registration', {
            state: { from: window.location.pathname }
        });
    };

    // Fetch product data from API
    useEffect(() => {
        let isMounted = true;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);


                const response = await publicAxios.get(`ecommerce/public/products/${id}/`);

                if (isMounted) {
                    if (response.data) {

                        setProduct(response.data);

                        if (response.data.vendor_details) {
                            fetchVendorProducts(response.data.vendor_details.id);
                        }

                        fetchCouponsForProduct(response.data.id);

                    } else {
                        throw new Error("Product not found");
                    }
                }
            } catch (err) {
                console.error("❌ Error fetching product:", err);
                if (isMounted) {
                    setError("Failed to load product details");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        const fetchVendorProducts = async (vendorId) => {
            try {
                setVendorLoading(true);
                const response = await publicAxios.get(`ecommerce/public/products/`);
                if (response.data && Array.isArray(response.data)) {
                    const vendorProducts = response.data.filter(
                        p => p.vendor_details?.id === vendorId && p.id !== parseInt(id)
                    ).slice(0, 4);
                    setVendorProducts(vendorProducts);
                }
            } catch (err) {
                console.error("❌ Error fetching vendor products:", err);
            } finally {
                setVendorLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        } else {
            setError("Product ID not provided");
            setLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (!product?.id) return;
        publicAxios.get("/api/all-review/", { params: { model: "product", object_id: product.id } })
            .then(res => {
                setReviewStats({
                    avg: res.data.average_rating || 0,
                    count: res.data.reviews?.length || 0
                });
            })
            .catch(() => { });
    }, [product?.id]);

        // ✅ YE EFFECT ADD KARO - Delivery status check
    useEffect(() => {
        if (!product?.id || !isAuthenticated()) return;
        
        const checkDeliveryStatus = async () => {
            try {
                const res = await publicAxios.get(`/api/check-product-delivery/${product.id}/`);
                setIsProductDelivered(res.data.isDelivered || false);
            } catch (err) {
                console.error("Delivery check error:", err);
                setIsProductDelivered(false);
            }
        };
        
        checkDeliveryStatus();
    }, [product?.id, isAuthenticated]);

    // UNIVERSAL COUNTDOWN for all campaign types
    useEffect(() => {
        if (!product?.is_in_campaign || !product?.campaign_details?.end_datetime) {
            return;
        }

        const timer = setInterval(() => {
            const endTime = new Date(product.campaign_details.end_datetime).getTime();
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance <= 0) {
                setCountdown(null);
                clearInterval(timer);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown({ days, hours, minutes, seconds, total: distance });
        }, 1000);

        return () => clearInterval(timer);
    }, [product]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Extract unique colors and sizes from product stocks
    const extractVariantsFromStocks = (productData) => {
        if (!productData || !productData.stocks || productData.stocks.length === 0) {
            return {
                colors: [{ id: "default", name: "Default", hex: "#94a3b8", stock: null }],
                sizes: ["One Size"]
            };
        }


        const colorsMap = new Map();
        const sizesMap = new Map();

        // First, get all unique colors and sizes with their availability
        productData.stocks.forEach(stock => {
            if (stock.color && stock.color.trim() !== "") {
                const colorId = stock.color.toLowerCase().replace(/\s+/g, '_');
                if (!colorsMap.has(colorId)) {
                    colorsMap.set(colorId, {
                        id: colorId,
                        name: stock.color,
                        hex: getColorHex(stock.color),
                        stock: stock,
                        availableSizes: []
                    });
                }

                // Add size to this color's available sizes if stock > 0
                if (stock.size && stock.stock_quantity > 0) {
                    const colorData = colorsMap.get(colorId);
                    if (!colorData.availableSizes.includes(stock.size.toUpperCase())) {
                        colorData.availableSizes.push(stock.size.toUpperCase());
                    }
                }
            }

            if (stock.size && stock.size.trim() !== "") {
                const sizeId = stock.size.toUpperCase();
                if (!sizesMap.has(sizeId)) {
                    sizesMap.set(sizeId, {
                        name: stock.size,
                        id: sizeId,
                        available: false
                    });
                }
            }
        });

        // Update size availability based on selected color
        const colors = Array.from(colorsMap.values());
        const sizes = Array.from(sizesMap.values());

        if (colors.length === 0) {
            colors.push({ id: "default", name: "Default", hex: "#94a3b8", stock: productData.stocks[0], availableSizes: [] });
        }
        if (sizes.length === 0) {
            sizes.push({ name: "One Size", id: "One Size", available: true });
        }

        return { colors, sizes };
    };

    // Helper function to get hex code for colors
    const getColorHex = (colorName) => {
        const colorMap = {
            'black': '#000000',
            'white': '#ffffff',
            'red': '#dc2626',
            'blue': '#2563eb',
            'green': '#16a34a',
            'yellow': '#ca8a04',
            'pink': '#db2777',
            'purple': '#9333ea',
            'gray': '#6b7280',
            'brown': '#78350f',
            'orange': '#ea580c',
            'navy': '#1e3a8a',
            'maroon': '#991b1b',
            'teal': '#0d9488',
            'cyan': '#0891b2',
            'lime': '#65a30d',
            'default': '#94a3b8'
        };

        const lowerColor = colorName.toLowerCase();
        return colorMap[lowerColor] || colorMap['default'];
    };

    const getCurrentStock = () => {
        if (!product || !product.stocks || product.stocks.length === 0) {
            return null;
        }
        // 🔥 NEW: If we have a selectedStockId from variant image click, use it
        if (selectedStockId) {
            const stockById = product.stocks.find(s => s.id === selectedStockId);
            if (stockById) {
                return stockById;
            }
        }

        // If only one stock, return it
        if (product.stocks.length === 1) {
            return product.stocks[0];
        }

        // Try to find by color/size
        let matchingStock = product.stocks.find(stock => {
            const stockColor = stock.color ? stock.color.toLowerCase().replace(/\s+/g, '_') : 'default';
            const stockSize = stock.size ? stock.size.toUpperCase() : 'One Size';
            return stockColor === selectedColor && stockSize === selectedSize && stock.stock_quantity > 0;
        });

        if (!matchingStock) {
            matchingStock = product.stocks.find(stock => stock.stock_quantity > 0);
        }
        if (!matchingStock) {
            matchingStock = product.stocks[0];
        }

        return matchingStock;
    };

    // Get available sizes for selected color
    const getAvailableSizesForSelectedColor = () => {
        if (!product || !product.stocks || product.stocks.length === 0) {
            return [];
        }

        const availableSizes = [];
        product.stocks.forEach(stock => {
            if (stock.color && stock.color.toLowerCase().replace(/\s+/g, '_') === selectedColor && stock.size) {
                if (stock.stock_quantity > 0 && !availableSizes.includes(stock.size.toUpperCase())) {
                    availableSizes.push(stock.size.toUpperCase());
                }
            }
        });

        return availableSizes;
    };

    // Get product price based on selected stock
    const getProductPrice = () => {
        // First check if product is in campaign
        if (product?.is_in_campaign && product?.campaign_price) {
            return parseFloat(product.campaign_price);
        }

        const currentStock = getCurrentStock();
        if (currentStock) {
            return parseFloat(currentStock.final_price) || parseFloat(currentStock.selling_price) || 0;
        }

        return 0;
    };

    // Get old price (MRP) based on selected stock
    const getOldPrice = () => {
        // If in campaign, use campaign's original price
        if (product?.is_in_campaign && product?.campaign_details?.original_price) {
            return parseFloat(product.campaign_details.original_price);
        }

        const currentStock = getCurrentStock();
        if (currentStock) {
            return parseFloat(currentStock.mrp) || 0;
        }

        return 0;
    };

    // Get discount percentage
    const getDiscountPercentage = () => {
        // If in campaign, use campaign discount
        if (product?.is_in_campaign && product?.campaign_details?.discount_percentage) {
            return product.campaign_details.discount_percentage;
        }

        // Calculate from prices
        const currentPrice = getProductPrice();
        const oldPrice = getOldPrice();
        if (oldPrice > currentPrice && oldPrice > 0) {
            return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
        }
        return 0;
    };

    const getMaxOrderQuantity = () => {
        const currentStock = getCurrentStock();
        if (currentStock) {
            return parseInt(currentStock.maximum_order_quantity) || 10;
        }
        return 10;
    };

    const getStockQuantity = () => {
        const currentStock = getCurrentStock();
        if (currentStock) {
            return parseInt(currentStock.stock_quantity) || 0;
        }
        return 0;
    };

    const getSelectedStockId = () => {
        const currentStock = getCurrentStock();
        return currentStock?.id || null;
    };

    // HANDLE ADD TO CART CLICK
    const handleAddToCartClick = async () => {
        const stockId = getSelectedStockId();

        if (!stockId) {
            addToast('Product stock not available', 'error');
            return;
        }

        if (getStockQuantity() <= 0) {
            addToast('This variant is out of stock', 'error');
            return;
        }

        if (!isAuthenticated()) {
            sessionStorage.setItem('pendingCartProduct', JSON.stringify({
                productStockId: stockId,
                quantity: qty
            }));
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
            setShowLoginModal(true);
            return;
        }

        try {
            await addToCart(stockId, qty);
        } catch (error) {
            console.error('❌ Add to cart error:', error);
        }
    };

    // HANDLE BUY NOW CLICK
    const handleBuyNowClick = async () => {
        const stockId = getSelectedStockId();

        if (!stockId) {
            addToast('Product stock not available', 'error');
            return;
        }

        if (getStockQuantity() <= 0) {
            addToast('This variant is out of stock', 'error');
            return;
        }

        await handleBuyNow(stockId, qty);
    };

    // Get campaign badge
    const getCampaignBadge = () => {
        if (!product?.is_in_campaign) return null;

        const campaignType = product.campaign_details?.campaign_type;
        switch (campaignType) {
            case 'Flash':
                return (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg flex items-center gap-1">
                            <Zap className="h-3 w-3" /> FLASH DEAL
                        </div>
                    </div>
                );
            case 'Deal of the Day':
                return (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg">
                            DEAL OF THE DAY
                        </div>
                    </div>
                );
            case 'Featured':
                return (
                    <div className="absolute top-4 left-4 z-10">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg">
                            FEATURED
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const [activeImage, setActiveImage] = useState(0);
    const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
    const [qty, setQty] = useState(1);
    const [tab, setTab] = useState("description");
    const [pincode, setPincode] = useState("");
    const [pincodeResult, setPincodeResult] = useState(null);

    // Parse description features safely
    const parseDescriptionFeatures = () => {
        if (!product || !product.description_features) return [];

        // Check if it's already an array
        if (Array.isArray(product.description_features)) {
            return product.description_features;
        }

        // Try to parse if it's a string
        if (typeof product.description_features === 'string') {
            try {
                const parsed = JSON.parse(product.description_features);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error("Error parsing description_features:", e);
                return [];
            }
        }

        return [];
    };

    // Parse specifications safely
    const parseSpecifications = () => {
        if (!product || !product.specifications) return [];

        // Check if it's already an array
        if (Array.isArray(product.specifications)) {
            return product.specifications;
        }

        // Try to parse if it's a string
        if (typeof product.specifications === 'string') {
            try {
                const parsed = JSON.parse(product.specifications);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error("Error parsing specifications:", e);
                return [];
            }
        }

        return [];
    };

    // Extract variants from product
    const variants = product ? extractVariantsFromStocks(product) : { colors: [], sizes: [] };

    const [selectedColor, setSelectedColor] = useState(
        variants.colors[0]?.id || "default"
    );
    const [selectedSize, setSelectedSize] = useState(
        variants.sizes[0]?.name || "One Size"
    );

    // Update selected variant when product changes
    useEffect(() => {
        if (product) {
            const newVariants = extractVariantsFromStocks(product);
            setSelectedColor(newVariants.colors[0]?.id || "default");
            setSelectedSize(newVariants.sizes[0]?.name || "One Size");
        }
    }, [product]);

    // Auto-switch size when color changes
    useEffect(() => {
        if (product && product.stocks) {
            const availableSizes = getAvailableSizesForSelectedColor();

            // If current selected size is not available for this color, switch to first available
            if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
                setSelectedSize(availableSizes[0]);
            }
        }
    }, [selectedColor, product]);
    useEffect(() => {
        // This effect runs whenever selectedColor or selectedSize changes
        // It ensures price updates even when using variant images
        const currentStock = getCurrentStock();
        if (currentStock) {
            // Force price update by updating the component
        }
    }, [selectedColor, selectedSize, product]);

    // Get all product images
    const allProductImages = product ? getAllProductImages(product) : [];

    // Get just the URLs for display
    const productImageUrls = allProductImages.map(img => img.url);

    // Update active image when selected stock changes
    useEffect(() => {
        if (product && allProductImages.length > 0) {
            const currentStock = getCurrentStock();

            // Try to find variant image for current stock
            if (currentStock?.variant_image_url) {
                const variantImage = getVariantImage(currentStock);
                const imageIndex = allProductImages.findIndex(img => img.url === variantImage);
                if (imageIndex >= 0) {
                    setActiveImage(imageIndex);
                    return;
                }
            }

            // If no variant image, try to find image matching color/size label
            if (currentStock?.color) {
                const colorImageIndex = allProductImages.findIndex(img =>
                    img.type === 'variant' &&
                    img.color === currentStock.color
                );
                if (colorImageIndex >= 0) {
                    setActiveImage(colorImageIndex);
                    return;
                }
            }

            // Default to first image
            setActiveImage(0);
        }
    }, [selectedColor, selectedSize, product]);

    function changeQty(delta) {
        setQty((q) => Math.max(1, Math.min(getMaxOrderQuantity(), q + delta)));
    }

    function applyPincode() {
        if (!/^[0-9]{3,6}$/.test(pincode)) {
            setPincodeResult({ ok: false, message: "Enter a valid pincode" });
            return;
        }
        const days = Math.floor(Math.random() * 5) + 2;
        const est = new Date();
        est.setDate(est.getDate() + days);
        setPincodeResult({
            ok: true,
            eta: est.toDateString(),
            cost: days > 4 ? 3.99 : 0,
        });
    }

    if (isMobile) {
        return <MobileProductDetail />;
    }

    if (loading) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-5">
                            <div className="h-96 bg-gray-200 rounded"></div>
                        </div>
                        <div className="col-span-12 lg:col-span-7">
                            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                            <div className="h-12 bg-gray-200 rounded mb-4"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">😞</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Product Not Found
                    </h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    const currentStock = getCurrentStock();
    const actualPrice = getProductPrice();
    const actualOldPrice = getOldPrice();
    const discountPercent = getDiscountPercentage();
    const maxQuantity = getMaxOrderQuantity();
    const stockQuantity = getStockQuantity();
    const currentStockId = getSelectedStockId();

    // Get vendor logo
    const vendorLogo = getVendorLogo(product.vendor_details);

    const firstCoupon = productCoupons && productCoupons.length > 0 ? productCoupons[0] : null;
    const descriptionFeatures = parseDescriptionFeatures();
    const specifications = parseSpecifications();

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-6">
            {/* Modals */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLoginClick}
                onRegister={handleRegisterClick}
            />

            {product && showCouponsModal && (
                <CouponsModal
                    product={product}
                    coupons={productCoupons}
                    onClose={() => setShowCouponsModal(false)}
                    onApplyCoupon={handleApplyCoupon}
                />
            )}

            {/* Breadcrumb */}
            <nav className="text-sm text-slate-500 mb-6">
                <ol className="flex flex-wrap items-center gap-2">
                    <li
                        className="hover:underline cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        Home
                    </li>
                    <li>›</li>
                    <li
                        className="hover:underline cursor-pointer"
                        onClick={() => navigate('/productlist')}
                    >
                        Products
                    </li>
                    <li>›</li>
                    <li className="text-slate-700">
                        {product.product_name}
                    </li>
                </ol>
            </nav>

            {error && product && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-yellow-700 text-sm">{error}</span>
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-8">
                {/* Left Gallery - SHOWING ALL IMAGES */}
                {/* Left Gallery - SHOWING ALL IMAGES */}
                <div className="col-span-12 lg:col-span-5">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
                        {/* Campaign Badge */}
                        {getCampaignBadge()}

                        {/* Main Product Image Display */}
                        <div className="relative">
                            <img
                                src={productImageUrls[activeImage] || productImageUrls[0]}
                                alt={`${product.product_name}`}
                                className="w-full h-[450px] object-contain bg-gray-50 transition-transform duration-300 hover:scale-105 cursor-zoom-in"
                                onError={(e) => {
                                    e.target.src = "https://placehold.co/400x400/f0f4f8/94a3b8?text=Product+Image";
                                }}
                            />
                        </div>

                        {/* All Thumbnails - WITH PRICE DISPLAY AND WORKING VARIANT SELECTION */}
                        {/* All Thumbnails - WITH PRICE DISPLAY AND WORKING VARIANT SELECTION */}
                        {productImageUrls.length > 1 && (
                            <div className="px-4 py-4 border-t border-gray-100">
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                                    {allProductImages.map((img, idx) => {
                                        // Find price and stock for variant images
                                        let priceText = '';
                                        let isVariant = false;
                                        let variantStock = null;
                                        let hasColorSize = false;

                                        if (img.type === 'variant' && img.stockId) {
                                            const stock = product?.stocks?.find(s => s.id === img.stockId);
                                            if (stock) {
                                                const finalPrice = stock.final_price || stock.selling_price;
                                                priceText = `₹${parseFloat(finalPrice).toFixed(2)}`;
                                                isVariant = true;
                                                variantStock = stock;
                                                hasColorSize = !!(stock.color && stock.size);
                                            }
                                        } else if (img.type === 'main' && product?.stocks?.length > 0) {
                                            const firstStock = product.stocks[0];
                                            if (firstStock) {
                                                const finalPrice = firstStock.final_price || firstStock.selling_price;
                                                priceText = `₹${parseFloat(finalPrice).toFixed(2)}`;
                                            }
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setActiveImage(idx);

                                                    if (isVariant && variantStock) {
                                                        // 🔥 CRITICAL: Set selectedStockId
                                                        setSelectedStockId(variantStock.id);

                                                        if (variantStock.color) {
                                                            const colorId = variantStock.color.toLowerCase().replace(/\s+/g, '_');
                                                            setSelectedColor(colorId);
                                                        } else {
                                                            setSelectedColor('default');
                                                        }

                                                        if (variantStock.size) {
                                                            setSelectedSize(variantStock.size.toUpperCase());
                                                        } else {
                                                            setSelectedSize('One Size');
                                                        }

                                                        const price = variantStock.final_price || variantStock.selling_price;
                                                    }
                                                    else if (!isVariant && product?.stocks?.length > 0) {
                                                        const firstStock = product.stocks[0];
                                                        if (firstStock) {
                                                            setSelectedStockId(firstStock.id);
                                                            if (firstStock.color) {
                                                                const colorId = firstStock.color.toLowerCase().replace(/\s+/g, '_');
                                                                setSelectedColor(colorId);
                                                            } else {
                                                                setSelectedColor('default');
                                                            }

                                                            if (firstStock.size) {
                                                                setSelectedSize(firstStock.size.toUpperCase());
                                                            } else {
                                                                setSelectedSize('One Size');
                                                            }
                                                        }
                                                    }
                                                }}
                                                className={`flex-shrink-0 relative group ${idx === activeImage ? '' : ''}`}
                                            >
                                                <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImage
                                                    ? "border-blue-500"
                                                    : "border-gray-200 hover:border-gray-400"
                                                    }`}>
                                                    <img
                                                        src={img.url}
                                                        alt={`thumb-${idx}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = "https://placehold.co/100x100/f0f4f8/94a3b8?text=Image";
                                                        }}
                                                    />
                                                </div>

                                                {/* Tooltip on hover with name and price */}
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                                    <div className="text-center">
                                                        <div>{img.label}</div>
                                                        {priceText && <div className="text-green-400 font-semibold">{priceText}</div>}
                                                    </div>
                                                </div>

                                                {/* Price badge on image */}
                                                {priceText && isVariant && (
                                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                                                        {priceText}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {/* Countdown Timer */}
                        {product.is_in_campaign && countdown && (
                            <div className="mx-4 mb-4 mt-2">
                                <div className="rounded-xl p-4 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700">
                                    <div className="flex items-center justify-between text-white mb-3">
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-white" />
                                            <span className="font-semibold">
                                                {product.campaign_details?.campaign_type === 'Flash'
                                                    ? 'Flash Sale ends in'
                                                    : product.campaign_details?.campaign_type === 'Deal of the Day'
                                                        ? ' Deal ends in'
                                                        : 'Featured ends in'}
                                            </span>
                                        </div>
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                            {product.campaign_details?.campaign_type}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-white backdrop-blur-sm rounded-lg p-2 text-center">
                                            <div className="text-2xl font-bold text-blue-500">{countdown.hours}</div>
                                            <div className="text-xs text-blue-500">Hours</div>
                                        </div>
                                        <div className="flex-1 bg-white backdrop-blur-sm rounded-lg p-2 text-center">
                                            <div className="text-2xl font-bold text-blue-500">{countdown.minutes}</div>
                                            <div className="text-xs text-blue-500">Minutes</div>
                                        </div>
                                        <div className="flex-1 bg-white backdrop-blur-sm rounded-lg p-2 text-center">
                                            <div className="text-2xl font-bold text-blue-500 animate-pulse">{countdown.seconds}</div>
                                            <div className="text-xs text-blue-500">Seconds</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Coupon Section */}
                        {productCoupons && productCoupons.length > 0 && (
                            <div className="mx-4 mb-4 mt-2 border border-gray-300 rounded-lg overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div className="flex">
                                    <div className="flex-1 flex items-center justify-center px-4 py-3">
                                        <span className="text-2xl font-bold text-gray-800 tracking-widest">
                                            {firstCoupon?.code || "SAVE25"}
                                        </span>
                                    </div>
                                    <div
                                        onClick={() => {
                                            if (firstCoupon?.code) {
                                                navigator.clipboard.writeText(firstCoupon.code);
                                                addToast(`Coupon ${firstCoupon.code} copied!`, 'success');
                                            }
                                        }}
                                        className="relative group w-28 flex items-center justify-center text-white font-semibold text-sm cursor-pointer transition-all duration-300"
                                    >
                                        <div className="absolute inset-0 bg-blue-600 group-hover:bg-blue-700 transition-colors duration-300"></div>
                                        <div className="absolute left-[-12px] top-0 bottom-0 my-auto w-0 h-0 border-y-[20px] border-y-transparent border-r-[12px] border-r-blue-600 group-hover:border-r-blue-700 duration-300 transition-all"></div>
                                        <span className="relative z-10 group-hover:scale-105 transition-transform">
                                            Copy
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-blue-100 text-center px-3 py-2 border-t border-blue-200">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-sm font-semibold text-blue-800 leading-tight">
                                            {firstCoupon?.title || "Get special discount"}
                                        </span>
                                        {productCoupons.length > 1 && (
                                            <button
                                                onClick={handleViewCoupons}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                            >
                                                View all ({productCoupons.length})
                                                <ChevronRight className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* View All Coupons Button */}
                        {productCoupons && productCoupons.length > 0 && (
                            <div className="mx-4 mb-4">
                                <button
                                    onClick={handleViewCoupons}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1 rounded">
                                            <Tag className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition">
                                                View All Offers
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {productCoupons.length} special {productCoupons.length === 1 ? 'offer' : 'offers'} available
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Content */}
                <div className="col-span-12 lg:col-span-4">
                    <header className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                            {product.product_name}
                        </h1>
                        <p className="text-base text-gray-600 mt-3 leading-relaxed">
                            {product.short_description || "Premium quality product with excellent features and durability."}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-400 text-lg"><FaStar /></span>
                                    <span className="font-semibold text-gray-900">
                                        {reviewStats.count > 0 ? reviewStats.avg.toFixed(1) : "0.0"}
                                    </span>
                                </div>
                                <a href="#reviews" className="text-gray-500 hover:text-blue-600 transition text-sm">
                                    ({reviewStats.count} review{reviewStats.count !== 1 ? "s" : ""})
                                </a>
                            </div>
                        </div>
                    </header>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        {/* Price - Amazon/Flipkart Style */}
                        <div className="flex items-end gap-4 mb-6">
                            <div>
                                <div className="text-3xl font-bold text-gray-900">
                                    ₹{typeof actualPrice === 'number' ? actualPrice.toFixed(2) : '0.00'}
                                </div>
                                {actualOldPrice > actualPrice && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="text-lg text-gray-500 line-through">
                                            ₹{typeof actualOldPrice === 'number' ? actualOldPrice.toFixed(2) : '0.00'}
                                        </div>
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                            {discountPercent}% OFF
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Colors - Amazon/Flipkart Style */}
                        {variants.colors.length > 1 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm font-semibold text-gray-900">Color:</span>
                                    <span className="text-sm text-gray-600">
                                        {variants.colors.find(c => c.id === selectedColor)?.name || ''}
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    {variants.colors.map((color) => {
                                        // Check if this color has any in-stock variants
                                        const hasStock = product.stocks.some(stock =>
                                            stock.color &&
                                            stock.color.toLowerCase().replace(/\s+/g, '_') === color.id &&
                                            stock.stock_quantity > 0
                                        );

                                        return (
                                            <button
                                                key={color.id}
                                                className={`relative w-12 h-12 rounded-full border-2 transition-all transform hover:scale-110 ${selectedColor === color.id
                                                    ? "border-blue-600 ring-2 ring-blue-200"
                                                    : hasStock
                                                        ? "border-gray-300 hover:border-gray-400"
                                                        : "border-gray-200 opacity-50 cursor-not-allowed"
                                                    }`}
                                                style={{ backgroundColor: color.hex }}
                                                onClick={() => {
                                                    if (hasStock) {
                                                        setSelectedColor(color.id);
                                                        // Try to find variant image for this color
                                                        if (color.stock?.variant_image_url) {
                                                            const variantImage = getVariantImage(color.stock);
                                                            const imageIndex = allProductImages.findIndex(img => img.url === variantImage);
                                                            if (imageIndex >= 0) {
                                                                setActiveImage(imageIndex);
                                                            }
                                                        }
                                                    }
                                                }}
                                                disabled={!hasStock}
                                                title={hasStock ? color.name : `${color.name} (Out of Stock)`}
                                            >
                                                {selectedColor === color.id && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                                                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Sizes - Amazon/Flipkart Style */}
                        {variants.sizes.length > 1 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm font-semibold text-gray-900">Size:</span>
                                    <span className="text-sm text-gray-600">{selectedSize}</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {variants.sizes.map((size) => {
                                        // Check if this size is available in selected color
                                        const isAvailable = product.stocks.some(stock =>
                                            stock.color &&
                                            stock.color.toLowerCase().replace(/\s+/g, '_') === selectedColor &&
                                            stock.size?.toUpperCase() === size.id &&
                                            stock.stock_quantity > 0
                                        );

                                        return (
                                            <button
                                                key={size.id}
                                                onClick={() => {
                                                    if (isAvailable) {
                                                        setSelectedSize(size.id);
                                                    }
                                                }}
                                                disabled={!isAvailable}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedSize === size.id
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                                    : isAvailable
                                                        ? "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-sm"
                                                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                    }`}
                                            >
                                                {size.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        {stockQuantity > 0 && (
                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => changeQty(-1)}
                                            className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-gray-600 font-semibold"
                                        >
                                            -
                                        </button>
                                        <div className="px-6 py-3 bg-white font-semibold text-gray-900 min-w-[60px] text-center">
                                            {qty}
                                        </div>
                                        <button
                                            onClick={() => changeQty(1)}
                                            className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-gray-600 font-semibold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddToCartClick}
                                        className={`flex-1 px-6 py-3 rounded-lg font-semibold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${product.is_in_campaign
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-700 hover:to-blue-800'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                       
                                    </button>

                                    <button
                                        onClick={handleBuyNowClick}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-base shadow-md hover:shadow-lg"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Product Features - 2 Columns, 3 Rows */}
                        {descriptionFeatures && descriptionFeatures.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">Key Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {descriptionFeatures.slice(0, 6).map((feature, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
                                            </div>
                                            <span className="text-sm text-gray-700">{feature.value || feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Pincode Checker */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-900">Check Delivery Availability</label>
                            <div className="flex gap-2">
                                <input
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="Enter your pincode"
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                                <button
                                    onClick={applyPincode}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm whitespace-nowrap"
                                >
                                    Check
                                </button>
                            </div>
                            {pincodeResult && (
                                <div
                                    className={`text-sm font-medium ${pincodeResult.ok ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {pincodeResult.ok
                                        ? `✅ Delivery by ${pincodeResult.eta} • Shipping: ₹${pincodeResult.cost}`
                                        : `❌ ${pincodeResult.message}`}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <aside className="col-span-12 lg:col-span-3 space-y-6">
                    {/* Store Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-center mb-4">
                            <img
                                src={vendorLogo || "https://6valley.6amtech.com/storage/app/public/shop/2024-09-19-66ebe16c61ecc.webp"}
                                alt={product.vendor_details?.business_name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 mx-auto mb-3 shadow-sm"
                                onError={(e) => {
                                    console.error('Vendor logo failed to load:', vendorLogo);
                                    e.target.src = "https://6valley.6amtech.com/storage/app/public/shop/2024-09-19-66ebe16c61ecc.webp";
                                }}
                            />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{product.vendor_details?.business_name}</h3>
                            <p className="text-sm text-gray-500 mb-4">Official Store</p>
                        </div>

                        {/* Store Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <div className="text-xl font-bold text-blue-700">{vendorProducts.length + 1}</div>
                                <div className="text-xs text-gray-600">Products</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-xl font-bold text-green-700">{product.rating || 4.5}</div>
                                <div className="text-xs text-gray-600">Rating</div>
                            </div>
                        </div>

                        {/* Store Actions */}
                        <div className="space-y-3">
                            <Link
                                to={`/vendor/${product.vendor_details?.id}`}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm text-center block shadow-md hover:shadow-lg"
                            >
                                Visit Store
                            </Link>
                            <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                                Contact Seller
                            </button>
                        </div>
                    </div>

                    {/* More from Store */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">More from Store</h3>
                            <Link
                                to={`/vendor/${product.vendor_details?.id}`}
                                className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 transition"
                            >
                                View all
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Vendor Products */}
                        <div className="space-y-3">
                            {vendorLoading ? (
                                [...Array(2)].map((_, i) => (
                                    <div key={i} className="flex gap-3 p-3 border border-gray-200 rounded-lg animate-pulse">
                                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))
                            ) : vendorProducts.length > 0 ? (
                                vendorProducts.map((vendorProduct) => {
                                    const vendorProductImage = getProductImage(vendorProduct);

                                    return (
                                        <Link
                                            key={vendorProduct.id}
                                            to={`/product/${vendorProduct.id}`}
                                            className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition group"
                                        >
                                            <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                                <img
                                                    src={vendorProductImage || "https://placehold.co/100x100/f0f4f8/94a3b8?text=Product"}
                                                    alt={vendorProduct.product_name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition"
                                                    onError={(e) => {
                                                        e.target.src = "https://placehold.co/100x100/f0f4f8/94a3b8?text=Product";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                                                    {vendorProduct.product_name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ₹{vendorProduct.stocks?.[0]?.final_price || vendorProduct.stocks?.[0]?.selling_price || '0.00'}
                                                    </span>
                                                    {vendorProduct.stocks?.[0]?.mrp > vendorProduct.stocks?.[0]?.selling_price && (
                                                        <span className="text-xs text-gray-500 line-through">
                                                            ₹{vendorProduct.stocks?.[0]?.mrp}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="text-center py-4 text-sm text-gray-500">
                                    No other products from this store
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Why Shop With Us</h4>
                        <div className="space-y-3">
                            {[
                                { icon: <FaCoins />, text: "Free Shipping Over ₹499" },
                                { icon: <GiReturnArrow />, text: "7-Day Returns" },
                                { icon: <FaShieldAlt />, text: "Secure Payment" },
                                { icon: <FaBox />, text: "Authentic Products" },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span className="text-blue-600">{item.icon}</span>
                                    <span className="text-sm text-gray-700">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Product Details Tabs */}
            <div className="mt-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Tab Headers */}
                    <div className="flex overflow-x-auto border-b border-gray-200">
                        {[
                            { id: "description", label: "Description" },
                            { id: "specs", label: "Specifications" },
                            { id: "reviews", label: "Reviews" },
                            ...(product.warranty_available ? [{ id: "warranty", label: "Warranty" }] : []),
                            { id: "shipping", label: "Shipping & Returns" }
                        ].map((tabItem) => (
                            <button
                                key={tabItem.id}
                                onClick={() => setTab(tabItem.id)}
                                className={`flex-1 min-w-[140px] px-6 py-4 text-sm font-semibold transition-all ${tab === tabItem.id
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                                    }`}
                            >
                                {tabItem.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {tab === "description" && (
                            <div className="prose prose-gray max-w-none">
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed text-base">
                                        {product.full_description || product.short_description || "No description available."}
                                    </p>

                                    {/* Description Features as 2 columns, 3 rows */}
                                    {descriptionFeatures && descriptionFeatures.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {descriptionFeatures.map((feature, index) => (
                                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <span className="text-blue-600 text-xs font-bold">{index + 1}</span>
                                                        </div>
                                                        <span className="text-gray-700">{feature.value || feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {tab === "specs" && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Technical Specifications</h3>

                                {/* Specifications as 2 columns with title and value */}
                                {specifications && specifications.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {specifications.map((spec, index) => (
                                            spec.title && spec.value && (
                                                <div key={index} className="border-b border-gray-200 pb-3">
                                                    <div className="text-sm text-gray-500 mb-1">{spec.title}</div>
                                                    <div className="text-base font-medium text-gray-900">{spec.value}</div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {currentStock && (
                                            <>
                                                {currentStock.color && (
                                                    <div className="border-b border-gray-200 pb-3">
                                                        <div className="text-sm text-gray-500 mb-1">Color</div>
                                                        <div className="text-base font-medium text-gray-900">{currentStock.color}</div>
                                                    </div>
                                                )}
                                                {currentStock.size && (
                                                    <div className="border-b border-gray-200 pb-3">
                                                        <div className="text-sm text-gray-500 mb-1">Size</div>
                                                        <div className="text-base font-medium text-gray-900">{currentStock.size}</div>
                                                    </div>
                                                )}
                                                {currentStock.unit && (
                                                    <div className="border-b border-gray-200 pb-3">
                                                        <div className="text-sm text-gray-500 mb-1">Unit</div>
                                                        <div className="text-base font-medium text-gray-900">{currentStock.unit}</div>
                                                    </div>
                                                )}
                                                {currentStock.weight && (
                                                    <div className="border-b border-gray-200 pb-3">
                                                        <div className="text-sm text-gray-500 mb-1">Weight</div>
                                                        <div className="text-base font-medium text-gray-900">{currentStock.weight}</div>
                                                    </div>
                                                )}
                                                {product.brand_details && (
                                                    <div className="border-b border-gray-200 pb-3">
                                                        <div className="text-sm text-gray-500 mb-1">Brand</div>
                                                        <div className="text-base font-medium text-gray-900">{product.brand_details.brand_name}</div>
                                                    </div>
                                                )}
                                                {product.product_condition && (
                                                    <div className="border-b border-gray-200 pb-3">
                                                        <div className="text-sm text-gray-500 mb-1">Condition</div>
                                                        <div className="text-base font-medium text-gray-900">{product.product_condition}</div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === "reviews" && (
                            <div className="space-y-6">
                                <ServiceReviewSection
                                    modelName="product"
                                    objectId={product.id}
                                    serviceName={product.product_name}
                                    accentColor="blue"
                                    requireDelivery={true}
                                    isDelivered={isProductDelivered}
                                />


                            </div>
                        )}

                        {tab === "warranty" && product.warranty_available && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Warranty Information</h3>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <FaCheckCircle className="text-green-600 text-xl" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-green-800">Warranty Available</h4>
                                            <p className="text-green-700">This product comes with warranty coverage</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        {product.warranty_type && (
                                            <div className="border-b border-green-200 pb-3">
                                                <div className="text-sm text-gray-600 mb-1">Warranty Type</div>
                                                <div className="text-base font-medium text-gray-900">{product.warranty_type}</div>
                                            </div>
                                        )}
                                        {product.warranty_period && (
                                            <div className="border-b border-green-200 pb-3">
                                                <div className="text-sm text-gray-600 mb-1">Warranty Period</div>
                                                <div className="text-base font-medium text-gray-900">{product.warranty_period}</div>
                                            </div>
                                        )}
                                        {product.warranty_description && (
                                            <div className="md:col-span-2 border-b border-green-200 pb-3">
                                                <div className="text-sm text-gray-600 mb-1">Warranty Description</div>
                                                <div className="text-base text-gray-900">{product.warranty_description}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === "shipping" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-4">Shipping Information</h4>
                                    <div className="space-y-4 text-sm text-gray-700">
                                        <div className="flex items-start gap-3">

                                            <div>
                                                <div className="font-semibold text-gray-900">Standard Delivery</div>
                                                <p>{product.estimated_delivery_time || "3-5 business days"}</p>
                                                <p className="text-green-600 font-medium">Free on orders above ₹499</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <div className="font-semibold text-gray-900">Express Delivery</div>
                                                <p>1-2 business days</p>
                                                <p className="text-gray-600">Additional charges may apply</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 mb-4">Return Policy</h4>
                                    <div className="space-y-4 text-sm text-gray-700">
                                        <div className="flex items-start gap-3">

                                            <div>
                                                <div className="font-semibold text-gray-900">Easy Returns</div>
                                                <p>{product.return_policy || "7-day return policy for unused products in original condition."}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">

                                            <div>
                                                <div className="font-semibold text-gray-900">Refund Process</div>
                                                <p>Refunds are processed within 3-5 business days after receiving the returned item.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <div className="font-semibold text-gray-900">Contact Support</div>
                                                <p>For any return-related queries, please contact our customer support team.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Related Products Slider */}
            <div className="mt-12">
                <RelatedProductSlider />
            </div>
        </div>
    );
}