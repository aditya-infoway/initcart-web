// MobileCategorySlider.jsx
// Mobile-only: infinite touch slider, 2 cards per row per slide
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { publicAxios, axiosInstance } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ShoppingCart } from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (p) => {
  const n = parseFloat(p)
  return isNaN(n) ? 0 : n
}

const getImg = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  const clean = path.replace(/^\/+/, '')
  const base = process.env.REACT_APP_API_URL || 'https://api.initcart.in'
  return `${base}/${clean.startsWith('media/') ? '' : 'media/'}${clean}`
}

// ─── Infinite Slider (brand-slider style) ───────────────────────────────────
// scrollBy based — bilkul MobileBrandSlider jaisa logic
// Clone trick: N clones on each side → silent teleport on scroll
// No dots, no snap — purely continuous left scroll
const CLONE_COUNT = 3

function InfiniteSlider({ pages, renderPage, autoIntervalMs = 5000 }) {
  const total = pages.length
  const scrollRef    = useRef(null)
  const autoTimer    = useRef(null)
  const resumeTimer  = useRef(null)
  const isUserActive = useRef(false)
  const isTeleport   = useRef(false)

  // display = [...lastN clones, ...real pages, ...firstN clones]
  const display = total > 0
    ? [...pages.slice(-CLONE_COUNT), ...pages, ...pages.slice(0, CLONE_COUNT)]
    : []

  // Page width = container full width
  const getStep = useCallback(() => {
    const el = scrollRef.current
    return el ? el.offsetWidth : 320
  }, [])

  // Jump to real-first page on mount (skip leading clones)
  const jumpToReal = useCallback(() => {
    const el = scrollRef.current
    if (!el || total === 0) return
    isTeleport.current = true
    el.scrollLeft = CLONE_COUNT * getStep()
    requestAnimationFrame(() => { isTeleport.current = false })
  }, [total, getStep])

  useEffect(() => {
    if (total > 0) {
      // Wait for layout to paint
      const t = setTimeout(jumpToReal, 60)
      return () => clearTimeout(t)
    }
  }, [total, jumpToReal])

  // On scroll: teleport when entering clone zone
  useEffect(() => {
    const el = scrollRef.current
    if (!el || total === 0) return

    const onScroll = () => {
      if (isTeleport.current) return
      const step     = getStep()
      const realStart = CLONE_COUNT * step
      const realEnd   = realStart + total * step

      if (el.scrollLeft >= realEnd) {
        isTeleport.current = true
        el.scrollLeft -= total * step
        requestAnimationFrame(() => { isTeleport.current = false })
      } else if (el.scrollLeft < realStart) {
        isTeleport.current = true
        el.scrollLeft += total * step
        requestAnimationFrame(() => { isTeleport.current = false })
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [total, getStep])

  // Auto scroll: scrollBy one page left
  const startAutoScroll = useCallback(() => {
    clearInterval(autoTimer.current)
    if (!scrollRef.current || total < 2) return
    autoTimer.current = setInterval(() => {
      if (!isUserActive.current && scrollRef.current) {
        scrollRef.current.scrollBy({ left: getStep(), behavior: 'smooth' })
      }
    }, autoIntervalMs)
  }, [total, getStep, autoIntervalMs])

  useEffect(() => {
    if (total > 0) {
      const t = setTimeout(startAutoScroll, 250)
      return () => {
        clearTimeout(t)
        clearInterval(autoTimer.current)
        clearTimeout(resumeTimer.current)
      }
    }
  }, [total, startAutoScroll])

  // Touch handlers — same as brand slider
  const onStart = useCallback(() => {
    isUserActive.current = true
    clearInterval(autoTimer.current)
    autoTimer.current = null
    clearTimeout(resumeTimer.current)
  }, [])

  const onMove = useCallback(() => {
    if (!isUserActive.current) return
    clearTimeout(resumeTimer.current)
  }, [])

  const onEnd = useCallback(() => {
    clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      isUserActive.current = false
      startAutoScroll()
    }, 2000)
  }, [startAutoScroll])

  if (!pages.length) return null

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        onTouchCancel={onEnd}
      >
        {display.map((page, domI) => (
          <div
            key={domI}
            className="flex-shrink-0 px-3 py-1"
            style={{ width: '100%' }}
          >
            <div className="grid grid-cols-2 gap-2">
              {page.map((product, pi) => renderPage(product, pi))}
            </div>
          </div>
        ))}
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
    </div>
  )
}

