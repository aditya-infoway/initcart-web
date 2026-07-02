// ecommerce/frontend/src/pages/mobile/MobileOfferPage.jsx

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { publicAxios } from '../../api/axios'
import { 
  FiStar, 
  FiShoppingBag, 
  FiGift, 
  FiCopy, 
  FiCheck, 
  FiMapPin, 
  FiPercent,
  FiZap,
  FiArrowLeft,
  FiTag,
  FiClock,
  FiInfo
} from 'react-icons/fi'

// ─── Font Tokens (Same as other mobile pages) ──────────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  statLabel:    { fontSize:  9, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLetter:{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

// Coupon Code Component
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
      .catch(err => console.error('Could not copy text: ', err))
  }

  return (
    <div className="px-4 pb-4">
      <div className="text-[10px] font-medium text-gray-400 border-t border-dashed border-gray-200 pt-3 mb-2">
        {title}
      </div>
      <div className="flex rounded-xl border-2 border-blue-500 overflow-hidden shadow-sm">
        <div className="flex-grow bg-white py-2.5 px-3 text-center">
          <p className="text-[13px] font-bold tracking-wider text-blue-700 font-mono">
            {couponCode}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center px-4 py-2.5 text-[11px] font-semibold text-white transition-colors duration-200 ${isCopied ? 'bg-green-600' : 'bg-blue-600'}`}
        >
          {isCopied ? <FiCheck size={12} className="mr-1" /> : <FiCopy size={12} className="mr-1" />}
          {isCopied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      {discountText && (
        <div className="mt-2">
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[9px] font-semibold px-2 py-0.5 rounded-full">
            <FiPercent size={9} />
            {discountText}
          </span>
        </div>
      )}
    </div>
  )
}

// Vendor Card Component
const VendorCard = ({ vendor }) => {
  const navigate = useNavigate()
  const storeCoupons = vendor.coupons || []

  const handleCardClick = () => {
    navigate('/vendor-offers', { state: { vendor, coupons: storeCoupons } })
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm active:scale-[0.98] transition-all duration-200 cursor-pointer"
    >
      {/* Banner Section */}
      <div className="relative h-28 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
          <div className="text-white text-[15px] font-bold mb-0.5">
            {storeCoupons.length > 1 ? `${storeCoupons.length} Offers` : 'Special Offer'}
          </div>
          <div className="text-white text-[10px] opacity-90">
            Tap to view all offers
          </div>
        </div>
        
        {/* Coupon Count Badge */}
        {storeCoupons.length > 0 && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white text-blue-700">
              <FiTag size={8} className="mr-1" />
              {storeCoupons.length} {storeCoupons.length === 1 ? 'Coupon' : 'Coupons'}
            </span>
          </div>
        )}
      </div>

      {/* Vendor Info */}
      <div className="p-3 flex items-center gap-3">
        {/* Store Logo */}
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
          {vendor.store_logo ? (
            <img
              src={vendor.store_logo}
              alt={vendor.business_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="text-lg font-bold text-blue-600">
              {vendor.business_name?.charAt(0) || 'S'}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-900 truncate">
            {vendor.business_name}
          </p>
          <p className="text-[10px] text-gray-500 truncate">
            {vendor.vendor_type || 'General Store'}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-0.5">
              <FiStar size={10} className="text-yellow-400 fill-current" />
              <span className="text-[10px] text-gray-600">4.5</span>
            </div>
            <span className="text-[9px] text-gray-400">•</span>
            <div className="flex items-center gap-0.5">
              <FiShoppingBag size={9} className="text-gray-400" />
              <span className="text-[10px] text-gray-500">{vendor.product_count || 0} products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-1">
          <FiMapPin size={10} className="text-gray-400" />
          <span className="text-[10px] text-gray-500 truncate">{vendor.city}, {vendor.state}</span>
        </div>
      </div>

      {/* Featured Coupon */}
      {storeCoupons.length > 0 && (
        <CouponCodeSection
          couponCode={storeCoupons[0].code}
          title="🔥 Top Offer"
          discountText={storeCoupons[0].discount_display}
        />
      )}
    </div>
  )
}

// Skeleton Card
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-28 bg-gray-200" />
    <div className="p-3 flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
    <div className="px-3 pb-2">
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
    <div className="px-4 pb-4">
      <div className="h-10 bg-gray-200 rounded-xl" />
    </div>
  </div>
)

// Main Component
const MobileOfferPage = () => {
  const navigate = useNavigate()
  const [vendorsWithCoupons, setVendorsWithCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVendorsWithCoupons = async () => {
    try {
      setLoading(true)
      setError(null)

      const couponsResponse = await publicAxios.get('/ecommerce/public/coupons/')
      
      let couponsData = []
      if (couponsResponse.data && couponsResponse.data.coupons && Array.isArray(couponsResponse.data.coupons)) {
        couponsData = couponsResponse.data.coupons
      } else if (couponsResponse.data && Array.isArray(couponsResponse.data)) {
        couponsData = couponsResponse.data
      }

      // Filter valid coupons
      const validCoupons = couponsData.filter(coupon => {
        const isValidByField = coupon.is_valid === true || coupon.is_valid === 'true'
        const hasActiveStatus = coupon.status === 'active' || coupon.status === 'Active'
        if ('is_valid' in coupon) return isValidByField
        else if ('status' in coupon) return hasActiveStatus
        return true
      })

      if (validCoupons.length === 0) {
        setVendorsWithCoupons([])
        setLoading(false)
        return
      }

      const vendorIds = [...new Set(validCoupons.map(coupon => coupon.vendor))]
      const vendorsResponse = await publicAxios.get('/ecommerce/public/vendors/')
      
      let allVendors = []
      if (vendorsResponse.data && Array.isArray(vendorsResponse.data)) {
        allVendors = vendorsResponse.data
      } else if (vendorsResponse.data && vendorsResponse.data.results && Array.isArray(vendorsResponse.data.results)) {
        allVendors = vendorsResponse.data.results
      }

      const vendorsWithCouponsData = []
      vendorIds.forEach(vendorId => {
        const vendor = allVendors.find(v => v.id === vendorId)
        if (vendor) {
          const vendorCoupons = validCoupons.filter(coupon => coupon.vendor === vendorId)
          vendorsWithCouponsData.push({
            ...vendor,
            store_logo: vendor.store_logo_url || vendor.store_logo,
            product_count: vendor.product_count || 0,
            coupons: vendorCoupons
          })
        }
      })

      setVendorsWithCoupons(vendorsWithCouponsData)
    } catch (err) {
      console.error('Error fetching offers:', err)
      setError('Failed to load offers. Please try again.')
      
      // Fallback data
      const fallbackData = [
        {
          id: 1,
          business_name: 'JS Store',
          vendor_type: 'General Store',
          store_logo: null,
          city: 'Sample City',
          state: 'Sample State',
          product_count: 25,
          coupons: [{
            id: 36,
            code: 'ETRSARE',
            title: 'SUMMER OFF',
            discount_display: '6.00% OFF',
            vendor: 1,
            vendor_name: 'JS Store'
          }]
        }
      ]
      setVendorsWithCoupons(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendorsWithCoupons()
  }, [])

  // Hide bottom navigation
  useEffect(() => {
    document.body.classList.add('offer-page')
    const style = document.createElement('style')
    style.id = 'offer-page-hide-nav'
    style.textContent = `
      .fixed.bottom-0.left-0.right-0.z-\\[100\\],
      .md\\:hidden.fixed.bottom-0 {
        display: none !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.body.classList.remove('offer-page')
      const styleEl = document.getElementById('offer-page-hide-nav')
      if (styleEl) styleEl.remove()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-40 mt-1 animate-pulse" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200"
          >
            <FiArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-[16px] font-bold text-gray-900">Offers & Coupons</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {vendorsWithCoupons.length} stores with active offers
            </p>
          </div>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
            <FiGift size={24} className="text-white" />
          </div>
          <h2 className="text-[18px] font-bold text-white mb-1">Exclusive Deals!</h2>
          <p className="text-[11px] text-blue-100">Save big with store coupons and offers</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-[11px] text-yellow-700">{error}</p>
          </div>
        )}

        {/* No Offers */}
        {vendorsWithCoupons.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiGift size={32} className="text-gray-400" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2">No Offers Available</h3>
            <p className="text-[12px] text-gray-500 mb-6 max-w-xs">
              Currently there are no active offers. Check back later for exciting deals!
            </p>
            <button 
              onClick={() => navigate('/sellerlist')}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-semibold"
            >
              Browse All Stores
            </button>
          </div>
        )}

        {/* Vendors Grid */}
        {vendorsWithCoupons.length > 0 && (
          <div className="space-y-3">
            {vendorsWithCoupons.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}

        {/* How to Use Section */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-4">
          <h3 className="text-[13px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiInfo size={14} className="text-blue-600" />
            How to Use Offers
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
              <p className="text-[11px] text-gray-700 flex-1">Tap on any store card to view all offers</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
              <p className="text-[11px] text-gray-700 flex-1">Browse products and find the best deals</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
              <p className="text-[11px] text-gray-700 flex-1">Copy coupon code and apply at checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileOfferPage