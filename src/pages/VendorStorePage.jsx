import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { publicAxios } from "../api/axios";
import MobileVendorStorePage from "./mobile/MobileVendorStore";
import {
    FiStar,
    FiShoppingBag,
    FiUsers,
    FiMapPin,
    FiMail,
    FiPhone,
    FiClock,
    FiZap,
    FiTag,
    FiChevronRight,
    FiFilter,
    FiGrid,
    FiList
} from "react-icons/fi";

// Star Rating Component
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

// Product Card Component with Campaign Support
const ProductCard = ({ product }) => {
    const [imageError, setImageError] = useState(false);

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
    // Helper to get full image URL
    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
        if (imagePath.startsWith('http')) return imagePath;
        return `https://api.initcart.in${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    // Get best product image (variant > main > gallery)
    const getDisplayImage = () => {
        // 1️⃣ Variant image first priority
        if (product.stocks && product.stocks.length > 0) {
            const variantImage = product.stocks[0]?.variant_image;
            if (variantImage) {
                return getFullImageUrl(variantImage);
            }
        }

        // 2️⃣ Main product image
        if (product.main_image) {
            return getFullImageUrl(product.main_image);
        }

        // 3️⃣ Gallery fallback
        if (product.gallery?.length > 0) {
            return getFullImageUrl(product.gallery[0].image);
        }

        // 4️⃣ Placeholder
        return "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
    };
    // Get product price (campaign or regular)
    const getProductPrice = () => {
        // Check if product has campaign price
        if (product.is_in_campaign && product.campaign_price) {
            return product.campaign_price;
        }
        // Regular price from stocks
        if (product.stocks && product.stocks.length > 0) {
            const stock = product.stocks[0];
            return stock.final_price > 0 ? stock.final_price : stock.selling_price;
        }
        return product.price || 0;
    };

    // Get original price for discount calculation
    const getOriginalPrice = () => {
        // Campaign mein original price
        if (product.is_in_campaign && product.campaign_details?.original_price) {
            return product.campaign_details.original_price;
        }
        // Regular MRP
        if (product.stocks && product.stocks.length > 0) {
            return product.stocks[0].mrp || 0;
        }
        return product.old_price || 0;
    };

    // Get discount percentage
    const getDiscountPercentage = () => {
        const currentPrice = getProductPrice();
        const originalPrice = getOriginalPrice();

        if (originalPrice > currentPrice) {
            return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        }
        return 0;
    };

    // Get campaign badge based on type
    const getCampaignBadge = () => {
        if (!product.is_in_campaign || !product.campaign_details) return null;

        const campaignType = product.campaign_details.campaign_type;

        switch (campaignType) {
            case 'Flash':
                return (
                    <div className="absolute top-2 left-2 z-10">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                            <FiZap className="h-3 w-3" /> FLASH SALE
                        </div>
                    </div>
                );
            case 'Deal of the Day':
                return (
                    <div className="absolute top-2 left-2 z-10">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                            <FiClock className="h-3 w-3" /> DEAL OF THE DAY
                        </div>
                    </div>
                );
            case 'Featured':
                return (
                    <div className="absolute top-2 left-2 z-10">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                            FEATURED
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="absolute top-2 left-2 z-10">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                            SPECIAL OFFER
                        </div>
                    </div>
                );
        }
    };

    const currentPrice = getProductPrice();
    const originalPrice = getOriginalPrice();
    const discount = getDiscountPercentage();
    const hasDiscount = originalPrice > currentPrice;

    return (
        <Link
            to={`/product/${product.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden group h-full flex flex-col"
        >
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gray-50 aspect-square">
                {/* Campaign Badge */}
                {getCampaignBadge()}

                {/* Regular Discount Badge (if not in campaign) */}
                {!product.is_in_campaign && hasDiscount && (
                    <div className="absolute top-2 left-2 z-10">
                        <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                            {discount}% OFF
                        </div>
                    </div>
                )}

                {/* Product Image */}
                <img
                    src={!imageError ? getDisplayImage() : "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image"}
                    alt={product.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={() => setImageError(true)}
                />

                {/* Quick View Overlay (optional) */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Quick View
                    </span>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition min-h-[2.5rem]">
                    {product.product_name}
                </h3>

{/* Rating Display - Dynamic Rating */}
<div className="flex items-center gap-2 mb-2">
    <StarRating rating={Math.round(reviewStats.avg)} />
    <span className="text-xs text-gray-500">
        ({reviewStats.count})
    </span>
</div>

                {/* Description (optional) */}
                {product.short_description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.short_description}
                    </p>
                )}

                {/* Price Section */}
                <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">
                            ₹{parseFloat(currentPrice).toFixed(2)}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                                ₹{parseFloat(originalPrice).toFixed(2)}
                            </span>
                        )}
                    </div>

                    {/* Campaign Timer (if available) */}
                    {product.is_in_campaign && product.campaign_details?.end_datetime && (
                        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                            <FiClock className="h-3 w-3" />
                            <span>Limited time offer</span>
                        </div>
                    )}

                    {/* Stock Status */}
                    {product.stocks?.[0]?.stock_quantity > 0 ? (
                        <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            In Stock ({product.stocks[0].stock_quantity} left)
                        </div>
                    ) : (
                        <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                            Out of Stock
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default function VendorStorePage() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const { id } = useParams();
    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'about'
    const [sortBy, setSortBy] = useState('default');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [isMobileView, setIsMobileView] = useState(false);

    // Check mobile view
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        checkMobileView();
        window.addEventListener('resize', checkMobileView);
        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    // Sort products
    const getSortedProducts = () => {
        let sorted = [...products];

        switch (sortBy) {
            case 'price_low':
                return sorted.sort((a, b) => {
                    const priceA = a.campaign_price || a.stocks?.[0]?.final_price || a.stocks?.[0]?.selling_price || 0;
                    const priceB = b.campaign_price || b.stocks?.[0]?.final_price || b.stocks?.[0]?.selling_price || 0;
                    return priceA - priceB;
                });
            case 'price_high':
                return sorted.sort((a, b) => {
                    const priceA = a.campaign_price || a.stocks?.[0]?.final_price || a.stocks?.[0]?.selling_price || 0;
                    const priceB = b.campaign_price || b.stocks?.[0]?.final_price || b.stocks?.[0]?.selling_price || 0;
                    return priceB - priceA;
                });
            case 'newest':
                return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case 'rating':
                return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default:
                return sorted;
        }
    };

    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                setLoading(true);

                // Fetch vendor details
                const vendorsResponse = await publicAxios.get("/ecommerce/public/vendors/");
                const foundVendor = vendorsResponse.data.find(v => v.id === parseInt(id));

                if (!foundVendor) {
                    throw new Error("Vendor not found");
                }

                setVendor({
                    ...foundVendor,
                    store_logo: foundVendor.store_logo_url || foundVendor.store_logo,
                });

                // Fetch all products (campaign info automatically included via PublicProductSerializer)
                const productsResponse = await publicAxios.get("/ecommerce/public/products/");
                const vendorProducts = productsResponse.data.filter(
                    product => product.vendor_details?.id === parseInt(id)
                );

                setProducts(vendorProducts);
            } catch (err) {
                console.error("Error fetching vendor data:", err);
                setError("Failed to load vendor store");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchVendorData();
        }
    }, [id]);

    // Calculate stats
    const totalProducts = products.length;
    const averageRating = products.reduce((acc, p) => acc + (p.rating || 4), 0) / totalProducts || 0;
    const campaignProducts = products.filter(p => p.is_in_campaign).length;
      if (isMobile) {
    return <MobileVendorStorePage />;
  }
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="animate-pulse">
                        {/* Mobile Skeleton */}
                        <div className="lg:hidden">
                            <div className="h-32 bg-gray-200 rounded-xl mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
                        </div>

                        {/* Desktop Skeleton */}
                        <div className="hidden lg:block h-48 bg-gray-200 rounded-xl mb-8"></div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                                    <div className="h-32 sm:h-40 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md mx-auto">
                    <div className="text-6xl mb-4">🏪</div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Store Not Found</h3>
                    <p className="text-gray-600 mb-6">{error || "The requested store does not exist."}</p>
                    <Link
                        to="/sellers"
                        className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium shadow-lg"
                    >
                        Browse All Stores
                    </Link>
                </div>
            </div>
        );
    }

    const sortedProducts = getSortedProducts();

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Mobile Store Header */}
                <div className="lg:hidden mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Cover Photo Placeholder */}
                        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                        {/* Store Info */}
                        <div className="px-4 pb-4">
                            <div className="flex items-end -mt-10 mb-3">
                                <img
                                    src={vendor.store_logo || "https://6valley.6amtech.com/storage/app/public/shop/2024-09-19-66ebe16c61ecc.webp"}
                                    alt={vendor.business_name}
                                    className="w-16 h-16 rounded-xl object-cover border-4 border-white shadow-lg"
                                />
                                <div className="ml-3 flex-1">
                                    <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{vendor.business_name}</h1>
                                    <p className="text-xs text-gray-600">{vendor.vendor_type} • {vendor.vendor_subtype || 'General Store'}</p>
                                </div>
                            </div>

                            {/* Mobile Stats Row */}
                            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">{totalProducts}</div>
                                    <div className="text-xs text-gray-500">Products</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
                                    <div className="text-xs text-gray-500">Rating</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">{campaignProducts}</div>
                                    <div className="text-xs text-gray-500">Offers</div>
                                </div>
                            </div>

                            {/* Mobile Action Buttons */}
                            <div className="flex gap-2 mt-3">
                                <button className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                                    Contact Store
                                </button>
                                <button className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition">
                                    Follow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Store Header */}
                <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                        {/* Store Logo and Basic Info */}
                        <div className="flex items-center gap-6">
                            <img
                                src={vendor.store_logo || "https://6valley.6amtech.com/storage/app/public/shop/2024-09-19-66ebe16c61ecc.webp"}
                                alt={vendor.business_name}
                                className="w-24 h-24 rounded-2xl object-cover border-4 border-blue-50 shadow-lg"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{vendor.business_name}</h1>
                                <p className="text-gray-600 mb-3">{vendor.vendor_type} • {vendor.vendor_subtype || 'General Store'}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <FiStar className="w-4 h-4 text-yellow-400" />
                                        <span>{averageRating.toFixed(1)} • {products.reduce((acc, p) => acc + (p.review_count || 0), 0)} reviews</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiShoppingBag className="w-4 h-4 text-blue-500" />
                                        <span>{totalProducts} products</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiUsers className="w-4 h-4 text-green-500" />
                                        <span>{campaignProducts} offers</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Store Stats */}
                        <div className="flex gap-6 ml-auto">
                            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-lg">
                                Contact Store
                            </button>
                            <button className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                                Follow Store
                            </button>
                        </div>
                    </div>

                    {/* Store Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <FiMapPin className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Location</div>
                                <div className="text-sm text-gray-600">{vendor.city || 'N/A'}, {vendor.state || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiMail className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Email</div>
                                <div className="text-sm text-gray-600 break-all">{vendor.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiPhone className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Phone</div>
                                <div className="text-sm text-gray-600">{vendor.phone}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Status</div>
                                <div className="text-sm text-green-600 font-medium">Active</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs for Mobile */}
                <div className="lg:hidden mb-4">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'products'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Products ({totalProducts})
                        </button>
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`flex-1 py-3 text-sm font-medium transition ${activeTab === 'about'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            About Store
                        </button>
                    </div>
                </div>

                {/* About Store Content (Mobile) */}
                {activeTab === 'about' && isMobileView && (
                    <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Store Information</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <FiMapPin className="w-4 h-4 text-gray-400" />
                                <span>{vendor.city || 'N/A'}, {vendor.state || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiMail className="w-4 h-4 text-gray-400" />
                                <span className="break-all">{vendor.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FiPhone className="w-4 h-4 text-gray-400" />
                                <span>{vendor.phone}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Section - Always visible on desktop, only when active on mobile */}
                {(activeTab === 'products' || !isMobileView) && (
                    <>
                        {/* Products Header */}
                        <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Store Products</h2>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                        Showing {products.length} products
                                        {campaignProducts > 0 && ` • ${campaignProducts} with special offers`}
                                    </p>
                                </div>

                                {/* Sort and View Controls */}
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    {/* Sort Dropdown */}
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="flex-1 sm:flex-none border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="default">Sort by: Default</option>
                                        <option value="newest">Newest First</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                        <option value="rating">Rating: High to Low</option>
                                    </select>

                                    {/* View Mode Toggle (Desktop only) */}
                                    <div className="hidden sm:flex border border-gray-300 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 transition ${viewMode === 'grid'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <FiGrid className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 transition ${viewMode === 'list'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <FiList className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {sortedProducts.length === 0 ? (
                            <div className="text-center py-12 sm:py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                <div className="text-5xl sm:text-6xl mb-4">📦</div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Products Available</h3>
                                <p className="text-sm sm:text-base text-gray-600">This store doesn't have any products listed yet.</p>
                            </div>
                        ) : (
                            <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' || isMobileView
                                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                                    : 'grid-cols-1'
                                }`}>
                                {sortedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}