// ─── Single Product Card ────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart }) {
  const hasDiscount = product.oldPrice > product.newPrice
  const discountPct = hasDiscount
    ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)
    : 0

  return (
    <Link
      to={`/product/${product.id}`}
      className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform duration-150"
    >
      {/* Image */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        <img
          src={getImg(product.img) || product.img}
          alt={product.title}
          className="w-full h-full object-contain p-2"
          loading="lazy"
          onError={e => { e.target.src = `https://picsum.photos/seed/${product.id}/200/200` }}
        />

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight">
            {discountPct}% OFF
          </div>
        )}

        {/* Campaign badge */}
        {product.isInCampaign && product.campaignType && (
          <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-tight uppercase">
            {product.campaignType === 'Flash' ? '⚡' : '★'} {product.campaignType}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-tight min-h-[2.2em]">
          {product.title}
        </p>

        <div className="mt-1.5 flex items-baseline gap-1 flex-wrap">
          <span className="text-[13px] font-bold text-gray-900">
            ₹{product.newPrice.toFixed(0)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{product.oldPrice.toFixed(0)}
            </span>
          )}
        </div>

        {/* Add to cart */}
<button
  onClick={e => {
    e.preventDefault()
    e.stopPropagation()
    onAddToCart(product)
  }}
  className="mt-2 w-full py-1.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg transition-colors duration-150 flex items-center justify-center"
>
  <ShoppingCart size={12} />
</button>
      </div>
    </Link>
  )
}

// ─── Category Section ───────────────────────────────────────────────────────
function MobileCategorySection({ category, products, totalProducts }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToast } = useToast()

  const formatted = useMemo(() => products.map(p => {
    let minPrice = 0, maxPrice = 0, campaignPrice = null
    const isInCampaign = p.is_in_campaign || false
    const campaignDetails = p.campaign_details || null

    if (isInCampaign && p.campaign_price) {
      campaignPrice = fmt(p.campaign_price)
    }
    if (p.stocks?.length) {
      const sp = p.stocks.map(s => fmt(s.selling_price))
      const mrp = p.stocks.map(s => fmt(s.mrp))
      minPrice = Math.min(...sp)
      maxPrice = Math.max(...mrp)
    }

    return {
      id: p.id,
      title: p.product_name,
      oldPrice: campaignPrice ? fmt(campaignDetails?.original_price) || maxPrice : maxPrice,
      newPrice: campaignPrice || minPrice,
      img: p.main_image || p.thumbnail_image || `https://picsum.photos/seed/${p.id}/200/200`,
      productData: p,
      isInCampaign,
      campaignType: campaignDetails?.campaign_type,
    }
  }), [products])

  // Group into pages of 2
  const pages = useMemo(() => {
    const out = []
    for (let i = 0; i < formatted.length; i += 2) {
      const pair = formatted.slice(i, i + 2)
      // If odd count, fill last page with a placeholder
      if (pair.length === 1) pair.push(null)
      out.push(pair)
    }
    return out
  }, [formatted])

  const addToCart = async (product) => {
    if (!isAuthenticated()) {
      addToast('Please login to add items to cart', 'warning')
      navigate('/customer/login')
      return
    }
    try {
      const stockId = product.productData?.stocks?.[0]?.id
      if (!stockId) { addToast('Stock not available', 'error'); return }
      const res = await axiosInstance.post('api/public/cart/', { product_stock: stockId, quantity: 1 })
      if (res.data.success) addToast('Added to cart!', 'success')
    } catch {
      addToast('Failed to add to cart', 'error')
    }
  }

  if (!products.length) return null

  return (
    <div className="bg-white rounded-2xl mx-3 mb-4 overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-400 to-blue-600" />
          <div>
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-wide leading-tight">
              {category.name}
            </h2>
            <p className="text-[10px] text-gray-400">{totalProducts} products</p>
          </div>
        </div>
        <Link
          to={`/category-products?category=${category.id}`}
          className="text-[11px] text-blue-500 font-semibold flex items-center gap-0.5 bg-blue-50 px-2.5 py-1 rounded-full"
        >
          View All
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Slider */}
      <InfiniteSlider
        pages={pages}
        autoIntervalMs={5000}
        renderPage={(product, pi) => {
          if (!product) {
            return (
              <div key={`empty-${pi}`} className="rounded-2xl bg-gray-50 aspect-square flex items-center justify-center border border-dashed border-gray-200">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
            )
          }
          return (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          )
        }}
      />
    </div>
  )
}

// ─── Main Export (HomeSliders equivalent for mobile) ────────────────────────
export default function MobileHomeSliders() {
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await publicAxios.get('/ecommerce/public/web-home-categories/')
        if (res.data.success) setSliders(res.data.data)
        else setError('Failed to load sections')
      } catch {
        setError('Network error. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return (
    <div className="space-y-4 px-3 mt-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="flex justify-between mb-3">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2].map(j => (
              <div key={j} className="aspect-square bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  if (error) return (
    <div className="mx-3 mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
      <p className="text-red-600 text-sm">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg"
      >
        Retry
      </button>
    </div>
  )

  if (!sliders.length) return null

  return (
    <div className="mt-4">
      {sliders.map(s => (
        <MobileCategorySection
          key={s.category.id}
          category={s.category}
          products={s.products}
          totalProducts={s.total_products}
        />
      ))}
    </div>
  )
}