import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { publicAxios } from "../../api/axios";
import {
    FiStar,
    FiShoppingBag,
    FiMapPin,
    FiMail,
    FiPhone,
    FiClock,
    FiZap,
    FiChevronLeft,
    FiHeart,
    FiSearch,
    FiGrid,
    FiList,
    FiChevronDown,
    FiTag,
    FiPackage,
    FiAlertCircle,
    FiCheckCircle,
} from "react-icons/fi";

// ─── Star Rating ────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = "sm" }) => {
    const sz = size === "sm" ? "w-3 h-3" : "w-4 h-4";
    return (
        <span className="flex items-center gap-0.5">
            {Array(5)
                .fill(0)
                .map((_, i) => (
                    <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill={i < Math.round(rating) ? "#FBBF24" : "none"}
                        stroke={i < Math.round(rating) ? "#FBBF24" : "#D1D5DB"}
                        strokeWidth="1.5"
                        className={sz}
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
};

// ─── Campaign Badge ──────────────────────────────────────────────────────────
const CampaignBadge = ({ type }) => {
    const badges = {
        Flash: { bg: "from-red-500 to-orange-500", icon: <FiZap className="w-2.5 h-2.5" />, label: "FLASH" },
        "Deal of the Day": { bg: "from-violet-500 to-purple-600", icon: <FiClock className="w-2.5 h-2.5" />, label: "DEAL" },
        Featured: { bg: "from-blue-500 to-indigo-600", icon: <FiTag className="w-2.5 h-2.5" />, label: "FEATURED" },
        default: { bg: "from-emerald-500 to-teal-600", icon: <FiTag className="w-2.5 h-2.5" />, label: "OFFER" },
    };
    const b = badges[type] || badges.default;
    return (
        <div className={`absolute top-2 left-2 z-10 bg-gradient-to-r ${b.bg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-md`}>
            {b.icon} {b.label}
        </div>
    );
};

// ─── Product Card (Mobile Grid) ──────────────────────────────────────────────
// ─── Product Card (Mobile Grid) ──────────────────────────────────────────────
const MobileProductCard = ({ product }) => {
    const [imgErr, setImgErr] = useState(false);
    
    // ✅ DYNAMIC RATING
    const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });

    useEffect(() => {
        publicAxios.get("/api/all-review/", {
            params: { model: "product", object_id: product.id }
        })
        .then(res => {
            setReviewStats({
                avg: res.data.average_rating || 0,
                count: res.data.reviews?.length || 0
            });
        })
        .catch(() => {});
    }, [product.id]);

    const getImage = () => {
        if (imgErr) return "https://placehold.co/300x300/f1f5f9/94a3b8?text=No+Image";
        if (product.stocks?.[0]?.variant_image) return ensureAbsolute(product.stocks[0].variant_image);
        if (product.main_image) return ensureAbsolute(product.main_image);
        if (product.gallery?.length > 0) return ensureAbsolute(product.gallery[0].image);
        return "https://placehold.co/300x300/f1f5f9/94a3b8?text=No+Image";
    };

    const ensureAbsolute = (p) => (p?.startsWith("http") ? p : `https://api.initcart.in${p?.startsWith("/") ? "" : "/"}${p}`);

    const currentPrice = product.is_in_campaign && product.campaign_price
        ? product.campaign_price
        : product.stocks?.[0]?.final_price > 0
            ? product.stocks[0].final_price
            : product.stocks?.[0]?.selling_price ?? product.price ?? 0;

    const mrp = product.campaign_details?.original_price || product.stocks?.[0]?.mrp || product.old_price || 0;
    const hasDiscount = mrp > currentPrice;
    const discountPct = hasDiscount ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
    const inStock = (product.stocks?.[0]?.stock_quantity ?? 0) > 0;

    return (
        <Link
            to={`/product/${product.id}`}
            className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm active:scale-[0.97] transition-transform"
        >
            <div className="relative aspect-square bg-slate-50 overflow-hidden">
                {/* ... badges ... */}
                <img src={getImage()} alt={product.product_name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
            </div>

            <div className="p-2.5 flex flex-col gap-1">
                <p className="text-[14px] font-semibold text-slate-800 line-clamp-2 leading-snug min-h-[2.5em]">
                    {product.product_name}
                </p>
                
                {/* ✅ DYNAMIC RATING */}
                <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={Math.round(reviewStats.avg) || 0} size="sm" />
                    <span className="text-[10px] text-slate-400">({reviewStats.count})</span>
                </div>
                
                <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-[13px] font-bold text-slate-900">₹{parseFloat(currentPrice).toFixed(0)}</span>
                    {hasDiscount && <span className="text-[11px] text-slate-400 line-through">₹{parseFloat(mrp).toFixed(0)}</span>}
                </div>
                {product.is_in_campaign && product.campaign_details?.end_datetime && (
                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
                        <FiClock className="w-2.5 h-2.5" /> Limited time
                    </div>
                )}
            </div>
        </Link>
    );
};

// ─── Product List Card ───────────────────────────────────────────────────────
const MobileProductListCard = ({ product }) => {
    const [imgErr, setImgErr] = useState(false);
    
    // ✅ DYNAMIC RATING
    const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });

    useEffect(() => {
        publicAxios.get("/api/all-review/", {
            params: { model: "product", object_id: product.id }
        })
        .then(res => {
            setReviewStats({
                avg: res.data.average_rating || 0,
                count: res.data.reviews?.length || 0
            });
        })
        .catch(() => {});
    }, [product.id]);

    const ensureAbsolute = (p) => (p?.startsWith("http") ? p : `https://api.initcart.in${p?.startsWith("/") ? "" : "/"}${p}`);

    const getImage = () => {
        if (imgErr) return "https://placehold.co/150x150/f1f5f9/94a3b8?text=No+Image";
        if (product.stocks?.[0]?.variant_image) return ensureAbsolute(product.stocks[0].variant_image);
        if (product.main_image) return ensureAbsolute(product.main_image);
        if (product.gallery?.length > 0) return ensureAbsolute(product.gallery[0].image);
        return "https://placehold.co/150x150/f1f5f9/94a3b8?text=No+Image";
    };

    const currentPrice = product.is_in_campaign && product.campaign_price
        ? product.campaign_price
        : product.stocks?.[0]?.final_price > 0
            ? product.stocks[0].final_price
            : product.stocks?.[0]?.selling_price ?? product.price ?? 0;

    const mrp = product.campaign_details?.original_price || product.stocks?.[0]?.mrp || product.old_price || 0;
    const hasDiscount = mrp > currentPrice;
    const discountPct = hasDiscount ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
    const inStock = (product.stocks?.[0]?.stock_quantity ?? 0) > 0;

    return (
        <Link
            to={`/product/${product.id}`}
            className="flex gap-3 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm active:scale-[0.98] transition-transform"
        >
            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50">
                {hasDiscount && <div className="absolute top-1 left-1 z-10 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded">-{discountPct}%</div>}
                <img src={getImage()} alt={product.product_name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                    <p className="text-[14px] font-semibold text-slate-800 line-clamp-2 leading-snug">{product.product_name}</p>
                    {product.short_description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{product.short_description}</p>
                    )}
                </div>

                <div className="flex items-center justify-between mt-1">
                    <div>
                        {/* ✅ DYNAMIC RATING */}
                        <div className="flex items-center gap-1 mt-0.5">
                            <StarRating rating={Math.round(reviewStats.avg) || 0} size="sm" />
                            <span className="text-[10px] text-slate-400">({reviewStats.count})</span>
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-[13px] font-bold text-slate-900">₹{parseFloat(currentPrice).toFixed(0)}</span>
                            {hasDiscount && <span className="text-[11px] text-slate-400 line-through">₹{parseFloat(mrp).toFixed(0)}</span>}
                        </div>
                    </div>

                    <div className={`text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${inStock ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {inStock ? <FiCheckCircle className="w-2.5 h-2.5" /> : <FiAlertCircle className="w-2.5 h-2.5" />}
                        {inStock ? "In Stock" : "Sold Out"}
                    </div>
                </div>
            </div>
        </Link>
    );
};

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
const SkeletonGrid = () => (
    <div className="grid grid-cols-2 gap-3 px-4">
        {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="aspect-square bg-slate-200" />
                <div className="p-2.5 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

// ─── Sort Bottom Sheet ───────────────────────────────────────────────────────
const SortSheet = ({ visible, onClose, value, onChange }) => {
    const options = [
        { value: "default", label: "Default" },
        { value: "newest", label: "Newest First" },
        { value: "price_low", label: "Price: Low to High" },
        { value: "price_high", label: "Price: High to Low" },
        { value: "rating", label: "Rating: High to Low" },
    ];

    if (!visible) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl pb-safe">
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-4" />
                <p className="text-center text-[11px] font-bold text-slate-700 mb-3 px-4">Sort By</p>
                <div className="divide-y divide-slate-100">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); onClose(); }}
                            className={`w-full px-5 py-3.5 text-left text-[11px] font-semibold flex items-center justify-between transition ${value === opt.value ? "text-blue-600 bg-blue-50" : "text-slate-700"}`}
                        >
                            {opt.label}
                            {value === opt.value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                        </button>
                    ))}
                </div>
                <div className="h-6" />
            </div>
        </>
    );
};

// ─── Main Mobile Page ─────────────────────────────────────────────────────────
export default function MobileVendorStorePage() {
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("products");
    const [sortBy, setSortBy] = useState("default");
    const [viewMode, setViewMode] = useState("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSort, setShowSort] = useState(false);
    const [followed, setFollowed] = useState(false);
    const [headerCollapsed, setHeaderCollapsed] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onScroll = () => setHeaderCollapsed(el.scrollTop > 80);
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const vRes = await publicAxios.get("/ecommerce/public/vendors/");
                const found = vRes.data.find((v) => v.id === parseInt(id));
                if (!found) throw new Error("Vendor not found");

                setVendor({
                    ...found,
                    store_logo: found.store_logo_url || found.store_logo,
                });

                const pRes = await publicAxios.get("/ecommerce/public/products/");
                setProducts(pRes.data.filter((p) => p.vendor_details?.id === parseInt(id)));
            } catch (e) {
                setError("Store not found");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const getSortedProducts = () => {
        let list = [...products];
        if (searchQuery.trim()) {
            list = list.filter((p) =>
                p.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        switch (sortBy) {
            case "price_low": return list.sort((a, b) => getP(a) - getP(b));
            case "price_high": return list.sort((a, b) => getP(b) - getP(a));
            case "newest": return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case "rating": return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default: return list;
        }
    };

    const getP = (p) => p.campaign_price || p.stocks?.[0]?.final_price || p.stocks?.[0]?.selling_price || 0;

    const totalProducts = products.length;
    const avgRating = totalProducts ? products.reduce((a, p) => a + (p.rating || 4), 0) / totalProducts : 0;
    const campaignCount = products.filter((p) => p.is_in_campaign).length;
    const sortedProducts = getSortedProducts();

    const sortLabels = {
        default: "Default",
        newest: "Newest",
        price_low: "Price ↑",
        price_high: "Price ↓",
        rating: "Top Rated",
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                    <div className="flex-1 ml-3 h-4 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="bg-white px-4 pt-6 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-200 border-4 border-white animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-slate-200 rounded w-3/4 animate-pulse" />
                            <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
                    </div>
                </div>
                <SkeletonGrid />
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
                <div className="text-6xl mb-4">🏪</div>
                <h2 className="text-[15px] font-bold text-slate-800 mb-2">Store Not Found</h2>
                <p className="text-[12px] text-slate-500 mb-6">{error || "The requested store does not exist."}</p>
                <Link
                    to="/sellerlist"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg"
                >
                    Browse All Stores
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Sticky Top Bar - Only Back Button */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-100">
                <div className="flex items-center px-4 py-3">
                    <Link
                        to="/sellerlist"
                        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                    >
                        <FiChevronLeft className="w-5 h-5 text-slate-700" />
                    </Link>

                    <div className={`flex-1 transition-all duration-300 overflow-hidden ml-2 ${headerCollapsed ? "opacity-100 max-h-10" : "opacity-0 max-h-0"}`}>
                        <div className="flex items-center gap-2">
                            <img
                                src={vendor.store_logo || "https://6valley.6amtech.com/storage/app/public/shop/2024-09-19-66ebe16c61ecc.webp"}
                                alt=""
                                className="w-7 h-7 rounded-lg object-cover"
                            />
                            <span className="text-[16px] font-bold text-slate-800 truncate">{vendor.business_name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">

                {/* Store Profile Card - No top gap */}
                <div className="bg-white px-4 pt-4 pb-4">
                    <div className="flex items-start gap-3 mb-4">
                        <img
                            src={vendor.store_logo || "https://6valley.6amtech.com/storage/app/public/shop/2024-09-19-66ebe16c61ecc.webp"}
                            alt={vendor.business_name}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
                        />
                        <div className="flex-1">
                            <h1 className="text-[16px] font-bold text-slate-900">{vendor.business_name}</h1>
                            <p className="text-[11px] text-slate-500 mt-0.5">{vendor.vendor_type} • {vendor.vendor_subtype || "General Store"}</p>
                        </div>
                        <button
                            onClick={() => setFollowed((f) => !f)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${followed ? "bg-red-50 border-red-300 text-red-500" : "bg-white border-slate-200 text-slate-700"}`}
                        >
                            <FiHeart className={`w-4 h-4 ${followed ? "fill-red-400 text-red-400" : ""}`} />
                            {followed ? "Saved" : "Follow"}
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-blue-50 rounded-xl py-2.5 text-center">
                            <div className="text-[13px] font-bold text-blue-600">{totalProducts}</div>
                            <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wide">Products</div>
                        </div>
                        <div className="bg-yellow-50 rounded-xl py-2.5 text-center">
                            <div className="text-[13px] font-bold text-yellow-600">{avgRating.toFixed(1)}</div>
                            <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wide">Avg Rating</div>
                        </div>
                        <div className="bg-emerald-50 rounded-xl py-2.5 text-center">
                            <div className="text-[13px] font-bold text-emerald-600">{campaignCount}</div>
                            <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wide">Offers</div>
                        </div>
                    </div>

                    <button className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-200 active:scale-95 transition-transform">
                        Contact Store
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white mt-1 border-b border-slate-100 sticky top-[57px] z-20">
                    <div className="flex">
                        {["products", "about"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-[11px] font-bold transition capitalize ${activeTab === tab
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-slate-500"
                                    }`}
                            >
                                {tab === "products" ? `Products (${totalProducts})` : "About"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* About Tab */}
                {activeTab === "about" && (
                    <div className="px-4 py-5 space-y-3">
                        <h3 className="text-[11px] font-bold text-slate-800 mb-1">Store Information</h3>

                        {[
                            { icon: <FiMapPin className="w-4 h-4 text-blue-500" />, label: "Location", value: `${vendor.city || "N/A"}, ${vendor.state || "N/A"}` },
                            { icon: <FiMail className="w-4 h-4 text-purple-500" />, label: "Email", value: vendor.email },
                            { icon: <FiPhone className="w-4 h-4 text-emerald-500" />, label: "Phone", value: vendor.phone },
                            { icon: <FiShoppingBag className="w-4 h-4 text-orange-500" />, label: "Type", value: vendor.vendor_type },
                        ].map((row, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3 shadow-sm">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                    {row.icon}
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">{row.label}</p>
                                    <p className="text-[14px] font-semibold text-slate-700 break-all">{row.value || "N/A"}</p>
                                </div>
                            </div>
                        ))}

                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[9px] text-emerald-600 font-medium uppercase tracking-wide">Status</p>
                                <p className="text-[14px] font-semibold text-emerald-700">Active Store</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                    <div className="pb-24">
                        <div className="px-4 pt-4 pb-3">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search products in this store..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="px-4 pb-3 flex items-center justify-between">
                            <p className="text-[11px] text-slate-500 font-medium">
                                {sortedProducts.length} result{sortedProducts.length !== 1 ? "s" : ""}
                                {campaignCount > 0 && ` • ${campaignCount} on offer`}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowSort(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 shadow-sm"
                                >
                                    <span>{sortLabels[sortBy]}</span>
                                    <FiChevronDown className="w-3 h-3" />
                                </button>

                                <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-1.5 transition ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-slate-500"}`}
                                    >
                                        <FiGrid className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-1.5 transition ${viewMode === "list" ? "bg-blue-600 text-white" : "text-slate-500"}`}
                                    >
                                        <FiList className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {campaignCount > 0 && (
                            <div className="mx-4 mb-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-3 flex items-center gap-3 shadow-md shadow-red-100">
                                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FiZap className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{campaignCount} Special Offer{campaignCount > 1 ? "s" : ""} Available!</p>
                                    <p className="text-white/80 text-[11px]">Limited time deals — grab them now</p>
                                </div>
                            </div>
                        )}

                        {sortedProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                    <FiPackage className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-[15px] font-bold text-slate-700 mb-1">
                                    {searchQuery ? "No results found" : "No Products Yet"}
                                </h3>
                                <p className="text-[12px] text-slate-400">
                                    {searchQuery ? `No products match "${searchQuery}"` : "This store has no products listed."}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-2 gap-3 px-4">
                                {sortedProducts.map((p) => (
                                    <MobileProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 px-4">
                                {sortedProducts.map((p) => (
                                    <MobileProductListCard key={p.id} product={p} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <SortSheet
                visible={showSort}
                onClose={() => setShowSort(false)}
                value={sortBy}
                onChange={setSortBy}
            />
        </div>
    );
}