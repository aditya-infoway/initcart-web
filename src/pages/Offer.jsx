import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { publicAxios } from '../api/axios'
import { FiStar, FiShoppingBag, FiGift } from 'react-icons/fi'
import MobileOfferPage from './mobile/Mobileoffer'

// CouponCodeSection Component
const CouponCodeSection = ({ couponCode, title = "Offer", discountText }) => {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = (e) => {
        e.preventDefault()
        e.stopPropagation()

        navigator.clipboard.writeText(couponCode)
            .then(() => {
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
            })
            .catch(err => {
                console.error('Could not copy text: ', err)
            })
    }

    return (
        <div className="px-4 pb-4">
            <div className="text-xs font-medium text-gray-500 border-t border-dashed border-gray-300 pt-2 mb-2">
                {title}
            </div>
            <div className="flex rounded-md border-2 border-blue-600 overflow-hidden shadow-inner">
                <div className="flex-grow bg-white py-2 px-3 text-center text-lg font-bold tracking-widest text-blue-700">
                    {couponCode}
                </div>
                <button
                    onClick={handleCopy}
                    className={`flex items-center justify-center relative pl-5 pr-4 py-2 text-sm font-semibold text-white transition duration-200 ease-in-out ${isCopied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    style={{ clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)' }}
                >
                    {isCopied ? 'COPIED!' : 'COPY'}
                </button>
            </div>
            {discountText && (
                <div className="flex absolute top-4 left-2 z-10 ">
                    <div className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                        {discountText}
                    </div>
                </div>
            )}
        </div>
    )
}

// VendorCard Component
const VendorCard = ({ vendor }) => {
    // Use vendor.coupons directly since we're now storing coupons with vendor
    const storeCoupons = vendor.coupons || []

    return (
        <Link to={`/vendor-offers/${vendor.id}`} state={{ vendor, coupons: storeCoupons }} className="block group">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-lg transition duration-300 ease-in-out transform group-hover:-translate-y-1 group-hover:shadow-xl">
                {/* Banner Image */}
                <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-600 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4">
                            <div className="text-white text-xl font-bold mb-1">
                                {storeCoupons.length > 1 ? `${storeCoupons.length} Offers` : 'Special Offer'}
                            </div>
                            <div className="text-white text-sm opacity-90">
                                Click to view all offers
                            </div>
                        </div>
                    </div>
                    {/* Coupon Count Badge */}
                    {storeCoupons.length > 0 && (
                        <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-blue-700">
                                {storeCoupons.length} {storeCoupons.length === 1 ? 'Coupon' : 'Coupons'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Vendor Info */}
                <div className="py-4 px-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        {/* Store Logo */}
                        <div className="h-14 w-14 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center overflow-hidden">
                            {vendor.store_logo ? (
                                <img
                                    src={vendor.store_logo}
                                    alt={vendor.business_name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none'
                                        e.target.nextElementSibling.style.display = 'flex'
                                    }}
                                />
                            ) : null}
                            <div className={`h-full w-full flex items-center justify-center text-lg font-bold text-blue-600 ${vendor.store_logo ? 'hidden' : 'flex'
                                }`}>
                                {vendor.business_name?.charAt(0) || 'S'}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-lg font-extrabold text-gray-900 group-hover:text-blue-600 transition truncate">
                                {vendor.business_name}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                                {vendor.vendor_type || 'Store'}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <FiStar className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-gray-600">
                                    4.5 • {vendor.product_count || 0} products
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store Details */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{vendor.product_count || 0} products</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{vendor.city}, {vendor.state}</span>
                    </div>
                </div>

                {/* Featured Coupon */}
                {storeCoupons.length > 0 && (
                    <CouponCodeSection
                        couponCode={storeCoupons[0].code}
                        title="Top Offer"
                        discountText={storeCoupons[0].discount_display}
                    />
                )}
            </div>
        </Link>
    )
}
export default function Offer() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [itemsPerView, setItemsPerView] = useState(4)
    const [vendorsWithCoupons, setVendorsWithCoupons] = useState([])
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Fetch vendors with coupons - SIMPLIFIED VERSION
// Fetch vendors with coupons - DEBUGGED VERSION
const fetchVendorsWithCoupons = async () => {
    try {
        setLoading(true)
        setError(null)

        // 1. Fetch all active coupons
        const couponsResponse = await publicAxios.get('/ecommerce/public/coupons/')

        
        // Log the first coupon to see structure
        if (couponsResponse.data && couponsResponse.data.coupons && couponsResponse.data.coupons.length > 0) {

        }

        // Extract coupons array from response
        let couponsData = []
        if (couponsResponse.data && couponsResponse.data.coupons && Array.isArray(couponsResponse.data.coupons)) {
            couponsData = couponsResponse.data.coupons
        } else if (couponsResponse.data && Array.isArray(couponsResponse.data)) {
            couponsData = couponsResponse.data
        }



        // Check what fields each coupon has
        couponsData.forEach((coupon, index) => {
        })

        // Filter only valid coupons - MORE FLEXIBLE
        const validCoupons = couponsData.filter(coupon => {
            // Check multiple conditions for validity
            const isValidByField = coupon.is_valid === true || coupon.is_valid === 'true'
            const hasActiveStatus = coupon.status === 'active' || coupon.status === 'Active'
            
            // If is_valid field exists, use it
            if ('is_valid' in coupon) {
                return isValidByField
            }
            // If status field exists, use it
            else if ('status' in coupon) {
                return hasActiveStatus
            }
            // Default: assume valid
            return true
        })



        // If no valid coupons, return empty
        if (validCoupons.length === 0) {
 
            setVendorsWithCoupons([])
            setLoading(false)
            return
        }

        // 2. Get unique vendor IDs from coupons
        const vendorIds = [...new Set(validCoupons.map(coupon => coupon.vendor))]


        // 3. Fetch vendor details
        const vendorsResponse = await publicAxios.get('/ecommerce/public/vendors/')


        // Extract vendors array from response
        let allVendors = []
        if (vendorsResponse.data && Array.isArray(vendorsResponse.data)) {
            allVendors = vendorsResponse.data
        } else if (vendorsResponse.data && vendorsResponse.data.results && Array.isArray(vendorsResponse.data.results)) {
            allVendors = vendorsResponse.data.results
        }



        // 4. Filter vendors that have coupons and group their coupons
        const vendorsWithCouponsData = []

        vendorIds.forEach(vendorId => {
            // Find vendor by ID
            const vendor = allVendors.find(v => v.id === vendorId)

            if (vendor) {
                // Get all coupons for this vendor
                const vendorCoupons = validCoupons.filter(coupon => coupon.vendor === vendorId)

                // Add vendor to list with their coupons
                vendorsWithCouponsData.push({
                    ...vendor,
                    store_logo: vendor.store_logo_url || vendor.store_logo,
                    product_count: vendor.product_count || 0,
                    coupons: vendorCoupons
                })


            } else {

                // Try to create a dummy vendor from coupon data
                const couponForVendor = validCoupons.find(c => c.vendor === vendorId)
                if (couponForVendor) {
                    vendorsWithCouponsData.push({
                        id: vendorId,
                        business_name: couponForVendor.vendor_name || `Store ${vendorId}`,
                        vendor_type: 'General Store',
                        store_logo: null,
                        city: 'Unknown',
                        state: 'Unknown',
                        product_count: 0,
                        coupons: validCoupons.filter(c => c.vendor === vendorId)
                    })
                }
            }
        })

        setCoupons(validCoupons)
        setVendorsWithCoupons(vendorsWithCouponsData)

    } catch (err) {
        console.error('Error fetching vendors with coupons:', err)
        setError('Failed to load offers. Please try again later.')
        
        // For now, use the API data directly even if filtering fails
        try {
            const couponsResponse = await publicAxios.get('/ecommerce/public/coupons/')
            const couponsData = couponsResponse.data.coupons || couponsResponse.data || []
            
            // Create vendors from coupon data directly
            const vendorMap = {}
            
            couponsData.forEach(coupon => {
                const vendorId = coupon.vendor
                if (vendorId && !vendorMap[vendorId]) {
                    vendorMap[vendorId] = {
                        id: vendorId,
                        business_name: coupon.vendor_name || `Store ${vendorId}`,
                        vendor_type: 'General Store',
                        store_logo: null,
                        city: 'Unknown',
                        state: 'Unknown',
                        product_count: 0,
                        coupons: []
                    }
                }
                
                if (vendorMap[vendorId]) {
                    vendorMap[vendorId].coupons.push(coupon)
                }
            })
            
            const vendorsList = Object.values(vendorMap)
            setVendorsWithCoupons(vendorsList)
            setCoupons(couponsData)
        } catch (fallbackErr) {
            console.error('Fallback also failed:', fallbackErr)
            // Ultimate fallback
            const ultimateFallback = [
                {
                    id: 1,
                    business_name: 'js store',
                    vendor_type: 'General Store',
                    store_logo: null,
                    city: 'Sample City',
                    state: 'Sample State',
                    product_count: 25,
                    coupons: [
                        {
                            id: 36,
                            code: 'ETRSARE',
                            title: 'SUMMER OFF',
                            discount_display: '6.00% OFF',
                            vendor: 1,
                            vendor_name: 'js store'
                        }
                    ]
                },
     
            ]
            setVendorsWithCoupons(ultimateFallback)
        }
    } finally {
        setLoading(false)
    }
}

    // Responsive layout
    useEffect(() => {
        const setFromWidth = () => {
            const w = window.innerWidth
            if (w >= 1280) setItemsPerView(4)
            else if (w >= 1024) setItemsPerView(3)
            else if (w >= 768) setItemsPerView(2)
            else setItemsPerView(1)
        }
        setFromWidth()
        window.addEventListener('resize', setFromWidth)
        return () => window.removeEventListener('resize', setFromWidth)
    }, [])

    // Fetch data on component mount
    useEffect(() => {
        fetchVendorsWithCoupons()
    }, [])

      useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

    if (isMobile) {
  return <MobileOfferPage/>;
}

    // Loading state
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <section className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Top Offers</h2>
                    </div>
                    <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-lg animate-pulse">
                                <div className="h-40 bg-gradient-to-r from-blue-200 to-blue-200"></div>
                                <div className="py-4 px-4 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-gray-200"></div>
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 pb-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-10 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="mt-8">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Top Offers</h2>
                        <p className="text-gray-600 mt-1">
                            Exclusive deals from {vendorsWithCoupons.length} stores with coupons
                        </p>
                    </div>
                    <Link to="/sellerlist" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
                        View all stores →
                    </Link>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-yellow-700 text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* No Offers Message */}
                {vendorsWithCoupons.length === 0 && !loading && !error && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
                            <FiGift className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Offers Available</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Currently there are no active offers from any store. Check back later for exciting deals!
                        </p>
                        <Link
                            to="/vendors"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Browse All Stores
                        </Link>
                    </div>
                )}

                {/* Vendors Grid */}
                {vendorsWithCoupons.length > 0 && (
                    <div className="relative">
                        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}>
                            {vendorsWithCoupons.map((vendor) => (   
                                <VendorCard
                                    key={vendor.id}
                                    vendor={vendor}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {/* Information Section */}
                <div className="mt-12 bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use Store Offers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">Visit Store</h4>
                                <p className="text-sm text-gray-600">Click on any store to view all available offers</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">Browse Offers</h4>
                                <p className="text-sm text-gray-600">See which products have special discounts</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-1">Apply Coupon</h4>
                                <p className="text-sm text-gray-600">Copy coupon code and apply at checkout</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}