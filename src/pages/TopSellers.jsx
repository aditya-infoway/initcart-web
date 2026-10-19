import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicAxios } from '../api/axios'

export default function TopSellers() {
  const [itemsPerView, setItemsPerView] = useState(3)
  const [start, setStart] = useState(0)
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  // Fetch vendors
  // Fetch top sellers (sirf wahi jo superadmin ne approve + show on kiye hain)
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true)

        const response = await publicAxios.get('/api/ecommerce/public/top-sellers/')
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.results || []
      
        const mapped = list.map((vendor) => {
          const logo = vendor.store_logo_url || null
          const fallback = logo
          return {
            id: vendor.id,
            name: vendor.business_name,
            city: vendor.city || '',
            state: vendor.state || '',
            // The banner is preferred; the store logo is the fallback
            image: vendor.banner_url || fallback,
            isBanner: Boolean(vendor.banner_url),
            fallback,
          }
        })

        const unique = Array.from(new Map(mapped.map((i) => [i.id, i])).values())

        setVendors(unique.slice(0, 12))
        setError(null)
      } catch (err) {
        console.error('Error fetching top sellers:', err)
        setError('Failed to load sellers.')
        setVendors([]) // fake fallback data hata diya
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [])
  // Responsive item count
  useEffect(() => {
    const setFromWidth = () => {
      const w = window.innerWidth
      if (w >= 1280) setItemsPerView(5)
      else if (w >= 1024) setItemsPerView(4)
      else if (w >= 768) setItemsPerView(3)
      else setItemsPerView(1)
    }
    setFromWidth()
    window.addEventListener('resize', setFromWidth)
    return () => window.removeEventListener('resize', setFromWidth)
  }, [])

  useEffect(() => setStart(0), [itemsPerView])

  const canSlide = vendors.length > itemsPerView

  const visible = useMemo(() => {
    const total = vendors.length
    if (total === 0) return []
    const count = Math.min(itemsPerView, total)
    return Array.from({ length: count }).map(
      (_, i) => vendors[(start + i) % total]
    )
  }, [start, itemsPerView, vendors])

  // Auto scroll
  useEffect(() => {
    if (!canSlide) return
    const id = setInterval(() => {
      setStart((s) => (s + 1) % vendors.length)
    }, 7000)
    return () => clearInterval(id)
  }, [canSlide, vendors.length])

  const prev = () => {
    if (!canSlide) return
    setStart((s) => (s - 1 + vendors.length) % vendors.length)
  }

  const next = () => {
    if (!canSlide) return
    setStart((s) => (s + 1) % vendors.length)
  }

  // ────────────────────────── LOADING STATE ──────────────────────────
  if (loading) {
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">TOP SELLERS</h2>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: itemsPerView }).map((_, i) => (
            <div
              key={`loading-${i}`}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              <div className="h-36 bg-gray-200 animate-pulse" />
              <div className="px-4 py-3 space-y-2">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-24 bg-gray-100 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (vendors.length === 0) return null

  // ────────────────────────── MAIN RENDER ──────────────────────────
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">TOP SELLERS</h2>
        <Link
          to="/sellerlist"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View all
        </Link>
      </div>

      {/* Blue container with proper spacing */}
      <div className="relative group/slider rounded-2xl bg-blue-600 p-5 sm:p-6">
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
          }}
        >
          {visible.map((vendor, idx) => {
            const isHovered = hoveredId === vendor.id
            return (
              <Link
                to={`/vendor/${vendor.id}`}
                key={`${vendor.id}-${start}-${idx}`}
                className="group block"
                onMouseEnter={() => setHoveredId(vendor.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  className={`relative h-full overflow-hidden rounded-lg border transition-all duration-500 ease-out
                    ${
                      isHovered
                        ? 'border-blue-300 shadow-2xl shadow-blue-900/30 -translate-y-1'
                        : 'border-gray-300 shadow-sm'
                    }
                    bg-white`}
                >
                  {/* Gradient top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Cover image */}
                  <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    {/* Dot pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.15]"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle, #6366f1 1px, transparent 1px)',
                        backgroundSize: '14px 14px',
                      }}
                    />

                    {/* Image */}
                    <img
                      src={vendor.image}
                      alt={`${vendor.name} store`}
                      loading="lazy"
                      className={`relative h-full w-full transition-all duration-700 ease-out
                        ${vendor.isBanner ? 'object-cover' : 'object-contain p-4'}
                        ${
                          isHovered
                            ? vendor.isBanner
                              ? 'scale-105'
                              : 'scale-110 rotate-1'
                            : 'scale-100'
                        }`}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = vendor.fallback
                      }}
                    />

                    {/* Shine sweep on hover */}
                    <div
                      className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000
                        ${isHovered ? 'translate-x-full' : ''}`}
                    />

                    {/* Verified badge */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-2 py-0.5 shadow-sm border border-white/60">
                      <svg
                        className="w-3 h-3 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-[10px] font-semibold text-gray-700">
                        Verified
                      </span>
                    </div>
                  </div>

                 
                  <div className="relative px-4 py-3 bg-blue-400">
                    {/* Name */}
                    <div className="truncate text-sm font-semibold text-white transition-colors duration-300 group-hover:text-white">
                      {vendor.name}
                    </div>

                    {/* Location */}
                    <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/90">
                      <svg
                        className="w-3.5 h-3.5 shrink-0 text-white/80"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="truncate">
                        {vendor.city && vendor.state
                          ? `${vendor.city}, ${vendor.state}`
                          : vendor.city || vendor.state || 'Online Store'}
                      </span>
                    </div>

                    {/* Bottom row: rating + arrow */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-3 h-3 text-amber-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-[10px] font-medium text-white/90">
                          (4.9)
                        </span>
                      </div>

                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300
                          ${
                            isHovered
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/30'
                              : 'bg-white/70 text-blue-700'
                          }`}
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Navigation buttons */}
        {canSlide && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full
                bg-white/90 backdrop-blur-md text-gray-700 shadow-lg border border-white/60
                opacity-0 group-hover/slider:opacity-100 transition-all duration-300
                hover:bg-gradient-to-br hover:from-blue-700 hover:to-indigo-700 hover:text-white hover:border-transparent
                hover:shadow-xl z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full
                bg-white/90 backdrop-blur-md text-gray-700 shadow-lg border border-white/60
                opacity-0 group-hover/slider:opacity-100 transition-all duration-300
                hover:bg-gradient-to-br hover:from-blue-700 hover:to-indigo-700 hover:text-white hover:border-transparent
                hover:shadow-xl z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  )
}