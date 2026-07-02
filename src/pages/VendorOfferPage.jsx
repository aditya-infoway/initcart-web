import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { publicAxios } from '../api/axios'
import { FiStar, FiShoppingBag, FiGift, FiTag, FiPackage, FiChevronRight } from 'react-icons/fi'

// CouponCard Component
const CouponCard = ({ coupon }) => {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(coupon.code)
            .then(() => {
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
            })
            .catch(err => console.error('Copy failed:', err))
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{coupon.title || coupon.code}</h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {coupon.coupon_type === 'percentage' ? 'Percentage  Discount' : 'Flat Discount'}
                    </span>
                </div>
                
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiGift className="w-4 h-4" />
                        <span>{coupon.discount_display || 'Special Discount'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiTag className="w-4 h-4" />
                        <span>{coupon.validity_display || 'Limited Time'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-grow border-2 border-blue-600 rounded-lg py-2 px-3 text-center">
                        <div className="text-lg font-bold tracking-widest text-blue-700">{coupon.code}</div>
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`px-4 py-2 rounded-lg font-medium text-white transition ${
                            isCopied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {/* Conditions */}
                {coupon.conditions && coupon.conditions.length > 0 && (
                    <div className="border-t border-gray-100 pt-3">
                        <div className="text-xs font-medium text-gray-500 mb-2">Conditions:</div>
                        <div className="flex flex-wrap gap-1">
                            {coupon.conditions.map((condition, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {condition}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function VendorOffersPage() {
    const { id } = useParams()
    const location = useLocation()
    const [vendor, setVendor] = useState(null)
    const [productsWithCoupons, setProductsWithCoupons] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    // Helper to get full image URL
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith("http")) return imagePath
    return `https://api.initcart.in${imagePath.startsWith("/") ? "" : "/"}${imagePath}`
}

// Get best product image (variant > main > gallery)
const getProductImage = (product) => {
    // 1️⃣ Variant image first
    if (product.stocks && product.stocks.length > 0) {
        const variantImage = product.stocks[0]?.variant_image
        if (variantImage) {
            return getFullImageUrl(variantImage)
        }
    }

    // 2️⃣ Main image
    if (product.main_image_url) {
        return getFullImageUrl(product.main_image_url)
    }

    if (product.main_image) {
        return getFullImageUrl(product.main_image)
    }

    // 3️⃣ Gallery fallback
    if (product.gallery?.length > 0) {
        return getFullImageUrl(product.gallery[0].image)
    }

    // 4️⃣ Placeholder
    return "https://placehold.co/300x200/f0f4f8/94a3b8?text=No+Image"
}
    // Get data from location state or fetch from API
    useEffect(() => {
        const fetchVendorData = async () => {
            try {
                setLoading(true)
                
                // If data passed from offer page, use it
                if (location.state?.vendor && location.state?.coupons) {
                    setVendor(location.state.vendor)
                    setCoupons(location.state.coupons)
                } else {
                    // Fetch vendor details
                    const vendorsResponse = await publicAxios.get('/ecommerce/public/vendors/')
                    const foundVendor = Array.isArray(vendorsResponse.data) 
                        ? vendorsResponse.data.find(v => v.id === parseInt(id))
                        : vendorsResponse.data.results?.find(v => v.id === parseInt(id))
                    
                    if (!foundVendor) throw new Error('Vendor not found')
                    setVendor(foundVendor)
                    
                    // Fetch coupons for this vendor
                    const couponsResponse = await publicAxios.get('/ecommerce/public/coupons/')
                    const allCoupons = Array.isArray(couponsResponse.data) 
                        ? couponsResponse.data
                        : couponsResponse.data.results || []
                    
                    const vendorCoupons = allCoupons.filter(c => 
                        c.vendor === parseInt(id) && c.is_valid && c.status === 'active'
                    )
                    setCoupons(vendorCoupons)
                }

                // Fetch products
                const productsResponse = await publicAxios.get('/ecommerce/public/products/')
                const allProductsData = Array.isArray(productsResponse.data) 
                    ? productsResponse.data
                    : productsResponse.data.results || []
                
                const vendorProducts = allProductsData.filter(p => 
                    p.vendor_details?.id === parseInt(id) || p.vendor === parseInt(id)
                )
                
                setAllProducts(vendorProducts)
                
                // Filter products that have coupons
                const productsWithCouponsData = vendorProducts.filter(product => {
                    return coupons.some(coupon => {
                        if (coupon.apply_on === 'all_products') return true
                        if (coupon.apply_on === 'product' && coupon.products?.includes(product.id)) return true
                        if (coupon.apply_on === 'category') {
                            // Check category matching logic
                            return true // Simplified for now
                        }
                        return false
                    })
                })
                
                setProductsWithCoupons(productsWithCouponsData)

            } catch (err) {
                console.error('Error fetching vendor offers:', err)
                setError('Failed to load vendor offers')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchVendorData()
        }
    }, [id, location.state])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl p-4 h-32"></div>
                                ))}
                            </div>
                            <div className="lg:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-xl p-4 h-48"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏪</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Store Not Found</h3>
                    <p className="text-gray-600 mb-6">{error || 'The requested store does not exist.'}</p>
                    <Link
                        to="/offers"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Back to Offers
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-600 mb-6">
                    <Link to="/offers" className="hover:text-blue-600 transition">Offers</Link>
                    <FiChevronRight className="w-4 h-4 mx-2" />
                    <span className="font-medium text-gray-900">{vendor.business_name}</span>
                </div>

                {/* Store Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center overflow-hidden">
                            {vendor.store_logo ? (
                                <img
                                    src={vendor.store_logo}
                                    alt={vendor.business_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="text-2xl font-bold text-blue-600">
                                    {vendor.business_name?.charAt(0) || 'S'}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{vendor.business_name} - Offers</h1>
                            <p className="text-gray-600">
                                {coupons.length} active coupons • {vendor.product_count || allProducts.length} products
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-6">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{coupons.length}</div>
                            <div className="text-sm text-gray-600">Active Coupons</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">{vendor.city}</div>
                            <div className="text-sm text-gray-600">Location</div>
                        </div>  
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Coupons */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FiGift className="w-5 h-5 text-blue-600" />
                                    Available Coupons ({coupons.length})
                                </h2>
                                {coupons.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-3">🎁</div>
                                        <p className="text-gray-600">No active coupons available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {coupons.map(coupon => (
                                            <CouponCard key={coupon.id} coupon={coupon} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Products */}
                    <div className="lg:col-span-2">
                        {/* Products with Offers */}
                        {productsWithCoupons.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <FiTag className="w-5 h-5 text-green-600" />
                                        Products with Offers ({productsWithCoupons.length})
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {productsWithCoupons.map(product => (
                                        <Link
                                            key={product.id}
                                            to={`/product/${product.id}`}
                                            className="bg-white rounded-xl border border-green-200 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={getProductImage(product)}
                                                    alt={product.product_name}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                                                />
                                                <div className="absolute top-3 right-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                                                        <FiTag className="w-3 h-3 mr-1" />
                                                        Offer Available
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition">
                                                    {product.product_name}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {product.short_description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-gray-900">
                                                            ₹{product.stocks?.[0]?.final_price || product.stocks?.[0]?.selling_price || '0.00'}
                                                        </span>
                                                        {product.stocks?.[0]?.mrp > product.stocks?.[0]?.selling_price && (
                                                            <span className="text-sm text-gray-500 line-through">
                                                                ₹{product.stocks?.[0]?.mrp}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Products */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FiPackage className="w-5 h-5 text-blue-600" />
                                    All Products ({allProducts.length})
                                </h2>
                            </div>
                            {allProducts.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                                    <div className="text-4xl mb-3">📦</div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products</h3>
                                    <p className="text-gray-600">This store doesn't have any products yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {allProducts.map(product => {
                                        const hasOffer = productsWithCoupons.some(p => p.id === product.id)
                                        return (
                                            <Link
                                                key={product.id}
                                                to={`/product/${product.id}`}
                                                className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all group ${
                                                    hasOffer ? 'border-green-200' : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={getProductImage(product)}
                                                        alt={product.product_name}
                                                        className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                                                    />
                                                    {hasOffer && (
                                                        <div className="absolute top-2 right-2">
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Offer
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                                                        {product.product_name}
                                                    </h3>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-lg font-bold text-gray-900">
                                                                ₹{product.stocks?.[0]?.final_price || product.stocks?.[0]?.selling_price || '0.00'}
                                                            </span>
                                                            {product.stocks?.[0]?.mrp > product.stocks?.[0]?.selling_price && (
                                                                <span className="text-sm text-gray-500 line-through ml-2">
                                                                    ₹{product.stocks?.[0]?.mrp}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition" />
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}