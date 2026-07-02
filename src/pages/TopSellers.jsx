import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicAxios } from '../api/axios'

export default function TopSellers() {
  const [itemsPerView, setItemsPerView] = useState(3)
  const [start, setStart] = useState(0)
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // API से vendors fetch करें
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true)

        
        const response = await publicAxios.get('/ecommerce/public/vendors/')

        
        // API response को हमारे component के format में map करें
        const mappedVendors = response.data.map((vendor, index) => {
          const uniqueId = `${vendor.id}-${index}`
          const reviewsCount = Math.floor(Math.random() * 200) + 10
          
          // Store logo URL - अगर available है तो use करें, नहीं तो fallback
          const storeLogoUrl = vendor.store_logo_url || `https://picsum.photos/seed/vendor${vendor.id}/300/150`
          
          return {
            id: vendor.id,
            uniqueId: uniqueId,
            name: vendor.business_name,
            owner: vendor.owner_name || 'Vendor',
            email: vendor.email || '',
            phone: vendor.phone || '',
            city: vendor.city || '',
            state: vendor.state || '',
            stats: {
              reviews: reviewsCount,
              products: vendor.product_count || Math.floor(Math.random() * 200) + 1,
            },
            // बदलाव: banner के लिए भी store logo ही use करें (थोड़ा बड़ा size)
            banner: storeLogoUrl, // बदलाव: banner भी store logo ही
            logo: storeLogoUrl,   // छोटा logo भी same image से
            vendor_type: vendor.vendor_type || 'product',
            is_approved: vendor.is_approved || false,
            created_at: vendor.created_at || new Date().toISOString()
          }
        })
        
        // केवल active और approved vendors filter करें
        const activeVendors = mappedVendors.filter(vendor => 
          vendor.is_approved === true
        ).slice(0, 12)
        
        // Duplicate entries को remove करें
        const uniqueVendors = Array.from(
          new Map(activeVendors.map(item => [item.id, item])).values()
        )
        

        setVendors(uniqueVendors)
        setError(null)
        
      } catch (err) {
        console.error('Error fetching vendors:', err)
        setError('Failed to load sellers. Please try again later.')
        
        // Fallback data
        const fallbackData = Array.from({ length: 12 }).map((_, i) => {
          const names = [
            'Kids Corner', 'Hanover Electronics', '6valley CMS', 
            'Bicycle Shop', 'Beauty Hub', 'Pet Planet',
            'Tech Store', 'Fashion Outlet', 'Home Decor',
            'Sports Gear', 'Book World', 'Grocery Mart'
          ]
          const logoUrl = `https://picsum.photos/seed/vendor${i}/300/150`
          
          return {
            id: i + 1,
            uniqueId: `fallback-${i + 1}`,
            name: names[i % names.length],
            owner: `Owner ${i + 1}`,
            stats: {
              reviews: Math.floor(Math.random() * 200),
              products: Math.floor(Math.random() * 200) + 1,
            },
            banner: logoUrl,  // बदलाव: banner भी same logo image
            logo: logoUrl,    // logo भी same image
            vendor_type: 'product',
            is_approved: true
          }
        })
        
        setVendors(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [])

  // 1. Responsive item count logic
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

  useEffect(() => setStart(0), [itemsPerView])

  // Fixed: Duplicate key issues को resolve करने के लिए visible items logic
  const visible = useMemo(() => {
    if (vendors.length === 0) return []
    
    const out = []
    for (let i = 0; i < itemsPerView; i += 1) {
      const itemIndex = (start + i) % vendors.length
      const item = vendors[itemIndex]
      
      // Check for duplicates
      const isDuplicate = out.some(existingItem => existingItem.id === item.id)
      
      if (!isDuplicate) {
        out.push({
          ...item,
          sliderIndex: i
        })
      } else {
        // अगर duplicate है, तो next item लें
        const nextIndex = (itemIndex + 1) % vendors.length
        const nextItem = vendors[nextIndex]
        if (nextItem && !out.some(existing => existing.id === nextItem.id)) {
          out.push({
            ...nextItem,
            sliderIndex: i
          })
        }
      }
    }
    return out
  }, [start, itemsPerView, vendors])

  // 2. Auto scroll logic
  useEffect(() => {
    if (vendors.length === 0) return
    
    const id = setInterval(() => {
      setStart((s) => (s + 1) % vendors.length)
    }, 7000)
    return () => clearInterval(id)
  }, [vendors.length])

  // 3. Navigation functions
  const prev = () => {
    if (vendors.length === 0) return
    setStart((s) => (s - 1 + vendors.length) % vendors.length)
  }
  
  const next = () => {
    if (vendors.length === 0) return
    setStart((s) => (s + 1) % vendors.length)
  }

  // Loading state
  if (loading) {
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Top Sellers</h2>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
        <div className="relative group/slider">
          <div
            className="grid gap-4 transition-all duration-300"
            style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: itemsPerView }).map((_, i) => (
              <div key={`loading-${i}`} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className="h-28 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-3 w-20 bg-gray-100 animate-pulse rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
                    <div className="h-10 bg-gray-100 animate-pulse rounded-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error && vendors.length === 0) {
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Top Sellers</h2>
        </div>
        <div className="text-center p-8 border border-red-200 bg-red-50 rounded-xl">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  // Empty state
  if (vendors.length === 0) {
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Top Sellers</h2>
        </div>
        <div className="text-center p-8 border border-gray-200 bg-gray-50 rounded-xl">
          <p className="text-gray-600">No sellers available</p>
        </div>
      </section>
    )
  }



  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">TOP SALLERS</h2>
        <Link to="/sellerlist" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
      </div>

      <div className="relative group/slider">
        <div
          className="grid gap-4 transition-all duration-300"
          style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}
        >
          {visible.map((vendor, index) => {
            const uniqueKey = `${vendor.id}-${vendor.sliderIndex || index}-${start}`
            
            return (
              <Link 
                to={`/vendor/${vendor.id}`} 
                key={uniqueKey}
                className="block"
              >
                <div className="rounded-xl border border-blue-400 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-400 transition h-full">
                  {/* बदलाव: अब top image भी store logo ही है - थोड़ा बड़ा version */}
                  <div className="h-28 bg-gradient-to-r from-blue-50 to-gray-50 relative">
                    <img 
                      src={vendor.banner} 
                      alt={`${vendor.name} store`} 
                      className="absolute inset-0 h-full w-full object-contain p-4"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://picsum.photos/seed/vendor${vendor.id}/300/150`
                      }}
                    />
                    {/* Overlay for better visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent"></div>
                  </div>

                  {/* Logo and Name */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {/* छोटा circular logo */}
                      <img 
                        src={vendor.logo} 
                        alt={`${vendor.name} logo`} 
                        className="h-10 w-10 rounded-full ring-2 ring-blue-500/50 object-cover"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = `https://picsum.photos/seed/logo${vendor.id}/100/100`
                        }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {vendor.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : 'Online Store'}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          <span className="text-yellow-500">★★★★</span>
                          <span className="text-gray-300">★</span>
                          <span className="ml-1">4.8</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Buttons */}
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button" 
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 py-2 px-3 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>{vendor.stats.reviews} Reviews</span>
                      </button>
                      <button 
                        type="button" 
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-green-200 bg-green-50 py-2 px-3 text-xs font-medium text-green-700 hover:bg-green-100 transition"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span>{vendor.stats.products} Products</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Navigation buttons */}
        {vendors.length > itemsPerView && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 text-white p-2 shadow-lg opacity-0 group-hover/slider:opacity-100 transition duration-300 hover:bg-blue-700 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>

            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 text-white p-2 shadow-lg opacity-0 group-hover/slider:opacity-100 transition duration-300 hover:bg-blue-700 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </>
        )}
      </div>
    </section>
  )
}