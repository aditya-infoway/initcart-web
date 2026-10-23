//Productlist.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { publicAxios, axiosInstance } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Filter, Eye, Tag, ChevronRight, Zap, ShoppingCart } from "lucide-react";
import MobileProductListPage from "./mobile/MobileProductList";

const MIN_PRICE = 0;
const MAX_PRICE = 200000;
const TRANSITION_DURATION = 300;
const PLACEHOLDER_IMG = "https://placehold.co/600x600/f0f4f8/94a3b8?text=No+Image";

// ---------------------------------------------------------------------------
// IMAGE HELPERS
// ---------------------------------------------------------------------------
const toAbsoluteUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://api.initcart.com${path.startsWith("/") ? "" : "/"}${path}`;
};

// main image -> variant image -> thumbnail -> placeholder
const getProductImage = (product) => {
    if (product.main_image) return toAbsoluteUrl(product.main_image);

    if (product.stocks && product.stocks.length > 0) {
        const stockWithImage = product.stocks.find((s) => s.variant_image || s.variant_image_url);
        if (stockWithImage) {
            return toAbsoluteUrl(stockWithImage.variant_image_url || stockWithImage.variant_image);
        }
    }

    if (product.thumbnail_image) return toAbsoluteUrl(product.thumbnail_image);

    return PLACEHOLDER_IMG;
};

const StarRating = ({ rating }) => (
    <span className="text-yellow-500 flex items-center">
        {Array(5)
            .fill(0)
            .map((_, i) => (
                <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill={i < rating ? "currentColor" : "none"}
                    stroke={i < rating ? "none" : "currentColor"}
                    strokeWidth="1.5"
                    className="w-3 h-3"
                >
                    <path
                        fillRule="evenodd"
                        d="M10.868 2.884c.325-.795 1.48-.795 1.805 0l1.931 4.707 5.176.425c.801.066 1.129 1.055.518 1.574l-3.922 3.23.957 5.063c.15.795-.658 1.455-1.378 1.014L10 16.03l-4.717 2.842c-.72.441-1.528-.219-1.378-1.014l.957-5.063-3.922-3.23c-.611-.519-.283-1.508.518-1.574l5.176-.425 1.931-4.707z"
                        clipRule="evenodd"
                    />
                </svg>
            ))}
    </span>
);

const FilterSection = ({ title, children, isExpanded = true }) => {
    const [expanded, setExpanded] = useState(isExpanded);

    return (
        <div className="border-b border-gray-200 py-4 last:border-b-0">
            <button
                className="w-full flex justify-between items-center text-left font-semibold text-gray-800 hover:text-blue-600 transition"
                onClick={() => setExpanded(!expanded)}
            >
                {title}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expanded ? "rotate-180" : "rotate-0"
                        }`}
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-max-height duration-500 ease-in-out ${expanded ? "max-h-96 pt-3" : "max-h-0"
                    }`}
            >
                {children}
            </div>
        </div>
    );
};

const FilterList = ({ children, isScrollable = false }) => (
    <ul className={`space-y-2 text-sm text-gray-700 ${isScrollable ? 'max-h-64 overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
        {children}
    </ul>
);

// Enhanced Coupons Modal Component - Amazon/Flipkart Style
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
                                            <div className="flex items-center gap-20 mb-3 ">

                                                <div className=" mb-4 mt-2 border border-gray-300 rounded-lg overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50">
                                                    <div className="flex ">
                                                        <div className=" flex items-center justify-between px-4 py-3">
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
                                                <div className="lg:text-right top-2 ">

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
                                                </div>                           </div>
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

// Campaign badge config (Flash / Deal of the Day / Featured)
const CAMPAIGN_BADGES = {
    Flash: { label: "FLASH", cls: "from-orange-500 to-orange-600", icon: true },
    "Deal of the Day": { label: "DEAL OF THE DAY", cls: "from-purple-500 to-purple-600" },
    Featured: { label: "FEATURED", cls: "from-blue-500 to-blue-600" },
};

// ---------------------------------------------------------------------------
// PRODUCT CARD  (whole card is clickable -> product detail)
// ---------------------------------------------------------------------------
const ProductCard = ({ product, openModal, hasCoupons, onViewCoupons, onAddToCart }) => {
    const navigate = useNavigate();
    const [adding, setAdding] = useState(false);

    const [countdown, setCountdown] = useState(null);
    const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });

    // Reviews
    useEffect(() => {
        publicAxios.get("/api/all-review/", { params: { model: "product", object_id: product.id } })
            .then(res => {
                setReviewStats({
                    avg: res.data.average_rating || 0,
                    count: res.data.reviews?.length || 0
                });
            })
            .catch(() => { });
    }, [product.id]);

    // Countdown for ALL campaign types
    useEffect(() => {
        const end = product?.campaign_details?.end_datetime;
        if (!product?.is_in_campaign || !end) {
            setCountdown(null);
            return;
        }

        const calc = () => {
            const distance = new Date(end).getTime() - Date.now();
            if (isNaN(distance) || distance <= 0) {
                setCountdown(null);
                return false;
            }
            setCountdown({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            });
            return true;
        };

        if (!calc()) return;
        const timer = setInterval(() => {
            if (!calc()) clearInterval(timer);
        }, 30000);

        return () => clearInterval(timer);
    }, [product]);

    // Price with campaign support
    const getProductPrice = () => {
        if (product.is_in_campaign && product.campaign_price) {
            return product.campaign_price;
        }
        if (product.stocks && product.stocks.length > 0) {
            const stock = product.stocks[0];
            return stock.final_price > 0 ? stock.final_price : stock.selling_price;
        }
        return product.price || 0;
    };

    const getOldPrice = () => {
        if (product.is_in_campaign && product.campaign_details?.original_price) {
            return product.campaign_details.original_price;
        }
        if (product.stocks && product.stocks.length > 0) {
            return product.stocks[0].mrp || 0;
        }
        return product.old_price || 0;
    };

    const getDiscountPercentage = () => {
        if (product.is_in_campaign && product.campaign_details?.discount_percentage) {
            return Math.round(product.campaign_details.discount_percentage);
        }
        const currentPrice = parseFloat(getProductPrice());
        const oldPrice = parseFloat(getOldPrice());
        if (oldPrice > currentPrice) {
            return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
        }
        return 0;
    };

    const currentPrice = parseFloat(getProductPrice()) || 0;
    const oldPrice = parseFloat(getOldPrice()) || 0;
    const discount = getDiscountPercentage();
    const campaignBadge = product.is_in_campaign
        ? CAMPAIGN_BADGES[product.campaign_details?.campaign_type]
        : null;
    const condition = product.product_condition;

    const goToDetail = () => navigate(`/product/${product.id}`);

    return (
        <div
            role="link"
            tabIndex={0}
            onClick={goToDetail}
            onKeyDown={(e) => {
                if (e.key === "Enter") goToDetail();
            }}
            className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {/* Special offers ribbon */}
            {hasCoupons && (
                <div className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-500 px-3 py-1 text-center text-[10px] font-bold text-white shadow-md sm:text-xs">
                    <div className="flex items-center justify-center gap-1.5">
                        <Tag className="h-3 w-3" />
                        <span className="truncate">SPECIAL OFFERS AVAILABLE</span>
                        <Zap className="h-3 w-3" />
                    </div>
                </div>
            )}

            {/* Image area */}
            <div className="relative p-2.5 pb-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
                    <img
                        src={getProductImage(product)}
                        alt={product.product_name}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/600x600/f0f4f8/94a3b8?text=Image+Error";
                        }}
                    />
                </div>

                {/* Top-left badges: campaign + discount */}
                <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-1">
                    {campaignBadge && (
                        <span
                            className={`flex items-center gap-1 rounded bg-gradient-to-r ${campaignBadge.cls} px-1.5 py-0.5 text-[10px] font-bold text-white shadow`}
                        >
                            {campaignBadge.icon && <Zap className="h-3 w-3" />}
                            {campaignBadge.label}
                        </span>
                    )}
                    {discount > 0 && (
                        <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white shadow">
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* Top-right: product condition */}
                {condition && (
                    <span className="absolute right-4 top-4 z-10 rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-gray-900 shadow">
                        {condition}
                    </span>
                )}

                {/* Quick view */}
                <button
                    type="button"
                    onClick={(e) => openModal(product, e)}
                    aria-label="Quick View"
                    className="absolute bottom-4 right-4 z-20 rounded-full bg-white/95 p-2 text-blue-600 opacity-0 shadow-lg transition duration-300 hover:scale-110 hover:bg-white group-hover:opacity-100"
                >
                    <Eye className="h-4 w-4" />
                </button>
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col border-t border-gray-100 px-3.5 py-3">
                <h4 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug text-gray-800 transition group-hover:text-blue-600">
                    {product.product_name}
                </h4>

                {/* Rating */}
                <div className="mb-2 flex items-center text-xs text-gray-500">
                    <StarRating rating={Math.round(reviewStats.avg) || 0} />
                    <span className="ml-1">({reviewStats.count})</span>
                </div>

                <div className="mt-auto">
                    {/* Price */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-lg font-bold text-blue-600">₹{currentPrice.toFixed(2)}</span>
                        {oldPrice > currentPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{oldPrice.toFixed(2)}</span>
                        )}
                        {discount > 0 && (
                            <span className="text-xs font-semibold text-green-600">{discount}% off</span>
                        )}
                    </div>

                    {/* Countdown (all campaigns) */}
                    {countdown && (
                        <div className="mt-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 text-white shadow-sm">
                            <span className="text-[11px] text-white/80">Ends in</span>
                            <div className="flex items-center gap-1 text-[11px] font-bold">
                                {countdown.days > 0 && (
                                    <span className="rounded bg-white/20 px-1.5 py-0.5">{countdown.days}d</span>
                                )}
                                <span className="rounded bg-white/20 px-1.5 py-0.5">{countdown.hours}h</span>
                                <span className="rounded bg-white/20 px-1.5 py-0.5">{countdown.minutes}m</span>
                            </div>
                        </div>
                    )}

                    {/* Coupon offers */}
                    {hasCoupons && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onViewCoupons(product);
                            }}
                            className="group/coupon mt-2.5 flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-2 text-left"
                        >
                            <div className="flex items-center gap-2">
                                <div className="rounded bg-blue-500 p-1">
                                    <Tag className="h-3 w-3 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">Special Offers Available</p>
                                    <p className="text-[10px] text-gray-600">View all coupons</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover/coupon:text-blue-500" />
                        </button>
                    )}

                    {/* Add to cart (click does NOT open detail page) */}
                    <button
                        type="button"
                        disabled={adding || !product.stocks?.[0]?.id}
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const stockId = product.stocks?.[0]?.id;
                            if (!stockId) return;
                            try {
                                setAdding(true);
                                await onAddToCart(stockId, 1);
                            } catch (err) {
                                /* error toast already shown */
                            } finally {
                                setAdding(false);
                            }
                        }}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {adding ? "Adding..." : "Add to cart"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PriceRangeFilter = ({ minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
    const STEP = 100;

    const [minInput, setMinInput] = useState(minPrice.toString());
    const [maxInput, setMaxInput] = useState(maxPrice.toString());


    useEffect(() => {
        setMinInput(minPrice.toString());
    }, [minPrice]);

    useEffect(() => {
        setMaxInput(maxPrice.toString());
    }, [maxPrice]);

    const rangeProgress = useMemo(() => {
        const total = MAX_PRICE - MIN_PRICE;
        const start = ((minPrice - MIN_PRICE) / total) * 100;
        const end = ((maxPrice - MIN_PRICE) / total) * 100;
        return { start, end };
    }, [minPrice, maxPrice]);

    const handleRangeChange = (e, type) => {
        const value = Number(e.target.value);
        if (type === 'min') {
            const newMin = Math.min(value, maxPrice);
            setMinPrice(newMin);
        } else {
            const newMax = Math.max(value, minPrice);
            setMaxPrice(newMax);
        }
    };

    const handleInputChange = (e, type) => {
        const value = e.target.value.replace(/[^0-9]/g, '');

        if (type === 'min') {
            setMinInput(value);
        } else {
            setMaxInput(value);
        }

        const numberValue = Number(value);

        if (!isNaN(numberValue) && e.type === 'blur') {
            if (type === 'min') {
                let newMin = Math.round(Math.max(MIN_PRICE, numberValue) / STEP) * STEP;
                newMin = Math.min(newMin, maxPrice);
                setMinPrice(newMin);
            } else {
                let newMax = Math.round(Math.min(MAX_PRICE, numberValue) / STEP) * STEP;
                newMax = Math.max(newMax, minPrice);
                setMaxPrice(newMax);
            }
        }
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between gap-4 mb-4">
                <div className="flex flex-col flex-1">
                    <label htmlFor="min-price-text" className="text-xs text-gray-500 mb-1">Min Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input
                            id="min-price-text"
                            type="text"
                            value={minInput}
                            onChange={(e) => handleInputChange(e, 'min')}
                            onBlur={(e) => handleInputChange(e, 'min')}
                            className="w-full border border-gray-300 rounded-lg py-2 pl-6 pr-3 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                            inputMode="numeric"
                        />
                    </div>
                </div>
                <div className="flex flex-col flex-1">
                    <label htmlFor="max-price-text" className="text-xs text-gray-500 mb-1">Max Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input
                            id="max-price-text"
                            type="text"
                            value={maxInput}
                            onChange={(e) => handleInputChange(e, 'max')}
                            onBlur={(e) => handleInputChange(e, 'max')}
                            className="w-full border border-gray-300 rounded-lg py-2 pl-6 pr-3 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                            inputMode="numeric"
                        />
                    </div>
                </div>
            </div>
            <div className="relative h-2 rounded-full bg-gray-200">
                <div
                    className="absolute h-2 w-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full "
                    style={{
                        left: `${rangeProgress.start}%`,
                        width: `${rangeProgress.end - rangeProgress.start}%`,
                    }}
                ></div>

                <div
                    className="absolute w-4 h-4 rounded-full bg-blue-600 -top-1 shadow-md border-2 border-white pointer-events-none"
                    style={{
                        left: `${rangeProgress.start}%`,
                        transform: 'translateX(-50%)',
                        zIndex: 10,
                    }}
                ></div>

                <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={STEP}
                    value={minPrice}
                    onChange={(e) => handleRangeChange(e, 'min')}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none"
                    style={{ zIndex: 4 }}
                />

                <input
                    type="range"
                    min={MIN_PRICE}
                    max={MAX_PRICE}
                    step={STEP}
                    value={maxPrice}
                    onChange={(e) => handleRangeChange(e, 'max')}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none"
                    style={{ zIndex: 3 }}
                />
            </div>

            <style>{`
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: transparent;
                    cursor: pointer;
                    margin-top: -7px;
                    pointer-events: all;
                    box-shadow: none;
                }

                input[type=range]::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: transparent;
                    cursor: pointer;
                    pointer-events: all;
                    box-shadow: none;
                    border: none;
                }

                input[type=range]:hover::-webkit-slider-thumb {
                    background: rgba(37, 99, 235, 0.1);
                }
            `}</style>
        </div>
    );
};

// ---------------------------------------------------------------------------
// QUICK VIEW MODAL  (Add to cart lives here now)
// ---------------------------------------------------------------------------
const QuickViewModal = ({ modalProduct, onClose, isModalOpen, onAddToCart }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [quantity, setQuantity] = useState(1);

    if (!modalProduct) return null;

    const getProductPrice = () => {
        if (modalProduct.stocks && modalProduct.stocks.length > 0) {
            const stock = modalProduct.stocks[0];
            return stock.final_price > 0 ? stock.final_price : stock.selling_price;
        }
        return modalProduct.price || 0;
    };

    const getOldPrice = () => {
        if (modalProduct.stocks && modalProduct.stocks.length > 0) {
            return modalProduct.stocks[0].mrp || 0;
        }
        return modalProduct.old_price || 0;
    };

    const getMaxOrderQuantity = () => {
        if (modalProduct.stocks && modalProduct.stocks.length > 0) {
            return modalProduct.stocks[0].maximum_order_quantity || 10;
        }
        return 10;
    };

    const price = parseFloat(getProductPrice());
    const oldPrice = getOldPrice() > 0 ? parseFloat(getOldPrice()) : null;
    const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
    const maxQuantity = getMaxOrderQuantity();

    const handleDecrease = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    const handleIncrease = () => {
        setQuantity(prev => Math.min(maxQuantity, prev + 1));
    };

    const handleViewDetails = () => {
        onClose();
        navigate(`/product/${modalProduct.id}`);
    };

    const handleAddToCartClick = async () => {
        onClose();

        try {
            const productStockId = modalProduct.stocks && modalProduct.stocks.length > 0
                ? modalProduct.stocks[0].id
                : null;

            if (!productStockId) {
                addToast('Product stock not available', 'error');
                return;
            }

            await onAddToCart(productStockId, quantity);

        } catch (error) {
            console.error('Add to cart error:', error);
        }
    };

    const backdropClass = `fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'} ${isModalOpen ? 'bg-black/40' : 'bg-black/0'} ${isModalOpen ? "pointer-events-auto" : "pointer-events-none"}`;
    const modalContentClass = `w-11/12 max-w-2xl rounded-lg bg-white p-6 shadow-2xl transition-all duration-300 transform ${isModalOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}`;

    return (
        <div
            className={backdropClass}
            onClick={onClose}
        >
            <div
                className={modalContentClass}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 truncate pr-4">Quick View: {modalProduct.product_name}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex gap-6">
                    <div className="w-1/2 flex flex-col items-center">
                        <img
                            src={getProductImage(modalProduct)}
                            alt={modalProduct.product_name}
                            className="w-full aspect-square object-contain rounded-lg border border-gray-200 bg-white"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/400x400/f0f4f8/94a3b8?text=Image+Error"
                            }}
                        />

                    </div>

                    <div className="w-1/2">
                        <p className="text-sm text-gray-500">0 Orders &bull; 0 Wish Listed</p>
                        <div className="flex items-baseline gap-3 mt-2">
                            <span className="text-3xl font-extrabold text-blue-600">₹{price.toFixed(2)}</span>
                            {oldPrice && (
                                <span className="text-lg text-gray-400 line-through">₹{oldPrice.toFixed(2)}</span>
                            )}
                            {discount > 0 && (
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Save {discount}%</span>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
                            <div className="flex items-center border border-gray-300 rounded-md w-32">
                                <button
                                    className="p-1.5 cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-l-md"
                                    onClick={handleDecrease}
                                    disabled={quantity <= 1}
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    value={quantity}
                                    readOnly
                                    className="w-full text-center border-l border-r border-gray-300 py-1.5 text-sm font-medium bg-white"
                                />
                                <button
                                    className="p-1.5 cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-r-md"
                                    onClick={handleIncrease}
                                    disabled={quantity >= maxQuantity}
                                    type="button"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Maximum order quantity: <span className="font-semibold">{maxQuantity}</span> units
                            </p>
                        </div>

                        <p className="text-sm text-gray-600 mt-3">
                            Total Price: <strong>₹{(price * quantity).toFixed(2)}</strong>
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleAddToCartClick}
                                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm"
                            >
                                Add to Cart
                            </button>

                            <button
                                onClick={handleViewDetails}
                                className="flex-1 rounded-lg bg-gray-200 py-2.5 text-gray-700 font-semibold hover:bg-gray-300 transition text-sm"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

const MobileFilterSidebar = ({
    isOpen,
    onClose,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    categories,
    selectedCategoryIds,
    setSelectedCategoryIds,
    brands,
    selectedBrands,
    setSelectedBrands,
    selectedConditions,
    setSelectedConditions,
    vendorSearch,
    setVendorSearch,
    onApplyFilters
}) => {
    return (
        <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            ></div>

            <div className={`fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            ✗
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {/* Price Range Filter */}
                        <FilterSection title="Price Range">
                            <PriceRangeFilter
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                setMinPrice={setMinPrice}
                                setMaxPrice={setMaxPrice}
                            />
                        </FilterSection>

                        {/* Vendor Search Filter */}
                        <FilterSection title="Search by Vendor">
                            <div className="mt-2">
                                <input
                                    type="text"
                                    placeholder="Enter vendor name..."
                                    value={vendorSearch || ''}
                                    onChange={(e) => setVendorSearch(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </FilterSection>

                        {/* Categories Filter */}
                        <FilterSection title="Categories">
                            <FilterList isScrollable={true}>
                                {categories.map(category => (
                                    <li key={category.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                            id={`mobile-category-${category.id}`}
                                            checked={selectedCategoryIds.includes(category.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                                                } else {
                                                    setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== category.id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`mobile-category-${category.id}`} className="cursor-pointer">
                                            {category.name} ({category.product_count || 0})
                                        </label>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>

                        {/* Brands Filter */}
                        <FilterSection title="Brands">
                            <FilterList isScrollable={true}>
                                {brands.map(brand => (
                                    <li key={brand.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                                id={`mobile-brand-${brand.id}`}
                                                checked={selectedBrands.includes(brand.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedBrands([...selectedBrands, brand.id]);
                                                    } else {
                                                        setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`mobile-brand-${brand.id}`} className="cursor-pointer">{brand.brand_name}</label>
                                        </div>
                                        <span className="text-xs text-gray-500">({brand.product_count || 0})</span>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>

                        {/* Product Condition Filter */}
                        <FilterSection title="Product Condition">
                            <FilterList>
                                {['New', 'Used', 'Refurbished', 'Like New'].map(condition => (
                                    <li key={condition} className="flex items-center gap-2 py-1">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                            id={`mobile-condition-${condition}`}
                                            checked={selectedConditions?.includes(condition) || false}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedConditions([...(selectedConditions || []), condition]);
                                                } else {
                                                    setSelectedConditions((selectedConditions || []).filter(c => c !== condition));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`mobile-condition-${condition}`} className="cursor-pointer">
                                            {condition}
                                        </label>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>
                    </div>

                    <div className="p-4 border-t">
                        <button
                            onClick={onApplyFilters}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Apply Filters ({selectedCategoryIds.length + selectedBrands.length + (selectedConditions?.length || 0)})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProductListPage() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalProduct, setModalProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState([]);
    const [selectedSubsubcategoryIds, setSelectedSubsubcategoryIds] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [vendorSearch, setVendorSearch] = useState(""); // Vendor business name search

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observerRef = useRef(null);
    const isFirstRender = useRef(true);

    // Coupon related states
    const [showCouponsModal, setShowCouponsModal] = useState(false);
    const [productCoupons, setProductCoupons] = useState({});
    const [couponsLoading, setCouponsLoading] = useState(false);

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToast } = useToast();

    // Check mobile view on resize
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        checkMobileView();
        window.addEventListener('resize', checkMobileView);

        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    }, []);

    const formatProduct = (product) => {
        const productName = product.product_name || "Unnamed Product";
        return {
            ...product,
            id: product.id,
            product_name: productName,
            main_image: product.main_image,
            description: product.short_description || product.full_description || "",
            rating: product.rating || 4,
            review_count: product.review_count || 0,
            status: product.status,
            category: product.category?.id || product.category,
            subcategory: product.subcategory?.id || product.subcategory,
            subsubcategory: product.subsubcategory?.id || product.subsubcategory,
            brand: product.brand,
            vendor: product.vendor,
            stocks: product.stocks || [],
            gallery: product.gallery || [],
            price: (() => {
                if (product.stocks && product.stocks.length > 0) {
                    const stock = product.stocks[0];
                    return parseFloat(stock.final_price > 0 ? stock.final_price : stock.selling_price) || 0;
                }
                return product.price || 0;
            })(),
            old_price: (() => {
                if (product.stocks && product.stocks.length > 0) {
                    return parseFloat(product.stocks[0].mrp) || 0;
                }
                return product.old_price || 0;
            })(),
            max_quantity: (() => {
                if (product.stocks && product.stocks.length > 0) {
                    return product.stocks[0].maximum_order_quantity || 10;
                }
                return 10;
            })()
        };
    };

    const buildQueryParams = (pageNum) => {
        const params = new URLSearchParams();
        params.set('page', pageNum);
        params.set('page_size', 20);
        if (selectedCategoryIds.length > 0) params.set('category_ids', selectedCategoryIds.join(','));
        if (selectedBrands.length > 0) params.set('brand_ids', selectedBrands.join(','));
        if (selectedConditions.length > 0) params.set('conditions', selectedConditions.join(','));
        if (vendorSearch) params.set('vendor_search', vendorSearch);
        if (minPrice > 0) params.set('min_price', minPrice);
        if (maxPrice > 0) params.set('max_price', maxPrice);
        return params.toString();
    };

    // Add to cart function (used by Quick View modal)
    const addToCart = async (productStockId, quantity = 1) => {
        try {
            if (!isAuthenticated()) {
                addToast('Please login to add items to cart', 'warning');
                sessionStorage.setItem('pendingCartProduct', JSON.stringify({
                    productStockId,
                    quantity
                }));
                sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                setShowLoginModal(true);
                return;
            }

            const response = await axiosInstance.post('api/public/cart/', {
                product_stock: productStockId,
                quantity: quantity
            });

            if (response.data.success) {
                addToast('Added to cart successfully!', 'success');

                // Check if product has coupons
                const productId = products.find(p =>
                    p.stocks && p.stocks.some(s => s.id === productStockId)
                )?.id;

                if (productId) {
                    fetchCouponsForProduct(productId);
                }

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

    // Fetch coupons for a product
    const fetchCouponsForProduct = async (productId) => {
        try {
            setCouponsLoading(true);
            const response = await publicAxios.get(`ecommerce/public/coupons/product/${productId}/`);
            if (response.data.success) {
                setProductCoupons(prev => ({
                    ...prev,
                    [productId]: response.data.coupons
                }));
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setCouponsLoading(false);
        }
    };

    // Fetch coupons for all products
    const fetchCouponsForAllProducts = async (productsList) => {
        try {

            const updatedCoupons = { ...productCoupons };

            const couponPromises = productsList.map(async (product) => {
                try {
                    const response = await publicAxios.get(`ecommerce/public/coupons/product/${product.id}/`);
                    if (response.data.success && response.data.coupons.length > 0) {
                        updatedCoupons[product.id] = response.data.coupons;
                    }
                } catch (error) {
                    console.error(`Error fetching coupons for product ${product.id}:`, error);
                }
            });

            await Promise.all(couponPromises);
            setProductCoupons(updatedCoupons);
        } catch (error) {
            console.error("Error fetching coupons for all products:", error);
        }
    };

    // Handle view coupons
    const handleViewCoupons = (product) => {
        setModalProduct(product);

        if (!productCoupons[product.id]) {
            fetchCouponsForProduct(product.id);
        }

        setShowCouponsModal(true);
    };

    // Handle apply coupon
    const handleApplyCoupon = (couponCode) => {
        navigate('/cart', {
            state: {
                applyCoupon: couponCode,
                fromProduct: modalProduct?.id
            }
        });
    };
    // Login modal handlers
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

    const fetchProductsWithFilters = async (pageNum, replace = false) => {
        try {
            if (replace) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            const query = buildQueryParams(pageNum);
            const response = await publicAxios.get(`ecommerce/public/products/?${query}`);

            if (response.data && Array.isArray(response.data.results)) {
                const formattedProducts = response.data.results.map(formatProduct);

                setProducts(prev => replace ? formattedProducts : [...prev, ...formattedProducts]);
                setHasMore(response.data.next !== null);
                setPage(pageNum);

                setTimeout(() => {
                    fetchCouponsForAllProducts(formattedProducts);
                }, 500);
            } else {
                throw new Error("Invalid API response format");
            }
        } catch (err) {
            console.error("❌ Error fetching products:", err);
            if (replace) {
                setError("Failed to load products. Please try again.");
                loadSampleProducts();
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchMoreProducts = () => {
        if (loadingMore || !hasMore || loading) return;
        fetchProductsWithFilters(page + 1, false);
    };

    // Fetch categories and brands
    const fetchFilters = async () => {
        try {
            const [categoriesRes, brandsRes] = await Promise.all([
                publicAxios.get("ecommerce/public/categories/"),
                publicAxios.get("ecommerce/public/brands/")
            ]);

            if (categoriesRes.data) {
                setCategories(categoriesRes.data);
            }
            if (brandsRes.data) {
                setBrands(brandsRes.data);
            }
        } catch (err) {
            console.error("Error fetching filters:", err);
        }
    };

    // Sample products for fallback
    const loadSampleProducts = () => {
        const sampleProducts = [
            {
                id: 1,
                product_name: "IPhone 14 Pro Max",
                price: 114900,
                old_price: 129900,
                main_image: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-22-66f0027e72108.webp",
                description: "The latest smartphone with incredible camera performance and battery life.",
                rating: 5,
                review_count: 12,
                status: "approved",
                stocks: [
                    {
                        id: 1,
                        final_price: 114900,
                        selling_price: 114900,
                        mrp: 129900,
                        maximum_order_quantity: 5
                    }
                ],
                gallery: []
            },
            {
                id: 2,
                product_name: "Beauty Jelly Lipstick",
                price: 320,
                old_price: 450,
                main_image: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-19-66ec01ed63b50.webp",
                description: "Hydrating jelly lipstick that changes color based on temperature.",
                rating: 4,
                review_count: 20,
                status: "approved",
                stocks: [
                    {
                        id: 2,
                        final_price: 320,
                        selling_price: 320,
                        mrp: 450,
                        maximum_order_quantity: 20
                    }
                ],
                gallery: []
            }
        ];
        setProducts(sampleProducts);
    };

    // Filters ab backend API se aate hain, isliye yahan sirf products use karo
    const filteredProducts = products;

    const openModal = (product, e) => {
        e.preventDefault();
        e.stopPropagation();
        setModalProduct(product);
        setTimeout(() => setIsModalOpen(true), 10);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setModalProduct(null), TRANSITION_DURATION);
    };

    // Fetch categories/brands once on mount
    useEffect(() => {
        fetchFilters();
    }, []);

    // Fetch products on mount + whenever any filter changes (debounced)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setPage(1);
            setHasMore(true);
            fetchProductsWithFilters(1, true);
            return;
        }

        const timer = setTimeout(() => {
            setPage(1);
            setHasMore(true);
            fetchProductsWithFilters(1, true);
        }, 400); // typing/slider ke liye thoda wait karta hai, taaki har keystroke pe call na jaye

        return () => clearTimeout(timer);
    }, [selectedCategoryIds, selectedBrands, selectedConditions, vendorSearch, minPrice, maxPrice]);

    // Infinite scroll observer
    useEffect(() => {
        if (!observerRef.current || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    fetchMoreProducts();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(observerRef.current);

        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [hasMore, loadingMore, page, loading]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (isMobile) {
        return <MobileProductListPage />;
    }

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen font-inter">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        <aside className="hidden md:block md:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit self-start">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="mb-4">
                                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        <div className="md:col-span-3 lg:col-span-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 animate-pulse h-full flex flex-col overflow-hidden">
                                        <div className="aspect-square bg-gray-200 m-2.5 rounded-lg"></div>
                                        <div className="p-3.5 border-t border-gray-100">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                                            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-inter">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLoginClick}
                onRegister={handleRegisterClick}
            />

            {/* Enhanced Coupons Modal */}
            {modalProduct && showCouponsModal && (
                <CouponsModal
                    product={modalProduct}
                    coupons={productCoupons[modalProduct.id] || []}
                    onClose={() => {
                        setShowCouponsModal(false);
                        setModalProduct(null);
                    }}
                    onApplyCoupon={handleApplyCoupon}
                />
            )}

            {/* Mobile Filter Sidebar */}
            <MobileFilterSidebar
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
                minPrice={minPrice}
                maxPrice={maxPrice}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                categories={categories}
                selectedCategoryIds={selectedCategoryIds}
                setSelectedCategoryIds={setSelectedCategoryIds}
                brands={brands}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                selectedConditions={selectedConditions}
                setSelectedConditions={setSelectedConditions}
                vendorSearch={vendorSearch}
                setVendorSearch={setVendorSearch}
                onApplyFilters={() => setShowMobileFilters(false)}
            />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {/* Desktop Filters Sidebar */}
                    <aside className="hidden md:block md:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit self-start sticky top-6">
                        <h3 className="font-bold text-lg mb-6 text-gray-800 border-b pb-3">Filter By</h3>

                        <FilterSection title="Price Range">
                            <PriceRangeFilter
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                setMinPrice={setMinPrice}
                                setMaxPrice={setMaxPrice}
                            />
                        </FilterSection>

                        <FilterSection title="Categories">
                            <FilterList isScrollable={true}>
                                {categories.map(category => (
                                    <li key={category.id} className="flex items-center gap-2 py-1">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                            id={`category-${category.id}`}
                                            checked={selectedCategoryIds.includes(category.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                                                } else {
                                                    setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== category.id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`category-${category.id}`} className="cursor-pointer">
                                            {category.name} ({category.product_count || 0})
                                        </label>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>

                        <FilterSection title="Brands">
                            <FilterList isScrollable={true}>
                                {brands.map(brand => (
                                    <li key={brand.id} className="flex items-center justify-between py-1">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                                id={`brand-${brand.id}`}
                                                checked={selectedBrands.includes(brand.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedBrands([...selectedBrands, brand.id]);
                                                    } else {
                                                        setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`brand-${brand.id}`} className="cursor-pointer">{brand.brand_name}</label>
                                        </div>
                                        <span className="text-xs text-gray-500">({brand.product_count || 0})</span>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>
                        <FilterSection title="Product Condition">
                            <FilterList>
                                {['New', 'Used', 'Refurbished', 'Like new'].map(condition => (
                                    <li key={condition} className="flex items-center gap-2 py-1">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
                                            id={`condition-${condition}`}
                                            checked={selectedConditions.includes(condition)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedConditions([...selectedConditions, condition]);
                                                } else {
                                                    setSelectedConditions(selectedConditions.filter(c => c !== condition));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`condition-${condition}`} className="cursor-pointer">
                                            {condition}
                                        </label>
                                    </li>
                                ))}
                            </FilterList>
                        </FilterSection>
                    </aside>

                    {/* Main Content */}
                    <div className="md:col-span-3 lg:col-span-4">
                        {/* Search Header */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                                <div className="text-sm font-medium text-gray-600 order-2 md:order-1 whitespace-nowrap w-full md:w-auto">
                                    <span className="font-bold text-gray-900">{filteredProducts.length}</span> Products Found
                                </div>

                                <div className="flex items-center gap-3 w-full order-1 md:order-2">
                                    {/* Mobile Filter Button */}
                                    <button
                                        onClick={() => setShowMobileFilters(true)}
                                        className="md:hidden border border-gray-300 rounded-lg py-2 px-4 text-sm hover:bg-gray-50 transition flex items-center gap-2 flex-shrink-0"
                                    >
                                        <Filter size={16} />
                                        <span className="hidden xs:inline">Filters</span>
                                    </button>

                                    {/* Search Bar */}
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="Search products, brands, and more..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl py-2.5 pl-4 pr-12 text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button className="absolute right-0 top-0 bottom-0 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-r-xl text-white hover:from-blue-600 hover:to-blue-700 transition">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Desktop Sort Options */}
                                    <div className="hidden md:flex gap-2">
                                        <select className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500">
                                            <option>Sort by: Price</option>
                                            <option>Price: Low to High</option>
                                            <option>Price: High to Low</option>
                                            <option>Rating: High to Low</option>
                                            <option>Newest First</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applied Filters Display */}
                        {(selectedCategoryIds.length > 0 || selectedBrands.length > 0 || selectedConditions.length > 0) && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-medium text-blue-800">Applied Filters</h4>
                                    <button
                                        onClick={() => {
                                            setSelectedCategoryIds([]);
                                            setSelectedBrands([]);
                                            setSelectedConditions([]);
                                            setVendorSearch('');
                                            setMinPrice(0);
                                            setMaxPrice(0);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {/* Category filters */}
                                    {selectedCategoryIds.map(catId => {
                                        const category = categories.find(c => c.id === catId);
                                        return category && (
                                            <span key={catId} className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                                                {category.name}
                                                <button onClick={() => setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== catId))}>
                                                    ✗
                                                </button>
                                            </span>
                                        );
                                    })}

                                    {/* Brand filters */}
                                    {selectedBrands.map(brandId => {
                                        const brand = brands.find(b => b.id === brandId);
                                        return brand && (
                                            <span key={brandId} className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                                                {brand.brand_name}
                                                <button onClick={() => setSelectedBrands(selectedBrands.filter(id => id !== brandId))}>
                                                    ✗
                                                </button>
                                            </span>
                                        );
                                    })}

                                    {/* Product Condition filters */}
                                    {selectedConditions.map(condition => (
                                        <span key={condition} className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                                            {condition}
                                            <button onClick={() => setSelectedConditions(selectedConditions.filter(c => c !== condition))}>
                                                ✗
                                            </button>
                                        </span>
                                    ))}

                                    {/* Vendor Search filter */}
                                    {vendorSearch && (
                                        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                                            Vendor: {vendorSearch}
                                            <button onClick={() => setVendorSearch('')}>
                                                ✗
                                            </button>
                                        </span>
                                    )}

                                    {/* Price filter */}
                                    {(minPrice > 0 || maxPrice > 0) && (
                                        <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full">
                                            ₹{minPrice} - ₹{maxPrice}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-blue-50 border border-blue-200 rounded-xl">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-blue-700 text-sm">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Products Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    No Products Found
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {searchTerm || selectedCategoryIds.length > 0 || selectedBrands.length > 0
                                        ? "No products match your current filters. Try adjusting your search criteria."
                                        : "There are no products available at the moment."}
                                </p>
                                <button
                                    onClick={() => fetchProductsWithFilters(1, true)}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition font-medium"
                                >
                                    Refresh Products
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                    {filteredProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            openModal={openModal}
                                            hasCoupons={productCoupons[product.id] && productCoupons[product.id].length > 0}
                                            onViewCoupons={handleViewCoupons}
                                            onAddToCart={addToCart}
                                        />
                                    ))}
                                </div>

                                {/* Infinite Scroll Loader */}
                                <div ref={observerRef} className="w-full py-8 flex justify-center">
                                    {loadingMore && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            <span className="text-sm">Loading more products...</span>
                                        </div>
                                    )}
                                    {!hasMore && products.length > 0 && (
                                        <p className="text-sm text-gray-400">You've seen all products</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            {modalProduct && !showCouponsModal && (
                <QuickViewModal
                    modalProduct={modalProduct}
                    onClose={closeModal}
                    isModalOpen={isModalOpen}
                    onAddToCart={addToCart}
                />
            )}
        </div>
    );
}